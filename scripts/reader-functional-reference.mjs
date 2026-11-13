import { frameworkBookHref } from './reader-edition.mjs';
import { currentBookLayout, currentBookMdxMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { createHash } from 'node:crypto';
import { readSourceHeading, chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from './reader-book.mjs';

export const functionalReferenceRoute = '/docs/book/service-and-reference';
export const functionalReferenceSupplement = '/docs/functional-unit';
const titles = ['服务要求', '参考对象', '比较条件'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const orderedRecord = value => Array.isArray(value) ? value.map(orderedRecord) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, orderedRecord(value[key])])) : value;
const sameRecord = (a, b) => same(orderedRecord(a), orderedRecord(b));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const mdxDigest = raw => createHash('sha256').update(raw.replaceAll('\r\n', '\n')).digest('hex');
export function assertFunctionalReferenceAccepted(accepted) {
  if (digest(accepted) !== '61b6fb4a7983965d89f3853c257706671134732ace0708939f9b25499a9fdba6') throw new Error('Accepted B06 source and occurrence inventory differs from clean 87f6a52');
}
export function assertFunctionalReferenceHeadingHistory(history) {
  if (digest(history) !== 'ec7f12cbaaa61d41e85ded3c86503ab085857e229e7f32b314e0ba4613ab0d1a') throw new Error('Published B06 eight-heading history differs from actual clean 87f6a52 capture');
}
export function assertFunctionalReferenceRegistration(edition) {
  const unit = edition.units.find(unit => unit.key === functionalReferenceRoute);
  if (!unit || unit.source !== functionalReferenceRoute || unit.kind !== 'chapter' || unit.part !== currentBookLayout('book:part-title:2', '可比世界')
    || !same(unit.coverage, [functionalReferenceSupplement]) || !same(unit.sections, currentBookLayout('B06:headings', titles.map(title => ({ id: title, title }))))
    || edition.units.some(unit => unit.key === functionalReferenceSupplement)) throw new Error('Missing or changed shared B06 chapter/exact two-source consumption');
}

/** Independently pin the actual v3 draft accepted after source and reader checks. */
export function assertFunctionalReferenceProseAccepted(prose) {
  if (!prose || prose.status !== 'reviewed' || !Array.isArray(prose.claims) || prose.claims.length !== 17 || !Array.isArray(prose.sources) || prose.sources.length !== 2 || !Array.isArray(prose.navigation) || prose.navigation.length !== 2)
    throw new Error('B06 requires its independently reviewed canonical prose acceptance');
  // Do not regenerate this receipt from altered current prose to bypass review.
  if (digest(prose) !== '71f77ed9361fe0dda30a409baa8756898801f9ad8281d875ec2e9a8d14bb7df5') throw new Error('B06 canonical prose receipt differs from the independently reviewed v3 draft');
}

/**
 * @param {import('../lib/catalog').Catalog | null} catalog
 * @param {{status: string, claims: object[], sources: {route: string, mdxSha256: string}[], navigation: object[]} | null} prose
 */
