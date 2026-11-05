import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateEcologicalScarcityCase, validateEcologicalScarcityCase, validateEcologicalScarcityFacts } from './ecological-scarcity.mjs';
import { canonicalCaseInput, caseInputSha256, publicTeachingCase, caseEvaluationReceipt, caseTemplateContext, materializeCaseClaims, validateCasePublications } from './case-publication.mjs';
const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/ecological-scarcity-v1.json', import.meta.url), 'utf8'));
function fixture() {
  const spec = input(), s = spec.source, records = new Map();
  for (const fact of Object.values(spec.facts)) {
    if (!records.has(fact.evidenceId)) records.set(fact.evidenceId, { id: fact.evidenceId, sourceId: s.sourceId, readingId: s.readingId, passageId: fact.passageId,
      locator: 'Selected Swiss 2013 passage', summary: 'Fixture numeric source binding', relation: 'supports', numericFacts: [] });
    records.get(fact.evidenceId).numericFacts.push({ id: fact.factId, ...Object.fromEntries(['value', 'unit', 'quantity', 'subject', 'basis'].map(key => [key, fact[key]])) });
  }
  const catalog = { schemaVersion: 1, sources: [{ id: s.sourceId, title: 'Swiss 2013 fixture', url: 'https://example.org/source.pdf', version: 'Umwelt-Wissen Nr. 1330，德文 2013 年版，正文页码与 PDF 物理页相差两页。',
    artifact: { mediaType: 'application/pdf', sha256: s.sha256, resolvedUrl: 'https://example.org/source.pdf' },
    publisher: 'Fixture', accessedAt: '2026-11-05', accessStatus: 'public-passages-inspected', rights: 'Metadata only', preservation: 'Fixed fixture carrier',
    reading: { readingId: s.readingId, status: 'selected-passages', checkedAt: '2026-11-05', scope: 'Equation 4 and Tables 14/15 only' } }], evidence: [...records.values()], claims: [], concepts: [], mappings: [], coverage: [] };
  const context = { readingRegister: { schemaVersion: 1, readings: [{ id: s.readingId, readingStatus: 'selected-passages', workId: 'lit-com-14',
    version: 'Umwelt-Wissen Nr. 1330，德文 2013 年版，正文页码与 PDF 物理页相差两页。',
    passages: [...records.values()].map(record => ({ id: record.passageId, artifactId: s.artifactId })), artifacts: [{ id: s.artifactId, mediaType: 'application/pdf', sha256: s.sha256 }] }] } };
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'ecological-scarcity-v1.json',
    approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-05', reviewKind: 'agent-source-check', claims: [{ id: 'fixture-es', kind: 'calculation',
      scope: 'Conditional arithmetic fixture', evidenceIds: [...records.keys()], premiseIds: ['fixture-es-premise'], conceptIds: [], mappingIds: [], caveats: ['Invented equivalent service'],
      reasoning: 'Keep rounded score and source reconstruction separate.',
      textTemplate: 'A={{evaluated.illustration.baseline.A.total.exact}}; B={{evaluated.illustration.baseline.B.total.exact}}; halfB={{evaluated.illustration.sensitivity.display.B.total.exact}}; tie={{evaluated.illustration.sensitivity.tieMultiplier.exact}}.' }] };
  catalog.claims = [...structuredClone(materializeCaseClaims(spec, publication)), { id: 'fixture-es-premise', text: 'The table quantities retain their source basis.', kind: 'source-statement', scope: 'Selected source tables', evidenceIds: [...records.keys()], premiseIds: [], conceptIds: [], mappingIds: [], caveats: [], status: 'reviewed', reviewedAt: '2026-11-05', reviewKind: 'agent-source-check' }];
  return { spec, catalog, context, publication };
}
const factsErrors = f => validateEcologicalScarcityFacts(f.spec, f.catalog, f.context);
const publicationErrors = f => validateCasePublications([{ spec: f.spec, publication: f.publication, inputFile: f.publication.inputFile }], f.catalog, f.context);

test('source arithmetic preserves independent normal/current/critical flows and the squared scarcity weighting', () => {
  const spec = input(), before = JSON.stringify(spec), r = evaluateEcologicalScarcityCase(spec);
  assert.deepEqual(validateEcologicalScarcityCase(spec), []);
  assert.equal(r.reconstruction.nmvoc.normalizationFlowGramsPerYear.exact, '89025000000');
  assert.equal(r.reconstruction.nox.normalizationFlowGramsPerYear.exact, '78704000000');
  assert.deepEqual(r.reconstruction.nmvoc.normalizationPerAnnualGram, { exact: '1/89025000000', numerator: '1', denominator: '89025000000' });
  assert.deepEqual(r.reconstruction.nox.normalizationPerAnnualGram, { exact: '1/78704000000', numerator: '1', denominator: '78704000000' });
  assert.equal(r.reconstruction.nmvoc.currentToCriticalRatio.exact, '1187/1080');
  assert.equal(r.reconstruction.nmvoc.squaredWeighting.exact, '1408969/1166400');
  assert.equal(r.reconstruction.nox.squaredWeighting.exact, '96786244/31640625');
  assert.equal(r.reconstruction.nmvoc.reconstructedFactor.exact, '29675/2187');
  assert.equal(r.reconstruction.nox.reconstructedFactor.exact, '78704/2025');
  assert.equal(r.reconstruction.nmvoc.reconstructedFactor.fixed6, '13.568816');
  assert.equal(r.reconstruction.nox.reconstructedFactor.fixed6, '38.866173');
  assert.equal(r.reconstruction.nmvoc.publishedRoundedFactor.exact, '14');
  assert.equal(r.reconstruction.nox.publishedRoundedFactor.exact, '39');
  assert.equal(r.reconstruction.nmvoc.differentialCharacterizationApplied, false);
  assert.equal(JSON.stringify(spec), before);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), r);
});

