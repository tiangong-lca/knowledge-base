import { validatePhotochemicalOzoneFactors } from './reader-photochemical-ozone-factors.mjs';
import capture from '../config/reader-photochemical-ozone-capture.json' with { type: 'json' };
import { acidEquivalentsHistoryControls, observeAcidEquivalentsOrdinaryTargets } from './reader-acid-equivalents.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const photochemicalOzoneId = 'photochemical-ozone-119';
export const photochemicalOzoneChapter = '/docs/book/acidification-and-nutrient-pathways';
/** @type {string|null} */
export const photochemicalOzoneUnitPin = '9b4405bd031462cb6004e73836d59277a0384ecc4f28f27274c4001fe34a2850';
/** @type {string|null} */
export const photochemicalOzoneCapturePin = '2a099dc552c13f2aae9250579be5ae1012e34659c216036bd722c701b96ad8a9';
export const photochemicalOzoneSource = Object.freeze({
  commit: '13064f9729f12e30c5206a6d18a065b6f78a410c', tree: '0baab908d8fed4bcea7cf3f45a5b9099e845283f',
  manifest: 'c1a2904b00aee989fa9ef00951cc889890e177eaefd81a3b5e70216007cfd8d9', date: '2026-11-17',
});
export const photochemicalOzonePredecessorPin = '7fad5bd4a52cc5a2cd38d56d522c6d343b68a24d9abde742bfb3fda4e89aacf2';
const addressPin = 'e65f209ae71d73fbd6573f1193ec9a711f4f6c0e6af3c9b364ede1a07a8558d0';
const mdxPath = `content${photochemicalOzoneChapter}.mdx`;
const oldMdxSha = '0c2c8e4c60812654c256a942983df13cbd367847ea16f1681b60b6ee6e29fd07';
const multiPathMarker = '同一排放不同的环境问题';
const ordinaryPattern = /-acid-113-ordinary-0$/;
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectPhotochemicalOzone(config, pin = photochemicalOzoneUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Photochemical ozone requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== photochemicalOzoneId || !sameScienceValue(unit.source, photochemicalOzoneSource)
      || !sameScienceValue(unit.routes, [photochemicalOzoneChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Photochemical ozone requires an exact 13064f9 predecessor and bounded B16 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Photochemical ozone is not independently accepted');
  return unit;
}

const priorSourceAppends = {
  'src-book-ilcd-2011-lcia-recommendations': '；2026-11-17同载体另核§3.6印pp47–55光化学臭氧形成POCP/MIR/LOTOS-EUROS评估与推荐',
  'src-fossil117-jrc109369': ' 2026-11-17同载体另核§4.6印p18光化学臭氧泛指VOC加权与POCP指标名及§§4.7–4.8印pp19–20氮氧化物跨类别派生。',
  'src-flow-pilot-ef31-update': '；2026-11-17同载体另核摘要、§1、Table 1印p6（POF漏标星号）、Table 2印p8与§3.2印p9同义流因子更新',
  'src-land111-rivm2016': ' 2026-11-17另核第6章印pp51–56光化学臭氧HOFP/EOFP与终点转换表，以及§17印pp125–126表S2.1分区域NOx滴定负值与NMVOC表值。',
  'src-book-recipe-2017-primary-article': '；2026-11-17同载体另核印pp139、141、143–144对HOFP/EOFP双受体拆分与无情景区分的说明',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-fossil117-jrc109369': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 2, artifacts: 17, sourceKeys: ['src-ozone119-ef31-selected-members'] },
  'rd-land111-rivm2016': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-recipe-2017-primary-article': { passages: 1, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-17同载体追加选读§3.6（印pp47–55）光化学臭氧形成方法评估与LOTOS-EUROS推荐依据，不声称全书重读。',
  },
  'work-fossil117-jrc109369': {
    topics: ['EF光化学臭氧形成', '泛指VOC排放加权因子'],
    limitation: '2026-11-17同载体追加核查§4.6（印p18）光化学臭氧形成及§§4.7–4.8（印pp19–20）氮氧化物跨酸化与富营养化说明。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-17同载体追加核查摘要、§1、表1（印p6漏标POF星号）、表2（印p8）与§3.2（印p9）对光化学臭氧同义流因子的更新说明。',
  },
  'work-flow-pilot-ef31': {
    sourceId: 'src-ozone119-ef31-selected-members',
    limitation: '2026-11-17另按同一中央目录与HTTP 206范围核查光化学臭氧（b5c610fe）、海洋富营养化（b5c619fa）、颗粒物（b5c602c6）、臭氧耗竭（b5c629d6）方法XML与十三个相关空气流XML，并结合已核酸化、陆地富营养化与气候变化方法XML比对跨类别前体因子，不声称整包原生求解。',
  },
  'lit-m05': {
    limitation: '2026-11-17同SHA原2016-0104载体追加核读第6章光化学臭氧形成（印pp51–56）与§17表S2.1区域HOFP/EOFP（印pp125–126），保留表6.3–6.4跳号及印p56误引Table 5.6原貌。',
  },
  'work-recipe-2017-method-article': {
    limitation: '2026-11-17同SHA期刊PDF追加核对表1、§3.1.5（印p141）、表2（印p143）及§§3.2.4–3.2.5与§4.1（印p144）对HOFP/EOFP双受体及无价值选择区分的概述。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-ozone119-', evidence: 'ev-ozone119-', sources: 'src-ozone119-',
    readings: 'rd-ozone119-', literature: 'work-ozone119-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-ozone119-receptors-titration-multipath-20261117';
  if (kind === 'gaps') return id === 'gap-ozone119-ctm-and-multipollutant-epi';
  return kind === 'revisions' && id === 'rev-ozone119-b16-ozone-and-multipath';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: photochemicalOzoneSource.date },
    })) throw new Error(`Photochemical ozone changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-ozone119-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-ozone119-'))
        || !sameScienceValue(current, {
          ...reading,
          artifacts: [...reading.artifacts, ...addedArtifacts],
          passages: [...reading.passages, ...addedPassages],
          sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys],
        }))
      throw new Error(`Photochemical ozone changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: photochemicalOzoneSource.date,
      topics: spec.topics ? [...work.topics, ...spec.topics] : work.topics,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Photochemical ozone changed a previous work or its acquisition history: ${id}`);
  }
}

const addedClaimNames = [
  'precursor-entry',
  'pocp-to-lotos',
  'order-reversal',
  'titration-sign',
  'ef-location-copy',
  'multipath-accounting',
  'printed-limits',
];

function boundedOccurrences(previousMdx, actualMdx) {
  const ids = addedClaimNames.map(name => 'cl-ozone119-' + name);
  const boundary = `<ReaderSection id="${multiPathMarker}" />\n\n`;
  const expected = previousMdx.replace(
    boundary + '<Prose ids="cl-path-multiple-paths" />',
    boundary + `<Prose ids="${ids.join(' ')}" />\n\n<Prose ids="cl-path-multiple-paths" />`,
  );
  if (expected !== actualMdx)
    throw new Error('Photochemical ozone changed protected B16 text or moved its single §4 addition');
  return ids;
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Photochemical ozone missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Photochemical ozone inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Photochemical ozone declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B16 file and raw publication records before the #117 verifier. */
export function preparePhotochemicalOzoneSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Photochemical ozone lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Photochemical ozone cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Photochemical ozone lacks independently preserved predecessor B16 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:'));
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Photochemical ozone lacks exact B16 occurrences for each new canonical claim');
  if (unit.correction !== null && unit.correction !== undefined)
    throw new Error('Photochemical ozone must not declare an unreviewed prior-claim correction');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  validatePhotochemicalOzoneFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== photochemicalOzonePredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== photochemicalOzonePredecessorPin)
    throw new Error('Photochemical ozone did not recover the independently observed raw 13064f9 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Photochemical ozone actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Photochemical ozone lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectivePhotochemicalOzone(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, photochemicalOzone: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== photochemicalOzoneCapturePin) return false;
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

export function verifyPhotochemicalOzoneReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${photochemicalOzoneId}/${row.kind}`;
    if (row.date < photochemicalOzoneSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function photochemicalOzoneHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row => {
    const previous = unit.history.previousAddresses[row.address];
    const marker = row.address.endsWith(`#${multiPathMarker}`) || row.address.endsWith(`-${multiPathMarker}`);
    return [row.address, { ...row, previous: marker ? { ...previous, title: multiPathMarker } : previous }];
  })));
}

export function qualifyPhotochemicalOzoneHistory(documents, unit, actual, acidEquivalents) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeAcidEquivalentsOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Photochemical ozone', routes: [photochemicalOzoneChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: photochemicalOzoneHistoryControls(unit), source: photochemicalOzoneSource, attribute: 'photochemical-ozone',
    previousHistory: [
      { attribute: 'acid-equivalents', expected: acidEquivalentsHistoryControls(acidEquivalents) },
    ],
    ordinaryPattern, label: 'Photochemical ozone', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Photochemical ozone actual versioned description differs');
  return { prior, errors };
}

export function photochemicalOzonePreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
