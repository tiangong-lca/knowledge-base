import capture from '../config/reader-uncertainty-comparison-capture.json' with { type: 'json' };
import { collectChapterClaimOccurrences, chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';
import {
  assertCleanUncertaintyProse,
  requiredUncClaims,
  requiredUncPassages,
  uncCarriers,
  validateUncertaintyComparisonFactors,
} from './reader-uncertainty-comparison-factors.mjs';

export const uncertaintyComparisonId = 'uncertainty-comparison-149';
export const uncertaintyComparisonRoute = '/docs/book/uncertainty-and-variability';
export const uncertaintyComparisonRoutes = Object.freeze([uncertaintyComparisonRoute]);
export const uncertaintyComparisonCheckDate = '2026-11-19';
/** @type {string|null} */
export const uncertaintyComparisonUnitPin = '61a21b40bef43e52f3a1b475e476fb04cb77bc28ae3a173742bf1455e40f97ad';
/** @type {string|null} */
export const uncertaintyComparisonCapturePin = '636656bdb1a005bbf9d50fb057d6ec8ef8c586e6a5a08be8ae2f4cb1d1edbb0c';
export const uncertaintyComparisonSource = Object.freeze({
  commit: '4bb508394ef2f6c671b1468d41a2b67c51296be6',
  tree: '325faeef973b6d5e14dbe7423a4f39f124c889a4',
  manifest: '4802c6b7ceabd6586399564136112751d1830a91e6c9062abb94b22632f0f937',
  date: '2026-11-19',
});
export const uncertaintyComparisonPredecessorPin = '7db50e1d25de5534578ba9ea5797cdaebc6eed3e908e27f4b49f46650fbc33ab';
const addressPin = '06f9729bdb4037727621c242c09d6d8e3f513822cc8d89805746e2d42d5163f5';

const oldFileShas = Object.freeze({
  'content/docs/book/uncertainty-and-variability.mdx': '6f1a6d85e6acc49212fdecbea1bf5ad26b360ad7b1dd22a0e0a3a2007ba0642b',
});
const managedPaths = Object.keys(oldFileShas);
const addedClaimIds = Object.freeze(Object.keys(requiredUncClaims));
const addedSourceIds = new Set([uncCarriers.heijungs2020.sourceId, uncCarriers.groen2017.sourceId]);
const addedReadingIds = new Set([uncCarriers.heijungs2020.readingId, uncCarriers.groen2017.readingId]);
const addedEvidenceIds = new Set(Object.keys(requiredUncPassages));
const addedClaimIdSet = new Set(addedClaimIds);
const addedWorkIds = Object.freeze([
  'work-unc149-heijungs-2020',
  'work-unc149-groen-2017',
]);
const addedWorkIdSet = new Set(addedWorkIds);

export const uncertaintyComparisonCorrections = Object.freeze([
  Object.freeze({
    chapter: uncertaintyComparisonRoute,
    claimId: 'cl-unc-sd-sem',
    noteIndex: 2,
    scope: '前版范围注保留英文简写“pp23–24”且引用定位符含原始节号与阅读器零基索引。现统一规范为中文“第 23—24 页”并清洁定位符，原五工厂正态抽样例与换算边界不变。',
  }),
  Object.freeze({
    chapter: uncertaintyComparisonRoute,
    claimId: 'cl-book-unc-bridge',
    noteIndex: 16,
    scope: '前版收束仅概括原三节与杯重过渡。现结合本章新增的固有变异与认识不确定性区分、ILCD 与欧盟产品环境足迹制度对照、一阶泰勒与随机全局灵敏度失效边界、比较差值协方差与蒙特卡洛样本量上限及谱系分布边界，扩展为五步核查收束并衔接第 27 章《质量评分与概率》。',
  }),
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));
const nonCommentChildren = node => (node?.childNodes ?? []).filter(child => child.nodeType !== 8);
const singleTextChild = (node, expected) => {
  const children = nonCommentChildren(node);
  return children.length === 1 && children[0].nodeType === 3 && children[0].text === expected;
};
const attrs = (node, ...allowed) => {
  const keys = Object.keys(node?.attributes ?? {}).map(k => k.toLowerCase());
  const expected = allowed.map(k => k.toLowerCase());
  return keys.length === expected.length && expected.every(k => keys.includes(k));
};

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'scope', 'state', 'previousFiles', 'occurrences',
  'rawRecords', 'rawFields', 'changes', 'consumers', 'corrections', 'history', 'outputs', 'publicArtifacts', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedRawFieldKeys = new Set(['path', 'from', 'to']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedCorrectionKeys = new Set(['chapter', 'claimId', 'noteIndex', 'scope']);
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
      || !Array.isArray(unit.corrections)
      || !unit.corrections.every(row => exactKeys(row, allowedCorrectionKeys)
        && row.chapter === uncertaintyComparisonRoute && scienceText(row.claimId)
        && Number.isSafeInteger(row.noteIndex) && row.noteIndex >= 0 && scienceText(row.scope))
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
        && uncertaintyComparisonRoutes.includes(row.route) && scienceDigest(row.sha256) && row.tag === 'P')
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
            || typeof unit.outputCapture.dirty !== 'boolean'
            || !scienceDigest(unit.outputCapture.manifestSha256)
            || !scienceDigest(unit.outputCapture.normalizedProofSha256)))) {
    throw new Error('Uncertainty comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectUncertaintyComparison(config, pin = uncertaintyComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Uncertainty comparison requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== uncertaintyComparisonId
      || !sameScienceValue(unit.source, uncertaintyComparisonSource)
      || !sameScienceValue(unit.routes, uncertaintyComparisonRoutes)
      || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)) {
    throw new Error('Uncertainty comparison requires an exact 4bb50839 predecessor and bounded B26 plan');
  }
  assertUnitEnvelopeKeys(unit, config.status === 'reviewed');
  if (!sameScienceValue(unit.corrections, uncertaintyComparisonCorrections)) {
    throw new Error('Uncertainty comparison corrections diverge from reviewed specification');
  }
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Uncertainty comparison is not independently accepted');
  }
  return unit;
}

