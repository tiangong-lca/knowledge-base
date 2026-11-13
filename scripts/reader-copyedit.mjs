import { editionDigest, readableBookReviewSubject, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { readerCopyeditSource } from './reader-copyedit-pins.mjs';

const same = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === 'string' && Boolean(value.trim());

const sameDestination = (before, after) => {
  const destinations = value => [...value.matchAll(/\[[^\]]+\]\(([^)]*)\)/g)].map(match => match[1]);
  return text(after) && same(destinations(before), destinations(after));
};
const rowCopy = fields => (before, after) => Array.isArray(before) && Array.isArray(after)
  && before.length === after.length && before.every((original, index) => {
    const revised = after[index];
    if (!revised || !same(Object.keys(original).sort(), Object.keys(revised).sort())) return false;
    return Object.keys(original).every(key => Object.hasOwn(fields, key)
      ? fields[key](original[key], revised[key])
      : same(original[key], revised[key]));
  });

const copyeditLayouts = new Map([
  ['book:numbering-pin', (before, after) => hash(before) && hash(after)],
  ['book:continuations', rowCopy({
    sourceLabel: (_before, after) => text(after),
    bookLabel: (_before, after) => text(after),
    webContext: (_before, after) => text(after),
    bookContext: (_before, after) => text(after),
  })],
  ...Array.from({ length: 7 }, (_, index) => [`book:part-title:${index + 1}`, (_before, after) => text(after)]),
  ['B04:sections', rowCopy({ title: (_before, after) => text(after) })],
  ['B05:title', (_before, after) => text(after)],
  ['B05:headings', rowCopy({ title: (_before, after) => text(after) })],
  ['S01:ordinary', rowCopy({ text: sameDestination })],
]);

function assertCopyeditLayouts(rows) {
  const keys = new Set();
  for (const row of rows) {
    if (!copyeditLayouts.has(row.key) || keys.has(row.key) || !text(row.rationale)
        || !hash(row.from) || !Object.hasOwn(row, 'to') || row.from === editionDigest(row.to))
      throw new Error(`Reader copyedit has an invalid layout: ${row.key}`);
    keys.add(row.key);
  }
}

export function selectReaderCopyedit(config, pin, preview = false) {
  if (config?.schemaVersion !== 1) throw new Error('Reader copyedit requires its #95 inventory');
  if (config.status === 'inactive' && pin === null && Object.keys(config).length === 2) return null;
  const unit = config.unit;
  if (!unit || unit.id !== 'chinese-expression-95' || !same(unit.source, readerCopyeditSource)
      || !hash(unit.captureDigest) || !Array.isArray(unit.changes)
      || !Array.isArray(unit.layouts) || !Array.isArray(unit.consumers)
      || !Array.isArray(unit.ordinary) || !Array.isArray(unit.titles)
      || !Array.isArray(unit.outputs) || !Array.isArray(unit.publicArtifacts))
    throw new Error('Reader copyedit requires its exact #95 predecessor and plan');
  assertCopyeditLayouts(unit.layouts);
  if (preview && config.status === 'preview' && pin === null && unit.reviewEvidence === undefined) return unit;
  if (config.status !== 'reviewed' || !hash(pin) || editionDigest(unit) !== pin)
    throw new Error('Reader copyedit is not independently accepted');
  return unit;
}

const copyeditPath = path => /^content\/(?:docs|monograph)\/.+\.(?:mdx?|json)$/.test(path)
  || /^knowledge\/cases\/[^/]+\.publication\.json$/.test(path)
  || ['config/book-edition.json', 'config/reader-numbering.json'].includes(path);

function handwrittenTableRows(source) {
  const rows = source.split(/\r?\n/);
  const bodies = [];
  for (let index = 1; index < rows.length; index++) {
    if (!/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(rows[index]) || !/^\s*\|/.test(rows[index - 1])) continue;
    const body = [];
    while (++index < rows.length && /^\s*\|/.test(rows[index])) body.push(rows[index].trim());
    bodies.push(body);
  }
  return bodies;
}

