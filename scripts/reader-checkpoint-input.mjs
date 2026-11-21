import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const checkpointFixtureDir = join(scriptDir, 'fixtures', 'checkpoint-2026-11-21');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

let cachedSnapshot = null;

export function loadCheckpointSnapshotSync() {
  if (cachedSnapshot) return cachedSnapshot;
  const manifestRaw = readFileSync(join(checkpointFixtureDir, 'manifest.json'));
  const manifest = JSON.parse(manifestRaw.toString('utf8'));
  const gzBytes = readFileSync(join(checkpointFixtureDir, manifest.snapshotFile));
  if (sha256(gzBytes) !== manifest.snapshotSha256) {
    throw new Error('Checkpoint snapshot archive digest differs from manifest');
  }
  const encoded = JSON.parse(gunzipSync(gzBytes).toString('utf8'));
  const files = new Map();
  const manifestKeys = Object.keys(manifest.files).sort();
  const archiveKeys = Object.keys(encoded).sort();
  if (manifestKeys.length !== archiveKeys.length || manifestKeys.some((k, i) => k !== archiveKeys[i])) {
    throw new Error('Checkpoint snapshot file inventory differs from manifest');
  }
  for (const path of manifestKeys) {
    const bytes = Buffer.from(encoded[path], 'base64');
    if (sha256(bytes) !== manifest.files[path]) {
      throw new Error(`Checkpoint snapshot file digest differs from manifest: ${path}`);
    }
    files.set(path, bytes);
  }
  cachedSnapshot = { manifest, manifestSha256: sha256(manifestRaw), files };
  return cachedSnapshot;
}

export function checkpointInputSync() {
  const { files: rawFiles } = loadCheckpointSnapshotSync();
  const catalog = JSON.parse(rawFiles.get('knowledge/catalog.json').toString('utf8'));
  const readings = JSON.parse(rawFiles.get('knowledge/research/readings.json').toString('utf8'));
  const literature = JSON.parse(rawFiles.get('knowledge/research/literature-map.json').toString('utf8'));
  const files = new Map();
  for (const [path, bytes] of rawFiles) {
    if (path === 'knowledge/catalog.json' || path === 'knowledge/research/readings.json' || path === 'knowledge/research/literature-map.json') {
      continue;
    }
    if (path === 'package.json' && sha256(bytes) === '49fc65f45e5908fa0ad7d86c19cdf8266709d754af3754665f545c0af47b500a') {
      files.set(path, Buffer.from(bytes.toString('utf8').replace('"next": "16.4.6"', '"next": "16.4.4"')));
    } else {
      files.set(path, Buffer.from(bytes));
    }
  }
  return { catalog, readings, literature, files };
}

export async function loadCheckpointSnapshot() {
  return loadCheckpointSnapshotSync();
}

/** Returns fresh clones of the checkpoint catalog, readings, literature, and history-normalized files map. */
export async function checkpointInput() {
  return checkpointInputSync();
}

/** Materializes the checkpoint snapshot into a temporary directory alongside the repository's preserved historical configs and review evidence. */
export async function materializeCheckpoint(repoRoot) {
  const { manifest, files } = await loadCheckpointSnapshot();
  const tempRoot = await mkdtemp(join(tmpdir(), 'kb-checkpoint-'));
  try {
    // Write every snapshot file verbatim (rejecting path traversal)
    for (const [relPath, bytes] of files) {
      if (relPath.startsWith('/') || relPath.split('/').includes('..')) {
        throw new Error(`Invalid checkpoint snapshot path: ${relPath}`);
      }
      const target = join(tempRoot, relPath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
    }
    // Symlink preserved historical config files (skipping any file already materialized from snapshot)
    const configDir = join(repoRoot, 'config');
    await mkdir(join(tempRoot, 'config'), { recursive: true });
    for (const entry of await readdir(configDir, { withFileTypes: true })) {
      const rel = `config/${entry.name}`;
      if (files.has(rel)) continue;
      await symlink(join(configDir, entry.name), join(tempRoot, rel));
    }
    // Copy preserved editorial review evidence so regular-file realpath checks pass without symlink escape
    const evidenceSrc = join(repoRoot, '_docs', 'editorial', 'review-evidence');
    await mkdir(join(tempRoot, '_docs', 'editorial'), { recursive: true });
    await cp(evidenceSrc, join(tempRoot, '_docs', 'editorial', 'review-evidence'), { recursive: true });
    return {
      root: await realpath(tempRoot),
      manifest,
      cleanup: () => rm(tempRoot, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
  }
}
