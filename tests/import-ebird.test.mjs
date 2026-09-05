import assert from "node:assert/strict";
import test from "node:test";

import { aggregateExport, parseCsv } from "../scripts/import-ebird.mjs";

const curation = {
  regions: {
    "US-CA": { name: "California", tone: "clay", x: 17, y: 34, order: 1 },
  },
  birdNotes: {
    "Song Sparrow": "A field note.",
    "American Robin": "Another field note.",
  },
};

test("parses quoted fields without leaking them into aggregates", () => {
  const rows = parseCsv('Common Name,Scientific Name,State/Province,Date,Location,Latitude\n"Song Sparrow",Melospiza melodia,US-CA,2024-03-27,"Park, west",12.34\n');
  assert.equal(rows[1][4], "Park, west");
});

test("aggregates only public field-journal data", () => {
  const csv = [
    "Common Name,Scientific Name,State/Province,Date,Location,Latitude,Longitude",
    "Song Sparrow,Melospiza melodia,US-CA,2024-03-27,Private place,12.34,-56.78",
    "Song Sparrow,Melospiza melodia,US-CA,2026-05-03,Private place,12.34,-56.78",
    "American Robin,Turdus migratorius,US-CA,2026-05-22,Private place,12.34,-56.78",
  ].join("\n");

  const result = aggregateExport(csv, curation);
  assert.deepEqual(result.stats, {
    species: 2,
    encounters: 3,
    regions: 1,
    firstDate: "2024-03-27",
    latestDate: "2026-05-22",
  });
  assert.deepEqual(result.yearlyNewSpecies, [
    { year: 2024, species: 1 },
    { year: 2025, species: 0 },
    { year: 2026, species: 1 },
  ]);
  assert.doesNotMatch(JSON.stringify(result), /Private place|12\.34|-56\.78/);
});

test("blocks unknown regions before publishing", () => {
  const csv = [
    "Common Name,Scientific Name,State/Province,Date",
    "Mystery Bird,Avis incognita,XX-00,2026-09-05",
  ].join("\n");
  const result = aggregateExport(csv, curation, () => false);
  assert.deepEqual(result.blockers.unknownRegionCodes, ["XX-00"]);
  assert.equal(result.stats.encounters, 0);
});
