import { isVerifiedReaderPagination } from './reader-numbering-output.mjs';
import { validateReaderHistoricalText } from './reader-publication-text.mjs';
import { createHash } from 'node:crypto';
import headingCapture from '../config/hybrid-inventory-heading-history.json' with { type: 'json' };
import { validateExchangeAnnotationOutput, unaccountedReaderText } from './reader-exchange-semantics.mjs';
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';

export const hybridInventoryRoute = '/docs/book/inventory-boundary-and-hybrid';
export const hybridInventoryTitles = ['过程经济边界', '双向账户', '误差来源'];
/** @type {string | null} Actual v2 source/arithmetic/context and independent reader acceptance. */
export const hybridInventoryProseDigest = 'efbff0fec68e6d5be4af9c6ed5e2bc9634dd1bd350cd9879c399080292049441';
const titles = hybridInventoryTitles;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
const sameRecord = (a, b) => same(ordered(a), ordered(b));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const mdxDigest = raw => createHash('sha256').update(raw.replaceAll('\r\n', '\n')).digest('hex');

export function assertHybridInventoryAccepted(accepted) {
  if (digest(accepted) !== '21e8a1c953ae3ea54e36542e629f594907998c424b8717c9c96c4659e56c7409') throw new Error('Accepted B09 original38/one-source-reviewed-addition and mapped-three-section occurrence inventory differs from clean 0aed5f6');
}
export function assertHybridInventoryHeadingHistory(history) {
  if (digest(history) !== '2c57b75e192f35e06dfdb42a5faae19dcaabe318f829f2d1c73d03784a722f86') throw new Error('Published B09 seven-heading history differs from actual clean 0aed5f6 capture');
}
export function assertHybridInventoryRegistration(edition) {
  const unit = edition.units.find(unit => unit.key === hybridInventoryRoute);
  if (!unit || unit.source !== hybridInventoryRoute || unit.kind !== 'chapter' || unit.coverage?.length || unit.part !== '可比世界'
    || !same(unit.sections, titles.map(title => ({ id: title, title })))) throw new Error('Missing or changed shared B09 chapter/part/three-section registration');
}

/** Final reviewed manuscript receipt is independent of the original occurrence inventory.
 * Never regenerate its pin from altered current prose to bypass renewed review.
 */
export function assertHybridInventoryProseAccepted(prose, independentDigest = hybridInventoryProseDigest) {
  // The default is independently pinned after actual source, arithmetic,
  // context and reader review. Explicit fixture digests exercise this API;
  // production callers use the fixed default. The receipt cannot authorize
  // its own digest, and missing acceptance fails closed.
  if (!prose || prose.status !== 'reviewed' || !Array.isArray(prose.claims) || prose.claims.length !== 39
    || !Array.isArray(prose.sources) || prose.sources.length !== 1 || !/^[a-f0-9]{64}$/.test(independentDigest ?? ''))
    throw new Error('B09 requires its actual independently reviewed manuscript and a separately pinned acceptance digest; acceptance is incomplete');
  if (digest(prose) !== independentDigest) throw new Error('B09 canonical prose receipt differs from the separately pinned reviewed manuscript');
}

/**
 * @param {import('../lib/catalog').Catalog | null} catalog
 * @param {{status: string, claims: object[], sources: {route: string, mdxSha256: string}[]} | null} prose
 */
