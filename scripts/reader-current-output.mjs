import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import { buildDependencies, publicCatalog } from './knowledge.mjs';
import { readerBibliography } from './reader-bibliography.mjs';
import { collectChapterClaimOccurrences } from './reader-book.mjs';
import { projectExchangeSemanticsRaw, validateExchangeAnnotationOutput } from './reader-exchange-semantics.mjs';
import { editionDigest, sha256 } from './reader-current-edition.mjs';
import { readerParagraphText } from './reader-publication-text.mjs';

function routesForChanges(current, sources) {
  const routes = new Set();
  if (current.changes.file.has('app/global.css')) for (const route of sources.keys()) routes.add(route);
  if (current.changes.file.has('components/teaching-case-client.tsx')) routes.add('/docs/book/wall-service-to-comparison');
  if (current.changes.file.has('components/joint-production-case.tsx')) {
    routes.add('/docs/book/allocation-and-substitution');
    routes.add('/monograph/joint-production');
  }
  for (const path of current.changes.file.keys()) {
    if (!/^content\/.+\.mdx?$/.test(path)) continue;
    routes.add(path.slice('content'.length).replace(/\.mdx?$/, '').replace(/\/index$/, ''));
  }
  const claims = new Set([...current.changes.record.keys()]
    .filter(key => key.startsWith('claims:')).map(key => key.slice('claims:'.length)));
  for (const id of current.affectedClaimIds ?? []) claims.add(id);
  if (claims.size) for (const [route, raw] of sources) {
    if (collectChapterClaimOccurrences(raw).some(id => claims.has(id))) routes.add(route);
  }
  return routes;
}

/** Output receipts identify an actual normalized article, not a generated
 * source description or a self-authored copy of the expected DOM. */
export function validateReadableBookReviewedOutput(current, documents, sources, edition, catalog, readings) {
  if (!current) return [];
  const errors = [];
  if (current.changes.record.size && (!documents?.size || !sources?.size || !edition.units?.length))
    return ['Readable book record changes require independently verified actual output documents'];
  const required = new Set(), changedRoutes = routesForChanges(current, sources);
  for (const route of changedRoutes) {
    if (route.startsWith('/docs') && route !== '/docs/appendices') required.add(`${route}#${route}`);
    for (const unit of edition.units.filter(unit => unit.source === route)) required.add(`/print#${unit.key}`);
  }
  for (const key of required) {
    if (!current.outputs.has(key)) errors.push(`Readable book changed source lacks an actual output receipt: ${key}`);
  }
  const claims = new Map(catalog.claims.map(row => [row.id, row]));
  for (const [key, { path, route, sha256: expected }] of current.outputs) {
    const articles = documents?.get(path)?.querySelectorAll('article[data-reader-route]') ?? [];
    const matches = articles.filter(node => node.getAttribute('data-reader-route') === route);
    if (matches.length !== 1 || sha256(matches[0].outerHTML) !== expected) {
      errors.push(`Readable book actual reviewed article differs: ${key}`);
      continue;
    }
    const source = path === '/print' ? edition.units.find(unit => unit.key === route)?.source : route;
    const raw = sources.get(source), article = matches[0];
    const rendered = article.querySelectorAll('a[role="doc-noteref"]');
    const expectedIds = raw === undefined ? null : collectChapterClaimOccurrences(projectExchangeSemanticsRaw(route, raw, path === '/print'));
    if (!expectedIds || rendered.length !== expectedIds.length || rendered.some((marker, index) => {
      const claim = claims.get(expectedIds[index]), paragraph = marker.closest('p');
      return !claim || marker.getAttribute('data-reader-reference') !== claim.id || !paragraph
        || readerParagraphText(paragraph, marker) !== claim.text
        || Boolean(paragraph.closest('[hidden],[aria-hidden="true"]'));
    })) errors.push(`Readable book actual claim order or readable canonical paragraphs differ: ${key}`);
    if (rendered.length) errors.push(...validateExchangeAnnotationOutput(documents.get(path), article, route, catalog, { print: path === '/print', readings }));
  }
  return errors;
}

export const readableBookPublicCatalogPaths = [
  'claims/index.html', 'sources/index.html', 'concepts/index.html', 'downloads/catalog.json', 'downloads/dependencies.json',
];
export const readableBookPublicResearchPaths = ['research/index.html', 'downloads/bibliography.json', 'downloads/research.json'];

