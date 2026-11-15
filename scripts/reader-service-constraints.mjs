import { qualifyScientificHistory } from './reader-scientific-delta.mjs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { canonicalCaseInput, caseEvaluationReceipt, safeCaseInputFile } from './case-publication.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { editionDigest, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { observeFlowBoundaryChanges, groupHistoricalRanges, validateDatedHistoryOutput, flowBoundaryOrdinaryDigest } from './reader-flow-boundary.mjs';

export const serviceConstraintsId = 'service-constraints-102';
export const serviceConstraintsChapter = '/docs/book/inventory-calculation';
/** @type {string|null} */
export const serviceConstraintsUnitPin = '9b1ce22b366a857a0d83bbc253ed777f1576e5beb947eb984cbf19d006c786a0';
export const serviceConstraintsSource = Object.freeze({
  commit: '10dc686fe9316dbb42b91adefe821d9e55ea4e29',
  tree: 'd46f57a2d226a0b82dbff73e598b83792efb2ed7',
  manifest: 'f3c630419a38080dded2fe743352fbed69d014f009a1c54b5c321c61795ac258',
  date: '2026-11-15',
});
export const serviceConstraintsPredecessorPin = 'a0e17c26ae47dfdafa3014013f3e1186efff0e4e531cc7f246bbc1e0dd576a48';
export const serviceConstraintsAddressPin = '58e55580abfc4fb5ad1b2b4d49fa70127cb2fc8d05a52562d5e39024487fca14';

const previousNumberingPin = '60998231f0964b03145e3992e724d225f5a1511d8ee0f1508c5f543a511eda7c';
const layoutKeys = new Set(['B07:title', 'B07:headings', 'B07:occurrences']);
const caseRegistryPath = 'scripts/case-publication.mjs';
const managedConfiguration = new Set(['config/book-edition.json', 'config/reader-numbering.json']);
const caseRegistration = [
  "import { serviceConstraintsInputShape, validateServiceConstraintsCase, evaluateServiceConstraintsCase, validateServiceConstraintsFacts } from './service-constraints-case.mjs';\n",
  "  ['CASE-SERVICE-CONSTRAINTS', { shape: serviceConstraintsInputShape, validate: validateServiceConstraintsCase,\n"
    + "    context: input => ({ evaluated: evaluateServiceConstraintsCase(input) }), validateFacts: validateServiceConstraintsFacts }],\n",
];
const recordFamily = /^(claims|evidence|sources|concepts|mappings|coverage|readings|literature|queries|revisions|gaps|literatureGaps):[a-zA-Z0-9][a-zA-Z0-9-]+$/;
const derivedRecord = /^researchMetadata:(order:[a-zA-Z]+|public-projection|reading-ledger|literature-map)$/;
const aggregateRecords = new Set(['researchMetadata:reading-ledger', 'researchMetadata:literature-map']);
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === 'string' && Boolean(value.trim());
const same = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);
const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;

export function selectServiceConstraints(config, pin = serviceConstraintsUnitPin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Service constraints requires an explicit generation configuration');
  if (config.status === 'inactive' && config.unit === null && pin === null) return null;
  const { unit } = config;
  if (unit?.id !== serviceConstraintsId || !same(unit.source, serviceConstraintsSource)
      || !same(unit.routes, [serviceConstraintsChapter])
      || !text(unit.rationale) || !Array.isArray(unit.scope) || !unique(unit.scope, key => key)
      || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.layouts) || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Service constraints requires its exact predecessor, declared routes, and reviewed scope');
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !digest(pin) || editionDigest(unit) !== pin)
    throw new Error('Service constraints is not independently accepted');
  if (!unit.case) throw new Error('Service constraints requires its independently reviewed reproducible case');
  return unit;
}

function casePaths(unit) {
  if (!unit.case) return [];
  const { inputFile, evaluator } = unit.case;
  if (!safeCaseInputFile(inputFile) || !inputFile.endsWith('-v1.json')
      || typeof evaluator !== 'string' || !/^scripts\/service-constraints(?:-[a-z0-9]+)*\.mjs$/.test(evaluator))
    throw new Error('Service constraints has an invalid new versioned case path');
  return [`knowledge/cases/${inputFile}`, `knowledge/cases/${inputFile.slice(0, -5)}.publication.json`, evaluator];
}

