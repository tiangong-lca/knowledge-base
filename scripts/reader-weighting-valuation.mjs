import capture from '../config/reader-weighting-valuation-capture.json' with { type: 'json' };
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
import { validateWeightingValuationFactors } from './reader-weighting-valuation-factors.mjs';

export const weightingValuationId = 'weighting-valuation-135';
export const weightingValuationB20Route = '/docs/book/ecological-scarcity-and-targets';
export const weightingValuationB22Route = '/docs/book/lime-preferences-and-damage-weights';
export const weightingValuationRoutes = Object.freeze([
  weightingValuationB20Route,
  weightingValuationB22Route,
]);
export const weightingValuationCheckDate = '2026-11-18';
/** @type {string|null} */
export const weightingValuationUnitPin = '4099957212b9c9b50f812a02fab7c2e710861ff5d86af8a2726347152232bf36';
/** @type {string|null} */
export const weightingValuationCapturePin = '4aa9021a0e349ba05690f9159a1c3f2562f9412c4d1ff3925d0844f501036dc2';
export const weightingValuationSource = Object.freeze({
  commit: '65aafe25a19865d61bd5a251584ce8cc39dc1941',
  tree: '9013c3d278edf248d6d94f63a5dbbcd333e6c4ea',
  manifest: 'f291560e763cafbe5ac90d0ad2e95fa1fa1a57fcbca5b429d5f0d44f7591ceac',
  date: '2026-11-18',
});
export const weightingValuationPredecessorPin = 'ff59fb32c6b3f2d1ccf71b083af0816283204c0edbdc24e8876bacb92f1d3cdc';
const addressPin = '4d02fd1b047bdf4c795af2a701ee49931af4f83f61ba6510b890a705da23773e';

const oldFileShas = Object.freeze({
  'content/docs/book/ecological-scarcity-and-targets.mdx': '4fce71eacd4f7b0feb0dda0b96c255b4bc8e9bc66bc283d640f5841661872df9',
  'content/docs/book/lime-preferences-and-damage-weights.mdx': 'b47c94e2216050e1206df7f6dfdbcd75657f34b20bed812ed61e507a19d16a53',
});
const managedPaths = Object.keys(oldFileShas);

export const weightingValuationCorrections = Object.freeze([
  Object.freeze({
    chapter: weightingValuationB20Route,
    claimId: 'cl-es-baselines',
    noteIndex: 7,
    scope: '前版首次出现缩写 VOC 与 NOx 时未配中文全称。本版补足“挥发性有机物（VOC）”与“氮氧化物（NOx）”，不改任何数值与含义。',
  }),
  Object.freeze({
    chapter: weightingValuationB20Route,
    claimId: 'cl-es-judgment',
    noteIndex: 28,
    scope: '前版末句使用固定章序“下一章讨论另一种参照……”，在网站独立单元序列中指代错位。本版保持该段紧接 Muhl 供应链讨论之后，将末句改写为书／网双视图一致的《影响评价本地化》衔接表述。',
  }),
  Object.freeze({
    chapter: weightingValuationB22Route,
    claimId: 'cl-lime-purpose',
    noteIndex: 1,
    scope: '前版首次出现“日本LIME研究”时未点明方法全称与早期调查版次。本版补充“日本终点型生命周期影响评价方法（LIME，其2002—2004年早期东京调查常称第一版LIME1）”，与后文 LIME2、LIME3 代际脉络对齐。',
  }),
  Object.freeze({
    chapter: weightingValuationB22Route,
    claimId: 'cl-lime-policy-contrast',
    noteIndex: 2,
    scope: '前版将对照章节按固定章号写作“第20章的生态稀缺法”，在网站独立单元序列中与合订本章次错位。本版改写为书／网双视图一致的“前文《生态稀缺赋权》讨论的生态稀缺法”。',
  }),
  Object.freeze({
    chapter: weightingValuationB22Route,
    claimId: 'cl-lime-decision',
    noteIndex: 40,
    scope: '前版结语仅回扣健康与初级生产两项损害。本版在增补生物多样性与跨范式对照后，同步扩写为“保留健康、初级生产或物种等各项损害各自的量……不同意各项损害的相对代价”。',
  }),
]);
const correctedClaimIds = new Set(weightingValuationCorrections.map(row => row.claimId));

