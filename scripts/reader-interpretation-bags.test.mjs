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
import fut from '../config/reader-future-scenarios.json' with { type: 'json' };
import { restoreFutureScenariosTestFiles } from './reader-future-scenarios.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-interpretation-bags.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  interpretationBagsPredecessorPin,
  prepareInterpretationBagsSource,
  selectInterpretationBags,
  verifyInterpretationBagsReceipts,
} from './reader-interpretation-bags.mjs';
import { validateInterpretationBagsFactors } from './reader-interpretation-bags-factors.mjs';

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
  restoreFutureScenariosTestFiles(files, fut.unit);
  const prev159 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit);
  return { ...prev159, files };
}

test('Unit #159 B30 interpretation & shopping-bag comparison prepares cleanly and recovers exact c5a257a0 predecessor pin with 1086 claims and 0 case edits', async () => {
  const unit = selectInterpretationBags(config, undefined, isPreview);
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);

  const res = prepareInterpretationBagsSource(unit, input, actual, structure);
  assert.equal(unit.state.before, interpretationBagsPredecessorPin);
  assert.equal(input.catalog.claims.length, 1086);
  assert.equal(res.previousRecords.catalog.claims.length, 1080);

  const curPack = input.catalog.claims.filter(c => JSON.stringify(c).includes('pack-study-v1.json'));
  const prevPack = res.previousRecords.catalog.claims.filter(c => JSON.stringify(c).includes('pack-study-v1.json'));
  assert.equal(curPack.length, 10);
  assert.deepEqual(curPack, prevPack);
});

test('Unit #159 selectInterpretationBags fails closed on preview without flag, forged pin, inactive downgrade, and invalid envelope keys', () => {
  const previewCfg = structuredClone(config);
  previewCfg.status = 'preview';
  delete previewCfg.unit.reviewEvidence;
  assert.throws(() => selectInterpretationBags(previewCfg, null, false), /not independently accepted/);
  assert.throws(() => selectInterpretationBags(previewCfg, 'a'.repeat(64), true), /not independently accepted/);

  const reviewedCfg = structuredClone(config);
  reviewedCfg.status = 'reviewed';
  assert.throws(() => selectInterpretationBags(reviewedCfg, '0'.repeat(64), false), /pin does not match/);

  const inactiveCfg = structuredClone(config);
  inactiveCfg.status = 'inactive';
  assert.throws(() => selectInterpretationBags(inactiveCfg, 'a'.repeat(64), false), /downgraded to inactive/);

  const extraKeyCfg = structuredClone(previewCfg);
  extraKeyCfg.unit.unexpected = true;
  assert.throws(() => selectInterpretationBags(extraKeyCfg, null, true), /invalid or extra keys/);
});

test('Unit #159 factor & numeric-fact guard validates 14 BigInt rationals and rejects tampering or unclean locators', async () => {
  const catalog = await readJson('knowledge/catalog.json');
  const readings = await readJson('knowledge/research/readings.json');
  assert.doesNotThrow(() => validateInterpretationBagsFactors(catalog, readings));

  const badVal = structuredClone(catalog);
  const ev = badVal.evidence.find(e => e.id === 'ev-int159-danish-epa-multi-indicator');
  ev.numericFacts.find(f => f.id === 'nf-int159-danish-cotorg-all').value = '19999';
  assert.throws(() => validateInterpretationBagsFactors(badVal, readings), /Numeric fact mismatch/);

  const badLoc = structuredClone(catalog);
  badLoc.evidence.find(e => e.id === 'ev-int159-pef-interpretation-report').locator = 'Annex I Table 27 p. 91';
  assert.throws(() => validateInterpretationBagsFactors(badLoc, readings), /Unclean locator/);
});

test('Unit #159 rejects unauthorized MDX edits and verifies receipts once reviewed', async () => {
  const unit = selectInterpretationBags(config, undefined, isPreview);
  const input = await loadInput();

  const badFiles = new Map(input.files);
  badFiles.set('content/docs/book/interpretation-and-limits.mdx', Buffer.from('tampered'));
  const badInput = { ...input, files: badFiles };
  assert.throws(
    () => prepareInterpretationBagsSource(unit, badInput, inspectReadableBookEdition(badInput), copyeditSourceStructure(badInput)),
    /did not recover|transition/,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile, 'utf8'));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile, 'utf8'));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyInterpretationBagsReceipts(unit, artifacts, downloads), true);
  }
});
