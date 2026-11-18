import capture from '../config/reader-localization-comparison-capture.json' with { type: 'json' };
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
import { assertCleanLocalizationProse, validateLocalizationComparisonFactors } from './reader-localization-comparison-factors.mjs';

export const localizationComparisonId = 'localization-comparison-137';
export const localizationComparisonRoute = '/docs/book/localization-evidence-and-denominators';
export const localizationComparisonRoutes = Object.freeze([localizationComparisonRoute]);
export const localizationComparisonCheckDate = '2026-11-18';
/** @type {string|null} */
export const localizationComparisonUnitPin = '9b23d4b4e514ab824f1c5785fc197380aad4f290daf6a11d5326fe2554e20bba';
/** @type {string|null} */
export const localizationComparisonCapturePin = '1a38bd37ad45a10f1c7f23a07c522b207767d0070569dfc1fbe2c78c9892e918';
export const localizationComparisonSource = Object.freeze({
  commit: '0518e6b529789b8dde9ffebf36d2eeb716a94390',
  tree: '0c486874ebf427f60cc75391b72ee7c6df0d676e',
  manifest: 'b5bd9f0355e5666ece703fc82d2328e40262138d1b201acbce7ffede05203dd4',
  date: '2026-11-18',
});
export const localizationComparisonPredecessorPin = 'cec53208eb958b9d5a7d64914889938f438902c22096cc6c6b7143acfde339d4';
const addressPin = '346433c4c1788fa535ae43bcefa6541f678a7b083009dfa9d30f85e2566e99d4';

const oldFileShas = Object.freeze({
  'content/docs/book/localization-evidence-and-denominators.mdx': 'ca55dfc7f44945dab494938e84d9561cf36b4a0aae4a2cb1dea404717a5cd351',
});
const managedPaths = Object.keys(oldFileShas);

export const localizationComparisonCorrections = Object.freeze([
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-question',
    noteIndex: 0,
    scope: '前版首次出现缩写 EDIP 时未附中文全称，且附注所引“首次建立”未加引号。现补足“丹麦工业产品环境设计方法（EDIP）”并为引述词加引号，不改原意与引证。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-two-branches',
    noteIndex: 1,
    scope: '前版“以耗竭系数RDI表达”未对缩写加括号并补齐“资源”限定。现统一写作“资源耗竭系数（RDI）”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-service-period',
    noteIndex: 4,
    scope: '前版附注提前简称“原汽车清单”，顺读至此尚无上下文。现明确写作“该文结论所提中国汽车试算清单未见刊出”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-time-bridge',
    noteIndex: 10,
    scope: '前版首次出现符号 WP 时未附中文名称。现补足“加权环境影响潜值（WP）”，代数关系与保留疑点不变。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-parameter-history',
    noteIndex: 13,
    scope: '前版附注将英文 conference contribution 直译为“1998年贡献”。现与正文统一改为“1998年会议论文”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-regional-benchmarks-and-policy-goals',
    noteIndex: 14,
    scope: '前版未点明首次引用的 2022 年综述出处与 LCIA-Y、ECER、LCIA 中文说明，题要使用英文拼音键，且前提指向后文第 4 节。现补齐谢明辉等 2022 年综述题名与三项缩写全称，规范中文题要，并将前提对齐至前文杨建新等 2001 年研究及引文链论述。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-later-critique',
    noteIndex: 17,
    scope: '前版附注使用工程校验措辞“原PDF字节”。现改写为自然出版表述“原刊PDF版面或页图”，载体事实与边界不变。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-changed-reference',
    noteIndex: 19,
    scope: '前版指出 2000 年计划参照与实际参照并非同一数值但未在正文列出已核统计数，且附注使用内部术语。现据《2000年中国环境统计年报》表12补入“2,460万吨与1,995.1万吨”并规范附注措辞。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-hk-borrowing',
    noteIndex: 21,
    scope: '前版首次出现缩写 LCA 与 LCC 时未附中文全称与项目编号 C1169，且含直译词“会议贡献”与英文“Southeast China”。现补足中文全称、合约编号 C1169、“1998年会议论文”及“东南中国（原文作 Southeast China）”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-standard-events',
    noteIndex: 27,
    scope: '前版首次出现缩写 GB/T 时未附中文全称、省略 2002 年两项标准号且未点明孙启宏 2002 年篇名。现补足“推荐性国家标准（GB/T）”、GB/T 24042—2002 与 24043—2002 标准号及篇名，并在附注指明 1998 年启动制标信息出处。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-standard-authority',
    noteIndex: 28,
    scope: '前版首次出现缩写 ISO 时未附中文全称。现补足“国际标准化组织（ISO）”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-regional-localization-not-translation',
    noteIndex: 29,
    scope: '前版注释题要对中文综述使用英文拼音简称。现统一规范为“谢明辉等2022年对本地化层次和术语的具体用法”。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-regional-review-denominator',
    noteIndex: 30,
    scope: '前版首次出现缩写 CNKI 时未附中文全称，且注释题要使用英文拼音简称。现补足“中国知网（CNKI）”并规范中文题要。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-regional-research-agenda-not-country-claim',
    noteIndex: 32,
    scope: '前版未交代“跨地区概括”在原文第4节所指的欧美与中国货币化支付意愿水平差异案例，且注释题要使用英文拼音简称。现据原文补齐上下文衔接并规范中文题要。',
  }),
  Object.freeze({
    chapter: localizationComparisonRoute,
    claimId: 'cl-cn-conclusion',
    noteIndex: 35,
    scope: '前版结语与新增四门槛总结部分重复，且末句硬写固定章序“下一章将看另一种做法……”。现精炼收束全章分层结论，并统一改写为书／网双视图一致的“后文《环境损害估值》将看另一种做法……”。',
  }),
]);
const correctedClaimIds = new Set(localizationComparisonCorrections.map(row => row.claimId));

