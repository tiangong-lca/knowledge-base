import capture from '../config/reader-social-comparison-capture.json' with { type: 'json' };
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
import { assertCleanSocialProse, validateSocialComparisonFactors } from './reader-social-comparison-factors.mjs';

export const socialComparisonId = 'social-comparison-139';
export const socialComparisonRoute = '/docs/book/social-assessment-objects-and-meaning';
export const socialComparisonRoutes = Object.freeze([socialComparisonRoute]);
export const socialComparisonCheckDate = '2026-11-18';
/** @type {string|null} */
export const socialComparisonUnitPin = '431625f39d989697a190be6bc309cfcfa2045ae85403a9498631da44b6e89a5a';
/** @type {string|null} */
export const socialComparisonCapturePin = '47bff7ca2623b479eb56c8e2eb71633014e23753e06c553daec4925e084d1b51';
export const socialComparisonSource = Object.freeze({
  commit: '79c8ea9cf1c79eb0b773a2109188095037f9873a',
  tree: '2ff8975e8ea78f5fe02bfe49205808edf1151323',
  manifest: 'edf0505cccdefdccdec9994da92515ae322ed2f337fb3648dce6d4e731bd00a4',
  date: '2026-11-18',
});
export const socialComparisonPredecessorPin = 'b1f96c0369a8260d9713f1d2eb45f9fe2376e9b3eaf193952a837080609a5d60';
const addressPin = 'a36fbe836f4dcd19061bfd02f24f1599dceb2a4816123ed88e63582c67a20420';

const oldFileShas = Object.freeze({
  'content/docs/book/social-assessment-objects-and-meaning.mdx': '6f0d3d9ec1ce717c3d933397c8bd5be88fcd0dafdb719cc31d4de522c2b88988',
});
const managedPaths = Object.keys(oldFileShas);

export const socialComparisonCorrections = Object.freeze([
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-social-object-and-stakeholders',
    noteIndex: 0,
    scope: '前版首次出现缩写 UNEP 时未附中文全称，且未在首段交代社会生命周期评价（S-LCA）统称。现补足“联合国环境规划署（UNEP）”与“社会生命周期评价（S-LCA）”，评价对象与引证不变。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-worker-hours-not-impact',
    noteIndex: 5,
    scope: '前版附注直接使用英文 elementary flow 而未配中文译名。现统一规范为“基本流（原文作 elementary flow）”，边界说明不变。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-risk-not-facility-performance',
    noteIndex: 6,
    scope: '前版前提指向后文参照量表论述，且注释题要中英文紧连。现将前提对齐至前文评价对象与工时活动变量论述，并规范中文题要。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-reference-scale-performance',
    noteIndex: 7,
    scope: '前版提及参照量表基准时未给出指南核心术语“绩效参照点（PRPs）”，且注释题要中英文紧连。现补足中文全称与英文缩写并规范题要。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-social-impact-pathways',
    noteIndex: 8,
    scope: '前版注释题要中英文及数字紧连无空格。现统一规范为“UNEP 2020 年指南第二类影响路径法（Type II）的定义与限制”。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-sustainability-ordinal-zero-and-net-zero',
    noteIndex: 12,
    scope: '前版注释题要页码缩写紧连。现统一规范为“指南印第 82—87 页的序数赋分、合规零与正负相抵零”。',
  }),
  Object.freeze({
    chapter: socialComparisonRoute,
    claimId: 'cl-book-social-results-to-cost',
    noteIndex: 16,
    scope: '前版前提跨章指向后文成本论述，提及生命周期成本未附缩写 LCC，且尚未收束新增的组织参照、产值工时、指数赋分与跨支柱消重结论。现将前提严格收归本章既有与新增综合论述，补齐缩写 LCC，并以书／网双视图一致的“后文《生命周期成本与综合评价》”完成交接。',
  }),
]);
const correctedClaimIds = new Set(socialComparisonCorrections.map(row => row.claimId));

