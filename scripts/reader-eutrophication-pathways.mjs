import { validateEutrophicationPathwaysFactors } from './reader-eutrophication-pathways-factors.mjs';
import capture from '../config/reader-eutrophication-pathways-capture.json' with { type: 'json' };
import { acidEquivalentsHistoryControls, observeAcidEquivalentsOrdinaryTargets } from './reader-acid-equivalents.mjs';
import { photochemicalOzoneHistoryControls } from './reader-photochemical-ozone.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const eutrophicationPathwaysId = 'eutrophication-pathways-129';
export const eutrophicationPathwaysChapter = '/docs/book/acidification-and-nutrient-pathways';
export const eutrophicationPathwaysCheckDate = '2026-11-18';
/** @type {string|null} */
export const eutrophicationPathwaysUnitPin = 'ec31ab8714beb0973fffdd9ede90e79a4e4e36740891177c98c41915fcdfb507';
/** @type {string|null} */
export const eutrophicationPathwaysCapturePin = 'e68938ca1d64b6deea1aa1a67c275ae470f8fe0171ad44afe700a14eefed9def';
export const eutrophicationPathwaysSource = Object.freeze({
  commit: '8fcb2485b97a1476896549806740a030b637d00b',
  tree: '937af6492b7d4ecc615d3226b98de564bd56110e',
  manifest: 'e9408bfc7d4a43414ac6547af5be5c74591bb94588474289f829e41619b3db91',
  date: '2026-11-17',
});
export const eutrophicationPathwaysPredecessorPin = '844fa83c2c79de48651279e237996f5e57e132bcb8abbef2faf88c11882b644d';
const addressPin = 'd0f773356503198f7995235b12bf390550755207fb6712be7d9233ac3598a03c';
const mdxPath = `content${eutrophicationPathwaysChapter}.mdx`;
const oldMdxSha = 'c356117fe53d98c9b3c116e09d4c3a315973d3a6b6b61abde9846fa07c923984';
const ordinaryPattern = /-acid-113-ordinary-0$/;
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectEutrophicationPathways(config, pin = eutrophicationPathwaysUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Eutrophication pathways requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== eutrophicationPathwaysId || !sameScienceValue(unit.source, eutrophicationPathwaysSource)
      || !sameScienceValue(unit.routes, [eutrophicationPathwaysChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Eutrophication pathways requires an exact 8fcb2485 predecessor and bounded B16 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Eutrophication pathways is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-18（营养富集单元）同载体另核§1表1–2印pp5–6、§3.8富营养化印pp65–77（表18–19：陆地AE mol N eq、淡水与海洋EUTREND Struijs等2009 kg P eq与kg N eq三项Level II中点，终点正式推荐数为0且仅列早期ReCiPe淡水为interim）及§5 Annex 1印p124',
  'src-book-unep-glam-2019-volume2':
    '；2026-11-18（营养富集单元）同载体另核第3章印pp60、62–66、68–70（§§3.2.2、3.4、3.5.1–3.5.2、3.5.4、3.6.2–3.6.3及表3.1–3.2：仅设淡水kg P-eq / PDF·m³·yr与近岸海洋kg N-eq / PDF·m³·yr两类富营养化而不单设陆地富营养化，印p68规定背景农业Tier 1总磷施用量10%缺省入水损失比例）',
  'src-kb44-ec2021':
    ' 2026-11-18（营养富集单元）同载体另核Annex I §3.2.3表2（OJ L 144/29–30：陆地、淡水、海洋富营养化三项Level II中点定义）与§4.4.1.5（OJ L 144/37–39表3–4：农田施磷已知径流记water、未知径流记soil并由土壤因子内含径流，明令禁止将农田氮排放建作排入soil，规定Tier 1按0.022 kg N₂O/kg N入空气、合成氮肥0.12与粪肥0.24 kg NH₃/kg N入空气、1.33 kg NO₃⁻/kg N入水及表4替代氮平衡参数）。',
  'src-fossil117-jrc109369':
    ' 2026-11-18（营养富集单元）同载体另核§2表1–2印pp6–8及§4.8印pp20–21（表7及*、**注：EF沿用ILCD三项富营养化模型，将未指定水体因子近似复制给淡水与海水而未计内陆河流输海衰减，说明P₂O₅未建独立流须按磷含量折算为总磷，排除铁及COD/BOD）。',
  'src-flow-pilot-ef31-update':
    '；2026-11-18（营养富集单元）同载体另核§2表1印pp6–7、§4.2表10印p22（陆地1.77E+02 mol N eq/人、淡水1.61E+00 kg P eq/人、海洋1.95E+01 kg N eq/人三项归一化基准较EF 3.0变动均为0%）及§5.1表13印p30（EF3.1第5顺位整列与第4顺位完全重复印作152/152、8/8、201/201的排版异文）',
  'src-land111-rivm2016':
    ' 2026-11-18（营养富集单元）同载体另核表1.4–1.5印pp20–22、第8章Freshwater eutrophication印pp61–64（表8.1–8.2：因缺乏终点模型排除海洋富营养化且无独立陆地富营养化、全球淡水磷停留时间85天即0.23年、农田土壤磷0.1与磷酸根0.033、§8.3印p62将五氧化二磷P₂O₅淡水FEP漏乘2印成0.22 kg P-eq/kg，以及三视角恒定终点转换系数6.1E-07 species·yr/kg P-eq）与§19 S4印p149（表S4.1–S4.2：将对数半数效应参数α表头单位误印为[PDF·L/mg]）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-18（营养富集单元）同载体另核表1印p141、§3.1.7印p142、表2印p143及§4.4 Missing pathways与§5印p145（确认ReCiPe 2016仅含淡水富营养化1项营养富集类别并将海洋富营养化列入缺失路径）',
  'src-land111-lcimpact2020-article':
    ' 2026-11-18（营养富集单元）同载体另核§2.1印p3、表2印p5、§2.5与§2.7印pp6–7及表3印p9（零中点架构下仅设淡水鱼类丰富度与近海6类底栖/游泳动物低氧两项全球灭绝PDF·yr水体富营养化终点，无陆地富营养化且时间跨度均为不适用）。',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-unep-glam-2019-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-kb44-ec2021': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 2, artifacts: 20, sourceKeys: ['src-eutro129-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-lcimpact2020-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-18（营养富集单元）同载体追加选读§1表1–2（印pp5–6）、§3.8富营养化（印pp65–77，表18–19）与§5 Annex 1（印p124），核实陆地AE（mol N eq）与淡水、海洋EUTREND（kg P eq、kg N eq）三项Level II中点及零正式推荐终点（仅早期ReCiPe淡水列为interim）。',
  },
  'work-unep-glam-2019-volume2': {
    limitation: '2026-11-18（营养富集单元）同载体追加核读第3章§§3.2.2、3.4、3.5.1–3.5.2、3.5.4、3.6.2–3.6.3及表3.1–3.2（印pp60、62–66、68–70），核实仅含淡水与近岸海洋两类富营养化及背景农业Tier 1总磷10%缺省入水损失比例。',
  },
  'lit-n04': {
    limitation: '2026-11-18（营养富集单元）同载体追加核读Annex I §3.2.3表2（OJ L 144/29–30）与§4.4.1.5（OJ L 144/37–39表3–4），核实农田施磷water与soil互斥规则、禁止将氮建作排入soil及Tier 1气水拆分系数（0.022 kg N₂O、0.12/0.24 kg NH₃、1.33 kg NO₃⁻）。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-18（营养富集单元）同载体追加核查§2表1–2（印pp6–8）与§4.8表7及注释（印pp20–21），核实EF水体富营养化将未指定水体因子近似复制给淡水与海水、P₂O₅须按磷含量折算为总磷及排除COD/BOD与铁。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-18（营养富集单元）同载体追加核查§2表1（印pp6–7）、§4.2表10（印p22，三项富营养化NF变动0%）与§5.1表13（印p30，EF3.1第4与第5顺位整列重复印作152/152、8/8、201/201）。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-eutro129-ef31-selected-members',
    limitation: '2026-11-18（营养富集单元）另按同一中央目录与HTTP 206范围核查新增20份涉氮磷XML成员（淡水富营养化b53ec18f、源记录e58cd71d与58bc3cfd及17份磷氮水／土基本流XML，连同已登记b5c619fa、b5c614d2与Normalisation_Weighting_Factors_EF_3.1.xlsx等共26份），核实三份富营养化XML无converter副本、零土壤氮流、河海1:1因子、540条恒值location、通用NOx=4.26高于全部36国及NF工作簿农业磷氮双重计算。',
  },
  'lit-m05': {
    limitation: '2026-11-18（营养富集单元）同SHA原2016-0104载体追加核读表1.4–1.5（印pp20–22）、第8章Freshwater eutrophication（印pp61–64，表8.1–8.2）与§19 S4（印p149，表S4.1–S4.2），核实排除海洋富营养化、全球淡水磷停留85天、农田土壤0.1、恒定终点转换系数6.1E-07，并保留§8.3印p62五氧化二磷0.22漏乘2与表S4.2印p149单位[PDF·L/mg]异文。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-18（营养富集单元）同SHA期刊PDF追加核对表1（印p141）、§3.1.7（印p142）、表2（印p143）及§4.4与§5（印p145）对单一淡水富营养化路径及海洋富营养化列为缺失路径的说明。',
  },
  'work-land111-lcimpact2020-article': {
    limitation: '2026-11-18（营养富集单元）同SHA期刊PDF追加核读§2.1（印p3）、表2（印p5）、§2.5与§2.7（印pp6–7）及表3（印p9）对淡水鱼类与海洋低氧两项全球灭绝PDF·yr终点的综述。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-eutro129-', evidence: 'ev-eutro129-', sources: 'src-eutro129-',
    readings: 'rd-eutro129-', literature: 'work-eutro129-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-eutro129-eutrophication-interfaces-stoichiometry-and-packages-20261118';
  if (kind === 'gaps') return id === 'gap-eutro129-watershed-hydrodynamics-and-grid-rasters';
  return kind === 'revisions' && id === 'rev-eutro129-b16-eutrophication-and-field-interfaces';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: eutrophicationPathwaysCheckDate },
    })) throw new Error(`Eutrophication pathways changed a previous source or its acquisition scope: ${id}`);
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
        || addedPassages.some(row => !row.id.startsWith('psg-eutro129-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-eutro129-'))
        || !sameScienceValue(current, expectedCurrent))
      throw new Error(`Eutrophication pathways changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: eutrophicationPathwaysCheckDate,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Eutrophication pathways changed a previous work or its acquisition history: ${id}`);
  }
}