const expectedTable1Mdx = [
  '| 误差或差异层次 | 本质与可缩减性 | 恰当数学或程序表达 | ILCD 2010 指南处理 | 欧盟建议书 2021/2279（PEF）处理 | 常见误用陷阱 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 固有变异（厂际、地域、时间） | 系统内在真实散布；不能靠增加抽样消除，须分区域／工艺／时段刻画 | 总体分布与标准差（SD）、子总体分层 | 区分来源变异与均值估计，按目标界定代表性 | 经技术、地域、时间代表性评分与细化活动数据反映 | 用均值标准误掩盖个体工厂或流域极端值 |',
  '| 参数认识不确定性 | 测量精度不足或资料缺口；可经补充实测与文献核查缩减 | 样本均值标准误（SEM）、概率密度函数与相关性 | 清单与影响层可配合蒙特卡洛计算并按图 26 优先改进 | 全篇无蒙特卡洛强制条款，折入数据质量评级精密度项 P | 以重复模拟替代缺失观测或把模拟次数当样本量 |',
  '| 模型结构不确定性 | 空间聚合、机制简化或边界遗漏；不能靠收窄参数分布补回，须改进结构 | 机制对照、高分辨率模型或结构残差分析 | 规定条款 I.a 明示计算不确定度常遗漏系统性偏差 | 第 6.2 节完整性与一致性稳健性检验配合边界规则 | 仅报告极窄参数误差棒却忽略流域或排放路径丢失 |',
  '| 方法与规范选择不确定性 | 功能单位、分配、特征化与赋权约定；属研究设定，不适用抽样缩减 | 离散情景分析与条件对照，默认不赋等概率 | 目标范围、多功能性与不同影响评价（LCIA）方法以情景并列检验 | 由统一产品规则与强制热点门槛锁定，第 6.2 节作敏感度检视 | 将两种规范情景当成随机抽样或混算均值与方差 |',
  '| 数值求解不稳定性 | 矩阵条件数、舍入与算法误差；独立于数据抽样，须靠数值算法诊断 | 矩阵病态（条件数）分析、算法稳健性与收敛诊断 | 与清单数据不确定性分属不同层次 | 依赖标准化参考包与合规工具校验，不替代算法分析 | 把矩阵病态导致的解跳变误归咎于原始工厂数据 |',
].join('\n');

