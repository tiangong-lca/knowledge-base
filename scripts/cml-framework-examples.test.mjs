import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  cmlFrameworkExamplesInputShape,
  evaluateCmlFrameworkExamplesCase,
  validateCmlFrameworkExamplesCase,
  validateCmlFrameworkExamplesFacts,
} from './cml-framework-examples.mjs';

const input = () => JSON.parse(readFileSync(
  new URL('../knowledge/cases/cml-framework-examples-v1.json', import.meta.url), 'utf8',
));
const catalog = JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));
const readingRegister = JSON.parse(readFileSync(new URL('../knowledge/research/readings.json', import.meta.url), 'utf8'));
const exactValues = object => Object.values(object).map(entry => entry.exact);

test('the four process balances meet the same ten-bag demand at baseline and after the perturbation', () => {
  const spec = input(), before = JSON.stringify(spec);
  const { processDiagnosis: p, scope } = evaluateCmlFrameworkExamplesCase(spec);
  assert.equal(p.serviceBags.exact, '10');
  assert.deepEqual(exactValues(p.baseline.activities), ['10.2', '0.202', '0.1', '0.1']);
  assert.deepEqual(exactValues(p.sensitivity.finiteActivities), ['5101/510', '101/510', '0.1', '0.1']);
  assert.deepEqual(exactValues(p.baseline.netFlows), ['0', '0', '0', '0.1']);
  assert.deepEqual(p.sensitivity.finiteNetFlows, p.baseline.netFlows);
  assert.deepEqual(exactValues(p.baseline.wasteByProcessKg), ['20.4', '2.02', '0', '0.1']);
  assert.equal(p.baseline.totalWasteKg.exact, '22.52');
  assert.equal(p.baseline.electricityWasteShare.exact, '510/563');
  assert.equal(p.baseline.electricityUsedByAluminiumMJ.exact, '10.1');
  assert.equal(p.baseline.aluminiumShareOfElectricity.exact, '101/102');
  assert.equal(scope.historicalSoftwareExecuted, false);
  assert.equal(scope.physicalFeasibilityEstablished, false);
  assert.equal(JSON.stringify(spec), before);
});

test('preserves the printed determinant conflict and separates the derivative, elasticity and finite change', () => {
  const { determinants, sensitivity: s } = evaluateCmlFrameworkExamplesCase(input()).processDiagnosis;
  assert.equal(determinants.baseline.exact, '0.5');
  assert.equal(determinants.secondColumnReplacement.exact, '0.101');
  assert.equal(determinants.printedSecondColumnReplacement, '0.01');
  assert.equal(determinants.printedAluminiumActivity, '0.202');
  assert.equal(determinants.impliedByPrintedSecondAndComputedBaseline.exact, '0.02');
  assert.equal(s.wasteDerivativeKgPerCoefficientUnit.exact, '-44.44');
  assert.equal(s.aluminiumOutputElasticity.exact, '-1111/563');
  assert.equal(s.baselineAluminiumOutput.exact, '1');
  assert.equal(s.changedAluminiumOutput.exact, '1.01');
  assert.equal(s.localWasteChangePercent.fixed3, '-1.973');
  assert.equal(s.finiteWasteChangePercent.fixed3, '-1.935');
  assert.equal(s.finiteWasteKg.exact, '11263/510');
  assert.equal(s.printedAluminiumOutputElasticity, '-1.973');
  assert.equal(s.printedApproximateWasteDecreasePercent, '1.9');
});

test('CML factors reproduce two EPA central assignments, while two reported ranges cross bins', () => {
  const { selected } = evaluateCmlFrameworkExamplesCase(input()).epaScreening;
  const scoreTrace = ({ recomputedLowScore, recomputedCentralScore, recomputedHighScore, printedScore }) =>
    [recomputedLowScore, recomputedCentralScore, recomputedHighScore, printedScore];
  assert.deepEqual(scoreTrace(selected.acetone), [5, 5, 5, 5]);
  assert.deepEqual(scoreTrace(selected.toluene), [5, 3, 3, 3]);
  assert.deepEqual(scoreTrace(selected.methane), [9, 7, 7, 9]);
  assert.deepEqual(selected.acetone.intersectedScores, [5]);
  assert.deepEqual(selected.toluene.intersectedScores, [5, 3]);
  assert.deepEqual(selected.methane.intersectedScores, [9, 7]);
  assert.equal(selected.acetone.rangeOverlapsUnassignedGap, false);
  assert.equal(selected.toluene.rangeOverlapsUnassignedGap, true);
  assert.equal(selected.methane.rangeOverlapsUnassignedGap, true);
  assert.equal(selected.methane.printedScoreContext, 'EPA Table 2 category example');
  assert.equal(selected.methane.printedScoreMatchesCentral, false);
});