export function copyeditSourceStructure({ catalog, files }) {
  const { claims } = catalog;
  const result = {
    claims: editionDigest(claims.map(({ text, ...record }) => record)),
    files: {},
  };
  for (const [path, bytes] of files) {
    if (!copyeditPath(path)) continue;
    const source = bytes.toString();
    if (/\.publication\.json$/.test(path)) {
      const { claims, ...metadata } = JSON.parse(source);
      result.files[path] = editionDigest({ ...metadata, claims: claims.map(({ textTemplate, ...claim }) => ({
        ...claim, tokens: textTemplate.match(/\{\{[^{}]+\}\}/g)?.sort() ?? [],
      })) });
    } else if (path === 'config/book-edition.json') {
      const { units, ...metadata } = JSON.parse(source);
      result.files[path] = editionDigest({ ...metadata, units: units.map(({ part, sections, ...row }) => ({
        ...row, ...(part === undefined ? {} : { part: true }),
        ...(sections === undefined ? {} : { sections: sections.map(({ title, ...section }) => section) }),
      })) });
    } else if (path === 'config/reader-numbering.json') {
      const { parts, book, web, headings, ...metadata } = JSON.parse(source);
      const unit = ({ title, ...row }) => row;
      result.files[path] = editionDigest({
        ...metadata, parts: parts.map(({ title, introduction, ...row }) => row), book: book.map(unit), web: web.map(unit),
        headings: Object.fromEntries(Object.entries(headings).map(([route, rows]) => [route, rows.map(unit)])),
      });
    } else if (path.endsWith('.json')) {
      const { title, description, ...metadata } = JSON.parse(source);
      result.files[path] = editionDigest(metadata);
    } else {
      const metadata = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)?.[1] ?? '';
      const executable = source.match(/^(?:import|export)\s.+$|<\/?[A-Z][A-Za-z0-9.]*\b[^>]*>/gm) ?? [];
      const components = executable.filter(value => !/^<\/?(?:Claim|Prose)\b/.test(value));
      result.files[path] = editionDigest({
        frontMatter: metadata.split(/\r?\n/).filter(line => !/^(title|description):/.test(line)),
        components,
        tableBodies: handwrittenTableRows(source),
      });
    }
  }
  return result;
}

export function copyeditLayout(key, previous, unit) {
  const row = unit?.layouts.find(item => item.key === key);
  if (!row) return previous;
  if (row.from !== editionDigest(previous)) throw new Error(`Reader copyedit layout has stale predecessor: ${key}`);
  if (!copyeditLayouts.get(key)?.(previous, row.to))
    throw new Error(`Reader copyedit layout changes protected structure: ${key}`);
  return row.to;
}

/** Preserve both the early predicate's starting value and the exact intermediate value. */
export function copyeditChanges(previous, unit) {
  if (!unit) return previous;
  const result = { file: new Map(previous.file), record: new Map(previous.record) };
  const used = new Set();
  for (const row of unit.changes) {
    const table = result[row.kind], id = `${row.kind}:${row.key}`;
    if (!table || used.has(id) || !text(row.rationale)
        || !(row.kind === 'file' ? copyeditPath(row.key) : row.key.startsWith('claims:'))
        || row.from === null || row.to === null || same(row.from, row.to)
        || row.kind === 'record' && (!hash(row.from?.protected) || row.from.protected !== row.to?.protected))
      throw new Error(`Reader copyedit has an invalid change: ${id}`);
    used.add(id);
    const predecessor = table.get(row.key);
    if (predecessor && !same(row.from, predecessor.to))
      throw new Error(`Reader copyedit has a stale predecessor: ${id}`);
    table.set(row.key, { ...row, from: predecessor ? predecessor.from : row.from, intermediate: row.from });
  }
  return result;
}

