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
const errors = f => validateCasePublication(f.spec, f.publication, f.catalog, { readingRegister: f.readingRegister });
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
    const impacts = ['water-locality', 'phosphorus-boundary'].map(impactFixture);
    for (const impact of impacts) {
      impact.spec.privateCapture = 'PRIVATE impact original';
      await writeJson(root, `knowledge/cases/${impact.publication.inputFile}`, impact.spec);
      await writeJson(root, `knowledge/cases/${impact.publication.inputFile.replace('.json', '.publication.json')}`, impact.publication);
    }
    const bothCatalogs = { schemaVersion: 1, ...Object.fromEntries(['sources', 'evidence', 'claims', 'concepts', 'mappings', 'coverage'].map(section => [section, [...f.catalog[section], ...joint.catalog[section], ...impacts.flatMap(impact => impact.catalog[section])]])) };
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
    for (const impact of impacts) {
      const file = impact.publication.inputFile;
      const inputBytes = await readFile(join(root, 'out/downloads/cases', file), 'utf8');
      const evaluatedFile = file.replace('.json', '.evaluated.json');
      const evaluated = JSON.parse(await readFile(join(root, 'out/downloads/cases', evaluatedFile), 'utf8'));
      assert.equal(inputBytes, canonicalCaseInput(impact.spec));
      assert.equal(manifest.files[`downloads/cases/${file}`], impact.publication.approvedInputSha256);
      assert.equal(evaluated.inputSha256, impact.publication.approvedInputSha256);
      assert.equal(evaluated.sourceCommit, manifest.sourceCommit);
      assert.equal(evaluated.scientificApproval, false);
      assert(manifest.files[`downloads/cases/${evaluatedFile}`]);
      assert(!inputBytes.includes('PRIVATE')); assert(!JSON.stringify(evaluated).includes('PRIVATE'));
    }
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

function impactFixture(name) {
  const spec = JSON.parse(readFileSync(new URL(`../knowledge/cases/${name}-v1.json`, import.meta.url), 'utf8'));
  const phosphorus = name === 'phosphorus-boundary', sourceId = phosphorus ? spec.loss.sourceId : 'water-context';
  const evidenceId = phosphorus ? spec.loss.evidenceId : 'water-context-evidence';
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: `${name}-v1.json`, approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-04', reviewKind: 'agent-source-check', claims: [{
    id: `${name}-claim`, kind: 'interpretation', scope: 'Reviewed static invented arithmetic, not an empirical environmental result',
    textTemplate: phosphorus ? 'Applied={{evaluated.appliedTotalP}}; loss={{evaluated.lossPercent}}%; net={{evaluated.netFreshwaterPDecimal}}; indicator={{evaluated.indicatorExpression}}.' : 'Volume={{evaluated.totalConsumed}}; rowScores={{evaluated.contributions.0.score}}+{{evaluated.contributions.1.score}}; total={{evaluated.baselineScore}}; change={{evaluated.counterfactualScore}}; meanAMD={{evaluated.weightedAMDExpression}}; factorAtMean={{evaluated.factorAtMeanAMD}}; meanCF={{evaluated.consumptionWeightedMeanCF}}.',
    evidenceIds: [evidenceId], premiseIds: [], conceptIds: [], mappingIds: [], caveats: [],
  }] };
  const catalog = { schemaVersion: 1, sources: [{ id: sourceId, title: 'Selected boundary conditions', url: 'https://example.org/boundary', version: 'Selected passage', publisher: 'Publisher', accessedAt: '2026-11-04', accessStatus: 'public-passages-inspected', rights: 'Metadata only', preservation: 'Mutable source' }],
    evidence: [{ id: evidenceId, sourceId, locator: 'Printed p68 Tier1 for phosphorus, conceptual water context otherwise', summary: 'Selected conceptual conditions, not the invented product amount', relation: 'supports',
      ...(phosphorus ? { numericFact: { value: '0.1', unit: 'kg P to freshwater/kg total P applied', quantity: 'background agricultural P loss fraction', subject: 'total-P-applied-to-agricultural-soil', basis: 'UNEP2019 printedp68 Tier1: background agriculture with total-P application data; conditional default, not measured universal loss' } } : {}),
    }], claims: structuredClone(materializeCaseClaims(spec, publication)), concepts: [], mappings: [], coverage: [] };
  return { spec, publication, catalog };
}

