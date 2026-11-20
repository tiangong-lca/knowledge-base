import capture from '../config/reader-revisable-judgment-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
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

export const revisableJudgmentId = 'revisable-judgment-163';
export const revisableJudgmentCheckDate = '2026-11-19';
export const revisableJudgmentSources = Object.freeze([
  '/docs/book/connecting-objects-references-and-time',
  '/docs/book/from-connected-results-to-conditional-judgment',
  '/monograph/revisable-judgment',
]);
export const revisableJudgmentRoutes = Object.freeze([
  'book-revisable-judgment',
  '/docs/book/connecting-objects-references-and-time',
  '/docs/book/from-connected-results-to-conditional-judgment',
]);
/** @type {string|null} */
export const revisableJudgmentUnitPin = '91239937a7d79d4ae6acc81d14e86773972e9b92cfd95ab3bd5919edc919f202';
/** @type {string|null} */
export const revisableJudgmentCapturePin = 'cd75d30d0e6bf7287f46afbd5da3ccc42b9849996623583eefb490909b4fa679';
export const revisableJudgmentSource = Object.freeze({
  commit: 'cb2584d4354f6d8a5111155d658d3edafd80ec8a',
  tree: '1d3f6fab8829a1fb55ffbd9f50d3114c8dc7f3e4',
  manifest: '665d76cb8107d24c47a0ecfac292156b764454ff9183955d2efa009b764c798e',
  date: '2026-11-19',
});
export const revisableJudgmentPredecessorPin = '63fb719edbadaca5b4de26a3360ab1b68b19c00d275d0cdc773c27c295e130c7';
const addressPin = '58d6b49e643bea9174898da41e6f8297eb9ff3bb34e738d73725c9351b4a4d0f';

const mdxPaths = Object.freeze([
  'content/docs/book/connecting-objects-references-and-time.mdx',
  'content/docs/book/from-connected-results-to-conditional-judgment.mdx',
  'content/monograph/revisable-judgment.mdx',
]);
const oldMdxShas = Object.freeze({
  'content/docs/book/connecting-objects-references-and-time.mdx': '6420fcf83079a82ab7f73980d905a7cd30246e1f9ed0815f10ff9b43aae3bc4b',
  'content/docs/book/from-connected-results-to-conditional-judgment.mdx': 'd6d93874bacd8dc3d079e65d783d491f554ecc58d4df4241c1e21a374d8916cb',
  'content/monograph/revisable-judgment.mdx': '743e81e79a2d12fad580c66be7dc3923def57a2fe5b2b048b1b5e3926e928fd0',
});

const addedClaimIds = Object.freeze([
  'cl-rev163-lcia-pathway-and-packet-drift',
  'cl-rev163-circular-and-prospective-coupling',
  'cl-rev163-pedigree-dqr-and-sampling-limits',
  'cl-rev163-valuation-denominator-and-veto-limits',
  'cl-rev163-comparative-assertion-three-regimes',
  'cl-rev163-targeted-revision-routing',
  'cl-rev163-monograph-closing-boundary',
]);

