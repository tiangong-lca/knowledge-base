import { createHash } from 'node:crypto';
import original from '../config/toxicity-pathways-original.json' with { type: 'json' };
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';
import { publicCatalog } from './knowledge.mjs';
import { concealedText, qualifyHeadingCopyButtons, trustedFrameworkSvg } from './reader-data-applicability.mjs';
import { isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { unaccountedReaderText, validateExchangeAnnotationOutput } from './reader-exchange-semantics.mjs';
import { readerParagraphText, validateReaderHistoricalText } from './reader-publication-text.mjs';

export const toxicityPathwaysRoute = '/docs/book/usetox-pathways-and-boundaries';
export const toxicityPathwaysTitle = '毒性路径';
export const toxicityPathwaysOriginalDigest = '90fa03189186e997fb1fcc7cb32ebf23b692fe04a1ff8adbec366127365cae32';
// Main sets the independent pin after source, reader and engineering acceptance.
/** @type {string|null} */
export const toxicityPathwaysAcceptedDigest = '52639eabd6a05df7fe521a82c5dd55e7785eb1963f84996932441fa0d9ed6a2a';

const sections = [
  { id: '排放与受体', title: '排放与受体', claimIds: [
    'cl-usetox-matched-emissions', 'cl-usetox-fate-exposure-effect',
    'cl-usetox-intake-and-effects', 'cl-usetox-indicators-not-observed-cases',
  ] },
  { id: '模型与范围', title: '模型与范围', claimIds: [
    'cl-usetox-model-comparison', 'cl-usetox-comparison-uncertainty',
    'cl-usetox-boxes-and-time', 'cl-usetox-internal-feature-conflict',
  ] },
  { id: '比较的依据', title: '比较的依据', claimIds: [
    'cl-usetox-missing-data-model-zero', 'cl-usetox-factor-flags-and-conditions',
    'cl-usetox-prioritization', 'cl-usetox-conclusion',
  ] },
];
const ids = sections.flatMap(section => section.claimIds);
const auditIds = {
  gaps: ['gap-lcia-usetox-internal-scope-conflict'],
  revisions: [
    'rev-kb88-rosenbaum-original-selected-reading',
    'rev-kb88-usetox-documentary-scope',
    'rev-kb88-main-pathway-reinspection',
  ],
  queries: ['q-kb88-usetox-2008-original', 'q-kb88-usetox-2011-original', 'q-kb88-usetox-scope-erratum'],
};
const hash = value => createHash('sha256').update(value).digest('hex');
export const toxicityPathwaysDigest = value => hash(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const ordered = value => Array.isArray(value) ? value.map(ordered)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]))
    : value;
const sameRecord = (a, b) => same(ordered(a), ordered(b));
const nonempty = value => typeof value === 'string' && !!value.trim();
const digestLike = value => /^[a-f0-9]{64}$/.test(value ?? '');
const unique = values => [...new Set(values)];
const exactIds = (rows, expected) => Array.isArray(rows) && same(rows.map(row => row.id).sort(), [...expected].sort());
const includesOriginal = (rows, frozen) => frozen.every(row => sameRecord(rows.find(record => record.id === row.id), row));

function conservesManualReading(readings) {
  const [frozen] = original.originalReadingRecords;
  const current = readings.find(row => row.id === frozen.id);
  if (!current || !Array.isArray(current.passages)) return false;
  const { passages: originalPassages, unread: originalUnread, ...originalIdentity } = frozen;
  const { passages, unread, ...identity } = current;
  const readOriginal2008 = readings.some(row => row.workId === 'lit-m06' && row.readingStatus === 'selected-passages');
  const staleAccessLimit = 'Original Rosenbaum2008 article full text remains unacquired; its abstract is not substituted for this manual.';
  const expectedUnread = readOriginal2008 ? originalUnread.filter(item => item !== staleAccessLimit) : originalUnread;
  return sameRecord(identity, originalIdentity) && sameRecord(passages.slice(0, originalPassages.length), originalPassages)
    && sameRecord(unread, expectedUnread);
}