export function validateHybridInventoryCoverage(edition, sources, accepted, catalog = null, prose = null, independentDigest = hybridInventoryProseDigest) {
  assertHybridInventoryAccepted(accepted); assertHybridInventoryRegistration(edition);
  const raw = sources.get(hybridInventoryRoute), errors = [];
  if (raw === undefined) return ['Missing accepted shared B09 source'];
  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw)?.[1] ?? '';
  const title = /^title:\s*(.+?)\s*$/m.exec(frontMatter)?.[1]?.replace(/^(['"])(.*)\1$/, '$2');
  if (title !== accepted.title) errors.push('B09 shared source has the wrong adopted title');
  const split = raw.split(/^## (.+)\s*$/m), headings = [], actual = [];
  for (let i = 1; i < split.length; i += 2) {
    const section = split[i].trim(); headings.push(section);
    actual.push(...collectChapterClaimOccurrences(split[i + 1]).map(id => ({ id, section })));
  }
  const expected = accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })));
  if (!same(headings, titles)) errors.push('B09 source must have exactly three actual adopted formal sections');
  if (collectChapterClaimOccurrences(raw).length !== actual.length || !same(actual, expected)) errors.push('B09 propositions missing, duplicated, reordered, replaced, outside sections or misplaced');
  if (catalog) {
    assertHybridInventoryProseAccepted(prose, independentDigest);
    if (!same(prose.sources.map(source => source.route), [hybridInventoryRoute])) errors.push('B09 accepted MDX source differs from exact shared C19 source');
    for (const source of prose.sources) if (!sources.has(source.route) || mdxDigest(sources.get(source.route)) !== source.mdxSha256) errors.push(`B09 source differs from independently reviewed MDX: ${source.route}`);
    if (!same(prose.claims.map(claim => claim.id), expected.map(claim => claim.id))) errors.push('B09 accepted canonical prose has the wrong occurrence order');
    for (const fixed of prose.claims) {
      const claim = catalog.claims.find(claim => claim.id === fixed.id);
      if (!claim || claim.status !== 'reviewed' || !sameRecord(claim, fixed)) errors.push(`B09 canonical proposition differs from independently reviewed draft: ${fixed.id}`);
    }
  }
  return errors;
}

export function hybridInventoryHeadingEntries(history) {
  assertHybridInventoryHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading => ({ route: heading.route, path: '/print', id: heading.id,
    targets: [{ route: heading.route, path: '/print', id: heading.id, kind: 'heading' }], mode: 'retained',
    edition: { sourceCommit: history.sourceCommit, sourceDate: history.sourceDate } }));
}

/** Preserve every original C19 address/meaning and the separately captured seven headings. */
export function remapHybridInventoryCitations(entries, accepted, history) {
  assertHybridInventoryAccepted(accepted); assertHybridInventoryHeadingHistory(history);
  const originals = [...accepted.originalHistoricalEntries, ...hybridInventoryHeadingEntries(history)];
  const byAddress = new Map(originals.map(entry => [`${entry.path}#${entry.id}`, entry]));
  if (originals.length !== 179 || byAddress.size !== 179) throw new Error('B09 requires its complete172 original plus7 captured address inventory');
  for (const [address, original] of byAddress) {
    const found = entries.filter(entry => `${entry.path}#${entry.id}` === address);
    if (found.length !== 1 || !sameRecord(found[0], original)) throw new Error(`B09 historical address missing, repeated or changed: ${address}`);
  }
  for (const entry of entries) if (entry.route === hybridInventoryRoute && !byAddress.has(`${entry.path}#${entry.id}`))
    throw new Error(`B09 unexpected historical address: ${entry.path}#${entry.id}`);
  return entries.map(entry => {
    if (entry.route !== hybridInventoryRoute) return entry;
    const path = entry.path, print = path === '/print', prefix = print ? printUnitAnchor(hybridInventoryRoute) : chapterAnchorPrefix(hybridInventoryRoute);
    const first = entry.targets[0], target = (kind, id, claimId = undefined) => ({ route: hybridInventoryRoute, path, id, kind, ...(claimId ? { claimId } : {}) });
    if (first.kind === 'note') return entry;
    if (first.kind === 'heading') {
      const heading = accepted.sourceHeadings.find(heading => first.id === `${print ? `${printUnitAnchor(hybridInventoryRoute)}-` : ''}${heading.id}`);
      if (!heading) throw new Error(`B09 original heading has no exact section mapping: ${entry.id}`);
      return { ...entry, targets: [target('heading', `${print ? `${printUnitAnchor(hybridInventoryRoute)}-` : ''}${heading.target}`)], mode: 'alias' };
    }
    const notes = accepted.source.claimIds.map(id => target('note', `${prefix}-claim-${id}`, id));
    const isGroup = first.kind === 'note-group', native = isGroup ? `${prefix}-annotations` : prefix;
    const targets = isGroup ? notes : [...titles.map(title => target('heading', `${print ? `${prefix}-` : ''}${title}`)), ...notes];
    const text = isGroup
      ? `原《${accepted.source.title}》的38则注释列于下方；这些链接保留原文的确切注释范围与顺序；《混合清单》现还包含新增论述与注释。`
      : `原《${accepted.source.title}》现按过程经济边界、双向账户与误差来源编排。下列链接标明所在各节及原有38则注释；《混合清单》现还包含新增论述与注释。`;
    if (entry.id === native) return { ...entry, targets: [target(first.kind, native)], mode: 'retained', scope: { text, targets } };
    return { ...entry, targets, mode: 'notice', scope: { text, targets } };
  });
}

