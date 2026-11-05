import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalCaseInput, caseInputSha256, materializeCaseClaims, validateCasePublication } from './case-publication.mjs';
import { evaluateDairyRulesCase, validateDairyRulesCase, validateDairyRulesFacts } from './dairy-rules.mjs';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const input = () => readJson('../knowledge/cases/dairy-rules-v1.json');

function fixture() {
  const spec = input();
  const { sources, evidence } = readJson('../knowledge/catalog.json');
  const sourceIds = Object.values(spec.sources).map(source => source.sourceId);
  const evidenceIds = [...new Set(Object.values(spec.facts).map(fact => fact.evidenceId))];
  const published = {
    sources: sources.filter(source => sourceIds.includes(source.id)),
    evidence: evidence.filter(record => evidenceIds.includes(record.id)),
  };
  const context = { readingRegister: readJson('../knowledge/research/readings.json') };
  return { spec, published, context, evidenceIds };
}

function selectedReading({ spec, context }, sourceKey) {
  const selected = spec.sources[sourceKey];
  return context.readingRegister.readings.find(reading => reading.id === selected.readingId);
}

function selectedEvidence({ spec, published }, factKey) {
  return published.evidence.find(record => record.id === spec.facts[factKey].evidenceId);
}

const factErrors = f => validateDairyRulesFacts(f.spec, f.published, f.context);

test('washing arithmetic matches the electricity labels while exchange meaning and capital and storage bases stay open', () => {
  const { washing, storage, quantityColumn } = evaluateDairyRulesCase(input());
  assert.deepEqual([
    washing.milkLitres.exact, washing.glasses.exact, washing.cycles.exact, washing.soapKg.exact,
    washing.electricityMj.exact, washing.waterL.exact,
  ], ['1', '5', '0.125', '0.00125', '0.54', '1.875']);
  assert.deepEqual(washing.matchesDiagram, { cycles: true, soapKg: true });
  assert.equal(washing.diagram.electricityNodeLabelMj.exact, '0.54');
  assert.equal(washing.electricityNodeLabelEquality, true);
  assert.equal(washing.exchangeMeaningResolved, false);
  assert.deepEqual([
    washing.capital.defaultDevicesPerCycle.exact,
    washing.capital.lciDevicesPerCycle.exact,
    washing.capital.lciMatchesDefaultPerCycle,
    washing.capital.conditionalLciDevices.exact,
  ], ['1/1500', '1/1500', true, '1/12000']);
  assert.deepEqual([
    washing.capital.conditionalDefaultDevices.exact,
    washing.capital.conditionalDefaultDevicesRounded,
    washing.capital.diagramDevices.exact,
    washing.capital.matchesDiagram,
    washing.capital.basisClosed,
  ], ['1/12000', '0.00008333', '0.00000833', false, false]);
  assert.deepEqual([
    storage.conditionalWeightedDays.exact, storage.conditionalLitreDays.exact, storage.diagramLitreDays.exact,
    storage.matchesDiagram, storage.basisClosed,
  ], ['3.23', '9.69', '7.92', false, false]);
  assert.deepEqual([
    quantityColumn.unit, quantityColumn.washAmount.exact, quantityColumn.coldAmount.exact, quantityColumn.scalingExplained,
  ], ['p', '0.000125', '0.00792', false]);
});

test('stored climate results sum and compare at the precision printed in Table 45', () => {
  const { reportedClimate: climate } = evaluateDairyRulesCase(input());
  assert.deepEqual([
    climate.whole.exact, climate.washing.exact, climate.coldStorage.exact, climate.use.exact, climate.excludingUse.exact,
  ], [
    '1.5717578890000001', '0.069478624000000003', '0.012862507', '0.082341131000000003', '1.489416758000000097',
  ]);
  assert.deepEqual([
    climate.wholeRounded, climate.useRounded, climate.excludingUseRounded, climate.useSharePercentRounded,
  ], ['1.572', '0.0823', '1.49', '5.24']);
  assert.deepEqual(climate.roundedMatchesPdf, { use: true, excludingUse: true });
  assert.equal(climate.calculatedFromActivities, false);
  assert.deepEqual([climate.washingAt9Places, climate.coldStorageAt9Places, climate.useAt9Places],
    ['0.069478624', '0.012862507', '0.082341131']);
});

