import { validateToxicityComparisonFactors } from './reader-toxicity-comparison-factors.mjs';
import capture from '../config/reader-toxicity-comparison-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryOrdinaryDigest, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const toxicityComparisonId = 'toxicity-comparison-123';
export const toxicityComparisonChapter = '/docs/book/usetox-pathways-and-boundaries';
/** @type {string|null} */
export const toxicityComparisonUnitPin = 'c65a21d44716e7bd6ba67e1901c2edab424948dc56ce8b08dae06b5e1818884f';
/** @type {string|null} */
export const toxicityComparisonCapturePin = '8f1629f34e003b090aee993abf1a70fb5a0ef151fb4c8ff9f8fda54eff5e0a7b';
export const toxicityComparisonSource = Object.freeze({
  commit: '2eba26c6503e4fd3cb75fa6f00a2a3c202697ddb', tree: 'aa254d3f7eb4d98d89c0330bef8548340149e4b0',
  manifest: '58d9d0fe851c7c5c6c330872c92b1acdba0e6fae7439a5a8b96bfd7ec54dd073', date: '2026-11-17',
});
export const toxicityComparisonPredecessorPin = '6896cffe7fc512c152b588a0f97d836a0cc971fc88d7cbb3ecf15fad776d402e';
const addressPin = 'c351aecae8a899b55559c3654310639293a552fcb7a5d07d831b126ef1620d31';
const layoutKey = 'B19:reader-source';
const reverseConceptKey = 'B17:reverse-concept-consumers';
const layoutKeys = new Set([layoutKey, reverseConceptKey]);
const mdxPath = `content${toxicityComparisonChapter}.mdx`;
const oldMdxSha = '4fda754b65812d8ebfababca222ed63ba078ad20c60bd85d1a7e7afdeed97537';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectToxicityComparison(config, pin = toxicityComparisonUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Toxicity comparison requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== toxicityComparisonId || !sameScienceValue(unit.source, toxicityComparisonSource)
      || !sameScienceValue(unit.routes, [toxicityComparisonChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || unit.layouts.length !== layoutKeys.size
      || !unique(unit.layouts, row => row.key) || unit.layouts.some(row => !layoutKeys.has(row?.key))
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Toxicity comparison requires an exact 2eba26c6 predecessor and bounded B19 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Toxicity comparison is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations':
    '；2026-11-17同载体另核§1表1–2印pp5–6、§3.3印pp25–33人体毒性（表6–7）及§3.9印pp78–84生态毒性（表20–22：淡水USEtox获Level II/III推荐、表20–21载明ReCiPe采用USES-LCA 2.0并以急性EC50为基础而TRACI采用NOEC、陆地与海洋不推荐、终点仅致癌DALY对有机物列Level II而对金属等列interim）',
  'src-fossil117-jrc109369':
    ' 2026-11-17同载体另核§2表1–2印pp6与8、§3.4印p10长时标毒性排放置零及§4.3印pp14–15金属价态赋值（含Sb(+6)印文）与表5子区室映射。',
  'src-flow-pilot-ef31-update':
    '；2026-11-17同载体另核摘要印p1、§1印p3、§2表1印p6、§3表2印p8、§3.4印pp10–16（0.2/HC20效应改编式1–4、表5–8、图2–3）、§4.2表10印pp22–23、§§5.1.1.4–5.1.1.6印pp26–28及§§5.2/6印pp30–31、36',
  'src-land111-rivm2016':
    ' 2026-11-17另核表1.3–1.5印pp18–22（含表1.5两位有效数字汇总）、第9章印pp65–72（USES-LCA 2.0五项中点、表9.1–9.4视角开关与1,4-DCB/镍表征因子及基准损害系数）及§20 S5印pp159–161（3094对3073+20物质统计口径）。',
  'src-book-recipe-2017-primary-article':
    '；2026-11-17同载体另核§2.3印p140、表1印p141、§§3.1.8与3.2印p142、表2印p143及§§3.2.8与4.1印p144对USES-LCA 2.0五项毒性中点、急性生态损害系数取1与人体损害路径的概括',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 3, artifacts: 32, sourceKeys: ['src-tox123-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-17同载体追加选读§1表1–2（印pp5–6）、§3.3人体毒性（印pp25–33，表6–7）与§3.9生态毒性（印pp78–84，表20–22），核实USEtox三项中点Level II/III（金属、两亲性与解离物质降为III；表20–21载明ReCiPe采用USES-LCA 2.0并以急性EC50数据为基础而TRACI采用NOEC）、陆海生态毒性不推荐及终点仅致癌DALY评Level II/interim，不声称全书重读。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-17同载体追加核查§2表1–2（印pp6、8）、§3.4（印p10）与§4.3（印pp14–15，含表5），保留CTUe单位组m3*a印文、印p14 Sb(+6)笔误及印p15表5 long-term Estimated映射与§3.4置零规则的源内冲突。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-17同载体追加核查摘要（印p1）、§1（印p3）、§2表1（印p6）、§3表2（印p8）、§3.4（印pp10–16）、§4.2表10（印pp22–23）、§§5.1.1.4–5.1.1.6（印pp26–28）与§§5.2/6（印pp30–31、36），保留印p13式(3)分式倒置HC20/(HC20×0.34)及印p28农田土壤copper (ii)误印9.92E+04→9.92E+04等源内异文；未取得Saouter等2018原始工作簿与EF 3.0原始ZIP。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-tox123-ef31-selected-members',
    limitation: '2026-11-17另按同一中央目录与HTTP 206范围核查9份ILCD/lciamethods毒性总表与子表XML（含已核05316e7a、dacd48b5）、3份other/converter同UUID副本、CTUh/CTUe流属性与Items单位组XML及19份代表物质流XML，完整保留氨流37位置重复、CTUe流属性元数据错配及other/converter元数据字节差异与淡水乳酸0.0对1033.8差异，不声称运行Look@LCI原生程序。',
  },
  'lit-m05': {
    limitation: '2026-11-17同SHA原2016-0104载体追加核读表1.3–1.5（印pp18–22，含表1.5两位有效数字汇总）、第9章毒性（印pp65–72，表9.1–9.4）与§20 S5（印pp159–161，表S5.1），保留印p65（3094种）与印p159（3073+20=3093种及“(essential) metals”措辞）的统计口径微差，未获取ReCiPe全物质电子表格补篇。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-17同SHA期刊PDF追加核对§2.3（印p140）、表1（印p141）、§§3.1.8与3.2（印p142）、表2（印p143）及§§3.2.8与4.1（印p144），确认表2仅列定性伤害路径而将中点至终点系数字面值置于电子补充材料。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-tox123-', evidence: 'ev-tox123-', sources: 'src-tox123-',
    readings: 'rd-tox123-', literature: 'work-tox123-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-tox123-hc20-perspectives-proxies-and-packages-20261117';
  if (kind === 'gaps') return id === 'gap-tox123-usetox-useslca-and-ssd-workbooks';
  return kind === 'revisions' && id === 'rev-tox123-b19-chemical-toxicity-comparison';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: toxicityComparisonSource.date },
    })) throw new Error(`Toxicity comparison changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-tox123-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-tox123-'))
        || !sameScienceValue(current, {
          ...reading,
          artifacts: [...reading.artifacts, ...addedArtifacts],
          passages: [...reading.passages, ...addedPassages],
          sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys],
        }))
      throw new Error(`Toxicity comparison changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: toxicityComparisonSource.date,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Toxicity comparison changed a previous work or its acquisition history: ${id}`);
  }
}

const s1Ids = ['cl-tox123-midpoint-families', 'cl-tox123-hc20-and-metals'];
const s2Ids = ['cl-tox123-perspective-switches', 'cl-tox123-nickel-dcb-reversal', 'cl-tox123-speciation-and-proxies'];
const s3aIds = ['cl-tox123-normative-zeros', 'cl-tox123-package-discrepancies'];
const s3bIds = ['cl-tox123-cross-system-synthesis'];

function boundedOccurrences(previousMdx, actualMdx, expectedDescription) {
  const oldDescLine = 'description: 说明USEtox怎样从排放估计暴露和效应，以及资料缺口和因子标记怎样影响毒性比较。';
  const s1Target = '<Prose ids="cl-usetox-matched-emissions cl-usetox-fate-exposure-effect cl-usetox-intake-and-effects cl-usetox-indicators-not-observed-cases" />';
  const s2Target = '<Prose ids="cl-usetox-model-comparison cl-usetox-comparison-uncertainty cl-usetox-boxes-and-time cl-usetox-internal-feature-conflict" />';
  const s3Target = '<Prose ids="cl-usetox-missing-data-model-zero cl-usetox-factor-flags-and-conditions cl-usetox-prioritization cl-usetox-conclusion" />';
  if (!scienceText(expectedDescription) || /[\r\n]/.test(expectedDescription) || !previousMdx.includes(oldDescLine))
    throw new Error('Toxicity comparison lacks the exact predecessor B19 frontmatter description');
  const expected = previousMdx
    .replace(oldDescLine, () => `description: ${expectedDescription}`)
    .replace(s1Target, () => `${s1Target}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
    .replace(s2Target, () => `${s2Target}\n\n<Prose ids="${s2Ids.join(' ')}" />`)
    .replace(
      s3Target,
      () => `<Prose ids="cl-usetox-missing-data-model-zero cl-usetox-factor-flags-and-conditions" />\n\n<Prose ids="${s3aIds.join(' ')}" />\n\n<Prose ids="cl-usetox-prioritization" />\n\n<Prose ids="${s3bIds.join(' ')}" />\n\n<Prose ids="cl-usetox-conclusion" />`,
    );
  if (expected !== actualMdx)
    throw new Error('Toxicity comparison changed protected B19 text or its scoped additions');
  return [...s1Ids, ...s2Ids, ...s3aIds, ...s3bIds];
}

