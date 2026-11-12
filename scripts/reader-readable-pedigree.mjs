import { blocksReaderText, inspectReviewedStaticTable, removeReviewedProse, validateReviewedStaticTable } from './reader-reviewed-static-table.mjs';
import { currentBookFileMatches, currentBookLayout, currentBookMdxMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import original from '../config/readable-pedigree-original.json' with { type: 'json' };
import captured from '../config/readable-pedigree-heading-history.json' with { type: 'json' };
import researchOriginal from '../config/readable-pedigree-research-original.json' with { type: 'json' };
import baseline from '../config/citation-baseline.json' with { type: 'json' };
import history from '../config/citation-history.json' with { type: 'json' };
import placements from '../config/citation-placements.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { createCanonicalCitationEntries, createLegacyCitationEntries } from './reader-citations.mjs';
import { affectedClaims, publicCatalog } from './knowledge.mjs';
import { qualifyHeadingCopyButtons, trustedFrameworkSvg } from './reader-data-applicability.mjs';
import { isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { printReadingEntryAnchor } from './reader-numbering.mjs';
import { unaccountedReaderText, validateExchangeAnnotationOutput } from './reader-exchange-semantics.mjs';
import { applyCurrentHistoricalEntries, readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const readablePedigreeRoute = '/docs/book/data-quality-and-probability';
export const readablePedigreeOriginalDigest = '67f38b591713ec9d6def1ff1c7ab26080c6126ab107d8627562807d91d74508b';
export const readablePedigreeHeadingDigest = '61b5e5a55d8b694a189bc8c77a0778ccb2737a372e58d5f4051228c34ea1949e';
export const readablePedigreeResearchDigest = '30ebc67a78e09269f8be8c7509b699bb4afe659f823dc69ad7d30d1ecba5a42b';
// Main sets the independent pin after source, reader and engineering review.
/** @type {string|null} */
export const readablePedigreeAcceptedDigest = 'f7615018d423dbe4c6e8faf71665f69af772ad4551f42322ca75a7d0a6a9214f';

const publicationPath = 'knowledge/cases/pedigree-calibration-v1.publication.json';
const closingPremises = ['cl-unc-scores', 'cl-unc-calibration', 'cl-unc-alongside'];
const consumerId = 'cl-connect-evidence-to-probability';
const hash = value => createHash('sha256').update(value).digest('hex');
export const readablePedigreeDigest = value => hash(JSON.stringify(value));
const digestLike = value => /^[a-f0-9]{64}$/.test(value ?? '');
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const same = isDeepStrictEqual;
const ordered = value => Array.isArray(value) ? value.map(ordered)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]))
    : value;
const recordDigest = value => readablePedigreeDigest(ordered(value));
const prefix = path => path === '/print' ? printUnitAnchor(readablePedigreeRoute) : chapterAnchorPrefix(readablePedigreeRoute);
const headingId = (path, id) => path === '/print' ? `${prefix(path)}-${id}` : id;
const address = entry => `${entry.path}#${entry.id}`;
const affected = entry => entry.route === readablePedigreeRoute
  || [...entry.targets, ...entry.scope?.targets ?? []].some(target => target.route === readablePedigreeRoute);

/** @returns {import('./reader-citations.mjs').Destination} */
const destination = (path, kind, id, claimId) => ({
  route: readablePedigreeRoute, path, kind, id, ...claimId ? { claimId } : {},
});
const sectionOccurrences = sections => sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })));
const proseMetadata = ({ text, reviewedAt, ...metadata }) => metadata;
const poststratificationCaveat = {
  claimId: 'cl-ped-poststratification',
  original: ['方差降低比例由已舍入的汇总数计算，不是从观察值重新估计的设计效应，也不证明任何后分层都会降低误差。'],
  current: ['方差降低比例由原文列出的两个方差估计值计算，不是从观察值重新估计的设计效应，也不证明任何后分层都会降低误差。'],
};

function expectedProseMetadata(previous) {
  const metadata = proseMetadata(previous);
  if (previous.id !== poststratificationCaveat.claimId) return metadata;
  // The selected report lists the two estimates without describing rounding.
  if (!same(metadata.caveats, poststratificationCaveat.original))
    throw new Error('Readable pedigree original poststratification caveat differs');
  return { ...metadata, caveats: poststratificationCaveat.current };
}

