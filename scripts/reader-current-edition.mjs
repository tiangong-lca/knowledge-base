import { createHash } from 'node:crypto';
import { buildDependencies, publicCatalog } from './knowledge.mjs';
import { collectChapterClaimOccurrences } from './reader-book.mjs';

export const readableBookRecordKinds = ['claims', 'evidence', 'sources', 'concepts', 'mappings', 'coverage', 'readings', 'gaps', 'revisions', 'literature', 'queries', 'literatureGaps', 'researchMetadata'];

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const digestLike = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const object = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!object(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
}

export const editionDigest = value => sha256(JSON.stringify(canonical(value)));
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

function recordFamilies(catalog, readings, literature) {
  const { readings: readingRows, gaps: readingGaps, revisions, ...ledgerMetadata } = readings;
  const { records, gaps, protocol, ...literatureMetadata } = literature;
  const { queries, ...protocolMetadata } = protocol;
  return {
    ...Object.fromEntries(readableBookRecordKinds.slice(0, 6).map(kind => [kind, catalog[kind]])),
    readings: readingRows,
    gaps: readingGaps,
    revisions,
    literature: records,
    queries,
    literatureGaps: gaps,
    researchMetadata: [
      { id: 'reading-ledger', data: ledgerMetadata },
      { id: 'literature-map', data: literatureMetadata },
      { id: 'literature-protocol', data: protocolMetadata },
      { id: 'catalog-structure', data: Object.fromEntries(Object.entries(catalog).filter(([key]) => !readableBookRecordKinds.slice(0, 6).includes(key))) },
    ],
  };
}

const protectedClaim = ({ text, reviewedAt, reviewKind, ...rest }) => rest;

function recordFingerprints(catalog, readings, literature) {
  const result = new Map();
  const published = publicCatalog(catalog);
  const families = recordFamilies(catalog, readings, literature);
  const ordered = Object.entries(families).map(([kind, rows]) => ({ id: 'order:' + kind, ids: rows.map(row => row.id) }));
  families.researchMetadata.push(...ordered, {
    id: 'public-projection',
    keys: Object.keys(published),
    order: Object.entries(published).filter(([, rows]) => Array.isArray(rows)).map(([kind, rows]) => [kind, rows.map(row => row.id)]),
    dependencies: editionDigest(buildDependencies(published)),
  });
  for (const [kind, rows] of Object.entries(families)) {
    const publishedRows = new Map((published[kind] ?? []).map(row => [row.id, row]));
    for (const row of rows) {
      const key = `${kind}:${row.id}`;
      if (!nonempty(row.id) || result.has(key)) throw new Error(`Repeated or missing readable-book record identity: ${key}`);
      result.set(key, {
        raw: editionDigest(row),
        public: publishedRows.has(row.id) ? editionDigest(publishedRows.get(row.id)) : null,
        protected: editionDigest(kind === 'claims' ? protectedClaim(row) : row),
      });
    }
  }
  return result;
}

function bookDependencies(catalog, readings, literature) {
  const graph = buildDependencies(catalog);
  const add = (from, to) => {
    if (!nonempty(from) || !nonempty(to)) return;
    const edges = graph[from] ??= [];
    if (!edges.includes(to)) edges.push(to);
  };
  for (const record of literature.records) {
    for (const sourceId of record.catalogSourceIds ?? []) add(record.id, sourceId);
    for (const row of readings.readings) {
      if (row.workId === record.id || row.workId === record.workId) add(record.id, row.id);
    }
    add('literature-map', record.id);
    add('literature-protocol', record.id);
  }
  for (const row of readings.readings) add('reading-ledger', row.id);
  for (const record of catalog.claims) add('catalog-structure', record.id);
  return graph;
}

