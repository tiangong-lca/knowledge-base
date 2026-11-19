import capture from '../config/reader-product-footprint-comparison-capture.json' with { type: 'json' };
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
  assertCleanProductFootprintProse,
  pfrCarriers,
  requiredPfrClaims,
  requiredPfrPassages,
  validateProductFootprintComparisonFactors,
} from './reader-product-footprint-comparison-factors.mjs';

export const productFootprintComparisonId = 'product-footprint-comparison-151';
export const productFootprintComparisonRoute = '/docs/book/product-footprint-rules-and-practice';
export const productFootprintComparisonRoutes = Object.freeze([productFootprintComparisonRoute]);
export const productFootprintComparisonCheckDate = '2026-11-19';
/** @type {string|null} */
export const productFootprintComparisonUnitPin = '2193f0fd3fc47b338144b8ad4e1f6557b955528f9fec8c373c43294c12eba6dc';
/** @type {string|null} */
export const productFootprintComparisonCapturePin = 'f1c7d9acfbda8904faf923a3ab8424ce15d72e14becab25c92b0efeb5a105e5f';
export const productFootprintComparisonSource = Object.freeze({
  commit: '3c6844be00ad3d39be3199ffbb257324a5daab79',
  tree: '5aaabed2ad033503ba27b1ba2feae3b22a0f305d',
  manifest: '30730a85341d4f51e272152dfe1e53ead432ba07219de9396601d990f77bb92d',
  date: '2026-11-19',
});
export const productFootprintComparisonPredecessorPin = '67e55709d2c0b1a9c597891f36df8782985db22756b1b585e5d7e1b1d80c45d6';
const addressPin = 'cf71509126eeb50568fb21e03149351be4261f0ee246ced6bdb7681bd9512876';

const oldFileShas = Object.freeze({
  'content/docs/book/product-footprint-rules-and-practice.mdx': '6b33128bd63da692de45382f234beeddfa7af9eb2ea5657a1adff7c001075338',
});
const managedPaths = Object.keys(oldFileShas);
const addedClaimIds = Object.freeze(Object.keys(requiredPfrClaims));
const addedSourceIds = new Set(Object.values(pfrCarriers).map(c => c.sourceId));
const addedReadingIds = new Set(Object.values(pfrCarriers).map(c => c.readingId));
const addedEvidenceIds = new Set(Object.keys(requiredPfrPassages));
const addedClaimIdSet = new Set(addedClaimIds);
const addedWorkIds = Object.freeze([
  'work-pfr151-ghgp-2011',
  'work-pfr151-eu-2023-1542',
  'work-pfr151-eu-2024-1781',
]);
const addedWorkIdSet = new Set(addedWorkIds);

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
        && productFootprintComparisonRoutes.includes(row.route) && scienceDigest(row.sha256) && row.tag === 'P')
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
    throw new Error('Product footprint comparison unit envelope contains missing, extraneous or malformed properties');
  }
}

export function selectProductFootprintComparison(config, pin = productFootprintComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1 || !['inactive', 'preview', 'reviewed'].includes(config.status)) {
    throw new Error('Invalid product footprint comparison configuration');
  }
  if (config.status === 'inactive') {
    if (pin !== null || config.unit !== null) {
      throw new Error('Inactive product footprint comparison requires null pin and null unit');
    }
    return null;
  }
  const unit = config.unit;
  if (!plainObject(unit) || unit.id !== productFootprintComparisonId || !scienceText(unit.rationale)) {
    throw new Error('Invalid product footprint comparison unit identity');
  }
  if (!sameScienceValue(unit.source, productFootprintComparisonSource) || !sameScienceValue(unit.routes, productFootprintComparisonRoutes)) {
    throw new Error('Product footprint comparison source or routes mismatch');
  }
  if (config.status === 'preview') {
    if (!preview || pin !== null) throw new Error('Product footprint comparison is not independently accepted');
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  assertUnitEnvelopeKeys(unit, true);
  if (!scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Product footprint comparison unit pin mismatch');
  }
  return unit;
}

