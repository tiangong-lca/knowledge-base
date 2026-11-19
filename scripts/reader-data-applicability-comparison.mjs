import capture from '../config/reader-data-applicability-comparison-capture.json' with { type: 'json' };
import dataAccepted from '../config/data-applicability-accepted.json' with { type: 'json' };
import acceptance from '../config/readable-book-current.json' with { type: 'json' };
import copyeditConfig from '../config/reader-copyedit-current.json' with { type: 'json' };
import { readableBookAcceptancePins, readableBookBaselineDigest } from './reader-current-edition-pins.mjs';
import { readerCopyeditUnitPin } from './reader-copyedit-pins.mjs';
import { copyeditLayout, copyeditSourceStructure, selectReaderCopyedit } from './reader-copyedit.mjs';
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import {
  editionDigest, inspectReadableBookEdition, pinnedReadableBookUnits,
  readableBookReviewPlan, sha256, verifyReadableBookReviewReceipts,
} from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';
import {
  assertCleanDataApplicabilityProse,
  requiredDappClaims,
  validateDataApplicabilityComparisonFactors,
} from './reader-data-applicability-comparison-factors.mjs';

export const dataApplicabilityComparisonId = 'data-applicability-comparison-147';
export const dataApplicabilityComparisonCheckDate = '2026-11-19';
export const dataApplicabilityComparisonSources = Object.freeze([
  '/monograph/data-applicability',
  '/docs/book/database-fitness-and-documentation',
  '/docs/book/review-support-and-version-boundaries',
]);
export const dataApplicabilityComparisonRoutes = Object.freeze([
  'book-data-applicability',
  '/docs/book/database-fitness-and-documentation',
  '/docs/book/review-support-and-version-boundaries',
]);
/** @type {string|null} */
export const dataApplicabilityComparisonUnitPin = '728d84360c5530fc96054634cce4d6dd15e73b1f2ad4aa1a4004dff594ee7eb4';
/** @type {string|null} */
export const dataApplicabilityComparisonCapturePin = 'a7d7ab2fef20f64658114f367e50b810245f3298499dda76ba440435b2285d60';
export const dataApplicabilityComparisonSource = Object.freeze({
  commit: 'c5b90b0352abaeaf0eec6706685076c8825d8925',
  tree: 'a999fbc6b1ef2345a48f8634e88cb81a332e66ca',
  manifest: '4e0d5f1d6e55f7539a05cbccf849df22d677798dfc1ba17ceecf50e844fc17c4',
  date: '2026-11-19',
});
export const dataApplicabilityComparisonPredecessorPin = '68aed4ba5c3b9aa076a7567228e49e9a8c4360dbe454bd6748256af1e9d7c599';
const addressPin = '3fe189851cbb49cd275f0ac702cfc3649e34a810195974ff678696431c4bf4f0';

const oldFileShas = Object.freeze({
  'content/monograph/data-applicability.mdx': 'a30dc8aa8a418bf0f31a47905abef996b31f8dd338291cc9161181be0a2f9369',
  'content/docs/book/database-fitness-and-documentation.mdx': 'fdce28c48ceeb9f0349b2ec634fae64cb55a5a6be5072e24bab10ef2c78d8912',
  'content/docs/book/review-support-and-version-boundaries.mdx': '30e18084061d6b5d77518e1194472a0653d1fbcdf526201d0443c3618081f569',
});
const oldDescLines = Object.freeze({
  'content/monograph/data-applicability.mdx':
    'description: 一份过程数据能否用于当前研究，要看它代表什么技术、覆盖哪些清单流，还要核对质量文档、审查范围和换版后的变化。',
  'content/docs/book/database-fitness-and-documentation.mdx':
    'description: 从一份煤电数据出发，说明怎样查清它代表什么过程、覆盖哪些清单流，以及能用来评价哪些影响。',
  'content/docs/book/review-support-and-version-boundaries.mdx':
    'description: 核对审查采用的准则、实际检查过的资料和数据版本，判断换库、换用途或换版后还能沿用哪些审查结论。',
});
const managedPaths = Object.keys(oldFileShas);
const layoutKeys = new Set(dataApplicabilityComparisonSources.map(route => `B25:${route}:reader-source`));
const addedClaimIds = Object.freeze(Object.keys(requiredDappClaims));

const scopeUserAndManager =
  '前版首现 UNEP/SETAC 未写中文全称且未显式挂接第五部收束前提。本版补全“联合国环境规划署与国际环境毒理学和化学学会（UNEP/SETAC）”全称、规范注释题要并增列前章多维聚合条件前提，三方职责判断不变。';
const scopeRepresentedObject =
  '前版首现英文缩写 LCA 未附中文全称且尾注未写全 ISO 名称。本版补全“生命周期评价（LCA）”与“国际标准化组织（ISO）”全称并规范题要，数据集目标范围界定不变。';
const scopeReviewRelative =
  '前版在本节（及对应细读篇）首段未写全 UNEP/SETAC 机构名称，保留英文裸词 reviewed，且未挂接前文质量聚合前提。本版补全机构中文全称、括注“已审查”（reviewed）、规范尾注页码表述并增列前文质量聚合前提。';
const scopeValidationContext =
  '前版保留英文裸词 validation 与 review 未附中文对译。本版统一括注“验证”（validation）与“审查”（review）并规范注释题要，两处章节用语边界不变。';
const scopeRecommendationStrength =
  '前版保留英文裸词 shall 未附中文对译。本版统一括注“应”（shall）并规范注释题要与尾注表述，推荐强度说明不变。';
const scopeConditionalUse =
  '前版章末收束仅概括单一指南补缺原则且前提中第 10 注排在第 7 注之前，尾注亦含内部核读缩写。本版增补跨体系五重适用边界收束与第六部后续三章分工衔接，按正文出现顺序重排并增列本章两项跨体系前提，同时规范注释题要与限定语。';

