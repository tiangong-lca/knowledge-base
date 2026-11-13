import { printUnitAnchor } from './reader-book.mjs';
import { editionDigest, readableBookReviewSubject, sha256, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';
import { readerCopyeditSource } from './reader-copyedit-pins.mjs';

const same = (a, b) => editionDigest(a ?? null) === editionDigest(b ?? null);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = value => typeof value === 'string' && Boolean(value.trim());

export const wallStaticCopy = Object.freeze({
  path: 'components/teaching-case-client.tsx',
  layout: 'B29:static-affine-caption',
  from: '连线是此固定模型的仿射关系，范围没有概率含义。',
  to: '在这个固定模型中，配对差值 Δ 与共同参数 θ 呈仿射关系；这里没有为 θ 指定概率分布。',
  beforeSha256: 'cf0e981ffe047f8b7fc47c9849342090a1eff91146482d226062ef0f1d3622f3',
  afterSha256: '6696b636d97d3e89df1871dfcb565d85a79f639268118136b1479a134468f465',
});

export function restoreWallStaticCopy(bytes) {
  const { from, to, beforeSha256, afterSha256 } = wallStaticCopy;
  if (sha256(bytes) !== afterSha256) return null;
  const restored = bytes.toString().replace(`<p>${to}</p>`, `<p>${from}</p>`);
  return sha256(restored) === beforeSha256 ? restored : null;
}

function assertWallStaticCopyPlan(unit) {
  const row = unit.changes.find(change => change.kind === 'file' && change.key === wallStaticCopy.path);
  const layout = unit.layouts?.find(layout => layout.key === wallStaticCopy.layout);
  if (Boolean(row) !== Boolean(layout) || row && (row.from !== wallStaticCopy.beforeSha256
      || row.to !== wallStaticCopy.afterSha256 || layout.from !== editionDigest(wallStaticCopy.from)
      || layout.to !== wallStaticCopy.to))
    throw new Error('Reader copyedit requires the exact paired wall static-caption source and display transition');
}

const sameDestination = (before, after) => {
  const destinations = value => [...value.matchAll(/\[[^\]]+\]\(([^)]*)\)/g)].map(match => match[1]);
  return text(after) && same(destinations(before), destinations(after));
};
const wording = (_before, after) => text(after);
const objectCopy = fields => (before, after) => before && after && typeof before === 'object'
  && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)
  && same(Object.keys(before).sort(), Object.keys(after).sort())
  && Object.keys(before).every(key => Object.hasOwn(fields, key) ? fields[key](before[key], after[key]) : same(before[key], after[key]));
const arrayCopy = row => (before, after) => Array.isArray(before) && Array.isArray(after)
  && before.length === after.length && before.every((original, index) => row(original, after[index]));
const rowCopy = fields => arrayCopy(objectCopy(fields));
const linkCopy = rowCopy({ text: wording, label: wording, title: wording, description: wording });
const ordinaryCopy = rowCopy({ text: wording, links: linkCopy, navigation: linkCopy });
const sectionCopy = rowCopy({ title: wording });
const headingCopy = rowCopy({ title: wording, text: wording });
const sourceCopy = objectCopy({
  title: wording, description: wording,
  headings: headingCopy, ordinary: ordinaryCopy, navigation: linkCopy,
});
const readerSourceCopy = objectCopy({ source: sourceCopy });
const pmSourceCopy = objectCopy({
  title: wording, description: wording,
  blocks: rowCopy({ title: wording, text: wording, links: linkCopy }),
});

export const egridTableCopy = Object.freeze({
  path: 'content/docs/book/electricity-service-and-response.mdx',
  route: '/docs/book/electricity-service-and-response',
  key: 'B12:egrid-table-description',
  label: 'eGRID2023 修订 2',
  from: '区域电厂的直接 CO₂ 年平均。分母是年净发电量。',
  to: '区域电厂的直接 CO₂ 年平均排放率，以年净发电量为分母。',
});

