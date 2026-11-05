import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  evaluateRecoveredPaperCase, validateRecoveredPaperCase, validateRecoveredPaperFacts,
} from './recovered-paper.mjs';

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}

function input() {
  return readJson('../knowledge/cases/recovered-paper-v1.json');
}

function publicationFixture() {
  const spec = input();
  const catalog = readJson('../knowledge/catalog.json');
  const register = readJson('../knowledge/research/readings.json');
  const sourceIds = Object.values(spec.sources).map(source => source.sourceId);
  const readingIds = Object.values(spec.sources).map(source => source.readingId);
  return {
    spec,
    published: {
      sources: catalog.sources.filter(source => sourceIds.includes(source.id)),
      evidence: catalog.evidence.filter(evidence => sourceIds.includes(evidence.sourceId)),
    },
    context: {
      readingRegister: {
        schemaVersion: register.schemaVersion,
        readings: register.readings.filter(reading => readingIds.includes(reading.id)),
      },
    },
  };
}

function findFact(fixture, key) {
  const binding = fixture.spec.facts[key];
  const evidence = fixture.published.evidence.find(entry => entry.id === binding.evidenceId);
  return evidence.numericFacts.find(fact => fact.id === binding.factId);
}

function factErrors(fixture) {
  return validateRecoveredPaperFacts(fixture.spec, fixture.published, fixture.context);
}

test('830 material statistics and 1057 scenario routing retain their distinct denominators', () => {
  const { upstreamStatistics: statistics, annualRouting: annual } = evaluateRecoveredPaperCase(input());

  assert.equal(statistics.massUnit, 't/year');
  assert.equal(statistics.packagingSupply.exact, '346371');
  assert.equal(statistics.collected.exact, '274780');
  assert.equal(statistics.printedRateNumerator.exact, '274704');
  assert.equal(statistics.collectedMinusPrintedRateNumerator.exact, '76');
  assert.equal(statistics.collectionPercentRounded1, '79.3');
  assert.equal(statistics.printedNumeratorPercentRounded1, '79.3');
  assert.equal(statistics.reconciledToReport1057, false);

  assert.equal(annual.massUnit, '1000 t/year');
  assert.equal(annual.collectionPlusIncineration.exact, '346');
  assert.equal(annual.useMinusRouted.exact, '0');
  assert.equal(annual.convertingWasteInCollection.exact, '66');
  assert.equal(annual.domesticFeed.exact, '183');
  assert.equal(annual.calculatedMinusReportedDomesticFeed.exact, '0');
});

test('finished-paper amounts and modeled grade credits preserve different quantities', () => {
  const { recyclingYield: yieldResult, annualSubstitution: annual, gradeSubstitution: grade,
    empiricalReuseVerified, fibreLifeVerified, marketRegimeVerified } = evaluateRecoveredPaperCase(input());

  assert.deepEqual([
    yieldResult.linerFlutingPerKg.exact, yieldResult.boardPerKg.exact, yieldResult.totalPerKg.exact,
  ], ['48/61', '23/183', '167/183']);
  assert.equal(yieldResult.reportedPaperOutputShortfall.exact, '0.087');
  assert.equal(yieldResult.closedFibreLedger, false);

  assert.equal(annual.extraRecoveredFeed.exact, '18000');
  assert.equal(annual.extraRecoveredProduct.exact, '16000');
  assert.equal(annual.modelAvoidedVirginLinerFluting.exact, '12800');
  assert.equal(annual.measuredVirginDisplacement, false);

  assert.equal(yieldResult.reportedLinerFlutingPerKg.exact, '0.787');
  assert.equal(grade.linerFlutingFromReportedGradeMass.exact, '0.6296');
  assert.equal(grade.boardFromReportedGradeMass.exact, '0.126');
  assert.equal(grade.linerFlutingMultiplier.exact, '0.8');
  assert.equal(grade.boardMultiplier.exact, '1');
  assert.equal(grade.annualStrengthRatioReciprocal.exact, grade.linerFlutingMultiplier.exact);
  assert.equal(Object.keys(grade).some(key => /total|aggregate/i.test(key)), false);
  assert.deepEqual([empiricalReuseVerified, fibreLifeVerified, marketRegimeVerified], [false, false, false]);
});

