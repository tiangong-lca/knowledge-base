import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  evaluateServiceConstraintsCase,
  validateServiceConstraintsCase,
  validateServiceConstraintsFacts,
} from './service-constraints-case.mjs';

const inputUrl = new URL('../knowledge/cases/service-constraints-v1.json', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const input = () => JSON.parse(readFileSync(inputUrl, 'utf8'));
const vector = rows => rows.map(row => row.exact);
const matrix = rows => rows.map(vector);
const zero = ['0', '0', '0', '0', '0'];
const publishedActivities = ['1', '2.5', '0.5', '0.1', '0.5'];

test('the original activity vector meets all five natural-unit balances', () => {
  const spec = input();
  const natural = evaluateServiceConstraintsCase(spec).naturalUnits;
  assert.deepEqual(natural.rowUnits, ['MJ', 'kg', 'piece', 'piece', 'year']);
  assert.deepEqual(vector(natural.publishedActivities), publishedActivities);
  assert.deepEqual(matrix(natural.scaledMatrix), [
    ['1', '0', '-1', '0', '0'],
    ['0', '2.5', '-2.5', '0', '0'],
    ['0', '0', '0.5', '-0.5', '0'],
    ['0', '0', '0', '0.5', '-0.5'],
    ['0', '0', '0', '1', '0'],
  ]);
  assert.deepEqual(vector(natural.residualAtPublishedActivities), zero);
});

test('literal and derived disposal amounts give distinct scaled amounts and residuals', () => {
  const spec = input();
  const { printed, declaredRelationship } = evaluateServiceConstraintsCase(spec);
  assert.equal(printed.disposalEntry.exact, '20');
  assert.equal(printed.scaledDisposalReceipt.exact, '10');
  assert.deepEqual(vector(printed.residualAtPublishedActivities), ['0', '0', '0', '9', '0']);
  assert.equal(declaredRelationship.disposalEntry.exact, '2');
  assert.equal(declaredRelationship.disposalEntry.exact, spec.declaredRelationship.derivedDisposalEntryEURPerActivity);
  assert.equal(declaredRelationship.scaledDisposalReceipt.exact, spec.printed.scaledComparison.disposalReceiptEUR);
  assert.deepEqual(vector(declaredRelationship.residualAtPublishedActivities), zero);
  assert.deepEqual(vector(declaredRelationship.valueAddedByActivity), ['5', '2.5', '5', '-13.5', '1']);
  assert.equal(declaredRelationship.useCost.exact, '13.5');
});

test('aggregate agreement does not conceal the prose swap of electricity and wood costs', () => {
  const spec = input();
  const { chairProductionInputs } = evaluateServiceConstraintsCase(spec).declaredRelationship;
  assert.equal(chairProductionInputs.electricityCost.exact, '5');
  assert.equal(chairProductionInputs.woodCost.exact, '2.5');
  assert.equal(spec.printed.proseComparison.proseElectricityCostEUR, '2.5');
  assert.equal(spec.printed.proseComparison.proseWoodCostEUR, '5');
  assert.equal(chairProductionInputs.combinedCost.exact, '7.5');
  assert.deepEqual(chairProductionInputs.combinedProseCost, chairProductionInputs.combinedCost);
});

test('zero-priced sitting hides the one-year shortfall of the all-zero activity vector', () => {
  const { naturalUnits, printed, declaredRelationship } = evaluateServiceConstraintsCase(input());
  assert.deepEqual(vector(naturalUnits.residualAtZeroActivities), ['0', '0', '0', '0', '-1']);
  assert.deepEqual(vector(declaredRelationship.matrix[4]), zero);
  assert.deepEqual(vector(declaredRelationship.demand), zero);
  assert.equal(declaredRelationship.serviceRowIsZero, true);
  assert.deepEqual(vector(declaredRelationship.residualAtZeroActivities), zero);
  assert.deepEqual(vector(declaredRelationship.residualAtPublishedActivities), zero);
  assert.deepEqual(vector(printed.residualAtZeroActivities), zero);
});

test('restoration recovers the physical solution only with the declared monetary transformation', () => {
  const { restoration } = evaluateServiceConstraintsCase(input()).authorControls;
  assert.equal(restoration.sittingPerUseActivity.exact, '10');
  assert.equal(restoration.requiredSitting.exact, '1');
  assert.deepEqual(vector(restoration.declaredActivities), publishedActivities);
  assert.deepEqual(vector(restoration.declaredNaturalResidual), zero);
  assert.deepEqual(vector(restoration.declaredMonetaryResidual), zero);
  assert.deepEqual(vector(restoration.printedActivities), ['1', '2.5', '0.5', '0.1', '0.05']);
  assert.deepEqual(vector(restoration.printedNaturalResidual), ['0', '0', '0', '0.45', '0']);
  assert.deepEqual(vector(restoration.printedMonetaryResidual), zero);
});

test('a singular row map can drop a redundant balance without admitting additional activities', () => {
  const spec = input();
  const control = spec.authorControls.redundant;
  const [[a, b], [c, d]] = control.rowMap.map(row => row.map(BigInt));
  assert.equal(a * d - c * b, 0n);
  // Proportionality of both the coefficient and demand proves redundancy
  // for every activity, independently of the finite sample below.
  const [[firstCoefficient], [secondCoefficient]] = control.matrix.map(row => row.map(BigInt));
  const [firstDemand, secondDemand] = control.demand.map(BigInt);
  assert.equal(secondCoefficient * firstDemand, secondDemand * firstCoefficient);
  assert.notEqual(firstCoefficient, 0n);
  const { redundant } = evaluateServiceConstraintsCase(spec).authorControls;
  assert.equal(redundant.redundantForEveryActivity, true);
  assert.equal(redundant.activity.exact, '1');
  assert.deepEqual(redundant.samples.map(sample => vector(sample.naturalResidual)), [['-1', '-2'], ['0', '0'], ['1', '2']]);
  assert.deepEqual(redundant.samples.map(sample => vector(sample.mappedResidual)), [['-1', '0'], ['0', '0'], ['1', '0']]);
});

test('closed v1 protects original, derived and author-controlled inputs separately', () => {
  const publication = readJson('../knowledge/cases/service-constraints-v1.publication.json');
  assert.equal(createHash('sha256').update(readFileSync(inputUrl)).digest('hex'), publication.approvedInputSha256);
  assert.deepEqual(validateServiceConstraintsCase(input()), []);
  const changes = [
    [spec => { spec.printed.matrix[3][4] = '2'; }, /\.printed/],
    [spec => { spec.declaredRelationship.derivedDisposalEntryEURPerActivity = '20'; }, /\.declaredRelationship/],
    [spec => { spec.naturalUnits.rows[4].unit = 'hour'; }, /\.naturalUnits/],
    [spec => { spec.authorControls.redundant.demand[1] = '3'; }, /\.authorControls/],
    [spec => { spec.source.price.passageId = spec.source.model.passageId; }, /\.source/],
  ];
  for (const [mutate, expected] of changes) {
    const spec = input();
    mutate(spec);
    assert.throws(() => evaluateServiceConstraintsCase(spec), expected);
  }
});

test('fact binding checks quantity, basis and exact selected PDF passage, even on the same carrier', () => {
  const spec = input();
  const catalog = readJson('../knowledge/catalog.json');
  const readingRegister = readJson('../knowledge/research/readings.json');
  assert.deepEqual(validateServiceConstraintsFacts(spec, catalog, { readingRegister }), []);
  for (const key of ['value', 'unit', 'subject', 'quantity', 'basis']) {
    const altered = structuredClone(catalog);
    const evidence = altered.evidence.find(row => row.id === spec.source.conflict.evidenceId);
    const fact = evidence.numericFacts.find(row => row.id === 'printed-disposal');
    fact[key] = 'changed';
    assert.match(validateServiceConstraintsFacts(spec, altered, { readingRegister }).join('\n'), /printed-disposal.*mismatched public source fact/);
  }

  const alteredCatalog = structuredClone(catalog);
  const movedEvidence = alteredCatalog.evidence.find(row => row.id === spec.source.conflict.evidenceId);
  movedEvidence.passageId = spec.source.price.passageId;
  assert.match(validateServiceConstraintsFacts(spec, alteredCatalog, { readingRegister }).join('\n'), /printed-disposal.*mismatched inspected PDF passage carrier/);

  const alteredRegister = structuredClone(readingRegister);
  const reading = alteredRegister.readings.find(row => row.id === spec.source.readingId);
  reading.artifacts.find(row => row.id === spec.source.pdfArtifactId).sha256 = 'f'.repeat(64);
  assert.match(validateServiceConstraintsFacts(spec, catalog, { readingRegister: alteredRegister }).join('\n'), /service-per-use.*mismatched inspected PDF passage carrier/);
});
