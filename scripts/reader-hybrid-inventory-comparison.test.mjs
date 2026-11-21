import { checkpointInput } from './reader-checkpoint-input.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import config from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import wholeBookConfig from '../config/reader-whole-book-reread.json' with { type: 'json' };
import part1Config from '../config/reader-part1-reread.json' with { type: 'json' };
import fwConfig from '../config/reader-framework-comparison.json' with { type: 'json' };
import part2Config from '../config/reader-part2-reread.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookHistoryFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { restoreWholeBookRereadTestFiles } from './reader-whole-book-reread.mjs';
import { restorePart1RereadTestFiles } from './reader-part1-reread.mjs';
import { restoreFrameworkComparisonTestFiles } from './reader-framework-comparison.mjs';
import { restorePart2RereadTestFiles } from './reader-part2-reread.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  hybridInventoryComparisonPredecessorPin,
  prepareHybridInventoryComparisonSource,
  selectHybridInventoryComparison,
  validateHybridInventoryFactors,
  verifyHybridInventoryComparisonReceipts,
} from './reader-hybrid-inventory-comparison.mjs';

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
  const rolled = part2Config.unit ? previousScientificTestRecords(previousScientificTestRecords(part1Config.unit ? previousScientificTestRecords(wholeBookConfig.unit ? previousScientificTestRecords({ catalog, readings, literature }, wholeBookConfig.unit) : { catalog, readings, literature }, part1Config.unit) : { catalog, readings, literature }, fwConfig.unit), part2Config.unit) : { catalog, readings, literature };
  return { ...rolled, files: part2Config.unit ? restorePart2RereadTestFiles(restoreFrameworkComparisonTestFiles(part1Config.unit ? restorePart1RereadTestFiles(wholeBookConfig.unit ? restoreWholeBookRereadTestFiles(files, wholeBookConfig.unit) : files, part1Config.unit) : files, fwConfig.unit), part2Config.unit) : files };
}

test('Unit #175 B09 hybrid inventory comparison prepares cleanly and recovers exact 744b371af predecessor pin with 1118 claims', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectHybridInventoryComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareHybridInventoryComparisonSource(unit, input, actual, structure);
  assert.equal(input.catalog.claims.length, 1118);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1112);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), hybridInventoryComparisonPredecessorPin);
});

test('Unit #175 selectHybridInventoryComparison fails closed on preview without flag, forged pin, inactive downgrade, and invalid envelope keys', () => {
  if (!config.unit) return;
  const previewCfg = { schemaVersion: 1, status: 'preview', unit: structuredClone(config.unit) };
  delete previewCfg.unit.reviewEvidence;
  assert.throws(() => selectHybridInventoryComparison(previewCfg, null, false), /not independently accepted/);
  assert.throws(() => selectHybridInventoryComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, null, false), /pin does not match|non-empty/);
  assert.throws(() => selectHybridInventoryComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, '0'.repeat(64), false), /pin does not match/);
  assert.throws(() => selectHybridInventoryComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /cannot be downgraded/);
  const badEnv = structuredClone(previewCfg);
  badEnv.unit.unexpected = true;
  assert.throws(() => selectHybridInventoryComparison(badEnv, null, true), /invalid or extra keys/);
});

test('Unit #175 validates numeric factors, rejects unauthorized MDX edits, and verifies receipts once reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectHybridInventoryComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  validateHybridInventoryFactors(input.catalog, input.readings);

  const badCat = structuredClone(input.catalog);
  const ev = badCat.evidence.find(x => x.id === 'ev-hyb175-pef-cutoff');
  ev.numericFacts.find(x => x.id === 'nf-hyb175-pef-cutoff-3pct').value = '5.0';
  assert.throws(() => validateHybridInventoryFactors(badCat, input.readings), /numeric fact mismatch/);

  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set('content/docs/book/inventory-boundary-and-hybrid.mdx', Buffer.from('tampered'));
  assert.throws(
    () => prepareHybridInventoryComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /actual source state differs|candidate transition|outside bounded/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyHybridInventoryComparisonReceipts(unit, artifacts, downloads), true);
  }
});
