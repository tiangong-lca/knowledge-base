import capture from '../config/reader-land-recovery-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const landRecoveryId = 'land-recovery-111';
export const landRecoveryChapter = '/docs/book/midpoint-endpoint-value-choices';
/** @type {string|null} */
export const landRecoveryUnitPin = 'b7ecb6ad3b07ef5a2c0b1c5989b1e3e548ca4d363fd6d056a29e736f0ca9909d';
/** @type {string|null} */
export const landRecoveryCapturePin = 'dc3ec1971222cb09836ecb72f8e741aa783add7eba6f927993664794506049fc';
export const landRecoverySource = Object.freeze({
  commit: '30f934a47776d8b3c354ed4405d4fe9bcf328933', tree: '7a646c8f55bc092dc9d6bfd4f69c0d345c053d97',
  manifest: 'be571b391a102da116dd728b596e06632dbb1e321b7626ac9ea85cd8b84ff9d8', date: '2026-11-15',
});
export const landRecoveryPredecessorPin = 'd754b639cb6f427cab478e933e3a7fe422a381b9864630c0242e83fccac1e1cd';
const addressPin = '0d64d9af5a93c2f95a7b3b4aa9e3f9c2ded3f8e3a5bd607d0676ab2db5508cba';
const mdxPath = `content${landRecoveryChapter}.mdx`;
const oldMdxSha = '09a10ae747b6ae2451095182e811d5c9f717d0deebb09c92193bad0d479fcfc6';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectLandRecovery(config, pin = landRecoveryUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Land recovery requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== landRecoveryId || !sameScienceValue(unit.source, landRecoverySource)
      || !sameScienceValue(unit.routes, [landRecoveryChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Land recovery requires an exact 30f934a predecessor and bounded B14 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Land recovery is not independently accepted');
  return unit;
}

const priorReport = 'lit-m05';
const priorArticle = 'rd-recipe-2017-primary-article';
function allowsRaw(kind, id, before) {
  if (before !== null) return kind === 'literature' && id === priorReport || kind === 'readings' && id === priorArticle;
  const prefixes = {
    claims: 'cl-land111-', evidence: 'ev-land111-', sources: 'src-land111-',
    readings: 'rd-land111-', literature: 'work-land111-',
  };
  return prefixes[kind] ? id.startsWith(prefixes[kind]) : kind === 'queries' && id === 'q-land111-primary-recovery-20261115';
}

function appended(previous, current, count) {
  return Array.isArray(previous) && Array.isArray(current) && current.length === previous.length + count
    && sameScienceValue(previous, current.slice(0, previous.length));
}

function qualifyPriorResearch(unit, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  const report = prior('literature.records', priorReport);
  const currentReport = literature.records.find(row => row.id === priorReport);
  const reportIdentity = ({ urls, limitations, catalogSourceIds, rights, accessStatus, lastCheckedAt, ...identity }) => identity;
  if (!report || !currentReport || !sameScienceValue(reportIdentity(report), reportIdentity(currentReport))
      || !appended(report.urls, currentReport.urls, 2) || !appended(report.limitations, currentReport.limitations, 1)
      || !appended(report.catalogSourceIds, currentReport.catalogSourceIds, 1)
      || currentReport.catalogSourceIds.at(-1) !== 'src-land111-rivm2016'
      || !currentReport.rights?.startsWith(report.rights + ' ') || !scienceText(currentReport.rights.slice(report.rights.length))
      || report.accessStatus !== 'metadata-only' || currentReport.accessStatus !== 'public-fulltext-available'
      || currentReport.lastCheckedAt !== landRecoverySource.date || currentReport.lastCheckedAt <= report.lastCheckedAt)
    throw new Error('Land recovery changed the previous RIVM work identity or its append-only acquisition record');

  const article = prior('readings.readings', priorArticle);
  const currentArticle = readings.readings.find(row => row.id === priorArticle);
  const articleIdentity = ({ appraisal: { limitations, ...appraisal }, ...identity }) => ({ ...identity, appraisal });
  if (!article?.appraisal || !currentArticle?.appraisal || !sameScienceValue(articleIdentity(article), articleIdentity(currentArticle))
      || !appended(article.appraisal.limitations, currentArticle.appraisal.limitations, 1))
    throw new Error('Land recovery changed the previous ReCiPe article, carrier, passage, or historical appraisal instead of appending a limitation');
}

function boundedOccurrences(previousMdx, actualMdx) {
  const inserts = [...actualMdx.matchAll(/(?<=\n\n)<Prose ids="(cl-land111-[a-z0-9-]+(?: cl-land111-[a-z0-9-]+)*)" \/>\n\n/g)];
  const groups = inserts.map(match => match[1].split(' '));
  if (!sameScienceValue(groups.map(ids => ids.length), [3, 6, 1]))
    throw new Error('Land recovery requires the three exact scoped B14 additions');
  const expected = previousMdx
    .replace(' cl-lcia-mid-end-conversion-limits" />\n\n', ' cl-lcia-mid-end-conversion-limits" />\n\n' + inserts[0][0])
    .replace(' cl-lcia-global-is-not-site-specific" />\n\n', ' cl-lcia-global-is-not-site-specific" />\n\n' + inserts[1][0])
    .replace('<Prose ids="cl-lcia-model-data-factor-separation" />', inserts[2][0] + '<Prose ids="cl-lcia-model-data-factor-separation" />');
  const added = groups.flat();
  if (expected !== actualMdx || !unique(added, id => id))
    throw new Error('Land recovery changed protected B14 text or moved one of its three additions');
  return added;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Land recovery missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Land recovery inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Land recovery declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B14 file and raw publication records before the #109 verifier. */
export function prepareLandRecoverySource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Land recovery lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Land recovery cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Land recovery lacks independently preserved predecessor B14 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Land recovery lacks exact B14 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, literature, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== landRecoveryPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== landRecoveryPredecessorPin)
    throw new Error('Land recovery did not recover the independently observed raw 30f934a state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Land recovery actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Land recovery lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveLandRecovery(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, landRecovery: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== landRecoveryCapturePin) return false;
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

export function verifyLandRecoveryReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${landRecoveryId}/${row.kind}`;
    if (row.date < landRecoverySource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function landRecoveryOrdinaryId(unit, route, print, index) {
  if (!unit || route !== landRecoveryChapter || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-land-111-ordinary-0`;
}

export function landRecoveryHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-land-111-ordinary-0$/;
export function observeLandRecoveryOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyLandRecoveryHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLandRecoveryOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Land recovery', routes: [landRecoveryChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: landRecoveryHistoryControls(unit), source: landRecoverySource, attribute: 'land-recovery',
    ordinaryPattern, label: 'Land recovery', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Land recovery actual versioned description differs');
  return { prior, errors };
}

export function landRecoveryPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
