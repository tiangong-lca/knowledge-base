import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canonicalCaseInput, caseInputSha256, materializeCaseClaims, validateCasePublication } from './case-publication.mjs';
import { evaluateParticulateHealthCase, validateParticulateHealthFacts } from './particulate-health.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const inputFile = 'particulate-health-v1.json';
const input = () => json(`../knowledge/cases/${inputFile}`);

test('historical factors convert the inhaled mass before applying the reported 78 and match the printed precision', () => {
  const { historical } = evaluateParticulateHealthCase(input());
  assert.equal(historical.effect.exact, '78');
  assert.equal(historical.effectUnit, 'DALY/kg PM2.5 inhaled');
  const expected = {
    primaryUrban: ['0.000044', '0.003432', '0.0034', 'PM2.5'],
    primaryRural: ['0.0000038', '0.0002964', '0.00030', 'PM2.5'],
    primaryRemote: ['0.0000001', '0.0000078', '0.0000078', 'PM2.5'],
    so2Urban: ['0.00000099', '0.00007722', '0.000077', 'SO2'],
    noxUrban: ['0.0000002', '0.0000156', '0.000016', 'NOx'],
    nh3Urban: ['0.0000017', '0.0001326', '0.00013', 'NH3'],
  };
  for (const [key, [intake, calculated, reported, flow]] of Object.entries(expected)) {
    const row = historical.factors[key];
    assert.deepEqual(
      [row.intakeKgPerKg.exact, row.calculated.exact, row.reportedLiteral, row.atSourcePrecision, row.matchesSourcePrecision],
      [intake, calculated, reported, reported, true], key,
    );
    assert.equal(row.intakeUnit, `mg PM2.5 inhaled/kg ${flow} emitted`);
    assert.equal(row.unit, `DALY/kg ${flow} emitted`);
  }
  // 44 / 3.8 reduces to 220 / 19. Dividing the rounded CFs would give 34 / 3.
  assert.equal(historical.urbanRuralRatio.exact, '220/19');
  assert.equal(historical.urbanRuralRatioRounded, '11.578947');
});

test('each urban height mixture uses its own source shares and matches the reported integer', () => {
  const { fine, coarse } = evaluateParticulateHealthCase(input()).heightMixtures;
  assert.deepEqual(Object.values(fine.shares).map(row => row.exact), ['0.41', '0.17', '0.42']);
  assert.deepEqual(Object.values(coarse.shares).map(row => row.exact), ['0.08', '0.02', '0.9']);
  for (const [mix, exact, printed] of [[fine, '25.54', '26'], [coarse, '36.964', '37']]) {
    assert.deepEqual(
      [mix.shareSum.exact, mix.sharesSumToOne, mix.weighted.exact, mix.weightedRounded, mix.reportedLiteral,
        mix.atSourcePrecision, mix.matchesSourcePrecision],
      ['1', true, exact, exact, printed, printed, true],
    );
  }
  assert.equal(coarse.unit, 'mg PM10–2.5 inhaled/kg PM10–2.5 emitted');
});

test('GLAM uses the four literal CFs for source-group and slope ratios', () => {
  const { glam } = evaluateParticulateHealthCase(input());
  assert.deepEqual(Object.values(glam.factors).map(row => [row.value.exact, row.microDalyPerKg.exact, row.microDalyPerKgRounded]), [
    ['0.00022993697785707201', '229.93697785707201', '229.936978'],
    ['0.00020560412767302999', '205.60412767302999', '205.604128'],
    ['0.0000076113428512687102', '7.6113428512687102', '7.611343'],
    ['0.0000079809452058889692', '7.9809452058889692', '7.980945'],
  ]);
  // Independent integer reductions of the original E-cell mantissas after exponent alignment.
  assert.deepEqual(Object.fromEntries(Object.entries(glam.ratios).map(([key, row]) => [key, [row.value.exact, row.rounded]])), {
    urbanAverageMarginal: ['6853470922434333/7664565928569067', '0.894176'],
    ruralAverageMarginal: ['39904726029444846/38056714256343551', '1.048559'],
    urbanRuralMarginal: ['1149684889285360050/38056714256343551', '30.209778'],
    urbanRuralAverage: ['57112257686952775/2216929223858047', '25.761877'],
  });
});

