import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Aviary experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /THE AVIARY/);
  assert.match(html, /Birds I.ve met/);
  assert.match(html, />28<\/b><small>species<\/small>/);
  assert.match(html, />51<\/b><small>encounters<\/small>/);
  assert.match(html, /World map showing broad regions where birds were encountered/);
  assert.match(html, /Search the canopy/);
  assert.match(html, /Cornell Lab/);
  assert.match(html, /eBird/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the public field journal assets and accessibility hooks intact", async () => {
  const [journal, css] = await Promise.all([
    readFile(new URL("../app/AviaryJournal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/journal.css", import.meta.url), "utf8"),
  ]);

  assert.match(journal, /aria-label="Choose a bird"/);
  assert.match(journal, /aria-label="Choose a region"/);
  assert.match(journal, /aria-label="Sort birds"/);
  assert.match(journal, /role="dialog"/);
  assert.match(journal, /aria-modal="true"/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  await access(new URL("../public/world-map.png", import.meta.url));
  await access(new URL("../public/birds/american-robin.jpg", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
});
