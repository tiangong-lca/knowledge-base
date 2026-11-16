import { validateOzoneRadiationFactors } from './reader-ozone-radiation-factors.mjs';
import capture from '../config/reader-ozone-radiation-capture.json' with { type: 'json' };
import { landRecoveryHistoryControls, observeLandRecoveryOrdinaryTargets } from './reader-land-recovery.mjs';
import { mineralResourcesHistoryControls } from './reader-mineral-resources.mjs';
import { fossilResourcesHistoryControls } from './reader-fossil-resources.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { flowBoundaryNoteTarget, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const ozoneRadiationId = 'ozone-radiation-121';
export const ozoneRadiationChapter = '/docs/book/midpoint-endpoint-value-choices';
/** @type {string|null} */
export const ozoneRadiationUnitPin = '36a120ef5da77e22263e0e29fac9786ff03821262aa72cb37194aa4c20bc95ec';
/** @type {string|null} */
export const ozoneRadiationCapturePin = 'd3d92fcf50a1ace3b538e813ee6712876d318897076b576ca62bfc89c4e36d16';
export const ozoneRadiationSource = Object.freeze({
  commit: 'c5e3d8860bd715b30577d88ec1360834148398c2', tree: '3c1e6277c9ca84e98c1dfce91698f3da7da85526',
  manifest: '65c9d657ac65f9b29c732ca38ea4126e1132d952f2880dae31574b8e1c57c218', date: '2026-11-17',
});
export const ozoneRadiationPredecessorPin = 'be282daa6b7d83e064182c93aa31dfe32ed300f7258aa38882d76825e8861eed';
const addressPin = '521c6ff03dcd93dcf426a604686dffaa8cccda0f3f7ed3a4fc571ca0ab51d256';
const mdxPath = `content${ozoneRadiationChapter}.mdx`;
const oldMdxSha = '1ded5b9fb303ffc2dd5e859bc9207dafcaf34c35de3b618e452cadb78c061243';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectOzoneRadiation(config, pin = ozoneRadiationUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Ozone and radiation requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== ozoneRadiationId || !sameScienceValue(unit.source, ozoneRadiationSource)
      || !sameScienceValue(unit.routes, [ozoneRadiationChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Ozone and radiation requires an exact c5e3d886 predecessor and bounded B14 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Ozone and radiation is not independently accepted');
  return unit;
}

export const ozoneRadiationCorrections = Object.freeze([
  Object.freeze({
    claimId: 'cl-lcia-midpoint-pathway',
    scope: '前版收束句仅提用地和矿产两类输入。本版在补齐化石能源开采及停在物理暴露量的平流层臭氧耗竭与电离辐射排放路径后，将该句同步扩为四类路径并补绑相应证据。',
  }),
  Object.freeze({
    claimId: 'cl-mineral115-judgment',
    scope: '前版收束句列土地、化石能源与矿产三例。本版在增补平流层臭氧耗竭与电离辐射的公式、综述与发行包核对后，将该句同步扩为四组例子并补绑相应证据。',
  }),
]);
const correctionIds = new Set(ozoneRadiationCorrections.map(row => row.claimId));

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations': '；2026-11-17同载体另核§1表1印p5、§3.2印pp19–24臭氧耗竭与§3.5印pp42–47电离辐射中点推荐及终点／生态暂不推荐依据',
  'src-fossil117-jrc109369': ' 2026-11-17同载体另核§2表1–2印pp6与8、§4.2印p13、§4.5印p17及Annex 1印pp33–37（23种物质113行）臭氧耗竭WMO 2014整合表与电离辐射kBq U235／子区室说明。',
  'src-flow-pilot-ef31-update': '；2026-11-17同载体另核§2表1印p6、§4.2印p21、表10印p22与Annex I表15印p44臭氧耗竭与电离辐射同义流及Bromomethane重复清单修正',
  'src-land111-rivm2016': ' 2026-11-17另核表1.1/1.3–1.5印pp14、18、20、22，第3章印pp35–39平流层臭氧耗竭，第4章印pp41–45电离辐射及§14.1印p99空气子区室规则。',
  'src-book-recipe-2017-primary-article': '；2026-11-17同载体另核§2.3、§§3.1.2–3.1.3印p140、表1印p141、表2与§3.2.2印p143及§3.2.3印pp143–144对臭氧耗竭与电离辐射中终点路径的概括',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 2, artifacts: 23, sourceKeys: ['src-ozrad121-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-17同载体追加选读§1表1（印p5）、§3.2臭氧耗竭（印pp19–24）与§3.5电离辐射（印pp42–47）的中点推荐、终点暂不推荐理由及淡水生态辐射EDR50/HC50边界，不声称全书重读。',
  },
  'work-fossil117-jrc109369': {
    limitation: '2026-11-17同载体追加核查§2表1–2（印pp6、8）、§4.2臭氧耗竭（印p13）、§4.5电离辐射（印p17）与Annex 1（印pp33–37，23种物质共113行），保留表1–2旧WMO 1999／Mass U235-equivalents标签及§4.5子区室叙述与官方XML的差异。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-17同载体追加核查§2表1（印p6）、§4.2（印p21）、表10（印p22）与Annex I表15（印p44）中臭氧耗竭与电离辐射的沿用状态、同义流赋值及Bromomethane重复清单删除。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-ozrad121-ef31-selected-members',
    limitation: '2026-11-17另按同一中央目录与HTTP 206范围核查电离辐射方法（b5c632be）、放射性活度流属性（93a60a56-a3c8-17da-a746-0800200c9a66）与二十一个卤代烃／氧化亚氮／放射性核素流XML，并结合已核臭氧耗竭（b5c629d6）、气候变化（6209b35f）与质量流属性XML核验条目与元数据，不声称整包原生求解。',
  },
  'lit-m05': {
    limitation: '2026-11-17同SHA原2016-0104载体追加核读表1.1/1.3–1.5（印pp14、18、20、22）、第3章平流层臭氧耗竭（印pp35–39）、第4章电离辐射（印pp41–45）与§14.1（印p99），保留p36指数符号(-t-3)·k实算表值、p38 longitudinal笔误、表4.2及注a缺省列与pp44–45 kg/表3.3笔误。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-17同SHA期刊PDF追加核对§2.3、§§3.1.2–3.1.3（印p140）、表1（印p141）、表2与§3.2.2（印p143）及§3.2.3（印pp143–144），保留§3.1.2仅写无限期ODP的概括表述。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'claims' && correctionIds.has(id))
    || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-ozrad121-', evidence: 'ev-ozrad121-', sources: 'src-ozrad121-',
    readings: 'rd-ozrad121-', literature: 'work-ozrad121-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-ozrad121-horizons-reference-nuclides-and-packages-20261117';
  if (kind === 'gaps') return id === 'gap-ozrad121-stratospheric-and-radiological-originals';
  return kind === 'revisions' && id === 'rev-ozrad121-b14-ozone-and-radiation';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: ozoneRadiationSource.date },
    })) throw new Error(`Ozone and radiation changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-ozrad121-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-ozrad121-'))
        || !sameScienceValue(current, {
          ...reading,
          artifacts: [...reading.artifacts, ...addedArtifacts],
          passages: [...reading.passages, ...addedPassages],
          sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys],
        }))
      throw new Error(`Ozone and radiation changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: ozoneRadiationSource.date,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Ozone and radiation changed a previous work or its acquisition history: ${id}`);
  }
}

function boundedOccurrences(previousMdx, actualMdx) {
  const s1Ids = ['cl-ozrad121-emission-midpoint', 'cl-ozrad121-reference-scope'];
  const s2Ids = ['cl-ozrad121-odp-horizons', 'cl-ozrad121-ir-horizons', 'cl-ozrad121-endpoint-choices'];
  const s3Ids = ['cl-ozrad121-formula-table', 'cl-ozrad121-package-discrepancies', 'cl-ozrad121-emission-bridge'];
  const s1Target = '<Prose ids="cl-fossil117-scarcity-energy cl-fossil117-heating-basis cl-fossil117-uranium-boundary" />';
  const s2Target = '<Prose ids="cl-fossil117-scenario-proxy" />';
  const s3Target = '## 模型与资料 [#模型输入数据与因子发行包]\n\n<Prose ids="cl-land111-printed-record" />';
  const expected = previousMdx
    .replace(s1Target, `${s1Target}\n\n<Prose ids="${s1Ids.join(' ')}" />`)
    .replace(s2Target, `${s2Target}\n\n<Prose ids="${s2Ids.join(' ')}" />`)
    .replace(
      s3Target,
      `## 模型与资料 [#模型输入数据与因子发行包]\n\n<Prose ids="${s3Ids.join(' ')}" />\n\n<Prose ids="cl-land111-printed-record" />`,
    );
  if (expected !== actualMdx) throw new Error('Ozone and radiation changed protected B14 text or its three scoped additions');
  return [...s1Ids, ...s2Ids, ...s3Ids];
}

