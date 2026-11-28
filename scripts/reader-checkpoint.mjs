import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition, validReadableBookReviewFile } from './reader-current-edition.mjs';
import { readableBookBaselineDigest } from './reader-current-edition-pins.mjs';
import { readLoadShiftCaseFiles, selectLoadShift } from './reader-load-shift.mjs';
import { applyRevisionsInverse, applyRevisionsToPlan, extractClaimRetirements, extractRouteChanges, loadRevisions, loadRevisionsSyncFromDisk } from './reader-revisions.mjs';
import { readServiceConstraintsFiles, selectServiceConstraints } from './reader-service-constraints.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export const readableBookCheckpointPin = 'ff2c17673a141aa1b87e2520af8cec9a885998830438a087fe2e10173558251e';
export const revisionsIndexPin = '89d6244683cf6730c2b6f731f579b0a86cf5fe6e0f6ea54cf6525e673ed0e836';

export function selectCheckpoint(config = checkpointConfig, pin = readableBookCheckpointPin) {
  if (!config || config.schemaVersion !== 1 || editionDigest(config) !== pin) {
    throw new Error('Readable book checkpoint differs from its independently pinned digest');
  }
  return config;
}

export function effectivePlanDigestOf(plan) {
  return editionDigest({
    recordChanges: [...plan.changes.record.entries()].sort(([a], [b]) => a.localeCompare(b)),
    fileChanges: [...plan.changes.file.entries()].sort(([a], [b]) => a.localeCompare(b)),
    migrations: plan.migrations,
    readingEntries: plan.readingEntries,
    outputs: plan.outputs,
    publicArtifacts: plan.publicArtifacts,
  });
}

function loadRevisionsSync(root = repoRoot, index = revisionsIndex, pin = revisionsIndexPin) {
  const revisions = loadRevisionsSyncFromDisk(root, index, pin);
  return { revisions, retirements: extractClaimRetirements(revisions) };
}

const checkpointConfigPath = join(repoRoot, 'config', 'readable-book-checkpoint.json');
const revisionsIndexPath = join(repoRoot, 'config', 'revisions', 'index.json');
const checkpointConfig = existsSync(checkpointConfigPath) ? JSON.parse(readFileSync(checkpointConfigPath, 'utf8')) : null;
const revisionsIndex = existsSync(revisionsIndexPath) ? JSON.parse(readFileSync(revisionsIndexPath, 'utf8')) : null;

export const currentCheckpoint = checkpointConfig ? selectCheckpoint(checkpointConfig) : null;
const loadedSync = revisionsIndex ? loadRevisionsSync(repoRoot, revisionsIndex, revisionsIndexPin) : { revisions: [], retirements: [] };
export const currentRevisions = loadedSync.revisions;
export const currentRetirements = loadedSync.retirements;
export const currentRouteChanges = extractRouteChanges(currentRevisions);

export async function qualifyCheckpointSources(root, catalog, readings, literature, readHistoryFiles) {
  const readJson = async rel => JSON.parse(await readFile(join(root, rel), 'utf8'));
  const checkpoint = selectCheckpoint(await readJson('config/readable-book-checkpoint.json'));
  const baseline = await readJson('config/readable-book-baseline.json');
  if (editionDigest(baseline) !== readableBookBaselineDigest) {
    throw new Error('Readable book integration baseline differs');
  }

  // Verify checkpoint review evidence files exist and match declared sha256
  const realRoot = await realpath(root);
  for (const ev of checkpoint.reviewEvidence ?? []) {
    if (!validReadableBookReviewFile(ev.file)) {
      throw new Error(`Invalid checkpoint review evidence path: ${ev.file}`);
    }
    const full = resolve(realRoot, ev.file);
    if (!(await lstat(full)).isFile() || await realpath(full) !== full) {
      throw new Error(`Checkpoint review evidence must be a regular file: ${ev.file}`);
    }
    if (sha256(await readFile(full)) !== ev.sha256) {
      throw new Error(`Checkpoint review evidence digest mismatch: ${ev.file}`);
    }
  }

  // Load and verify post-checkpoint revisions
  const index = await readJson('config/revisions/index.json');
  const revisions = await loadRevisions(root, index, revisionsIndexPin);

  // Read HEAD source files matching the exact checkpoint inspection universe
  const files = await readHistoryFiles(root, baseline.fixedFiles);
  const loadShift = selectLoadShift(await readJson('config/reader-load-shift.json'));
  const serviceConstraints = selectServiceConstraints(await readJson('config/reader-service-constraints.json'));
  for (const [path, bytes] of await readLoadShiftCaseFiles(root, loadShift)) files.set(path, bytes);
  for (const [path, bytes] of await readServiceConstraintsFiles(root, serviceConstraints)) files.set(path, bytes);

  const currentInput = { catalog, readings, literature, files };
  const { previousInput, retirements } = await applyRevisionsInverse(currentInput, revisions, root);

  const recoveredActual = inspectReadableBookEdition(previousInput);
  const recoveredStructure = copyeditSourceStructure(previousInput);
  const recoveredDigest = editionDigest({ ...recoveredActual, structure: recoveredStructure });
  if (recoveredDigest !== checkpoint.stateDigest) {
    throw new Error('Checkpoint source state differs from reviewed checkpoint');
  }

  const { baseCheckpointPlan } = await import('./reader-current-expectations.mjs');
  if (effectivePlanDigestOf(baseCheckpointPlan) !== checkpoint.effectivePlanDigest) {
    throw new Error('Static checkpoint effective plan differs from pinned effectivePlanDigest');
  }
  const effectivePlan = applyRevisionsToPlan(baseCheckpointPlan, revisions, currentInput, previousInput);

  return {
    ...effectivePlan,
    errors: [],
    owners: new Map(),
    checkpoint,
    revisions,
    retirements,
  };
}
