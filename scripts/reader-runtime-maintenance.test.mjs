import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { inspectReadableBookEdition, sha256 } from './reader-current-edition.mjs';
import { readReadableBookFiles, readReadableBookHistoryFiles } from './reader-current-edition-files.mjs';

const currentManifestSha = '49fc65f45e5908fa0ad7d86c19cdf8266709d754af3754665f545c0af47b500a';
const historicalManifestSha = '6c45509459669d6cf9bb739b3fdce9c189c18ab836748ea6fe5ee0d86aec7d7d';

test('security maintenance preserves actual source bytes and only projects the exact manifest for editorial replay', async () => {
  const manifest = await readFile(new URL('../package.json', import.meta.url));
  assert.equal(sha256(manifest), currentManifestSha);
  const [catalog, readings, literature] = await Promise.all([
    readFile(new URL('../knowledge/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../knowledge/research/readings.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../knowledge/research/literature-map.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);
  const directory = await mkdtemp(join(tmpdir(), 'knowledge-runtime-maintenance-'));
  try {
    await mkdir(join(directory, 'content'));
    await mkdir(join(directory, 'knowledge/cases'), { recursive: true });
    // The raw loader also reads the current mutable publication files.
    const mutableFiles = [
      'config/book-edition.json', 'config/reader-numbering.json',
      'components/teaching-case-client.tsx', 'components/joint-production-case.tsx', 'app/global.css',
    ];
    for (const path of mutableFiles) {
      await mkdir(join(directory, path, '..'), { recursive: true });
      await writeFile(join(directory, path), await readFile(new URL(`../${path}`, import.meta.url)));
    }
    const variants = [
      [manifest, historicalManifestSha],
      [Buffer.from(manifest.toString().replace('"next": "16.4.6"', '"next": "16.4.7"')), null],
      [Buffer.from(manifest.toString().replace('"private": true', '"private": true, "extra": true')), null],
    ];
    for (const [bytes, expectedHistorySha] of variants) {
      await writeFile(join(directory, 'package.json'), bytes);
      const rawFiles = await readReadableBookFiles(directory, ['package.json']);
      const historyFiles = await readReadableBookHistoryFiles(directory, ['package.json']);
      assert.deepEqual(rawFiles.get('package.json'), bytes);
      const raw = inspectReadableBookEdition({ catalog, readings, literature, files: rawFiles });
      const historical = inspectReadableBookEdition({ catalog, readings, literature, files: historyFiles });
      assert.equal(raw.files['package.json'], sha256(bytes));
      assert.equal(historical.files['package.json'], expectedHistorySha ?? sha256(bytes));
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
