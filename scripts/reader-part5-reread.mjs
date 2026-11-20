import capture from '../config/reader-part5-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimIds, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { part4RereadHistoryControls } from './reader-part4-reread.mjs';
import { socialComparisonHistoryControls } from './reader-social-comparison.mjs';
import { weightingValuationHistoryControls } from './reader-weighting-valuation.mjs';
import { validateCostSustainabilityFactors } from './reader-cost-sustainability-factors.mjs';
import { validateLocalizationComparisonFactors } from './reader-localization-comparison-factors.mjs';
import { validateSocialComparisonFactors } from './reader-social-comparison-factors.mjs';
import { validateWeightingValuationFactors } from './reader-weighting-valuation-factors.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part5RereadId = 'part5-reread-145';
export const part5RereadCheckDate = '2026-11-19';
export const part5RereadBookRoute = '/docs/book';
export const part5RereadB22Route = '/docs/book/lime-preferences-and-damage-weights';
export const part5RereadB23Route = '/docs/book/social-assessment-objects-and-meaning';
export const part5RereadRoutes = Object.freeze([
  part5RereadBookRoute,
  part5RereadB22Route,
  part5RereadB23Route,
]);
/** @type {string|null} */
export const part5RereadUnitPin = '9b006731d2837082a3ecfabacf83e5646be4a08d2c2fa793d38b89e4d811cd06';
/** @type {string|null} */
export const part5RereadCapturePin = 'a8481bc04e08c6433c42d0024d0bf0804da988e8ae6e5e5a0320112ca865853e';
export const part5RereadSource = Object.freeze({
  commit: '915af29592cee16d42772ba76080ed913d630e6b',
  tree: 'd4b04b1f383dd14d80bf3a1d3b75ccc9ef5df25a',
  manifest: '741d5267d42a2a13d924f77ff76671002d6e7a2e7db7b53ec9bf1ad64f91e967',
  date: '2026-11-19',
});
export const part5RereadPredecessorPin = 'f18e0af67f3a7216d46ea41f06f0de38370293086b5ad266217c676820c6d409';
const addressPin = '0edff1df66a402a5e72ff844c138f0dea6066150cf01f0cca48d218a83276527';
const previousPrintPart5Sha = 'd5f8d79c71e47d6c61c67a07cc4ba2ae575e62be90f7ed17550ab7b8ea112314';
const expectedPart5Intro = '一种方案可能在某项环境指标上较低，在另一项上较高。本部依次检验跨类别与跨维度取舍的五重边界：先比较法定政策目标距离同公众—专家重要性乘科学稳健度的中点加权及公开比较规则，再追查基本流空间粒度与归一化人均分母在同权重组合时的约消或放大，继而对照保护领域终点主动截停与陈述偏好货币估值的次序反转；随后将视野扩展到产品与组织参照下的社会风险量表、职业健康损害及不可抵消的基本权利底线，最后辨析三类生命周期成本主体账本、五类异质货币消重、多准则补偿与否决规则以及地球边界配额分配。即使算式清晰，结论仍取决于底层资料能代表哪里的工厂、人群与时期；下一部由此进入数据适用性、不确定性与合规审查。';

export const allowedOrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-4`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-4`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
]));

