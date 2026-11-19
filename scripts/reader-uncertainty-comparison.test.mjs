import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import config from '../config/reader-uncertainty-comparison.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { validateUncertaintyComparisonFactors } from './reader-uncertainty-comparison-factors.mjs';
import {
  prepareUncertaintyComparisonSource,
  selectUncertaintyComparison,
  uncertaintyComparisonId,
  uncertaintyComparisonRoute,
  uncertaintyComparisonUnitPin,
  validateUncertaintyComparisonCorrectionOutput,
  verifyUncertaintyComparisonReceipts,
} from './reader-uncertainty-comparison.mjs';

const root = process.cwd();
const previewMode = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';

async function loadInput() {
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [p, bytes] of [...shiftFiles, ...serviceFiles]) files.set(p, bytes);
  return { catalog, readings, literature, files };
}

test('Uncertainty comparison validates all 42 BigInt numericFacts, 10 single-artifact passages, and 8 new B26 claims', () => {
  assert.equal(catalog.claims.length, 1060);
  validateUncertaintyComparisonFactors(catalog, readings);
});

test('Uncertainty comparison fails closed on tampered numericFact, mediaType, or raw locator marker', () => {
  const tampered = structuredClone(catalog);
  const ev = tampered.evidence.find(row => row.id === 'ev-unc149-groen2017-methods-cost-case-studies');
  const nf = ev.numericFacts.find(row => row.id === 'nf-unc149-groen-c1-cv30-var-kia');
  nf.value = '2900';
  assert.throws(() => validateUncertaintyComparisonFactors(tampered, readings), /NumericFact mismatch/);

  const badMedia = structuredClone(readings);
  badMedia.readings.find(r => r.id === 'rd-unc149-heijungs-2020').artifacts[0].mediaType = 'text/plain';
  assert.throws(() => validateUncertaintyComparisonFactors(catalog, badMedia), /Carrier artifact mismatch/);

  const badLoc = structuredClone(catalog);
  badLoc.evidence.find(row => row.id === 'ev-unc149-heijungs2020-sources-runtime').locator = '§2.1 PDF零基索引1';
  assert.throws(() => validateUncertaintyComparisonFactors(badLoc, readings), /Disallowed raw locator marker/);
});

test('Uncertainty comparison select rejects forged pin, extraneous envelope keys, and preview without flag', () => {
  const forgedPin = '0'.repeat(64);
  assert.throws(() => selectUncertaintyComparison({ ...config, status: 'reviewed' }, forgedPin, false));

  const extraKeyCfg = structuredClone(config);
  if (extraKeyCfg.unit) {
    extraKeyCfg.unit.extraProp = true;
    assert.throws(() => selectUncertaintyComparison(extraKeyCfg, uncertaintyComparisonUnitPin, true), /envelope contains missing, extraneous or malformed/);
  }
  if (config.status === 'preview') {
    assert.throws(() => selectUncertaintyComparison(config, null, false), /not independently accepted/);
  }
});

test('Uncertainty comparison recovers exact 4bb50839 predecessor state, rejects unauthorized MDX/record mutations, and verifies independent receipts when reviewed', async () => {
  const unit = selectUncertaintyComparison(config, uncertaintyComparisonUnitPin, previewMode);
  assert.ok(unit, 'Active uncertainty comparison unit expected');
  const input = await loadInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareUncertaintyComparisonSource(unit, input, actual, structure);
  assert.ok(prepared.affectedClaimIds.includes('cl-unc149-taylor-vs-sampling'));
  assert.ok(prepared.affectedClaimIds.includes('cl-unc-sd-sem'));
  assert.ok(prepared.affectedClaimIds.includes('cl-book-unc-bridge'));

  // Negative: MDX table tampering fails closed
  const badFiles = new Map(input.files);
  const mdxPath = `content${uncertaintyComparisonRoute}.mdx`;
  badFiles.set(mdxPath, Buffer.from(badFiles.get(mdxPath).toString().replace('低估约 33%', '低估约 99%')));
  const badInput = { ...input, files: badFiles };
  assert.throws(
    () => prepareUncertaintyComparisonSource(unit, badInput, inspectReadableBookEdition(badInput), copyeditSourceStructure(badInput)),
    /lacks its exact candidate transition|changed protected B26 MDX/,
  );

  // Negative: unauthorized prefix-matching raw record fails closed
  const badUnit = structuredClone(unit);
  badUnit.rawRecords.push({ path: 'catalog.claims', id: 'cl-unc149-rogue', from: null });
  assert.throws(() => prepareUncertaintyComparisonSource(badUnit, input, actual, structure), /unsupported raw transition|cannot modify/);

  // Negative: detached/missing correction notice fails closed
  const fakeDoc = { querySelectorAll: () => [] };
  const noticeErrors = validateUncertaintyComparisonCorrectionOutput(fakeDoc, uncertaintyComparisonRoute, unit);
  assert.equal(noticeErrors.length, 1);
  assert.match(noticeErrors[0], /correction notice count mismatch/);

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(join(root, row.artifactFile), 'utf8'));
      artifacts.set(row.reportFile, await fs.readFile(join(root, row.reportFile), 'utf8'));
    }
    const downloads = readerPublicDownloads(catalog, literature, readings);
    assert.equal(verifyUncertaintyComparisonReceipts(unit, artifacts, downloads), true);
    assert.equal(verifyUncertaintyComparisonReceipts({ ...unit, outputs: [] }, artifacts, downloads), false);
  } else {
    assert.equal(unit.id, uncertaintyComparisonId);
    assert.equal(verifyUncertaintyComparisonReceipts(unit, new Map(), new Map()), false);
  }
});