test('matching heat and power uses displayed inputs, and the heat-only difference stays visible', () => {
  const { mixedEnergy, heatOnly, originalProcessModelReproduced, environmentalRankingEstablished } =
    evaluateRecoveredPaperCase(input());
  assert.equal(mixedEnergy.deliveredElectricity.exact, '2.81925');
  assert.equal(mixedEnergy.deliveredHeat.exact, '7.518');
  assert.equal(mixedEnergy.reportedDeliveredTotal.exact, '10.34');
  assert.equal(mixedEnergy.aggregate.avoidedGas.exact, '94/7');
  assert.equal(mixedEnergy.aggregate.avoidedGasRounded1, '13.4');
  assert.equal(mixedEnergy.matched.displacedChpOutput.exact, '15.04');
  assert.equal(mixedEnergy.matched.missingElectricity.exact, '4.7');
  assert.equal(mixedEnergy.matched.netAvoidedGas.exact, '1927/195');
  assert.equal(mixedEnergy.matched.netAvoidedGasRounded2, '9.88');

  assert.equal(heatOnly.sourceReportedExergyAvoidedGas.exact, '3.4');
  assert.equal(heatOnly.sourceReportedExpandedAvoidedGas.exact, '6.04');
  assert.equal(heatOnly.conditionalMixedEfficienciesAvoidedGas.fixed6, '5.654564');
  assert.equal(heatOnly.conditionalMinusReportedExpanded.exact, '-1879/4875');
  assert.equal(heatOnly.sourceExergyCalculationReproduced, false);
  assert.equal(heatOnly.sourceExpansionCalculationReproduced, false);
  assert.equal(heatOnly.sourceResultRepaired, false);
  assert.deepEqual([originalProcessModelReproduced, environmentalRankingEstablished], [false, false]);
});

test('the approved case requires both publications and rejects a coordinated replacement of a numeric basis', () => {
  const fixture = publicationFixture();
  assert.deepEqual(validateRecoveredPaperCase(fixture.spec), []);
  assert.deepEqual(factErrors(fixture), []);

  const rawOutput = findFact(fixture, 'reportedLinerPerKg');
  rawOutput.basis = 'modeled virgin displacement per kg';
  assert(factErrors(fixture).some(error => error.includes('facts.reportedLinerPerKg')));
  fixture.spec.facts.reportedLinerPerKg.basis = rawOutput.basis;
  assert(factErrors(fixture).length);
  assert.throws(() => evaluateRecoveredPaperCase(fixture.spec), /exact reviewed recovered-paper v1 input/);

  const assertedClosure = input();
  assertedClosure.interpretation.closedFibreLedger = true;
  assert(validateRecoveredPaperCase(assertedClosure).length);
  const assertedRegime = input();
  assertedRegime.interpretation.marketRegimeVerified = true;
  assert(validateRecoveredPaperCase(assertedRegime).length);
});

test('equal-valued CHP share and power-only efficiency still need distinct approved tuples', () => {
  const fixture = publicationFixture();
  const heatShare = findFact(fixture, 'chpHeatShare');
  const powerEfficiency = findFact(fixture, 'powerEfficiency');
  assert.equal(heatShare.value, powerEfficiency.value);
  const approvedId = heatShare.id;
  Object.assign(heatShare, powerEfficiency, { id: approvedId });
  assert(factErrors(fixture).some(error => error.includes('facts.chpHeatShare')));
});

test('domestic grade ratios require the original Table 3.1 PDF page', () => {
  const fixture = publicationFixture();
  const { linerSubstitution, boardSubstitution } = fixture.spec.facts;
  assert.equal(linerSubstitution.pdfIndex, 39);
  assert.equal(boardSubstitution.pdfIndex, 39);

  const reading = fixture.context.readingRegister.readings.find(entry => entry.id === fixture.spec.sources.dk1057.readingId);
  const passage = reading.passages.find(entry => entry.id === linerSubstitution.passageId);
  passage.pdfIndices = [44]; // The later quality discussion cannot stand in for Table 3.1.
  const errors = factErrors(fixture);
  assert(errors.some(error => error.includes('facts.linerSubstitution')));
  assert(errors.some(error => error.includes('facts.boardSubstitution')));
});

test('numerical evidence must resolve to its actual unambiguous original PDF page', () => {
  for (const mutate of [
    fixture => { delete fixture.context.readingRegister; },
    fixture => {
      const reading = fixture.context.readingRegister.readings.find(entry => entry.id === fixture.spec.sources.dk1057.readingId);
      reading.artifacts[0].sha256 = '0'.repeat(64);
    },
    fixture => {
      const reading = fixture.context.readingRegister.readings.find(entry => entry.id === fixture.spec.sources.dk830.readingId);
      reading.artifacts[0].kind = 'derived-text';
    },
    fixture => {
      const reading = fixture.context.readingRegister.readings.find(entry => entry.id === fixture.spec.sources.dk1057.readingId);
      const passage = reading.passages.find(entry => entry.id === fixture.spec.facts.annualUse.passageId);
      passage.pdfIndices = [64]; // Fig. 4.3 remains, but the numerical source Table 4.5 is absent.
    },
    fixture => {
      const readings = fixture.context.readingRegister.readings;
      const source = fixture.spec.sources.dk1057;
      const reading = readings.find(entry => entry.id === source.readingId);
      const other = readings.find(entry => entry.id !== source.readingId);
      const passage = reading.passages.find(entry => entry.id === fixture.spec.facts.annualUse.passageId);
      other.passages.push(structuredClone(passage));
    },
    fixture => {
      const binding = fixture.spec.facts.statsCollected;
      const evidence = fixture.published.evidence.find(entry => entry.id === binding.evidenceId);
      evidence.numericFacts.push(structuredClone(findFact(fixture, 'statsCollected')));
    },
  ]) {
    const fixture = publicationFixture();
    mutate(fixture);
    assert(factErrors(fixture).length);
  }
});