const b20AddedIds = [
  'cl-weight135-ef-coating-outdoor',
  'cl-weight135-ef-coating-indoor',
  'cl-weight135-ef-robustness-weights',
  'cl-weight135-denominator-coupling-and-drift',
  'cl-weight135-comparative-assertion-regimes',
  'cl-weight135-target-vs-hybrid-boundary',
];
const b22AddedIds = [
  'cl-weight135-lime-three-table-rereversal',
  'cl-weight135-recipe-endpoint-stop',
  'cl-weight135-health-perspective-reversal',
  'cl-weight135-four-paradigm-synthesis',
  'cl-weight135-monetary-incommensurability',
  'cl-weight135-glam3-reporting-discipline',
];
const allAddedClaimIds = [...b20AddedIds, ...b22AddedIds];

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'history']);

function assertUnitEnvelopeKeys(unit, reviewed = false) {
  if (!onlyKeys(unit, reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys)
      || !onlyKeys(unit.history, allowedHistoryKeys)) {
    throw new Error('Weighting and valuation unit or history contains unauthorized or unreviewed properties');
  }
}

export function selectWeightingValuation(config, pin = weightingValuationUnitPin, preview = false) {
  if (!onlyKeys(config, allowedConfigKeys) || config.schemaVersion !== 1) {
    throw new Error('Weighting and valuation requires its explicit generation configuration');
  }
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (!plainObject(unit) || unit.id !== weightingValuationId || !sameScienceValue(unit.source, weightingValuationSource)
      || !sameScienceValue(unit.routes, weightingValuationRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !sameScienceValue(unit.corrections, weightingValuationCorrections)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Weighting and valuation requires an exact 65aafe25 predecessor and bounded B20/B22 plan');
  }
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) {
    assertUnitEnvelopeKeys(unit, false);
    return unit;
  }
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin) {
    throw new Error('Weighting and valuation is not independently accepted');
  }
  assertUnitEnvelopeKeys(unit, true);
  return unit;
}

