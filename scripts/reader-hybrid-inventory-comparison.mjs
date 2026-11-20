import capture from '../config/reader-hybrid-inventory-comparison-capture.json' with { type: 'json' };
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

export const hybridInventoryComparisonId = 'hybrid-inventory-comparison-175';
export const hybridInventoryComparisonCheckDate = '2026-11-20';
export const hybridInventoryComparisonRoute = '/docs/book/inventory-boundary-and-hybrid';
export const hybridInventoryComparisonRoutes = Object.freeze([hybridInventoryComparisonRoute]);
/** @type {string|null} */
export const hybridInventoryComparisonUnitPin = '8f7e590eafdb3dd2717077f0887ecf6ef18d09f1457af874ce48e4c93ca4a991';
/** @type {string|null} */
export const hybridInventoryComparisonCapturePin = 'bc297c3c047d451efe6f338874c1d1b443cea9f15a22f87e6ff4efdc3d410d27';
export const hybridInventoryComparisonSource = Object.freeze({
  commit: '744b371af100522b0d0f51e41adaa82eb8943d30',
  tree: '16a834ffa01dc6bdb39f57fa07176aa85ccbe8b9',
  manifest: '145af444bc67507ff8e048dd21cf07f51dd3100fd45cdd5dfccaf831f51d5b16',
  date: '2026-11-20',
});
export const hybridInventoryComparisonPredecessorPin = 'd851b2b70ef3522e4216db445096bb7c4b8f9f3d7a97d329aa005d3ac1afeff3';
/** @type {string|null} */
const addressPin = '6484220eb5f25a541b4a8eca5f9da1bb69b746293630c7b2623829cbb01ed4f8';

const mdxPath = 'content/docs/book/inventory-boundary-and-hybrid.mdx';
const oldMdxSha = '64380def6514103aaa3eb2e108a2f49b5c6e56e4ff13520e87e9d540104358ae';

