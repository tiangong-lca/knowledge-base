import { validateMineralResourcesFactors } from './reader-mineral-resources-factors.mjs';
import capture from '../config/reader-mineral-resources-capture.json' with { type: 'json' };
import { landRecoveryHistoryControls, observeLandRecoveryOrdinaryTargets } from './reader-land-recovery.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { flowBoundaryNoteTarget, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const mineralResourcesId = 'mineral-resources-115';
export const mineralResourcesChapter = '/docs/book/midpoint-endpoint-value-choices';
/** @type {string|null} */
export const mineralResourcesUnitPin = '55a47b95c97683d14fe352691d75566a5aef552d962404a0cb5e25d194420215';
/** @type {string|null} */
export const mineralResourcesCapturePin = 'e5a2f4ae3534f3986baf36d90f497110710c4c04beb7004268fd3998dc276f75';
export const mineralResourcesSource = Object.freeze({
  commit: '607381d36b5f2c24e11ed4cd850a15b252620cbd', tree: 'e7e378b928351ac47d22bb55ce9f6221c8cd30fb',
  manifest: '18c06647c6f8b1fa1c9787461b6b7c11691d2774be9b9f3a125173782289c187', date: '2026-11-16',
});
export const mineralResourcesPredecessorPin = '62ff2d1448becfb53dc3901db51601207a9385b9ba7c01390de631e7d6e04a16';
const addressPin = '5233bfc51e38c638793ef9e3355f015a6e0eaf6e3bde979bba369fdee2abfd2c';
const mdxPath = `content${mineralResourcesChapter}.mdx`;
const oldMdxSha = 'a3f4ad905d594ce33d5e6dbe79d6ed82e9f32d55055fccfcb2e6bfeacc92ab23';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectMineralResources(config, pin = mineralResourcesUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Mineral resources requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== mineralResourcesId || !sameScienceValue(unit.source, mineralResourcesSource)
      || !sameScienceValue(unit.routes, [mineralResourcesChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Mineral resources requires an exact 607381d predecessor and bounded B14 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Mineral resources is not independently accepted');
  return unit;
}

const reportSource = 'src-land111-rivm2016';
const reportReading = 'rd-land111-rivm2016';
const reportWork = 'lit-m05';
export const mineralResourcesCorrection = Object.freeze({
  claimId: 'cl-lcia-midpoint-pathway',
  scope: '前版以排放后的路径说明中点与终点。本版明确该段使用的是排放示例，并说明土地占用和原生矿产开采等清单输入也需要相应的模型关系。',
});

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'claims' && id === mineralResourcesCorrection.claimId)
    || (kind === 'sources' && id === reportSource)
    || (kind === 'readings' && id === reportReading) || (kind === 'literature' && id === reportWork);
  const prefixes = {
    claims: 'cl-mineral115-', evidence: 'ev-mineral115-', sources: 'src-mineral115-',
    readings: 'rd-mineral115-', literature: 'work-mineral115-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return [
    'q-mineral115-factor-originals-20261116', 'q-mineral115-guidance-and-dissent-20261116',
  ].includes(id);
  return kind === 'revisions' && id === 'rev-mineral115-rivm-selected-mineral';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  const source = prior('catalog.sources', reportSource);
  const currentSource = catalog.sources.find(row => row.id === reportSource);
  const scopeAppend = ' 2026-11-16同载体另核印pp87–93矿产§§12.1–12.4、表12.1–12.3及图12.3；印pp183–185 §§23.1–23.2、表S8.1及图S8.2。原选读日期及原土地页范围保留。';
  if (!source || !sameScienceValue(currentSource, {
    ...source, reading: { ...source.reading, scope: source.reading.scope + scopeAppend },
  })) throw new Error('Mineral resources changed the previous RIVM source or its acquisition scope');

  const reading = prior('readings.readings', reportReading);
  const currentReading = readings.readings.find(row => row.id === reportReading);
  const added = currentReading?.passages.slice(reading?.passages.length ?? 0) ?? [];
  if (!reading || added.length !== 10 || added.some(row => !row.id.startsWith('psg-mineral115-')
      || row.artifactId !== 'art-land111-rivm2016-pdf')
      || !sameScienceValue(currentReading, { ...reading, passages: [...reading.passages, ...added] }))
    throw new Error('Mineral resources changed the previous RIVM reading, carrier or passage prefix');

  const work = prior('literature.records', reportWork);
  const currentWork = literature.records.find(row => row.id === reportWork);
  const limitation = '2026-11-16以同SHA原2016-0104载体追加核读矿产第12章与§23选段；不扩大2026-11-15土地事件或其他载体资格。';
  if (!work || work.lastCheckedAt !== '2026-11-15' || !sameScienceValue(currentWork, {
    ...work, lastCheckedAt: mineralResourcesSource.date, limitations: [...work.limitations, limitation],
  })) throw new Error('Mineral resources changed the previous RIVM work or its acquisition history');
}

const comparisonSections = [
  [' cl-land111-conversion" />\n\n', ['input','adp','sop']],
  [' cl-land111-aggregation" />\n\n', ['reserves']],
  ['<Prose ids="cl-land111-printed-record" />\n\n', ['rank','cost-proxy','metal-cost','calibration','assumptions','judgment']],
];

