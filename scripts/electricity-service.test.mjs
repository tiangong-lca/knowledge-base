import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  canonicalCaseInput, caseInputSha256, materializeCaseClaims, validateCasePublication,
} from './case-publication.mjs';
import {
  evaluateElectricityServiceCase, validateElectricityServiceCase, validateElectricityServiceFacts,
} from './electricity-service.mjs';

const inputFile = 'electricity-service-v1.json';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const input = () => json(`../knowledge/cases/${inputFile}`);

test('eGRID output and gross-loss calculations retain the different exact denominators', () => {
  const { egrid } = evaluateElectricityServiceCase(input());
  assert.equal(egrid.co2Output.calculatedLbPerGenerationMWh.exact, '35015306360200000000/47713738610100001');
  assert.equal(egrid.co2Output.reportedLiteral, '733.86199999999997');
  assert.equal(egrid.co2Output.calculatedAtDisplay, '733.862');
  assert.equal(egrid.co2Output.matchesPublishedDisplay, true);
  assert.equal(egrid.ggl.denominatorMWh.exact, '443870238.080597778');
  assert.equal(egrid.ggl.fraction.exact, '18707069898406301/443870238080597778');
  assert.equal(egrid.ggl.percent.fixed6, '4.214536');
  assert.equal(egrid.ggl.publishedAtDisplay, '4.2');
  assert.equal(egrid.ggl.matchesPublishedDisplay, true);
});

test('net exports lower inferred demand, net imports raise it, and each Norway segment uses delivered energy', () => {
  const { eia, norway } = evaluateElectricityServiceCase(input());
  assert.deepEqual(Object.values(eia).map(row => [row.calculatedDemandMW.exact, row.residualMW.exact, row.closes]), [
    ['35829', '0', true], ['51910', '0', true],
  ]);
  assert.deepEqual(Object.values(norway).map(row => [row.lossKwhPerDeliveredMWh.exact, row.calculatedAtDisplay, row.matchesReportedDisplay]), [
    ['63000/937', '67', true], ['2000/123', '16', true],
  ]);
});

test('AVERT derived outputs retain signed changes, two distinct nonzero denominators, and an undefined zero-control ratio', () => {
  const { native, scope, avertPreprocessing } = evaluateElectricityServiceCase(input());
  assert.equal(avertPreprocessing.requestedFossilMWhPerTerminalMWh.fixed6, '1.047989');
  assert.equal(native.zero.zeroControl, true);
  assert.equal(native.zero.modeledGenerationChangeMWh.exact, '0');
  assert.equal(native.zero.avoidedDirectCo2KgPerTerminalMWh, null);
  assert.equal(native.zero.avoidedDirectCo2KgPerModeledGenerationMWh, null);

  assert.equal(native.flat.terminalReductionMWh.exact, '8760');
  assert.equal(native.flat.requestedFossilLoadChangeMWh.exact, '-9180.382397142455');
  assert.equal(native.flat.modeledGenerationChangeMWh.exact, '-9187.918252352625');
  assert.equal(native.flat.modeledMinusRequestedFossilChangeMWh.exact, '-7.53585521017');
  assert.equal(native.flat.modeledDirectCo2ChangeUSShortTon.exact, '-5672.722302591428');
  assert.equal(native.flat.avoidedDirectCo2Kg.exact, '5146207.10716860593640872');
  assert.equal(native.flat.avoidedDirectCo2KgPerTerminalMWh.fixed6, '587.466565');
  assert.equal(native.flat.avoidedDirectCo2KgPerModeledGenerationMWh.fixed6, '560.105888');
  assert.equal(native.flat.diagnostics.eguCo2Increases, 10);
  assert.equal(native.flat.zeroControl, false);
  assert.equal(scope.nativeReexecutedDuringStaticBuild, false);

  assert.deepEqual([native.july03, native.july16].map(row => [
    row.sourceFossilLoadMW.exact, row.requestedFossilLoadChangeMWh.exact,
    row.avoidedDirectCo2KgPerTerminalMWh.fixed6, row.avoidedDirectCo2KgPerModeledGenerationMWh.fixed6,
  ]), [
    ['34246', '-104.79888581214115', '546.878106', '515.040013'],
    ['45576', '-104.79888581214115', '513.678548', '486.866401'],
  ]);
});

test('published native replay recipe and recorded summary retain their approved file identities', () => {
  const native = input().native;
  const hash = path => createHash('sha256').update(read(path)).digest('hex');
  assert.equal(hash('./reproduce-electricity-native.mjs'), native.summary.portableDriverSha256);
  assert.equal(hash('../_docs/reproduction/electricity/electricity-native-acquisition.json'), native.summary.acquisitionManifestSha256);
  assert.equal(hash('../_docs/reproduction/electricity/electricity-native-summary.json'), native.summarySha256);
});

