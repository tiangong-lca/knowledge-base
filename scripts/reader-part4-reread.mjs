import capture from '../config/reader-part4-reread-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import {
  flowBoundaryNoteTarget, flowBoundaryOrdinaryDigest, groupHistoricalRanges,
  observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl,
} from './reader-flow-boundary.mjs';
import { biogenicCarbonHistoryControls } from './reader-biogenic-carbon.mjs';
import { particulateComparisonHistoryControls } from './reader-particulate-comparison.mjs';
import { validateBiogenicCarbonFactors } from './reader-biogenic-carbon-factors.mjs';
import { validateEutrophicationPathwaysFactors } from './reader-eutrophication-pathways-factors.mjs';
import { validateParticulateComparisonFactors } from './reader-particulate-comparison-factors.mjs';
import { validateWaterScarcityFactors } from './reader-water-scarcity-factors.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  projectScientificOrdinaryTargets, qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const part4RereadId = 'part4-reread-133';
export const part4RereadCheckDate = '2026-11-18';
export const part4RereadRoutes = Object.freeze([
  '/docs/book',
  'book-climate-equivalence',
  '/docs/book/climate-response-and-metrics',
  '/docs/book/particulate-emissions-and-health',
  '/docs/appendices/particulate-factor-calculations',
]);
/** @type {string|null} */
export const part4RereadUnitPin = '4cd6d951bf25285bdf98ea62d495bd781c45a1380a5349f5afb780e283e45d35';
/** @type {string|null} */
export const part4RereadCapturePin = 'fba421ebdcf7ee2d09981d48b978696bff30cfbdfe410913e97695584226c192';
export const part4RereadSource = Object.freeze({
  commit: '2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73',
  tree: 'ce50f3de57695fc3730caf30e7ae21c9e923b22d',
  manifest: '3834e5e421727292fbd4af552503bc9e7ea70590172f00b091106fa9fa284ef2',
  date: '2026-11-18',
});
export const part4RereadPredecessorPin = 'ee4ca466a5301113a927ff1492cbd4439888ff071122736f024885a2c91895ac';
const addressPin = 'd1a35c822541c5f4f384db433142b9b28dfa3bf757a99eaf0a4aea0d9148e569';
const previousPrintPart4Sha = 'fd11aa59df802651f5fe7f7267b1c3abea91ab0471e232405f437f4df5ed90f8';
const expectedPart4Intro = '清单给出了资源采掘、土地利用、取耗水和污染物排放等数量。要知道这些活动可能带来什么后果，还要沿着环境机制追查：土地恢复进程与矿石品位怎样变化，温室气体怎样改变辐射强迫，酸性和营养物质、细颗粒物及有毒化学品怎样经空气、水体与土壤到达生态系统或人群，以及当地还有多少水可用。各章借这些过程说明中点与终点指标的含义、比较条件与证据边界，为下一部讨论不同后果之间的取舍打下基础。';

export const allowedOrdinaryOverrideKeys = Object.freeze(new Set([
  `/docs/book/particulate-emissions-and-health#${chapterAnchorPrefix('/docs/book/particulate-emissions-and-health')}-particulate-131-ordinary-3`,
  `/print#${printUnitAnchor('/docs/book/particulate-emissions-and-health')}-particulate-131-ordinary-3`,
  `/docs/book/climate-response-and-metrics#${chapterAnchorPrefix('/docs/book/climate-response-and-metrics')}-bio-127-ordinary-2`,
  `/print#${printUnitAnchor('book-climate-equivalence')}-bio-127-ordinary-2`,
]));

export const part4RereadCorrections = Object.freeze([
  Object.freeze({
    chapter: '/docs/book/particulate-emissions-and-health',
    claimId: 'cl-pm-evidence-levels',
    scope: '前版将该条注释范围中的负担对照研究误印为“Gronlund2005”。本版按已绑定证据核正发表年份为“Gronlund等2015年”。',
  }),
  Object.freeze({
    chapter: '/docs/book/particulate-emissions-and-health',
    claimId: 'cl-pm-population-meaning',
    scope: '前版沿用增补跨体系对读前的单一 DALY/kg 表述。本版补绑跨体系截点前提，同步覆盖本章并存的 kg PM₂.₅ 当量/kg、过早死亡改名的“疾病发生例数/kg”与伤残调整生命年（DALY/kg）三类指标截点。',
  }),
  Object.freeze({
    chapter: '/docs/book/particulate-emissions-and-health',
    claimId: 'cl-pm-conclusion',
    scope: '前版末段仅概括排放分布、人群暴露、健康响应曲线与所用因子四项来源，尚未挂接跨体系比较增补的三项前提。本版补绑截点、粒径／子区室与前体开关前提，将收束核查扩充为五维因果链清单并衔接下一章取水、耗水与缺水损害判断。',
  }),
  Object.freeze({
    chapter: '/docs/book/water-scarcity-and-reference',
    claimId: 'cl-water125-value-choices-and-denominator-paradox',
    scope: '前版误将气候变化归入第 14 章。本版核正为“第 14 章的臭氧耗竭、电离辐射、第 15 章的气候变化”。',
  }),
]);

