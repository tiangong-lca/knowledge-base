import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateTimelineData } from './reader-timeline.mjs';

const timeline = JSON.parse(readFileSync(new URL('../knowledge/timeline.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
const numbering = JSON.parse(readFileSync(new URL('../config/reader-numbering.json', import.meta.url), 'utf8'));
const activeRoutes = new Set(numbering.web.map(u => u.key));

test('production knowledge/timeline.json passes primary-source and active-route validation', () => {
  const errors = validateTimelineData(timeline, catalog, activeRoutes);
  assert.deepEqual(errors, []);
  const verified = timeline.milestones.filter(m => m.status === 'verified');
  const pending = timeline.milestones.filter(m => m.status === 'pending');
  assert.ok(timeline.milestones.length >= 29, `expected >=29 milestones, got ${timeline.milestones.length}`);
  assert.ok(verified.length >= 22, `expected >=22 verified milestones, got ${verified.length}`);
  assert.ok(pending.every(m => m.pendingNote.length > 10));
  const zhText = JSON.stringify(timeline);
  assert.doesNotMatch(zhText, /本库|暂标为待核|尚待正式购买授权/);
  const enTimeline = JSON.parse(readFileSync(new URL('../knowledge/editions/en/timeline.json', import.meta.url), 'utf8'));
  assert.equal(enTimeline.milestones.length, timeline.milestones.length);
  const enText = JSON.stringify(enTimeline);
  assert.doesNotMatch(enText, /this library|pending licensed full-text|marked Unverified/i);
});

test('validateTimelineData rejects verified milestone without sources, pending without pendingNote, and dead routes', () => {
  const badVerified = structuredClone(timeline);
  badVerified.milestones[1].evidence.sourceIds = [];
  assert.ok(validateTimelineData(badVerified, catalog, activeRoutes).some(e => e.includes('requires at least one sourceId')));

  const badSource = structuredClone(timeline);
  badSource.milestones[1].evidence.sourceIds = ['src-does-not-exist'];
  assert.ok(validateTimelineData(badSource, catalog, activeRoutes).some(e => e.includes('unknown catalog source')));

  const badPending = structuredClone(timeline);
  badPending.milestones[0].pendingNote = '';
  assert.ok(validateTimelineData(badPending, catalog, activeRoutes).some(e => e.includes('pendingNote')));

  const badRoute = structuredClone(timeline);
  badRoute.milestones[0].chapters[0].href = '/docs/book/framework-history/';
  assert.ok(validateTimelineData(badRoute, catalog, activeRoutes).some(e => e.includes('missing active route')));
});
