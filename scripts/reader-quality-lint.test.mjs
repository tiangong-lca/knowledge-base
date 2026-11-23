import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { detectInternalDraftChapterNumbers, lintReadabilityAdvisories } from './reader-quality-lint.mjs';

const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));

test('production catalog has zero internal draft chapter-number leaks', () => {
  assert.deepEqual(detectInternalDraftChapterNumbers(catalog), []);
});

test('detectInternalDraftChapterNumbers blocks internal chapter refs and allows external literature citations', () => {
  const fixture = {
    claims: [
      { id: 'cl-bad', text: '本例沿用第29章完整墙面例中的平整基底。' },
      { id: 'cl-retired', text: '参见《过程数据的用途》中的讨论。' },
      { id: 'cl-good-1', text: 'ecoinvent v3 第 10 章采用对数正态谱系方差。' },
      { id: 'cl-good-2', text: 'ILCD 2010（第 11 章）规定关键性审查。' },
      { id: 'cl-good-3', text: '第 4 章图 4.1 的脚注限定了用语范围。' },
    ],
  };
  const errors = detectInternalDraftChapterNumbers(fixture);
  assert.equal(errors.length, 2);
  assert.ok(errors.some(e => e.includes('cl-bad')));
  assert.ok(errors.some(e => e.includes('cl-retired')));
});

test('lintReadabilityAdvisories flags >500-char paragraphs and unexpanded tracked acronyms', () => {
  const fixture = {
    claims: [
      { id: 'cl-long', text: '甲'.repeat(520) },
      { id: 'cl-ac', text: '在某项研究中采用了 FaIR 与 PEFCR 模型。' },
      { id: 'cl-ok', text: '在某项研究中采用了高密度聚乙烯（HDPE）袋。' },
    ],
  };
  const advisories = lintReadabilityAdvisories(fixture);
  assert.ok(advisories.some(w => w.kind === 'long-paragraph' && w.claimId === 'cl-long'));
  assert.ok(advisories.some(w => w.kind === 'unexpanded-acronym' && w.acronym === 'FaIR'));
  assert.ok(advisories.some(w => w.kind === 'unexpanded-acronym' && w.acronym === 'PEFCR'));
  assert.ok(!advisories.some(w => w.claimId === 'cl-ok'));
});