const oldFileShas = Object.freeze({
  'config/reader-numbering.json': 'e76f46a0f64077a3a9bd4eca1b44e61de5fd9bdc6f6e66254023e6cd19802367',
  'content/docs/book/index.mdx': '1a007883741a2cd7a0cede192ef97e6e9650ad85f4834caf5ba9f4eb5fcd4e71',
  'content/monograph/climate-equivalence.mdx': '98333aa5669dc34b08691f88db2a04df2a951434c7ba259af8e61ac2089d05aa',
  'content/docs/book/climate-response-and-metrics.mdx': 'a97f7e918364efaab5d6d21c6e497e0652572036d87b313161f386685172cc21',
  'content/docs/book/particulate-emissions-and-health.mdx': 'dd12cd42772e3cc2ec770fa834dd7758294f4bfb0376e44726f016b394c3330a',
  'content/docs/appendices/particulate-factor-calculations.mdx': '369a96bc470349f64021a02d159997df2b906f620eeb36c6bbd0c15e387bfbca',
  'knowledge/cases/particulate-health-v1.publication.json': 'edb81f3d10c13e7ce8d6841514d94f853df890f273ada805d9eb361b1afc8251',
  'knowledge/cases/water-locality-v1.publication.json': '6e16e8e9ca9c5406947a0a7b20d26ee50c858fff7af9fd15e9741420dea2a4cc',
});
const managedPaths = Object.keys(oldFileShas);

const layoutKeys = new Set([
  'B15:/monograph/climate-equivalence:reader-source',
  'B15:/docs/book/climate-response-and-metrics:reader-source',
  'B17:/docs/book/particulate-emissions-and-health:source',
  'B17:/docs/appendices/particulate-factor-calculations:source',
]);

const modifiedClaimIds = new Set([
  'cl-lcia-midpoint-pathway',
  'cl-path-acid-indicator', 'cl-path-units',
  'cl-water-opening', 'cl-water-input-basis',
  'cl-pm-opening', 'cl-pm-particle-identity', 'cl-pm-precursor-denominator',
  'cl-pm-intake-definition', 'cl-pm-intake-unit', 'cl-pm-receptor-boundary',
  'cl-pm-source-height', 'cl-pm-mixture-inputs', 'cl-pm-mixture-results',
  'cl-pm-exposure-evidence', 'cl-pm-cohort-design', 'cl-pm-cohort-association',
  'cl-pm-effect-baseline', 'cl-pm-effect-definition', 'cl-pm-effect-default',
  'cl-pm-urban-health', 'cl-pm-rural-health', 'cl-pm-precursor-health',
  'cl-pm-burden-check', 'cl-pm-population-meaning', 'cl-pm-indoor-location',
  'cl-pm-indoor-matrix', 'cl-pm-exposure-compatible', 'cl-pm-compatible-population',
  'cl-pm-indoor-time', 'cl-pm-exposure-coverage', 'cl-pm-nonlinear-response',
  'cl-pm-risk-reference', 'cl-pm-slope-meaning', 'cl-pm-finite-change',
  'cl-pm-slope-context', 'cl-pm-ier-evidence', 'cl-pm-gemm-alternative',
  'cl-pm-factor-correction', 'cl-pm-implementation-layer', 'cl-pm-chemistry-background',
  'cl-pm-chemistry-perturbation', 'cl-pm-chemistry-model-check', 'cl-pm-release-date',
  'cl-pm-concentration-route', 'cl-pm-regional-factor', 'cl-pm-modern-values',
  'cl-pm-modern-ratios', 'cl-pm-matched-scope', 'cl-pm-uncovered-pathways',
  'cl-pm-conclusion', 'cl-pm-evidence-levels', 'cl-pm-matched-scenario',
  'cl-mineral115-judgment',
  'cl-water125-method-genealogy',
  'cl-water125-ef-country-resolution-and-climates',
  'cl-water125-value-choices-and-denominator-paradox',
  'cl-water125-diagnostic-synthesis',
  'cl-bio127-co-removal-and-methane-shift',
  'cl-bio127-climate-diagnostic-synthesis',
  'cl-particulate131-indicator-cutpoints',
]);

const proseModifiedClaimIds = new Set([
  'cl-path-acid-indicator',
  'cl-path-units',
  'cl-water-opening',
  'cl-water-input-basis',
  'cl-pm-particle-identity',
  'cl-pm-precursor-denominator',
  'cl-pm-effect-definition',
  'cl-pm-population-meaning',
  'cl-pm-indoor-matrix',
  'cl-pm-gemm-alternative',
  'cl-pm-concentration-route',
  'cl-pm-conclusion',
  'cl-water125-method-genealogy',
  'cl-water125-ef-country-resolution-and-climates',
  'cl-water125-value-choices-and-denominator-paradox',
  'cl-water125-diagnostic-synthesis',
  'cl-bio127-co-removal-and-methane-shift',
  'cl-bio127-climate-diagnostic-synthesis',
  'cl-particulate131-indicator-cutpoints',
]);

const caveatModifiedSpecs = new Map([
  ['cl-lcia-midpoint-pathway', {
    from: [
      '中点位置和后续模型随影响类别而变；不把这一方法的定义直接归为ISO条款。',
      '2026-11-16修订明确原排放表述只是示例，并补明用地／开采输入，避免将旧开篇读成全类别都从排放出发；原版本见本注历史范围说明。',
    ],
    to: [
      '中点位置和后续模型随影响类别而变；不把这一方法的定义直接归为ISO条款。',
      '排放路径、土地占用与原生资源开采具有不同的清单起点，不能将排放驱动的环境机制直接套用于资源或用地指标。',
    ],
  }],
  ['cl-mineral115-judgment', {
    from: [
      'Berger等的暂时推荐对应Vieira2018/2017谱系的SOP_URR（75个矿产因子），不签收本书选择的原2016表行；其当时ADP建议也不自动覆盖2020累计更新。',
      '共同作者、复用数据和引用链不是独立实证重复。此处是有界源义核查、比较推理与模型审读，不是人类专家认证或真实读者学习结果。',
    ],
    to: [
      'Berger等的暂时推荐对应Vieira2018/2017谱系的SOP_URR（75个矿产因子），不签收本书选择的原2016表行；其当时ADP建议也不自动覆盖2020累计更新。',
      '共同作者、复用数据和引用链不是独立实证重复；本节仅就已发表方法文献、评估综述与官方发行包开展模型条件对比，不替代具体矿种的独立地质或采选实证调查。',
    ],
  }],
]);

