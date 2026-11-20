import capture from '../config/reader-market-response-comparison-capture.json' with { type: 'json' };
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

export const marketResponseComparisonId = 'market-response-comparison-169';
export const marketResponseComparisonCheckDate = '2026-11-20';
export const marketResponseComparisonRoute = '/docs/book/market-boundaries-and-response';
export const marketResponseComparisonRoutes = Object.freeze([marketResponseComparisonRoute]);
/** @type {string|null} */
export const marketResponseComparisonUnitPin = 'fa8bf6b66fe7e466db8a71ffb8505c9d9794f52b4c85b3c3b8915ee3536831b8';
/** @type {string|null} */
export const marketResponseComparisonCapturePin = '24f7092f0b2bcf14c5c0a337bf22b9d1251cea8bbb86ee1c97f9590be04e37a2';
export const marketResponseComparisonSource = Object.freeze({
  commit: '8949778f8a2cc9a78c3bff879c6686026c6e1857',
  tree: '7296c7295ce9640db9dd7298508d11b621b40057',
  manifest: 'ab60a77b2748b1226aabda9da0b4f916d6f35b6afa5cc9d349e5c08f9463ac52',
  date: '2026-11-20',
});
export const marketResponseComparisonPredecessorPin = 'c0487ece5cbafb4f4ab1440797ebfe023c86240d1e87cafe715dd2766b2d6e55';
const addressPin = '6bf24b2b7b7ad21114d2862614d17f899232eaeea31b6aa3d2c2df3ab289abb0';

const mdxPath = 'content/docs/book/market-boundaries-and-response.mdx';
const oldMdxSha = 'a91845e08f5ca445fca0283ca0c42e7ba908d36f986325047a84491ec2715f05';

const addedClaimIds = Object.freeze([
  'cl-mkt169-shared-questions',
  'cl-mkt169-conditional-convergence',
  'cl-mkt169-context-and-scale',
  'cl-mkt169-electricity-mix-regimes',
  'cl-mkt169-coproduct-substitution',
  'cl-mkt169-ranking-inversions',
  'cl-mkt169-epistemic-limits',
]);
const addedEvidenceIds = Object.freeze([
  'ev-mkt169-ilcd-contexts',
  'ev-mkt169-ecoinvent-consequential',
  'ev-mkt169-pef-electricity',
  'ev-mkt169-ghgp-attributional-allocation',
]);
const updatedReadingIds = Object.freeze([
  'rd-ilcd-2010',
  'rd-dapp147-ecoinvent-v3-2013',
  'rd-kb44-ec2021',
  'rd-pfr151-ghgp-2011',
]);
const addedPassageMap = Object.freeze({
  'rd-ilcd-2010': 'psg-mkt169-ilcd-contexts',
  'rd-dapp147-ecoinvent-v3-2013': 'psg-mkt169-ecoinvent-consequential',
  'rd-kb44-ec2021': 'psg-mkt169-pef-electricity',
  'rd-pfr151-ghgp-2011': 'psg-mkt169-ghgp-attributional-allocation',
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

export function validateMarketResponseFactors(catalog, readings) {
  const byEv = new Map((catalog.evidence ?? []).map(row => [row.id, row]));
  const byRd = new Map((readings.readings ?? []).map(row => [row.id, row]));
  const expectedFacts = [
    ['ev-mkt169-ilcd-contexts', 'nf-mkt169-ilcd-b-percentile', '90', '%'],
    ['ev-mkt169-ecoinvent-consequential', 'nf-mkt169-ecoinvent-lifetime', '30', '年'],
    ['ev-mkt169-ecoinvent-consequential', 'nf-mkt169-ecoinvent-replacement-rate', '3.33', '%/年'],
    ['ev-mkt169-pef-electricity', 'nf-mkt169-pef-untracked-threshold', '95', '%'],
    ['ev-mkt169-ghgp-attributional-allocation', 'nf-mkt169-ghgp-pulp-net', '950', 'kg GHG'],
  ];
  for (const [evId, nfId, value, unit] of expectedFacts) {
    const ev = byEv.get(evId);
    if (!ev) throw new Error(`Market response comparison missing evidence ${evId}`);
    const nf = (ev.numericFacts ?? []).find(x => x.id === nfId);
    if (!nf || nf.value !== value || nf.unit !== unit) {
      throw new Error(`Market response comparison numeric fact mismatch: ${evId}/${nfId}`);
    }
  }
  for (const [rdId, psgId] of Object.entries(addedPassageMap)) {
    const rd = byRd.get(rdId);
    if (!rd || !(rd.passages ?? []).some(p => p.id === psgId)) {
      throw new Error(`Market response comparison missing passage ${rdId}/${psgId}`);
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
    throw new Error('Market response comparison unit envelope contains invalid or extra keys');
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
    throw new Error('Market response comparison history envelope contains invalid keys');
  }
  if ((reviewed || unit.outputCapture != null) && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !/^[a-f0-9]{40}$/.test(unit.outputCapture.sourceCommit ?? '') || typeof unit.outputCapture.dirty !== 'boolean'
      || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256))) {
    throw new Error('Market response comparison outputCapture envelope is invalid');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
          && scienceText(row.kind) && scienceText(row.date)
          && scienceText(row.artifactFile) && scienceDigest(row.artifactSha256)
          && scienceText(row.reportFile) && scienceDigest(row.reportSha256))) {
      throw new Error('Market response comparison reviewEvidence envelope is invalid');
    }
  }
}

