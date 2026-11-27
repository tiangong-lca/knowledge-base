import { checkpointInput } from './reader-checkpoint-input.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import wholeBookConfig from '../config/reader-whole-book-reread.json' with { type: 'json' };
import numbering from '../config/reader-numbering.json' with { type: 'json' };
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
import { currentRevisions } from './reader-checkpoint.mjs';
import { projectRevisionNumbering } from './reader-revisions.mjs';
import {
  wholeBookRereadCorrections,
  wholeBookRereadId,
  wholeBookRereadPredecessorPin,
  wholeBookRereadUnitPin,
  prepareWholeBookRereadSource,
  projectWholeBookRereadNumbering,
  selectWholeBookReread,
  verifyWholeBookRereadReceipts,
} from './reader-whole-book-reread.mjs';

const root = process.cwd();

test('selectWholeBookReread verifies reviewed unit pin and fails closed on tampering, malformed/null pin, or rawFields', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectWholeBookReread(wholeBookConfig, wholeBookRereadUnitPin, preview);
  if (!unit) return;
  assert.equal(unit.id, wholeBookRereadId);
  assert.throws(() => selectWholeBookReread({ ...wholeBookConfig, status: 'reviewed', unit: { ...unit, rationale: 'tampered' } }, editionDigest(unit), false));
  assert.throws(() => selectWholeBookReread({ schemaVersion: 1, status: 'reviewed', unit }, null, false));
  assert.throws(() => selectWholeBookReread({ schemaVersion: 1, status: 'reviewed', unit }, 'not-a-sha256', false));
  assert.throws(() => selectWholeBookReread({ schemaVersion: 1, status: 'preview', unit: { ...unit, rawFields: ['text'] } }, null, true));
  assert.equal(selectWholeBookReread({ schemaVersion: 1, status: 'inactive', unit: null }, null, false), null);
});

test('prepareWholeBookRereadSource recovers exact 4b9c3958 predecessor state and verifies receipts when reviewed', async () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectWholeBookReread(wholeBookConfig, wholeBookRereadUnitPin, preview);
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
  const input = { catalog, readings, literature, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareWholeBookRereadSource(unit, input, actual, structure);
  assert.equal(unit.state.before, wholeBookRereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1124);

  if (wholeBookConfig.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    assert.equal(verifyWholeBookRereadReceipts(unit, artifacts, readerPublicDownloads(catalog, literature, readings)), true);
  }
});

test('projectWholeBookRereadNumbering and changes ledger behave reversibly', () => {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  const unit = selectWholeBookReread(wholeBookConfig, wholeBookRereadUnitPin, preview);
  if (!unit) return;
  const checkpointNumbering = projectRevisionNumbering(currentRevisions, numbering);
  const projected = projectWholeBookRereadNumbering(unit, checkpointNumbering);
  assert.equal(projected.parts[3].introduction, unit.partIntroduction.from);
  assert.equal(wholeBookRereadCorrections.length, 7);
  const ledger = buildPublicChangesLedger();
  assert(ledger.iterations.some(row => row.id === wholeBookRereadId), 'Whole-book reread should appear in /changes/ iterations');
  assert(ledger.partIntroductions.some(row => row.part === 4 && row.unitId === wholeBookRereadId), 'Part 4 reread intro should appear in /changes/ partIntroductions');
  assert(ledger.corrections.some(row => row.unitId === wholeBookRereadId && row.claimId === 'cl-fw179-impact-weighting'));
});
