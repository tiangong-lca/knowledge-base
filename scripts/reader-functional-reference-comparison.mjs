import capture from '../config/reader-functional-reference-comparison-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput,
} from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const functionalReferenceComparisonId = 'functional-reference-comparison-173';
export const functionalReferenceComparisonCheckDate = '2026-11-20';
export const functionalReferenceComparisonRoute = '/docs/book/service-and-reference';
export const functionalReferenceComparisonRoutes = Object.freeze([functionalReferenceComparisonRoute]);
/** @type {string|null} */
export const functionalReferenceComparisonUnitPin = '8a60a5ec56c1247b0d09a757de93a701e477feb2657cb08e0b089dec2432db55';
/** @type {string|null} */
export const functionalReferenceComparisonCapturePin = '466bb3b5ed7f45dd1cbdf0e50c546ad80e9651efc23286cf196ecbccd4ba0d30';
export const functionalReferenceComparisonSource = Object.freeze({
  commit: 'd4a7e98f2ef64d0af4e02e5e18c1f542a7620219',
  tree: 'f502e24e1f4dfe1e00a9e8fa5bdfc224c610e76a',
  manifest: '8726a879df2a5d2d672a04170dda5d909df6274a179999bf6b6b448220d0e416',
  date: '2026-11-20',
});
export const functionalReferenceComparisonPredecessorPin = 'e5f30fa847cb87d90b529c12fd5e0b02b6ce7861944800a9108c5e58c39de898';
/** @type {string|null} */
const addressPin = 'c8ae468f2b2de419a15315b888c73187367bbec390e36a977b002c059622b22b';

const mdxPath = 'content/docs/book/service-and-reference.mdx';
const oldMdxSha = 'bff3095f7f5432ab5637a8addd72eb77c1371f38376deae4f222824141d9da80';

const addedClaimIds = Object.freeze([
  'cl-fr173-shared-core',
  'cl-fr173-layer-split',
  'cl-fr173-intermediate-unit',
  'cl-fr173-conversion-and-attributes',
  'cl-fr173-comparability-gates',
  'cl-fr173-epistemic-limits',
]);
const addedEvidenceIds = Object.freeze([
  'ev-fr173-ilcd-fu',
  'ev-fr173-pef-fu',
  'ev-fr173-ghgp-fu',
  'ev-fr173-ecoinvent-refprod',
]);
const updatedReadingIds = Object.freeze([
  'rd-ilcd-2010',
  'rd-kb44-ec2021',
  'rd-pfr151-ghgp-2011',
  'rd-dapp147-ecoinvent-v3-2013',
]);
const addedPassageMap = Object.freeze({
  'rd-ilcd-2010': 'psg-fr173-ilcd-fu',
  'rd-kb44-ec2021': 'psg-fr173-pef-fu',
  'rd-pfr151-ghgp-2011': 'psg-fr173-ghgp-fu',
  'rd-dapp147-ecoinvent-v3-2013': 'psg-fr173-ecoinvent-refprod',
});

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

export function validateFunctionalReferenceFactors(catalog, readings) {
  const byEv = new Map((catalog.evidence ?? []).map(row => [row.id, row]));
  const byRd = new Map((readings.readings ?? []).map(row => [row.id, row]));
  const expectedFacts = [
    ['ev-fr173-ilcd-fu', 'nf-fr173-ilcd-paint-a', '6.5', 'l'],
    ['ev-fr173-ilcd-fu', 'nf-fr173-ilcd-paint-b', '3.8', 'l'],
    ['ev-fr173-pef-fu', 'nf-fr173-pef-paint-duration', '50', '年'],
    ['ev-fr173-pef-fu', 'nf-fr173-pef-paint-opacity', '98', '%'],
  ];
  for (const [evId, nfId, value, unit] of expectedFacts) {
    const ev = byEv.get(evId);
    if (!ev) throw new Error(`Functional reference comparison missing evidence ${evId}`);
    const nf = (ev.numericFacts ?? []).find(x => x.id === nfId);
    if (!nf || nf.value !== value || nf.unit !== unit) {
      throw new Error(`Functional reference comparison numeric fact mismatch: ${evId}/${nfId}`);
    }
  }
  for (const [rdId, psgId] of Object.entries(addedPassageMap)) {
    const rd = byRd.get(rdId);
    if (!rd || !(rd.passages ?? []).some(p => p.id === psgId)) {
      throw new Error(`Functional reference comparison missing passage ${rdId}/${psgId}`);
    }
  }
}