const priorEvidenceLocatorUpdates = Object.freeze({
  'ev-kb44-ec2021-scope': { from: '推荐主文 §§1.1–1.3、2(a)、2(e)、3.1、4.1、7.1', to: '推荐主文第 1.1—1.3、2(a)、2(e)、3.1、4.1、7.1 点' },
  'ev-kb44-ec2021-category': { from: 'Annex I §§1–1.1；Annex II Part A 开头', to: '附件一第 1—1.1 节；附件二 A 部分开头' },
  'ev-kb44-dairy2025-identity': { from: '封面及第3–5页，§§1–2.7，第28–35页', to: '封面、印第 3—5 页及第 1—2.7 节（印第 28—35 页）' },
  'ev-kb44-ec2021-fu-boundary': { from: 'Annex II §§A.3.2.3–A.3.2.5，代表产品、功能单位、参考流与边界', to: '附件二第 A.3.2.3—A.3.2.5 节（代表产品、功能单位、参考流与边界）' },
  'ev-kb44-ec2021-rp-definition': { from: 'Annex II §A.2.3，代表产品定义', to: '附件二第 A.2.3 节（代表产品定义）' },
  'ev-kb44-ec2021-model': { from: 'Annex II §§A.2.10–A.2.10.1，最终草案提交与代表产品 Excel 模型', to: '附件二第 A.2.10—A.2.10.1 节（最终草案提交与代表产品 Excel 模型）' },
  'ev-kb44-ec2021-revision': { from: 'Annex II §A.2，部分修订条件与流程', to: '附件二第 A.2 节（部分修订条件与流程）' },
  'ev-kb44-dairy2018-authorities': { from: '§2.7 Conformance to other documents', to: '第 2.7 节（与其他文件的符合性）' },
  'ev-kb44-dairy2018-use': { from: '§6.5 Use stage；Table 44，液态奶列 Dishwashing 行', to: '第 6.5 节（使用阶段）；表 44 液态奶列洗涤行' },
  'ev-kb44-ec2021-use': { from: 'Annex I §4.4.7，使用阶段建模要求（至 §4.4.7.1 之前）', to: '附件一第 4.4.7 节（使用阶段建模要求，至第 4.4.7.1 节之前）' },
  'ev-kb44-ec2021-results': { from: 'Annex II §A.5.1 Benchmark', to: '附件二第 A.5.1 节（基准值）' },
  'ev-kb44-ec2021-review': { from: 'Annex II §§A.2.9.1–.2、A.2.9.3–.4，类别规则审查的对象、准则和报告', to: '附件二第 A.2.9.1—A.2.9.4 节（类别规则审查的对象、准则与报告）' },
  'ev-kb44-ec2021-verification': { from: 'Annex I §§8.1、8.4–8.4.1、8.5.1–8.5.3；Annex II §§A.8.1–A.8.3.3，研究层验证', to: '附件一第 8.1、8.4—8.4.1、8.5.1—8.5.3 节；附件二第 A.8.1—A.8.3.3 节（研究层验证）' },
  'ev-kb44-dairy2018-review': { from: '§2.4 Review statement，评审结论和最后一项限制', to: '第 2.4 节（审查声明、评审结论与最后一项限制）' },
  'ev-kb44-dairy2018-methane': { from: '§5.2.1；Table 21 肠内发酵甲烷行与表注1', to: '第 5.2.1 节；表 21 肠内发酵甲烷行与表注 1' },
  'ev-kb44-dairy2025-methane': { from: '§5.2.1，第76页；Table21第79页与脚注1第84页', to: '第 5.2.1 节（印第 76 页）；表 21（印第 79 页）与脚注 1（印第 84 页）' },
  'ev-kb44-nordic2023-design': { from: '§§2.1–2.2、§3.2 开头、Tables 4–5', to: '第 2.1—2.2 节、第 3.2 节开头及表 4—5' },
  'ev-kb44-nordic2023-awg': { from: '§3.2.1.1 Animal working group，日排放预测式', to: '第 3.2.1.1 节（动物工作组日排放预测式）' },
  'ev-kb44-niu2018-evaluation': { from: '§2.3 Cross-validation and model evaluation；Table 2 Eq. (3) 与表注 b–d', to: '第 2.3 节（交叉验证与模型评估）；表 2 式 (3) 与表注 b—d' },
  'ev-kb44-nordic2023-limits': { from: 'Fig. 2 结果说明与 §4 末段', to: '图 2 结果说明与第 4 节末段' },
  'ev-kb44-dairy2025-comparisons': { from: '§3.6，第59–60页', to: '第 3.6 节（印第 59—60 页）' },
  'ev-kb44-dairy2018-comparisons': { from: '§3.6 Limitations，同亚类比较声明与原奶来源数据', to: '第 3.6 节（限制条件：同亚类比较声明与原奶来源数据）' },
});

