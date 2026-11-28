import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { caseInputSha256, validateCasePublication } from './case-publication.mjs';
import {
  validateWallExtensionCase,
  validateWallExtensionParentLink,
  validateWallExtensionFacts,
  evaluateWallExtensionCase,
} from './wall-extension.mjs';

const ext = () => JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-extension-v1.json', import.meta.url), 'utf8'));
const pub = () => JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-extension-v1.publication.json', import.meta.url), 'utf8'));
const wall = () => JSON.parse(readFileSync(new URL('../knowledge/cases/wall-coating-v1.json', import.meta.url), 'utf8'));
const catalog = () => JSON.parse(readFileSync(new URL('../knowledge/catalog.json', import.meta.url), 'utf8'));

test('wall-coating-extension-v1 passes schema, immutable parent hash lock, and primary-source fact binding', () => {
  const spec = ext(), parent = wall();
  assert.deepEqual(validateWallExtensionCase(spec), []);
  assert.deepEqual(validateWallExtensionParentLink(spec, parent, caseInputSha256(parent)), []);
  assert.deepEqual(validateWallExtensionFacts(spec, catalog()), []);
});

test('wall-coating-extension-v1 detects tampered inputs, parent mismatch, and corrupted primary-source facts', () => {
  const bad = ext();
  bad.electricityGrid.fossilMarginalTheta = '0.70';
  assert(validateWallExtensionCase(bad).length > 0);
  assert(validateWallExtensionFacts(bad, catalog()).length > 0);
  assert(validateWallExtensionParentLink(ext(), wall(), '0'.repeat(64)).length > 0);

  // Tampered source accessStatus
  const badStatusCat = catalog();
  badStatusCat.sources.find(s => s.id === 'src-weight135-ef31-selected-members').accessStatus = 'metadata-only';
  assert(validateWallExtensionFacts(ext(), badStatusCat).length > 0);

  // Tampered numericFact value
  const badFactCat = catalog();
  const ev = badFactCat.evidence.find(e => e.id === 'ev-weight135-ef31-pof-equal-cf');
  ev.numericFacts.find(f => f.id === 'nf-weight135-ef31-pof-nmvoc-outdoor').value = '2.0';
  assert(validateWallExtensionFacts(ext(), badFactCat).length > 0);

  // Missing evidence
  const missingEvCat = catalog();
  missingEvCat.evidence = missingEvCat.evidence.filter(e => e.id !== 'ev-ped-completeness-factors');
  assert(validateWallExtensionFacts(ext(), missingEvCat).length > 0);
});

test('wall-coating-extension-v1 publication round-trip matches canonical catalog claims', () => {
  assert.deepEqual(validateCasePublication(ext(), pub(), catalog()), []);
});

