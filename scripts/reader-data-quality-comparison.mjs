import capture from '../config/reader-data-quality-comparison-capture.json' with { type: 'json' };
import { collectChapterClaimOccurrences, chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
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
import {
  assertCleanDataQualityProse,
  dqpCarriers,
  requiredDqpClaims,
  requiredDqpPassages,
  validateDataQualityComparisonFactors,
} from './reader-data-quality-comparison-factors.mjs';

export const dataQualityComparisonId = 'data-quality-comparison-153';
export const dataQualityComparisonRoute = '/docs/book/data-quality-and-probability';
export const dataQualityComparisonRoutes = Object.freeze([dataQualityComparisonRoute]);
export const dataQualityComparisonCheckDate = '2026-11-19';
/** @type {string|null} */
export const dataQualityComparisonUnitPin = '969421bb00ee2b24740ab381d299b11b839dcc7f0eb756e6a3b7e4e829fcc0a4';
/** @type {string|null} */
export const dataQualityComparisonCapturePin = 'f2996fd3c5d5fcb0dc9db40aca4b354807558e795b30fa9dbc51fec40578aaac';
export const dataQualityComparisonSource = Object.freeze({
  commit: 'def232fadb9e0dd30da4418241d0a78a48f5674d',
  tree: '2d5c470f231aeed39746c7a5ee228530a0bbfbc5',
  manifest: '0686c9157812875f2c4b4af3050fe1cc33cf2e6283f7ad8acd3c7182ee55b701',
  date: '2026-11-19',
});
export const dataQualityComparisonPredecessorPin = 'cfd0c1c0cc5f0a7bd73f8489c65d534713364c270ad5ce4768da349bd6a36490';
const addressPin = '59a4cef62eecce5df4a94d4af0d5804a027a3de3afe4cad85c924129ae5dac84';

const oldFileShas = Object.freeze({
  'content/docs/book/data-quality-and-probability.mdx': 'b680113248c6f0865d66d9d9f11af74028e360cfc67acc3315d92ce0b5bad0cf',
});
const managedPaths = Object.keys(oldFileShas);
const addedClaimIds = Object.freeze(Object.keys(requiredDqpClaims));
const addedSourceIds = new Set(Object.values(dqpCarriers).map(c => c.sourceId));
const addedReadingIds = new Set(Object.values(dqpCarriers).map(c => c.readingId));
const addedEvidenceIds = new Set(Object.keys(requiredDqpPassages));
const addedClaimIdSet = new Set(addedClaimIds);
const updatedWorkBindings = Object.freeze({
  'work-dapp147-ecoinvent-v3-2013': 'src-dqp153-ecoinvent-v3-2013',
  'lit-n04': 'src-dqp153-eu-2021-2279-pef',
  'work-pfr151-ghgp-2011': 'src-dqp153-ghgp-2011',
});

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'previousFiles', 'occurrences',
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
  const occKeys = plainObject(unit?.occurrences) ? Object.keys(unit.occurrences) : null;
  if (!exactKeys(unit, expectedUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, k => k)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !prevKeys || prevKeys.length !== managedPaths.length
      || !prevKeys.every(k => Object.hasOwn(oldFileShas, k) && typeof unit.previousFiles[k] === 'string')
      || !occKeys || occKeys.length !== managedPaths.length
      || !occKeys.every(k => Object.hasOwn(oldFileShas, k) && Array.isArray(unit.occurrences[k]))
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
        && dataQualityComparisonRoutes.includes(row.route) && scienceDigest(row.sha256) && ['P', 'TABLE'].includes(row.tag))
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
    throw new Error('Data quality comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectDataQualityComparison(config, pin = dataQualityComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid data quality comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive data quality comparison requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== dataQualityComparisonId || !scienceText(unit.rationale)) {
    throw new Error('Invalid data quality comparison unit identity');
  }
  if (!sameScienceValue(unit.source, dataQualityComparisonSource) || !sameScienceValue(unit.routes, dataQualityComparisonRoutes)) {
    throw new Error('Data quality comparison source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Data quality comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Data quality comparison unit pin mismatch');
  }
  return unit;
}

