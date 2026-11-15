import capture from '../config/reader-circular-footprint-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const circularFootprintId = 'circular-footprint-109';
export const circularFootprintChapter = '/docs/book/recycling-chains-and-accounting';
export const circularFootprintMarker = '循环收益的归属';
/** @type {string|null} */
export const circularFootprintUnitPin = '7f39898300037bbea8886c8986da445644c165bddd6b11b9af7e7e6006f7c7be';
/** @type {string|null} */
export const circularFootprintCapturePin = '222c86e7c9c3157e148d1bb576cea132f7671b9a8314d1ffe863923a5cc395e1';
export const circularFootprintSource = Object.freeze({
  commit: 'b7d8cd1829576e21044878a0a90df310c20e5305', tree: '0cd887d41ee18b5c63c8081bd579fa7edd8578aa',
  manifest: '4968a255734648424d6ebcf7430d0e41bebc1a6554d58f3e6f29ee1ba076992a', date: '2026-11-15',
});
export const circularFootprintPredecessorPin = 'c67647ef6596b4fe586d7d29b72974a9f3eae0a65287818b30113709c6a3e58a';
const addressPin = '43f2db4864e212874fd85a240538d40105236d677144bc023e2b3823e2615609';
const mdxPath = `content${circularFootprintChapter}.mdx`;
const oldMdxSha = '744ac95559f3fc542d3951350d742cde76832d80107155ca511d98c5f4649c58';
const originalMarker = '本地多回收系统外怎样变化';
const endClaim = 'cl-cycle-conclusion';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectCircularFootprint(config, pin = circularFootprintUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Circular footprint requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== circularFootprintId || !sameScienceValue(unit.source, circularFootprintSource)
      || !sameScienceValue(unit.routes, [circularFootprintChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Circular footprint requires an exact b7d8cd1 predecessor and bounded B13 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Circular footprint is not independently accepted');
  return unit;
}

const priorPefSources = new Set(['src-kb44-ec2021', 'src-kb44-pef-guidance2018']);
const priorPefReadings = new Set(['rd-kb44-ec2021', 'rd-kb44-pef-guidance2018']);
function allowsRaw(kind, id, before) {
  if (before !== null) return kind === 'sources' && priorPefSources.has(id) || kind === 'readings' && priorPefReadings.has(id);
  if (kind === 'claims') return id.startsWith('cl-cff109-');
  if (kind === 'evidence') return id.startsWith('ev-cff109-');
  return ({
    sources: 'src-cff109-ekvall-2021', readings: 'rd-cff109-ekvall-2021',
    literature: 'work-cff109-ekvall-2021', queries: 'q-cff109-ekvall-20261115',
  })[kind] === id;
}

function boundedOccurrences(previousMdx, actualMdx) {
  const section = `<ReaderSection id="${circularFootprintMarker}" />`;
  const [before, after, extra] = actualMdx.split(section);
  const original = previousMdx.replace(` ${endClaim}" />\n`, '" />\n');
  if (after === undefined || extra !== undefined || before.trimEnd() !== original.trimEnd()
      || !/^(?:\s*<Prose ids="[a-z0-9-]+(?: [a-z0-9-]+)*" \/>)+\s*$/.test(after))
    throw new Error('Circular footprint changed protected B13 text or added material outside its one reader section');
  const finalSection = collectChapterClaimOccurrences(after);
  if (!unique(finalSection, id => id) || !finalSection.includes(endClaim)
      || finalSection.some(id => id !== endClaim && !id.startsWith('cl-cff109-')))
    throw new Error('Circular footprint did not retain the original B13 conclusion and bounded new claim identities');
  return finalSection.filter(id => id !== endClaim);
}

/** Restore the physical B13 file and raw publication records before the #107 verifier. */
export function prepareCircularFootprintSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Circular footprint lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Circular footprint cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Circular footprint lacks independently preserved predecessor B13 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Circular footprint lacks exact B13 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== circularFootprintPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== circularFootprintPredecessorPin)
    throw new Error('Circular footprint did not recover the independently observed raw b7d8cd1 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Circular footprint actual source state differs from the reviewed candidate');

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Circular footprint lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveCircularFootprint(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, circularFootprint: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== circularFootprintCapturePin) return false;
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

export function verifyCircularFootprintReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${circularFootprintId}/${row.kind}`;
    if (row.date < circularFootprintSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function circularFootprintOrdinaryId(unit, route, print, index) {
  if (!unit || route !== circularFootprintChapter || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-cff-109-ordinary-0`;
}

export function circularFootprintHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = row.address.endsWith(`#${originalMarker}`) || row.address.endsWith(`-${originalMarker}`);
    return [row.address, { ...row, previous: marker ? { ...previous, title: originalMarker } : previous }];
  })));
}

const ordinaryPattern = /-cff-109-ordinary-0$/;
export function observeCircularFootprintOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyCircularFootprintHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeCircularFootprintOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Circular footprint', routes: [circularFootprintChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: circularFootprintHistoryControls(unit), source: circularFootprintSource, attribute: 'circular-footprint',
    ordinaryPattern, label: 'Circular footprint', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Circular footprint actual versioned description differs');
  return { prior, errors };
}

export function circularFootprintPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
