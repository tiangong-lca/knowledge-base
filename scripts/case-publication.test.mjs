import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { publicTeachingCase, canonicalCaseInput, caseInputSha256, caseTemplateContext, materializeCaseClaims, validateCasePublication, validateCasePublications, loadCasePublications, caseEvaluationReceipt } from './case-publication.mjs';
import { validateRepository, validateTeachingCaseReferences } from './validate.mjs';

function fixture() {
  const spec = JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-v1.json', import.meta.url), 'utf8'));
  spec.characterization.factorEvidenceIds = ['factor-co2', 'factor-ch4'];
  spec.characterization.factorSubjects = ['CO2', 'CH4-fossil'];
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'wall-coating-v1.json', approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-04', reviewKind: 'agent-source-check', claims: [{
    id: 'case-claim', textTemplate: 'A={{smooth.display.alternatives.paintA.indicator}}; B={{smooth.display.alternatives.paintB.indicator}}; low={{smooth.low.comparison.difference}}; high={{rough.high.comparison.difference}}; CF={{input.characterization.factorVector.1}}; equivalent={{smooth.display.comparison.robustWithinTolerance}}.',
    kind: 'source-statement', scope: 'Hypothetical calculation only; factors from the stated source', evidenceIds: ['factor-co2', 'factor-ch4'], premiseIds: [], conceptIds: [], caveats: ['Not an empirical paint comparison.'],
  }] };
  const catalog = { schemaVersion: 1, sources: [{ id: spec.characterization.sourceId, title: 'Selected factors', url: 'https://example.org/factors', version: 'corrected table', publisher: 'Publisher', accessedAt: '2026-11-04', accessStatus: 'public-html-inspected', rights: 'Original metadata only', preservation: 'Mutable URL' }], evidence: spec.characterization.factorEvidenceIds.map((id, i) => ({ id, sourceId: spec.characterization.sourceId, locator: `selected row ${i}`, summary: 'Inspected selected central characterization factor', relation: 'supports', numericFact: { value: spec.characterization.factorVector[i], unit: spec.characterization.factorUnits[i], quantity: 'GWP100 characterization factor', subject: spec.characterization.factorSubjects[i], basis: 'Selected central GWP100 factor from corrected Table 7.15' } })), claims: structuredClone(materializeCaseClaims(spec, publication)), concepts: [], mappings: [], coverage: [] };
  return { spec, publication, catalog };
}
const errors = f => validateCasePublication(f.spec, f.publication, f.catalog);
function rejects(change, pattern) {
  const f = fixture(); change(f); const result = errors(f);
  assert(result.some(error => pattern.test(error)), `Expected ${pattern}; got:\n${result.join('\n')}`);
}
const writeJson = (root, file, data) => writeFile(join(root, file), `${JSON.stringify(data, null, 2)}\n`);
async function withRepository(run, includeCase = true) {
  const root = await mkdtemp(join(tmpdir(), 'prism-case-'));
  try {
    const f = fixture();
    await mkdir(join(root, 'knowledge/cases'), { recursive: true });
    await mkdir(join(root, 'content'));
    if (includeCase) {
      await writeJson(root, 'knowledge/cases/wall-coating-v1.json', f.spec);
      await writeJson(root, 'knowledge/cases/wall-coating-v1.publication.json', f.publication);
    } else f.catalog = { schemaVersion: 1, sources: [], evidence: [], claims: [], concepts: [], mappings: [], coverage: [] };
    await writeJson(root, 'knowledge/catalog.json', f.catalog);
    await run(root, f);
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('materialization uses exact point results and leaves canonical inputs unchanged', () => {
  const f = fixture(), before = JSON.stringify(f);
  const claims = materializeCaseClaims(f.spec, f.publication);
  assert.equal(claims[0].text, 'A=27.967; B=29.529; low=-0.438; high=19.124; CF=28.1; equivalent=true.');
  assert.deepEqual(claims[0].caseBinding, { caseId: f.spec.caseId, version: f.spec.version, inputSha256: f.publication.approvedInputSha256, inputFile: f.publication.inputFile });
  assert.equal(JSON.stringify(f), before);
  assert(Object.isFrozen(claims[0]));
  assert.deepEqual(errors(f), []);
});

test('canonical public bytes have a stable nested allowlist and exact SHA-256', () => {
  const f = fixture(), original = canonicalCaseInput(f.spec);
  for (const record of [f.spec, f.spec.service, f.spec.service.paintA, f.spec.technosphere, f.spec.environment, f.spec.characterization, f.spec.uncertainty, f.spec.comparison, f.spec.scenarios, f.spec.scenarios.smooth, f.spec.scenarios.rough.demands, f.spec.countercase]) record.privateCapture = { secret: 'PRIVATE bytes /private/path' };
  assert.equal(canonicalCaseInput(f.spec), original);
  assert(!original.includes('PRIVATE'));
  assert.equal(caseInputSha256(f.spec), createHash('sha256').update(original).digest('hex'));
  const output = publicTeachingCase(f.spec); output.service.assumptions.push('No aliasing');
  assert(!f.spec.service.assumptions.includes('No aliasing'));
  f.spec.technosphere.signConvention = { privateCapture: 'PRIVATE' };
  assert.throws(() => publicTeachingCase(f.spec), /public scalar/);
});

test('review hash fails closed on numeric inputs, assumptions, factors and declared comparison changes', () => {
  for (const change of [f => { f.spec.environment.matrix[0][0] = '2.01'; }, f => { f.spec.characterization.factorVector[1] = '28.2'; }, f => { f.spec.service.assumptions.push('New premise'); }, f => { f.spec.uncertainty.displayPoint = '0.4'; }, f => { f.spec.comparison.tolerance = '5'; }]) rejects(change, /stale or unapproved/);
});

test('canonical case claims fail on stale prose, metadata, review state and binding', () => {
  for (const change of [f => { f.catalog.claims[0].text += ' stale'; }, f => { f.catalog.claims[0].scope += ' new'; }, f => { f.catalog.claims[0].reviewedAt = '2026-11-03'; }, f => { f.catalog.claims[0].status = 'draft'; }, f => { f.catalog.claims[0].caseBinding.inputSha256 = '0'.repeat(64); }, f => { delete f.catalog.claims[0].caseBinding; }]) rejects(change, /stale text, metadata or caseBinding/);
  rejects(f => { f.catalog.claims[0].caseBinding.privateCapture = 'private'; }, /unknown caseBinding fields|caseBinding/);
  rejects(f => { f.catalog.claims = []; }, /missing canonical claim/);
});

test('source fact binding catches changed factor with newly approved hash but unchanged source evidence', () => {
  const f = fixture();
  f.spec.characterization.factorVector[1] = '29';
  f.publication.approvedInputSha256 = caseInputSha256(f.spec);
  f.catalog.claims = structuredClone(materializeCaseClaims(f.spec, f.publication));
  assert(errors(f).some(error => /factorVector.1.*numericFact/.test(error)));
  for (const field of ['value', 'unit', 'subject']) rejects(f => { f.catalog.evidence[1].numericFact[field] = 'wrong'; }, /numericFact/);
  rejects(f => { f.catalog.evidence[1].sourceId = 'missing'; }, /unknown source|numericFact/);
  rejects(f => { delete f.catalog.evidence[1].numericFact; }, /numericFact/);
});

test('missing, extra, unknown-version and orphan case bindings are rejected', () => {
  rejects(f => { f.catalog.claims.push({ ...f.catalog.claims[0], id: 'extra' }); }, /extra caseBinding/);
  const f = fixture(); f.catalog.claims[0].caseBinding.caseId = 'UNKNOWN';
  assert(validateCasePublications([{ spec: f.spec, publication: f.publication }], f.catalog).some(error => /Unknown caseBinding/.test(error)));
  assert(validateCasePublications([], fixture().catalog).some(error => /Unknown caseBinding/.test(error)));
  rejects(f => { f.publication.version = '2.0.0'; }, /caseId\/version/);
});

test('template tokens cannot evaluate expressions, access prototypes, interpolate objects or silently miss paths', () => {
  for (const token of ['smooth.display.alternatives.paintC.indicator', 'smooth.display.alternatives.paintA', 'input.uncertainty.probability', 'input.constructor', 'input.__proto__', 'smooth.display.theta + 1', 'smooth.display.theta()', 'smooth.display.theta[0]', ' smooth.display.theta ']) {
    const f = fixture(); f.publication.claims[0].textTemplate = `Value={{${token}}}`;
    assert.throws(() => materializeCaseClaims(f.spec, f.publication), /token/);
  }
  const f = fixture(); f.publication.claims[0].textTemplate = 'Value={{smooth.display.theta}';
  assert.throws(() => materializeCaseClaims(f.spec, f.publication), /malformed token/);
  assert.equal(caseTemplateContext(f.spec).smooth.display.sameMass.alternatives.paintA.serviceArea, '60');
});

test('publication review metadata cannot be implicitly authored per claim or omit a bound date', () => {
  for (const field of ['text', 'status', 'reviewedAt', 'reviewKind', 'caseBinding']) {
    const f = fixture(); f.publication.claims[0][field] = 'override';
    assert.throws(() => materializeCaseClaims(f.spec, f.publication), /derived, not authored/);
  }
  rejects(f => { f.publication.reviewedAt = '2026-02-30'; }, /valid review date/);
  rejects(f => { f.publication.reviewKind = 'not-reviewed'; }, /actual review/);
});

test('factor evidence cannot promote unread sources or escape the reviewed public closure', () => {
  rejects(f => { f.catalog.sources[0].accessStatus = 'metadata-only'; }, /not inspected/);
  rejects(f => { f.catalog.claims[0].evidenceIds = ['factor-co2']; }, /numericFact|stale/);
  const f = fixture();
  f.publication.claims[0].kind = 'interpretation';
  f.catalog.claims = structuredClone(materializeCaseClaims(f.spec, f.publication));
  f.catalog.evidence.forEach(evidence => { evidence.relation = 'context'; });
  f.catalog.sources[0].accessStatus = 'metadata-only';
  assert(errors(f).some(error => /not inspected for numeric factor use/.test(error)));
});

test('TeachingCase MDX requires literal, unique id/version and rejects malformed or unknown components', () => {
  const { spec } = fixture(), entries = [{ spec }];
  for (const text of ['<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />', "<TeachingCase version='1.0.0' id='CASE-WALL-CONNECT' />"]) assert.deepEqual(validateTeachingCaseReferences(text, entries), []);
  for (const text of ['<TeachingCase id={chosen} version="1.0.0" />', '<TeachingCase id="CASE-WALL-CONNECT" version={version} />', '<TeachingCase id="CASE-WALL-CONNECT" />', '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" id="other" />', '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" {...props} />', '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0">', '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0"', '<TeachingCase id="UNKNOWN" version="1.0.0" />', '<TeachingCase id="CASE-WALL-CONNECT" version="2.0.0" />']) assert(validateTeachingCaseReferences(text, entries).length > 0, text);
  assert.deepEqual(validateTeachingCaseReferences('```mdx\n<TeachingCase id="UNKNOWN" />\n```\n`<TeachingCase id="UNKNOWN" />`', entries), []);
});

test('repository validation discovers optional manifests and retains legacy fixtures without cases', async () => {
  await withRepository(async (root, f) => {
    assert.deepEqual(await validateRepository(root), []);
    await writeFile(join(root, 'content/test.mdx'), '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />');
    assert.deepEqual(await validateRepository(root), []);
    f.spec.comparison.tolerance = '5'; await writeJson(root, 'knowledge/cases/wall-coating-v1.json', f.spec);
    assert((await validateRepository(root)).some(error => /stale or unapproved/.test(error)));
  });
  await withRepository(async root => { assert.deepEqual(await validateRepository(root), []); }, false);
});

test('manifest discovery refuses traversal, wrong filenames and symbolic-link inputs', async () => {
  await withRepository(async (root, f) => {
    for (const inputFile of ['../catalog.json', '/private/source.json', 'wall-coating-v1.publication.json', 'other.json']) {
      f.publication.inputFile = inputFile; await writeJson(root, 'knowledge/cases/wall-coating-v1.publication.json', f.publication);
      await assert.rejects(loadCasePublications(root), /Unsafe or mismatched/);
    }
    f.publication.inputFile = 'wall-coating-v1.json'; await writeJson(root, 'knowledge/cases/wall-coating-v1.publication.json', f.publication);
    await rm(join(root, 'knowledge/cases/wall-coating-v1.json'));
    await symlink('../catalog.json', join(root, 'knowledge/cases/wall-coating-v1.json'));
    await assert.rejects(loadCasePublications(root), /regular file/);
  });
});

test('evaluated receipt exposes both scenarios at exact low/display/high points without templates or private captures', () => {
  const f = fixture(); f.spec.characterization.rawCapture = 'PRIVATE captured original';
  const receipt = caseEvaluationReceipt(f.spec, 'a'.repeat(40));
  assert.equal(receipt.inputSha256, caseInputSha256(f.spec));
  assert.equal(receipt.sourceCommit, 'a'.repeat(40));
  assert.equal(receipt.scientificApproval, false);
  for (const scenario of ['smooth', 'rough']) for (const [point, theta] of Object.entries({ low: '0.1', display: '0.3', high: '0.5' })) assert.equal(receipt.evaluations[scenario][point].theta, theta);
  assert(!JSON.stringify(receipt).includes('PRIVATE'));
  assert(!JSON.stringify(receipt).includes('textTemplate'));
});

test('export independently rejects stale joins and emits exact public input bytes plus hashed evaluated receipt', async () => {
  await withRepository(async (root, f) => {
    await mkdir(join(root, 'knowledge/research'));
    await writeJson(root, 'knowledge/research/literature-map.json', null);
    await writeJson(root, 'knowledge/research/readings.json', null);
    for (const route of ['', 'docs', 'sources', 'claims', 'concepts', 'coverage', 'changes', 'print', 'research']) {
      await mkdir(join(root, 'out', route), { recursive: true });
      await writeFile(join(root, 'out', route, 'index.html'), '<html>Fixture</html>');
    }
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.org', 'commit', '--allow-empty', '-qm', 'Fixture'], { cwd: root });
    const run = () => execFileSync(process.execPath, [fileURLToPath(new URL('./export.mjs', import.meta.url))], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    f.catalog.claims[0].text += ' stale'; await writeJson(root, 'knowledge/catalog.json', f.catalog);
    assert.throws(run, /stale text, metadata or caseBinding/);
    f.catalog.claims = structuredClone(materializeCaseClaims(f.spec, f.publication)); await writeJson(root, 'knowledge/catalog.json', f.catalog);
    f.spec.rawCapture = 'PRIVATE original'; f.spec.characterization.capture = { privatePath: '/private/source' }; await writeJson(root, 'knowledge/cases/wall-coating-v1.json', f.spec);
    const joint = jointFixture();
    joint.spec.privateCapture = { raw: 'PRIVATE joint original' };
    joint.spec.inventoryPerOperation.privateCapture = 'PRIVATE joint inventory';
    await writeJson(root, 'knowledge/cases/joint-batch-v1.json', joint.spec);
    await writeJson(root, 'knowledge/cases/joint-batch-v1.publication.json', joint.publication);
    const bothCatalogs = { schemaVersion: 1, ...Object.fromEntries(['sources', 'evidence', 'claims', 'concepts', 'mappings', 'coverage'].map(section => [section, [...f.catalog[section], ...joint.catalog[section]]])) };
    await writeJson(root, 'knowledge/catalog.json', bothCatalogs);
    run();
    const bytes = await readFile(join(root, 'out/downloads/cases/wall-coating-v1.json'), 'utf8');
    assert.equal(bytes, canonicalCaseInput(f.spec));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), f.publication.approvedInputSha256);
    const receipt = JSON.parse(await readFile(join(root, 'out/downloads/cases/wall-coating-v1.evaluated.json'), 'utf8'));
    assert.equal(receipt.inputSha256, f.publication.approvedInputSha256);
    const manifest = JSON.parse(await readFile(join(root, 'out/downloads/manifest.json'), 'utf8'));
    assert.equal(receipt.sourceCommit, manifest.sourceCommit);
    assert.equal(manifest.files['downloads/cases/wall-coating-v1.json'], f.publication.approvedInputSha256);
    assert(manifest.files['downloads/cases/wall-coating-v1.evaluated.json']);
    assert(!bytes.includes('PRIVATE'));
    assert(manifest.files['downloads/catalog.json']);
    const jointBytes = await readFile(join(root, 'out/downloads/cases/joint-batch-v1.json'), 'utf8');
    const jointReceipt = JSON.parse(await readFile(join(root, 'out/downloads/cases/joint-batch-v1.evaluated.json'), 'utf8'));
    assert.equal(jointBytes, canonicalCaseInput(joint.spec));
    assert.equal(manifest.files['downloads/cases/joint-batch-v1.json'], joint.publication.approvedInputSha256);
    assert.equal(jointReceipt.inputSha256, joint.publication.approvedInputSha256);
    assert.equal(jointReceipt.sourceCommit, manifest.sourceCommit);
    assert.equal(jointReceipt.evaluations.evaluated.scenarios.half.jointRoute[1], '163/5');
    assert(!jointBytes.includes('PRIVATE'));
    assert(!JSON.stringify(jointReceipt).includes('PRIVATE'));
  });
});


test('separately registered versions retain their own immutable input links and claims', () => {
  const f = fixture();
  const spec2 = structuredClone(f.spec); spec2.version = '1.1.0';
  const publication2 = structuredClone(f.publication);
  publication2.version = spec2.version; publication2.inputFile = 'wall-coating-v2.json';
  publication2.approvedInputSha256 = caseInputSha256(spec2);
  publication2.claims[0].id = 'case-claim-v2';
  f.catalog.claims.push(...structuredClone(materializeCaseClaims(spec2, publication2)));
  assert.deepEqual(validateCasePublications([{ spec: f.spec, publication: f.publication }, { spec: spec2, publication: publication2 }], f.catalog), []);
  assert.equal(f.catalog.claims[0].caseBinding.inputFile, 'wall-coating-v1.json');
  assert.equal(f.catalog.claims[1].caseBinding.inputFile, 'wall-coating-v2.json');
});

function jointFixture() {
  const spec = JSON.parse(readFileSync(new URL('../knowledge/cases/joint-batch-v1.json', import.meta.url), 'utf8'));
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'joint-batch-v1.json',
    approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-04', reviewKind: 'agent-source-check', claims: [{
      id: 'joint-calculation', kind: 'calculation', scope: 'Two-flow invented joint-batch illustration, not an empirical comparison',
      textTemplate: 'Mass={{evaluated.partitions.mass.shareX}}; sales={{evaluated.partitions.grossSales.XperKg.0}}; half={{evaluated.scenarios.half.jointRoute.0}},{{evaluated.scenarios.half.jointRoute.1}}; top-up={{evaluated.scenarios.half.contributions.topUp.0}}; waste={{evaluated.scenarios.half.contributions.waste.1}}; balanced={{evaluated.scenarios.half.balances.residualReconstructionMatches}}; wrongSum={{evaluated.doNotCombineSeparateResiduals.wrongSum.0}}.',
      premiseIds: ['joint-premise'], evidenceIds: [], evidenceLinks: [], conceptIds: [], mappingIds: [], caveats: ['All numerical inputs are invented.'],
      reasoning: 'Apply the declared accounting shares separately to each flow, then reconstruct positive routes before subtracting references.',
    }] };
  const catalog = { schemaVersion: 1, sources: [{ id: 'joint-context-source', title: 'Conceptual distinction only', url: 'https://example.org/context', version: 'Selected passage', publisher: 'Publisher', accessedAt: '2026-11-04', accessStatus: 'public-html-inspected', rights: 'Metadata only', preservation: 'Mutable URL' }],
    evidence: [{ id: 'joint-context-evidence', sourceId: 'joint-context-source', locator: 'selected conceptual passage', summary: 'Supports the stated conceptual distinction, not invented coefficients', relation: 'supports' }],
    claims: [{ id: 'joint-premise', kind: 'source-statement', text: 'The selected source distinguishes the conceptual questions.', scope: 'Selected conceptual passage',
      evidenceIds: ['joint-context-evidence'], premiseIds: [], conceptIds: [], mappingIds: [], caveats: [], status: 'reviewed', reviewedAt: '2026-11-04', reviewKind: 'agent-source-check' }], concepts: [], mappings: [], coverage: [] };
  catalog.claims.push(...structuredClone(materializeCaseClaims(spec, publication)));
  return { spec, publication, catalog };
}

