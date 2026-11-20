import capture from '../config/reader-framework-comparison-capture.json' with { type: 'json' };
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

export const frameworkComparisonId = 'framework-comparison-179';
export const frameworkComparisonCheckDate = '2026-11-20';
export const frameworkComparisonBookRoute = 'book-framework-responsibilities';
export const frameworkComparisonWebRoute = '/docs/book/framework-history';
export const frameworkComparisonRoutes = Object.freeze([
  frameworkComparisonBookRoute,
  frameworkComparisonWebRoute,
]);
/** @type {string|null} */
export const frameworkComparisonUnitPin = '9da5cebd61391d40ce391cadc90617160cde96dc268ff19740734f353af0cbba';
/** @type {string|null} */
export const frameworkComparisonCapturePin = 'be7dc0b2d762c1272647774ac6de2a02a5f32864c206e62f81d4cffafdf81d70';
export const frameworkComparisonSource = Object.freeze({
  commit: 'd4c9993b2ec2e395bba7a86ac6cb7213feccb183',
  tree: '293584bb0d6f8345e01f66d02cb08c19270e7fd1',
  manifest: '7f415a66ac26efea12a3e7bc78493b1a17fb1f4c529031eaee71cddc91d353f7',
  date: '2026-11-20',
});
export const frameworkComparisonPredecessorPin = '4aa126f5508263e0107cd6e6248b58a116af4a887a760925235721a32b0129c5';
const addressPin = '8ab0b4eda27a939671dbb6b150a7dcb0c988b7c046ff7bf0784c0794c6229e15';

const bookMdxPath = 'content/monograph/framework-responsibilities.mdx';
const webMdxPath = 'content/docs/book/framework-history.mdx';
const oldFileShas = Object.freeze({
  [bookMdxPath]: 'aede02111773a801ed0955d1f31fedd21fa3357ec3fb0a7f6ba86bf7d2ae5407',
  [webMdxPath]: '243dc8a672f1cb62be2257138372263500dcc95ff099abc22f26ec815833522a',
});

const addedClaimIds = Object.freeze([
  'cl-fw179-shared-phases',
  'cl-fw179-decision-gates',
  'cl-fw179-impact-weighting',
  'cl-fw179-review-assurance',
  'cl-fw179-method-choice-effects',
  'cl-fw179-epistemic-limits',
]);
const addedEvidenceIds = Object.freeze([
  'ev-fw179-cml-framework',
  'ev-fw179-ilcd-framework',
  'ev-fw179-pef-framework',
  'ev-fw179-ghgp-framework',
]);
const updatedReadingIds = Object.freeze([
  'rd-cml-2001-part2a',
  'rd-ilcd-2010',
  'rd-kb44-ec2021',
  'rd-pfr151-ghgp-2011',
]);
const addedPassageMap = Object.freeze({
  'rd-cml-2001-part2a': 'psg-fw179-cml-phases-weighting',
  'rd-ilcd-2010': 'psg-fw179-ilcd-situations-review',
  'rd-kb44-ec2021': 'psg-fw179-pef-method-gate',
  'rd-pfr151-ghgp-2011': 'psg-fw179-ghgp-steps-assurance',
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

export function validateFrameworkComparisonFactors(catalog, readings) {
  const byEv = new Map((catalog.evidence ?? []).map(row => [row.id, row]));
  const byRd = new Map((readings.readings ?? []).map(row => [row.id, row]));
  const expectedFacts = [
    ['ev-fw179-cml-framework', 'nf-fw179-cml-four-phases', '4', 'phases'],
    ['ev-fw179-cml-framework', 'nf-fw179-cml-five-chapters', '5', 'chapters'],
    ['ev-fw179-pef-framework', 'nf-fw179-pef-16-categories', '16', 'impact categories'],
    ['ev-fw179-ghgp-framework', 'nf-fw179-ghgp-three-parties', '3', 'parties'],
  ];
  for (const [evId, nfId, value, unit] of expectedFacts) {
    const ev = byEv.get(evId);
    if (!ev) throw new Error(`Framework comparison missing evidence ${evId}`);
    const nf = (ev.numericFacts ?? []).find(x => x.id === nfId);
    if (!nf || nf.value !== value || nf.unit !== unit) {
      throw new Error(`Framework comparison numeric fact mismatch: ${evId}/${nfId}`);
    }
  }
  for (const [rdId, psgId] of Object.entries(addedPassageMap)) {
    const rd = byRd.get(rdId);
    if (!rd || !(rd.passages ?? []).some(p => p.id === psgId)) {
      throw new Error(`Framework comparison missing passage ${rdId}/${psgId}`);
    }
  }
}

function assertUnitEnvelopeKeys(unit, reviewed) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles).sort() : null;
  const expectedPrevKeys = Object.keys(oldFileShas).sort();
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !exactKeys(unit.state, allowedStateKeys)
      || !prevKeys || prevKeys.length !== expectedPrevKeys.length
      || prevKeys.some((k, i) => k !== expectedPrevKeys[i] || typeof unit.previousFiles[k] !== 'string')
      || !Array.isArray(unit.rawRecords) || !unit.rawRecords.every(row => exactKeys(row, allowedRawRecordKeys))
      || !Array.isArray(unit.rawFields) || !unit.rawFields.every(row => exactKeys(row, allowedRawFieldKeys))
      || !Array.isArray(unit.changes) || !unit.changes.every(row => exactKeys(row, allowedChangeKeys))
      || !Array.isArray(unit.consumers) || !unit.consumers.every(row => exactKeys(row, allowedConsumerKeys))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(row => exactKeys(row, allowedOrdinaryTargetKeys))
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(row => exactKeys(row, allowedHistoryRowKeys)
        && Array.isArray(row.ordinary)
        && row.ordinary.every(block => exactKeys(block, allowedOrdinaryBlockKeys)))
      || !Array.isArray(unit.outputs) || !unit.outputs.every(row => exactKeys(row, allowedOutputKeys))
      || !Array.isArray(unit.publicArtifacts) || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys))
      || (unit.outputCapture !== null && !exactKeys(unit.outputCapture, allowedOutputCaptureKeys))
      || (reviewed && (!Array.isArray(unit.reviewEvidence)
        || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys))))) {
    throw new Error('Framework comparison unit contains invalid or extra keys');
  }
}