test('scores use published rounded factors with matched grams and one stipulated equal service', () => {
  const i = evaluateEcologicalScarcityCase(input()).illustration;
  assert.equal(i.scoreBasis, 'published-rounded-2013-ecofactors');
  assert.deepEqual([i.baseline.A.nmvocContribution.exact, i.baseline.A.noxContribution.exact, i.baseline.A.total.exact], ['56', '39', '95']);
  assert.deepEqual([i.baseline.B.nmvocContribution.exact, i.baseline.B.noxContribution.exact, i.baseline.B.total.exact], ['28', '78', '106']);
  assert.equal(i.baseline.differenceBMinusA.exact, '11');
  assert.equal(i.baseline.lowerScore, 'A');
  assert.equal(i.commonScaling.multiplier, '10');
  assert.deepEqual([i.commonScaling.A.total.exact, i.commonScaling.B.total.exact, i.commonScaling.differenceBMinusA.exact], ['950', '1060', '110']);
  assert.equal(i.commonScaling.lowerScore, i.baseline.lowerScore);
  assert.equal(i.serviceEquivalenceIsAuthorStipulated, true);
  assert.equal(i.empiricalProductComparison, false);
  assert.equal(i.wholeLifeCycleCoverage, false);
});

test('one rounded-factor multiplier reverses ordering at one exact tie, without a policy update', () => {
  const s = evaluateEcologicalScarcityCase(input()).illustration.sensitivity;
  assert.equal(s.kind, 'author-educational-multiplier-on-rounded-NOx-factor-only');
  assert.equal(s.displayPoint, '0.5');
  assert.equal(s.noxFactorAtDisplay.exact, '19.5');
  assert.deepEqual([s.display.A.total.exact, s.display.B.total.exact], ['75.5', '67']);
  assert.equal(s.display.differenceBMinusA.exact, '-8.5');
  assert.equal(s.display.lowerScore, 'B');
  assert.deepEqual([s.differenceIntercept.exact, s.differenceSlope.exact, s.tieMultiplier.exact], ['-28', '39', '28/39']);
  assert.equal(s.atTie.A.total.exact, '84');
  assert.equal(s.atTie.B.total.exact, '84');
  assert.equal(s.atTie.lowerScore, 'tie');
  assert.equal(s.belowTieLowerScore, 'B'); assert.equal(s.aboveTieLowerScore, 'A');
  assert.equal(s.modeledPolicyUpdate, false); assert.equal(s.probabilityAssigned, false);
});

test('closed v1 rejects any changed input leaf, missing field or unsupported numeric representation', () => {
  const paths = [];
  const leaves = (value, path = []) => { for (const [key, nested] of Object.entries(value)) {
    if (nested !== null && typeof nested === 'object') leaves(nested, [...path, key]); else paths.push([...path, key]);
  } }; leaves(input());
  for (const path of paths) {
    const spec = input(); let parent = spec;
    for (const key of path.slice(0, -1)) parent = parent[key];
    const key = path.at(-1); parent[key] = typeof parent[key] === 'boolean' ? !parent[key] : 'changed';
    assert(validateEcologicalScarcityCase(spec).length, path.join('.'));
    assert.throws(() => evaluateEcologicalScarcityCase(spec), /Invalid ecological-scarcity/);
  }
  for (const bad of ['NaN', 'Infinity', '1e12', '28/39', 14, null, {}, []]) {
    const spec = input(); spec.facts.nmvocPublishedFactor.value = bad;
    assert(validateEcologicalScarcityCase(spec).length);
  }
  for (const bad of [null, [], true, {}, { ...input(), skipSourceValidation: true }]) assert(validateEcologicalScarcityCase(bad).length);
  const missing = input(); delete missing.facts.nmvocNormalization;
  assert(validateEcologicalScarcityCase(missing).length);
});