test('the second model dispatches primitive templates and has no invented characterization-source requirement', () => {
  const f = jointFixture();
  assert.deepEqual(errors(f), []);
  assert(f.catalog.evidence.every(evidence => evidence.numericFact === undefined));
  assert.equal(f.catalog.claims[1].text, 'Mass=2/5; sales=5/3; half=41/2,163/5; top-up=9; waste=3/5; balanced=true; wrongSum=-18.');
  assert.deepEqual(f.catalog.claims[1].caseBinding, { caseId: 'CASE-JOINT-BATCH', version: '1.0.0', inputSha256: caseInputSha256(f.spec), inputFile: 'joint-batch-v1.json' });
  assert.equal(caseTemplateContext(f.spec).evaluated.scenarios.none.balances.YserviceSuppliedKg, '6');
});

test('joint input and evaluated output project every nested public shape without leaking raw metadata', () => {
  const f = jointFixture(), original = canonicalCaseInput(f.spec);
  for (const record of [f.spec, f.spec.activityBasis, f.spec.outputKgPerJointBatch, f.spec.inventoryPerOperation, f.spec.pricePerKgCU,
    f.spec.functionalDemandKg, f.spec.systemActivities, f.spec.systemActivities.reference, f.spec.systemActivities.jointRoute, f.spec.assessment]) record.privateCapture = { raw: 'PRIVATE /private/source' };
  assert.equal(canonicalCaseInput(f.spec), original);
  const context = caseTemplateContext(f.spec), receipt = caseEvaluationReceipt(f.spec, 'a'.repeat(40));
  assert(!JSON.stringify(context).includes('PRIVATE'));
  assert(!JSON.stringify(receipt).includes('PRIVATE'));
  assert.equal(receipt.inputSha256, caseInputSha256(f.spec));
  assert.equal(receipt.evaluations.evaluated.scenarios.half.Xresidual[0], '5/2');
  assert(Object.isFrozen(context.evaluated.scenarios.half));
  const output = publicTeachingCase(f.spec); output.premises.push('Public clone only');
  assert(!f.spec.premises.includes('Public clone only'));
  f.spec.assessment.interpretation = { hidden: 'PRIVATE' };
  assert.throws(() => publicTeachingCase(f.spec), /public scalar/);
});