function validateHistoryMeta(history) {
  if (!plainObject(history) || !plainObject(history.previousAddresses) || !plainObject(history.currentAddresses)
      || !plainObject(history.ordinaryTargets) || !Array.isArray(history.history) || !history.history.length
      || !unique(history.history, row => row.address)) {
    throw new Error('Framework comparison history metadata is malformed');
  }
  for (const row of history.history) {
    if (!scienceText(row.address) || !scienceText(row.rationale) || !Array.isArray(row.ordinary)
        || !row.ordinary.every(block => scienceText(block.address) && scienceText(block.targetId)
          && scienceText(block.rationale) && (block.from === null || scienceDigest(block.from)) && scienceDigest(block.to))) {
      throw new Error(`Framework comparison history row is malformed: ${row?.address ?? 'unknown'}`);
    }
  }
  for (const [key, row] of Object.entries(history.ordinaryTargets)) {
    if (!scienceText(key) || !scienceText(row?.route) || !scienceDigest(row?.sha256)
        || !['P', 'TABLE'].includes(row?.tag)) {
      throw new Error(`Framework comparison ordinary target is malformed: ${key}`);
    }
  }
}

export function selectFrameworkComparison(config, pin = frameworkComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Framework comparison configuration is malformed');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Framework comparison cannot be downgraded after acceptance');
    }
    return null;
  }
  const unit = config.unit;
  if (!unit || unit.id !== frameworkComparisonId
      || !sameScienceValue(unit.source, frameworkComparisonSource)
      || !sameScienceValue(unit.routes, frameworkComparisonRoutes)
      || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.length || !unit.scope.every(scienceText)
      || !scienceDigest(unit.state?.before) || !scienceDigest(unit.state?.after)
      || !Array.isArray(unit.changes) || !unit.changes.length || !unique(unit.changes, row => `${row.kind}:${row.key}`)
      || !Array.isArray(unit.consumers) || !unique(unit.consumers, row => row.id)
      || !Array.isArray(unit.outputs) || !unique(unit.outputs, row => `${row.path}#${row.route}`)
      || !Array.isArray(unit.publicArtifacts) || !unique(unit.publicArtifacts, row => row.path)) {
    throw new Error('Framework comparison configuration is malformed');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Framework comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed') {
    throw new Error(`Unknown framework comparison status: ${config.status}`);
  }
  if (!unit.outputs.length || !unit.publicArtifacts.length) {
    throw new Error('Framework comparison reviewed unit requires non-empty outputs and publicArtifacts');
  }
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Framework comparison unit pin does not match');
  }
  assertUnitEnvelopeKeys(unit, true);
  validateHistoryMeta(unit.history);
  return unit;
}

