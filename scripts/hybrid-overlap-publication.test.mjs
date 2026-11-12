import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { publicTeachingCase, canonicalCaseInput, caseInputSha256, caseTemplateContext,
  materializeCaseClaims, validateCasePublications, loadCasePublications, caseEvaluationReceipt } from './case-publication.mjs';
const read = file => JSON.parse(readFileSync(new URL(`../knowledge/cases/${file}`, import.meta.url), 'utf8'));
const hybridHash = '449be3b1eff749a1b10d55f9717fec06fd2ddbf4d86b623a9a64e6db5a09137e';
const wallHash = 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285';
function fixture() {
  const wall = read('wall-coating-v1.json'), hybrid = read('hybrid-overlap-v1.json');
  const publication = (spec, file, id, template) => ({ schemaVersion: 1, caseId: spec.caseId, version: spec.version,
    inputFile: file, approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{ id, textTemplate: template, kind: 'calculation', scope: 'Synthetic fixture arithmetic only',
      evidenceIds: [], evidenceLinks: [], premiseIds: ['fixture-premise'], conceptIds: [], mappingIds: [],
      caveats: ['No empirical validity is implied.'], reasoning: 'Apply the stipulated closed example exactly.' }] });
  const wallPublication = publication(wall, 'wall-coating-v1.json', 'fixture-wall-calculation', 'Paint={{input.service.paintA.requiredKg}}kg.'),
    hybridPublication = publication(hybrid, 'hybrid-overlap-v1.json', 'fixture-hybrid-calculation',
      'Direct={{evaluated.processOnly.totalCO2Kg.exact}}; naive={{evaluated.naive.totalCO2Kg.exact}}; corrected={{evaluated.identified.corrected.totalCO2Kg.exact}}; other={{evaluated.sameAggregateCounterworld.corrected.totalCO2Kg.exact}}.');
  const cf = wall.characterization;
  wallPublication.claims[0].evidenceIds = [...cf.factorEvidenceIds];
  delete wallPublication.claims[0].evidenceLinks;
  const catalog = { schemaVersion: 1,
    sources: [{ id: cf.sourceId, title: 'Fixture factor metadata', url: 'https://example.org/fixture-factors',
      version: 'Fixed fixture', publisher: 'Fixture', accessedAt: '2026-11-05', accessStatus: 'public-html-inspected',
      rights: 'Fixture metadata only', preservation: 'Fixture only' }],
    evidence: cf.factorEvidenceIds.map((id, i) => ({ id, sourceId: cf.sourceId, locator: `Fixture factor ${i}`,
      summary: 'Structural fixture for existing factor gate', relation: 'supports', numericFact: { value: cf.factorVector[i],
        unit: cf.factorUnits[i], quantity: 'Fixture factor', subject: cf.factorSubjects[i], basis: 'Fixture only' } })),
    claims: [{ id: 'fixture-premise', text: 'The numerical example is conditional.', kind: 'source-statement', scope: 'Fixture only',
      evidenceIds: [cf.factorEvidenceIds[0]], premiseIds: [], conceptIds: [], mappingIds: [], caveats: [],
      status: 'reviewed', reviewedAt: '2026-11-05', reviewKind: 'agent-source-check' }],
    concepts: [], mappings: [], coverage: [] };
  const entries = [{ spec: wall, inputFile: wallPublication.inputFile, publication: wallPublication },
    { spec: hybrid, inputFile: hybridPublication.inputFile, publication: hybridPublication }];
  for (const entry of entries) catalog.claims.push(...structuredClone(materializeCaseClaims(entry.spec, entry.publication)));
  return { entries, catalog, wall: entries[0], hybrid: entries[1] };
}
const errors = f => validateCasePublications(f.entries, f.catalog);
const parentError = f => errors(f).some(error => /hybrid overlap parent:/.test(error));
const writeJson = (root, path, value) => writeFile(join(root, path), JSON.stringify(value, null, 2) + '\n');
async function withRepository(run) {
  const root = await mkdtemp(join(tmpdir(), 'prism-hybrid-parent-'));
  try {
    const f = fixture();
    await mkdir(join(root, 'knowledge/cases'), { recursive: true });
    await mkdir(join(root, 'content'));
    await writeJson(root, 'knowledge/catalog.json', f.catalog);
    for (const e of f.entries) {
      await writeJson(root, `knowledge/cases/${e.inputFile}`, e.spec);
      await writeJson(root, `knowledge/cases/${e.inputFile.replace('.json', '.publication.json')}`, e.publication);
    }
    await run(root, f);
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('hybrid registry binds exact computed prose, canonical downloadable bytes and immutable evaluated receipt', () => {
  const f = fixture(), bytes = canonicalCaseInput(f.hybrid.spec);
  assert.deepEqual(errors(f), []);
  assert.equal(caseInputSha256(f.hybrid.spec), hybridHash);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hybridHash);
  assert.equal(caseInputSha256(f.wall.spec), wallHash);
  assert.equal(f.catalog.claims.at(-1).text, 'Direct=8; naive=784/73; corrected=784/75; other=404/37.');
  const receipt = caseEvaluationReceipt(f.hybrid.spec, 'a'.repeat(40));
  assert.equal(receipt.inputSha256, hybridHash); assert.equal(receipt.scientificApproval, false);
  assert.equal(receipt.evaluations.evaluated.identified.corrected.totalCO2Kg.exact, '784/75');
  assert.equal(receipt.evaluations.evaluated.ambiguity.rawAggregatesExactlyEqual, true);
  assert(Object.isFrozen(caseTemplateContext(f.hybrid.spec).evaluated.identified.corrected));
});

test('registered parent is required and must be unique across input and manifest identity declarations', () => {
  for (const change of [
    f => { f.entries = [f.hybrid]; },
    f => { f.entries.push(structuredClone(f.wall)); },
    f => { f.entries.push({ ...structuredClone(f.wall), inputFile: 'wall-copy.json' }); },
    f => { f.wall.spec.caseId = 'OTHER'; },
    f => { f.wall.publication.caseId = 'OTHER'; },
    f => { f.wall.spec.version = '2.0.0'; f.wall.publication.version = '2.0.0'; },
    f => { f.wall.publication.version = '2.0.0'; },
    f => { delete f.wall.publication; },
    f => { delete f.wall.spec; },
  ]) { const f = fixture(); change(f); assert(parentError(f), change.toString()); }
  // An unrelated wall version is not the missing fixed parent, and cannot act
  // as its substitute even when the child repeats a convincing cached hash.
  const f = fixture(); f.entries = [f.hybrid];
  f.hybrid.spec.parentValidated = true; f.hybrid.spec.cachedParentSha256 = wallHash;
  f.hybrid.spec.validateParent = false; f.hybrid.spec.parent = read('wall-coating-v1.json');
  assert(parentError(f));
});

test('parent filename and approved/canonical hashes fail closed, including reapproved parent changes outside copied service fields', () => {
  for (const change of [
    f => { f.wall.inputFile = 'wall-copy.json'; },
    f => { delete f.wall.inputFile; },
    f => { f.wall.publication.inputFile = 'wall-copy.json'; },
    f => { f.wall.publication.approvedInputSha256 = '0'.repeat(64); },
    f => { f.wall.spec.environment.matrix[0][0] = '2.01'; },
    f => {
      f.wall.spec.environment.matrix[0][0] = '2.01';
      f.wall.publication.approvedInputSha256 = caseInputSha256(f.wall.spec);
      const i = f.catalog.claims.findIndex(c => c.id === 'fixture-wall-calculation');
      f.catalog.claims[i] = structuredClone(materializeCaseClaims(f.wall.spec, f.wall.publication)[0]);
    },
    f => { f.wall.spec.service.areaUnit = 'ft2'; },
    f => { f.wall.spec.service.paintA.treatmentTimesYears = ['0']; },
    f => { f.wall.spec.technosphere.matrix[3][0] = '-3'; },
  ]) { const f = fixture(); change(f); assert(parentError(f), change.toString()); }
});

test('hybrid nested projection drops unknown metadata throughout arrays and preserves safe public scalar and closed model checks', () => {
  const f = fixture(), bytes = canonicalCaseInput(f.hybrid.spec), clean = structuredClone(f.hybrid.spec);
  const decorate = value => {
    if (value === null || typeof value !== 'object') return;
    for (const item of Object.values(value)) decorate(item);
    value.privateCapture = { raw: 'PRIVATE /private/source.pdf' };
  };
  decorate(f.hybrid.spec);
  decorate(f.wall.spec);
  assert.equal(canonicalCaseInput(f.hybrid.spec), bytes);
  assert.equal(caseInputSha256(f.hybrid.spec), hybridHash);
  assert.equal(caseInputSha256(f.wall.spec), wallHash);
  assert.deepEqual(publicTeachingCase(f.hybrid.spec), clean);
  assert.deepEqual(errors(f), []);
  assert(!bytes.includes('PRIVATE'));
  assert(!JSON.stringify(caseEvaluationReceipt(f.hybrid.spec, 'a'.repeat(40))).includes('PRIVATE'));
  const projected = publicTeachingCase(f.hybrid.spec);
  projected.transactions.identified.annualCU[0][2] = '0';
  assert.equal(f.hybrid.spec.transactions.identified.annualCU[0][2], '10');
  for (const change of [
    s => { s.annualBasis.priceBasis = { privateCapture: 'PRIVATE' }; },
    s => { s.transactions.identified.annualCU[0][2] = { raw: 'PRIVATE' }; },
    s => { s.transactions.identified.annualCU[0].push('0'); },
    s => { s.linkedService.inputSha256 = '0'.repeat(64); },
    s => { s.interpretation.empiricalCalibration = true; },
    s => { s.controls.finalDemand[0] = '10'; },
  ]) { const s = read('hybrid-overlap-v1.json'); change(s); assert.throws(() => publicTeachingCase(s), /public scalar|Invalid teaching case/); }
});

test('the seven previous cases retain their reviewed canonical hashes and ordinary registry evaluations', () => {
  const expected = {
    'historical-glass-v1.json': '56e6028764e85278fa73143d2321ab20b4ad8cd8d64ff9a75e2c871fb7448d7c',
    'joint-batch-v1.json': '569797a9cc454583cd9397a468145f24b22f57fd9e5a8c98971138e779b3c773',
    'market-response-v1.json': 'a58663c4648adee29c1c8236907d436ad42304ff3728aae8d3c133ba23e6a81e',
    'pedigree-calibration-v1.json': 'bdba93d860cdc3083a03b8a6f2bdac48a443edabbd6b5678af7ed829b61648ab',
    'phosphorus-boundary-v1.json': '05f1d0fe71ee5a1461e64987fb0cbc40cba7b0d96145ee9cc8017b647343dc39',
    'wall-coating-v1.json': wallHash,
    'water-locality-v1.json': '5217aa07949fc4b5990f1129aa428958e60ef01713f7198da4a286ab66b7bca9',
  };
  for (const [name, hash] of Object.entries(expected)) {
    const spec = read(name), bytes = canonicalCaseInput(spec);
    assert.equal(caseInputSha256(spec), hash, name);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
    assert.equal(caseEvaluationReceipt(spec, 'a'.repeat(40)).inputSha256, hash);
  }
});

test('repository discovery binds the real parent and exporter refuses missing-parent input before writing output', async () => {
  const { validateRepositoryFixture } = await import('./validate.mjs');
  await withRepository(async (root, f) => {
    const entries = await loadCasePublications(root);
    assert.deepEqual(validateCasePublications(entries, f.catalog), []);
    assert.deepEqual(await validateRepositoryFixture(root), []);
    await rm(join(root, 'knowledge/cases/wall-coating-v1.publication.json'));
    assert((await validateRepositoryFixture(root)).some(error => /hybrid overlap parent:/.test(error)));
    // Export runs the same entry-based gate independently; refusal occurs before
    // source Git inspection or creation of downloadable output. No Git fixture.
    await mkdir(join(root, 'knowledge/research'));
    await writeJson(root, 'knowledge/research/literature-map.json', null);
    await writeJson(root, 'knowledge/research/readings.json', null);
    assert.throws(() => execFileSync(process.execPath, [fileURLToPath(new URL('./export.mjs', import.meta.url))],
      { cwd: root, encoding: 'utf8', stdio: 'pipe' }), /hybrid overlap parent:/);
    await assert.rejects(import('node:fs/promises').then(fs => fs.stat(join(root, 'out'))), { code: 'ENOENT' });
  });
});