test('water and phosphorus dispatch separately with exact primitive receipts and distinct identities/units', () => {
  const water = impactFixture('water-locality'), phosphorus = impactFixture('phosphorus-boundary');
  for (const f of [water, phosphorus]) assert.deepEqual(errors(f), []);
  assert.equal(water.catalog.claims[0].text, 'Volume=3; rowScores=4+8; total=12; change=24; meanAMD=3r/8; factorAtMean=8/3; meanCF=4.');
  assert.equal(phosphorus.catalog.claims[0].text, 'Applied=2; loss=10%; net=0.2; indicator=0.2 kg P×c_FW.');
  assert.notEqual(caseInputSha256(water.spec), caseInputSha256(phosphorus.spec));
  assert.equal(caseEvaluationReceipt(water.spec, 'a'.repeat(40)).evaluations.evaluated.baselineScore, '12');
  assert.equal(caseEvaluationReceipt(phosphorus.spec, 'a'.repeat(40)).evaluations.evaluated.netFreshwaterP, '1/5');
  assert.equal(phosphorus.spec.loss.role, 'inventory-estimation-coefficient');
});

test('every nested impact-example input object projects private metadata before hashing or evaluating', () => {
  for (const name of ['water-locality', 'phosphorus-boundary']) {
    const f = impactFixture(name), before = canonicalCaseInput(f.spec);
    const inject = value => {
      if (Array.isArray(value)) value.forEach(inject);
      else if (value !== null && typeof value === 'object') {
        Object.values(value).forEach(inject); value.privateCapture = { raw: 'PRIVATE /private/source' };
      }
    };
    inject(f.spec);
    assert.equal(canonicalCaseInput(f.spec), before);
    assert(!JSON.stringify(caseTemplateContext(f.spec)).includes('PRIVATE'));
    assert(!JSON.stringify(caseEvaluationReceipt(f.spec, 'a'.repeat(40))).includes('PRIVATE'));
    assert.deepEqual(errors(f), []);
  }
});

test('new examples reject stale hashes, stale templates, expression evaluation and modified canonical bindings', () => {
  for (const name of ['water-locality', 'phosphorus-boundary']) {
    const f = impactFixture(name);
    f.publication.approvedInputSha256 = '0'.repeat(64);
    assert(errors(f).some(error => /stale or unapproved/.test(error)));
    f.publication.approvedInputSha256 = caseInputSha256(f.spec);
    f.publication.claims[0].textTemplate += ' altered';
    assert(errors(f).some(error => /stale text, metadata or caseBinding/.test(error)));
    const bound = impactFixture(name); bound.catalog.claims[0].caseBinding.inputSha256 = '0'.repeat(64);
    assert(errors(bound).some(error => /stale text, metadata or caseBinding/.test(error)));
    f.publication.claims[0].textTemplate = '{{evaluated.constructor}}';
    assert.throws(() => materializeCaseClaims(f.spec, f.publication), /unsafe token/);
    f.publication.claims[0].textTemplate = '{{evaluated.netFreshwaterP * 2}}';
    assert.throws(() => materializeCaseClaims(f.spec, f.publication), /unsafe token/);
  }
});

test('phosphorus source identity and exact public loss fact are mandatory regardless of input flags', () => {
  for (const field of ['value', 'unit', 'subject']) {
    const f = impactFixture('phosphorus-boundary'); f.catalog.evidence[0].numericFact[field] = field === 'value' ? '0.2' : 'wrong';
    assert(errors(f).some(error => /numericFact value\/unit\/subject/.test(error)));
  }
  const missing = impactFixture('phosphorus-boundary');
  missing.spec.validateFacts = false; missing.spec.assessment = { kind: 'inventory-only' };
  delete missing.catalog.evidence[0].numericFact;
  assert(errors(missing).some(error => /numericFact/.test(error)));
  const source = impactFixture('phosphorus-boundary'); source.catalog.sources[0].accessStatus = 'metadata-only';
  assert(errors(source).some(error => /not inspected/.test(error)));
  const wrongSource = impactFixture('phosphorus-boundary');
  wrongSource.catalog.sources[0].id = 'other-source'; wrongSource.catalog.evidence[0].sourceId = 'other-source';
  assert(errors(wrongSource).some(error => /reviewed public closure/.test(error)));
  const omitted = impactFixture('phosphorus-boundary');
  // Valid catalog containing the source/fact privately, but no claim publishes it.
  // A different reviewed premise keeps the derived proposal structurally valid.
  omitted.publication.claims[0].evidenceIds = [];
  omitted.catalog.claims = [];
  omitted.publication.claims[0].kind = 'proposal';
  omitted.publication.claims[0].premiseIds = ['premise'];
  omitted.publication.claims[0].reasoning = 'The source coefficient remains required by the registered model.';
  omitted.catalog.claims.push({ id: 'premise', text: 'Hypothetical boundary conditions are stipulated.', kind: 'interpretation', scope: 'Context', evidenceIds: ['other-context'], premiseIds: [], conceptIds: [], caveats: [], status: 'reviewed', reviewedAt: '2026-11-04', reviewKind: 'agent-source-check' });
  omitted.catalog.sources.push({ ...omitted.catalog.sources[0], id: 'context-source' });
  omitted.catalog.evidence.push({ id: 'other-context', sourceId: 'context-source', locator: 'Conceptual passage', summary: 'Conceptual context', relation: 'supports' });
  omitted.catalog.claims.push(...structuredClone(materializeCaseClaims(omitted.spec, omitted.publication)));
  assert(errors(omitted).some(error => /reviewed public closure/.test(error)), errors(omitted).join('\n'));
});