export const part5RereadCorrections = Object.freeze([
  Object.freeze({
    chapter: '/docs/book/localization-evidence-and-denominators',
    claimId: 'cl-cn-question',
    noteIndex: 0,
    scope: '前版未标明本章与前章赋权讨论的衔接前提。本版补充引用《生态稀缺赋权》关于目标依据与混合赋权边界的两则前提论述。',
  }),
  Object.freeze({
    chapter: '/docs/book/localization-evidence-and-denominators',
    claimId: 'cl-loc137-ef31-location-regimes',
    noteIndex: 5,
    scope: '前版误将 AWARE 中文名称印作“水资源可用性足迹方法”。本版核正为同第四部《耗水与缺水潜势》一致的“剩余可用水模型（AWARE）”。',
  }),
  Object.freeze({
    chapter: '/docs/book/localization-evidence-and-denominators',
    claimId: 'cl-cn-conclusion',
    noteIndex: 35,
    scope: '前版章末收束仅列举早期三项结论前提。本版增列本章跨体系四层本地化核查准则作为收束前提。',
  }),
  Object.freeze({
    chapter: '/docs/book/lime-preferences-and-damage-weights',
    claimId: 'cl-weight135-glam3-reporting-discipline',
    noteIndex: 39,
    scope: '前版将该范围界定报告标为“2020年”并使用不同方法译名。本版按已登记官网载体删去未经扉页核实的年份标定，并将项目与方法译名统一为“联合国环境规划署全球生命周期影响评价方法共识项目（UNEP GLAM）”及“偏好排序组织法（PROMETHEE）”。',
  }),
  Object.freeze({
    chapter: '/docs/book/lime-preferences-and-damage-weights',
    claimId: 'cl-lime-decision',
    noteIndex: 40,
    scope: '前版章末收束仅列举早期单篇算例与迁移前提。本版按正文出现顺序整理前提，并增列三表非单调再反转、四范式对照与透明报告纪律三项跨体系论述。',
  }),
  Object.freeze({
    chapter: '/docs/book/social-assessment-objects-and-meaning',
    claimId: 'cl-soc139-portfolio-reference-and-comparative-assertions',
    noteIndex: 3,
    scope: '前版对照欧盟组织环境足迹与社会生命周期评价的公开比较规则时未标明前章制度前提。本版补充引用《生态稀缺赋权》关于公开比较声明制度边界的前提论述。',
  }),
  Object.freeze({
    chapter: '/docs/book/social-assessment-objects-and-meaning',
    claimId: 'cl-soc139-cross-pillar-overlap-audit',
    noteIndex: 15,
    scope: '前版讨论车间涂装溶剂室内暴露与职业健康消重时未标明前章毒性前提。本版补充引用《生态稀缺赋权》关于室内空气子区室苯乙烯毒性反转的前提论述。',
  }),
  Object.freeze({
    chapter: '/docs/book/cost-perspectives-and-sustainability-combination',
    claimId: 'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting',
    noteIndex: 5,
    scope: '前版列举原油额外采选成本时未并列说明报告总表的舍入值。本版补明总表 1.5 四舍五入数值并补充引用《环境损害估值》关于该报告终点表格的前提论述。',
  }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': 'd96f3b398f47d8086ff1e92228b5f1a4eb11fc8e95e0bd49b9dba3ff555f39ae',
  'content/docs/book/index.mdx': '8d3f1626a4be1739bdbff3d0ad1422e30776db1070d928eea501b39c94eeb052',
  'content/docs/book/lime-preferences-and-damage-weights.mdx': '606b4ce95cee1fca77dfd5b852f242e2aa95edcafe6eb4a5a2a194618e708048',
  'content/docs/book/social-assessment-objects-and-meaning.mdx': '5393be977994bc5d09e30af370cd84efa47954d39898cebb51cc0793e27b1024',
});
const managedPaths = Object.keys(oldFileShas);
const allowedManagedPaths = new Set(managedPaths);

const modifiedClaimIds = new Set([
  // B20 (5)
  'cl-weight135-ef-coating-outdoor',
  'cl-weight135-ef-coating-indoor',
  'cl-weight135-denominator-coupling-and-drift',
  'cl-weight135-comparative-assertion-regimes',
  'cl-weight135-target-vs-hybrid-boundary',
  // B21 (27)
  'cl-cn-question', 'cl-cn-characterization', 'cl-cn-reference',
  'cl-loc137-ef31-location-regimes', 'cl-loc137-ef31-global-nf-extrapolation',
  'cl-cn-target', 'cl-cn-cancellation', 'cl-cn-time-bridge', 'cl-cn-resource-meaning', 'cl-cn-resource-units',
  'cl-cn-parameter-history', 'cl-regional-benchmarks-and-policy-goals', 'cl-regional-wf-ambiguity',
  'cl-loc137-dirty-denominator-paradox',
  'cl-cn-later-critique', 'cl-cn-changed-reference', 'cl-cn-hk-borrowing', 'cl-cn-hk-local', 'cl-cn-hk-weights',
  'cl-loc137-open-economy-boundary-reversal', 'cl-loc137-biophysical-vs-political-units',
  'cl-loc137-pm-nonlinear-and-endpoint-reversals', 'cl-cn-standard-authority',
  'cl-regional-method-origin-not-validity', 'cl-loc137-institutional-adoption-vs-compliance',
  'cl-loc137-four-layer-localization-audit', 'cl-cn-conclusion',
  // B22 (12)
  'cl-lime-display', 'cl-lime-different-card', 'cl-lime-english', 'cl-lime-national', 'cl-lime-numeraire', 'cl-lime-edition',
  'cl-weight135-recipe-endpoint-stop', 'cl-weight135-health-perspective-reversal',
  'cl-weight135-four-paradigm-synthesis', 'cl-weight135-monetary-incommensurability',
  'cl-weight135-glam3-reporting-discipline', 'cl-lime-decision',
  // B23 (7)
  'cl-sustainability-social-object-and-stakeholders', 'cl-sustainability-product-functional-reference',
  'cl-sustainability-organization-reporting-reference', 'cl-soc139-portfolio-reference-and-comparative-assertions',
  'cl-soc139-matrix-satellite-linearity-and-software-encoding', 'cl-sustainability-worker-hours-not-impact',
  'cl-soc139-cross-pillar-overlap-audit',
  // B24 (6)
  'cl-sustainability-lcc-internalization-boundary',
  'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
  'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting',
  'cl-lcc143-actor-split-incentive-and-discount-rate-reversal',
  'cl-lcc143-demarcating-ra-eia-and-mfa-ioa',
  'cl-sustainability-explicit-aggregation-conditions',
]);

const proseModifiedClaimIds = new Set([
  'cl-weight135-ef-coating-outdoor',
  'cl-weight135-ef-coating-indoor',
  'cl-weight135-comparative-assertion-regimes',
  'cl-loc137-ef31-location-regimes',
  'cl-loc137-ef31-global-nf-extrapolation',
  'cl-cn-resource-units',
  'cl-regional-wf-ambiguity',
  'cl-loc137-open-economy-boundary-reversal',
  'cl-lime-national',
  'cl-weight135-recipe-endpoint-stop',
  'cl-weight135-monetary-incommensurability',
  'cl-weight135-glam3-reporting-discipline',
  'cl-soc139-matrix-satellite-linearity-and-software-encoding',
  'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
  'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting',
  'cl-lcc143-actor-split-incentive-and-discount-rate-reversal',
  'cl-lcc143-demarcating-ra-eia-and-mfa-ioa',
]);

const scopeModifiedClaimIds = new Set([
  'cl-cn-question',
  'cl-cn-characterization',
  'cl-cn-reference',
  'cl-cn-target',
  'cl-cn-time-bridge',
  'cl-cn-resource-meaning',
  'cl-cn-resource-units',
  'cl-regional-wf-ambiguity',
  'cl-lime-english',
  'cl-lime-edition',
  'cl-weight135-glam3-reporting-discipline',
  'cl-sustainability-social-object-and-stakeholders',
  'cl-sustainability-product-functional-reference',
  'cl-sustainability-organization-reporting-reference',
  'cl-sustainability-worker-hours-not-impact',
]);

const caveatModifiedClaimIds = new Set([
  'cl-cn-cancellation',
  'cl-cn-parameter-history',
  'cl-regional-benchmarks-and-policy-goals',
  'cl-loc137-dirty-denominator-paradox',
  'cl-cn-later-critique',
  'cl-cn-changed-reference',
  'cl-cn-hk-borrowing',
  'cl-loc137-open-economy-boundary-reversal',
  'cl-loc137-pm-nonlinear-and-endpoint-reversals',
  'cl-sustainability-lcc-internalization-boundary',
]);

const exclusivePart5EvidenceIds = new Set([
  'ev-loc137-ilcd2011-european-scope',
  'ev-loc137-pef-method-global-nf',
  'ev-loc137-cml2001-part3-regional-nf-bias',
  'ev-loc137-ilcd2010-supply-chain-nf-boundary',
  'ev-loc137-glam3-territorial-vs-footprint-nf',
  'ev-regional-xie-localization-layers',
  'ev-regional-xie-original-model-references',
  'ev-regional-xie-technical-ambiguity',
  'ev-regional-xie-screening-denominator',
  'ev-regional-xie-research-agenda',
  'ev-cn-yang-wang-liu-2001-framework',
  'ev-cn-yang-wang-liu-2001-eil',
  'ev-cn-yang-wang-liu-2001-identity',
  'ev-cn-yang-wang-liu-2001-resources',
  'ev-cn-yang-wang-liu-2001-characterization',
  'ev-cn-yang-wang-liu-2001-normalization',
  'ev-cn-yang-wang-liu-2001-weighting',
  'ev-cn-yang-wang-liu-2001-refs',
  'ev-kb40-china-stats2000-table12',
  'ev-hkha-2005-regional-normalization',
  'ev-hkha-2005-hk-local-and-workshop',
  'ev-hkha-2005-hk-glass-numeric',
  'ev-hkha-2005-project-review',
  'ev-lime-jp-questionnaire',
  'ev-lime-jp-normalization',
  'ev-lime-jp-conversion',
  'ev-lime-jp-uncertainty',
  'ev-lime-jp-survey',
  'ev-lime-jp-model',
  'ev-lime-jp-estimates',
  'ev-lime-jp-weights',
  'ev-lime-jp-relative-weights',
  'ev-lime-cm1999-design',
  'ev-lime-cm1999-nonrejection',
  'ev-lime-js2007-design',
  'ev-lime-js2007-results',
  'ev-lime-hayashi2012-preference-construction',
]);

const sharedPart5EvidenceIds = new Set([
  'ev-regional-sun-contemporary-context',
  'ev-sustainability-slca-objects',
  'ev-sustainability-slca-functional-reference',
  'ev-sustainability-slca-organizational-reference',
  'ev-sustainability-slca-scale-meaning',
  'ev-sustainability-slca-assessment-families',
  'ev-sustainability-slca-weighting',
  'ev-sustainability-lcc-perspectives',
  'ev-fossil117-rivm-scp-endpoint',
  'ev-sustainability-lcsa-concept',
  'ev-sustainability-lcsa-relative-dashboard',
]);

const modifiedEvidenceIds = new Set([...exclusivePart5EvidenceIds, ...sharedPart5EvidenceIds]);

const premiseModifiedSpecs = new Map([
  ['cl-weight135-denominator-coupling-and-drift', {
    from: ['cl-es-equation', 'cl-es-why-square', 'cl-es-metals', 'cl-es-judgment', 'cl-weight135-ef-robustness-weights'],
    to: ['cl-es-equation', 'cl-es-why-square', 'cl-weight135-ef-robustness-weights', 'cl-es-metals', 'cl-es-judgment'],
  }],
  ['cl-weight135-target-vs-hybrid-boundary', {
    from: ['cl-es-selection', 'cl-es-place', 'cl-es-judgment', 'cl-weight135-ef-coating-outdoor', 'cl-weight135-ef-coating-indoor', 'cl-weight135-comparative-assertion-regimes'],
    to: ['cl-es-selection', 'cl-weight135-ef-coating-outdoor', 'cl-weight135-ef-coating-indoor', 'cl-es-place', 'cl-es-judgment', 'cl-weight135-comparative-assertion-regimes'],
  }],
  ['cl-cn-question', {
    from: [],
    to: ['cl-es-authority', 'cl-weight135-target-vs-hybrid-boundary'],
  }],
  ['cl-cn-resource-units', {
    from: ['cl-cn-resource-meaning', 'cl-cn-service-period'],
    to: ['cl-cn-service-period', 'cl-cn-resource-meaning'],
  }],
  ['cl-cn-hk-local', {
    from: ['cl-cn-hk-borrowing', 'cl-cn-reference'],
    to: ['cl-cn-reference', 'cl-cn-hk-borrowing'],
  }],
  ['cl-cn-hk-weights', {
    from: ['cl-cn-hk-borrowing', 'cl-cn-hk-local', 'cl-cn-target'],
    to: ['cl-cn-target', 'cl-cn-hk-borrowing', 'cl-cn-hk-local'],
  }],
  ['cl-loc137-open-economy-boundary-reversal', {
    from: ['cl-cn-hk-local', 'cl-cn-hk-weights', 'cl-loc137-dirty-denominator-paradox'],
    to: ['cl-loc137-dirty-denominator-paradox', 'cl-cn-hk-local', 'cl-cn-hk-weights'],
  }],
  ['cl-loc137-biophysical-vs-political-units', {
    from: ['cl-cn-hk-borrowing', 'cl-cn-hk-local', 'cl-loc137-ef31-location-regimes'],
    to: ['cl-loc137-ef31-location-regimes', 'cl-cn-hk-borrowing', 'cl-cn-hk-local'],
  }],
  ['cl-cn-standard-authority', {
    from: ['cl-cn-standard-events', 'cl-cn-question'],
    to: ['cl-cn-question', 'cl-cn-standard-events'],
  }],
  ['cl-regional-method-origin-not-validity', {
    from: ['cl-regional-review-denominator', 'cl-regional-localization-not-translation'],
    to: ['cl-regional-localization-not-translation', 'cl-regional-review-denominator'],
  }],
  ['cl-loc137-institutional-adoption-vs-compliance', {
    from: ['cl-cn-standard-events', 'cl-cn-standard-authority', 'cl-loc137-ef31-location-regimes'],
    to: ['cl-loc137-ef31-location-regimes', 'cl-cn-standard-events', 'cl-cn-standard-authority'],
  }],
  ['cl-loc137-four-layer-localization-audit', {
    from: [
      'cl-regional-localization-not-translation',
      'cl-regional-method-origin-not-validity',
      'cl-loc137-ef31-global-nf-extrapolation',
      'cl-loc137-open-economy-boundary-reversal',
      'cl-loc137-pm-nonlinear-and-endpoint-reversals',
      'cl-loc137-institutional-adoption-vs-compliance',
    ],
    to: [
      'cl-loc137-ef31-global-nf-extrapolation',
      'cl-loc137-open-economy-boundary-reversal',
      'cl-loc137-pm-nonlinear-and-endpoint-reversals',
      'cl-regional-localization-not-translation',
      'cl-regional-method-origin-not-validity',
      'cl-loc137-institutional-adoption-vs-compliance',
    ],
  }],
  ['cl-cn-conclusion', {
    from: ['cl-cn-hk-weights', 'cl-cn-standard-authority', 'cl-regional-method-origin-not-validity'],
    to: ['cl-cn-hk-weights', 'cl-cn-standard-authority', 'cl-regional-method-origin-not-validity', 'cl-loc137-four-layer-localization-audit'],
  }],
  ['cl-lime-display', {
    from: ['cl-lime-units', 'cl-lime-baseline'],
    to: ['cl-lime-baseline', 'cl-lime-units'],
  }],
  ['cl-lime-different-card', {
    from: ['cl-lime-same-table', 'cl-lime-display'],
    to: ['cl-lime-display', 'cl-lime-same-table'],
  }],
  ['cl-lime-english', {
    from: ['cl-lime-different-card', 'cl-lime-two-forms'],
    to: ['cl-lime-two-forms', 'cl-lime-different-card'],
  }],
  ['cl-lime-numeraire', {
    from: ['cl-lime-national', 'cl-lime-shares'],
    to: ['cl-lime-shares', 'cl-lime-national'],
  }],
  ['cl-weight135-health-perspective-reversal', {
    from: ['cl-weight135-recipe-endpoint-stop', 'cl-weight135-ef-robustness-weights'],
    to: ['cl-weight135-ef-robustness-weights', 'cl-weight135-recipe-endpoint-stop'],
  }],
  ['cl-weight135-four-paradigm-synthesis', {
    from: [
      'cl-lime-policy-contrast',
      'cl-lime-two-forms',
      'cl-lime-transfer',
      'cl-weight135-target-vs-hybrid-boundary',
      'cl-weight135-recipe-endpoint-stop',
      'cl-weight135-health-perspective-reversal',
      'cl-weight135-lime-three-table-rereversal',
    ],
    to: [
      'cl-weight135-target-vs-hybrid-boundary',
      'cl-lime-policy-contrast',
      'cl-lime-two-forms',
      'cl-lime-transfer',
      'cl-weight135-lime-three-table-rereversal',
      'cl-weight135-recipe-endpoint-stop',
      'cl-weight135-health-perspective-reversal',
    ],
  }],
  ['cl-lime-decision', {
    from: ['cl-lime-transfer', 'cl-lime-break-even', 'cl-lime-english-route'],
    to: [
      'cl-lime-break-even',
      'cl-lime-english-route',
      'cl-lime-transfer',
      'cl-weight135-lime-three-table-rereversal',
      'cl-weight135-four-paradigm-synthesis',
      'cl-weight135-glam3-reporting-discipline',
    ],
  }],
  ['cl-soc139-portfolio-reference-and-comparative-assertions', {
    from: ['cl-sustainability-product-functional-reference', 'cl-sustainability-organization-reporting-reference'],
    to: ['cl-weight135-comparative-assertion-regimes', 'cl-sustainability-product-functional-reference', 'cl-sustainability-organization-reporting-reference'],
  }],
  ['cl-soc139-cross-pillar-overlap-audit', {
    from: [
      'cl-sustainability-social-object-and-stakeholders',
      'cl-sustainability-social-impact-pathways',
      'cl-soc139-occupational-health-pathways-and-rights-boundary',
      'cl-soc139-three-social-zeros-and-compensation-limits',
    ],
    to: [
      'cl-weight135-ef-coating-indoor',
      'cl-sustainability-social-object-and-stakeholders',
      'cl-sustainability-social-impact-pathways',
      'cl-soc139-occupational-health-pathways-and-rights-boundary',
      'cl-soc139-three-social-zeros-and-compensation-limits',
    ],
  }],
  ['cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting', {
    from: [
      'cl-lime-units',
      'cl-soc139-wage-price-and-automation-paradoxes',
      'cl-sustainability-lcc-internalization-boundary',
      'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
    ],
    to: [
      'cl-lime-units',
      'cl-weight135-recipe-endpoint-stop',
      'cl-soc139-wage-price-and-automation-paradoxes',
      'cl-sustainability-lcc-internalization-boundary',
      'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation',
    ],
  }],
  ['cl-sustainability-explicit-aggregation-conditions', {
    from: ['cl-sustainability-conceptual-combination-not-sum', 'cl-sustainability-ordinal-zero-and-net-zero'],
    to: ['cl-sustainability-ordinal-zero-and-net-zero', 'cl-sustainability-conceptual-combination-not-sum'],
  }],
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (obj, allowed) => plainObject(obj) && Object.keys(obj).length === allowed.size && Object.keys(obj).every(k => allowed.has(k));
const attrs = (node, ...keys) => sameScienceValue(Object.keys(node?.attributes ?? {}).map(key => key.toLowerCase()).sort(), keys.map(k => k.toLowerCase()).sort());
const nonCommentChildren = node => (node?.childNodes ?? []).filter(child => child.nodeType !== 8);
const singleTextChild = (node, expectedText) => {
  const children = nonCommentChildren(node);
  return children.length === 1 && children[0].nodeType === 3 && children[0].text === expectedText;
};

const forbiddenReaderToken = /(?<![a-fA-F0-9])[a-fA-F0-9]{64}(?![a-fA-F0-9])|(?<![A-Za-z-])(?:cl|ev|src|rd|psg|art|work|lit|gap|rev|q)-[A-Za-z0-9._-]+|(?<![A-Za-z-])CASE-[A-Za-z0-9_-]+|\bPDF\b|PDF\s*(?:第[^\r\n）)]*页|页|indices?|index|pp?\.?\s*\d)|印刷\s*p|印\s*pp|pdfIndices|pdfIndex|§|具名方法与证据范围|本\s*轮|本次\s*核读|首版\s*建设|主任务|源码\s*提交|待\s*交付|研究\s*进行中|核查\s*日志|检索\s*日志|构建\s*状态|尚未核读|二手介绍|派生文本|固定载体/i;

export function assertCleanReaderProse(text, label) {
  if (!scienceText(text) || forbiddenReaderToken.test(text))
    throw new Error(`Part V continuous reread invalid or leaked reader-surface token in ${label}`);
  if (/[\r\n<>]/.test(text))
    throw new Error(`Part V continuous reread invalid newline or angle bracket in ${label}`);
}

const allowedConfigKeys = new Set(['schemaVersion', 'status', 'unit']);
const allowedPreviewUnitKeys = new Set([
  'id', 'source', 'routes', 'rationale', 'state', 'scope', 'changes', 'consumers',
  'partIntroduction', 'printPart5', 'previousFiles', 'rawRecords', 'rawFields',
  'outputs', 'publicArtifacts', 'history', 'outputCapture',
]);
const allowedReviewedUnitKeys = new Set([...allowedPreviewUnitKeys, 'reviewEvidence']);
const allowedSourceKeys = new Set(['commit', 'tree', 'manifest', 'date']);
const allowedStateKeys = new Set(['before', 'after']);
const allowedChangeKeys = new Set(['kind', 'key', 'from', 'to', 'rationale']);
const allowedRecordDigestKeys = new Set(['raw', 'public', 'protected']);
const allowedConsumerKeys = new Set(['id', 'rationale']);
const allowedPartIntroKeys = new Set(['part', 'from', 'to', 'rationale']);
const allowedPrintPart5Keys = new Set(['id', 'from', 'to']);
const allowedRawRecordKeys = new Set(['path', 'id', 'from']);
const allowedOutputKeys = new Set(['path', 'route', 'from', 'sha256', 'rationale']);
const allowedPublicArtifactKeys = new Set(['path', 'from', 'sha256', 'rationale']);
const allowedHistoryKeys = new Set(['previousAddresses', 'currentAddresses', 'ordinaryTargets', 'ordinaryOverrides', 'history']);
const allowedOrdinaryTargetKeys = new Set(['route', 'sha256', 'tag']);
const allowedOverrideRowKeys = new Set(['from', 'to']);
const allowedHistoryRowKeys = new Set(['address', 'from', 'rationale', 'ordinary']);
const allowedOrdinaryBlockKeys = new Set(['from', 'to', 'address', 'targetId', 'rationale']);
const allowedOutputCaptureKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256', 'normalizedProofSha256']);
const allowedReviewEvidenceKeys = new Set(['kind', 'date', 'artifactFile', 'artifactSha256', 'reportFile', 'reportSha256']);
const allowedCorrectionKeys = new Set(['chapter', 'claimId', 'noteIndex', 'scope']);

const allowedAddressBaseKeys = new Set(['route', 'kind', 'title', 'claimIds', 'ordinary']);
const allowedAddressNoteKeys = new Set(['route', 'kind', 'title', 'chapter', 'claimIds', 'ordinary']);
const allowedAddressBindingKeys = new Set(['route', 'kind', 'title', 'claimIds', 'ordinary', 'bindings']);

const allowedCaptureKeys = new Set(['schemaVersion', 'identity', 'manifestPaths', 'files', 'normalization']);
const allowedCaptureIdentityKeys = new Set(['sourceCommit', 'dirty', 'status', 'manifestSha256']);
const allowedCaptureFileKeys = new Set(['path', 'sha256', 'bytes']);
const allowedCaptureNormKeys = new Set(['articles', 'publicHtml']);
const allowedNormArticleKeys = new Set(['path', 'route', 'sha256']);
const allowedNormHtmlKeys = new Set(['path', 'sha256']);
const allowedArtifactFileReceiptKeys = new Set(['path', 'sha256', 'bytes', 'contentSha256']);

function validAddressEntry(entry) {
  if (!exactKeys(entry, allowedAddressBaseKeys)
      && !exactKeys(entry, allowedAddressNoteKeys)
      && !exactKeys(entry, allowedAddressBindingKeys)) return false;
  return scienceText(entry.route) && scienceText(entry.kind)
    && (entry.title === null || scienceText(entry.title))
    && Array.isArray(entry.claimIds) && entry.claimIds.every(scienceText)
    && Array.isArray(entry.ordinary) && entry.ordinary.every(scienceDigest);
}

function validOrdinaryOverridesShape(overrides, requireComplete = true) {
  if (!plainObject(overrides)) return false;
  const keys = Object.keys(overrides);
  if (keys.length === 0 && !requireComplete) return true;
  if (keys.length !== allowedOrdinaryOverrideKeys.size || keys.some(key => !allowedOrdinaryOverrideKeys.has(key)))
    return false;
  return keys.every(key => {
    const row = overrides[key];
    return exactKeys(row, allowedOverrideRowKeys)
      && scienceDigest(row.from) && scienceDigest(row.to) && row.from !== row.to;
  });
}

function validRecordDigest(digest) {
  return exactKeys(digest, allowedRecordDigestKeys)
    && scienceDigest(digest.raw)
    && (digest.public === null || scienceDigest(digest.public))
    && (digest.protected === null || scienceDigest(digest.protected));
}

function assertUnitEnvelopeKeys(unit, { reviewed = false, isInitialPreviewSeed = false } = {}) {
  if (!exactKeys(unit, reviewed ? allowedReviewedUnitKeys : allowedPreviewUnitKeys)
      || !exactKeys(unit.source, allowedSourceKeys)
      || !sameScienceValue(unit.source, part5RereadSource)
      || !exactKeys(unit.state, allowedStateKeys)
      || !scienceDigest(unit.state.before) || !scienceDigest(unit.state.after)
      || !exactKeys(unit.partIntroduction, allowedPartIntroKeys)
      || unit.partIntroduction.part !== 5
      || unit.partIntroduction.from === unit.partIntroduction.to
      || !exactKeys(unit.printPart5, allowedPrintPart5Keys)
      || unit.printPart5.id !== 'print-part-5' || unit.printPart5.from !== previousPrintPart5Sha
      || (!isInitialPreviewSeed && (!scienceDigest(unit.printPart5.to) || unit.printPart5.from === unit.printPart5.to))
      || (isInitialPreviewSeed && unit.printPart5.to !== null && (!scienceDigest(unit.printPart5.to) || unit.printPart5.from === unit.printPart5.to))
      || !exactKeys(unit.previousFiles, allowedManagedPaths)
      || !exactKeys(unit.history, allowedHistoryKeys)
      || !plainObject(unit.history.previousAddresses)
      || !Object.values(unit.history.previousAddresses).every(validAddressEntry)
      || !plainObject(unit.history.currentAddresses)
      || !Object.values(unit.history.currentAddresses).every(validAddressEntry)
      || !plainObject(unit.history.ordinaryTargets)
      || !validOrdinaryOverridesShape(unit.history.ordinaryOverrides, !isInitialPreviewSeed)
      || !Array.isArray(unit.history.history)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length
      || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.rawRecords)
      || !Array.isArray(unit.rawFields) || unit.rawFields.length !== 0
      || !Array.isArray(unit.outputs)
      || !Array.isArray(unit.publicArtifacts)) {
    throw new Error('Part V continuous reread requires an exact 915af295 predecessor and closed Part V plan');
  }
  assertCleanReaderProse(unit.rationale, 'unit.rationale');
  assertCleanReaderProse(unit.partIntroduction.from, 'partIntroduction.from');
  assertCleanReaderProse(unit.partIntroduction.to, 'partIntroduction.to');
  assertCleanReaderProse(unit.partIntroduction.rationale, 'partIntroduction.rationale');

  for (const row of part5RereadCorrections) {
    if (!exactKeys(row, allowedCorrectionKeys) || !Number.isSafeInteger(row.noteIndex) || row.noteIndex < 0)
      throw new Error('Part V continuous reread correction metadata is malformed');
    assertCleanReaderProse(row.scope, `part5RereadCorrections(${row.claimId}).scope`);
  }

  for (const row of unit.changes) {
    if (!exactKeys(row, allowedChangeKeys))
      throw new Error('Part V continuous reread change entry contains unauthorized or missing keys');
    assertCleanReaderProse(row.rationale, `changes(${row.key}).rationale`);
    if (row.kind === 'file') {
      if (!scienceDigest(row.from) || !scienceDigest(row.to) || row.from === row.to)
        throw new Error(`Part V continuous reread file change has invalid digests: ${row.key}`);
    } else if (row.kind === 'record') {
      if ((row.from !== null && !validRecordDigest(row.from)) || !validRecordDigest(row.to))
        throw new Error(`Part V continuous reread record change has invalid digest envelope: ${row.key}`);
    } else {
      throw new Error(`Part V continuous reread has unsupported change kind: ${row.kind}`);
    }
  }

  for (const row of unit.consumers) {
    if (!exactKeys(row, allowedConsumerKeys) || !scienceText(row.id))
      throw new Error('Part V continuous reread consumer entry contains unauthorized or missing keys');
    assertCleanReaderProse(row.rationale, `consumers(${row.id}).rationale`);
  }

  for (const row of unit.rawRecords) {
    if (!exactKeys(row, allowedRawRecordKeys) || !scienceText(row.path) || !scienceText(row.id))
      throw new Error('Part V continuous reread rawRecord entry contains unauthorized or missing keys');
  }

  for (const row of unit.outputs) {
    if (!exactKeys(row, allowedOutputKeys) || !scienceText(row.path) || !scienceText(row.route)
        || !scienceDigest(row.from) || !scienceDigest(row.sha256) || row.from === row.sha256)
      throw new Error('Part V continuous reread output entry contains unauthorized, missing or invalid keys');
    assertCleanReaderProse(row.rationale, `outputs(${row.path}#${row.route}).rationale`);
  }

  for (const row of unit.publicArtifacts) {
    if (!exactKeys(row, allowedPublicArtifactKeys) || !scienceText(row.path)
        || !scienceDigest(row.from) || !scienceDigest(row.sha256) || row.from === row.sha256)
      throw new Error('Part V continuous reread publicArtifact entry contains unauthorized, missing or invalid keys');
    assertCleanReaderProse(row.rationale, `publicArtifacts(${row.path}).rationale`);
  }

  for (const row of Object.values(unit.history.ordinaryTargets)) {
    if (!exactKeys(row, allowedOrdinaryTargetKeys) || !scienceText(row.route)
        || !scienceDigest(row.sha256) || !['P', 'TABLE'].includes(row.tag))
      throw new Error('Part V continuous reread ordinaryTargets entry contains unauthorized or invalid keys');
  }

  for (const row of unit.history.history) {
    if (!exactKeys(row, allowedHistoryRowKeys) || !scienceText(row.address)
        || !scienceDigest(row.from) || !Array.isArray(row.ordinary))
      throw new Error('Part V continuous reread history row contains unauthorized or invalid keys');
    assertCleanReaderProse(row.rationale, `history(${row.address}).rationale`);
    for (const block of row.ordinary) {
      if (!exactKeys(block, allowedOrdinaryBlockKeys) || !scienceDigest(block.from)
          || !scienceDigest(block.to) || !scienceText(block.address) || !scienceText(block.targetId))
        throw new Error('Part V continuous reread history ordinary block contains unauthorized or invalid keys');
      assertCleanReaderProse(block.rationale, `history.ordinary(${block.targetId}).rationale`);
    }
  }

  const validCaptureIdentity = obj => exactKeys(obj, allowedOutputCaptureKeys)
    && /^[a-f0-9]{40}$/.test(obj.sourceCommit ?? '')
    && typeof obj.dirty === 'boolean' && scienceText(obj.status)
    && scienceDigest(obj.manifestSha256) && scienceDigest(obj.normalizedProofSha256);

  if (!reviewed) {
    if (unit.outputCapture !== null && !validCaptureIdentity(unit.outputCapture))
      throw new Error('Part V continuous reread preview outputCapture contains unauthorized or invalid keys');
    return;
  }

  if (!validCaptureIdentity(unit.outputCapture)
      || !Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3
      || unit.reviewEvidence.some(row => !exactKeys(row, allowedReviewEvidenceKeys)))
    throw new Error('Part V continuous reread reviewed outputCapture or reviewEvidence envelope is invalid');
}

export function selectPart5Reread(config, pin = part5RereadUnitPin, preview = false) {
  if (!exactKeys(config, allowedConfigKeys) || config.schemaVersion !== 1)
    throw new Error('Part V continuous reread requires its explicit closed generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  const isPreview = preview && config.status === 'preview';
  const isInitialPreviewSeed = config.status === 'preview' && Array.isArray(unit?.outputs) && unit.outputs.length === 0;
  if (!plainObject(unit) || unit.id !== part5RereadId || !sameScienceValue(unit.routes, part5RereadRoutes))
    throw new Error('Part V continuous reread requires an exact 915af295 predecessor and closed Part V plan');
  assertUnitEnvelopeKeys(unit, { reviewed: config.status === 'reviewed', isInitialPreviewSeed });
  if (isPreview && pin === null) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Part V continuous reread is not independently accepted');
  return unit;
}

export function projectPart5RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 5 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to))
    throw new Error('Part V continuous reread has an invalid Part 5 introduction transition');
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 5);
  if (!slot || slot.introduction !== to)
    throw new Error('Part V continuous reread numbering differs from the reviewed Part 5 introduction');
  slot.introduction = from;
  return projected;
}