const priorEvidenceLocatorUpdates = Object.freeze({
  'ev-ped-sampling-population': { from: 'pp267、273脚注7：§§3.1–3.2与总体口径', to: '第 3.1–3.2 节与总体口径，印 pp. 267、273 脚注 7' },
  'ev-ped-sampling-design': { from: 'pp268–269，§3.3及Tables1–2', to: '第 3.3 节及表 1–2，印 pp. 268–269' },
  'ev-unc-ciroth-scores': { from: 'May2012Version7.1报告§2、Figure1与Equation1上下文，印刷pp5–10，PDF零基索引4–9；p6、p8图像核对', to: '2012 年 5 月第 7.1 版报告第 2 节、图 1 与式 1 上下文，印 pp. 5–10' },
  'ev-unc-ciroth-calibration': { from: '2012报告§§4.4–4.5，印刷pp15–20，PDF零基索引14–19', to: '2012 年报告第 4.4–4.5 节，印 pp. 15–20' },
  'ev-unc-ciroth-empirical': { from: '2012报告§§5.2.2–5.3.2，印刷pp27–31，PDF零基索引26–30', to: '2012 年报告第 5.2.2–5.3.2 节，印 pp. 27–31' },
  'ev-ped-completeness-data': { from: 'pp72–73，Annex A§5', to: '2012 年报告附录 A 第 5 节，印 pp. 72–73' },
  'ev-ped-gsd-definition': { from: 'pp82–83，Annex B§2.2', to: '2012 年报告附录 B 第 2.2 节，印 pp. 82–83' },
  'ev-ped-journal-gsd': { from: 'p1343，§2.4', to: '第 2.4 节，印 p. 1343' },
  'ev-unc-ciroth-baseline': { from: '2012报告§8.3及延续，印刷pp52–53，PDF零基索引51–52', to: '2012 年报告第 8.3 节及续文，印 pp. 52–53' },
  'ev-unc-ciroth-summary': { from: '2012报告§§5.7、7与Table24，印刷pp48–49，PDF零基索引47–48；p49图像核对', to: '2012 年报告第 5.7、7 节与表 24，印 pp. 48–49' },
  'ev-ped-score-test-design': { from: 'ESM1无印刷页号，PDF1–3 Methods/TableS1', to: '补充材料 ESM1 Methods 与表 S1（无印刷页号，共 6 页第 1–3 页）' },
  'ev-ped-score-test-results': { from: 'ESM1 PDF2 Results及PDF4–6 FiguresS1–S2', to: '补充材料 ESM1 Results 及图 S1–S2（无印刷页号，共 6 页第 2、4–6 页）' },
  'ev-unc-ei-alongside': { from: 'PMC作者手稿HTML§2.4 Usage alongside quantitative uncertainty；非期刊页码定位', to: 'PMC 作者手稿第 2.4 节（Usage alongside quantitative uncertainty，无期刊页码）' },
  'ev-unc-ei-metadata': { from: 'PMC作者手稿HTML§§1.5–1.6、§2.1与Tables2–3及脚注；未使用期刊PDF页码', to: 'PMC 作者手稿第 1.5–1.6、2.1 节及表 2–3 与脚注（无期刊页码）' },
  'ev-unc-ei-reuse': { from: 'PMC作者手稿HTML§2.6与Table6、§3.1；非PDF定位', to: 'PMC 作者手稿第 2.6 节（表 6）与第 3.1 节（无期刊页码）' },
});

const expectedDescription =
  'description: 从柏林杯重调查看平均值的估计精度与杯重散布有何不同，再说明怎样用这批资料提出完整性因子，并比较 ecoinvent 谱系方差、欧盟 PEF 序数 DQR 门槛与 GHG Protocol 定性披露对质量评分的不同用法。';