export function copyeditOutput(previous, rows, identity) {
  const result = new Map(previous), used = new Set();
  for (const row of rows) {
    const key = identity(row);
    if (used.has(key) || !hash(row.sha256) || !text(row.rationale)
        || previous.get(key)?.sha256 !== row.from || row.from === row.sha256)
      throw new Error(`Reader copyedit output has an invalid or stale predecessor: ${key}`);
    used.add(key);
    result.set(key, row);
  }
  return result;
}

const supportRoles = new Map([
  ['source', ['before-after', 'source-meaning-review']],
  ['reader', ['reader-review']],
  ['output', ['actual-output-review']],
]);
const supportDirectory = '_docs/editorial/review-evidence/chinese-expression-95/';

export function readerCopyeditSupportReferences(unit, artifacts) {
  const primary = new Set(unit.reviewEvidence.flatMap(row => [row.artifactFile, row.reportFile]));
  const files = new Set();
  const references = [];
  for (const row of unit.reviewEvidence) {
    const roles = supportRoles.get(row.kind);
    const observation = JSON.parse(artifacts.get(row.artifactFile));
    const support = observation?.supportingEvidence;
    if (!roles || !Array.isArray(support) || support.length !== roles.length
        || new Set(support.map(item => item.role)).size !== roles.length)
      throw new Error(`Reader copyedit has incomplete or repeated supporting evidence roles: ${row.kind}`);
    for (const item of support) {
      if (!roles.includes(item.role) || !text(item.label) || !hash(item.sha256)
          || item.file !== `${supportDirectory}${item.role}.json`
          || primary.has(item.file) || files.has(item.file))
        throw new Error(`Reader copyedit has invalid supporting evidence: ${item.role}`);
      files.add(item.file);
      references.push({ ...item, kind: row.kind, date: row.date, subjectSha256: readableBookReviewSubject(unit, row.kind) });
    }
  }
  return references;
}

export function verifyReaderCopyeditSupport(reference, unit, bytes) {
  const evidence = bytes && JSON.parse(bytes);
  return Boolean(evidence && sha256(bytes) === reference.sha256 && evidence.schemaVersion === 1
    && evidence.role === reference.role && evidence.unit === unit.id && evidence.kind === reference.kind
    && evidence.subjectSha256 === reference.subjectSha256 && evidence.date === reference.date
    && text(evidence.summary) && !Object.hasOwn(evidence, 'supportingEvidence'));
}

function verifyCopyeditReceipts(unit, previous, artifacts) {
  if (!verifyReadableBookReviewReceipts(unit, artifacts)
      || !unit.reviewEvidence.every(row => row.date >= readerCopyeditSource.capturedAt))
    return false;
  const output = effectiveReaderCopyedit(previous, unit);
  const changedClaim = unit.changes.some(row => row.kind === 'record');
  if (!unit.outputs.length || !output.outputs.size || !output.publicArtifacts.size
      || changedClaim && !unit.publicArtifacts.some(row => row.path === 'downloads/catalog.json')
      || !Array.isArray(unit.printParts) || unit.printParts.length !== 7
      || !unit.printParts.every(({ id, sha256 }, index) => id === `print-part-${index + 1}` && hash(sha256)))
    return false;

  try {
    if (!readerCopyeditSupportReferences(unit, artifacts).every(reference =>
      verifyReaderCopyeditSupport(reference, unit, artifacts.get(reference.file)))) return false;
  } catch {
    return false;
  }

  const articles = [...output.outputs.values()].map(({ path, route, sha256 }) => ({ path, route, sha256 }));
  const publicArtifacts = [...output.publicArtifacts.values()].map(({ path, sha256 }) => ({ path, sha256 }));
  const key = row => `${row.path}#${row.route}`;
  return unit.reviewEvidence.every(row => {
    const artifact = JSON.parse(artifacts.get(row.artifactFile));
    const observed = artifact.observations;
    if (!observed) return false;
    if (row.kind === 'source') return same(observed.changes, unit.changes) && same(observed.consumers, unit.consumers);
    if (row.kind === 'reader') {
      if (!Array.isArray(observed.articles) || observed.articles.length !== articles.length) return false;
      const observedByKey = new Map(observed.articles.map(entry => [key(entry), entry]));
      return articles.every(entry => {
        const checked = observedByKey.get(key(entry));
        return checked?.sha256 === entry.sha256 && text(checked.judgment);
      });
    }
    return same(observed.articles, articles) && same(observed.publicArtifacts, publicArtifacts)
      && same(observed.printParts, unit.printParts);
  });
}