/** Fingerprint an actual source or record set before its acceptance is considered. */
export function inspectReadableBookEdition({ catalog, readings, literature, files }) {
  return {
    files: Object.fromEntries([...files].map(([path, bytes]) => [path, sha256(bytes)])),
    records: Object.fromEntries(recordFingerprints(catalog, readings, literature)),
    dependencies: bookDependencies(catalog, readings, literature),
    publishedClaims: publicCatalog(catalog).claims.map(row => row.id),
    bookUnitKeys: files.has('config/book-edition.json')
      ? JSON.parse(files.get('config/book-edition.json').toString()).units.map(unit => unit.key) : [],
    sourceOccurrences: Object.fromEntries([...files].filter(([path]) => /^content\/.+\.mdx?$/.test(path))
      .map(([path, bytes]) => [path, collectChapterClaimOccurrences(bytes.toString())])),
  };
}

function hasScope(scope, key) {
  return scope.includes(key);
}

export function readableBookReviewSubject(unit, kind) {
  const { reviewEvidence, outputs, publicArtifacts, ...manuscript } = unit;
  return editionDigest(kind === 'output' ? { ...manuscript, outputs, publicArtifacts } : manuscript);
}

export const validReadableBookReviewFile = path => typeof path === 'string'
  && /^_docs\/editorial\/review-evidence\/[a-z0-9-]+\/[a-z0-9-]+\.json$/.test(path);

export function verifyReadableBookReviewReceipts(unit, artifacts) {
  if (!Array.isArray(unit.reviewEvidence) || unit.reviewEvidence.length !== 3 || !(artifacts instanceof Map)) return false;
  const kinds = new Set(unit.reviewEvidence.map(row => row.kind));
  if (!['source', 'reader', 'output'].every(kind => kinds.has(kind))) return false;
  return unit.reviewEvidence.every(row => {
    const { kind, date, reportFile, artifactFile } = row;
    if (!validReadableBookReviewFile(reportFile) || !validReadableBookReviewFile(artifactFile) || reportFile === artifactFile
        || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || Number.isNaN(Date.parse(date))
        || new Date(date).toISOString().slice(0, 10) !== date) return false;
    const report = artifacts.get(reportFile), artifact = artifacts.get(artifactFile);
    if (!report || !artifact || sha256(report) !== row.reportSha256 || sha256(artifact) !== row.artifactSha256) return false;
    try {
      const observation = JSON.parse(artifact), receipt = JSON.parse(report);
      const subject = readableBookReviewSubject(unit, kind);
      return observation.schemaVersion === 1 && receipt.schemaVersion === 1
        && observation.kind === kind && receipt.kind === kind
        && observation.unit === unit.id && receipt.unit === unit.id
        && observation.subjectSha256 === subject && receipt.subjectSha256 === subject
        && observation.date === date && receipt.date === date
        && receipt.artifactSha256 === row.artifactSha256 && receipt.disposition === 'accepted'
        && same(observation.scope, unit.scope) && nonempty(observation.observed)
        && nonempty(receipt.findings) && nonempty(receipt.reviewer) && nonempty(receipt.provenance);
    } catch {
      return false;
    }
  });
}