const expectedTable2Mdx = `下表把四类代表性体系处理相近质量维度的核心机制放在同一口径下对照，方便区分“将评分转成概率方差”“以序数门槛控制准入”与“保持定性文字披露”三类不同设计。

| 体系与一手来源 | 评估维度与打分刻度 | 综合规则与概率转换 | 准入门槛或报告义务 | 关键假定与适用边界 |
| --- | --- | --- | --- | --- |
| ecoinvent 第三版专家谱系（Weidema 等 2013，表 10.4–10.5） | 5 项（可靠性、完整性、时间、地理、进一步技术）；1–5 级 | 转为对数尺度正态附加方差 σ²，与 1 项基础方差共 6 项线性相加 | 作为清单参数蒙特卡洛抽样输入，无统一总分准入闸门 | 假定附加误差零均值且相互独立；2013 年表仍属专家判断，不含模型不确定性与人为错误 |
| ecoinvent 实证校准谱系（Ciroth 等 2012/2016） | 同 5 项谱系维度（本章详析完整性与可靠性校准）；1–5 级 | 以实证子集与参照组散布比值校准几何标准差或方差系数 | 旨在替换专家系数，仍服务于对数正态概率分布构造 | 校准受限于有限样本与分组规则，仍依赖独立性与零偏差假定，无法自动消除系统偏差 |
| 欧盟 PEF 序数评级（建议 (EU) 2021/2279 附件一第 4.6.5 节） | 4 项打分（TeR、GeR、TiR、P，1–5 级）；完整性与方法一致性为不打分前提 | 四项等权算术平均得 DQR（式 19–20），划 5 档序数等级；全文 396 页均未设置概率转换 | 数据需求矩阵硬门槛：企业实测 DQR≤1.5、次级 DQR≤3.0、替代贡献≤10% | 衡量数据收集档次与合规准入，不代表参数随机方差大小，也不能替代不确定性分析 |
| GHG Protocol 产品标准（2011，第 8.3 节与第 10 章）及美国环保署框架 | 5 项（技术、时间、地理、完整性、可靠性）；4 档定性（很好/良好/尚可/差） | 无统一数值综合 DQR，也不强制转为概率分布；代表性元数据与定量误差分离 | 强制文字披露显著过程数据质量与定性不确定性来源；蒙特卡洛或泰勒展开为可选项 | 防止将方向性偏差与多维代表性欠缺压扁为单一区间宽度，但纯定性描述难直接跨报告自动比对 |`;

function boundedMdxTransform(prevMdx, actualMdx) {
  assertCleanDataQualityProse(actualMdx, managedPaths[0]);
  const expected = prevMdx
    .replace(
      'description: 从柏林杯重调查看平均值的估计精度与杯重散布有何不同，再说明怎样用这批资料提出完整性因子，以及用因子建立概率分布需要哪些假定。',
      expectedDescription,
    )
    .replace(
      '<Prose ids="cl-ped-ratio-rule cl-ped-ratio-example cl-ped-independent-product cl-ped-ratio-residual cl-ped-factor-conventions cl-unc-baseline cl-ped-inventory-assumptions cl-ped-inventory-combination cl-ped-inventory-interval cl-ped-inventory-center" />',
      '<Prose ids="cl-ped-ratio-rule cl-ped-ratio-example cl-ped-independent-product cl-ped-ratio-residual cl-ped-factor-conventions cl-unc-baseline cl-ped-inventory-assumptions cl-ped-inventory-combination cl-ped-inventory-interval cl-ped-inventory-center cl-dqp-ecoinvent-v3-variance cl-dqp-pef-ordinal-dqr" />',
    )
    .replace(
      '<Prose ids="cl-unc-table-conflict cl-ped-reliability-cv-trace cl-ped-score-test-design cl-ped-score-test-results cl-ped-three-tests cl-unc-alongside cl-unc-context cl-unc-synthesis" />',
      `<Prose ids="cl-unc-table-conflict cl-ped-reliability-cv-trace cl-ped-score-test-design cl-ped-score-test-results cl-ped-three-tests cl-unc-alongside cl-unc-context cl-unc-synthesis cl-dqp-ghgp-qualitative-dqi" />\n\n${expectedTable2Mdx}\n\n<Prose ids="cl-dqp-four-framework-synthesis cl-dqp-paywalled-iso-boundary cl-dqp-cross-chapter-bridge" />`,
    );
  if (`${expected.trimEnd()}\n` !== actualMdx) {
    throw new Error('Data quality comparison changed protected B27 MDX text or its scoped additions');
  }
}

