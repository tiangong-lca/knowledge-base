import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateLimeValuationCase, validateLimeValuationCase, validateLimeValuationFacts } from './lime-valuation.mjs';
import { canonicalCaseInput, caseInputSha256, publicTeachingCase, caseTemplateContext, materializeCaseClaims, validateCasePublications, caseEvaluationReceipt } from './case-publication.mjs';
const input = () => JSON.parse(readFileSync(new URL('../knowledge/cases/lime-valuation-v1.json', import.meta.url), 'utf8'));

function fixture() {
  const spec = input(), records = new Map();
  for (const fact of Object.values(spec.facts)) {
    const selected = spec.sources[fact.sourceKey];
    if (!records.has(fact.evidenceId)) records.set(fact.evidenceId, {
      id: fact.evidenceId, sourceId: selected.sourceId, readingId: selected.readingId, passageId: fact.passageId,
      locator: 'Selected historical table', summary: 'Fixture exact numeric binding', relation: 'supports',
      ...(fact.factId === null ? {} : { numericFacts: [] }),
    });
    const tuple = Object.fromEntries(['value', 'unit', 'quantity', 'subject', 'basis'].map(key => [key, fact[key]]));
    if (fact.factId === null) records.get(fact.evidenceId).numericFact = tuple;
    else records.get(fact.evidenceId).numericFacts.push({ id: fact.factId, ...tuple });
  }
  const sources = Object.values(spec.sources).map(s => ({ id: s.sourceId, title: 'Selected historical source',
    url: 'https://example.org/source.pdf', version: s.version, publisher: 'Fixture', accessedAt: '2026-11-05',
    accessStatus: 'passages-inspected', rights: 'Metadata only', preservation: 'Fixed original PDF identity',
    artifact: { mediaType: 'application/pdf', sha256: s.sha256, resolvedUrl: 'https://example.org/source.pdf' },
    reading: { readingId: s.readingId, status: 'selected-passages', checkedAt: '2026-11-05', scope: 'Specified tables only' } }));
  const readings = Object.values(spec.sources).map(s => ({ id: s.readingId, version: s.version, workId: s.workId,
    readingStatus: 'selected-passages', artifacts: [{ id: s.artifactId, mediaType: 'application/pdf', sha256: s.sha256 }],
    passages: [...new Set([...records.values()].filter(e => e.sourceId === s.sourceId).map(e => e.passageId))]
      .map(id => ({ id, artifactId: s.artifactId })) }));
  const catalog = { schemaVersion: 1, sources, evidence: [...records.values()], claims: [], concepts: [], mappings: [], coverage: [] };
  const publication = { schemaVersion: 1, caseId: spec.caseId, version: spec.version, inputFile: 'lime-valuation-v1.json',
    approvedInputSha256: caseInputSha256(spec), reviewedAt: '2026-11-05', reviewKind: 'agent-source-check',
    claims: [{ id: 'fixture-lime', kind: 'calculation', scope: 'Conditional illustration', evidenceIds: [...records.keys()],
      premiseIds: ['fixture-lime-premise'], conceptIds: [], mappingIds: [], caveats: ['Author-stipulated damages and same service'],
      reasoning: 'Keep the two editions and source arithmetic distinct.',
      textTemplate: '2003 A={{evaluated.illustration.published2003.A.total.exact}}, B={{evaluated.illustration.published2003.B.total.exact}}; 2004 A={{evaluated.illustration.published2004.A.total.exact}}, B={{evaluated.illustration.published2004.B.total.exact}}; threshold={{evaluated.illustration.tieHealthToPrimaryFactorRatio.exact}}.' }] };
  catalog.claims = [...structuredClone(materializeCaseClaims(spec, publication)), { id: 'fixture-lime-premise',
    text: 'Selected printed inputs retain their edition and damage units.', kind: 'source-statement', scope: 'Selected tables only',
    evidenceIds: [...records.keys()], premiseIds: [], conceptIds: [], mappingIds: [], caveats: [], status: 'reviewed',
    reviewedAt: '2026-11-05', reviewKind: 'agent-source-check' }];
  return { spec, catalog, publication, context: { readingRegister: { schemaVersion: 1, readings } } };
}
const factsErrors = f => validateLimeValuationFacts(f.spec, f.catalog, f.context);
const publicationErrors = f => validateCasePublications([{ spec: f.spec, publication: f.publication, inputFile: f.publication.inputFile }], f.catalog, f.context);

