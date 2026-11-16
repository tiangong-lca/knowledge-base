import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import config from '../config/reader-land-recovery.json' with { type: 'json' };
import capture from '../config/reader-land-recovery-capture.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import sourceBaseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConstraints from '../config/reader-service-constraints.json' with { type: 'json' };
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { prepareLandRecoverySource, verifyLandRecoveryReceipts } from './reader-land-recovery.mjs';

import acidEquivalents from '../config/reader-acid-equivalents.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';

test('B14 receipts bind captured raw files, normalized article pairs, public pages and JSON', {
  skip: !capture && config.status !== 'reviewed',
}, () => {
  const previous = previousScientificTestRecords({ catalog, readings, literature }, acidEquivalents.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const check = (changeUnit = () => {}, changeOutput) => {
    const unit = structuredClone(config.unit);
    changeUnit(unit);
    return verifyLandRecoveryReceipts(unit, testEnvelopes(capture, unit, changeOutput), expected);
  };
  assert(check());
  assert(!check(unit => { unit.outputCapture.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.previewDownloads = []; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).bytes = 1; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.html')).sha256 = '0'.repeat(64); }));
  assert(!check(unit => { unit.publicArtifacts.find(row => row.path === 'claims/index.html').sha256 = editionDigest('Different public HTML'); }));
  assert(!check(unit => {
    const [land, ecosystem] = unit.outputs.filter(row => row.path === '/print');
    [land.sha256, ecosystem.sha256] = [ecosystem.sha256, land.sha256];
  }));
});


test('B14 source plan declares every actual transition with its real predecessor', { skip: !config.unit }, async t => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, sourceBaseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, serviceConstraints.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  const previous = previousScientificTestRecords({ catalog, readings, literature }, acidEquivalents.unit);
  if (acidEquivalents.unit) {
    const [route] = acidEquivalents.unit.routes;
    files.set(`content${route}.mdx`, Buffer.from(acidEquivalents.unit.previousMdx));
  }
  const input = { ...previous, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const qualify = unit => prepareLandRecoverySource(unit, input, actual, structure);
  const key = 'researchMetadata:order:queries';

  assert.doesNotThrow(() => qualify(config.unit));
  await t.test('omitted transition', () => {
    const omitted = structuredClone(config.unit);
    omitted.scope = omitted.scope.filter(id => id !== key);
    omitted.changes = omitted.changes.filter(row => row.key !== key);
    assert.throws(() => qualify(omitted), /missing actual record transition: researchMetadata:order:queries/);
  });
  await t.test('forged predecessor', () => {
    const forged = structuredClone(config.unit);
    forged.changes.find(row => row.key === key).from = { raw: 'f'.repeat(64), protected: 'e'.repeat(64), public: null };
    assert.throws(() => qualify(forged), /inexact predecessor for record transition: researchMetadata:order:queries/);
  });
});