export function toxicityComparisonLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  const row = unit.layouts.find(item => item.key === key);
  if (key === reverseConceptKey) {
    const expected = [...accepted, ...s1Ids, ...s2Ids, ...s3aIds, ...s3bIds];
    if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale) || !sameScienceValue(row.to, expected))
      throw new Error('Toxicity comparison lacks the exact B17 shared-concept consumer review');
    return row.to;
  }
  const expectedSections = [
    { id: '排放与受体', title: '排放与受体', claimIds: [...accepted.sections[0].claimIds, ...s1Ids] },
    { id: '模型与范围', title: '模型与范围', claimIds: [...accepted.sections[1].claimIds, ...s2Ids] },
    {
      id: '比较的依据',
      title: '比较的依据',
      claimIds: [
        'cl-usetox-missing-data-model-zero',
        'cl-usetox-factor-flags-and-conditions',
        ...s3aIds,
        'cl-usetox-prioritization',
        ...s3bIds,
        'cl-usetox-conclusion',
      ],
    },
  ];
  const approved = { title: accepted.title, description: row?.to?.description, sections: expectedSections };
  if (row?.from !== editionDigest(accepted) || !scienceText(row?.rationale) || !scienceText(row?.to?.description)
      || sameScienceValue(row.to, accepted) || !sameScienceValue(row.to, approved))
    throw new Error('Toxicity comparison can change only its reviewed B19 description and exact 20-claim section order');
  return row.to;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Toxicity comparison missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Toxicity comparison inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Toxicity comparison declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B19 file and raw publication records before the #121 verifier. */