test('reported coefficient signs and distinct conditional conversion paths retain exact residuals', () => {
  const spec = input(), before = JSON.stringify(spec), r = evaluateLimeValuationCase(spec).reconstruction;
  assert.deepEqual(validateLimeValuationCase(spec), []);
  const expected = {
    health: ['-465620/297', '465620/297', '169951300/297', '-67300/297'],
    social: ['-8564/891', '8564/891', '9071417/2025', '-39917/2025'],
    primary: ['-3103/81', '3103/81', '144621521/8100000', '-441521/8100000'],
    biodiversity: ['-14731400/891', '14731400/891', '62416941800000/81', '-208941800000/81'],
  };
  for (const [row, values] of Object.entries(expected)) {
    assert.deepEqual([r[row].isoUtilityTaxSlope.exact, r[row].positiveAvoidedDamageWtpPerCodedUnit.exact,
      r[row].reconstructedMagnitude.exact, r[row].publishedMinusReconstructed.exact], values);
    assert.equal(r[row].roundingEstablishedAsDiscrepancyCause, false);
    assert.equal(r[row].publishedValueRepaired, false);
  }
  assert.match(r.health.reconstructionStatus, /conditional.*unresolved/);
  assert.equal(r.social.outputUnit, 'JPY/1000-JPY-damage');
  assert.equal(r.social.codedAttributeBasisAmount, '100000000');
  assert.equal(r.primary.householdWtpPerOneDamageUnit.exact, '3103/8100000000');
  assert.equal(JSON.stringify(spec), before);
});

test('Table7 times Table3 uses 1000-JPY social blocks and shares of unrounded annual amounts', () => {
  const a = evaluateLimeValuationCase(input()).annualReference;
  assert.equal(a.socialNormalizationJPY.exact, '54400000000');
  assert.equal(a.socialNormalization1000JPYBlocks.exact, '54400000');
  assert.equal(a.totalJPY.exact, '1718704000000');
  const expected = {
    health: ['817960000000', '818000000000', '7865/16526', '0.48'],
    social: ['242624000000', '243000000000', '15164/107419', '0.14'],
    primary: ['274120000000', '274000000000', '34265/214838', '0.16'],
    biodiversity: ['384000000000', '384000000000', '24000/107419', '0.22'],
  };
  for (const [row, values] of Object.entries(expected)) {
    const r = a.rows[row];
    assert.deepEqual([r.calculatedAmountJPY.exact, r.publishedTable8AmountJPY.exact,
      r.shareOfUnroundedAmounts.exact, r.shareRounded2], values);
    assert.equal(r.publishedTable8Share.exact, values[3]);
  }
  assert.equal(a.sharesUseUnroundedCalculatedAmounts, true);
  assert.equal(a.sourceRoundingProcedureReconstructed, false);
});