export function validateFunctionalReferenceCoverage(edition, sources, accepted, catalog = null, prose = null) {
  assertFunctionalReferenceAccepted(accepted); assertFunctionalReferenceRegistration(edition);
  const errors = [], raw = sources.get(functionalReferenceRoute), supplement = sources.get(functionalReferenceSupplement);
  if (raw === undefined || supplement === undefined) return ['Missing B06 primary or retained S03 website source'];
  const title = /^title:\s*(.+?)\s*$/m.exec(raw)?.[1]?.replace(/^(['"])(.*)\1$/, '$2');
  if (title !== currentBookLayout('B06:title', accepted.title)) errors.push('B06 source has the wrong adopted title');
  const split = raw.split(/^## (.+)\s*$/m), headings = [], actual = [];
  for (let i = 1; i < split.length; i += 2) {
    const heading = readSourceHeading(split[i]); headings.push(heading);
    const section = heading.id;
    actual.push(...collectChapterClaimOccurrences(split[i + 1]).map(id => ({ id, section })));
  }
  const expected = currentBookLayout('B06:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))));
  if (!same(headings, currentBookLayout('B06:headings', titles.map(title => ({ id: title, title }))))) errors.push('B06 source must have exactly three actual adopted formal sections');
  if (collectChapterClaimOccurrences(raw).length !== actual.length || !same(actual, expected)) errors.push('B06 propositions missing, duplicated, reordered, replaced or misplaced');
  const supplementIds = collectChapterClaimOccurrences(supplement), oldIds = accepted.sources[1].claimIds;
  if (!same(supplementIds, [...oldIds, ...accepted.additions]) || !same(supplementIds.filter(id => oldIds.includes(id)), oldIds) || supplementIds.some(id => !oldIds.includes(id) && !accepted.additions.includes(id))
    || new Set(supplementIds).size !== supplementIds.length) errors.push('S03 original website propositions missing, duplicated, reordered or replaced');
  for (const [route, text] of [[functionalReferenceRoute, raw], [functionalReferenceSupplement, supplement]]) {
    for (const id of ['cn-fu', 'cn-reference-flow']) if (!text.includes(`<ConceptRef id="${id}" />`)) errors.push(`${route}: missing retained concept link ${id}`);
    if (!text.includes('<SourceRef id="src-ilcd-process" />')) errors.push(`${route}: missing retained ILCD field source link`);
    if (!/\]\(\/docs\/book\/wall-service-to-comparison\/\)/.test(text)) errors.push(`${route}: missing retained wall service cross-reference`);
  }
  if (catalog) {
    for (const { id } of expected) if (catalog.claims.find(claim => claim.id === id)?.status !== 'reviewed') errors.push(`Unreviewed B06 proposition: ${id}`);
    assertFunctionalReferenceProseAccepted(prose);
    if (!same(prose.sources.map(source => source.route), accepted.sources.map(source => source.route))) errors.push('B06 accepted MDX sources differ from exact consumed pair');
    for (const source of prose.sources) if (!sources.has(source.route) || !currentBookMdxMatches(source.route, source.mdxSha256, mdxDigest(sources.get(source.route)))) errors.push(`B06 source differs from independently reviewed MDX: ${source.route}`);
    if (!same(prose.claims.map(claim => claim.id), accepted.sections.flatMap(section => section.claimIds))) errors.push('B06 accepted canonical prose has the wrong occurrence order');
    for (const fixed of prose.claims) {
      const claim = catalog.claims.find(claim => claim.id === fixed.id);
      if (!claim || !currentBookRecordMatches('claims', fixed, claim)) errors.push(`B06 canonical proposition differs from independently reviewed draft: ${fixed.id}`);
    }
  }
  return errors;
}

export function functionalReferenceHeadingEntries(history) {
  assertFunctionalReferenceHeadingHistory(history);
  return history.canonicalPrintedHeadings.map(heading => ({ route: heading.route, path: '/print', id: heading.id,
    targets: [{ route: heading.route, path: '/print', id: heading.id, kind: 'heading' }], mode: 'retained',
    edition: { sourceCommit: history.sourceCommit, sourceDate: history.sourceDate } }));
}

/** Preserve source-scoped notes/groups even though the current chapter is broader. */
export function remapFunctionalReferenceCitations(entries, accepted, history) {
  assertFunctionalReferenceAccepted(accepted); assertFunctionalReferenceHeadingHistory(history);
  // Demand every source address independently of mutable registration/output.
  // This prevents a missing old family from being mistaken for no migration.
  const expectedAddresses = [];
  for (const source of accepted.sources) {
    const web = chapterAnchorPrefix(source.route), print = printUnitAnchor(source.route), positional = `print-chapter-${source.printOrdinal}`;
    expectedAddresses.push(`/print#${positional}`, `/print#${print}`, `${source.route}#${web}-notes`, `${source.route}#${web}-annotations`, `/print#${positional}-notes`, `/print#${print}-annotations`);
    for (const heading of accepted.sourceHeadings.filter(heading => heading.route === source.route)) expectedAddresses.push(`${source.route}#${heading.id}`, `/print#${positional}-${heading.id}`, `/print#${print}-${heading.id}`);
    source.claimIds.forEach((id, index) => expectedAddresses.push(`${source.route}#${web}-note-${index + 1}`, `${source.route}#${web}-claim-${id}`, `/print#${positional}-note-${index + 1}`, `/print#${print}-claim-${id}`));
  }
  for (const address of expectedAddresses) if (entries.filter(entry => `${entry.path}#${entry.id}` === address).length !== 1) throw new Error(`Missing or repeated historical B06 source address: ${address}`);
  const sourceByRoute = new Map(accepted.sources.map(source => [source.route, source]));
  return entries.map(entry => {
    const source = sourceByRoute.get(entry.route);
    if (!source) return entry;
    const first = entry.targets[0], path = entry.path;
    const isNoteAddress = /-note-\d+$|-claim-[A-Za-z0-9._:-]+$/.test(entry.id);
    const expectedKind = isNoteAddress ? 'note' : /-(?:notes|annotations)$/.test(entry.id) ? 'note-group'
      : [printUnitAnchor(source.route), `print-chapter-${source.printOrdinal}`].includes(entry.id) ? 'chapter' : 'heading';
    if (entry.targets.length !== 1 || first.kind !== expectedKind || first.route !== source.route || first.path !== path) throw new Error(`Changed historical B06 source meaning: ${entry.id}`);
    const destinationRoute = path === functionalReferenceSupplement ? functionalReferenceSupplement : functionalReferenceRoute;
    const target = (path, kind, id, claimId) => ({ route: destinationRoute, path, id, kind, ...(claimId ? { claimId } : {}) });
    const prefix = path === '/print' ? printUnitAnchor(destinationRoute) : chapterAnchorPrefix(destinationRoute);
    if (first.kind === 'note') {
      const positional = /-note-(\d+)$/.exec(entry.id);
      const expectedClaim = positional ? source.claimIds[Number(positional[1]) - 1] : entry.id.split('-claim-')[1];
      if (first.claimId !== expectedClaim || !source.claimIds.includes(first.claimId) || entry.targets.length !== 1) throw new Error(`Changed historical B06 note identity: ${entry.id}`);
      const id = `${prefix}-claim-${first.claimId}`;
      return { ...entry, route: destinationRoute, targets: [target(path, 'note', id, first.claimId)], mode: id === entry.id ? 'retained' : 'alias' };
    }
    if (first.kind === 'heading') {
      const oldPrefix = path === '/print' ? `${printUnitAnchor(source.route)}-` : '';
      const heading = accepted.sourceHeadings.find(heading => heading.route === source.route && first.id === `${oldPrefix}${heading.id}`);
      if (!heading) throw new Error(`Unmapped historical B06 heading: ${entry.id}`);
      if (path === functionalReferenceSupplement) return entry;
      return { ...entry, route: destinationRoute, targets: [target(path, 'heading', `${path === '/print' ? `${prefix}-` : ''}${heading.target}`)], mode: 'alias' };
    }
    const noteTargets = source.claimIds.map(id => target(path, 'note', `${prefix}-claim-${id}`, id));
    const isGroup = first.kind === 'note-group';
    if (!isGroup && first.kind !== 'chapter') throw new Error(`Unknown historical B06 scope: ${entry.id}`);
    const targets = isGroup ? noteTargets : [...titles.map(section => target(path, 'heading', `${prefix}-${section}`)), ...noteTargets];
    const text = isGroup
      ? path === functionalReferenceSupplement
        ? `此留存版本《${source.title}》原有的${source.claimIds.length}则注释列于下方；本文现还包含其他注释。`
        : `原《${source.title}》的${source.claimIds.length}则注释已编入《功能参照》。下列链接对应原文的注释；本章还包含其他注释。`
      : `原《${source.title}》的论述现编入《功能参照》的服务要求、参考对象与比较条件。下列链接标明所在各节及原文的注释；原文的解释还包括不带注号的正文。`;
    const nativeId = isGroup ? `${prefix}-annotations` : prefix;
    // Retained native article/group IDs cannot also identify a separate notice.
    // Their source subset context renders inside the actual target instead.
    if (entry.id === nativeId) return { ...entry, route: destinationRoute, targets: [target(path, first.kind, nativeId)], mode: 'retained', scope: { text, targets } };
    return { ...entry, route: destinationRoute, targets, mode: 'notice', scope: { text, targets } };
  });
}

function bodyText(node, marker) {
  if (node === marker) return '';
  if (node.nodeType === 3) return node.text;
  return node.nodeType === 1 ? node.childNodes.map(child => bodyText(child, marker)).join('') : '';
}
export function validateRenderedFunctionalReference(document, path, accepted, catalog, prose = null) {
  assertFunctionalReferenceAccepted(accepted);
  if (![functionalReferenceRoute, functionalReferenceSupplement, '/print'].includes(path)) return [];
  const print = path === '/print', route = path === functionalReferenceSupplement ? path : functionalReferenceRoute;
  const units = print ? document.querySelectorAll(`article[data-reader-route="${route}"]`) : document.querySelectorAll('article');
  if (units.length !== 1) return [`${path}: missing or repeated actual B06/S03 unit`];
  const unit = units[0], errors = [], prefix = print ? `${printUnitAnchor(route)}-` : '';
  if (print && document.querySelector(`article[data-reader-route="${functionalReferenceSupplement}"]`)) errors.push('/print: S03 must be consumed inside B06, not printed separately');
  if (!catalog?.claims) return [`${path}: B06 actual paragraph check requires canonical catalog`];
  if (prose) assertFunctionalReferenceProseAccepted(prose);
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  const reviewedClaims = prose ? new Map(prose.claims.map(claim => [claim.id, claim])) : null;
  let section = null;
  const currentHeadings = currentBookLayout('B06:headings', titles.map(title => ({ id: title, title })));
  const actual = [], headings = [];
  for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
    if (node.closest('[data-legacy-for],[data-legacy-notice],[data-legacy-scope]')) continue;
    if (node.getAttribute('role') === 'doc-noteref') {
      const id = node.getAttribute('data-reader-reference'), paragraph = node.closest('p');
      actual.push({ id, section });
      if (reviewedClaims && !currentBookRecordMatches('claims', reviewedClaims.get(id), claims.get(id))) errors.push(`${path}: actual canonical record differs from independently reviewed B06 draft: ${id}`);
      if (!paragraph || !claims.get(id) || bodyText(paragraph, node) !== claims.get(id).text) errors.push(`${path}: B06/S03 actual paragraph differs from canonical text: ${id}`);
    } else if (route === functionalReferenceRoute) {
      if (node.closest('.chapter-notes')) { section = null; continue; }
      if (currentHeadings.some(heading => heading.id === node.id.slice(prefix.length))) {
        section = node.id.slice(prefix.length); headings.push({ id: section, title: node.text.replace(/复制章节链接$/, '') });
        if (node.tagName !== (print ? 'H3' : 'H2') || node.text.replace(/复制章节链接$/, '') !== currentHeadings.find(heading => heading.id === section)?.title) errors.push(`${path}: wrong actual B06 formal heading`);
      } else if (node.tagName !== (print ? 'H2' : 'H1')) errors.push(`${path}: unexpected actual B06 body heading`);
    }
  }
  if (route === functionalReferenceRoute) {
    const title = print ? unit.getAttribute('data-reader-title') : unit.querySelector('h1')?.text;
    if (title !== currentBookLayout('B06:title', accepted.title) || !same(headings, currentHeadings)) errors.push(`${path}: wrong actual B06 title or formal sections`);
    if (!same(actual, currentBookLayout('B06:occurrences', accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id })))))) errors.push(`${path}: actual B06 body claims missing, duplicated, reordered or misplaced`);
  } else {
    const ids = actual.map(item => item.id), expected = accepted.sources[1].claimIds;
    const sourceHeadings = accepted.sourceHeadings.filter(heading => heading.route === route);
    const nativeHeadings = unit.querySelectorAll('h2').filter(node => !node.closest('.chapter-notes,[data-legacy-for],[data-legacy-notice]'));
    if (!same(nativeHeadings.map(node => ({ id: node.id, title: node.text.replace(/复制章节链接$/, '') })), currentBookLayout('S03:web-headings', sourceHeadings.map(heading => ({ id: heading.id, title: heading.title }))))) errors.push(`${path}: actual S03 fine website headings changed`);
    if (!same(ids, [...expected, ...accepted.additions]) || !same(ids.filter(id => expected.includes(id)), expected) || new Set(ids).size !== ids.length || ids.some(id => !expected.includes(id) && !accepted.additions.includes(id))) errors.push(`${path}: actual S03 original body claims missing, duplicated or replaced`);
  }
  if (prose) {
    for (const navigation of currentBookLayout(`B06:${route}:navigation`, prose.navigation.filter(navigation => navigation.route === route))) {
      const nodes = unit.querySelectorAll('p,a[role="doc-noteref"]');
      const paragraphs = nodes.filter(node => node.tagName === 'P' && !node.closest('.chapter-notes,[data-legacy-notice],[data-legacy-for],[data-legacy-scope]') && !node.querySelector('[role="doc-noteref"]')
        && node.text === navigation.text && node.querySelectorAll('a').length === 1 && node.querySelector('a')?.getAttribute('href') === (print ? frameworkBookHref(navigation.href, route) : navigation.href) && node.querySelector('a')?.text === navigation.linkText);
      const paragraph = paragraphs[0], index = nodes.indexOf(paragraph);
      const before = nodes.slice(0,index).filter(node => node.getAttribute('role') === 'doc-noteref').at(-1)?.getAttribute('data-reader-reference');
      const after = nodes.slice(index + 1).find(node => node.getAttribute('role') === 'doc-noteref')?.getAttribute('data-reader-reference');
      if (paragraphs.length !== 1 || before !== navigation.afterClaim || after !== navigation.beforeClaim) errors.push(`${path}: authored wall navigation text, link or placement differs from reviewed draft`);
    }
  }
  const authoredLinks = unit.querySelectorAll('a[href]').filter(node => !node.closest('.chapter-notes,[data-legacy-notice],[data-legacy-for],[data-legacy-scope]'));
  for (const href of ['/sources/#src-ilcd-process', '/concepts/#cn-fu', '/concepts/#cn-reference-flow', '/docs/book/wall-service-to-comparison/']) if (!authoredLinks.some(node => node.getAttribute('href') === (print ? frameworkBookHref(href, route) : href))) errors.push(`${path}: missing actual authored source/concept/wall link ${href}`);
  return errors;
}
