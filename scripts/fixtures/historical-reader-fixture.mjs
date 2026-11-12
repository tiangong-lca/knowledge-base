import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

const fixtureCommit = 'f650600e6303352252e8d6fad14607c2061a9f58';
const fixtureDir = dirname(fileURLToPath(import.meta.url));
const repo = join(fixtureDir, '..', '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const pinPath = 'scripts/reader-current-edition-pins.mjs';

async function loadArchive() {
  const [compressed, manifestBytes] = await Promise.all([
    readFile(join(fixtureDir, 'reader-f650600.json.gz')),
    readFile(join(fixtureDir, 'reader-f650600.manifest.json')),
  ]);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.sourceCommit, fixtureCommit);
  assert.equal(hash(compressed), manifest.archiveSha256);
  const snapshot = JSON.parse(gunzipSync(compressed));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.sourceCommit, fixtureCommit);
  assert.deepEqual(Object.keys(snapshot.files).sort(), Object.keys(manifest.files).sort());
  for (const [path, text] of Object.entries(snapshot.files)) {
    assert(/^(config|content|knowledge|components|public)\/[A-Za-z0-9._/-]+$/.test(path) || path === pinPath, path);
    assert(path.split('/').every(part => part && part !== '..' && part !== '.'), path);
    assert.equal(typeof text, 'string', path);
    assert.equal(hash(text), manifest.files[path], path);
  }
  const current = JSON.parse(snapshot.files['config/readable-book-current.json']);
  assert.equal(current.status, 'pending');
  assert.deepEqual(current.units, []);
  return snapshot.files;
}

async function write(root, path, bytes) {
  const file = join(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes, { flag: 'wx' });
}

async function copyCurrent(root, path) {
  const original = await readFile(join(repo, path));
  await write(root, path, original);
  assert.equal(hash(await readFile(join(root, path))), hash(original), `Current validator or dependency differs: ${path}`);
}

async function materialize(root) {
  const archived = await loadArchive();
  const configs = (await readdir(join(repo, 'config'), { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.json')).map(entry => `config/${entry.name}`);
  const scripts = (await readdir(join(repo, 'scripts'), { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.mjs') && !entry.name.endsWith('.test.mjs'))
    .map(entry => `scripts/${entry.name}`);
  const components = ['components/evidence.tsx', 'components/numbered-heading.tsx', 'components/chapter-content.tsx'];
  const current = [...configs, ...scripts, ...components, 'lib/teaching-case.ts'];
  // The only archived script is the independently selected old edition pin.
  // All validation code, including the expectation resolver, comes from the
  // current worktree and runs under the historical book data in this directory.
  assert.deepEqual(Object.keys(archived).filter(path => path.startsWith('scripts/')), [pinPath]);
  await Promise.all([
    ...current.filter(path => !Object.hasOwn(archived, path)).map(path => copyCurrent(root, path)),
    ...Object.entries(archived).map(([path, text]) => write(root, path, text)),
    symlink(join(repo, 'node_modules'), join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir'),
  ]);
}

export async function runHistoricalReaderFixture(testUrl) {
  const name = basename(fileURLToPath(testUrl));
  assert(/^reader-[a-z-]+\.test\.mjs$/.test(name), 'Expected a historical reader test entry');
  const originalSuite = await readFile(join(fixtureDir, 'f650600-tests', name.replace('.test.mjs', '.mjs')));
  const root = await mkdtemp(join(tmpdir(), 'reader-f650600-fixture-'));
  try {
    await materialize(root);
    const suitePath = `scripts/${name}`;
    await write(root, suitePath, originalSuite);
    // Import in this test worker so the original individual cases and failures
    // are still reported by node:test. No checkout or global module override.
    await import(pathToFileURL(join(root, suitePath)).href);
    after(() => rm(root, { recursive: true, force: true }));
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