const b21AddedIds = [
  'cl-loc137-ef31-location-regimes',
  'cl-loc137-ef31-global-nf-extrapolation',
  'cl-loc137-dirty-denominator-paradox',
  'cl-loc137-open-economy-boundary-reversal',
  'cl-loc137-biophysical-vs-political-units',
  'cl-loc137-pm-nonlinear-and-endpoint-reversals',
  'cl-loc137-institutional-adoption-vs-compliance',
  'cl-loc137-four-layer-localization-audit',
];

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));
const onlyKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).every(k => allowed.has(k));
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
  'corrections', 'occurrences', 'previousFiles', 'rawRecords', 'rawFields',
  'outputs', 'publicArtifacts', 'history', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedRecordDigestKeys = new Set(['raw', 'public', 'protected']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedCorrectionKeys = new Set(['chapter', 'claimId', 'noteIndex', 'scope']);
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
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.previousAddresses)
      || !plainObject(unit.history.currentAddresses)
      || !plainObject(unit.history.ordinaryTargets)
      || !Array.isArray(unit.history.history)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.corrections) || !Array.isArray(unit.rawRecords)
      || !Array.isArray(unit.rawFields) || !Array.isArray(unit.outputs)
      || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
  }
  assertCleanLocalizationProse(unit.rationale, 'unit.rationale');
  for (const row of unit.changes) {
    if (!exactKeys(row, allowedChangeKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.rationale, `changes(${row.key}).rationale`);
    if (row.kind === 'record') {
      if ((row.from !== null && !exactKeys(row.from, allowedRecordDigestKeys))
          || !exactKeys(row.to, allowedRecordDigestKeys)) {
        throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
      }
    }
  }
  for (const row of unit.consumers) {
    if (!exactKeys(row, allowedConsumerKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.rationale, `consumers(${row.id}).rationale`);
  }
  for (const row of unit.corrections) {
    if (!exactKeys(row, allowedCorrectionKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.scope, `corrections(${row.claimId}).scope`);
  }
  for (const row of unit.rawRecords) {
    if (!exactKeys(row, allowedRawRecordKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.rawFields) {
    if (!exactKeys(row, allowedRawFieldKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.outputs) {
    if (!exactKeys(row, allowedOutputKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.rationale, `outputs(${row.path}#${row.route}).rationale`);
  }
  for (const row of unit.publicArtifacts) {
    if (!exactKeys(row, allowedPublicArtifactKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.rationale, `publicArtifacts(${row.path}).rationale`);
  }
  for (const row of Object.values(unit.history.ordinaryTargets)) {
    if (!exactKeys(row, allowedOrdinaryTargetKeys)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.history.history) {
    if (!exactKeys(row, allowedHistoryRowKeys) || !Array.isArray(row.ordinary)) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanLocalizationProse(row.rationale, `history(${row.address}).rationale`);
    for (const block of row.ordinary) {
      if (!exactKeys(block, allowedOrdinaryBlockKeys)) {
        throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
      }
      assertCleanLocalizationProse(block.rationale, `history.ordinary(${block.targetId}).rationale`);
    }
  }
  if (!reviewed) {
    if (unit.outputCapture !== null
        && !(onlyKeys(unit.outputCapture, allowedOutputCaptureKeys)
          && scienceDigest(unit.outputCapture.manifestSha256)
          && scienceDigest(unit.outputCapture.normalizedProofSha256))) {
      throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
    }
    return;
  }
  if (!onlyKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256)
      || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
      || unit.reviewEvidence.some(row => !exactKeys(row, allowedReviewEvidenceKeys))) {
    throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
  }
}

export function selectLocalizationComparison(config, pin = localizationComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Localization comparison requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (!plainObject(unit) || unit.id !== localizationComparisonId || !sameScienceValue(unit.source, localizationComparisonSource)
      || !sameScienceValue(unit.routes, localizationComparisonRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !sameScienceValue(unit.corrections, localizationComparisonCorrections)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Localization comparison requires an exact 0518e6b5 predecessor and bounded B21 plan');
  }
  if (preview && config.status === 'preview' && pin === null) {
    if (unit.reviewEvidence !== undefined) {
      throw new Error('Localization comparison is not independently accepted');
    }
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Localization comparison is not independently accepted');
  }
  assertUnitEnvelopeKeys(unit, true);
  return unit;
}

const priorSourceAppends = {
  'src-tox123-ef31-addendum':
    ' 2026-11-18（影响评价本地化单元）同载体另核印第2页（PDF第2页：酸化类别针对捷克CZ与阿尔巴尼亚AL两处位置代码的二氧化硫表征因子缺陷修正）及印第4—5页第5.2.15节表1与第5.4.1节（PDF第4—5页：强制要求列出6项或无类别规则时5项合规声明，同时明文规定将ISO 14040命名、文档与数据质量合规及ISO 14044命名、评审与数据质量合规设为“Not defined”，参考包流列表合规除命名外亦设为“Not defined”）。',
  'src-kb52-cml-2001-part3':
    ' 2026-11-18（影响评价本地化单元）同载体另核第3分册第4.6节（印第244—246页：阐明归一化参照体系的时间与空间尺度选择如何造成跨类别偏倚，指出在缺乏配套区域政策目标加权消解时，选用现状污染负荷高的区域作为归一化分母会反向压低该类单位排放的归一化相对得分，以及全球供应链清单与区域归一化边界不一致所致的失真）。',
  'src-book-ilcd-2010':
    ' 2026-11-18（影响评价本地化单元）同载体另核第6.7.6节与条款XV.a.i（印第113—115、120页，PDF第133—135、140页：要求归一化基准与加权集同所分析产品系统保持地理与时间一致性，并规定优先采用全球年度环境总清单、备选国家或地区领土端或消费端年度总清单）。',
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-18（影响评价本地化单元）同载体另核第2.4节Geographic scope（印第12页，PDF第26页：明确声明所推荐的表征方法与因子针对欧洲环境条件遴选，对欧洲以外排放情形不自动具备同等代表性或官方背书，需视区域条件审慎调适）',
  'src-land111-rivm2016':
    ' 2026-11-18（影响评价本地化单元）同载体另核附表S1.1至S1.2（印第121—124页：细颗粒物形成56源区将中国大陆、香港与澳门合并为同一大气源区，初级PM2.5中点2.90 kg PM2.5-eq/kg、终点1.7×10³ yr/kton即1.7×10⁻³ DALY/kg，而台湾单列为0.75与3.5×10² yr/kton，韩国中点2.15高于瑞士与列支敦士登1.92和德国1.74但终点7.0×10² yr/kton即7.0×10⁻⁴ DALY/kg反向低于瑞列1.5×10⁻³与德国1.3×10⁻³，全球加权均值为1与629.2 yr/kton）、附表S2.1（印第125—126页：氮氧化物臭氧形成中点在中国大陆及港澳为人体健康2.07高于西葡1.18，陆地生态中点西葡3.41达中港澳0.07的48.71倍）、附表S3.1（印第139—140、143页：二氧化硫陆地酸化中点中国1.55、德国2.43、瑞士2.21、全球均值1；并核明附表S3.2自印第144页巴西行起存在国名漏行与列错位，不可误引中国行错印值）及附表S6.3至S6.4（印第170—171、177页：淡水生态系统耗水中国国家均值3.91×10⁻¹² species·yr/m³，珠江／西江流域1.67×10⁻¹²、塔里木河1.99×10⁻¹²、黄河4.84×10⁻¹²、长江5.52×10⁻¹²）。',
  'src-land111-lcimpact2020-article':
    ' 2026-11-18（影响评价本地化单元）同载体另核第2.2节与表1—2（印第3—5页：各影响路径原生空间单元分别为大气源区、2°×2.5°网格、流域及804个陆地生态区与449个淡水生态区而非主权国界）、第2.5节（印第6页：引入物种特有性与受威胁等级脆弱度得分VS区分区域物种损失与全球不可逆灭绝）及第4.1至4.2节（印第15页：指出多数国家对数千种化学品监测缺失使全球毒性归一化清单包含重大缺口与外推不确定性，并讨论由原生空间单元向国家层级聚合的权重敏感度）。',
  'src-book-unep-glam-2019-volume2':
    '；2026-11-18（影响评价本地化单元）同载体另核第2章空间交叉议题与归一化参照（印第45、51—53页：原生空间分辨率与清单国家层级背景数据库失配所致的聚合不确定性）、第3.7、4.7、6.7、7.6节熟米案例（印第69、71—72、93—96、129—131、153—154页：对比中国城市、印度农村与美国生产／瑞士消费三套1 kg熟米情景下陆地酸化与水体富营养化、农田及包装化学品人体毒性并转引城乡颗粒物对照、土壤有机碳与水蚀潜值及淡水生态毒性的空间敏感度边界）以及第8.6节（印第180页：国家背景因子与前景生态区／土壤类型因子的分层选用建议）',
  'src-acid113-glam-scoping':
    ' 2026-11-18（影响评价本地化单元）同载体另核归一化专题范围界定与表3（印第137—141页：按“消费＝生产＋进口−出口”系统对比全球清单、领土生产端清单与消费端足迹归一化分母在开放贸易经济体中的边界一致性要求及物质覆盖缺口）。',
  'src-kb46-glam-pm2024':
    '；2026-11-18（影响评价本地化单元）同载体另核工作表lciamethods_CF近地面初级PM2.5（Ground_level）国家因子行（第4466、4515、4754、4755、4802、4803、4850、6482、6531行）及全球未指定高度默认行（unspec，第29378行）：凹形剂量响应下未指定城乡边际因子瑞士6.4458×10⁻⁴、德国6.3059×10⁻⁴为中国2.1460×10⁻⁴的3.00倍与2.94倍（中国农村边际2.0979×10⁻⁴对城市边际5.5694×10⁻⁴），而城市平均因子反转为中国1.2045×10⁻³高于德国8.5423×10⁻⁴与瑞士6.9890×10⁻⁴ DALY/kg',
};

const priorEvidenceLocatorSyncs = Object.freeze({
  'ev-lin-2005-predecessor-critique': {
    from: 'p394 opening and §1; p398 ref9 (web extracted lines81–123,457–459)',
    to: '印第394页开篇与第1节，及印第398页参考文献[9]',
  },
  'ev-lin-2005-parameter-comparison': {
    from: 'p395 Table3 and notes; p397 Table6 (web extracted lines178–183;388–405)',
    to: '印第395页表3及表注，与印第397页表6',
  },
  'ev-lin-2005-remaining-applicability': {
    from: 'p393 Introduction; p395 §2.2–2.3; p396 §2.4; p398 §4 (web extracted lines38–45;184–220;264–269;426–437)',
    to: '印第393页引言、印第395页第2.2—2.3节、印第396页第2.4节及印第398页第4节',
  },
  'ev-regional-xie-localization-layers': {
    from: '§1；§3，印刷p2149、pp2151–2153，PDF indices1、3–5',
    to: '第1节与第3节（印第2149、2151—2153页，PDF第2、4—6页）',
  },
  'ev-regional-xie-screening-denominator': {
    from: '§3检索和筛选说明及Fig.3，印刷pp2151–2152，PDF indices3–4',
    to: '第3节检索和筛选说明及图3（印第2151—2152页，PDF第4—5页）',
  },
  'ev-regional-xie-technical-ambiguity': {
    from: '§2；§3式(1)前后及符号说明，印刷pp2149–2151，PDF indices1–3',
    to: '第2节及第3节式（1）前后与符号说明（印第2149—2151页，PDF第2—4页）',
  },
  'ev-regional-xie-research-agenda': {
    from: '§4不足及对策；§5结语与展望，印刷pp2153–2154，PDF indices5–6',
    to: '第4节不足及对策与第5节结语与展望（印第2153—2154页，PDF第6—7页）',
  },
  'ev-regional-xie-original-model-references': {
    from: '参考文献[1]、[50]、[51]、[60]–[64]，印刷pp2154、2156，PDF indices6、8',
    to: '参考文献[1]、[50]、[51]、[60]—[64]（印第2154、2156页，PDF第7、9页）',
  },
});

const priorReadingAdditions = {
  'rd-flow-pilot-ef31': { passages: 6, sourceKeys: ['src-loc137-ef31-selected-members'] },
  'rd-tox123-ef31-addendum': { passages: 1, sourceKeys: [] },
  'rd-cml-2001-part3': { passages: 1, sourceKeys: [] },
  'rd-ilcd-2010': { passages: 1, sourceKeys: [] },
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, sourceKeys: [] },
  'rd-land111-rivm2016': { passages: 1, sourceKeys: [] },
  'rd-land111-lcimpact2020-article': { passages: 1, sourceKeys: [] },
  'rd-unep-glam-2019-pathways': { passages: 1, sourceKeys: [] },
  'rd-acid113-glam-scoping': { passages: 1, sourceKeys: [] },
  'rd-kb46-glam-pm2024': { passages: 1, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-flow-pilot-ef31': {
    addCatalogSourceId: 'src-loc137-ef31-selected-members',
    limitation: '2026-11-18（影响评价本地化单元）复用EF 3.1归一化与加权工作簿（核实NFs EF3.1_calculation表头2010年全球库存标注及全部1,803条基本流中1,287条欧盟耕地0.0384外推、232条欧盟经济14.12倍外推与11条中国排放外推在淡水生态毒性96.81%及人体非致癌／致癌毒性11.62%／4.24%的精确份额）、PEF方法更新报告（第5.2.1—5.2.2节与附录B1）及水资源（209国别码）、酸化（36欧洲码）、光化学臭氧与颗粒物（36欧洲恒值位置行、初级PM2.5零国别行）四份官方LCIA方法表。',
  },
  'work-tox123-ef31-addendum': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读印第2页酸化位置码（CZ、AL）修正及印第4—5页第5.2.15节表1与第5.4.1节，核实EF合规数据集强制锁定参考包合规声明却将ISO 14040与14044多项合规维度标为“Not defined”的制度边界。',
  },
  'work-cml-2001-guide': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读第3分册第4.6节（印第244—246页），核实区域归一化分母对高现状污染地区的反向稀释效应及其与同口径目标距离权重相消的代数条件。',
  },
  'lit-n03': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读第6.7.6节与条款XV.a.i（印第113—115、120页），核实归一化基准同被评价系统保持地理一致性及全球年度总清单优先、领土端或消费端年度总清单备选的原则。',
  },
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读第2.4节Geographic scope（印第12页），核实ILCD推荐表征因子的欧洲地理适用域声明及对欧洲以外情境不自动背书的限定。',
  },
  'lit-m05': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读附表S1.1—S1.2、S2.1、S3.1与S6.3—S6.4，核实中国大陆与港澳大气同区合并对台湾4.86倍PM2.5终点差距、韩国（中点2.15高于瑞列1.92与德国1.74，终点7.0×10⁻⁴反低于瑞列1.5×10⁻³与德国1.3×10⁻³）的中终点次序反转、珠江／西江对长江3.31倍淡水生态耗水差距及NOx臭氧健康／生态中点的跨区域反转；同时确认附表S3.2自印第144页巴西行起漏印布韦岛国名并多插一格NOx零值导致后续国家行整体错位，严禁引用错位行数值。',
  },
  'work-land111-lcimpact2020-article': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读第2.2节与表1—2（印第3—5页：804个陆地生态区与449个淡水生态区）、第2.5节（印第6页：物种脆弱度得分VS）及第4.1—4.2节（印第15页：多数国家化学品排放监测缺失带来的全球毒性归一化外推不确定性与国家尺度聚合误差）。',
  },
  'work-unep-glam-2019-volume2': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读第2章（印第45、51—53页）、第3.7／4.7／6.7／7.6节熟米案例（印第69、71—72、93—96、129—131、153—154页）与第8.6节（印第180页），核实中国城市、印度农村与美瑞熟米情景在酸化富营养化、人体毒性、土壤有机碳与水蚀及淡水生态毒性上的空间敏感度条件及背景清单粒度限制。',
  },
  'work-acid113-glam-scoping': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读归一化范围界定与表3（印第137—141页），核实开放贸易经济体下生产端领土清单分母与消费端足迹分母（消费＝生产＋进口−出口）的系统边界一致性要求。',
  },
  'work-kb46-glam-pm2024': {
    limitation: '2026-11-18（影响评价本地化单元）同载体追加核读工作表lciamethods_CF近地面初级PM2.5国家行（CHE、DEU、CHN）及全球未指定高度默认行（GLO，第29378行），核实凹形响应下未指定边际（瑞士6.45×10⁻⁴、德国6.31×10⁻⁴为中国2.15×10⁻⁴的3.00倍与2.94倍）与城市平均（中国1.20×10⁻³高于德国8.54×10⁻⁴与瑞士6.99×10⁻⁴）的跨国次序翻转。',
  },
};