const allowedRawRecordPaths = new Set([
  ...addedClaimIds.map(id => `catalog.claims:${id}`),
  ...addedEvidenceIds.map(id => `catalog.evidence:${id}`),
  ...updatedReadingIds.map(id => `readings.readings:${id}`),
]);
const allowedChangeKeysSet = new Set([
  `file:${bookMdxPath}`,
  `file:${webMdxPath}`,
  'record:researchMetadata:reading-ledger',
  'record:researchMetadata:order:claims',
  'record:researchMetadata:order:evidence',
  'record:researchMetadata:public-projection',
  ...addedClaimIds.map(id => `record:claims:${id}`),
  ...addedEvidenceIds.map(id => `record:evidence:${id}`),
  ...updatedReadingIds.map(id => `record:readings:${id}`),
]);

const allowsRaw = (family, id, from) => (
  (family === 'claims' && from === null && addedClaimIds.includes(id))
  || (family === 'evidence' && from === null && addedEvidenceIds.includes(id))
  || (family === 'readings' && from !== null && updatedReadingIds.includes(id))
);

export function prepareFrameworkComparisonSource(unit, input, actual, structure) {
  if (!unit) return null;
  validateFrameworkComparisonFactors(input.catalog, input.readings);
  const currentState = editionDigest({ ...actual, structure });
  if (currentState !== unit.state.after) {
    throw new Error('Framework comparison actual source state differs from the qualified candidate');
  }
  if (unit.state.before !== frameworkComparisonPredecessorPin) {
    throw new Error('Framework comparison predecessor state pin does not match exact d4c9993b');
  }
  if (unit.rawFields.length !== 0) {
    throw new Error('Framework comparison forbids rawFields edits');
  }
  const bookText = input.files.get(bookMdxPath)?.toString('utf8') ?? '';
  const bookH2Count = (bookText.match(/^## /gm) ?? []).length;
  if (bookH2Count !== 5) throw new Error(`B04 book must retain exactly 5 H2 sections, found ${bookH2Count}`);
  const webText = input.files.get(webMdxPath)?.toString('utf8') ?? '';
  const webH2Count = (webText.match(/^## /gm) ?? []).length;
  if (webH2Count !== 6) throw new Error(`B04-web1 must retain exactly 6 H2 sections, found ${webH2Count}`);

  const recordChanges = new Map();
  for (const row of unit.rawRecords) {
    if (!allowedRawRecordPaths.has(`${row.path}:${row.id}`)) {
      throw new Error(`Framework comparison rawRecord outside bounded scope: ${row.path}:${row.id}`);
    }
  }
  for (const row of unit.changes) {
    if (!allowedChangeKeysSet.has(`${row.kind}:${row.key}`)) {
      throw new Error(`Framework comparison change outside bounded scope: ${row.kind}:${row.key}`);
    }
    if (row.kind === 'record') recordChanges.set(row.key, row);
  }
  const files = new Map(input.files);
  for (const [p, expectedSha] of Object.entries(oldFileShas)) {
    const content = unit.previousFiles[p];
    if (typeof content !== 'string' || sha256(content) !== expectedSha) {
      throw new Error(`Framework comparison previous file does not match exact d4c9993b bytes: ${p}`);
    }
    files.set(p, Buffer.from(content));
  }
  const previousRecords = restoreScientificRecords(
    { catalog: input.catalog, readings: input.readings, literature: input.literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  const previousInput = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(previousInput);
  const previousStructure = copyeditSourceStructure(previousInput);
  const previousState = editionDigest({ ...previous, structure: previousStructure });
  if (previousState !== frameworkComparisonPredecessorPin) {
    throw new Error('Framework comparison did not recover the independently observed raw d4c9993b state');
  }
  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const expectedConsumers = observeFlowBoundaryChanges(previous, actual, seeds);
  const declared = new Map(unit.changes.map(row => [`${row.kind}:${row.key}`, row]));
  for (const kind of ['file', 'record']) {
    const beforeMap = kind === 'file' ? previous.files : previous.records;
    const afterMap = kind === 'file' ? actual.files : actual.records;
    for (const key of new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])) {
      const from = beforeMap[key] ?? null;
      const to = afterMap[key] ?? null;
      if (sameScienceValue(from, to)) continue;
      const expected = declared.get(`${kind}:${key}`);
      if (!expected || !sameScienceValue(from, expected.from) || !sameScienceValue(to, expected.to)) {
        throw new Error(`Framework comparison lacks its exact candidate transition: ${kind}:${key}`);
      }
      declared.delete(`${kind}:${key}`);
    }
  }
  if (declared.size) {
    throw new Error(`Framework comparison declared unchanged transition: ${declared.keys().next().value}`);
  }
  const affectedClaimIds = [
    ...addedClaimIds,
    ...expectedConsumers,
  ].sort();
  return {
    previous,
    previousInput,
    previousRecords,
    files,
    structure: previousStructure,
    affectedClaimIds,
    expectedConsumers,
  };
}

export function effectiveFrameworkComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    frameworkComparison: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
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
      || !scienceDigest(frameworkComparisonCapturePin) || editionDigest(capture) !== frameworkComparisonCapturePin) {
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

export function verifyFrameworkComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${frameworkComparisonId}/${row.kind}`;
    if (row.date < frameworkComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function frameworkComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || !frameworkComparisonRoutes.includes(route)) return undefined;
  const maxP = route === frameworkComparisonBookRoute ? 5 : 2;
  const slot = (Number.isInteger(index) && index >= 0 && index <= maxP) ? index : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-fw-179-ordinary-${slot}`;
}

export function frameworkComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-fw-179-ordinary-(?:[0-5]|table)$/;
const expectedTableHeader = [
  '对比维度',
  'CML 2001/2002（Part 2a 指南）',
  'ILCD 2010（详细指南）',
  '欧盟 PEF 2021（2021/2279 附件一）',
  'GHG Protocol 产品标准（2011）',
];
const expectedTableRowHeads = [
  '阶段与流程组织',
  '决策情景与比较断言门槛',
  '影响类别与加权规则',
  '解释检查与审验/鉴证治理',
];

export function observeFrameworkComparisonOrdinaryTargets(documents) {
  const targets = {};
  for (const [path, document] of documents) {
    for (const element of document.querySelectorAll('[id]')) {
      const id = element.getAttribute('id') ?? '';
      if (!ordinaryPattern.test(id)) continue;
      if (!['P', 'TABLE'].includes(element.tagName)) {
        throw new Error(`Framework comparison target ${path}#${id} must be P or TABLE`);
      }
      const route = path === '/print' ? frameworkComparisonBookRoute : path;
      targets[`${path}#${id}`] = { route, sha256: flowBoundaryOrdinaryDigest(element), tag: element.tagName };
    }
  }
  return targets;
}

export function validateFrameworkComparisonTables(documents) {
  const errors = [];
  for (const [path, selector] of [
    [frameworkComparisonWebRoute, 'article table'],
    ['/print', `#${printUnitAnchor(frameworkComparisonBookRoute)} table`],
  ]) {
    const doc = documents.get(path);
    if (!doc) continue;
    const tables = doc.querySelectorAll(selector);
    if (tables.length !== 1) {
      errors.push(`Framework comparison expected 1 comparison table on ${path}, found ${tables.length}`);
      continue;
    }
    const rows = tables[0].querySelectorAll('tr');
    if (rows.length !== 5) {
      errors.push(`Framework comparison table on ${path} expected 5 rows, found ${rows.length}`);
      continue;
    }
    const headers = rows[0].querySelectorAll('th,td').map(cell => cell.text.replace(/\s+/g, ' ').trim());
    if (!sameScienceValue(headers, expectedTableHeader)) {
      errors.push(`Framework comparison table header mismatch on ${path}`);
    }
    for (let i = 0; i < expectedTableRowHeads.length; i++) {
      const cells = rows[i + 1].querySelectorAll('th,td').map(cell => cell.text.replace(/\s+/g, ' ').trim());
      if (cells.length !== 5 || cells[0] !== expectedTableRowHeads[i]) {
        errors.push(`Framework comparison table row ${i + 1} mismatch on ${path}`);
      }
    }
  }
  return errors;
}

export function qualifyFrameworkComparisonHistory(documents, unit, actual, successorOverrides = null) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observeFrameworkComparisonOrdinaryTargets(documents),
    'Framework comparison',
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Framework comparison', routes: frameworkComparisonRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: frameworkComparisonHistoryControls(unit),
      source: frameworkComparisonSource,
      attribute: 'framework-comparison',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Framework comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validateFrameworkComparisonTables(documents),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Framework comparison actual versioned ordinary targets differ');
  }
  return { prior, errors };
}

export function frameworkComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreFrameworkComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [p, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(p, Buffer.from(content));
  }
  return files;
}