export function projectPart5RereadPrintParts(unit, printParts) {
  if (!unit || !printParts) return printParts;
  const { id, from, to } = unit.printPart5 ?? {};
  const slot = printParts[4];
  if (id !== 'print-part-5' || from !== previousPrintPart5Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-5' || slot.sha256 !== from)
    throw new Error('Part V continuous reread printed Part 5 header differs from its accepted 8148/95 predecessor');
  return printParts.map(row => row.id === 'print-part-5' ? { id: 'print-part-5', sha256: to } : row);
}

function allowsRaw(kind, id, before) {
  if (before !== null) {
    return (kind === 'claims' && modifiedClaimIds.has(id))
      || (kind === 'evidence' && modifiedEvidenceIds.has(id));
  }
  return kind === 'revisions' && id === 'rev-part5-reread-145-continuity-and-locators';
}

function verifyBoundedFiles(unit, files) {
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const currNumbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
  const prevPart5Intro = prevNumbering?.parts?.find(p => p.number === 5)?.introduction;
  if (unit.partIntroduction?.from !== prevPart5Intro || unit.partIntroduction?.to !== expectedPart5Intro)
    throw new Error('Part V continuous reread partIntroduction does not match exact predecessor or reviewed Part 5 text');
  assertCleanReaderProse(unit.partIntroduction.from, 'partIntroduction.from');
  assertCleanReaderProse(unit.partIntroduction.to, 'partIntroduction.to');
  const expectedNumbering = structuredClone(prevNumbering);
  expectedNumbering.parts.find(p => p.number === 5).introduction = expectedPart5Intro;
  if (!sameScienceValue(currNumbering, expectedNumbering))
    throw new Error('Part V continuous reread altered config/reader-numbering.json outside Part 5 introduction');

  {
    const old18 = '清单记录资源采掘、土地利用、取耗水与物质排放。第四部从[中点与终点](/docs/book/midpoint-endpoint-value-choices/)的因果截点出发，依次讨论气候当量、酸化与营养富集、颗粒物健康损害、耗水与缺水潜势以及多介质化学毒性，解释清单量如何转化为不同的环境指标。阅读时可以选取一个表征因子，追查它所对应的干预对象、空间背景、时间窗口与证据边界。第五部讨论不同结果之间的取舍，说明政策目标、本地参照和人群偏好如何影响比较。';
    const new18 = '清单记录资源采掘、土地利用、取耗水与物质排放。第四部从[中点与终点](/docs/book/midpoint-endpoint-value-choices/)的因果截点出发，依次讨论气候当量、酸化与营养富集、颗粒物健康损害、耗水与缺水潜势以及多介质化学毒性，解释清单量如何转化为不同的环境指标。阅读时可以选取一个表征因子，追查它所对应的干预对象、空间背景、时间窗口与证据边界。第五部沿[生态稀缺赋权](/docs/book/ecological-scarcity-and-targets/)、[影响评价本地化](/docs/book/localization-evidence-and-denominators/)与[环境损害估值](/docs/book/lime-preferences-and-damage-weights/)考察跨类别取舍，辨析政策目标距离、混合稳健度权重、空间表征与归一化分母耦合、保护领域截停以及陈述偏好货币估值如何改变方案排序与公开比较边界。';
    const old22 = '不同章节中的“时间”也可能表示不同对象。气候计算关心排放发生的时刻和响应的计算终点，[未来技术情景](/docs/book/future-technology-and-context/)则需要设定工艺规模及其供给背景。社会评价与成本分析各有对象，合并使用前，仍须明确某个量表示谁的经历或支出。';
    const new22 = '不同章节中的“时间”也可能表示不同对象。气候计算关心排放发生的时刻和响应的计算终点，[未来技术情景](/docs/book/future-technology-and-context/)则需要设定工艺规模及其供给背景。第五部后两章通过[社会表现与影响](/docs/book/social-assessment-objects-and-meaning/)和[生命周期成本与综合评价](/docs/book/cost-perspectives-and-sustainability-combination/)进一步区分产品与组织参照、风险工时量表与不可抵消的基本权利底线，以及主体成本账本、异质货币消重、多准则否决阈值与地球边界配额分配；合并使用前，仍须明确某个量表示谁的经历、权利或支出。';
    const prevBook = unit.previousFiles['content/docs/book/index.mdx'];
    const currBook = files.get('content/docs/book/index.mdx').toString('utf8');
    if (!prevBook.includes(old18) || !prevBook.includes(old22)
        || prevBook.replace(old18, () => new18).replace(old22, () => new22) !== currBook)
      throw new Error('Part V continuous reread altered content/docs/book/index.mdx outside lines 18 and 22');
  }

  {
    const path = 'content/docs/book/lime-preferences-and-damage-weights.mdx';
    const prev = unit.previousFiles[path];
    const curr = files.get(path).toString('utf8');
    const edits = [
      [
        '| 清单／中点直折生态点数（UBP），同物质取单一最严途径 |',
        '| 清单／中点直折环境负担点（UBP，亦称生态点数），同物质取单一最严途径 |',
      ],
      [
        '| 欧盟建议书设为 PEF／OEF 强制步骤，仅遵循同品类 PEFCR 且并列披露分项剖面时容许比较 |',
        '| 欧盟建议书设为产品／组织环境足迹（PEF／OEF）强制步骤，仅遵循同品类类别规则（PEFCR）且并列披露分项剖面时容许比较 |',
      ],
    ];
    let expected = prev;
    for (const [oldCell, newCell] of edits) {
      if (!expected.includes(oldCell)) throw new Error(`Part V continuous reread missing expected cell in ${path}`);
      expected = expected.replace(oldCell, () => newCell);
    }
    if (expected !== curr)
      throw new Error(`Part V continuous reread altered ${path} outside Table 2 rows 1 and 2`);
  }

  {
    const path = 'content/docs/book/social-assessment-objects-and-meaning.mdx';
    const prev = unit.previousFiles[path];
    const curr = files.get(path).toString('utf8');
    const edits = [
      [
        '| 原印件周洗水电（0.4968 MJ 与 6.9 L）仅按单套 0.69 kg 计算；营业额分母对奢侈溢价敏感 |',
        '| 成衣示例原印件将年度周洗水电（0.4968 MJ 与 6.9 L）误按单套 0.69 kg 计算；营业额分母对奢侈溢价敏感 |',
      ],
      [
        '| 1 USD 国家特定部门产值或完整产品系统需求向量 |',
        '| 1 美元（USD）国家特定部门产值或完整产品系统需求向量 |',
      ],
      [
        '| 支付生活工资、售价高 1 倍（40 USD 对 20 USD）的安全工厂反被推算出 2.0 倍部门风险工时 |',
        '| 支付生活工资使单价翻倍（如后节 40 对 20 美元算例）的安全工厂反被推算出 2.0 倍部门风险工时 |',
      ],
      [
        '| 1 USD2012 行业商品经济产出（主文表 2 标明美国代表全球） |',
        '| 1 美元（2012 年不变价，USD2012）行业商品经济产出（主文表 2 标明美国代表全球） |',
      ],
      [
        '| 2024 实发工作簿对 52 国按单一工资除数 43,746/W_c 缩放，土耳其达瑞士 28.76 倍，印孟越缺席 |',
        '| 2024 实发工作簿对 52 国按各国年均工资 W_c 倒数（43,746 美元/W_c）缩放，土耳其达瑞士 28.76 倍，印孟越缺席 |',
      ],
      [
        '| 90 h 无数据自动产生 9.0 中风险工时；安全表误标 DALYs 与 y ≤ 0.06，环境管理表极高风险误印低于 0.005 |',
        '| 90 h 无数据自动产生 9.0 中风险工时；安全表误标 DALYs 且每十万雇员违规数指标 y 误排 y ≤ 0.06，环境管理表极高风险误印低于 0.005 |',
      ],
    ];
    let expected = prev;
    for (const [oldCell, newCell] of edits) {
      if (!expected.includes(oldCell)) throw new Error(`Part V continuous reread missing expected cell in ${path}`);
      expected = expected.replace(oldCell, () => newCell);
    }
    if (expected !== curr)
      throw new Error(`Part V continuous reread altered ${path} outside bounded Table 1 and Table 2 cells`);
  }
}

function verifyBoundedClaimsAndEvidence(unit, catalog, readings, files) {
  const rawClaimMap = new Map(unit.rawRecords.filter(r => r.path === 'catalog.claims').map(r => [r.id, r.from]));
  if (rawClaimMap.size !== modifiedClaimIds.size || [...modifiedClaimIds].some(id => !rawClaimMap.has(id)))
    throw new Error('Part V continuous reread rawRecords does not match the exact 57 modified claims');

  const rawEvidenceMap = new Map(unit.rawRecords.filter(r => r.path === 'catalog.evidence').map(r => [r.id, r.from]));
  if (rawEvidenceMap.size !== modifiedEvidenceIds.size || [...modifiedEvidenceIds].some(id => !rawEvidenceMap.has(id)))
    throw new Error('Part V continuous reread rawRecords does not match the exact 48 modified evidence records');

  const rawRevisions = unit.rawRecords.filter(r => r.path === 'readings.revisions');
  if (rawRevisions.length !== 1 || rawRevisions[0].id !== 'rev-part5-reread-145-continuity-and-locators' || rawRevisions[0].from !== null
      || unit.rawRecords.length !== modifiedClaimIds.size + modifiedEvidenceIds.size + 1)
    throw new Error('Part V continuous reread rawRecords contains unauthorized record families');

  const revRecord = readings.revisions?.find(r => r.id === 'rev-part5-reread-145-continuity-and-locators');
  if (!revRecord) throw new Error('Part V continuous reread missing revision record in readings.json');
  assertCleanReaderProse(revRecord.before, 'revision.before');
  assertCleanReaderProse(revRecord.after, 'revision.after');
  assertCleanReaderProse(revRecord.reasoning, 'revision.reasoning');

  const part5MdxSet = new Set([
    'content/docs/book/ecological-scarcity-and-targets.mdx',
    'content/docs/book/localization-evidence-and-denominators.mdx',
    'content/docs/book/lime-preferences-and-damage-weights.mdx',
    'content/docs/book/social-assessment-objects-and-meaning.mdx',
    'content/docs/book/cost-perspectives-and-sustainability-combination.mdx',
  ]);
  const part5ClaimSet = new Set();
  const nonPart5ClaimSet = new Set();
  for (const [rel, bytes] of files) {
    if (!/^content\/.+\.mdx?$/.test(rel)) continue;
    const ids = collectChapterClaimIds(bytes.toString('utf8'));
    if (part5MdxSet.has(rel)) {
      for (const id of ids) part5ClaimSet.add(id);
    } else {
      for (const id of ids) nonPart5ClaimSet.add(id);
    }
  }

  for (const [evId, before] of rawEvidenceMap) {
    const current = catalog.evidence.find(row => row.id === evId);
    if (!before || !current || before.locator === current.locator)
      throw new Error(`Part V continuous reread missing expected locator update on: ${evId}`);
    const invariant = ({ locator: _l, ...rest }) => rest;
    if (!sameScienceValue(invariant(before), invariant(current)))
      throw new Error(`Part V continuous reread altered protected evidence fields outside locator on: ${evId}`);
    const referencingClaims = catalog.claims.filter(c => (c.evidenceIds ?? []).includes(evId));
    if (!referencingClaims.some(c => part5ClaimSet.has(c.id)))
      throw new Error(`Part V continuous reread modified evidence unreferenced by Part V: ${evId}`);
    if (exclusivePart5EvidenceIds.has(evId)) {
      const externalUsers = referencingClaims.filter(c => !part5ClaimSet.has(c.id) || nonPart5ClaimSet.has(c.id));
      if (externalUsers.length > 0)
        throw new Error(`Part V continuous reread mutated externally shared evidence outside shared allowlist: ${evId}`);
    } else if (!sharedPart5EvidenceIds.has(evId)) {
      throw new Error(`Part V continuous reread modified unauthorized evidence record: ${evId}`);
    }
    assertCleanReaderProse(current.locator, `${evId}.locator`);
  }

  for (const [id, before] of rawClaimMap) {
    const current = catalog.claims.find(row => row.id === id);
    if (!before || !current || Boolean(before.caseBinding) || Boolean(current.caseBinding)
        || current.status !== 'reviewed' || current.reviewedAt !== part5RereadCheckDate)
      throw new Error(`Part V continuous reread modified case-bound or unreviewed claim: ${id}`);

    const invariant = ({ text: _t, scope: _s, caveats: _c, premiseIds: _p, reviewedAt: _r, ...rest }) => rest;
    if (!sameScienceValue(invariant(before), invariant(current)))
      throw new Error(`Part V continuous reread altered protected evidence, concept, mapping or case binding on: ${id}`);

    const premiseSpec = premiseModifiedSpecs.get(id);
    if (premiseSpec) {
      if (!sameScienceValue(before.premiseIds, premiseSpec.from) || !sameScienceValue(current.premiseIds, premiseSpec.to))
        throw new Error(`Part V continuous reread has an unauthorized premiseIds transition on: ${id}`);
    } else if (!sameScienceValue(before.premiseIds, current.premiseIds)) {
      throw new Error(`Part V continuous reread altered protected premiseIds on: ${id}`);
    }

    if (proseModifiedClaimIds.has(id)) {
      if (before.text === current.text)
        throw new Error(`Part V continuous reread missing expected prose update on: ${id}`);
    } else if (before.text !== current.text) {
      throw new Error(`Part V continuous reread altered frozen prose text on non-prose claim: ${id}`);
    }

    if (scopeModifiedClaimIds.has(id)) {
      if (before.scope === current.scope)
        throw new Error(`Part V continuous reread missing expected scope update on: ${id}`);
    } else if (before.scope !== current.scope) {
      throw new Error(`Part V continuous reread altered frozen scope on non-scope claim: ${id}`);
    }

    if (caveatModifiedClaimIds.has(id)) {
      if (sameScienceValue(before.caveats, current.caveats))
        throw new Error(`Part V continuous reread missing expected caveats update on: ${id}`);
    } else if (!sameScienceValue(before.caveats, current.caveats)) {
      throw new Error(`Part V continuous reread altered frozen caveats on non-caveat claim: ${id}`);
    }

    for (const field of ['text', 'scope']) assertCleanReaderProse(current[field], `${id}.${field}`);
    for (const [idx, caveat] of current.caveats.entries())
      assertCleanReaderProse(caveat, `${id}.caveats.${idx}`);
  }

  // Programmatic topological & strict (unitOrder, noteNumber) ascending verification across ALL non-case Part V claims
  const edition = JSON.parse(files.get('config/book-edition.json').toString('utf8'));
  const claimPos = new Map();
  edition.units.forEach((u, unitOrder) => {
    const rel = (u.source === '/docs' || u.source === '/docs/book')
      ? `content${u.source}/index.mdx`
      : `content${u.source}.mdx`;
    const buf = files.get(rel);
    if (!buf) return;
    const seen = collectChapterClaimIds(buf.toString('utf8'));
    seen.forEach((cid, idx) => {
      if (!claimPos.has(cid)) claimPos.set(cid, { printOrder: unitOrder, note: idx + 1 });
    });
  });
  const claimById = new Map(catalog.claims.map(c => [c.id, c]));
  for (const cid of part5ClaimSet) {
    const cl = claimById.get(cid);
    if (!cl || cl.caseBinding) continue;
    const selfPos = claimPos.get(cid);
    if (!selfPos) throw new Error(`Part V claim missing book print position: ${cid}`);
    let prevPos = null;
    for (const pid of cl.premiseIds ?? []) {
      const pPos = claimPos.get(pid);
      if (!pPos) throw new Error(`Part V premise ${pid} on ${cid} lacks book print position`);
      const backward = pPos.printOrder < selfPos.printOrder
        || (pPos.printOrder === selfPos.printOrder && pPos.note < selfPos.note);
      if (!backward)
        throw new Error(`Part V non-case claim ${cid} has forward or self premise: ${pid}`);
      if (prevPos) {
        const ascending = pPos.printOrder > prevPos.printOrder
          || (pPos.printOrder === prevPos.printOrder && pPos.note > prevPos.note);
        if (!ascending)
          throw new Error(`Part V non-case claim ${cid} has non-ascending premiseIds at: ${pid}`);
      }
      prevPos = pPos;
    }
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Part V continuous reread missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Part V continuous reread inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Part V continuous reread declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the 4 physical files and 106 raw publication records before the #143 verifier. */
export function preparePart5RereadSource(unit, input, actual, structure) {
  assertUnitEnvelopeKeys(unit, {
    reviewed: unit.reviewEvidence !== undefined,
    isInitialPreviewSeed: Array.isArray(unit.outputs) && unit.outputs.length === 0,
  });
  const scope = new Set(unit.scope), fileRows = new Map(), records = new Map(), files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Part V continuous reread lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !fileRows.has(row.key) && Object.hasOwn(oldFileShas, row.key)) fileRows.set(row.key, row);
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Part V continuous reread cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || fileRows.size !== managedPaths.length
      || Object.keys(unit.previousFiles ?? {}).length !== managedPaths.length)
    throw new Error('Part V continuous reread must bind all 4 managed files and only declared changes');

  for (const path of managedPaths) {
    const fileRow = fileRows.get(path);
    const prevContent = unit.previousFiles?.[path];
    if (fileRow?.from !== oldFileShas[path] || sha256(prevContent ?? '') !== oldFileShas[path])
      throw new Error(`Part V continuous reread lacks independently preserved predecessor bytes: ${path}`);
  }

  const { catalog, readings, literature } = input;
  verifyBoundedFiles(unit, files);
  verifyBoundedClaimsAndEvidence(unit, catalog, readings, files);

  if (unit.rawFields?.length)
    throw new Error('Part V continuous reread must not mutate top-level research metadata timestamps');

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  validateCostSustainabilityFactors(previousRecords.catalog, previousRecords.readings);
  validateSocialComparisonFactors(previousRecords.catalog, previousRecords.readings);
  validateLocalizationComparisonFactors(previousRecords.catalog, previousRecords.readings);
  validateWeightingValuationFactors(previousRecords.catalog, previousRecords.readings);

  for (const path of managedPaths) files.set(path, Buffer.from(unit.previousFiles[path]));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== part5RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part5RereadPredecessorPin)
    throw new Error('Part V continuous reread did not recover the independently observed raw 915af295 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Part V continuous reread actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map(fileRows), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Part V continuous reread lacks exact cross-generation consumer review');

  const changedClaimIds = [...modifiedClaimIds];
  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...changedClaimIds])],
  };
}