const expectedTableIntro = '下表把全书七部最常遇到的七类新增证据或规则变更收束到同一张修订路由表中，便于在出现新数据时快速定位应重算的环节、保持不变的依据与不得越界的推论。';
const expectedRoutingTableHeaders = Object.freeze([
  '新增证据或变更类型',
  '受影响环节与主要主题',
  '应修订的命题类别',
  '保持不变的既有依据',
  '不得由此直接推论',
]);
const expectedRoutingTableRows = Object.freeze([
  [
    '服务性能、次级功能或真实使用行为变化（如基底准备、复用次数与内衬替代）',
    '功能单位、参考流与案例比较（服务与清单、墙面与购物袋案例）',
    '服务等效性、参考流数量、复用门槛与多指标优劣结论',
    '上游单品工艺物料平衡与各影响因子本身',
    '仅凭质量相等即等效，或假定消费者实际复用次数必然达标',
  ],
  [
    '工艺放大系数、前景—背景年份错位或循环分账参数变更',
    '系统边界、多功能分配与前瞻情景（循环足迹、未来技术与情景）',
    '工业放大清单、再生料归属方向与未来情景包络区间',
    '既有实测基准年清单与历史回望记录',
    '实验室热点等同商业化表现，或超结构软件即担保情景合理',
  ],
  [
    '背景数据库换版、剩余地区（RoW）市场重算或缺失流补全',
    '清单链接与数据适用性（流与交换、数据库适用性与版本边界）',
    '背景上游贡献、区域代表性偏差与缺失流补齐说明',
    '前景实测工艺输入输出与既定功能单位',
    '数据库换版导致的数值变化等同企业现场节能或增排',
  ],
  [
    '影响评价方法换版、因果截点调整或官方数据包勘误',
    '特征化模型与影响路径（矿产、化石、生物碳、酸化、富营养化、颗粒物、水、臭氧与毒性）',
    '类别归属、空间与时间窗因子值及受勘误影响的类别排序',
    '物理排放与资源开采清单（以自然单位计）',
    '影响分值变化源于物理排放变动，或旧版数据包勘误可忽略',
  ],
  [
    '归一化分母漂移、权重与货币估值立场或地球边界配额改变',
    '跨类汇总与价值判断（归一化与加权、本地化、社会评价、成本与地球边界）',
    '综合单分排序、补偿限度、社会底线否决与绝对合规判定',
    '归一化前的中点／终点物理与生态指标结果',
    '综合加权分值属于纯自然科学事实，或现金流成本可与生态损害直接相抵',
  ],
  [
    '实测抽样方差更新、谱系矩阵替代或数据质量等级变化',
    '不确定度与质量表征（变异与不确定度、质量评分与概率）',
    '置信区间、成对比较稳健性判定与数据质量评级披露',
    '确定性点估计公式结构与物理守恒关系',
    '谱系蒙特卡洛区间等同实测统计方差，或高 DQR 消除系统边界截断',
  ],
  [
    '产品足迹类别规则、法定核查要求或关键性审查范围变更',
    '制度边界与外部审查（产品足迹规则、墙面与购物袋审查体制）',
    '面向公众的比较性断言资格、性能分级与法定披露格式',
    '内部热点诊断、敏感度结构与物理改进方向',
    '某法域或导则审查通过即自动满足另一法域或国际标准原文要求',
  ],
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
  const prevKeys = plainObject(unit?.previousFiles) ? Object.keys(unit.previousFiles).sort() : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !prevKeys || !sameScienceValue(prevKeys, [...mdxPaths].sort())
      || mdxPaths.some(p => typeof unit.previousFiles[p] !== 'string')
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
    throw new Error('Revisable judgment synthesis unit envelope contains invalid or extra keys');
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
    throw new Error('Revisable judgment synthesis history envelope contains invalid keys');
  }
  if ((reviewed || unit.outputCapture != null) && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceText(unit.outputCapture.sourceCommit) || typeof unit.outputCapture.dirty !== 'boolean'
      || !scienceText(unit.outputCapture.status) || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256))) {
    throw new Error('Revisable judgment synthesis outputCapture envelope is invalid');
  }
  if (reviewed) {
    if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
        || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys)
          && scienceText(row.kind) && scienceText(row.date)
          && scienceText(row.artifactFile) && scienceDigest(row.artifactSha256)
          && scienceText(row.reportFile) && scienceDigest(row.reportSha256))) {
      throw new Error('Revisable judgment synthesis reviewEvidence envelope is invalid');
    }
  }
}

export function selectRevisableJudgment(config, pin = revisableJudgmentUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Invalid revisable judgment synthesis configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) throw new Error('Revisable judgment synthesis cannot be downgraded to inactive');
    return null;
  }
  if (!plainObject(config.unit)) {
    throw new Error('Invalid revisable judgment synthesis configuration');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Revisable judgment synthesis is not independently accepted');
    if (Object.hasOwn(config.unit, 'reviewEvidence')) throw new Error('Preview revisable judgment synthesis cannot carry reviewEvidence');
    assertUnitEnvelopeKeys(config.unit, false);
    return config.unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(config.unit) !== pin) {
    throw new Error('Revisable judgment synthesis review pin does not match');
  }
  assertUnitEnvelopeKeys(config.unit, true);
  return config.unit;
}

const allowsRaw = (path, id) => path === 'claims' && addedClaimIds.includes(id);

function allowedRecordTransition(key, from, to) {
  const [family, ...rest] = key.split(':');
  const id = rest.join(':');
  if (family === 'claims') return addedClaimIds.includes(id) && from === null && to != null;
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
    throw new Error(`Revisable judgment synthesis ${kind} change count differs (${declared.size} vs ${actual.size})`);
  }
  for (const [key, pair] of actual) {
    const entry = declared.get(key);
    if (!entry || !sameScienceValue(entry.from, pair.from) || !sameScienceValue(entry.to, pair.to)) {
      throw new Error(`Revisable judgment synthesis lacks exact ${kind} transition: ${key}`);
    }
  }
}

