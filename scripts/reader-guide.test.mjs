import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateReaderGuideConfig } from './reader-guide.mjs';

const guide = JSON.parse(readFileSync(new URL('../config/reader-guide.json', import.meta.url), 'utf8'));
const numbering = JSON.parse(readFileSync(new URL('../config/reader-numbering.json', import.meta.url), 'utf8'));

test('production config/reader-guide.json passes all structural and route checks', () => {
  assert.deepEqual(validateReaderGuideConfig(guide, numbering), []);
});

test('validateReaderGuideConfig rejects dead chapter route, missing part question, and bad companion', () => {
  const deadProb = structuredClone(guide);
  deadProb.problemRoutes[0].targets[0].route = '/docs/book/framework-history';
  assert.ok(validateReaderGuideConfig(deadProb, numbering).some(e => e.includes('missing route')));

  const missingPart = structuredClone(guide);
  delete missingPart.partQuestions['4'];
  assert.ok(validateReaderGuideConfig(missingPart, numbering).some(e => e.includes('Part 4')));

  const badComp = structuredClone(guide);
  badComp.chapterCompanions['/docs/book/nonexistent'] = [{ route: '/docs/history', badge: '专题' }];
  assert.ok(validateReaderGuideConfig(badComp, numbering).some(e => e.includes('not an active chapter')));
});

test('validateReaderGuideConfig rejects missing, incomplete, or orphan partSummaries', () => {
  const missingSummary = structuredClone(guide);
  delete missingSummary.partSummaries['4'];
  assert.ok(validateReaderGuideConfig(missingSummary, numbering).some(e => e.includes('partSummaries') && e.includes('Part 4')));

  const blankGaps = structuredClone(guide);
  blankGaps.partSummaries['1'].gaps = '   ';
  assert.ok(validateReaderGuideConfig(blankGaps, numbering).some(e => e.includes('partSummaries') && e.includes('Part 1')));

  const extraKey = structuredClone(guide);
  extraKey.partSummaries['99'] = { establishes: 'a', contrasts: 'b', gaps: 'c', bridge: 'd' };
  assert.ok(validateReaderGuideConfig(extraKey, numbering).some(e => e.includes('unknown part key: 99')));
});