test('the input shape enumerates all reviewed fields, and the independent pin rejects changed inputs', () => {
  const spec = input();
  const shapeOf = value => value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)])) : null;
  assert.deepEqual(cmlFrameworkExamplesInputShape, shapeOf(spec));
  assert.deepEqual(validateCmlFrameworkExamplesCase(Object.fromEntries(Object.entries(spec).reverse())), []);
  const changes = [
    s => { s.processScenario.fixedOtherCoefficients = false; },
    s => { s.processScenario.increasePercent = '2'; },
    s => { s.facts.reportedSecondDeterminant.value = '0.101'; },
    s => { s.facts.score7Lower.value = '0.005'; },
    s => { s.facts.methaneReportedScore.value = '7'; },
    s => { s.screeningRule.gapConvention = 'round up'; },
    s => { s.scope.empiricalValidation = true; },
    s => { s.facts.bagDemand.privatePath = 'private'; },
  ];
  for (const change of changes) {
    const changed = input();
    change(changed);
    assert.throws(() => evaluateCmlFrameworkExamplesCase(changed), /exact reviewed/);
  }
});

function boundFixture() {
  const spec = input();
  const facts = Object.values(spec.facts);
  const sources = Object.values(spec.sources).map(pin => catalog.sources.find(source => source.id === pin.sourceId));
  const evidence = catalog.evidence.filter(record => facts.some(fact => fact.evidenceId === record.id));
  const readings = Object.values(spec.sources).map(pin => {
    const reading = readingRegister.readings.find(record => record.id === pin.readingId);
    return { ...reading, passages: reading.passages.filter(passage => facts.some(fact => fact.passageId === passage.id)) };
  });
  return structuredClone({ spec, published: { sources, evidence }, context: { readingRegister: { ...readingRegister, readings } } });
}

const validate = ({ spec, published, context }) => validateCmlFrameworkExamplesFacts(spec, published, context);
const factRecord = ({ spec, published }, key) => published.evidence.find(item => item.id === spec.facts[key].evidenceId);
const passageRecord = ({ spec, context }, key) => context.readingRegister.readings
  .flatMap(reading => reading.passages).find(passage => passage.id === spec.facts[key].passageId);

test('the public numeric tuples require exact values, units, meanings, and unambiguous fact identities', () => {
  assert.deepEqual(validate(boundFixture()), []);
  for (const key of ['bagDemand', 'acetoneLow', 'methaneReportedScore']) {
    for (const field of ['id', 'value', 'unit', 'quantity', 'subject', 'basis']) {
      const fixture = boundFixture();
      factRecord(fixture, key).numericFacts.find(fact => fact.id === fixture.spec.facts[key].factId)[field] = 'changed';
      assert(validate(fixture).some(error => error.includes(`facts.${key}: exact source fact`)));
    }
  }
  const duplicate = boundFixture(), record = factRecord(duplicate, 'bagDemand');
  record.numericFacts.push(record.numericFacts.find(fact => fact.id === duplicate.spec.facts.bagDemand.factId));
  assert(validate(duplicate).some(error => error.includes('facts.bagDemand: exact source fact')));
});

test('a matching public PDF snapshot cannot substitute for the actual original artifact and exact passage', () => {
  const changes = [
    f => { delete f.context.readingRegister; },
    f => { f.context.readingRegister.readings[1].artifacts[0].sha256 = '0'.repeat(64); },
    f => { f.context.readingRegister.readings[1].artifacts[0].kind = 'derived-text'; },
    f => { f.context.readingRegister.readings[1].artifacts[0].mediaType = 'text/plain'; },
    f => { f.context.readingRegister.readings[1].artifacts[0].pageCount = 35; },
    f => { f.context.readingRegister.readings[1].artifacts.push(f.context.readingRegister.readings[0].artifacts[0]); },
    f => { f.context.readingRegister.readings[1].passages.push(f.context.readingRegister.readings[0].passages[0]); },
    f => { f.context.readingRegister.readings[0].passages.find(p => p.id === f.spec.facts.methaneCentral.passageId).pdfIndices = [87]; },
    f => { factRecord(f, 'acetoneReportedScore').passageId = f.spec.facts.methaneReportedScore.passageId; },
    f => { f.published.evidence.push(factRecord(f, 'reportedSecondDeterminant')); },
    f => { f.published.sources[1].reading.scope = ''; },
  ];
  for (const change of changes) {
    const fixture = boundFixture();
    change(fixture);
    assert(validate(fixture).length, change.toString());
  }
});

test('printed-page drift, synchronized false locators, and incomplete page sets cannot change a selected citation', () => {
  const assertRejected = (key, mutate) => {
    const fixture = boundFixture();
    mutate(passageRecord(fixture, key), factRecord(fixture, key));
    assert(validate(fixture).some(error => error.includes(`facts.${key}: exact evidence`)));
  };
  assertRejected('score9Upper', passage => { passage.printedPages = '12'; });
  assertRejected('score9Upper', (passage, evidence) => {
    passage.locator = evidence.locator = passage.locator.replace('p11', 'p12');
    passage.pdfIndices.unshift(19);
  });
  assertRejected('bagDemand', passage => { passage.pdfIndices.shift(); });
});
