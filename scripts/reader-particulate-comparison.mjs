import { validateParticulateComparisonFactors } from './reader-particulate-comparison-factors.mjs';
import capture from '../config/reader-particulate-comparison-capture.json' with { type: 'json' };
import { collectChapterClaimOccurrences, chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const particulateComparisonId = 'particulate-comparison-131';
export const particulateComparisonChapter = '/docs/book/particulate-emissions-and-health';
export const particulateComparisonCheckDate = '2026-11-18';
/** @type {string|null} */
export const particulateComparisonUnitPin = '0c04aa80e33e98445ca39baf854e87d037ca5f7e73c0975d4e9f76922ed82d20';
/** @type {string|null} */
export const particulateComparisonCapturePin = 'dd1389bf6dfea9b98a7ba5720699bd9edd78241bc3e7b516c4a2a07ebde1cca3';
export const particulateComparisonSource = Object.freeze({
  commit: 'c0ffd968e60754679f815f6c36d393794e25f858',
  tree: '776930688802bd6dd9cc05f255279dbfde1fd755',
  manifest: '792bd23362dfc2a64ffd31ccdfb06fe5ae00e6d763b53f8ee295e6fa4070d448',
  date: '2026-11-18',
});
export const particulateComparisonPredecessorPin = 'acfe4c53483c3018771be03ff3d678dd975c00a7ba0802edbee181ab82ee6531';
const addressPin = '0625ba192e2156004546fd9d55eb60f1d4bba2f7cf9f90d8965e6c94e4757306';
const sourceLayoutKey = 'B17:/docs/book/particulate-emissions-and-health:source';
const reversePremiseKey = 'B17:reverse-premise-consumers';
const reverseConceptKey = 'B17:reverse-concept-consumers';
const layoutKeys = new Set([sourceLayoutKey, reversePremiseKey, reverseConceptKey]);
const mdxPath = `content${particulateComparisonChapter}.mdx`;
const oldMdxSha = 'e8ece01c776fda8134fd3e0972f604f848cd12a75c41ed0ba7e3002decb18c26';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

const s1Ids = [
  'cl-particulate131-indicator-cutpoints',
  'cl-particulate131-size-and-subcompartment',
];
const s3Ids = [
  'cl-particulate131-cohen-gbd2015-scope',
  'cl-particulate131-cohen-empirical-limits',
];
const s4Ids = [
  'cl-particulate131-precursor-perspectives',
  'cl-particulate131-ef-ammonia-inversion',
  'cl-particulate131-regional-endpoint-reversal',
  'cl-particulate131-package-discrepancies',
];
const allAddedClaimIds = [...s1Ids, ...s3Ids, ...s4Ids];
const directPremiseConsumerIds = [
  'cl-particulate131-indicator-cutpoints',
  'cl-particulate131-size-and-subcompartment',
  'cl-particulate131-cohen-gbd2015-scope',
  'cl-particulate131-cohen-empirical-limits',
  'cl-particulate131-precursor-perspectives',
];
const expectedDescription = '从排放量算到人群吸入量、死亡或发病计数与潜在健康损害，辨明各体系的指标截点、前体开关、流行病学外推和发行包边界怎样影响比较。';

export function selectParticulateComparison(config, pin = particulateComparisonUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Particulate comparison requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== particulateComparisonId || !sameScienceValue(unit.source, particulateComparisonSource)
      || !sameScienceValue(unit.routes, [particulateComparisonChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unit.scope.every(scienceText) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || unit.layouts.length !== layoutKeys.size
      || !unique(unit.layouts, row => row?.key) || unit.layouts.some(row => !layoutKeys.has(row?.key))
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Particulate comparison requires an exact c0ffd968 predecessor and bounded B17 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Particulate comparison is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-18（细颗粒物单元）同载体另核§1表1–2印pp5–6与§3.4 Particulate matter/Respiratory inorganics印pp33–42（表8–11：结合欧洲RiskPoll Rabl & Spadaro 2004与美国Greco等2007源—受体模型的Level I中点kg PM2.5-eq/kg，以及基于Pope等2002与van Zelm等2008将初级颗粒物评为Level I、二次颗粒物评为Level II的DALY终点）',
  'src-kb44-ec2021':
    ' 2026-11-18（细颗粒物单元）同载体另核Annex I §3.2.3表2（OJ L 144/29：Particulate matter Level I中点Disease incidence与UNEP 2016模型）、Annex I表B.3（OJ L 144/156）与Annex III §3.2.3表2（OJ L 144/220）。',
  'src-fossil117-jrc109369':
    ' 2026-11-18（细颗粒物单元）同载体另核§2表1–2印pp6–8（含印p6脚注5明文记录将UNEP 2016原始单位Deaths纯文字改名为Disease incidences且未变数值，以及印p8表2自相矛盾印回EF - Respiratory inorganics; PM2.5 eq / Mass PM2.5-equivalents kg）与§4.4 Respiratory inorganics印p16。',
  'src-flow-pilot-ef31-update':
    '；2026-11-18（细颗粒物单元）同载体另核§2表1印p6、§4.2印p21与表10印p22（正文将颗粒物归一化基准变动归入small reduction 0.003%而表10印作正值0.0034%的正负方向冲突）及§5.1表13印p30（EF3.1第4与第5顺位重复印作608/608）',
  'src-land111-rivm2016':
    ' 2026-11-18（细颗粒物单元）同载体另核表1.4–1.5印pp20–22（含表1.5四舍五入6.3E-04）、第5章Fine particulate matter formation印pp47–50（§5.2–5.3及表5.1–5.3：20%排放扰动、I/H/E三视角前体开关、印p50 F_M→E分子误印Em_NOx,i及表5.3平等主义列漏印6.29×仅剩粗体10⁻⁴）与§16 S1印pp121–124（表S1.1–S1.2：56区域因子、欧亚对印度氨硫反转、新西兰与太平洋岛屿SO₂反超初级PM2.5达7.5倍与11.7/9.1倍、韩国对罗马尼亚中点—终点排序倒置及表S1.2首行全球加权均值PM2.5=629.2、SO₂=183.2、NH₃=149.2、NOx=70.1 yr/kton）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-18（细颗粒物单元）同载体另核§2.3印p140、§3.1.4与表1印pp140–141、表2印p143及§3.2.4印p144（概述ReCiPe 2016细颗粒物形成中点kg PM2.5-eq与人体健康终点DALY框架，并将各视角参数细则指向RIVM报告Huijbregts等2016）',
  'src-land111-lcimpact2020-article':
    ' 2026-11-18（细颗粒物单元）同载体另核§2.1–2.2印p3、表1与§2.4印p4、§2.7–2.8印p7及表3印p8（零中点架构、56世界区域与van Zelm等2016模型引用、心肺与肺癌死亡DALY/kg终点及certain仅初级PM2.5对all含SO₂/NH₃/NOx两套稳健度开关）。',
  'src-kb46-lcimpact2020':
    '；2026-11-18（细颗粒物单元）同载体另核总报告v1.0第6章§§6.2.1–6.2.2印pp60–61（TM5-FASST、≥30岁人口、日呼吸量13 m³/d即4745 m³/yr、Krewski等2009心肺RR=1.013与肺癌RR=1.014每µg/m³、WHO 2012区域DALY/例）、§6.4.2印p62与§6.5表6.2印p67（全球排放加权均值：certain初级PM2.5=6.29E-04，all增列SO₂=1.83E-04、NH₃=1.61E-04、NOx=7.62E-05 DALY/kg）',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-kb44-ec2021': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 2, artifacts: 14, sourceKeys: ['src-particulate131-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-lcimpact2020-article': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-kb46-lcimpact2020': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加选读§1表1–2（印pp5–6）与§3.4 Particulate matter/Respiratory inorganics（印pp33–42，表8–11），核实RiskPoll与Greco 2007 Level I中点（kg PM2.5-eq/kg）及Pope 2002 / van Zelm 2008初级颗粒物Level I、二次颗粒物Level II的DALY终点。',
  },
  'lit-n04': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读Annex I §3.2.3表2（OJ L 144/29）、表B.3（OJ L 144/156）与Annex III §3.2.3表2（OJ L 144/220），核实EF颗粒物Level I中点Disease incidence与UNEP 2016模型绑定。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读§2表1–2（印pp6–8，含印p6脚注5）与§4.4 Respiratory inorganics（印p16），完整保留将Deaths纯文字改名Disease incidences的官方说明及印p8表2印回PM2.5 eq（kg）的源内冲突。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读§2表1（印p6）、§4.2及表10（印pp21–22）与§5.1表13（印p30），完整保留正文small reduction（0.003%）与表10正值（0.0034%）方向冲突及表13（608/608）整列重复。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-particulate131-ef31-selected-members',
    limitation: '2026-11-18（细颗粒物单元）按已核中央目录与HTTP 206 + CRC32核查b5c602c6.xml（v02.00.011，983条因子）、源记录126c78f9、流属性01846770、12份粒径基本流XML及归一化/加权工作簿（NFs EF3.1、WFs与NFs EF3.1_calculation 15行颗粒物明细），确认零other/converter副本、粗颗粒PM2.5-10零因子、900条恒值location及52.0803%城市近地面氨配比。',
  },
  'lit-m05': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读表1.4–1.5（印pp20–22）、第5章Fine particulate matter formation（印pp47–50，§5.2–5.3及表5.1–5.3）与§16 S1（印pp121–124，表S1.1–S1.2），经页图视觉核实印p50分子Em_NOx,i笔误、表5.3平等主义漏印6.29×及56区域因子。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读§2.3（印p140）、§3.1.4与表1（印pp140–141）、表2（印p143）及§3.2.4（印p144），核对PMFP中点与DALY终点总体定义及对RIVM报告（Huijbregts等2016）的引用关系。',
  },
  'work-land111-lcimpact2020-article': {
    limitation: '2026-11-18（细颗粒物单元）同载体追加核读§2.1–2.2（印p3）、表1与§2.4（印p4）、§2.7–2.8（印p7）及表3（印p8），核对零中点架构、56世界区域与certain/all两档前体稳健度开关。',
  },
  'work-kb46-lcimpact2020': {
    limitation: '2026-11-18（细颗粒物单元）同哈希总报告v1.0载体追加核读第6章§§6.2.1–6.2.2（印pp60–61）、§6.4.2（印p62）与§6.5表6.2（印p67），核实TM5-FASST、≥30岁边界、Krewski 2009相对风险参数与全球加权平均终点因子。',
  },
  'work-kb46-cohen2017': {
    sourceId: 'src-particulate131-cohen2017',
    limitation: '2026-11-18（细颗粒物单元）获取并逐段核验Europe PMC开放获取JATS XML（PMC5439030，106319字节，SHA-256: 6ddb8ecf...），实读摘要、方法（印pp1908–1910）、结果及表1–2（印pp1910–1915）与讨论局限（印p1916）；GBD 2015外部补充附录PDF与STAN源码未核对。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  if (kind === 'claims') return allAddedClaimIds.includes(id);
  if (kind === 'evidence') return id.startsWith('ev-particulate131-');
  if (kind === 'sources') return ['src-particulate131-ef31-selected-members', 'src-particulate131-cohen2017'].includes(id);
  if (kind === 'readings') return id === 'rd-particulate131-cohen2017';
  if (kind === 'queries') return id === 'q-particulate131-cutpoints-cohen2017-precursors-and-ef31-20261118';
  if (kind === 'gaps') return id === 'gap-particulate131-prospective-abatement-and-speciated-toxicity';
  return kind === 'revisions' && id === 'rev-particulate131-b17-cross-system-and-cohen2017';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: particulateComparisonCheckDate },
    })) throw new Error(`Particulate comparison changed a previous source or its acquisition scope: ${id}`);
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
        || addedPassages.some(row => !row.id.startsWith('psg-particulate131-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-particulate131-'))
        || !sameScienceValue(current, expectedCurrent))
      throw new Error(`Particulate comparison changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: particulateComparisonCheckDate,
      limitations: [...work.limitations, spec.limitation],
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
    })) throw new Error(`Particulate comparison changed a previous bibliography record: ${id}`);
  }
}

function boundedOccurrences(previousMdx, actualMdx) {
  const oldDescLine = 'description: 从排放量算到人群吸入量和潜在健康损害，再看不同的暴露条件、响应参照和因子版本怎样影响比较。';
  const s1Old = '<Prose ids="cl-pm-opening cl-pm-particle-identity cl-pm-intake-definition cl-pm-intake-unit cl-pm-receptor-boundary cl-pm-effect-definition cl-pm-effect-default cl-pm-urban-health cl-pm-rural-health cl-pm-precursor-denominator cl-pm-precursor-health" />';
  const s1New = `<Prose ids="cl-pm-opening cl-pm-particle-identity cl-pm-intake-definition cl-pm-intake-unit cl-pm-receptor-boundary cl-pm-effect-definition cl-pm-effect-default cl-pm-urban-health cl-pm-rural-health cl-pm-precursor-denominator cl-pm-precursor-health ${s1Ids.join(' ')}" />`;
  const s3Old = '<Prose ids="cl-pm-nonlinear-response cl-pm-risk-reference cl-pm-slope-meaning cl-pm-finite-change cl-pm-ier-evidence cl-pm-gemm-alternative cl-pm-chemistry-background cl-pm-chemistry-perturbation" />';
  const s3New = `<Prose ids="cl-pm-nonlinear-response cl-pm-risk-reference cl-pm-slope-meaning cl-pm-finite-change cl-pm-ier-evidence cl-pm-gemm-alternative ${s3Ids.join(' ')} cl-pm-chemistry-background cl-pm-chemistry-perturbation" />`;
  const s4Old = '<Prose ids="cl-pm-concentration-route cl-pm-regional-summary cl-pm-factor-order cl-pm-version-and-model cl-pm-matched-scope cl-pm-matched-scenario cl-pm-uncovered-pathways cl-pm-population-meaning cl-pm-conclusion" />';
  const s4New = `<Prose ids="cl-pm-concentration-route cl-pm-regional-summary cl-pm-factor-order cl-pm-version-and-model cl-pm-matched-scope cl-pm-matched-scenario cl-pm-uncovered-pathways ${s4Ids.join(' ')} cl-pm-population-meaning cl-pm-conclusion" />`;

  if (!previousMdx.includes(oldDescLine) || !previousMdx.includes(s1Old) || !previousMdx.includes(s3Old) || !previousMdx.includes(s4Old))
    throw new Error('Particulate comparison predecessor B17 MDX lacks expected anchor lines');

  const expected = previousMdx
    .replace(oldDescLine, () => `description: ${expectedDescription}`)
    .replace(s1Old, () => s1New)
    .replace(s3Old, () => s3New)
    .replace(s4Old, () => s4New);
  if (expected !== actualMdx)
    throw new Error('Particulate comparison changed protected B17 text or its scoped additions');
  return allAddedClaimIds;
}

export function particulateComparisonLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  const row = unit.layouts.find(item => item.key === key);
  if (key === reversePremiseKey) {
    const expected = [...accepted, ...directPremiseConsumerIds];
    if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale) || !sameScienceValue(row.to, expected))
      throw new Error('Particulate comparison lacks the exact B17 direct-premise consumer review');
    return row.to;
  }
  if (key === reverseConceptKey) {
    const expected = [...accepted, ...allAddedClaimIds];
    if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale) || !sameScienceValue(row.to, expected))
      throw new Error('Particulate comparison lacks the exact B17 shared-concept consumer review');
    return row.to;
  }
  const expectedBlocks = accepted.blocks.map((block, index) => {
    if (index === 1 && block.kind === 'claims') return { kind: 'claims', ids: [...block.ids, ...s1Ids] };
    if (index === 6 && block.kind === 'claims') {
      const i = block.ids.indexOf('cl-pm-gemm-alternative');
      if (i < 0) throw new Error('Particulate comparison accepted B17 block lacks cl-pm-gemm-alternative anchor');
      return { kind: 'claims', ids: [...block.ids.slice(0, i + 1), ...s3Ids, ...block.ids.slice(i + 1)] };
    }
    if (index === 9 && block.kind === 'claims') {
      const i = block.ids.indexOf('cl-pm-uncovered-pathways');
      if (i < 0) throw new Error('Particulate comparison accepted B17 block lacks cl-pm-uncovered-pathways anchor');
      return { kind: 'claims', ids: [...block.ids.slice(0, i + 1), ...s4Ids, ...block.ids.slice(i + 1)] };
    }
    return block;
  });
  const approved = {
    route: accepted.route,
    title: accepted.title,
    description: expectedDescription,
    mdxSha256: row?.to?.mdxSha256,
    blocks: expectedBlocks,
  };
  if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale) || !scienceDigest(row?.to?.mdxSha256)
      || /[\r\n<>]/.test(row?.to?.description ?? '')
      || sameScienceValue(row.to, accepted) || !sameScienceValue(row.to, approved))
    throw new Error('Particulate comparison can change only its reviewed B17 description and exact 45-claim block order');
  return row.to;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Particulate comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Particulate comparison inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Particulate comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

const ordinaryLink = /\[([^\]\n]+)\]\((\/[^)\s]+)\)/g;
function inspectB17Mdx(route, source) {
  const raw = source.replaceAll('\r\n', '\n');
  const front = /^---\ntitle: ([^\n]+)\ndescription: ([^\n]+)\n---\n/.exec(raw);
  if (!front || /[\r\n<>]/.test(front[2])) throw new Error(`Particulate comparison invalid B17 frontmatter: ${route}`);
  const blocks = raw.slice(front[0].length).trim().split(/\n[ \t]*\n/).map(block => {
    const heading = /^## (.+)$/.exec(block);
    if (heading) {
      const explicit = /^(.*?) \[#([^\]]+)\]$/.exec(heading[1]);
      return { kind: 'section', id: explicit?.[2] ?? heading[1], title: explicit?.[1] ?? heading[1] };
    }
    if (/^<Prose ids="[^"\n]+" \/>$/.test(block)) return { kind: 'claims', ids: collectChapterClaimOccurrences(block) };
    const links = [...block.matchAll(ordinaryLink)].map(([, label, href]) => ({ href, label }));
    const text = block.replace(ordinaryLink, '$1');
    if (!links.length || /[\n<>\[\]`*_]/.test(text)) throw new Error(`Particulate comparison unsupported ordinary block: ${route}`);
    return { kind: 'navigation', text, links };
  });
  return { route, title: front[1], description: front[2], mdxSha256: sha256(raw), blocks };
}