const expectedPriorClaimSyncs = Object.freeze({
  'cl-cn-question': {
    from: '瑞士因子的计分结果依赖当地目标；在中国做产品比较，同样需要回答哪些环境问题重要、用哪里的负担作参照。2001年，署名中国科学院生态环境研究中心的杨建新、王如松和刘晶茹在《中国产品生命周期影响评价方法研究》中，以丹麦EDIP为基础，选择中国相关的影响类型并建立标准化基准和权重。论文注明中欧工业初级产品生态可持续性合作项目。作者提出的用途包括同功能产品比较、设计改进、绿色消费和生态标志；这说明他们为何追求简明的综合指标，不能代替对这些用途的逐项检验。',
    to: '瑞士因子的计分结果依赖当地目标；在中国做产品比较，同样需要回答哪些环境问题重要、用哪里的负担作参照。2001年，署名中国科学院生态环境研究中心的杨建新、王如松和刘晶茹在《中国产品生命周期影响评价方法研究》中，以丹麦工业产品环境设计方法（EDIP）为基础，选择中国相关的影响类型并建立标准化基准和权重。论文注明中欧工业初级产品生态可持续性合作项目。作者提出的用途包括同功能产品比较、设计改进、绿色消费和生态标志；这说明他们为何追求简明的综合指标，不能代替对这些用途的逐项检验。',
    fromCaveats: ['原作者的首次建立表述不作为独立核准的全国起源优先权。'],
    toCaveats: ['原作者关于“首次建立”的表述不作为独立核准的全国起源优先权。'],
  },
  'cl-cn-two-branches': {
    from: '这套框架分别评价环境影响和资源消耗。环境分支把排放换成类别潜值，与参照比较，再按目标赋权，汇成环境影响负荷（EIL）。它列入全球变暖、臭氧层损耗、酸化、富营养化、光化学臭氧合成，以及固体废弃物、危险废物和烟灰尘。资源分支另问可更新和不可更新资源的消耗怎样联系到稀缺性，以耗竭系数RDI表达。类别清单说明作者要比较哪些问题，并不说明每类都有同等详细的本地损害模型。',
    to: '这套框架分别评价环境影响和资源消耗。环境分支把排放换成类别潜值，与参照比较，再按目标赋权，汇成环境影响负荷（EIL）。它列入全球变暖、臭氧层损耗、酸化、富营养化、光化学臭氧合成，以及固体废弃物、危险废物和烟灰尘。资源分支另问可更新和不可更新资源的消耗怎样联系到稀缺性，以资源耗竭系数（RDI）表达。类别清单说明作者要比较哪些问题，并不说明每类都有同等详细的本地损害模型。',
  },
  'cl-cn-service-period': {
    fromCaveats: ['服务期的具体数值和原汽车清单未见于该文。'],
    toCaveats: ['服务期的具体数值及该文结论所提中国汽车试算清单未见刊出。'],
  },
  'cl-cn-time-bridge': {
    from: '人均基准B能约去，服务期T怎样计入却仍有疑问。原文标准化式NEP = EP/(T × ER₉₀)中有T，WP与EIL的印刷式没有显示它。在同一EP口径且分母非零时，先由定义得到EP/ER₉₀ = T × NEP；把这一关系代入WP = WF × EP/ER₉₀，才得到WP = T × WF × NEP。照印刷式算，WP不等于直接拿NEP乘权重。四页论文没有说明后一步是否另用了按服务期处理的潜值、是否印刷有省略，或是否采用了别的约定；因此，两个印刷式应各按原样解释，服务期的具体处理仍不清楚。',
    to: '人均基准B能约去，服务期T怎样计入却仍有疑问。原文标准化式NEP = EP/(T × ER₉₀)中有T，加权环境影响潜值（WP）与EIL的印刷式没有显示它。在同一EP口径且分母非零时，先由定义得到EP/ER₉₀ = T × NEP；把这一关系代入WP = WF × EP/ER₉₀，才得到WP = T × WF × NEP。照印刷式算，WP不等于直接拿NEP乘权重。四页论文没有说明后一步是否另用了按服务期处理的潜值、是否印刷有省略，或是否采用了别的约定；因此，两个印刷式应各按原样解释，服务期的具体处理仍不清楚。',
  },
  'cl-cn-parameter-history': {
    fromCaveats: ['1998年贡献正文尚未核读；后来的相近题名或同作者作品不能自动替代该版参数。'],
    toCaveats: ['1998年会议论文正文尚未核读；后来的相近题名或同作者作品不能自动替代该版参数。'],
  },
  'cl-regional-benchmarks-and-policy-goals': {
    fromScope: 'Xie2022后出方法称呼与Yang等2001原刊命名/基准的对照',
    toScope: '谢明辉等2022年后出方法称呼与杨建新等2001年原刊命名及基准的对照',
    from: '再读后来的综述，须先认出它使用的名称。2022年综述把这项早期工作称为LCIA-Y，与采用另一基准年和政策目标的ECER并列；2001年原刊用的是LCIA、EIL和RDI等记号。综述所用名称有助于查找早期文献，但两套参数采用不同的基准和目标，仅凭名称无法确定彼此的版本关系。',
    to: '再读后来的综述，须先认出它使用的名称。谢明辉等2022年在《生命周期影响评价方法及本地化研究进展》综述中把这项早期工作称为中国产品生命周期影响评价方法（LCIA-Y），与采用另一基准年和政策目标的节能减排综合评价方法（ECER）并列；2001年原刊用的是生命周期影响评价（LCIA）、EIL和RDI等记号。综述所用名称有助于查找早期文献，但两套参数采用不同的基准和目标，仅凭名称无法确定彼此的版本关系。',
    fromPremises: ['cl-regional-localization-not-translation'],
    toPremises: ['cl-cn-question', 'cl-cn-parameter-history'],
  },
  'cl-cn-later-critique': {
    fromCaveats: ['Lin论文核读载体为原PDF的派生文本，未核准原PDF字节或页图。'],
    toCaveats: ['Lin等论文核读载体为原PDF的派生文本，未核对原刊PDF版面或页图。'],
  },
  'cl-cn-changed-reference': {
    from: '这也解释了为什么相邻时期的权重不一定能够直接连乘。Lin等表3的二氧化硫栏及其脚注，把一个五年期末的计划参照，与下一五年期初的实际参照分列：它们虽然同属2000年，却不是同一个数。只有中间参照确实相同，两个比值中的中间项才会相消。表内的氮氧化物贡献和酸化合计还涉及作者的估算与换算，不能随二氧化硫这一项一起被视为观测实绩。要把两个五年期连成一个十年比较，除了年份相接，还须核对统计估计、基准和目标含义是否一致。',
    to: '这也解释了为什么相邻时期的权重不一定能够直接连乘。Lin等表3的二氧化硫栏及其脚注，把一个五年期末的计划参照，与下一五年期初的实际参照分列：它们虽然同属2000年，却不是同一个数（《2000年中国环境统计年报》表12记全国二氧化硫2000年控制计划为2,460万吨、实际排放量为1,995.1万吨）。只有中间参照确实相同，两个比值中的中间项才会相消。表内的氮氧化物贡献和酸化合计还涉及作者的估算与换算，不能随二氧化硫这一项一起被视为观测实绩。要把两个五年期连成一个十年比较，除了年份相接，还须核对统计估计、基准和目标含义是否一致。',
    fromCaveats: ['不重建Lin表3尚未核闭的分项与酸化总量组装。'],
    toCaveats: ['不重建Lin表3尚未完整核对的分项与酸化总量组装。'],
  },
  'cl-cn-hk-borrowing': {
    from: '香港房屋委员会委托的2005年建材LCA与LCC研究，说明项目可以单独采用地区标准化参照。报告的“东南中国”参照表把包括气候变化在内的一部分参照归于Yang与Nielsen，其他类别另列来源。脚注给出1999年，题名用语接近1998年会议贡献，尚不足以确定引用的是哪一份载体。可以确认项目采用了其所指认的部分地区参照，不能推出整套2001年中文模型已经进入项目。',
    to: '香港房屋委员会委托的2005年建材生命周期评价（LCA）与生命周期成本（LCC）研究（合约编号C1169），说明项目可以单独采用地区标准化参照。报告的“东南中国”参照表把包括气候变化在内的一部分参照归于Yang与Nielsen，其他类别另列来源。脚注给出1999年，题名用语接近1998年会议论文，尚不足以确定引用的是哪一份载体。可以确认项目采用了其所指认的部分地区参照，不能推出整套2001年中文模型已经进入项目。',
    fromCaveats: [
      '报告的Southeast China范围包括北京、辽宁等地，不能替换成常用地理标签的默认范围。',
      'p72列号(4)至(8)与随后列举的类别名称并非逐项完整对应。',
    ],
    toCaveats: [
      '报告的“东南中国”（原文作 Southeast China）范围包括北京、辽宁等地，不能替换成常用地理标签的默认范围。',
      'p72列号(4)至(8)与随后列举的类别名称并非逐项完整对应。',
    ],
  },
  'cl-cn-standard-events': {
    from: '制度采纳也有自己的证据。官方登记中，GB/T 24040—1999在1999年3月发布、11月实施，GB/T 24041—2000在2000年2月发布、10月实施。影响评价和生命周期解释两项标准于2002年4月发布、10月实施。孙启宏2002年的文章把前两项写作已经发布，后两项写作预计发布；官方日期说明实际发生的制度事件，不改变文章所记下的预期。',
    to: '制度采纳也有自己的证据。官方登记中，推荐性国家标准（GB/T）24040—1999在1999年3月发布、11月实施，GB/T 24041—2000在2000年2月发布、10月实施。影响评价（GB/T 24042—2002）和生命周期解释（GB/T 24043—2002）两项标准于2002年4月发布、10月实施。孙启宏2002年《生命周期评价在清洁生产领域的应用前景》一文把前两项写作已经发布，后两项写作预计发布；官方日期说明实际发生的制度事件，不改变文章所记下的预期。',
    fromCaveats: ['不是以标准正文逐条核对采标关系，也没有获得1998年启动工作的原机构文件。'],
    toCaveats: ['不是以标准正文逐条核对采标关系，也没有获得孙启宏文所提1998年启动制标工作的原机构文件。'],
  },
  'cl-cn-standard-authority': {
    from: '这些记录证明的是标准的身份和发布、实施事件。即便登记写明采用相应ISO版本，也不能由此推出某篇研究中的人均基准、权重或综合指标已被国家采用。要查明一项标准是否采用了研究中的参数，需要查看具体条文、采用文件或项目记录。共同作者、相近术语或时间先后，只能提供查找线索。',
    to: '这些记录证明的是标准的身份和发布、实施事件。即便登记写明采用相应国际标准化组织（ISO）版本，也不能由此推出某篇研究中的人均基准、权重或综合指标已被国家采用。要查明一项标准是否采用了研究中的参数，需要查看具体条文、采用文件或项目记录。共同作者、相近术语或时间先后，只能提供查找线索。',
  },
  'cl-regional-localization-not-translation': {
    fromScope: 'Xie等2022对本地化层次和术语的具体用法',
    toScope: '谢明辉等2022年对本地化层次和术语的具体用法',
  },
  'cl-regional-review-denominator': {
    fromScope: 'Xie等2022 §3的检索框和方法使用子集',
    toScope: '谢明辉等2022年第3节的检索框与方法使用子集',
    from: '这份综述报告，在明确采用影响评价方法的论文中，约77%使用国外方法。作者以“生命周期评价”检索CNKI中文期刊，1995至2020年得827条；其中243篇明确使用了影响评价方法，186篇归为使用国外方法。以243为分母才得到所报比例。它没有计量全部中国LCA研究或工业实践。',
    to: '这份综述报告，在明确采用影响评价方法的论文中，约77%使用国外方法。作者以“生命周期评价”检索中国知网（CNKI）中文期刊，1995至2020年得827条；其中243篇明确使用了影响评价方法，186篇归为使用国外方法。以243为分母才得到所报比例。它没有计量全部中国LCA研究或工业实践。',
  },
  'cl-regional-research-agenda-not-country-claim': {
    fromScope: 'Xie等2022 §§4–5的建议和外推边界',
    toScope: '谢明辉等2022年第4—5节的建议和外推边界',
    from: '综述结尾要求更新基准、加强模型合作和支付意愿研究，这些是后续研究议程，不是建设已经完成的证据。支付意愿或货币化参数究竟适用于谁，还需要原始调查、保护对象和使用情境。因而可以沿这些具体问题继续研究，而不把作者的跨地区概括写成某国居民天生更重视健康或生态，也不据此要求所有项目都采用本国方法。',
    to: '综述还转引光伏组件货币化核算案例称欧洲参数对人体健康与生态质量的支付意愿远高于中国实际水平，并在结尾要求更新基准、加强模型合作和开展支付意愿研究；这些是后续研究议程与适用性顾虑，不是建设已经完成的证据。支付意愿或货币化参数究竟适用于谁，还需要原始调查、保护对象和使用情境。因而可以沿这些具体问题继续研究，而不把作者关于跨地区支付意愿高低的概括写成某国居民天生更看重或轻视健康与生态，也不据此要求所有项目都采用本国方法。',
  },
  'cl-cn-conclusion': {
    from: '早期论文说明怎样选择类别、建立人均参照并引入政策目标；后续政策研究说明同一年度的计划值与实绩可以给出不同的分母；香港项目又展示了参照、表征和权重怎样分别选用。因此，说明一项研究用了本地方法，应当指出实际更换了哪些清单资料、模型参数、标准化参照或权重，以及这些选择适用于什么地区、时期和决策。政策目标并非唯一的赋权依据。下一章将看另一种做法：从对具体政策后果和税额的选择，估计人们陈述的取舍。',
    to: '回看全章，无论是早期中文框架、五年计划目标比值、香港工程项目的模块化拼装，还是欧盟与联合国的全球及区域化方法包，“本地化”都不是单一开关，而是清单空间粒度、归一化分母边界、暴露响应曲率与权重制度规则的逐层组合。说明一项评价采用了本地或全球方法，必须指明每一层实际更换了什么资料与参数，以及它们适用的地区、时期和决策条件。政策目标与行政锁定的固定权重并非仅有的取舍途径；后文《环境损害估值》将看另一种做法：从受访者对具体政策后果和税额的选择，估计人们陈述的货币化权衡。',
  },
});