export function effectivePart5Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part5Reread: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!exactKeys(capture, allowedCaptureKeys)
      || capture.schemaVersion !== 1 || editionDigest(capture) !== part5RereadCapturePin) return false;
  if (!exactKeys(capture.identity, allowedCaptureIdentityKeys)
      || !/^[a-f0-9]{40}$/.test(capture.identity.sourceCommit ?? '')
      || typeof capture.identity.dirty !== 'boolean' || !scienceText(capture.identity.status)
      || !scienceDigest(capture.identity.manifestSha256)
      || capture.manifestPaths !== 468
      || !exactKeys(capture.normalization, allowedCaptureNormKeys)
      || !Array.isArray(capture.normalization.articles)
      || !capture.normalization.articles.every(row => exactKeys(row, allowedNormArticleKeys))
      || !Array.isArray(capture.normalization.publicHtml)
      || !capture.normalization.publicHtml.every(row => exactKeys(row, allowedNormHtmlKeys))
      || !Array.isArray(capture.files) || !capture.files.length
      || !unique(capture.files, file => file?.path)
      || !capture.files.every(file => exactKeys(file, allowedCaptureFileKeys) && scienceText(file.path)
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
    && artifacts.every(file => exactKeys(file, allowedArtifactFileReceiptKeys)
      && file.sha256 === raw.get(file.path)?.sha256 && file.bytes === raw.get(file.path)?.bytes
      && (!file.path.endsWith('.json') || exactPublicJsonReceipt(file, publicDownloads.get(file.path))));
}

export function verifyPart5RereadReceipts(unit, artifacts, publicDownloads) {
  try {
    assertUnitEnvelopeKeys(unit, { reviewed: true, isInitialPreviewSeed: false });
  } catch {
    return false;
  }
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unit.reviewEvidence.every(row => exactKeys(row, allowedReviewEvidenceKeys))
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${part5RereadId}/${row.kind}`;
    if (row.date < part5RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part5RereadOrdinaryId(unit, route, print, index) {
  if (!unit) return undefined;
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  if (route === part5RereadB22Route && index === 'table-2') {
    return `${prefix}-part5-145-ordinary-table-2`;
  }
  if (route === part5RereadB23Route && (index === 'table-1' || index === 'table-2')) {
    return `${prefix}-part5-145-ordinary-${index}`;
  }
  return undefined;
}

const sectionMarkers = ['从系统关系到计算结果', '时间未来与相邻评价'];
export function part5RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = sectionMarkers.find(m => row.address.endsWith(`#${m}`) || row.address.endsWith(`-${m}`));
    return [row.address, { ...row, previous: marker ? { ...previous, title: marker } : previous }];
  })));
}