export function assertReadablePedigreeOriginal(value = original) {
  if (readablePedigreeDigest(value) !== readablePedigreeOriginalDigest)
    throw new Error('Readable pedigree immutable before-rewrite inventory differs');
}

export function assertReadablePedigreeHeadingHistory(value = captured) {
  if (readablePedigreeDigest(value) !== readablePedigreeHeadingDigest
      || value.sourceCommit !== original.sourceCommit
      || !same(value.views.map(view => view.path), [readablePedigreeRoute, '/print'])
      || value.views.some(view => view.headings.length !== 8
        || !same(view.headings.flatMap(section => section.claimIds), original.chapterIds)))
    throw new Error('Readable pedigree Main hosted heading capture differs');
}

export function assertReadablePedigreeResearchOriginal(value = researchOriginal) {
  if (readablePedigreeDigest(value) !== readablePedigreeResearchDigest
      || value.sourceCommit !== original.sourceCommit || value.sourceFile !== 'knowledge/research/readings.json')
    throw new Error('Readable pedigree immutable selected research receipt differs');
  for (const evidence of original.evidence) {
    const reading = value.readings.find(row => row.id === evidence.readingId);
    const passage = reading?.passages.find(row => row.id === evidence.passageId);
    if (!passage || !reading.artifacts.some(row => row.id === passage.artifactId))
      throw new Error(`Readable pedigree missing selected research receipt: ${evidence.id}`);
  }
}

/** @param {any} register */
export function validateReadablePedigreeResearch(register) {
  assertReadablePedigreeResearchOriginal();
  if (!Array.isArray(register?.readings)) return ['Readable pedigree missing actual reading register'];
  const errors = [];
  for (const fixed of researchOriginal.readings) {
    const matches = register.readings.filter(row => row.id === fixed.id);
    if (matches.length !== 1) {
      errors.push(`Readable pedigree selected reading missing or repeated: ${fixed.id}`);
      continue;
    }
    const { passages, artifacts, ...reading } = matches[0];
    if (recordDigest(reading) !== fixed.sha256)
      errors.push(`Readable pedigree selected reading metadata differs: ${fixed.id}`);
    for (const [kind, expected, actual] of [['passage', fixed.passages, passages], ['artifact', fixed.artifacts, artifacts]]) {
      for (const row of expected) {
        const found = Array.isArray(actual) ? actual.filter(entry => entry.id === row.id) : [];
        if (found.length !== 1 || recordDigest(found[0]) !== row.sha256)
          errors.push(`Readable pedigree selected research ${kind} differs: ${row.id}`);
      }
    }
  }
  return errors;
}

/** @param {any} accepted @param {string|null} independentDigest */
export function assertReadablePedigreeAccepted(accepted, independentDigest = readablePedigreeAcceptedDigest) {
  assertReadablePedigreeOriginal();
  assertReadablePedigreeHeadingHistory();
  assertReadablePedigreeResearchOriginal();
  if (!accepted || accepted.schemaVersion !== 1 || accepted.status !== 'reviewed'
      || accepted.originalDigest !== readablePedigreeOriginalDigest
      || accepted.headingHistoryDigest !== readablePedigreeHeadingDigest
      || accepted.researchOriginalDigest !== readablePedigreeResearchDigest
      || !digestLike(independentDigest) || readablePedigreeDigest(accepted) !== independentDigest)
    throw new Error('Readable pedigree requires independently pinned reviewed current content');
  const ids = Array.isArray(accepted.sections) ? sectionOccurrences(accepted.sections).map(row => row.id) : [];
  if (accepted.route !== readablePedigreeRoute || !nonempty(accepted.title) || !nonempty(accepted.description)
      || !digestLike(accepted.mdxSha256) || !digestLike(accepted.casePublicationSha256)
      || accepted.casePublicationSha256 === original.casePublicationSha256
      || accepted.sections?.length !== 5 || accepted.sections.some(row => !nonempty(row.id) || !nonempty(row.title) || !row.claimIds.length)
      || new Set(accepted.sections.map(row => row.id)).size !== 5
      || !same([...ids].sort(), [...original.chapterIds].sort())
      || !same(accepted.claims?.map(row => row.id), ids))
    throw new Error('Readable pedigree current source requires five sections and the exact original 37 claim identities');
  for (const row of accepted.claims) {
    const previous = original.claims.find(record => record.id === row.id);
    if (!previous || !same(proseMetadata(row), expectedProseMetadata(previous)) || !nonempty(row.text)
        || row.text === previous.text || !/^\d{4}-\d{2}-\d{2}$/.test(row.reviewedAt ?? ''))
      throw new Error(`Readable pedigree current claim changes scientific metadata or lacks the reviewed rewrite: ${row.id}`);
  }
  const consumer = accepted.closingConsumer;
  if (consumer?.record?.id !== consumerId || !nonempty(consumer.rationale)
      || !same(consumer.record.premiseIds.filter(id => original.chapterIds.includes(id)).sort(),
        ['cl-unc-alongside', 'cl-unc-calibration'])
      || !Array.isArray(accepted.reviewEvidence) || !accepted.reviewEvidence.length
      || accepted.reviewEvidence.some(row => !nonempty(row.kind) || !digestLike(row.reportSha256) || !digestLike(row.receiptSha256)))
    throw new Error('Readable pedigree requires the exact closing consumer and explicit review evidence');
}