const expectedDescription =
  'description: 从一升牛奶的冷藏和洗涤出发，核对类别规则、活动用量、发布的气候结果及审查范围，并横向比较欧盟自愿产品环境足迹（PEF）、温室气体核算体系（GHG Protocol）产品标准与具有直接法律约束力的欧盟电池法规和生态设计法规（ESPR），再用甲烷算法说明比较声明的共同条件。';

const expectedTable1Mdx = `| 规则体系与文本 | 法律效力与发布主体 | 适用范围与主要豁免 | 影响类别与指标 | 分析单位与生命周期边界 | 声明用途与准入门槛 |
| --- | --- | --- | --- | --- | --- |
| 欧盟建议书 (EU) 2021/2279 与乳制品产品环境足迹类别规则（PEFCR） | 无强制约束力建议（《欧盟运行条约》TFEU 第 288 条）；欧盟委员会 / 行业技术秘书处 | 通用 PEF 与组织环境足迹（OEF）方法及具体类别规则（如液态奶等乳制品） | 多类别环境足迹（含气候变化等 16 类指标，可归一化加权） | 功能单位与代表产品基准；含默认使用阶段（家用冷藏与洗涤） | 仅按同版规则与验证条件支持基准对照与比较，不自动产生法定准入 |
| 温室气体核算体系（GHG Protocol）产品标准（2011） | 自愿核算标准；世界资源研究所（WRI）与世界可持续发展工商理事会（WBCSD）联合发布 | 各类商品与服务的生命周期温室气体核算 | 单一气候指标（6 类京都温室气体，100 年全球增温潜势 GWP；不应代称整体环境表现） | 最终产品须用功能单位＋摇篮到坟墓；中间产品用参考流＋摇篮到大门 | 原样仅支持同产品跨期追踪；不支持国际标准化组织（ISO）14044 比较断言，采购比较需配产品规则 |
| 欧盟电池法规 (EU) 2023/1542 | 直接适用全成员国之强制法规（第 96 条）；欧洲议会与理事会 | 电动汽车、容量大于 2 kWh 可充电工业与轻型交通工具电池（按厂按型号） | 单一气候变化特征化结果（不作归一化与加权，遵循 PEF 气候方法） | 寿命期总供电量 1 千瓦时（kWh，备用电池 1 千瓦分 kWmin）；覆盖 4 阶段并排除使用阶段 | 三阶段强制市场准入：申报 → 性能分级（每 3 年复核）→ 法定最高限值 |
| 欧盟生态设计法规 (EU) 2024/1781（ESPR） | 直接适用全成员国之框架法规（第 80 条）；欧洲议会与理事会 | 含零部件与中间品的实物商品；排除食品、饲料、药品、活体及专项机动车 | 授权法案可设定碳足迹或环境足迹（择用 PEF 2021/2279 或国际标准） | 由各产品组授权法案逐类规定（通常给予至少 18 个月过渡期） | 授权法案确立强制披露/性能门槛并绑定数字产品护照（中央库 2026-07-19 前建成） |`;

const expectedTable2Mdx = `| 比较维度 | 乳制品 PEFCR（欧盟 PEF 体系） | GHG Protocol 产品标准（2011） | 欧盟电池法规 (EU) 2023/1542 | 欧盟 ESPR (EU) 2024/1781 与未检视付费标准边界 |
| --- | --- | --- | --- | --- |
| 使用阶段与非归因过程 | 强制纳入默认家用冷藏与洗涤活动，受类别规则参数约束 | 最终产品强制摇篮到坟墓；资本品、管理费用、研发与通勤默认非归因可排除 | 附件二明确排除使用阶段（除非设计显著影响），仅算原材料、生产、分销与报废 | ESPR 按产品组授权法案定边界；ISO 14067 / EN 15804 细则须查授权原文 |
| 生物源、土地利用与抵消 | 遵循环境足迹（EF）方法与类别规则（如甲烷方程须全链一致） | 生物源与 20 年/单次收获期直接 LUC 分列（iLUC 非强制）；禁用延迟折算、抵消与避免排放 | 附件二第 7 点严禁将碳抵消计入碳足迹声明（仅可另作附加环境信息） | ESPR 序言第 23 条提及临时碳储等方法考量，具体规则待授权法案落定 |
| 活动数据与截断门槛 | 区分企业特定数据与 EF 次级数据集，受过渡指导约束 | 归因过程无统一百分比截断，须同时满足缺口、无代理、不显著 3 条件并披露 | 5 大核心部件强制采用具体工厂特定活动数据，禁用默认值且禁止跨厂抽样 | 视具体授权法案而定；数字产品护照绑定唯一产品、经营者与设施标识 |
| 审查、鉴证与合格评定 | 类别规则评审小组审查＋研究层独立验证员验证 | 允许第一方或第三方独立鉴证，区分有限保证（消极意见）与合理保证（积极意见） | 禁用模块 A 自我声明；强制第三方公告机构按模块 D1（定期审核、可不定期抽查）或模块 G 评定 | 依授权法案规定合格评定路径；付费标准认证细则须核现行授权文本 |
| 比较声明与企业核算接口 | 比较声明须统一甲烷算法、规则版本、功能单位与验证范围 | 不支持比较断言；产品清单之和须加非归因范围三类别方近似企业范围一二三总量 | 通过法定统一计算与公告机构核验支撑跨型号性能分级与最高限值合规 | ESPR 比较与披露口径待授权法案确立；ISO 14067:2018、ISO 14025:2006、EN 15804+A2、GB/T 24067-2024 付费正文留作开放边界 |`;

