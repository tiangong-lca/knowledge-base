import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import fut from '../config/reader-future-scenarios.json' with { type: 'json' };
import { restoreFutureScenariosTestFiles } from './reader-future-scenarios.mjs';
import intBags from '../config/reader-interpretation-bags.json' with { type: 'json' };
import { restoreInterpretationBagsTestFiles } from './reader-interpretation-bags.mjs';
import wsc from '../config/reader-wall-service-comparison.json' with { type: 'json' };
import { restoreWallServiceComparisonTestFiles } from './reader-wall-service-comparison.mjs';
import part6 from '../config/reader-part6-reread.json' with { type: 'json' };
import { restorePart6RereadTestFiles } from './reader-part6-reread.mjs';
import dqp from '../config/reader-data-quality-comparison.json' with { type: 'json' };
import { restoreDataQualityComparisonTestFiles } from './reader-data-quality-comparison.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-product-footprint-comparison.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  prepareProductFootprintComparisonSource,
  productFootprintComparisonPredecessorPin,
  selectProductFootprintComparison,
  verifyProductFootprintComparisonReceipts,
} from './reader-product-footprint-comparison.mjs';
import { validateProductFootprintComparisonFactors } from './reader-product-footprint-comparison-factors.mjs';

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
  for (const [p, b] of [...shiftFiles, ...serviceFiles]) files.set(p, b);
  restoreFutureScenariosTestFiles(files, fut.unit);
  restoreInterpretationBagsTestFiles(files, intBags.unit);
  restoreWallServiceComparisonTestFiles(files, wsc.unit);
  restorePart6RereadTestFiles(files, part6.unit);
  restoreDataQualityComparisonTestFiles(files, dqp.unit);
  const prev151 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit);
  return { ...prev151, files };
}

test('Unit #151 product footprint comparison source prepares cleanly and recovers exact 3c6844be predecessor pin', async () => {
  const preview = config.status === 'preview';
  const unit = selectProductFootprintComparison(config, undefined, preview);
  assert(unit);
  const input = await loadInput();
  assert.equal(input.catalog.claims.length, 1068);
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareProductFootprintComparisonSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), productFootprintComparisonPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1060);
});

test('Unit #151 selectProductFootprintComparison fails closed on preview without flag, forged pin, inactive downgrade, duplicate scope, and invalid envelope keys', () => {
  const preview = config.status === 'preview';
  if (preview) {
    assert.throws(() => selectProductFootprintComparison(config, null, false), /not independently accepted/i);
    assert.throws(() => selectProductFootprintComparison(config, '0'.repeat(64), true), /not independently accepted/i);
  }
  assert.throws(() => selectProductFootprintComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /null pin/i);
  assert.throws(() => selectProductFootprintComparison({ ...config, status: 'reviewed' }, '0'.repeat(64), false));

  const badCfg = structuredClone(config);
  badCfg.unit.extraField = true;
  assert.throws(() => selectProductFootprintComparison(badCfg, undefined, preview), /envelope/i);

  const dupScopeCfg = structuredClone(config);
  dupScopeCfg.unit.scope.push(dupScopeCfg.unit.scope[0]);
  assert.throws(() => selectProductFootprintComparison(dupScopeCfg, undefined, preview), /envelope/i);

  const badCaptureCfg = structuredClone(config);
  badCaptureCfg.unit.outputCapture = { sourceCommit: '', dirty: true, status: 'working-preview', manifestSha256: 'a'.repeat(64), normalizedProofSha256: 'b'.repeat(64) };
  assert.throws(() => selectProductFootprintComparison(badCaptureCfg, undefined, preview), /envelope/i);
});

test('Unit #151 factor validation fails closed on mutated numericFacts, raw SHA prose, unclean locator, and altered carrier metadata', async () => {
  const input = await loadInput();

  const badCat = structuredClone(input.catalog);
  const ev = badCat.evidence.find(e => e.id === 'ev-pfr151-battery-annex2');
  ev.numericFacts.find(f => f.id === 'nf-pfr151-bat-core-parts').value = '4';
  assert.throws(() => validateProductFootprintComparisonFactors(badCat, input.readings), /mismatch/i);

  const shaLeakCat = structuredClone(input.catalog);
  shaLeakCat.sources.find(s => s.id === 'src-pfr151-ghgp-2011').preservation += ' fdc21b798b9c8908f6e55e8caca22e5d8b281ede3601f6950649244d418d3c0c';
  assert.throws(() => validateProductFootprintComparisonFactors(shaLeakCat, input.readings), /SHA-256/i);

  const badUrlCat = structuredClone(input.catalog);
  badUrlCat.sources.find(s => s.id === 'src-pfr151-eu-2023-1542').artifact.resolvedUrl = 'https://example.com/fake.pdf';
  assert.throws(() => validateProductFootprintComparisonFactors(badUrlCat, input.readings), /artifact mismatch/i);

  const badMediaRd = structuredClone(input.readings);
  badMediaRd.readings.find(r => r.id === 'rd-pfr151-eu-2024-1781').artifacts[0].mediaType = 'text/html';
  assert.throws(() => validateProductFootprintComparisonFactors(input.catalog, badMediaRd), /artifact mismatch/i);

  const badPagesRd = structuredClone(input.readings);
  badPagesRd.readings.find(r => r.id === 'rd-pfr151-ghgp-2011').artifacts[0].pageCount = 149;
  assert.throws(() => validateProductFootprintComparisonFactors(input.catalog, badPagesRd), /artifact mismatch/i);

  const badLocCat = structuredClone(input.catalog);
  badLocCat.evidence.find(e => e.id === 'ev-pfr151-ghgp-scope3-boundary').locator = '§1.6 PDF零基索引7';
  assert.throws(() => validateProductFootprintComparisonFactors(badLocCat, input.readings), /Unclean locator/i);
});

test('Unit #151 rejects altered MDX, mutated prior evidence locator, and invalid review receipts when reviewed', async () => {
  const preview = config.status === 'preview';
  const unit = selectProductFootprintComparison(config, undefined, preview);
  const input = await loadInput();

  const badFiles = new Map(input.files);
  const mdxPath = 'content/docs/book/product-footprint-rules-and-practice.mdx';
  badFiles.set(mdxPath, Buffer.from(badFiles.get(mdxPath).toString().replace('三阶段强制市场准入', '两阶段自愿准入')));
  const badMdxInput = { ...input, files: badFiles };
  assert.throws(
    () => prepareProductFootprintComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
  );

  const mutatedCat = structuredClone(input.catalog);
  mutatedCat.evidence.find(e => e.id === 'ev-kb44-dairy2025-comparisons').locator = 'tampered locator';
  const mutatedInput = { ...input, catalog: mutatedCat };
  assert.throws(
    () => prepareProductFootprintComparisonSource(unit, mutatedInput, inspectReadableBookEdition(mutatedInput), copyeditSourceStructure(mutatedInput)),
  );

  if (!preview) {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile, 'utf8'));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile, 'utf8'));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyProductFootprintComparisonReceipts(unit, artifacts, downloads), true);
    const badUnit = structuredClone(unit);
    badUnit.reviewEvidence = badUnit.reviewEvidence.slice(0, 2);
    assert.equal(verifyProductFootprintComparisonReceipts(badUnit, artifacts, downloads), false);
  }
});
