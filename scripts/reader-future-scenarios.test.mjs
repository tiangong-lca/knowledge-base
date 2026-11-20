import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
import { restoreHybridInventoryComparisonTestFiles } from './reader-hybrid-inventory-comparison.mjs';
import { restorePart7RereadTestFiles } from './reader-part7-reread.mjs';
import rev from '../config/reader-revisable-judgment.json' with { type: 'json' };
import { restoreRevisableJudgmentTestFiles } from './reader-revisable-judgment.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-future-scenarios.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  futureScenariosPredecessorPin,
  prepareFutureScenariosSource,
  selectFutureScenarios,
  verifyFutureScenariosReceipts,
} from './reader-future-scenarios.mjs';
import { validateFutureScenariosFactors } from './reader-future-scenarios-factors.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));
const isPreview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';

async function loadInput() {
  const [catalog, readings, literature, files, shiftFiles, serviceFiles] = await Promise.all([
    readJson('knowledge/catalog.json'),
    readJson('knowledge/research/readings.json'),
    readJson('knowledge/research/literature-map.json'),
    readReadableBookFiles(process.cwd(), baseline.fixedFiles),
    readLoadShiftCaseFiles(process.cwd(), loadShift.unit),
    readServiceConstraintsFiles(process.cwd(), service.unit),
  ]);
  for (const [p, b] of [...shiftFiles, ...serviceFiles]) files.set(p, b);
  restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(files, hyb.unit), fr.unit), part3.unit), mkt.unit);
  restorePart7RereadTestFiles(files, part7.unit);
  restoreRevisableJudgmentTestFiles(files, rev.unit);
  const prev161 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit);
  return { ...prev161, files };
}

test('Unit #161 B31 future technology & scenarios prepares cleanly and recovers exact ac54b259 predecessor pin with 1092 claims and 9 untouched prior B31 claims', async () => {
  const unit = selectFutureScenarios(config, undefined, isPreview);
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);

  const res = prepareFutureScenariosSource(unit, input, actual, structure);
  assert.equal(unit.state.before, futureScenariosPredecessorPin);
  assert.equal(input.catalog.claims.length, 1092);
  assert.equal(res.previousRecords.catalog.claims.length, 1086);

  const priorIds = [
    'cl-future-definition', 'cl-future-scale-up', 'cl-future-incumbent',
    'cl-future-scenarios', 'cl-future-background', 'cl-book-future-scenario-matrix',
    'cl-future-impact-limits', 'cl-future-comparison-conditions', 'cl-book-future-decision',
  ];
  for (const id of priorIds) {
    assert.deepEqual(
      input.catalog.claims.find(c => c.id === id),
      res.previousRecords.catalog.claims.find(c => c.id === id),
      id,
    );
  }
});

test('Unit #161 selectFutureScenarios fails closed on preview without flag, forged pin, inactive downgrade, and invalid envelope keys', () => {
  const previewCfg = structuredClone(config);
  previewCfg.status = 'preview';
  delete previewCfg.unit.reviewEvidence;
  assert.throws(() => selectFutureScenarios(previewCfg, null, false), /not independently accepted/);
  assert.throws(() => selectFutureScenarios(previewCfg, 'a'.repeat(64), true), /not independently accepted/);

  const reviewedCfg = structuredClone(config);
  reviewedCfg.status = 'reviewed';
  assert.throws(() => selectFutureScenarios(reviewedCfg, '0'.repeat(64), false), /pin does not match/);

  const inactiveCfg = structuredClone(config);
  inactiveCfg.status = 'inactive';
  assert.throws(() => selectFutureScenarios(inactiveCfg, 'a'.repeat(64), false), /downgraded to inactive/);

  const extraKeyCfg = structuredClone(previewCfg);
  extraKeyCfg.unit.unexpected = true;
  assert.throws(() => selectFutureScenarios(extraKeyCfg, null, true), /invalid or extra keys/);
});

test('Unit #161 factor & numeric-fact guard validates 14 BigInt rationals and rejects tampering or unclean locators', async () => {
  const catalog = await readJson('knowledge/catalog.json');
  const readings = await readJson('knowledge/research/readings.json');
  assert.doesNotThrow(() => validateFutureScenariosFactors(catalog, readings));

  const badVal = structuredClone(catalog);
  const ev = badVal.evidence.find(e => e.id === 'ev-fut161-lueddeckens-temporal');
  ev.numericFacts.find(f => f.id === 'nf-fut161-lueddeckens-implied-th').value = '200';
  assert.throws(() => validateFutureScenariosFactors(badVal, readings), /Numeric fact mismatch/);

  const badLoc = structuredClone(catalog);
  badLoc.evidence.find(e => e.id === 'ev-fut161-arvidsson-terminology').locator = 'Fig. 2 p. 611';
  assert.throws(() => validateFutureScenariosFactors(badLoc, readings), /Unclean locator/);
});

test('Unit #161 rejects unauthorized MDX edits and verifies receipts once reviewed', async () => {
  const unit = selectFutureScenarios(config, undefined, isPreview);
  const input = await loadInput();

  const badFiles = new Map(input.files);
  badFiles.set('content/docs/book/future-technology-and-context.mdx', Buffer.from('tampered'));
  const badInput = { ...input, files: badFiles };
  assert.throws(
    () => prepareFutureScenariosSource(unit, badInput, inspectReadableBookEdition(badInput), copyeditSourceStructure(badInput)),
    /did not recover|transition/,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile, 'utf8'));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile, 'utf8'));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyFutureScenariosReceipts(unit, artifacts, downloads), true);
  }
});