function boundedMdxTransform(prevMdx, actualMdx) {
  assertCleanProductFootprintProse(actualMdx, managedPaths[0]);
  const expected = prevMdx
    .replace(
      'description: 从一升牛奶的冷藏和洗涤出发，核对类别规则、活动用量、发布的气候结果及审查范围，再用两种甲烷算法说明乳制品 PEF 研究的比较声明为何要用同一种排放计算方法。',
      expectedDescription,
    )
    .replace(
      '<Prose ids="cl-rule-opening cl-rule-force cl-rule-category cl-rule-rp cl-rule-issuer cl-rule-version cl-rule-validity" />',
      `<Prose ids="cl-rule-opening cl-rule-force cl-rule-category cl-rule-rp cl-rule-issuer cl-rule-version cl-rule-validity cl-pfr151-binding-batteries cl-pfr151-espr-dpp-conversion" />\n\n${expectedTable1Mdx}`,
    )
    .replace(
      '<Prose ids="cl-rule-use-boundary cl-rule-default cl-rule-wash-cycles cl-rule-wash-inputs cl-rule-results-layer cl-rule-use-result cl-rule-report-split cl-rule-quantity-scale cl-rule-capital-gap cl-rule-storage-gap cl-rule-reconstruction-limit" />',
      '<Prose ids="cl-rule-use-boundary cl-rule-default cl-rule-wash-cycles cl-rule-wash-inputs cl-rule-results-layer cl-rule-use-result cl-rule-report-split cl-rule-quantity-scale cl-rule-capital-gap cl-rule-storage-gap cl-rule-reconstruction-limit cl-pfr151-ghgp-boundary-unit cl-pfr151-ghgp-vs-battery-accounting" />',
    )
    .replace(
      '<Prose ids="cl-rule-why-chain cl-rule-review-objects cl-rule-review-2018 cl-rule-review-2024 cl-rule-review-identity" />',
      '<Prose ids="cl-rule-why-chain cl-rule-review-objects cl-rule-review-2018 cl-rule-review-2024 cl-rule-review-identity cl-pfr151-assurance-vs-notified-body cl-pfr151-product-vs-corporate-scope3" />',
    )
    .replace(
      '<Prose ids="cl-rule-methane-rule cl-rule-nordic-design cl-rule-ration-units cl-rule-niu-provenance cl-rule-niu-result cl-rule-ipcc-result cl-rule-ipcc-class cl-rule-model-meaning cl-rule-comparison-limits cl-rule-evidence-judgment cl-rule-conclusion" />',
      `<Prose ids="cl-rule-methane-rule cl-rule-nordic-design cl-rule-ration-units cl-rule-niu-provenance cl-rule-niu-result cl-rule-ipcc-result cl-rule-ipcc-class cl-rule-model-meaning cl-rule-comparison-limits cl-rule-evidence-judgment cl-pfr151-comparative-assertion-gates cl-pfr151-paywalled-standard-boundaries" />\n\n${expectedTable2Mdx}\n\n<Prose ids="cl-rule-conclusion" />`,
    );
  if (`${expected.trimEnd()}\n` !== actualMdx) {
    throw new Error('Product footprint comparison changed protected B28 MDX text or its scoped additions');
  }
}

