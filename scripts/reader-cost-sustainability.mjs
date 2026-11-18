import capture from '../config/reader-cost-sustainability-capture.json' with { type: 'json' };
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
import { assertCleanCostSustainabilityProse, validateCostSustainabilityFactors } from './reader-cost-sustainability-factors.mjs';

export const costSustainabilityId = 'cost-sustainability-143';
export const costSustainabilityRoute = '/docs/book/cost-perspectives-and-sustainability-combination';
export const costSustainabilityRoutes = Object.freeze([costSustainabilityRoute]);
export const costSustainabilityCheckDate = '2026-11-18';
/** @type {string|null} */
export const costSustainabilityUnitPin = '761971a8f9f29289c0f14996c147a623a884180a08716aebd2bfa4358a558a5f';
/** @type {string|null} */
export const costSustainabilityCapturePin = 'f94160641f28b632cd154f6d53528c31c07f1f8c2716228855237161b543003d';
export const costSustainabilitySource = Object.freeze({
  commit: '8d5f1037a2ab30b29c197fe89a422a5c69f81a93',
  tree: '173483198885b509c91c13bf5f2a5015927d8e42',
  manifest: 'd006f5638628b724002ab6b03e0149a14671accd769fe675a9d6274800e15d76',
  date: '2026-11-18',
});
export const costSustainabilityPredecessorPin = '9dbf67776bb51762ee8ca238355f4312f55a55de93d8e016af3d47a234f66888';
const addressPin = '2c1974ad4618578e9786f441e343d1708bf1c31d9f14abe965f5026688ff18cc';

const oldFileShas = Object.freeze({
  'content/docs/book/cost-perspectives-and-sustainability-combination.mdx': '9363218bcfcd5710e3a733a5f87bbc3475e83a94f6bf0fc98015c5273de96b7f',
});
const managedPaths = Object.keys(oldFileShas);

export const costSustainabilityCorrections = Object.freeze([
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-lcc-actor-perspective',
    noteIndex: 0,
    scope: '前版“上一章”在合订本与网站独立单元间指代不够显明，且注释题要与许可名称中英文紧连。现统一为双视图一致的“前文《社会表现与影响》”，并规范题要与知识共享署名 3.0 许可（CC BY 3.0）表述，主体视角与引证不变。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-lcc-internalization-boundary',
    noteIndex: 1,
    scope: '前版注释题要中英文及年份紧连，且附注仅按单篇论文限定说明。现规范中文题要与字距，并结合本章第 4—6 段新增的 2011 年实务守则论文、联合国指南与 2013 年矩阵文献校准该段的转引边界说明。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-conceptual-combination-not-sum',
    noteIndex: 6,
    scope: '前版在解释概念式“LCSA = LCA + LCC + SLCA”时未完整对照写出式中各项中文名称，且注释题要年份紧连。现衔接本章首节已引入的生命周期可持续性评价与联合国环境规划署全称，在此处完整写出“生命周期评价（LCA）”“生命周期成本（LCC）”与“社会生命周期评价（SLCA，亦写作 S-LCA）”，并规范题要。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-social-proxy-product-attribution',
    noteIndex: 7,
    scope: '前版“上一章”改为书／网双视图一致的“前文《社会表现与影响》”，补齐承接前文与本章组合论点的前提链接，并规范注释题要及附注中英文间距，代理指标归属边界不变。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-dashboard-zero-is-relative',
    noteIndex: 12,
    scope: '前版前提超前指向后一条聚合条件论述，且注释题要年份紧连。现将前提解耦对齐至前文概念组合与社会量表零值论述，恢复严格拓扑顺序并规范题要。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-sustainability-explicit-aggregation-conditions',
    noteIndex: 13,
    scope: '前版注释题要中英文及节号紧连。现统一规范为“2010 年论文第 3 节的条件性效用聚合与 2020 年指南的赋权限定”。',
  }),
  Object.freeze({
    chapter: costSustainabilityRoute,
    claimId: 'cl-book-cost-decision',
    noteIndex: 16,
    scope: '前版末段尚未收束本章新增的主体激励与贴现翻转、五类异质货币量、多准则否决及相邻工具与地球边界配额结论，且未具名衔接下一部主题。现将前提对齐至本章既有与新增核心论述，保留原收束设问并以双视图一致的下一部《数据与证据》完成跨部交接。',
  }),
]);
const correctedClaimIds = new Set(costSustainabilityCorrections.map(row => row.claimId));