test('reviewed static impact publications materialize all ten bound paragraphs and preserve legacy hashes', () => {
  const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
  let count = 0;
  for (const name of ['water-locality', 'phosphorus-boundary']) {
    const spec = JSON.parse(readFileSync(new URL(`../knowledge/cases/${name}-v1.json`, import.meta.url), 'utf8'));
    const publication = JSON.parse(readFileSync(new URL(`../knowledge/cases/${name}-v1.publication.json`, import.meta.url), 'utf8'));
    const materialized = materializeCaseClaims(spec, publication);
    for (const claim of materialized) {
      const actual = catalog.claims.find(record => record.id === claim.id);
      assert.equal(claim.text, actual.text, claim.id);
      // Every substantive assertion, premise, caveat and evidence relation survives.
      for (const key of ['kind', 'scope', 'evidenceIds', 'evidenceLinks', 'premiseIds', 'conceptIds', 'mappingIds', 'caveats', 'reasoning']) assert.deepEqual(claim[key], actual[key], `${claim.id}.${key}`);
      count++;
    }
  }
  assert.equal(count, 10);
  for (const [name, expected] of [['wall-coating', 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285'], ['joint-batch', '569797a9cc454583cd9397a468145f24b22f57fd9e5a8c98971138e779b3c773']]) {
    assert.equal(caseInputSha256(JSON.parse(readFileSync(new URL(`../knowledge/cases/${name}-v1.json`, import.meta.url), 'utf8'))), expected);
  }
});

function historicalFixture() {
  const spec = JSON.parse(readFileSync(new URL('../knowledge/cases/historical-glass-v1.json', import.meta.url), 'utf8'));
  const evidence = new Map();
  for (const input of Object.values(spec.facts)) {
    if (!evidence.has(input.evidenceId)) evidence.set(input.evidenceId, { id: input.evidenceId, sourceId: spec.sourceId, locator: 'Named table and cells', summary: 'Selected historical source quantities', relation: 'supports', numericFacts: [] });
    evidence.get(input.evidenceId).numericFacts.push({ id: input.factId, value: input.value, unit: input.unit, subject: input.subject, quantity: 'Selected source quantity', basis: 'Inspected table with original units and scope' });
  }
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'historical-glass-v1.json', approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-04', reviewKind: 'agent-source-check', claims: [{ id: 'historical-check', textTemplate: '{{evaluated.fabrication.total}}; {{evaluated.summary.retGJ}}; {{evaluated.assembly.owgFixed3}}; gap={{evaluated.assembly.gap}}; full={{evaluated.assembly.fullClosure}}.', kind: 'calculation', scope: 'Selected arithmetic only', evidenceIds: [...evidence.keys()], premiseIds: ['hist-premise'], conceptIds: [], caveats: ['Not a full original-program reproduction'], reasoning: 'Keep source-reported totals separate from reconstructed components.' }] };
  const catalog = { schemaVersion: 1, sources: [{ id: spec.sourceId, title: 'Historical source', url: 'https://example.org/source', version: '1974 fixed carrier', publisher: 'Publisher', accessedAt: '2026-11-04', accessStatus: 'public-passages-inspected', rights: 'Original analysis; no source redistribution', preservation: 'Fixed selected carrier', artifact: { mediaType: 'application/pdf', sha256: spec.sourceArtifactSha256, resolvedUrl: 'https://example.org/source.pdf', bytes: 7131045, pageCount: 185 } }], evidence: [...evidence.values()], claims: structuredClone(materializeCaseClaims(spec, publication)), concepts: [], mappings: [], coverage: [] };
  catalog.sources[0].reading = { readingId: 'hist-reading', status: 'selected-passages', scope: 'Named historical tables', checkedAt: '2026-11-04' };
  for (const record of catalog.evidence) { record.readingId = 'hist-reading'; record.passageId = `passage-${record.id}`; }
  const readingRegister = { schemaVersion: 1, readings: [{ id: 'hist-reading', readingStatus: 'selected-passages',
    artifacts: [{ id: 'hist-pdf', ...catalog.sources[0].artifact }],
    passages: catalog.evidence.map(record => ({ id: record.passageId, artifactId: 'hist-pdf' })),
  }] };
  catalog.claims.push({ id: 'hist-premise', text: 'The source gives the selected historical context.', kind: 'source-statement', scope: 'Selected source context', evidenceIds: [evidence.keys().next().value], premiseIds: [], conceptIds: [], caveats: [], status: 'reviewed', reviewedAt: '2026-11-04', reviewKind: 'agent-source-check' });
  return { spec, publication, catalog, readingRegister };
}

test('historical reconstruction publishes its exact selected checks without certifying full closure', () => {
  const f = historicalFixture();
  assert.deepEqual(errors(f), []);
  assert.equal(f.catalog.claims[0].text, '15.6679627; 6.023298; 5965.910; gap=70.09; full=false.');
  const receipt = caseEvaluationReceipt(f.spec, 'a'.repeat(40));
  assert.equal(receipt.scientificApproval, false);
  assert.equal(receipt.evaluations.evaluated.assembly.fullClosure, false);
  assert.equal(receipt.inputSha256, caseInputSha256(f.spec));
});

test('every historical source fact needs its own public identity, quantity basis and fixed carrier', () => {
  for (const input of Object.values(historicalFixture().spec.facts)) {
    for (const key of ['id', 'value', 'unit', 'subject']) {
      const f = historicalFixture();
      const evidence = f.catalog.evidence.find(e => e.id === input.evidenceId);
      const fact = evidence.numericFacts.find(n => n.id === input.factId);
      fact[key] = key === 'value' ? '12345' : 'different';
      assert(errors(f).some(error => /missing or mismatched public source fact/.test(error)), `${input.factId}.${key}`);
    }
  }
  const carrier = historicalFixture(); carrier.catalog.sources[0].artifact.sha256 = '0'.repeat(64);
  assert(errors(carrier).some(error => /carrier does not match/.test(error)));
  const unread = historicalFixture(); unread.catalog.sources[0].accessStatus = 'metadata-only';
  assert(errors(unread).some(error => /not inspected/.test(error)));
  const wrongSource = historicalFixture();
  wrongSource.catalog.sources.push({ ...wrongSource.catalog.sources[0], id: 'other-original' });
  wrongSource.catalog.evidence[0].sourceId = 'other-original';
  assert(errors(wrongSource).some(error => /missing or mismatched public source fact/.test(error)));
});

test('historical source checks cannot be disabled by flags, legacy fallback or unpublished facts', () => {
  const disabled = historicalFixture(); disabled.spec.validateFacts = false; disabled.spec.numericProvenanceDefault = 'hypothetical';
  delete disabled.catalog.evidence[0].numericFacts;
  assert(errors(disabled).some(error => /missing or mismatched public source fact/.test(error)));
  const singular = historicalFixture(); const selected = singular.catalog.evidence[0];
  selected.numericFact = selected.numericFacts[0]; delete selected.numericFacts;
  assert(errors(singular).some(error => /missing or mismatched public source fact/.test(error)));
  const privateOnly = historicalFixture();
  privateOnly.publication.claims[0].evidenceIds.pop();
  privateOnly.catalog.claims = [...structuredClone(materializeCaseClaims(privateOnly.spec, privateOnly.publication)), privateOnly.catalog.claims.find(claim => claim.id === 'hist-premise')];
  assert(errors(privateOnly).some(error => /missing or mismatched public source fact/.test(error)));
});

test('historical input projection drops nested private keys while rejecting any missing required field', () => {
  const original = historicalFixture(), bytes = canonicalCaseInput(original.spec);
  const inject = value => {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(inject); value.privateCapture = { text: 'PRIVATE' };
    }
  };
  inject(original.spec);
  assert.equal(canonicalCaseInput(original.spec), bytes);
  assert.equal(JSON.stringify(caseEvaluationReceipt(original.spec, 'a'.repeat(40))).includes('PRIVATE'), false);
  assert.deepEqual(errors(original), []);
  for (const key of Object.keys(historicalFixture().spec.facts)) {
    const f = historicalFixture(); delete f.spec.facts[key];
    assert.throws(() => canonicalCaseInput(f.spec), /Invalid teaching case/);
  }
});

test('historical templates remain hash-bound and cannot silently change reported or reconstructed meanings', () => {
  const f = historicalFixture(); f.publication.claims[0].textTemplate += ' Fully reproduced';
  assert(errors(f).some(error => /stale text, metadata or caseBinding/.test(error)));
  const hash = historicalFixture(); hash.publication.approvedInputSha256 = '0'.repeat(64);
  assert(errors(hash).some(error => /stale or unapproved/.test(error)));
  const canonical = historicalFixture(); canonical.catalog.claims[0].caseBinding.inputSha256 = '0'.repeat(64);
  assert(errors(canonical).some(error => /caseBinding/.test(error)));
});

function actualHistoricalFixture() {
  const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  return { spec: read('knowledge/cases/historical-glass-v1.json'), publication: read('knowledge/cases/historical-glass-v1.publication.json'),
    catalog: read('knowledge/catalog.json'), readingRegister: read('knowledge/research/readings.json') };
}

test('actual historical facts resolve their own PDF passage carrier, including in a mixed reading', () => {
  const original = actualHistoricalFixture();
  assert.deepEqual(errors(original), []);
  const batch = historicalFixture();
  assert.deepEqual(validateCasePublications([{ spec: batch.spec, publication: batch.publication }], batch.catalog, { readingRegister: batch.readingRegister }), []);
  assert.equal(caseInputSha256(original.spec), '56e6028764e85278fa73143d2321ab20b4ad8cd8d64ff9a75e2c871fb7448d7c');
  const reject = change => {
    const f = actualHistoricalFixture(); change(f);
    assert(errors(f).some(error => /reading register|selected reading|PDF passage carrier/.test(error)));
    assert.equal(caseInputSha256(f.spec), caseInputSha256(original.spec));
    assert.deepEqual(caseEvaluationReceipt(f.spec, 'a'.repeat(40)), caseEvaluationReceipt(original.spec, 'a'.repeat(40)));
  };
  // Source snapshot is still the correct PDF in each test; the evidence's own
  // passage or actual carrier has lost the required original-PDF identity.
  const evidence = f => f.catalog.evidence.find(record => record.id === 'ev-hist-demand');
  const reading = f => f.readingRegister.readings.find(record => record.id === evidence(f).readingId);
  const passage = f => reading(f).passages.find(record => record.id === evidence(f).passageId);
  const artifact = f => reading(f).artifacts.find(record => record.id === passage(f).artifactId);
  for (const change of [
    f => { evidence(f).passageId = 'psg-epa-1974-identity'; },
    f => { delete evidence(f).readingId; delete evidence(f).passageId; },
    f => { delete evidence(f).readingId; }, f => { delete evidence(f).passageId; },
    f => { delete f.catalog.sources.find(record => record.id === f.spec.sourceId).reading; },
    f => { evidence(f).readingId = 'different-reading'; },
    f => { passage(f).artifactId = 'missing-artifact'; },
    f => { const selected = artifact(f); reading(f).artifacts = reading(f).artifacts.filter(record => record !== selected); },
    f => { artifact(f).sha256 = '0'.repeat(64); },
    f => { artifact(f).mediaType = 'text/html'; },
    f => { artifact(f).kind = 'derived-text'; },
    f => { artifact(f).kind = 'unknown-carrier'; },
    f => { reading(f).readingStatus = 'metadata-only'; },
    f => { reading(f).readingStatus = 'not-close-read'; },
    f => { reading(f).artifacts.push(structuredClone(artifact(f))); },
    f => { reading(f).passages.push(structuredClone(passage(f))); },
    f => { f.readingRegister.readings.push(structuredClone(reading(f))); },
    f => { const selected = artifact(f); reading(f).artifacts = reading(f).artifacts.filter(record => record !== selected);
      f.readingRegister.readings.push({ id: 'other-reading', readingStatus: 'selected-passages', artifacts: [selected], passages: [] }); },
  ]) reject(change);
});

test('historical publication requires a well-shaped unambiguous reading register while legacy three-argument validation remains valid', () => {
  const f = actualHistoricalFixture();
  assert(validateCasePublication(f.spec, f.publication, f.catalog).some(error => /reading register/.test(error)));
  assert(validateCasePublications([{ spec: f.spec, publication: f.publication }], f.catalog).some(error => /reading register/.test(error)));
  for (const readingRegister of [undefined, null, [], {}, { schemaVersion: 2, readings: [] }, { schemaVersion: 1, readings: null },
    { schemaVersion: 1, readings: [null] }, { schemaVersion: 1, readings: [{ id: 'bad' }] },
    { schemaVersion: 1, readings: [{ id: 'bad', artifacts: [], passages: [null] }] },
    { schemaVersion: 1, readings: [{ id: 'bad', artifacts: [null], passages: [] }] }]) {
    assert.doesNotThrow(() => validateCasePublication(f.spec, f.publication, f.catalog, { readingRegister }));
    assert(validateCasePublication(f.spec, f.publication, f.catalog, { readingRegister }).some(error => /reading register/.test(error)));
  }
  const legacy = fixture();
  assert.deepEqual(validateCasePublication(legacy.spec, legacy.publication, legacy.catalog), []);
  assert.deepEqual(validateCasePublication(legacy.spec, legacy.publication, legacy.catalog, { readingRegister: null }), []);
  const bytes = canonicalCaseInput(legacy.spec), historicalBytes = canonicalCaseInput(f.spec);
  f.readingRegister.privateCapture = { raw: 'PRIVATE' };
  for (const reading of f.readingRegister.readings) reading.privateCapture = { raw: 'PRIVATE' };
  assert.deepEqual(errors(f), []);
  assert.equal(canonicalCaseInput(f.spec), historicalBytes);
  assert.equal(canonicalCaseInput(legacy.spec), bytes);
  assert.equal(JSON.stringify(caseEvaluationReceipt(f.spec, 'a'.repeat(40))).includes('PRIVATE'), false);
});

test('repository validation carries the actual register into historical carrier refusal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'prism-historical-carrier-'));
  try {
    const f = actualHistoricalFixture();
    await mkdir(join(root, 'knowledge/cases'), { recursive: true });
    await mkdir(join(root, 'knowledge/research'), { recursive: true });
    await mkdir(join(root, 'content'));
    await writeJson(root, 'knowledge/catalog.json', f.catalog);
    await writeJson(root, 'knowledge/cases/historical-glass-v1.json', f.spec);
    await writeJson(root, 'knowledge/cases/historical-glass-v1.publication.json', f.publication);
    await writeJson(root, 'knowledge/research/readings.json', f.readingRegister);
    await writeJson(root, 'knowledge/research/literature-map.json', JSON.parse(readFileSync(new URL('../knowledge/research/literature-map.json', import.meta.url), 'utf8')));
    // Other canonical case-bound claims need their manifests for repository validation.
    const entries = await loadCasePublications(fileURLToPath(new URL('..', import.meta.url)));
    for (const { spec, publication, inputFile } of entries.filter(entry => entry.spec.caseId !== f.spec.caseId)) {
      await writeJson(root, `knowledge/cases/${inputFile}`, spec);
      await writeJson(root, `knowledge/cases/${inputFile.slice(0, -5)}.publication.json`, publication);
    }
    assert.deepEqual(await validateRepository(root), []);
    f.catalog.evidence.find(record => record.id === 'ev-hist-demand').passageId = 'psg-epa-1974-identity';
    await writeJson(root, 'knowledge/catalog.json', f.catalog);
    assert((await validateRepository(root)).some(error => /PDF passage carrier/.test(error)));
  } finally { await rm(root, { recursive: true, force: true }); }
});