const scopeFlags = [
  'nativeAtmosphericModelReproduced', 'epidemiologyReproduced', 'modelValidityEstablished',
  'individualHealthPrediction', 'interventionBenefitMeasured', 'historicalAndModernInterchangeable',
  'glamFactorGenerationReproduced', 'sourceMixtureValidated', 'uncertaintyPropagated',
];

test('the reviewed identity fixes the exact downloadable bytes and the scope flags', () => {
  const spec = input();
  const sha = 'cf130fd22b311b6d3bd18b251b2b5a5a9d62cd694b409f9ed3dd520aee9301ce';
  assert.equal(caseInputSha256(spec), sha);
  assert.equal(canonicalCaseInput(spec), read(`../knowledge/cases/${inputFile}`));
  assert.equal(Object.keys(spec.facts).length, 30);
  const { scope } = evaluateParticulateHealthCase(spec);
  for (const flag of scopeFlags) {
    assert.equal(scope[flag], false);
    const changed = structuredClone(spec);
    changed.scope[flag] = true;
    assert.throws(() => caseInputSha256(changed), /exact reviewed particulate-health v1 input/);
  }
  spec.facts.glamUrbanMarginal.localOriginal = { path: '/private/original.xlsx' };
  assert.equal(caseInputSha256(spec), sha);

  const dairy = json('../knowledge/cases/dairy-rules-v1.publication.json');
  assert.equal(caseInputSha256(json(`../knowledge/cases/${dairy.inputFile}`)), dairy.approvedInputSha256);
});

// Use the real source, evidence and reading rows with a test-only claim so this
// tests the registered policy without depending on the book's wording.
function fixture() {
  const spec = input();
  const { sources, evidence } = json('../knowledge/catalog.json');
  const evidenceIds = [...new Set([...Object.values(spec.facts).map(fact => fact.evidenceId), spec.container.evidenceId])];
  const sourceIds = Object.values(spec.sources).map(source => source.sourceId);
  const publication = {
    schemaVersion: 1, caseId: spec.caseId, version: spec.version,
    inputFile, approvedInputSha256: caseInputSha256(spec),
    reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{
      id: 'test-particulate-health',
      textTemplate: 'Urban historical CF: {{evaluated.historical.factors.primaryUrban.calculated.exact}}; GLAM average contrast: {{evaluated.glam.ratios.urbanRuralAverage.rounded}}.',
      kind: 'interpretation', scope: 'Test fixture for the registered publication adapter.',
      evidenceIds, premiseIds: [], conceptIds: [], caveats: [],
    }],
  };
  const catalog = {
    schemaVersion: 1,
    sources: sources.filter(source => sourceIds.includes(source.id)),
    evidence: evidence.filter(row => evidenceIds.includes(row.id)),
    claims: materializeCaseClaims(spec, publication),
    concepts: [], mappings: [], coverage: [],
  };
  return { spec, publication, catalog, context: { readingRegister: json('../knowledge/research/readings.json') } };
}
const registeredErrors = f => validateCasePublication(f.spec, f.publication, f.catalog, f.context);
const numericErrors = f => validateParticulateHealthFacts(f.spec, f.catalog, f.context);
const source = (f, key) => f.catalog.sources.find(row => row.id === f.spec.sources[key].sourceId);
const reading = (f, key) => f.context.readingRegister.readings.find(row => row.id === f.spec.sources[key].readingId);
const evidence = (f, tuple) => f.catalog.evidence.find(row => row.id === tuple.evidenceId);
const passage = (f, tuple) => reading(f, tuple.source).passages.find(row => row.id === tuple.passageId);
const artifact = (f, key, artifactId = f.spec.sources[key].artifactId) => reading(f, key).artifacts.find(row => row.id === artifactId);

