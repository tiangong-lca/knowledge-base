import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restorePart7RereadTestFiles } from './reader-part7-reread.mjs';
import rev from '../config/reader-revisable-judgment.json' with { type: 'json' };
import { restoreRevisableJudgmentTestFiles } from './reader-revisable-judgment.mjs';
import fut from '../config/reader-future-scenarios.json' with { type: 'json' };
import { restoreFutureScenariosTestFiles } from './reader-future-scenarios.mjs';
import intBags from '../config/reader-interpretation-bags.json' with { type: 'json' };
import { restoreInterpretationBagsTestFiles } from './reader-interpretation-bags.mjs';
import wsc from '../config/reader-wall-service-comparison.json' with { type: 'json' };
import { restoreWallServiceComparisonTestFiles } from './reader-wall-service-comparison.mjs';
import part6 from '../config/reader-part6-reread.json' with { type: 'json' };
import { restorePart6RereadTestFiles } from './reader-part6-reread.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-data-quality-comparison.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  dataQualityComparisonPredecessorPin,
  prepareDataQualityComparisonSource,
  selectDataQualityComparison,
  verifyDataQualityComparisonReceipts,
} from './reader-data-quality-comparison.mjs';
import { validateDataQualityComparisonFactors } from './reader-data-quality-comparison-factors.mjs';

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
  restorePart7RereadTestFiles(files, part7.unit);
  restoreRevisableJudgmentTestFiles(files, rev.unit);
  restoreFutureScenariosTestFiles(files, fut.unit);
  restoreInterpretationBagsTestFiles(files, intBags.unit);
  restoreWallServiceComparisonTestFiles(files, wsc.unit);
  restorePart6RereadTestFiles(files, part6.unit);
  const prev153 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit);
  return { ...prev153, files };
}

test('Unit #153 data quality comparison source prepares cleanly and recovers exact def232fa predecessor pin', async () => {
  const preview = config.status === 'preview';
  const unit = selectDataQualityComparison(config, undefined, preview);
  assert(unit);
  const input = await loadInput();
  assert.equal(input.catalog.claims.length, 1074);
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareDataQualityComparisonSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), dataQualityComparisonPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1068);
});

test('Unit #153 selectDataQualityComparison fails closed on preview without flag, forged pin, inactive downgrade, duplicate scope, and invalid envelope keys', () => {
  if (config.status === 'preview') {
    assert.throws(() => selectDataQualityComparison(config, null, false), /not independently accepted/i);
    assert.throws(() => selectDataQualityComparison(config, '0'.repeat(64), true), /not independently accepted/i);
  }
  assert.throws(() => selectDataQualityComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /null pin/i);
  assert.throws(() => selectDataQualityComparison({ ...config, status: 'reviewed' }, 'f'.repeat(64), false), /pin mismatch|malformed properties/i);
  assert.throws(() => selectDataQualityComparison({ ...config, status: 'reviewed' }, null, false), /pin mismatch|malformed properties/i);
  const dupScope = structuredClone(config);
  dupScope.unit.scope.push(dupScope.unit.scope[0]);
  assert.throws(
    () => selectDataQualityComparison(dupScope, config.status === 'reviewed' ? editionDigest(dupScope.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
  const extraKey = structuredClone(config);
  extraKey.unit.unexpectedField = true;
  assert.throws(
    () => selectDataQualityComparison(extraKey, config.status === 'reviewed' ? editionDigest(extraKey.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
});

test('Unit #153 factor & numeric-fact guard validates 16 BigInt rationals and rejects tampering or unclean locators', async () => {
  const input = await loadInput();
  validateDataQualityComparisonFactors(input.catalog, input.readings);

  const badNumCat = structuredClone(input.catalog);
  const ev = badNumCat.evidence.find(e => e.id === 'ev-dqp153-pef-dnm-thresholds');
  ev.numericFacts.find(f => f.id === 'nf-dqp153-pef-company-dqr').value = '1.6';
  assert.throws(() => validateDataQualityComparisonFactors(badNumCat, input.readings), /Numeric fact mismatch/i);

  const badLocCat = structuredClone(input.catalog);
  badLocCat.evidence.find(e => e.id === 'ev-dqp153-pef-dqr-formula').locator = 'Annex I §4.6.5';
  assert.throws(() => validateDataQualityComparisonFactors(badLocCat, input.readings), /Unclean locator/i);
});

test('Unit #153 rejects unauthorized MDX or prior-evidence mutations and verifies receipts once reviewed', async () => {
  const preview = config.status === 'preview';
  const unit = selectDataQualityComparison(config, undefined, preview);
  const input = await loadInput();
  const mdxPath = 'content/docs/book/data-quality-and-probability.mdx';

  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set(mdxPath, Buffer.from(input.files.get(mdxPath).toString() + '\nUnauthorized trailing line.\n'));
  assert.throws(
    () => prepareDataQualityComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /candidate transition|protected B27 MDX/i,
  );

  const badEvCat = structuredClone(input.catalog);
  badEvCat.evidence.find(e => e.id === 'ev-unc-ciroth-scores').summary += ' tampered';
  const mutatedInput = { ...input, catalog: badEvCat };
  assert.throws(
    () => prepareDataQualityComparisonSource(unit, mutatedInput, inspectReadableBookEdition(mutatedInput), copyeditSourceStructure(mutatedInput)),
    /candidate transition|unauthorized field/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile, 'utf8'));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile, 'utf8'));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyDataQualityComparisonReceipts(unit, artifacts, downloads), true);
    const badUnit = structuredClone(unit);
    badUnit.reviewEvidence[0].date = '2020-01-01';
    assert.equal(verifyDataQualityComparisonReceipts(badUnit, artifacts, downloads), false);
  }
});