function assertUnitEnvelopeKeys(unit, reviewed) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !prevKeys || prevKeys.length !== 1 || prevKeys[0] !== mdxPath
      || typeof unit.previousFiles[mdxPath] !== 'string'
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
        && scienceText(row.path) && scienceText(row.route) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !Array.isArray(unit.publicArtifacts)
      || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys)
        && scienceText(row.path) && scienceDigest(row.from) && scienceDigest(row.sha256) && scienceText(row.rationale))
      || !plainObject(unit.history.previousAddresses) || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(row => exactKeys(row, allowedOrdinaryTargetKeys)
        && functionalReferenceComparisonRoutes.includes(row.route) && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(row => exactKeys(row, allowedHistoryRowKeys)
        && scienceDigest(row.from) && scienceText(row.rationale) && Array.isArray(row.ordinary)
        && row.ordinary.every(b => exactKeys(b, allowedOrdinaryBlockKeys)
          && scienceDigest(b.from) && scienceDigest(b.to) && scienceText(b.address) && scienceText(b.targetId) && scienceText(b.rationale)))
      || (reviewed
        ? !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
          || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
          || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
          || !scienceDigest(unit.outputCapture.normalizedProofSha256)
          || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
          || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
            && scienceText(row.kind) && scienceText(row.date) && scienceText(row.artifactFile)
            && scienceDigest(row.artifactSha256) && scienceText(row.reportFile) && scienceDigest(row.reportSha256))
        : unit.outputCapture !== null
          && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
            || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
            || !scienceText(unit.outputCapture.status)
            || !scienceDigest(unit.outputCapture.manifestSha256)
            || !scienceDigest(unit.outputCapture.normalizedProofSha256)))) {
    throw new Error('Functional reference comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectFunctionalReferenceComparison(config, pin = functionalReferenceComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid Functional reference comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive Functional reference comparison requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== functionalReferenceComparisonId || !scienceText(unit.rationale)) {
    throw new Error('Invalid Functional reference comparison unit identity');
  }
  if (!sameScienceValue(unit.source, functionalReferenceComparisonSource) || !sameScienceValue(unit.routes, functionalReferenceComparisonRoutes)) {
    throw new Error('Functional reference comparison source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Functional reference comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Functional reference comparison unit pin mismatch');
  }
  return unit;
}

const allowsRaw = (family, id, from) => (
  (family === 'claims' && from === null && addedClaimIds.includes(id))
  || (family === 'evidence' && from === null && addedEvidenceIds.includes(id))
  || (family === 'readings' && from !== null && updatedReadingIds.includes(id))
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Functional reference comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Functional reference comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Functional reference comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareFunctionalReferenceComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Functional reference comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && row.key === mdxPath && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Functional reference comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== 1) {
    throw new Error('Functional reference comparison must bind B06 MDX and only declared changes');
  }
  const prevText = unit.previousFiles[mdxPath];
  if (fileChanges.get(mdxPath)?.from !== oldMdxSha || sha256(prevText ?? '') !== oldMdxSha) {
    throw new Error('Functional reference comparison lacks preserved predecessor bytes for B06 MDX');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1112) {
    throw new Error('Functional reference comparison must produce exactly 1112 claims');
  }
  validateFunctionalReferenceFactors(catalog, readings);

  const b06Text = files.get(mdxPath).toString();
  const h2Count = (b06Text.match(/^## /gm) ?? []).length;
  if (h2Count !== 3) throw new Error(`B06 must retain exactly 3 H2 sections, found ${h2Count}`);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  files.set(mdxPath, Buffer.from(prevText));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== functionalReferenceComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== functionalReferenceComparisonPredecessorPin) {
    throw new Error('Functional reference comparison did not recover the independently observed raw d4a7e98f state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Functional reference comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Functional reference comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...addedClaimIds])],
  };
}

export function effectiveFunctionalReferenceComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    functionalReferenceComparison: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function functionalReferenceComparisonLayout(unit, key, previous) {
  if (!unit || !previous) return previous;
  if (key === 'B06:occurrences' && Array.isArray(previous)) {
    const idx = previous.findIndex(item => item?.id === 'cl-book-three-comparisons');
    if (idx >= 0) {
      const additions = addedClaimIds.map(id => ({ id, section: '比较条件' }));
      return [...previous.slice(0, idx + 1), ...additions, ...previous.slice(idx + 1)];
    }
  }
  return previous;
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || !exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !/^[a-f0-9]{40}$/.test(capture.identity.sourceCommit ?? '') || typeof capture.identity.dirty !== 'boolean'
      || !scienceText(capture.identity.status) || !scienceDigest(capture.identity.manifestSha256)
      || capture.manifestPaths !== 468
      || !Array.isArray(capture.files) || !capture.files.length
      || !unique(capture.files, f => f.path)
      || !capture.files.every(f => exactKeys(f, allowedCaptureFileKeys) && scienceText(f.path) && scienceDigest(f.sha256) && Number.isSafeInteger(f.bytes) && f.bytes >= 0)
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles) || !Array.isArray(capture.normalization.publicHtml)
      || !scienceDigest(functionalReferenceComparisonCapturePin) || editionDigest(capture) !== functionalReferenceComparisonCapturePin) {
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

export function verifyFunctionalReferenceComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${functionalReferenceComparisonId}/${row.kind}`;
    if (row.date < functionalReferenceComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function functionalReferenceComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== functionalReferenceComparisonRoute) return undefined;
  const slot = (Number.isInteger(index) && index >= 0 && index <= 3) ? index : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-fr-173-ordinary-${slot}`;
}

export function functionalReferenceComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-fr-173-ordinary-(?:[0-3]|table)$/;

export function observeFunctionalReferenceComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyFunctionalReferenceComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = projectScientificOrdinaryTargets(
    null,
    observeFunctionalReferenceComparisonOrdinaryTargets(documents),
    'Functional reference comparison',
    new Set(),
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Functional reference comparison', routes: functionalReferenceComparisonRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: functionalReferenceComparisonHistoryControls(unit),
      source: functionalReferenceComparisonSource,
      attribute: 'functional-reference-comparison',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Functional reference comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Functional reference comparison actual versioned table target differs');
  }
  return { prior, errors };
}

export function functionalReferenceComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreFunctionalReferenceComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