const addedClaimIds = Object.freeze([
  'cl-hyb175-shared-completeness-dilemma',
  'cl-hyb175-process-standards-cutoff-and-capital',
  'cl-hyb175-eeio-admission-and-hybrid-architectures',
  'cl-hyb175-double-counting-governance',
  'cl-hyb175-price-aggregation-and-denominator-comparability',
  'cl-hyb175-epistemic-limits',
]);
const addedEvidenceIds = Object.freeze([
  'ev-hyb175-ilcd-cutoff',
  'ev-hyb175-pef-cutoff',
  'ev-hyb175-ghgp-boundary-eeio',
  'ev-hyb175-ecoinvent-completeness',
]);
const updatedReadingIds = Object.freeze([
  'rd-ilcd-2010',
  'rd-kb44-ec2021',
  'rd-pfr151-ghgp-2011',
  'rd-dapp147-ecoinvent-v3-2013',
]);
const addedPassageMap = Object.freeze({
  'rd-ilcd-2010': 'psg-hyb175-ilcd-cutoff',
  'rd-kb44-ec2021': 'psg-hyb175-pef-cutoff',
  'rd-pfr151-ghgp-2011': 'psg-hyb175-ghgp-boundary-eeio',
  'rd-dapp147-ecoinvent-v3-2013': 'psg-hyb175-ecoinvent-completeness',
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

export function validateHybridInventoryFactors(catalog, readings) {
  const byEv = new Map((catalog.evidence ?? []).map(row => [row.id, row]));
  const byRd = new Map((readings.readings ?? []).map(row => [row.id, row]));
  const expectedFacts = [
    ['ev-hyb175-ilcd-cutoff', 'nf-hyb175-ilcd-cutoff-85', '85', '%'],
    ['ev-hyb175-ilcd-cutoff', 'nf-hyb175-ilcd-cutoff-95', '95', '%'],
    ['ev-hyb175-pef-cutoff', 'nf-hyb175-pef-ilcd-el-cap', '10', '%'],
    ['ev-hyb175-pef-cutoff', 'nf-hyb175-pef-cutoff-3pct', '3.0', '%'],
    ['ev-hyb175-ecoinvent-completeness', 'nf-hyb175-ecoinvent-yield-95', '95', '%'],
  ];
  for (const [evId, nfId, value, unit] of expectedFacts) {
    const ev = byEv.get(evId);
    if (!ev) throw new Error(`Hybrid inventory comparison missing evidence ${evId}`);
    const nf = (ev.numericFacts ?? []).find(x => x.id === nfId);
    if (!nf || nf.value !== value || nf.unit !== unit) {
      throw new Error(`Hybrid inventory comparison numeric fact mismatch: ${evId}/${nfId}`);
    }
  }
  for (const [rdId, psgId] of Object.entries(addedPassageMap)) {
    const rd = byRd.get(rdId);
    if (!rd || !(rd.passages ?? []).some(p => p.id === psgId)) {
      throw new Error(`Hybrid inventory comparison missing passage ${rdId}/${psgId}`);
    }
  }
}

function assertUnitEnvelopeKeys(unit, reviewed) {
  const expectedUnitKeys = reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys;
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !exactKeys(unit.state, allowedStateKeys)
      || !prevKeys || prevKeys.length !== 1 || prevKeys[0] !== mdxPath || !scienceText(unit.previousFiles[mdxPath])
      || !Array.isArray(unit.rawRecords) || !unit.rawRecords.every(r => exactKeys(r, allowedRawRecordKeys))
      || !Array.isArray(unit.rawFields) || !unit.rawFields.every(r => exactKeys(r, allowedRawFieldKeys))
      || !Array.isArray(unit.changes) || !unit.changes.every(r => exactKeys(r, allowedChangeKeys))
      || !Array.isArray(unit.consumers) || !unit.consumers.every(r => exactKeys(r, allowedConsumerKeys))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.previousAddresses) || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(t => exactKeys(t, allowedOrdinaryTargetKeys))
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(h => exactKeys(h, allowedHistoryRowKeys) && Array.isArray(h.ordinary)
        && h.ordinary.every(b => exactKeys(b, allowedOrdinaryBlockKeys)))
      || !Array.isArray(unit.outputs) || !unit.outputs.every(r => exactKeys(r, allowedOutputKeys))
      || !Array.isArray(unit.publicArtifacts) || !unit.publicArtifacts.every(r => exactKeys(r, allowedPublicArtifactKeys))
      || (reviewed
        ? !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
        : (unit.outputCapture !== null && !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)))) {
    throw new Error('Hybrid inventory comparison unit has invalid or extra keys');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(r => exactKeys(r, allowedReviewEvidenceKeys))) {
      throw new Error('Hybrid inventory comparison reviewEvidence has invalid or extra keys');
    }
  }
}

function validateHistoryMeta(history) {
  if (!plainObject(history) || !plainObject(history.previousAddresses) || !plainObject(history.currentAddresses)
      || !plainObject(history.ordinaryTargets) || !Array.isArray(history.history) || !history.history.length
      || !unique(history.history, row => row.address)) {
    throw new Error('Hybrid inventory comparison history metadata is malformed');
  }
  const expectedAddresses = new Set(history.history.map(row => row.address));
  const targetKeys = Object.keys(history.ordinaryTargets);
  if (!targetKeys.length) throw new Error('Hybrid inventory comparison history lacks ordinaryTargets');
  for (const row of history.history) {
    if (!scienceText(row.address) || !scienceText(row.from) || !scienceText(row.rationale)
        || !Array.isArray(row.ordinary)) {
      throw new Error(`Hybrid inventory comparison history row is invalid: ${row?.address}`);
    }
    for (const block of row.ordinary) {
      if (!scienceText(block.address) || !scienceText(block.targetId) || !scienceDigest(block.from)
          || !scienceDigest(block.to) || !scienceText(block.rationale)) {
        throw new Error(`Hybrid inventory comparison ordinary block is invalid: ${row.address}`);
      }
    }
  }
  if (![...expectedAddresses].every(addr => history.previousAddresses[addr] && history.currentAddresses[addr])) {
    throw new Error('Hybrid inventory comparison history addresses do not cover all declared rows');
  }
}