function assertW1W2B32Parity(files) {
  const w1 = collectChapterClaimOccurrences(files.get(mdxPaths[0]).toString());
  const w2 = collectChapterClaimOccurrences(files.get(mdxPaths[1]).toString());
  const b32 = collectChapterClaimOccurrences(files.get(mdxPaths[2]).toString());
  const w1Set = new Set(w1), w2Set = new Set(w2), b32Set = new Set(b32);
  if (w1.length !== 10 || w2.length !== 19 || b32.length !== 29
      || w1Set.size !== 10 || w2Set.size !== 19 || b32Set.size !== 29) {
    throw new Error(`Revisable judgment synthesis requires exact 10/19/29 unique claims across W1/W2/B32 (got ${w1.length}/${w2.length}/${b32.length})`);
  }
  if ([...w1Set].some(id => w2Set.has(id))) {
    throw new Error('Revisable judgment synthesis violates W1 ∩ W2 = ∅');
  }
  const union = new Set([...w1Set, ...w2Set]);
  if (union.size !== b32Set.size || [...union].some(id => !b32Set.has(id))) {
    throw new Error('Revisable judgment synthesis violates W1 ∪ W2 = B32');
  }
}

export function prepareRevisableJudgmentSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Revisable judgment synthesis lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && mdxPaths.includes(row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Revisable judgment synthesis cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== mdxPaths.length
      || [...recordChanges.entries()].some(([key, row]) => !allowedRecordTransition(key, row.from, row.to))) {
    throw new Error('Revisable judgment synthesis must bind only W1/W2/B32 MDX files and the 7 declared claim additions');
  }
  for (const p of mdxPaths) {
    const prev = unit.previousFiles[p];
    if (fileChanges.get(p)?.from !== oldMdxShas[p] || sha256(prev ?? '') !== oldMdxShas[p]) {
      throw new Error(`Revisable judgment synthesis lacks preserved predecessor bytes for ${p}`);
    }
  }

  const { catalog, readings, literature } = input;
  if (catalog.claims.length !== 1099) throw new Error('Revisable judgment synthesis must hold exact 1,099 claims');
  assertW1W2B32Parity(files);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  for (const p of mdxPaths) files.set(p, Buffer.from(unit.previousFiles[p]));
  const previous = inspectReadableBookEdition({ ...previousRecords, files });
  const priorStructure = copyeditSourceStructure({ ...previousRecords, files });

  if (unit.state.before !== revisableJudgmentPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== revisableJudgmentPredecessorPin
      || unit.state.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Revisable judgment synthesis did not recover the independently observed raw cb2584d4 state');
  }

  validateSourceTransitions('file', fileChanges, previous.files, actual.files);
  validateSourceTransitions('record', recordChanges, previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const affectedClaimIds = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!sameScienceValue(unit.consumers.map(row => row.id), affectedClaimIds)) {
    throw new Error('Revisable judgment synthesis consumer review set differs from actual dependent claims');
  }
  return { files, previousRecords, previous, structure: priorStructure, affectedClaimIds };
}