function pedigreeFixture() {
  const spec = JSON.parse(readFileSync(new URL('../knowledge/cases/pedigree-calibration-v1.json', import.meta.url), 'utf8'));
  const evidence = new Map();
  for (const input of Object.values(spec.facts)) {
    const source = spec.sources[input.sourceKey];
    if (!evidence.has(input.evidenceId)) evidence.set(input.evidenceId, { id: input.evidenceId, sourceId: source.sourceId,
      readingId: source.readingId, passageId: input.passageId, locator: 'Inspected named cells and their headings',
      summary: 'Selected published numerical summary', relation: 'supports', numericFacts: [] });
    evidence.get(input.evidenceId).numericFacts.push({ id: input.factId, value: input.value, unit: input.unit,
      subject: input.subject, quantity: 'Source-reported selected quantity', basis: 'Original PDF selected numerical passage' });
  }
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version,
    inputFile: 'pedigree-calibration-v1.json', approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{ id: 'pedigree-check', textTemplate: 'CV={{evaluated.sampling.stratified.cvPercent.fixed8}}%; source={{input.facts.conflictingStratifiedCv.value}}%; unrepaired={{evaluated.sampling.sourceDiscrepancy.repaired}}; residual={{evaluated.ratioIllustration.authorConditionalIndependentResidualGsd.fixed6}}; distribution=[{{evaluated.illustration.logCenterTwoSigmaLower.fixed8}},{{evaluated.illustration.logCenterTwoSigmaUpper.fixed8}}].',
      kind: 'calculation', scope: 'Displayed source summaries and conditional author illustration only', evidenceIds: [...evidence.keys()], premiseIds: ['pedigree-premise'], conceptIds: [],
      caveats: ['Not empirical calibration or original software execution'], reasoning: 'Source arithmetic and author conditions remain distinct.' }] };
  const catalog = { schemaVersion: 1, sources: Object.values(spec.sources).map(selected => ({
    id: selected.sourceId, title: 'Selected primary source', url: 'https://example.org/source.pdf', version: 'Inspected original PDF', publisher: 'Publisher',
    accessedAt: '2026-11-05', accessStatus: 'passages-inspected', rights: 'Access context unresolved; no source redistribution permission', preservation: 'Selected acquired bytes',
    reading: { readingId: selected.readingId, status: 'selected-passages', scope: 'Named numerical and methodological passages', checkedAt: '2026-11-05' },
    artifact: { mediaType: 'application/pdf', sha256: selected.sha256, resolvedUrl: 'https://example.org/source.pdf', bytes: 100, pageCount: 88 },
  })), evidence: [...evidence.values()], claims: structuredClone(materializeCaseClaims(spec, publication)), concepts: [], mappings: [], coverage: [] };
  catalog.claims.push({ id: 'pedigree-premise', text: 'The selected source reports these numerical summaries.', kind: 'source-statement',
    scope: 'Selected PDF summary tables', evidenceIds: [...evidence.keys()], premiseIds: [], conceptIds: [], caveats: [],
    status: 'reviewed', reviewedAt: '2026-11-05', reviewKind: 'agent-source-check' });
  const readingRegister = { schemaVersion: 1, readings: Object.values(spec.sources).map(selected => ({
    id: selected.readingId, readingStatus: 'selected-passages',
    artifacts: [{ id: selected.artifactId, kind: 'retrieved', mediaType: 'application/pdf', sha256: selected.sha256 }],
    passages: [...evidence.values()].filter(record => record.readingId === selected.readingId).map(record => ({ id: record.passageId, artifactId: selected.artifactId })),
  })) };
  return { spec, publication, catalog, readingRegister };
}