const allowsRaw = (family, id, from) => (
  (family === 'sources' && from === null && addedSourceIds.has(id))
  || (family === 'evidence' && ((from === null && addedEvidenceIds.has(id)) || (from !== null && Object.hasOwn(priorEvidenceLocatorUpdates, id))))
  || (family === 'claims' && from === null && addedClaimIdSet.has(id))
  || (family === 'readings' && from === null && addedReadingIds.has(id))
  || (family === 'literature' && from !== null && Object.hasOwn(updatedWorkBindings, id))
  || (family === 'literatureGaps' && from === null && id === 'lit-gap-dqp153-paywalled-iso14044-dqr')
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Data quality comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Data quality comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Data quality comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareDataQualityComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Data quality comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Data quality comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Data quality comparison must bind B27 MDX source and only declared changes');
  }

  const mdxPath = managedPaths[0];
  const fileRow = fileChanges.get(mdxPath);
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileRow?.from !== oldFileShas[mdxPath] || sha256(prevMdx ?? '') !== oldFileShas[mdxPath]) {
    throw new Error('Data quality comparison lacks independently preserved predecessor B27 MDX bytes');
  }
  const actualMdx = files.get(mdxPath).toString();
  boundedMdxTransform(prevMdx, actualMdx);
  const occ = collectChapterClaimOccurrences(actualMdx);
  if (!sameScienceValue(unit.occurrences[mdxPath], actual.sourceOccurrences[mdxPath]) || occ.length !== 43) {
    throw new Error('Data quality comparison lacks exact 43 B27 claim occurrences');
  }
  if (!addedClaimIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Data quality comparison lacks exact record transitions for each new canonical claim');
  }

  const { catalog, readings, literature } = input;
  const prior = (col, id) => unit.rawRecords.find(r => r.path === col && r.id === id)?.from;
  for (const [id, spec] of Object.entries(priorEvidenceLocatorUpdates)) {
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Data quality comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [wid, sid] of Object.entries(updatedWorkBindings)) {
    const prevWork = prior('literature.records', wid);
    const curWork = literature.records.find(row => row.id === wid);
    if (!prevWork || !curWork || !sameScienceValue(curWork, { ...prevWork, catalogSourceIds: [...prevWork.catalogSourceIds, sid] })) {
      throw new Error(`Data quality comparison changed unauthorized field on prior literature work: ${wid}`);
    }
  }
  const litGap = literature.gaps.find(row => row.id === 'lit-gap-dqp153-paywalled-iso14044-dqr');
  if (!litGap) throw new Error('Missing Unit 153 literature gap');
  assertCleanDataQualityProse(litGap.description, 'lit-gap-dqp153.description');

  validateDataQualityComparisonFactors(catalog, readings);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  files.set(mdxPath, Buffer.from(prevMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== dataQualityComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== dataQualityComparisonPredecessorPin) {
    throw new Error('Data quality comparison did not recover the independently observed raw def232fa state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Data quality comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Data quality comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...addedClaimIds])],
  };
}

export function effectiveDataQualityComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    dataQualityComparison: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
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
      || !scienceDigest(dataQualityComparisonCapturePin) || editionDigest(capture) !== dataQualityComparisonCapturePin) {
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

export function verifyDataQualityComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${dataQualityComparisonId}/${row.kind}`;
    if (row.date < dataQualityComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function dataQualityComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== dataQualityComparisonRoute) return undefined;
  const slot = index === 0 ? 0 : index === 1 ? 1 : index === 'table' ? 2 : index === 2 ? 3 : null;
  if (slot === null) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-dqp-153-ordinary-${slot}`;
}

export function dataQualityComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-dqp-153-ordinary-[0-3]$/;
export function observeDataQualityComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyDataQualityComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeDataQualityComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Data quality comparison',
    routes: dataQualityComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: dataQualityComparisonHistoryControls(unit),
    source: dataQualityComparisonSource,
    attribute: 'data-quality-comparison',
    ordinaryPattern,
    ordinaryTags: ['P', 'TABLE'],
    label: 'Data quality comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Data quality comparison actual versioned ordinary targets differ');
  }
  return { prior, errors };
}

