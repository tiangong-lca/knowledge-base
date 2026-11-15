import { readFile, realpath, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import capture from '../config/reader-load-shift-capture.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, inspectReadableBookEdition, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { canonicalCaseInput, caseEvaluationReceipt } from './case-publication.mjs';
import { validateFiniteLoadShiftCase } from './finite-load-shift-case.mjs';
import { observeFlowBoundaryChanges, flowBoundaryOrdinaryDigest, groupHistoricalRanges, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { exactPublicJsonReceipt, mergeScientificFileAndRecordChanges, mergeScientificOutput,
  qualifyScientificHistory, restoreScientificRecords, sameScienceValue, scienceText, scienceDigest } from './reader-scientific-delta.mjs';

export const loadShiftId = 'load-shift-107';
export const loadShiftChapter = '/docs/book/electricity-service-and-response';
export const loadShiftMarker = '时段信号与移峰幅度';
/** @type {string|null} */
export const loadShiftUnitPin = null;
/** @type {string|null} */
export const loadShiftCapturePin = '5dae17582ad63458fb4446539b4ead8b3f433794fcf09434e1d723639ab28dd3';
export const loadShiftSource = Object.freeze({
  commit: '11e297896af3d2dc094b160bea53474e040f3dc0',
  tree: '9dd83664c4f0fa17e8d4d0ed0cb893376b388bca',
  manifest: 'ae05f3d2424213b0576de002648e22b5917a3b7da56781cfef5ed4e6bab2f7bd',
  date: '2026-11-15',
});
export const loadShiftPredecessorPin = '7ff6019fb2a2b330d1d79308b5595dda1cc722b53ed115fe292d06519b535a2f';
export const loadShiftAddressPin = '85a34fb275fb20364d092091b780514fbf86a962d351f0b5c4c0856bc9be86e6';
const mdxPath = `content${loadShiftChapter}.mdx`;
const registryPath = 'scripts/case-publication.mjs';
const oldRegistrySha = 'f8d7c828acccad296eb9d5b4ab05f5ce88397ad7f022ccaf98b6629da7ec5a81';
const oldMdxSha = '49c0434c2b14eadf6afbf141da47f1c34ffd2819eca27812c892441c89c3162a';
const caseId = 'CASE-FINITE-LOAD-SHIFT', version = '1.0.0', inputFile = 'finite-load-shift-v1.json';
const resultFile = 'finite-load-shift-v1.evaluated.json';
const caseFiles = ['knowledge/cases/' + inputFile, 'knowledge/cases/finite-load-shift-v1.publication.json', 'scripts/finite-load-shift-case.mjs'];
const registryInsertion = [
  "import { finiteLoadShiftInputShape, validateFiniteLoadShiftCase, evaluateFiniteLoadShiftCase, validateFiniteLoadShiftFacts } from './finite-load-shift-case.mjs';\n",
  "  ['CASE-FINITE-LOAD-SHIFT', { shape: finiteLoadShiftInputShape, validate: validateFiniteLoadShiftCase,\n"
    + "    context: input => ({ evaluated: evaluateFiniteLoadShiftCase(input) }), validateFacts: validateFiniteLoadShiftFacts }],\n",
];
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectLoadShift(config, pin = loadShiftUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Load shift requires its explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== loadShiftId || !sameScienceValue(unit.source, loadShiftSource)
      || !sameScienceValue(unit.routes, [loadShiftChapter]) || !scienceText(unit.rationale)
      || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Load shift requires an exact precursor and bounded B12 plan');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !scienceDigest(pin) || editionDigest(unit) !== pin)
    throw new Error('Load shift is not independently accepted');
  return unit;
}

async function readRegular(root, path) {
  const target = join(root, path);
  if (!(await lstat(target)).isFile() || await realpath(target) !== target)
    throw new Error(`Load shift needs its exact physical file: ${path}`);
  return readFile(target);
}

export async function readLoadShiftCaseFiles(root, unit) {
  if (!unit) return new Map();
  const base = await realpath(root);
  return new Map(await Promise.all(caseFiles.map(async path => [path, await readRegular(base, path)])));
}

export function restoreLoadShiftFiles(files, previousMdx) {
  if (typeof previousMdx !== 'string' || sha256(previousMdx) !== oldMdxSha)
    throw new Error('Load shift lacks the exact preserved predecessor MDX bytes');
  const prior = new Map(files);
  for (const path of caseFiles) if (!prior.delete(path)) throw new Error(`Load shift lacks discovered raw case file: ${path}`);
  let registry = prior.get(registryPath)?.toString();
  for (const exact of registryInsertion) {
    if (registry?.split(exact).length !== 2) throw new Error('Load shift requires the exact closed registry addition');
    registry = registry.replace(exact, '');
  }
  if (sha256(registry) !== oldRegistrySha) throw new Error('Load shift changed unrelated case registry behavior');
  prior.set(registryPath, Buffer.from(registry));
  prior.set(mdxPath, Buffer.from(previousMdx));
  return prior;
}

function allowsRaw(kind, id, before) {
  if (before !== null) return false;
  const prefixes = {
    claims: 'cl-shift107-', evidence: 'ev-shift107-', sources: 'src-shift107-', readings: 'rd-shift107-',
    literature: 'work-shift107-', gaps: 'gap-shift107-',
  };
  if (prefixes[kind]) return id.startsWith(prefixes[kind]);
  return kind === 'revisions' && id === 'rev-finite-load-shift-107' || kind === 'queries' && id.includes('shift107');
}

function orderedSections(raw) {
  return raw.match(/^## .+$/gm) ?? [];
}
const tableRows = raw => raw.split(/\r?\n/).filter(line => line.startsWith('|'));
const sourceComponents = raw => (raw.match(/^(?:import|export)\s.+$|<\/?[A-Z][A-Za-z0-9.]*\b[^>]*>/gm) ?? [])
  .filter(value => !/^<\/?(?:Claim|Prose|ReaderSection)\b/.test(value));
const titleLine = raw => /^title:\s*.+$/m.exec(raw)?.[0];


export function prepareLoadShiftSource(unit, input, actual, structure) {
  const managed = new Set([mdxPath, registryPath, ...caseFiles]);
  const scope = new Set(unit.scope), file = new Map(), record = new Map();
  for (const row of unit.changes) {
    const table = row.kind === 'file' ? file : row.kind === 'record' ? record : null;
    const observed = (row.kind === 'file' ? actual.files : actual.records)[row.key];
    if (!table || table.has(row.key) || !scope.has(row.key) || !scienceText(row.rationale) || row.to == null
        || sameScienceValue(row.from, row.to) || !sameScienceValue(observed, row.to))
      throw new Error(`Load shift lacks its exact current transition: ${row.key}`);
    if (row.kind === 'file' && (!managed.has(row.key) || (caseFiles.includes(row.key) ? row.from !== null : !scienceDigest(row.from))))
      throw new Error(`Load shift cannot modify an unrelated or protected file: ${row.key}`);
    table.set(row.key, row);
  }
  if (file.size !== managed.size || scope.size !== unit.changes.length) throw new Error('Load shift lacks exact B12 and new case scope');
  const actualMdx = input.files.get(mdxPath).toString();
  const oldIds = collectChapterClaimOccurrences(unit.previousMdx), currentIds = actual.sourceOccurrences[mdxPath];
  const previous = new Set(oldIds);
  if (titleLine(unit.previousMdx) !== titleLine(actualMdx)
      || !sameScienceValue(sourceComponents(unit.previousMdx), sourceComponents(actualMdx))
      || !sameScienceValue(orderedSections(unit.previousMdx), orderedSections(actualMdx))
      || !sameScienceValue(tableRows(unit.previousMdx), tableRows(actualMdx))
      || !unique(currentIds, id => id) || !sameScienceValue(currentIds.filter(id => previous.has(id)), oldIds)
      || currentIds.some(id => !previous.has(id) && !id.startsWith('cl-shift107-')))
    throw new Error('Load shift changed old title, formal sections, components, table data, or canonical occurrences');
  const markers = raw => [...raw.matchAll(/<ReaderSection id="([^"]+)"\s*\/>/g)].map(match => match[1]);
  const beforeMarkers = markers(unit.previousMdx), afterMarkers = markers(actualMdx);
  const expectedMarkers = [...beforeMarkers.slice(0,3), loadShiftMarker, ...beforeMarkers.slice(3)];
  if (!sameScienceValue(afterMarkers, expectedMarkers)
      || !/^<ReaderSection id="时段信号与移峰幅度"\s*\/>\s*\n\s*<Prose ids="cl-shift107-/m.test(actualMdx))
    throw new Error('Load shift additions need their exact single native reader section');
  const sections = actualMdx.split(/^## /m);
  const owning = sections.find(text => text.includes(`id="${loadShiftMarker}"`));
  const newIds = collectChapterClaimOccurrences(owning?.split(`id="${loadShiftMarker}"`)[1] ?? '');
  const added = currentIds.filter(id => !previous.has(id));
  if (!owning?.startsWith('运行响应 ') || !sameScienceValue(newIds, added)
      || !sameScienceValue(unit.occurrences, currentIds)
      || !sameScienceValue(new Set(added).size, [...record.keys()].filter(key => key.startsWith('claims:')).length))
    throw new Error('Load shift has unreviewed or misplaced current body occurrences');

  const { catalog, readings, literature } = input;
  const previousRecords = restoreScientificRecords({ catalog, readings, literature }, unit.rawRecords, unit.rawFields, record, allowsRaw);
  const files = restoreLoadShiftFiles(input.files, unit.previousMdx);
  const inputs = { ...previousRecords, files };
  const state = inspectReadableBookEdition(inputs), priorStructure = copyeditSourceStructure(inputs);
  for (const row of file.values()) if ((state.files[row.key] ?? null) !== row.from)
    throw new Error(`Load shift cannot recover original physical identity: ${row.key}`);
  const verifyCurrentState = () => {
    if (unit.state?.before !== loadShiftPredecessorPin || editionDigest({ ...state, structure: priorStructure }) !== loadShiftPredecessorPin)
      throw new Error('Load shift did not recover the independently observed raw 11e2978 state');
    if (unit.state?.after !== editionDigest({ ...actual, structure }))
      throw new Error('Load shift current source state differs from the reviewed candidate');
  };
  const seedRecords = unit.changes.filter(row => !['researchMetadata:reading-ledger','researchMetadata:literature-map'].includes(row.key));
  const consumers = observeFlowBoundaryChanges(state, actual, seedRecords);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== consumers.length
      || unit.consumers.some(row => !consumers.includes(row.id) || !scienceText(row.rationale)))
    throw new Error('Load shift lacks exact cross-generation consumer review');
  return { previous: state, previousRecords, files, structure: priorStructure, verifyCurrentState,
    affectedClaimIds: [...new Set([...consumers, ...added])] };
}

export function effectiveLoadShift(previous, unit, affected = []) {
  if (!unit) return previous;
  return {
    ...previous, loadShift: unit, researchChanged: true, changes: mergeScientificFileAndRecordChanges(previous, unit),
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affected])],
    outputs: mergeScientificOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: mergeScientificOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

export function loadShiftEvaluationFile(binding) {
  return binding?.caseId === caseId && binding.version === version && binding.inputFile === inputFile ? resultFile : null;
}

function expectedCase(unit, entries, sourceCommit) {
  if (!/^[a-f0-9]{40}$/.test(sourceCommit ?? '') || unit.case?.id !== caseId || unit.case?.version !== version
      || unit.case?.inputFile !== inputFile || !scienceDigest(unit.case.inputSha256) || !scienceDigest(unit.case.evaluationSha256))
    throw new Error('Load shift lacks exact case version, output and source identity');
  const matching = entries.filter(entry => entry.inputFile === inputFile || entry.spec?.caseId === caseId);
  const [entry] = matching;
  if (matching.length !== 1 || entry.inputFile !== inputFile || entry.spec?.caseId !== caseId || entry.spec.version !== version
      || entry.publication?.inputFile !== inputFile || entry.publication.caseId !== caseId || entry.publication.version !== version
      || entry.publication.approvedInputSha256 !== unit.case.inputSha256 || validateFiniteLoadShiftCase(entry.spec).length)
    throw new Error('Load shift lacks its fixed registered author case');
  const input = canonicalCaseInput(entry.spec);
  const receipt = caseEvaluationReceipt(entry.spec, sourceCommit), { sourceCommit: _build, ...science } = receipt;
  if (sha256(input) !== unit.case.inputSha256 || editionDigest(science) !== unit.case.evaluationSha256)
    throw new Error('Load shift case digests differ from the actual evaluator');
  return [[inputFile,input,unit.case.inputSha256],[resultFile,`${JSON.stringify(receipt,null,2)}\n`,unit.case.evaluationSha256]];
}

function retainedPowerCase(entries, sourceCommit) {
  const id = 'CASE-POWER', retainedVersion = '1.0.0', file = 'electricity-service-v1.json';
  const inputSha256 = 'ea3923170eadd0b16fface8a178f6fd6b32a4cb50fa46588638c166be02d9e4c';
  const matches = entries.filter(entry => entry.inputFile === file || entry.spec?.caseId === id);
  const [entry] = matches;
  if (matches.length !== 1 || entry.inputFile !== file || entry.spec?.caseId !== id || entry.spec.version !== retainedVersion
      || entry.publication?.caseId !== id || entry.publication.version !== retainedVersion
      || entry.publication.inputFile !== file || entry.publication.approvedInputSha256 !== inputSha256)
    throw new Error('Load shift lacks the exact retained B12 power case');
  const input = canonicalCaseInput(entry.spec);
  if (sha256(input) !== inputSha256) throw new Error('Load shift retained B12 power input bytes changed');
  const evaluated = caseEvaluationReceipt(entry.spec, sourceCommit);
  const { sourceCommit: _build, ...science } = evaluated;
  return [[file, input, inputSha256], ['electricity-service-v1.evaluated.json',
    `${JSON.stringify(evaluated,null,2)}\n`, editionDigest(science)]];
}

async function readExactCaseOutputs(root, expected) {
  return Promise.all(expected.map(async ([file,content,contentSha256]) => {
    const path = 'downloads/cases/' + file, actual = await readRegular(root,path);
    if (!actual.equals(Buffer.from(content))) throw new Error(`Load shift actual case bytes or source identity differ: ${path}`);
    return { path, bytes: actual.length, sha256: sha256(actual), contentSha256 };
  }));
}

export async function observeLoadShiftCaseOutputs(root, unit, entries, sourceCommit) {
  if (!unit) return [];
  const base = await realpath(root);
  const current = expectedCase(unit, entries, sourceCommit);
  const retained = retainedPowerCase(entries, sourceCommit);
  const [currentFacts] = await Promise.all([readExactCaseOutputs(base, current), readExactCaseOutputs(base, retained)]);
  return currentFacts;
}

function capturedReceiptMatches(unit, observation, publicDownloads, entries) {
  if (!capture || editionDigest(capture) !== loadShiftCapturePin) return false;
  const identity = { ...capture.identity, normalizedProofSha256: editionDigest(capture.normalization) };
  if (!sameScienceValue(unit.outputCapture, identity) || !sameScienceValue(observation.capture, identity)
      || observation.sourceCommit !== identity.sourceCommit) return false;
  const articlesByRoute = unit.outputs.map(({path, route, sha256}) => ({path, route, sha256}));
  const publicHtml = unit.publicArtifacts.filter(row => row.path.endsWith('.html')).map(({path, sha256}) => ({path, sha256}));
  if (!sameScienceValue(articlesByRoute, capture.normalization.articles)
      || !sameScienceValue(publicHtml, capture.normalization.publicHtml)) return false;
  const rawFiles = new Map(capture.files.map(file => [file.path, file]));
  const articlePaths = [...new Set(unit.outputs.map(row => `${row.path.slice(1)}/index.html`))];
  const articles = articlePaths.map(path => rawFiles.get(path));
  if (articles.some(file => !file) || !sameScienceValue(observation.articleFiles, articles)) return false;
  const files = observation.artifactFiles;
  const caseChecks = expectedCase(unit, entries, observation.sourceCommit);
  const expectedContent = [...unit.publicArtifacts.map(row => [row.path, row.sha256]),
    ...caseChecks.map(([name, , content]) => ['downloads/cases/' + name, content])];
  if (!Array.isArray(files) || !unique(files, file => file.path)
      || !sameScienceValue(files.map(file => [file.path,file.contentSha256 ?? file.sha256]), expectedContent)) return false;
  for (const file of files) {
    const captured = rawFiles.get(file.path);
    if (!captured || captured.sha256 !== file.sha256 || captured.bytes !== file.bytes) return false;
    const model = caseChecks.find(([name]) => file.path === 'downloads/cases/' + name);
    if (model) {
      const [, bytes] = model;
      if (sha256(bytes) !== file.sha256 || Buffer.byteLength(bytes) !== file.bytes) return false;
    } else if (file.path.endsWith('.json') && !exactPublicJsonReceipt(file, publicDownloads.get(file.path))) return false;
  }
  return true;
}

export function verifyLoadShiftReceipts(unit, artifacts, publicDownloads, entries) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile,row.reportFile]), path => path)) return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const base = `_docs/editorial/review-evidence/${loadShiftId}/${row.kind}`;
    if (row.date < loadShiftSource.date || row.artifactFile !== `${base}-artifact.json` || row.reportFile !== `${base}-report.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => sameScienceValue(observations[key], value))) return false;
    if (row.kind !== 'output') return true;
    return observations.source === 'actual-export'
      && !['previewDownloads','forecast'].some(key => Object.hasOwn(artifact,key) || Object.hasOwn(observations,key))
      && capturedReceiptMatches(unit, observations, publicDownloads, entries);
  });
}

export function loadShiftOrdinaryId(unit, route, print, index) {
  if (!unit || route !== loadShiftChapter) return undefined;
  return `${print ? printUnitAnchor(route) : chapterAnchorPrefix(route)}-shift-107-ordinary-${index}`;
}

export function loadShiftHistoryControls(unit) {
  return groupHistoricalRanges(new Map((unit?.history.history ?? []).map(row =>
    [row.address, { ...row, previous: unit.history.previousAddresses[row.address] }])));
}

const ordinaryPattern = /-shift-107-ordinary-(?:\d+|table)$/;
export function observeLoadShiftOrdinaryTargets(docs) {
  return Object.fromEntries([...docs].flatMap(([path, doc]) => doc.querySelectorAll('p[id],table[id]')
    .filter(node => ordinaryPattern.test(node.id)).map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node), tag: node.tagName,
    }])));
}

export function qualifyLoadShiftHistory(documents, unit, actual) {
  if (!unit) return { prior: actual, errors: [] };
  const targets = observeLoadShiftOrdinaryTargets(documents);
  const prior = qualifyScientificHistory(unit.history, actual, targets, {
    label: 'Load shift', routes: [loadShiftChapter], predecessorPin: loadShiftAddressPin,
  });
  const errors = validateDatedHistoryOutput(documents, {
    expected: loadShiftHistoryControls(unit), source: loadShiftSource, attribute: 'load-shift',
    ordinaryPattern, label: 'Load shift', ordinaryTags: ['P','TABLE'],
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, row]) => [key,row.sha256])),
  });
  if (!sameScienceValue(targets, unit.history.ordinaryTargets))
    errors.push('Load shift actual versioned paragraph or eGRID table target differs');
  return { prior, errors };
}

export function loadShiftPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary,
    ...(['chapter', 'note-group'].includes(old.kind) && { title: old.title }),
    ...(old.kind === 'heading' && { visibleHeading: old.title }),
  };
}