const expectedTable2Mdx = [
  '| 方法类别 | 所需输入信息 | 计算代价 | 高离散度（cv = 30%）与偏斜表现 | 交互、离群值与相关性处理 | 合法支持的结论边界 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 局部单因子灵敏度（OAT／偏导数） | 仅基准点估计值 | 低（按参数逐一微扰） | 忽略各参数真实离散跨度，无法反映右偏均值上移 | 不能捕捉多参数同时变化的交互效应 | 仅用于初步识别基准点附近的边际斜率 |',
  '| 一阶泰勒关键议题分析（KIA） | 中心值与离散度（无需完整分布） | 1 次解析计算（Groen 等人 2017 表 3，最快） | 电力案例方差低估约 33%、白鱼低估约 20%，且漏掉均值上移 | 仅作一阶线性展开，不输出完整概率分布 | 仅适用于低离散度（如 cv = 5%）近似线性模型的快速筛查 |',
  '| 标准化回归平方（SRC） | 完整概率密度函数与随机样本 | N 次抽样运行（Groen 等人 2017 表 3） | 均值与方差贴近基准，但电力案例解释份额跌至 81.7% | 对右尾离群值敏感；常规实现假定输入无相关 | 适用于低至中等离散度、近似线性且离群值不突出的模型 |',
  '| 随机平衡设计（RBD） | 完整概率密度函数与分层样本 | N 次抽样运行（Groen 等人 2017 表 3，后处理快于 SRC） | 电力案例解释份额跌至 79.7%；白鱼 115 参数案例为 94.0% | 易受高离散度右尾影响且低贡献参数可能高估；假定输入无相关 | 适用于参数较多且需快速频域分解的探索性筛查 |',
  '| 斯皮尔曼秩相关平方（SCC） | 完整概率密度函数与随机样本 | N 次抽样运行（Groen 等人 2017 表 3，与 SRC 共用样本） | 电力案例解释 94.0%、白鱼 115 参数案例解释 94.5% | 秩变换显著抑制右尾离群值；仍假定输入无相关 | 适用于高离散度单调非线性模型的稳健主因排序 |',
  '| 索博尔一阶与总效应（Sobol SME／STE） | 完整概率密度函数与双样本矩阵 | 表 3 计作 2N 基础矩阵（含混合矩阵评估，最慢） | 电力案例 SME 91.6%、STE 110%，稳健捕捉 18.4 个百分点交互差额 | 可显式分离主效应与交互及非线性特征化效应 | 适用于高离散度、强交互或非线性中点／终点路径的深度诊断 |',
  '| 差值协方差蒙特卡洛＋样本量上限 | 含共享过程结构与真实样本量 n 的输入 | 随 N_run 线性增长（Heijungs 2020 第 1 节：单次 1 秒至 5 分钟） | 可保留真实分布形态，但大 N_run 会把均值标准误压至虚假极小 | 宜对两系统之差计入共享过程协方差；谱系分布缺真实样本量 | 仅可在区分模拟误差与实测样本量、且不把无显著差异当相等的前提下支持比较推断 |',
].join('\n');

const expectedDesc =
  '区分固有变异、认识不确定性与方法选择，跨体系对照国际参考生命周期数据系统（ILCD）与欧盟产品环境足迹（PEF）的不确定性与热点规则、一阶泰勒与随机全局灵敏度失效边界、蒙特卡洛次数陷阱及求解数值稳定性。';

const oldDesc =
  'description: 用工厂排放说明厂际差异与均值估计误差的区别，再看参数、模型选择和数值求解各怎样影响结果。';