const premiseExtendedSpecs = new Map([
  ['cl-pm-population-meaning', {
    from: ['cl-pm-burden-check'],
    to: ['cl-pm-burden-check', 'cl-particulate131-indicator-cutpoints'],
  }],
  ['cl-pm-conclusion', {
    from: [
      'cl-pm-population-meaning',
      'cl-pm-finite-change',
      'cl-pm-chemistry-model-check',
      'cl-pm-uncovered-pathways',
      'cl-book-service-contract',
      'cl-pm-precursor-health',
      'cl-pm-matched-scenario',
    ],
    to: [
      'cl-pm-population-meaning',
      'cl-pm-finite-change',
      'cl-pm-chemistry-model-check',
      'cl-pm-uncovered-pathways',
      'cl-book-service-contract',
      'cl-pm-precursor-health',
      'cl-pm-matched-scenario',
      'cl-particulate131-indicator-cutpoints',
      'cl-particulate131-size-and-subcompartment',
      'cl-particulate131-precursor-perspectives',
    ],
  }],
]);

const inequalityClaimIds = new Set([
  'cl-water125-ef-country-resolution-and-climates',
  'cl-water125-value-choices-and-denominator-paradox',
  'cl-water125-diagnostic-synthesis',
]);

const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
const plainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const attrs = (node, ...keys) => sameScienceValue(Object.keys(node?.attributes ?? {}).map(key => key.toLowerCase()).sort(), keys.sort());
const nonCommentChildren = node => (node?.childNodes ?? []).filter(child => child.nodeType !== 8);
const singleTextChild = (node, expectedText) => {
  const children = nonCommentChildren(node);
  return children.length === 1 && children[0].nodeType === 3 && children[0].text === expectedText;
};

const forbiddenReaderToken = /(?<![a-fA-F0-9])[a-fA-F0-9]{64}(?![a-fA-F0-9])|\b(?:cl|ev|src|rd|psg|art|work|lit|gap|rev|q)-[a-z0-9-]+|\bCASE-[A-Z0-9-]+|本\s*轮|本次\s*核读|首版\s*建设|主任务|源码\s*提交|待\s*交付|研究\s*进行中|核查\s*日志|检索\s*日志|构建\s*状态/;
function assertCleanReaderProse(text, label, { allowInequalities = false } = {}) {
  if (!scienceText(text) || forbiddenReaderToken.test(text))
    throw new Error(`Part IV continuous reread invalid or leaked reader-surface token in ${label}`);
  const sanitized = allowInequalities
    ? text.replace(/HDI\s*<\s*0\.30|HDI\s*>\s*0\.88|\bI\s*>\s*H\s*=\s*E/g, '')
    : text;
  if (/[\r\n<>]/.test(sanitized))
    throw new Error(`Part IV continuous reread invalid newline or angle bracket in ${label}`);
}

function validOrdinaryOverridesShape(overrides, requireComplete = true) {
  if (!plainObject(overrides)) return false;
  const keys = Object.keys(overrides);
  if (keys.length === 0 && !requireComplete) return true;
  if (keys.length !== allowedOrdinaryOverrideKeys.size || keys.some(key => !allowedOrdinaryOverrideKeys.has(key)))
    return false;
  return keys.every(key => {
    const row = overrides[key];
    return plainObject(row) && Object.keys(row).length === 2
      && scienceDigest(row.from) && scienceDigest(row.to) && row.from !== row.to;
  });
}