const knownLayouts = new Set([
  'book:unit-keys', 'book:roster-pin', 'book:numbering-pin', 'book:formal-section-budget', 'book:notes-presentation', 'book:continuations',
  'B04:sections', 'B04:appendix-claims', 'B05:addition-metadata:cl-regional-sun-development-agenda',
  'B06:/docs/book/service-and-reference:navigation', 'B06:/docs/functional-unit:navigation', 'S03:web-headings',
  'B08:title', 'B08:headings', 'B08:ordinary-dispositions', 'S01:print-kind', 'S01:ordinary', 'S01:print-headings',
  'B09:description', 'B09:invoice-table', 'B10:headings', 'B10:registered-sections', 'B10:case-navigation:web', 'B10:case-navigation:book', 'B15:registered-sections', 'B25:registered-sections', 'B32:registered-sections',
  'B17:reverse-premise-consumers', 'B17:reverse-evidence-consumers', 'B17:reverse-concept-consumers',
  'B19:reader-source', 'B27:reader-source', 'B27:external-consumers',
  'B29:reader-source', 'B29:interaction-mode', 'B29:case-copy:web', 'B29:case-copy:book', 'B29:trace-column-label',
]);
for (const prefix of ['B05', 'B06', 'B07', 'B09']) {
  for (const field of ['title', 'headings', 'occurrences']) knownLayouts.add(`${prefix}:${field}`);
}
for (const [prefix, field, routes] of [
  ['B10', 'source', ['/monograph/joint-production', '/docs/allocation', '/docs/book/allocation-and-substitution', '/docs/book/allocation-judgment-and-corrections']],
  ['B15', 'reader-source', ['/monograph/climate-equivalence', '/docs/book/climate-response-and-metrics', '/docs/book/emission-time-and-assessment', '/docs/appendices/climate-numerical-reconstruction']],
  ['B17', 'source', ['/docs/book/particulate-emissions-and-health', '/docs/appendices/particulate-factor-calculations']],
  ['B25', 'reader-source', ['/monograph/data-applicability', '/docs/book/database-fitness-and-documentation', '/docs/book/review-support-and-version-boundaries']],
  ['B32', 'reader-source', ['/monograph/revisable-judgment', '/docs/book/connecting-objects-references-and-time', '/docs/book/from-connected-results-to-conditional-judgment']],
]) for (const route of routes) knownLayouts.add(`${prefix}:${route}:${field}`);

function knownLayout(key, actual) {
  return knownLayouts.has(key) || key.startsWith('book:unit-kind:') && actual.bookUnitKeys?.includes(key.slice('book:unit-kind:'.length));
}

function affectedBefore(graph, changed, claims) {
  const pending = [...changed];
  const seen = new Set(pending);
  for (let index = 0; index < pending.length; index++) {
    for (const next of graph[pending[index]] ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      pending.push(next);
    }
  }
  return claims.filter(id => seen.has(id));
}

function changedRecordIds(unit) {
  return unit.changes.filter(row => row.kind === 'record').map(row => row.key.slice(row.key.indexOf(':') + 1));
}

function unitAffectedClaims(unit, baseline, actual) {
  const changed = changedRecordIds(unit);
  const owned = new Set(unit.changes.filter(row => row.kind === 'record' && row.key.startsWith('claims:')).map(row => row.key.slice(7)));
  const required = new Set([
    ...affectedBefore(baseline.dependencies, changed, baseline.publishedClaims),
    ...affectedBefore(actual.dependencies, changed, actual.publishedClaims),
  ].filter(id => !owned.has(id)));
  return required;
}

function verifyConsumers(unit, baseline, actual) {
  const consumers = new Map(unit.consumers.map(row => [row.id, row.rationale]));
  if (consumers.size !== unit.consumers.length || [...consumers.values()].some(value => !nonempty(value))) return false;
  const required = unitAffectedClaims(unit, baseline, actual);
  return required.size === consumers.size && [...required].every(id => consumers.has(id));
}

/** Check independent unit pins before any runtime expectation is selected. */
export function pinnedReadableBookUnits(acceptance, baselineDigest, pins) {
  if (!acceptance || acceptance.schemaVersion !== 1 || acceptance.baselineDigest !== baselineDigest || !Array.isArray(acceptance.units)
      || !['pending', 'reviewed'].includes(acceptance.status) || acceptance.status === 'pending' && acceptance.units.length)
    throw new Error('Readable book requires its current acceptance inventory');
  if (!object(pins)) throw new Error('Readable book requires independent acceptance pins');
  const ids = new Set();
  for (const unit of acceptance.units) {
    if (!nonempty(unit?.id) || ids.has(unit.id)) throw new Error('Readable book acceptance units require unique identities');
    ids.add(unit.id);
    if (unit.status !== 'reviewed' || !Object.hasOwn(pins, unit.id)
        || !digestLike(pins[unit.id]) || editionDigest(unit) !== pins[unit.id])
      throw new Error(`Readable book unit is not independently accepted: ${unit.id}`);
  }
  for (const id of Object.keys(pins)) {
    if (!ids.has(id)) throw new Error(`Readable book acceptance is missing pinned unit: ${id}`);
  }
  return acceptance.units;
}