/** Only the three exact dependency records frozen by B32 may use current prose. */
export function readablePedigreeClosingRecords(accepted, independentDigest = readablePedigreeAcceptedDigest) {
  assertReadablePedigreeAccepted(accepted, independentDigest);
  return {
    changes: closingPremises.map(id => ({
      old: original.claims.find(row => row.id === id),
      current: accepted.claims.find(row => row.id === id),
    })),
    consumer: accepted.closingConsumer.record,
  };
}

/** Compare historical locks to the immutable original before selecting the new template receipt. */
export function readablePedigreeCaseExpectation(path, frozenDigest, accepted, independentDigest = readablePedigreeAcceptedDigest) {
  if (path !== publicationPath) return frozenDigest;
  assertReadablePedigreeAccepted(accepted, independentDigest);
  if (frozenDigest !== original.casePublicationSha256)
    throw new Error('Readable pedigree historical case publication hash differs');
  return accepted.casePublicationSha256;
}

export function validateReadablePedigreeCaseBytes(accepted, { input, publication }, independentDigest = readablePedigreeAcceptedDigest) {
  assertReadablePedigreeAccepted(accepted, independentDigest);
  const expectedPublication = readablePedigreeCaseExpectation(publicationPath, original.casePublicationSha256, accepted, independentDigest);
  return [
    ['input', input, original.caseInputSha256],
    ['publication', publication, expectedPublication],
  ].flatMap(([name, bytes, expected]) => bytes && (name === 'publication'
    ? currentBookFileMatches(publicationPath, expected, hash(bytes)) : hash(bytes) === expected) ? [] : [`Readable pedigree ${name} bytes differ`]);
}

const studyTableShape = {
  name: 'Readable pedigree', section: '散布与估计精度', rowCount: 4,
  previousClaim: 'cl-ped-stratified-conflict', nextClaim: 'cl-ped-estimate-boundary',
};

