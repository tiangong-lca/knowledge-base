import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { evaluatePackStudyCase, validatePackStudyCase, validatePackStudyFacts, strictPrimaryUseThreshold } from './pack-study.mjs';
import { caseInputSha256, publicTeachingCase, canonicalCaseInput, caseTemplateContext, materializeCaseClaims,
  validateCasePublications, caseEvaluationReceipt } from './case-publication.mjs';
const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/pack-study-v1.json', import.meta.url), 'utf8'));
const pages = { flow: [16, 17], capacity: [78], secondary: [29, 30], 'hdpe-impacts': [35],
  'ldpe-impacts': [40], sensitivity: [45], cotton: [43], thresholds: [60] };
function fixture() {
  const spec = input(), source = spec.source, records = new Map();
  for (const fact of Object.values(spec.facts)) {
    if (!records.has(fact.evidenceId)) records.set(fact.evidenceId, { id: fact.evidenceId,
      sourceId: source.sourceId, readingId: source.readingId, passageId: fact.passageId,
      locator: 'Selected original report table', summary: 'Fixture exact numeric binding', relation: 'supports', numericFacts: [] });
    records.get(fact.evidenceId).numericFacts.push(Object.fromEntries([
      ['id', fact.factId], ...['value', 'unit', 'quantity', 'subject', 'basis'].map(key => [key, fact[key]]),
    ]));
  }
  const catalog = { schemaVersion: 1, sources: [{ id: source.sourceId, title: 'Selected original report',
    url: 'https://example.org/report.pdf', version: source.version, publisher: 'Fixture', accessedAt: '2026-11-05',
    accessStatus: 'public-passages-inspected', rights: 'Metadata and numerical facts only', preservation: 'Fixed original PDF identity',
    artifact: { mediaType: 'application/pdf', sha256: source.sha256, resolvedUrl: 'https://example.org/report.pdf' },
    reading: { readingId: source.readingId, status: 'selected-passages', checkedAt: '2026-11-05', scope: 'Specified tables only' } }],
    evidence: [...records.values()], claims: [], concepts: [], mappings: [], coverage: [] };
  const reading = { id: source.readingId, version: source.version, workId: source.workId, readingStatus: 'selected-passages',
    artifacts: [{ id: source.artifactId, mediaType: 'application/pdf', sha256: source.sha256 }],
    passages: Object.entries(pages).map(([group, pdfIndices]) => ({ id: `psg-pack-ea2011-${group}`,
      artifactId: source.artifactId, printedPages: pdfIndices.map(index => index + 1).join(', '), pdfIndices })) };
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'pack-study-v1.json',
    approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{ id: 'fixture-pack', kind: 'calculation', scope: 'Selected report arithmetic', evidenceIds: [...records.keys()],
      premiseIds: ['fixture-pack-premise'], conceptIds: [], mappingIds: [], caveats: ['Displayed source precision; no raw model reproduction'],
      reasoning: 'Keep source-reported values and reconstructed values separate.',
      textTemplate: 'D={{evaluated.creditInterpolation.atReportMultipliedShare.exact}}; n={{evaluated.threeUseComparison.minimumTotalUses}}; all={{evaluated.categoryComparison.allCategoriesLower}}.' }] };
  catalog.claims = [...structuredClone(materializeCaseClaims(spec, publication)), { id: 'fixture-pack-premise',
    text: 'The selected report values retain their displayed precision and original units.', kind: 'source-statement',
    scope: 'Selected report tables only', evidenceIds: [...records.keys()], premiseIds: [], conceptIds: [], mappingIds: [],
    caveats: [], status: 'reviewed', reviewedAt: '2026-11-05', reviewKind: 'agent-source-check' }];
  return { spec, catalog, publication, context: { readingRegister: { schemaVersion: 1, readings: [reading] } } };
}
const factErrors = f => validatePackStudyFacts(f.spec, f.catalog, f.context);
const publicationErrors = f => validateCasePublications([{ spec: f.spec, publication: f.publication, inputFile: f.publication.inputFile }], f.catalog, f.context);