const pedigreeRejects = (change, pattern = /pedigree calibration|Cannot publish invalid catalog/) => {
  const fixture = pedigreeFixture(); change(fixture);
  const result = errors(fixture);
  assert(result.some(error => pattern.test(error)), `Expected ${pattern}; got:\n${result.join('\n')}`);
};

test('pedigree public closure binds every selected fact and its actual original-PDF passage', () => {
  const fixture = pedigreeFixture();
  assert.deepEqual(errors(fixture), []);
  assert.equal(fixture.catalog.claims[0].text, 'CV=1.03250202%; source=0.07%; unrepaired=false; residual=3.105500; distribution=[6.91145966,14.46872367].');
  assert.equal(caseInputSha256(fixture.spec), 'f2e12a21e200b05e7ec0ae24183eba2d3458f52a08952aca020109edfad8f588');
  assert.equal(caseEvaluationReceipt(fixture.spec, 'a'.repeat(40)).scientificApproval, false);
  // Omitted artifact kind is the existing retrieved-carrier convention.
  for (const reading of fixture.readingRegister.readings) delete reading.artifacts[0].kind;
  assert.deepEqual(errors(fixture), []);
  // A source snapshot is not used as a substitute for a resolved passage.
  delete fixture.catalog.sources[0].artifact;
  assert.deepEqual(errors(fixture), []);
});