export function selectPart4Reread(config, pin = part4RereadUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Part IV continuous reread requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  const isInitialPreviewSeed = preview && config.status === 'preview' && Array.isArray(unit?.outputs) && unit.outputs.length === 0;
  if (unit?.id !== part4RereadId || !sameScienceValue(unit.source, part4RereadSource)
      || !sameScienceValue(unit.routes, part4RereadRoutes) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || unit.layouts.length !== layoutKeys.size
      || !unique(unit.layouts, row => row?.key) || unit.layouts.some(row => !layoutKeys.has(row?.key))
      || unit.partIntroduction?.part !== 4 || !scienceText(unit.partIntroduction?.from)
      || !scienceText(unit.partIntroduction?.to) || unit.partIntroduction.from === unit.partIntroduction.to
      || /[\r\n<>]/.test(unit.partIntroduction.from) || /[\r\n<>]/.test(unit.partIntroduction.to)
      || !scienceText(unit.partIntroduction?.rationale)
      || unit.printPart4?.id !== 'print-part-4' || unit.printPart4?.from !== previousPrintPart4Sha
      || !scienceDigest(unit.printPart4?.to) || unit.printPart4.from === unit.printPart4.to
      || !plainObject(unit.history) || !validOrdinaryOverridesShape(unit.history.ordinaryOverrides, !isInitialPreviewSeed)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Part IV continuous reread requires an exact 2ba0bfe2 predecessor and bounded Part IV plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Part IV continuous reread is not independently accepted');
  return unit;
}

export function projectPart4RereadNumbering(unit, actual) {
  if (!unit) return actual;
  const { part, from, to } = unit.partIntroduction ?? {};
  if (part !== 4 || !scienceText(from) || !scienceText(to) || from === to || /[\r\n<>]/.test(from) || /[\r\n<>]/.test(to))
    throw new Error('Part IV continuous reread has an invalid Part 4 introduction transition');
  const projected = structuredClone(actual);
  const slot = projected?.parts?.find(row => row.number === 4);
  if (!slot || slot.introduction !== to)
    throw new Error('Part IV continuous reread numbering differs from the reviewed Part 4 introduction');
  slot.introduction = from;
  return projected;
}

export function projectPart4RereadPrintParts(unit, printParts) {
  if (!unit || !printParts) return printParts;
  const { id, from, to } = unit.printPart4 ?? {};
  const slot = printParts[3];
  if (id !== 'print-part-4' || from !== previousPrintPart4Sha || !scienceDigest(to) || from === to
      || slot?.id !== 'print-part-4' || slot.sha256 !== from)
    throw new Error('Part IV continuous reread printed Part 4 header differs from its accepted 8148/95 predecessor');
  return printParts.map(row => row.id === 'print-part-4' ? { id: 'print-part-4', sha256: to } : row);
}

export function part4RereadLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  const row = unit.layouts.find(item => item.key === key);
  if (!row || row.from !== editionDigest(accepted) || !scienceText(row.rationale) || sameScienceValue(row.to, accepted))
    throw new Error(`Part IV continuous reread lacks the exact layout amendment: ${key}`);

  if (key.startsWith('B15:')) {
    const expectedOrdinary = accepted.source.ordinary.map((item, idx) => idx === 1 ? {
      ...item,
      text: '本节的墙面清单来自墙面服务比较的完整教学例。性能、维护、活动和截断条件见该例；这里固定其中一组清单，只比较指标和版本的作用。',
      links: [{ text: '墙面服务比较', href: '/docs/book/wall-service-to-comparison/' }],
    } : item);
    const approved = {
      source: {
        ...accepted.source,
        mdxSha256: row.to?.source?.mdxSha256,
        ordinary: expectedOrdinary,
      },
      occurrences: accepted.occurrences,
    };
    if (!scienceDigest(row.to?.source?.mdxSha256) || !sameScienceValue(row.to, approved))
      throw new Error(`Part IV continuous reread altered protected B15 layout outside the dual-view wall link: ${key}`);
    return row.to;
  }

  const isChapter = key === 'B17:/docs/book/particulate-emissions-and-health:source';
  const targetNavText = isChapter
    ? 'GLAM澳大利亚城乡四个初级PM₂.₅发布因子的数值换算及其发行范围见发行范围与因子表。'
    : '正文的因子与比较一节说明了怎样比较GLAM澳大利亚城乡四个初级PM₂.₅发布因子。历史效应因子的定义见排放与健康量。';
  const targetIndex = isChapter ? 10 : 11;
  const expectedBlocks = accepted.blocks.map((block, idx) => idx === targetIndex && block.kind === 'navigation'
    ? { ...block, text: targetNavText }
    : block);
  const approved = {
    ...accepted,
    mdxSha256: row.to?.mdxSha256,
    blocks: expectedBlocks,
  };
  if (!scienceDigest(row.to?.mdxSha256) || !sameScienceValue(row.to, approved))
    throw new Error(`Part IV continuous reread altered protected B17/X04 layout outside the scoped navigation sentence: ${key}`);
  return row.to;
}

function allowsRaw(kind, id, before) {
  if (before !== null) return kind === 'claims' && modifiedClaimIds.has(id);
  return kind === 'revisions' && id === 'rev-part4-reread-133-continuity-and-scopes';
}

