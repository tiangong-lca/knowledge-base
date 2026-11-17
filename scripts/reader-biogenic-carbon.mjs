import { validateBiogenicCarbonFactors } from './reader-biogenic-carbon-factors.mjs';
import capture from '../config/reader-biogenic-carbon-capture.json' with { type: 'json' };
import climateAccepted from '../config/climate-assembly-accepted.json' with { type: 'json' };
import acceptance from '../config/readable-book-current.json' with { type: 'json' };
import copyeditConfig from '../config/reader-copyedit-current.json' with { type: 'json' };
import { readableBookAcceptancePins, readableBookBaselineDigest } from './reader-current-edition-pins.mjs';
import { readerCopyeditUnitPin } from './reader-copyedit-pins.mjs';
import { copyeditLayout, copyeditSourceStructure, selectReaderCopyedit } from './reader-copyedit.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import {
  editionDigest, inspectReadableBookEdition, pinnedReadableBookUnits,
  readableBookReviewPlan, sha256, verifyReadableBookReviewReceipts,
} from './reader-current-edition.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const biogenicCarbonId = 'biogenic-carbon-127';
export const biogenicCarbonSources = [
  '/monograph/climate-equivalence',
  '/docs/book/climate-response-and-metrics',
  '/docs/book/emission-time-and-assessment',
];
export const biogenicCarbonRoutes = [
  'book-climate-equivalence',
  '/docs/book/climate-response-and-metrics',
  '/docs/book/emission-time-and-assessment',
];
/** @type {string|null} */
export const biogenicCarbonUnitPin = 'f2c276f1c05ea205fe0d380512a8458c58723d7a764612376a3d22ea55d009ca';
/** @type {string|null} */
export const biogenicCarbonCapturePin = '04175d3adc03b5ecec944e50c1e5249696f309f7803042b3a70a1ddaa2c72f04';
export const biogenicCarbonSource = Object.freeze({
  commit: '5c98244958fdb290f506429b98c600fe7f50e361',
  tree: '10922cd4f74024264dcc65b8cb3f0029276ebf3a',
  manifest: '5ddc88df400f57ab1d8aa53f18866ace2cb87e46a5ba2b3df92bc660926d323c',
  date: '2026-11-17',
});
export const biogenicCarbonPredecessorPin = '77fdafac46c642d6ff535e4cc05e7ccfa5fbb18660bb1e49ffa5c23c2ee19991';
const addressPin = '634de6089ef2ea642362255a613576285fdad231bafd76aafbce4f6e5819c68f';