const ordinaryPattern = /-(?:part4-133-ordinary-[0-9]|weight-135-ordinary-(?:[0-2]|table)|soc-139-ordinary-0|part5-145-ordinary-table-[12])$/;
export function observePart5RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validatePart5RereadPartDisclosure(printDoc, unit) {
  if (!unit) return [];
  if (!printDoc) return ['Part V continuous reread missing /print document for Part 5 introduction check'];
  const errors = [];
  const parts = fingerprintCopyeditPrintParts(printDoc);
  if (parts[4]?.id !== 'print-part-5' || parts[4]?.sha256 !== unit.printPart5.to)
    errors.push('Part V continuous reread printed Part 5 header fingerprint differs from reviewed output');

  const disclosures = printDoc.querySelectorAll('[data-part5-reread-part]');
  if (disclosures.length !== 1) return [...errors, 'Part V continuous reread requires exactly one printed Part 5 introduction disclosure'];
  const node = disclosures[0];
  const group = printDoc.querySelector('[data-reader-part-group="5"]');
  const intro = group?.querySelector('.print-part-introduction');
  const detailsChildren = nonCommentChildren(node);
  const summary = detailsChildren[0];
  const para = detailsChildren[1];
  const summaryChildren = nonCommentChildren(summary);
  const time = summaryChildren[0];
  const paraChildren = nonCommentChildren(para);
  const link = paraChildren[paraChildren.length - 1];
  const paraLeadText = paraChildren.slice(0, -1).every(c => c.nodeType === 3)
    ? paraChildren.slice(0, -1).map(c => c.text).join('')
    : null;
  const summaryTailText = summaryChildren.slice(1).every(c => c.nodeType === 3)
    ? summaryChildren.slice(1).map(c => c.text).join('')
    : null;
  const allLinks = node.querySelectorAll('a');

  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part5-reread-part')
      || node.getAttribute('data-part5-reread-part') !== '5'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part5RereadSource.date
      || !singleTextChild(time, part5RereadSource.date) || summaryTailText !== ' 版第五部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part5-reread-part-source', 'href')
      || link.getAttribute('data-part5-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part5RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node))
    errors.push('Part V continuous reread printed Part 5 disclosure has invalid text, position or source link');
  return errors;
}

