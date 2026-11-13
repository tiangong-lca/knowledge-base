import { currentBookLayout, currentBookMdxMatches, currentBookFileMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual as same } from 'node:util';
import original from '../config/pm-selection-original.json' with { type: 'json' };
import { publicCatalog } from './knowledge.mjs';
import { chapterAnchorPrefix, chapterNoteAnchor, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { concealedText, qualifyHeadingCopyButtons, trustedFrameworkSvg } from './reader-data-applicability.mjs';
import { unaccountedReaderText, validateExchangeAnnotationOutput } from './reader-exchange-semantics.mjs';
import { isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { printReadingEntryAnchor } from './reader-numbering.mjs';
import { readablePedigreeCaseExpectation } from './reader-readable-pedigree.mjs';
import { applyCurrentHistoricalEntries, readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const pmSelectionRoute = '/docs/book/particulate-emissions-and-health';
export const pmSelectionAppendix = '/docs/appendices/particulate-factor-calculations';
export const pmSelectionOriginalDigest = 'ca311ee9afa96197c49e220649b1a35887060acd42f5e1d54288bfda2d0ea7ec';
// Set only after the independently reviewed manuscript and closure are available.
/** @type {string|null} */
export const pmSelectionAcceptedDigest = 'e8ada7b830bcaa9dfdd73d5ed480749cc342659b5b98ebe18f9d2f6827c82e6b';
const routes = [pmSelectionRoute, pmSelectionAppendix];
const titles = ['颗粒物健康', '颗粒物因子的连接与复算'];
const hash = value => createHash('sha256').update(value).digest('hex');
export const pmSelectionDigest = value => hash(JSON.stringify(value));
const digestLike = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const dateLike = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const unique = values => [...new Set(values)];
const ids = rows => rows.map(row => row.id);
const byId = rows => new Map(rows.map(row => [row.id, row]));
const exactIds = (rows, expected) => Array.isArray(rows) && same(ids(rows).sort(), [...expected].sort());
const includes = (rows, fixed) => {
  const index = byId(rows);
  return fixed.every(row => same(index.get(row.id), row));
};
const claimIds = unit => unit.blocks.filter(block => block.kind === 'claims').flatMap(block => block.ids);
const sectionBlocks = unit => unit.blocks.filter(block => block.kind === 'section');
const sections = unit => sectionBlocks(unit).map(({ id, title }) => ({ id, title }));
const address = row => `${row.path}#${row.id}`;
const headingText = node => node.text.replace(/复制章节链接$/, '');
const ordinaryLink = /\[([^\]\n]+)\]\((\/[^)\s]+)\)/g;

export function assertPmSelectionOriginal(value = original) {
  if (pmSelectionDigest(value) !== pmSelectionOriginalDigest)
    throw new Error('PM selection immutable bb12 scientific and publication inventory differs');
}

/** Canonical prose and visible navigation share the ordered block plan. */
export function inspectPmSelectionSource(route, source) {
  if (typeof source !== 'string') throw new Error(`PM selection missing actual source: ${route}`);
  const raw = source.replaceAll('\r\n', '\n');
  const front = /^---\ntitle: ([^\n]+)\ndescription: ([^\n]+)\n---\n/.exec(raw);
  if (!front) throw new Error(`PM selection invalid title and description: ${route}`);
  const blocks = raw.slice(front[0].length).trim().split(/\n[ \t]*\n/).map(block => {
    const heading = /^## (.+)$/.exec(block);
    if (heading) {
      const explicit = /^(.*?) \[#([^\]]+)\]$/.exec(heading[1]);
      return { kind: 'section', id: explicit?.[2] ?? heading[1], title: explicit?.[1] ?? heading[1] };
    }
    if (/^<Prose ids="[^"\n]+" \/>$/.test(block)) return { kind: 'claims', ids: collectChapterClaimOccurrences(block) };
    const links = [...block.matchAll(ordinaryLink)].map(([, label, href]) => ({ href, label }));
    const text = block.replace(ordinaryLink, '$1');
    if (!links.length || /[\n<>\[\]`*_]/.test(text)) throw new Error(`PM selection unsupported ordinary reader block: ${route}`);
    return { kind: 'navigation', text, links };
  });
  return { route, title: front[1], description: front[2], mdxSha256: hash(raw), blocks };
}

function hasCompleteSections(unit) {
  const positions = unit.blocks.flatMap((block, index) => block.kind === 'section' ? [index] : []);
  return positions.length === 4 && unique(sectionBlocks(unit).map(block => block.id)).length === 4
    && unit.blocks.slice(0, positions[0]).every(block => block.kind === 'navigation')
    && positions.every((index, section) => unit.blocks.slice(index + 1, positions[section + 1] ?? unit.blocks.length)
      .some(block => block.kind === 'claims' && block.ids.length));
}

function preservesOriginalEvidence(current, before) {
  if (before.id !== 'ev-kb46-gronlund2015-burden-comparison') return same(current, before);
  if (same(current, before)) return true;
  if (!current?.appraisal || !before.appraisal) return false;
  const { limitations, checkedAt, ...appraisal } = current.appraisal;
  return Array.isArray(limitations) && typeof limitations[0] === 'string' && limitations[0].trim().length > 0
    && same(limitations.slice(1), before.appraisal.limitations.slice(1))
    && dateLike(checkedAt) && checkedAt > before.appraisal.checkedAt
    && same({ ...current, appraisal: { ...appraisal, limitations: before.appraisal.limitations, checkedAt: before.appraisal.checkedAt } }, before);
}

function preservesOriginalReading(current, before) {
  if (!current) return false;
  const { artifacts, passages, ...identity } = current;
  const { artifacts: oldArtifacts, passages: oldPassages, ...oldIdentity } = before;
  return Array.isArray(artifacts) && Array.isArray(passages) && same(identity, oldIdentity)
    && same(artifacts.slice(0, oldArtifacts.length), oldArtifacts)
    && same(passages.slice(0, oldPassages.length), oldPassages);
}

/** @param {any} accepted @param {string|null} [independentDigest] */
export function assertPmSelectionAccepted(accepted, independentDigest = pmSelectionAcceptedDigest) {
  assertPmSelectionOriginal();
  if (accepted?.schemaVersion !== 1 || accepted.status !== 'reviewed' || accepted.originalDigest !== pmSelectionOriginalDigest
      || !digestLike(independentDigest) || pmSelectionDigest(accepted) !== independentDigest)
    throw new Error('PM selection requires independently reviewed current content; acceptance is incomplete');
  const units = accepted.units;
  if (!Array.isArray(units) || !same(units.map(unit => unit.route), routes) || !same(units.map(unit => unit.title), titles)
      || units.some(unit => !digestLike(unit.mdxSha256) || !unit.description?.trim() || !Array.isArray(unit.blocks)
        || !hasCompleteSections(unit)))
    throw new Error('PM selection requires both exact current reading units and formal sections');
  const ordered = units.flatMap(claimIds), current = byId(accepted.claims ?? []);
  const protectedIds = new Set([...original.particulateCase.claimIds, ...original.conceptUses.toxicityPinnedAdjacentClaimIds]);
  if (ordered.length !== 54 || unique(ordered).length !== ordered.length || !same(ids(accepted.claims ?? []), ordered)
      || original.orderedClaimIds.some(id => !current.has(id)) || accepted.claims.some(row => row.status !== 'reviewed'
        || !dateLike(row.reviewedAt) || !row.id.startsWith('cl-pm-') || !row.evidenceIds.length && !row.premiseIds.length))
    throw new Error('PM selection requires exactly 48 conserved and six new reviewed propositions, each used once');
  for (const before of original.claims) {
    const after = current.get(before.id);
    if (same(after, before)) continue;
    if (protectedIds.has(before.id) || after.reviewedAt <= before.reviewedAt || before.kind !== after.kind
        || before.evidenceLinks.some(link => !after.evidenceLinks.some(current => same(current, link)))
        || ['evidenceIds', 'premiseIds', 'conceptIds', 'mappingIds', 'caveats'].some(key => before[key].some(value => !after[key].includes(value))))
      throw new Error(`PM selection changes a protected case/toxicity record or omits original metadata/review: ${before.id}`);
  }
  const closure = accepted.scientificClosure;
  const externalPremises = unique(accepted.claims.flatMap(row => row.premiseIds)).filter(id => !current.has(id));
  const evidenceIds = unique(accepted.claims.flatMap(row => row.evidenceIds));
  if (!closure || !exactIds(closure.claims, externalPremises) || !exactIds(closure.evidence, evidenceIds)
      || !exactIds(closure.sources, unique(closure.evidence.map(row => row.sourceId)))
      || !includes(closure.sources, original.scientificClosure.sources)
      || !includes(closure.concepts, original.conceptUses.concepts) || !includes(closure.mappings, original.conceptUses.mappings))
    throw new Error('PM selection scientific closure omits an original source, concept, mapping, evidence or premise');
  const evidence = byId(closure.evidence), originalEvidence = byId(original.scientificClosure.evidence);
  for (const row of original.scientificClosure.evidence)
    if (!preservesOriginalEvidence(evidence.get(row.id), row)) throw new Error(`PM selection changes an original evidence identity: ${row.id}`);
  if (closure.evidence.some(row => !originalEvidence.has(row.id) && !row.id.startsWith('ev-kb90-')))
    throw new Error('PM selection new evidence must have its own scoped identity');
  const usedMappings = new Set([...original.conceptUses.mappings.map(row => row.id), ...accepted.claims.flatMap(row => row.mappingIds)]);
  const usedConcepts = new Set([...original.conceptUses.concepts.map(row => row.id), ...accepted.claims.flatMap(row => row.conceptIds), ...closure.mappings.flatMap(row => [row.from, row.to])]);
  if (!exactIds(closure.concepts, usedConcepts) || !exactIds(closure.mappings, usedMappings)) throw new Error('PM selection concept and mapping closure differs');
  assertPmSelectionResearch(accepted.research, closure);
  const reviews = accepted.reviewEvidence;
  if (!Array.isArray(reviews) || reviews.length < 3 || unique(reviews.map(row => row.kind)).length !== reviews.length
      || reviews.some(row => !row.kind?.trim() || !digestLike(row.reportSha256) || !digestLike(row.receiptSha256))
      || ['source', 'reader', 'engineering'].some(scope => !reviews.some(row => row.kind.includes(scope))))
    throw new Error('PM selection requires separate source, reader and engineering evidence');
}

const auditPrefixes = { gaps: 'gap-kb90-', revisions: 'rev-kb90-', queries: 'q-kb90-' };
function assertPmSelectionResearch(research, closure) {
  const wantedReadings = unique([...closure.evidence.map(row => row.readingId), ...closure.sources.map(row => row.reading?.readingId)]);
  if (!research || !exactIds(research.readings, wantedReadings) || !Array.isArray(research.literature)
      || !includes(research.literature, original.readingClosure.literature)) throw new Error('PM selection research reading or work closure differs');
  const readings = byId(research.readings), sources = byId(closure.sources);
  const wantedWorks = unique(research.readings.map(row => row.workId));
  if (research.literature.length !== wantedWorks.length
      || wantedWorks.some(id => research.literature.filter(row => row.id === id || row.workId === id).length !== 1)
      || original.readingClosure.readings.some(row => !preservesOriginalReading(readings.get(row.id), row)))
    throw new Error('PM selection changes an original reading, passage or carrier');
  for (const row of closure.evidence) {
    const reading = readings.get(row.readingId);
    const passage = reading?.passages.find(passage => passage.id === row.passageId);
    if (sources.get(row.sourceId)?.reading?.readingId !== row.readingId || !passage
        || reading.artifacts.filter(artifact => artifact.id === passage.artifactId).length !== 1)
      throw new Error(`PM selection evidence lacks its exact inspected passage and carrier: ${row.id}`);
  }
  if (Object.entries(auditPrefixes).some(([kind, prefix]) => !Array.isArray(research[kind])
      || unique(ids(research[kind])).length !== research[kind].length || research[kind].some(row => !row.id.startsWith(prefix)))
      || !research.revisions.length)
    throw new Error('PM selection requires bounded revision, gap and query identities');
}

/** @param {any} edition @param {any} [accepted] */
export function assertPmSelectionRegistration(edition, accepted) {
  const matches = edition?.units?.filter(unit => routes.includes(unit.key) || routes.includes(unit.source));
  if (!matches || matches.length !== 2 || !same(matches.map(unit => unit.key), routes)
      || matches.some((unit, index) => unit.key !== unit.source || unit.kind !== (index ? 'appendix' : 'chapter') || unit.coverage)
      || matches[0].part !== currentBookLayout('book:part-title:4', '环境后果') || matches[1].part
      || accepted && matches.some((unit, index) => !same(unit.sections, sections(currentBookLayout(`B17:${unit.key}:source`, accepted.units[index])))))
    throw new Error('PM selection requires the shared PM chapter and calculation appendix registration');
}

function validatePmCatalog(catalog, accepted, projection) {
  const closure = accepted.scientificClosure;
  const groups = {
    claims: [...accepted.claims, ...closure.claims, ...original.directPremiseConsumers, ...original.directExternalEvidenceConsumers, ...original.externalSharedConceptConsumers, ...original.conceptUses.externalDefinitionsAndMappings],
    evidence: closure.evidence, sources: closure.sources, concepts: closure.concepts, mappings: closure.mappings,
  };
  let expected = groups;
  if (projection === 'public') {
    const reference = { ...catalog };
    for (const [kind, rows] of Object.entries(groups)) {
      const fixed = byId(rows);
      reference[kind] = catalog[kind].filter(row => !fixed.has(row.id)).concat([...fixed.values()]);
    }
    expected = publicCatalog(reference);
  }
  const errors = [];
  for (const [kind, rows] of Object.entries(groups)) {
    const actual = byId(catalog[kind]), reviewed = byId(expected[kind]);
    for (const row of byId(rows).values()) if (!currentBookRecordMatches(kind, reviewed.get(row.id), actual.get(row.id), projection))
      errors.push(`PM selection reviewed ${kind} record differs: ${row.id}`);
  }
  // A preserved record list alone cannot detect a newly added dependent use.
  // Compare published reverse edges as well as the exact original consumers.
  // Unpublished research drafts do not become publication consumers here.
  const pmIds = new Set(ids(accepted.claims));
  /** @type {[string, string, Set<string>, any[]][]} */
  const reverseUses = [
    ['premise', 'premiseIds', pmIds, original.directPremiseConsumers],
    ['evidence', 'evidenceIds', new Set(ids(closure.evidence)), original.directExternalEvidenceConsumers],
    ['concept', 'conceptIds', new Set(ids(closure.concepts)), original.externalSharedConceptConsumers],
  ];
  for (const [kind, field, referenced, frozen] of reverseUses) {
    const actual = catalog.claims.filter(row => row.status === 'reviewed' && !pmIds.has(row.id)
      && row[field].some(id => referenced.has(id)));
    if (!exactIds(actual, currentBookLayout(`B17:reverse-${kind}-consumers`, frozen.filter(row => row.status === 'reviewed').map(row => row.id))))
      errors.push(`PM selection unreviewed external ${kind} consumer roster differs`);
  }
  const reviewedPm = catalog.claims.filter(row => row.id.startsWith('cl-pm-'));
  if (!exactIds(reviewedPm, ids(accepted.claims))) errors.push('PM selection catalog claim roster differs');
  return errors;
}

/** @param {any} edition @param {Map<string,string>} sources @param {any} catalog @param {any} accepted @param {string|null} [independentDigest] @param {{projection?:'raw'|'public',readings?:any,literature?:any}} [context] */
export function validatePmSelectionCoverage(edition, sources, catalog, accepted, independentDigest = pmSelectionAcceptedDigest,
    { projection = 'raw', readings, literature } = {}) {
  assertPmSelectionAccepted(accepted, independentDigest);
  assertPmSelectionRegistration(edition, accepted);
  const errors = validatePmCatalog(catalog, accepted, projection);
  for (const unit of accepted.units) {
    try {
      const raw = sources.get(unit.route);
      const expected = currentBookLayout(`B17:${unit.route}:source`, unit);
      if (!raw || !currentBookMdxMatches(unit.route, unit.mdxSha256, hash(raw)) || !same(inspectPmSelectionSource(unit.route, raw), expected)) throw new Error(`PM selection actual title, description, heading, prose or navigation differs: ${unit.route}`);
    } catch (error) { errors.push(error.message); }
  }
  for (const [route, source] of sources) {
    if (!routes.includes(route) && collectChapterClaimOccurrences(source).some(id => id.startsWith('cl-pm-')))
      errors.push(`PM selection actual canonical occurrence outside reviewed units: ${route}`);
  }
  for (const [kind, rows] of Object.entries({ readings: readings?.readings, literature: literature?.records,
    gaps: readings?.gaps, revisions: readings?.revisions, queries: literature?.protocol?.queries })) {
    const expected = accepted.research[kind];
    if (!Array.isArray(rows) || !includes(rows, expected)
        || auditPrefixes[kind] && !exactIds(rows.filter(row => row.id.startsWith(auditPrefixes[kind])), ids(expected)))
      errors.push(`PM selection reviewed research ${kind} differs`);
  }
  const navigation = accepted.units.map(unit => unit.blocks.filter(block => block.kind === 'navigation').flatMap(block => block.links));
  if (sections(accepted.units[1]).some(section => !navigation[0].some(link => pmSelectionBookHref(link.href, pmSelectionRoute) === `#${printUnitAnchor(pmSelectionAppendix)}-${section.id}`))
      || !navigation[1].some(link => pmSelectionBookHref(link.href, pmSelectionAppendix) === `#${printReadingEntryAnchor(pmSelectionRoute)}`))
    errors.push('PM selection actual chapter-to-appendix coverage or appendix return link differs');
  return errors;
}

/** @param {Record<string, Uint8Array>} artifacts @param {any} pedigreeAccepted */
export function validatePmSelectionCaseBytes(artifacts, pedigreeAccepted) {
  assertPmSelectionOriginal();
  return original.caseInputHashes.flatMap(row => [[row.file, row.sha256], [row.publicationFile, row.publicationSha256]])
    .filter(([file, frozenDigest]) => {
      const expected = readablePedigreeCaseExpectation(file, frozenDigest, pedigreeAccepted);
      return !artifacts[file] || !currentBookFileMatches(file, expected, hash(artifacts[file]));
    })
    .map(([file]) => `PM selection case bytes differ: ${file}`);
}
export const pmSelectionCasePaths = original.caseInputHashes.flatMap(row => [row.file, row.publicationFile]);

export function pmSelectionBookHref(href, currentRoute) {
  if (!routes.includes(currentRoute) || typeof href !== 'string') return href;
  const [path, fragment] = href.split('#');
  const target = path.replace(/\/$/, '');
  if (!routes.includes(target)) return href;
  try { return fragment ? `#${printUnitAnchor(target)}-${decodeURIComponent(fragment)}` : `#${printReadingEntryAnchor(target)}`; }
  catch { return href; }
}

const prefixFor = (route, path) => path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
/** @returns {import('./reader-citations.mjs').Destination} */
function destination(route, viewPath, kind, name) {
  const path = viewPath === '/print' ? viewPath : route;
  const prefix = prefixFor(route, path);
  const id = kind === 'note' ? chapterNoteAnchor(prefix, name) : kind === 'heading' ? path === '/print' ? `${prefix}-${name}` : name : kind === 'note-group' ? `${prefix}-annotations` : prefix;
  return { route, path, id, kind, ...(kind === 'note' ? { claimId: name } : {}) };
}

/** @returns {import('./reader-citations.mjs').LegacyEntry[]} */
export function pmSelectionHeadingEntries() {
  assertPmSelectionOriginal();
  const capture = original.publication.actualHostedCapture;
  return original.publication.history.additionalActualPrintHeadings.map(row => ({
    route: pmSelectionRoute, path: row.path, id: row.id, mode: 'retained',
    targets: [{ route: pmSelectionRoute, path: row.path, id: row.id, kind: 'heading' }],
    edition: { sourceCommit: capture.sourceCommit, sourceDate: capture.sourceDate },
  }));
}

function claimLocations(accepted) {
  const locations = new Map();
  for (const unit of accepted.units) {
    let heading;
    for (const block of unit.blocks) {
      if (block.kind === 'section') heading = block.id;
      if (block.kind === 'claims') for (const claimId of block.ids) locations.set(claimId, { route: unit.route, heading });
    }
  }
  return locations;
}

/** @param {import('./reader-citations.mjs').LegacyEntry[]} entries
 * @param {any} accepted @param {string|null} [independentDigest]
 * @returns {import('./reader-citations.mjs').LegacyEntry[]}
 */
export function remapPmSelectionCitations(entries, accepted, independentDigest = pmSelectionAcceptedDigest) {
  assertPmSelectionAccepted(accepted, independentDigest);
  const originals = [...original.publication.history.existingAffectedEntries, ...pmSelectionHeadingEntries()];
  const frozen = new Map(originals.map(row => [address(row), row])), seen = new Set();
  const positions = claimLocations(accepted);
  const remapped = entries.map(/** @returns {import('./reader-citations.mjs').LegacyEntry} */ entry => {
    const key = address(entry), fixed = frozen.get(key);
    if (!fixed) {
      if (routes.includes(entry.route) || [...entry.targets, ...entry.scope?.targets ?? []].some(target => routes.includes(target.route))) throw new Error(`PM selection unexpected historical entry: ${key}`);
      return entry;
    }
    if (seen.has(key) || !same(fixed, entry)) throw new Error(`PM selection original historical entry repeated or changed: ${key}`);
    seen.add(key);
    const first = entry.targets[0], { path } = entry;
    const note = id => destination(positions.get(id).route, path, 'note', id);
    if (first.kind === 'note') {
      const target = note(first.claimId);
      const mode = path !== target.path ? 'notice' : entry.id !== target.id ? 'alias' : 'retained';
      return { ...entry, mode, targets: [target] };
    }
    const oldView = original.publication.actualHostedCapture.views.find(view => view.path === path);
    const heading = first.kind === 'heading' ? oldView.sections.find(row => row.id === first.id) : undefined;
    if (first.kind === 'heading' && !heading) throw new Error(`PM selection unknown historical section: ${key}`);
    const source = original.publication.history.originalSourceIdentities.find(row => row.sourceCommit === entry.edition.sourceCommit);
    const oldIds = heading?.claimIds ?? source.claimIds;
    const notes = oldIds.map(note);
    const group = first.kind === 'note-group';
    const headings = oldIds.map(id => {
      const position = positions.get(id);
      return destination(position.route, path, 'heading', position.heading);
    });
    const targets = group ? notes : [...new Map(headings.map(target => [`${target.path}#${target.id}`, target])).values(), ...notes];
    const name = heading ? `“${heading.title}”` : group ? '注释组' : '篇章';
    const scope = { text: `原《${source.title}》${name}的范围对应下列${notes.length}则原有注释${group ? '' : '与具名内容位置'}。计算与方法补充见各链接所指的位置。`, targets };
    // Retain actual native destinations while making the earlier scope explicit.
    if (!heading && entry.id === first.id) return { ...entry, scope };
    return { ...entry, mode: 'notice', targets, scope };
  });
  if (seen.size !== frozen.size) throw new Error('PM selection missing original historical entries');
  return remapped;
}

/** @param {import('./reader-citations.mjs').Destination} target @param {any} accepted */
export function pmSelectionCitationLabel(target, accepted) {
  const unit = accepted.units.find(unit => unit.route === target.route);
  if (target.kind === 'note') return `《${unit.title}》注 ${claimIds(unit).indexOf(target.claimId) + 1}`;
  const id = target.path === '/print' ? target.id.slice(printUnitAnchor(target.route).length + 1) : target.id;
  const heading = sectionBlocks(unit).find(block => block.id === id);
  return `《${unit.title}》${heading ? `·${heading.title}` : target.kind === 'note-group' ? '注释' : ''}`;
}

const elementChildren = node => node?.childNodes.filter(child => child.nodeType === 1) ?? [];
const historicalSelector = '[data-legacy-for],[data-legacy-notice],[data-legacy-scope]';
function hrefIdentity(href) {
  const [path, fragment, extra] = (href ?? '').split('#');
  if (extra !== undefined) return null;
  try { return fragment === undefined ? path : `${path}#${decodeURIComponent(fragment)}`; }
  catch { return null; }
}

/** Check the actual normalized publication DOM, including notes and named ordinary navigation. */
export function validateRenderedPmSelection(document, path, catalog, accepted, independentDigest = pmSelectionAcceptedDigest) {
  if (path !== '/print' && !routes.includes(path)) return [];
  assertPmSelectionAccepted(accepted, independentDigest);
  const print = path === '/print';
  const originals = [...original.publication.history.existingAffectedEntries, ...pmSelectionHeadingEntries()];
  const history = applyCurrentHistoricalEntries(document, remapPmSelectionCitations(originals, accepted, independentDigest)).filter(row => row.path === path);
  const errors = [], claims = byId(catalog.claims), frozenClaims = byId(accepted.claims);
  const pathIds = new Map();
  for (const node of document.querySelectorAll('[id]')) {
    const occurrences = pathIds.get(node.id) ?? [];
    occurrences.push(node);
    pathIds.set(node.id, occurrences);
  }
  for (const frozen of accepted.units.filter(unit => print || unit.route === path)) {
    const { route } = frozen;
    const record = currentBookLayout(`B17:${route}:source`, frozen), prefix = prefixFor(route, path), subject = `${path}: PM selection ${route}`;
    const units = document.querySelectorAll(`article[data-reader-route="${route}"]`);
    const fail = message => errors.push(`${subject} ${message}`);
    if (units.length !== 1) { fail('actual unit missing or repeated'); continue; }
    const [unit] = units, checked = new Set();
    const verify = (node, valid, label) => {
      if (!node || !valid || concealedText(node)) fail(`${label} differs or is hidden`);
      else checked.add(node);
    };
    const title = unit.querySelector('[data-reader-heading-key="@unit"]');
    const description = title?.nextElementSibling;
    verify(title, title?.parentNode === unit && title.tagName === (print ? 'H2' : 'H1') && title.text === record.title
      && unit.getAttribute('data-reader-title') === record.title && (!print || unit.id === prefix
        && title.id === printReadingEntryAnchor(route) && title.getAttribute('tabindex') === '-1'
        && pathIds.get(title.id)?.length === 1), 'actual title or unit identity');
    verify(description, description?.tagName === 'P' && description.text === record.description, 'actual description');
    if (!print) {
      const footers = unit.querySelectorAll('.docs-pagination');
      if (footers.length !== 1 || !isVerifiedReaderPagination(footers[0])) fail('actual pagination lacks independent qualification');
      else checked.add(footers[0]);
      qualifyHeadingCopyButtons(unit, { headings: sections(record) });
    }
    const owners = elementChildren(unit).filter(node => node.tagName === 'DIV' && node.getAttribute('class') === 'prose flex-1');
    if (!print && owners.length !== 1) fail('actual website content owner differs');
    const owner = print ? unit : owners[0];
    const notes = unit.querySelectorAll('[data-reader-claim]'), groups = unit.querySelectorAll('.chapter-notes');
    const [group] = groups, groupId = `${prefix}-annotations`, list = group?.querySelector('ol');
    const noteIds = claimIds(record);
    const noteHeading = elementChildren(group).find(node => node.tagName === (print ? 'H3' : 'H2'));
    verify(noteHeading, noteHeading?.id === groupId && noteHeading.text === '注释', 'annotation heading');
    if (groups.length !== 1 || group.parentNode !== owner || group.getAttribute('aria-labelledby') !== groupId
        || group.querySelectorAll('ol').length !== 1 || list.parentNode !== group || Object.keys(list.attributes).length !== 0
        || elementChildren(list).some((node, index) => node !== notes[index]) || elementChildren(list).length !== notes.length || notes.length !== noteIds.length
        || notes.some((node, index) => node.tagName !== 'LI' || !same(node.attributes, {
          id: chapterNoteAnchor(prefix, noteIds[index]), 'data-reader-claim': noteIds[index],
        })))
      fail('actual continuous note group or note identities differ');
    const body = elementChildren(owner).filter(node => node !== title && node !== description && node !== group && !node.closest(historicalSelector));
    if (body.length !== record.blocks.length) fail('actual ordered body block count differs');
    let number = 0;
    for (const [index, block] of record.blocks.entries()) {
      const node = body[index];
      if (block.kind === 'section') {
        const native = !print && elementChildren(node);
        verify(node, node?.tagName === (print ? 'H3' : 'H2') && node.getAttribute('data-reader-heading-key') === block.id
          && node.id === (print ? `${prefix}-${block.id}` : block.id) && headingText(node) === block.title
          && (print ? elementChildren(node).length === 0 : native.length === 2 && native[0].tagName === 'A' && native[0].text === block.title
            && hrefIdentity(native[0].getAttribute('href')) === `#${block.id}` && native[1].tagName === 'BUTTON'
            && !!native[1].querySelector('svg') && trustedFrameworkSvg(native[1].querySelector('svg'))), 'formal heading');
      } else if (block.kind === 'claims') {
        const paragraphs = elementChildren(node);
        if (node?.tagName !== 'DIV' || !node.classList.contains('scholarly-prose') || paragraphs.length !== block.ids.length) fail('canonical prose wrapper differs');
        for (const [paragraphIndex, id] of block.ids.entries()) {
          const paragraph = paragraphs[paragraphIndex], markers = paragraph?.querySelectorAll('a[role="doc-noteref"]') ?? [], [marker] = markers;
          number++;
          verify(paragraph, paragraph?.tagName === 'P' && paragraph.querySelectorAll('a').length === 1 && markers.length === 1
            && marker.getAttribute('data-reader-reference') === id && marker.getAttribute('href') === `#${chapterNoteAnchor(prefix, id)}`
            && marker.getAttribute('aria-label') === `注 ${number}` && marker.text === `[${number}]`
            && readerParagraphText(paragraph, marker) === claims.get(id)?.text
            && currentBookRecordMatches('claims', frozenClaims.get(id), claims.get(id)), `canonical paragraph or note marker ${id}`);
        }
      } else if (block.kind === 'navigation') {
        const expected = block.links.map(link => ({ label: link.label, href: hrefIdentity(print ? pmSelectionBookHref(link.href, route) : link.href) }));
        const actual = node?.querySelectorAll('a').map(link => ({ label: link.text, href: hrefIdentity(link.getAttribute('href')) }));
        verify(node, node?.tagName === 'P' && node.text === block.text && same(actual, expected), 'ordinary navigation paragraph');
        if (print) for (const link of expected.filter(link => link.href.startsWith('#')))
          if (pathIds.get(link.href.slice(1))?.length !== 1) fail(`printed ordinary navigation has no unique native target: ${link.href}`);
      }
    }
    errors.push(...validateExchangeAnnotationOutput(document, unit, route, catalog, { print }));
    for (const note of notes) {
      const annotation = note.querySelector('.claim-annotation');
      verify(annotation, !!annotation, 'actual annotation');
    }
    const historical = validateReaderHistoricalText(unit, history, path, target => pmSelectionCitationLabel(target, accepted));
    errors.push(...historical.errors);
    for (const node of historical.checked) verify(node, true, 'historical context');
    for (const entry of history.filter(entry => (entry.mode === 'alias' ? entry.targets[0].route : entry.route) === route)) {
      const targets = pathIds.get(entry.id) ?? [], [anchor] = targets;
      const inUnit = targets.length === 1 && anchor.closest('article') === unit;
      if (entry.mode === 'retained' && entry.scope) {
        const contexts = unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`);
        const [context] = contexts;
        if (!inUnit || contexts.length !== 1 || !(anchor === unit ? context.parentNode === unit : context.previousElementSibling === anchor))
          fail(`historical source scope is missing or detached: ${entry.id}`);
      } else if (!inUnit || entry.mode !== 'retained' && !anchor.hasAttribute(entry.mode === 'alias' ? 'data-legacy-for' : 'data-legacy-notice')
          || entry.mode === 'alias' && anchor.parentNode?.id !== entry.targets[0].id)
        fail(`historical source address is missing or misplaced: ${entry.id}`);
    }
    if (unit.querySelectorAll('img,figure,canvas,video,iframe,object,embed,audio').length
        || unit.querySelectorAll('svg').some(node => !trustedFrameworkSvg(node))) fail('unreviewed visual or media content');
    if (unaccountedReaderText(unit, checked).length) fail('contains unexpected unreviewed text');
  }
  return errors;
}