export function readableBookReviewPlan(units) {
  const changes = { file: new Map(), record: new Map() }, layouts = new Map();
  const migrations = [], readingEntries = new Set(), outputs = new Map(), publicArtifacts = new Map();
  for (const unit of units) {
    for (const change of unit.changes) {
      if (!Object.hasOwn(changes, change.kind) || changes[change.kind].has(change.key))
        throw new Error(`Readable book unit repeats or misclassifies a record: ${change.key}`);
      changes[change.kind].set(change.key, change);
    }
    for (const row of unit.layouts ?? []) {
      if (!nonempty(row.key) || !unit.scope.includes(row.key) || layouts.has(row.key)
          || !digestLike(row.from) || row.from === editionDigest(row.to) || !nonempty(row.rationale))
        throw new Error(`Readable book layout requires an exact, unique, scoped amendment: ${row.key}`);
      layouts.set(row.key, row);
    }
    for (const row of unit.outputs ?? []) {
      const key = `${row.path}#${row.route}`;
      if (!nonempty(row.path) || !nonempty(row.route) || !digestLike(row.sha256)
          || outputs.has(key) && outputs.get(key).sha256 !== row.sha256)
        throw new Error(`Readable book output receipts differ at ${key}`);
      outputs.set(key, row);
    }
    for (const row of unit.publicArtifacts ?? []) {
      if (!nonempty(row.path) || !digestLike(row.sha256)
          || publicArtifacts.has(row.path) && publicArtifacts.get(row.path).sha256 !== row.sha256)
        throw new Error(`Readable book public artifact receipts differ at ${row.path}`);
      publicArtifacts.set(row.path, row);
    }
    migrations.push(...unit.migrations ?? []);
    for (const key of unit.readingEntries ?? []) readingEntries.add(key);
  }
  return { changes, layouts, migrations, readingEntries, outputs, publicArtifacts };
}