export function readerPublicDownloads(catalog, literature, readings, published = publicCatalog(catalog)) {
  const encode = value => JSON.stringify(value, null, 2) + '\n';
  const bibliography = encode(readerBibliography(catalog, literature, readings));
  return new Map([
    ['downloads/bibliography.json', bibliography],
    ['downloads/research.json', bibliography],
    ['downloads/catalog.json', encode(published)],
    ['downloads/dependencies.json', encode(buildDependencies(published))],
  ]);
}

export function fingerprintReadableBookPublicArtifact(path, bytes) {
  if (!path.endsWith('.html')) return sha256(bytes);
  const pages = htmlParser.parse(bytes.toString()).querySelectorAll('main#main-content');
  if (pages.length !== 1) throw new Error(`Readable book public artifact requires an actual main landmark: ${path}`);
  return sha256(pages[0].outerHTML);
}

const compact = text => text?.replace(/\s+/g, ' ').trim();

export function validateReadableBookResearchOutput(document, published, literature, ledger) {
  const articles = document.querySelectorAll('main#main-content article.source-record');
  const seenReadings = new Set(), seenWorks = new Set(), errors = [];
  if (articles.length !== published.sources.length) errors.push('Readable book research source roster differs');
  for (const [index, source] of published.sources.entries()) {
    const article = articles[index], title = article?.querySelector('h2 a');
    if (article?.id !== source.id || title?.getAttribute('href') !== source.url || compact(title?.text) !== compact(source.title)
        || compact(article?.querySelector('h2 + p')?.text) !== compact(`${source.publisher}。${source.version}。`))
      errors.push(`Readable book research source title, order or version differs: ${source.id}`);
    const reading = ledger.readings.find(row => row.id === source.reading?.readingId);
    const work = reading && literature.records.find(row => row.id === reading.workId || row.workId === reading.workId);
    const expectedAnchors = [];
    if (work && !seenWorks.has(work.id)) {
      seenWorks.add(work.id);
      expectedAnchors.push(work.id);
    }
    let passages = [];
    if (reading && !seenReadings.has(reading.id)) {
      seenReadings.add(reading.id);
      expectedAnchors.push(reading.id);
      passages = reading.passages.map(passage => [
        passage.id, compact(passage.locator + (passage.printedPages ? '，' + passage.printedPages : '')),
      ]);
    }
    const actualAnchors = article?.querySelectorAll('span[id]').map(node => node.id);
    const actualPassages = article?.querySelectorAll('details li[id]').map(node => [node.id, compact(node.text)]);
    if (JSON.stringify(actualAnchors) !== JSON.stringify(expectedAnchors) || JSON.stringify(actualPassages) !== JSON.stringify(passages))
      errors.push(`Readable book research rendered passages differ from their current locators: ${source.id}`);
  }
  return errors;
}

const mappingRelations = {
  related: '相关', overlaps: '部分重叠', broader: '范围更宽', narrower: '范围更窄',
  conditional: '条件对应', 'not-equivalent': '不能直接等同',
};

function validateConceptOutput(document, published) {
  const claimMap = new Map(published.claims.map(row => [row.id, row]));
  const conceptMap = new Map(published.concepts.map(row => [row.id, row]));
  const records = document.querySelectorAll('main#main-content article.concept-record');
  const actual = records.map(node => [
    node.id, compact(node.querySelector('h2')?.text),
    compact(node.querySelector('p.subtle')?.text) ?? null,
    node.querySelectorAll('.concept-definition .claim-text').map(p => compact(p.text)),
    node.querySelectorAll('.mapping-record').map(mapping => {
      const paragraphs = mapping.querySelectorAll('p');
      return [compact(mapping.querySelector('strong')?.text),
        paragraphs[0]?.querySelectorAll('a').map(link => [link.getAttribute('href'), compact(link.text)]),
        compact(paragraphs[1]?.text),
        paragraphs[2]?.querySelectorAll('a').map(link => [link.getAttribute('href'), compact(link.text)])];
    }),
  ]);
  const expected = published.concepts.map(concept => [
    concept.id, compact(concept.label + concept.english),
    concept.aliases.length ? compact('相关名称：' + concept.aliases.join('、')) : null,
    concept.definitionClaimIds.map(id => compact(claimMap.get(id)?.text)),
    published.mappings.filter(mapping => mapping.from === concept.id || mapping.to === concept.id).map(mapping => [
      '概念关系：' + (mappingRelations[mapping.relation] ?? mapping.relation),
      [mapping.from, mapping.to].map(id => ['#' + id, compact(conceptMap.get(id)?.label)]),
      compact(Array.isArray(mapping.conditions) ? mapping.conditions.map(text => text.replace(/[。；;\s]+$/, '')).join('；') : mapping.conditions),
      mapping.claimIds.map(id => ['/claims/#' + id, compact(claimMap.get(id)?.text)]),
    ]),
  ]);
  return JSON.stringify(actual) === JSON.stringify(expected) ? [] : ['Readable book actual concept and mapping index differs from the current public catalog'];
}

