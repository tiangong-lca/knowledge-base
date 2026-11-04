import test from 'node:test';
import assert from 'node:assert/strict';
import { bookChapters, chapterAnchorPrefix, collectChapterClaimIds, createChapterAnnotationPlan, createChapterNotePlan, createChapterReferenceIndex, orderPages } from './reader-book.mjs';

test('chapter notes continue across separate Prose and Claim blocks rather than resetting each block', () => {
  const raw = '<Prose ids="first second" />\n## Next section\n<Claim id="third" />\n<Prose ids="fourth fifth" />';
  const plan = createChapterNotePlan(raw, 'reader-chapter');
  assert.deepEqual(plan.notes.map(note => [note.id, note.number, note.anchor]), [
    ['first', 1, 'reader-chapter-note-1'], ['second', 2, 'reader-chapter-note-2'], ['third', 3, 'reader-chapter-note-3'],
    ['fourth', 4, 'reader-chapter-note-4'], ['fifth', 5, 'reader-chapter-note-5'],
  ]);
  assert.equal(plan.byClaimId.get('third').number, 3);
  assert.equal(plan.headingId, 'reader-chapter-notes');
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
    { url: '/docs/early', title: 'Earlier chapter', raw: '<Prose ids="first repeated" />', printAnchorPrefix: 'print-chapter-1' },
    { url: '/docs/later', title: 'Later chapter', raw: '<Prose ids="later repeated" />', printAnchorPrefix: 'print-chapter-2' },
    { url: '/docs/unprinted', title: 'Online explanation', raw: '<Claim id="online" />' },
  ]);
  const claims = [{ id: 'first', premiseIds: ['repeated', 'later', 'online', 'unplaced'], scope: 'Keep this condition', caveats: ['Keep this limit'] }, { id: 'repeated', premiseIds: [] }];
  const before = structuredClone(claims);
  const printed = createChapterAnnotationPlan(createChapterNotePlan('<Prose ids="first repeated" />', 'print-chapter-1'), claims, index, { print: true }).get('first');
  assert.deepEqual(printed.premiseReferences.get('repeated'), { href: '#print-chapter-1-note-2', label: '本章注 2' });
  assert.deepEqual(printed.premiseReferences.get('later'), { href: '#print-chapter-2-note-1', label: '《Later chapter》注 1' });
  assert.equal(printed.premiseReferences.get('online').href, `/docs/unprinted#${chapterAnchorPrefix('/docs/unprinted')}-note-1`);
  assert.equal(printed.premiseReferences.has('unplaced'), false); // retain the canonical fallback rather than invent a chapter
  const online = createChapterAnnotationPlan(createChapterNotePlan('<Prose ids="first repeated" />', 'current'), claims, index).get('first');
  assert.equal(online.premiseReferences.get('later').href, `/docs#${chapterAnchorPrefix('/docs')}-note-1`);
  assert.deepEqual(claims, before); // presentation never removes source/scope/caveat records
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