export function assertToxicityPathwaysOriginal(value = original) {
  if (toxicityPathwaysDigest(value) !== toxicityPathwaysOriginalDigest)
    throw new Error('Toxicity pathways immutable c919 scientific and publication inventory differs');
}

export function assertToxicityPathwaysAccepted(accepted, independentDigest = toxicityPathwaysAcceptedDigest) {
  assertToxicityPathwaysOriginal();
  if (!accepted || accepted.schemaVersion !== 1 || accepted.status !== 'reviewed'
      || accepted.originalDigest !== toxicityPathwaysOriginalDigest || !digestLike(independentDigest)
      || toxicityPathwaysDigest(accepted) !== independentDigest)
    throw new Error('Toxicity pathways requires independently reviewed current content; acceptance is incomplete');
  if (accepted.route !== toxicityPathwaysRoute || accepted.title !== toxicityPathwaysTitle
      || !sameRecord(accepted.sections, sections) || !same(accepted.claims?.map(row => row.id), ids)
      || accepted.claims.some(row => row.status !== 'reviewed')
      || !digestLike(accepted.source?.mdxSha256) || !nonempty(accepted.source?.description))
    throw new Error('Toxicity pathways requires its exact shared source, three sections and twelve canonical records');

  const closure = accepted.scientificClosure;
  const evidenceIds = unique(accepted.claims.flatMap(row => row.evidenceIds));
  const externalIds = unique(accepted.claims.flatMap(row => row.premiseIds)).filter(id => !ids.includes(id));
  if (!closure || !exactIds(closure.claims, externalIds) || !exactIds(closure.evidence, evidenceIds)
      || !exactIds(closure.sources, unique(closure.evidence.map(row => row.sourceId)))
      || !includesOriginal(closure.evidence, original.scientificClosure.evidence)
      || !includesOriginal(closure.sources, original.scientificClosure.sources))
    throw new Error('Toxicity pathways evidence, source and external-premise closure differs or changes an original');

  const research = accepted.research;
  if (!research || !exactIds(research.readings, unique(closure.evidence.map(row => row.readingId)))
      || !Array.isArray(research.literature)
      || research.literature.length !== unique(research.readings.map(row => row.workId)).length
      || research.readings.some(reading => research.literature.filter(work => work.id === reading.workId || work.workId === reading.workId).length !== 1)
      || !conservesManualReading(research.readings)
      || !includesOriginal(research.literature, original.originalLiteratureRecords)
      || closure.evidence.some(row => {
        const reading = research.readings.find(record => record.id === row.readingId);
        const source = closure.sources.find(record => record.id === row.sourceId);
        return source?.reading?.readingId !== reading?.id || !reading?.passages.some(passage => passage.id === row.passageId);
      }))
    throw new Error('Toxicity pathways selected research closure differs or changes an original');
  if (Object.entries(auditIds).some(([kind, expected]) => !exactIds(research[kind], expected)))
    throw new Error('Toxicity pathways requires the exact seven research audit records');

  if (!same(accepted.b32Consumers?.map(row => row.id), original.directPremiseConsumers.map(row => row.id))
      || accepted.b32Consumers.some(row => !nonempty(row.rationale))
      || !Array.isArray(accepted.reviewEvidence) || !accepted.reviewEvidence.length
      || accepted.reviewEvidence.some(row => !nonempty(row.kind) || !digestLike(row.reportSha256) || !digestLike(row.receiptSha256)))
    throw new Error('Toxicity pathways requires independently reviewed content and both B32 consumer judgments');
  for (const id of original.b32AffectedOriginalIds.claims) {
    const before = original.claims.find(row => row.id === id), after = accepted.claims.find(row => row.id === id);
    if (!same(before.evidenceIds, after.evidenceIds) || !same(before.premiseIds, after.premiseIds))
      throw new Error('Toxicity pathways changes B32 premise or evidence membership: ' + id);
  }
}