export function selectMarketResponseComparison(config, pin = marketResponseComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Invalid market response comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) throw new Error('Market response comparison cannot be downgraded to inactive');
    return null;
  }
  if (!plainObject(config.unit)) {
    throw new Error('Invalid market response comparison configuration');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Market response comparison is not independently accepted');
    if (Object.hasOwn(config.unit, 'reviewEvidence')) throw new Error('Preview market response comparison cannot carry reviewEvidence');
    assertUnitEnvelopeKeys(config.unit, false);
    return config.unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(config.unit) !== pin) {
    throw new Error('Market response comparison review pin does not match');
  }
  assertUnitEnvelopeKeys(config.unit, true);
  return config.unit;
}

const allowsRaw = (path, id) => (
  (path === 'claims' && addedClaimIds.includes(id))
  || (path === 'evidence' && (addedEvidenceIds.includes(id) || id === 'ev-kb48-future-vandepaer2019-esm1-known-issues'))
  || (path === 'readings' && updatedReadingIds.includes(id))
);

function allowedRecordTransition(key, from, to) {
  const [family, ...rest] = key.split(':');
  const id = rest.join(':');
  if (family === 'claims') return addedClaimIds.includes(id) && from === null && to != null;
  if (family === 'evidence') {
    if (addedEvidenceIds.includes(id) && from === null && to != null) return true;
    return id === 'ev-kb48-future-vandepaer2019-esm1-known-issues'
      && from != null && to != null && from.raw === to.raw && from.public === null && to.public != null;
  }
  if (family === 'readings') return updatedReadingIds.includes(id) && from != null && to != null && !sameScienceValue(from, to);
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
    throw new Error(`Market response comparison ${kind} change count differs (${declared.size} vs ${actual.size})`);
  }
  for (const [key, pair] of actual) {
    const entry = declared.get(key);
    if (!entry || !sameScienceValue(entry.from, pair.from) || !sameScienceValue(entry.to, pair.to)) {
      throw new Error(`Market response comparison lacks exact ${kind} transition: ${key}`);
    }
  }
}

export function prepareMarketResponseComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Market response comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && row.key === mdxPath && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Market response comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== 1
      || [...recordChanges.entries()].some(([key, row]) => !allowedRecordTransition(key, row.from, row.to))) {
    throw new Error('Market response comparison must bind only the single B11 MDX and declared record changes');
  }
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileChanges.get(mdxPath)?.from !== oldMdxSha || sha256(prevMdx ?? '') !== oldMdxSha) {
    throw new Error('Market response comparison lacks preserved predecessor bytes for B11 MDX');
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1106) throw new Error('Market response comparison must hold exact 1,106 claims');
  validateMarketResponseFactors(catalog, readings);

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

  if (unit.state.before !== marketResponseComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== marketResponseComparisonPredecessorPin
      || unit.state.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Market response comparison did not recover the independently observed raw 8949778f state');
  }

  validateSourceTransitions('file', fileChanges, previous.files, actual.files);
  validateSourceTransitions('record', recordChanges, previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const affectedClaimIds = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!sameScienceValue(unit.consumers.map(row => row.id), affectedClaimIds)) {
    throw new Error('Market response comparison consumer review set differs from actual dependent claims');
  }
  return { files, previousRecords, previous, structure: priorStructure, affectedClaimIds };
}

export function effectiveMarketResponseComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    marketResponseComparison: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function marketResponseComparisonLayout(unit, key, previous) {
  if (!unit) return previous;
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
      || !scienceDigest(marketResponseComparisonCapturePin) || editionDigest(capture) !== marketResponseComparisonCapturePin) {
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

export function verifyMarketResponseComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${marketResponseComparisonId}/${row.kind}`;
    if (row.date < marketResponseComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function marketResponseComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== marketResponseComparisonRoute) return undefined;
  const slot = index === 0 ? 0 : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-mkt-169-ordinary-${slot}`;
}

export function marketResponseComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-mkt-169-ordinary-(?:0|table)$/;

export function observeMarketResponseComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyMarketResponseComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = projectScientificOrdinaryTargets(
    null,
    observeMarketResponseComparisonOrdinaryTargets(documents),
    'Market response comparison',
    new Set(),
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Market response comparison', routes: marketResponseComparisonRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: marketResponseComparisonHistoryControls(unit),
      source: marketResponseComparisonSource,
      attribute: 'market-response-comparison',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Market response comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Market response comparison actual versioned table target differs');
  }
  return { prior, errors };
}

export function marketResponseComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreMarketResponseComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
