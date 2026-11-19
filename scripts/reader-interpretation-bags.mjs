import capture from '../config/reader-interpretation-bags-capture.json' with { type: 'json' };
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
import { validateInterpretationBagsFactors } from './reader-interpretation-bags-factors.mjs';

export const interpretationBagsId = 'interpretation-bags-159';
export const interpretationBagsCheckDate = '2026-11-19';
export const interpretationBagsRoute = '/docs/book/interpretation-and-limits';
export const interpretationBagsRoutes = Object.freeze([interpretationBagsRoute]);
/** @type {string|null} */
export const interpretationBagsUnitPin = '8ee71ab71478304d3749ec82a24373e28dd51b9fba477933a39ce3d4fbc94ebf';
/** @type {string|null} */
export const interpretationBagsCapturePin = 'e34c480451f62a8fecb7f92f18646ce2e86af9560601008b206dfbccc634e104';
export const interpretationBagsSource = Object.freeze({
  commit: 'c5a257a04e38eb64aeb68c8f3fe7162c5c3f7e48',
  tree: 'bb3803f0521005937e5b21d8c86a0d0f80831c28',
  manifest: '3c2da9b9edf0e188bacd47779d8484a6b56159115c46f375edb89b951c421519',
  date: '2026-11-19',
});
export const interpretationBagsPredecessorPin = '376874b9338bae6805455e36386c6b31b3149c583df54804b49855a375f3ba47';
const addressPin = '516d825cb068a287b46b933205b6aaaaa14001f5c8d42f30b98027d6bd1e969d';

const mdxPath = 'content/docs/book/interpretation-and-limits.mdx';
const oldMdxSha = 'a5dfeb957c9565f7d7899708cb9bd51d413e6f5f21afa80631c64f4c59de712e';

const addedClaimIds = Object.freeze([
  'cl-int159-danish-epa-fu-eol',
  'cl-int159-danish-epa-multi-indicator',
  'cl-int159-ilcd-pef-interpretation-hotspots',
  'cl-int159-critical-review-governance',
  'cl-int159-limitations-and-paywalled-iso',
  'cl-int159-interpretation-synthesis-bridge',
]);
const addedEvidenceIds = Object.freeze([
  'ev-int159-danish-epa-fu-eol',
  'ev-int159-danish-epa-multi-indicator',
  'ev-int159-danish-epa-review-boundary',
  'ev-int159-ilcd-interpretation-checks',
  'ev-int159-ilcd-critical-review',
  'ev-int159-pef-interpretation-report',
]);
const addedSourceIds = Object.freeze([
  'src-int159-danish-epa-2018',
  'src-int159-ilcd-2010',
  'src-int159-eu-2021-2279-pef',
]);
const addedReadingIds = Object.freeze([
  'rd-int159-danish-epa-2018',
  'rd-int159-ilcd-2010',
  'rd-int159-eu-2021-2279-pef',
]);
const addedLiteratureIds = new Set(['work-int159-danish-epa-2018']);
const modifiedLiteratureIds = new Set(['lit-n03', 'lit-n04']);
const addedGapId = 'lit-gap-int159-paywalled-iso14044-14071-interpretation-review';

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
    throw new Error('Interpretation & shopping-bag comparison unit envelope contains invalid or extra keys');
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
    throw new Error('Interpretation & shopping-bag comparison history envelope contains invalid keys');
  }
  if ((reviewed || unit.outputCapture != null) && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
      || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256))) {
    throw new Error('Interpretation & shopping-bag comparison outputCapture envelope is invalid');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
          && scienceText(row.kind) && scienceText(row.date)
          && scienceText(row.artifactFile) && scienceDigest(row.artifactSha256)
          && scienceText(row.reportFile) && scienceDigest(row.reportSha256))) {
      throw new Error('Interpretation & shopping-bag comparison reviewEvidence envelope is invalid');
    }
  }
}

export function selectInterpretationBags(config, pin = interpretationBagsUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Invalid interpretation & shopping-bag comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) throw new Error('Interpretation & shopping-bag comparison cannot be downgraded to inactive');
    return null;
  }
  if (!plainObject(config.unit)) {
    throw new Error('Invalid interpretation & shopping-bag comparison configuration');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Interpretation & shopping-bag comparison is not independently accepted');
    if (Object.hasOwn(config.unit, 'reviewEvidence')) throw new Error('Preview interpretation & shopping-bag comparison cannot carry reviewEvidence');
    assertUnitEnvelopeKeys(config.unit, false);
    return config.unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(config.unit) !== pin) {
    throw new Error('Interpretation & shopping-bag comparison review pin does not match');
  }
  assertUnitEnvelopeKeys(config.unit, true);
  return config.unit;
}