const containerChapter = '/docs/book/early-container-comparisons';
const containerAppendix = '/docs/appendices/container-energy-check';
export const containerPrintLinkLayout = 'B02:appendix-print-links';
export const containerPrintLinks = Object.freeze([
  [containerChapter, containerAppendix, '舍入界限'],
  [containerAppendix, containerChapter, '明细表能否重新组装总量'],
].map(([source, target, fragment]) => Object.freeze({
  source, target, fragment, href: `${target}/#${fragment}`, printId: `${printUnitAnchor(target)}-${fragment}`,
})));

const copyeditLayouts = new Map([
  [containerPrintLinkLayout, (before, after) => same(before, []) && same(after, containerPrintLinks)],
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
  ...['B05:headings', 'B09:headings', 'B25:registered-sections', 'B32:registered-sections']
    .map(key => [key, rowCopy({ title: (_before, after) => text(after) })]),
  ['S01:ordinary', rowCopy({ text: sameDestination })],
  ['B06:/docs/book/service-and-reference:navigation', rowCopy({ text: wording, linkText: wording })],
  ['B06:/docs/functional-unit:navigation', rowCopy({ text: wording, linkText: wording })],
  ['B08:ordinary-dispositions', rowCopy({ navigation: linkCopy })],
  ['B09:description', wording],
  ['B09:invoice-table', objectCopy({ introduction: wording, headers: arrayCopy(wording), explanation: wording })],
  ['B10:/docs/book/allocation-and-substitution:source', sourceCopy],
  ['B10:/docs/book/allocation-judgment-and-corrections:source', sourceCopy],
  ['B10:/monograph/joint-production:source', sourceCopy],
  ['B10:/docs/allocation:source', sourceCopy],
  ...[
    'B15:/docs/book/climate-response-and-metrics:reader-source',
    'B15:/docs/book/emission-time-and-assessment:reader-source',
    'B15:/monograph/climate-equivalence:reader-source',
    'B15:/docs/appendices/climate-numerical-reconstruction:reader-source',
    'B25:/docs/book/database-fitness-and-documentation:reader-source',
    'B25:/docs/book/review-support-and-version-boundaries:reader-source',
    'B25:/monograph/data-applicability:reader-source',
    'B32:/docs/book/connecting-objects-references-and-time:reader-source',
    'B32:/docs/book/from-connected-results-to-conditional-judgment:reader-source',
    'B32:/monograph/revisable-judgment:reader-source',
  ].map(key => [key, readerSourceCopy]),
  ['B17:/docs/book/particulate-emissions-and-health:source', pmSourceCopy],
  ['B17:/docs/appendices/particulate-factor-calculations:source', pmSourceCopy],
  ['B19:reader-source', objectCopy({ title: wording, description: wording, sections: sectionCopy })],
  ['B27:reader-source', objectCopy({ title: wording, description: wording, sections: sectionCopy,
    studyTable: objectCopy({ introduction: wording, headers: arrayCopy(wording), explanation: wording }) })],
  ['B29:reader-source', objectCopy({ title: wording, description: wording, sections: sectionCopy,
    ordinary: objectCopy({ web: ordinaryCopy, book: ordinaryCopy }) })],
  [egridTableCopy.key, (before, after) => before === egridTableCopy.from && after === egridTableCopy.to],
  [wallStaticCopy.layout, (before, after) => before === wallStaticCopy.from && after === wallStaticCopy.to],
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
  assertWallStaticCopyPlan(unit);
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
        tableBodies: handwrittenTableRows(path === egridTableCopy.path
          ? source.replace(`| ${egridTableCopy.label} | ${egridTableCopy.to} |`, `| ${egridTableCopy.label} | ${egridTableCopy.from} |`)
          : source),
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
  assertWallStaticCopyPlan(unit);
  const result = { file: new Map(previous.file), record: new Map(previous.record) };
  const used = new Set();
  for (const row of unit.changes) {
    const table = result[row.kind], id = `${row.kind}:${row.key}`;
    if (!table || used.has(id) || !text(row.rationale)
        || !(row.kind === 'file' ? copyeditPath(row.key) || row.key === wallStaticCopy.path : row.key.startsWith('claims:'))
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
  const egridLayout = unit.layouts.find(row => row.key === egridTableCopy.key);
  if (egridLayout && !unit.changes.some(row => row.kind === 'file' && row.key === egridTableCopy.path))
    throw new Error('Reader copyedit eGRID table text requires its exact source transition');
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