function verifyBoundedFiles(unit, files, catalog) {
  const prevNumbering = JSON.parse(unit.previousFiles['config/reader-numbering.json']);
  const currNumbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
  const prevPart4Intro = prevNumbering?.parts?.find(p => p.number === 4)?.introduction;
  if (unit.partIntroduction?.from !== prevPart4Intro || unit.partIntroduction?.to !== expectedPart4Intro)
    throw new Error('Part IV continuous reread partIntroduction does not match exact predecessor or reviewed Part 4 text');
  assertCleanReaderProse(unit.partIntroduction.from, 'partIntroduction.from');
  assertCleanReaderProse(unit.partIntroduction.to, 'partIntroduction.to');
  const expectedNumbering = structuredClone(prevNumbering);
  expectedNumbering.parts.find(p => p.number === 4).introduction = expectedPart4Intro;
  if (!sameScienceValue(currNumbering, expectedNumbering))
    throw new Error('Part IV continuous reread altered config/reader-numbering.json outside Part 4 introduction');

  const oldBookLine = '排放清单说明物质、数量和去向。第四部讨论气候响应、接收环境与人群暴露等关系，解释清单量如何转化为不同的环境指标。阅读[影响路径](/docs/book/midpoint-endpoint-value-choices/)时，可以选取一个因子，追查它所对应的物质、地区和时间条件。第五部讨论不同结果之间的取舍，说明政策目标、本地参照和人群偏好如何影响比较。';
  const newBookLine = '清单记录资源采掘、土地利用、取耗水与物质排放。第四部从[中点与终点](/docs/book/midpoint-endpoint-value-choices/)的因果截点出发，依次讨论气候当量、酸化与营养富集、颗粒物健康损害、耗水与缺水潜势以及多介质化学毒性，解释清单量如何转化为不同的环境指标。阅读时可以选取一个表征因子，追查它所对应的干预对象、空间背景、时间窗口与证据边界。第五部讨论不同结果之间的取舍，说明政策目标、本地参照和人群偏好如何影响比较。';
  const prevBook = unit.previousFiles['content/docs/book/index.mdx'];
  const currBook = files.get('content/docs/book/index.mdx').toString('utf8');
  if (!prevBook.includes(oldBookLine) || prevBook.replace(oldBookLine, () => newBookLine) !== currBook)
    throw new Error('Part IV continuous reread altered content/docs/book/index.mdx outside the Part IV paragraph');

  for (const path of ['content/monograph/climate-equivalence.mdx', 'content/docs/book/climate-response-and-metrics.mdx']) {
    const prev = unit.previousFiles[path];
    const curr = files.get(path).toString('utf8');
    const oldLink = '[第29章的完整教学例](/docs/book/wall-service-to-comparison/)';
    const newLink = '[墙面服务比较](/docs/book/wall-service-to-comparison/)的完整教学例';
    if (!prev.includes(oldLink) || prev.replace(oldLink, () => newLink) !== curr)
      throw new Error(`Part IV continuous reread altered ${path} outside the dual-view wall link`);
  }

  {
    const path = 'content/docs/book/particulate-emissions-and-health.mdx';
    const prev = unit.previousFiles[path];
    const curr = files.get(path).toString('utf8');
    const oldPhrase = '四个发布因子的数值换算及其发行范围见[发行范围与因子表]';
    const newPhrase = 'GLAM澳大利亚城乡四个初级PM₂.₅发布因子的数值换算及其发行范围见[发行范围与因子表]';
    if (!prev.includes(oldPhrase) || prev.replace(oldPhrase, () => newPhrase) !== curr)
      throw new Error(`Part IV continuous reread altered ${path} outside the GLAM 4-factor navigation phrase`);
  }

  {
    const path = 'content/docs/appendices/particulate-factor-calculations.mdx';
    const prev = unit.previousFiles[path];
    const curr = files.get(path).toString('utf8');
    const oldPhrase = '一节说明了怎样比较四个发布因子。';
    const newPhrase = '一节说明了怎样比较GLAM澳大利亚城乡四个初级PM₂.₅发布因子。';
    if (!prev.includes(oldPhrase) || prev.replace(oldPhrase, () => newPhrase) !== curr)
      throw new Error(`Part IV continuous reread altered ${path} outside the X04 4-factor return phrase`);
  }

  {
    const path = 'knowledge/cases/particulate-health-v1.publication.json';
    const prev = JSON.parse(unit.previousFiles[path]);
    const curr = JSON.parse(files.get(path).toString('utf8'));
    const catalogById = new Map(catalog.claims.map(c => [c.id, c]));
    const stripScopes = obj => ({ ...obj, claims: obj.claims.map(({ scope: _s, ...rest }) => rest) });
    if (!sameScienceValue(stripScopes(prev), stripScopes(curr))
        || curr.claims.some(c => !scienceText(c.scope) || c.scope.includes('具名方法与证据范围')
          || catalogById.get(c.id)?.scope !== c.scope))
      throw new Error(`Part IV continuous reread altered ${path} outside its 10 reviewed claim scopes`);
    for (const c of curr.claims) assertCleanReaderProse(c.scope, `particulate-health-v1:${c.id}.scope`);
  }

  {
    const path = 'knowledge/cases/water-locality-v1.publication.json';
    const prev = JSON.parse(unit.previousFiles[path]);
    const curr = JSON.parse(files.get(path).toString('utf8'));
    const expected = structuredClone(prev);
    expected.claims[0].textTemplate = expected.claims[0].textTemplate.replace(
      'AWARE利用当地水资源背景，评价这项耗水使其他人类或生态系统用水者缺水的潜势。',
      '剩余可用水模型（Available WAter REmaining，AWARE）利用当地水资源背景，评价这项耗水使其他人类或生态系统用水者缺水的潜势。',
    );
    if (!sameScienceValue(curr, expected))
      throw new Error(`Part IV continuous reread altered ${path} outside cl-water-opening first-appearance expansion`);
  }
}

