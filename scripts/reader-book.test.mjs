import test from 'node:test';
import assert from 'node:assert/strict';
import { bookChapters, chapterAnchorPrefix, chapterNoteAnchor, collectChapterClaimIds, createChapterAnnotationPlan, createChapterNotePlan, createChapterReferenceIndex, orderPages, printUnitAnchor } from './reader-book.mjs';
import { citationHref, createCurrentPrintRoutes, createLegacyCitationEntries } from './reader-citations.mjs';

test('chapter notes continue across separate Prose and Claim blocks rather than resetting each block', () => {
  const raw = '<Prose ids="first second" />\n## Next section\n<Claim id="third" />\n<Prose ids="fourth fifth" />';
  const plan = createChapterNotePlan(raw, 'reader-chapter');
  assert.deepEqual(plan.notes.map(note => [note.id, note.number, note.anchor]), [
    ['first', 1, 'reader-chapter-claim-first'], ['second', 2, 'reader-chapter-claim-second'], ['third', 3, 'reader-chapter-claim-third'],
    ['fourth', 4, 'reader-chapter-claim-fourth'], ['fifth', 5, 'reader-chapter-claim-fifth'],
  ]);
  assert.equal(plan.byClaimId.get('third').number, 3);
  assert.equal(plan.headingId, 'reader-chapter-annotations');
});

test('inserting and reordering paragraphs changes visible numbers without reassigning claim anchors', () => {
  const before = createChapterNotePlan('<Prose ids="first second" />', 'reader');
  const after = createChapterNotePlan('<Prose ids="second new first" />', 'reader');
  assert.equal(before.byClaimId.get('first').anchor, after.byClaimId.get('first').anchor);
  assert.equal(before.byClaimId.get('second').anchor, after.byClaimId.get('second').anchor);
  assert.deepEqual(after.notes.map(({ id, number }) => [id, number]), [['second', 1], ['new', 2], ['first', 3]]);
});

test('repeated claims share one unique note and never produce duplicate note IDs', () => {
  const plan = createChapterNotePlan('<Prose ids="first second" />\n<Claim id="first" />\n<Prose ids="second third" />', 'print-a');
  assert.deepEqual(plan.notes.map(note => note.id), ['first', 'second', 'third']);
  assert.equal(plan.byClaimId.get('first').number, 1);
  assert.equal(new Set(plan.notes.map(note => note.anchor)).size, 3);
  // One note is retained even for a claim without evidence: references identify
  // paragraphs; source counts do not control the sequence or marker multiplicity.
  assert.equal(createChapterNotePlan('<Prose ids="hypothesis" />', 'a').notes.length, 1);
});

test('code fences and inline-code examples cannot add phantom notes', () => {
  const raw = [
    '```mdx', '<Claim id="fenced" />', '```',
    '````mdx', '```', '<Prose ids="inside-long-fence" />', '```', '````',
    '~~~mdx', '<Claim id="tilde-fenced" />', '~~~',
    '> ```mdx', '> <Claim id="quoted-fence" />', '> ```',
    '`<Claim id="inline" />` and ``<Prose ids="inline-two" />``.',
    '<Prose ids="real first" />',
    '```mdx', '<Claim id="unclosed-fence" />',
  ].join('\n');
  assert.deepEqual(collectChapterClaimIds(raw), ['real', 'first']);
});

test('frontmatter, comments and escaped examples are metadata/text, not live paragraph components', () => {
  const raw = [
    '---', 'title: \'<Claim id="metadata" />\'', '---',
    '<!-- <Claim id="html-comment" /> -->',
    '{/* <Prose ids="jsx-comment" /> */}',
    '\\<Claim id="escaped" />',
    '<Prose\n ids = \'actual other\'\n />', '<Claim id="last"/>',
  ].join('\n');
  assert.deepEqual(collectChapterClaimIds(raw), ['actual', 'other', 'last']);
  assert.deepEqual(collectChapterClaimIds('No annotated paragraphs.\n<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />'), []);
});

test('dynamic, duplicate or malformed attributes fail rather than silently losing a note mapping', () => {
  for (const raw of ['<Prose ids={dynamic} />', '<Claim id={dynamic} />', '<Claim id="a" id="b" />', '<Prose ids="a" {...props} />', '<Prose ids="" />', '<Claim id="a"', '<Prose ids="bad/id" />']) {
    assert.throws(() => collectChapterClaimIds(raw), TypeError, raw);
  }
  assert.throws(() => collectChapterClaimIds(null), /raw MDX/);
});

