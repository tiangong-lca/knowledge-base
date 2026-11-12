import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readableBookBaselineDigest } from './reader-current-edition-pins.mjs';

const root = resolve(process.argv[2] ?? '.');
const json = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const baseline = JSON.parse(await readFile(new URL('../config/readable-book-baseline.json', import.meta.url), 'utf8'));
if (editionDigest(baseline) !== readableBookBaselineDigest) throw new Error('Reader candidate requires the pinned integration baseline');
const [catalog, readings, literature, files] = await Promise.all([
  json('knowledge/catalog.json'),
  json('knowledge/research/readings.json'),
  json('knowledge/research/literature-map.json'),
  readReadableBookFiles(root, baseline.fixedFiles),
]);
const actual = inspectReadableBookEdition({ catalog, readings, literature, files });
const changes = [];
for (const [kind, field] of [['file', 'files'], ['record', 'records']]) {
  for (const key of new Set([...Object.keys(baseline[field]), ...Object.keys(actual[field])])) {
    const from = baseline[field][key] ?? null, to = actual[field][key] ?? null;
    if (editionDigest(from) === editionDigest(to)) continue;
    changes.push({ kind, key, from, to });
  }
}
console.log(JSON.stringify({
  status: 'pending', sourceCommit: baseline.sourceCommit, baselineDigest: readableBookBaselineDigest,
  changes, beforeDependencies: baseline.dependencies, afterDependencies: actual.dependencies,
}, null, 2));