export const dataApplicabilityComparisonCorrections = Object.freeze([
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-user-and-manager',
    noteIndex: 0,
    scope: scopeUserAndManager,
  }),
  Object.freeze({
    chapter: '/docs/book/database-fitness-and-documentation',
    claimId: 'cl-db2011-user-and-manager',
    noteIndex: 0,
    scope: scopeUserAndManager,
  }),
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-represented-object',
    noteIndex: 1,
    scope: scopeRepresentedObject,
  }),
  Object.freeze({
    chapter: '/docs/book/database-fitness-and-documentation',
    claimId: 'cl-db2011-represented-object',
    noteIndex: 1,
    scope: scopeRepresentedObject,
  }),
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-review-relative-to-criteria',
    noteIndex: 11,
    scope: scopeReviewRelative,
  }),
  Object.freeze({
    chapter: '/docs/book/review-support-and-version-boundaries',
    claimId: 'cl-db2011-review-relative-to-criteria',
    noteIndex: 0,
    scope: scopeReviewRelative,
  }),
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-validation-context',
    noteIndex: 13,
    scope: scopeValidationContext,
  }),
  Object.freeze({
    chapter: '/docs/book/review-support-and-version-boundaries',
    claimId: 'cl-db2011-validation-context',
    noteIndex: 2,
    scope: scopeValidationContext,
  }),
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-recommendation-strength',
    noteIndex: 15,
    scope: scopeRecommendationStrength,
  }),
  Object.freeze({
    chapter: '/docs/book/review-support-and-version-boundaries',
    claimId: 'cl-db2011-recommendation-strength',
    noteIndex: 4,
    scope: scopeRecommendationStrength,
  }),
  Object.freeze({
    chapter: 'book-data-applicability',
    claimId: 'cl-db2011-conditional-use',
    noteIndex: 21,
    scope: scopeConditionalUse,
  }),
  Object.freeze({
    chapter: '/docs/book/review-support-and-version-boundaries',
    claimId: 'cl-db2011-conditional-use',
    noteIndex: 10,
    scope: scopeConditionalUse,
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
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'state', 'scope', 'changes', 'consumers',
  'corrections', 'layouts', 'occurrences', 'previousFiles', 'rawRecords', 'rawFields',
  'outputs', 'publicArtifacts', 'history', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedRecordDigestKeys = new Set(['raw', 'public', 'protected']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedCorrectionKeys = new Set(['chapter', 'claimId', 'noteIndex', 'scope']);
const allowedLayoutKeys = new Set(['key', 'from', 'to', 'rationale']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedRawFieldKeys = new Set(['path', 'from', 'to']);
const allowedOutputKeys = new Set(['path', 'route', 'from', 'sha256', 'rationale']);
const allowedPublicArtifactKeys = new Set(['path', 'from', 'sha256', 'rationale']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
const allowedHistoryRowKeys = new Set(['address', 'from', 'rationale', 'ordinary']);
const allowedOrdinaryBlockKeys = new Set(['from', 'to', 'address', 'targetId', 'rationale']);
const allowedOutputCaptureKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256', 'normalizedProofSha256']);
const allowedReviewEvidenceKeys = new Set(['kind', 'date', 'artifactFile', 'artifactSha256', 'reportFile', 'reportSha256']);

const allowedCaptureKeys = new Set(['schemaVersion', 'identity', 'manifestPaths', 'files', 'normalization']);
const allowedCaptureIdentityKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256']);
const allowedCaptureFileKeys = new Set(['path', 'sha256', 'bytes']);
const allowedCaptureNormKeys = new Set(['articles', 'publicHtml']);
const allowedNormArticleKeys = new Set(['path', 'route', 'sha256']);
const allowedNormHtmlKeys = new Set(['path', 'sha256']);

function assertUnitEnvelopeKeys(unit, reviewed = false) {
  if (!exactKeys(unit, reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !Array.isArray(unit.changes) || !unit.changes.length
      || !unit.changes.every(row => exactKeys(row, allowedChangeKeys)
        && (row.kind === 'file'
          ? scienceDigest(row.from) && scienceDigest(row.to)
          : row.kind === 'record'
            && (row.from === null || (exactKeys(row.from, allowedRecordDigestKeys) && scienceDigest(row.from.raw)))
            && exactKeys(row.to, allowedRecordDigestKeys) && scienceDigest(row.to.raw)))
      || !Array.isArray(unit.consumers)
      || !unit.consumers.every(row => exactKeys(row, allowedConsumerKeys))
      || !Array.isArray(unit.corrections)
      || !unit.corrections.every(row => exactKeys(row, allowedCorrectionKeys) && Number.isSafeInteger(row.noteIndex) && row.noteIndex >= 0)
      || !Array.isArray(unit.layouts) || unit.layouts.length !== layoutKeys.size
      || !unique(unit.layouts, row => row?.key)
      || !unit.layouts.every(row => exactKeys(row, allowedLayoutKeys) && layoutKeys.has(row.key) && scienceDigest(row.from) && scienceText(row.rationale))
      || !plainObject(unit.occurrences) || Object.keys(unit.occurrences).length !== managedPaths.length
      || Object.keys(unit.occurrences).some(k => !Object.hasOwn(oldFileShas, k) || !Array.isArray(unit.occurrences[k]))
      || !plainObject(unit.previousFiles) || Object.keys(unit.previousFiles).length !== managedPaths.length
      || Object.keys(unit.previousFiles).some(k => !Object.hasOwn(oldFileShas, k) || typeof unit.previousFiles[k] !== 'string')
      || !Array.isArray(unit.rawRecords)
      || !unit.rawRecords.every(row => exactKeys(row, allowedRawRecordKeys))
      || !Array.isArray(unit.rawFields)
      || !unit.rawFields.every(row => exactKeys(row, allowedRawFieldKeys))
      || !Array.isArray(unit.outputs)
      || !unit.outputs.every(row => exactKeys(row, allowedOutputKeys) && scienceDigest(row.from) && scienceDigest(row.sha256))
      || !Array.isArray(unit.publicArtifacts)
      || !unit.publicArtifacts.every(row => exactKeys(row, allowedPublicArtifactKeys) && scienceDigest(row.from) && scienceDigest(row.sha256))
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.previousAddresses)
      || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Object.values(unit.history.ordinaryTargets).every(row => exactKeys(row, allowedOrdinaryTargetKeys)
        && dataApplicabilityComparisonRoutes.includes(row.route) && scienceDigest(row.sha256) && row.tag === 'P')
      || !Array.isArray(unit.history.history)
      || !unit.history.history.every(row => exactKeys(row, allowedHistoryRowKeys)
        && scienceDigest(row.from) && scienceText(row.rationale) && Array.isArray(row.ordinary)
        && row.ordinary.every(b => exactKeys(b, allowedOrdinaryBlockKeys)
          && scienceDigest(b.from) && scienceDigest(b.to) && scienceText(b.address) && scienceText(b.targetId) && scienceText(b.rationale)))
      || (reviewed
        ? !exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
          || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
          || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys))
        : unit.outputCapture !== null
          && (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
            || typeof unit.outputCapture.dirty !== 'boolean'
            || !scienceDigest(unit.outputCapture.manifestSha256)
            || !scienceDigest(unit.outputCapture.normalizedProofSha256)))) {
    throw new Error('Data applicability comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectDataApplicabilityComparison(config, pin = dataApplicabilityComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Data applicability comparison requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== dataApplicabilityComparisonId
      || !sameScienceValue(unit.source, dataApplicabilityComparisonSource)
      || !sameScienceValue(unit.routes, dataApplicabilityComparisonRoutes)
      || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)) {
    throw new Error('Data applicability comparison requires an exact c5b90b03 predecessor and bounded B25 plan');
  }
  assertUnitEnvelopeKeys(unit, config.status === 'reviewed');
  if (!sameScienceValue(unit.corrections, dataApplicabilityComparisonCorrections)) {
    throw new Error('Data applicability comparison corrections diverge from reviewed specification');
  }
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Data applicability comparison is not independently accepted');
  }
  return unit;
}

const expectedTable1Mdx = [
  '| 比较维度 | UNEP/SETAC（2011） | ILCD 详细指南（2010） | ILCD 入门级（1.1 版，2012） | 欧盟建议书 2021/2279 与 EF 指南 2.0 | ecoinvent 第 3 版（2013） |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 评价对象层级 | 单元过程或聚合过程数据集文档 | 过程数据集整体（区分单元过程、部分终止系统、清单结果） | 过程数据集整体（不作质量分档） | 公司特定数据集、次级数据集及研究语境最相关过程 | 除参考产品外的单条输入输出交换流 |',
  '| 计分质量指标 | 表 4.1 定性说明精密度、完整性、代表性、一致性、重现性 | 技术、地域、时间代表性加完整性、精密度、方法学共 6 项（1—5 分） | 质量合规固定标为“未定义”（Not defined），按国际标准准则陈述质量并记述三项代表性 | 技术（TeR）、地域（GeR 或 GR）、时间（TiR）代表性与精密度（P）共 4 项（1—5 分） | 基本不确定度加可靠性、完整性、时间、地域、进一步技术相关性 5 项谱系分 |',
  '| 完整性与方法学 | 与代表性、精密度并列作定性文档审查 | 纳入 6 项打分指标参与式 3 合成 | 遵循国际标准过程方法并记录建模与分配，不强制手册方法 | 移出算式设为二元最低准入前提，XML 字段标为“不适用”（Not applicable） | 方法学由主库编审规则统一约束，完整性为第 2 项谱系方差指标 |',
  '| 未知项与单项封顶 | 要求区分真实零值与缺失值并文字交代缺口 | 未评估或未知项赋 5 分，不适用赋 0 分并扣减有效指标数；无独立单项硬顶 | 无量化总分与单项上限 | 供应端次级数据每项加权分 ≤ 3.0；公司特定数据 P ≤ 3、三项代表性 ≤ 2 | 未评估交换流默认取最差谱系档 5 分，无数据集级淘汰上限 |',
  '| 聚合算式或映射 | 不设标量聚合公式 | 式 3 最弱项五倍权重：(六项和 + 4×最弱分) / (有效项数 + 4) | 不计算总体数据质量评级（研究端引用时亦禁止重算） | 式 19 与式 20 四项算术均值；公司特定数据按 80% 阈值分别筛活动数据与直接流，次级数据按单一总分前 80% 重标定加权 | 对数正态底层正态方差 6 项直接相加（5 分谱系附加方差和为 0.21） |',
  '| 分档门槛与用途 | 支撑使用者按目标与范围作人工适用性判断 | 表 7 三档：≤ 1.6 高质量、高于 1.6 至 ≤ 3 基本质量、高于 3 至 ≤ 4 数据估计 | 供数据网络节点起步准入；在欧盟研究中作 ≤ 10% 单一总分代理 | 表 22 五档（≤ 1.5 极优、高于 1.5 至 ≤ 2.0 优良、高于 2.0 至 ≤ 3.0 良好、高于 3 至 ≤ 4.0 尚可、高于 4 差）；数据需求矩阵规定公司特定数据 ≤ 1.5、合规次级数据 ≤ 3.0 | 静态清单取中位数，方差专供蒙特卡洛清单不确定性传播 |',
].join('\n');

const expectedTable2Mdx = [
  '| 制度维度 | UNEP/SETAC（2011） | ILCD 2010 与入门级 1.1 版 | 欧盟建议书 2021/2279 与 EF 指南（2.0 及 3.1 增补） | ecoinvent 第 3 版（2013） | 天工公开规范 TIDAS（v0.3.0） |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 自动校验与人工审查 | 第 2 章与第 4 章区分手工或自动验证同独立系统审查 | 总论第 11 章将交付物评审矩阵移交专卷；入门级允许 1 名外部免报告或 1 名内部附报告 | 次级入库仅准许至少 2 名含外部专家联合评审并禁用单人外审；研究验证须达 6 分且初级数据必做现场核查，Look@LCI 偏差 ≤ 1% | 在线 ecoEditor 自动验证写入第 3340 字段；转换活动目标至少 3 名专家（含 4 类横向编辑）审查，3.0 版如实披露缺口 | 过程模式支持单条或数组审查历史，含“Not reviewed”共 6 值枚举且报告引用可选 |',
  '| 合规声明矩阵结构 | 区分强烈推荐（shall）、推荐与建议，保留有依据少数意见 | 表 9 确立质量、方法、命名、审查、文档五维；完整合规设 12 套情景乘质量 UUID，入门级另设独立 UUID | 表 1 强制并列 6 组（无类别规则时 5 组）UUID，国际标准与流列表维度按职责精确标“Not defined” | 按主库统一活动命名、地理父子继承与系统模型规则管理，不用多系统 UUID 并列块 | 公开规则定义语义与格式谓词，刻意排除严重度、阶段归属与默认阻断策略 |',
  '| 区域残差与混合命名 | 建议记录聚合范围、底层数据可得性与分配方式 | 区分单工序或黑箱单元过程、部分终止系统与清单结果 | 中心数据集标部分终止系统；非主要支撑子过程标单工序单元过程且严禁脱离父系统复用 | 强制先建全球父过程 GLO 并按产量差额自动算 RoW；严格拆分转换活动与消费组合市场活动 | 生产组合应具成文权重；电网损耗或 1:1 变压节点不自动转消费组合，绿证不改写物理发电技术 |',
  '| 版本演进与失效红线 | 建议报告技术、资料或基本流更新及新版实际受审范围 | 合规源数据集基线版本号 01.02.000（或更高可用版），网络建设过渡期最长 3 年 | 旧版转换数据降为代理；JRC130796 实测 2,752 份数据集中 6%、10%、13% 前三主类易位；报告最长 3 年有效，单类恶化超 10.0% 或总分恶化超 5.0% 强制更新 | 新增局部数据联动改写 RoW 与市场份额；3.0 版记录未同步更新 GLO 时负交换置零或复制 GLO 例外 | 强制要求 NN.NN 或 NN.NN.NNN 定长版本号随内容变更严格单调递增 |',
  '| 缺口补齐与截断上限 | 表 2.1 末行允许在无更佳资料时用足够一致数据补缺并逐项说明理由 | 入门级允许 VOC 等部分聚合基本流作为起步过渡 | 四级次级阶梯（EF 合规、EF 代理、≤ 10% 单一总分 ILCD-EL 代理、剔除并报缺口）；物料、能量与各影响类别累计截断均低于 3.0%；2026 过渡指导预计延用至 2028 年 | 未指明子区室仅在无具体信息时使用；除特定水体总和指标等例外，总和排放须扣除已单报物质以防双计 | 消费方产品可设定业务豁免与阶段门禁，但不得把未通过公开规则定义的记录改写为通过 |',
].join('\n');

const parseSingleTable = (section, mdx) => {
  const lines = mdx.trim().split('\n');
  const cells = lines.map(line => line.slice(1, -1).split('|').map(cell => cell.trim()));
  const [headers, , ...rows] = cells;
  return { section, headers, rows };
};

const parseExpectedTables = (section1, mdx1, section2 = null, mdx2 = null) =>
  section2 ? [parseSingleTable(section1, mdx1), parseSingleTable(section2, mdx2)] : [parseSingleTable(section1, mdx1)];

const expectedTablesByKey = Object.freeze({
  'B25:/monograph/data-applicability:reader-source': parseExpectedTables('质量信息', expectedTable1Mdx, '版本变化', expectedTable2Mdx),
  'B25:/docs/book/database-fitness-and-documentation:reader-source': parseExpectedTables('聚合与覆盖', expectedTable1Mdx),
  'B25:/docs/book/review-support-and-version-boundaries:reader-source': parseExpectedTables('版本变化', expectedTable2Mdx),
});

const s1Ids = ['cl-dapp147-dataset-roles-and-system-linking', 'cl-dapp147-intrinsic-vs-context-representativeness'];
const s2aIds = ['cl-dapp147-quality-architectures-and-prerequisite-split'];
const s2bIds = ['cl-dapp147-weakest-link-vs-mean-and-80pct-masking'];
const s3aIds = ['cl-dapp147-validation-vs-review-and-team-thresholds'];
const s3bIds = ['cl-dapp147-five-aspect-compliance-and-uuid-semantics'];
const s4Ids = ['cl-dapp147-package-migration-inheritance-and-surveillance', 'cl-dapp147-proxy-hierarchy-cutoff-and-part6-bridge'];

function insertAfterOccurrence(occurrences, anchorId, addedIds, section) {
  const index = occurrences.findIndex(row => row.id === anchorId);
  if (index < 0) throw new Error(`Data applicability comparison missing anchor occurrence: ${anchorId}`);
  return [
    ...occurrences.slice(0, index + 1),
    ...addedIds.map(id => ({ id, section })),
    ...occurrences.slice(index + 1),
  ];
}

function expectedOccurrencesForKey(key, baseOccurrences) {
  if (key === 'B25:/monograph/data-applicability:reader-source') {
    let next = insertAfterOccurrence(baseOccurrences, 'cl-db2011-scope-examples', s1Ids, '表示对象');
    next = insertAfterOccurrence(next, 'cl-db2011-documenting-number', s2aIds, '质量信息');
    next = insertAfterOccurrence(next, 'cl-db2011-missing-and-zero', s2bIds, '质量信息');
    next = insertAfterOccurrence(next, 'cl-db2011-validation-context', s3aIds, '审查范围');
    next = insertAfterOccurrence(next, 'cl-db2011-review-of-guidance', s3bIds, '审查范围');
    return insertAfterOccurrence(next, 'cl-db2011-versioned-confidence', s4Ids, '版本变化');
  }
  if (key === 'B25:/docs/book/database-fitness-and-documentation:reader-source') {
    let next = insertAfterOccurrence(baseOccurrences, 'cl-db2011-scope-examples', s1Ids, '表示对象');
    next = insertAfterOccurrence(next, 'cl-db2011-documenting-number', s2aIds, '质量信息');
    return insertAfterOccurrence(next, 'cl-db2011-missing-and-zero', s2bIds, '聚合与覆盖');
  }
  let next = insertAfterOccurrence(baseOccurrences, 'cl-db2011-validation-context', s3aIds, '准则与记录');
  next = insertAfterOccurrence(next, 'cl-db2011-review-of-guidance', s3bIds, '指导的支持程度');
  return insertAfterOccurrence(next, 'cl-db2011-versioned-confidence', s4Ids, '版本变化');
}

export function dataApplicabilityComparisonLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  const row = unit.layouts.find(item => item.key === key);
  const nextDescription = row?.to?.source?.description;
  const approved = {
    source: {
      ...accepted.source,
      description: nextDescription,
      tables: expectedTablesByKey[key],
    },
    occurrences: expectedOccurrencesForKey(key, accepted.occurrences),
  };
  if (row?.from !== editionDigest(accepted)
      || !scienceText(row?.rationale)
      || !scienceText(nextDescription) || /[\r\n<>]/.test(nextDescription)
      || nextDescription === accepted.source.description
      || !sameScienceValue(row.to, approved)) {
    throw new Error(`Data applicability comparison can change only its reviewed B25 description, tables and occurrence insertions: ${key}`);
  }
  assertCleanDataApplicabilityProse(nextDescription, `${key}.description`);
  return row.to;
}

export function predecessorDataApplicabilitySource(route) {
  const key = `B25:${route}:reader-source`;
  const source = dataAccepted.sources.find(row => row.route === route);
  const occurrences = route === '/monograph/data-applicability'
    ? dataAccepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })))
    : dataAccepted.website.find(page => page.route === route).occurrences;
  const initial = { source, occurrences };
  const priorLayouts = readableBookReviewPlan(
    pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins),
  ).layouts;
  const row = priorLayouts.get(key);
  if (row && row.from !== editionDigest(initial)) throw new Error(`Data applicability comparison stale B25 layout baseline: ${key}`);
  const copyedit = selectReaderCopyedit(copyeditConfig, readerCopyeditUnitPin);
  return copyeditLayout(key, row ? row.to : initial, copyedit);
}