function validatePublicRecordOutput(path, document, published) {
  if (path === 'concepts/index.html') return validateConceptOutput(document, published);
  if (path === 'claims/index.html') {
    const actual = document.querySelectorAll('main#main-content section.claim-block').map(node => [node.id, compact(node.querySelector('.claim-text')?.text)]);
    const expected = published.claims.map(row => [row.id, compact(row.text)]);
    return JSON.stringify(actual) === JSON.stringify(expected) ? [] : ['Readable book actual claim index differs from the current public catalog'];
  }
  const actual = document.querySelectorAll('main#main-content article.source-record').map(node => [
    node.id, compact(node.querySelector('h2 a')?.text),
    node.querySelectorAll('section.evidence-item').map(evidence => [
      evidence.id, compact(evidence.querySelector('h3')?.text), compact(evidence.querySelector('h3 + p')?.text),
    ]),
  ]);
  const expected = published.sources.map(source => [
    source.id, compact(source.title), published.evidence.filter(row => row.sourceId === source.id).map(row => [row.id, compact(row.locator), compact(row.summary)]),
  ]);
  return JSON.stringify(actual) === JSON.stringify(expected) ? [] : ['Readable book actual source/evidence index differs from the current public catalog'];
}

export const readerCssArtifact = 'asset:reader-css';

export async function fingerprintReaderCss(root) {
  const files = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.isFile() && entry.name.endsWith('.css')) files.push(await readFile(path));
    }
  }
  await collect(join(root, '_next', 'static'));
  if (!files.length) throw new Error('Readable book actual CSS assets are missing');
  return editionDigest(files.map(sha256).sort());
}

export async function validateReadableBookPublicArtifacts(root, current, source) {
  if (!current) return [];
  const errors = [];
  const published = source ? publicCatalog(source.catalog) : null;
  const expectedDownloads = source ? readerPublicDownloads(source.catalog, source.literature, source.readings, published) : null;
  if (current.changes.record.size && !source) errors.push('Readable book changed records require actual source projections to validate public output');
  if (source?.sourceCommit) {
    const changes = await readFile(join(root, 'changes/index.html'), 'utf8');
    const actual = htmlParser.parse(changes).querySelectorAll('main#main-content a').filter(link => link.text === '查看本版文本');
    const expected = 'https://github.com/tiangong-lca/knowledge-base/commit/' + source.sourceCommit;
    if (actual.length !== 1 || actual[0].getAttribute('href') !== expected)
      errors.push('Readable book actual version page differs from the source commit');
  }
  const required = new Set([
    ...(current.changes.record.size ? readableBookPublicCatalogPaths : []),
    ...(current.researchChanged ? readableBookPublicResearchPaths : []),
    ...(current.changes.file.has('app/global.css') ? [readerCssArtifact] : []),
  ]);
  for (const path of required) {
    if (!current.publicArtifacts.has(path)) errors.push(`Readable book changed records lack an actual public artifact receipt: ${path}`);
  }
  for (const [path, receipt] of current.publicArtifacts) {
    if (path === readerCssArtifact) {
      if (await fingerprintReaderCss(root) !== receipt.sha256) errors.push('Readable book actual compiled CSS assets differ');
      continue;
    }

    if (![...readableBookPublicCatalogPaths, ...readableBookPublicResearchPaths].includes(path)) {
      errors.push(`Readable book public artifact receipt has an unknown path: ${path}`);
      continue;
    }
    const bytes = await readFile(join(root, path)).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (!bytes || fingerprintReadableBookPublicArtifact(path, bytes) !== receipt.sha256) errors.push(`Readable book actual public artifact differs: ${path}`);
    if (!bytes || !source) continue;
    if (path.endsWith('.json')) {
      if (bytes.toString() !== expectedDownloads.get(path)) errors.push(`Readable book public download disagrees with the current source projection: ${path}`);
    } else {
      const document = htmlParser.parse(bytes.toString());
      if (path === 'research/index.html') errors.push(...validateReadableBookResearchOutput(document, published, source.literature, source.readings));
      else errors.push(...validatePublicRecordOutput(path, document, published));
    }

  }
  return errors;
}