async function readRegular(root, path) {
  const file = resolve(root, path);
  if (!file.startsWith(`${root}/`) && !file.startsWith(`${root}\\`))
    throw new Error(`Service constraints path is outside its root: ${path}`);
  if (!(await lstat(file)).isFile() || await realpath(file) !== file)
    throw new Error(`Service constraints requires a regular file: ${path}`);
  return readFile(file);
}

/** The earlier collector discovers publications, but not new raw inputs or their evaluators. */
export async function readServiceConstraintsFiles(root, unit) {
  if (!unit?.case) return new Map();
  const actualRoot = await realpath(root);
  return new Map(await Promise.all(casePaths(unit).map(async path => [path, await readRegular(actualRoot, path)])));
}

function admittedChanges(unit) {
  const result = { file: new Map(), record: new Map() };
  const mdx = new Set(unit.routes.map(route => `content${route}.mdx`));
  const files = new Set(casePaths(unit));
  const scope = new Set(unit.scope);
  for (const row of unit.changes) {
    const table = result[row.kind];
    if (!table || table.has(row.key) || !scope.has(row.key) || !text(row.rationale) || same(row.from, row.to) || row.to == null)
      throw new Error(`Service constraints has an invalid, repeated, or unreviewed transition: ${row.key}`);
    if (row.kind === 'file') {
      if (!digest(row.to) || (files.has(row.key)
        ? row.from !== null
        : !digest(row.from) || !mdx.has(row.key) && !managedConfiguration.has(row.key) && !(unit.case && row.key === caseRegistryPath)))
        throw new Error(`Service constraints has an out-of-scope file transition: ${row.key}`);
    } else {
      if (!recordFamily.test(row.key) && !derivedRecord.test(row.key))
        throw new Error(`Service constraints has an out-of-scope record: ${row.key}`);
      if (row.from !== null && /^(claims|evidence):/.test(row.key))
        throw new Error(`Service constraints cannot rewrite a prior claim or evidence record: ${row.key}`);
      if (row.kind === 'record' && row.key.startsWith('claims:') && !row.key.startsWith('claims:cl-service102-'))
        throw new Error(`Service constraints cannot publish an unrelated claim: ${row.key}`);
      for (const fingerprint of [row.from, row.to].filter(value => value !== null)) {
        if (!digest(fingerprint?.raw) || !digest(fingerprint?.protected)
            || fingerprint.public !== null && !digest(fingerprint.public))
          throw new Error(`Service constraints has an incomplete record fingerprint: ${row.key}`);
      }
    }
    table.set(row.key, row);
  }
  if (!result.file.has(`content${serviceConstraintsChapter}.mdx`) || [...files].some(path => !result.file.has(path)) || unit.case && !result.file.has(caseRegistryPath))
    throw new Error('Service constraints source scope must contain B07 and every declared new case file');
  return result;
}

function reverseRows(previous, actual, rows) {
  for (const { key, from, to } of rows) {
    if (!same(actual[key], to)) throw new Error(`Service constraints differs from actual source: ${key}`);
    if (from === null) delete previous[key];
    else previous[key] = from;
  }
}

function checkContinuity(kind, rows, approved, observed, verify) {
  const changes = [...rows.values()].filter(row => row.from !== null && row.key.startsWith(`${kind}:`));
  if (!Array.isArray(approved) || !unique(approved, row => row.id) || approved.length !== changes.length)
    throw new Error(`Service constraints needs each exact previous ${kind} record`);
  const prior = new Map();
  for (const row of changes) {
    const id = row.key.slice(kind.length + 1);
    const before = approved.find(record => record.id === id);
    const after = observed?.find(record => record.id === id);
    if (!before || !after || editionDigest(before) !== row.from.raw || editionDigest(after) !== row.to.raw)
      throw new Error(`Service constraints ${kind} record lacks evidenced before/after identity: ${id}`);
    verify(before, after);
    prior.set(id, before);
  }
  return prior;
}

function verifyReading(before, after) {
  const identity = ({ artifacts, passages, sourceKeys, appraisal, unread, checkedAt, ...rest }) => rest;
  if (!same(identity(before), identity(after))) throw new Error(`Service constraints changed an original reading identity: ${before.id}`);
  for (const field of ['artifacts', 'passages', 'sourceKeys']) {
    const prior = before[field] ?? [], observed = after[field] ?? [];
    if (!same(prior, observed.slice(0, prior.length)))
      throw new Error(`Service constraints must append rather than change ${field}: ${before.id}`);
  }
}