const addedClaimNames = [
  'category-genealogy',
  'phosphorus-soil-water-interface',
  'phosphorus-stoichiometry-and-p2o5',
  'nitrogen-soil-prohibition',
  'aquatic-and-airborne-n-reversals',
  'location-copies-and-nox-inversion',
  'normalization-double-counting-and-xml-anomalies',
  'operational-synthesis',
];

function boundedOccurrences(previousMdx, actualMdx) {
  const ids = addedClaimNames.map(name => 'cl-eutro129-' + name);
  const target = '<Prose ids="cl-path-operation cl-path-operation-indicator" />';
  if (!previousMdx.includes(target))
    throw new Error('Eutrophication pathways missing cl-path-operation-indicator anchor in predecessor B16 MDX');
  const expected = previousMdx.replace(
    target,
    () => `${target}\n\n<Prose ids="${ids.join(' ')}" />`,
  );
  if (expected !== actualMdx)
    throw new Error('Eutrophication pathways changed protected B16 text or moved its single §4 addition');
  return ids;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Eutrophication pathways missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Eutrophication pathways inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Eutrophication pathways declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B16 file and raw publication records before the #127 verifier. */
export function prepareEutrophicationPathwaysSource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Eutrophication pathways must not declare an unreviewed prior-claim correction');
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Eutrophication pathways lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Eutrophication pathways cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Eutrophication pathways lacks independently preserved predecessor B16 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Eutrophication pathways lacks exact B16 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateEutrophicationPathwaysFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== eutrophicationPathwaysPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== eutrophicationPathwaysPredecessorPin)
    throw new Error('Eutrophication pathways did not recover the independently observed raw 8fcb2485 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Eutrophication pathways actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Eutrophication pathways lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveEutrophicationPathways(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, eutrophicationPathways: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== eutrophicationPathwaysCapturePin) return false;
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

export function verifyEutrophicationPathwaysReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${eutrophicationPathwaysId}/${row.kind}`;
    if (row.date < eutrophicationPathwaysCheckDate || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function eutrophicationPathwaysHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

export function qualifyEutrophicationPathwaysHistory(documents, unit, actual, photochemicalOzone, acidEquivalents) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeAcidEquivalentsOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Eutrophication pathways', routes: [eutrophicationPathwaysChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: eutrophicationPathwaysHistoryControls(unit), source: eutrophicationPathwaysSource, attribute: 'eutrophication-pathways',
    previousHistory: [
      { attribute: 'photochemical-ozone', expected: photochemicalOzoneHistoryControls(photochemicalOzone) },
      { attribute: 'acid-equivalents', expected: acidEquivalentsHistoryControls(acidEquivalents) },
    ],
    ordinaryPattern, label: 'Eutrophication pathways', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Eutrophication pathways actual versioned description differs');
  return { prior, errors };
}

export function eutrophicationPathwaysPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
