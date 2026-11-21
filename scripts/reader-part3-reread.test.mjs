import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import part3Config from '../config/reader-part3-reread.json' with { type: 'json' };
import frConfig from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import wholeBookConfig from '../config/reader-whole-book-reread.json' with { type: 'json' };
import part1Config from '../config/reader-part1-reread.json' with { type: 'json' };
import fwConfig from '../config/reader-framework-comparison.json' with { type: 'json' };
import part2Config from '../config/reader-part2-reread.json' with { type: 'json' };
import hybConfig from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import numbering from '../config/reader-numbering.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShiftConfig from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConfig from '../config/reader-service-constraints.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookHistoryFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
import { restoreWholeBookRereadTestFiles } from './reader-whole-book-reread.mjs';
import { restorePart1RereadTestFiles } from './reader-part1-reread.mjs';
import { restoreFrameworkComparisonTestFiles } from './reader-framework-comparison.mjs';
import { restorePart2RereadTestFiles } from './reader-part2-reread.mjs';
import { restoreHybridInventoryComparisonTestFiles } from './reader-hybrid-inventory-comparison.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import {
  part3RereadCorrections,
  part3RereadId,
  part3RereadLayout,
  part3RereadPredecessorPin,
  part3RereadUnitPin,
  preparePart3RereadSource,
  projectPart3RereadNumbering,
  selectPart3Reread,
  verifyPart3RereadReceipts,
} from './reader-part3-reread.mjs';

const root = process.cwd();

test('selectPart3Reread verifies reviewed unit pin and rejects tampering', () => {
  const unit = selectPart3Reread(part3Config, part3RereadUnitPin, false);
  assert.equal(unit.id, part3RereadId);
  assert.throws(() => selectPart3Reread({ ...part3Config, unit: { ...unit, rationale: 'tampered' } }, part3RereadUnitPin, false));
  assert.equal(selectPart3Reread({ schemaVersion: 1, status: 'inactive', unit: null }, null, false), null);
});

test('preparePart3RereadSource recovers exact f6d1eca5 predecessor state and verifies receipts', async () => {
  const [files, shiftFiles, serviceFiles, catalog, readings, literature] = await Promise.all([
    readReadableBookHistoryFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShiftConfig.unit),
    readServiceConstraintsFiles(root, serviceConfig.unit),
    fs.readFile('knowledge/catalog.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/readings.json', 'utf8').then(JSON.parse),
    fs.readFile('knowledge/research/literature-map.json', 'utf8').then(JSON.parse),
  ]);
  for (const [p, b] of shiftFiles) files.set(p, b);
  for (const [p, b] of serviceFiles) files.set(p, b);
  restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(restorePart2RereadTestFiles(restoreFrameworkComparisonTestFiles(part1Config.unit ? restorePart1RereadTestFiles(wholeBookConfig.unit ? restoreWholeBookRereadTestFiles(files, wholeBookConfig.unit) : files, part1Config.unit) : files, fwConfig.unit), part2Config.unit), hybConfig.unit), frConfig.unit);
  const input = { ...previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(part1Config.unit ? previousScientificTestRecords(wholeBookConfig.unit ? previousScientificTestRecords({ catalog, readings, literature }, wholeBookConfig.unit) : { catalog, readings, literature }, part1Config.unit) : { catalog, readings, literature }, fwConfig.unit), part2Config.unit), hybConfig.unit), frConfig.unit), files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const unit = selectPart3Reread(part3Config, part3RereadUnitPin, false);
  const prepared = preparePart3RereadSource(unit, input, actual, structure);
  assert.equal(unit.state.before, part3RereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1106);

  const artifacts = new Map();
  for (const row of unit.reviewEvidence) {
    artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
    artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
  }
  assert.equal(verifyPart3RereadReceipts(unit, artifacts, readerPublicDownloads(input.catalog, input.literature, input.readings)), true);
});

test('projectPart3RereadNumbering, part3RereadLayout, and changes ledger behave reversibly', () => {
  const unit = selectPart3Reread(part3Config, part3RereadUnitPin, false);
  const projected = projectPart3RereadNumbering(unit, numbering);
  assert.equal(projected.parts[2].introduction, unit.partIntroduction.from);
  assert.equal(projectPart3RereadNumbering(null, numbering), numbering);

  const mock = { ordinary: [{ section: 'old', text: 'old', navigation: [] }] };
  const updated = part3RereadLayout(unit, 'B10:/docs/allocation:source', mock);
  assert.equal(updated.ordinary[0].navigation.length, 7);
  assert.equal(part3RereadLayout(null, 'B10:/docs/allocation:source', mock), mock);

  const ledger = buildPublicChangesLedger();
  assert(ledger.iterations.some(row => row.id === part3RereadId));
  assert(ledger.partIntroductions.some(row => row.part === 3 && row.unitId === part3RereadId));
  for (const corr of part3RereadCorrections) {
    assert(ledger.corrections.some(row => row.unitId === part3RereadId && row.claimId === corr.claimId));
  }
});