test('all nine numerical facts require complete public fact tuples and actual original PDF passage provenance', () => {
  assert.deepEqual(factsErrors(fixture()), []);
  const neutral = fixture(); neutral.catalog.sources[0].accessStatus = 'passages-inspected';
  assert.deepEqual(factsErrors(neutral), []);
  for (const [recordIndex, record] of fixture().catalog.evidence.entries()) for (const [factIndex] of record.numericFacts.entries()) {
    for (const field of ['id', 'value', 'unit', 'quantity', 'subject', 'basis']) {
      const f = fixture(); f.catalog.evidence[recordIndex].numericFacts[factIndex][field] = 'wrong';
      assert(factsErrors(f).length, `${recordIndex}.${factIndex}.${field}`);
    }
    const missing = fixture(); missing.catalog.evidence[recordIndex].numericFacts.splice(factIndex, 1);
    assert(factsErrors(missing).length);
  }
  for (const change of [
    f => { delete f.context.readingRegister; }, f => { f.context = null; },
    f => { f.context.readingRegister.readings[0].passages = []; },
    f => { f.context.readingRegister.readings[0].artifacts[0].sha256 = '0'.repeat(64); },
    f => { f.context.readingRegister.readings[0].artifacts[0].kind = 'derived-text'; },
    f => { f.context.readingRegister.readings[0].artifacts[0].mediaType = 'text/plain'; },
    f => { f.context.readingRegister.readings[0].passages[0].artifactId = 'foreign'; },
    f => { f.context.readingRegister.readings.push(structuredClone(f.context.readingRegister.readings[0])); },
    f => { f.catalog.evidence[0].readingId = 'foreign'; }, f => { f.catalog.evidence[0].passageId = 'foreign'; },
    f => { f.catalog.evidence[0].sourceId = 'foreign'; }, f => { f.catalog.evidence.push(structuredClone(f.catalog.evidence[0])); },
    f => { f.catalog.sources.push(structuredClone(f.catalog.sources[0])); }, f => { f.catalog.sources[0].reading.scope = ''; },
    f => { f.catalog.sources[0].accessStatus = 'abstract-only'; },
    f => { f.catalog.evidence[0].numericFacts.push(structuredClone(f.catalog.evidence[0].numericFacts[0])); },
    f => { f.catalog.evidence[0].numericFact = f.catalog.evidence[0].numericFacts[0]; },
  ]) { const f = fixture(); change(f); assert(factsErrors(f).length, change.toString()); }
});


test('selected source, reading and work retain their approved 2013 edition independently of matching factor values', () => {
  assert.deepEqual(factsErrors(fixture()), []);
  const mutations = [
    f => { f.catalog.sources[0].version = '2021'; },
    f => { f.context.readingRegister.readings[0].version = '2021'; },
    f => { f.catalog.sources[0].version = '2021'; f.context.readingRegister.readings[0].version = '2021'; },
    f => { f.context.readingRegister.readings[0].workId = 'work-es-swiss-2021'; },
    f => { delete f.context.readingRegister.readings[0].workId; },
    f => { delete f.catalog.sources[0].version; },
    f => { delete f.context.readingRegister.readings[0].version; },
    f => { f.catalog.sources[0].artifact.sha256 = '0'.repeat(64); },
    f => { f.catalog.sources[0].artifact.mediaType = 'text/plain'; },
  ];
  for (const mutate of mutations) {
    const f = fixture(); mutate(f);
    assert(factsErrors(f).length, mutate.toString());
    assert(publicationErrors(f).length, mutate.toString());
  }
});

test('ordinary registry materializes exact prose, projects all nested private metadata and emits bound immutable receipts', () => {
  const f = fixture(), bytes = canonicalCaseInput(f.spec), hash = caseInputSha256(f.spec);
  assert.equal(hash, '2128ddd473a54c6dd696ed1fff28b61cdce93a137c390ff26ecc5c4e640700de');
  assert.deepEqual(publicationErrors(f), []);
  assert.equal(f.catalog.claims[0].text, 'A=95; B=106; halfB=67; tie=28/39.');
  const decorate = value => { if (value === null || typeof value !== 'object') return; Object.values(value).forEach(decorate); value.privateCapture = { raw: 'PRIVATE /private/source.pdf' }; };
  decorate(f.spec);
  assert.equal(canonicalCaseInput(f.spec), bytes);
  assert.equal(caseInputSha256(f.spec), hash);
  assert.deepEqual(publicTeachingCase(f.spec), input());
  const receipt = caseEvaluationReceipt(f.spec, 'a'.repeat(40));
  assert.equal(receipt.inputSha256, hash);
  assert.equal(receipt.evaluations.evaluated.illustration.sensitivity.display.B.total.exact, '67');
  assert.equal(receipt.scientificApproval, false);
  assert(!JSON.stringify(receipt).includes('PRIVATE')); assert(!bytes.includes('PRIVATE'));
  assert(Object.isFrozen(caseTemplateContext(f.spec).evaluated.reconstruction.nmvoc));
  for (const change of [
    f => { f.publication.approvedInputSha256 = '0'.repeat(64); },
    f => { f.catalog.claims[0].text += ' stale'; },
    f => { f.catalog.claims[0].caseBinding.inputFile = 'other.json'; },
    f => { f.catalog.evidence[0].numericFacts[0].basis = 'other region'; },
  ]) { const bad = fixture(); change(bad); assert(publicationErrors(bad).length); }
});
