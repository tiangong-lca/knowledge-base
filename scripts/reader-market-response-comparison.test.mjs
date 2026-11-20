import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import config from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import part2 from '../config/reader-part2-reread.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
import { restorePart2RereadTestFiles } from './reader-part2-reread.mjs';
import { restoreHybridInventoryComparisonTestFiles } from './reader-hybrid-inventory-comparison.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import {
  marketResponseComparisonPredecessorPin,
  prepareMarketResponseComparisonSource,
  selectMarketResponseComparison,
  validateMarketResponseFactors,
  verifyMarketResponseComparisonReceipts,
} from './reader-market-response-comparison.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));

async function loadInput() {
  const [catalog, readings, literature, baseline, loadShift, service] = await Promise.all([
    readJson('knowledge/catalog.json'),
    readJson('knowledge/research/readings.json'),
    readJson('knowledge/research/literature-map.json'),
    readJson('config/readable-book-baseline.json'),
    readJson('config/reader-load-shift.json'),
    readJson('config/reader-service-constraints.json'),
  ]);
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles('.', baseline.fixedFiles),
    readLoadShiftCaseFiles('.', loadShift.unit),
    readServiceConstraintsFiles('.', service.unit),
  ]);
  for (const [k, v] of shiftFiles) files.set(k, v);
  for (const [k, v] of serviceFiles) files.set(k, v);
  restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(restorePart2RereadTestFiles(files, part2.unit), hyb.unit), fr.unit);
  restorePart3RereadTestFiles(files, part3.unit);
  return { ...previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part2.unit), hyb.unit), fr.unit), part3.unit), files };
}

test('Unit #169 B11 market response comparison prepares cleanly and recovers exact 8949778f predecessor pin with 1106 claims', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectMarketResponseComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareMarketResponseComparisonSource(unit, input, actual, structure);
  assert.equal(input.catalog.claims.length, 1106);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1099);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), marketResponseComparisonPredecessorPin);
});

test('Unit #169 selectMarketResponseComparison fails closed on preview without flag, forged pin, inactive downgrade, and invalid envelope keys', () => {
  if (!config.unit) return;
  const previewCfg = { schemaVersion: 1, status: 'preview', unit: structuredClone(config.unit) };
  delete previewCfg.unit.reviewEvidence;
  assert.throws(() => selectMarketResponseComparison(previewCfg, null, false), /not independently accepted/);
  assert.throws(() => selectMarketResponseComparison({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, '0'.repeat(64), false), /pin does not match/);
  assert.throws(() => selectMarketResponseComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /cannot be downgraded/);
  const badEnv = structuredClone(previewCfg);
  badEnv.unit.unexpected = true;
  assert.throws(() => selectMarketResponseComparison(badEnv, null, true), /invalid or extra keys/);
});

test('Unit #169 validates numeric factors, rejects unauthorized MDX edits, and verifies receipts once reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectMarketResponseComparison(config, undefined, preview);
  if (!unit) return;
  const input = await loadInput();
  validateMarketResponseFactors(input.catalog, input.readings);

  const badCat = structuredClone(input.catalog);
  const ev = badCat.evidence.find(x => x.id === 'ev-mkt169-ecoinvent-consequential');
  ev.numericFacts.find(x => x.id === 'nf-mkt169-ecoinvent-replacement-rate').value = '5.00';
  assert.throws(() => validateMarketResponseFactors(badCat, input.readings), /numeric fact mismatch/);

  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set('content/docs/book/market-boundaries-and-response.mdx', Buffer.from('tampered'));
  assert.throws(
    () => prepareMarketResponseComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /candidate transition|outside bounded/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyMarketResponseComparisonReceipts(unit, artifacts, downloads), true);
  }
});
