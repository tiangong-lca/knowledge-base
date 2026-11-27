import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  compareMdxStructures,
  compareMetaOrder,
  compareReaderGuides,
  extractMdxStructure,
  readParityExceptions,
  validateBilingualStructuralParity,
} from './reader-bilingual-parity.mjs';

const zhPage = `---\ntitle: 示例\ndescription: 说明\n---\n\n## 第一节\n\n<Prose ids="cl-a cl-b" />\n\n| 列 | 值 |\n| --- | --- |\n| a | 1 |\n\n## 第二节\n\n<Claim id="cl-c" />\n`;
const enPage = `---\ntitle: Example\ndescription: Summary\n---\n\n## First Section\n\nA differently worded lead-in is allowed.\n\n<Prose ids="cl-a cl-b" />\n\n| Column | Value |\n| --- | --- |\n| a | 1 |\n\n## Second Section\n\n<Claim id="cl-c" />\n`;

test('structure ignores wording and keeps claim order, sections and tables', () => {
  const zh = extractMdxStructure(zhPage);
  const en = extractMdxStructure(enPage);
  assert.deepEqual(zh.claimIds, ['cl-a', 'cl-b', 'cl-c']);
  assert.equal(zh.h2, 2);
  assert.equal(zh.tables, 1);
  assert.deepEqual(compareMdxStructures('p.mdx', zh, en), []);
});

test('reordered or missing claims, sections and tables are reported', () => {
  const zh = extractMdxStructure(zhPage);
  const reordered = extractMdxStructure(enPage.replace('cl-a cl-b', 'cl-b cl-a'));
  assert.equal(compareMdxStructures('p.mdx', zh, reordered)[0].check, 'claimOrder');
  const fewer = extractMdxStructure(enPage.replace('## Second Section\n\n', ''));
  assert.ok(compareMdxStructures('p.mdx', zh, fewer).some(d => d.check === 'h2'));
  const noTable = extractMdxStructure(enPage.replace('| --- | --- |\n', ''));
  assert.ok(compareMdxStructures('p.mdx', zh, noTable).some(d => d.check === 'tables'));
});

test('meta order ignores separators but not page sequence', () => {
  assert.deepEqual(compareMetaOrder('meta.json', { pages: ['a', 'b'] }, { pages: ['a', '---Topics---', 'b'] }), []);
  assert.equal(compareMetaOrder('meta.json', { pages: ['a', 'b'] }, { pages: ['b', 'a'] }).length, 1);
});

test('reader guides compare identities and targets, not wording', () => {
  const zh = { partQuestions: { 1: '问' }, readingModes: [{ id: 'm' }], problemRoutes: [{ id: 'p', targets: [{ route: '/x' }] }] };
  const en = { partQuestions: { 1: 'Question' }, readingModes: [{ id: 'm' }], problemRoutes: [{ id: 'p', targets: [{ route: '/x' }] }] };
  assert.deepEqual(compareReaderGuides(zh, en), []);
  const drift = { ...en, problemRoutes: [{ id: 'p', targets: [{ route: '/y' }] }] };
  assert.equal(compareReaderGuides(zh, drift)[0].check, 'problemTargets');
  assert.equal(compareReaderGuides(zh, { ...en, partQuestions: { 1: ' ' } })[0].check, 'partQuestions');
});

test('exceptions need rationale, and unused exceptions fail', () => {
  assert.ok(readParityExceptions({ schemaVersion: 1, exceptions: [{ path: 'a', check: 'h2', rationale: 'short' }] }).errors.length > 0);
  const root = mkdtempSync(join(tmpdir(), 'parity-'));
  try {
    for (const dir of ['content/docs', 'content-en/docs']) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, 'content/docs/p.mdx'), zhPage);
    writeFileSync(join(root, 'content-en/docs/p.mdx'), enPage);
    const enClaims = { claims: ['cl-a', 'cl-b', 'cl-c'].map(id => ({ id, status: 'published' })) };
    const clean = validateBilingualStructuralParity(root, { enClaims, exceptions: null, zhGuide: null, enGuide: null });
    assert.deepEqual(clean.errors, []);
    const stale = validateBilingualStructuralParity(root, {
      enClaims,
      zhGuide: null,
      enGuide: null,
      exceptions: { schemaVersion: 1, exceptions: [{ path: 'p.mdx', check: 'h2', rationale: 'A justified difference that no longer exists.' }] },
    });
    assert.ok(stale.errors.some(e => e.includes('no longer matches')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('missing pages and unpublished English claims are reported', () => {
  const root = mkdtempSync(join(tmpdir(), 'parity-'));
  try {
    for (const dir of ['content/docs', 'content-en/docs']) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, 'content/docs/p.mdx'), zhPage);
    writeFileSync(join(root, 'content/docs/q.mdx'), zhPage);
    writeFileSync(join(root, 'content-en/docs/p.mdx'), enPage);
    const enClaims = { claims: [{ id: 'cl-a', status: 'published' }, { id: 'cl-b', status: 'pendingSync' }] };
    const { errors } = validateBilingualStructuralParity(root, { enClaims, exceptions: null, zhGuide: null, enGuide: null });
    assert.ok(errors.some(e => e.includes('q.mdx: Chinese page has no English counterpart')));
    assert.ok(errors.some(e => e.includes('cl-b') && e.includes('pendingSync')));
    assert.ok(errors.some(e => e.includes('cl-c') && e.includes('missing')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('repository editions are structurally aligned apart from registered exceptions', () => {
  const { errors } = validateBilingualStructuralParity(process.cwd());
  assert.deepEqual(errors, []);
});
