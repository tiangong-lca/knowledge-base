import { checkpointInput } from './reader-checkpoint-input.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import config from '../config/reader-framework-comparison.json' with { type: 'json' };
import wholeBookConfig from '../config/reader-whole-book-reread.json' with { type: 'json' };
import part1Config from '../config/reader-part1-reread.json' with { type: 'json' };
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import { restoreWholeBookRereadTestFiles } from './reader-whole-book-reread.mjs';
import { restorePart1RereadTestFiles } from './reader-part1-reread.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookHistoryFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  frameworkComparisonPredecessorPin,
  prepareFrameworkComparisonSource,
  selectFrameworkComparison,
  validateFrameworkComparisonFactors,
  verifyFrameworkComparisonReceipts,
} from './reader-framework-comparison.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));

async function loadInput() {
  const [catalog, readings, literature, baseline, loadShift, service] = await Promise.all([
    checkpointInput().then(x => x.catalog),
    checkpointInput().then(x => x.readings),
    checkpointInput().then(x => x.literature),
    readJson('config/readable-book-baseline.json'),
    readJson('config/reader-load-shift.json'),
    readJson('config/reader-service-constraints.json'),
  ]);
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    checkpointInput().then(x => x.files),
    readLoadShiftCaseFiles('.', loadShift.unit),
    readServiceConstraintsFiles('.', service.unit),
  ]);
  for (const [k, v] of shiftFiles) files.set(k, v);
  for (const [k, v] of serviceFiles) files.set(k, v);
  const rolled = part1Config.unit ? previousScientificTestRecords(wholeBookConfig.unit ? previousScientificTestRecords({ catalog, readings, literature }, wholeBookConfig.unit) : { catalog, readings, literature }, part1Config.unit) : { catalog, readings, literature };
  const rolledFiles = part1Config.unit ? restorePart1RereadTestFiles(wholeBookConfig.unit ? restoreWholeBookRereadTestFiles(files, wholeBookConfig.unit) : files, part1Config.unit) : files;
  return { ...rolled, files: rolledFiles };
}

test('Unit #179 B04 framework comparison prepares cleanly and recovers exact d4c9993b predecessor pin with 1124 claims', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectFrameworkComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareFrameworkComparisonSource(unit, input, actual, structure);
  assert.equal(input.catalog.claims.length, 1124);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1118);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), frameworkComparisonPredecessorPin);
});

test('Unit #179 selectFrameworkComparison fails closed on preview without flag, forged/malformed/null pin, inactive downgrade, and invalid envelope keys', () => {
  if (!config.unit) return;
  const previewCfg = { schemaVersion: 1, status: 'preview', unit: structuredClone(config.unit) };
  delete previewCfg.unit.reviewEvidence;
  assert.throws(() => selectFrameworkComparison(previewCfg, null, false), /not independently accepted/);
  assert.throws(() => selectFrameworkComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, null, false), /pin does not match/);
  assert.throws(() => selectFrameworkComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, 'not-a-sha256', false), /pin does not match/);
  assert.throws(() => selectFrameworkComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, '0'.repeat(64), false), /pin does not match/);
  assert.throws(() => selectFrameworkComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /cannot be downgraded/);
  const badEnv = structuredClone(previewCfg);
  badEnv.unit.unexpected = true;
  assert.throws(() => selectFrameworkComparison(badEnv, null, true), /invalid or extra keys/);
});

test('Unit #179 validates numeric factors, rejects unauthorized MDX edits, and verifies receipts once reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectFrameworkComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  validateFrameworkComparisonFactors(input.catalog, input.readings);

  const badCat = structuredClone(input.catalog);
  const ev = badCat.evidence.find(x => x.id === 'ev-fw179-pef-framework');
  ev.numericFacts.find(x => x.id === 'nf-fw179-pef-16-categories').value = '15';
  assert.throws(() => validateFrameworkComparisonFactors(badCat, input.readings), /numeric fact mismatch/);

  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set('content/monograph/framework-responsibilities.mdx', Buffer.from('tampered'));
  assert.throws(
    () => prepareFrameworkComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /actual source state differs|candidate transition|outside bounded|retain exactly 5 H2/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyFrameworkComparisonReceipts(unit, artifacts, downloads), true);
  }
});