test('Cambium keeps nonzero residuals, terminal rates, and the bounded gas reconstruction separate', () => {
  const { cambium } = evaluateElectricityServiceCase(input());
  assert.deepEqual(Object.values(cambium.balances).map(row => row.exact), [
    '437697380', '437697372.8', '-7.2', '437697388.7', '8.7',
  ]);
  assert.equal(cambium.distribution.differenceMWh.exact, '15282395.7');
  assert.equal(cambium.distribution.percentOfBusbarForEndUse.fixed6, '3.594517');
  assert.equal(cambium.distribution.publishedAverageFraction.exact, '0.0359');
  assert.equal(cambium.distribution.publishedMarginalFraction.exact, '0.0539');
  assert.deepEqual(Object.values(cambium.directCo2Rates).map(row => row.exact), ['235.2', '249.7']);
  assert.deepEqual(Object.values(cambium.terminalCo2eRates).map(row => row.exact), ['307.5', '757.8', '547.3']);

  const gas = cambium.gasReconstruction;
  assert.equal(gas.direct.ch4Kg.exact, '0.0155');
  assert.equal(gas.precombustion.ch4Kg.exact, '3.2091');
  assert.equal(gas.direct.subtotalKgCo2ePerEndUseMWh.exact, '410.10517');
  assert.equal(gas.precombustion.subtotalKgCo2ePerEndUseMWh.exact, '137.18305');
  assert.equal(gas.totalKgCo2ePerEndUseMWh.exact, '547.28822');
  assert.equal(gas.totalAtDisplayPrecision, '547.3');
  assert.equal(gas.matchesReportedDisplay, true);
  assert.equal(cambium.reportedScenarioComparison.differenceKgCo2ePerEndUseMWh.exact, '91.1');
  assert.equal(cambium.reportedScenarioComparison.alternativeGasBreakdownReproduced, false);
});

test('download projection fixes closed v1, strips nested private fields and preserves legacy input hashes', () => {
  const spec = input();
  const canonical = read(`../knowledge/cases/${inputFile}`);
  assert.equal(canonicalCaseInput(spec), canonical);
  assert.equal(Object.keys(spec.facts).length, 48);
  assert.equal(spec.native.summarySha256, createHash('sha256')
    .update(`${JSON.stringify(spec.native.summary, null, 2)}\n`).digest('hex'));

  const initialHash = caseInputSha256(spec);
  spec.native.summary.scenarios[1].modeled.co2.privateFile = '/private/original';
  spec.carriers[0].rawSource = '/private/raw';
  assert.equal(caseInputSha256(spec), initialHash);

  const changed = input();
  changed.native.summary.scenarios[1].outputs.rawSHA = 'f'.repeat(64);
  assert.throws(() => caseInputSha256(changed), /exact reviewed electricity-service v1 input/);
  changed.native.summary.scenarios[1].outputs.rawSHA = input().native.summary.scenarios[1].outputs.rawSHA;
  changed.native.summary.scenarios[1].modeled.co2.delta = '-5672.722302591429';
  assert.throws(() => evaluateElectricityServiceCase(changed), /exact reviewed electricity-service v1 input/);

  for (const name of ['particulate-health-v1', 'dairy-rules-v1']) {
    const publication = json(`../knowledge/cases/${name}.publication.json`);
    assert.equal(caseInputSha256(json(`../knowledge/cases/${publication.inputFile}`)), publication.approvedInputSha256);
  }
});

// Use the actual catalog rows and reading register. The single runtime-only
// fixture claim gives the registry a reviewed closure without relying on prose.
function fixture() {
  const spec = input();
  const { sources, evidence } = json('../knowledge/catalog.json');
  const evidenceIds = spec.passages.map(row => row.evidenceId);
  const sourceIds = spec.sources.map(row => row.sourceId);
  const publication = {
    schemaVersion: 1, caseId: spec.caseId, version: spec.version,
    inputFile, approvedInputSha256: caseInputSha256(spec),
    reviewedAt: '2026-11-06', reviewKind: 'agent-source-check',
    claims: [{
      id: 'test-electricity-service', textTemplate: 'Output: {{evaluated.egrid.co2Output.calculatedAtDisplay}}.',
      kind: 'interpretation', scope: 'Fixture for the registered validator.',
      evidenceIds, premiseIds: [], conceptIds: [], caveats: [],
    }],
  };
  const catalog = {
    schemaVersion: 1, sources: sources.filter(row => sourceIds.includes(row.id)),
    evidence: evidence.filter(row => evidenceIds.includes(row.id)), claims: materializeCaseClaims(spec, publication),
    concepts: [], mappings: [], coverage: [],
  };
  return { spec, publication, catalog, context: { readingRegister: json('../knowledge/research/readings.json') } };
}