test('483-item service keeps reported flow, applied rounded capacities, survey counts and mass bases separate', () => {
  const spec = input(), before = JSON.stringify(spec), r = evaluatePackStudyCase(spec);
  assert.deepEqual(validatePackStudyCase(spec), []);
  const h = r.service.hdpe, l = r.service.ldpe;
  assert.deepEqual([h.reportedReferenceFlow.exact, h.referenceFlowFromAppliedCapacity.exact,
    h.gramsFromPrintedFlowAndMass.exact, h.gramsFromRecomputedFlowAndPrintedMass.exact], ['82.14', '575/7', '666.9768', '667']);
  assert.deepEqual([l.reportedReferenceFlow.exact, l.referenceFlowFromAppliedCapacity.exact,
    l.gramsFromPrintedFlowAndMass.exact, l.gramsFromRecomputedFlowAndPrintedMass.exact], ['60.68', '12075/199', '2120.1592', '843801/398']);
  assert.equal(h.observedCountRatioItemsPerBag.exact, '14651/2490');
  assert.equal(l.observedCountRatioItemsPerBag.exact, '191/24');
  assert.equal(h.serviceFlowFromObservedCountRatio.exact, '7470/91');
  assert.equal(l.serviceFlowFromObservedCountRatio.exact, '11592/191');
  assert.equal(h.observedCountRatioReplacesAppliedCapacity, false);
  assert.equal(l.observedCountRatioReplacesAppliedCapacity, false);
  assert.equal(JSON.stringify(spec), before);
});

test('report multiplication and volume-matched avoided mass retain respondent-share and rounding limits', () => {
  const r = evaluatePackStudyCase(input()).secondaryReuse;
  assert.equal(r.reportMultiplication.exact, '0.4028');
  assert.equal(r.reportedScenarioShare.exact, '0.4028');
  assert.equal(r.multiplicationMinusReportedShare.exact, '0');
  assert.equal(r.avoidedGramsPerSecondarilyReusedBag.exact, '17763/2930');
  assert.equal(r.sourceReportedAvoidedGrams.exact, '6.1');
  assert.equal(r.calculatedMinusReportedAvoidedGrams.exact, '-11/293');
  assert.equal(r.directBagLevelReplacementProbabilityObserved, false);
});

test('endpoint-defined interpolation compares its middle residual without claiming native-model reproduction', () => {
  const r = evaluatePackStudyCase(input()).creditInterpolation;
  assert.equal(r.endpointDifference.exact, '1.252');
  assert.equal(r.atReportMultipliedShare.exact, '1.5776944');
  assert.equal(r.interpolatedMinusReportedMiddle.exact, '-0.0003056');
  assert.equal(r.interpolatedMiddleRounded3, '1.578');
  assert.match(r.status, /interpolation.*not an upstream/);
  assert.equal(r.nativeProcessModelReproduced, false);
});

test('strict total-use threshold excludes equality and distinguishes total uses from additional reuses', () => {
  assert.equal(strictPrimaryUseThreshold('10', '2').minimumTotalUses, '6');
  assert.equal(strictPrimaryUseThreshold('10', '2').additionalReuses, '5');
  assert.equal(strictPrimaryUseThreshold('10', '2').previousIsStrictlyLower, false);
  assert.equal(strictPrimaryUseThreshold('1', '2').minimumTotalUses, '1');
  assert.equal(strictPrimaryUseThreshold('1', '2').additionalReuses, '0');
  for (const [B, D] of [['0', '2'], ['1', '0'], ['-1', '2'], ['1', '-2']])
    assert.throws(() => strictPrimaryUseThreshold(B, D), /Positive burden/);
  const r = evaluatePackStudyCase(input());
  for (const [key, count] of Object.entries({ noCredit: '4', reportedCredit: '5', fullCredit: '9' })) {
    const row = r.thresholds.ldpe[key];
    assert.equal(row.minimumTotalUses, count); assert.equal(row.sourceReportedTotalUses, count);
    assert.equal(row.matchesSourceReported, true); assert.equal(row.strictlyLowerAtMinimum, true);
    assert.equal(row.previousIsStrictlyLower, false);
  }
  assert.equal(r.threeUseComparison.baseline.exact, '0.526');
  assert.equal(r.threeUseComparison.minimumTotalUses, '14');
  assert.equal(r.threeUseComparison.additionalReuses, '13');
  assert.equal(r.threeUseComparison.sourceTableFourthColumnTotalUses, '12');
  assert.equal(r.threeUseComparison.sourceFourthCountIsStrictlyLowerUnderDeclaredCondition, false);
  assert.equal(r.threeUseComparison.sourceTableFourthColumnBurden.exact, '0.577');
  assert.equal(r.threeUseComparison.sourceFourthColumnSecondaryCreditExplicit, false);
  assert.equal(r.threeUseComparison.sourceHeaderContextRepaired, false);
});