test('complete two-row sums for one stipulated delivered service reverse order across published factor sets', () => {
  const spec = input(), r = evaluateLimeValuationCase(spec), i = r.illustration;
  assert.deepEqual([spec.service.amount, spec.service.unit], ['1000', 'metric tonnes of product']);
  assert.equal(spec.service.allOtherActivitiesAndDamagesHeldEqual, true);
  for (const [year, expected] of Object.entries({
    published2003: ['572', '1780', '2352', '2288', '178', '2466', '114', 'A', '2860000/89'],
    published2004: ['9700', '2020000', '2029700', '38800', '202000', '240800', '-1788900', 'B', '48500/101'],
  })) {
    const s = i[year];
    assert.deepEqual([s.A.healthContribution.exact, s.A.primaryProductionContribution.exact, s.A.total.exact,
      s.B.healthContribution.exact, s.B.primaryProductionContribution.exact, s.B.total.exact,
      s.differenceBMinusA.exact, s.lowerScore, s.healthToPrimaryFactorRatio.exact], expected);
  }
  assert.deepEqual([i.differenceBMinusAHealthDALY.exact, i.differenceBMinusAPrimaryDryTonnes.exact,
    i.tieHealthToPrimaryFactorRatio.exact, i.thresholdUnit], ['0.003', '-90', '30000', 'dry t/DALY']);
  // A tie has 0.003*30000 - 90 = 0 when w_P is factored out.
  assert.equal(3n * 30000n - 90n * 1000n, 0n);
  assert.equal(i.aboveThresholdLowerScore, 'A'); assert.equal(i.belowThresholdLowerScore, 'B');
  for (const key of ['observedPreferenceShift', 'timeTrend', 'crossEditionAbsoluteComparison']) assert.equal(i[key], false);
  assert.equal(r.scientificApproval, false); assert.equal(r.humanExpertApproval, false);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), r);
});

test('every reviewed input leaf is closed, including all flags, semantic tuples, types and versions', () => {
  const paths = [];
  function leaves(value, path = []) {
    for (const [key, nested] of Object.entries(value)) {
      if (nested !== null && typeof nested === 'object') leaves(nested, [...path, key]);
      else paths.push([...path, key]);
    }
  }
  leaves(input());
  for (const path of paths) {
    const spec = input(); let parent = spec;
    for (const key of path.slice(0, -1)) parent = parent[key];
    parent[path.at(-1)] = typeof parent[path.at(-1)] === 'boolean' ? !parent[path.at(-1)] : 'changed';
    assert(validateLimeValuationCase(spec).length, path.join('.'));
    assert.throws(() => evaluateLimeValuationCase(spec), /Invalid lime-valuation/);
  }
  for (const bad of [null, [], true, {}, { ...input(), bypassFacts: true }]) assert(validateLimeValuationCase(bad).length);
  for (const bad of [572000, '5.72e5', NaN, null, {}, []]) {
    const spec = input(); spec.facts.publishedHealth2003.value = bad;
    assert(validateLimeValuationCase(spec).length);
  }
  const missing = input(); delete missing.facts.betaTax;
  assert(validateLimeValuationCase(missing).length);
});

test('all 29 actual-form numeric facts require all five fields with exact types and original passage provenance', () => {
  assert.equal(Object.keys(input().facts).length, 29);
  assert.deepEqual(factsErrors(fixture()), []);
  assert.deepEqual(publicationErrors(fixture()), []);
  const base = fixture();
  for (const [recordIndex, record] of base.catalog.evidence.entries()) {
    const plural = Array.isArray(record.numericFacts), facts = plural ? record.numericFacts : [record.numericFact];
    for (const [factIndex] of facts.entries()) {
      for (const field of [...(plural ? ['id'] : []), 'value', 'unit', 'quantity', 'subject', 'basis']) {
        for (const replacement of ['wrong', 123, null, { private: true }]) {
          const f = fixture(), e = f.catalog.evidence[recordIndex];
          (plural ? e.numericFacts[factIndex] : e.numericFact)[field] = replacement;
          assert(factsErrors(f).length, `${recordIndex}.${factIndex}.${field}`);
        }
      }
      const f = fixture(), e = f.catalog.evidence[recordIndex];
      if (plural) e.numericFacts.splice(factIndex, 1); else delete e.numericFact;
      assert(factsErrors(f).length);
    }
  }
});