test('the registered adapter rejects absence from the public closure even when the ZIP record still exists', () => {
  const f = fixture();
  assert.equal(f.catalog.claims[0].text, 'Urban historical CF: 0.003432; GLAM average contrast: 25.761877.');
  assert.deepEqual(registeredErrors(f), []);
  assert.match(validateCasePublication(f.spec, f.publication, f.catalog).join('\n'), /actual reading register required/);

  const claim = f.publication.claims[0];
  claim.evidenceIds = claim.evidenceIds.filter(id => id !== f.spec.container.evidenceId);
  f.catalog.claims = materializeCaseClaims(f.spec, f.publication);
  assert.ok(evidence(f, f.spec.container));
  assert.match(registeredErrors(f).join('\n'), /container: exact public GLAM ZIP archive member evidence/);
});

test('public numeric tuples cannot change meaning or move the reported 78 to a different fact', () => {
  for (const field of ['value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = fixture();
    const tuple = f.spec.facts.noxUrban;
    const fact = evidence(f, tuple).numericFacts.find(row => row.id === tuple.factId);
    fact[field] = field === 'value' ? '0.21' : 'different';
    assert.match(registeredErrors(f).join('\n'), /facts\.noxUrban: exact public fact/, field);
    tuple[field] = fact[field];
    assert.match(numericErrors(f).join('\n'), /exact reviewed particulate-health v1 input/, field);
  }
  const f = fixture();
  const effect = evidence(f, f.spec.facts.effect);
  effect.numericFacts = [{ id: 'wrong-shape-for-78', ...effect.numericFact }];
  delete effect.numericFact;
  assert.match(registeredErrors(f).join('\n'), /facts\.effect: exact public fact/);
});

test('the inspected PDF and workbook locations and both GLAM carriers must match', () => {
  const changes = [
    [f => { reading(f, 'gronlund2015').workId = 'work-another'; }, /sources\.gronlund2015/],
    [f => { passage(f, f.spec.facts.effect).pdfIndices = [6, 23]; }, /facts\.effect: exact inspected passage/],
    [f => { passage(f, f.spec.facts.fineHighShare).pdfIndices = [13, 5]; }, /facts\.fineHighShare: exact inspected passage/],
    [f => { passage(f, f.spec.facts.glamUrbanMarginal).artifactId = f.spec.container.artifactId; }, /facts\.glamUrbanMarginal: exact inspected passage/],
    [f => { passage(f, f.spec.facts.glamUrbanMarginal).pdfIndices = [0]; }, /facts\.glamUrbanMarginal: exact inspected passage/],
    [f => { artifact(f, 'glam-pm2024', f.spec.container.artifactId).sha256 = f.spec.sources['glam-pm2024'].sha256; }, /container: exact public GLAM ZIP/],
    [f => { reading(f, 'glam-pm2024').artifacts = reading(f, 'glam-pm2024').artifacts.filter(row => row.id !== f.spec.container.artifactId); }, /container: exact public GLAM ZIP/],
    [f => { passage(f, f.spec.container).locator = evidence(f, f.spec.container).locator = 'Different member.xlsx'; }, /container: exact public GLAM ZIP/],
    [f => {
      const member = passage(f, f.spec.container);
      const glam = reading(f, 'glam-pm2024');
      glam.passages = glam.passages.filter(row => row !== member);
      reading(f, 'humbert2011').passages.push(member);
    }, /container: exact public GLAM ZIP/],
  ];
  for (const [change, expected] of changes) {
    const f = fixture();
    change(f);
    assert.match(registeredErrors(f).join('\n'), expected);
  }
});

test('coordinated ZIP and XLSX hash swaps fail with the approved input and cannot establish a new v1', () => {
  const f = fixture();
  const key = 'glam-pm2024';
  const workbook = artifact(f, key);
  const zip = artifact(f, key, f.spec.container.artifactId);
  [workbook.sha256, zip.sha256] = [zip.sha256, workbook.sha256];
  source(f, key).artifact.sha256 = workbook.sha256;
  const errors = registeredErrors(f).join('\n');
  assert.match(errors, /sources\.glam-pm2024: exact inspected work, edition, reading and original carrier/);
  assert.match(errors, /container: exact public GLAM ZIP/);

  f.spec.sources[key].sha256 = workbook.sha256;
  f.spec.container.sha256 = zip.sha256;
  assert.match(numericErrors(f).join('\n'), /exact reviewed particulate-health v1 input/);
  assert.throws(() => caseInputSha256(f.spec), /exact reviewed particulate-health v1 input/);
});