test('cotton strict reconstruction retains 328 versus source 327 as an unresolved printed-data discrepancy', () => {
  const r = evaluatePackStudyCase(input()).thresholds.cottonFullCredit;
  assert.equal(r.minimumTotalUses, '328'); assert.equal(r.sourceReportedTotalUses, '327');
  assert.equal(r.matchesSourceReported, false); assert.equal(r.sourceReportedCountIsStrictlyLower, false);
  assert.equal(r.burdenAtSourceReportedCount.exact, '90511/109000');
  assert.equal(r.discrepancyCauseEstablished, false); assert.equal(r.sourceCountRepaired, false);
});

test('all nine categories are evaluated separately; carbon threshold does not imply abiotic depletion wins', () => {
  const r = evaluatePackStudyCase(input()).categoryComparison;
  assert.equal(r.totalCategories, '9'); assert.equal(r.lowerCategoriesFromCalculatedDivision, '8');
  assert.equal(r.lowerCategoriesFromPrintedFiveUseColumn, '8'); assert.equal(r.allCategoriesLower, false);
  assert.equal(r.carbonThresholdGuaranteesAllCategoriesLower, false);
  const expected = {
    gwp: ['1.3848', '1.385', '5'], abiotic: ['16.5422', '16.542', '6'], acidification: ['5.868', '5.868', '3'],
    eutrophication: ['0.5152', '0.515', '4'], humanToxicity: ['0.1402', '0.140', '4'],
    freshwaterEcotoxicity: ['37.3452', '37.345', '3'], marineEcotoxicity: ['62.362', '62.362', '3'],
    terrestrialEcotoxicity: ['1.4646', '1.465', '5'], photochemical: ['0.2782', '0.278', '3'],
  };
  for (const [key, [exact, reported, minimum]] of Object.entries(expected)) {
    const row = r.categories[key];
    assert.equal(row.ldpeAtFiveUsesCalculated.exact, exact);
    assert.equal(row.ldpeAtFiveUsesReported.fixed6, Number(reported).toFixed(6));
    assert.equal(row.strictThresholdFromNoReuse.minimumTotalUses, minimum);
    assert.equal(row.calculatedFiveUseStrictlyLower, key !== 'abiotic');
    assert.equal(row.reportedFiveUseStrictlyLower, key !== 'abiotic');
  }
  assert.equal(r.categories.abiotic.calculatedFiveUseToHdpeRatio.exact, '82711/81135');
  assert.equal(r.categories.abiotic.reportedFiveUseToHdpeRatio.exact, '1838/1803');
  assert.equal(r.categories.abiotic.reportedFiveUsePercentChange.fixed6, '1.941209');
});

test('every input leaf, shape, policy flag and semantic five-tuple is immutable', () => {
  const paths = [];
  function leaves(value, path = []) {
    for (const [key, nested] of Object.entries(value)) {
      if (nested !== null && typeof nested === 'object') leaves(nested, [...path, key]); else paths.push([...path, key]);
    }
  }
  leaves(input());
  for (const path of paths) {
    const spec = input(); let parent = spec;
    for (const key of path.slice(0, -1)) parent = parent[key];
    parent[path.at(-1)] = typeof parent[path.at(-1)] === 'boolean' ? !parent[path.at(-1)] : 'changed';
    assert(validatePackStudyCase(spec).length, path.join('.'));
    assert.throws(() => evaluatePackStudyCase(spec), /Invalid pack-study/);
  }
  for (const bad of [null, [], true, {}, { ...input(), bypassFacts: true }]) assert(validatePackStudyCase(bad).length);
  for (const bad of [483, '4.83e2', NaN, null, {}, []]) {
    const spec = input(); spec.facts.serviceItems.value = bad; assert(validatePackStudyCase(spec).length);
  }
  const spec = input(); spec.privatePath = '/private/secret'; spec.facts.serviceItems.rawCapture = 'private';
  assert.equal(canonicalCaseInput(spec), canonicalCaseInput(input()));
});