test('default route prefixes and explicit print prefixes keep chapter notes distinct', () => {
  const raw = '<Prose ids="same-claim" />';
  const a = createChapterNotePlan(raw, chapterAnchorPrefix('/docs/book/a-b/c'));
  const b = createChapterNotePlan(raw, chapterAnchorPrefix('/docs/book/a/b-c'));
  const printed = createChapterNotePlan(raw, 'print-book-a-b-c');
  assert.notEqual(a.notes[0].anchor, b.notes[0].anchor);
  assert.notEqual(a.notes[0].anchor, printed.notes[0].anchor);
  assert.throws(() => createChapterNotePlan(raw, 'unsafe prefix/with spaces'), /safe, unique/);
});

test('book order follows folder indexes and children, deduplicates URL aliases, and excludes external/unlisted pages', () => {
  const pages = [
    { url: '/docs/book/z', slugs: ['book', 'z'] },
    { url: '/docs/book', slugs: ['book'] },
    { url: '/docs/book/nested/a', slugs: ['book', 'nested', 'a'] },
    { url: '/docs/old', slugs: ['old'] },
    { url: '/docs/book/nested', slugs: ['book', 'nested'] },
    { url: '/docs', slugs: [] },
    { url: '/docs/unlisted', slugs: ['unlisted'] },
    { url: '/docs/external', slugs: ['external'] },
  ];
  const page = (url, extra = {}) => ({ type: 'page', url, ...extra });
  const tree = { children: [page('/docs'), { type: 'folder', index: page('/docs/book/'), children: [
    page('/docs/book/z'), { type: 'folder', index: page('/docs/book/nested'), children: [page('/docs/book/nested/a')] },
    page('/docs/book/z/#anchor'), { type: 'separator' }, page('https://example.org/'), page('/docs/external', { external: true }),
  ] }, page('/docs/old'), page('/docs/not-in-source')] };
  const ordered = orderPages(tree, pages);
  assert.deepEqual(ordered.map(item => item.url), ['/docs', '/docs/book', '/docs/book/z', '/docs/book/nested', '/docs/book/nested/a', '/docs/old']);
  assert.deepEqual(bookChapters(ordered).map(item => item.url), ['/docs/book/z', '/docs/book/nested', '/docs/book/nested/a']);
  assert.equal(ordered[2], pages[0]);
  assert.equal(pages.length, 8);
});

test('premise references use chapter-local notes and the same unique print destinations as the book', () => {
  const index = createChapterReferenceIndex([
    { url: '/docs', title: 'Unprinted introduction', raw: '<Claim id="later" />' },
    { url: '/docs/early', title: 'Earlier chapter', raw: '<Prose ids="first repeated" />', printAnchorPrefix: 'print-unit-early', printOrder: 1 },
    { url: '/docs/topic', title: 'Printed topic', raw: '<Claim id="later" />', printAnchorPrefix: 'print-unit-topic', printOrder: 3 },
    { url: '/docs/later', title: 'Later chapter', raw: '<Prose ids="later repeated" />', printAnchorPrefix: 'print-unit-later', printOrder: 2 },
    { url: '/docs/unprinted', title: 'Online explanation', raw: '<Claim id="online" />' },
  ]);
  const claims = [{ id: 'first', premiseIds: ['repeated', 'later', 'online', 'unplaced'], scope: 'Keep this condition', caveats: ['Keep this limit'] }, { id: 'repeated', premiseIds: [] }];
  const before = structuredClone(claims);
  const printed = createChapterAnnotationPlan(createChapterNotePlan('<Prose ids="first repeated" />', 'print-unit-early'), claims, index, { print: true }).get('first');
  assert.deepEqual(printed.premiseReferences.get('repeated'), { href: '#print-unit-early-claim-repeated', label: '本章注 2' });
  assert.deepEqual(printed.premiseReferences.get('later'), { href: '#print-unit-later-claim-later', label: '《Later chapter》注 1' });
  assert.equal(printed.premiseReferences.get('online').href, `/docs/unprinted/#${chapterAnchorPrefix('/docs/unprinted')}-claim-online`);
  assert.equal(printed.premiseReferences.has('unplaced'), false); // retain the canonical fallback rather than invent a chapter
  const online = createChapterAnnotationPlan(createChapterNotePlan('<Prose ids="first repeated" />', 'current'), claims, index).get('first');
  assert.equal(online.premiseReferences.get('later').href, `/docs/#${chapterAnchorPrefix('/docs')}-claim-later`);
  assert.deepEqual(claims, before); // presentation never removes source/scope/caveat records
});