const b24AddedIds = [
  'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
  'cl-lcc143-actor-split-incentive-and-discount-rate-reversal',
  'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting',
  'cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary',
  'cl-lcc143-demarcating-ra-eia-and-mfa-ioa',
  'cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles',
  'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals',
  'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal',
];

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
    throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
  }
  assertCleanCostSustainabilityProse(unit.rationale, 'unit.rationale');
  for (const row of unit.changes) {
    if (!exactKeys(row, allowedChangeKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.rationale, `changes(${row.key}).rationale`);
    if (row.kind === 'record') {
      if ((row.from !== null && !exactKeys(row.from, allowedRecordDigestKeys))
          || !exactKeys(row.to, allowedRecordDigestKeys)) {
        throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
      }
    }
  }
  for (const row of unit.consumers) {
    if (!exactKeys(row, allowedConsumerKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.rationale, `consumers(${row.id}).rationale`);
  }
  for (const row of unit.corrections) {
    if (!exactKeys(row, allowedCorrectionKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.scope, `corrections(${row.claimId}).scope`);
  }
  for (const row of unit.rawRecords) {
    if (!exactKeys(row, allowedRawRecordKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.rawFields) {
    if (!exactKeys(row, allowedRawFieldKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.outputs) {
    if (!exactKeys(row, allowedOutputKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.rationale, `outputs(${row.path}#${row.route}).rationale`);
  }
  for (const row of unit.publicArtifacts) {
    if (!exactKeys(row, allowedPublicArtifactKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.rationale, `publicArtifacts(${row.path}).rationale`);
  }
  for (const row of Object.values(unit.history.ordinaryTargets)) {
    if (!exactKeys(row, allowedOrdinaryTargetKeys)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
  }
  for (const row of unit.history.history) {
    if (!exactKeys(row, allowedHistoryRowKeys) || !Array.isArray(row.ordinary)) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    assertCleanCostSustainabilityProse(row.rationale, `history(${row.address}).rationale`);
    for (const block of row.ordinary) {
      if (!exactKeys(block, allowedOrdinaryBlockKeys)) {
        throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
      }
      assertCleanCostSustainabilityProse(block.rationale, `history.ordinary(${block.targetId}).rationale`);
    }
  }
  if (!reviewed) {
    if (unit.outputCapture !== null
        && !(exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
          && scienceDigest(unit.outputCapture.manifestSha256)
          && scienceDigest(unit.outputCapture.normalizedProofSha256))) {
      throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
    }
    return;
  }
  if (!exactKeys(unit.outputCapture, allowedOutputCaptureKeys)
      || !scienceDigest(unit.outputCapture.manifestSha256)
      || !scienceDigest(unit.outputCapture.normalizedProofSha256)
      || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
      || unit.reviewEvidence.some(row => !exactKeys(row, allowedReviewEvidenceKeys))) {
    throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
  }
}

export function selectCostSustainability(config, pin = costSustainabilityUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Cost and sustainability requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (!plainObject(unit) || unit.id !== costSustainabilityId || !sameScienceValue(unit.source, costSustainabilitySource)
      || !sameScienceValue(unit.routes, costSustainabilityRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !sameScienceValue(unit.corrections, costSustainabilityCorrections)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Cost and sustainability requires an exact 8d5f1037 predecessor and bounded B24 plan');
  }
  if (preview && config.status === 'preview' && pin === null) {
    if (unit.reviewEvidence !== undefined) {
      throw new Error('Cost and sustainability is not independently accepted');
    }
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Cost and sustainability is not independently accepted');
  }
  assertUnitEnvelopeKeys(unit, true);
  return unit;
}

const priorSourceAppends = {
  'src-hsg2013-lca-lcc':
    ' 2026-11-18（生命周期成本与综合评价单元）同载体另核第1—2节（印第1723—1725页：引述Hunkeler等2008第173页常规LCC定义与第47页全书唯一显式计算式1，指出Swarr等2011全文仅第6页含1个公式、Hunkeler等2008仅含5个公式，剖析Swarr表3-1a并列研发／制造与购置价及汽车10,000 €购价加40,000 €运行费＝50,000 €却误加6,000 €零部件的价格链重复计入陷阱）与第3—4节（印第1728—1732页：式10—19证明缩放货币矩阵附加值向量下使用方LCC等于使用过程负附加值13.5 €、加喷雾维护增10 €至23.5 €，式17—18引入环境税费向量β并重申禁止外部影子成本双计，指出摇篮到大门商品因销售收入大于成本算出负LCC、稳态CO₂等权相加同净现值贴现的时间分歧、润滑油毒性对广告与研发成本的非对称截断以及式25—28与表6的统一矩阵表达）。',
  'src-acid113-glam-scoping':
    ' 2026-11-18（生命周期成本与综合评价单元）同载体另核自然资源保护领域范围（印第107—108、110页：引述Beylot等2020综述45篇文献提出的25年短期资源耗散界定、SUPRIM超100年长期耗散与动态物质流整合框架，以及ISO 14008:2019自然资源货币估值中使用价值与非使用价值的范围差异）、表3归一化方法分类（印第138—141页：区分内部基线／极值／总和除法、成对级别高于outranking归一化与基于承载力／地球边界的绝对环境可持续性评价外部归一化，明载地球边界法当前限于生态系统相关影响、缺失人体健康与自然资源损害覆盖且阈值不确定性显著）以及赋权与决策分析专题（印第142—143、159—162页：汇总31名子任务成员中20份问卷回复、8/20使用多准则决策分析MCDA与17/20陈述赋权选择的调查结果，界分补偿性加权和、非补偿性ELECTRE／PROMETHEE级别高于排序、边界轮廓分类sorting及美国环保署SMM工具等权重“客观无主观性”认知偏差）。',
  'src-kb52-cml-2001-part3':
    ' 2026-11-18（生命周期成本与综合评价单元）同载体另核第1.2.3.1节（印第22页：辨析潜在影响与排污许可及场址决策所需的实际影响连续谱）、第4.8节与表4.8.1（印第249—251页：对比无加权比较、定性与定量多准则分析MCA，综述Finnveden 1999a划分的5大类赋权法及其中适用于LCA的3类即货币法、政府标准／目标距离法与专家小组法，阐明个人揭示偏好、个人陈述偏好、集体揭示偏好与治理恢复成本算出的同名货币总额不可直接通约比较）以及附录B及表B1（Roorda与van der Ven，印第279—285页：系统对照风险评估RA含场址特定与非场址特定风险评估、环境影响评价EIA、技术评估TA、生命周期评价LCA、特定物质流分析SFA与环境管理体系EMS共6种工具的研究对象、时空分辨率与法定审批边界）。',
  'src-book-ilcd-2010':
    ' 2026-11-18（生命周期成本与综合评价单元）同载体另核第5.2.1节（印第31页：将环境LCA结果同生命周期成本信息结合开展生态效率分析的应用定位）、第5.2.2节（印第33页：界定受购置价或生命周期成本／全拥有成本TCO、耐用性及公平贸易／无童工等价值属性区隔的细分市场可比性限制）以及第6.4.3—6.4.4节（印第63页：规定食品、饮品或室内直接接触等在技术圈内直接作用于人体的产品属性影响不得并入生态圈清单，应借助风险评估RA等工具模块化互补评估，并区分必需属性与市场定位属性）。',
  'src-kb44-ec2021':
    '；2026-11-18（生命周期成本与综合评价单元）同载体另核附件一前置“与其他方法及标准的关系”小节与参考文献（印第L 144/22、105—106页：列明16类多指标PEF方法同EN ISO 14067:2018产品碳足迹、ISO 14046:2014水足迹、2009年生态足迹标准及温室气体核算体系产品标准的方法衔接）以及附件一第5节脚注（54）、第6.4节与附件三第6.4节（印第L 144/87、94、284页：明文规定环境足迹影响评价旨在表征环境压力而非预测特定地点与特定时间是否超越法定阈值并发生实际损害，因而不能替代环境风险评估（E）RA、场址特定环境影响评价EIA或产品与工作场所健康安全法规）',
};

const priorEvidenceLocatorSyncs = Object.freeze({
  'ev-sustainability-lcsa-social-reference': {
    from: '§2.3及数据可得性讨论，印刷pp3314–3315，PDF indices5–6',
    to: '第2.3节及数据可得性讨论，印第3314—3315页',
  },
  'ev-sustainability-lcsa-weighting-conditions': {
    from: '§3开头及§3.1，印刷pp3315–3317，PDF indices6–8',
    to: '第3节开头及第3.1节，印第3315—3317页',
  },
});

const priorReadingAdditions = {
  'rd-service102-hsg-selected': { passages: 2, sourceKeys: [] },
  'rd-acid113-glam-scoping': { passages: 4, sourceKeys: [] },
  'rd-cml-2001-part3': { passages: 2, sourceKeys: [] },
  'rd-ilcd-2010': { passages: 2, sourceKeys: [] },
  'rd-kb44-ec2021': { passages: 2, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-hsg2013-lca-lcc': {
    limitation: '2026-11-18（生命周期成本与综合评价单元）同载体追加核读印第1723—1725、1728—1732页，核实上游价格重复计入算例、使用过程负附加值LCC恒等式、环境税费向量β、摇篮到大门负LCC、贴现对稳态CO₂相加及润滑油对广告研发的非对称截断。',
  },
  'work-acid113-glam-scoping': {
    limitation: '2026-11-18（生命周期成本与综合评价单元）同载体追加核读印第107—108、110页耗散流与ISO 14008估值范围、印第138—141页表3地球边界承载力外部归一化局限，以及印第142—143、159—162页补偿性与非补偿性MCDA调查结论。',
  },
  'work-cml-2001-guide': {
    limitation: '2026-11-18（生命周期成本与综合评价单元）同载体追加核读第3分册第1.2.3.1节（印第22页）、第4.8节（印第249—251页Finnveden 1999a货币估值异质性）及附录B表B1（印第279—285页LCA同RA、EIA、TA、SFA、EMS六种工具边界对照）。',
  },
  'lit-n03': {
    limitation: '2026-11-18（生命周期成本与综合评价单元）同载体追加核读第5.2.1—5.2.2节（印第31、33页生态效率与全拥有成本TCO细分市场）及第6.4.3—6.4.4节（印第63页技术圈内直接人体接触交由风险评估RA模块化互补评估）。',
  },
  'lit-n04': {
    limitation: '2026-11-18（生命周期成本与综合评价单元）同载体追加核读附件一前置“与其他方法及标准的关系”小节、第5节脚注（54）、第6.4节与参考文献及附件三第6.4节（印第L 144/22、87、94、105—106、284页），核实单项碳／水／生态足迹标准映射及不预测局部阈值超标的法定互补边界。',
  },
};

const expectedPriorClaimSyncs = Object.freeze({
  'cl-sustainability-lcc-actor-perspective': {
    fromScope: '2010论文§2.2的成本主体、寿命与参照对象',
    toScope: 'Finkbeiner 等 2010 年论文第 2.2 节的成本主体、产品寿命与参照对象',
    from: '沿用上一章的设问，假定两种工作服提供同一穿用服务，采购方就可以比较取得、维护和更换衣服的支出。制造商却会另算生产支出和销售收入：采购方付出的货款，在制造商一侧是收入。Finkbeiner等人2010年的框架论文以产品寿命内的货币流组织生命周期成本（LCC），区分生产者、顾客、社会等视角。在同一功能参照下，要解释总成本，还须说明支出、收入和责任分别属于哪个主体。',
    to: '沿用前文《社会表现与影响》的设问，假定两种工作服提供同一穿用服务，采购方就可以比较取得、维护和更换衣服的支出。制造商却会另算生产支出和销售收入：采购方付出的货款，在制造商一侧是收入。Finkbeiner 等人 2010 年的框架论文以产品寿命内的货币流组织生命周期成本（LCC），区分生产者、顾客、社会等视角。在同一功能参照下，要解释总成本，还须说明支出、收入和责任分别属于哪个主体。',
    fromCaveats: [
      '2010 框架论文的 CC BY3.0 不覆盖所引 2008 成本书的全部权利或内容。',
      '这里不提供成本参数；币种年、贴现、税费和实际货币流仍是具体计算所需条件。',
    ],
    toCaveats: [
      '2010 年框架论文的知识共享署名 3.0 许可（CC BY 3.0）不覆盖所引 2008 年成本专著的全部权利或内容。',
      '这里不提供成本参数；币种年、贴现、税费和实际货币流仍是具体计算所需条件。',
    ],
  },
  'cl-sustainability-lcc-internalization-boundary': {
    fromScope: '2010论文对2008EnvironmentalLCC定义的二手引用',
    toScope: 'Finkbeiner 等 2010 年论文对 2008 年环境生命周期成本（Environmental LCC）定义的转引',
    from: '尚未由交易双方承担的后果会不会进入这本账？2010年的论文引用2008年著作对环境生命周期成本（Environmental LCC）的定义：计入一个或多个主体直接承担的生命周期成本，也计入与决策有关、预计将来会内部化的外部性。若某项排放未来预计将使纳费主体增加支出，是否计入取决于这项预期的依据及研究范围。仍未计价的健康损害不能填成零；这一定义也没有声称已把所有环境和社会影响变成完整的社会福利账。',
    to: '尚未由交易双方承担的后果会不会进入这本账？2010 年的论文引用 2008 年著作对环境生命周期成本（Environmental LCC）的定义：计入一个或多个主体直接承担的生命周期成本，也计入与决策有关、预计将来会内部化的外部性。若某项排放未来预计将使纳费主体增加支出，是否计入取决于这项预期的依据及研究范围。仍未计价的健康损害不能填成零；这一定义也没有声称已把所有环境和社会影响变成完整的社会福利账。',
    fromCaveats: [
      '这里只采用 2010 论文对 2008 定义的二手引述，不据此重建完整 LCC 方法。',
      '这段定义不提供外部成本、价格或政策结果。',
    ],
    toCaveats: [
      '本段仅采用 2010 年框架论文对 2008 年专著定义的转引范围；三类成本范式的制度边界与矩阵抵消机制另结合本章第 4—6 段引用的 2011 年实务守则论文、联合国指南与 2013 年矩阵文献展开比较，不延伸至 2008 年专著其余章节。',
      '这段定义不提供外部成本、价格或政策结果。',
    ],
  },
  'cl-sustainability-conceptual-combination-not-sum': {
    fromScope: '2010概念框架与2020指南对重叠的共同限定',
    toScope: '2010 年概念框架与 2020 年社会评价指南对跨支柱重叠的共同限定',
    from: '同一项工作服采购可以同时面对用能或排放、工厂劳动条件和各方的成本。2010年论文用“LCSA = LCA + LCC + SLCA”概括生命周期可持续性评价的这项工作。加号表示三个问题都要进入判断；公斤当量、社会表现级别和货币并不因此可直接相加。UNEP 2020年指南还提醒三种方法会涉及相同议题，例如健康。共用议题名和重复计入同一后果是两件事，需要看各项评价实际包含什么。',
    to: '同一项工作服采购可以同时面对用能或排放、工厂劳动条件和各方的成本。2010 年论文用“LCSA = LCA + LCC + SLCA”概括生命周期可持续性评价（LCSA），即把生命周期评价（LCA）、生命周期成本（LCC）与社会生命周期评价（SLCA，亦写作 S-LCA）置于同一产品框架下考察。式中的加号表示三个维度的问题都要进入判断，公斤当量、社会表现级别和货币并不因此可直接相加。联合国环境规划署（UNEP）2020 年指南还提醒三种方法会涉及相同议题，例如健康。共用议题名和重复计入同一后果是两件事，需要看各项评价实际包含什么。',
  },
  'cl-sustainability-social-proxy-product-attribution': {
    fromScope: 'Finkbeiner等2010选用的社会代理及其产品归属边界，应用到工作服设例',
    toScope: 'Finkbeiner 等 2010 年论文选用的社会代理指标及其产品归属边界',
    from: '2010年的作者为获得可操作的社会资料，讨论过人类发展指数（HDI）、基尼系数和联合国全球契约（Global Compact）等代理，也承认它们不能直接对应某项产品。与上一章的地区风险线索一样，地区或组织的资料能提示考察重点，但要归到特定的工作服产品，仍须说明地区或组织的资料如何关联到该产品的供应链。不能把代理值当成在这件产品上测得的属性，也无需把该论文列举的指标当成今天的固定清单。',
    to: '2010 年论文的作者为获得可操作的社会资料，讨论过人类发展指数（HDI）、基尼系数和联合国全球契约（Global Compact）等代理，也承认它们不能直接对应某项产品。与前文《社会表现与影响》讨论的地区风险线索一样，地区或组织的资料能提示考察重点，但要归到特定的工作服产品，仍须说明地区或组织的资料如何关联到该产品的供应链。不能把代理值当成在这件产品上测得的属性，也无需把该论文列举的指标当成今天的固定清单。',
    fromPremises: [],
    toPremises: [
      'cl-sustainability-social-object-and-stakeholders',
      'cl-sustainability-conceptual-combination-not-sum',
    ],
    fromCaveats: [
      '代理指标及其产品分配需要各自的数据和方法依据。',
      '地区指标不能直接用于认定个体、企业行为或国家固有特性。',
      '工作服是本书的教学设定，不是2010年论文中的实证对象。',
    ],
    toCaveats: [
      '代理指标及其产品分配需要各自的数据和方法依据。',
      '地区指标不能直接用于认定个体、企业行为或国家固有特性。',
      '工作服是本书的教学设定，不是 2010 年论文中的实证对象。',
    ],
  },
  'cl-sustainability-dashboard-zero-is-relative': {
    fromScope: '2010仪表盘相对分数与2020社会量表零值的区别',
    toScope: '2010 年仪表盘相对零分与 2020 年社会量表零值的语义区别',
    from: '并列表也可能把指标转成颜色或统一分数。2010年论文的仪表盘按比较集合中表现最好和最差的方案分配相对分数，缺失资料另作标识。最差端的0说明它在这组方案里的位置，既不是无影响，也不是绝对不可持续的阈值。换了参照集合，分数也可能变；这与社会量表的合规零、正负项目相抵的净零不同。',
    to: '并列表也可能把指标转成颜色或统一分数。2010 年论文的仪表盘按比较集合中表现最好和最差的方案分配相对分数，缺失资料另作标识。最差端的 0 分说明它在这组方案里的位置，既不是无影响，也不是绝对不可持续的阈值。换了参照集合，分数也可能变；这与社会量表的合规零、正负项目相抵的净零不同。',
    fromPremises: [
      'cl-sustainability-ordinal-zero-and-net-zero',
      'cl-sustainability-explicit-aggregation-conditions',
    ],
    toPremises: [
      'cl-sustainability-ordinal-zero-and-net-zero',
      'cl-sustainability-conceptual-combination-not-sum',
    ],
  },
  'cl-sustainability-explicit-aggregation-conditions': {
    fromScope: '2010论文§3的条件性聚合与2020赋权限定',
    toScope: '2010 年论文第 3 节的条件性效用聚合与 2020 年指南的赋权限定',
  },
  'cl-book-cost-decision': {
    fromScope: '教学示例的无加权读法',
    toScope: '第五部多维价值取舍的收束与面向下一部《数据与证据》的交接',
    from: '在工作服的设问中，可以先并列采购支出、供应链工作条件资料和环境指标，同时标出哪些尚缺资料、哪些结果用的是相对尺度。即使还未选定共同权重，决策者也可先看采购支出、工作条件资料和环境指标各说明了什么，再按采购目的，优先核实可能改变决定的假设。下一步要问的就是：手里的数据究竟能代表哪家工厂、哪种材料和哪个时期？',
    to: '回到工作服采购的完整判断：采购现金流、内部化税费、偏好损害估值与社会风险工时遵循不同的核算规则，集合内极差仪表盘、补偿性线性加权、非补偿性否决阈值与地球边界配额分配又各自引入不同的价值前提，而场址超标许可和区域物质收支还须交给风险评估、环境影响评价与物质流分析各司其职。即使尚未选定共同权重，决策者也可先并列采购支出、供应链劳动权利核查和多项环境指标，标明缺失资料、相对零点与不可补偿的合规底线，按采购目的优先核实足以翻转决定的关键假设。进入下一部《数据与证据》之前，下一步要问的就是：手里的数据究竟能代表哪家工厂、哪种材料和哪个时期？',
    fromPremises: [
      'cl-sustainability-dashboard-zero-is-relative',
      'cl-sustainability-explicit-aggregation-conditions',
      'cl-sustainability-risk-not-facility-performance',
      'cl-sustainability-lcc-actor-perspective',
      'cl-sustainability-conceptual-combination-not-sum',
    ],
    toPremises: [
      'cl-sustainability-risk-not-facility-performance',
      'cl-sustainability-lcc-actor-perspective',
      'cl-lcc143-actor-split-incentive-and-discount-rate-reversal',
      'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting',
      'cl-sustainability-conceptual-combination-not-sum',
      'cl-lcc143-demarcating-ra-eia-and-mfa-ioa',
      'cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles',
      'cl-sustainability-dashboard-zero-is-relative',
      'cl-sustainability-explicit-aggregation-conditions',
      'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals',
      'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal',
    ],
  },
});

const addedSourceIds = [
  'src-lcc143-swarr-2011-code',
  'src-lcc143-unep-setac-2011-lcsa',
  'src-lcc143-finkbeiner-2010-lcst-lcsd',
  'src-lcc143-suh-2004-dissertation',
  'src-lcc143-steinmann-2016-indicators',
  'src-lcc143-hellweg-2014-emerging',
  'src-lcc143-oneill-2026-strong-sustainability',
];
const addedReadingIds = [
  'rd-lcc143-swarr-2011-code',
  'rd-lcc143-unep-setac-2011-lcsa',
  'rd-lcc143-finkbeiner-2010-lcst-lcsd',
  'rd-lcc143-suh-2004-dissertation',
  'rd-lcc143-steinmann-2016-indicators',
  'rd-lcc143-hellweg-2014-emerging',
  'rd-lcc143-oneill-2026-strong-sustainability',
];
const addedWorkIds = [
  'work-lcc143-swarr-2011-code',
  'work-lcc143-unep-setac-2011-lcsa',
  'work-lcc143-finkbeiner-2010-lcst-lcsd',
  'work-lcc143-suh-2004-dissertation',
  'work-lcc143-steinmann-2016-indicators',
  'work-lcc143-hellweg-2014-emerging',
  'work-lcc143-oneill-2026-strong-sustainability',
];

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && correctedClaimIds.has(id))
      || (kind === 'evidence' && Object.hasOwn(priorEvidenceLocatorSyncs, id))
      || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
      || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
      || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  }
  if (kind === 'claims') return b24AddedIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-lcc143-');
  if (kind === 'sources') return addedSourceIds.includes(id);
  if (kind === 'readings') return addedReadingIds.includes(id);
  if (kind === 'literature') return addedWorkIds.includes(id);
  if (kind === 'queries') return id === 'q-lcc143-actor-lcc-mcda-adjacent-tools-and-aesa-20261118';
  if (kind === 'gaps') return id === 'gap-lcc143-hunkeler2008-swarr-booklet-and-iso-valuation-texts';
  return kind === 'revisions' && id === 'rev-lcc143-b24-cost-and-sustainability-comparison';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    assertCleanCostSustainabilityProse(append, `priorSourceAppends.${id}`);
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, checkedAt: costSustainabilityCheckDate, scope: source.reading.scope + append },
    })) {
      throw new Error(`Cost and sustainability changed prior source identity or acquisition scope: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorEvidenceLocatorSyncs)) {
    assertCleanCostSustainabilityProse(spec.to, `priorEvidenceLocatorSyncs.${id}`);
    const ev = prior('catalog.evidence', id);
    const current = catalog.evidence.find(row => row.id === id);
    if (!ev || ev.locator !== spec.from || !sameScienceValue(current, { ...ev, locator: spec.to })) {
      throw new Error(`Cost and sustainability changed unauthorized field on prior evidence: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const expectedKeys = [...(reading?.sourceKeys ?? []), ...spec.sourceKeys];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-lcc143-'))
        || !sameScienceValue(current, {
          ...reading,
          passages: [...reading.passages, ...addedPassages],
          ...(spec.sourceKeys.length && { sourceKeys: expectedKeys }),
        })) {
      throw new Error(`Cost and sustainability changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    assertCleanCostSustainabilityProse(spec.limitation, `priorWorkAppends.${id}.limitation`);
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    const expected = {
      ...work,
      lastCheckedAt: costSustainabilityCheckDate,
      limitations: [...(work?.limitations ?? []), spec.limitation],
    };
    if (!work || !sameScienceValue(current, expected)) {
      throw new Error(`Cost and sustainability changed prior literature work identity: ${id}`);
    }
  }
  for (const wid of addedWorkIds) {
    const w = literature.records.find(row => row.id === wid);
    if (!w) throw new Error(`Missing added literature work ${wid}`);
    assertCleanCostSustainabilityProse(w.title, `${wid}.title`);
    assertCleanCostSustainabilityProse(w.rights, `${wid}.rights`);
    assertCleanCostSustainabilityProse(w.discovery.reason, `${wid}.discovery.reason`);
    w.limitations.forEach((lm, idx) => assertCleanCostSustainabilityProse(lm, `${wid}.limitations[${idx}]`));
  }
  const gap = readings.gaps.find(row => row.id === 'gap-lcc143-hunkeler2008-swarr-booklet-and-iso-valuation-texts');
  const rev = readings.revisions.find(row => row.id === 'rev-lcc143-b24-cost-and-sustainability-comparison');
  const query = literature.protocol.queries.find(row => row.id === 'q-lcc143-actor-lcc-mcda-adjacent-tools-and-aesa-20261118');
  if (!gap || !rev || !query) throw new Error('Missing Unit 143 gap, revision or query');
  assertCleanCostSustainabilityProse(gap.description, 'gap-lcc143.description');
  assertCleanCostSustainabilityProse(gap.nextAction, 'gap-lcc143.nextAction');
  assertCleanCostSustainabilityProse(rev.before, 'rev-lcc143.before');
  assertCleanCostSustainabilityProse(rev.after, 'rev-lcc143.after', true);
  assertCleanCostSustainabilityProse(rev.reasoning, 'rev-lcc143.reasoning', true);
  assertCleanCostSustainabilityProse(query.query, 'q-lcc143.query');
  assertCleanCostSustainabilityProse(query.channel, 'q-lcc143.channel');
}

function qualifyCorrections(unit, records, catalog) {
  for (const { claimId } of costSustainabilityCorrections) {
    if (!records.has(`claims:${claimId}`)) {
      throw new Error(`Cost and sustainability missing actual record transition for ${claimId}`);
    }
    const spec = expectedPriorClaimSyncs[claimId];
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    const expected = {
      ...original,
      reviewedAt: costSustainabilityCheckDate,
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
      throw new Error(`Cost and sustainability modified unauthorized fields on ${claimId}`);
    }
    assertCleanCostSustainabilityProse(current.scope, `${claimId}.scope`);
    assertCleanCostSustainabilityProse(current.text, `${claimId}.text`);
    (current.caveats ?? []).forEach((cv, idx) => assertCleanCostSustainabilityProse(cv, `${claimId}.caveats[${idx}]`));
  }
}

const expectedTable1Mdx = [
  '| 货币核算或估值范式 | 核算主体与决策问题 | 内部交易与税费处理 | 时间贴现约定 | 未计价环境／社会后果 | 并入生命周期可持续性评价（LCSA）的边界 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 常规生命周期成本（Conventional LCC，自 1933 年美国总会计局 GAO 传统） | 单一组织（多为采购方全拥有成本 TCO 或制造方内部成本） | 仅计该主体自身现金收支；常忽略上游外部环节或报废端 | 按企业资本机会成本贴现为净现值（NPV） | 账外外部性一律不计 | 系统边界常窄于物理生命周期，需先对齐功能单位方可并列 |',
  '| 环境生命周期成本（Environmental LCC，Swarr 等 2011／Heijungs 等 2013） | 产品链一个或多个主体在等价功能单位下的真实货币流 | 中间商品价格在矩阵附加值中一负一正抵消；纳入现行及预期决策期内（如 2 年内）内部化的税费或补贴 | 建议按决策目标选用私人或社会贴现率，并以 0% 无贴现作敏感性对照 | 严禁把未内部化环境损害再折算成货币叠加 | 与环境生命周期评价（E-LCA）和社会评价互补，避免同源排放双计 |',
  '| 社会生命周期成本（Societal LCC，UNEP/SETAC 2011 图 5） | 社会整体福利视角下的全部私人成本收益加货币化外部性 | 抵消主体间纯转移支付（如已缴环境税不可再与全额影子损害重复相加） | 多采用较低社会贴现率评估跨期公共福利 | 将气候、污染等外部损害按影子价格或治理成本并入总账 | 若已货币化环境损害，不得再与 E-LCA 物理指标重复加总同一后果 |',
  '| 环境损害支付意愿估值（日本 LIME2／ISO 14008，见前文《环境损害估值》） | 受访公众避免边际健康或生态损害的陈述／揭示支付意愿（WTP） | 非市场偏好权重（如 LIME2 赋 1.47×10⁷ JPY/DALY），不代表企业账面现金支出 | 取决于终点暴露积分期与调查情景设定 | 覆盖部分使用价值与非使用价值，但受收入水平与未知路径限制 | 属影响评价赋权因子；若并入全成本（如日本洗衣机占 3.74%）须防双计 |',
  '| 资源未来额外采选成本终点（ReCiPe 2016 USD2013，见前文《中点与终点》） | 当代开采迫使未来人类转向低品位矿床或边际油气田的额外采选费 | 宏观地质品位—产量回归积分（如原油 0.457 USD2013/kg），不含现期买方采购价 | ReCiPe 2016 化石燃料终点按未来累计额外成本未贴现均值计算 | 仅表征非生物资源稀缺保护领域，不含污染健康或劳工条件 | 属环境终点指标而非财务支出，绝不可与采购方 LCC 现金流直接相加 |',
].join('\n');

const expectedTable2Mdx = [
  '| 综合呈现或相邻方法范式 | 零点／基准定义 | 跨维度可补偿性与否决机制 | 同一工作服算例表现 | 触发结论反转的非物理因素 | 原生适用范围与互补职责 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 分项并列与缺失单列（Finkbeiner 2010／UNEP/SETAC 2011 基线） | 各支柱保留原生物理当量、风险工时与货币零点；缺失资料单独标注 | 不做跨支柱加总，显式呈现环境、成本与劳动条件间的真实权衡 | 直接看清甲省总现值（0% 下 132.00 € 对 140.00 €）、丙低碳高价、戊涉强迫劳动风险 | 无算术掩盖；优先补证能否翻转判断的关键缺项 | 早期与常规 LCSA 首选方式，防止不可通约目标被单分抹平 |',
  '| 集合内极差相对仪表盘（LCSD，0—1,000 分七色标尺） | 候选集内最优赋 1,000 分（深绿）、最差赋 0 分（深红），缺失标紫罗兰色 | 同一主题及跨主题算术或加权平均，默认允许高分项补偿 0 分项 | 在甲、乙、丙中甲以 722.22 分胜乙（583.33 分）；加入严格劣标丁后乙以 816.67 分反超甲（800.00 分） | 违反无关备选方案独立性（IIA），陪跑劣方案改写极差分母 | 仅表征本组候选内部相对位次，0 分既非零影响亦非绝对红线 |',
  '| 补偿性效用与三角图（LCST／MAUT／线性加权和） | 按内外部归一化转无量纲效用，三支柱权重和为 100% | 完全补偿：任一维度劣势均可被其余维度的足够高分抵消 | 在甲、乙、戊等权极差加权下，涉严重劳工风险的戊凭低碳低价满分以 666.67 分夺冠 | 权重向量选择（等权重亦为主观价值设定）与效用函数曲率 | 适用于不存在底线违约、且决策者明确接受边际替代率的优选 |',
  '| 非补偿性级别高于与否决阈值（ELECTRE／PROMETHEE，GLAM 第三阶段） | 成对比较优劣差距，设定无差异、严格偏好与不可逾越否决阈值 | 非补偿或部分补偿：单项劣势触及否决阈值即一票阻断“级别高于”关系 | 戊虽在碳与成本两柱占 2/3 和谐多数，但社会风险差距 60 h 触及 50 h 否决线而被一票阻断级别高于关系（无缘胜出） | 否决阈值、边界轮廓类别（sorting）与和谐度门槛设定 | 守住禁止童工、强迫劳动或法定限值等不可被低价抵消的硬约束 |',
  '| 生态效率与场址／区域相邻工具（Eco-efficiency／RA／EIA／MFA-IOA） | 比值以单位成本或附加值作分母；RA 以预测浓度与无效应浓度比 1 为界 | 生态效率单看环境／货币比；RA 与 EIA 按场址法定浓度限值独立准入 | 摇篮到大门净附加值为正致负 LCC；单厂排 10 g 助剂可致局部超标，十厂散排 20 g 反低于限值 | 比值掩盖总量且分母趋零奇异；场址水文稀释与部门汇总层级改变结论 | 场址许可归 RA／EIA，国家与区域物质存量源汇归 MFA／SFA／IOA |',
  '| 地球边界承载力绝对预算比（AESA，GLAM 表 3／强可持续性甜甜圈） | 以分配给研究对象的安全运行空间配额为 1（小于等于 1 为达标） | 强可持续性禁止跨生态边界或用经济收益补偿超界项 | 甲′（20 kg，240 €）与乙′（16 kg，120 €）按消费支出分预算判甲′达标（0.833）乙′超界（1.333），按同等服务分 18.0 kg 则完全倒转 | 全球预算下放至微观产品的伦理分配原则（支出份额对同等需求） | 评估宏观或部门绝对生态上限；现缺人体健康与非生物资源边界 |',
].join('\n');

function verifyB24Mdx(previousFiles, actualFiles) {
  const prevB24 = previousFiles['content/docs/book/cost-perspectives-and-sustainability-combination.mdx'];
  const actB24 = actualFiles.get('content/docs/book/cost-perspectives-and-sustainability-combination.mdx')?.toString();

  const expectedB24 = prevB24
    .replace(
      'description: 沿用工作服采购，辨认成本由谁承担，再把环境、社会和成本结果放在同一决策中。',
      'description: 沿用工作服采购，对照三类生命周期成本账本、主体激励与贴现率翻转、五类异质货币量、多准则补偿与否决规则、场址风险与区域物质流工具边界以及地球边界配额分配。',
    )
    .replace(
      '<Prose ids="cl-sustainability-lcc-actor-perspective cl-sustainability-lcc-internalization-boundary cl-book-cost-ledgers" />',
      `<Prose ids="cl-sustainability-lcc-actor-perspective cl-sustainability-lcc-internalization-boundary cl-book-cost-ledgers cl-lcc143-three-lcc-archetypes-and-value-added-consolidation cl-lcc143-actor-split-incentive-and-discount-rate-reversal cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting" />\n\n${expectedTable1Mdx}`,
    )
    .replace(
      '<Prose ids="cl-sustainability-conceptual-combination-not-sum cl-sustainability-social-proxy-product-attribution cl-book-cost-health-overlap" />',
      '<Prose ids="cl-sustainability-conceptual-combination-not-sum cl-sustainability-social-proxy-product-attribution cl-book-cost-health-overlap cl-lcc143-cut-off-asymmetry-and-cost-rebound-boundary cl-lcc143-demarcating-ra-eia-and-mfa-ioa cl-lcc143-single-issue-footprints-vs-multi-indicator-profiles" />',
    )
    .replace(
      '<Prose ids="cl-sustainability-dashboard-zero-is-relative cl-sustainability-explicit-aggregation-conditions cl-book-cost-decision" />',
      `<Prose ids="cl-sustainability-dashboard-zero-is-relative cl-sustainability-explicit-aggregation-conditions cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals cl-lcc143-planetary-boundaries-and-sharing-principle-reversal" />\n\n${expectedTable2Mdx}\n\n<Prose ids="cl-book-cost-decision" />`,
    );

  if (actB24 !== expectedB24) {
    throw new Error('Cost and sustainability changed protected B24 MDX text, tables or section boundaries');
  }
  const occB24 = collectChapterClaimOccurrences(actB24);
  if (occB24.length !== 17) {
    throw new Error('Cost and sustainability unexpected B24 (17) claim occurrence count');
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Cost and sustainability missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Cost and sustainability inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Cost and sustainability declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

export function prepareCostSustainabilitySource(unit, input, actual, structure) {
  if (unit.layouts !== undefined) {
    throw new Error('Cost and sustainability must not amend earlier locked chapter layouts');
  }
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  if (!sameScienceValue(unit.corrections, costSustainabilityCorrections)) {
    throw new Error('Cost and sustainability unit or history contains unauthorized or unreviewed properties');
  }
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Cost and sustainability lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Cost and sustainability cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length
      || !plainObject(unit.previousFiles) || Object.keys(unit.previousFiles).length !== managedPaths.length) {
    throw new Error('Cost and sustainability lacks independently preserved predecessor B24 MDX bytes');
  }
  for (const path of managedPaths) {
    if (fileChanges.get(path)?.from !== oldFileShas[path] || sha256(unit.previousFiles[path] ?? '') !== oldFileShas[path]) {
      throw new Error(`Cost and sustainability predecessor hash mismatch on ${path}`);
    }
  }

  verifyB24Mdx(unit.previousFiles, files);
  const expectedOccurrences = Object.fromEntries(managedPaths.map(p => [p, actual.sourceOccurrences[p]]));
  if (!sameScienceValue(unit.occurrences, expectedOccurrences)
      || !b24AddedIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Cost and sustainability lacks exact B24 occurrences or claim transitions');
  }

  const { catalog, readings, literature } = input;
  qualifyCorrections(unit, recordChanges, catalog);
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateCostSustainabilityFactors(catalog, readings);

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, recordChanges, allowsRaw);
  for (const path of managedPaths) {
    files.set(path, Buffer.from(unit.previousFiles[path]));
  }
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== costSustainabilityPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== costSustainabilityPredecessorPin) {
    throw new Error('Cost and sustainability did not recover the independently observed raw 8d5f1037 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Cost and sustainability actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (unit.consumers.length !== consumers.length || !unique(unit.consumers, row => row?.id)
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Cost and sustainability lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...correctedClaimIds, ...b24AddedIds])],
  };
}

export function effectiveCostSustainability(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    costSustainability: unit,
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
      || !scienceDigest(costSustainabilityCapturePin) || editionDigest(capture) !== costSustainabilityCapturePin) {
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

export function verifyCostSustainabilityReceipts(unit, artifacts, publicDownloads) {
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
    const base = `_docs/editorial/review-evidence/${costSustainabilityId}/${row.kind}`;
    if (row.date < costSustainabilityCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function costSustainabilityOrdinaryId(unit, route, print, index) {
  if (!unit || route !== costSustainabilityRoute || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-lcc-143-ordinary-0`;
}

export function costSustainabilityHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-lcc-143-ordinary-0$/;
export function observeCostSustainabilityOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validateCostSustainabilityCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-cost-sustainability-correction]');
  const expectedRows = !unit ? [] : costSustainabilityCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Cost and sustainability correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-cost-sustainability-correction') === claimId);
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
        || !attrs(marker, 'class', 'data-cost-sustainability-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== costSustainabilitySource.date
        || !singleTextChild(time, costSustainabilitySource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(costSustainabilitySource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Cost and sustainability correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyCostSustainabilityHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeCostSustainabilityOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Cost and sustainability',
    routes: costSustainabilityRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: costSustainabilityHistoryControls(unit),
    source: costSustainabilitySource,
    attribute: 'cost-sustainability',
    ordinaryPattern,
    ordinaryTags: ['P'],
    label: 'Cost and sustainability',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Cost and sustainability actual versioned ordinary targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateCostSustainabilityCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function costSustainabilityPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreCostSustainabilityTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