/** Independently pinned records authorize only exact old-to-current transitions. */
export function qualifyReadableBookEdition(baseline, baselineDigest, acceptance, pins, actual, reviewArtifacts) {
  if (!digestLike(baselineDigest) || editionDigest(baseline) !== baselineDigest)
    throw new Error('Readable book requires its independently pinned integration baseline');
  const units = pinnedReadableBookUnits(acceptance, baselineDigest, pins);
  const errors = [], allowed = { file: new Map(), record: new Map() };
  const expected = { file: baseline.files, record: baseline.records };
  const observed = { file: actual.files, record: actual.records };
  const fixed = new Set(baseline.fixedFiles);
  const owners = { file: new Map(), record: new Map() };

  for (const unit of units) {
    if (!nonempty(unit.rationale) || !Array.isArray(unit.scope) || !unit.scope.length
        || unit.scope.some(key => !nonempty(key)) || new Set(unit.scope).size !== unit.scope.length
        || !Array.isArray(unit.changes) || !unit.changes.length || !Array.isArray(unit.consumers) || !verifyReadableBookReviewReceipts(unit, reviewArtifacts))
      throw new Error(`Readable book unit lacks complete scope, change or review evidence: ${unit.id}`);
    for (const row of unit.changes) {
      if (!Object.hasOwn(expected, row.kind) || !nonempty(row.key) || !hasScope(unit.scope, row.key)
          || !nonempty(row.rationale) || row.kind === 'file' && fixed.has(row.key))
        throw new Error(`Readable book unit attempts an unscoped or immutable change: ${unit.id} ${row.key}`);
      if (allowed[row.kind].has(row.key) || same(row.from, row.to))
        throw new Error(`Readable book unit repeats or does not change a record: ${row.key}`);
      const before = Object.hasOwn(expected[row.kind], row.key) ? expected[row.kind][row.key] : null;
      const after = Object.hasOwn(observed[row.kind], row.key) ? observed[row.kind][row.key] : null;
      if (!same(row.from, before) || !same(row.to, after) || row.to === null)
        throw new Error(`Readable book unit has a stale predecessor, missing successor or mismatched result: ${row.key}`);
      allowed[row.kind].set(row.key, row);
      owners[row.kind].set(row.key, unit.id);
    }
    if (unit.migrations !== undefined && (!Array.isArray(unit.migrations)
        || unit.migrations.some(row => !nonempty(row.address) || !hasScope(unit.scope, row.address))))
      throw new Error(`Readable book unit has an unscoped migration: ${unit.id}`);
    if (unit.readingEntries !== undefined && (!Array.isArray(unit.readingEntries)
        || unit.readingEntries.some(key => !nonempty(key) || !hasScope(unit.scope, key) || !actual.bookUnitKeys?.includes(key))))
      throw new Error(`Readable book unit has an unscoped current reading entry: ${unit.id}`);
    if ((unit.changes.some(row => row.kind === 'file' && (/^content\/.+\.mdx?$/.test(row.key)
          || ['app/global.css', 'components/teaching-case-client.tsx', 'components/joint-production-case.tsx'].includes(row.key)))
        || unit.changes.some(row => row.kind === 'record' && row.key.startsWith('claims:')))
        && (!Array.isArray(unit.outputs) || !unit.outputs.length))
      throw new Error(`Readable book unit lacks actual output receipts: ${unit.id}`);
    if (unit.layouts !== undefined && (!Array.isArray(unit.layouts) || unit.layouts.some(row => !knownLayout(row.key, actual)))) throw new Error(`Readable book unit has invalid layout amendments: ${unit.id}`);
    if (!verifyConsumers(unit, baseline, actual))
      throw new Error(`Readable book unit has missing or extraneous reviewed consumers: ${unit.id}`);
  }
  for (const kind of ['file', 'record']) {
    const keys = new Set([...Object.keys(expected[kind]), ...Object.keys(observed[kind])]);
    for (const key of keys) {
      if (same(expected[kind][key], observed[kind][key]) || allowed[kind].has(key)) continue;
      errors.push(`Readable book has an unaccepted ${kind}: ${key}`);
    }
  }
  const oldBody = new Set(Object.values(baseline.sourceOccurrences ?? {}).flat());
  const newBody = new Set(Object.values(actual.sourceOccurrences ?? {}).flat());
  for (const id of oldBody) {
    if (!newBody.has(id)) errors.push(`Readable book original body proposition has no current source occurrence: ${id}`);
  }
  const affectedClaimIds = [...new Set(units.flatMap(unit => [...unitAffectedClaims(unit, baseline, actual)]))];
  const researchChanged = units.some(unit => unit.changes.some(row => row.kind === 'record'
    && /^(sources|evidence|readings|literature|literatureGaps|researchMetadata):/.test(row.key)));
  return { ...readableBookReviewPlan(units), errors, owners, affectedClaimIds, researchChanged };
}

/** Resolve exact raw/public successor records in an old predicate, preserving its original fallback. */
export function matchesAcceptedRecord(qualification, kind, expected, actual, projection = 'raw') {
  if (same(expected, actual)) return true;
  if (!qualification || qualification.errors?.length || !actual || expected && expected.id !== actual.id) return false;
  const change = qualification.changes.record.get(`${kind}:${actual.id}`);
  return Boolean(change && (expected ? [change.from?.[projection], change.intermediate?.[projection]].includes(editionDigest(expected)) : change.from === null)
    && change.to?.[projection] === editionDigest(actual));
}

export function matchesAcceptedFile(qualification, path, expectedHash, actualHash) {
  if (expectedHash === actualHash) return true;
  const change = !qualification?.errors?.length && qualification?.changes.file.get(path);
  return Boolean(change && [change.from, change.intermediate].includes(expectedHash) && change.to === actualHash);
}
