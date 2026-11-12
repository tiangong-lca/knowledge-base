import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { getPresentationUnits } from './reader-numbering.mjs';
import { validateReaderNumberingOutput } from './reader-numbering-output.mjs';
import { sha256 } from './reader-current-edition.mjs';
import { fingerprintReaderCss, readerCssArtifact, fingerprintReadableBookPublicArtifact, readableBookPublicCatalogPaths, readableBookPublicResearchPaths, readerPublicDownloads } from './reader-current-output.mjs';

const root = resolve(process.argv[2] ?? 'out');
const sourceRoot = resolve(root, '..', 'content');
const sources = new Map();
async function discover(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await discover(path);
    else if (/\.mdx?$/.test(entry.name)) {
      const route = '/' + relative(sourceRoot, path).replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/\/index$/, '');
      sources.set(route, await readFile(path, 'utf8'));
    }
  }
}
await discover(sourceRoot);
const edition = JSON.parse(await readFile(resolve(root, '..', 'config', 'book-edition.json'), 'utf8'));
const { documents, errors } = await validateReaderNumberingOutput(root, { sources, edition });
if (errors.length) throw new Error(errors.join('\n'));
const results = [];
const units = [
  ...getPresentationUnits('web').map(unit => ({ path: unit.key, route: unit.key })),
  ...getPresentationUnits('book').map(unit => ({ path: '/print', route: unit.key })),
];
for (const { path, route } of units) {
  const articles = documents.get(path)?.querySelectorAll('article[data-reader-route]') ?? [];
  const selected = articles.filter(article => article.getAttribute('data-reader-route') === route);
  if (selected.length !== 1) throw new Error(`Candidate output requires exactly one actual article: ${path}#${route}`);
  results.push({ path, route, sha256: sha256(selected[0].outerHTML) });
}
const readInput = async path => JSON.parse(await readFile(resolve(root, '..', path), 'utf8'));
const [catalog, literature, readings] = await Promise.all([
  readInput('knowledge/catalog.json'), readInput('knowledge/research/literature-map.json'), readInput('knowledge/research/readings.json'),
]);
const data = readerPublicDownloads(catalog, literature, readings);
const publicArtifacts = [];
for (const path of [...readableBookPublicCatalogPaths, ...readableBookPublicResearchPaths]) {
  const bytes = path.endsWith('.html') ? await readFile(join(root, path)) : data.get(path);
  publicArtifacts.push({ path, sha256: fingerprintReadableBookPublicArtifact(path, bytes) });
}
publicArtifacts.push({ path: readerCssArtifact, sha256: await fingerprintReaderCss(root) });
console.log(JSON.stringify({ status: 'observed-output', articles: results, publicArtifacts }, null, 2));