function boundedMdxTransform(path, previousMdx, actualMdx, expectedDescription) {
  const oldDesc = oldDescLines[path];
  if (!scienceText(expectedDescription) || /[\r\n<>]/.test(expectedDescription)
      || !previousMdx.includes(oldDesc)
      || expectedDescription === oldDesc.slice('description: '.length)) {
    throw new Error(`Data applicability comparison lacks the exact predecessor frontmatter description: ${path}`);
  }
  let expected = previousMdx.replace(oldDesc, () => `description: ${expectedDescription}`);
  if (path === 'content/monograph/data-applicability.mdx') {
    const t1 = '<Prose ids="cl-db2011-user-and-manager cl-db2011-represented-object cl-db2011-scope-examples" />';
    const t2 = '<Prose ids="cl-db2011-representativeness-and-precision cl-db2011-documenting-number cl-db2011-aggregation-information cl-db2011-missing-and-zero" />';
    const t3 = '<Prose ids="cl-db2011-review-relative-to-criteria cl-db2011-review-questions cl-db2011-validation-context cl-db2011-recommendation-strength cl-db2011-review-of-guidance" />';
    const t4 = '<Prose ids="cl-db2011-versioned-confidence cl-db2011-conditional-use" />';
    expected = expected
      .replace(t1, () => `${t1}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
      .replace(t2, () =>
        '<Prose ids="cl-db2011-representativeness-and-precision cl-db2011-documenting-number" />\n\n'
        + `<Prose ids="${s2aIds.join(' ')}" />\n\n`
        + '<Prose ids="cl-db2011-aggregation-information cl-db2011-missing-and-zero" />\n\n'
        + `<Prose ids="${s2bIds.join(' ')}" />\n\n`
        + expectedTable1Mdx)
      .replace(t3, () =>
        '<Prose ids="cl-db2011-review-relative-to-criteria cl-db2011-review-questions cl-db2011-validation-context" />\n\n'
        + `<Prose ids="${s3aIds.join(' ')}" />\n\n`
        + '<Prose ids="cl-db2011-recommendation-strength cl-db2011-review-of-guidance" />\n\n'
        + `<Prose ids="${s3bIds.join(' ')}" />`)
      .replace(t4, () =>
        '<Prose ids="cl-db2011-versioned-confidence" />\n\n'
        + `<Prose ids="${s4Ids.join(' ')}" />\n\n`
        + `${expectedTable2Mdx}\n\n`
        + '<Prose ids="cl-db2011-conditional-use" />');
  } else if (path === 'content/docs/book/database-fitness-and-documentation.mdx') {
    const t1 = '<Prose ids="cl-db2011-user-and-manager cl-db2011-represented-object cl-db2011-scope-examples" />';
    const t2 = '<Prose ids="cl-db2011-representativeness-and-precision cl-db2011-documenting-number" />';
    const t3 = '<Prose ids="cl-db2011-aggregation-information cl-db2011-missing-and-zero" />';
    expected = expected
      .replace(t1, () => `${t1}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
      .replace(t2, () => `${t2}\n\n<Prose ids="${s2aIds.join(' ')}" />`)
      .replace(t3, () => `${t3}\n\n<Prose ids="${s2bIds.join(' ')}" />\n\n${expectedTable1Mdx}`);
  } else if (path === 'content/docs/book/review-support-and-version-boundaries.mdx') {
    const t1 = '<Prose ids="cl-db2011-review-relative-to-criteria cl-db2011-review-questions cl-db2011-validation-context" />';
    const t2 = '<Prose ids="cl-db2011-recommendation-strength cl-db2011-review-of-guidance" />';
    const t3 = '<Prose ids="cl-db2011-versioned-confidence cl-db2011-conditional-use" />';
    expected = expected
      .replace(t1, () => `${t1}\n\n<Prose ids="${s3aIds.join(' ')}" />`)
      .replace(t2, () => `${t2}\n\n<Prose ids="${s3bIds.join(' ')}" />`)
      .replace(t3, () =>
        '<Prose ids="cl-db2011-versioned-confidence" />\n\n'
        + `<Prose ids="${s4Ids.join(' ')}" />\n\n`
        + `${expectedTable2Mdx}\n\n`
        + '<Prose ids="cl-db2011-conditional-use" />');
  }
  if (expected !== actualMdx) {
    throw new Error(`Data applicability comparison changed protected B25 MDX text or its scoped additions: ${path}`);
  }
}

const priorSourceAppends = Object.freeze({
  'src-book-ilcd-2010':
    ' 2026-11-19（数据适用性比较单元）同载体另核第 2 章规定条款 I 印第 18 页、第 6.3 节印第 59 页、第 6.11 节印第 148—149 页、第 10.3.4 节印第 310 页、第 11 章印第 321—322 页及第 12.2—12.4 节印第 324—336 页（含脚注 213 固有代表性与外部适配度区分、图 28 精密度与准确度及 80% 装载率货运变异性说明、表 5—6 六项指标与未评 5 分／不适用 0 分规则、式 3 最弱项五倍权重、表 7 仅设三档上限至 4 以及表 8 算例 23/9=2.56 与表 9 五维合规方面）。',
  'src-kb44-ec2021':
    ' 2026-11-19（数据适用性比较单元）同载体另核附件一第 4.6.3—4.6.5.8 节（公报第 79—86 页：次级数据四级优先序、旧版转换数据集归为代理数据、入门级代理不超过单一总分 10% 且免重算 DQR、物料／能量／环境影响累计 3.0% 截断、表 20—22 四项 GeR 等指标与式 19—20、公司特定数据 80% 权重与 DQR 不超过 1.5、表 24—25 数据需求矩阵三情境与情境 2 选项 2 地域分下调 30%）及第 8.1—8.5.3 节（公报第 95—102 页：第 8.3.1 节与表 32 验证员至少 6 分资格、初级数据强制现场核查、Look@LCI 偏差 1% 以内、3 年最长有效期与单类恶化超 10.0% 或总分恶化超 5.0% 强制更新阈值）。',
  'src-loc137-ef-guide-2020':
    ' 2026-11-19（数据适用性比较单元）同载体另核第 5.2.17 节（印第 25—27 页：式 F.1 采用符号 GR、按单一总分前 80% 贡献重标定为 37.5% 与 62.5% 加权、单项加权得分上限 3.0 及方法学与完整性填“Not applicable”）、第 5.4—5.4.2 节（印第 27—29 页：中心数据集标部分终止系统，非主要支撑子过程标单工序单元过程、免独立评审与 DQR 且严禁单独复用）及第 8.1—8.3 节表 3—5（印第 38—42 页：仅允许类型 1 与类型 2 独立含外部联合评审、否决单人外部评审类型 4，并规定 Look@LCI 偏差超 1% 不合规）。',
  'src-tox123-ef31-addendum':
    ' 2026-11-19（数据适用性比较单元）同载体另核印第 2—5 页：确认 EF 3.1 更新直接改变过程数据集内嵌影响评价结果元素但保持第 5.2.16 节结构要求，核实印第 4 页第 5.2.15 节表 1 强制并列 6 组（无类别规则时 5 组）合规系统及各维度“Fully compliant”同“Not defined”精确填法，并记录印第 5 页红字标题将 Fazio 等 2020 年第 29 页支撑子过程条款第 5.4.2 节误印作第 5.4.1 节的原件编号差异。',
});

const priorReadingAdditions = Object.freeze({
  'rd-ilcd-2010': { passages: 3 },
  'rd-kb44-ec2021': { passages: 3 },
  'rd-loc137-ef-guide-2020': { passages: 3 },
  'rd-tox123-ef31-addendum': { passages: 1 },
});

const priorWorkAppends = Object.freeze({
  'lit-n03': {
    limitation:
      '2026-11-19（数据适用性比较单元）同载体追加核读第 2 章规定条款 I（印第 18 页）、第 6.3 节（印第 59 页）、第 6.11 节（印第 148—149 页）、第 10.3.4 节（印第 310 页）、第 11 章（印第 321—322 页）与第 12.2—12.4 节（印第 324—336 页，表 5—9、图 28、式 3），确认表 7 仅列三档（不设大于 4 至 5 的第四档）且第 11 章将具体交付物评审矩阵移交独立评审方案专卷；未单独获取该评审专卷原件。',
  },
  'lit-n04': {
    limitation:
      '2026-11-19（数据适用性比较单元）同载体追加核读附件一第 4.6.3—4.6.5.8 节（公报第 79—86 页，表 20—25、式 19—20）与第 8.1—8.5.3 节（公报第 95—102 页，表 32），核实 GeR 符号拼写、转换自旧 EF 合规体系的数据集视为代理数据、入门级代理 10% 上限与免重算 DQR、情境 2 选项 2 地域分下调 30%、初级数据现场核查、Look@LCI 1% 偏差及 3 年有效期内单类恶化超 10.0% 或总分恶化超 5.0% 强制更新规则，并保留第 8.2—8.3 节内交叉引用误印“Section 9.3.1 / 9.4”的原文笔误。',
  },
  'work-loc137-ef-guide-2020': {
    limitation:
      '2026-11-19（数据适用性比较单元）同载体追加核读第 5.2.17 节（印第 25—27 页，式 F.1、表 2）、第 5.4—5.4.2 节（印第 27—29 页）与第 8.1—8.3 节（印第 38—42 页，表 3—5），核实前 80% 单一总分贡献重标定、单项上限 3.0、支撑子过程禁止独立复用、仅批准类型 1 与类型 2 联合评审及 Look@LCI 1% 门槛，并保留印第 25 页“Nunc The DQR”与印第 26 页将“TiR-SD”误印为“TiR-AD”的原件排印瑕疵。',
  },
  'work-tox123-ef31-addendum': {
    limitation:
      '2026-11-19（数据适用性比较单元）同载体追加核读印第 2—5 页关于过程内嵌影响评价结果随 EF 3.1 变动、第 5.2.15 节表 1 六组合规声明固定映射及印第 5 页将原指南第 29 页第 5.4.2 节误印为第 5.4.1 节的原件核证。',
  },
});

const priorEvidenceLocatorSyncs = Object.freeze({
  'ev-db2011-audience': { from: '印刷 pp44–46；PDF indexes45–47；§§1.3.1–1.5 选段', to: '第 1.3.1—1.5 节选段（印第 44—46 页）' },
  'ev-db2011-support-language': { from: '印刷 p45；PDF index46；§1.3.3续文及§1.3.4', to: '第 1.3.3 节续文及第 1.3.4 节（印第 45 页）' },
  'ev-db2011-goal': { from: '印刷 pp54–55；PDF indexes55–56；Chapter2开头及§2.1', to: '第 2 章篇首及第 2.1 节（印第 54—55 页）' },
  'ev-db2011-validation': { from: '印刷 pp61–64；PDF indexes62–65；§§2.3–2.3.4', to: '第 2.3—2.3.4 节（印第 61—64 页）' },
  'ev-db2011-documentation': { from: '印刷 pp86–88；PDF indexes87–89；§§4.1–4.2.2', to: '第 4.1—4.2.2 节（印第 86—88 页）' },
  'ev-db2011-quality-dimensions': { from: '印刷 pp87–88；PDF indexes88–89；§4.2.1.5及Table4.1', to: '第 4.2.1.5 节及表 4.1（印第 87—88 页）' },
  'ev-db2011-aggregation-gaps': { from: '印刷 p89；PDF index90；§§4.2.3–4.2.4', to: '第 4.2.3—4.2.4 节（印第 89 页）' },
  'ev-db2011-review-purpose': { from: '印刷 pp89–91；PDF indexes90–92；§§4.3–4.3.6，含p90脚注', to: '第 4.3—4.3.6 节及第 90 页脚注（印第 89—91 页）' },
  'ev-db2011-review-record': { from: '印刷 pp91–93；PDF indexes92–94；§§4.3.6–4.3.8；Table4.2', to: '第 4.3.6—4.3.8 节与表 4.2（印第 91—93 页）' },
  'ev-db2011-local-definitions': { from: '印刷 p93；PDF index94；footnote3及§4.4', to: '第 4.4 节及脚注 3（印第 93 页）' },
  'ev-db2011-change': { from: '印刷 pp94–95；PDF indexes95–96；§§4.4.2–4.4.4', to: '第 4.4.2—4.4.4 节（印第 94—95 页）' },
  'ev-db2011-own-review': { from: '印刷 pp145–149；PDF indexes146–150；Annex2，重点pp147–149', to: '附录 2（印第 145—149 页，重点见印第 147—149 页）' },
  'ev-db2011-use-examples': { from: 'p61，§2.2.5续文中Scope下的Example1/2', to: '第 2.2.5 节续文适用范围下的示例 1—2（印第 61 页）' },
  'ev-db2011-conditional-consistency': { from: 'p63 Table2.1末行；p64 §2.3.4', to: '表 2.1 末行（印第 63 页）与第 2.3.4 节（印第 64 页）' },
  'ev-kb44-ec-transition2026-scope': { from: '§1 数据短缺、过渡适用与期限', to: '第 1 节数据短缺、过渡适用与期限（印第 6—7 页）' },
  'ev-kb44-ec-transition2026-hierarchy': { from: '§2.2 与委员会正式合作制定的 PEFCR/OEFSR', to: '第 2.2 节与委员会正式合作制定的类别及部门规则（印第 9—10 页）' },
});

const expectedPriorClaimSyncs = Object.freeze({
  'cl-db2011-user-and-manager': {
    from: '数据库里已有一份煤电数据，能用它表示目标产品所用的电力吗？2011 年 UNEP/SETAC 数据库指南分别说明三方应做什么：开发者记录数据如何形成，管理者维护共同条件并传达相关信息，使用者根据自己的研究目标判断数据是否适用。即使数据符合入库要求，使用者仍须核对它能否代表研究所需的供电过程。',
    to: '数据库里已有一份煤电数据，能用它表示目标产品所用的电力吗？2011 年联合国环境规划署与国际环境毒理学和化学学会（UNEP/SETAC）数据库全球指导原则分别说明三方应做什么：开发者记录数据如何形成，管理者维护共同条件并传达相关信息，使用者根据自己的研究目标判断数据是否适用。即使数据符合入库要求，使用者仍须核对它能否代表研究所需的供电过程。',
    fromScope: 'UNEP2011 数据链角色与使用责任',
    toScope: '2011 年 UNEP/SETAC 数据库指南界定的数据链三方角色与使用责任',
    fromPremises: [],
    toPremises: ['cl-sustainability-explicit-aggregation-conditions'],
  },
  'cl-db2011-represented-object': {
    from: '先看数据中的“燃煤发电”指哪一种过程。记录可能来自一座电厂，也可能是行业平均值。要知道它代表什么，需要了解技术、地域、时期、活动边界和预期用途。指南把这些信息列入单位过程数据集的目标与范围，让开发者据此收集资料，也让使用者能把数据所代表的过程与研究所需的过程对照。这沿用了完整 LCA 界定目标与范围的思路，具体规定的是一个数据集的目标与范围。',
    to: '先看数据中的“燃煤发电”指哪一种过程。记录可能来自一座电厂，也可能是行业平均值。要知道它代表什么，需要了解技术、地域、时期、活动边界和预期用途。指南把这些信息列入单位过程数据集的目标与范围，让开发者据此收集资料，也让使用者能把数据所代表的过程与研究所需的过程对照。这沿用了完整生命周期评价（LCA）界定目标与范围的思路，具体规定的是一个数据集的目标与范围。',
    fromScope: '该指南单位过程数据集的目标范围',
    toScope: '2011 年 UNEP/SETAC 数据库指南单位过程数据集的目标与范围',
    fromCaveats: ['同名过程不证明数据库连接适用；指南的说明也不是独立核验的 ISO 条文。'],
    toCaveats: ['同名过程不证明数据库连接适用；指南的说明也不是独立核验的国际标准化组织（ISO）标准条文。'],
  },
  'cl-db2011-scope-examples': {
    fromScope: '2011指南p61的两个说明性数据集例子及其对象/覆盖区别；不是当前数据库质量判断。',
    toScope: '2011 年 UNEP/SETAC 指南印第 61 页的两个说明性数据集示例及其对象与覆盖区别',
    fromCaveats: [
      '第二例在来源中列出CML1992的全球变暖、臭氧消耗、酸化和富营养化用途；这里不把这些历史范围升级为现行方法适用性。',
      '指南例子没有提供可复算数据文件或实际质量测量。',
    ],
    toCaveats: [
      '第二例在来源中列出荷兰莱顿大学环境科学中心（CML）1992 年方法的全球变暖、臭氧消耗、酸化和富营养化用途；这里不把这些历史范围升级为现行方法适用性。',
      '指南示例没有提供可复算数据文件或实际质量测量。',
    ],
  },
  'cl-db2011-representativeness-and-precision': {
    fromScope: '由本版数据质量维度和数据集范围形成的解释',
    toScope: '由 2011 年 UNEP/SETAC 指南数据质量维度和数据集范围形成的解释',
    fromCaveats: ['表格是该指南的适配版本，不能代替 ISO 原表；质量维度的说明不提供实际精度或代表性测量。'],
    toCaveats: ['表格是该指南的适配版本，不能代替 ISO 原始附表；质量维度的说明不提供实际精密度或代表性测量。'],
  },
  'cl-db2011-missing-and-zero': {
    fromScope: 'UNEP2011 对LCI数据缺口的建议',
    toScope: '2011 年 UNEP/SETAC 指南对生命周期清单（LCI）数据缺口的建议',
    fromCaveats: ['该建议讨论LCI数据缺失；没有直接规定某种LCIA因子四状态数据模型。'],
    toCaveats: ['该建议讨论生命周期清单数据缺失；没有直接规定某种生命周期影响评价（LCIA）因子四状态数据模型。'],
  },
  'cl-db2011-documenting-number': {
    fromScope: 'UNEP2011 文档建议及透明度取舍',
    toScope: '2011 年 UNEP/SETAC 指南文档建议及商业保密与工作量取舍',
  },
  'cl-db2011-aggregation-information': {
    fromScope: '该指南聚合过程数据集的文档建议',
    toScope: '2011 年 UNEP/SETAC 指南聚合过程数据集的文档建议',
  },
  'cl-db2011-review-relative-to-criteria': {
    from: '拿到审查记录，先看审查的是单个数据集还是整个产品研究，再看采用的是入库准则还是拟开展的研究要求。2011 年 UNEP/SETAC 数据库指南允许新数据库的管理者评估先前的审查是否足够，并在需要时追加审查。使用者可以利用已经按明确准则完成的工作，仅凭 reviewed 标签还无法判断审查是否涉及当前研究的问题。',
    to: '拿到审查记录，先看审查的是单个数据集还是整个产品研究，再看采用的是入库准则还是拟开展的研究要求。2011 年联合国环境规划署与国际环境毒理学和化学学会（UNEP/SETAC）数据库指南允许新数据库的管理者评估先前的审查是否足够，并在需要时追加审查。使用者可以利用已经按明确准则完成的工作，仅凭“已审查”（reviewed）标签还无法判断审查是否涉及当前研究的问题。',
    fromScope: '本指南数据集审查的对象与准则',
    toScope: '2011 年 UNEP/SETAC 指南数据集审查的对象与准则',
    fromCaveats: ['p90 对完整公开比较研究另有脚注限定；指南引述不替代相应 ISO 要求。'],
    toCaveats: ['印第 90 页对完整公开比较研究另有脚注限定；指南引述不替代相应国际标准要求。'],
    fromPremises: [],
    toPremises: ['cl-dapp147-weakest-link-vs-mean-and-80pct-masking'],
  },
  'cl-db2011-validation-context': {
    from: '同一个检查术语在不同章节中可能有不同的用途。2011 年指南第 2 章用 validation 讨论单位过程数据集怎样表示实际过程，列举了完整性、合理性、敏感性和一致性等检查。第 4 章图 4.1 的脚注另行限定了本章用语：validation 可以是按准则进行的手工或自动核对，review 则是独立、系统且有记录的人工审查。要确定审查做过什么，应回到各处实际讨论的对象和检查内容。',
    to: '同一个检查术语在不同章节中可能有不同的用途。2011 年指南第 2 章用“验证”（validation）讨论单位过程数据集怎样表示实际过程，列举了完整性、合理性、敏感性和一致性等检查。第 4 章图 4.1 的脚注另行限定了本章用语：“验证”（validation）可以是按准则进行的手工或自动核对，“审查”（review）则是独立、系统且有记录的人工审查。要确定审查做过什么，应回到各处实际讨论的对象和检查内容。',
    fromScope: 'UNEP2011 两处有范围限定的术语使用',
    toScope: '2011 年 UNEP/SETAC 指南两处有范围限定的检查与审查用语',
  },
  'cl-db2011-review-questions': {
    fromScope: 'UNEP2011 审查记录和异常说明',
    toScope: '2011 年 UNEP/SETAC 指南审查记录和异常说明',
  },
  'cl-db2011-recommendation-strength': {
    from: '2011 年指南区分强烈推荐、推荐和建议，并说明其指导文字中的 shall 表示强烈推荐。它也保留有事实、科学论证或实际应用支持的少数意见。所获支持的程度不同，建议的分量也可以不同。使用者可借此了解当时已有的共同实践。要确定今天适用的要求，须查相应的标准。这份指南也并未穷尽可行做法。',
    to: '2011 年指南区分强烈推荐、推荐和建议，并说明其指导文字中的“应”（shall）表示强烈推荐。它也保留有事实、科学论证或实际应用支持的少数意见。所获支持的程度不同，建议的分量也可以不同。使用者可借此了解当时已有的共同实践。要确定今天适用的要求，须查相应的标准。这份指南也并未穷尽可行做法。',
    fromScope: '该2011指南推荐语言与支持程度',
    toScope: '2011 年 UNEP/SETAC 指南推荐用语与支持程度',
    fromCaveats: [
      '这是该文件的语言规则，不自行决定法律效力，也不能推出 EU 方法或 ISO 的全部要求。',
      '引用的外部要求仍须按相应原版本确认。',
    ],
    toCaveats: [
      '这是该文件的用语规则，不自行决定法律效力，也不能推出欧盟方法或国际标准的全部要求。',
      '引用的外部要求仍须按相应原版本确认。',
    ],
  },
  'cl-db2011-review-of-guidance': {
    fromScope: 'UNEP2011 Annex2的评价和覆盖范围',
    toScope: '2011 年 UNEP/SETAC 指南附录 2 同行评审报告的评价与覆盖范围',
  },
  'cl-db2011-versioned-confidence': {
    fromScope: '由数据更新与限定审查范围形成的解释',
    toScope: '由数据更新类型与限定审查范围形成的可延续性解释',
  },
  'cl-db2011-conditional-use': {
    from: '资料不足时，若数据与研究的目标和范围足够一致，指南允许在别无更合适资料时用它补缺。使用者应逐项说明采用的理由，并记录不一致之处会影响什么。同一份煤电数据因此可能在明确条件下适用于一项计算，却因缺少必要输入而不适用于另一项。选择数据时，应能说明它代表什么、为什么仍可采用或需要另选，以及更好的资料会改变哪一步。下一章继续区分两类问题：现有观测能把数值估到多准，模型是否包含所需的过程。',
    to: '综合过程数据的表示角色与语境代表性、质量聚合算式（详见《过程数据的用途》或本章前两节）以及审查合规、换版补缺五重边界：资料不足时，唯有数据与研究的目标和范围足够一致且别无更合适资料，指南才允许有条件补缺，并要求使用者逐项说明采用理由、记录不一致或缺失之处会影响哪些类别。同一份煤电数据因此可能在明确条件下适用于一项计算，却因技术失配、语境越界或缺少重金属等关键输入而不适用于另一项。选择数据时，应能说明它代表什么、为什么仍可采用或需要另选，以及更好的资料会改变哪一步。后文《变异与不确定性》将继续区分现有观测能把数值估到多准与模型是否包含所需过程，《质量评分与概率》专门检验经验谱系矩阵（Pedigree Matrix）方差同实测分布的校准，《产品足迹规则》再讨论类别规则如何约束公开比较声明。',
    fromScope: '由2011指南目标范围、一致性、文档、审查与更新建议形成的作者综合；不构成通用适用性认证程序。',
    toScope: '由数据表示对象、质量聚合边界、审查准则与换版补缺阶梯共同形成的章末条件使用综合',
    fromCaveats: [
      '允许逐项论证不等于所有不一致或遗漏都可接受，也不替代特定研究的适用规则、敏感性或不确定性分析。',
      '本段没有核验任何现实数据集、当前数据库或未读ISO原条款。',
    ],
    toCaveats: [
      '允许逐项论证不等于所有不一致或遗漏都可接受，也不替代特定研究的适用规则、敏感性或不确定性分析。',
      '本段综合各公开指南与方法规范的适用性边界，不代替针对具体现实数据集的现场核验或付费国际标准条文审阅。',
    ],
    fromPremises: [
      'cl-db2011-represented-object',
      'cl-db2011-missing-and-zero',
      'cl-db2011-documenting-number',
      'cl-db2011-review-relative-to-criteria',
      'cl-db2011-review-questions',
      'cl-db2011-versioned-confidence',
    ],
    toPremises: [
      'cl-db2011-represented-object',
      'cl-db2011-documenting-number',
      'cl-db2011-missing-and-zero',
      'cl-dapp147-weakest-link-vs-mean-and-80pct-masking',
      'cl-db2011-review-relative-to-criteria',
      'cl-db2011-review-questions',
      'cl-db2011-versioned-confidence',
      'cl-dapp147-proxy-hierarchy-cutoff-and-part6-bridge',
    ],
  },
});

const addedSourceIds = ['src-dapp147-ilcd-el-2012', 'src-dapp147-ecoinvent-v3-2013', 'src-dapp147-tidas-spec-v030'];
const addedReadingIds = ['rd-dapp147-ilcd-el-2012', 'rd-dapp147-ecoinvent-v3-2013', 'rd-dapp147-tidas-spec-v030'];
const addedWorkIds = ['work-dapp147-ilcd-el-2012', 'work-dapp147-ecoinvent-v3-2013', 'work-dapp147-tidas-spec-v030'];

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && Object.hasOwn(expectedPriorClaimSyncs, id))
      || (kind === 'evidence' && Object.hasOwn(priorEvidenceLocatorSyncs, id))
      || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
      || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
      || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  }
  if (kind === 'claims') return addedClaimIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-dapp147-');
  if (kind === 'sources') return addedSourceIds.includes(id);
  if (kind === 'readings') return addedReadingIds.includes(id);
  if (kind === 'literature') return addedWorkIds.includes(id);
  if (kind === 'queries') return id === 'q-dapp147-dataset-roles-dqr-review-compliance-and-packages-20261119';
  if (kind === 'gaps') return id === 'gap-dapp147-ilcd-review-schemes-and-ef-raw-nodes';
  return kind === 'revisions' && id === 'rev-dapp147-b25-data-applicability-comparison';
}