const priorSourceAppends = {
  'src-kb44-pef-guidance2018':
    ' 2026-11-18（赋权与估值单元）同载体另核附录A（印第163—164页：含毒性与不含毒性两套A列50:50公众与专家重要性、B列1至0.1稳健度系数、C=A×B乘积列及最终百分权重表）与附录B.1（印第209页：试点期不含毒性表复刻）。',
  'src-kb44-ec2021':
    ' 2026-11-18（赋权与估值单元）同载体另核附件I第1至1.1节（OJ L 144第23—24页：仅在遵循已批准产品环境足迹类别规则PEFCR的前提下容许比较主张）、第5.2.1至5.2.2节（第88页：全球人均归一化与加权定为PEF强制步骤，禁止将未加权的归一化结果直接相加并要求并列报告表征与归一化结果）、第6.3至6.3.4节（第89—90页：按单一总分自大到小累计至少80%且不少于3类识别最相关影响类别）与附件III第5.2、6.3.1节（第278—280页：组织环境足迹对称强制规则）。',
  'src-flow-pilot-ef31-update':
    '；2026-11-18（赋权与估值单元）同载体另核第4.2节与表10（印第21—23页：2010年全球人口6,895,889,018人下EF 3.0至EF 3.1人均年度归一化基准变动，人体非致癌毒性由2.30×10⁻⁴降至1.29×10⁻⁴ CTUh/(人·年)即下降44%、淡水生态毒性由4.27×10⁴升至5.67×10⁴ CTUe/(人·年)即上升33%、气候变化由8.10×10³降至7.55×10³ kg CO₂-eq/(人·年)即下降6.7%）、第5.1至5.1.2节图8与表13（印第24、28—30页：表征与归一化协同更新下，2,752个官方数据集中淡水生态毒性在1,535个、气候变化在1,043个、人体非致癌毒性在172个、人体致癌毒性在1个数据集成为单一总分变动的首要类别，第1、第2、第3顺位最相关类别分别在171、280、358个数据集即6%、10%、13%更替）及第5.2节表14（印第30—35页：49个代表产品中27降22升，静止葡萄酒降15%、食用动物饲料升13%）',
  'src-book-ilcd-2010':
    ' 2026-11-18（赋权与估值单元）同载体另核第6.7.2与6.7.6节（印第108—109、115页：对应ISO 14044:2006第4.4.5节比较主张条件与政治规范价值属性）、第8.2节（印第279页：公开比较主张不得采用数值价值加权）、第8.3节（印第281—282页：对应ISO 14044:2006第4.4.3.2节归一化可选定位）与第8.4节（印第282—284页：对应ISO 14044:2006第4.4.3.4节，Provision 8.4 III强制规定不得在拟向公众披露的比较主张研究中使用加权）。',
  'src-book-cml-2001-part2a':
    ' 2026-11-18（赋权与估值单元）同载体另核第2a分册第4.3.6至4.3.8节（印第74—79页：指出ISO 14042将归一化与加权均列为可选步骤，而CML操作指南强烈建议开展归一化以展示相对量级，同时保持加权可选并按ISO 14042禁止将加权用于向公众披露的比较主张）。',
  'src-kb52-cml-2001-part3':
    ' 2026-11-18（赋权与估值单元）同载体另核第3分册第4.6至4.8节（印第244—252页：重申CML指南推荐归一化但ISO 14042将其列为可选，引ISO 14042阐明加权基于价值选择而非自然科学，并引Finnveden 1999a将赋权方法分为五类，指出不同货币化方法承载不同价值概念而不能直接互比或推荐单一通用权重）。',
  'src-land111-rivm2016':
    ' 2026-11-18（赋权与估值单元）同载体另核第1.2至1.3节与表1.2（印第16—17页：人体健康DALY印year、生态系统质量species×yr、资源稀缺surplus cost Dollar三个保护领域定义与Thompson等1990三文化视角，且不设跨保护领域默认总分权重）及第1.5节表1.5（印第21—22页：气候变化健康终点I=8.1×10⁻⁸、H=9.3×10⁻⁷、E=1.3×10⁻⁵ yr/kg CO₂相差约160.5倍，初级PM₂.₅三视角恒为6.3×10⁻⁴ yr/kg，铜I=0.16、H/E=0.23及原油0.46 US2013 $/kg）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-18（赋权与估值单元）同载体另核第2.1节（印第139页：17个协调中点类别）与图1（印第140页：中点向人体健康DALY、生态系统质量species·yr与资源稀缺USD2013三个终点保护领域的映射结构）及第5节（印第145页：总结三文化视角中终点协调框架且未发布跨保护领域单一总分默认权重）',
  'src-acid113-glam-scoping':
    ' 2026-11-18（赋权与估值单元）同载体另核归一化与加权范围界定正文及问卷调研附录（印第134—135、141—144、156、158—163页：确认不存在跨一切决策语境的唯一通用赋权法，将跨方法术语与语境化选择指南、特定通用语境下覆盖中点与终点的确定性权重集、以及中点与终点权重概率分布列为三项产出，在调研答复中记录PROMETHEE、ELECTRE与SMAA多准则分析实践，并在文献与调研中记录Itsubo等2015的LIME3二十国集团陈述偏好扩展及受访者对LIME3公开不确定性参数缺失的反馈）。',
};