/** The current layout may add one bounded study table to this chapter. */
export function inspectReadablePedigreeSource(raw) {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!front) return null;
  const field = name => new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(front[1])?.[1].replace(/^(['"])(.*)\1$/, '$2');
  const blocks = raw.slice(front[0].length).split(/^## (.+)$/m);
  if (blocks[0].trim()) return null;
  const sections = [];
  let studyTable;
  for (let i = 1; i < blocks.length; i += 2) {
    const explicit = /^(.*?)\s+\[#([^\]]+)\]$/.exec(blocks[i]);
    const id = explicit?.[2] ?? blocks[i], body = blocks[i + 1];
    if (removeReviewedProse(body).trim()) {
      if (id !== studyTableShape.section || studyTable) return null;
      studyTable = inspectReviewedStaticTable(body, studyTableShape);
      if (!studyTable) return null;
    }
    sections.push({ id, title: explicit?.[1] ?? blocks[i], claimIds: collectChapterClaimOccurrences(body) });
  }
  return { title: field('title'), description: field('description'), sections, ...(studyTable ? { studyTable } : {}) };
}

function reviewedPedigreeLayout(accepted) {
  const { title, description, sections } = accepted;
  const layout = currentBookLayout('B27:reader-source', { title, description, sections });
  if (!same(sectionOccurrences(layout.sections).map(row => row.id), accepted.claims.map(row => row.id)))
    throw new Error('Readable pedigree current layout must preserve the exact 37 canonical note identities in order');
  return layout;
}

function validateCatalog(catalog, accepted, projection) {
  if (!['raw', 'public'].includes(projection)) throw new Error('Readable pedigree needs an explicit catalog projection');
  const groups = {
    claims: [...accepted.claims, ...original.closureClaims.filter(row => !original.chapterIds.includes(row.id)), accepted.closingConsumer.record],
    evidence: original.evidence,
    sources: original.sources,
  };
  const reference = { ...catalog };
  for (const [kind, rows] of Object.entries(groups)) {
    const ids = new Set(rows.map(row => row.id));
    reference[kind] = catalog[kind].filter(row => !ids.has(row.id)).concat(rows);
  }
  const expected = projection === 'public' ? publicCatalog(reference) : reference;
  const errors = [];
  for (const [kind, rows] of Object.entries(groups)) for (const row of rows) {
    const actual = catalog[kind].filter(record => record.id === row.id);
    if (actual.length !== 1 || !currentBookRecordMatches(kind, expected[kind].find(record => record.id === row.id), actual[0], projection))
      errors.push(`Readable pedigree reviewed ${kind} record differs: ${row.id}`);
  }
  const consumers = affectedClaims(catalog, original.chapterIds).filter(id => !original.chapterIds.includes(id));
  if (!same(consumers, currentBookLayout('B27:external-consumers', [consumerId])))
    errors.push('Readable pedigree exact external consumer set differs');
  return errors;
}

/** @param {any} edition @param {Map<string,string>} sources @param {any} catalog @param {any} accepted @param {string|null} independentDigest @param {'raw'|'public'} projection @param {any} readings */
export function validateReadablePedigreeCoverage(edition, sources, catalog, accepted,
    independentDigest = readablePedigreeAcceptedDigest, projection = 'raw', readings) {
  assertReadablePedigreeAccepted(accepted, independentDigest);
  const units = edition.units.filter(unit => unit.key === readablePedigreeRoute || unit.source === readablePedigreeRoute);
  if (!same(units, [{ key: readablePedigreeRoute, source: readablePedigreeRoute, kind: 'chapter', part: '证据分量' }]))
    throw new Error('Readable pedigree must retain its shared book and website source identity');
  const errors = [...validateCatalog(catalog, accepted, projection), ...validateReadablePedigreeResearch(readings)];
  const raw = sources.get(readablePedigreeRoute)?.replaceAll('\r\n', '\n');
  if (!raw || !currentBookMdxMatches(readablePedigreeRoute, accepted.mdxSha256, hash(raw))
      || !same(inspectReadablePedigreeSource(raw), reviewedPedigreeLayout(accepted)))
    errors.push('Readable pedigree actual MDX title, description, sections or claim order differs');
  return errors;
}

/** @returns {import('./reader-citations.mjs').LegacyEntry[]} */
export function readablePedigreeHeadingEntries() {
  assertReadablePedigreeHeadingHistory();
  return captured.views.find(view => view.path === '/print').headings.map(row => ({
    route: readablePedigreeRoute, path: '/print', id: row.id, mode: 'retained',
    targets: [destination('/print', 'heading', row.id)],
    edition: { sourceCommit: captured.sourceCommit, sourceDate: captured.sourceDate },
  }));
}

/** @returns {import('./reader-citations.mjs').LegacyEntry[]} */
export function readablePedigreeOriginalEntries() {
  const printRoutes = [...baseline.pages.filter(page => page.printOrdinal !== undefined).map(page => page.route),
    ...placements.frontMatter, ...placements.printAdditions.map(page => page.route)];
  const older = [...createLegacyCitationEntries(baseline, placements, history.pages),
    ...createCanonicalCitationEntries(history, placements, printRoutes)].filter(affected);
  return [...older, ...readablePedigreeHeadingEntries()];
}

function historicalGenerations() {
  const sourceSha = hash(original.originalSource);
  const legacyPage = baseline.pages.find(row => row.route === readablePedigreeRoute);
  const canonicalPage = history.pages.find(row => row.route === readablePedigreeRoute);
  const web = captured.views.find(view => view.path === readablePedigreeRoute);
  if (sourceSha !== original.files[original.sourceFile]
      || legacyPage?.mdxSha256 !== sourceSha || canonicalPage?.sourceSha256 !== sourceSha
      || !same(legacyPage.headingIds, web.headings.map(row => row.id))
      || !same(legacyPage.noteClaims, original.chapterIds) || !same(canonicalPage.noteClaims, original.chapterIds))
    throw new Error('Readable pedigree historical generations do not qualify the exact original source and claim scope');
  return new Map([
    [baseline.sourceCommit, legacyPage.noteClaims],
    [history.sourceCommit, canonicalPage.noteClaims],
    [captured.sourceCommit, original.chapterIds],
  ]);
}

/** @param {import('./reader-citations.mjs').LegacyEntry[]} entries @param {any} accepted @param {string|null} independentDigest */
export function remapReadablePedigreeCitations(entries, accepted, independentDigest = readablePedigreeAcceptedDigest) {
  assertReadablePedigreeAccepted(accepted, independentDigest);
  const frozen = new Map(readablePedigreeOriginalEntries().map(entry => [address(entry), entry]));
  if (frozen.size !== 178) throw new Error('Readable pedigree requires its 170 older and eight native print addresses');
  const generations = historicalGenerations();
  const seen = new Set();
  const remapped = entries.map(entry => {
    if (!affected(entry)) return entry;
    const key = address(entry);
    if (seen.has(key) || !same(frozen.get(key), entry)) throw new Error(`Readable pedigree unknown or changed old address: ${key}`);
    seen.add(key);
    return remapEntry(entry, accepted, generations.get(entry.edition.sourceCommit));
  });
  if (seen.size !== frozen.size) throw new Error('Readable pedigree historical address missing');
  return remapped;
}

/** @param {import('./reader-citations.mjs').LegacyEntry} entry @returns {import('./reader-citations.mjs').LegacyEntry} */
function remapEntry(entry, accepted, generationIds) {
  const first = entry.targets[0];
  if (first.kind === 'note') return entry;
  const path = entry.path;
  const view = captured.views.find(row => row.path === path);
  const oldHeading = first.kind === 'heading' ? view.headings.find(section => section.id === first.id) : undefined;
  if (first.kind === 'heading' && !oldHeading) throw new Error(`Readable pedigree unknown old heading: ${entry.id}`);
  if (!generationIds) throw new Error(`Readable pedigree unknown source generation: ${entry.id}`);
  const ids = oldHeading?.claimIds ?? generationIds;
  const notes = ids.map(id => destination(path, 'note', `${prefix(path)}-claim-${id}`, id));
  const group = first.kind === 'note-group';
  const headings = accepted.sections.filter(section => section.claimIds.some(id => ids.includes(id)))
    .map(section => destination(path, 'heading', headingId(path, section.id)));
  const targets = group ? notes : [...headings, ...notes];
  const name = oldHeading ? `“${oldHeading.title}”` : group ? '注释组' : '篇章';
  const text = `原《${view.title}》${name}的范围见以下${notes.length}则原有注释${group ? '' : '及对应的现行小节'}。注释沿用旧版顺序，现行题名为《${accepted.title}》。`;
  const scope = { text, targets };
  if (!oldHeading && entry.id === first.id) return { ...entry, scope };
  return { ...entry, mode: 'notice', targets, scope };
}

export function readablePedigreeCitationLabel(target, accepted) {
  const suffix = target.kind === 'note' ? `注 ${accepted.claims.findIndex(row => row.id === target.claimId) + 1}`
    : target.kind === 'heading' ? `·${accepted.sections.find(section => headingId(target.path, section.id) === target.id).title}`
    : target.kind === 'note-group' ? '注释' : '';
  return `《${accepted.title}》${suffix}`;
}

function validateHistoricalLocations(document, unit, path, entries) {
  const expected = entries.filter(entry => entry.path === path);
  const sources = new Map(expected.map(entry => [entry.id, []]));
  const scopes = new Map(expected.map(entry => [entry.id, []]));
  for (const node of document.querySelectorAll('[id],[data-legacy-scope]')) {
    sources.get(node.id)?.push(node);
    scopes.get(node.getAttribute('data-legacy-scope'))?.push(node);
  }
  const body = path === '/print' ? unit : unit.querySelector('.prose.flex-1');
  const inUnit = node => node === unit || node.closest('article[data-reader-route]') === unit;
  const isNote = (node, target) => node?.tagName === 'LI'
    && node.id === target.id && node.getAttribute('data-reader-claim') === target.claimId
    && inUnit(node) && Boolean(node.closest('.chapter-notes'));
  const isGroup = node => node.tagName === (path === '/print' ? 'H3' : 'H2')
    && node.parentNode?.classList.contains('chapter-notes');
  const errors = [];
  for (const entry of expected) {
    const found = sources.get(entry.id);
    const target = entry.targets[0];
    const [node] = found;
    let positioned = false;
    if (found.length === 1 && inUnit(node) && !blocksReaderText(node)) {
      if (entry.mode === 'notice') positioned = node.tagName === 'DIV'
        && node.hasAttribute('data-legacy-notice') && node.parentNode === body;
      else if (entry.mode === 'alias') positioned = node.tagName === 'SPAN'
        && node.getAttribute('data-legacy-for') === target.id && target.kind === 'note' && isNote(node.parentNode, target);
      else if (target.kind === 'note') positioned = isNote(node, target);
      else if (target.kind === 'chapter') positioned = node === unit;
      else if (target.kind === 'note-group') positioned = isGroup(node);
    }
    if (!positioned) errors.push(`${path}: Readable pedigree historical source is missing, repeated, hidden or misplaced: ${entry.id}`);

    const contexts = scopes.get(entry.id);
    if (entry.mode === 'retained' && entry.scope) {
      const [context] = contexts;
      const attached = context && (target.kind === 'chapter'
        ? context.parentNode === node
        : context.previousElementSibling === node && context.parentNode === node?.parentNode);
      if (contexts.length !== 1 || !attached || !inUnit(context) || blocksReaderText(context))
        errors.push(`${path}: Readable pedigree retained historical scope is missing, repeated, hidden or detached: ${entry.id}`);
    } else if (contexts.length) errors.push(`${path}: Readable pedigree unexpected retained historical scope: ${entry.id}`);
  }
  return errors;
}

export function validateReadablePedigreeStudyTable(unit, path, expected) {
  return validateReviewedStaticTable(unit, path, expected, studyTableShape);
}

/** Check the fully numbered and normalized DOM used by the citation export verifier. */
export function validateRenderedReadablePedigree(document, path, catalog, accepted, independentDigest = readablePedigreeAcceptedDigest, readings) {
  if (![readablePedigreeRoute, '/print'].includes(path)) return [];
  assertReadablePedigreeAccepted(accepted, independentDigest);
  const layout = reviewedPedigreeLayout(accepted);
  const researchErrors = validateReadablePedigreeResearch(readings);
  if (researchErrors.length) return researchErrors;
  const units = document.querySelectorAll(`article[data-reader-route="${readablePedigreeRoute}"]`);
  if (units.length !== 1) return [`${path}: Readable pedigree chapter is missing or repeated`];
  const [unit] = units;
  const print = path === '/print';
  const errors = [];
  const checked = new Set();
  const check = (node, valid, label) => {
    if (!node || !valid || blocksReaderText(node)) errors.push(`${path}: Readable pedigree ${label} differs or is hidden`);
    else checked.add(node);
  };
  const title = unit.querySelector('[data-reader-heading-key="@unit"]');
  check(title, title?.tagName === (print ? 'H2' : 'H1') && title.text === layout.title
    && unit.getAttribute('data-reader-title') === layout.title, 'chapter title');
  if (print) check(title, unit.id === prefix(path) && title?.parentNode === unit
    && title.id === printReadingEntryAnchor(readablePedigreeRoute) && title.getAttribute('tabindex') === '-1', 'current printed heading or historical chapter target');
  const description = title?.nextElementSibling;
  check(description, description?.tagName === 'P' && description.text === layout.description, 'chapter description');
  if (!print) {
    const pagination = unit.querySelectorAll('.docs-pagination');
    check(pagination[0], pagination.length === 1 && isVerifiedReaderPagination(pagination[0]), 'independently qualified pagination');
    qualifyHeadingCopyButtons(unit, { headings: layout.sections });
  }
  const headings = [];
  const occurrences = [];
  let section = null;
  const frozenClaims = new Map(accepted.claims.map(row => [row.id, row]));
  const claims = new Map((catalog?.claims ?? []).map(row => [row.id, row]));
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node === title || node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) continue;
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference');
      const number = occurrences.length + 1;
      const paragraph = node.closest('p');
      occurrences.push({ id, section });
      check(paragraph, paragraph && !node.closest('.chapter-notes') && paragraph.querySelectorAll('a').length === 1
        && readerParagraphText(paragraph, node) === claims.get(id)?.text
        && currentBookRecordMatches('claims', frozenClaims.get(id), claims.get(id))
        && node.getAttribute('href') === `#${prefix(path)}-claim-${id}`
        && node.getAttribute('aria-label') === `注 ${number}` && node.text === `[${number}]`, `paragraph or note marker ${id}`);
    } else if (node.closest('.chapter-notes')) {
      section = null;
      check(node, node.id === `${prefix(path)}-annotations` && node.text === '注释'
        && node.tagName === (print ? 'H3' : 'H2'), 'annotation heading');
    } else {
      section = node.getAttribute('data-reader-heading-key');
      const text = print ? node.text : node.text.replace(/复制章节链接$/, '');
      const anchor = node.querySelector('a');
      const icon = node.querySelector('button svg');
      headings.push({ id: section, title: text });
      check(node, node.id === headingId(path, section) && node.tagName === (print ? 'H3' : 'H2')
        && (print || (anchor?.text === text && anchor.getAttribute('href') === `#${node.id}`
          && node.querySelectorAll('a,button').length === 2 && Boolean(icon) && trustedFrameworkSvg(icon))), 'formal section');
    }
  }
  if (!same(headings, layout.sections.map(({ id, title }) => ({ id, title }))) || !same(occurrences, sectionOccurrences(layout.sections)))
    errors.push(`${path}: Readable pedigree actual section membership or order differs`);

  const groups = unit.querySelectorAll('.chapter-notes');
  const lists = groups[0]?.querySelectorAll('ol') ?? [];
  const notes = unit.querySelectorAll('[data-reader-claim]');
  const direct = lists[0]?.childNodes.filter(node => node.nodeType === 1) ?? [];
  if (groups.length !== 1 || groups[0].getAttribute('aria-labelledby') !== `${prefix(path)}-annotations`
      || lists.length !== 1 || lists[0].parentNode !== groups[0]
      || !same(notes.map(node => node.getAttribute('data-reader-claim')), sectionOccurrences(layout.sections).map(row => row.id))
      || notes.length !== direct.length || notes.some((note, index) => note !== direct[index] || note.tagName !== 'LI'))
    errors.push(`${path}: Readable pedigree continuous note list differs`);
  errors.push(...validateExchangeAnnotationOutput(document, unit, readablePedigreeRoute, catalog, { print, readings }));
  for (const note of notes) {
    const annotation = note.querySelector('.claim-annotation');
    check(annotation, Boolean(annotation), 'annotation content');
  }
  const study = validateReadablePedigreeStudyTable(unit, path, layout.studyTable);
  errors.push(...study.errors);
  for (const node of study.checked) checked.add(node);
  const entries = applyCurrentHistoricalEntries(document, remapReadablePedigreeCitations(readablePedigreeOriginalEntries(), accepted, independentDigest));
  errors.push(...validateHistoricalLocations(document, unit, path, entries));
  const historical = validateReaderHistoricalText(unit, entries, path, target => readablePedigreeCitationLabel(target, accepted));
  errors.push(...historical.errors);
  for (const node of historical.checked) check(node, true, 'historical context');
  if (unit.querySelectorAll('img,figure,canvas,video,iframe,object,embed,audio').length
      || unit.querySelectorAll('svg').some(node => !trustedFrameworkSvg(node))
      || unaccountedReaderText(unit, checked).length)
    errors.push(`${path}: Readable pedigree contains unreviewed visible content`);
  return errors;
}
