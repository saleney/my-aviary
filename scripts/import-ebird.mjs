#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curationPath = path.join(projectRoot, "data", "aviary-curation.json");
const outputPath = path.join(projectRoot, "app", "aviary-data.ts");
const requiredHeaders = ["Common Name", "Scientific Name", "State/Province", "Date"];

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("The CSV ends inside a quoted field.");
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => value.trim()));
}

export function aggregateExport(csvText, curation, portraitExists = () => true) {
  const [headers, ...values] = parseCsv(csvText);
  if (!headers) throw new Error("The export is empty.");

  const indexes = Object.fromEntries(headers.map((header, index) => [header, index]));
  const missingHeaders = requiredHeaders.filter((header) => indexes[header] === undefined);
  if (missingHeaders.length) throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);

  const unknownRegionCodes = new Set();
  const invalidRows = [];
  const species = new Map();
  const regionCounts = new Map();

  values.forEach((row, rowIndex) => {
    const name = row[indexes["Common Name"]]?.trim();
    const scientific = row[indexes["Scientific Name"]]?.trim();
    const regionCode = row[indexes["State/Province"]]?.trim();
    const date = row[indexes.Date]?.trim();
    const region = curation.regions[regionCode];

    if (!name || !scientific || !regionCode || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      invalidRows.push(rowIndex + 2);
      return;
    }
    if (!region) {
      unknownRegionCodes.add(regionCode);
      return;
    }

    regionCounts.set(region.name, (regionCounts.get(region.name) ?? 0) + 1);
    const existing = species.get(name) ?? {
      name,
      scientific,
      encounters: 0,
      first: date,
      latest: date,
      regions: new Set(),
    };
    if (existing.scientific !== scientific) {
      throw new Error(`Conflicting scientific names found for ${name}.`);
    }
    existing.encounters += 1;
    existing.first = existing.first < date ? existing.first : date;
    existing.latest = existing.latest > date ? existing.latest : date;
    existing.regions.add(region.name);
    species.set(name, existing);
  });

  const missingNotes = [];
  const missingPortraits = [];
  const birds = [...species.values()]
    .map((bird) => {
      const blurb = curation.birdNotes[bird.name];
      if (!blurb) missingNotes.push(bird.name);
      if (!portraitExists(slugify(bird.name))) missingPortraits.push(bird.name);
      return { ...bird, regions: [...bird.regions].sort(), blurb: blurb ?? "" };
    })
    .sort((a, b) => b.encounters - a.encounters || a.name.localeCompare(b.name));

  const journeys = Object.values(curation.regions)
    .sort((a, b) => a.order - b.order)
    .filter((region) => regionCounts.has(region.name))
    .map(({ name, tone, x, y }) => ({ name, count: regionCounts.get(name), tone, x, y }));

  const years = birds.map((bird) => Number(bird.first.slice(0, 4)));
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  const yearlyNewSpecies = [];
  for (let year = firstYear; year <= lastYear; year += 1) {
    yearlyNewSpecies.push({ year, species: birds.filter((bird) => Number(bird.first.slice(0, 4)) === year).length });
  }

  const blockers = {
    invalidRows,
    unknownRegionCodes: [...unknownRegionCodes].sort(),
    missingNotes: missingNotes.sort(),
    missingPortraits: missingPortraits.sort(),
  };
  const dates = birds.flatMap((bird) => [bird.first, bird.latest]);
  return {
    birds,
    journeys,
    yearlyNewSpecies,
    stats: {
      species: birds.length,
      encounters: values.length - invalidRows.length - [...unknownRegionCodes].reduce((total, code) => total + values.filter((row) => row[indexes["State/Province"]]?.trim() === code).length, 0),
      regions: journeys.length,
      firstDate: dates.sort()[0],
      latestDate: dates.sort().at(-1),
    },
    blockers,
  };
}

function slugify(name) {
  return name.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderModule(result) {
  const banner = "// Generated by scripts/import-ebird.mjs. Edit data/aviary-curation.json, not this file.\n";
  const json = (value) => JSON.stringify(value, null, 2);
  return `${banner}\nexport type Bird = { name: string; scientific: string; encounters: number; first: string; latest: string; regions: string[]; blurb: string };\nexport type Journey = { name: string; count: number; tone: string; x: number; y: number };\nexport type YearlySpecies = { year: number; species: number };\n\nexport const birds: Bird[] = ${json(result.birds)};\n\nexport const journeys: Journey[] = ${json(result.journeys)};\n\nexport const yearlyNewSpecies: YearlySpecies[] = ${json(result.yearlyNewSpecies)};\n\nexport const aviaryStats = ${json(result.stats)};\n`;
}

function blockerMessages(blockers) {
  const messages = [];
  if (blockers.invalidRows.length) messages.push(`Invalid rows: ${blockers.invalidRows.join(", ")}`);
  if (blockers.unknownRegionCodes.length) messages.push(`Unmapped region codes: ${blockers.unknownRegionCodes.join(", ")}`);
  if (blockers.missingNotes.length) messages.push(`Bird notes needed: ${blockers.missingNotes.join(", ")}`);
  if (blockers.missingPortraits.length) messages.push(`Portraits needed: ${blockers.missingPortraits.join(", ")}`);
  return messages;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldWrite = args.includes("--write");
  const inputArg = args.find((arg) => !arg.startsWith("--"));
  if (!inputArg) {
    throw new Error("Choose an eBird CSV export: npm run import:ebird -- /path/to/MyEBirdData.csv");
  }

  const inputPath = path.resolve(inputArg);
  const relativeInput = path.relative(projectRoot, inputPath);
  if (relativeInput && !relativeInput.startsWith("..") && !path.isAbsolute(relativeInput)) {
    throw new Error("Keep the raw eBird export outside this public repository, then run the import again from that location.");
  }

  const [csvText, curationText] = await Promise.all([
    readFile(inputPath, "utf8"),
    readFile(curationPath, "utf8"),
  ]);
  const curation = JSON.parse(curationText);
  const result = aggregateExport(csvText, curation, (slug) => existsSync(path.join(projectRoot, "public", "birds", `${slug}.jpg`)));
  const messages = blockerMessages(result.blockers);
  const output = renderModule(result);
  const current = existsSync(outputPath) ? await readFile(outputPath, "utf8") : "";

  console.log(`${result.stats.encounters} encounters · ${result.stats.species} species · ${result.stats.regions} broad regions`);
  console.log(`${result.stats.firstDate} through ${result.stats.latestDate}`);
  console.log(current === output ? "The generated site data is already current." : "The export would change the generated site data.");

  if (messages.length) {
    console.error("\nReview needed before the site can be updated:");
    messages.forEach((message) => console.error(`- ${message}`));
    process.exitCode = 1;
    return;
  }

  if (!shouldWrite) {
    console.log("Preview complete. Run the same command with --write to apply it.");
    return;
  }

  await writeFile(outputPath, output);
  console.log("Updated app/aviary-data.ts with privacy-safe summaries only.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
