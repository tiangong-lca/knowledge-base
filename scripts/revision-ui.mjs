#!/usr/bin/env node
/**
 * Register a pure UI / layout revision (updating asset:reader-css and optional HTML artifacts)
 * without hand-authoring JSON.
 *
 * Usage:
 *   node scripts/revision-ui.mjs <revId> --task <org/repo#N> --title <title> --rationale <text> --routes <r1,r2> [--html <rel1,rel2>] [--skip-build] [--no-verify]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editionDigest } from './reader-current-edition.mjs';
import { assertNoInternalIds } from './revision-apply.mjs';
import { refreshRevisionArtifacts } from './revision-refresh.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const defaultRepoRoot = resolve(__dirname, '..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function createUiRevision({
  id,
  date,
  task,
  title,
  rationale,
  routes,
  htmlTargets = [],
  repo = defaultRepoRoot,
  skipBuild = false,
  verify = true,
}) {
  assertNoInternalIds('ui-revision.rationale', rationale);
  const readGitHead = relPath =>
    execFileSync('git', ['-C', repo, 'show', `HEAD:${relPath}`], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });

  const evRel = `_docs/editorial/review-evidence/${id}/review-record.json`;
  await mkdir(join(repo, `_docs/editorial/review-evidence/${id}`), { recursive: true });
  const evObj = {
    schemaVersion: 1,
    id,
    date,
    task,
    kind: 'ui-revision',
    summary: rationale,
    routes,
  };
  const evBytes = Buffer.from(JSON.stringify(evObj, null, 2) + '\n', 'utf8');
  await writeFile(join(repo, evRel), evBytes);

  const rev = {
    schemaVersion: 1,
    id,
    date,
    task,
    title,
    rationale,
    routes,
    claims: [],
    concepts: [],
    evidence: [],
    sources: [],
    mappings: [],
    files: [],
    outputs: [],
    publicArtifacts: [],
    corrections: [],
    reviewEvidence: [{ kind: 'ui-revision', date, file: evRel, sha256: sha256(evBytes) }],
  };

  const revFile = `${id}.json`;
  const revBytes = Buffer.from(JSON.stringify(rev, null, 2) + '\n', 'utf8');
  await writeFile(join(repo, 'config/revisions', revFile), revBytes);

  const revIndex = JSON.parse(readGitHead('config/revisions/index.json'));
  const existingIdx = revIndex.revisions.findIndex(r => r.id === id);
  const entry = { id, file: revFile, sha256: sha256(revBytes) };
  if (existingIdx >= 0) revIndex.revisions[existingIdx] = entry;
  else revIndex.revisions.push(entry);
  await writeFile(join(repo, 'config/revisions/index.json'), JSON.stringify(revIndex, null, 2) + '\n');

  const cpSrc = readGitHead('scripts/reader-checkpoint.mjs');
  const initPin = editionDigest(revIndex);
  await writeFile(
    join(repo, 'scripts/reader-checkpoint.mjs'),
    cpSrc.replace(/export const revisionsIndexPin = '[0-9a-f]{64}';/, `export const revisionsIndexPin = '${initPin}';`),
  );

  if (!skipBuild) {
    execFileSync('pnpm', ['validate'], { cwd: repo, stdio: 'inherit' });
    execFileSync('pnpm', ['exec', 'next', 'build'], { cwd: repo, stdio: 'inherit' });
  }

  const refreshed = await refreshRevisionArtifacts(id, {
    repo,
    includeCss: true,
    targets: htmlTargets,
  });

  if (verify) {
    execFileSync('pnpm', ['build'], { cwd: repo, stdio: 'inherit' });
  }

  return refreshed;
}

async function main() {
  const args = process.argv.slice(2);
  let id = null;
  let task = '';
  let title = '';
  let rationale = '';
  let routes = [];
  let htmlTargets = [];
  let date = new Date().toISOString().slice(0, 10);
  let skipBuild = false;
  let verify = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task') task = args[++i];
    else if (args[i] === '--title') title = args[++i];
    else if (args[i] === '--rationale') rationale = args[++i];
    else if (args[i] === '--routes') routes = args[++i].split(',').filter(Boolean);
    else if (args[i] === '--html') htmlTargets = args[++i].split(',').filter(Boolean);
    else if (args[i] === '--date') date = args[++i];
    else if (args[i] === '--skip-build') skipBuild = true;
    else if (args[i] === '--no-verify') verify = false;
    else if (!id) id = args[i];
  }

  if (!id || !task || !title || !rationale || !routes.length) {
    console.error('Usage: node scripts/revision-ui.mjs <revId> --task <t> --title <t> --rationale <r> --routes <r1,r2> [--html <h1,h2>] [--skip-build] [--no-verify]');
    process.exit(2);
  }

  const res = await createUiRevision({ id, date, task, title, rationale, routes, htmlTargets, skipBuild, verify });
  console.log(`Registered UI revision ${res.revId} (${res.count} publicArtifacts). New revisionsIndexPin: ${res.newPin}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