const managedPaths = biogenicCarbonSources.map(route => `content${route}.mdx`);
const oldMdxShas = Object.freeze({
  'content/monograph/climate-equivalence.mdx': 'b5fceaa27f25f115fd1bb9f3235f13c8ad5fc1d25b5946c9baa329bf053602ec',
  'content/docs/book/climate-response-and-metrics.mdx': 'd3f4b3bdb09b030a3cc5409f22573fc100c170317f0b27f36ec93eb0b6e97169',
  'content/docs/book/emission-time-and-assessment.mdx': '30ba85d1052688d030ee1f12bfa19a24c92272865c4bcdbb7303994f0379a4ce',
});
const oldDescLines = Object.freeze({
  'content/monograph/climate-equivalence.mdx': 'description: 两项排放的CO₂当量相同，意味着什么？气候响应、碳收支和排放时间会改变答案。',
  'content/docs/book/climate-response-and-metrics.mdx': 'description: 用辐射强迫和温度响应说明气候当量，并比较因子版本、排放时点和排放历史带来的差别。',
  'content/docs/book/emission-time-and-assessment.mdx': 'description: 区分两种评价时间设定，说明排放日期怎样影响动态表征。',
});
const layoutKeys = new Set(biogenicCarbonSources.map(route => `B15:${route}:reader-source`));
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectBiogenicCarbon(config, pin = biogenicCarbonUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Biogenic carbon requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== biogenicCarbonId || !sameScienceValue(unit.source, biogenicCarbonSource)
      || !sameScienceValue(unit.routes, biogenicCarbonRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || unit.layouts.length !== layoutKeys.size
      || !unique(unit.layouts, row => row?.key) || unit.layouts.some(row => !layoutKeys.has(row?.key))
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Biogenic carbon requires an exact 5c982449 predecessor and bounded B15 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Biogenic carbon is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-17（气候当量单元）同载体另核§1表1–2印pp5–6、§3.1印pp13–19（表3：推荐IPCC 2007百年GWP100为Level I中点并以20年和500年作敏感性分析，§3.1.7印p18终点仅列De Schryver等2009为interim而无正式推荐，同时§3.1.6印p18将N₂O在500年视角较100年低约一半误印为高约2倍“significantly higher characterisation factor (factor 2)”）及§5 Annex 1 / §5.1印pp123–124',
  'src-kb44-pef-guidance2018':
    ' 2026-11-17（气候当量单元）同载体另核§7.9–§7.9.4印pp65–70（表13印p70：化石与土地利用变化甲烷34+2.75=36.75、化石与土地利用变化一氧化碳1.57、超过100年森林与产品碳储存抵扣流carbon dioxide (biogenic-100yr)=-1，印p70并对照AR5依Boucher等2009加+2得36）及Annex H印pp229–231（印p230列-1）。',
  'src-kb44-ec2021':
    ' 2026-11-17（气候当量单元）同载体另核Annex I §3.2.3表2（OJ L 144/29–30注1：绝对值贡献超过5%的气候子指标须分列报告，注1误印“Climate change –Change fossil / biogenic”且表2仍印“based on IPCC 2013”）与§4.4.10–§4.4.10.3（OJ L 144/66–69注37–40：全面禁止临时与永久碳储存及延迟排放抵扣、一律视作“当下”排放且零折现，泥炭燃料与煅烧归入Fossil，原生林木材、残余物与土壤CO₂归入LULUC且排除光合吸收，食品简化模式仅建methane (biogenic)，出厂大门报告物理生物碳含量，直接土地利用变化沿用PAS 2050二十年或单次轮伐期均摊、逾二十年计0且排除iLUC，土壤碳积累排除于气候指标外，并保留条文仍列CO的滞后措辞）。',
  'src-fossil117-jrc109369':
    ' 2026-11-17（气候当量单元）同载体另核§2表1–2印pp6–8及§4.1印pp11–12（表4：EF 2.0/3.0气候变化总指标与Fossil、Biogenic、LULUC三项子指标定义，以及引自PEFCR指南的甲烷36.75、一氧化碳1.57与carbon dioxide (biogenic-100yr)=-1）。',
  'src-flow-pilot-ef31-update':
    '；2026-11-17（气候当量单元）同载体另核§2表1印pp6–7、§3表2–3印pp8–9（表3印p9将EF 3.0的36.75四舍五入印作36.8并对照EF 3.1的29.8与27）、§3.1印p9（不再在EF 3.1保留一氧化碳气候因子、删32种AR5物质、增约43种AR6物质且23种未映射）、§4.2表10印p22（全球人均气候归一化基准由8.10E+03降至7.55E+03 kg CO₂ 当量/人，变动-6.7%）及§5.1–§5.1.1.1印pp24–25（2752个EF官方数据集平均降2.9%、仅6%上升，西班牙加工废木焚烧-58%与丹麦聚氨酯废料焚烧+302%，并注明相对百分比亦受净正负号影响）',
  'src-tox123-ef31-addendum':
    ' 2026-11-17（气候当量单元）同载体另核印pp1–4：确认2022年7月EF 3.1参考包对Climate Change等6个影响类别更新表征因子（气候变化按IPCC 2021更新）、第2节说明other目录Look@LCI配置与自动转换器结构，以及第5.2.15节表1（印p4）将PEF方法合规源由2019年更新建议报告切换为Commission Recommendation (EU) 2021/2279 Annex I及EF 3.1包0eb2b770。',
  'src-kb54-ipcc-ar6-errata-2025-10-07-pdf':
    ' 2026-11-17（气候当量单元）同载体另核印刷及PDF第25页（Chapter 7 FGD p124，Table 7.15第4行非化石甲烷出版前修订记录：将终审草稿GWP20=80.8、GWP100=27.2、GWP500=7.3替换为2021正式出版表79.7、27.0、7.2），确认EF 3.1归一化工作簿K1161遗留值27.2的精确来源。',
  'src-land111-rivm2016':
    ' 2026-11-17（气候当量单元）同载体另核表1.3–1.5印pp18–22及第2章Climate change印pp23–33（表2.1–2.3：207种温室气体I/H/E三时间窗GWP、仅H视角开启非CO₂气候—碳反馈而I与E关闭、E视角千年积分公式及AGWP1000=5.48E-13、表2.2印p25将CFC-13印作“1,2684.1”、§2.4印p31将表2.3误引为“Table 1.3”，以及基于CO₂积分温度响应IAGTP的人体健康营养不良/疟疾/腹泻/洪灾风险、Urban 2015陆地生态0.037 PDF/°C×1.08E14 m²×1.48E-08 species/m²与Hanafiah等2011淡水鱼类三组恒定终点转换系数）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-17（气候当量单元）同载体另核§3.1.1印p140、表1印p141、§3.2.1印p142及表2印p143对ReCiPe 2016气候变化三视角GWP中点与人体健康（疟疾、腹泻、营养不良、自然灾害）、陆地生态、淡水生态三条全球恒定转换终点路径的综述',
  'src-land111-lcimpact2020-article':
    ' 2026-11-17（气候当量单元）同载体另核§§2.1–2.8印pp3–10（表1–3，表3印p8列气候变化行：无中点架构、列100年与1000年两时间窗而图4印p13图注称infinite、“确定性影响”健康仅含腹泻、疟疾、沿海洪灾3病种且淡水生态气候损害无因子、“全部影响”纳入营养不良、心血管疾病、内陆洪灾共6病种及南北纬42°以内淡水鱼类损害）及§3.2印pp11, 13（图4：3种车用燃料方案总健康损害相差最高达4倍，气候变化主导健康损害，两极端设定间贡献占比变化但不改变燃料次序）、§4.2印p15。',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-kb44-pef-guidance2018': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-kb44-ec2021': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-tox123-ef31-addendum': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 2, artifacts: 19, sourceKeys: ['src-bio127-ef31-selected-members'] },
  'rd-kb54-ipcc-ar6-errata-2025-10-07-pdf': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-rivm2016': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-lcimpact2020-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-17（气候当量单元）同载体追加选读§1表1–2（印pp5–6）、§3.1气候变化（印pp13–19，表3，§3.1.7印p18）与§5 Annex 1 / §5.1（印pp123–124），核实IPCC 2007 GWP100获Level I推荐、终点仅列ReCiPe 2009为interim无正式推荐，以及§3.1.6印p18将N₂O在500年较100年低约一半误写为高约2倍（factor 2）的原文笔误。',
  },
  'lit-kb44-pef-guidance2018': {
    limitation: '2026-11-17（气候当量单元）同载体追加核读§7.9–§7.9.4（印pp65–70，表13印p70）与Annex H（印pp229–231，印p230列-1），核实试点期甲烷36.75、一氧化碳1.57与超过100年储存抵扣流carbon dioxide (biogenic-100yr)=-1规则。',
  },
  'lit-n04': {
    limitation: '2026-11-17（气候当量单元）同载体追加核读Annex I §3.2.3表2（OJ L 144/29–30注1）与§4.4.10–§4.4.10.3（OJ L 144/66–69注37–40），核实超过5%气候子指标分列报告、禁止临时与永久碳储存及延迟排放抵扣、原生林入LULUC且排除光合吸收、PAS 2050二十年直接土地转换均摊及条文滞后保留CO等规定，未单独获取ISO 14067或PAS 2050付费标准全文。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-17（气候当量单元）同载体追加核查§2表1–2（印pp6–8）与§4.1（印pp11–12，表4），核实EF 2.0/3.0气候三子指标及甲烷36.75、一氧化碳1.57、biogenic-100yr=-1表值。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-17（气候当量单元）同载体追加核查§2表1（印pp6–7）、§3表2–3（印pp8–9）、§3.1（印p9）、§4.2表10（印p22，气候NF下降6.7%）与§5.1–§5.1.1.1（印pp24–25，2752个数据集平均降2.9%、6%上升，西班牙废木焚烧-58%与丹麦聚氨酯焚烧+302%）。',
  },
  'work-tox123-ef31-addendum': {
    limitation: '2026-11-17（气候当量单元）同载体追加核读印pp1–4对EF 3.1六个影响类别更新（气候变化按IPCC 2021更新）、other目录Look@LCI与转换器结构及第5.2.15节表1（印p4）合规源切换至EU 2021/2279与EF 3.1的说明。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-bio127-ef31-selected-members',
    limitation: '2026-11-17（气候当量单元）另按同一中央目录与HTTP 206范围核查新增19份涉碳成员（3份气候子指标XML、other/converter/6209b35f.xml、sources/31ac5d13.xml、lookLciMethodInformation.config、Normalisation_Weighting_Factors_EF_3.1.xlsx、248页pef_method.pdf JRC115959及11份涉碳基本流XML，连同已登记6209b35f等4份共23份），核实1099=1074+13+12互不重叠划分、CO与biogenic-100yr条数均为0、14af9ca7.xml输出CO₂缺高空子区室及NF工作簿K1161生物源甲烷遗留AR6 FGD草稿值27.2。',
  },
  'work-ipcc-ar6-wgi-errata-2025-10-07': {
    limitation: '2026-11-17（气候当量单元）同SHA原始PDF追加核对第25页（Chapter 7 FGD p124 Table 7.15第4行出版前修订记录：80.8, 27.2, 7.3替换为79.7, 27.0, 7.2），锁定EF 3.1归一化工作簿K1161=27.2的草稿来源。',
  },
  'lit-m05': {
    limitation: '2026-11-17（气候当量单元）同SHA原2016-0104载体追加核读表1.3–1.5（印pp18–22）与第2章Climate change（印pp23–33，表2.1–2.3），核实207种温室气体仅H视角开非CO₂碳反馈、E视角千年积分式与恒定IAGTP终点系数，并保留表2.2印p25“1,2684.1”及§2.4印p31误引“Table 1.3”异文。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-17（气候当量单元）同SHA期刊PDF追加核对§3.1.1（印p140）、表1（印p141）、§3.2.1（印p142）与表2（印p143）气候中点与三终点综述。',
  },
  'work-land111-lcimpact2020-article': {
    limitation: '2026-11-17（气候当量单元）同SHA期刊PDF追加核读§§2.1–2.8表1–3（印pp3–10，表3气候行印p8）、§3.2图4（印pp11, 13）与§4.2（印p15）对气候变化零中点、100/1000年时间窗、“确定性影响”排除淡水生态气候损害及3种燃料案例总健康损害最高相差4倍且极端设定不改燃料排序的说明。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-bio127-', evidence: 'ev-bio127-', sources: 'src-bio127-',
    readings: 'rd-bio127-', literature: 'work-bio127-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-bio127-climate-subindicators-feedbacks-storage-and-packages-20261117';
  if (kind === 'gaps') return id === 'gap-bio127-iso14067-pas2050-and-ef-background-datasets';
  return kind === 'revisions' && id === 'rev-bio127-b15-biogenic-carbon-comparison';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: biogenicCarbonSource.date },
    })) throw new Error(`Biogenic carbon changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    const expectedCurrent = {
      ...reading,
      artifacts: [...(reading?.artifacts ?? []), ...addedArtifacts],
      passages: [...(reading?.passages ?? []), ...addedPassages],
      ...(Object.hasOwn(reading ?? {}, 'sourceKeys')
        ? { sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys] }
        : spec.sourceKeys.length ? { sourceKeys: spec.sourceKeys } : {}),
    };
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-bio127-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-bio127-'))
        || !sameScienceValue(current, expectedCurrent))
      throw new Error(`Biogenic carbon changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: biogenicCarbonSource.date,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Biogenic carbon changed a previous work or its acquisition history: ${id}`);
  }
}

const s1Ids = ['cl-bio127-midpoint-endpoint-genealogy'];
const s2FeedbackIds = ['cl-bio127-feedback-perspective-asymmetry'];
const s2BioIds = ['cl-bio127-ef31-subindicator-partition', 'cl-bio127-zero-zero-vs-minus-plus-one'];
const s3Ids = ['cl-bio127-co-removal-and-methane-shift', 'cl-bio127-package-and-report-discrepancies'];
const s4Ids = ['cl-bio127-storage-abolition-and-dluc-window'];
const s5Ids = ['cl-bio127-climate-diagnostic-synthesis'];
const allAddedIds = [...s1Ids, ...s2FeedbackIds, ...s2BioIds, ...s3Ids, ...s4Ids, ...s5Ids];

function insertAfterOccurrence(occurrences, anchorId, addedIds, section) {
  const index = occurrences.findIndex(row => row.id === anchorId);
  if (index < 0) throw new Error(`Biogenic carbon missing anchor occurrence: ${anchorId}`);
  return [
    ...occurrences.slice(0, index + 1),
    ...addedIds.map(id => ({ id, section })),
    ...occurrences.slice(index + 1),
  ];
}

function expectedOccurrencesForKey(key, baseOccurrences) {
  if (key === 'B15:/monograph/climate-equivalence:reader-source') {
    let next = insertAfterOccurrence(baseOccurrences, 'cl-climate-endpoint', s1Ids, '响应与指标');
    next = insertAfterOccurrence(next, 'cl-climate-feedback-return', s2FeedbackIds, '气体与碳收支');
    next = insertAfterOccurrence(next, 'cl-climate-biogenic-boundary', s2BioIds, '气体与碳收支');
    next = insertAfterOccurrence(next, 'cl-climate-comparison-criteria', s3Ids, '清单比较');
    next = insertAfterOccurrence(next, 'cl-time-model-limits', s4Ids, '排放日历');
    return insertAfterOccurrence(next, 'cl-climate-debate', s5Ids, '历史与用途');
  }
  if (key === 'B15:/docs/book/climate-response-and-metrics:reader-source') {
    let next = insertAfterOccurrence(baseOccurrences, 'cl-climate-endpoint', s1Ids, '响应与指标');
    next = insertAfterOccurrence(next, 'cl-climate-feedback-return', s2FeedbackIds, '气体与碳收支');
    next = insertAfterOccurrence(next, 'cl-climate-biogenic-boundary', s2BioIds, '气体与碳收支');
    next = insertAfterOccurrence(next, 'cl-climate-comparison-criteria', s3Ids, '清单比较');
    return insertAfterOccurrence(next, 'cl-climate-debate', s5Ids, '历史与用途');
  }
  return insertAfterOccurrence(baseOccurrences, 'cl-time-horizon-choice', s4Ids, '响应怎样进入计算');
}

export function biogenicCarbonLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  const row = unit.layouts.find(item => item.key === key);
  const nextDescription = row?.to?.source?.description;
  const approved = {
    source: { ...accepted.source, description: nextDescription },
    occurrences: expectedOccurrencesForKey(key, accepted.occurrences),
  };
  if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale)
      || !scienceText(nextDescription) || /[\r\n<>]/.test(nextDescription)
      || nextDescription === accepted.source.description || !sameScienceValue(row.to, approved))
    throw new Error(`Biogenic carbon can change only its reviewed B15 description and exact occurrence insertions: ${key}`);
  return row.to;
}

export function predecessorReaderSource(route) {
  const key = `B15:${route}:reader-source`;
  const source = climateAccepted.sources.find(row => row.route === route);
  const occurrences = route === '/monograph/climate-equivalence'
    ? climateAccepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })))
    : climateAccepted.website.find(page => page.route === route).occurrences;
  const initial = { source, occurrences };
  const priorLayouts = readableBookReviewPlan(
    pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins),
  ).layouts;
  const row = priorLayouts.get(key);
  if (row && row.from !== editionDigest(initial)) throw new Error(`Biogenic carbon stale B15 layout baseline: ${key}`);
  const copyedit = selectReaderCopyedit(copyeditConfig, readerCopyeditUnitPin);
  return copyeditLayout(key, row ? row.to : initial, copyedit);
}

function boundedMdxTransform(path, previousMdx, actualMdx, expectedDescription) {
  const oldDesc = oldDescLines[path];
  if (!scienceText(expectedDescription) || /[\r\n<>]/.test(expectedDescription) || !previousMdx.includes(oldDesc)
      || expectedDescription === oldDesc.slice('description: '.length))
    throw new Error(`Biogenic carbon lacks the exact predecessor frontmatter description: ${path}`);

  if (path === 'content/docs/book/emission-time-and-assessment.mdx') {
    const target = '<Prose ids="cl-time-combination cl-time-horizon-choice" />';
    const expected = previousMdx
      .replace(oldDesc, () => `description: ${expectedDescription}`)
      .replace(target, () => `${target}\n\n<Prose ids="${s4Ids.join(' ')}" />`);
    if (expected !== actualMdx)
      throw new Error('Biogenic carbon changed protected emission-time-and-assessment MDX text');
    return;
  }

  const s1Target = '<Prose ids="cl-climate-reference-limits cl-climate-forcing cl-climate-agwp cl-climate-agtp cl-climate-endpoint" />';
  const s2Target = '<Prose ids="cl-climate-feedback-consistency cl-climate-feedback-return cl-climate-methane-chemistry cl-climate-carbon-budget cl-climate-three-methane-rows cl-climate-biogenic-boundary" />';
  const s2Replaced = '<Prose ids="cl-climate-feedback-consistency cl-climate-feedback-return" />'
    + `\n\n<Prose ids="${s2FeedbackIds.join(' ')}" />\n\n`
    + '<Prose ids="cl-climate-methane-chemistry cl-climate-carbon-budget cl-climate-three-methane-rows cl-climate-biogenic-boundary" />'
    + `\n\n<Prose ids="${s2BioIds.join(' ')}" />`;
  const s3OrdinaryTarget = '表中显示值与重算值的对照见[气候数值的重建](/docs/appendices/climate-numerical-reconstruction/#显示精度)。同一附录的“历史程序”一节另有程序复算。';
  const s5Target = '<Prose ids="cl-climate-step cl-climate-rate-formula cl-climate-rate-fit cl-climate-rate-histories cl-climate-rate-window cl-climate-rate-aggregate cl-climate-debate cl-climate-conclusion" />';
  const s5Replaced = '<Prose ids="cl-climate-step cl-climate-rate-formula cl-climate-rate-fit cl-climate-rate-histories cl-climate-rate-window cl-climate-rate-aggregate cl-climate-debate" />'
    + `\n\n<Prose ids="${s5Ids.join(' ')}" />\n\n`
    + '<Prose ids="cl-climate-conclusion" />';
  const oldFigOpen = '<figure>\n  <img src="/book-figures/climate-response-and-integral.svg"';
  const newFigOpen = '<ReaderFigure>\n  <img src="/book-figures/climate-response-and-integral.svg"';
  const oldFigClose = '  <figcaption>同一响应的剩余比例与时间积分</figcaption>\n</figure>';
  const newFigClose = '  <figcaption>同一响应的剩余比例与时间积分</figcaption>\n</ReaderFigure>';
  if (!previousMdx.includes(oldFigOpen) || !previousMdx.includes(oldFigClose)
      || !previousMdx.includes(s3OrdinaryTarget) || !previousMdx.includes(s5Target))
    throw new Error(`Biogenic carbon lacks the exact original response figure or section blocks: ${path}`);

  let expected = previousMdx
    .replace(oldDesc, () => `description: ${expectedDescription}`)
    .replace(oldFigOpen, () => newFigOpen)
    .replace(oldFigClose, () => newFigClose)
    .replace(s1Target, () => `${s1Target}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
    .replace(s2Target, () => s2Replaced)
    .replace(s3OrdinaryTarget, () => `${s3OrdinaryTarget}\n\n<Prose ids="${s3Ids.join(' ')}" />`)
    .replace(s5Target, () => s5Replaced);

  if (path === 'content/monograph/climate-equivalence.mdx') {
    const s4Target = '<Prose ids="cl-time-emission-profile cl-time-elapsed-response cl-time-common-endpoint cl-time-combination cl-climate-calendar-sum cl-climate-timing-assumptions cl-climate-timing-result cl-climate-dynamic-application cl-time-horizon-choice cl-time-model-limits cl-time-dynamic-not-forecast" />';
    const s4Replaced = '<Prose ids="cl-time-emission-profile cl-time-elapsed-response cl-time-common-endpoint cl-time-combination cl-climate-calendar-sum cl-climate-timing-assumptions cl-climate-timing-result cl-climate-dynamic-application cl-time-horizon-choice cl-time-model-limits" />'
      + `\n\n<Prose ids="${s4Ids.join(' ')}" />\n\n`
      + '<Prose ids="cl-time-dynamic-not-forecast" />';
    expected = expected.replace(s4Target, () => s4Replaced);
  }
  if (expected !== actualMdx)
    throw new Error(`Biogenic carbon changed protected B15 MDX text or its scoped additions: ${path}`);
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Biogenic carbon missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Biogenic carbon inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Biogenic carbon declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the three physical B15 MDX files and raw publication records before the #125 verifier. */
export function prepareBiogenicCarbonSource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Biogenic carbon must not declare an unreviewed prior-claim correction');
  const scope = new Set(unit.scope), fileRows = new Map(), records = new Map(), files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Biogenic carbon lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !fileRows.has(row.key) && Object.hasOwn(oldMdxShas, row.key)) fileRows.set(row.key, row);
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Biogenic carbon cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || fileRows.size !== managedPaths.length)
    throw new Error('Biogenic carbon must bind all three B15 MDX sources and only declared changes');

  for (const route of biogenicCarbonSources) {
    const path = `content${route}.mdx`;
    const fileRow = fileRows.get(path);
    const prevMdx = unit.previousMdx?.[path];
    if (fileRow?.from !== oldMdxShas[path] || sha256(prevMdx ?? '') !== oldMdxShas[path])
      throw new Error(`Biogenic carbon lacks independently preserved predecessor B15 MDX bytes: ${path}`);
    const updatedLayout = biogenicCarbonLayout(unit, `B15:${route}:reader-source`, predecessorReaderSource(route));
    boundedMdxTransform(path, prevMdx, files.get(path).toString(), updatedLayout.source.description);
    if (!sameScienceValue(unit.occurrences?.[path], actual.sourceOccurrences[path])
        || !sameScienceValue(updatedLayout.occurrences.map(row => row.id), actual.sourceOccurrences[path]))
      throw new Error(`Biogenic carbon lacks exact B15 occurrences for: ${path}`);
  }
  if (Object.keys(unit.previousMdx ?? {}).length !== managedPaths.length
      || Object.keys(unit.occurrences ?? {}).length !== managedPaths.length)
    throw new Error('Biogenic carbon contains extraneous previousMdx or occurrences keys');

  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (claimRows.length !== allAddedIds.length || !allAddedIds.every(id => records.has(`claims:${id}`)))
    throw new Error('Biogenic carbon lacks exact record transitions for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateBiogenicCarbonFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  for (const path of managedPaths) files.set(path, Buffer.from(unit.previousMdx[path]));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== biogenicCarbonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== biogenicCarbonPredecessorPin)
    throw new Error('Biogenic carbon did not recover the independently observed raw 5c982449 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Biogenic carbon actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map(fileRows), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Biogenic carbon lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...allAddedIds])] };
}

export function effectiveBiogenicCarbon(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, biogenicCarbon: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== biogenicCarbonCapturePin) return false;
  const identity = { ...capture.identity, normalizedProofSha256: editionDigest(capture.normalization) };
  if (!sameScienceValue(unit.outputCapture, identity) || !sameScienceValue(observations.capture, identity)
      || observations.sourceCommit !== identity.sourceCommit) return false;
  const articles = unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 }));
  const html = unit.publicArtifacts.filter(row => row.path.endsWith('.html')).map(({ path, sha256 }) => ({ path, sha256 }));
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

export function verifyBiogenicCarbonReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${biogenicCarbonId}/${row.kind}`;
    if (row.date < biogenicCarbonSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function biogenicCarbonOrdinaryId(unit, route, print, index) {
  if (!unit || !biogenicCarbonRoutes.includes(route)) return undefined;
  if (print && route !== 'book-climate-equivalence') return undefined;
  if (!print && route === 'book-climate-equivalence') return undefined;
  if (index === 'figure' && route === '/docs/book/emission-time-and-assessment') return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-bio-127-ordinary-${index}`;
}

export function biogenicCarbonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-bio-127-ordinary-(?:\d+|figure)$/;
export function observeBiogenicCarbonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],figure[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function qualifyBiogenicCarbonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeBiogenicCarbonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Biogenic carbon', routes: biogenicCarbonRoutes, predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: biogenicCarbonHistoryControls(unit), source: biogenicCarbonSource, attribute: 'biogenic-carbon',
    ordinaryPattern, label: 'Biogenic carbon', ordinaryTags: ['P', 'FIGURE'],
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets))
    errors.push('Biogenic carbon actual versioned ordinary paragraph or response figure target differs');
  return { prior, errors };
}

export function biogenicCarbonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