const priorReadingAdditions = {
  'rd-flow-pilot-ef31': { passages: 9, sourceKeys: ['src-weight135-ef31-selected-members'] },
  'rd-kb44-pef-guidance2018': { passages: 1, sourceKeys: [] },
  'rd-kb44-ec2021': { passages: 1, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, sourceKeys: [] },
  'rd-ilcd-2010': { passages: 1, sourceKeys: [] },
  'rd-cml-2001-part2a': { passages: 1, sourceKeys: [] },
  'rd-cml-2001-part3': { passages: 1, sourceKeys: [] },
  'rd-land111-rivm2016': { passages: 1, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, sourceKeys: [] },
  'rd-acid113-glam-scoping': { passages: 1, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-flow-pilot-ef31': {
    addCatalogSourceId: 'src-weight135-ef31-selected-members',
    limitation: '2026-11-18（赋权与估值单元）复用已固定SHA-256的Normalisation_Weighting_Factors_EF_3.1.xlsx（NFs EF3.1、WFs）及光化学臭氧b5c610fe、酸化b5c611c6、陆地富营养化b5c614d2、海洋富营养化b5c619fa、细颗粒物b5c602c6、淡水生态毒性05316e7a、人体非致癌毒性7cfdcfcf与人体致癌毒性2299222a八份方法XML，核闭一般NMVOC（含室内空气在b5c610fe缺行边界）、苯乙烯、空气NOx与初级PM2.5的跨类别加权总分。',
  },
  'lit-kb44-pef-guidance2018': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读Annex A（印第163—164页）与Annex B.1（印第209页）含毒性与不含毒性两套A列（50:50公众与专家重要性，16项印值和100.03）、B列（1–0.1稳健度系数）、C=A*B及最终百分权重表，原样保留C列由底层未舍入稳健度分值运算产生的末位差异。',
  },
  'lit-n04': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读Annex I §§1–1.1（OJ L 144/23–24）、§§5.2.1–5.2.2（OJ L 144/88）、§§6.3–6.3.4（OJ L 144/89–90）与Annex III §§5.2、6.3.1（OJ L 144/278–280），核实PEF/OEF强制归一化与加权、累计至少80%且不少于3类最相关类别门槛及仅限PEFCR下的比较主张条件。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读§4.2表10（印第21—23页）、§5.1至§5.1.2图8与表13（印第24、28—30页）及§5.2表14（印第30—35页），核实非致癌毒性NF降44%、淡水生态毒性NF升33%及表征与归一化协同更新下淡水生态毒性在2,752个官方数据集中占1,535个单一总分变动主导类别的实测分布。',
  },
  'work-cml-2001-guide': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读Part 2a §§4.3.6–4.3.8（印第74—79页）与Part 3 §§4.6–4.8（印第244—252页），核实CML操作指南强烈建议归一化而ISO 14042列为可选、ISO公开比较主张禁用加权规定及Finnveden 1999a对不同货币估值概念不可直接互比的评述。',
  },
  'lit-m05': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读§§1.2–1.3表1.2（印第16—17页）与§1.5表1.5（印第21—22页），核实ReCiPe 2016在DALY、species×yr与US2013 Dollar三保护领域截停的架构及CO2对初级PM2.5在I/H/E三视角下的160.5倍相对斜率跨度。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读§2.1（印第139页）、图1（印第140页）与§5（印第145页），核对ReCiPe 2016止步于三终点保护领域且不发布默认单一总分权重的方法定位。',
  },
  'work-acid113-glam-scoping': {
    limitation: '2026-11-18（赋权与估值单元）同载体追加核读归一化与加权范围界定正文与调研附录（印第134—135、141—144、156、158—163页），核实选权指南、特定通用语境确定性权重与权重概率分布三项产出、成员调研对PROMETHEE/ELECTRE/SMAA的报告及LIME3引用边界。',
  },
};