test('all seventeen pedigree facts fail on missing or mismatched reviewed source/value/unit/subject identities', () => {
  for (const input of Object.values(pedigreeFixture().spec.facts)) {
    for (const field of ['id', 'value', 'unit', 'subject']) pedigreeRejects(fixture => {
      fixture.catalog.evidence.find(record => record.id === input.evidenceId).numericFacts.find(fact => fact.id === input.factId)[field] = 'wrong';
    }, /public source fact|numericFacts/);
    pedigreeRejects(fixture => {
      const evidence = fixture.catalog.evidence.find(record => record.id === input.evidenceId);
      evidence.numericFacts = evidence.numericFacts.filter(fact => fact.id !== input.factId);
    }, /public source fact|numericFacts/);
    pedigreeRejects(fixture => { fixture.catalog.evidence.find(record => record.id === input.evidenceId).sourceId = fixture.spec.sources[input.sourceKey === 'sampling2008' ? 'report2012' : 'sampling2008'].sourceId; }, /public source fact|numericFacts/);
  }
});

test('pedigree gate rejects missing, duplicate, cross-reading, derived, non-PDF or changed passage carriers', () => {
  const changes = [
    fixture => { fixture.readingRegister = undefined; },
    fixture => { fixture.readingRegister = { schemaVersion: 1, readings: [] }; },
    fixture => { fixture.readingRegister.readings.push(structuredClone(fixture.readingRegister.readings[0])); },
    fixture => { fixture.readingRegister.readings[1].passages.push(structuredClone(fixture.readingRegister.readings[0].passages[0])); },
    fixture => { fixture.readingRegister.readings[1].artifacts.push(structuredClone(fixture.readingRegister.readings[0].artifacts[0])); },
    fixture => { fixture.readingRegister.readings[0].passages[0].id = fixture.readingRegister.readings[0].id; },
    fixture => { fixture.catalog.sources.push(structuredClone(fixture.catalog.sources[0])); },
    fixture => { fixture.catalog.evidence.push(structuredClone(fixture.catalog.evidence[0])); },
    fixture => { fixture.catalog.sources[0].reading.readingId = fixture.readingRegister.readings[1].id; },
    fixture => { delete fixture.catalog.sources[0].reading; },
    fixture => { fixture.catalog.sources[0].reading.scope = ''; },
    fixture => { fixture.catalog.sources[0].reading.status = 'full-work'; },
    fixture => { fixture.catalog.sources[0].accessStatus = 'metadata-only'; },
    fixture => { fixture.catalog.evidence[0].readingId = fixture.readingRegister.readings[1].id; },
    fixture => { fixture.catalog.evidence[0].passageId = fixture.readingRegister.readings[0].passages[1].id; },
    fixture => { fixture.readingRegister.readings[0].passages[0].artifactId = fixture.readingRegister.readings[1].artifacts[0].id; },
    fixture => { fixture.readingRegister.readings[0].artifacts[0].id = 'different-artifact'; },
    fixture => { fixture.readingRegister.readings[0].artifacts[0].kind = 'derived-text'; },
    fixture => { fixture.readingRegister.readings[0].artifacts[0].kind = 'unknown'; },
    fixture => { fixture.readingRegister.readings[0].artifacts[0].mediaType = 'text/html'; },
    fixture => { fixture.readingRegister.readings[0].artifacts[0].sha256 = '0'.repeat(64); },
    fixture => { fixture.readingRegister.readings[0].artifacts = []; },
    fixture => { fixture.readingRegister.readings[0].readingStatus = 'metadata-only'; },
    fixture => { fixture.readingRegister.readings[0].passages[0] = null; },
  ];
  for (const change of changes) pedigreeRejects(change);
  // Default PDF still matches: it cannot rescue the different actual carrier.
  pedigreeRejects(fixture => {
    const reading = fixture.readingRegister.readings[0];
    reading.artifacts.push({ id: 'derived-copy', kind: 'derived-text', mediaType: 'text/plain', sha256: fixture.spec.sources.sampling2008.sha256 });
    reading.passages[0].artifactId = 'derived-copy';
  }, /original PDF passage carrier/);
});

