import { validateFossilResourcesFactors } from './reader-fossil-resources-factors.mjs';
import capture from '../config/reader-fossil-resources-capture.json' with { type: 'json' };
import { landRecoveryHistoryControls, observeLandRecoveryOrdinaryTargets } from './reader-land-recovery.mjs';
import { mineralResourcesHistoryControls } from './reader-mineral-resources.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { flowBoundaryNoteTarget, groupHistoricalRanges, observeFlowBoundaryChanges, validateDatedHistoryOutput, visibleHistoryControl } from './reader-flow-boundary.mjs';
import {
  exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput, qualifyScientificHistory,
  restoreScientificRecords, sameScienceValue, scienceDigest, scienceText,
} from './reader-scientific-delta.mjs';

export const fossilResourcesId = 'fossil-resources-117';
export const fossilResourcesChapter = '/docs/book/midpoint-endpoint-value-choices';
/** @type {string|null} */
export const fossilResourcesUnitPin = '643cf16518d8f3221c3d5d724f22b4bf099fe5bc24787db2f04083e63e811cdf';
/** @type {string|null} */
export const fossilResourcesCapturePin = 'a89428471a5ddd21a735a91e58ffe01e7edeac8874d1a4f18cfeaa3f6e9bd405';
export const fossilResourcesSource = Object.freeze({
  commit: 'ba8a101b1cd8eade0eb2da5e04323dd9dacaa53c', tree: '0672c9f57cf0f7e80494e5ff604a6c9c36f9be1c',
  manifest: 'e32e645067f9e8c1127ae48d6c385174888bde838129bbdfd239ad9ae49c60e8', date: '2026-11-16',
});
export const fossilResourcesPredecessorPin = '93d92634ba66bf752bb64140ca8158db30014a4e39687e87382de98219adecd4';
const addressPin = '372514cb597bd5867ecfd0f3b12978c040c615eac3b552a2fc883f0cb6c28e31';
const mdxPath = `content${fossilResourcesChapter}.mdx`;
const oldMdxSha = '97cac70b23d764f2736c6aa3f299c7308cc8ea2f60f91f1df48a888861a4ddc7';
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectFossilResources(config, pin = fossilResourcesUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Fossil resources requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== fossilResourcesId || !sameScienceValue(unit.source, fossilResourcesSource)
      || !sameScienceValue(unit.routes, [fossilResourcesChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Fossil resources requires an exact ba8a101 predecessor and bounded B14 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Fossil resources is not independently accepted');
  return unit;
}

export const fossilResourcesCorrection = Object.freeze({
  claimId: 'cl-mineral115-judgment',
  scope: '前版收束句仅提土地和矿产两例。本版在增补化石能源与能量载体比较后，将该句同步扩为土地、化石能源与矿产三例，并补绑化石终点费用证据。',
});

const priorSourceAppends = {
  'src-land111-rivm2016': ' 2026-11-16另核印pp90、92、183–184铀矿产SOP行，印pp95–97第13章化石FFP/SCP、图13.1–13.2、印p117引文编号及印p187 §24表S9.1–S9.2。',
  'src-book-ilcd-2011-lcia-recommendations': '；2026-11-16同载体另核§3.11.6–§3.11.9印pp99–101资源耗竭推荐与火用稀缺性判据',
  'src-flow-pilot-ef31-update': '；2026-11-16同载体另核§1 p3、§2 p5与Table 1 pp6–7两项资源使用类别承接说明',
  'src-mineral115-vanoers2020': ' 2026-11-16结合同作品PDF核对pp294–295化石与元素拆分及pp305–306表3注1对PEF铀归类的异议。',
  'src-mineral115-vanoers2020-esm1': ' 2026-11-16另核characterisation model!C10–C30化石与元素范围说明及recommended ADP & norm data!I109铀保存值。',
};

const priorReadingAdditions = {
  'rd-ilcd-2011-eutrophication-pathways': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-flow-pilot-ef31': { passages: 4, artifacts: 10, sourceKeys: ['src-fossil117-ef31-selected-members'] },
  'rd-flow-pilot-ef31-update': { passages: 1, artifacts: 0, sourceKeys: [] },
  'rd-land111-rivm2016': { passages: 4, artifacts: 0, sourceKeys: [] },
  'rd-mineral115-vanoers2020': { passages: 2, artifacts: 0, sourceKeys: [] },
  'rd-mineral115-vanoers2020-esm1': { passages: 2, artifacts: 0, sourceKeys: [] },
};

const priorWorkAppends = {
  'work-flow-pilot-ef31': {
    sourceId: 'src-fossil117-ef31-selected-members',
    limitation: '2026-11-16另按同一中央目录与HTTP 206范围核查化石资源、矿产资源两方法XML与六个能量载体流及净热值流属性／能量单位组，不声称重算整包。',
  },
  'lit-m05': {
    limitation: '2026-11-16以同SHA原2016-0104载体追加核读第13章化石资源、§24表S9.1–S9.2、印p117参考文献编号及第12章／§23.1表S8.1铀行；保留p96跨表图及2016b误引、图13.2横轴单位及未刊稿限制。',
  },
  'work-ilcd-2011-lcia-recommendations': {
    limitation: '2026-11-16同载体追加选读§3.11.6–§3.11.9资源耗竭推荐与火用排除理由，不声称全书重读。',
  },
  'work-flow-pilot-ef31-update': {
    limitation: '2026-11-16同载体追加核查§1–§2与表1对十个未改动类别（含两项资源使用类别）的承接说明。',
  },
  'work-mineral115-vanoers2020': {
    limitation: '2026-11-16同PDF与ESM1载体追加核查化石燃料／元素拆分背景、表3注1对PEF将铀归入能量载体的异议及I109铀保存值。',
  },
};

function allowsRaw(kind, id, before) {
  if (before !== null) return (kind === 'claims' && id === fossilResourcesCorrection.claimId)
    || (kind === 'sources' && Object.hasOwn(priorSourceAppends, id))
    || (kind === 'readings' && Object.hasOwn(priorReadingAdditions, id))
    || (kind === 'literature' && Object.hasOwn(priorWorkAppends, id));
  const prefixes = {
    claims: 'cl-fossil117-', evidence: 'ev-fossil117-', sources: 'src-fossil117-',
    readings: 'rd-fossil117-', literature: 'work-fossil117-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  if (kind === 'queries') return id === 'q-fossil117-energy-carriers-and-costs-20261116';
  if (kind === 'gaps') return id === 'gap-fossil117-vieira-fossil-manuscript';
  return kind === 'revisions' && id === 'rev-fossil117-rivm-and-ef-energy-carriers';
}

function qualifyPriorResearch(unit, catalog, literature, readings) {
  const prior = (path, id) => unit.rawRecords.find(row => row.path === path && row.id === id)?.from;
  for (const [id, append] of Object.entries(priorSourceAppends)) {
    const source = prior('catalog.sources', id);
    const current = catalog.sources.find(row => row.id === id);
    if (!source || !sameScienceValue(current, {
      ...source,
      reading: { ...source.reading, scope: source.reading.scope + append, checkedAt: fossilResourcesSource.date },
    })) throw new Error(`Fossil resources changed a previous source or its acquisition scope: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorReadingAdditions)) {
    const reading = prior('readings.readings', id);
    const current = readings.readings.find(row => row.id === id);
    const addedPassages = current?.passages.slice(reading?.passages.length ?? 0) ?? [];
    const addedArtifacts = current?.artifacts.slice(reading?.artifacts.length ?? 0) ?? [];
    if (!reading || addedPassages.length !== spec.passages || addedArtifacts.length !== spec.artifacts
        || addedPassages.some(row => !row.id.startsWith('psg-fossil117-'))
        || addedArtifacts.some(row => !row.id.startsWith('art-fossil117-'))
        || !sameScienceValue(current, {
          ...reading,
          artifacts: [...reading.artifacts, ...addedArtifacts],
          passages: [...reading.passages, ...addedPassages],
          sourceKeys: [...reading.sourceKeys, ...spec.sourceKeys],
        }))
      throw new Error(`Fossil resources changed a previous reading, carrier or passage prefix: ${id}`);
  }

  for (const [id, spec] of Object.entries(priorWorkAppends)) {
    const work = prior('literature.records', id);
    const current = literature.records.find(row => row.id === id);
    if (!work || !sameScienceValue(current, {
      ...work,
      lastCheckedAt: fossilResourcesSource.date,
      catalogSourceIds: spec.sourceId ? [...work.catalogSourceIds, spec.sourceId] : work.catalogSourceIds,
      limitations: [...work.limitations, spec.limitation],
    })) throw new Error(`Fossil resources changed a previous work or its acquisition history: ${id}`);
  }
}

const comparisonSections = [
  ['<Prose ids="cl-mineral115-input cl-mineral115-adp cl-mineral115-sop" />\n\n',
    ['scarcity-energy', 'heating-basis', 'uranium-boundary']],
  ['<Prose ids="cl-mineral115-reserves" />\n\n',
    ['scenario-proxy']],
  ['<Prose ids="cl-land111-printed-record" />\n\n',
    ['equal-midpoint', 'proxy-consequence', 'printed-limits', 'bridge']],
];

function boundedOccurrences(previousMdx, actualMdx) {
  let expected = previousMdx;
  const added = [];
  for (const [boundary, names] of comparisonSections) {
    const ids = names.map(name => 'cl-fossil117-' + name);
    expected = expected.replace(boundary, boundary + `<Prose ids="${ids.join(' ')}" />\n\n`);
    added.push(...ids);
  }
  if (expected !== actualMdx) throw new Error('Fossil resources changed protected B14 text or its three scoped additions');
  return added;
}

function qualifyCorrection(unit, records, catalog) {
  const id = fossilResourcesCorrection.claimId;
  if (!records.has(`claims:${id}`)) {
    if (unit.correction) throw new Error('Fossil resources declared a correction without its actual record transition');
    return;
  }
  const original = unit.rawRecords.find(row => row.path === 'catalog.claims' && row.id === id)?.from;
  const current = catalog.claims.find(row => row.id === id);
  const expectedText = original?.text.replace(
    '土地和矿产两个例子都说明，读一个结果还要分清模型关系、所用资料与实际因子。',
    '土地、化石能源与矿产三个例子都说明，读一个结果还要分清模型关系、所用资料与实际因子。',
  );
  const expectedEvidence = [...(original?.evidenceIds ?? []), 'ev-fossil117-rivm-scp-endpoint'];
  if (!sameScienceValue(unit.correction, fossilResourcesCorrection) || !original || !current
      || original.text === current.text || current.text !== expectedText
      || current.reviewedAt !== fossilResourcesSource.date
      || current.kind !== original.kind || current.reviewKind !== 'agent-source-check'
      || original.status !== current.status || !sameScienceValue(original.conceptIds, current.conceptIds)
      || !sameScienceValue(original.premiseIds, current.premiseIds)
      || !sameScienceValue(original.caveats, current.caveats)
      || !sameScienceValue(current.evidenceIds, expectedEvidence)
      || !sameScienceValue(current.evidenceLinks?.map(({ evidenceId, relation }) => [evidenceId, relation]),
        expectedEvidence.map(evidenceId => [evidenceId, 'supports'])))
    throw new Error('Fossil resources lacks the exact predecessor and scope disposition for its closing sync');
}

function validateSourceTransitions(kind, declared, before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const from = before[key] ?? null, to = after[key] ?? null;
    if (sameScienceValue(from, to)) continue;
    const row = declared.get(key);
    if (!row) throw new Error(`Fossil resources missing actual ${kind} transition: ${key}`);
    if (row.from === undefined || !sameScienceValue(row.from, from))
      throw new Error(`Fossil resources inexact predecessor for ${kind} transition: ${key}`);
    declared.delete(key);
  }
  if (declared.size) throw new Error(`Fossil resources declared unchanged ${kind} transition: ${declared.keys().next().value}`);
}

/** Restore the physical B14 file and raw publication records before the #115 verifier. */
export function prepareFossilResourcesSource(unit, input, actual, structure) {
  const scope = new Set(unit.scope), records = new Map(), files = new Map(input.files);
  let file;
  for (const row of unit.changes) {
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Fossil resources lacks its exact candidate transition: ${row.key}`);
    if (row.kind === 'file' && !file && row.key === mdxPath) file = row;
    else if (row.kind === 'record' && !records.has(row.key)) records.set(row.key, row);
    else throw new Error(`Fossil resources cannot modify an unrelated or protected file or receipt: ${row.key}`);
  }
  if (scope.size !== unit.changes.length || file?.from !== oldMdxSha || sha256(unit.previousMdx ?? '') !== oldMdxSha)
    throw new Error('Fossil resources lacks independently preserved predecessor B14 MDX bytes');
  const added = boundedOccurrences(unit.previousMdx, files.get(mdxPath).toString());
  const claimRows = [...records.keys()].filter(key => key.startsWith('claims:')
    && key !== `claims:${fossilResourcesCorrection.claimId}`);
  if (!sameScienceValue(unit.occurrences, actual.sourceOccurrences[mdxPath]) || !added.length
      || added.length !== claimRows.length || !added.every(id => records.has(`claims:${id}`)))
    throw new Error('Fossil resources lacks exact B14 occurrences for each new canonical claim');

  const { catalog, readings, literature } = input;
  qualifyPriorResearch(unit, catalog, literature, readings);
  qualifyCorrection(unit, records, catalog);
  validateFossilResourcesFactors(catalog, readings);
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, records, allowsRaw);
  files.set(mdxPath, Buffer.from(unit.previousMdx));
  const reconstructed = { ...previousRecords, files };
  const previous = inspectReadableBookEdition(reconstructed);
  const priorStructure = copyeditSourceStructure(reconstructed);
  if (unit.state?.before !== fossilResourcesPredecessorPin
      || editionDigest({ ...previous, structure: priorStructure }) !== fossilResourcesPredecessorPin)
    throw new Error('Fossil resources did not recover the independently observed raw ba8a101 state');
  if (unit.state?.after !== editionDigest({ ...actual, structure }))
    throw new Error('Fossil resources actual source state differs from the reviewed candidate');

  validateSourceTransitions('file', new Map([[file.key, file]]), previous.files, actual.files);
  validateSourceTransitions('record', new Map(records), previous.records, actual.records);

  const seeds = unit.changes.filter(row => !['researchMetadata:reading-ledger', 'researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(previous, actual, seeds);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Fossil resources lacks exact cross-generation consumer review');
  return { previous, previousRecords, files, structure: priorStructure, affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveFossilResources(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, fossilResources: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

function verifiedCapture(unit, observations, publicDownloads) {
  if (!capture || editionDigest(capture) !== fossilResourcesCapturePin) return false;
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

export function verifyFossilResourcesReceipts(unit, artifacts, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${fossilResourcesId}/${row.kind}`;
    if (row.date < fossilResourcesSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    return row.kind !== 'output' || observations.source === 'actual-export'
      && !['previewDownloads', 'forecast'].some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key))
      && verifiedCapture(unit, observations, publicDownloads);
  });
}

export function fossilResourcesHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

export function qualifyFossilResourcesHistory(documents, unit, actual, mineralResources, landRecovery) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLandRecoveryOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Fossil resources', routes: [fossilResourcesChapter], predecessorPin: addressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: fossilResourcesHistoryControls(unit), source: fossilResourcesSource, attribute: 'fossil-resources',
    previousHistory: [
      { attribute: 'mineral-resources', expected: mineralResourcesHistoryControls(mineralResources) },
      { attribute: 'land-recovery', expected: landRecoveryHistoryControls(landRecovery) },
    ],
    ordinaryPattern: /-land-111-ordinary-0$/, label: 'Fossil resources', ordinaryTargets: Object.fromEntries(
      Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key, row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets)) errors.push('Fossil resources actual versioned description differs');
  for (const [path, document] of documents)
    errors.push(...validateFossilResourcesCorrectionOutput(document, path, unit.correction));
  return { prior, errors };
}

export function validateFossilResourcesCorrectionOutput(document, path, correction) {
  const markers = document.querySelectorAll('[data-fossil-resources-correction]');
  const expected = correction && (path === '/print' || path === fossilResourcesChapter);
  if (!expected && !markers.length) return [];
  const { claimId, scope } = fossilResourcesCorrection;
  const { id } = flowBoundaryNoteTarget(path, fossilResourcesChapter, claimId);
  const nativeNotes = document.querySelectorAll('[id]').filter(node => node.id === id);
  const note = nativeNotes[0];
  const marker = markers[0], time = marker?.querySelector('time'), links = marker?.querySelectorAll('a');
  const article = note?.closest('article[data-reader-route]');
  const sections = article?.querySelectorAll('.chapter-notes') ?? [];
  const list = sections[0]?.querySelector('ol');
  const noteItems = list?.childNodes.filter(child => child.tagName === 'LI') ?? [];
  if (!expected || nativeNotes.length !== 1 || note.tagName !== 'LI' || note.getAttribute('data-reader-claim') !== claimId
      || article?.getAttribute('data-reader-route') !== fossilResourcesChapter || sections.length !== 1
      || note.parentNode !== list || !noteItems.includes(note)
      || markers.length !== 1 || marker.tagName !== 'P' || marker.parentNode !== note || !visibleHistoryControl(marker)
      || marker.getAttribute('data-fossil-resources-correction') !== claimId
      || marker.getAttribute('style') !== 'display:block'
      || time?.getAttribute('datetime') !== fossilResourcesSource.date || time.text !== fossilResourcesSource.date
      || links.length !== 1 || links[0].getAttribute('href') !== citationSourceHref(fossilResourcesSource.commit)
      || !visibleHistoryControl(links[0]) || marker.text !== `${fossilResourcesSource.date} 修订：${scope} 查看前版源文件`)
    return [`Fossil resources closing sync notice is absent, changed or detached: ${path}`];
  return [];
}

export function fossilResourcesPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary };
}