const b23AddedIds = [
  'cl-soc139-portfolio-reference-and-comparative-assertions',
  'cl-soc139-matrix-satellite-linearity-and-software-encoding',
  'cl-soc139-wage-price-and-automation-paradoxes',
  'cl-soc139-macro-screening-cutoffs-and-certification-limits',
  'cl-soc139-occupational-health-pathways-and-rights-boundary',
  'cl-soc139-ordinal-vs-exponential-scale-reversal',
  'cl-soc139-three-social-zeros-and-compensation-limits',
  'cl-soc139-cross-pillar-overlap-audit',
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
    throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
  }
  assertCleanSocialProse(unit.rationale, 'unit.rationale');
  for (const row of unit.changes) {
    if (!exactKeys(row, allowedChangeKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.rationale, `changes(${row.key}).rationale`);
    if (row.kind === 'record') {
      if ((row.from !== null && !exactKeys(row.from, allowedRecordDigestKeys))
          || !exactKeys(row.to, allowedRecordDigestKeys)) {
        throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
      }
    }
  }
  for (const row of unit.consumers) {
    if (!exactKeys(row, allowedConsumerKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.rationale, `consumers(${row.id}).rationale`);
  }
  for (const row of unit.corrections) {
    if (!exactKeys(row, allowedCorrectionKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.scope, `corrections(${row.claimId}).scope`);
  }
  for (const row of unit.rawRecords) {
    if (!exactKeys(row, allowedRawRecordKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.rawFields) {
    if (!exactKeys(row, allowedRawFieldKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.outputs) {
    if (!exactKeys(row, allowedOutputKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.rationale, `outputs(${row.path}#${row.route}).rationale`);
  }
  for (const row of unit.publicArtifacts) {
    if (!exactKeys(row, allowedPublicArtifactKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.rationale, `publicArtifacts(${row.path}).rationale`);
  }
  for (const row of Object.values(unit.history.ordinaryTargets)) {
    if (!exactKeys(row, allowedOrdinaryTargetKeys)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.history.history) {
    if (!exactKeys(row, allowedHistoryRowKeys) || !Array.isArray(row.ordinary)) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanSocialProse(row.rationale, `history(${row.address}).rationale`);
    for (const block of row.ordinary) {
      if (!exactKeys(block, allowedOrdinaryBlockKeys)) {
        throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
      }
      assertCleanSocialProse(block.rationale, `history.ordinary(${block.targetId}).rationale`);
    }
  }
  if (!reviewed) {
    if (unit.outputCapture !== null
        && !(exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
          && scienceDigest(unit.outputCapture.manifestSha256)
          && scienceDigest(unit.outputCapture.normalizedProofSha256))) {
      throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
    }
    return;
  }
  if (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256)
      || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
      || unit.reviewEvidence.some(row => !exactKeys(row, allowedReviewEvidenceKeys))) {
    throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
  }
}

export function selectSocialComparison(config, pin = socialComparisonUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Social comparison requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (!plainObject(unit) || unit.id !== socialComparisonId || !sameScienceValue(unit.source, socialComparisonSource)
      || !sameScienceValue(unit.routes, socialComparisonRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !sameScienceValue(unit.corrections, socialComparisonCorrections)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Social comparison requires an exact 79c8ea9c predecessor and bounded B23 plan');
  }
  if (preview && config.status === 'preview' && pin === null) {
    if (unit.reviewEvidence !== undefined) {
      throw new Error('Social comparison is not independently accepted');
    }
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Social comparison is not independently accepted');
  }
  assertUnitEnvelopeKeys(unit, true);
  return unit;
}

const priorSourceAppends = {
  'src-kb44-ec2021':
    '；2026-11-18（社会表现与影响单元）同载体另核正文序言第（18）条（印第L 144/4页：说明建议书聚焦环境影响但持续跟踪欧盟消费产品在第三国供应链上的社会与劳工实践方法）、附件三组织环境足迹（OEF）第1.1节（印第L 144/214—215页：明确允许在遵守OEFSR并按年度营业额等参照系统对产品组合归一化后开展组织间公开比较声明，原印含“fro”与“environemtnal”拼写异文）以及第3.2.1至3.2.2节（印第L 144/218—219页：以NACE 14服装制造企业Y Company Ltd.年度生产40,000件0.16 kg T恤与20,000条0.53 kg长裤定义报告单位，将厂区园艺与食堂餐食纳入组织边界，同时原印件按1件T恤加1条长裤共0.69 kg单列每周30℃机洗能耗0.4968 MJ与耗水6.9 L）',
  'src-hsg2013-lca-lcc':
    ' 2026-11-18（社会表现与影响单元）同载体另核第3节（印第1729页：警告在生命周期成本中混入外部性影子价格会与环境指标发生双重计算）与第4节表6、式26及末段（印第1732—1733页：指出Dreyer等2006与UNEP/SETAC 2009均未讨论社会生命周期评价的计算矩阵形式，并提出社会方面若具过程属性可表示为线性社会卫星矩阵乘积 B_soc · A_p⁻¹ · f 的结构猜想）。',
  'src-kb46-glam2026':
    "；2026-11-18（社会表现与影响单元）同载体另核正式版第2.2节表1（印第3页：工作场所非致死伤害严重度0.72 DALY/incidence、致死工伤33.3 YLL/death对比PM2.5暴露死亡23.6 DALY/death）、表2（印第4页：工作环境五子项标明Global ≜ U.S.）、第3.5节与表4及图6—7（印第13—15页：汇总暴露法与病例法共5组USD2012货币分母因子，涵盖235种有机化学品、PM2.5、噪声及急慢性伤亡，第3.5.4节明文警告反对用GDP等经济指标比值向其他国家简单外推，图7注称全集362个部门并误印为“Fig. 72”）、第3.8.3—3.8.4节与图14（印第21页：25岁以上成人非职业体力活动获益−1×10⁻⁴至−4.8×10⁻⁴ DALY/h尚难直接外推至职业过程）以及电子补充材料MOESM2第S-6节（印第S22—S25页：2019年全球职业风险约7,000万DALY且同时被环境与社会LCA提议纳入，式1—5跨13类伤害性质与15—44、45—59、60—80岁三年龄层及USEEIO v2.0共397个行业构建投入产出因子，并指出美国劳工统计局BLS数据漏报与缺乏多国覆盖的局限）",
  'src-acid113-glam-scoping':
    " 2026-11-18（社会表现与影响单元）同载体另核工人暴露与非故意工伤范围界定（印第20—22、25—28页：区分实测车间浓度或有效工时的过程法与美国投入产出每美元产值法）、体力锻炼影响类别界定（印第48页：指出流行病学研究仅统计休闲与交通代谢当量，将家务与职业活动混入总代谢当量的做法违背国际建议并具争议，故暂未优先纳入）以及决策分析与赋权不确定性专题（印第159、163页：引述社会生命周期评价中序数赋分与权重不确定性的多准则鲁棒分析需求）。",
  'src-kb52-cml-2001-part3':
    ' 2026-11-18（社会表现与影响单元）同载体另核第3分册第4.3.16节Casualties（印第239—240页：追溯1992年指南因伤害严重度分级缺乏共识而以表征因子1无权加总事故直接死亡人数，评述丹麦EDIP按每千克商品统计经济活动工作环境负荷的数据库路径及并入DALY的前景）。',
  'src-book-ilcd-2010':
    " 2026-11-18（社会表现与影响单元）同载体另核第6.6.1节（印第95页：将工作场所人体暴露、工伤事故及社会劳动方面划出标准环境生命周期评价范围）、第6.7节（印第118页：规定若研究目标确需纳入车间暴露或事故等非环境影响，必须与生态圈排放分开建库、分开聚合与分开解释）及第7.2.3节脚注117（印第160页：排除工人一般饮食与居住消耗，仅重体力劳动所需的额外食物热量摄入计入系统）。",
  'src-book-unep-glam-2019-volume2':
    "；2026-11-18（社会表现与影响单元）同载体另核第4章第4.4.1节人体暴露因子（印第85页：区分室外远场排放与消费品及职业场所近场暴露，并建议在决策需要时将产品使用者的直接暴露同一般公众及工人的暴露结果分列报告，因为非使用者通常并不享有功能单位所提供的产品效用）",
};

const priorEvidenceLocatorSyncs = Object.freeze({
  'ev-sustainability-slca-activity-variable': {
    from: '§§3.2.4–3.2.6，印刷pp48–49，PDF indices47–48',
    to: '第3.2.4—3.2.6节，印第48—49页',
  },
  'ev-sustainability-slca-interpretation': {
    from: 'Table16、§6.1.3，印刷pp111–112，PDF indices110–111',
    to: '表16与第6.1.3节，印第111—112页',
  },
});

const priorReadingAdditions = {
  'rd-kb44-ec2021': { passages: 1, sourceKeys: [] },
  'rd-service102-hsg-selected': { passages: 1, sourceKeys: [] },
  'rd-kb46-glam2026': { passages: 2, sourceKeys: [] },
  'rd-acid113-glam-scoping': { passages: 1, sourceKeys: [] },
  'rd-cml-2001-part3': { passages: 1, sourceKeys: [] },
  'rd-ilcd-2010': { passages: 1, sourceKeys: [] },
  'rd-unep-glam-2019-pathways': { passages: 1, sourceKeys: [] },
};

const priorWorkAppends = {
  'lit-n04': {
    limitation: '2026-11-18（社会表现与影响单元）同载体追加核读正文序言第（18）条（印第L 144/4页）与附件三OEF第1.1节、第3.2.1—3.2.2节（印第L 144/214—215、218—219页），核实NACE 14成衣制造企业Y Company Ltd.年度产品组合报告单位、按年度营业额归一化允许组织间公开比较声明的规则及两处原印异文。',
  },
  'work-hsg2013-lca-lcc': {
    limitation: '2026-11-18（社会表现与影响单元）同载体追加核读第3节（印第1729页）与第4节表6、式26及末段（印第1732—1733页），核实作者关于社会生命周期评价线性过程卫星矩阵 B_soc · A_p⁻¹ · f 的结构猜想及外部性影子价格双计警示。',
  },
  'work-kb46-glam2026': {
    limitation: "2026-11-18（社会表现与影响单元）同载体追加核读主文第2.2节表1—2（印第3—4页）、第3.5节表4与图6—7（印第13—15页，含反对按GDP比值跨国外推的警告及362部门图注）、第3.8.3—3.8.4节（印第21页）与补篇第S-6节（印第S22—S25页，2019年约7,000万职业DALY及397个BEA行业投入产出推导）。",
  },
  'work-acid113-glam-scoping': {
    limitation: "2026-11-18（社会表现与影响单元）同载体追加核读印第20—22、25—28页车间有效工时过程法对投入产出美元法、印第48页流行病学休闲锻炼代谢当量同职业活动混计争议及印第159、163页社会生命周期评价序数赋分与权重不确定性讨论。",
  },
  'work-cml-2001-guide': {
    limitation: '2026-11-18（社会表现与影响单元）同载体追加核读第3分册第4.3.16节Casualties（印第239—240页），核实1992年事故直接伤亡无权计数（CF=1）与丹麦EDIP工作环境数据库历史路径。',
  },
  'lit-n03': {
    limitation: "2026-11-18（社会表现与影响单元）同载体追加核读第6.6.1节（印第95页）、第6.7节（印第118页）与第7.2.3节脚注117（印第160页），核实车间暴露与工伤划出标准生态圈清单及纳入时必须分开建库、聚合与解释的规则。",
  },
  'work-unep-glam-2019-volume2': {
    limitation: "2026-11-18（社会表现与影响单元）同载体追加核读第4章第4.4.1节（印第85页），核实消费品近场与职业环境暴露纳入框架及将使用者暴露同一般公众与工人暴露分列报告的建议。",
  },
};

const expectedPriorClaimSyncs = Object.freeze({
  'cl-sustainability-social-object-and-stakeholders': {
    from: '以一个假想的工作服采购为例，除了比较两种衣服的材料和能耗，还可以问：制作衣服的人在什么条件下工作？UNEP《产品和组织社会生命周期评价指南》（2020）沿生命周期考察人与组织的关系，包括产品或服务对不同利益相关者可能带来的正面和负面影响。工人是这次提问所关注的利益相关者，工作条件是所关心的议题，选用的指标则说明凭什么判断工作条件。三者缺一不可；健康等议题还可能与环境评价重叠。',
    to: '以一个假想的工作服采购为例，除了比较两种衣服的材料和能耗，还可以问：制作衣服的人在什么条件下工作？联合国环境规划署（UNEP）《产品和组织社会生命周期评价指南》（2020）沿生命周期考察人与组织的关系，将这类研究统称为社会生命周期评价（S-LCA），覆盖产品或服务对不同利益相关者可能带来的正面和负面影响。工人是这次提问所关注的利益相关者，工作条件是所关心的议题，选用的指标则说明凭什么判断工作条件。三者缺一不可；健康等议题还可能与环境评价重叠。',
  },
  'cl-sustainability-worker-hours-not-impact': {
    fromCaveats: [
      '活动变量的用途说明不证明它已适用于具体研究。',
      '此处的 elementary flow 用语不自动映射为环境数据格式的生物圈交换类型。',
    ],
    toCaveats: [
      '活动变量的用途说明不证明它已适用于具体研究。',
      '指南此处的“基本流”（原文作 elementary flow）用语不自动映射为环境数据格式的生物圈交换类型。',
    ],
  },
  'cl-sustainability-risk-not-facility-performance': {
    fromScope: '指南Box11的风险/表现及数据分辨率区别',
    toScope: '指南专栏 11 的风险与表现区分及数据分辨率边界',
    fromPremises: ['cl-sustainability-reference-scale-performance'],
    toPremises: [
      'cl-sustainability-social-object-and-stakeholders',
      'cl-sustainability-worker-hours-not-impact',
    ],
  },
  'cl-sustainability-reference-scale-performance': {
    fromScope: '指南TypeI/ReferenceScale及绩效参照点的范围',
    toScope: '指南第一类参照量表法（Type I）与绩效参照点（PRPs）的适用范围',
    from: '有了关于工厂的资料，参照量表法（Type I）会问表现或风险在所选基准下处于哪一级。基准可以来自规范、当地规定、行业做法、专家判断或同类分布。以工作条件为例，同一项观察相对于最低要求和相对于同行分布，回答的是两个问题。量表通常不追踪长期后果；达到良好一级，并未测得长期福利增加，也不自动取得合规认证。',
    to: '有了关于工厂的资料，参照量表法（Type I）会问表现或风险在所选基准下处于哪一级。这类基准称为绩效参照点（Performance Reference Points，PRPs），可以来自国际规范、当地法规、行业做法、专家判断或同类分布。以工作条件为例，同一项观察相对于法定最低要求和相对于同行分布，回答的是两个问题。量表通常不追踪长期后果；达到良好一级，并未测得长期福利增加，也不自动取得合规认证。',
  },
  'cl-sustainability-social-impact-pathways': {
    fromScope: 'UNEP2020指南TypeII/ImpactPathway定义与限制',
    toScope: 'UNEP 2020 年指南第二类影响路径法（Type II）的定义与限制',
  },
  'cl-sustainability-ordinal-zero-and-net-zero': {
    fromScope: '指南pp82–87的序数赋分、合规零与补偿零',
    toScope: '指南印第 82—87 页的序数赋分、合规零与正负相抵零',
  },
  'cl-book-social-results-to-cost': {
    fromScope: '工作服为无数值教学设定；产品采购结果的解读',
    toScope: '工作服采购社会评价多维结论的收束与面向生命周期成本评价的主体—参照交接',
    from: '对同一项工作服采购，风险资料可以提示应优先核实哪些工厂。若实际的工作条件资料足以支持评价，则可判断工厂表现相对于所选基准处在哪一级。这些社会结果还不是采购方的生命周期成本。把社会结果和成本放在一起之前，先保留两套评价各自的主体和参照。',
    to: '回到同一项工作服采购：产品功能单位与组织年度组合回答不同参照下的问题，宏观风险库与产值工时比只能筛查优先核实的工序，现场审核与参照量表定位工厂相对于绩效参照点的等级，职业健康路径估算特定暴露或工伤的伤残调整生命年，而结社自由与反歧视等基本权利始终保持独立底线。这些社会评价结果还不是采购方或制造企业的生命周期成本（LCC）。进入后文《生命周期成本与综合评价》把环境、社会与成本结果放在一起之前，必须先分清谁承受工作条件与健康后果、谁支付工资与合规现金流，以及各自使用的参照和零点。',
    fromPremises: [
      'cl-sustainability-product-functional-reference',
      'cl-sustainability-risk-not-facility-performance',
      'cl-sustainability-reference-scale-performance',
      'cl-sustainability-lcc-actor-perspective',
    ],
    toPremises: [
      'cl-sustainability-product-functional-reference',
      'cl-soc139-portfolio-reference-and-comparative-assertions',
      'cl-sustainability-risk-not-facility-performance',
      'cl-sustainability-reference-scale-performance',
      'cl-soc139-wage-price-and-automation-paradoxes',
      'cl-sustainability-ordinal-zero-and-net-zero',
      'cl-soc139-ordinal-vs-exponential-scale-reversal',
      'cl-soc139-cross-pillar-overlap-audit',
    ],
  },
});

const addedSourceIds = [
  'src-soc139-oefsr-guidance-v63',
  'src-soc139-unep-sheets-2021',
  'src-soc139-psilca-v3-doc',
  'src-soc139-shdb-2012',
  'src-soc139-glam-work-env-2024',
  'src-soc139-meemken-2021',
];
const addedReadingIds = [
  'rd-soc139-oefsr-guidance-v63',
  'rd-soc139-unep-sheets-2021',
  'rd-soc139-psilca-v3-doc',
  'rd-soc139-shdb-2012',
  'rd-soc139-glam-work-env-2024',
  'rd-soc139-meemken-2021',
];
const addedWorkIds = [
  'work-soc139-oefsr-guidance-v63',
  'work-soc139-unep-sheets-2021',
  'work-soc139-psilca-v3-doc',
  'work-soc139-shdb-2012',
  'work-soc139-glam-work-env-2024',
  'work-soc139-meemken-2021',
];

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && correctedClaimIds.has(id))
      || (kind === 'evidence' && Object.hasOwn(priorEvidenceLocatorSyncs, id))
      || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
      || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
      || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  }
  if (kind === 'claims') return b23AddedIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-soc139-');
  if (kind === 'sources') return addedSourceIds.includes(id);
  if (kind === 'readings') return addedReadingIds.includes(id);
  if (kind === 'literature') return addedWorkIds.includes(id);
  if (kind === 'queries') return id === 'q-soc139-social-reference-activity-scales-and-work-health-20261118';
  if (kind === 'gaps') return id === 'gap-soc139-proprietary-slca-matrices-and-iso14075';
  return kind === 'revisions' && id === 'rev-soc139-b23-cross-system-social-comparison';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    assertCleanSocialProse(append, `priorSourceAppends.${id}`);
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, checkedAt: socialComparisonCheckDate, scope: source.reading.scope + append },
    })) {
      throw new Error(`Social comparison changed prior source identity or acquisition scope: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorEvidenceLocatorSyncs)) {
    assertCleanSocialProse(spec.to, `priorEvidenceLocatorSyncs.${id}`);
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Social comparison changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const expectedKeys = [...(reading?.sourceKeys ?? []), ...spec.sourceKeys];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-soc139-'))
        || !sameScienceValue(current, {
          ...reading,
          passages: [...reading.passages, ...addedPassages],
          ...(spec.sourceKeys.length && { sourceKeys: expectedKeys }),
        })) {
      throw new Error(`Social comparison changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    assertCleanSocialProse(spec.limitation, `priorWorkAppends.${id}.limitation`);
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    const expected = {
      ...work,
      lastCheckedAt: socialComparisonCheckDate,
      limitations: [...(work?.limitations ?? []), spec.limitation],
    };
    if (!work || !sameScienceValue(current, expected)) {
      throw new Error(`Social comparison changed prior literature work identity: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanSocialProse(w.title, `${wid}.title`);
    assertCleanSocialProse(w.rights, `${wid}.rights`);
    assertCleanSocialProse(w.discovery.reason, `${wid}.discovery.reason`);
    w.limitations.forEach((lm, idx) => assertCleanSocialProse(lm, `${wid}.limitations[${idx}]`));
  }
  const gap = readings.gaps.find(row => row.id === 'gap-soc139-proprietary-slca-matrices-and-iso14075');
  const rev = readings.revisions.find(row => row.id === 'rev-soc139-b23-cross-system-social-comparison');
  const query = literature.protocol.queries.find(row => row.id === 'q-soc139-social-reference-activity-scales-and-work-health-20261118');
  if (!gap || !rev || !query) throw new Error('Missing Unit 139 gap, revision or query');
  assertCleanSocialProse(gap.description, 'gap-soc139.description');
  assertCleanSocialProse(gap.nextAction, 'gap-soc139.nextAction');
  assertCleanSocialProse(rev.before, 'rev-soc139.before');
  assertCleanSocialProse(rev.after, 'rev-soc139.after', true);
  assertCleanSocialProse(rev.reasoning, 'rev-soc139.reasoning', true);
  assertCleanSocialProse(query.query, 'q-soc139.query');
  assertCleanSocialProse(query.channel, 'q-soc139.channel');
}

function qualifyCorrections(unit, records, catalog) {
  for (const { claimId } of socialComparisonCorrections) {
    if (!records.has(`claims:${claimId}`)) {
      throw new Error(`Social comparison missing actual record transition for ${claimId}`);
    }
    const spec = expectedPriorClaimSyncs[claimId];
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    const expected = {
      ...original,
      reviewedAt: socialComparisonCheckDate,
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
      throw new Error(`Social comparison modified unauthorized fields on ${claimId}`);
    }
    assertCleanSocialProse(current.scope, `${claimId}.scope`);
    assertCleanSocialProse(current.text, `${claimId}.text`);
    (current.caveats ?? []).forEach((cv, idx) => assertCleanSocialProse(cv, `${claimId}.caveats[${idx}]`));
  }
}

const expectedTable1Mdx = [
  '| 体系与版本 | 评价对象与参照基准 | 缩放变量与矩阵关系 | 公开比较声明规则 | 工作服／成衣链典型失真 | 方法边界与待核条件 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| UNEP 2020 产品 S-LCA（配 2021 方法学表） | 特定穿用服务的功能单位与参考流（工作服件数或贸易采购额） | 工时等活动变量仅表过程份额；权利状态、工资比与超时阈值不满足无条件线性累加 | 未禁止产品比较，但要求风险、表现与影响表述严格匹配数据分辨率 | 用采购额作参照时，高价耐穿或生活工资产品被推算出更多部门工时 | 活动变量分配不等于证明伤害随工时成正比 |',
  '| UNEP 2020 组织 SO-LCA（第 7 章） | 报告组织或其一部分、产品组合与参照期间（通常 1 年） | 定性制度判断与组合级记录并存，禁止直接除以售出服装件数 | 明确不拟用于面向公众披露的组织间比较声明 | 若把 1 起打压工会事件除以 60,000 件成衣（每件 0.0000167 起），高产高销会人为稀释侵权 | 制度用途限定不替代后续法规或专门标准的适用判断 |',
  '| 欧盟建议书 (EU) 2021/2279 组织 OEF（配 OEFSR v6.3） | 组织加一年期产品组合（如 NACE 14 成衣厂 40,000 件 T 恤＋20,000 条长裤＝17,000 kg），含食堂园艺 | 物理环境基本流随产品组合线性缩放，可按年度营业额等参照系统归一化 | 遵守同部门相似产品组合的 OEFSR 并归一化后，允许公开组织间优劣或等效声明 | 原印件周洗水电（0.4968 MJ 与 6.9 L）仅按单套 0.69 kg 计算；营业额分母对奢侈溢价敏感 | 序言第（18）条明示仅覆盖环境影响，不含劳工权利指标 |',
  '| PSILCA v3（全球多区域投入产出库 Eora 15,000 部门／openLCA） | 1 USD 国家特定部门产值或完整产品系统需求向量 | 默认将风险指标作伪基本流乘反推工时（0.001—1 h/USD）；或按技术矩阵缩放对角元总产值求加权平均 | 定位供应链社会热点与筛选情景，不直接等同企业现场合规结论 | 支付生活工资、售价高 1 倍（40 USD 对 20 USD）的安全工厂反被推算出 2.0 倍部门风险工时 | 对角元直接归一化脚本要求全系统统一货币单位，混入物理过程即异量纲相加 |',
  '| UNEP 全球生命周期影响评价方法共识项目（GLAM）2024/2026 工作环境（美国投入产出模型 USEEIO 基底） | 1 USD2012 行业商品经济产出（主文表 2 标明美国代表全球） | 投入产出 Leontief 逆矩阵汇总每美元产值伤残调整生命年（DALY）；2026 主文反对按国内生产总值（GDP）比跨国外推 | 建议仅作缺乏区域实测资料时的筛查基线，不作绝对全球定论 | 2024 实发工作簿对 52 国按单一工资除数 43,746/W_c 缩放，土耳其达瑞士 28.76 倍，印孟越缺席 | 主文 362 部门、补篇 397 部门与工作簿 420 部门存在源内口径差异 |',
].join('\n');

const expectedTable2Mdx = [
  '| 方法或证据层 | 等级编码与零值语义 | 同一工作服链判别表现 | 能独立支持的判断 | 核心盲区与源内异文 | 与环境评价及成本评价的衔接 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 宏观国家—部门热点筛查（SHDB 191 国／PSILCA v3） | 四分位或法规基准定级；SHDB 低于 0.1% 工时截断，PSILCA 常设货币截断 | 德国纺织链童工风险无截断为 0.0868 中风险工时，10⁻⁵ 截断跌至 0.04864，10⁻³ 仅剩 0.02 | 识别高工时占比或高风险国家—部门，排定尽职调查优先级 | 生态谬误（合规厂背负高危国标签、违规分包藏身低危国均值）；PSILCA 第 41 页将美国安全违规率全球照搬 | 仅作背景风险线索，既非工厂实绩也非采购现金流 |',
  '| 自愿可持续性认证与现场审核（Meemken 等 2021） | 合格／不合格准入或整改项；未违规记零缺陷 | 覆盖全球不足 2% 农地与低收入国约 2% 小农户；小农场雇工常未获益 | 核验受检时刻书面制度、工资单与可见安全设施是否达标 | 五层非随机自选择混淆因果；受审方付费与预告检查致最高 50%／79% 未受内外部抽检，30%—70% 认证量未按认证售出 | 认证费、防护投入与溢价计入 LCC，证书本身不免除非预告复核 |',
  '| 线性等距量表与阶跃加成（SHDB 社会热点指数） | 低中高极高赋 0、1、2、3 分；工时占 0.1%、0.2%、1% 上浮 10%、20%、30%（超 100 封顶 100），无数据自分母剔除 | 100 h 受控算例中，甲（10 h 极高＋90 h 低＝30 分）较乙（60 h 中＋40 h 低＝60 分）分值低一半（乙为甲的 2.00 倍），表观更优 | 在不跨议题正负抵消的前提下汇总同一国家—部门多主题警示强度 | 低风险赋 0 且极高仅中风险 3 倍，大批量低风险工时可稀释局部严重侵权；1% 与 60% 工时占比获相同 30% 加成 | 序数合成得分不可与环境当量或货币成本直接相加 |',
  '| 指数风险工时汇总（PSILCA v3 表 3） | 无风险 0，极低至极高赋 0.01、0.1、1、10、100，机会 0.1、1、10，无数据默认赋 0.1 | 同一 100 h 算例中，甲暴涨至 1,009 中风险工时，反达乙（64 中风险工时）的 15.77 倍 | 凸显供应链中哪怕工时很短的极高风险工序，并单列正面机会 | 90 h 无数据自动产生 9.0 中风险工时；安全表误标 DALYs 与 y ≤ 0.06，环境管理表极高风险误印低于 0.005 | 须先剔除数据库内置的环境管理或足迹项，方可与环境评价（E-LCA）并列 |',
  '| 第二类职业健康损害路径（CML／ILCD 至 GLAM 2026） | 物理零暴露与零发病为 0；非致死工伤 0.72 DALY/例，致死工伤 33.3 YLL/例（高于 PM₂.₅ 的 23.6 DALY/例） | 量化全球约 70,000,000 DALY 职业负担；休闲运动负 DALY（−1×10⁻⁴ 至 −4.8×10⁻⁴/h）不可外推至职业劳动 | 在暴露浓度或工伤率可靠时，将车间健康损失与室外污染置于同一 DALY 量纲比较 | 若 E-LCA 已启用室内空气毒性（如涂装苯乙烯毒性因子达室外的约 211 倍）再叠加 S-LCA 职业病伤即双重计算 | 防护支出与工伤保费入 LCC，未补偿残余 DALY 归健康损害，基本权利仍独立保留 |',
].join('\n');

function verifyB23Mdx(previousFiles, actualFiles) {
  const prevB23 = previousFiles['content/docs/book/social-assessment-objects-and-meaning.mdx'];
  const actB23 = actualFiles.get('content/docs/book/social-assessment-objects-and-meaning.mdx')?.toString();

  const expectedB23 = prevB23
    .replace(
      'description: 以工作服采购为例，区分产品与组织的参照、供应链风险、实际工作条件和社会影响。',
      'description: 以工作服采购与成衣制造企业组合为例，对照产品与组织参照、矩阵卫星缩放与产值工时悖论、宏观风险筛查与现场认证局限、线性与指数参照量表、职业健康损害路径以及跨支柱消重规则。',
    )
    .replace(
      '<Prose ids="cl-sustainability-social-object-and-stakeholders cl-sustainability-product-functional-reference cl-sustainability-organization-reporting-reference" />',
      `<Prose ids="cl-sustainability-social-object-and-stakeholders cl-sustainability-product-functional-reference cl-sustainability-organization-reporting-reference cl-soc139-portfolio-reference-and-comparative-assertions cl-soc139-matrix-satellite-linearity-and-software-encoding" />\n\n${expectedTable1Mdx}`,
    )
    .replace(
      '<Prose ids="cl-sustainability-worker-hours-not-impact cl-sustainability-risk-not-facility-performance cl-sustainability-reference-scale-performance cl-sustainability-social-impact-pathways" />',
      '<Prose ids="cl-sustainability-worker-hours-not-impact cl-sustainability-risk-not-facility-performance cl-sustainability-reference-scale-performance cl-sustainability-social-impact-pathways cl-soc139-wage-price-and-automation-paradoxes cl-soc139-macro-screening-cutoffs-and-certification-limits cl-soc139-occupational-health-pathways-and-rights-boundary" />',
    )
    .replace(
      '<Prose ids="cl-sustainability-ordinal-zero-and-net-zero cl-book-social-results-to-cost" />',
      `<Prose ids="cl-sustainability-ordinal-zero-and-net-zero cl-soc139-ordinal-vs-exponential-scale-reversal cl-soc139-three-social-zeros-and-compensation-limits cl-soc139-cross-pillar-overlap-audit" />\n\n${expectedTable2Mdx}\n\n<Prose ids="cl-book-social-results-to-cost" />`,
    );

  if (actB23 !== expectedB23) {
    throw new Error('Social comparison changed protected B23 MDX text, tables or section boundaries');
  }
  const occB23 = collectChapterClaimOccurrences(actB23);
  if (occB23.length !== 17) {
    throw new Error('Social comparison unexpected B23 (17) claim occurrence count');
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Social comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Social comparison inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Social comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

export function prepareSocialComparisonSource(unit, input, actual, structure) {
  if (unit.layouts !== undefined) {
    throw new Error('Social comparison must not amend earlier locked chapter layouts');
  }
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  if (!sameScienceValue(unit.corrections, socialComparisonCorrections)) {
    throw new Error('Social comparison unit or history contains unauthorized or unreviewed properties');
  }
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Social comparison lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Social comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length
      || !plainObject(unit.previousFiles) || Object.keys(unit.previousFiles).length !== managedPaths.length) {
    throw new Error('Social comparison lacks independently preserved predecessor B23 MDX bytes');
  }
  for (const path of managedPaths) {
    if (fileChanges.get(path)?.from !== oldFileShas[path] || sha256(unit.previousFiles[path] ?? '') !== oldFileShas[path]) {
      throw new Error(`Social comparison predecessor hash mismatch on ${path}`);
    }
  }

  verifyB23Mdx(unit.previousFiles, files);
  const expectedOccurrences = Object.fromEntries(managedPaths.map(p => [p, actual.sourceOccurrences[p]]));
  if (!sameScienceValue(unit.occurrences, expectedOccurrences)
      || !b23AddedIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Social comparison lacks exact B23 occurrences or claim transitions');
  }

  const { catalog, readings, literature } = input;
  qualifyCorrections(unit, recordChanges, catalog);
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateSocialComparisonFactors(catalog, readings);

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, recordChanges, allowsRaw);
  for (const path of managedPaths) {
    files.set(path, Buffer.from(unit.previousFiles[path]));
  }
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== socialComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== socialComparisonPredecessorPin) {
    throw new Error('Social comparison did not recover the independently observed raw 79c8ea9c state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Social comparison actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Social comparison lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...correctedClaimIds, ...b23AddedIds])],
  };
}

export function effectiveSocialComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    socialComparison: unit,
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
      || !scienceDigest(socialComparisonCapturePin) || editionDigest(capture) !== socialComparisonCapturePin) {
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

export function verifySocialComparisonReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${socialComparisonId}/${row.kind}`;
    if (row.date < socialComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function socialComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== socialComparisonRoute || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-soc-139-ordinary-0`;
}

export function socialComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-soc-139-ordinary-0$/;
export function observeSocialComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validateSocialComparisonCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-social-comparison-correction]');
  const expectedRows = !unit ? [] : socialComparisonCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Social comparison correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-social-comparison-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-social-comparison-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== socialComparisonSource.date
        || !singleTextChild(time, socialComparisonSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(socialComparisonSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Social comparison correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifySocialComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeSocialComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Social comparison',
    routes: socialComparisonRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: socialComparisonHistoryControls(unit),
    source: socialComparisonSource,
    attribute: 'social-comparison',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Social comparison',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Social comparison actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateSocialComparisonCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function socialComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreSocialComparisonTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
