import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadShiftChapter, loadShiftEvaluationFile, readLoadShiftCaseFiles,
  restoreLoadShiftFiles, selectLoadShift } from './reader-load-shift.mjs';
import { sha256 } from './reader-current-edition.mjs';
import { currentRevisions } from './reader-checkpoint.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publication = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));

function rollbackPostCheckpointFile(path, bytes) {
  let current = bytes;
  for (let i = currentRevisions.length - 1; i >= 0; i--) {
    for (const fileRow of currentRevisions[i].files ?? []) {
      if (fileRow.path === path && (fileRow.op ?? 'modify') === 'modify') {
        assert.equal(sha256(current), fileRow.toSha256);
        current = Buffer.from(fileRow.previous, 'utf8');
        assert.equal(sha256(current), fileRow.fromSha256);
      }
    }
  }
  return current;
}

test('load shift result links qualify only the fixed versioned input', () => {
  const binding = { caseId: 'CASE-FINITE-LOAD-SHIFT', version: '1.0.0', inputFile: 'finite-load-shift-v1.json' };
  assert.equal(loadShiftEvaluationFile(binding), 'finite-load-shift-v1.evaluated.json');
  assert.equal(loadShiftEvaluationFile({ ...binding, version: '1.0.1' }), null);
  assert.equal(loadShiftEvaluationFile({ ...binding, caseId: 'CASE-POWER' }), null);
  assert.equal(loadShiftEvaluationFile({ ...binding, inputFile: 'electricity-service-v1.json' }), null);
  assert.equal(selectLoadShift({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);
});

test('rollback restores actual old files and does not waive a changed original registry', async t => {
  const config = await publication('config/reader-load-shift.json');
  if (!config.unit) return t.skip('Applies when the actual scientific plan exists');
  const mdx = `content${loadShiftChapter}.mdx`, registry = 'scripts/case-publication.mjs';
  const files = await readLoadShiftCaseFiles(root, config.unit);
  files.set(registry, rollbackPostCheckpointFile(registry, await readFile(new URL('../' + registry, import.meta.url))));
  files.set(mdx, rollbackPostCheckpointFile(mdx, await readFile(new URL('../' + mdx, import.meta.url))));
  const previous = restoreLoadShiftFiles(files, config.unit.previousMdx);
  for (const [key] of await readLoadShiftCaseFiles(root, config.unit)) assert(!previous.has(key));
  assert.equal(sha256(previous.get(registry)), config.unit.changes.find(row => row.key === registry).from);
  assert.equal(sha256(previous.get(mdx)), config.unit.changes.find(row => row.key === mdx).from);
  assert(files.has('scripts/finite-load-shift-case.mjs'));

  const wrongOld = config.unit.previousMdx.replace('eGRID2023', 'Version changed');
  assert.throws(() => restoreLoadShiftFiles(files, wrongOld), /exact preserved predecessor MDX/);
  const registryTamper = new Map(files);
  registryTamper.set(registry, Buffer.from(files.get(registry).toString().replace('CASE-SERVICE-CONSTRAINTS', 'CASE-SERVICE-OTHER')));
  assert.throws(() => restoreLoadShiftFiles(registryTamper, config.unit.previousMdx), /changed unrelated case registry/);
  const lostCase = new Map(files);
  lostCase.delete('knowledge/cases/finite-load-shift-v1.json');
  assert.throws(() => restoreLoadShiftFiles(lostCase, config.unit.previousMdx), /lacks discovered raw case/);
});