/** Reconstruct only the prior accepted fingerprints, then compare current source independently. */
export function qualifyReaderCopyedit({ unit, actual, sourceStructure, capture, previous, artifacts }) {
  if (!verifyCopyeditReceipts(unit, previous, artifacts)) throw new Error('Reader copyedit lacks actual, complete source, reader or output review evidence');
  return verifyReaderCopyeditSource({ unit, actual, sourceStructure, capture, previous });
}

export function verifyReaderCopyeditSource({ unit, actual, sourceStructure, capture, previous }) {
  if (!Array.isArray(unit.scope) || !unit.scope.length || new Set(unit.scope).size !== unit.scope.length
      || !unit.scope.every(text) || !text(unit.rationale) || !unit.changes.length)
    throw new Error('Reader copyedit requires exact reviewed scope');
  if (unit.captureDigest !== editionDigest(capture) || !same(capture.structure, sourceStructure)
      || !same(capture.sourceOccurrences, actual.sourceOccurrences)
      || !same(capture.dependencies, editionDigest(actual.dependencies))
      || !same(capture.publishedClaims, editionDigest(actual.publishedClaims)))
    throw new Error('Reader copyedit changed protected source structure or ordered claim membership');

  copyeditChanges(previous.changes, unit);
  for (const row of [...unit.changes, ...unit.layouts]) {
    if (!unit.scope.includes(row.key)) throw new Error(`Reader copyedit change lacks review scope: ${row.key}`);
  }
  const previousState = { ...actual, files: { ...actual.files }, records: { ...actual.records } };
  for (const row of unit.changes) {
    const field = row.kind === 'file' ? 'files' : 'records';
    if (!same(actual[field][row.key], row.to)) throw new Error(`Reader copyedit successor differs from actual source: ${row.key}`);
    previousState[field][row.key] = row.from;
  }

  if (capture.predecessor !== editionDigest({ files: previousState.files, records: previousState.records }))
    throw new Error('Reader copyedit predecessor differs from the actual 8148 source');

  assertCopyeditLayouts(unit.layouts);
  const changedClaimIds = new Set(unit.changes.filter(row => row.kind === 'record').map(row => row.key.slice(7)));
  const consumers = new Set(changedClaimIds), queue = [...changedClaimIds];
  for (const id of queue) for (const dependent of actual.dependencies[id] ?? []) {
    if (!consumers.has(dependent)) {
      consumers.add(dependent);
      queue.push(dependent);
    }
  }
  const required = actual.publishedClaims.filter(id => consumers.has(id) && !changedClaimIds.has(id));
  const observed = new Set(unit.consumers.map(row => row.id));
  if (observed.size !== unit.consumers.length || !unit.consumers.every(row => text(row.rationale))
      || required.length !== observed.size || !required.every(id => observed.has(id)))
    throw new Error('Reader copyedit lacks exact reviewed affected consumers');
  return { previousState, required };
}

export function effectiveReaderCopyedit(previous, unit) {
  if (!unit) return previous;
  return {
    ...previous,
    changes: copyeditChanges(previous.changes, unit),
    outputs: copyeditOutput(previous.outputs, unit.outputs, row => `${row.path}#${row.route}`),
    publicArtifacts: copyeditOutput(previous.publicArtifacts, unit.publicArtifacts, row => row.path),
    copyedit: unit,
  };
}
