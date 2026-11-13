import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { editionDigest, inspectReadableBookEdition, readableBookReviewPlan, sha256 } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { copyeditSourceStructure, effectiveReaderCopyedit, verifyReaderCopyeditSource } from './reader-copyedit.mjs';
import { observeCopyeditHistory } from './reader-copyedit-observation.mjs';
import { currentCopyedit } from './reader-current-expectations.mjs';
import { copyeditHistoryPlan, fingerprintCopyeditPrintParts, validateCopyeditHistory } from './reader-copyedit-history.mjs';
import capture from '../config/reader-copyedit-8148-capture.json' with { type: 'json' };
import previous from '../config/readable-book-current.json' with { type: 'json' };
import { readerCopyeditSource } from './reader-copyedit-pins.mjs';
import { validateReaderNumberingOutput } from './reader-numbering-output.mjs';
import { validateRepository } from './validate.mjs';
import { readCitationSurface, validateCopyeditPreviewOutput } from './reader-surface.mjs';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
async function source(root) {
  const [catalog, readings, literature, { fixedFiles }] = await Promise.all([
    json(join(root, 'knowledge/catalog.json')),
    json(join(root, 'knowledge/research/readings.json')),
    json(join(root, 'knowledge/research/literature-map.json')),
    json(join(root, 'config/readable-book-baseline.json')),
  ]);
  const files = await readReadableBookFiles(root, fixedFiles);
  return { catalog, files, readings, literature };
}

async function rendered(root) {
  const sourceRoot = join(root, '..', 'content');
  const files = await readdir(sourceRoot, { recursive: true, withFileTypes: true });
  const sources = new Map(await Promise.all(files.filter(file => file.isFile() && /\.mdx?$/.test(file.name)).map(async file => {
    const path = join(file.parentPath, file.name);
    const route = '/' + relative(sourceRoot, path).replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/\/index$/, '');
    return [route, await readFile(path, 'utf8')];
  })));
  const edition = await json(join(root, '..', 'config/book-edition.json'));
  const result = await validateReaderNumberingOutput(root, { sources, edition });
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  return result.documents;
}