test('joint coefficients, premise changes and stale calculated prose need explicit new review', () => {
  for (const change of [f => { f.spec.inventoryPerOperation.wasteY[0] = '1'; }, f => { f.spec.pricePerKgCU.X = '6'; }, f => { f.spec.premises.push('Different supplier response'); }]) {
    const f = jointFixture(); change(f);
    assert(errors(f).some(error => /stale or unapproved/.test(error)));
  }
  const f = jointFixture(); f.spec.inventoryPerOperation.wasteY[0] = '1'; f.publication.approvedInputSha256 = caseInputSha256(f.spec);
  assert(errors(f).some(error => /stale text, metadata or caseBinding/.test(error)));
  f.catalog.claims[1] = structuredClone(materializeCaseClaims(f.spec, f.publication)[0]);
  assert.deepEqual(errors(f), []);
  assert.match(f.catalog.claims[1].text, /half=22,163\/5/);
});

test('a closed case adapter cannot be selected by a model flag or suppress wall numeric fact checks', () => {
  for (const caseId of ['UNKNOWN', '__proto__', 'constructor']) {
    const f = jointFixture(); f.spec.caseId = caseId;
    assert.throws(() => publicTeachingCase(f.spec), /reviewed model adapter/);
  }
  const joint = jointFixture(); joint.spec.model = 'CASE-WALL-CONNECT';
  assert.throws(() => publicTeachingCase(joint.spec), /model/);
  const wall = fixture(); wall.spec.assessment = { kind: 'inventory-only', characterizationFactors: null };
  delete wall.catalog.evidence[1].numericFact;
  assert(errors(wall).some(error => /numericFact/.test(error)));
  assert.equal(caseInputSha256(JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-v1.json', import.meta.url), 'utf8'))), 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285');
});

test('wall and joint publications coexist with their own literal MDX identities and downloads', async () => {
  await withRepository(async (root, wall) => {
    const joint = jointFixture();
    const catalog = { schemaVersion: 1, ...Object.fromEntries(['sources', 'evidence', 'claims', 'concepts', 'mappings', 'coverage'].map(section => [section, [...wall.catalog[section], ...joint.catalog[section]]])) };
    await writeJson(root, 'knowledge/catalog.json', catalog);
    await writeJson(root, 'knowledge/cases/joint-batch-v1.json', joint.spec);
    await writeJson(root, 'knowledge/cases/joint-batch-v1.publication.json', joint.publication);
    await writeFile(join(root, 'content/test.mdx'), '<TeachingCase id="CASE-WALL-CONNECT" version="1.0.0" />\n<TeachingCase id="CASE-JOINT-BATCH" version="1.0.0" />');
    assert.deepEqual(await validateRepository(root), []);
    const entries = await loadCasePublications(root);
    assert.equal(entries.length, 2);
    assert.deepEqual(validateCasePublications(entries, catalog), []);
    for (const entry of entries) assert.equal(caseEvaluationReceipt(entry.spec, 'a'.repeat(40)).inputSha256, entry.publication.approvedInputSha256);
    joint.catalog.claims[1].caseBinding.inputFile = 'wall-coating-v1.json';
    assert(errors(joint).some(error => /stale text, metadata or caseBinding/.test(error)));
  });
});