const allowsRaw = (family, id, from) => (
  (family === 'sources' && from === null && addedSourceIds.has(id))
  || (family === 'evidence' && ((from === null && addedEvidenceIds.has(id)) || (from !== null && Object.hasOwn(priorEvidenceLocatorUpdates, id))))
  || (family === 'claims' && from === null && addedClaimIdSet.has(id))
  || (family === 'readings' && from === null && addedReadingIds.has(id))
  || (family === 'literature' && from === null && addedWorkIdSet.has(id))
  || (family === 'literatureGaps' && from === null && id === 'lit-gap-pfr151-paywalled-product-standards')
  || (family === 'queries' && from === null && id === 'q-pfr151-product-footprint-rules-20261119')
);

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Product footprint comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from)) {
      throw new Error(`Product footprint comparison inexact predecessor for ${kind} transition: ${key}`);
    }
    declared.delete(key);
  }
  if (declared.size) {
    throw new Error(`Product footprint comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
  }
}

export function prepareProductFootprintComparisonSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Product footprint comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Product footprint comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length) {
    throw new Error('Product footprint comparison must bind B28 MDX source and only declared changes');
  }

  const mdxPath = managedPaths[0];
  const fileRow = fileChanges.get(mdxPath);
  const prevMdx = unit.previousFiles[mdxPath];
  if (fileRow?.from !== oldFileShas[mdxPath] || sha256(prevMdx ?? '') !== oldFileShas[mdxPath]) {
    throw new Error('Product footprint comparison lacks independently preserved predecessor B28 MDX bytes');
  }
  const actualMdx = files.get(mdxPath).toString();
  boundedMdxTransform(prevMdx, actualMdx);
  const occ = collectChapterClaimOccurrences(actualMdx);
  if (!sameScienceValue(unit.occurrences[mdxPath], actual.sourceOccurrences[mdxPath]) || occ.length !== 42) {
    throw new Error('Product footprint comparison lacks exact 42 B28 claim occurrences');
  }
  if (!addedClaimIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Product footprint comparison lacks exact record transitions for each new canonical claim');
  }

  const { catalog, readings, literature } = input;
  const prior = (col, id) => unit.rawRecords.find(r => r.path === col && r.id === id)?.from;
  for (const [id, spec] of Object.entries(priorEvidenceLocatorUpdates)) {
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Product footprint comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanProductFootprintProse(w.title, `${wid}.title`);
    assertCleanProductFootprintProse(w.rights, `${wid}.rights`);
    assertCleanProductFootprintProse(w.discovery.reason, `${wid}.discovery.reason`);
  }
  const litGap = literature.gaps.find(row => row.id === 'lit-gap-pfr151-paywalled-product-standards');
  const query = literature.protocol.queries.find(row => row.id === 'q-pfr151-product-footprint-rules-20261119');
  if (!litGap || !query) throw new Error('Missing Unit 151 literature gap or query');
  assertCleanProductFootprintProse(litGap.description, 'lit-gap-pfr151.description');
  assertCleanProductFootprintProse(query.channel, 'q-pfr151.channel');

  validateProductFootprintComparisonFactors(catalog, readings);

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
  if (unit.state?.before !== productFootprintComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== productFootprintComparisonPredecessorPin) {
    throw new Error('Product footprint comparison did not recover the independently observed raw 3c6844be state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Product footprint comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Product footprint comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...addedClaimIds])],
  };
}

export function effectiveProductFootprintComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    productFootprintComparison: unit,
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
      || !scienceDigest(productFootprintComparisonCapturePin) || editionDigest(capture) !== productFootprintComparisonCapturePin) {
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

export function verifyProductFootprintComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${productFootprintComparisonId}/${row.kind}`;
    if (row.date < productFootprintComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function productFootprintComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== productFootprintComparisonRoute || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-pfr-151-ordinary-0`;
}

export function productFootprintComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-pfr-151-ordinary-0$/;
export function observeProductFootprintComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyProductFootprintComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeProductFootprintComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Product footprint comparison',
    routes: productFootprintComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: productFootprintComparisonHistoryControls(unit),
    source: productFootprintComparisonSource,
    attribute: 'product-footprint-comparison',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Product footprint comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Product footprint comparison actual versioned ordinary targets differ');
  }
  return { prior, errors };
}

export function productFootprintComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreProductFootprintComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