const [mode, first, second] = process.argv.slice(2);
const firstRoot = resolve(first);
if (mode === 'capture') {
  const manifestBytes = await readFile(join(firstRoot, 'downloads/manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  if (sha256(manifestBytes) !== readerCopyeditSource.manifest || manifest.sourceCommit !== readerCopyeditSource.commit || manifest.dirty)
    throw new Error('Capture requires the preserved, exact 8148 deployed manifest');
  const checked = Object.entries(manifest.files).filter(([path]) => path === 'index.html' || path === 'print/index.html' || path.startsWith('docs/') && path.endsWith('/index.html'));
  for (const [path, sha] of checked) if (sha256(await readFile(join(firstRoot, path))) !== sha) throw new Error(`8148 hosted bytes differ: ${path}`);
  const input = await source(join(firstRoot, '..'));
  const actual = inspectReadableBookEdition(input);
  const numbering = await json(join(firstRoot, '..', 'config/reader-numbering.json'));
  const addresses = observeCopyeditHistory(await rendered(firstRoot), numbering, readCitationSurface);
  console.log(JSON.stringify({
    source: readerCopyeditSource, qualification: 'actual-hosted-html-capture', checkedHtml: Object.fromEntries(checked),
    structure: copyeditSourceStructure(input), sourceOccurrences: actual.sourceOccurrences,
    predecessor: editionDigest({ files: actual.files, records: actual.records }),
    dependencies: editionDigest(actual.dependencies), publishedClaims: editionDigest(actual.publishedClaims), addresses,
  }));
} else if (mode === 'source') {
  const beforeInput = await source(firstRoot);
  const afterInput = await source(resolve(second));
  const before = inspectReadableBookEdition(beforeInput);
  const after = inspectReadableBookEdition(afterInput);
  if (capture.predecessor !== editionDigest({ files: before.files, records: before.records }))
    throw new Error('Source observation requires the independently pinned actual 8148 predecessor');
  if (editionDigest(copyeditSourceStructure(afterInput)) !== editionDigest(capture.structure)
      || editionDigest(after.sourceOccurrences) !== editionDigest(capture.sourceOccurrences)
      || editionDigest(after.dependencies) !== capture.dependencies)
    throw new Error('Candidate differs from protected 8148 source structure or member order');
  const changes = [];
  for (const [kind, key] of [['file', 'files'], ['record', 'records']]) {
    for (const id of new Set([...Object.keys(before[key]), ...Object.keys(after[key])])) {
      const from = before[key][id] ?? null, to = after[key][id] ?? null;
      if (editionDigest(from) !== editionDigest(to)) changes.push({ kind, key: id, from, to });
    }
  }
  const changed = new Set(changes.filter(row => row.kind === 'record' && row.key.startsWith('claims:')).map(row => row.key.slice(7)));
  const dependents = new Set(changed);
  const queue = [...changed];
  for (const id of queue) for (const next of new Set([...(before.dependencies[id] ?? []), ...(after.dependencies[id] ?? [])])) {
    if (!dependents.has(next)) {
      dependents.add(next);
      queue.push(next);
    }
  }
  console.log(JSON.stringify({ status: 'observed-source', changes,
    consumers: after.publishedClaims.filter(id => dependents.has(id) && !changed.has(id)) }, null, 2));
} else if (mode === 'verify-source-preview') {
  if (!currentCopyedit || process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Source preview observation requires a local #95 preview plan');
  const input = await source(firstRoot);
  verifyReaderCopyeditSource({ unit: currentCopyedit, actual: inspectReadableBookEdition(input),
    sourceStructure: copyeditSourceStructure(input), capture, previous: readableBookReviewPlan(previous.units) });
  const errors = await validateRepository(firstRoot);
  if (JSON.stringify(errors) !== JSON.stringify(['Reader copyedit is not independently accepted']))
    throw new Error(errors.length ? errors.join('\n') : 'Private #95 candidate unexpectedly passed the production source gate');
  console.log(JSON.stringify({ status: 'observed-source-preview', productionRejected: true,
    otherSourceGuardErrors: [] }));
} else if (mode === 'output') {
  const numbering = await json(join(firstRoot, '..', 'config/reader-numbering.json'));
  const documents = await rendered(firstRoot);
  const addresses = observeCopyeditHistory(documents, numbering, readCitationSurface);
  const ordinary = [], titles = [];
  for (const [address, old] of Object.entries(capture.addresses)) {
    const actual = addresses[address];
    if (!actual || old.kind !== actual.kind || editionDigest(old.claimIds) !== editionDigest(actual.claimIds))
      throw new Error(`Candidate does not retain the actual 8148 address and ordered scope: ${address}`);
    if (old.ordinary.length !== actual.ordinary.length)
      throw new Error(`Candidate changes the number of ordinary blocks within 8148 scope: ${address}`);
    old.ordinary.forEach((from, index) => {
      const to = actual.ordinary[index];
      if (to !== from) ordinary.push({ address, index, from, to });
    });
    if (old.title !== actual.title && ['chapter', 'reading-title', 'heading', 'part'].includes(old.kind))
      titles.push({ address, from: old.title, to: actual.title });
  }
  console.log(JSON.stringify({ status: 'observed-output', ordinary, titles, addresses,
    printParts: fingerprintCopyeditPrintParts(documents.get('/print')) }));
} else if (mode === 'verify-history') {
  if (!currentCopyedit) throw new Error('History verification requires a #95 candidate or accepted successor');
  const numbering = await json(join(firstRoot, '..', 'config/reader-numbering.json'));
  const documents = await rendered(firstRoot);
  const addresses = observeCopyeditHistory(documents, numbering, readCitationSurface);
  const errors = validateCopyeditHistory(documents, addresses, copyeditHistoryPlan(currentCopyedit), currentCopyedit.printParts);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ status: 'observed-history-verified', addresses: Object.keys(addresses).length }));
  if (second === '--legacy') {
    const root = join(firstRoot, '..');
    const readConfig = name => json(join(root, 'config', name + '.json'));
    const configs = {
      edition: 'book-edition', accepted: 'framework-accepted', headingHistory: 'framework-heading-history',
      cleanerAccepted: 'cleaner-production-accepted', cleanerHeadingHistory: 'cleaner-production-heading-history',
      functionalAccepted: 'functional-reference-accepted', functionalHeadings: 'functional-reference-heading-history', functionalProse: 'functional-reference-prose-accepted',
      processAccepted: 'process-network-accepted', processHeadings: 'process-network-heading-history', processProse: 'process-network-prose-accepted',
      exchangeOriginal: 'exchange-semantics-original', exchangeHeadings: 'exchange-semantics-heading-history',
      exchangePartial: 'exchange-semantics-partial-history', exchangeCitations: 'exchange-semantics-citation-sources', exchangeProse: 'exchange-semantics-prose-accepted',
      hybridAccepted: 'hybrid-inventory-accepted', hybridHeadings: 'hybrid-inventory-heading-history', hybridProse: 'hybrid-inventory-prose-accepted',
      jointOriginal: 'joint-production-original', jointHeadings: 'joint-production-heading-history', jointProse: 'joint-production-prose-accepted',
      wallOriginal: 'wall-selection-original', wallHeadings: 'wall-selection-heading-history', wallAccepted: 'wall-selection-accepted',
      closingHistory: 'closing-synthesis-heading-history', closingProse: 'closing-synthesis-prose-accepted',
      climateAccepted: 'climate-assembly-accepted', dataAccepted: 'data-applicability-accepted', toxicityAccepted: 'toxicity-pathways-accepted',
      pedigreeAccepted: 'readable-pedigree-accepted', pmAccepted: 'pm-selection-accepted', hostedHistory: 'readable-book-hosted-history',
    };
    const [input, baseline, placements, history, rows] = await Promise.all([
      source(root), readConfig('citation-baseline'), readConfig('citation-placements'), readConfig('citation-history'),
      Promise.all(Object.entries(configs).map(async ([key, name]) => [key, await readConfig(name)])),
    ]);
    const sources = new Map([...input.files].filter(([path]) => /^content\/.+\.mdx?$/.test(path)).map(([path, bytes]) => [
      path.slice('content'.length).replace(/\.mdx?$/, '').replace(/\/index$/, ''), bytes.toString(),
    ]));
    const prior = readableBookReviewPlan(previous.units);
    const preview = effectiveReaderCopyedit(prior, currentCopyedit);
    // Private Next output deliberately has no public downloads. Pass the exact
    // static article and citation guards; public artifact files remain checked
    // only by the normal production export.
    const legacyErrors = await validateCopyeditPreviewOutput(firstRoot, baseline, placements, [...sources.keys()], history, {
      ...Object.fromEntries(rows), ...input, current: preview, sources,
    });
    if (legacyErrors.length) throw new Error(legacyErrors.join('\n'));
    console.log(JSON.stringify({ status: 'observed-legacy-output-verified' }));
  }
} else if (mode === 'fingerprints') {
  const observed = await json(firstRoot);
  const [unit] = previous.units;
  function changedRows(before, after, id) {
    const earlier = new Map(before.map(row => [id(row), row.sha256]));
    if (after.length !== earlier.size || new Set(after.map(id)).size !== earlier.size)
      throw new Error('Candidate output roster differs from 8148');
    return after.flatMap(row => {
      const from = earlier.get(id(row));
      if (!from) throw new Error(`Candidate introduced an unregistered output: ${id(row)}`);
      return row.sha256 === from ? [] : [{ ...row, from }];
    });
  }
  console.log(JSON.stringify({ status: 'observed-fingerprint-delta',
    outputs: changedRows(unit.outputs, observed.articles, row => `${row.path}#${row.route}`),
    publicArtifacts: changedRows(unit.publicArtifacts, observed.publicArtifacts, row => row.path),
    printParts: observed.printParts }, null, 2));
} else {
  throw new Error('Use capture <8148 export>, source <8148 source> <candidate source>, output <candidate export>, verify-history <candidate export>, verify-source-preview <candidate source>, or fingerprints <candidate output observation>');
}