const correctionSpecs = {
  'cl-lcia-midpoint-pathway': {
    fromText: '用地和矿产开采则从另外的清单输入出发，还须进一步问：转换只是在重新表达已有估计，还是加入了新的模型关系？本章用这两类输入继续讨论这一问题。',
    toText: '用地、矿产与化石能源开采则从另外的清单输入出发，再加上停在物理暴露量的平流层臭氧耗竭与电离辐射排放路径，都须进一步追问：转换只是在重新表达已有估计，还是加入了新的模型关系？本章把这四类路径并置讨论。',
    scope: 'ReCiPe排放路径框架的有界示例，以及本章四类路径比较的问题',
    addedEvidence: ['ev-fossil117-rivm-ffp-and-hhv', 'ev-ozrad121-ilcd2011-odp', 'ev-ozrad121-ilcd2011-ir'],
  },
  'cl-mineral115-judgment': {
    fromText: '土地、化石能源与矿产三个例子都说明，读一个结果还要分清模型关系、所用资料与实际因子。',
    toText: '平流层臭氧与电离辐射、土地、化石能源和矿产四组例子都说明，读一个结果还要分清模型关系、所用资料与实际因子。',
    scope: null,
    addedEvidence: ['ev-ozrad121-rivm-ch3-odp-tables', 'ev-ozrad121-ef31-ir-xml'],
  },
};