test('matching factors cannot bypass missing, ambiguous, relabeled, mixed or wrong-version carriers', () => {
  const mutations = [
    f => { delete f.context.readingRegister; }, f => { f.context = null; },
    f => { f.context.readingRegister.readings[0].passages = []; },
    f => { f.context.readingRegister.readings[0].artifacts[0].sha256 = '0'.repeat(64); },
    f => { f.context.readingRegister.readings[0].artifacts[0].kind = 'derived-text'; },
    f => { f.context.readingRegister.readings[0].artifacts[0].mediaType = 'text/plain'; },
    f => { f.context.readingRegister.readings[0].passages[0].artifactId = 'foreign'; },
    f => { f.context.readingRegister.readings.push(structuredClone(f.context.readingRegister.readings[0])); },
    f => { f.context.readingRegister.readings[0].passages.push(structuredClone(f.context.readingRegister.readings[0].passages[0])); },
    f => { f.catalog.evidence[0].readingId = 'foreign'; }, f => { f.catalog.evidence[0].passageId = 'foreign'; },
    f => { f.catalog.evidence[0].sourceId = 'foreign'; },
    f => { f.catalog.evidence.push(structuredClone(f.catalog.evidence[0])); },
    f => { f.catalog.sources.push(structuredClone(f.catalog.sources[0])); },
    f => { f.catalog.sources[0].reading.scope = ''; }, f => { f.catalog.sources[0].accessStatus = 'abstract-only'; },
    f => { f.catalog.evidence[0].numericFacts.push(structuredClone(f.catalog.evidence[0].numericFacts[0])); },
    f => { f.catalog.evidence[0].numericFact = f.catalog.evidence[0].numericFacts[0]; },
    f => { f.catalog.evidence.at(-1).numericFacts = [f.catalog.evidence.at(-1).numericFact]; },
  ];
  for (const sourceIndex of [0, 1]) mutations.push(
    f => { f.catalog.sources[sourceIndex].version = '2012'; },
    f => { f.context.readingRegister.readings[sourceIndex].version = '2012'; },
    f => { f.context.readingRegister.readings[sourceIndex].workId = 'foreign'; },
    f => { f.catalog.sources[sourceIndex].artifact.sha256 = '0'.repeat(64); },
    f => { f.catalog.sources[sourceIndex].artifact.mediaType = 'text/plain'; },
  );
  for (const mutate of mutations) {
    const f = fixture(); mutate(f);
    assert(factsErrors(f).length, mutate.toString());
    assert(publicationErrors(f).length, mutate.toString());
  }
});

test('registry projects nested metadata, binds materialized prose and emits immutable exact evaluation receipts', () => {
  const f = fixture(), bytes = canonicalCaseInput(f.spec), hash = caseInputSha256(f.spec);
  assert.equal(hash, '9ffb5aab14187f8689ff8ee8897e48f60b6a584f52db0d7f56eb08c788409269');
  assert.equal(f.catalog.claims[0].text, '2003 A=2352, B=2466; 2004 A=2029700, B=240800; threshold=30000.');
  const decorate = value => {
    if (value === null || typeof value !== 'object') return;
    Object.values(value).forEach(decorate); value.privateCapture = { raw: 'PRIVATE /private/source.pdf' };
  };
  decorate(f.spec);
  assert.equal(canonicalCaseInput(f.spec), bytes); assert.equal(caseInputSha256(f.spec), hash);
  assert.deepEqual(publicTeachingCase(f.spec), input());
  const receipt = caseEvaluationReceipt(f.spec, 'a'.repeat(40));
  assert.equal(receipt.inputSha256, hash);
  assert.equal(receipt.evaluations.evaluated.illustration.published2003.A.total.exact, '2352');
  assert.equal(receipt.scientificApproval, false);
  assert(!JSON.stringify(receipt).includes('PRIVATE')); assert(!bytes.includes('PRIVATE'));
  assert(Object.isFrozen(caseTemplateContext(f.spec).evaluated.annualReference.rows.health));
  for (const mutate of [
    f => { f.publication.approvedInputSha256 = '0'.repeat(64); },
    f => { f.catalog.claims[0].text += ' stale'; },
    f => { f.catalog.claims[0].caseBinding.inputFile = 'other.json'; },
    f => { f.catalog.evidence[0].numericFacts[0].basis = 'other basis'; },
  ]) { const bad = fixture(); mutate(bad); assert(publicationErrors(bad).length); }
});