const expectedPriorClaimTexts = Object.freeze({
  'cl-es-baselines': {
    from: '根据公式核对具体因子时，要分清报告表里的相对减排目标和实际采用的年度临界流。1999年报告以1995年为基准，为保护臭氧水平提出VOC约减60%。2009年报告表2改用2005年为基准，NMVOC列出20%至30%的减幅，NOx列出约50%；前者对应臭氧浓度限值，后者还对应酸沉降临界负荷。基年和物质口径都要对齐，不能用两个百分比相减来判定政策放松了多少。',
    to: '根据公式核对具体因子时，要分清报告表里的相对减排目标和实际采用的年度临界流。1999年报告以1995年为基准，为保护臭氧水平提出挥发性有机物（VOC）约减60%。2009年报告表2改用2005年为基准，NMVOC列出20%至30%的减幅，氮氧化物（NOx）列出约50%；前者对应臭氧浓度限值，后者还对应酸沉降临界负荷。基年和物质口径都要对齐，不能用两个百分比相减来判定政策放松了多少。',
  },
  'cl-es-judgment': {
    from: '铝锭和热轧钢卷各以一千克计，作者明确说明二者没有统一的功能单位。例子说明同一条供应链的分数构成可随地域视角而变，不能用来判断两种材料提供同一服务时孰优。涂装例的11点分差则能回答一个有共同服务的问题：在2013年瑞士的表列权重下，少排两克NMVOC还不足以抵过多排一克NOx；前面的试算还算出了两方案会在哪个相对权重上换位。若要回答厂址附近的居民实际承受什么暴露，还需要排放位置、传输和受体的资料。下一章讨论另一种参照，即用哪个时期、哪个地区的人均负担衡量产品结果。',
    to: '铝锭和热轧钢卷各以一千克计，作者明确说明二者没有统一的功能单位。例子说明同一条供应链的分数构成可随地域视角而变，不能用来判断两种材料提供同一服务时孰优。涂装例的11点分差则能回答一个有共同服务的问题：在2013年瑞士的表列权重下，少排两克NMVOC还不足以抵过多排一克NOx；前面的试算还算出了两方案会在哪个相对权重上换位。若要回答厂址附近的居民实际承受什么暴露，还需要排放位置、传输和受体的资料；而用哪个时期、哪个地区的人均负担充当归一化参照，还将在后文《影响评价本地化》中结合下列耦合结构专门展开。',
  },
  'cl-lime-purpose': {
    from: '这张卡用几项估计的损害量来询问人们的取舍。日本LIME研究先用损害模型，把排放经由环境变化所造成的后果，表示成人体健康、社会资产、初级生产和生物多样性的损害量。到作者所说的「統合化」，才用权重把不同单位的结果综合起来。联合分析（コンジョイント分析）从人们对假设方案的选择估计取舍；估值也取决于问卷列出了哪些后果、每项后果设定了多大的变化。',
    to: '这张卡用几项估计的损害量来询问人们的取舍。日本终点型生命周期影响评价方法（LIME，其2002—2004年早期东京调查常称第一版LIME1）先用损害模型，把排放经由环境变化所造成的后果，表示成人体健康、社会资产、初级生产和生物多样性的损害量。到作者所说的「統合化」，才用权重把不同单位的结果综合起来。联合分析（コンジョイント分析）从人们对假设方案的选择估计取舍；估值也取决于问卷列出了哪些后果、每项后果设定了多大的变化。',
  },
  'cl-lime-policy-contrast': {
    from: '第20章的生态稀缺法从已有政策目标计算计分因子。这张卡上的政策还没有实施，它只是让受访者在不同损害和每户税额之间选择。这里的权重取决于人们在方案属性改变时怎样回答；即使知道法定减排目标，也不能直接由它推出这份问卷的估值。',
    to: '前文《生态稀缺赋权》讨论的生态稀缺法从已有政策目标计算计分因子。这张卡上的政策还没有实施，它只是让受访者在不同损害和每户税额之间选择。这里的权重取决于人们在方案属性改变时怎样回答；即使知道法定减排目标，也不能直接由它推出这份问卷的估值。',
  },
  'cl-lime-decision': {
    from: '实际采购还要问由谁来决定取舍。林清忠在比较联合分析、多属性价值方法和决策会议时指出，偏好属于谁、何时取得、是否围绕具体问题形成，都关系到权重的用途。保留健康和初级生产损害各自的量，再给出所用表、代表的人群和会使次序交换的分界，决策者就能说明异议在哪里：是不同意损害估计，还是不同意两种损害的相对代价。接下来若要评价劳动条件等社会议题，首先还须弄清不同主体承受的是什么、用哪种证据判断。',
    to: '实际采购还要问由谁来决定取舍。林清忠在比较联合分析、多属性价值方法和决策会议时指出，偏好属于谁、何时取得、是否围绕具体问题形成，都关系到权重的用途。保留健康、初级生产或物种等各项损害各自的量，再给出所用表、代表的人群和会使次序交换的分界，决策者就能说明异议在哪里：是不同意损害估计，还是不同意各项损害的相对代价。接下来若要评价劳动条件等社会议题，首先还须弄清不同主体承受的是什么、用哪种证据判断。',
  },
});

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && correctedClaimIds.has(id))
      || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
      || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
      || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  }
  if (kind === 'claims') return allAddedClaimIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-weight135-');
  if (kind === 'sources') return id === 'src-weight135-ef31-selected-members';
  if (kind === 'queries') return id === 'q-weight135-targets-robustness-perspectives-and-wtp-20261118';
  if (kind === 'gaps') return id === 'gap-weight135-context-dependent-weights-and-lime3-originals';
  return kind === 'revisions' && id === 'rev-weight135-b20-b22-cross-system-weighting-and-valuation';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, checkedAt: weightingValuationCheckDate, scope: source.reading.scope + append },
    })) {
      throw new Error(`Weighting and valuation changed prior source identity or acquisition scope: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const expectedKeys = [...(reading?.sourceKeys ?? []), ...spec.sourceKeys];
    if (!reading || addedPassages.length !== spec.passages
        || addedPassages.some(row => !row.id.startsWith('psg-weight135-'))
        || !sameScienceValue(current, {
          ...reading,
          passages: [...reading.passages, ...addedPassages],
          ...(spec.sourceKeys.length && { sourceKeys: expectedKeys }),
        })) {
      throw new Error(`Weighting and valuation changed prior reading identity or passage prefix: ${id}`);
    }
  }
  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    const expected = {
      ...work,
      lastCheckedAt: weightingValuationCheckDate,
      limitations: [...(work?.limitations ?? []), spec.limitation],
      ...(spec.addCatalogSourceId && {
        catalogSourceIds: [...(work?.catalogSourceIds ?? []), spec.addCatalogSourceId],
      }),
    };
    if (!work || !sameScienceValue(current, expected)) {
      throw new Error(`Weighting and valuation changed prior literature work identity: ${id}`);
    }
  }
}

function qualifyCorrections(unit, records, catalog) {
  for (const { claimId } of weightingValuationCorrections) {
    if (!records.has(`claims:${claimId}`)) {
      throw new Error(`Weighting and valuation missing actual record transition for ${claimId}`);
    }
    const spec = expectedPriorClaimTexts[claimId];
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    if (!spec || !original || !current || original.text !== spec.from
        || !sameScienceValue(current, { ...original, text: spec.to, reviewedAt: weightingValuationCheckDate })) {
      throw new Error(`Weighting and valuation modified unauthorized fields on ${claimId}`);
    }
  }
}

const expectedSynthesisTableMdx = [
  '| 赋权与估值路线 | 聚合层级与输出标尺 | 折算权威来源 | 归一化分母进入方式 | 零清单改动的换位触发条件 | 公开比较主张制度边界 |',
  '| --- | --- | --- | --- | --- | --- |',
  '| 瑞士生态稀缺法（UBP 2013／2021） | 清单／中点直折生态点数（UBP），同物质取单一最严途径 | 国内法定环境限值与政治减排目标 | `(1/Fₙ)×(F/Fₖ)²`；本国同源时约化为 `F/Fₖ²`，跨区时保留外部 `Fₙ` | 法定临界流松紧、基年现状流更新、消费地与生产地视角切换 | 属价值赋权，按 ISO 14044 传统不得用于向公众披露的比较主张 |',
  '| 欧盟环境足迹（EF 3.1，Sala 等 2018） | 16 类中点跨路径累加为无量纲加权总分（pt） | 公众与专家 50:50 重要性乘 0.17–0.87 模型科学稳健度 | 每单位中点乘 `WFᵢ/NFᵢ`，全球人均年度基准 `NFᵢ` 反向缩放折算率 | 室外与室内空气子区室切换、0.17 毒性稳健度折减、全球 `NFᵢ` 版本重算 | 欧盟建议书设为 PEF／OEF 强制步骤，仅遵循同品类 PEFCR 且并列披露分项剖面时容许比较 |',
  '| 文化视角终点截停（ReCiPe 2016） | 17 类中点汇聚至三保护领域（`DALY`、`species·yr`、`USD2013`）后主动止步 | 自然科学暴露—效应模型与文化理论三视角（I／H／E），不发跨领域总分权重 | 方法本体不含跨保护领域归一化加权（软件外挂配置非原方法组成） | 20 年、100 年与 1,000 年时间视野及气候健康路径纳入门槛（如 `CO₂` 对 `PM₂.₅` 相差约 160.5 倍） | 保持三项异量纲终点分列报告，任何跨保护领域加权均受公开比较禁令约束 |',
  '| 陈述偏好终点货币化（日本 LIME1／LIME2） | 四项保护对象终点损害折算为单一日元估值（JPY） | 抽样家庭对假设政策卡的联合分析边际支付意愿 | 单位金额 `ΣDₑvₑ` 不经外部归一化；年度份额权重 `Nₑvₑ/ΣNⱼvⱼ` 重新引入全国年度参照 `Nₑ` | 问卷损害基准幅度、税金与社会资产计价标尺转换、2003／2004／2012 调查表次更替 | 属社会偏好货币加权，受 ISO 公开比较禁令约束，且直接适用性限于日本抽样人群 |',
].join('\n');

function verifyB20AndB22Mdx(previousFiles, actualFiles) {
  const prevB20 = previousFiles['content/docs/book/ecological-scarcity-and-targets.mdx'];
  const prevB22 = previousFiles['content/docs/book/lime-preferences-and-damage-weights.mdx'];
  const actB20 = actualFiles.get('content/docs/book/ecological-scarcity-and-targets.mdx')?.toString();
  const actB22 = actualFiles.get('content/docs/book/lime-preferences-and-damage-weights.mdx')?.toString();

  const expectedB20 = prevB20
    .replace(
      'description: 用同一涂装服务比较两种排放组合，说明政策目标和地域参照怎样影响生态点数。',
      'description: 用同一涂装服务比较政策目标距离与欧盟环境足迹中点加权，辨析科学稳健度折减、全球归一化分母修订与公开比较主张的制度分界。',
    )
    .replace(
      '<Prose ids="cl-es-service cl-es-score cl-es-scale cl-es-threshold cl-es-test cl-es-trial cl-es-ranks cl-es-envelope" />',
      '<Prose ids="cl-es-service cl-es-score cl-es-scale cl-es-threshold cl-es-test cl-es-trial cl-es-ranks cl-es-envelope" />\n\n<Prose ids="cl-weight135-ef-coating-outdoor cl-weight135-ef-coating-indoor cl-weight135-ef-robustness-weights" />',
    )
    .replace(
      '<Prose ids="cl-es-place cl-es-metals cl-es-regional-driver cl-es-judgment" />',
      '<Prose ids="cl-es-place cl-es-metals cl-es-regional-driver cl-es-judgment" />\n\n<Prose ids="cl-weight135-denominator-coupling-and-drift cl-weight135-comparative-assertion-regimes cl-weight135-target-vs-hybrid-boundary" />',
    );

  const expectedB22 = prevB22
    .replace(
      'description: 日本LIME研究用政策选择题估计损害权重。两份发表值用于同一算例时，可能给出不同的方案排序。',
      'description: 解析陈述偏好联合分析如何估算终点损害货币权重，并与三保护领域截停、文化视角折算及政策／中点赋权对照次序反转与适用边界。',
    )
    .replace(
      '<Prose ids="cl-lime-validity cl-lime-null cl-lime-order cl-lime-national cl-lime-numeraire cl-lime-edition cl-lime-transfer cl-lime-decision" />',
      `<Prose ids="cl-lime-validity cl-lime-null cl-lime-order cl-lime-national cl-lime-numeraire cl-lime-edition cl-lime-transfer" />\n\n<Prose ids="cl-weight135-lime-three-table-rereversal cl-weight135-recipe-endpoint-stop cl-weight135-health-perspective-reversal cl-weight135-four-paradigm-synthesis" />\n\n${expectedSynthesisTableMdx}\n\n<Prose ids="cl-weight135-monetary-incommensurability cl-weight135-glam3-reporting-discipline" />\n\n<Prose ids="cl-lime-decision" />`,
    );

  if (actB20 !== expectedB20 || actB22 !== expectedB22) {
    throw new Error('Weighting and valuation changed protected B20 or B22 MDX text, table or section boundaries');
  }
  const occB20 = collectChapterClaimOccurrences(actB20);
  const occB22 = collectChapterClaimOccurrences(actB22);
  if (occB20.length !== 32 || occB22.length !== 41) {
    throw new Error('Weighting and valuation unexpected B20 (32) or B22 (41) claim occurrence count');
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Weighting and valuation missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Weighting and valuation inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Weighting and valuation declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

export function prepareWeightingValuationSource(unit, input, actual, structure) {
  if (unit.layouts !== undefined) {
    throw new Error('Weighting and valuation must not amend earlier locked chapter layouts');
  }
  assertUnitEnvelopeKeys(unit, unit.reviewEvidence !== undefined);
  const scope = new Set(unit.scope), fileChanges = new Map(), recordChanges = new Map();
  const files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to)) {
      throw new Error(`Weighting and valuation lacks its exact candidate transition: ${row.key}`);
    }
    if (row.kind === 'file' && Object.hasOwn(oldFileShas, row.key) && !fileChanges.has(row.key)) {
      fileChanges.set(row.key, row);
    } else if (row.kind === 'record' && !recordChanges.has(row.key)) {
      recordChanges.set(row.key, row);
    } else {
      throw new Error(`Weighting and valuation cannot modify an unrelated or protected file or receipt: ${row.key}`);
    }
  }
  if (scope.size !== unit.changes.length || fileChanges.size !== managedPaths.length
      || !plainObject(unit.previousFiles) || Object.keys(unit.previousFiles).length !== managedPaths.length) {
    throw new Error('Weighting and valuation lacks independently preserved predecessor B20/B22 MDX bytes');
  }
  for (const path of managedPaths) {
    if (fileChanges.get(path)?.from !== oldFileShas[path] || sha256(unit.previousFiles[path] ?? '') !== oldFileShas[path]) {
      throw new Error(`Weighting and valuation predecessor hash mismatch on ${path}`);
    }
  }

  verifyB20AndB22Mdx(unit.previousFiles, files);
  const expectedOccurrences = Object.fromEntries(managedPaths.map(p => [p, actual.sourceOccurrences[p]]));
  if (!sameScienceValue(unit.occurrences, expectedOccurrences)
      || !allAddedClaimIds.every(id => recordChanges.has(`claims:${id}`))) {
    throw new Error('Weighting and valuation lacks exact B20/B22 occurrences or claim transitions');
  }

  const { catalog, readings, literature } = input;
  qualifyCorrections(unit, recordChanges, catalog);
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateWeightingValuationFactors(catalog, readings);

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, recordChanges, allowsRaw);
  for (const path of managedPaths) {
    files.set(path, Buffer.from(unit.previousFiles[path]));
  }
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== weightingValuationPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== weightingValuationPredecessorPin) {
    throw new Error('Weighting and valuation did not recover the independently observed raw 65aafe25 state');
  }
  if (unit.state?.after !== editionDigest({ ...actual, structure })) {
    throw new Error('Weighting and valuation actual source state differs from the reviewed candidate');
  }

  validateSourceTransitions('file', new Map(fileChanges), previous.files, actual.files);
  validateSourceTransitions('record', new Map(recordChanges), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale))) {
    throw new Error('Weighting and valuation lacks exact cross-generation consumer review');
  }

  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...correctedClaimIds, ...allAddedClaimIds])],
  };
}

export function effectiveWeightingValuation(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    weightingValuation: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || !scienceDigest(weightingValuationCapturePin) || editionDigest(capture) !== weightingValuationCapturePin) return false;
  if (!plainObject(capture.identity) || !/^[a-f0-9]{40}$/.test(capture.identity.sourceCommit ?? '')
      || !scienceDigest(capture.identity.manifestSha256)
      || !plainObject(capture.normalization) || !Array.isArray(capture.files) || !capture.files.length
      || !unique(capture.files, file => file?.path)
      || !capture.files.every(file => plainObject(file) && scienceText(file.path)
        && scienceDigest(file.sha256) && Number.isSafeInteger(file.bytes) && file.bytes > 0))
    return false;
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

export function verifyWeightingValuationReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${weightingValuationId}/${row.kind}`;
    if (row.date < weightingValuationCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function weightingValuationOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  if (route === weightingValuationB20Route && index === 0) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-weight-135-ordinary-0`;
  }
  if (route === weightingValuationB22Route && ([0, 1, 2].includes(index) || index === 'table')) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-weight-135-ordinary-${index}`;
  }
  return undefined;
}

export function weightingValuationHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-weight-135-ordinary-(?:[0-2]|table)$/;
export function observeWeightingValuationOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

const part5StackedCorrectionClaims = new Set(['cl-lime-decision']);
export function validateWeightingValuationCorrectionOutput(document, path, unit, part5Reread = null) {
  const markers = document.querySelectorAll('[data-weighting-valuation-correction]');
  const expectedRows = !unit ? [] : weightingValuationCorrections.filter(row => path === '/print' || path === row.chapter);
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length) {
    return [`Weighting and valuation correction notice count mismatch on ${path}: got ${markers.length}, expected ${expectedRows.length}`];
  }
  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matchingMarkers = markers.filter(m => m.getAttribute('data-weighting-valuation-correction') === claimId);
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
        || marker.tagName !== 'P' || marker.parentNode !== note
        || (part5Reread && part5StackedCorrectionClaims.has(row.claimId)
          ? (marker.nextElementSibling?.getAttribute('data-part5-reread-correction') !== row.claimId || marker.nextElementSibling.nextElementSibling !== null)
          : marker.nextElementSibling !== null)
        || !attrs(marker, 'class', 'data-weighting-valuation-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== weightingValuationSource.date
        || !singleTextChild(time, weightingValuationSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(weightingValuationSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link)) {
      errors.push(`Weighting and valuation correction notice is absent, changed or detached (${claimId}): ${path}`);
    }
  }
  return errors;
}

export function qualifyWeightingValuationHistory(documents, unit, actual, part5Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeWeightingValuationOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Weighting and valuation',
    routes: weightingValuationRoutes,
    predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: weightingValuationHistoryControls(unit),
    source: weightingValuationSource,
    attribute: 'weighting-valuation',
    ordinaryPattern,
    ordinaryTags: ['P', 'TABLE'],
    label: 'Weighting and valuation',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) {
    errors.push('Weighting and valuation actual versioned ordinary or table targets differ');
  }
  for (const [path, document] of documents) {
    errors.push(...validateWeightingValuationCorrectionOutput(document, path, unit, part5Reread));
  }
  return { prior, errors };
}

export function weightingValuationPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restoreWeightingValuationTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
