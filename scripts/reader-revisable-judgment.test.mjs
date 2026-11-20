import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restorePart7RereadTestFiles } from './reader-part7-reread.mjs';
import { previousScientificTestRecords } from './fixtures/scientific-receipt-envelope.mjs';
import config from '../config/reader-revisable-judgment.json' with { type: 'json' };
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  prepareRevisableJudgmentSource,
  revisableJudgmentPredecessorPin,
  revisableJudgmentUnitPin,
  selectRevisableJudgment,
  verifyRevisableJudgmentReceipts,
} from './reader-revisable-judgment.mjs';

const readJson = async p => JSON.parse(await fs.readFile(p, 'utf8'));

async function currentInput() {
  const [catalog, readings, literature, files, shiftFiles, serviceFiles] = await Promise.all([
    readJson('knowledge/catalog.json'),
    readJson('knowledge/research/readings.json'),
    readJson('knowledge/research/literature-map.json'),
    readReadableBookFiles('.', baseline.fixedFiles),
    readLoadShiftCaseFiles('.', loadShift.unit),
    readServiceConstraintsFiles('.', service.unit),
  ]);
  for (const [p, b] of [...shiftFiles, ...serviceFiles]) files.set(p, b);
  restorePart7RereadTestFiles(files, part7.unit);
  const prev163 = previousScientificTestRecords({ catalog, readings, literature }, part7.unit);
  return { ...prev163, files };
}

test('Unit #163 B32 + W1/W2 synthesis prepares cleanly and recovers exact cb2584d4 predecessor pin with 1099 claims and exact W1 U W2 = B32 parity', async () => {
  const unit = selectRevisableJudgment(config, revisableJudgmentUnitPin, config.status === 'preview');
  assert(unit, 'Expected active revisable judgment unit');
  const input = await currentInput();
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const prepared = prepareRevisableJudgmentSource(unit, input, actual, structure);
  assert.equal(editionDigest({ ...prepared.previous, structure: prepared.structure }), revisableJudgmentPredecessorPin);
  assert.equal(input.catalog.claims.length, 1099);
  assert.equal(prepared.previousRecords.catalog.claims.length, 1092);
});

test('Unit #163 selectRevisableJudgment fails closed on preview without flag, forged pin, inactive downgrade, and invalid envelope keys', () => {
  assert.throws(
    () => selectRevisableJudgment({ schemaVersion: 1, status: 'preview', unit: config.unit }, null, false),
    /not independently accepted/,
  );
  assert.throws(
    () => selectRevisableJudgment({ schemaVersion: 1, status: 'reviewed', unit: config.unit }, '0'.repeat(64), false),
    /pin does not match/,
  );
  assert.throws(
    () => selectRevisableJudgment({ schemaVersion: 1, status: 'inactive', unit: null }, 'a'.repeat(64), false),
    /cannot be downgraded/,
  );
  assert.throws(
    () => selectRevisableJudgment({ schemaVersion: 1, status: 'preview', unit: { ...config.unit, extraKey: true } }, null, true),
    /invalid or extra keys|cannot carry reviewEvidence/,
  );
});

test('Unit #163 rejects W1/W2/B32 parity tampering and unauthorized MDX edits', async () => {
  const unit = selectRevisableJudgment(config, revisableJudgmentUnitPin, config.status === 'preview');
  const input = await currentInput();
  const tamperedFiles = new Map(input.files);
  tamperedFiles.set('content/docs/book/connecting-objects-references-and-time.mdx', Buffer.from(
    tamperedFiles.get('content/docs/book/connecting-objects-references-and-time.mdx').toString().replace('cl-rev163-lcia-pathway-and-packet-drift', ''),
  ));
  const tamperedInput = { ...input, files: tamperedFiles };
  const actual = inspectReadableBookEdition(tamperedInput);
  const structure = copyeditSourceStructure(tamperedInput);
  assert.throws(
    () => prepareRevisableJudgmentSource(unit, tamperedInput, actual, structure),
    /lacks its exact candidate transition|requires exact 10\/19\/29/,
  );
});

test('Unit #163 verifies receipts once reviewed', async () => {
  if (config.status !== 'reviewed') return;
  const input = await currentInput();
  const artifacts = new Map();
  for (const row of config.unit.reviewEvidence) {
    artifacts.set(row.artifactFile, await fs.readFile(row.artifactFile, 'utf8'));
    artifacts.set(row.reportFile, await fs.readFile(row.reportFile, 'utf8'));
  }
  const downloads = readerPublicDownloads(input.catalog, input.literature, input.readings);
  assert.equal(verifyRevisableJudgmentReceipts(config.unit, artifacts, downloads), true);
});

test('Unit #163 rendered closing-synthesis guard rejects forged history attribute, non-TR thead children, and stray tbody text', async () => {
  const { default: { parse } } = await import('next/dist/compiled/node-html-parser/index.js');
  const { validateRenderedClosingSynthesis } = await import('./reader-closing-synthesis.mjs');
  const prose = await readJson('config/closing-synthesis-prose-accepted.json');
  const input = await currentInput();
  const makeDoc = extra => parse(
    `<article data-reader-route="/docs/book/from-connected-results-to-conditional-judgment"><h1>判断依据与修订</h1><p>desc</p>${extra}</article>`,
  );
  const forgedHistErrors = validateRenderedClosingSynthesis(
    makeDoc('<div data-revisable-judgment-history="forged">UNAUTHORIZED</div>'),
    '/docs/book/from-connected-results-to-conditional-judgment',
    input.catalog,
    prose,
  );
  assert(forgedHistErrors.some(e => e.includes('unexpected unreviewed text')), `Expected unreviewed text error, got: ${forgedHistErrors}`);
  const extraTheadErrors = validateRenderedClosingSynthesis(
    makeDoc('<table><thead><tr><th>A</th><th>B</th></tr><div>INJECTED</div></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'),
    '/docs/book/from-connected-results-to-conditional-judgment',
    input.catalog,
    prose,
  );
  assert(extraTheadErrors.some(e => e.includes('ordinary paragraphs differ')), `Expected table structure error, got: ${extraTheadErrors}`);
  const strayTbodyErrors = validateRenderedClosingSynthesis(
    makeDoc('<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody>STRAY<tr><td>1</td><td>2</td></tr></tbody></table>'),
    '/docs/book/from-connected-results-to-conditional-judgment',
    input.catalog,
    prose,
  );
  assert(strayTbodyErrors.some(e => e.includes('ordinary paragraphs differ')), `Expected stray tbody text error, got: ${strayTbodyErrors}`);
});