test('legacy web and print ordinals resolve by baseline claim and exact occurrence after relocation', () => {
  const a = '/docs/book/a', b = '/docs/book/b', shared = '/docs/related';
  const baseline = { pages: [
    { route: a, noteClaims: ['stay', 'moved'], headingIds: ['一节'], printOrdinal: 1 },
    { route: b, noteClaims: [], headingIds: [], printOrdinal: 2 },
    { route: shared, noteClaims: ['moved'], headingIds: [] },
  ] };
  const placements = { frontMatter: [], notes: [{ from: a, claimId: 'moved', to: b }] };
  const entries = createLegacyCitationEntries(baseline, placements);
  const entry = (path, id) => entries.find(record => record.path === path && record.id === id);
  const oldA = chapterAnchorPrefix(a);
  assert.equal(entry(a, `${oldA}-note-1`).targets[0].id, `${oldA}-claim-stay`);
  const moved = entry(a, `${oldA}-note-2`);
  assert.equal(moved.mode, 'notice');
  assert.equal(citationHref(moved.targets[0], a), `${b}/#${chapterNoteAnchor(chapterAnchorPrefix(b), 'moved')}`);
  assert.equal(entry(shared, `${chapterAnchorPrefix(shared)}-note-1`).targets[0].route, shared);
  const printMoved = entry('/print', 'print-chapter-1-note-2');
  assert.equal(printMoved.mode, 'alias');
  assert.equal(printMoved.targets[0].id, chapterNoteAnchor(printUnitAnchor(b), 'moved'));
  assert.equal(entry('/print', 'print-chapter-1').targets[0].id, printUnitAnchor(a));
  assert.equal(entry('/print', 'print-chapter-1-一节').targets[0].id, `${printUnitAnchor(a)}-一节`);
  assert.throws(() => createLegacyCitationEntries(baseline, { ...placements, notes: [...placements.notes, ...placements.notes] }), /Duplicate legacy/);
  assert.throws(() => createLegacyCitationEntries(baseline, { ...placements, notes: [{ from: a, claimId: 'missing', to: b }] }), /unknown earlier address/);
});

test('input links deduplicate within one chapter only for the exact case/version/hash/file identity', () => {
  const binding = { caseId: 'case-one', version: '1', inputSha256: 'a'.repeat(64), inputFile: 'input-v1.json' };
  const claims = [
    { id: 'first', caseBinding: binding }, { id: 'repeat', caseBinding: { ...binding } },
    { id: 'version', caseBinding: { ...binding, version: '2' } },
    { id: 'hash', caseBinding: { ...binding, inputSha256: 'b'.repeat(64) } },
    { id: 'file', caseBinding: { ...binding, inputFile: 'other.json' } },
    { id: 'case', caseBinding: { ...binding, caseId: 'case-two' } },
  ];
  const plan = createChapterNotePlan('<Prose ids="first repeat version hash file case" />', 'a');
  const output = createChapterAnnotationPlan(plan, claims, new Map());
  assert.deepEqual([...output.values()].map(value => value.showCaseInput), [true, false, true, true, true, true]);
  const second = createChapterAnnotationPlan(createChapterNotePlan('<Claim id="repeat" />', 'b'), claims, new Map());
  assert.equal(second.get('repeat').showCaseInput, true);
  assert.throws(() => createChapterAnnotationPlan(plan, [], new Map()), /Unknown chapter claim/);
});


test('a new appendix has an explicit current print place and receives moved web and print notes', () => {
  const a = '/docs/book/a', appendix = '/docs/appendices/energy-check';
  const baseline = { pages: [{ route: a, noteClaims: ['moved'], headingIds: [], printOrdinal: 1 }] };
  const placements = { frontMatter: [], notes: [{ from: a, claimId: 'moved', to: appendix }],
    printAdditions: [{ route: appendix, kind: 'appendix' }] };
  assert.deepEqual(createCurrentPrintRoutes(baseline, placements, [a, appendix]), [a, appendix]);
  const entries = createLegacyCitationEntries(baseline, placements);
  const web = entries.find(entry => entry.path === a && entry.id.endsWith('-note-1'));
  const print = entries.find(entry => entry.path === '/print' && entry.id === 'print-chapter-1-note-1');
  assert.equal(web.mode, 'notice');
  assert.deepEqual(web.targets[0], { route: appendix, path: appendix,
    id: chapterNoteAnchor(chapterAnchorPrefix(appendix), 'moved'), kind: 'note', claimId: 'moved' });
  assert.equal(print.mode, 'alias');
  assert.equal(print.targets[0].path, '/print');
  assert.equal(print.targets[0].id, chapterNoteAnchor(printUnitAnchor(appendix), 'moved'));
  assert.throws(() => createCurrentPrintRoutes(baseline, placements, [a]), /Missing printed unit/);
  assert.throws(() => createCurrentPrintRoutes(baseline, { ...placements, printAdditions: [] }, [a, appendix]), /no current print registration/);
  assert.throws(() => createCurrentPrintRoutes(baseline, { ...placements, printAdditions: [...placements.printAdditions, ...placements.printAdditions] }, [a, appendix]), /Invalid or repeated/);
  assert.throws(() => createLegacyCitationEntries(baseline, { ...placements, printAdditions: [] }), /Unknown citation target route/);
});