function boundedMdxTransform(previousMdx, actualMdx) {
  if (!previousMdx.includes(oldDesc)) {
    throw new Error('Uncertainty comparison lacks the exact predecessor frontmatter description');
  }
  const expected = previousMdx
    .replace(oldDesc, () => `description: ${expectedDesc}`)
    .replace(
      '<Prose ids="cl-unc-types cl-unc-target cl-unc-sd-sem" />',
      () => '<Prose ids="cl-unc-types cl-unc-target cl-unc-sd-sem cl-unc149-variability-vs-epistemic" />',
    )
    .replace(
      '<Prose ids="cl-unc-parameters cl-unc-model cl-unc-choices cl-book-unc-separate" />',
      () =>
        '<Prose ids="cl-unc-parameters cl-unc-model cl-unc-choices cl-book-unc-separate cl-unc149-framework-comparison" />\n\n'
        + expectedTable1Mdx,
    )
    .replace(
      '<Prose ids="cl-unc-numerical cl-book-unc-bridge" />',
      () =>
        '<Prose ids="cl-unc149-local-vs-global-sa cl-unc149-taylor-vs-sampling cl-unc149-gsa-outliers-nonlinearity cl-unc149-mc-runs-precision-vs-accuracy cl-unc149-comparative-paired-and-pvalue cl-unc149-pedigree-mc-boundary" />\n\n'
        + `${expectedTable2Mdx}\n\n`
        + '<Prose ids="cl-unc-numerical cl-book-unc-bridge" />',
    );
  if (expected !== actualMdx) {
    throw new Error('Uncertainty comparison changed protected B26 MDX text or its scoped additions');
  }
}

const priorEvidenceLocatorUpdates = Object.freeze({
  'ev-unc-huij-types': {
    from: '1998PartI经UvA2001学位论文§2.1文本；实际印刷pp15–18，PDF零基索引15–18',
    to: '1998 年论文第一部分（经阿姆斯特丹大学 2001 年学位论文第 2.1 节收录），印第 15—18 页',
  },
  'ev-unc-huij-parameters': {
    from: '实际学位论文§2.1 Parameter uncertainty，印刷pp16–17，PDF零基索引16–17',
    to: '阿姆斯特丹大学 2001 年学位论文第 2.1 节参数不确定性，印第 16—17 页',
  },
  'ev-unc-huij-model': {
    from: '实际学位论文§2.1 Model uncertainty，印刷p17，PDF零基索引17',
    to: '阿姆斯特丹大学 2001 年学位论文第 2.1 节模型不确定性，印第 17 页',
  },
  'ev-unc-huij-choices': {
    from: '实际学位论文§2.1 Uncertainty due to choices，印刷p18，PDF零基索引18',
    to: '阿姆斯特丹大学 2001 年学位论文第 2.1 节选择不确定性，印第 18 页',
  },
  'ev-unc-huij-target': {
    from: '实际学位论文§2.1 Variability between sources and objects，印刷pp20–21，PDF零基索引20–21',
    to: '阿姆斯特丹大学 2001 年学位论文第 2.1 节来源与对象间变异，印第 20—21 页',
  },
  'ev-unc-huij-sd-sem': {
    from: '实际学位论文§2.1 Appendix与Table2.3，印刷pp23–24，PDF零基索引23–24；p24图像核对',
    to: '阿姆斯特丹大学 2001 年学位论文第 2.1 节附录与表 2.3，印第 23—24 页',
  },
  'ev-unc-hs-numerical': {
    from: '先前波次作者公开样章§2.4，实际印刷pp23–24，PDF零基索引34–35',
    to: '作者公开样章第 2.4 节，印第 23—24 页',
  },
});

const priorReadingAdditions = Object.freeze({
  'rd-ilcd-2010': { passages: 2 },
  'rd-kb44-ec2021': { passages: 1 },
});

const expectedSdSemScope = '学位论文第 23—24 页的教学性附录；公式保留其样本与分布假设。';
const expectedBridgePremiseIds = Object.freeze([
  'cl-unc-sd-sem',
  'cl-unc-choices',
  'cl-unc-numerical',
  'cl-unc149-variability-vs-epistemic',
  'cl-unc149-framework-comparison',
  'cl-unc149-taylor-vs-sampling',
  'cl-unc149-gsa-outliers-nonlinearity',
  'cl-unc149-comparative-paired-and-pvalue',
  'cl-unc149-pedigree-mc-boundary',
  'cl-ped-estimate-boundary',
]);

