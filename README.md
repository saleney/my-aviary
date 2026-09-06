# My Aviary

A living field journal built from my Merlin and eBird history.

Visit it at [saleney.github.io/my-aviary](https://saleney.github.io/my-aviary/).

The experience begins with a map of where I heard each bird, follows the rhythm of return between listening seasons, and ends in a searchable field guide with species notes and illustrated portraits.

Exact encounter coordinates are intentionally not published. Locations are presented only as broad regions.

The map uses the Robinson projection centered at 10° east. Pin percentages in `data/aviary-curation.json` must use that same centerline; they are broad regional anchors, not encounter coordinates.

## Refresh from Merlin/eBird

Keep the downloaded CSV outside this public repository. The refresh has two deliberate steps:

```bash
npm run import:ebird -- /path/to/MyEBirdData.csv
```

This previews the totals and checks every region, field note, and bird portrait. It does not change the site.

If the preview is clean, apply the privacy-safe summaries:

```bash
npm run import:ebird -- /path/to/MyEBirdData.csv --write
```

The importer never copies submission IDs, exact locations, latitude, longitude, comments, or other raw encounter fields into the public site. A new species or region stops the update until its broad-region mapping, note, and portrait are ready.

After applying an update, run `npm test` and `npm run build:pages` before publishing.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Sources

Encounter history comes from my Merlin life list. Bird notes reference the Cornell Lab of Ornithology and eBird. The world-map artwork follows Wikimedia Commons' public-domain `BlankMap-World.svg` Robinson map.
