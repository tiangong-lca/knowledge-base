import capture from '../config/reader-future-scenarios-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput,
} from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';
import { validateFutureScenariosFactors } from './reader-future-scenarios-factors.mjs';

export const futureScenariosId = 'future-scenarios-161';
export const futureScenariosCheckDate = '2026-11-19';
export const futureScenariosRoute = '/docs/book/future-technology-and-context';
export const futureScenariosRoutes = Object.freeze([futureScenariosRoute]);
/** @type {string|null} */
export const futureScenariosUnitPin = 'c1379db47c27d15ec3937f7665d6211f9e0e7ef739921be5c021c1ce833b2551';
/** @type {string|null} */
export const futureScenariosCapturePin = 'a6c3f81d6d27fdb4b0df22a0659a7e26210f13973ca673e85737a0d5245cbd6f';
export const futureScenariosSource = Object.freeze({
  commit: 'ac54b2594efab9d985e8f2aac677d68e97573643',
  tree: '752efb6110b27ab5ebb299931a74a768822c6c11',
  manifest: 'bc9c158baf5f009172d04d1c27fa46898eab9b2755d84de48022b84ca7028709',
  date: '2026-11-19',
});
export const futureScenariosPredecessorPin = '8cee455c6adcaf3db92903ac5f7e53bc28b39e9dc4ffd1b47c98502fae6b4c4e';
const addressPin = '2db9f257d6ca370baa1a0be6c75c6797a5ecbb1c07ee7e34a72eb0519d763ad4';

const mdxPath = 'content/docs/book/future-technology-and-context.mdx';
const oldMdxSha = 'aee084ca20f91aaf7f1709b97875e5adbb8c081909344169394a9e1f28b599b3';

const addedClaimIds = Object.freeze([
  'cl-fut161-terminology-axes',
  'cl-fut161-upscaling-methods',
  'cl-fut161-superstructure-iam',
  'cl-fut161-superstructure-limits',
  'cl-fut161-dynamic-time-horizons',
  'cl-fut161-temporal-barriers-values',
]);
const addedEvidenceIds = Object.freeze([
  'ev-fut161-arvidsson-terminology',
  'ev-fut161-tsoy-upscaling',
  'ev-fut161-steubing-superstructure',
  'ev-fut161-steubing-limits',
  'ev-fut161-lueddeckens-temporal',
  'ev-fut161-lueddeckens-barriers',
]);
const addedSourceIds = Object.freeze([
  'src-fut161-arvidsson-2024',
  'src-fut161-tsoy-2020',
  'src-fut161-steubing-2021',
  'src-fut161-lueddeckens-2020',
]);
const addedReadingIds = Object.freeze([
  'rd-fut161-arvidsson-2024',
  'rd-fut161-tsoy-2020',
  'rd-fut161-steubing-2021',
  'rd-fut161-lueddeckens-2020',
]);
const addedLiteratureIds = new Set([
  'work-fut161-arvidsson-2024',
  'work-fut161-tsoy-2020',
  'work-fut161-steubing-2021',
  'work-fut161-lueddeckens-2020',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'previousFiles',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedRawFieldKeys = new Set(['path', 'from', 'to']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
const allowedHistoryRowKeys = new Set(['address', 'from', 'ordinary', 'rationale']);
const allowedOrdinaryBlockKeys = new Set(['address', 'targetId', 'from', 'to', 'rationale']);
const allowedOutputKeys = new Set(['path', 'route', 'from', 'sha256', 'rationale']);
const allowedPublicArtifactKeys = new Set(['path', 'from', 'sha256', 'rationale']);
const allowedOutputCaptureKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256', 'normalizedProofSha256']);
const allowedReviewEvidenceKeys = new Set(['kind', 'date', 'artifactFile', 'artifactSha256', 'reportFile', 'reportSha256']);
const allowedCaptureKeys = new Set(['schemaVersion', 'identity', 'manifestPaths', 'files', 'normalization']);
const allowedCaptureIdentityKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256']);
const allowedCaptureFileKeys = new Set(['path', 'sha256', 'bytes']);
const allowedCaptureNormKeys = new Set(['articles', 'publicHtml']);

function assertUnitEnvelopeKeys(unit, reviewed) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !prevKeys || prevKeys.length !== 1 || prevKeys[0] !== mdxPath || typeof unit.previousFiles[mdxPath] !== 'string'
      || !Array.isArray(unit.rawRecords)
      || !unit.rawRecords.every(r => exactKeys(r, allowedRawRecordKeys) && scienceText(r.path) && scienceText(r.id))
      || !Array.isArray(unit.rawFields)
      || !unit.rawFields.every(r => exactKeys(r, allowedRawFieldKeys) && scienceText(r.path))
      || !Array.isArray(unit.changes)
      || !unit.changes.every(row => exactKeys(row, allowedChangeKeys)
        && (row.kind === 'file' || row.kind === 'record') && scienceText(row.key) && scienceText(row.rationale))
      || !Array.isArray(unit.consumers)
      || !unit.consumers.every(row => exactKeys(row, allowedConsumerKeys) && scienceText(row.id) && scienceText(row.rationale))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !Array.isArray(unit.outputs)
      || !unit.outputs.every(row => exactKeys(row, allowedOutputKeys)
        && scienceText(row.path) && scienceText(row.route) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !Array.isArray(unit.publicArtifacts)
      || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys)
        && scienceText(row.path) && scienceDigest(row.sha256) && scienceText(row.rationale))) {
    throw new Error('Future technology & scenarios comparison unit envelope contains invalid or extra keys');
  }
  const { history } = unit;
  if (!plainObject(history.previousAddresses) || !plainObject(history.currentAddresses)
      || !plainObject(history.ordinaryTargets)
      || !Object.values(history.ordinaryTargets).every(t => exactKeys(t, allowedOrdinaryTargetKeys)
        && scienceText(t.route) && scienceDigest(t.sha256) && scienceText(t.tag))
      || !Array.isArray(history.history)
      || !history.history.every(row => exactKeys(row, allowedHistoryRowKeys)
        && scienceText(row.address) && scienceText(row.rationale)
        && (!row.ordinary || (Array.isArray(row.ordinary) && row.ordinary.every(o => exactKeys(o, allowedOrdinaryBlockKeys)
          && scienceText(o.address) && scienceText(o.targetId) && scienceText(o.rationale)))))) {
    throw new Error('Future technology & scenarios comparison history envelope contains invalid keys');
  }
  if ((reviewed || unit.outputCapture != null) && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
      || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256))) {
    throw new Error('Future technology & scenarios comparison outputCapture envelope is invalid');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
          && scienceText(row.kind) && scienceText(row.date)
          && scienceText(row.artifactFile) && scienceDigest(row.artifactSha256)
          && scienceText(row.reportFile) && scienceDigest(row.reportSha256))) {
      throw new Error('Future technology & scenarios comparison reviewEvidence envelope is invalid');
    }
  }
}