export function toxicityB32CurrentRecords(accepted, independentDigest) {
  assertToxicityPathwaysAccepted(accepted, independentDigest);
  return {
    changes: original.b32AffectedOriginalIds.claims.map(id => ({
      old: original.claims.find(row => row.id === id),
      current: accepted.claims.find(row => row.id === id),
    })),
    consumers: original.directPremiseConsumers,
  };
}

function inspectSource(raw) {
  const front = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!front) return null;
  const field = key => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(front[1])?.[1].replace(/^(['"])(.*)\1$/, '$2');
  const parts = raw.slice(front[0].length).split(/^## (.+)$/m);
  if (parts[0].trim()) return null;
  const found = [];
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i];
    const explicit = /^(.*?)\s+\[#([^\]]+)\]$/.exec(heading);
    const body = parts[i + 1].trim();
    const occurrences = collectChapterClaimOccurrences(body);
    if (body.replace(/<Prose ids="[^"]+"\s*\/>/g, '').trim() || !occurrences.length) return null;
    found.push({ id: explicit?.[2] ?? heading, title: explicit?.[1] ?? heading, claimIds: occurrences });
  }
  return { title: field('title'), description: field('description'), sections: found };
}

function validateCatalog(catalog, accepted, projection) {
  if (!['raw', 'public'].includes(projection)) throw new Error('Toxicity pathways requires explicit raw or public catalog projection');
  const groups = {
    claims: [...accepted.claims, ...accepted.scientificClosure.claims, ...original.directPremiseConsumers],
    evidence: accepted.scientificClosure.evidence,
    sources: accepted.scientificClosure.sources,
    concepts: [...original.conceptUses.concepts, ...original.conceptUses.adjacentConcepts],
    mappings: original.conceptUses.mappings,
  };
  groups.claims.push(...original.conceptUses.adjacentClaims);
  let expected = groups;
  if (projection === 'public') {
    const reference = { ...catalog };
    for (const [kind, rows] of Object.entries(groups)) {
      const fixed = new Set(rows.map(row => row.id));
      reference[kind] = catalog[kind].filter(row => !fixed.has(row.id)).concat(rows);
    }
    expected = publicCatalog(reference);
  }
  const errors = [];
  for (const [kind, rows] of Object.entries(groups)) for (const row of rows) {
    const actual = catalog[kind]?.filter(record => record.id === row.id) ?? [];
    if (actual.length !== 1 || !sameRecord(actual[0], expected[kind].find(record => record.id === row.id)))
      errors.push(`Toxicity pathways reviewed ${kind} record differs: ${row.id}`);
  }
  return errors;
}

/** @param {any} edition @param {Map<string,string>} sources @param {any} catalog @param {any} accepted @param {string|null} independentDigest @param {{projection?:'raw'|'public',readings?:any,literature?:any}} options */
export function validateToxicityPathwaysCoverage(edition, sources, catalog, accepted,
    independentDigest = toxicityPathwaysAcceptedDigest, { projection = 'raw', readings, literature } = {}) {
  assertToxicityPathwaysAccepted(accepted, independentDigest);
  const units = edition?.units?.filter(unit => unit.key === toxicityPathwaysRoute || unit.source === toxicityPathwaysRoute);
  if (units?.length !== 1 || !sameRecord(units[0], original.publication.bookEdition))
    throw new Error('Toxicity pathways requires the shared current web and book source registration');
  const errors = validateCatalog(catalog, accepted, projection);
  const raw = sources.get(toxicityPathwaysRoute)?.replaceAll('\r\n', '\n');
  const actual = raw && inspectSource(raw);
  if (!actual || hash(raw) !== accepted.source.mdxSha256
      || !sameRecord(actual, { title: accepted.title, description: accepted.source.description, sections }))
    errors.push('Toxicity pathways actual MDX title, description, body or section order differs');
  const researchRows = {
    readings: readings?.readings,
    literature: literature?.records,
    gaps: readings?.gaps,
    revisions: readings?.revisions,
    queries: literature?.protocol?.queries,
  };
  for (const [kind, actualRows] of Object.entries(researchRows)) {
    const frozenRows = accepted.research[kind];
    for (const row of frozenRows) {
      const found = actualRows?.filter(record => record.id === row.id);
      if (found?.length !== 1 || !sameRecord(found[0], row)) errors.push('Toxicity pathways reviewed research record differs: ' + row.id);
    }
  }
  return errors;
}

const address = entry => `${entry.path}#${entry.id}`;
const location = path => path === '/print' ? printUnitAnchor(toxicityPathwaysRoute) : chapterAnchorPrefix(toxicityPathwaysRoute);
/** @returns {import('./reader-citations.mjs').Destination} */
const target = (path, kind, id, claimId) => ({ route: toxicityPathwaysRoute, path, id, kind, ...(claimId ? { claimId } : {}) });

/** Add only the three actual c919 print sections absent from older inventories.
 * @returns {import('./reader-citations.mjs').LegacyEntry[]} */
export function toxicityPathwaysHeadingEntries() {
  assertToxicityPathwaysOriginal();
  const capture = original.publication.actualHostedCapture;
  return original.publication.history.additionalActualPrintHeadings.map(row => ({
    route: toxicityPathwaysRoute, path: row.path, id: row.id, mode: 'retained',
    targets: [target(row.path, 'heading', row.id)],
    edition: { sourceCommit: capture.sourceCommit, sourceDate: capture.sourceDate },
  }));
}

/** @returns {import('./reader-citations.mjs').LegacyEntry[]} */
export function toxicityPathwaysOriginalEntries() {
  return [...original.publication.history.existingAffectedEntries, ...toxicityPathwaysHeadingEntries()];
}

/** @param {import('./reader-citations.mjs').LegacyEntry[]} entries */
export function remapToxicityPathwaysCitations(entries, accepted, independentDigest = toxicityPathwaysAcceptedDigest) {
  assertToxicityPathwaysAccepted(accepted, independentDigest);
  const frozen = new Map(toxicityPathwaysOriginalEntries().map(entry => [address(entry), entry]));
  const seen = new Set();
  const remapped = entries.map(entry => {
    const key = address(entry), fixed = frozen.get(key);
    if (!fixed) {
      if (entry.route === toxicityPathwaysRoute || [...entry.targets, ...entry.scope?.targets ?? []].some(row => row.route === toxicityPathwaysRoute))
        throw new Error('Toxicity pathways unqualified historical entry: ' + key);
      return entry;
    }
    if (seen.has(key) || !sameRecord(entry, fixed)) throw new Error('Toxicity pathways historical entry repeated or changed: ' + key);
    seen.add(key);
    return remapOriginalEntry(entry);
  });
  if (seen.size !== frozen.size) throw new Error('Toxicity pathways historical entries are missing');
  return remapped;
}

/** @param {import('./reader-citations.mjs').LegacyEntry} entry @returns {import('./reader-citations.mjs').LegacyEntry} */
function remapOriginalEntry(entry) {
  const { path } = entry, first = entry.targets[0], prefix = location(path), print = path === '/print';
  if (first.kind === 'note') return entry;

  const oldSource = original.publication.originalSourceIdentities.find(row => row.commit === entry.edition.sourceCommit);
  const oldView = original.publication.actualHostedCapture.views.find(row => row.path === path);
  const oldHeading = first.kind === 'heading' && oldView.sections.find(row => row.id === first.id);
  const group = first.kind === 'note-group';
  if (!oldSource || (first.kind === 'heading' && !oldHeading)) throw new Error('Toxicity pathways missing qualified historical source scope: ' + entry.id);
  const oldIds = oldHeading ? oldHeading.claimIds : oldSource.claimIds;
  const notes = oldIds.map(id => target(path, 'note', `${prefix}-claim-${id}`, id));
  const headings = unique(oldIds.map(id => sections.find(section => section.claimIds.includes(id)).id))
    .map(id => target(path, 'heading', print ? `${prefix}-${id}` : id));
  const targets = group ? notes : [...headings, ...notes];
  const name = oldHeading ? `“${oldHeading.title}”` : group ? '注释组' : '篇章';
  const text = `原《${oldSource.title}》${name}的范围由下列原有${notes.length}则注释${group ? '' : '与具名内容位置'}界定。各链接保留原命题及原顺序，现行篇章另有其他内容。`;
  const scope = { text, targets };
  // Native current chapter and endnote anchors remain real DOM elements. Add a
  // separate old-subset context beside them without duplicating the fragment.
  if (!oldHeading && entry.id === first.id) return { ...entry, scope };
  return { ...entry, mode: 'notice', targets, scope };
}

export function toxicityPathwaysCitationLabel(destination, accepted) {
  const prefix = printUnitAnchor(toxicityPathwaysRoute);
  const headingId = destination.path === '/print' ? destination.id.slice(prefix.length + 1) : destination.id;
  const section = sections.find(row => row.id === headingId);
  const suffix = destination.kind === 'note' ? `注 ${ids.indexOf(destination.claimId) + 1}`
    : destination.kind === 'heading' && section ? `·${section.title}`
    : destination.kind === 'note-group' ? '注释' : '';
  return `《${accepted.title}》${suffix}`;
}

function hasNativeHeadingLink(heading, title) {
  const [anchor, button] = heading.childNodes.filter(node => node.nodeType === 1);
  const icon = button?.querySelector('svg');
  return anchor?.tagName === 'A' && anchor.text === title && anchor.getAttribute('href') === `#${heading.id}`
    && button?.tagName === 'BUTTON' && heading.querySelectorAll('a,button').length === 2
    && !!icon && trustedFrameworkSvg(icon);
}

/** Inspect the normalized DOM after the independent numbered output checks. */
export function validateRenderedToxicityPathways(document, path, catalog, accepted,
    independentDigest = toxicityPathwaysAcceptedDigest, projection = 'raw') {
  if (![toxicityPathwaysRoute, '/print'].includes(path)) return [];
  assertToxicityPathwaysAccepted(accepted, independentDigest);
  const errors = validateCatalog(catalog, accepted, projection);
  const print = path === '/print';
  const units = document.querySelectorAll(`article[data-reader-route="${toxicityPathwaysRoute}"]`);
  if (units.length !== 1) return [...errors, `${path}: Toxicity pathways actual reading unit missing or repeated`];
  const unit = units[0], prefix = location(path), checked = new Set();
  const children = unit.childNodes.filter(node => node.nodeType === 1);
  const title = children.find(node => node.tagName === (print ? 'H2' : 'H1'));
  const description = title?.nextElementSibling;
  const checkText = (node, valid, subject) => {
    if (!valid || concealedText(node)) errors.push(`${path}: Toxicity pathways ${subject} differs or is hidden`);
    else checked.add(node);
  };
  checkText(title, title?.text === accepted.title && unit.getAttribute('data-reader-title') === accepted.title
    && (!print || unit.id === prefix), 'actual title or chapter identity');
  checkText(description, description?.tagName === 'P' && description.text === accepted.source.description, 'actual description');
  if (!print) {
    const pagination = unit.querySelectorAll('.docs-pagination');
    if (pagination.length !== 1 || !isVerifiedReaderPagination(pagination[0]))
      errors.push(`${path}: Toxicity pathways website pagination lacks independent qualification`);
    else checked.add(pagination[0]);
    qualifyHeadingCopyButtons(unit, { headings: sections });
  }

  const group = unit.querySelectorAll('.chapter-notes'), notes = unit.querySelectorAll('[data-reader-claim]');
  const groupId = `${prefix}-annotations`;
  const lists = group[0]?.querySelectorAll('ol') ?? [];
  const [list] = lists;
  const groupNotes = list?.childNodes.filter(node => node.nodeType === 1) ?? [];
  if (group.length !== 1 || group[0].getAttribute('aria-labelledby') !== groupId
      || lists.length !== 1 || list.parentNode !== group[0] || Object.keys(list.attributes).length !== 0
      || groupNotes.length !== notes.length || groupNotes.some((node, index) => node !== notes[index])
      || notes.length !== ids.length || notes.some((node, index) => node.tagName !== 'LI' || !sameRecord(node.attributes, {
        id: `${prefix}-claim-${ids[index]}`,
        'data-reader-claim': ids[index],
      })))
    errors.push(`${path}: Toxicity pathways exact continuous note group differs`);

  const claims = new Map(accepted.claims.map(row => [row.id, row]));
  const headings = [], occurrences = [];
  let section = null;
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]') || node === title) continue;
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference'), number = occurrences.length + 1;
      occurrences.push({ id, section });
      const paragraph = node.closest('p');
      checkText(paragraph, paragraph && !node.closest('.chapter-notes')
        && paragraph.querySelectorAll('a').length === 1 && claims.has(id)
        && readerParagraphText(paragraph, node) === claims.get(id).text
        && node.getAttribute('href') === `#${prefix}-claim-${id}`
        && node.getAttribute('aria-label') === `注 ${number}` && node.text === `[${number}]`,
      `actual canonical paragraph or note marker ${id}`);
    } else if (node.closest('.chapter-notes')) {
      section = null;
      checkText(node, node.id === groupId && node.text === '注释' && node.tagName === (print ? 'H3' : 'H2'), 'annotation heading');
    } else {
      section = print ? node.id.slice(prefix.length + 1) : node.id;
      const titleText = print ? node.text : node.text.replace(/复制章节链接$/, '');
      headings.push({ id: section, title: titleText });
      checkText(node, node.id === (print ? `${prefix}-${section}` : section)
        && node.tagName === (print ? 'H3' : 'H2')
        && (print || hasNativeHeadingLink(node, titleText)), 'formal heading');
    }
  }
  if (!same(headings, sections.map(({ id, title }) => ({ id, title })))
      || !same(occurrences, sections.flatMap(({ id, claimIds }) => claimIds.map(claimId => ({ id: claimId, section: id })))))
    errors.push(`${path}: Toxicity pathways actual chapter sections and body order differ`);

  errors.push(...validateExchangeAnnotationOutput(document, unit, toxicityPathwaysRoute, catalog, { print }));
  for (const note of notes) {
    const annotation = note.querySelector('.claim-annotation');
    checkText(annotation, !!annotation, 'actual annotation');
  }
  if (unit.querySelectorAll('img,figure,canvas,video,iframe,object,embed,audio').length
      || unit.querySelectorAll('svg').some(node => !trustedFrameworkSvg(node)))
    errors.push(`${path}: Toxicity pathways unreviewed visual or media content`);

  const entries = remapToxicityPathwaysCitations(toxicityPathwaysOriginalEntries(), accepted, independentDigest).filter(entry => entry.path === path);
  for (const entry of entries) {
    if (entry.mode !== 'retained') {
      const marker = entry.mode === 'alias' ? 'data-legacy-for' : 'data-legacy-notice';
      if (unit.querySelectorAll(`[id="${entry.id}"][${marker}]`).length !== 1)
        errors.push(`${path}: Toxicity pathways historical context missing or repeated: ${entry.id}`);
    } else if (entry.scope) {
      const contexts = unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`), context = contexts[0];
      if (contexts.length !== 1 || !(context.parentNode === unit && unit.id === entry.id
          || context.previousElementSibling?.id === entry.id && context.previousElementSibling.parentNode === context.parentNode))
        errors.push(`${path}: Toxicity pathways historical scope is missing or detached: ${entry.id}`);
    }
  }
  const historical = validateReaderHistoricalText(unit, entries, path, destination => toxicityPathwaysCitationLabel(destination, accepted));
  errors.push(...historical.errors);
  for (const node of historical.checked) checkText(node, true, 'historical context');
  if (unaccountedReaderText(unit, checked).length) errors.push(`${path}: Toxicity pathways contains unexpected unreviewed text`);
  return errors;
}