const allowsRaw = (path, id) => (
  (path === 'claims' && addedClaimIds.includes(id))
  || (path === 'evidence' && addedEvidenceIds.includes(id))
  || (path === 'sources' && addedSourceIds.includes(id))
  || (path === 'readings' && addedReadingIds.includes(id))
  || (path === 'literature' && (addedLiteratureIds.has(id) || modifiedLiteratureIds.has(id)))
  || (path === 'literatureGaps' && id === addedGapId)
);

function allowedRecordTransition(key, from, to) {
  const [family, ...rest] = key.split(':');
  const id = rest.join(':');
  if (family === 'claims') return addedClaimIds.includes(id) && from === null && to != null;
  if (family === 'evidence') return addedEvidenceIds.includes(id) && from === null && to != null;
  if (family === 'sources') return addedSourceIds.includes(id) && from === null && to != null;
  if (family === 'readings') return addedReadingIds.includes(id) && from === null && to != null;
  if (family === 'literature') {
    if (addedLiteratureIds.has(id)) return from === null && to != null;
    return modifiedLiteratureIds.has(id) && from != null && to != null && !sameScienceValue(from, to);
  }
  if (family === 'literatureGaps') return id === addedGapId && from === null && to != null;
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
    throw new Error(`Interpretation & shopping-bag comparison ${kind} change count differs (${declared.size} vs ${actual.size})`);
  }
  for (const [key, pair] of actual) {
    const entry = declared.get(key);
    if (!entry || !sameScienceValue(entry.from, pair.from) || !sameScienceValue(entry.to, pair.to)) {
      throw new Error(`Interpretation & shopping-bag comparison lacks exact ${kind} transition: ${key}`);
    }
  }
}

export function prepareInterpretationBagsSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Interpretation & shopping-bag comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && row.key === mdxPath && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Interpretation & shopping-bag comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== 1
      || [...recordChanges.entries()].some(([key, row]) => !allowedRecordTransition(key, row.from, row.to))) {
    throw new Error('Interpretation & shopping-bag comparison must bind only the single B30 MDX and declared record changes');
  }
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileChanges.get(mdxPath)?.from !== oldMdxSha || sha256(prevMdx ?? '') !== oldMdxSha) {
    throw new Error('Interpretation & shopping-bag comparison lacks preserved predecessor bytes for B30 MDX');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1086) throw new Error('Interpretation & shopping-bag comparison must hold exact 1,086 claims');
  validateInterpretationBagsFactors(catalog, readings);

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

  if (unit.state.before !== interpretationBagsPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== interpretationBagsPredecessorPin
      || unit.state.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Interpretation & shopping-bag comparison did not recover the independently observed raw c5a257a0 state');
  }

  validateSourceTransitions('file', fileChanges, previous.files, actual.files);
  validateSourceTransitions('record', recordChanges, previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const affectedClaimIds = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!sameScienceValue(unit.consumers.map(row => row.id), affectedClaimIds)) {
    throw new Error('Interpretation & shopping-bag comparison consumer review set differs from actual dependent claims');
  }
  return { files, previousRecords, previous, structure: priorStructure, affectedClaimIds };
}

export function effectiveInterpretationBags(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    interpretationBags: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function interpretationBagsLayout(unit, key, previous) {
  if (!unit) return previous;
  if (key === 'B27:external-consumers') {
    return [
      ...previous,
      'cl-int159-critical-review-governance',
      'cl-int159-limitations-and-paywalled-iso',
      'cl-int159-interpretation-synthesis-bridge',
    ];
  }
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
      || !scienceDigest(interpretationBagsCapturePin) || editionDigest(capture) !== interpretationBagsCapturePin) {
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

export function verifyInterpretationBagsReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${interpretationBagsId}/${row.kind}`;
    if (row.date < interpretationBagsCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function interpretationBagsOrdinaryId(unit, route, print, index) {
  if (!unit || route !== interpretationBagsRoute) return undefined;
  const slot = index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : index === 3 ? 3 : index === 4 ? 4 : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-int-159-ordinary-${slot}`;
}

export function interpretationBagsHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-int-159-ordinary-(?:[0-4]|table)$/;

export function observeInterpretationBagsOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyInterpretationBagsHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = observeInterpretationBagsOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Interpretation & shopping-bag comparison', routes: interpretationBagsRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: interpretationBagsHistoryControls(unit),
      source: interpretationBagsSource,
      attribute: 'interpretation-bags',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Interpretation & shopping-bag comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Interpretation & shopping-bag comparison actual versioned ordinary or table targets differ');
  }
  return { prior, errors };
}

export function interpretationBagsPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreInterpretationBagsTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