function verifySource(before, after) {
  const identity = ({ reading, ...fields }) => {
    const { scope, checkedAt, ...readingIdentity } = reading ?? {};
    return { fields, readingIdentity };
  };
  if (!same(identity(before), identity(after)))
    throw new Error(`Service constraints changed bibliographic or carrier identity: ${before.id}`);
}

function affectedClaims(before, after, rows) {
  const meaningful = rows.filter(row => !aggregateRecords.has(row.key));
  const consumers = observeFlowBoundaryChanges(before, after, meaningful);
  const changes = rows.filter(row => row.key.startsWith('claims:')).map(row => row.key.slice(7));
  return { consumers, all: [...new Set([...changes, ...consumers])] };
}

/** Validate current state and independently recover the exact state given to #99. */
export function prepareServiceConstraintsSource(unit, actual, structure, { catalog, readings, files },
  predecessorPin = serviceConstraintsPredecessorPin) {
  const { file, record } = admittedChanges(unit);
  const registry = file.get(caseRegistryPath);
  if (registry) {
    let predecessor = files?.get(caseRegistryPath)?.toString();
    for (const selection of caseRegistration) {
      if (predecessor?.split(selection).length !== 2)
        throw new Error('Service constraints requires its exact closed case registry addition');
      predecessor = predecessor.replace(selection, '');
    }
    if (sha256(predecessor) !== registry.from)
      throw new Error('Service constraints changed unrelated case registry behavior');
  }
  const before = unit.state?.before, after = unit.state?.after;
  const actualState = { ...actual, structure };
  if (!digest(predecessorPin) || before?.digest !== predecessorPin || !digest(after?.digest))
    throw new Error('Service constraints requires its exact predecessor and candidate state');
  const previous = {
    ...actualState, files: { ...actual.files }, records: { ...actual.records },
    sourceOccurrences: { ...actual.sourceOccurrences },
    structure: { claims: before.protectedClaims, files: { ...structure.files } },
    dependencies: before.dependencies, publishedClaims: before.publishedClaims,
  };
  reverseRows(previous.files, actual.files, file.values());
  reverseRows(previous.records, actual.records, record.values());
  for (const [field, previousRows, currentRows] of [
    ['structure', previous.structure.files, structure.files], ['occurrences', previous.sourceOccurrences, actual.sourceOccurrences],
  ]) {
    const rows = unit[field];
    if (!Array.isArray(rows) || !unique(rows, row => row.key)) throw new Error(`Service constraints lacks exact ${field} rows`);
    for (const row of rows) {
      if (!file.has(row.key) || same(row.from, row.to) || row.to == null)
        throw new Error(`Service constraints has an unbound ${field} transition: ${row.key}`);
      if (field === 'occurrences' && (!Array.isArray(row.from) || !Array.isArray(row.to)
          || !unique(row.to, id => id) || !same(row.to.filter(id => row.from.includes(id)), row.from)))
        throw new Error(`Service constraints omitted or repeated a prior occurrence: ${row.key}`);
      if (field === 'structure' && (!digest(row.to) || row.from !== null && !digest(row.from)))
        throw new Error(`Service constraints has an invalid structure fingerprint: ${row.key}`);
    }
    reverseRows(previousRows, currentRows, rows);
  }
  const sources = checkContinuity('sources', record, unit.previousSources ?? [], catalog.sources, verifySource);
  const priorReadings = checkContinuity('readings', record, unit.previousReadings ?? [], readings.readings, verifyReading);
  const previousRecords = {
    catalog: { ...catalog, sources: catalog.sources.map(source => sources.get(source.id) ?? source) },
    readings: { ...readings, readings: readings.readings.map(reading => priorReadings.get(reading.id) ?? reading) },
  };
  const added = section => new Set([...record.values()]
    .filter(row => row.from === null && row.key.startsWith(`${section}:`)).map(row => row.key.slice(section.length + 1)));
  const addedSourceIds = added('sources'), addedReadingIds = added('readings');
  previousRecords.catalog.sources = previousRecords.catalog.sources.filter(source => !addedSourceIds.has(source.id));
  previousRecords.readings.readings = previousRecords.readings.readings.filter(reading => !addedReadingIds.has(reading.id));
  const impact = affectedClaims(previous, actual, [...record.values()]);
  if (!unique(unit.consumers, row => row.id) || unit.consumers.length !== impact.consumers.length
      || unit.consumers.some(row => !impact.consumers.includes(row.id) || !text(row.rationale)))
    throw new Error('Service constraints lacks exact before/after consumer judgments');

  const verifyCurrentState = () => {
    if (editionDigest(previous) !== predecessorPin)
      throw new Error('Service constraints did not reconstruct the independently observed predecessor');
    if (editionDigest(actualState) !== after.digest) throw new Error('Service constraints lacks exact actual candidate state');
  };
  return { previous, previousRecords, affectedClaimIds: impact.all, verifyCurrentState };
}