function paragraphText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  return node.nodeType === 1 ? node.childNodes.map(child => paragraphText(child, marker)).join('') : '';
}

/** Account for every substantive text node, including text outside paragraphs.
 * Metadata is exact reviewed source/navigation text, not an unrestricted header
 * exception. Known historical contexts are also matched exactly here; the
 * global historical-scope/destination checks remain independently mandatory.
 */
function validateHybridInventoryTextCoverage(unit, path, accepted, prose, {legacyPrintLabel = null} = {}) {
  const print = path === '/print', checked = new Set(), errors = [];
  const compact = value => value.replace(/\s+/g, '');
  const children = unit.childNodes.filter(node => node.nodeType === 1);
  const title = children.find(node => node.tagName === (print ? 'H2' : 'H1'));
  const legacyTitle = print && legacyPrintLabel !== null ? `${legacyPrintLabel}　${accepted.title}` : null;
  if (title && (title.text === accepted.title || (legacyTitle !== null && title.text === legacyTitle))) checked.add(title);
  else errors.push(`${path}: B09 visible chapter title differs`);
  const next = title ? children[children.indexOf(title) + 1] : null;
  const description = prose?.sources?.find(source => source.route === hybridInventoryRoute)?.description;
  if (typeof description === 'string' && description && next?.tagName !== 'P')
    errors.push(`${path}: B09 reviewed description is missing`);
  if (next?.tagName === 'P') {
    if (typeof description !== 'string' || !description || next.text !== description) errors.push(`${path}: B09 description requires exact reviewed source metadata`);
    else checked.add(next);
  }
  if (!print) {
    // The actual DocsPage shell has one product breadcrumb before its H1.
    const beforeTitle = title ? children.slice(0, children.indexOf(title)) : [];
    const breadcrumb = beforeTitle.filter(node => node.tagName === 'DIV' && node.text === '生命周期评价的前世今生');
    if (breadcrumb.length === 1) checked.add(breadcrumb[0]);
    const pagination = children.filter(node => node.classList?.contains('docs-pagination'));
    const navigation = prose?.sources?.find(source => source.route === hybridInventoryRoute)?.navigation;
    if (Array.isArray(navigation) && navigation.length && pagination.length !== 1)
      errors.push(`${path}: B09 reviewed pagination is missing or repeated`);
    if (pagination.length > 1) errors.push(`${path}: repeated B09 pagination metadata`);
    for (const node of pagination) {
      if (isVerifiedReaderPagination(node)) { checked.add(node); continue; }
      const links = node.querySelectorAll('a');
      if (!Array.isArray(navigation) || navigation.length !== links.length || !navigation.length
        || navigation.some((item, index) => typeof item.title !== 'string' || typeof item.description !== 'string'
          || links[index].getAttribute('href') !== item.href || compact(links[index].text) !== compact(item.title + item.description))
        || compact(node.text) !== compact(navigation.map(item => item.title + item.description).join('')))
        errors.push(`${path}: B09 pagination requires exact reviewed neighbor metadata`);
      else checked.add(node);
    }
  }
  const prefix = print ? printUnitAnchor(hybridInventoryRoute) : chapterAnchorPrefix(hybridInventoryRoute);
  for (const heading of unit.querySelectorAll(print ? 'h3' : 'h2')) {
    const local = print && heading.id.startsWith(prefix + '-') ? heading.id.slice(prefix.length + 1) : heading.id;
    if (titles.includes(local) || heading.id === `${prefix}-annotations`) checked.add(heading);
  }
  for (const marker of unit.querySelectorAll('a[role="doc-noteref"]')) {
    const paragraph = marker.closest('p'); if (paragraph) checked.add(paragraph);
  }
  // The shared annotation validator accounts for all annotation text below its
  // checked scope/source/carrier/caveat/premise/input nodes, including additions.
  const expectedClaimIds = accepted.sections.flatMap(section => section.claimIds);
  for (const note of unit.querySelectorAll('[data-reader-claim]')) {
    const id = note.getAttribute('data-reader-claim'), annotations = note.querySelectorAll('.claim-annotation');
    if (expectedClaimIds.includes(id) && note.id === `${prefix}-claim-${id}` && annotations.length === 1) checked.add(annotations[0]);
  }
  const entries = remapHybridInventoryCitations([
    ...accepted.originalHistoricalEntries, ...hybridInventoryHeadingEntries(headingCapture),
  ], accepted, headingCapture).filter(entry => entry.path === path);
  const noteIds = accepted.sections.flatMap(section => section.claimIds);
  const label = target => target.kind === 'note' ? `《${accepted.title}》注 ${noteIds.indexOf(target.claimId) + 1}`
    : `《${accepted.title}》${print && target.kind === 'heading' ? `·${target.id.slice(prefix.length + 1)}` : target.kind === 'note-group' ? '注释' : ''}`;
  const contexts = validateReaderHistoricalText(unit, entries, path, label);
  errors.push(...contexts.errors);
  for (const node of contexts.checked) checked.add(node);
  if (unaccountedReaderText(unit, checked).length) errors.push(`${path}: B09 contains unexpected unreviewed body text`);
  return errors;
}