const registeredErrors = f => validateCasePublication(f.spec, f.publication, f.catalog, f.context).join('\n');
const expectedPassage = (f, evidenceId) => f.spec.passages.find(row => row.evidenceId === evidenceId);
const reading = (f, readingId) => f.context.readingRegister.readings.find(row => row.id === readingId);
const evidence = (f, id) => f.catalog.evidence.find(row => row.id === id);
const actualPassage = (f, expected) => reading(f, expected.readingId).passages.find(row => row.id === expected.passageId);
const actualArtifact = (f, artifactId) => {
  const expected = f.spec.carriers.find(row => row.artifactId === artifactId);
  return reading(f, expected.readingId).artifacts.find(row => row.id === artifactId);
};

test('registered publication requires the actual reading register and the reviewed archive and native closure', () => {
  const f = fixture();
  assert.equal(f.catalog.claims[0].text, 'Output: 733.862.');
  assert.equal(registeredErrors(f), '');
  assert.match(validateCasePublication(f.spec, f.publication, f.catalog).join('\n'), /actual reading register required/);

  for (const id of [f.spec.archive.evidenceId, 'ev-kb48-avertweb43-core-interpolation']) {
    const g = fixture();
    const claim = g.publication.claims[0];
    claim.evidenceIds = claim.evidenceIds.filter(row => row !== id);
    g.catalog.claims = materializeCaseClaims(g.spec, g.publication);
    assert.ok(evidence(g, id), 'the record remains in the catalog outside the public closure');
    assert.match(registeredErrors(g), new RegExp(`passages\\.${id}:`));
  }
});

test('exact tuples reject changed value, unit, quantity, subject and basis independently', () => {
  for (const field of ['value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = fixture();
    const tuple = f.spec.facts.egridCo2Mass;
    const fact = evidence(f, tuple.evidenceId).numericFacts.find(row => row.id === tuple.factId);
    fact[field] = field === 'value' ? '175076531.802' : 'changed semantic field';
    assert.match(registeredErrors(f), /facts\.egridCo2Mass: exact public fact/, field);
    tuple[field] = fact[field];
    assert.match(validateElectricityServiceCase(f.spec).join('\n'), /exact reviewed electricity-service v1 input/, field);
  }
});

test('default snapshot cannot replace the actual second EIA CSV or Arvesen supplement passage', () => {
  const f = fixture();
  const tuple = f.spec.facts.eiaImportDemand;
  const expected = expectedPassage(f, tuple.evidenceId);
  const source = f.spec.sources.find(row => row.sourceId === expected.sourceId);
  assert.notEqual(source.defaultArtifactId, expected.artifactId);
  actualPassage(f, expected).artifactId = source.defaultArtifactId;
  assert.match(registeredErrors(f), /passages\.ev-kb48-main-eia930-balance2023-import-hour/);

  const g = fixture();
  const si = expectedPassage(g, g.spec.facts.norwayLocalLossPerDelivered.evidenceId);
  actualArtifact(g, si.artifactId).kind = 'derived-text';
  assert.match(validateElectricityServiceFacts(g.spec, g.catalog, g.context).join('\n'), /carriers\.art-kb48-arvesen-si/);
});

test('wrong printed location and a passage detached from its reading fail with original bytes still present', () => {
  const f = fixture();
  const tuple = f.spec.facts.norwayRegionalLossFraction;
  const expected = expectedPassage(f, tuple.evidenceId);
  actualPassage(f, expected).pdfIndices = [5, 6];
  assert.match(registeredErrors(f), /passages\.ev-kb48-arvesen-feed-loss/);

  const g = fixture();
  const passage = expectedPassage(g, g.spec.facts.cambiumAlternativeLongRunEndUseCo2e.evidenceId);
  const owner = reading(g, passage.readingId);
  const detached = actualPassage(g, passage);
  owner.passages = owner.passages.filter(row => row !== detached);
  reading(g, 'rd-kb48-avertweb43').passages.push(detached);
  assert.match(registeredErrors(g), /passages\.ev-kb48-future-cambium2024-release-alternate-rate/);
});

test('Cambium ZIP and member hashes and native manifest binding survive only with their exact carrier identities', () => {
  const f = fixture();
  const archive = expectedPassage(f, f.spec.archive.evidenceId);
  const zip = actualArtifact(f, archive.artifactId);
  const member = actualArtifact(f, f.spec.archive.memberArtifactId);
  assert.equal(zip.resolvedUrl, member.resolvedUrl);
  [zip.sha256, member.sha256] = [member.sha256, zip.sha256];
  assert.match(registeredErrors(f), /electricity service\.archive: exact public Cambium annual ZIP/);

  const g = fixture();
  const nei = g.spec.native.manifestArtifactBindings.find(row => row.manifestPath === 'server/app/data/annual-emission-factors.json');
  actualArtifact(g, nei.artifactId).sha256 = 'e'.repeat(64);
  assert.match(registeredErrors(g), /native\.server\/app\/data\/annual-emission-factors\.json: exact manifest-bound/);

  const h = fixture();
  const spec = h.spec;
  spec.native.summary.kind = 'source-literal';
  assert.match(validateElectricityServiceFacts(spec, h.catalog, h.context).join('\n'), /exact reviewed electricity-service v1 input/);
});