export function validatePart5RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part5-reread-correction]');
  const expectedRows = unit
    ? part5RereadCorrections.filter(row => path === '/print' || path === row.chapter)
    : [];
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length)
    return [`Part V continuous reread correction notices are absent, extra or detached: ${path}`];

  const errors = [];
  for (const row of expectedRows) {
    const { chapter, claimId, noteIndex, scope } = row;
    const { id } = flowBoundaryNoteTarget(path, chapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part5-reread-correction') === claimId);
    const marker = matching[0];
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
    if (matching.length !== 1 || nativeNotes.length !== 1 || note.tagName !== 'LI'
        || note.getAttribute('data-reader-claim') !== claimId
        || article?.getAttribute('data-reader-route') !== chapter || sections.length !== 1
        || note.parentNode !== list || noteItems[noteIndex] !== note
        || marker.tagName !== 'P' || marker.parentNode !== note || marker.nextElementSibling !== null
        || !attrs(marker, 'class', 'data-part5-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part5RereadSource.date
        || !singleTextChild(time, part5RereadSource.date)
        || midText !== ` 修订：${scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part5RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link))
      errors.push(`Part V continuous reread correction notice is absent, changed or detached (${claimId}): ${path}`);
  }
  return errors;
}

const part6SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-6`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-6`,
]));

const part7SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-7`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-7`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-8`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-8`,
]));

export function qualifyPart5RereadHistory(documents, unit, actual, part4Reread, weightingValuation, socialComparison, part6Reread = null, part7Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  assertUnitEnvelopeKeys(unit, {
    reviewed: unit.reviewEvidence !== undefined,
    isInitialPreviewSeed: false,
  });
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true))
    throw new Error('Part V continuous reread ordinaryOverrides violates the 4-key allowlist');
  let successorOverrides = null;
  if (part6Reread) {
    const raw = part6Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || Object.keys(raw).length !== part6SuccessorOverrideKeys.size
        || Object.keys(raw).some(key => !part6SuccessorOverrideKeys.has(key)
          || !plainObject(raw[key]) || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part V continuous reread successor ordinaryOverrides violates the 2-key Part VI allowlist');
    successorOverrides = Object.fromEntries([...part6SuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }]));
  }
  const allowedSuccessorKeys = new Set(part6Reread ? part6SuccessorOverrideKeys : []);
  if (part7Reread) {
    const raw = part7Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part7SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part V continuous reread successor ordinaryOverrides violates the 6-key Part VII allowlist');
    successorOverrides = { ...(successorOverrides ?? {}), ...Object.fromEntries([...part7SuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }])) };
    for (const k of part7SuccessorOverrideKeys) allowedSuccessorKeys.add(k);
  }

  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observePart5RereadOrdinaryTargets(documents),
    'Part V continuous reread',
    allowedSuccessorKeys.size ? allowedSuccessorKeys : part6SuccessorOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part V continuous reread', routes: part5RereadRoutes, predecessorPin: addressPin,
  });
  const part5Entry = prior['/print#print-part-5'];
  if (!part5Entry || part5Entry.introduction !== unit.partIntroduction.to)
    throw new Error('Part V continuous reread /print#print-part-5 lacks the reviewed Part 5 introduction');
  prior['/print#print-part-5'] = { ...part5Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha = part4Reread?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from))
      throw new Error(`Part V continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part5RereadHistoryControls(unit),
      source: part5RereadSource,
      attribute: 'part5-reread',
      previousHistory: [
        { attribute: 'social-comparison', expected: socialComparisonHistoryControls(socialComparison) },
        { attribute: 'weighting-valuation', expected: weightingValuationHistoryControls(weightingValuation) },
        { attribute: 'part4-reread', expected: part4RereadHistoryControls(part4Reread) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'TABLE'],
      label: 'Part V continuous reread',
      ordinaryOverrides: successorOverrides,
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validatePart5RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets))
    errors.push('Part V continuous reread actual versioned ordinary or table targets differ');
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part5-reread-part],[data-part5-reread-part-source]').length > 0)
      errors.push(`Part V continuous reread unexpected Part 5 disclosure marker outside /print: ${path}`);
    errors.push(...validatePart5RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part5RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart5RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