const allowsRaw = (family, id, from) => (
  (family === 'sources' && from === null && addedSourceIds.has(id))
  || (family === 'evidence' && ((from === null && addedEvidenceIds.has(id)) || (from !== null && Object.hasOwn(priorEvidenceLocatorUpdates, id))))
  || (family === 'claims' && ((from === null && addedClaimIdSet.has(id)) || (from !== null && (id === 'cl-book-unc-bridge' || id === 'cl-unc-sd-sem'))))
  || (family === 'readings' && ((from === null && addedReadingIds.has(id)) || (from !== null && Object.hasOwn(priorReadingAdditions, id))))
  || (family === 'gaps' && from === null && id === 'gap-unc149-correlated-and-nonlinear-lcia-gsa')
  || (family === 'revisions' && from === null && id === 'rev-unc149-b26-uncertainty-variability-comparison')
  || (family === 'literature' && from === null && addedWorkIdSet.has(id))
  || (family === 'queries' && from === null && id === 'q-unc149-propagation-global-sensitivity-comparative-inference-20261119')
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Uncertainty comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Uncertainty comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Uncertainty comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareUncertaintyComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  if (!sameScienceValue(unit.corrections, uncertaintyComparisonCorrections)) {
    throw new Error('Uncertainty comparison unit contains unauthorized corrections');
  }
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Uncertainty comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Uncertainty comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Uncertainty comparison must bind B26 MDX source and only declared changes');
  }

  const mdxPath = managedPaths[0];
  const fileRow = fileChanges.get(mdxPath);
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileRow?.from !== oldFileShas[mdxPath] || sha256(prevMdx ?? '') !== oldFileShas[mdxPath]) {
    throw new Error('Uncertainty comparison lacks independently preserved predecessor B26 MDX bytes');
  }
  const actualMdx = files.get(mdxPath).toString();
  boundedMdxTransform(prevMdx, actualMdx);
  const occ = collectChapterClaimOccurrences(actualMdx);
  if (!sameScienceValue(unit.occurrences[mdxPath], actual.sourceOccurrences[mdxPath])
      || occ.length !== 17) {
    throw new Error('Uncertainty comparison lacks exact 17 B26 claim occurrences');
  }
  if (!addedClaimIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Uncertainty comparison lacks exact record transitions for each new canonical claim');
  }

  const { catalog, readings, literature } = input;
  const prior = (col, id) => unit.rawRecords.find(r => r.path === col && r.id === id)?.from;
  for (const [id, spec] of Object.entries(priorEvidenceLocatorUpdates)) {
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Uncertainty comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-unc149-'))
        || !sameScienceValue(current, { ...reading, passages: [...reading.passages, ...addedPassages] })) {
      throw new Error(`Uncertainty comparison changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanUncertaintyProse(w.title, `${wid}.title`);
    assertCleanUncertaintyProse(w.rights, `${wid}.rights`);
    assertCleanUncertaintyProse(w.discovery.reason, `${wid}.discovery.reason`);
    (w.limitations ?? []).forEach((lm, idx) => assertCleanUncertaintyProse(lm, `${wid}.limitations[${idx}]`));
  }
  const gap = readings.gaps.find(row => row.id === 'gap-unc149-correlated-and-nonlinear-lcia-gsa');
  const rev = readings.revisions.find(row => row.id === 'rev-unc149-b26-uncertainty-variability-comparison');
  const query = literature.protocol.queries.find(row => row.id === 'q-unc149-propagation-global-sensitivity-comparative-inference-20261119');
  if (!gap || !rev || !query) throw new Error('Missing Unit 149 gap, revision or query');
  assertCleanUncertaintyProse(gap.description, 'gap-unc149.description');
  assertCleanUncertaintyProse(gap.nextAction, 'gap-unc149.nextAction');
  assertCleanUncertaintyProse(rev.reasoning, 'rev-unc149.reasoning');
  assertCleanUncertaintyProse(query.channel, 'q-unc149.channel');

  const sdSemBefore = prior('catalog.claims', 'cl-unc-sd-sem');
  const sdSemCurrent = catalog.claims.find(row => row.id === 'cl-unc-sd-sem');
  if (!sdSemBefore || !sdSemCurrent || !sameScienceValue(sdSemCurrent, { ...sdSemBefore, scope: expectedSdSemScope })) {
    throw new Error('Uncertainty comparison changed unauthorized field on cl-unc-sd-sem');
  }
  assertCleanUncertaintyProse(sdSemCurrent.scope, 'cl-unc-sd-sem.scope');

  const bridgeBefore = prior('catalog.claims', 'cl-book-unc-bridge');
  const bridgeCurrent = catalog.claims.find(row => row.id === 'cl-book-unc-bridge');
  if (!bridgeBefore || !bridgeCurrent || bridgeBefore.text === bridgeCurrent.text
      || !sameScienceValue(bridgeCurrent, {
        ...bridgeBefore,
        text: bridgeCurrent.text,
        scope: bridgeCurrent.scope,
        premiseIds: [...expectedBridgePremiseIds],
        reviewedAt: uncertaintyComparisonCheckDate,
      })) {
    throw new Error('Uncertainty comparison changed unauthorized field on cl-book-unc-bridge');
  }
  assertCleanUncertaintyProse(bridgeCurrent.text, 'cl-book-unc-bridge.text');
  assertCleanUncertaintyProse(bridgeCurrent.scope, 'cl-book-unc-bridge.scope');
  (bridgeCurrent.caveats ?? []).forEach((c, idx) => assertCleanUncertaintyProse(c, `cl-book-unc-bridge.caveats[${idx}]`));

  validateUncertaintyComparisonFactors(catalog, readings);

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
  if (unit.state?.before !== uncertaintyComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== uncertaintyComparisonPredecessorPin) {
    throw new Error('Uncertainty comparison did not recover the independently observed raw 4bb50839 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Uncertainty comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Uncertainty comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, 'cl-unc-sd-sem', 'cl-book-unc-bridge', ...addedClaimIds])],
  };
}

export function effectiveUncertaintyComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    uncertaintyComparison: unit,
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
      || !scienceDigest(uncertaintyComparisonCapturePin) || editionDigest(capture) !== uncertaintyComparisonCapturePin) {
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

export function verifyUncertaintyComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${uncertaintyComparisonId}/${row.kind}`;
    if (row.date < uncertaintyComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function uncertaintyComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== uncertaintyComparisonRoute || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-unc-149-ordinary-0`;
}

export function uncertaintyComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-unc-149-ordinary-0$/;
export function observeUncertaintyComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

const part6StackedCorrectionClaims = new Set(['cl-book-unc-bridge']);
export function validateUncertaintyComparisonCorrectionOutput(document, path, unit, part6Reread = null) {
  const markers = document.querySelectorAll('[data-uncertainty-comparison-correction]');
  const expectedRows = !unit ? [] : uncertaintyComparisonCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Uncertainty comparison correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-uncertainty-comparison-correction') === claimId);
    const marker = matchingMarkers[0];
    const markerChildren = nonCommentChildren(marker);
    const time = markerChildren[0];
    const link = markerChildren[markerChildren.length - 1];
    const midNodes = markerChildren.slice(1, -1);
    const midText = midNodes.length && midNodes.every(c => c.nodeType === 3)
      ? midNodes.map(c => c.text).join('')
      : null;
    const allLinks = marker?.querySelectorAll('a') ?? [];
    const article = note?.closest('article[data-reader-route]');
    const sections = article?.querySelectorAll('.chapter-notes') ?? [];
    const list = sections[0]?.querySelector('ol');
    const noteItems = list?.childNodes.filter(child => child.tagName === 'LI') ?? [];
    if (nativeNotes.length !== 1 || matchingMarkers.length !== 1 || note.tagName !== 'LI'
        || note.getAttribute('data-reader-claim') !== claimId
        || article?.getAttribute('data-reader-route') !== chapter || sections.length !== 1
        || note.parentNode !== list || noteItems[noteIndex] !== note
        || marker.tagName !== 'P' || marker.parentNode !== note || (marker.nextElementSibling !== null && !(part6Reread && part6StackedCorrectionClaims.has(row.claimId) && marker.nextElementSibling.getAttribute('data-part6-reread-correction') === row.claimId))
        || !attrs(marker, 'class', 'data-uncertainty-comparison-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== uncertaintyComparisonSource.date
        || !singleTextChild(time, uncertaintyComparisonSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(uncertaintyComparisonSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Uncertainty comparison correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyUncertaintyComparisonHistory(documents, unit, actual, part6Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeUncertaintyComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Uncertainty comparison',
    routes: uncertaintyComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: uncertaintyComparisonHistoryControls(unit),
    source: uncertaintyComparisonSource,
    attribute: 'uncertainty-comparison',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Uncertainty comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Uncertainty comparison actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateUncertaintyComparisonCorrectionOutput(document, path, unit, part6Reread));
  }
  return { prior, errors };
}

export function uncertaintyComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreUncertaintyComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