test('wall-coating-extension-v1 exact arithmetic across all six cross-part modules', () => {
  const r = evaluateWallExtensionCase(ext());

  // Module 1: average vs. fossil/clean marginal electricity supply
  assert.equal(r.electricityGrid.average.smoothDeltaBMinusAKgCO2eq.exact, '1.562');
  assert.equal(r.electricityGrid.average.smoothWithinTolerance, true);
  assert.equal(r.electricityGrid.fossilMarginal.smoothDeltaBMinusAKgCO2eq.exact, '5.062');
  assert.equal(r.electricityGrid.fossilMarginal.smoothWithinTolerance, false);
  assert.equal(r.electricityGrid.cleanMarginal.smoothDeltaBMinusAKgCO2eq.exact, '-0.638');
  assert.equal(r.electricityGrid.cleanMarginal.smoothLower, 'paintB');
  assert.equal(r.electricityGrid.cleanMarginal.roughDeltaBMinusAKgCO2eq.exact, '6.524');
  assert.equal(r.electricityGrid.cleanMarginal.roughLower, 'paintA');
  assert.equal(r.electricityGrid.smoothCrossoverTheta.exact, '0.1438');
  assert.equal(r.electricityGrid.roughPrepClimateSwingAtAverageKgCO2eq.exact, '11.562');
  assert.equal(r.electricityGrid.cleanToFossilSmoothDeltaSwingKgCO2eq.fixed3, '5.700');

  // Module 2: NMVOC photochemical ozone & indoor compartment erasure
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.paintA.exact, '0.2');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.paintBSmooth.exact, '1.5');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.smoothDeltaBMinusA.exact, '1.3');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.smoothRatioBToA.exact, '7.5');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.paintBRough.exact, '2');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.roughDeltaBMinusA.exact, '1.8');
  assert.equal(r.photochemicalOzone.outdoorEf31KgNmvocEq.roughRatioBToA.exact, '10');
  assert.equal(r.photochemicalOzone.indoorEf31KgNmvocEq.omittedCompartmentErasesSignal, true);

  // Module 3: Blue water & regional AWARE-style scarcity
  assert.equal(r.waterScarcity.consumptionM3.paintA.exact, '0.02');
  assert.equal(r.waterScarcity.consumptionM3.paintBSmooth.exact, '0.003');
  assert.equal(r.waterScarcity.consumptionM3.paintBRough.exact, '0.008');
  assert.equal(r.waterScarcity.uniformHumidM3WorldEq.paintA.exact, '0.04');
  assert.equal(r.waterScarcity.uniformHumidM3WorldEq.paintBSmooth.exact, '0.006');
  assert.equal(r.waterScarcity.paintAAridPaintBHumidM3WorldEq.paintA.exact, '1.6');
  assert.equal(r.waterScarcity.paintAAridPaintBHumidM3WorldEq.paintAFactorJump.exact, '40');

  // Module 4: Two-category partial EF 3.1 normalization & weighting
  assert.equal(r.normalizationWeighting.cleanGridSmooth.climateKgCO2eq.deltaBMinusA.exact, '-0.438');
  assert.equal(r.normalizationWeighting.cleanGridSmooth.weightedMilliPtOutdoor.paintATotal.fixed3, '0.902');
  assert.equal(r.normalizationWeighting.cleanGridSmooth.weightedMilliPtOutdoor.paintBTotal.fixed3, '2.411');
  assert.equal(r.normalizationWeighting.cleanGridSmooth.weightedMilliPtOutdoor.lowerWithOutdoorPof, 'paintA');
  assert.equal(r.normalizationWeighting.cleanGridSmooth.weightedMilliPtIndoorOmitted.lowerWhenIndoorPofOmitted, 'paintB');

  // Module 5: User-perspective LCC & 5% discounting
  assert.equal(r.lifeCycleCosting.undiscounted.paintACU.exact, '1100');
  assert.equal(r.lifeCycleCosting.undiscounted.paintBSmoothCU.exact, '760');
  assert.equal(r.lifeCycleCosting.undiscounted.smoothDeltaBMinusACU.exact, '-340');
  assert.equal(r.lifeCycleCosting.undiscounted.smoothPaintBSavingsCU.exact, '340');
  assert.equal(r.lifeCycleCosting.undiscounted.paintBRoughCU.exact, '1110');
  assert.equal(r.lifeCycleCosting.undiscounted.roughDeltaBMinusACU.exact, '10');
  assert.equal(r.lifeCycleCosting.discounted5Pct.paintACU.fixed2, '980.94');
  assert.equal(r.lifeCycleCosting.discounted5Pct.smoothDeltaBMinusACU.fixed2, '-220.94');
  assert.equal(r.lifeCycleCosting.discounted5Pct.smoothPaintBSavingsCU.fixed2, '220.94');
  assert.equal(r.lifeCycleCosting.discounted5Pct.roughDeltaBMinusACU.fixed2, '129.06');

  // Module 6: Pedigree completeness GSD (Ciroth 2012 Table 7 scores 2 vs. 4)
  assert.equal(r.pedigreeUncertainty.score2.gsdTotal, '1.2029');
  assert.equal(r.pedigreeUncertainty.score2.low95KgCO2, '12.44');
  assert.equal(r.pedigreeUncertainty.score2.high95KgCO2, '26.04');
  assert.equal(r.pedigreeUncertainty.score4.gsdTotal, '1.2188');
  assert.equal(r.pedigreeUncertainty.score4.low95KgCO2, '12.12');
  assert.equal(r.pedigreeUncertainty.score4.high95KgCO2, '26.74');
  assert.equal(r.pedigreeUncertainty.widthIncreaseKgCO2, '1.02');
  assert.equal(r.pedigreeUncertainty.widthIncreasePct, '7.5');
});