function verifyBoundedClaims(unit, catalog) {
  const rawClaimMap = new Map(unit.rawRecords.filter(r => r.path === 'catalog.claims').map(r => [r.id, r.from]));
  if (rawClaimMap.size !== modifiedClaimIds.size || [...modifiedClaimIds].some(id => !rawClaimMap.has(id)))
    throw new Error('Part IV continuous reread rawRecords does not match the exact 61 modified claims');

  for (const [id, before] of rawClaimMap) {
    const current = catalog.claims.find(row => row.id === id);
    const expectedReviewedAt = before?.caseBinding ? before.reviewedAt : part4RereadCheckDate;
    if (!before || !current || current.status !== 'reviewed' || current.reviewedAt !== expectedReviewedAt)
      throw new Error(`Part IV continuous reread modified claim lacks reviewed status or check date: ${id}`);

    const invariant = ({ text: _t, scope: _s, caveats: _c, premiseIds: _p, reviewedAt: _r, ...rest }) => rest;
    if (!sameScienceValue(invariant(before), invariant(current)))
      throw new Error(`Part IV continuous reread altered protected evidence, concept, mapping or case binding on: ${id}`);

    const premiseSpec = premiseExtendedSpecs.get(id);
    if (premiseSpec) {
      if (!sameScienceValue(before.premiseIds, premiseSpec.from) || !sameScienceValue(current.premiseIds, premiseSpec.to))
        throw new Error(`Part IV continuous reread has an unauthorized premiseIds transition on: ${id}`);
    } else if (!sameScienceValue(before.premiseIds, current.premiseIds)) {
      throw new Error(`Part IV continuous reread altered protected evidence, premise, concept, mapping or case binding on: ${id}`);
    }

    const caveatSpec = caveatModifiedSpecs.get(id);
    if (caveatSpec) {
      if (!sameScienceValue(before.caveats, caveatSpec.from) || !sameScienceValue(current.caveats, caveatSpec.to))
        throw new Error(`Part IV continuous reread has an unauthorized caveats transition on: ${id}`);
    } else if (!sameScienceValue(before.caveats, current.caveats)) {
      throw new Error(`Part IV continuous reread altered protected caveats on: ${id}`);
    }

    if (proseModifiedClaimIds.has(id)) {
      if (before.text === current.text)
        throw new Error(`Part IV continuous reread missing expected prose update on: ${id}`);
    } else if (before.text !== current.text) {
      throw new Error(`Part IV continuous reread altered frozen prose text on scope/caveat-only claim: ${id}`);
    }

    if (current.scope.includes('具名方法与证据范围'))
      throw new Error(`Part IV continuous reread left a mechanical placeholder scope on: ${id}`);
    const allowInequalities = inequalityClaimIds.has(id);
    for (const field of ['text', 'scope']) assertCleanReaderProse(current[field], `${id}.${field}`, { allowInequalities });
    for (const [idx, caveat] of current.caveats.entries())
      assertCleanReaderProse(caveat, `${id}.caveats.${idx}`, { allowInequalities });
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Part IV continuous reread missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Part IV continuous reread inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Part IV continuous reread declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the 8 physical files and 62 raw publication records before the #131 verifier. */
export function preparePart4RereadSource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Part IV continuous reread binds corrections strictly through code-pinned part4RereadCorrections');
  const scope = new Set(unit.scope), fileRows = new Map(), records = new Map(), files = new Map(input.files);
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Part IV continuous reread lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !fileRows.has(row.key) && Object.hasOwn(oldFileShas, row.key)) fileRows.set(row.key, row);
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Part IV continuous reread cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || fileRows.size !== managedPaths.length
      || Object.keys(unit.previousFiles ?? {}).length !== managedPaths.length)
    throw new Error('Part IV continuous reread must bind all 8 managed files and only declared changes');

  for (const path of managedPaths) {
    const fileRow = fileRows.get(path);
    const prevContent = unit.previousFiles?.[path];
    if (fileRow?.from !== oldFileShas[path] || sha256(prevContent ?? '') !== oldFileShas[path])
      throw new Error(`Part IV continuous reread lacks independently preserved predecessor bytes: ${path}`);
  }

  const { catalog, readings, literature } = input;
  verifyBoundedFiles(unit, files, catalog);
  verifyBoundedClaims(unit, catalog);
  validateParticulateComparisonFactors(catalog, readings);
  validateEutrophicationPathwaysFactors(catalog, readings);
  validateBiogenicCarbonFactors(catalog, readings);
  validateWaterScarcityFactors(catalog, readings);

  if (unit.rawFields?.length)
    throw new Error('Part IV continuous reread must not mutate top-level research metadata timestamps');

  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  for (const path of managedPaths) files.set(path, Buffer.from(unit.previousFiles[path]));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== part4RereadPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== part4RereadPredecessorPin)
    throw new Error('Part IV continuous reread did not recover the independently observed raw 2ba0bfe2 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Part IV continuous reread actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map(fileRows), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Part IV continuous reread lacks exact cross-generation consumer review');

  const changedClaimIds = [...modifiedClaimIds];
  return {
    previous,
    previousRecords,
    files,
    structure: priorStructure,
    affectedClaimIds: [...new Set([...consumers, ...changedClaimIds])],
  };
}

export function effectivePart4Reread(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous,
    part4Reread: unit,
    researchChanged: true,
    changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== part4RereadCapturePin) return false;
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

export function verifyPart4RereadReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${part4RereadId}/${row.kind}`;
    if (row.date < part4RereadCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function part4RereadOrdinaryId(unit, route, print, index) {
  if (!unit || !Number.isInteger(index) || index < 0) return undefined;
  if (route === '/docs/book' && index <= 9) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part4-133-ordinary-${index}`;
  }
  if (route === '/docs/appendices/particulate-factor-calculations' && index <= 5) {
    return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-part4-133-ordinary-${index}`;
  }
  return undefined;
}

const sectionMarkers = ['从系统关系到计算结果'];
export function part4RereadHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = sectionMarkers.find(m => row.address.endsWith(`#${m}`) || row.address.endsWith(`-${m}`));
    return [row.address, { ...row, previous: marker ? { ...previous, title: marker } : previous }];
  })));
}

const ordinaryPattern = /-(?:part4-133-ordinary-[0-9]|particulate-131-ordinary-[0-3]|bio-127-ordinary-(?:\d+|figure))$/;
export function observePart4RereadOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id],figure[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
      tag: node.tagName,
    }])));
}

