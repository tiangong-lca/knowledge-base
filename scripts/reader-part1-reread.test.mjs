import { checkpointInput } from './reader-checkpoint-input.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import part1Config from '../config/reader-part1-reread.json' with { type: 'json' };
import wholeBookConfig from '../config/reader-whole-book-reread.json' with { type: 'json' };
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import { restoreWholeBookRereadTestFiles } from './reader-whole-book-reread.mjs';
import numbering from '../config/reader-numbering.json' with { type: 'json' };
import { currentRevisions } from './reader-checkpoint.mjs';
import { projectRevisionNumbering } from './reader-revisions.mjs';
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShiftConfig from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConfig from '../config/reader-service-constraints.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookHistoryFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import {
  part1RereadCorrections,
  part1RereadId,
  part1RereadPredecessorPin,
  part1RereadUnitPin,
  preparePart1RereadSource,
  projectPart1RereadNumbering,
  selectPart1Reread,
  verifyPart1RereadReceipts,
} from './reader-part1-reread.mjs';

const root = process.cwd();

test('selectPart1Reread verifies reviewed unit pin and fails closed on tampering, malformed/null pin, or rawFields', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart1Reread(part1Config, part1RereadUnitPin, preview);
  if (!unit) return;
  assert.equal(unit.id, part1RereadId);
  assert.throws(() => selectPart1Reread({ ...part1Config, status: 'reviewed', unit: { ...unit, rationale: 'tampered' } }, editionDigest(unit), false));
  assert.throws(() => selectPart1Reread({ schemaVersion: 1, status: 'reviewed', unit }, null, false));
  assert.throws(() => selectPart1Reread({ schemaVersion: 1, status: 'reviewed', unit }, 'not-a-sha256', false));
  assert.throws(() => selectPart1Reread({ schemaVersion: 1, status: 'preview', unit: { ...unit, rawFields: ['text'] } }, null, true));
  assert.equal(selectPart1Reread({ schemaVersion: 1, status: 'inactive', unit: null }, null, false), null);
});

test('preparePart1RereadSource recovers exact 50e045f0 predecessor state and verifies receipts when reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart1Reread(part1Config, part1RereadUnitPin, preview);
  if (!unit) return;
  const [files, shiftFiles, serviceFiles, catalog, readings, literature] = await Promise.all([
    checkpointInput().then(x => x.files),
    readLoadShiftCaseFiles(root, loadShiftConfig.unit),
    readServiceConstraintsFiles(root, serviceConfig.unit),
    checkpointInput().then(x => x.catalog),
    checkpointInput().then(x => x.readings),
    checkpointInput().then(x => x.literature),
  ]);
  for (const [p, b] of shiftFiles) files.set(p, b);
  for (const [p, b] of serviceFiles) files.set(p, b);
  const rolled = wholeBookConfig.unit ? previousScientificTestRecords({ catalog, readings, literature }, wholeBookConfig.unit) : { catalog, readings, literature };
  const input = { ...rolled, files: wholeBookConfig.unit ? restoreWholeBookRereadTestFiles(files, wholeBookConfig.unit) : files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = preparePart1RereadSource(unit, input, actual, structure);
  assert.equal(unit.state.before, part1RereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1124);

  if (part1Config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    assert.equal(verifyPart1RereadReceipts(unit, artifacts, readerPublicDownloads(input.catalog, input.literature, input.readings)), true);
  }
});

test('projectPart1RereadNumbering and changes ledger behave reversibly', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectPart1Reread(part1Config, part1RereadUnitPin, preview);
  if (!unit) return;
  const checkpointNumbering = projectRevisionNumbering(currentRevisions, numbering);
  const projected = projectPart1RereadNumbering(unit, checkpointNumbering);
  assert.equal(projected.parts[0].introduction, unit.partIntroduction.from);
  assert.equal(projectPart1RereadNumbering(null, checkpointNumbering), checkpointNumbering);

  const ledger = buildPublicChangesLedger();
  assert(ledger.iterations.some(row => row.id === part1RereadId));
  assert(ledger.partIntroductions.some(row => row.part === 1 && row.unitId === part1RereadId));
  for (const corr of part1RereadCorrections) {
    assert(ledger.corrections.some(row => row.unitId === part1RereadId && row.claimId === corr.claimId));
  }
});
