import { currentBookLayout, currentBookMdxMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { createHash } from 'node:crypto';
import { readSourceHeading, chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';

export const processNetworkRoute = '/docs/book/inventory-calculation';
const titles = ['数量坐标', '需求平衡', '反馈边界'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
const sameRecord = (a, b) => same(ordered(a), ordered(b));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const mdxDigest = raw => createHash('sha256').update(raw.replaceAll('\r\n', '\n')).digest('hex');

export function assertProcessNetworkAccepted(accepted) {
  if (digest(accepted) !== 'a433ba526dc6b225e09912aff2535463a4e28fbbddd5b18a7d596b9291f57bab') throw new Error('Accepted B07 original-eight and explicit-two occurrence inventory differs from clean 79af66d');
}
export function assertProcessNetworkHeadingHistory(history) {
  if (digest(history) !== 'c1d0a7e65ff25f0804992cae870669073062f5c0b5d05c01d5da893926fcb1f0') throw new Error('Published B07 four-heading history differs from actual clean 79af66d capture');
}
export function assertProcessNetworkRegistration(edition) {
  const unit = edition.units.find(unit => unit.key === processNetworkRoute);
  if (!unit || unit.source !== processNetworkRoute || unit.kind !== 'chapter' || unit.coverage?.length || unit.part !== '可比世界'
    || !same(unit.sections, currentBookLayout('B07:headings', titles.map(title => ({ id: title, title }))))) throw new Error('Missing or changed shared B07 chapter/part/three-section registration');
}

/** Final reviewed manuscript receipt is independent of the original occurrence inventory.
 * Never regenerate its pin from altered current prose to bypass renewed review.
 */
export function assertProcessNetworkProseAccepted(prose) {
  if (!prose || prose.status !== 'reviewed' || !Array.isArray(prose.claims) || prose.claims.length !== 10 || !Array.isArray(prose.sources) || prose.sources.length !== 1)
    throw new Error('B07 requires its independently reviewed canonical prose acceptance');
  // Pin only the actual final v2 accepted after separate source and reader checks.
  if (digest(prose) !== 'af958e548975ca64c5113146a98065a8898fed3e11ad3c0c181996b4ba46bf83') throw new Error('B07 canonical prose receipt differs from the independently reviewed final v2 draft');
}

/**
 * @param {import('../lib/catalog').Catalog | null} catalog
 * @param {{status: string, claims: object[], sources: {route: string, mdxSha256: string}[]} | null} prose
 */
export function validateProcessNetworkCoverage(edition, sources, accepted, catalog = null, prose = null) {
  assertProcessNetworkAccepted(accepted); assertProcessNetworkRegistration(edition);
  const raw = sources.get(processNetworkRoute), errors = [];
  if (raw === undefined) return ['Missing accepted shared B07 source'];
  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw)?.[1] ?? '';
  const title = /^title:\s*(.+?)\s*$/m.exec(frontMatter)?.[1]?.replace(/^(['"])(.*)\1$/, '$2');
  if (title !== currentBookLayout('B07:title', accepted.title)) errors.push('B07 shared source has the wrong adopted title');
  const split = raw.split(/^## (.+)\s*$/m), headings = [], actual = [];
  for (let i = 1; i < split.length; i += 2) {
    const heading = readSourceHeading(split[i]); headings.push(heading);
    const section = heading.id;
    actual.push(...collectChapterClaimOccurrences(split[i + 1]).map(id => ({ id, section })));
  }
  const expected = currentBookLayout('B07:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))));
  if (!same(headings, currentBookLayout('B07:headings', titles.map(title => ({ id: title, title }))))) errors.push('B07 source must have exactly three actual adopted formal sections');
  if (collectChapterClaimOccurrences(raw).length !== actual.length || !same(actual, expected)) errors.push('B07 propositions missing, duplicated, reordered, replaced, outside sections or misplaced');
  if (catalog) {
    assertProcessNetworkProseAccepted(prose);
    if (!same(prose.sources.map(source => source.route), [processNetworkRoute])) errors.push('B07 accepted MDX source differs from exact shared C17 source');
    for (const source of prose.sources) if (!sources.has(source.route) || !currentBookMdxMatches(source.route, source.mdxSha256, mdxDigest(sources.get(source.route)))) errors.push(`B07 source differs from independently reviewed MDX: ${source.route}`);
    if (!same(prose.claims.map(claim => claim.id), accepted.sections.flatMap(section => section.claimIds))) errors.push('B07 accepted canonical prose has the wrong occurrence order');
    for (const fixed of prose.claims) {
      const claim = catalog.claims.find(claim => claim.id === fixed.id);
      if (!claim || claim.status !== 'reviewed' || !currentBookRecordMatches('claims', fixed, claim)) errors.push(`B07 canonical proposition differs from independently reviewed draft: ${fixed.id}`);
    }
  }
  return errors;
}

export function processNetworkHeadingEntries(history) {
  assertProcessNetworkHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading => ({ route: heading.route, path: '/print', id: heading.id,
    targets: [{ route: heading.route, path: '/print', id: heading.id, kind: 'heading' }], mode: 'retained',
    edition: { sourceCommit: history.sourceCommit, sourceDate: history.sourceDate } }));
}

/** Preserve all three published address generations and the exact original eight-note scope. */
export function remapProcessNetworkCitations(entries, accepted, history) {
  assertProcessNetworkAccepted(accepted); assertProcessNetworkHeadingHistory(history);
  const source = accepted.source, web = chapterAnchorPrefix(processNetworkRoute), print = printUnitAnchor(processNetworkRoute), positional = `print-chapter-${source.legacyNumericBaseline.printOrdinal}`;
  const expected = new Map();
  const add = (path, id, kind, targetId = id, claimId = undefined) => expected.set(`${path}#${id}`, { kind, targetId, claimId });
  add('/print', positional, 'chapter', print); add('/print', print, 'chapter');
  for (const [path, prefix, oldPrefix] of [[processNetworkRoute, web, web], ['/print', print, positional]]) {
    add(path, `${oldPrefix}-notes`, 'note-group', `${prefix}-annotations`); add(path, `${prefix}-annotations`, 'note-group');
    for (const heading of accepted.sourceHeadings) {
      const native = `${path === '/print' ? `${prefix}-` : ''}${heading.id}`;
      add(path, `${path === '/print' ? `${oldPrefix}-` : ''}${heading.id}`, 'heading', native);
      if (path === '/print') add(path, native, 'heading');
    }
    source.claimIds.forEach((claimId, index) => {
      const id = `${prefix}-claim-${claimId}`;
      add(path, `${oldPrefix}-note-${index + 1}`, 'note', id, claimId); add(path, id, 'note', id, claimId);
    });
  }
  // Independently demand every original family even if current sources/output omit it.
  for (const address of expected.keys()) if (entries.filter(entry => `${entry.path}#${entry.id}` === address).length !== 1) throw new Error(`Missing or repeated historical B07 source address: ${address}`);
  return entries.map(entry => {
    if (entry.route !== processNetworkRoute && !expected.has(`${entry.path}#${entry.id}`)) return entry;
    const wanted = expected.get(`${entry.path}#${entry.id}`), first = entry.targets[0], path = entry.path;
    if (!wanted || entry.route !== processNetworkRoute || entry.targets.length !== 1 || first.route !== processNetworkRoute || first.path !== path || first.kind !== wanted.kind || first.id !== wanted.targetId || first.claimId !== wanted.claimId)
      throw new Error(`Changed historical B07 source meaning: ${entry.path}#${entry.id}`);
    const prefix = path === '/print' ? print : web;
    const target = (kind, id, claimId = undefined) => ({ route: processNetworkRoute, path, id, kind, ...(claimId ? { claimId } : {}) });
    if (wanted.kind === 'note') return entry;
    if (wanted.kind === 'heading') {
      const heading = accepted.sourceHeadings.find(heading => wanted.targetId === `${path === '/print' ? `${print}-` : ''}${heading.id}`);
      if (!heading) throw new Error(`Unmapped historical B07 heading: ${entry.id}`);
      return { ...entry, targets: [target('heading', `${path === '/print' ? `${print}-` : ''}${heading.target}`)], mode: 'alias' };
    }
    const noteTargets = source.claimIds.map(id => target('note', `${prefix}-claim-${id}`, id));
    const isGroup = wanted.kind === 'note-group';
    const targets = isGroup ? noteTargets : [...titles.map(title => target('heading', `${path === '/print' ? `${print}-` : ''}${title}`)), ...noteTargets];
    const text = isGroup
      ? `原《${source.title}》的八则注释列于下方；这些链接对应原文的注释，《过程网络》现还包含其他注释。`
      : `原《${source.title}》的论述现按数量坐标、需求平衡与反馈边界编排。下列链接标明所在各节及原文的八则注释；《过程网络》还包含新增论述与注释。`;
    const nativeId = isGroup ? `${prefix}-annotations` : prefix;
    if (entry.id === nativeId) return { ...entry, targets: [target(wanted.kind, nativeId)], mode: 'retained', scope: { text, targets } };
    return { ...entry, targets, mode: 'notice', scope: { text, targets } };
  });
}

function paragraphText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  return node.nodeType === 1 ? node.childNodes.map(child => paragraphText(child, marker)).join('') : '';
}

/** Actual paragraph text and section membership are checked independently of IDs and note deduplication. */
export function validateRenderedProcessNetwork(document, path, accepted, catalog, prose = null) {
  assertProcessNetworkAccepted(accepted);
  if (![processNetworkRoute, '/print'].includes(path)) return [];
  if (prose) assertProcessNetworkProseAccepted(prose);
  const print = path === '/print', prefix = print ? `${printUnitAnchor(processNetworkRoute)}-` : '';
  const units = print ? document.querySelectorAll(`article[data-reader-route="${processNetworkRoute}"]`) : document.querySelectorAll('article');
  if (units.length !== 1) return [`${path}: missing or repeated actual B07 reading unit`];
  const unit = units[0], errors = [], title = print ? unit.getAttribute('data-reader-title') : unit.querySelector('h1')?.text;
  if (!Array.isArray(catalog?.claims)) return [`${path}: actual B07 body validation requires the canonical catalog`];
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  if (title !== currentBookLayout('B07:title', accepted.title)) errors.push(`${path}: wrong actual B07 title`);
  const currentHeadings = currentBookLayout('B07:headings', titles.map(title => ({ id: title, title })));
  const headings = [], actual = []; let section = null;
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) continue;
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference'), paragraph = node.closest('p'), claim = claims.get(id);
      actual.push({ id, section });
      if (!paragraph || !claim || typeof claim.text !== 'string' || paragraphText(paragraph, node) !== claim.text) errors.push(`${path}: B07 actual paragraph differs from canonical text: ${id}`);
      if (prose && !currentBookRecordMatches('claims', prose.claims.find(fixed => fixed.id === id), claim)) errors.push(`${path}: actual canonical record differs from independently reviewed B07 draft: ${id}`);
    } else if (node.closest('.chapter-notes')) section = null;
    else if (currentHeadings.some(heading => heading.id === node.id.slice(prefix.length))) {
      section = node.id.slice(prefix.length); headings.push({ id: section, title: node.text.replace(/复制章节链接$/, '') });
      if (node.tagName !== (print ? 'H3' : 'H2') || node.text.replace(/复制章节链接$/, '') !== currentHeadings.find(heading => heading.id === section)?.title) errors.push(`${path}: wrong actual B07 formal heading`);
    } else if (node.tagName !== (print ? 'H2' : 'H1')) errors.push(`${path}: unexpected actual B07 body heading`);
  }
  if (!same(headings, currentHeadings)) errors.push(`${path}: missing, duplicated or reordered actual B07 formal sections`);
  if (!same(actual, currentBookLayout('B07:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })))))) errors.push(`${path}: actual B07 propositions missing, duplicated, reordered, replaced or misplaced`);
  const groups = unit.querySelectorAll('.chapter-notes');
  if (groups.length !== 1 || groups[0].querySelector('h2,h3')?.id !== `${print ? printUnitAnchor(processNetworkRoute) : chapterAnchorPrefix(processNetworkRoute)}-annotations`) errors.push(`${path}: missing or repeated actual B07 annotation group`);
  const notes = unit.querySelectorAll('[data-reader-claim]').map(node => node.getAttribute('data-reader-claim'));
  if (!same(notes, currentBookLayout('B07:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })))).map(row => row.id))) errors.push(`${path}: actual B07 endnotes differ from the ten-claim continuous plan`);
  return errors;
}