export function dataQualityComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreDataQualityComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}

const dqpTableIntro =
  '下表把四类代表性体系处理相近质量维度的核心机制放在同一口径下对照，方便区分“将评分转成概率方差”“以序数门槛控制准入”与“保持定性文字披露”三类不同设计。';

const dqpComparisonTable = Object.freeze({
  section: '评分的检验与适用',
  intro: dqpTableIntro,
  headers: ['体系与一手来源', '评估维度与打分刻度', '综合规则与概率转换', '准入门槛或报告义务', '关键假定与适用边界'],
  rows: [
    [
      'ecoinvent 第三版专家谱系（Weidema 等 2013，表 10.4–10.5）',
      '5 项（可靠性、完整性、时间、地理、进一步技术）；1–5 级',
      '转为对数尺度正态附加方差 σ²，与 1 项基础方差共 6 项线性相加',
      '作为清单参数蒙特卡洛抽样输入，无统一总分准入闸门',
      '假定附加误差零均值且相互独立；2013 年表仍属专家判断，不含模型不确定性与人为错误',
    ],
    [
      'ecoinvent 实证校准谱系（Ciroth 等 2012/2016）',
      '同 5 项谱系维度（本章详析完整性与可靠性校准）；1–5 级',
      '以实证子集与参照组散布比值校准几何标准差或方差系数',
      '旨在替换专家系数，仍服务于对数正态概率分布构造',
      '校准受限于有限样本与分组规则，仍依赖独立性与零偏差假定，无法自动消除系统偏差',
    ],
    [
      '欧盟 PEF 序数评级（建议 (EU) 2021/2279 附件一第 4.6.5 节）',
      '4 项打分（TeR、GeR、TiR、P，1–5 级）；完整性与方法一致性为不打分前提',
      '四项等权算术平均得 DQR（式 19–20），划 5 档序数等级；全文 396 页均未设置概率转换',
      '数据需求矩阵硬门槛：企业实测 DQR≤1.5、次级 DQR≤3.0、替代贡献≤10%',
      '衡量数据收集档次与合规准入，不代表参数随机方差大小，也不能替代不确定性分析',
    ],
    [
      'GHG Protocol 产品标准（2011，第 8.3 节与第 10 章）及美国环保署框架',
      '5 项（技术、时间、地理、完整性、可靠性）；4 档定性（很好/良好/尚可/差）',
      '无统一数值综合 DQR，也不强制转为概率分布；代表性元数据与定量误差分离',
      '强制文字披露显著过程数据质量与定性不确定性来源；蒙特卡洛或泰勒展开为可选项',
      '防止将方向性偏差与多维代表性欠缺压扁为单一区间宽度，但纯定性描述难直接跨报告自动比对',
    ],
  ],
});

export function dataQualityComparisonLayout(unit, key, previous) {
  if (!unit) return previous;
  if (key === 'B27:external-consumers') {
    return [...previous, ...addedClaimIds];
  }
  if (key === 'B27:reader-source') {
    const sections = previous.sections.map(sec => {
      if (sec.id === '概率模型与参数') {
        return { ...sec, claimIds: [...sec.claimIds, 'cl-dqp-ecoinvent-v3-variance', 'cl-dqp-pef-ordinal-dqr'] };
      }
      if (sec.id === '评分的检验与适用') {
        return {
          ...sec,
          claimIds: [
            ...sec.claimIds,
            'cl-dqp-ghgp-qualitative-dqi',
            'cl-dqp-four-framework-synthesis',
            'cl-dqp-paywalled-iso-boundary',
            'cl-dqp-cross-chapter-bridge',
          ],
        };
      }
      return sec;
    });
    return {
      ...previous,
      description: expectedDescription.replace(/^description:\s*/, ''),
      sections,
      comparisonTable: dqpComparisonTable,
    };
  }
  return previous;
}
