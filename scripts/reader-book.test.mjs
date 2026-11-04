import test from 'node:test';
import assert from 'node:assert/strict';
import { bookChapters, chapterAnchorPrefix, collectChapterClaimIds, createChapterNotePlan, orderPages } from './reader-book.mjs';

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
