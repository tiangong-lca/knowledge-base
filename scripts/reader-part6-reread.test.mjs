import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import config from '../config/reader-part6-reread.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  part6RereadCorrections,
  part6RereadPredecessorPin,
  preparePart6RereadSource,
  selectPart6Reread,
  verifyPart6RereadReceipts,
} from './reader-part6-reread.mjs';

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
  return { catalog, readings, literature, files };
}

test('Unit #155 Part VI continuous reread prepares cleanly and recovers exact b1c911ee predecessor pin with 1074 claims and 0 case edits', async () => {
  const preview = config.status === 'preview';
  const unit = selectPart6Reread(config, undefined, preview);
  assert(unit);
  const input = await loadInput();
  assert.equal(input.catalog.claims.length, 1074);
  assert.equal(part6RereadCorrections.length, 10);
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = preparePart6RereadSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), part6RereadPredecessorPin);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1074);
});

test('Unit #155 selectPart6Reread fails closed on preview without flag, forged pin, inactive downgrade, duplicate scope, and invalid envelope keys', () => {
  if (config.status === 'preview') {
    assert.throws(() => selectPart6Reread(config, null, false), /not independently accepted/i);
    assert.throws(() => selectPart6Reread(config, '0'.repeat(64), true), /not independently accepted/i);
  }
  assert.throws(() => selectPart6Reread({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false), /null pin/i);
  assert.throws(() => selectPart6Reread({ ...config, status: 'reviewed' }, 'f'.repeat(64), false), /pin mismatch|malformed properties/i);
  assert.throws(() => selectPart6Reread({ ...config, status: 'reviewed' }, null, false), /pin mismatch|malformed properties/i);
  const dupScope = structuredClone(config);
  dupScope.unit.scope.push(dupScope.unit.scope[0]);
  assert.throws(
    () => selectPart6Reread(dupScope, config.status === 'reviewed' ? editionDigest(dupScope.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
  const extraKey = structuredClone(config);
  extraKey.unit.unexpectedField = true;
  assert.throws(
    () => selectPart6Reread(extraKey, config.status === 'reviewed' ? editionDigest(extraKey.unit) : null, config.status === 'preview'),
    /malformed properties/i,
  );
});

test('Unit #155 rejects forward premise re-introduction, unauthorized MDX edits, and verifies receipts once reviewed', async () => {
  const preview = config.status === 'preview';
  const unit = selectPart6Reread(config, undefined, preview);
  const input = await loadInput();

  const badPremCat = structuredClone(input.catalog);
  badPremCat.claims.find(c => c.id === 'cl-book-unc-bridge').premiseIds.push('cl-ped-estimate-boundary');
  const badPremInput = { ...input, catalog: badPremCat };
  assert.throws(
    () => preparePart6RereadSource(unit, badPremInput, inspectReadableBookEdition(badPremInput), copyeditSourceStructure(badPremInput)),
    /forward\/self premise|candidate transition/i,
  );

  const mdxPath = 'content/docs/book/uncertainty-and-variability.mdx';
  const badMdxInput = { ...input, files: new Map(input.files) };
  badMdxInput.files.set(mdxPath, Buffer.from(input.files.get(mdxPath).toString() + '\nUnauthorized line.\n'));
  assert.throws(
    () => preparePart6RereadSource(unit, badMdxInput, inspectReadableBookEdition(badMdxInput), copyeditSourceStructure(badMdxInput)),
    /candidate transition|outside bounded/i,
  );

  if (config.status === 'reviewed') {
    const artifacts = new Map();
    for (const row of unit.reviewEvidence) {
      artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile));
      artifacts.set(row.reportFile, await fs.readFile(row.reportFile));
    }
    const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
    assert.equal(verifyPart6RereadReceipts(unit, artifacts, downloads), true);
  }
});