export function serviceConstraintsLayout(unit, key, accepted) {
  if (!unit || !layoutKeys.has(key)) return accepted;
  if (!unique(unit.layouts, row => row.key) || unit.layouts.some(row => !layoutKeys.has(row.key)))
    throw new Error('Service constraints has an unrecognized or repeated chapter predicate');
  const row = unit.layouts.find(row => row.key === key);
  if (!row) return accepted;
  if (row.from !== editionDigest(accepted) || !text(row.rationale) || !Object.hasOwn(row, 'to') || same(row.to, accepted))
    throw new Error(`Service constraints has a stale B07 predecessor: ${key}`);
  if (key === 'B07:headings' && (!Array.isArray(row.to)
      || !same(row.to.map(value => value.id), accepted.map(value => value.id))))
    throw new Error('Service constraints must retain its formal B07 section identities');
  if (key === 'B07:occurrences') {
    if (!Array.isArray(row.to) || !unique(row.to, value => value.id))
      throw new Error('Service constraints must not duplicate a B07 occurrence');
    const priorIds = new Set(accepted.map(value => value.id));
    if (!same(row.to.filter(value => priorIds.has(value.id)), accepted))
      throw new Error('Service constraints must retain every B07 occurrence in its original section and relative order');
  }
  return row.to;
}

