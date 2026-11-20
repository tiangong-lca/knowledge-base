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
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-wall-service-comparison.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  prepareWallServiceComparisonSource,
  selectWallServiceComparison,
  verifyWallServiceComparisonReceipts,
  wallServiceComparisonPredecessorPin,
} from './reader-wall-service-comparison.mjs';
import { validateWallServiceComparisonFactors } from './reader-wall-service-comparison-factors.mjs';

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
  const prev157 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part7.unit), rev.unit), fut.unit), intBags.unit);
  return { ...prev157, files };
}

test('Unit #157 B29 wall service comparison prepares cleanly and recovers exact 8d498f48 predecessor pin with 1080 claims and 0 case edits', async () => {
  const preview = config.status === 'preview';
  const unit = selectWallServiceComparison(config, undefined, preview);
  assert(unit);
  const input = await loadInput();
  assert.equal(input.catalog.claims.length, 1080);
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareWallServiceComparisonSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), wallServiceComparisonPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1074);
});

test('Unit #157 selectWallServiceComparison fails closed on preview without flag, forged pin, inactive downgrade, duplicate scope, and invalid envelope keys', () => {
  if (config.status === 'preview') {
    assert.throws(() => selectWallServiceComparison(config, null, false), /not independently accepted/i);
    assert.throws(() => selectWallServiceComparison(config, '0'.repeat(64), true), /not independently accepted/i);
  }
  assert.throws(() => selectWallServiceComparison({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /null pin/i);
  assert.throws(() => selectWallServiceComparison({ ...config, status: 'reviewed' }, 'f'.repeat(64), false), /pin mismatch|malformed properties/i);
  assert.throws(() => selectWallServiceComparison({ ...config, status: 'reviewed' }, null, false), /pin mismatch|malformed properties/i);
  const dupScope = structuredClone(config);
  dupScope.unit.scope.push(dupScope.unit.scope[0]);
  assert.throws(
    () => selectWallServiceComparison(dupScope, config.status === 'reviewed' ? editionDigest(dupScope.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
  const extraKey = structuredClone(config);
  extraKey.unit.unexpectedField = true;
  assert.throws(
    () => selectWallServiceComparison(extraKey, config.status === 'reviewed' ? editionDigest(extraKey.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
});

test('Unit #157 factor & numeric-fact guard validates 11 BigInt rationals and rejects tampering or unclean locators', async () => {
  const input = await loadInput();
  validateWallServiceComparisonFactors(input.catalog, input.readings);

  const badNumCat = structuredClone(input.catalog);
  const ev = badNumCat.evidence.find(e => e.id === 'ev-wsc157-pef-pefcr-classes-verification');
  ev.numericFacts.find(f => f.id === 'nf-wsc157-pef-class-coeff-inner').value = '0.86';
  assert.throws(() => validateWallServiceComparisonFactors(badNumCat, input.readings), /Numeric fact mismatch/i);

  const badLocCat = structuredClone(input.catalog);
  badLocCat.evidence.find(e => e.id === 'ev-wsc157-ghgp-comparison-uncertainty').locator = 'Ch. 10 §10.3.4 p. 82';
  assert.throws(() => validateWallServiceComparisonFactors(badLocCat, input.readings), /Unclean locator/i);
});

test('Unit #157 rejects unauthorized MDX edits and verifies receipts once reviewed', async () => {
  const preview = config.status === 'preview';
  const unit = selectWallServiceComparison(config, undefined, preview);
  const input = await loadInput();
  const mdxPath = 'content/docs/book/wall-service-to-comparison.mdx';

  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set(mdxPath, Buffer.from(input.files.get(mdxPath).toString() + '\nUnauthorized trailing line.\n'));
  assert.throws(
    () => prepareWallServiceComparisonSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /candidate transition/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyWallServiceComparisonReceipts(unit, artifacts, downloads), true);
  }
});
