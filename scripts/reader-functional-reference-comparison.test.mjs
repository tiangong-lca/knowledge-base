import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import frConfig from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShiftConfig from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConfig from '../config/reader-service-constraints.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import {
  functionalReferenceComparisonId,
  functionalReferenceComparisonLayout,
  functionalReferenceComparisonPredecessorPin,
  functionalReferenceComparisonUnitPin,
  prepareFunctionalReferenceComparisonSource,
  selectFunctionalReferenceComparison,
  validateFunctionalReferenceFactors,
  verifyFunctionalReferenceComparisonReceipts,
} from './reader-functional-reference-comparison.mjs';

const root = process.cwd();

test('selectFunctionalReferenceComparison verifies reviewed unit pin and rejects tampering', () => {
  const unit = selectFunctionalReferenceComparison(frConfig, functionalReferenceComparisonUnitPin, false);
  assert.equal(unit.id, functionalReferenceComparisonId);
  assert.throws(() => selectFunctionalReferenceComparison({ ...frConfig, unit: { ...unit, rationale: 'tampered' } }, functionalReferenceComparisonUnitPin, false));
  assert.equal(selectFunctionalReferenceComparison({ schemaVersion: 1, status: 'inactive', unit: null }, null, false), null);
});

test('prepareFunctionalReferenceComparisonSource recovers exact d4a7e98f predecessor state and verifies receipts', async () => {
  const [files, shiftFiles, serviceFiles, catalog, readings, literature] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShiftConfig.unit),
    readServiceConstraintsFiles(root, serviceConfig.unit),
    fs.readFile('knowledge/catalog.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/readings.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/literature-map.json', 'utf8').then(JSON.parse),
  ]);
  for (const [p, b] of shiftFiles) files.set(p, b);
  for (const [p, b] of serviceFiles) files.set(p, b);
  const input = { catalog, readings, literature, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const unit = selectFunctionalReferenceComparison(frConfig, functionalReferenceComparisonUnitPin, false);
  const prepared = prepareFunctionalReferenceComparisonSource(unit, input, actual, structure);
  assert.equal(unit.state.before, functionalReferenceComparisonPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1106);

  validateFunctionalReferenceFactors(catalog, readings);
  const badCat = structuredClone(catalog);
  badCat.evidence.find(x => x.id === 'ev-fr173-pef-fu').numericFacts[0].value = '99';
  assert.throws(() => validateFunctionalReferenceFactors(badCat, readings), /numeric fact mismatch/);

  const artifacts = new Map();
  for (const row of unit.reviewEvidence) {
    artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
    artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
  }
  assert.equal(verifyFunctionalReferenceComparisonReceipts(unit, artifacts, readerPublicDownloads(catalog, literature, readings)), true);
});

test('functionalReferenceComparisonLayout and changes ledger behave reversibly', () => {
  const unit = selectFunctionalReferenceComparison(frConfig, functionalReferenceComparisonUnitPin, false);
  const mock = [{ id: 'cl-book-comparison-more', section: '比较条件' }, { id: 'cl-book-three-comparisons', section: '比较条件' }];
  const expanded = functionalReferenceComparisonLayout(unit, 'B06:occurrences', mock);
  assert.equal(expanded.length, 8);
  assert.equal(expanded[1].id, 'cl-book-three-comparisons');
  assert.equal(expanded[2].id, 'cl-fr173-shared-core');
  assert.equal(functionalReferenceComparisonLayout(null, 'B06:occurrences', mock), mock);

  const ledger = buildPublicChangesLedger();
  assert(ledger.iterations.some(row => row.id === functionalReferenceComparisonId));
});