function qualifyCorrections(unit, records, catalog) {
  if (!sameScienceValue(unit.corrections, ozoneRadiationCorrections))
    throw new Error('Ozone and radiation lacks the exact opening and closing synchronization metadata');
  for (const { claimId } of ozoneRadiationCorrections) {
    if (!records.has(`claims:${claimId}`))
      throw new Error(`Ozone and radiation declared a correction without its actual record transition: ${claimId}`);
    const spec = correctionSpecs[claimId];
    const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === claimId)?.from;
    const current = catalog.claims.find(row => row.id === claimId);
    const expectedText = original?.text.replace(spec.fromText, spec.toText);
    const expectedScope = spec.scope ?? original?.scope;
    const expectedEvidence = [...(original?.evidenceIds ?? []), ...spec.addedEvidence];
    if (!original || !current || !original.text.includes(spec.fromText)
        || original.text === current.text || current.text !== expectedText
        || current.scope !== expectedScope
        || current.reviewedAt !== ozoneRadiationSource.date
        || current.kind !== original.kind || current.reviewKind !== 'agent-source-check'
        || original.status !== current.status || !sameScienceValue(original.conceptIds, current.conceptIds)
        || !sameScienceValue(original.premiseIds, current.premiseIds)
        || !sameScienceValue(original.caveats, current.caveats)
        || !sameScienceValue(original.reasoning, current.reasoning)
        || !sameScienceValue(current.evidenceIds, expectedEvidence)
        || !sameScienceValue(current.evidenceLinks?.map(({ evidenceId, relation }) => [evidenceId, relation]),
          expectedEvidence.map(evidenceId => [evidenceId, 'supports'])))
      throw new Error(`Ozone and radiation lacks the exact predecessor and scope disposition for ${claimId}`);
  }
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Ozone and radiation missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Ozone and radiation inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Ozone and radiation declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B14 file and raw publication records before the #119 verifier. */
export function prepareOzoneRadiationSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Ozone and radiation lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Ozone and radiation cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Ozone and radiation lacks independently preserved predecessor B14 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:')
    && !correctionIds.has(key.slice('claims:'.length)));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Ozone and radiation lacks exact B14 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  qualifyCorrections(unit, records, catalog);
  validateOzoneRadiationFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== ozoneRadiationPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== ozoneRadiationPredecessorPin)
    throw new Error('Ozone and radiation did not recover the independently observed raw c5e3d886 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Ozone and radiation actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Ozone and radiation lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveOzoneRadiation(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, ozoneRadiation: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== ozoneRadiationCapturePin) return false;
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

export function verifyOzoneRadiationReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${ozoneRadiationId}/${row.kind}`;
    if (row.date < ozoneRadiationSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function ozoneRadiationHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

export function qualifyOzoneRadiationHistory(documents, unit, actual, fossilResources, mineralResources, landRecovery) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLandRecoveryOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Ozone and radiation', routes: [ozoneRadiationChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: ozoneRadiationHistoryControls(unit), source: ozoneRadiationSource, attribute: 'ozone-radiation',
    previousHistory: [
      { attribute: 'fossil-resources', expected: fossilResourcesHistoryControls(fossilResources) },
      { attribute: 'mineral-resources', expected: mineralResourcesHistoryControls(mineralResources) },
      { attribute: 'land-recovery', expected: landRecoveryHistoryControls(landRecovery) },
    ],
    ordinaryPattern: /-land-111-ordinary-0$/, label: 'Ozone and radiation', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Ozone and radiation actual versioned description differs');
  for (const [path, document] of documents)
    errors.push(...validateOzoneRadiationCorrectionOutput(document, path, unit.corrections));
  return { prior, errors };
}

export function validateOzoneRadiationCorrectionOutput(document, path, corrections) {
  const markers = document.querySelectorAll('[data-ozone-radiation-correction]');
  const expected = Array.isArray(corrections) && corrections.length === ozoneRadiationCorrections.length
    && (path === '/print' || path === ozoneRadiationChapter);
  if (!expected && !markers.length) return [];
  if (!expected || markers.length !== ozoneRadiationCorrections.length)
    return [`Ozone and radiation synchronization notices are absent, changed or detached: ${path}`];

  for (const [index, { claimId, scope }] of ozoneRadiationCorrections.entries()) {
    const { id } = flowBoundaryNoteTarget(path, ozoneRadiationChapter, claimId);
    const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
    const note = nativeNotes[0];
    const marker = markers[index];
    const time = marker?.querySelector('time'), links = marker?.querySelectorAll('a');
    const article = note?.closest('article[data-reader-route]');
    const sections = article?.querySelectorAll('.chapter-notes') ?? [];
    const list = sections[0]?.querySelector('ol');
    const noteItems = list?.childNodes.filter(child => child.tagName === 'LI') ?? [];
    if (nativeNotes.length !== 1 || note.tagName !== 'LI' || note.getAttribute('data-reader-claim') !== claimId
        || article?.getAttribute('data-reader-route') !== ozoneRadiationChapter || sections.length !== 1
        || note.parentNode !== list || !noteItems.includes(note)
        || marker.tagName !== 'P' || marker.parentNode !== note || marker.nextElementSibling !== null || !visibleHistoryControl(marker)
        || marker.getAttribute('data-ozone-radiation-correction') !== claimId
        || marker.getAttribute('style') !== 'display:block'
        || time?.getAttribute('datetime') !== ozoneRadiationSource.date || time.text !== ozoneRadiationSource.date
        || links.length !== 1 || links[0].getAttribute('href') !== citationSourceHref(ozoneRadiationSource.commit)
        || !visibleHistoryControl(links[0]) || marker.text !== `${ozoneRadiationSource.date} 修订：${scope} 查看前版源文件`)
      return [`Ozone and radiation synchronization notice is absent, changed or detached (${claimId}): ${path}`];
  }
  return [];
}

export function ozoneRadiationPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