export function selectFutureScenarios(config, pin = futureScenariosUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Invalid future technology & scenarios comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) throw new Error('Future technology & scenarios comparison cannot be downgraded to inactive');
    return null;
  }
  if (!plainObject(config.unit)) {
    throw new Error('Invalid future technology & scenarios comparison configuration');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Future technology & scenarios comparison is not independently accepted');
    if (Object.hasOwn(config.unit, 'reviewEvidence')) throw new Error('Preview future technology & scenarios comparison cannot carry reviewEvidence');
    assertUnitEnvelopeKeys(config.unit, false);
    return config.unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(config.unit) !== pin) {
    throw new Error('Future technology & scenarios comparison review pin does not match');
  }
  assertUnitEnvelopeKeys(config.unit, true);
  return config.unit;
}

const allowsRaw = (path, id) => (
  (path === 'claims' && addedClaimIds.includes(id))
  || (path === 'evidence' && addedEvidenceIds.includes(id))
  || (path === 'sources' && addedSourceIds.includes(id))
  || (path === 'readings' && addedReadingIds.includes(id))
  || (path === 'literature' && addedLiteratureIds.has(id))
);

function allowedRecordTransition(key, from, to) {
  const [family, ...rest] = key.split(':');
  const id = rest.join(':');
  if (family === 'claims') return addedClaimIds.includes(id) && from === null && to != null;
  if (family === 'evidence') return addedEvidenceIds.includes(id) && from === null && to != null;
  if (family === 'sources') return addedSourceIds.includes(id) && from === null && to != null;
  if (family === 'readings') return addedReadingIds.includes(id) && from === null && to != null;
  if (family === 'literature') return addedLiteratureIds.has(id) && from === null && to != null;
  if (family === 'researchMetadata') {
    return (id === 'public-projection' || id.startsWith('order:')) && from != null && to != null && !sameScienceValue(from, to);
  }
  return false;
}

