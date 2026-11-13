import { currentBookLayout } from './reader-current-expectations.mjs';
import { createHash } from 'node:crypto';
import { readSourceHeading, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';

export const cleanerProductionRoute = '/docs/book/cleaner-production-purpose-and-prospects';
const sectionTitles = ['预防目的', '应用设想', '发展条件'];
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function assertCleanerProductionAccepted(accepted) {
  if (digest(accepted) !== '4a20f7c59a00848b30c63a6d7b9756f451f6478f1ecf4bd9abecbc517b10b380')
    throw new Error('Accepted B05 five-proposition inventory differs from qualified c159b16');
}

export function assertCleanerProductionHeadingHistory(history) {
  if (digest(history) !== '4c02b8ccb2516876e7b3c08e61c18756cb68570a3c7c15da76f9812181941687')
    throw new Error('Published B05 citation inventory differs from actual c159b16 capture');
}

/** Keep the existing shared website/book source and explicit adopted metadata. */
export function assertCleanerProductionRegistration(edition) {
  const unit = edition.units.find(unit => unit.key === cleanerProductionRoute);
  if (!unit || unit.source !== cleanerProductionRoute || unit.kind !== 'chapter' || unit.coverage?.length
    || unit.part !== currentBookLayout('book:part-title:1', '问题的来路') || !same(unit.sections, currentBookLayout('B05:headings', sectionTitles.map(title => ({ id: title, title })))))
    throw new Error('Missing or changed shared B05 chapter/part/three-section registration');
}

/** Occurrences, not deduplicated notes, bind originals and the one reviewed addition.
 * @param {{claims: Array<{id: string, status: string, kind?: string, evidenceIds?: string[], premiseIds?: string[], reviewedAt?: string | null, reviewKind?: string}>} | null} catalog
 */
export function validateCleanerProductionCoverage(edition, sources, accepted, catalog = null) {
  assertCleanerProductionAccepted(accepted);
  assertCleanerProductionRegistration(edition);
  const raw = sources.get(cleanerProductionRoute);
  if (raw === undefined) return ['Missing accepted shared B05 source'];
  const errors = [];
  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw)?.[1] ?? '';
  const title = /^title:\s*(.+?)\s*$/m.exec(frontMatter)?.[1]?.replace(/^(['"])(.*)\1$/, '$2');
  if (title !== currentBookLayout('B05:title', accepted.title)) errors.push('B05 shared source has the wrong adopted title');
  const split = raw.split(/^## (.+)\s*$/m), headings = [], actual = [];
  for (let i = 1; i < split.length; i += 2) {
    const heading = readSourceHeading(split[i]); headings.push(heading);
    const section = heading.id;
    for (const id of collectChapterClaimOccurrences(split[i + 1])) actual.push({ id, section });
  }
  const expected = currentBookLayout('B05:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))));
  if (!same(headings, currentBookLayout('B05:headings', sectionTitles.map(title => ({ id: title, title }))))) errors.push('B05 source must have three actual adopted formal sections');
  if (collectChapterClaimOccurrences(raw).length !== actual.length) errors.push('B05 has body propositions outside formal sections');
  if (!same(actual, expected)) errors.push('B05 original propositions missing, duplicated, reordered, replaced or misplaced');
  if (catalog) {
    for (const { id } of actual) {
      if (catalog.claims.find(claim => claim.id === id)?.status !== 'reviewed') errors.push(`Unreviewed B05 proposition: ${id}`);
    }
    for (const addition of accepted.additions) {
      const record = catalog.claims.find(claim => claim.id === addition.id);
      const fields = ['kind','evidenceIds','premiseIds','reviewedAt','reviewKind'];
      const wanted = currentBookLayout(`B05:addition-metadata:${addition.id}`, Object.fromEntries(fields.map(field => [field, addition[field]])));
      if (!record || fields.some(field => !same(record[field], wanted[field])))
        errors.push(`B05 addition differs from its reviewed type/evidence/premise binding: ${addition.id}`);
    }
  }
  return errors;
}

/** Only three names are new: captured unit/group/note names already belong to canonical history. */
export function cleanerProductionHeadingEntries(history) {
  assertCleanerProductionHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading => ({
    route: heading.route, path: '/print', id: heading.id,
    targets: [{ route: heading.route, path: '/print', id: heading.id, kind: 'heading' }],
    mode: 'retained', edition: { sourceCommit: history.sourceCommit, sourceDate: history.sourceDate },
  }));
}

/** Map each old generation's heading meaning, retaining its own date/source context. */
export function remapCleanerProductionCitations(entries, accepted, history) {
  assertCleanerProductionAccepted(accepted);
  assertCleanerProductionHeadingHistory(history);
  const prefix = printUnitAnchor(cleanerProductionRoute);
  const result = entries.map(entry => {
    if (entry.route !== cleanerProductionRoute || entry.targets[0]?.kind !== 'heading') return entry;
    const old = accepted.sourceHeadings.find(heading => entry.targets[0].id === (entry.path === '/print' ? `${prefix}-${heading.id}` : heading.id));
    if (!old) throw new Error(`Unmapped historical B05 heading: ${entry.path}#${entry.id}`);
    const id = entry.path === '/print' ? `${prefix}-${old.target}` : old.target;
    return { ...entry, targets: [{ route: cleanerProductionRoute, path: entry.path, id, kind: 'heading' }], mode: 'alias' };
  });
  // The captured current family overlaps older canonical names. Check meanings
  // against this independent capture rather than duplicating historical entries.
  const current = [
    ...history.canonicalNotes.map(note => ({ ...note, kind: 'note' })),
    ...history.annotationGroups.map(group => ({ ...group, kind: 'note-group' })),
    { ...history.printedUnit, path: '/print', kind: 'chapter' },
  ];
  for (const captured of current) {
    const found = result.filter(entry => entry.path === captured.path && entry.id === captured.id);
    const target = found[0]?.targets[0];
    if (found.length !== 1 || found[0].targets.length !== 1 || target.route !== cleanerProductionRoute
      || target.path !== captured.path || target.id !== captured.id || target.kind !== captured.kind
      || (captured.claimId && target.claimId !== captured.claimId))
      throw new Error(`Changed captured B05 citation meaning: ${captured.path}#${captured.id}`);
  }
  return result;
}

/** Reassemble decoded text exactly, omitting only the paragraph's own note marker.
 * Do not trim or coalesce whitespace, normalize Unicode, or separate inline spans:
 * ChapterContent splits the final grapheme from the same canonical string.
 */
function paragraphBodyText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  if (node.nodeType !== 1) return '';
  return node.childNodes.map(child => paragraphBodyText(child, marker)).join('');
}

/** Check actual headings, occurrences and canonical paragraph text on both surfaces. */
export function validateRenderedCleanerProduction(document, path, accepted, catalog) {
  assertCleanerProductionAccepted(accepted);
  if (path !== cleanerProductionRoute && path !== '/print') return [];
  const print = path === '/print', prefix = print ? `${printUnitAnchor(cleanerProductionRoute)}-` : '';
  const unit = print ? document.querySelector(`article[data-reader-route="${cleanerProductionRoute}"]`) : document.querySelector('article');
  if (!unit) return [`${path}: missing actual B05 reading unit`];
  const errors = [], title = print ? unit.getAttribute('data-reader-title') : unit.querySelector('h1')?.text;
  if (!Array.isArray(catalog?.claims)) return [`${path}: actual B05 body validation requires the canonical catalog`];
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  if (title !== currentBookLayout('B05:title', accepted.title)) errors.push(`${path}: wrong actual B05 title`);
  let section = null;
  const currentHeadings = currentBookLayout('B05:headings', sectionTitles.map(title => ({ id: title, title })));
  const headings = [], actual = [];
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference');
      actual.push({ id, section });
      const paragraph = node.closest('p'), claim = claims.get(id);
      if (!paragraph || !claim || typeof claim.text !== 'string' || paragraphBodyText(paragraph, node) !== claim.text)
        errors.push(`${path}: actual B05 paragraph body missing or different from canonical claim text: ${id}`);
    } else if (node.id?.startsWith(prefix) && currentHeadings.some(heading => heading.id === node.id.slice(prefix.length))) {
      section = node.id.slice(prefix.length); headings.push({ id: section, title: node.text.replace(/复制章节链接$/, '') });
      if (node.tagName !== (print ? 'H3' : 'H2') || node.text.replace(/复制章节链接$/, '') !== currentHeadings.find(heading => heading.id === section)?.title) errors.push(`${path}: wrong actual B05 formal heading ${node.id}`);
    } else if (node.closest('.chapter-notes')) section = null;
    else if (node.tagName !== (print ? 'H2' : 'H1')) errors.push(`${path}: unexpected B05 body heading ${node.id}`);
  }
  if (!same(headings, currentHeadings)) errors.push(`${path}: missing, duplicated or reordered actual B05 formal sections`);
  const expected = currentBookLayout('B05:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))));
  if (!same(actual, expected)) errors.push(`${path}: actual B05 body propositions missing, duplicated, reordered, replaced or in the wrong section`);
  return errors;
}
