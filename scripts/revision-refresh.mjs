#!/usr/bin/env node
/**
 * Refresh publicArtifacts fingerprints for an existing post-checkpoint revision
 * without relying on an expected export failure.
 *
 * Usage:
 *   node scripts/revision-refresh.mjs <revId> [--css] [--skip-build] [--verify] [--repo <dir>]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editionDigest } from './reader-current-edition.mjs';
import {
  fingerprintReadableBookPublicArtifact,
  fingerprintReaderCss,
  readerCssArtifact,
} from './reader-current-output.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const defaultRepoRoot = resolve(__dirname, '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export const STANDARD_PUBLIC_ARTIFACTS = [
  'claims/index.html',
  'sources/index.html',
  'concepts/index.html',
  'coverage/index.html',
  'research/index.html',
  'downloads/catalog.json',
  'downloads/dependencies.json',
];

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export async function refreshRevisionArtifacts(revId, { repo = defaultRepoRoot, includeCss = false, targets = STANDARD_PUBLIC_ARTIFACTS } = {}) {
  const revDir = join(repo, 'config/revisions');
  const indexPath = join(revDir, 'index.json');
  const revIndex = JSON.parse(await readFile(indexPath, 'utf8'));
  const entry = revIndex.revisions.find(r => r.id === revId);
  if (!entry) throw new Error(`Revision ${revId} not found in config/revisions/index.json`);

  const revPath = join(revDir, entry.file);
  const rev = JSON.parse(await readFile(revPath, 'utf8'));

  const outDir = join(repo, 'out');
  const publicArtifacts = [];
  for (const rel of targets) {
    const full = join(outDir, rel);
    if (!(await fileExists(full))) continue;
    const bytes = await readFile(full);
    publicArtifacts.push({
      path: rel,
      sha256: fingerprintReadableBookPublicArtifact(rel, bytes),
    });
  }
  if (includeCss) {
    publicArtifacts.push({
      path: readerCssArtifact,
      sha256: await fingerprintReaderCss(outDir),
    });
  }

  rev.publicArtifacts = publicArtifacts;
  const revBytes = Buffer.from(JSON.stringify(rev, null, 2) + '\n', 'utf8');
  await writeFile(revPath, revBytes);
  entry.sha256 = sha256(revBytes);
  await writeFile(indexPath, JSON.stringify(revIndex, null, 2) + '\n');

  const newPin = editionDigest(revIndex);
  const cpPath = join(repo, 'scripts/reader-checkpoint.mjs');
  const cpSrc = await readFile(cpPath, 'utf8');
  const updatedCp = cpSrc.replace(
    /export const revisionsIndexPin = '[0-9a-f]{64}';/,
    `export const revisionsIndexPin = '${newPin}';`,
  );
  if (!updatedCp.includes(newPin)) throw new Error('Failed to update revisionsIndexPin');
  await writeFile(cpPath, updatedCp);

  return { revId, count: publicArtifacts.length, newPin };
}

async function main() {
  const args = process.argv.slice(2);
  let revId = null;
  let includeCss = false;
  let skipBuild = false;
  let verify = true;
  let repo = defaultRepoRoot;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--css') includeCss = true;
    else if (args[i] === '--skip-build') skipBuild = true;
    else if (args[i] === '--no-verify') verify = false;
    else if (args[i] === '--repo') repo = resolve(args[++i]);
    else if (!revId) revId = args[i];
  }

  if (!revId) {
    console.error('Usage: node scripts/revision-refresh.mjs <revId> [--css] [--skip-build] [--no-verify] [--repo <dir>]');
    process.exit(2);
  }

  if (!skipBuild) {
    execFileSync('pnpm', ['validate'], { cwd: repo, stdio: 'inherit' });
    execFileSync('pnpm', ['exec', 'next', 'build'], { cwd: repo, stdio: 'inherit' });
    // Materialize public downloads (catalog.json, dependencies.json, bibliography.json) into out/
    const { publicCatalog } = await import('./knowledge.mjs');
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    const catalog = JSON.parse(await readFile(join(repo, 'knowledge/catalog.json'), 'utf8'));
    const literature = JSON.parse(await readFile(join(repo, 'knowledge/research/literature-map.json'), 'utf8'));
    const readings = JSON.parse(await readFile(join(repo, 'knowledge/research/readings.json'), 'utf8'));
    const downloads = readerPublicDownloads(catalog, literature, readings, publicCatalog(catalog));
    const { mkdir } = await import('node:fs/promises');
    await mkdir(join(repo, 'out/downloads'), { recursive: true });
    for (const [rel, body] of downloads) {
      await writeFile(join(repo, 'out', rel), body);
    }
  }

  const res = await refreshRevisionArtifacts(revId, { repo, includeCss });
  console.log(`Refreshed ${res.count} publicArtifacts for ${res.revId}. New revisionsIndexPin: ${res.newPin}`);

  if (verify) {
    execFileSync('pnpm', ['build'], { cwd: repo, stdio: 'inherit' });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