export function effectiveRevisableJudgment(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    revisableJudgment: unit,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function appendAfterSection(occurrences, sectionId, ids) {
  const out = [];
  let lastIdx = -1;
  occurrences.forEach((row, idx) => { if (row.section === sectionId) lastIdx = idx; });
  if (lastIdx === -1) throw new Error(`Missing section ${sectionId} in B32/W1/W2 layout`);
  occurrences.forEach((row, idx) => {
    out.push(row);
    if (idx === lastIdx) {
      for (const id of ids) out.push({ id, section: sectionId });
    }
  });
  return out;
}

export function revisableJudgmentLayout(unit, key, previous) {
  if (!unit || !previous) return previous;
  if (key === 'B17:reverse-concept-consumers' && Array.isArray(previous)) {
    return [...new Set([...previous, 'cl-rev163-lcia-pathway-and-packet-drift'])].sort();
  }
  if (key === 'B27:external-consumers' && Array.isArray(previous)) {
    return [...new Set([
      ...previous,
      'cl-rev163-pedigree-dqr-and-sampling-limits',
      'cl-rev163-targeted-revision-routing',
      'cl-rev163-monograph-closing-boundary',
    ])];
  }
  if (key === 'B32:/docs/book/connecting-objects-references-and-time:reader-source') {
    let occ = appendAfterSection(previous.occurrences, '先让连接两端各有所指', ['cl-rev163-lcia-pathway-and-packet-drift']);
    occ = appendAfterSection(occ, '再说明数量时间和用途的关系', ['cl-rev163-circular-and-prospective-coupling']);
    return { ...previous, occurrences: occ };
  }
  if (key === 'B32:/docs/book/from-connected-results-to-conditional-judgment:reader-source') {
    let occ = appendAfterSection(previous.occurrences, '先保留数值的来历与覆盖', ['cl-rev163-pedigree-dqr-and-sampling-limits']);
    occ = appendAfterSection(occ, '让判断审查和后续证据各有边界', [
      'cl-rev163-valuation-denominator-and-veto-limits',
      'cl-rev163-comparative-assertion-three-regimes',
    ]);
    occ = appendAfterSection(occ, 'history-and-revision', [
      'cl-rev163-targeted-revision-routing',
      'cl-rev163-monograph-closing-boundary',
    ]);
    return {
      source: {
        ...previous.source,
        ordinary: [...(previous.source.ordinary ?? []), { section: 'history-and-revision', text: expectedTableIntro, links: [] }],
        tables: [{ section: 'history-and-revision', headers: [...expectedRoutingTableHeaders], rows: expectedRoutingTableRows.map(r => [...r]) }],
      },
      occurrences: occ,
    };
  }
  if (key === 'B32:/monograph/revisable-judgment:reader-source') {
    let occ = appendAfterSection(previous.occurrences, '对象连接', ['cl-rev163-circular-and-prospective-coupling']);
    occ = appendAfterSection(occ, '覆盖状态', [
      'cl-rev163-lcia-pathway-and-packet-drift',
      'cl-rev163-pedigree-dqr-and-sampling-limits',
    ]);
    occ = appendAfterSection(occ, '判断理由', [
      'cl-rev163-valuation-denominator-and-veto-limits',
      'cl-rev163-comparative-assertion-three-regimes',
    ]);
    occ = appendAfterSection(occ, '历史与修订', [
      'cl-rev163-targeted-revision-routing',
      'cl-rev163-monograph-closing-boundary',
    ]);
    return {
      source: {
        ...previous.source,
        ordinary: [...(previous.source.ordinary ?? []), { section: '历史与修订', text: expectedTableIntro, links: [] }],
        tables: [{ section: '历史与修订', headers: [...expectedRoutingTableHeaders], rows: expectedRoutingTableRows.map(r => [...r]) }],
      },
      occurrences: occ,
    };
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
      || !scienceDigest(revisableJudgmentCapturePin) || editionDigest(capture) !== revisableJudgmentCapturePin) {
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

export function verifyRevisableJudgmentReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${revisableJudgmentId}/${row.kind}`;
    if (row.date < revisableJudgmentCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function revisableJudgmentOrdinaryId(unit, route, print, index) {
  if (!unit || !revisableJudgmentRoutes.includes(route)) return undefined;
  const slot = index === 0 ? 0 : index === 1 ? 1 : index === 2 ? 2 : index === 'table' ? 'table' : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-rev-163-ordinary-${slot}`;
}

export function revisableJudgmentHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-rev-163-ordinary-(?:[0-2]|table)$/;

export function observeRevisableJudgmentOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

const part7SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book/from-connected-results-to-conditional-judgment#${chapterAnchorPrefix('/docs/book/from-connected-results-to-conditional-judgment')}-rev-163-ordinary-table`,
  `/print#${printUnitAnchor('book-revisable-judgment')}-rev-163-ordinary-table`,
]));

export function qualifyRevisableJudgmentHistory(documents, unit, actual, part7Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  let successorOverrides = null;
  if (part7Reread) {
    const raw = part7Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part7SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Revisable judgment synthesis successor ordinaryOverrides violates the 2-key Part VII allowlist');
    successorOverrides = Object.fromEntries([...part7SuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }]));
  }
  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observeRevisableJudgmentOrdinaryTargets(documents),
    'Revisable judgment synthesis',
    part7SuccessorOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Revisable judgment synthesis', routes: revisableJudgmentRoutes, predecessorPin: addressPin,
  });
  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: revisableJudgmentHistoryControls(unit),
      source: revisableJudgmentSource,
      attribute: 'revisable-judgment',
      previousHistory: [],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Revisable judgment synthesis',
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
      ordinaryOverrides: successorOverrides,
    }),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Revisable judgment synthesis actual versioned ordinary or table targets differ');
  }
  return { prior, errors };
}

export function revisableJudgmentPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreRevisableJudgmentTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
