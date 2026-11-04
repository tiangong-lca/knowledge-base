import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateMarketResponseCase, validateMarketResponseCase, validateMarketResponseFacts } from './market-response.mjs';
const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/market-response-v1.json', import.meta.url), 'utf8'));
function boundFixture() {
  const spec = input(), s = spec.source;
  return { spec, published: {
    sources: [{ id: s.sourceId, accessStatus: 'public-passages-inspected', reading: { readingId: s.readingId, status: 'selected-passages', scope: 'PSI M3 definition and printed Tables A.1/A.3' } }],
    evidence: [{ id: 'ev-market-psi-m3', sourceId: s.sourceId, readingId: s.readingId, passageId: 'ps-market-psi-m3',
      numericFacts: Object.values(spec.facts).map(f => ({ id: f.factId, ...Object.fromEntries(['value', 'unit', 'quantity', 'subject', 'basis'].map(key => [key, f[key]])) })) }],
  }, context: { readingRegister: { schemaVersion: 1, readings: [{ id: s.readingId, readingStatus: 'selected-passages',
    passages: [{ id: 'ps-market-psi-m3', artifactId: s.artifactId }], artifacts: [{ id: s.artifactId, mediaType: 'application/pdf', sha256: s.sha256 }] }] } } };
}
const validateFixture = f => validateMarketResponseFacts(f.spec, f.published, f.context);

test('M3 closes the original balance including losses, and retains the small Italian contribution', () => {
  const spec = input(), before = JSON.stringify(spec), h = evaluateMarketResponseCase(spec).historical;
  assert.equal(h.domesticAfterExportGWh.exact, '35134');
  assert.equal(h.denominatorGWh.exact, '53247');
  assert.deepEqual(h.consumptionPlusLossesGWh, h.denominatorGWh);
  assert.notEqual(h.denominatorGWh.exact, spec.facts.finalConsumption.value);
  const expected = { CH: ['35134', '35134/53247', '66.0'], DE: ['7014', '2338/17749', '13.2'],
    FR: ['9116', '9116/53247', '17.1'], AT: ['1973', '1973/53247', '3.7'], IT: ['10', '10/53247', '0.0'] };
  for (const [country, [amount, fraction, roundedPercent]] of Object.entries(expected)) {
    assert.equal(h.origins[country].amountGWh.exact, amount);
    assert.equal(h.origins[country].fraction.exact, fraction);
    assert.equal(h.origins[country].percentFixed1, roundedPercent);
  }
  // Exact fraction sum, independent of display rounding or reduced denominator.
  const d = 53247n;
  const assigned = Object.values(h.origins).reduce((sum, row) => sum + BigInt(row.fraction.numerator) * (d / BigInt(row.fraction.denominator)), 0n);
  assert.equal(assigned, d);
  assert.equal(Object.values(h.origins).reduce((sum, row) => sum + BigInt(row.amountGWh.exact), 0n), d);
  assert.equal(h.origins.IT.percentFixed4, '0.0188');
  assert.equal(h.emissionTotalsReconstructed, false);
  assert.equal(h.empiricalModelValidityEstablished, false);
  assert.equal(JSON.stringify(spec), before);
});

test('positive supply scenarios conserve generation, producer demand and fixed other-user demand separately', () => {
  const i = evaluateMarketResponseCase(input()).illustration;
  assert.deepEqual([i.baseline.generation.H.exact, i.baseline.generation.G.exact, i.baseline.generation.total.exact], ['40', '60', '100']);
  assert.equal(i.baseline.producer.total.exact, '0');
  for (const [key, expected] of Object.entries({ constrained: ['30', '70', '40', '70'], expandable: ['40', '60', '50', '60'] })) {
    const s = i[key];
    assert.deepEqual([s.otherUsers.H.exact, s.otherUsers.G.exact, s.generation.H.exact, s.generation.G.exact], expected);
    assert.equal(s.otherUsers.total.exact, '100');
    assert.equal(s.producer.total.exact, '10');
    assert.equal(s.generation.total.exact, '110');
    assert.equal(s.changeFromBaseline.total.exact, '10');
    for (const activity of ['H', 'G', 'total']) {
      const n = row => BigInt(row[activity].exact);
      assert(n(s.producer) >= 0n && n(s.otherUsers) >= 0n && n(s.generation) >= 0n);
      assert.equal(n(s.producer) + n(s.otherUsers), n(s.generation));
      assert.equal(n(s.generation) - n(i.baseline.generation), n(s.changeFromBaseline));
      assert.equal(n(s.otherUsers) - n(i.baseline.otherUsers), n(s.otherUsersChangeFromBaseline));
      assert.equal(n(s.producerChangeFromBaseline) + n(s.otherUsersChangeFromBaseline), n(s.changeFromBaseline));
    }
  }
  assert.deepEqual([i.constrained.changeFromBaseline.H.exact, i.constrained.changeFromBaseline.G.exact], ['0', '10']);
  assert.deepEqual([i.expandable.changeFromBaseline.H.exact, i.expandable.changeFromBaseline.G.exact], ['10', '0']);
  assert.deepEqual([i.constrained.otherUsersChangeFromBaseline.H.exact, i.constrained.otherUsersChangeFromBaseline.G.exact], ['-10', '10']);
  assert.deepEqual([i.expandable.otherUsersChangeFromBaseline.H.exact, i.expandable.otherUsersChangeFromBaseline.G.exact], ['0', '0']);
});