export function validatePart4RereadPartDisclosure(printDoc, unit) {
  if (!unit) return [];
  if (!printDoc) return ['Part IV continuous reread missing /print document for Part 4 introduction check'];
  const errors = [];
  const parts = fingerprintCopyeditPrintParts(printDoc);
  if (parts[3]?.id !== 'print-part-4' || parts[3]?.sha256 !== unit.printPart4.to)
    errors.push('Part IV continuous reread printed Part 4 header fingerprint differs from reviewed output');

  const disclosures = printDoc.querySelectorAll('[data-part4-reread-part]');
  if (disclosures.length !== 1) return [...errors, 'Part IV continuous reread requires exactly one printed Part 4 introduction disclosure'];
  const node = disclosures[0];
  const group = printDoc.querySelector('[data-reader-part-group="4"]');
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

  if (node.tagName !== 'DETAILS' || !attrs(node, 'class', 'data-part4-reread-part')
      || node.getAttribute('data-part4-reread-part') !== '4'
      || node.getAttribute('class') !== 'legacy-citation-context'
      || node.parentNode !== group || node.previousElementSibling !== intro
      || node.nextElementSibling?.tagName !== 'ARTICLE'
      || detailsChildren.length !== 2 || summary?.tagName !== 'SUMMARY' || para?.tagName !== 'P'
      || !attrs(summary) || summaryChildren.length < 2 || time?.tagName !== 'TIME'
      || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part4RereadSource.date
      || !singleTextChild(time, part4RereadSource.date) || summaryTailText !== ' 版第四部导言范围'
      || !attrs(para) || paraChildren.length < 2 || paraLeadText !== `前版导言：“${unit.partIntroduction.from}” `
      || allLinks.length !== 1 || link !== allLinks[0] || link?.tagName !== 'A'
      || !attrs(link, 'data-part4-reread-part-source', 'href')
      || link.getAttribute('data-part4-reread-part-source') !== ''
      || link.getAttribute('href') !== citationSourceHref(part4RereadSource.commit)
      || !singleTextChild(link, '查看该版源文件')
      || !visibleHistoryControl(intro) || !visibleHistoryControl(node)
      || !visibleHistoryControl(summary) || !visibleHistoryControl(time, node)
      || !visibleHistoryControl(para, node) || !visibleHistoryControl(link, node))
    errors.push('Part IV continuous reread printed Part 4 disclosure has invalid text, position or source link');
  return errors;
}

export function validatePart4RereadCorrectionOutput(document, path, unit) {
  const markers = document.querySelectorAll('[data-part4-reread-correction]');
  const expectedRows = unit
    ? part4RereadCorrections.filter(row => path === '/print' || path === row.chapter)
    : [];
  if (!expectedRows.length && !markers.length) return [];
  if (markers.length !== expectedRows.length)
    return [`Part IV continuous reread correction notices are absent, extra or detached: ${path}`];

  for (const row of expectedRows) {
    const { id } = flowBoundaryNoteTarget(path, row.chapter, row.claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const matching = markers.filter(m => m.getAttribute('data-part4-reread-correction') === row.claimId);
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
        || note.getAttribute('data-reader-claim') !== row.claimId
        || article?.getAttribute('data-reader-route') !== row.chapter || sections.length !== 1
        || note.parentNode !== list || !noteItems.includes(note)
        || marker.tagName !== 'P' || marker.parentNode !== note || marker.nextElementSibling !== null
        || !attrs(marker, 'class', 'data-part4-reread-correction', 'style')
        || marker.getAttribute('class') !== 'legacy-citation-context'
        || marker.getAttribute('style') !== 'display:block'
        || markerChildren.length < 3 || time?.tagName !== 'TIME' || link?.tagName !== 'A'
        || !attrs(time, 'datetime') || time.getAttribute('datetime') !== part4RereadSource.date
        || !singleTextChild(time, part4RereadSource.date)
        || midText !== ` 修订：${row.scope} `
        || allLinks.length !== 1 || link !== allLinks[0]
        || !attrs(link, 'href') || link.getAttribute('href') !== citationSourceHref(part4RereadSource.commit)
        || !singleTextChild(link, '查看前版源文件')
        || !visibleHistoryControl(marker) || !visibleHistoryControl(time) || !visibleHistoryControl(link))
      return [`Part IV continuous reread correction notice is absent, changed or detached (${row.claimId}): ${path}`];
  }
  return [];
}

const part5SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-4`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-4`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
]));

const part6SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-6`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-6`,
]));

const part3SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-3`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-3`,
]));

const part7SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-5`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-5`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-7`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-7`,
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-8`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-8`,
]));

const part1SuccessorOverrideKeys = Object.freeze(new Set([
  `/docs/book#${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-2`,
  `/print#${printUnitAnchor('/docs/book')}-part4-133-ordinary-2`,
]));