test('pedigree source gate comes from the registry and cannot be disabled by input flags or singular fallback', () => {
  pedigreeRejects(fixture => {
    fixture.spec.validateFacts = false; fixture.spec.numericProvenanceDefault = 'hypothetical';
    fixture.readingRegister = null;
  }, /actual reading register/);
  pedigreeRejects(fixture => {
    const evidence = fixture.catalog.evidence[0]; evidence.numericFact = evidence.numericFacts[0]; delete evidence.numericFacts;
  }, /public source fact|numericFacts/);
  pedigreeRejects(fixture => { fixture.catalog.evidence[0].numericFacts.push(structuredClone(fixture.catalog.evidence[0].numericFacts[0])); }, /public source fact|numericFacts/);
  pedigreeRejects(fixture => { fixture.catalog.claims[0].status = 'draft'; }, /canonical claim/);
  const fixture = pedigreeFixture();
  assert(errors({ ...fixture, readingRegister: undefined }).length > 0);
});

test('pedigree nested public projection, changed-input rejection and exact prose binding preserve authority', () => {
  const fixture = pedigreeFixture(), bytes = canonicalCaseInput(fixture.spec);
  for (const record of [fixture.spec, fixture.spec.sources, ...Object.values(fixture.spec.sources), fixture.spec.facts,
    ...Object.values(fixture.spec.facts), fixture.spec.interpretation, fixture.spec.illustration]) record.privateCapture = { raw: 'PRIVATE /private/source.pdf' };
  assert.equal(canonicalCaseInput(fixture.spec), bytes);
  assert(!canonicalCaseInput(fixture.spec).includes('PRIVATE'));
  assert(Object.isFrozen(caseTemplateContext(fixture.spec).evaluated.illustration));
  for (const change of [spec => { spec.facts.clusterMean.value = '5.7'; }, spec => { spec.facts.clusterMean.sourceKey = 'report2012'; },
    spec => { delete spec.facts.clusterMean.passageId; }, spec => { spec.sources.sampling2008.sha256 = '0'.repeat(64); },
    spec => { spec.illustration.center = 'arithmetic-mean'; }, spec => { spec.interpretation.empiricalCalibrationReproduced = true; }]) {
    const spec = pedigreeFixture().spec; change(spec);
    assert.throws(() => publicTeachingCase(spec), /Invalid teaching case/);
  }
  pedigreeRejects(f => { f.catalog.claims[0].text += ' unsupported'; }, /stale text/);
  pedigreeRejects(f => { f.publication.approvedInputSha256 = '0'.repeat(64); }, /stale or unapproved/);
  pedigreeRejects(f => { f.publication.claims[0].textTemplate += ' empirical reproduction'; }, /stale text/);
});