function validateSourceTransitions(kind, declared, before, after) {
  const actual = new Map();
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const from = before[key] ?? null;
    const to = after[key] ?? null;
    if (!sameScienceValue(from, to)) actual.set(key, { from, to });
  }
  if (actual.size !== declared.size) {
    throw new Error(`Future technology & scenarios comparison ${kind} change count differs (${declared.size} vs ${actual.size})`);
  }
  for (const [key, pair] of actual) {
    const entry = declared.get(key);
    if (!entry || !sameScienceValue(entry.from, pair.from) || !sameScienceValue(entry.to, pair.to)) {
      throw new Error(`Future technology & scenarios comparison lacks exact ${kind} transition: ${key}`);
    }
  }
}

export function prepareFutureScenariosSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Future technology & scenarios comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && row.key === mdxPath && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Future technology & scenarios comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== 1
      || [...recordChanges.entries()].some(([key, row]) => !allowedRecordTransition(key, row.from, row.to))) {
    throw new Error('Future technology & scenarios comparison must bind only the single B31 MDX and declared record changes');
  }
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileChanges.get(mdxPath)?.from !== oldMdxSha || sha256(prevMdx ?? '') !== oldMdxSha) {
    throw new Error('Future technology & scenarios comparison lacks preserved predecessor bytes for B31 MDX');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1092) throw new Error('Future technology & scenarios comparison must hold exact 1,092 claims');
  validateFutureScenariosFactors(catalog, readings);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  files.set(mdxPath, Buffer.from(prevMdx));
  const previous = inspectReadableBookEdition({ ...previousRecords, files });
  const priorStructure = copyeditSourceStructure({ ...previousRecords, files });

  if (unit.state.before !== futureScenariosPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== futureScenariosPredecessorPin
      || unit.state.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Future technology & scenarios comparison did not recover the independently observed raw ac54b259 state');
  }

  validateSourceTransitions('file', fileChanges, previous.files, actual.files);
  validateSourceTransitions('record', recordChanges, previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const affectedClaimIds = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!sameScienceValue(unit.consumers.map(row => row.id), affectedClaimIds)) {
    throw new Error('Future technology & scenarios comparison consumer review set differs from actual dependent claims');
  }
  return { files, previousRecords, previous, structure: priorStructure, affectedClaimIds };
}

export function effectiveFutureScenarios(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    futureScenarios: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function futureScenariosLayout(unit, key, previous) {
  if (!unit) return previous;
  return previous;
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || !exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !scienceText(capture.identity.sourceCommit) || typeof capture.identity.dirty !== 'boolean'
      || !scienceText(capture.identity.status) || !scienceDigest(capture.identity.manifestSha256)
      || capture.manifestPaths !== 468
      || !Array.isArray(capture.files) || !capture.files.length
      || !capture.files.every(f => exactKeys(f, allowedCaptureFileKeys) && scienceText(f.path) && scienceDigest(f.sha256) && Number.isSafeInteger(f.bytes) && f.bytes >= 0)
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles) || !Array.isArray(capture.normalization.publicHtml)
      || !scienceDigest(futureScenariosCapturePin) || editionDigest(capture) !== futureScenariosCapturePin) {
    return false;
  }
  const identity = { ...capture.identity, normalizedProofSha256: editionDigest(capture.normalization) };
  if (!sameScienceValue(unit.outputCapture, identity) || !sameScienceValue(observations.capture, identity)
      || observations.sourceCommit !== identity.sourceCommit) return false;
  const articles = unit.outputs.map(({ path, route, sha256: digest }) => ({ path, route, sha256: digest }));
  const html = unit.publicArtifacts.filter(row => row.path.endsWith('.html')).map(({ path, sha256: digest }) => ({ path, sha256: digest }));
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

export function verifyFutureScenariosReceipts(unit, artifacts, publicDownloads) {
  try {
    assertUnitEnvelopeKeys(unit, true);
  } catch {
    return false;
  }
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${futureScenariosId}/${row.kind}`;
    if (row.date < futureScenariosCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function futureScenariosOrdinaryId(unit, route, print, index) {
  if (!unit || route !== futureScenariosRoute) return undefined;
  const slot = index === 0 ? 0 : index === 1 ? 1 : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-fut-161-ordinary-${slot}`;
}

export function futureScenariosHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-fut-161-ordinary-(?:[0-1]|table)$/;

export function observeFutureScenariosOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyFutureScenariosHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = observeFutureScenariosOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Future technology & scenarios comparison', routes: futureScenariosRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: futureScenariosHistoryControls(unit),
      source: futureScenariosSource,
      attribute: 'future-scenarios',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Future technology & scenarios comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Future technology & scenarios comparison actual versioned ordinary or table targets differ');
  }
  return { prior, errors };
}

export function futureScenariosPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreFutureScenariosTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