test('all 57 facts require exact five-tuples and unambiguous public numerical identities', () => {
  assert.equal(Object.keys(input().facts).length, 57);
  assert.deepEqual(factErrors(fixture()), []);
  for (const [key, fact] of Object.entries(input().facts)) for (const field of ['value', 'unit', 'quantity', 'subject', 'basis']) {
    const f = fixture(); f.catalog.evidence.find(e => e.id === fact.evidenceId).numericFacts.find(item => item.id === fact.factId)[field] = 'changed';
    assert(factErrors(f).some(error => error.includes(`facts.${key}`)), `${key}.${field}`);
  }
  for (const mutation of [
    f => { f.catalog.evidence[0].numericFact = { value: '483' }; },
    f => { f.catalog.evidence[0].numericFacts.push(structuredClone(f.catalog.evidence[0].numericFacts[0])); },
    f => { f.catalog.evidence.push(structuredClone(f.catalog.evidence[0])); },
    f => { f.catalog.sources.push(structuredClone(f.catalog.sources[0])); },
    f => { f.catalog.evidence[0].sourceId = 'different-source'; },
    f => { f.catalog.evidence[0].readingId = 'different-reading'; },
    f => { f.catalog.evidence[0].passageId = 'different-passage'; },
    f => { f.catalog.evidence[0].numericFacts = []; },
  ]) { const f = fixture(); mutation(f); assert(factErrors(f).length); }
});

test('actual work, edition, original PDF carrier and numerical page remain mandatory', () => {
  for (const mutation of [
    f => { delete f.context.readingRegister; },
    f => { f.catalog.sources[0].version = 'different-edition'; },
    f => { f.catalog.sources[0].accessStatus = 'metadata-only'; },
    f => { f.catalog.sources[0].reading.scope = ''; },
    f => { f.catalog.sources[0].artifact.sha256 = 'f'.repeat(64); },
    f => { f.context.readingRegister.readings[0].version = 'different-edition'; },
    f => { f.context.readingRegister.readings[0].workId = 'different-work'; },
    f => { f.context.readingRegister.readings[0].readingStatus = 'unread'; },
    f => { f.context.readingRegister.readings[0].artifacts[0].sha256 = 'f'.repeat(64); },
    f => { f.context.readingRegister.readings[0].artifacts[0].mediaType = 'text/plain'; },
    f => { f.context.readingRegister.readings[0].artifacts[0].kind = 'derived-text'; },
    f => { f.context.readingRegister.readings[0].passages[0].artifactId = 'missing-artifact'; },
    f => { f.context.readingRegister.readings[0].passages[0].pdfIndices = [0]; },
    f => { f.context.readingRegister.readings[0].passages.push(structuredClone(f.context.readingRegister.readings[0].passages[0])); },
    f => { f.context.readingRegister.readings.push(structuredClone(f.context.readingRegister.readings[0])); },
  ]) { const f = fixture(); mutation(f); assert(factErrors(f).length); }
  const broad = fixture();
  broad.context.readingRegister.readings[0].passages[0].pdfIndices = [15, 16, 17, 18];
  broad.context.readingRegister.readings[0].passages[0].printedPages = '16–19';
  assert.deepEqual(factErrors(broad), []);
});

test('closed static registry binds public input, rendered templates, source checks and read-only receipt', () => {
  const f = fixture(); assert.deepEqual(publicationErrors(f), []);
  assert.equal(caseInputSha256(f.spec), 'd6517e87198308d50d00d9d84ccf13f1fea174db062139994b122ea170921149');
  assert.equal(f.catalog.claims[0].text, 'D=1.5776944; n=14; all=false.');
  assert.deepEqual(publicTeachingCase(f.spec), f.spec);
  const context = caseTemplateContext(f.spec); assert(Object.isFrozen(context.evaluated));
  const receipt = caseEvaluationReceipt(f.spec, 'fixture-commit');
  assert.equal(receipt.scientificApproval, false); assert.equal(receipt.artifactKind, 'read-only-teaching-case-evaluation');
  assert.equal(receipt.evaluations.evaluated.rawSurveyReproduced, false);
  assert.equal(receipt.evaluations.evaluated.currentProductRecommendation, false);
  assert.deepEqual(JSON.parse(JSON.stringify(receipt)), receipt);
  f.catalog.evidence[0].numericFacts[0].basis = 'changed';
  assert(publicationErrors(f).length);
});