const addedSourceIds = ['src-loc137-ef-guide-2020', 'src-loc137-ef31-selected-members', 'src-loc137-lcimpact-ch1'];
const addedReadingIds = ['rd-loc137-ef-guide-2020', 'rd-loc137-lcimpact-ch1'];
const addedWorkIds = ['work-loc137-ef-guide-2020', 'work-loc137-lcimpact-ch1'];

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && correctedClaimIds.has(id))
      || (kind === 'evidence' && Object.hasOwn(priorEvidenceLocatorSyncs, id))
      || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
      || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
      || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  }
  if (kind === 'claims') return b21AddedIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-loc137-');
  if (kind === 'sources') return addedSourceIds.includes(id);
  if (kind === 'readings') return addedReadingIds.includes(id);
  if (kind === 'literature') return addedWorkIds.includes(id);
  if (kind === 'queries') return id === 'q-loc137-spatial-scales-denominators-and-adoption-20261118';
  if (kind === 'gaps') return id === 'gap-loc137-subnational-inventories-and-chinese-originals';
  return kind === 'revisions' && id === 'rev-loc137-b21-cross-system-localization';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    assertCleanLocalizationProse(append, `priorSourceAppends.${id}`);
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, checkedAt: localizationComparisonCheckDate, scope: source.reading.scope + append },
    })) {
      throw new Error(`Localization comparison changed prior source identity or acquisition scope: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorEvidenceLocatorSyncs)) {
    assertCleanLocalizationProse(spec.to, `priorEvidenceLocatorSyncs.${id}`);
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Localization comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const expectedKeys = [...(reading?.sourceKeys ?? []), ...spec.sourceKeys];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-loc137-'))
        || !sameScienceValue(current, {
          ...reading,
          passages: [...reading.passages, ...addedPassages],
          ...(spec.sourceKeys.length && { sourceKeys: expectedKeys }),
        })) {
      throw new Error(`Localization comparison changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    assertCleanLocalizationProse(spec.limitation, `priorWorkAppends.${id}.limitation`);
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    const expected = {
      ...work,
      lastCheckedAt: localizationComparisonCheckDate,
      limitations: [...(work?.limitations ?? []), spec.limitation],
      ...(spec.addCatalogSourceId && {
        catalogSourceIds: [...(work?.catalogSourceIds ?? []), spec.addCatalogSourceId],
      }),
    };
    if (!work || !sameScienceValue(current, expected)) {
      throw new Error(`Localization comparison changed prior literature work identity: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanLocalizationProse(w.title, `${wid}.title`);
    assertCleanLocalizationProse(w.rights, `${wid}.rights`);
    assertCleanLocalizationProse(w.discovery.reason, `${wid}.discovery.reason`);
    w.limitations.forEach((lm, idx) => assertCleanLocalizationProse(lm, `${wid}.limitations[${idx}]`));
  }
  const gap = readings.gaps.find(row => row.id === 'gap-loc137-subnational-inventories-and-chinese-originals');
  const rev = readings.revisions.find(row => row.id === 'rev-loc137-b21-cross-system-localization');
  const query = literature.protocol.queries.find(row => row.id === 'q-loc137-spatial-scales-denominators-and-adoption-20261118');
  if (!gap || !rev || !query) throw new Error('Missing Unit 137 gap, revision or query');
  assertCleanLocalizationProse(gap.description, 'gap-loc137.description');
  assertCleanLocalizationProse(gap.nextAction, 'gap-loc137.nextAction');
  assertCleanLocalizationProse(rev.before, 'rev-loc137.before');
  assertCleanLocalizationProse(rev.after, 'rev-loc137.after');
  assertCleanLocalizationProse(rev.reasoning, 'rev-loc137.reasoning', true);
  assertCleanLocalizationProse(query.query, 'q-loc137.query');
  assertCleanLocalizationProse(query.channel, 'q-loc137.channel');
}

function qualifyCorrections(unit, records, catalog) {
  for (const { claimId } of localizationComparisonCorrections) {
    if (!records.has(`claims:${claimId}`)) {
      throw new Error(`Localization comparison missing actual record transition for ${claimId}`);
    }
    const spec = expectedPriorClaimSyncs[claimId];
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    const expected = {
      ...original,
      reviewedAt: localizationComparisonCheckDate,
      ...(spec?.to && { text: spec.to }),
      ...(spec?.toScope && { scope: spec.toScope }),
      ...(spec?.toPremises && { premiseIds: spec.toPremises }),
      ...(spec?.toCaveats && { caveats: spec.toCaveats }),
    };
    if (!spec || !original || !current
        || (spec.from && original.text !== spec.from)
        || (spec.fromScope && original.scope !== spec.fromScope)
        || (spec.fromPremises && !sameScienceValue(original.premiseIds, spec.fromPremises))
        || (spec.fromCaveats && !sameScienceValue(original.caveats, spec.fromCaveats))
        || !sameScienceValue(current, expected)) {
      throw new Error(`Localization comparison modified unauthorized fields on ${claimId}`);
    }
    assertCleanLocalizationProse(current.scope, `${claimId}.scope`);
    assertCleanLocalizationProse(current.text, `${claimId}.text`);
    (current.caveats ?? []).forEach((cv, idx) => assertCleanLocalizationProse(cv, `${claimId}.caveats[${idx}]`));
  }
}

const expectedTable1Mdx = [
  '| 方法体系与载体 | 原生空间单元 | 国家或地区覆盖与白名单 | 中国及华南／港澳代表值 | 欧洲代表值与跨国梯度 | 关键失真或排序反转机制 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 欧盟 EF 3.1 四份方法表 | 水按流域聚合至国别；酸化按欧洲网格；臭氧与颗粒物按子区室 | 水资源 `209` 个位置码；酸化限 `36` 个欧洲码；臭氧与颗粒物前体 `36` 码恒值、初级 `PM₂.₅` 设 `0` 个国别行 | 耗水中国 `42.4`；酸化无中国行，回退默认值 `SO₂ = 1.31`、`NOx = 0.74`；初级 `PM₂.₅` 未指定 `2.385×10⁻⁴` | 耗水西班牙 `77.7`、德国 `1.36`、瑞士 `1.34`（西班牙为日本 `0.897` 的 `86.62` 倍）；酸化 `SO₂` 德国 `2.281`、瑞士 `0.494`、西班牙 `0.108`（差 `21.12` 倍） | 欧洲以外酸化被白名单截断回退默认；臭氧与颗粒物挂欧洲国别码却零数值变化 |',
  '| ReCiPe 2016（RIVM 附表） | 大气 `56` 源区；陆地网格聚合国别；淡水耗水按流域与国别双表 | 细颗粒物与臭氧将中国大陆、香港、澳门并入同一源区，台湾与韩国单列；耗水与酸化提供分国及分流域值 | 初级 `PM₂.₅` 中港澳 `1.7×10⁻³ DALY/kg`（台湾 `3.5×10⁻⁴`）；耗水中国均值 `3.91×10⁻¹²`（珠江 `1.67×10⁻¹²`、长江 `5.52×10⁻¹²`）；中国 `SO₂` 酸化中点 `1.55` | 初级 `PM₂.₅` 瑞士／列支 `1.5×10⁻³`、德国 `1.3×10⁻³`（韩国中点 `2.15` 高于德瑞，终点 `7.0×10⁻⁴` 反低于德瑞）；西葡 `NOx` 生态臭氧中点 `3.41`（为中港澳 `0.07` 的 `48.71` 倍） | 中港澳大气被均质合并；全国耗水均值达珠江因子的 `2.34` 倍；韩国与德瑞 `PM₂.₅` 中终点反转，西葡与中港澳健康／生态臭氧反转 |',
  '| LC-IMPACT（2020 报告与论文） | 大气 `56` 源区；水压力约 `11,000` 流域；陆地 `804`、淡水 `449` 生态区 | 全球栅格／流域／生态区原生产出，按排放或取水空间分布加权生成国家均值 | 按原生流域与生态区核算并区分区域潜在消失物种比例与全球潜在消失物种比例 | 指出多数国家对数千种化学品缺乏常规监测，全球毒性归一化含重大外推不确定性 | 以国家均值替代流域／生态区引入空间聚合偏差；忽略脆弱度得分 `VS` 会混淆局地退化与全球灭绝 |',
  '| UNEP GLAM 2024 颗粒物工作簿 | 全球城乡人口—浓度栅格聚合至国别与城乡子区室 | 覆盖全球国家代码的近地面边际、平均与线性因子 | 初级 `PM₂.₅` 中国未指定边际 `2.146×10⁻⁴`（农村边际 `2.098×10⁻⁴`、城市边际 `5.569×10⁻⁴`）；中国城市平均 `1.205×10⁻³ DALY/kg` | 未指定边际：瑞士 `6.446×10⁻⁴`、德国 `6.306×10⁻⁴`（为中国约 `3.00` 倍）；城市平均：德国 `8.542×10⁻⁴`、瑞士 `6.989×10⁻⁴` | 高背景浓度压平凹形曲线边际斜率叠加农村权重，使中欧排序在 ReCiPe 线性斜率、本表未指定边际与城市平均间双重翻转 |',
].join('\n');

const expectedTable2Mdx = [
  '| 本地化或参照方案 | 实际更换的环节 | 归一化分母构造与人口／地域口径 | 权重来源及分母约消关系 | 制度或项目采纳性质 | 不可越界外推的限制 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 杨建新等（2001）早期中国框架 | 借鉴丹麦 EDIP 结构，选定中国八类环境问题与资源稀缺支路 | 全球类用全球尺度，区域／局地类用中国或地区 1990 年人均基准 `ER₉₀`（含服务期 `T`） | 以 1990 年同一人口折算 2000 年政策目标得 `WF = B/G`；匹配非零参照下 `B` 相消余 `E/G` | 学术论文方法提案与合作项目试算陈述 | 正文未刊完整参数表与汽车清单；服务期 `T` 在 `WP`/`EIL` 中未复现，资源支路单位待辨 |',
  '| “十五”计划与 Lin、Zhang 和 Chen（2005） | 改取 1995—2005 年中国五年计划政策目标与官方统计构造目标距离权重 | 区分 2000 年计划值（`2,460` 万吨 `SO₂`）与实绩（`1,995.1` 万吨）及全国／两控区口径 | 全国削减 `10%`（`1,995/1,800 ≈ 1.108`）对两控区削减 `20%`（`WF = 1.250`）；跨期中间参照不等故不可直接连乘 | 官方五年计划总量控制指标与英文学术改进研究 | 浓度目标转排放当量仍需扩散建模；氮氧化物与酸化合计数含作者估算，非纯统计实绩 |',
  '| 香港房委会 C1169 建材研究（2005） | 模块化拼装 CML 表征、“东南中国”／香港归一化参照与项目软件权重 | 香港本地气候参照取 2000 年领土温室气体清单 `5,922.49 kg CO₂-eq/(人·年)`（低于全球 `7,553.08` 约 `21.59%`） | 采用第一阶段工作坊固定默认权重（支持用户自设），**不与分母相消** | 公共机构委托工程研究与内部团队评阅 | 服务型城市领土分母配跨国建材供应链会放大进口气候份额（等权算例在 `150` 临界比两侧换位） |',
  '| 欧盟 EF 3.1 合规参考包（2022） | 统一锁定 16 类表征方法、2010 年“全球”人均归一化基准（`NFᵢ`）与混合权重 | 全球人口 `6,895,889,018`；`1,803` 条流中淡水生态毒性 `96.81%` 由欧盟外推，非致癌毒性 `11.62%` 由中国外推 | 固定混合权重除以全球归一化基准 `NFᵢ`（不约消）；分母完备度落差直接进入单一总分 | 欧盟建议书与合规指南行政锁定（`ISO 14040/14044` 多项合规标为 `Not defined`） | 欧洲以外酸化等类别被白名单回退欧洲默认；“全球分母”不代表全球化学品实测全覆盖 |',
  '| 中国 GB/T 采标登记与谢明辉等（2022）综述 | `GB/T 24040` 与 `24042` 等同采用 `ISO` 程序标准；2022 年综述统计中文期刊方法采用率 | 标准不设法定分母；综述以 CNKI 明确命名方法的 `243` 篇论文为分母得 `186` 篇（`77%`）国外方法 | 标准将标准化与加权列为可选程序；综述呼吁更新基准与开展支付意愿研究 | 国家推荐性程序标准登记与学术文献计量回顾 | 程序采标不授予任何研究参数法定效力；`77%` 系中文期刊子集来源分类而非全行业普查或模型误差检验 |',
].join('\n');

function verifyB21Mdx(previousFiles, actualFiles) {
  const prevB21 = previousFiles['content/docs/book/localization-evidence-and-denominators.mdx'];
  const actB21 = actualFiles.get('content/docs/book/localization-evidence-and-denominators.mdx')?.toString();

  const expectedB21 = prevB21
    .replace(
      'description: 早期中文研究、后续政策研究和香港建材项目分别说明，本地化可以改变参照、权重或所用模型与资料。',
      'description: 比较早期中港本地化方案与欧美及联合国全球区域化方法，辨析流位置标签、归一化分母外推与约消、自然空间单元与制度采纳的四重分界。',
    )
    .replace(
      '<Prose ids="cl-cn-question cl-cn-two-branches cl-cn-characterization cl-cn-reference cl-cn-service-period" />',
      '<Prose ids="cl-cn-question cl-cn-two-branches cl-cn-characterization cl-cn-reference cl-cn-service-period" />\n\n<Prose ids="cl-loc137-ef31-location-regimes cl-loc137-ef31-global-nf-extrapolation" />',
    )
    .replace(
      '<Prose ids="cl-cn-target cl-cn-weight-meaning cl-cn-cancellation cl-cn-time-bridge cl-cn-resource-meaning cl-cn-resource-units cl-cn-parameter-history cl-regional-benchmarks-and-policy-goals cl-regional-wf-ambiguity" />',
      '<Prose ids="cl-cn-target cl-cn-weight-meaning cl-cn-cancellation cl-cn-time-bridge cl-cn-resource-meaning cl-cn-resource-units cl-cn-parameter-history cl-regional-benchmarks-and-policy-goals cl-regional-wf-ambiguity" />\n\n<Prose ids="cl-loc137-dirty-denominator-paradox" />',
    )
    .replace(
      '<Prose ids="cl-cn-later-critique cl-cn-policy-records cl-cn-changed-reference cl-cn-policy-limit cl-cn-hk-borrowing cl-cn-hk-local cl-cn-hk-weights" />',
      `<Prose ids="cl-cn-later-critique cl-cn-policy-records cl-cn-changed-reference cl-cn-policy-limit cl-cn-hk-borrowing cl-cn-hk-local cl-cn-hk-weights" />\n\n<Prose ids="cl-loc137-open-economy-boundary-reversal cl-loc137-biophysical-vs-political-units cl-loc137-pm-nonlinear-and-endpoint-reversals" />\n\n${expectedTable1Mdx}`,
    )
    .replace(
      '<Prose ids="cl-cn-standard-events cl-cn-standard-authority cl-regional-localization-not-translation cl-regional-review-denominator cl-regional-method-origin-not-validity cl-regional-research-agenda-not-country-claim cl-cn-conclusion" />',
      `<Prose ids="cl-cn-standard-events cl-cn-standard-authority cl-regional-localization-not-translation cl-regional-review-denominator cl-regional-method-origin-not-validity cl-regional-research-agenda-not-country-claim" />\n\n<Prose ids="cl-loc137-institutional-adoption-vs-compliance cl-loc137-four-layer-localization-audit" />\n\n${expectedTable2Mdx}\n\n<Prose ids="cl-cn-conclusion" />`,
    );

  if (actB21 !== expectedB21) {
    throw new Error('Localization comparison changed protected B21 MDX text, tables or section boundaries');
  }
  const occB21 = collectChapterClaimOccurrences(actB21);
  if (occB21.length !== 36) {
    throw new Error('Localization comparison unexpected B21 (36) claim occurrence count');
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Localization comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Localization comparison inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Localization comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

export function prepareLocalizationComparisonSource(unit, input, actual, structure) {
  if (unit.layouts !== undefined) {
    throw new Error('Localization comparison must not amend earlier locked chapter layouts');
  }
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  if (!sameScienceValue(unit.corrections, localizationComparisonCorrections)) {
    throw new Error('Localization comparison unit or history contains unauthorized or unreviewed properties');
  }
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Localization comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Localization comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length
      || !plainObject(unit.previousFiles) || Object.keys(unit.previousFiles).length !== managedPaths.length) {
    throw new Error('Localization comparison lacks independently preserved predecessor B21 MDX bytes');
  }
  for (const path of managedPaths) {
    if (fileChanges.get(path)?.from !== oldFileShas[path] || sha256(unit.previousFiles[path] ?? '') !== oldFileShas[path]) {
      throw new Error(`Localization comparison predecessor hash mismatch on ${path}`);
    }
  }

  verifyB21Mdx(unit.previousFiles, files);
  const expectedOccurrences = Object.fromEntries(managedPaths.map(p => [p, actual.sourceOccurrences[p]]));
  if (!sameScienceValue(unit.occurrences, expectedOccurrences)
      || !b21AddedIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Localization comparison lacks exact B21 occurrences or claim transitions');
  }

  const { catalog, readings, literature } = input;
  qualifyCorrections(unit, recordChanges, catalog);
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateLocalizationComparisonFactors(catalog, readings);

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, recordChanges, allowsRaw);
  for (const path of managedPaths) {
    files.set(path, Buffer.from(unit.previousFiles[path]));
  }
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== localizationComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== localizationComparisonPredecessorPin) {
    throw new Error('Localization comparison did not recover the independently observed raw 0518e6b5 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Localization comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Localization comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...correctedClaimIds, ...b21AddedIds])],
  };
}

export function effectiveLocalizationComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    localizationComparison: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || !exactKeys(capture, allowedCaptureKeys) || capture.schemaVersion !== 1
      || !scienceDigest(localizationComparisonCapturePin) || editionDigest(capture) !== localizationComparisonCapturePin) {
    return false;
  }
  if (!onlyKeys(capture.identity, allowedCaptureIdentityKeys)
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

export function verifyLocalizationComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${localizationComparisonId}/${row.kind}`;
    if (row.date < localizationComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function localizationComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== localizationComparisonRoute || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-loc-137-ordinary-0`;
}

export function localizationComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-loc-137-ordinary-0$/;
export function observeLocalizationComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validateLocalizationComparisonCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-localization-comparison-correction]');
  const expectedRows = !unit ? [] : localizationComparisonCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Localization comparison correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-localization-comparison-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-localization-comparison-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== localizationComparisonSource.date
        || !singleTextChild(time, localizationComparisonSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(localizationComparisonSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Localization comparison correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyLocalizationComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLocalizationComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Localization comparison',
    routes: localizationComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: localizationComparisonHistoryControls(unit),
    source: localizationComparisonSource,
    attribute: 'localization-comparison',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Localization comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Localization comparison actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateLocalizationComparisonCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function localizationComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreLocalizationComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