test('producer assignment and whole-system change answer different questions under the constrained stipulation', () => {
  const i = evaluateMarketResponseCase(input()).illustration;
  assert.equal(i.baseline.totalCO2Kg.exact, '48.8');
  assert.deepEqual([i.constrained.totalCO2Kg.exact, i.expandable.totalCO2Kg.exact], ['56.8', '49']);
  assert.deepEqual([i.constrained.totalCO2ChangeKg.exact, i.expandable.totalCO2ChangeKg.exact], ['8', '0.2']);
  assert.equal(i.constrained.producerAssignedCO2Kg.exact, '0.2');
  assert.equal(i.expandable.producerAssignedCO2Kg.exact, '0.2');
  assert.equal(i.constrained.otherUsersCO2ChangeKg.exact, '7.8');
  assert.equal(i.expandable.otherUsersCO2ChangeKg.exact, '0');
  assert.equal(i.constrained.producerAssignmentMinusTotalChangeKg.exact, '-7.8');
  assert.equal(i.expandable.producerAssignmentMinusTotalChangeKg.exact, '0');
  assert.equal(i.differenceBetweenScenarioIncrementsKg.exact, '7.8');
  const conditions = input().illustration;
  assert.equal(conditions.additionalDemandEqualsSelectedProducerOutput, true);
  assert.equal(conditions.responseFrame, 'static-before-after-same-abstract-period');
  assert.equal(conditions.hAndGInterchangeableWithinMarket, true);
  assert.equal(conditions.internalTransmissionConstraint, false);
  assert.equal(conditions.capacityOrDispatchMechanismIdentified, false);
  assert.equal(conditions.actualOutputChangesStipulated, true);
  assert.equal(i.realTechnologyFactors, false);
  assert.equal(i.empiricalResponseValidated, false);
  assert.equal(i.wholeLifeCycleModel, false);
});

test('closed v1 rejects altered historical identities, quantities, dimensions, boundaries or synthetic assumptions', () => {
  assert.deepEqual(validateMarketResponseCase(input()), []);
  const paths = [];
  const leaves = (value, path = []) => { for (const [key, nested] of Object.entries(value)) {
    if (nested !== null && typeof nested === 'object') leaves(nested, [...path, key]); else paths.push([...path, key]);
  } };
  leaves(input());
  for (const path of paths) {
    const spec = input(); let parent = spec;
    for (const key of path.slice(0, -1)) parent = parent[key];
    const key = path.at(-1); parent[key] = typeof parent[key] === 'boolean' ? !parent[key] : 'changed';
    assert(validateMarketResponseCase(spec).length, path.join('.'));
    assert.throws(() => evaluateMarketResponseCase(spec), /Invalid market-response/);
  }
  for (const spec of [null, [], true, {}, { ...input(), privateCapture: 'must not enter input' }]) assert(validateMarketResponseCase(spec).length);
  const numeric = input(); numeric.facts.production.value = 60277;
  assert(validateMarketResponseCase(numeric).length);
});

test('publication gate binds all nine complete numerical facts to the actual reading and original PDF', () => {
  assert.deepEqual(validateFixture(boundFixture()), []);
  const neutral = boundFixture(); neutral.published.sources[0].accessStatus = 'passages-inspected';
  assert.deepEqual(validateFixture(neutral), []);
  for (let index = 0; index < 9; index++) for (const field of ['id', 'value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = boundFixture(); f.published.evidence[0].numericFacts[index][field] = 'wrong';
    assert(validateFixture(f).length, `fact ${index}.${field}`);
  }
  const duplicate = boundFixture(); duplicate.published.evidence[0].numericFacts.push(duplicate.published.evidence[0].numericFacts[0]);
  assert(validateFixture(duplicate).length);
  const singular = boundFixture(); singular.published.evidence[0].numericFact = singular.published.evidence[0].numericFacts[0];
  assert(validateFixture(singular).length);
});

test('snapshot hashes and plausible summaries cannot rescue missing, duplicate, foreign or derived passage provenance', () => {
  const mutations = [
    f => { delete f.context.readingRegister; },
    f => { f.context = null; },
    f => { f.context.readingRegister.readings[0].passages = []; },
    f => { f.context.readingRegister.readings[0].artifacts[0].sha256 = '0'.repeat(64); },
    f => { f.context.readingRegister.readings[0].artifacts[0].kind = 'derived-text'; },
    f => { f.context.readingRegister.readings[0].artifacts[0].mediaType = 'text/plain'; },
    f => { f.context.readingRegister.readings[0].passages[0].artifactId = 'different-carrier'; },
    f => { f.context.readingRegister.readings.push(structuredClone(f.context.readingRegister.readings[0])); },
    f => { f.context.readingRegister.readings.push({ id: 'other-reading', passages: [], artifacts: f.context.readingRegister.readings[0].artifacts }); f.context.readingRegister.readings[0].artifacts = []; },
    f => { f.published.evidence[0].readingId = 'other-reading'; },
    f => { f.published.evidence[0].passageId = 'other-passage'; },
    f => { f.published.evidence[0].sourceId = 'other-source'; },
    f => { f.published.evidence.push(structuredClone(f.published.evidence[0])); },
    f => { f.published.sources.push(structuredClone(f.published.sources[0])); },
    f => { f.published.sources[0].reading.scope = ''; },
    f => { f.published.sources[0].accessStatus = 'abstract-only'; },
    f => { f.context.readingRegister.readings[0].readingStatus = 'unread'; },
  ];
  for (const mutate of mutations) {
    const f = boundFixture();
    // A matching default source snapshot alone is deliberately insufficient.
    f.published.sources[0].artifact = { mediaType: 'application/pdf', sha256: f.spec.source.sha256 };
    mutate(f); assert(validateFixture(f).length, mutate.toString());
  }
});