/** Preserve prior exact forms through another approved replacement. */
export function effectiveServiceConstraints(previous, unit, affectedClaimIds = []) {
  if (!unit) return previous;
  const changes = { file: new Map(previous.changes.file), record: new Map(previous.changes.record) };
  const approved = admittedChanges(unit);
  for (const [kind, table] of Object.entries(approved)) {
    for (const row of table.values()) {
      const prior = changes[kind].get(row.key);
      if (prior && !same(prior.to, row.from)) throw new Error(`Service constraints has a stale admitted predecessor: ${row.key}`);
      const predecessors = prior ? [...prior.predecessors ?? [prior.from, prior.intermediate].filter(value => value !== undefined), prior.to] : [row.from];
      changes[kind].set(row.key, { ...row, from: predecessors[0], intermediate: row.from, predecessors });
    }
  }
  function merge(existing, rows, key) {
    if (!unique(rows, key)) throw new Error('Service constraints repeated a current output identity');
    const current = new Map(existing);
    for (const row of rows) {
      const id = key(row);
      if (!text(row.rationale) || !digest(row.sha256) || current.get(id)?.sha256 !== row.from || row.sha256 === row.from)
        throw new Error(`Service constraints has a stale actual output predecessor: ${id}`);
      current.set(id, row);
    }
    return current;
  }
  return {
    ...previous, serviceConstraints: unit, changes, researchChanged: true,
    affectedClaimIds: [...new Set([...previous.affectedClaimIds ?? [], ...affectedClaimIds])],
    outputs: merge(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: merge(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
  };
}

/** Return predecessor numbering for the existing #99 numbering gate. */
export function projectServiceConstraintsNumbering(unit, actual) {
  if (!unit) return actual;
  const projected = structuredClone(actual);
  const rows = unit.numbering ?? [];
  if (!Array.isArray(rows) || !unique(rows, row => row.route)) throw new Error('Service constraints numbering repeats a route');
  for (const { route, before, after, title } of rows) {
    if (!unit.routes.includes(route) || !Array.isArray(before) || !Array.isArray(after)
        || !same(actual.headings[route], after)
        || !before.every(heading => after.some(next => next.id === heading.id && next.depth === heading.depth && next.type === heading.type)))
      throw new Error(`Service constraints numbering differs from the independently pinned hierarchy: ${route}`);
    projected.headings[route] = before;
    if (!title) continue;
    const slots = [...projected.web, ...projected.book].filter(row => row.source === route);
    if (!text(title.from) || !text(title.to) || title.from === title.to || !slots.length
        || slots.some(slot => slot.title !== title.to)) throw new Error(`Service constraints current numbered title differs: ${route}`);
    for (const slot of slots) slot.title = title.from;
  }
  if (sha256(JSON.stringify(projected)) !== previousNumberingPin)
    throw new Error('Service constraints numbering differs outside its independently pinned changes');
  return projected;
}

/** The extractor supplies the independently parsed reader scope and targets. */
export function qualifyServiceConstraintsHistory(unit, actual, ordinaryTargets) {
  return qualifyScientificHistory(unit.history, actual, ordinaryTargets, {
    label: 'Service constraints', routes: [serviceConstraintsChapter],
    predecessorPin: serviceConstraintsAddressPin,
  });
}

export function serviceConstraintsEvaluationFile(binding) {
  return binding?.caseId === 'CASE-SERVICE-CONSTRAINTS' && binding.version === '1.0.0'
    && binding.inputFile === 'service-constraints-v1.json'
    ? 'service-constraints-v1.evaluated.json'
    : null;
}

const releasePaths = unit => unit.case ? [
  `downloads/cases/${unit.case.inputFile}`,
  `downloads/cases/${unit.case.inputFile.slice(0, -5)}.evaluated.json`,
] : [];

function validatedCase(unit, entries) {
  if (!unit.case) return null;
  casePaths(unit);
  const declaration = unit.case;
  if (!/^CASE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(declaration.id ?? '') || declaration.version !== '1.0.0'
      || !digest(declaration.inputSha256) || !digest(declaration.evaluationSha256))
    throw new Error('Service constraints needs an exact reviewed case identity and both output digests');
  const matches = entries.filter(entry => entry.inputFile === declaration.inputFile || entry.spec?.caseId === declaration.id);
  if (matches.length !== 1) throw new Error('Service constraints needs exactly one registered new case');
  const [entry] = matches;
  if (entry.inputFile !== declaration.inputFile || entry.spec?.caseId !== declaration.id
      || entry.spec?.version !== declaration.version || entry.publication?.caseId !== declaration.id
      || entry.publication?.version !== declaration.version || entry.publication?.inputFile !== declaration.inputFile
      || entry.publication?.approvedInputSha256 !== declaration.inputSha256)
    throw new Error('Service constraints case files disagree with the reviewed release identity');
  return entry;
}

/** The production exporter stages both bytes before this independent qualification. */
export async function observeServiceConstraintsCaseOutputs(root, unit, entries, sourceCommit) {
  const entry = validatedCase(unit, entries);
  if (!entry) return [];
  if (!/^[a-f0-9]{40}$/.test(sourceCommit ?? ''))
    throw new Error('Service constraints case output requires independently verified build source identity');
  const paths = releasePaths(unit);
  const actualRoot = await realpath(root);
  const [input, evaluated] = await Promise.all(paths.map(path => readRegular(actualRoot, path)));
  const expectedInput = canonicalCaseInput(entry.spec);
  const expectedEvaluation = caseEvaluationReceipt(entry.spec, sourceCommit);
  const { sourceCommit: _build, ...evaluationContent } = expectedEvaluation;
  if (input.toString() !== expectedInput || sha256(input) !== unit.case.inputSha256)
    throw new Error('Service constraints actual input bytes differ from the approved public input');
  if (evaluated.toString() !== `${JSON.stringify(expectedEvaluation, null, 2)}\n`
      || editionDigest(evaluationContent) !== unit.case.evaluationSha256)
    throw new Error('Service constraints actual evaluation or its source identity differs from the approved case');
  return [
    { path: paths[0], bytes: input.length, sha256: sha256(input), contentSha256: unit.case.inputSha256 },
    { path: paths[1], bytes: evaluated.length, sha256: sha256(evaluated), contentSha256: unit.case.evaluationSha256 },
  ];
}

export function verifyServiceConstraintsReceipts(unit, artifacts, entries, publicDownloads) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts) || !unit.outputs.length || !unit.publicArtifacts.length
      || !unique(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]), path => path))
    return false;
  const expected = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: { outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses },
  };
  return unit.reviewEvidence.every(row => {
    const root = `_docs/editorial/review-evidence/${serviceConstraintsId}`;
    if (row.date < serviceConstraintsSource.date || row.reportFile !== `${root}/${row.kind}-report.json`
        || row.artifactFile !== `${root}/${row.kind}-artifact.json`) return false;
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const { observations } = artifact;
    if (!observations || !Object.entries(expected[row.kind]).every(([key, value]) => same(observations[key], value))) return false;
    if (row.kind !== 'output') return true;
    const forbidden = ['previewDownloads', 'forecast'];
    if (observations.source !== 'actual-export' || forbidden.some(key => Object.hasOwn(artifact, key) || Object.hasOwn(observations, key)))
      return false;
    const files = observations.artifactFiles;
    const paths = releasePaths(unit);
    const actual = [...unit.publicArtifacts.map(row => [row.path, row.sha256]), ...paths.map((path, i) =>
      [path, i === 0 ? unit.case.inputSha256 : unit.case.evaluationSha256])];
    if (!Array.isArray(files) || !unique(files, row => row.path)
        || !same(files.map(row => [row.path, row.contentSha256 ?? row.sha256]), actual)
        || !files.every(row => digest(row.sha256) && Number.isSafeInteger(row.bytes) && row.bytes > 0)) return false;
    for (const file of files.slice(0, unit.publicArtifacts.length)) {
      if (!file.path.endsWith('.json')) continue;
      const bytes = publicDownloads?.get(file.path);
      if (typeof bytes !== 'string' || file.sha256 !== (file.contentSha256 ?? file.sha256)
          || file.sha256 !== sha256(bytes) || file.bytes !== Buffer.byteLength(bytes)) return false;
    }
    const spec = validatedCase(unit, entries ?? [])?.spec;
    if (!spec || !/^[a-f0-9]{40}$/.test(observations.sourceCommit ?? '')) return false;
    const input = canonicalCaseInput(spec);
    const evaluation = caseEvaluationReceipt(spec, observations.sourceCommit);
    const { sourceCommit: _build, ...content } = evaluation;
    const evaluated = `${JSON.stringify(evaluation, null, 2)}\n`;
    if (editionDigest(content) !== unit.case.evaluationSha256) return false;
    // Other HTML receipts bind a normalized view; case downloads have a fully
    // deterministic byte representation under the captured source commit.
    return [input, evaluated].every((bytes, index) => {
      const file = files[unit.publicArtifacts.length + index];
      return file.sha256 === sha256(bytes) && file.bytes === Buffer.byteLength(bytes);
    });
  });
}

