import { validateAcidEquivalentsFactors } from './reader-acid-equivalents-factors.mjs';
import capture from '../config/reader-acid-equivalents-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const acidEquivalentsId = 'acid-equivalents-113';
export const acidEquivalentsChapter = '/docs/book/acidification-and-nutrient-pathways';
/** @type {string|null} */
export const acidEquivalentsUnitPin = '1e3c1db4d418a2c330671e247b78f89e7bc121201d3c9ee423ede55f89cff9a5';
/** @type {string|null} */
export const acidEquivalentsCapturePin = '1ea653c0fc6ddd8dc78d1d45f5f7e13132d4d5a80df612ee00872bebb3fda3aa';
export const acidEquivalentsSource = Object.freeze({
  commit: '5c71ee4bc3d84b680a1a016af38d541ec56e954f', tree: '3ab078f7fd5a142026ea99d362b378a826d6a83b',
  manifest: 'e24dc3febeee786417ee396174cad9ca32e55b28c614f5f9636ce1bca19af0d7', date: '2026-11-15',
});
export const acidEquivalentsPredecessorPin = 'd72f9d5901ac87e2fa318b61550dc7f81c99ba828333db19138818ed30150759';
const addressPin = '9eb76e6f843f6d6ca88c142256b159a83d228175c949a76785c54edb2abe5662';
const mdxPath = `content${acidEquivalentsChapter}.mdx`;
const oldMdxSha = 'fae6c7d560b238793d6c8532a60777893de1459beb318a380b464ad16b2f4dc2';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectAcidEquivalents(config, pin = acidEquivalentsUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Acid equivalents requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== acidEquivalentsId || !sameScienceValue(unit.source, acidEquivalentsSource)
      || !sameScienceValue(unit.routes, [acidEquivalentsChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Acid equivalents requires an exact 5c71ee4 predecessor and bounded B16 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Acid equivalents is not independently accepted');
  return unit;
}

const landNutrientMarker = '陆地营养富集与指标的单位';
const readingAppend = new Map([
  ['rd-unep-glam-2019-pathways', [0, 3]],
  ['rd-ilcd-2011-eutrophication-pathways', [0, 2]],
  ['rd-kb50-jrc-ilcd11', [0, 1]],
  ['rd-flow-pilot-ef31', [6, 14]],
  ['rd-flow-pilot-ef31-update', [0, 1]],
]);
const efWork = 'work-flow-pilot-ef31';

function allowsRaw(kind, id, before) {
  if (before !== null) return kind === 'literature' && id === efWork || kind === 'readings' && readingAppend.has(id);
  const prefixes = {
    claims: 'cl-acid113-', evidence: 'ev-acid113-', sources: 'src-acid113-',
    readings: 'rd-acid113-', literature: 'work-acid113-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  return ({
    queries: 'q-acid113-indicators-and-release-20261115',
    gaps: 'gap-acid113-glam-workbook',
    revisions: 'rev-acid-equivalents-113-20261115',
  })[kind] === id;
}

function appended(previous, current, count) {
  return Array.isArray(previous) && Array.isArray(current) && current.length === previous.length + count
    && sameScienceValue(previous, current.slice(0, previous.length));
}

function qualifyPriorResearch(unit, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  const readingIdentity = ({ artifacts, passages, ...read }) => read;
  for (const [id, [artifacts, passages]] of readingAppend) {
    const before = prior('readings.readings', id), current = readings.readings.find(row => row.id === id);
    if (!before || !current || !sameScienceValue(readingIdentity(before), readingIdentity(current))
        || !appended(before.artifacts, current.artifacts, artifacts) || !appended(before.passages, current.passages, passages))
      throw new Error(`Acid equivalents changed the previous reading, carrier, passage or acquisition identity: ${id}`);
  }
  const original = prior('literature.records', efWork), current = literature.records.find(row => row.id === efWork);
  if (!original || !current || !sameScienceValue(current, {
    ...original, catalogSourceIds: [...original.catalogSourceIds, 'src-acid113-ef31-selected-members'],
  })) throw new Error('Acid equivalents changed the previous EF work instead of appending its selected member source');
}

function boundedOccurrences(previousMdx, actualMdx) {
  const inserts = [...actualMdx.matchAll(/(?<=\n\n)<Prose ids="(cl-acid113-[a-z0-9-]+(?: cl-acid113-[a-z0-9-]+)*)" \/>\n\n/g)];
  const groups = inserts.map(match => match[1].split(' '));
  if (!sameScienceValue(groups.map(ids => ids.length), [6, 2]))
    throw new Error('Acid equivalents requires the two exact scoped B16 additions');
  const expected = previousMdx
    .replace(' cl-path-acid-indicator" />\n\n', ' cl-path-acid-indicator" />\n\n' + inserts[0][0])
    .replace(' cl-path-units" />\n\n', ' cl-path-units" />\n\n' + inserts[1][0]);
  const added = groups.flat();
  if (expected !== actualMdx || !unique(added, id => id))
    throw new Error('Acid equivalents changed protected B16 text or moved one of its two additions');
  return added;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Acid equivalents missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Acid equivalents inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Acid equivalents declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B16 file and raw publication records before the #111 verifier. */
export function prepareAcidEquivalentsSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Acid equivalents lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Acid equivalents cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Acid equivalents lacks independently preserved predecessor B16 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Acid equivalents lacks exact B16 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, literature, readings);
  validateAcidEquivalentsFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== acidEquivalentsPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== acidEquivalentsPredecessorPin)
    throw new Error('Acid equivalents did not recover the independently observed raw 5c71ee4 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Acid equivalents actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Acid equivalents lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveAcidEquivalents(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, acidEquivalents: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== acidEquivalentsCapturePin) return false;
  const identity = { ...capture.identity, normalizedProofSha256: editionDigest(capture.normalization) };
  if (!sameScienceValue(unit.outputCapture, identity) || !sameScienceValue(observations.capture, identity)
      || observations.sourceCommit !== identity.sourceCommit) return false;
  const articles = unit.outputs.map(({path, route, sha256}) => ({path, route, sha256}));
  const html = unit.publicArtifacts.filter(row => row.path.endsWith('.html')).map(({path, sha256}) => ({path, sha256}));
  if (!sameScienceValue(articles, capture.normalization.articles) || !sameScienceValue(html, capture.normalization.publicHtml)) return false;

  const raw = new Map(capture.files.map(file => [file.path, file]));
  const articleFiles = [...new Set(articles.map(row => `${row.path.slice(1)}/index.html`))].map(path => raw.get(path));
  const artifacts = observations.artifactFiles;
  return !articleFiles.some(file => !file) && sameScienceValue(articleFiles, observations.articleFiles)
    && Array.isArray(artifacts) && unique(artifacts, file => file.path)
    && sameScienceValue(artifacts.map(file => [file.path, file.contentSha256 ?? file.sha256]), unit.publicArtifacts.map(row => [row.path, row.sha256]))
    && artifacts.every(file => file.sha256 === raw.get(file.path)?.sha256 && file.bytes === raw.get(file.path)?.bytes
      && (!file.path.endsWith('.json') || exactPublicJsonReceipt(file, publicDownloads.get(file.path))));
}

export function verifyAcidEquivalentsReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${acidEquivalentsId}/${row.kind}`;
    if (row.date < acidEquivalentsSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function acidEquivalentsOrdinaryId(unit, route, print, index) {
  if (!unit || route !== acidEquivalentsChapter || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-acid-113-ordinary-0`;
}

export function acidEquivalentsHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = row.address.endsWith(`#${landNutrientMarker}`) || row.address.endsWith(`-${landNutrientMarker}`);
    return [row.address, { ...row, previous: marker ? { ...previous, title: landNutrientMarker } : previous }];
  })));
}

const ordinaryPattern = /-acid-113-ordinary-0$/;
export function observeAcidEquivalentsOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyAcidEquivalentsHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeAcidEquivalentsOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Acid equivalents', routes: [acidEquivalentsChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: acidEquivalentsHistoryControls(unit), source: acidEquivalentsSource, attribute: 'acid-equivalents',
    ordinaryPattern, label: 'Acid equivalents', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Acid equivalents actual versioned description differs');
  return { prior, errors };
}

export function acidEquivalentsPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