const priorHashes = {
  'ecological-scarcity-v1.json': '2128ddd473a54c6dd696ed1fff28b61cdce93a137c390ff26ecc5c4e640700de',
  'historical-glass-v1.json': '56e6028764e85278fa73143d2321ab20b4ad8cd8d64ff9a75e2c871fb7448d7c',
  'hybrid-overlap-v1.json': '449be3b1eff749a1b10d55f9717fec06fd2ddbf4d86b623a9a64e6db5a09137e',
  'joint-batch-v1.json': '569797a9cc454583cd9397a468145f24b22f57fd9e5a8c98971138e779b3c773',
  'lime-valuation-v1.json': '9ffb5aab14187f8689ff8ee8897e48f60b6a584f52db0d7f56eb08c788409269',
  'market-response-v1.json': 'a58663c4648adee29c1c8236907d436ad42304ff3728aae8d3c133ba23e6a81e',
  'pedigree-calibration-v1.json': 'bdba93d860cdc3083a03b8a6f2bdac48a443edabbd6b5678af7ed829b61648ab',
  'phosphorus-boundary-v1.json': '05f1d0fe71ee5a1461e64987fb0cbc40cba7b0d96145ee9cc8017b647343dc39',
  'wall-coating-v1.json': 'cc2ba86f5aedfe49437088034382418a5c58a5020c04ba07c6289b9962eae285',
  'water-locality-v1.json': '5217aa07949fc4b5990f1129aa428958e60ef01713f7198da4a286ab66b7bca9',
};
// SHA-256 of complete evaluated contexts from the pre-change HEAD registry.
const priorEvaluations = {
  "ecological-scarcity-v1.json": "ce6fcd4311a3a97edadfdcac6c97e028658967833d0d7833e01ed18ae34e54a0",
  "historical-glass-v1.json": "1ce2c9fea1aadedeb5183c89055e0194c38ebdb1878caec3d4a59c1e97a8ed3f",
  "hybrid-overlap-v1.json": "1bf55a68d25998c4ea598f5d7f99b994da73dad90790709066c641ed667c6c7f",
  "joint-batch-v1.json": "4feebf9465330e591c8accd29f794a73d332146aab1b84c29dc78151542b592e",
  "lime-valuation-v1.json": "eef1b97146b9c806c95eb08f8eb7c623176196e0abdd224b0eebff4d1ad78564",
  "market-response-v1.json": "c845ad22f47da92c3736332785a0d73059013f3ffd443842d5ba20b457695b28",
  "pedigree-calibration-v1.json": "40dfa4939573bca954e48d8455c94e4a41e7e2008ade07348ae726c6baf9044c",
  "phosphorus-boundary-v1.json": "b8dbc92f674b9da3d3784cfb7758ba13fe2739c7061c0d8da5ba72e49e39887f",
  "wall-coating-v1.json": "263b3637631b665cc538fb42364f0cc25beda9788b644275719549df48359281",
  "water-locality-v1.json": "d1c3dd13cde55dba3e135db6253415e2cf5bc3a4db4a23e1e9c5ff7a27fd44a2"
};
test('ten earlier downloadable hashes and complete evaluated behavior remain unchanged', () => {
  assert.equal(Object.keys(priorHashes).length, 10);
  for (const [filename, sha256] of Object.entries(priorHashes)) {
    const spec = JSON.parse(readFileSync(new URL(`../knowledge/cases/${filename}`, import.meta.url), 'utf8'));
    assert.equal(caseInputSha256(spec), sha256, filename);
    const evaluatedBytes = JSON.stringify(caseTemplateContext(spec));
    assert.equal(createHash('sha256').update(evaluatedBytes).digest('hex'), priorEvaluations[filename], filename);
  }
});

test('published category arithmetic retains live division and category-count dependencies', () => {
  const publication = JSON.parse(readFileSync(new URL('../knowledge/cases/pack-study-v1.publication.json', import.meta.url), 'utf8'));
  const categoryClaim = publication.claims.find(claim => claim.id === 'cl-pack-categories');
  assert(categoryClaim, 'Registered publication must include its category comparison');
  for (const path of [
    'evaluated.categoryComparison.categories.gwp.ldpeAtFiveUsesCalculated.exact',
    'evaluated.categoryComparison.categories.abiotic.ldpeAtFiveUsesCalculated.exact',
    'evaluated.categoryComparison.totalCategories',
    'evaluated.categoryComparison.lowerCategoriesFromCalculatedDivision',
  ]) assert(categoryClaim.textTemplate.includes(`{{${path}}}`), `Published category quantity must retain dependency: ${path}`);
  const rendered = materializeCaseClaims(input(), publication).find(claim => claim.id === categoryClaim.id);
  assert.match(rendered.text, /6\.924\/5=1\.3848/);
  assert.match(rendered.text, /82\.711\/5=16\.5422/);
  assert.match(rendered.text, /9 项中有 8 项较低/);
  // These checks protect specific reviewed numerical dependencies, not the
  // semantics of arbitrary new prose or a deliberately reapproved template.
});