export function prepareToxicityComparisonSource(unit, input, actual, structure) {
  if (unit.correction !== undefined || unit.corrections !== undefined)
    throw new Error('Toxicity comparison must not declare an unreviewed prior-claim correction');
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Toxicity comparison lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Toxicity comparison cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Toxicity comparison lacks independently preserved predecessor B19 MDX bytes');

  const baseLayout = {
    title: '毒性路径',
    description: '说明USEtox怎样从排放估计暴露和效应，以及资料缺口和因子标记怎样影响毒性比较。',
    sections: [
      { id: '排放与受体', title: '排放与受体', claimIds: ['cl-usetox-matched-emissions', 'cl-usetox-fate-exposure-effect', 'cl-usetox-intake-and-effects', 'cl-usetox-indicators-not-observed-cases'] },
      { id: '模型与范围', title: '模型与范围', claimIds: ['cl-usetox-model-comparison', 'cl-usetox-comparison-uncertainty', 'cl-usetox-boxes-and-time', 'cl-usetox-internal-feature-conflict'] },
      { id: '比较的依据', title: '比较的依据', claimIds: ['cl-usetox-missing-data-model-zero', 'cl-usetox-factor-flags-and-conditions', 'cl-usetox-prioritization', 'cl-usetox-conclusion'] },
    ],
  };
  const baseReverseConcepts = [
    'cl-lcia-endpoint-units', 'cl-lcia-mid-end-conversion-limits',
    'cl-usetox-fate-exposure-effect', 'cl-usetox-indicators-not-observed-cases',
    'cl-lime-units', 'cl-rule-why-chain', 'cl-rule-results-layer',
    'cl-rule-reconstruction-limit', 'cl-rule-evidence-judgment', 'cl-native-preservation-meaning',
  ];
  toxicityComparisonLayout(unit, reverseConceptKey, baseReverseConcepts);
  const updatedLayout = toxicityComparisonLayout(unit, layoutKey, baseLayout);
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString(), updatedLayout.description);
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Toxicity comparison lacks exact B19 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validateToxicityComparisonFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== toxicityComparisonPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== toxicityComparisonPredecessorPin)
    throw new Error('Toxicity comparison did not recover the independently observed raw 2eba26c6 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Toxicity comparison actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Toxicity comparison lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveToxicityComparison(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, toxicityComparison: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== toxicityComparisonCapturePin) return false;
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

export function verifyToxicityComparisonReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${toxicityComparisonId}/${row.kind}`;
    if (row.date < toxicityComparisonSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function toxicityComparisonOrdinaryId(unit, route, print, index) {
  if (!unit || route !== toxicityComparisonChapter || index !== 0) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-tox-123-ordinary-0`;
}

export function toxicityComparisonHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-tox-123-ordinary-0$/;
export function observeToxicityComparisonOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, doc]) => doc.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'), sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function qualifyToxicityComparisonHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeToxicityComparisonOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Toxicity comparison', routes: [toxicityComparisonChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: toxicityComparisonHistoryControls(unit), source: toxicityComparisonSource, attribute: 'toxicity-comparison',
    ordinaryPattern, label: 'Toxicity comparison', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Toxicity comparison actual versioned description differs');
  return { prior, errors };
}

export function toxicityComparisonPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