export function selectHybridInventoryComparison(config, pin = hybridInventoryComparisonUnitPin, preview = false) {
  if (!config || !exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Hybrid inventory comparison configuration is invalid');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Hybrid inventory comparison cannot be downgraded after acceptance');
    }
    return null;
  }
  const unit = config.unit;
  if (!unit || unit.id !== hybridInventoryComparisonId
      || !sameScienceValue(unit.source, hybridInventoryComparisonSource)
      || !sameScienceValue(unit.routes, hybridInventoryComparisonRoutes)
      || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.length || !unit.scope.every(scienceText)
      || !scienceDigest(unit.state?.before) || !scienceDigest(unit.state?.after)
      || !Array.isArray(unit.changes) || !unit.changes.length || !unique(unit.changes, row => `${row.kind}:${row.key}`)
      || !Array.isArray(unit.consumers) || !unique(unit.consumers, row => row.id)
      || !Array.isArray(unit.outputs) || !unique(unit.outputs, row => `${row.path}#${row.route}`)
      || !Array.isArray(unit.publicArtifacts) || !unique(unit.publicArtifacts, row => row.path)) {
    throw new Error('Hybrid inventory comparison configuration is malformed');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Hybrid inventory comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed') {
    throw new Error(`Unknown hybrid inventory comparison status: ${config.status}`);
  }
  if (!unit.outputs.length || !unit.publicArtifacts.length) {
    throw new Error('Hybrid inventory comparison reviewed unit requires non-empty outputs and publicArtifacts');
  }
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Hybrid inventory comparison unit pin does not match');
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
  `file:${mdxPath}`,
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

export function prepareHybridInventoryComparisonSource(unit, input, actual, structure) {
  if (!unit) return null;
  validateHybridInventoryFactors(input.catalog, input.readings);
  const currentState = editionDigest({ ...actual, structure });
  if (currentState !== unit.state.after) {
    throw new Error('Hybrid inventory comparison actual source state differs from the qualified candidate');
  }
  if (unit.state.before !== hybridInventoryComparisonPredecessorPin) {
    throw new Error('Hybrid inventory comparison predecessor state pin does not match exact 744b371af');
  }
  if (unit.rawFields.length !== 0) {
    throw new Error('Hybrid inventory comparison forbids rawFields edits');
  }
  const b09Text = input.files.get(mdxPath)?.toString('utf8') ?? '';
  const h2Count = (b09Text.match(/^## /gm) ?? []).length;
  if (h2Count !== 3) throw new Error(`B09 must retain exactly 3 H2 sections, found ${h2Count}`);
  const recordChanges = new Map();
  for (const row of unit.rawRecords) {
    if (!allowedRawRecordPaths.has(`${row.path}:${row.id}`)) {
      throw new Error(`Hybrid inventory comparison rawRecord outside bounded scope: ${row.path}:${row.id}`);
    }
  }
  for (const row of unit.changes) {
    if (!allowedChangeKeysSet.has(`${row.kind}:${row.key}`)) {
      throw new Error(`Hybrid inventory comparison change outside bounded scope: ${row.kind}:${row.key}`);
    }
    if (row.kind === 'record') recordChanges.set(row.key, row);
  }
  const expectedMdx = unit.previousFiles[mdxPath];
  if (sha256(expectedMdx) !== oldMdxSha) {
    throw new Error('Hybrid inventory comparison previous B09 MDX does not match exact 744b371af bytes');
  }
  const files = new Map(input.files);
  files.set(mdxPath, Buffer.from(expectedMdx));
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
  if (previousState !== hybridInventoryComparisonPredecessorPin) {
    throw new Error('Hybrid inventory comparison did not recover the independently observed raw 744b371af state');
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
        throw new Error(`Hybrid inventory comparison lacks its exact candidate transition: ${kind}:${key}`);
      }
      declared.delete(`${kind}:${key}`);
    }
  }
  if (declared.size) {
    throw new Error(`Hybrid inventory comparison declared unchanged transition: ${declared.keys().next().value}`);
  }
  const affectedClaimIds = [
    ...addedClaimIds,
    ...expectedConsumers,
    ...unit.consumers.map(c => c.id),
  ];
  return {
    previous,
    structure: previousStructure,
    files,
    previousRecords,
    affectedClaimIds: [...new Set(affectedClaimIds)],
  };
}