test('Niu uses percentage points and the fixed IPCC coefficient gives the same annual amount in both rations', () => {
  const { methane, scope } = evaluateDairyRulesCase(input());
  assert.deepEqual([
    methane.standard.ndfPercent.exact, methane.lowNdf.ndfPercent.exact, methane.grossEnergyMjPerCowDay.exact,
    methane.standard.niuDailyGrams.exact, methane.lowNdf.niuDailyGrams.exact,
  ], ['33.5', '27', '405.9', '413.805', '398.01']);
  assert.deepEqual([
    methane.standard.niuAnnualKg.fixed6, methane.lowNdf.niuAnnualKg.fixed6,
    methane.standardMinusLowNiuKg.exact, methane.standardMinusLowNiuKgRounded,
    methane.standard.ipccAnnualKg.exact, methane.standard.ipccAnnualKg.fixed6, methane.lowNdf.ipccAnnualKg.fixed6,
  ], ['151.038825', '145.273650', '5.765175', '5.8', '5629833/37100', '151.747520', '151.747520']);
  assert.deepEqual([
    methane.digestibleEnergyProvided, methane.ipccClassIndependentlyVerified,
    scope.nativeModelReproduced, scope.conformanceCertified, scope.environmentalEffectMeasured,
    scope.modelValidityEstablished, scope.ipccClassIndependentlyVerified, scope.electricityExchangeMeaningResolved,
    scope.nativeErrorDiagnosis,
  ], Array(9).fill(false));
});

test('v1 fixes reviewed facts and limits independently of the manifest and public evidence', () => {
  const spec = input();
  assert.deepEqual(validateDairyRulesCase(spec), []);
  assert.equal(Object.keys(spec.facts).length, 37);
  assert.equal(Object.keys(spec.sources).length, 7);
  assert.equal(canonicalCaseInput(spec), readFileSync(new URL('../knowledge/cases/dairy-rules-v1.json', import.meta.url), 'utf8'));

  for (const change of [
    candidate => { candidate.facts.ndfStandard.value = '33.5'; },
    candidate => { candidate.facts.ndfStandard.unit = 'g NDF/kg fresh ration'; },
    candidate => { candidate.facts.niuNdfCoeff.basis = 'NDF is a mass fraction'; },
    candidate => { candidate.facts.wholeClimate.locator = 'Info!H28'; },
    candidate => { candidate.facts.wholeClimate.pdfIndex = 27; },
    candidate => { candidate.sources['dairy-rp'].sha256 = '0'.repeat(64); },
    candidate => { candidate.facts.lciCapitalDenominator.basis = 'The source cell is a formula'; },
    candidate => { candidate.scope.ipccClassIndependentlyVerified = true; },
    candidate => { candidate.scope.electricityExchangeMeaningResolved = true; },
    candidate => { candidate.rounding.nativeErrorDiagnosis = true; },
  ]) {
    const candidate = input();
    change(candidate);
    assert.throws(() => evaluateDairyRulesCase(candidate), /exact reviewed dairy-rules v1 input/);
  }

  const annotated = input();
  annotated.facts.wholeClimate.privateCapture = { path: 'private' };
  assert.equal(canonicalCaseInput(annotated), canonicalCaseInput(spec));
  assert.notDeepEqual(validateDairyRulesCase(annotated), []);
});