export function serviceConstraintsOrdinaryId(unit, route, print, index) {
  if (!unit || route !== serviceConstraintsChapter) return undefined;
  const prefix = print ? printUnitAnchor(route) : chapterAnchorPrefix(route);
  return `${prefix}-service-102-ordinary-${index}`;
}

export function serviceConstraintsHistoryControls(unit) {
  const ranges = new Map();
  for (const row of unit?.history.history ?? []) {
    const previous = unit.history.previousAddresses[row.address];
    ranges.set(row.address, { ...row, previous });
  }
  return groupHistoricalRanges(ranges);
}

const ordinaryPattern = /-service-102-ordinary-\d+$/;

export function observeServiceConstraintsOrdinaryTargets(documents) {
  return Object.fromEntries([...documents].flatMap(([path, document]) => document.querySelectorAll('p[id]')
    .filter(node => ordinaryPattern.test(node.id))
    .map(node => [`${path}#${node.id}`, {
      route: node.closest('article[data-reader-route]')?.getAttribute('data-reader-route'),
      sha256: flowBoundaryOrdinaryDigest(node),
    }])));
}

export function validateServiceConstraintsHistoryOutput(documents, unit) {
  if (!unit) return [];
  return validateDatedHistoryOutput(documents, {
    expected: serviceConstraintsHistoryControls(unit), source: serviceConstraintsSource, attribute: 'service-constraints',
    ordinaryPattern, label: 'Service constraints',
    ordinaryTargets: Object.fromEntries(Object.entries(unit.history.ordinaryTargets).map(([key, value]) => [key, value.sha256])),
  });
}

export function serviceConstraintsPreviousSurface(address, actual, unit) {
  const old = unit?.history.previousAddresses[address];
  return !actual || !old ? actual : { ...actual, claimIds: old.claimIds, ordinaryHashes: old.ordinary,
    ...(['chapter', 'note-group'].includes(old.kind) && { title: old.title }),
    ...(old.kind === 'heading' && { visibleHeading: old.title }),
  };
}
