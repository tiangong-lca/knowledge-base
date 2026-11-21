import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPublicChangesLedger } from './reader-changes-ledger.mjs';
import { effectivePlanDigestOf, selectCheckpoint } from './reader-checkpoint.mjs';
import { checkpointInput, loadCheckpointSnapshot, materializeCheckpoint } from './reader-checkpoint-input.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { qualifyHistoricalReaderSources } from './reader-current-edition-files.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function verifyCheckpointHistory(root = repoRoot) {
  const checkpoint = selectCheckpoint(
    JSON.parse(await readFile(join(root, 'config/readable-book-checkpoint.json'), 'utf8')),
  );
  const { manifest, manifestSha256, files } = await loadCheckpointSnapshot();
  if (manifestSha256 !== checkpoint.snapshotManifestSha256) {
    throw new Error('Checkpoint snapshot manifest digest differs from readable-book-checkpoint.json');
  }
  if (manifest.checkpointCommit !== checkpoint.checkpointCommit) {
    throw new Error('Checkpoint snapshot commit differs from readable-book-checkpoint.json');
  }

  // Isolate git commit presence check so any git show failure on a present commit fails loudly
  let hasCheckpointCommit = false;
  try {
    execFileSync('git', ['-C', root, 'cat-file', '-e', `${checkpoint.checkpointCommit}^{commit}`], { stdio: 'ignore' });
    hasCheckpointCommit = true;
  } catch {
    hasCheckpointCommit = false;
  }

  let gitVerified = false;
  if (hasCheckpointCommit) {
    for (const [relPath, bytes] of files) {
      const gitBytes = execFileSync('git', ['-C', root, 'show', `${checkpoint.checkpointCommit}:${relPath}`], {
        maxBuffer: 50 * 1024 * 1024,
      });
      if (sha256(gitBytes) !== sha256(bytes)) {
        throw new Error(`Checkpoint snapshot differs from git commit ${checkpoint.checkpointCommit} at ${relPath}`);
      }
    }
    gitVerified = true;
  }

  // Directly assert the snapshot's own state digest equals checkpoint.stateDigest
  const snapInput = await checkpointInput();
  const snapDigest = editionDigest({
    ...inspectReadableBookEdition(snapInput),
    structure: copyeditSourceStructure(snapInput),
  });
  if (snapDigest !== checkpoint.stateDigest) {
    throw new Error(`Checkpoint snapshot state digest ${snapDigest} differs from checkpoint ${checkpoint.stateDigest}`);
  }

  // Materialize checkpoint and replay the entire 41-unit historical rollback chain
  const materialized = await materializeCheckpoint(root);
  try {
    const catalog = JSON.parse(files.get('knowledge/catalog.json').toString('utf8'));
    const readings = JSON.parse(files.get('knowledge/research/readings.json').toString('utf8'));
    const literature = JSON.parse(files.get('knowledge/research/literature-map.json').toString('utf8'));

    const historical = await qualifyHistoricalReaderSources(materialized.root, catalog, readings, literature);
    if (historical.errors?.length) {
      throw new Error(`Historical rollback chain reported errors: ${historical.errors.join('; ')}`);
    }
    const planDigest = effectivePlanDigestOf(historical);
    if (planDigest !== checkpoint.effectivePlanDigest) {
      throw new Error(`Historical effective plan digest ${planDigest} differs from checkpoint ${checkpoint.effectivePlanDigest}`);
    }

    // Verify historical /changes/ ledger using the checkpoint's own reader-numbering.json
    const checkpointNumbering = JSON.parse(files.get('config/reader-numbering.json').toString('utf8'));
    const ledger = buildPublicChangesLedger(checkpointNumbering);
    const historicalLedgerDigest = editionDigest({
      iterations: ledger.iterations,
      corrections: ledger.corrections.filter(c => !ledger.revisions?.some(r => r.id === c.unitId)),
      partIntroductions: ledger.partIntroductions,
    });
    if (historicalLedgerDigest !== checkpoint.changesLedgerDigest) {
      throw new Error('Historical /changes/ ledger digest differs from checkpoint');
    }

    return {
      checkpointId: checkpoint.id,
      checkpointCommit: checkpoint.checkpointCommit,
      stateDigest: snapDigest,
      effectivePlanDigest: planDigest,
      historicalUnits: checkpoint.historicalUnits.length,
      snapshotFiles: files.size,
      gitVerified,
    };
  } finally {
    await materialized.cleanup();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyCheckpointHistory(repoRoot);
  console.log(`Checkpoint history verified: ${result.checkpointId} (${result.historicalUnits} historical units, ${result.snapshotFiles} snapshot files, gitVerified=${result.gitVerified}).`);
}