function qualifyPriorClaims(unit, records, catalog) {
  for (const [claimId, spec] of Object.entries(expectedPriorClaimSyncs)) {
    if (!records.has(`claims:${claimId}`)) {
      throw new Error(`Data applicability comparison missing actual record transition for ${claimId}`);
    }
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    const expected = {
      ...original,
      reviewedAt: dataApplicabilityComparisonCheckDate,
      ...(spec.to && { text: spec.to }),
      ...(spec.toScope && { scope: spec.toScope }),
      ...(spec.toPremises && { premiseIds: spec.toPremises }),
      ...(spec.toCaveats && { caveats: spec.toCaveats }),
    };
    if (!original || !current
        || (spec.from && original.text !== spec.from)
        || (spec.fromScope && original.scope !== spec.fromScope)
        || (spec.fromPremises && !sameScienceValue(original.premiseIds, spec.fromPremises))
        || (spec.fromCaveats && !sameScienceValue(original.caveats, spec.fromCaveats))
        || !sameScienceValue(current, expected)) {
      throw new Error(`Data applicability comparison modified unauthorized fields on ${claimId}`);
    }
    assertCleanDataApplicabilityProse(current.scope, `${claimId}.scope`);
    assertCleanDataApplicabilityProse(current.text, `${claimId}.text`);
    (current.caveats ?? []).forEach((cv, idx) => assertCleanDataApplicabilityProse(cv, `${claimId}.caveats[${idx}]`));
  }
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    assertCleanDataApplicabilityProse(append, `priorSourceAppends.${id}`);
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, checkedAt: dataApplicabilityComparisonCheckDate, scope: source.reading.scope + append },
    })) {
      throw new Error(`Data applicability comparison changed prior source identity or acquisition scope: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorEvidenceLocatorSyncs)) {
    assertCleanDataApplicabilityProse(spec.to, `priorEvidenceLocatorSyncs.${id}`);
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Data applicability comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-dapp147-'))
        || !sameScienceValue(current, { ...reading, passages: [...reading.passages, ...addedPassages] })) {
      throw new Error(`Data applicability comparison changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    assertCleanDataApplicabilityProse(spec.limitation, `priorWorkAppends.${id}.limitation`);
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    const expected = {
      ...work,
      lastCheckedAt: dataApplicabilityComparisonCheckDate,
      limitations: [...(work?.limitations ?? []), spec.limitation],
    };
    if (!work || !sameScienceValue(current, expected)) {
      throw new Error(`Data applicability comparison changed prior literature work identity: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanDataApplicabilityProse(w.title, `${wid}.title`);
    assertCleanDataApplicabilityProse(w.rights, `${wid}.rights`);
    assertCleanDataApplicabilityProse(w.discovery.reason, `${wid}.discovery.reason`);
    w.limitations.forEach((lm, idx) => assertCleanDataApplicabilityProse(lm, `${wid}.limitations[${idx}]`));
  }
  const gap = readings.gaps.find(row => row.id === 'gap-dapp147-ilcd-review-schemes-and-ef-raw-nodes');
  const rev = readings.revisions.find(row => row.id === 'rev-dapp147-b25-data-applicability-comparison');
  const query = literature.protocol.queries.find(row => row.id === 'q-dapp147-dataset-roles-dqr-review-compliance-and-packages-20261119');
  if (!gap || !rev || !query) throw new Error('Missing Unit 147 gap, revision or query');
  assertCleanDataApplicabilityProse(gap.description, 'gap-dapp147.description');
  assertCleanDataApplicabilityProse(gap.nextAction, 'gap-dapp147.nextAction');
  assertCleanDataApplicabilityProse(rev.reasoning, 'rev-dapp147.reasoning');
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Data applicability comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Data applicability comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Data applicability comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareDataApplicabilityComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  if (!sameScienceValue(unit.corrections, dataApplicabilityComparisonCorrections)) {
    throw new Error('Data applicability comparison unit contains unauthorized corrections');
  }
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Data applicability comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Data applicability comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Data applicability comparison must bind all three B25 MDX sources and only declared changes');
  }

  for (const route of dataApplicabilityComparisonSources) {
    const path = `content${route}.mdx`;
    const fileRow = fileChanges.get(path);
    const prevMdx = unit.previousFiles[path];
    if (fileRow?.from !== oldFileShas[path] || sha256(prevMdx ?? '') !== oldFileShas[path]) {
      throw new Error(`Data applicability comparison lacks independently preserved predecessor B25 MDX bytes: ${path}`);
    }
    const updatedLayout = dataApplicabilityComparisonLayout(
      unit,
      `B25:${route}:reader-source`,
      predecessorDataApplicabilitySource(route),
    );
    const actualMdx = files.get(path).toString();
    boundedMdxTransform(path, prevMdx, actualMdx, updatedLayout.source.description);
    const occ = collectChapterClaimOccurrences(actualMdx);
    if (!sameScienceValue(unit.occurrences[path], actual.sourceOccurrences[path])
        || !sameScienceValue(updatedLayout.occurrences.map(row => row.id), occ)) {
      throw new Error(`Data applicability comparison lacks exact B25 occurrences for: ${path}`);
    }
  }

  if (!addedClaimIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Data applicability comparison lacks exact record transitions for each new canonical claim');
  }

  const { catalog, readings, literature } = input;
  qualifyPriorClaims(unit, recordChanges, catalog);
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateDataApplicabilityComparisonFactors(catalog, readings);

  const previousRecords = restoreScientificRecords(
    { catalog, readings, literature },
    unit.rawRecords,
    unit.rawFields,
    recordChanges,
    allowsRaw,
  );
  for (const path of managedPaths) {
    files.set(path, Buffer.from(unit.previousFiles[path]));
  }
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== dataApplicabilityComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== dataApplicabilityComparisonPredecessorPin) {
    throw new Error('Data applicability comparison did not recover the independently observed raw c5b90b03 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Data applicability comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Data applicability comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...Object.keys(expectedPriorClaimSyncs), ...addedClaimIds])],
  };
}

export function effectiveDataApplicabilityComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    dataApplicabilityComparison: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || !exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || capture.manifestPaths !== 468
      || !scienceDigest(dataApplicabilityComparisonCapturePin)
      || editionDigest(capture) !== dataApplicabilityComparisonCapturePin) {
    return false;
  }
  if (!exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !/^[a-f0-9]{40}$/.test(capture.identity.sourceCommit ?? '')
      || !scienceDigest(capture.identity.manifestSha256)
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles)
      || !capture.normalization.articles.every(row => exactKeys(row, allowedNormArticleKeys))
      || !Array.isArray(capture.normalization.publicHtml)
      || !capture.normalization.publicHtml.every(row => exactKeys(row, allowedNormHtmlKeys))
      || !Array.isArray(capture.files) || !capture.files.length
      || !unique(capture.files, file => file?.path)
      || !capture.files.every(file => exactKeys(file, allowedCaptureFileKeys) && scienceText(file.path)
        && scienceDigest(file.sha256) && Number.isSafeInteger(file.bytes) && file.bytes > 0)) {
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

export function verifyDataApplicabilityComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${dataApplicabilityComparisonId}/${row.kind}`;
    if (row.date < dataApplicabilityComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function dataApplicabilityComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || !dataApplicabilityComparisonRoutes.includes(route)) return undefined;
  if (print && route !== 'book-data-applicability') return undefined;
  if (!print && route === 'book-data-applicability') return undefined;
  if (route === '/docs/book/database-fitness-and-documentation' && index !== 0) return undefined;
  if ((route === '/docs/book/review-support-and-version-boundaries' || route === 'book-data-applicability')
      && index !== 0 && index !== 1) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-dapp-147-ordinary-${index}`;
}

export function dataApplicabilityComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-dapp-147-ordinary-(?:0|1)$/;
export function observeDataApplicabilityComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validateDataApplicabilityComparisonCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-data-applicability-comparison-correction]');
  const expectedRows = !unit
    ? []
    : dataApplicabilityComparisonCorrections.filter(row =>
        path === '/print' ? row.chapter === 'book-data-applicability' : path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Data applicability comparison correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-data-applicability-comparison-correction') === claimId);
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
        || marker.tagName !== 'P' || marker.parentNode !== note || marker.nextElementSibling !== null
        || !attrs(marker, 'class', 'data-data-applicability-comparison-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== dataApplicabilityComparisonSource.date
        || !singleTextChild(time, dataApplicabilityComparisonSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(dataApplicabilityComparisonSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Data applicability comparison correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyDataApplicabilityComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeDataApplicabilityComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Data applicability comparison',
    routes: dataApplicabilityComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: dataApplicabilityComparisonHistoryControls(unit),
    source: dataApplicabilityComparisonSource,
    attribute: 'data-applicability-comparison',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Data applicability comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Data applicability comparison actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateDataApplicabilityComparisonCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function dataApplicabilityComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreDataApplicabilityComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