/** Actual paragraph text and section membership are checked independently of IDs and note deduplication. */
export function validateRenderedHybridInventory(document, path, accepted, catalog, prose = null, independentDigest = hybridInventoryProseDigest, legacyContext = {}) {
  assertHybridInventoryAccepted(accepted);
  if (![hybridInventoryRoute, '/print'].includes(path)) return [];
  assertHybridInventoryProseAccepted(prose, independentDigest);
  const print = path === '/print', prefix = print ? `${printUnitAnchor(hybridInventoryRoute)}-` : '';
  const units = print ? document.querySelectorAll(`article[data-reader-route="${hybridInventoryRoute}"]`) : document.querySelectorAll('article');
  if (units.length !== 1) return [`${path}: missing or repeated actual B09 reading unit`];
  const unit = units[0], errors = [], title = print ? unit.getAttribute('data-reader-title') : unit.querySelector('h1')?.text;
  if (!Array.isArray(catalog?.claims)) return [`${path}: actual B09 body validation requires the canonical catalog`];
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  if (title !== accepted.title) errors.push(`${path}: wrong actual B09 title`);
  const headings = [], actual = []; let section = null;
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) continue;
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference'), paragraph = node.closest('p'), claim = claims.get(id);
      actual.push({ id, section });
      if (!paragraph || !claim || typeof claim.text !== 'string' || paragraphText(paragraph, node) !== claim.text) errors.push(`${path}: B09 actual paragraph differs from canonical text: ${id}`);
      if (prose && !sameRecord(claim, prose.claims.find(fixed => fixed.id === id))) errors.push(`${path}: actual canonical record differs from independently reviewed B09 draft: ${id}`);
    } else if (node.closest('.chapter-notes')) section = null;
    else if (titles.includes(node.id.slice(prefix.length))) {
      section = node.id.slice(prefix.length); headings.push(section);
      if (node.tagName !== (print ? 'H3' : 'H2') || node.text.replace(/复制章节链接$/, '') !== section) errors.push(`${path}: wrong actual B09 formal heading`);
    } else if (node.tagName !== (print ? 'H2' : 'H1')) errors.push(`${path}: unexpected actual B09 body heading`);
  }
  if (!same(headings, titles)) errors.push(`${path}: missing, duplicated or reordered actual B09 formal sections`);
  if (!same(actual, accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))))) errors.push(`${path}: actual B09 propositions missing, duplicated, reordered, replaced or misplaced`);
  const groups = unit.querySelectorAll('.chapter-notes');
  if (groups.length !== 1 || groups[0].querySelector('h2,h3')?.id !== `${print ? printUnitAnchor(hybridInventoryRoute) : chapterAnchorPrefix(hybridInventoryRoute)}-annotations` || groups[0].querySelector('h2,h3')?.text !== '注释') errors.push(`${path}: missing or repeated actual B09 annotation group`);
  const notes = unit.querySelectorAll('[data-reader-claim]').map(node => node.getAttribute('data-reader-claim'));
  if (!same(notes, accepted.sections.flatMap(section => section.claimIds))) errors.push(`${path}: actual B09 endnotes differ from the 39-claim continuous plan`);
  errors.push(...validateExchangeAnnotationOutput(document, unit, hybridInventoryRoute, catalog, { print }));
  errors.push(...validateHybridInventoryTextCoverage(unit, path, accepted, prose, legacyContext));
  return errors;
}
