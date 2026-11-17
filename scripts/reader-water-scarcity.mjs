import { validateWaterScarcityFactors } from './reader-water-scarcity-factors.mjs';
import capture from '../config/reader-water-scarcity-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const waterScarcityId = 'water-scarcity-125';
export const waterScarcityChapter = '/docs/book/water-scarcity-and-reference';
/** @type {string|null} */
export const waterScarcityUnitPin = '3ce74b2c68df95c65e86c6856e0bdd6c3e5c57d7bf2f4bb4b85aa2dc4f11a967';
/** @type {string|null} */
export const waterScarcityCapturePin = 'e8c0284775c6907218bf7c1aec70e68d8c6fe17038844541c30db1e517671225';
export const waterScarcitySource = Object.freeze({
  commit: '9486bae9a7901da6a6d720b2320f9f793298ef27', tree: 'd21037ebc4e9269329f26fa68d7eb3b3cf4a19f3',
  manifest: '918ccb6da266e6ad3bd1b0f11b1cb7c1d2b7d9e72261f9f8cc6487c1cb8f27d2', date: '2026-11-17',
});
export const waterScarcityPredecessorPin = '0f9e2c482bc7430df531bfa415c7988211680adae07fcda8709958fea14e33e8';
const addressPin = '9ee6976b3ff42334543bb59667acff603c16451c1644c87c07749bb1ced15b86';
const mdxPath = `content${waterScarcityChapter}.mdx`;
const oldMdxSha = '8ae52be3d2f1e416c24397cfdab6750474141fefa33897b96d717031055bdcff';
const oldDescLine = 'description: 以两处耗水为例，说明同样的耗水体积为何可能对应不同的缺水潜势。';
const sectionMarkers = ['剩余量之前先读输入口径', '结果怎样保留它的含义'];
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectWaterScarcity(config, pin = waterScarcityUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Water scarcity requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== waterScarcityId || !sameScienceValue(unit.source, waterScarcitySource)
      || !sameScienceValue(unit.routes, [waterScarcityChapter]) || !scienceText(unit.rationale)
      || !scienceText(unit.description) || /[\r\n]/.test(unit.description)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Water scarcity requires an exact 9486bae9 predecessor and bounded B18 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Water scarcity is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-17同载体另核§1表1–2印pp5–6、§3.11印pp92–95与97、100–101（图12、表26–27：水资源耗竭归为第3类，否定仅累加升数的MEEuP与不反映稀缺的自然环境累积㶲提取法CEENE，推荐区分6级区域缺水的瑞士生态稀缺法Swiss Ecoscarcity水模型获Level III，且明确声明未评估任何水资源终点模型）及§6.11印p133',
  'src-fossil117-jrc109369':
    ' 2026-11-17同载体另核§2表1–2印pp7–8（将缺水潜势印成kg world eq. deprived与Units of mass (kg)并附注10说明原方法为立方米）及§4.11印p25（由Swiss Ecoscarcity改采AWARE、列出7种分辨率但规定PEF/OEF默认仅用国家尺度时空平均因子、仅表征蓝水取退差并排除绿水、雨水、海水与化石水）。',
  'src-flow-pilot-ef31-update':
    '；2026-11-17同载体另核§2表1印p7（Water use单位改印m3 world eq. deprived water）、§4.2表10印p23（全球人均归一化基准在EF 3.0与EF 3.1同为1.15E+04 m3 water eq. of deprived water/person，变动0%）、§5.1印p24（表11：2752个EF官方数据集定义）及§5.1.2表13印p30（2752个EF官方数据集中以水使用为首要影响类别的数据集由125个变为121个）',
  'src-land111-rivm2016':
    ' 2026-11-17同载体另核表1.3–1.5印pp19–22、第10章Water use印pp73–80（图10.1–10.4、表10.1–10.6及印pp74、77、78表号与需水量异文）、参考文献印pp113与115（Goedkoop等2009、Hanafiah等2011及Nemani等2003年1982–1999全球陆地NPP、Pfister等2009）及支撑信息§21 S6印pp163–173（表S6.1农业需水折算比、表S6.2按英文首字母排序前52行Afghanistan–Ethiopia未错位WSI与健康因子及印pp167–169第53行Fiji起的整段列行错位损坏、表S6.3陆地与水生生态因子）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-17同载体另核§1印p139、§2.1印p139、表1印p141、§3.1.9印p142、表2印p143及§3.2.9印p144对耗水中点WCP（m3耗水/m3取水）及营养不良、陆地维管植物NPP与河口淡水鱼类三条新增损害路径的概括',
  'src-land111-lcimpact2020-article':
    ' 2026-11-17同载体另核§§2.1–2.8印pp3–10（表1–3：无中点架构、11050个流域健康损害印Average而§2.3正文说明同时提供average/linear与marginal两套因子、0.05°×0.05°湿地动植物各50%权重与IUCN脆弱性全球灭绝风险PDF·yr/m3及表3确定性影响排除地下水湿地损害）、§3.1印p11与§§4.1–4.2印pp14–15。',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 1, artifacts: 15, sourceKeys: ['src-water125-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 3, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-lcimpact2020-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-17同载体追加选读§1表1–2（印pp5–6）、§3.11水资源耗竭（印pp92–95、97、100–101，图12、表26–27）与§6.11（印p133），核实Swiss Ecoscarcity六级区域缺水中点获Level III推荐、MEEuP与自然环境累积㶲提取法CEENE因不反映稀缺落选及未评估任何水资源终点模型，不声称核读德文Ökofaktoren 2006原表。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-17同载体追加核查§2表1–2（印pp7–8及注10）与§4.11（印p25），核实EF改采AWARE国家尺度默认蓝水耗水因子并保留表1–2“kg world eq. deprived / Units of mass (kg)”印刷异文。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-17同载体追加核查§2表1（印p7）、§4.2表10（印p23，全球水使用归一化基准维持1.15E+04不变）、§5.1（印p24，2752个EF官方数据集总量）与§5.1.2表13（印p30，水使用居首由125变121）。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-water125-ef31-selected-members',
    limitation: '2026-11-17另按同一中央目录与HTTP 206范围核查Water use方法XML（b2ad66ce，确认全包唯一而无other/converter副本）、Volume流属性（93a60a56）、Units of volume单位组（93a60a57）、源记录（6b126a5e）及全部11份涉水基本流XML共15份成员，完整保留全局默认项未指明水体退水-42.955不对称、GL=0.00越界与inventoryItems=36声明，未重跑AWARE原生栅格工作簿。',
  },
  'lit-m05': {
    limitation: '2026-11-17同SHA原2016-0104载体追加核读表1.3–1.5（印pp18–22）、第10章Water use（印pp73–80，表10.1–10.6）、印pp113与115参考文献及§21 S6（印pp163–173，表S6.1–S6.3），严格限定仅引用表S6.2按英文首字母排序前52行（Afghanistan–Ethiopia）未错位数据并公开预警印pp167–169自第53行Fiji起的列行错位损坏，不猜测受损行原始电子表格值。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-17同SHA期刊PDF追加核对§1与§2.1（印p139）、表1（印p141）、§3.1.9（印p142）、表2（印p143）及§3.2.9（印p144）对WCP耗水中点与三条新增水损害路径的定性说明。',
  },
  'work-land111-lcimpact2020-article': {
    limitation: '2026-11-17同SHA期刊PDF追加核读§§2.1–2.8与表1–3（印pp3–10）、§3.1（印p11）及§§4.1–4.2（印pp14–15），核实无中点损害架构、11050流域健康损害表1印Average与§2.3提供双套因子的表文张力及表3湿地确定性影响排除地下水耗水的分级边界，未下载Zenodo因子压缩包。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-water125-', evidence: 'ev-water125-', sources: 'src-water125-',
    readings: 'rd-water125-', literature: 'work-water125-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-water125-scarcity-accounting-perspectives-and-packages-20261117';
  if (kind === 'gaps') return id === 'gap-water125-hydrological-grids-and-recipe-spreadsheets';
  return kind === 'revisions' && id === 'rev-water125-b18-water-scarcity-comparison';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: waterScarcitySource.date },
    })) throw new Error(`Water scarcity changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-water125-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-water125-'))
        || !sameScienceValue(current, {
          ...reading,
          artifacts: [...reading.artifacts, ...addedArtifacts],
          passages: [...reading.passages, ...addedPassages],
          sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys],
        }))
      throw new Error(`Water scarcity changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: waterScarcitySource.date,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Water scarcity changed a previous work or its acquisition history: ${id}`);
  }
}

const s1Ids = ['cl-water125-method-genealogy', 'cl-water125-withdrawal-return-accounting'];
const s2Ids = ['cl-water125-ef-country-resolution-and-climates', 'cl-water125-value-choices-and-denominator-paradox'];
const s4aIds = ['cl-water125-country-rank-reversals', 'cl-water125-belgium-canada-mechanism-contrast'];
const s4bIds = ['cl-water125-package-report-discrepancies', 'cl-water125-diagnostic-synthesis'];

function boundedOccurrences(previousMdx, actualMdx, expectedDescription) {
  const s1Target = '<Prose ids="cl-water-remaining-mechanism cl-water-input-basis cl-water-net-gross-meaning" />';
  const s2Target = '<Prose ids="cl-water-reference-period cl-water-reference-and-units cl-water-time-and-aggregation cl-water-background-inventory cl-water-marginal-contexts" />';
  const s4aTarget = '<Prose ids="cl-water-case-locality cl-water-case-averaging cl-water-case-weighted-factor" />';
  const s4bTarget = '<Prose ids="cl-water-version-and-boundary cl-water-conclusion" />';
  if (!scienceText(expectedDescription) || /[\r\n]/.test(expectedDescription) || !previousMdx.includes(oldDescLine)
      || expectedDescription === oldDescLine.slice('description: '.length))
    throw new Error('Water scarcity lacks the exact predecessor B18 frontmatter description');
  const expected = previousMdx
    .replace(oldDescLine, () => `description: ${expectedDescription}`)
    .replace(s1Target, () => `${s1Target}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
    .replace(s2Target, () => `${s2Target}\n\n<Prose ids="${s2Ids.join(' ')}" />`)
    .replace(s4aTarget, () => `${s4aTarget}\n\n<Prose ids="${s4aIds.join(' ')}" />`)
    .replace(
      s4bTarget,
      () => `<Prose ids="cl-water-version-and-boundary" />\n\n<Prose ids="${s4bIds.join(' ')}" />\n\n<Prose ids="cl-water-conclusion" />`,
    );
  if (expected !== actualMdx)
    throw new Error('Water scarcity changed protected B18 text or its four scoped additions');
  return [...s1Ids, ...s2Ids, ...s4aIds, ...s4bIds];
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Water scarcity missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Water scarcity inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Water scarcity declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B18 file and raw publication records before the #123 verifier. */
export function prepareWaterScarcitySource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Water scarcity must not declare an unreviewed prior-claim correction');
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Water scarcity lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Water scarcity cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Water scarcity lacks independently preserved predecessor B18 MDX bytes');

  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString(), unit.description);
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Water scarcity lacks exact B18 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateWaterScarcityFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== waterScarcityPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== waterScarcityPredecessorPin)
    throw new Error('Water scarcity did not recover the independently observed raw 9486bae9 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Water scarcity actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Water scarcity lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveWaterScarcity(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, waterScarcity: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== waterScarcityCapturePin) return false;
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

export function verifyWaterScarcityReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${waterScarcityId}/${row.kind}`;
    if (row.date < waterScarcitySource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function waterScarcityOrdinaryId(unit, route, print, index) {
  if (!unit || route !== waterScarcityChapter || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-water-125-ordinary-0`;
}

export function waterScarcityHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = sectionMarkers.find(m => row.address.endsWith(`#${m}`) || row.address.endsWith(`-${m}`));
    return [row.address, { ...row, previous: marker ? { ...previous, title: marker } : previous }];
  })));
}

const ordinaryPattern = /-water-125-ordinary-0$/;
export function observeWaterScarcityOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyWaterScarcityHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeWaterScarcityOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Water scarcity', routes: [waterScarcityChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: waterScarcityHistoryControls(unit), source: waterScarcitySource, attribute: 'water-scarcity',
    ordinaryPattern, label: 'Water scarcity', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Water scarcity actual versioned description differs');
  return { prior, errors };
}

export function waterScarcityPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