export function effectiveHybridInventoryComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    hybridInventoryComparison: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export const hybridInventoryComparisonTable = Object.freeze({
  section: '误差来源',
  previousClaim: 'cl-hyb175-price-aggregation-and-denominator-comparability',
  nextClaim: 'cl-hyb175-epistemic-limits',
  headers: [
    '体系与公开原件',
    '截断与完备性规则',
    '资本品与采购服务边界',
    'EEIO / 混合补缺与防重叠',
    '跨研究可比性门槛',
  ],
  rows: [
    [
      'ILCD 2010（§6.6.2–6.6.3、第 6.6 节规定）',
      '承认 100% 总量不可知；按影响覆盖度设截断（如 85% / 95%）并公开排除清单',
      '原则上纳入资本品及清洁、法律、营销、办公等外购服务，除非证明不显著',
      '无 EEIO / 混合补缺条款；依赖过程边界迭代闭合',
      '须披露排除清单与覆盖度基线，截断过大限制可比性',
    ],
    [
      '欧盟 PEF（2021/2279 附件一 §§4.1, 4.4.4, 4.6.3–4.6.4）',
      '筛查禁止截断；正式研究累计截断上限 3.0%（物质、能量与环境显著性）',
      '资本品及其生命末期默认排除，除非既往研究证明显著',
      '无 EEIO 路径；ILCD-EL 替代上限 10%，缺数须经核查排除',
      '高度统一的过程口径，但默认不含资本品与宏观服务尾项',
    ],
    [
      'GHG Protocol 产品标准（2011 第 7 章、§8.3.4、框 8.2）',
      '归属过程仅在缺数、无替代且估算低于披露阈值时可排除',
      '资本品、管理能耗及研发/行政/营销属可选非归属过程，纳入须披露',
      '允许财务数据配 EEIO 因子做筛查与上游估算；人工核清因子覆盖防重叠',
      '非归属项可选且仅含温室气体，跨研究须对齐边界与因子类型',
    ],
    [
      'ecoinvent v3 导则（2013 §4.11、§5.10、§6.1–6.4）',
      '声明无严格定量截断、不截断回收；缺数以合理估计及 95% 默认收率补足',
      '按寿命与产能显式建模资本品，并尽量纳入无直接付费的物理因果',
      '建有单元过程货币平衡，但主体为纯物理单元过程网络',
      '无宏观部门闭合，受限于已建单元过程覆盖度',
    ],
    [
      '混合清单框架（Suh 2004；Agez 2019/2020；Jakobs 2021）',
      '用经济投入产出表闭合上游截断，但引入部门聚合与价格换算误差',
      '通过货币采购自然覆盖外购服务与资本品上游（取决于投入产出表口径）',
      '分层 / IO 型 / 集成混合；须显式扣除重叠（账户扣除、二元修正、BPC、STAM）',
      '须同口径交代价格基、部门分辨率、扣除规则与分母口径',
    ],
  ],
});

export function hybridInventoryComparisonLayout(unit, key, previous) {
  if (!unit) return previous;
  if (key === 'B09:comparison-table') return hybridInventoryComparisonTable;
  if (!previous) return previous;
  if (key === 'B09:occurrences' && Array.isArray(previous)) {
    const idx = previous.findIndex(item => item?.id === 'cl-inv-judgement');
    if (idx >= 0) {
      const additions = addedClaimIds.map(id => ({ id, section: '误差来源' }));
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
      || !scienceDigest(hybridInventoryComparisonCapturePin) || editionDigest(capture) !== hybridInventoryComparisonCapturePin) {
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

export function verifyHybridInventoryComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${hybridInventoryComparisonId}/${row.kind}`;
    if (row.date < hybridInventoryComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function hybridInventoryComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== hybridInventoryComparisonRoute) return undefined;
  const slot = (Number.isInteger(index) && index >= 0 && index <= 2) ? index : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-hyb-175-ordinary-${slot}`;
}

export function hybridInventoryComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-hyb-175-ordinary-(?:[0-2]|table)$/;

export function observeHybridInventoryComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyHybridInventoryComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const targets = projectScientificOrdinaryTargets(
    null,
    observeHybridInventoryComparisonOrdinaryTargets(documents),
    'Hybrid inventory comparison',
    new Set(),
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Hybrid inventory comparison', routes: hybridInventoryComparisonRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: hybridInventoryComparisonHistoryControls(unit),
      source: hybridInventoryComparisonSource,
      attribute: 'hybrid-inventory-comparison',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Hybrid inventory comparison',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Hybrid inventory comparison actual versioned table target differs');
  }
  return { prior, errors };
}

export function hybridInventoryComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreHybridInventoryComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