function boundedOccurrences(previousMdx, actualMdx) {
  let expected = previousMdx;
  const added = [];
  for (const [boundary, names] of comparisonSections) {
    const ids = names.map(name => 'cl-mineral115-' + name);
    expected = expected.replace(boundary, boundary + `<Prose ids="${ids.join(' ')}" />\n\n`);
    added.push(...ids);
  }
  if (expected !== actualMdx) throw new Error('Mineral resources changed protected B14 text or its three scoped additions');
  return added;
}

function qualifyCorrection(unit, records, catalog) {
  const id = mineralResourcesCorrection.claimId;
  if (!records.has(`claims:${id}`)) {
    if (unit.correction) throw new Error('Mineral resources declared a correction without its actual record transition');
    return;
  }
  const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === id)?.from;
  const current = catalog.claims.find(row => row.id === id);
  const evidence = ['ev-lcia-midpoint-pathway', 'ev-lcia-mid-end-conversion-limits', 'ev-mineral115-rivm-sop-method'];
  if (!sameScienceValue(unit.correction, mineralResourcesCorrection) || !original || !current
      || original.text === current.text || current.reviewedAt !== mineralResourcesSource.date
      || current.kind !== 'interpretation' || current.reviewKind !== 'agent-source-check'
      || original.status !== current.status || !sameScienceValue(original.conceptIds, current.conceptIds)
      || !sameScienceValue(original.premiseIds, current.premiseIds) || !sameScienceValue(current.evidenceIds, evidence)
      || !sameScienceValue(current.evidenceLinks?.map(({ evidenceId, relation }) => [evidenceId, relation]),
        evidence.map(id => [id, 'supports'])))
    throw new Error('Mineral resources lacks the exact predecessor and scope disposition for its opening correction');
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Mineral resources missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Mineral resources inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Mineral resources declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B14 file and raw publication records before the #113 verifier. */
export function prepareMineralResourcesSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Mineral resources lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Mineral resources cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Mineral resources lacks independently preserved predecessor B14 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:')
    && key !== `claims:${mineralResourcesCorrection.claimId}`);
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Mineral resources lacks exact B14 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  qualifyCorrection(unit, records, catalog);
  validateMineralResourcesFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== mineralResourcesPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== mineralResourcesPredecessorPin)
    throw new Error('Mineral resources did not recover the independently observed raw 607381d state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Mineral resources actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Mineral resources lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveMineralResources(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, mineralResources: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== mineralResourcesCapturePin) return false;
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

export function verifyMineralResourcesReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${mineralResourcesId}/${row.kind}`;
    if (row.date < mineralResourcesSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function mineralResourcesHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

export function qualifyMineralResourcesHistory(documents, unit, actual, landRecovery) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLandRecoveryOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Mineral resources', routes: [mineralResourcesChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: mineralResourcesHistoryControls(unit), source: mineralResourcesSource, attribute: 'mineral-resources',
    previousHistory: { attribute: 'land-recovery', expected: landRecoveryHistoryControls(landRecovery) },
    ordinaryPattern: /-land-111-ordinary-0$/, label: 'Mineral resources', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Mineral resources actual versioned description differs');
  for (const [path, document] of documents)
    errors.push(...validateMineralResourcesCorrectionOutput(document, path, unit.correction));
  return { prior, errors };
}

export function validateMineralResourcesCorrectionOutput(document, path, correction) {
  const markers = document.querySelectorAll('[data-mineral-resources-correction]');
  const expected = correction && (path === '/print' || path === mineralResourcesChapter);
  if (!expected && !markers.length) return [];
  const { claimId, scope } = mineralResourcesCorrection;
  const { id } = flowBoundaryNoteTarget(path, mineralResourcesChapter, claimId);
  const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
  const note = nativeNotes[0];
  const marker = markers[0], time = marker?.querySelector('time'), links = marker?.querySelectorAll('a');
  const article = note?.closest('article[data-reader-route]');
  const sections = article?.querySelectorAll('.chapter-notes') ?? [];
  const list = sections[0]?.querySelector('ol');
  if (!expected || nativeNotes.length !== 1 || note.tagName !== 'LI' || note.getAttribute('data-reader-claim') !== claimId
      || article?.getAttribute('data-reader-route') !== mineralResourcesChapter || sections.length !== 1
      || note.parentNode !== list || list.childNodes.find(child => child.tagName === 'LI') !== note
      || markers.length !== 1 || marker.tagName !== 'P' || marker.parentNode !== note || !visibleHistoryControl(marker)
      || marker.getAttribute('data-mineral-resources-correction') !== claimId
      || marker.getAttribute('style') !== 'display:block'
      || time?.getAttribute('datetime') !== mineralResourcesSource.date || time.text !== mineralResourcesSource.date
      || links.length !== 1 || links[0].getAttribute('href') !== citationSourceHref(mineralResourcesSource.commit)
      || !visibleHistoryControl(links[0]) || marker.text !== `${mineralResourcesSource.date} 修订：${scope} 查看前版源文件`)
    return [`Mineral resources opening correction is absent, changed or detached: ${path}`];
  return [];
}

export function mineralResourcesPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