/** Restore the physical B17 file and raw publication records before the #129 verifier. */
export function prepareParticulateComparisonSource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Particulate comparison must not declare an unreviewed prior-claim correction');
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Particulate comparison lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Particulate comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Particulate comparison lacks independently preserved predecessor B17 MDX bytes');

  const actualMdx = files.get(mdxPath).toString();
  const added = boundedOccurrences(unit.previousMdx, actualMdx);
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Particulate comparison lacks exact B17 occurrences for each new canonical claim');

  const baseSourceLayout = {
    ...inspectB17Mdx(particulateComparisonChapter, unit.previousMdx),
    mdxSha256: '0969b59a89a4a2ae4a1532255cc8c8c243797cb853d997c4000dd67f74e22269',
  };
  const actualSourceLayout = inspectB17Mdx(particulateComparisonChapter, actualMdx);
  if (!sameScienceValue(particulateComparisonLayout(unit, sourceLayoutKey, baseSourceLayout), actualSourceLayout))
    throw new Error('Particulate comparison source layout does not match actual B17 MDX inspection');
  particulateComparisonLayout(unit, reversePremiseKey, []);
  const baseReverseConcepts = [
    'cl-lcia-endpoint-units',
    'cl-lcia-mid-end-conversion-limits',
    'cl-usetox-fate-exposure-effect',
    'cl-usetox-indicators-not-observed-cases',
    'cl-lime-units',
    'cl-rule-why-chain',
    'cl-rule-results-layer',
    'cl-rule-reconstruction-limit',
    'cl-rule-evidence-judgment',
    'cl-native-preservation-meaning',
    'cl-tox123-midpoint-families',
    'cl-tox123-hc20-and-metals',
    'cl-tox123-perspective-switches',
    'cl-tox123-nickel-dcb-reversal',
    'cl-tox123-speciation-and-proxies',
    'cl-tox123-normative-zeros',
    'cl-tox123-package-discrepancies',
    'cl-tox123-cross-system-synthesis',
  ];
  particulateComparisonLayout(unit, reverseConceptKey, baseReverseConcepts);

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateParticulateComparisonFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== particulateComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== particulateComparisonPredecessorPin)
    throw new Error('Particulate comparison did not recover the independently observed raw c0ffd968 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Particulate comparison actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Particulate comparison lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveParticulateComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, particulateComparison: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== particulateComparisonCapturePin) return false;
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

export function verifyParticulateComparisonReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${particulateComparisonId}/${row.kind}`;
    if (row.date < particulateComparisonCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function particulateComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== particulateComparisonChapter || ![0, 1, 2, 3].includes(index)) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-particulate-131-ordinary-${index}`;
}

export function particulateComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-particulate-131-ordinary-[0-3]$/;
export function observeParticulateComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyParticulateComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeParticulateComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Particulate comparison', routes: [particulateComparisonChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: particulateComparisonHistoryControls(unit), source: particulateComparisonSource, attribute: 'particulate-comparison',
    ordinaryPattern, label: 'Particulate comparison', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Particulate comparison actual versioned description differs');
  return { prior, errors };
}

export function particulateComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
