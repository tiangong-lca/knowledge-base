import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import part2Config from '../config/reader-part2-reread.json' with { type: 'json' };
import fwConfig from '../config/reader-framework-comparison.json' with { type: 'json' };
import numbering from '../config/reader-numbering.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShiftConfig from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConfig from '../config/reader-service-constraints.json' with { type: 'json' };
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import { restoreFrameworkComparisonTestFiles } from './reader-framework-comparison.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import {
  part2RereadCorrections,
  part2RereadId,
  part2RereadPredecessorPin,
  part2RereadUnitPin,
  preparePart2RereadSource,
  projectPart2RereadNumbering,
  selectPart2Reread,
  verifyPart2RereadReceipts,
} from './reader-part2-reread.mjs';

const root = process.cwd();

test('selectPart2Reread verifies reviewed unit pin and fails closed on tampering or null pin', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart2Reread(part2Config, part2RereadUnitPin, preview);
  if (!unit) return;
  assert.equal(unit.id, part2RereadId);
  assert.throws(() => selectPart2Reread({ ...part2Config, status: 'reviewed', unit: { ...unit, rationale: 'tampered' } }, part2RereadUnitPin, false));
  assert.throws(() => selectPart2Reread({ schemaVersion: 1, status: 'reviewed', unit }, null, false));
  assert.throws(() => selectPart2Reread({ schemaVersion: 1, status: 'reviewed', unit }, 'not-a-sha256', false));
  assert.throws(() => selectPart2Reread({ schemaVersion: 1, status: 'preview', unit: { ...unit, rawFields: ['text'] } }, null, true));
  assert.equal(selectPart2Reread({ schemaVersion: 1, status: 'inactive', unit: null }, null, false), null);
});

test('preparePart2RereadSource recovers exact 3034503f predecessor state and verifies receipts when reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart2Reread(part2Config, part2RereadUnitPin, preview);
  if (!unit) return;
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
  const rolled = fwConfig.unit ? previousScientificTestRecords({ catalog, readings, literature }, fwConfig.unit) : { catalog, readings, literature };
  const input = { ...rolled, files: fwConfig.unit ? restoreFrameworkComparisonTestFiles(files, fwConfig.unit) : files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = preparePart2RereadSource(unit, input, actual, structure);
  assert.equal(unit.state.before, part2RereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1118);

  if (part2Config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    assert.equal(verifyPart2RereadReceipts(unit, artifacts, readerPublicDownloads(input.catalog, input.literature, input.readings)), true);
  }
});

test('projectPart2RereadNumbering and changes ledger behave reversibly', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart2Reread(part2Config, part2RereadUnitPin, preview);
  if (!unit) return;
  const projected = projectPart2RereadNumbering(unit, numbering);
  assert.equal(projected.parts[1].introduction, unit.partIntroduction.from);
  assert.equal(projectPart2RereadNumbering(null, numbering), numbering);

  const ledger = buildPublicChangesLedger();
  assert(ledger.iterations.some(row => row.id === part2RereadId));
  assert(ledger.partIntroductions.some(row => row.part === 2 && row.unitId === part2RereadId));
  for (const corr of part2RereadCorrections) {
    assert(ledger.corrections.some(row => row.unitId === part2RereadId && row.claimId === corr.claimId));
  }
});