test('catalog facts must preserve the approved value, unit, quantity, subject and basis', () => {
  for (const field of ['value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = fixture();
    const ndf = selectedEvidence(f, 'ndfStandard').numericFacts.find(fact => fact.id === 'nf-ndfStandard');
    ndf[field] = 'wrong';
    assert.match(factErrors(f).join('\n'), /facts\.ndfStandard: exact public fact/);
    f.spec.facts.ndfStandard[field] = ndf[field];
    assert.match(factErrors(f).join('\n'), /exact reviewed dairy-rules v1 input/);
  }
});

test('workbook facts require the original XLSX, reading, exact sheet or diagram locator and absent PDF bounds', () => {
  const sourceKey = 'dairy-rp';
  const artifactId = 'art-kb44-dairy-rp-xlsx';
  const passageId = 'psg-kb44-dairy-rp-results';
  const selectedArtifact = f => selectedReading(f, sourceKey).artifacts.find(artifact => artifact.id === artifactId);
  const selectedPassage = f => selectedReading(f, sourceKey).passages.find(passage => passage.id === passageId);
  for (const [change, expected] of [
    [f => { selectedArtifact(f).sha256 = '0'.repeat(64); }, /sources\.dairy-rp/],
    [f => { selectedArtifact(f).kind = 'derived-text'; }, /sources\.dairy-rp/],
    [f => { selectedReading(f, sourceKey).version += ' changed'; }, /sources\.dairy-rp/],
    [f => { selectedReading(f, sourceKey).workId = 'another-work'; }, /sources\.dairy-rp/],
    [f => { selectedEvidence(f, 'wholeClimate').readingId = f.spec.sources.dairy2025.readingId; }, /facts\.wholeClimate: exact inspected passage/],
    [f => { selectedEvidence(f, 'wholeClimate').locator = 'Info!H28'; }, /facts\.wholeClimate: exact inspected passage/],
    [f => { selectedPassage(f).locator = 'Info!H28'; }, /facts\.wholeClimate: exact inspected passage/],
    [f => { selectedPassage(f).artifactId = 'art-kb44-dairy-rp-entry-html'; }, /facts\.wholeClimate: exact inspected passage/],
    [f => { selectedPassage(f).pdfIndices = [27]; }, /facts\.wholeClimate: exact inspected passage/],
    [f => {
      const otherReading = selectedReading(f, 'dairy2025');
      otherReading.passages.push(structuredClone(selectedPassage(f)));
    }, /facts\.wholeClimate: exact inspected passage/],
  ]) {
    const f = fixture();
    change(f);
    assert.match(factErrors(f).join('\n'), expected);
  }
});

test('a PDF passage must cover the selected numerical page', () => {
  const f = fixture();
  const reading = selectedReading(f, 'niu2018');
  const passage = reading.passages.find(record => record.id === f.spec.facts.niuNdfCoeff.passageId);
  passage.pdfIndices = [8];
  assert.match(factErrors(f).join('\n'), /facts\.niuNdfCoeff: exact inspected passage/);
});

function publicationFixture() {
  const { spec, published, context, evidenceIds } = fixture();
  const publication = {
    schemaVersion: 1, caseId: spec.caseId, version: spec.version,
    inputFile: 'dairy-rules-v1.json', approvedInputSha256: caseInputSha256(spec),
    reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{
      id: 'test-dairy-rules',
      textTemplate: 'Test values are {{evaluated.washing.cycles.exact}} and {{evaluated.methane.lowNdf.niuAnnualKg.fixed6}}.',
      kind: 'interpretation', scope: 'Test fixture for the registered publication adapter.',
      evidenceIds, premiseIds: [], conceptIds: [], caveats: [],
    }],
  };
  const catalog = {
    schemaVersion: 1, ...published, claims: materializeCaseClaims(spec, publication),
    concepts: [], mappings: [], coverage: [],
  };
  return { spec, publication, catalog, context, evidenceIds };
}

test('the registered adapter uses the reviewed public closure and the actual reading context', () => {
  const { spec, publication, catalog, context, evidenceIds } = publicationFixture();
  assert.equal(catalog.claims[0].text, 'Test values are 0.125 and 145.273650.');
  assert.deepEqual(validateCasePublication(spec, publication, catalog, context), []);
  assert.match(validateCasePublication(spec, publication, catalog).join('\n'), /actual reading register required/);

  publication.claims[0].evidenceIds = evidenceIds.filter(id => id !== 'ev-kb44-dairy-rp-quantity-limits');
  catalog.claims = materializeCaseClaims(spec, publication);
  assert.match(validateCasePublication(spec, publication, catalog, context).join('\n'), /facts\.tableColdAmount: exact public fact/);
});

test('LCI facts reject both a coordinated carrier change and rebinding the selected passage to the landing page', () => {
  const sourceKey = 'dairy-lci';
  const artifactId = 'art-kb44-dairy-lci-xlsx';
  const passageId = 'psg-kb44-dairy-lci-dishwasher';
  const selectedPassage = f => selectedReading(f, sourceKey).passages.find(passage => passage.id === passageId);

  const changedHash = publicationFixture();
  const lciSource = changedHash.catalog.sources.find(source => source.id === 'src-kb44-dairy-lci');
  const lciArtifact = selectedReading(changedHash, sourceKey).artifacts.find(artifact => artifact.id === artifactId);
  lciSource.artifact.sha256 = '0'.repeat(64);
  lciArtifact.sha256 = lciSource.artifact.sha256;
  assert.match(
    validateCasePublication(changedHash.spec, changedHash.publication, changedHash.catalog, changedHash.context).join('\n'),
    /sources\.dairy-lci: exact inspected work, edition, reading and original carrier/,
  );

  const rebound = publicationFixture();
  selectedPassage(rebound).artifactId = 'art-kb44-dairy-lci-entry-html';
  assert.match(
    validateCasePublication(rebound.spec, rebound.publication, rebound.catalog, rebound.context).join('\n'),
    /facts\.lciCapitalDenominator: exact inspected passage/,
  );

  const inventedBounds = publicationFixture();
  selectedPassage(inventedBounds).pdfIndices = [28];
  assert.match(
    validateCasePublication(inventedBounds.spec, inventedBounds.publication, inventedBounds.catalog, inventedBounds.context).join('\n'),
    /facts\.lciCapitalNumerator: exact inspected passage/,
  );
});