export function qualifyPart4RereadHistory(documents, unit, actual, particulateComparison, biogenicCarbon, part5Reread = null, part6Reread = null, part7Reread = null, part3Reread = null, part2Reread = null, part1Reread = null) {
  if (!unit) return { prior: actual, errors: [] };
  const overrides = unit.history?.ordinaryOverrides;
  if (!validOrdinaryOverridesShape(overrides, true))
    throw new Error('Part IV continuous reread ordinaryOverrides violates the 4-key allowlist');
  let successorOverrides = null;
  const allowedSuccessorKeys = new Set();
  if (part5Reread) {
    const raw = part5Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || Object.keys(raw).length !== part5SuccessorOverrideKeys.size
        || Object.keys(raw).some(key => !part5SuccessorOverrideKeys.has(key)
          || !plainObject(raw[key]) || Object.keys(raw[key]).length !== 2
          || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 4-key Part V allowlist');
    successorOverrides = { ...(successorOverrides ?? {}), ...Object.fromEntries([...part5SuccessorOverrideKeys].map(key => [key, raw[key]])) };
    for (const k of part5SuccessorOverrideKeys) allowedSuccessorKeys.add(k);
  }
  if (part6Reread) {
    const raw = part6Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || Object.keys(raw).length !== part6SuccessorOverrideKeys.size
        || Object.keys(raw).some(key => !part6SuccessorOverrideKeys.has(key)
          || !plainObject(raw[key]) || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 2-key Part VI allowlist');
    successorOverrides = { ...(successorOverrides ?? {}), ...Object.fromEntries([...part6SuccessorOverrideKeys].map(key => [key, { from: raw[key].from, to: raw[key].to }])) };
    for (const k of part6SuccessorOverrideKeys) allowedSuccessorKeys.add(k);
  }
  if (part7Reread) {
    const raw = part7Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part7SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 6-key Part VII allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part7SuccessorOverrideKeys) {
      if (successorOverrides[key]) {
        if (successorOverrides[key].to !== raw[key].from)
          throw new Error(`Part IV continuous reread chained successor ordinaryOverrides broken at ${key}`);
        successorOverrides[key] = { from: successorOverrides[key].from, to: raw[key].to };
      } else {
        successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      }
      allowedSuccessorKeys.add(key);
    }
  }
  if (part3Reread) {
    const raw = part3Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part3SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 2-key Part III allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part3SuccessorOverrideKeys) {
      successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      allowedSuccessorKeys.add(key);
    }
  }
  if (part2Reread) {
    const raw = part2Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part3SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 2-key Part II allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part3SuccessorOverrideKeys) {
      if (successorOverrides[key]) {
        if (successorOverrides[key].to !== raw[key].from)
          throw new Error(`Part IV continuous reread chained successor ordinaryOverrides broken at ${key}`);
        successorOverrides[key] = { from: successorOverrides[key].from, to: raw[key].to };
      } else {
        successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      }
      allowedSuccessorKeys.add(key);
    }
  }
  if (part1Reread) {
    const raw = part1Reread.history?.ordinaryOverrides;
    if (!plainObject(raw) || [...part1SuccessorOverrideKeys].some(key => !plainObject(raw[key])
        || !scienceDigest(raw[key].from) || !scienceDigest(raw[key].to) || raw[key].from === raw[key].to))
      throw new Error('Part IV continuous reread successor ordinaryOverrides violates the 2-key Part I allowlist');
    successorOverrides = { ...(successorOverrides ?? {}) };
    for (const key of part1SuccessorOverrideKeys) {
      successorOverrides[key] = { from: raw[key].from, to: raw[key].to };
      allowedSuccessorKeys.add(key);
    }
  }

  const targets = projectScientificOrdinaryTargets(
    successorOverrides,
    observePart4RereadOrdinaryTargets(documents),
    'Part IV continuous reread',
    allowedSuccessorKeys.size ? allowedSuccessorKeys : part5SuccessorOverrideKeys,
  );
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Part IV continuous reread', routes: part4RereadRoutes, predecessorPin: addressPin,
  });
  const part4Entry = prior['/print#print-part-4'];
  if (!part4Entry || part4Entry.introduction !== unit.partIntroduction.to)
    throw new Error('Part IV continuous reread /print#print-part-4 lacks the reviewed Part 4 introduction');
  prior['/print#print-part-4'] = { ...part4Entry, introduction: unit.partIntroduction.from };

  const historyBlockMap = new Map();
  for (const hRow of unit.history.history ?? []) {
    const pathPart = hRow.address.split('#')[0];
    for (const b of hRow.ordinary ?? []) {
      historyBlockMap.set(`${pathPart}#${b.targetId}`, { from: b.from, to: b.to });
    }
  }
  for (const [key, row] of Object.entries(overrides)) {
    const hBlock = historyBlockMap.get(key);
    const priorSha = key.endsWith('-particulate-131-ordinary-3')
      ? particulateComparison?.history?.ordinaryTargets?.[key]?.sha256
      : biogenicCarbon?.history?.ordinaryTargets?.[key]?.sha256;
    if (targets[key]?.sha256 !== row.to || !hBlock || hBlock.from !== row.from || hBlock.to !== row.to
        || (priorSha !== undefined && priorSha !== row.from))
      throw new Error(`Part IV continuous reread ordinary override disagrees with predecessor or actual DOM target: ${key}`);
  }

  const errors = [
    ...validateDatedHistoryOutput(documents, {
      expected: part4RereadHistoryControls(unit),
      source: part4RereadSource,
      attribute: 'part4-reread',
      previousHistory: [
        { attribute: 'particulate-comparison', expected: particulateComparisonHistoryControls(particulateComparison) },
        { attribute: 'biogenic-carbon', expected: biogenicCarbonHistoryControls(biogenicCarbon) },
      ],
      ordinaryPattern,
      ordinaryTags: ['P', 'FIGURE'],
      label: 'Part IV continuous reread',
      ordinaryOverrides: successorOverrides,
      ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
    }),
    ...validatePart4RereadPartDisclosure(documents.get('/print'), unit),
  ];
  if (!sameScienceValue(targets, unit.history.ordinaryTargets))
    errors.push('Part IV continuous reread actual versioned ordinary targets differ');
  for (const [path, document] of documents) {
    if (path !== '/print' && document.querySelectorAll('[data-part4-reread-part],[data-part4-reread-part-source]').length > 0)
      errors.push(`Part IV continuous reread unexpected Part 4 disclosure marker outside /print: ${path}`);
    errors.push(...validatePart4RereadCorrectionOutput(document, path, unit));
  }
  return { prior, errors };
}

export function part4RereadPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}

export function restorePart4RereadTestFiles(files, unit) {
  if (!unit) return files;
  for (const [path, content] of Object.entries(unit.previousFiles ?? {})) {
    files.set(path, Buffer.from(content));
  }
  return files;
}
