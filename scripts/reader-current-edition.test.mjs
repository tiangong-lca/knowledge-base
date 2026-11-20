import assert from 'node:assert/strict';
import test from 'node:test';
import { editionDigest, matchesAcceptedFile, matchesAcceptedRecord, qualifyReadableBookEdition, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';

const key = 'content/docs/book/sample.mdx';
const input = 'knowledge/cases/sample-v1.json';
const previousClaim = { id: 'cl-first', text: '前版内容。' };
const revisedClaim = { id: 'cl-first', text: '修订内容。' };
const fingerprint = row => ({ raw: editionDigest(row), public: editionDigest(row), protected: editionDigest({ id: row.id }) });
const previous = fingerprint(previousClaim);
const revised = fingerprint(revisedClaim);
const baseline = {
  files: { [key]: editionDigest('old'), [input]: editionDigest('fixed') },
  fixedFiles: [input],
  records: { 'claims:cl-first': previous },
  dependencies: { 'cl-first': ['cl-old-consumer'] },
  publishedClaims: ['cl-first', 'cl-old-consumer'],
};
const actual = {
  files: { ...baseline.files, [key]: editionDigest('current') },
  records: { 'claims:cl-first': revised },
  dependencies: { 'cl-first': ['cl-new-consumer'] },
  publishedClaims: ['cl-first', 'cl-new-consumer'],
};
const baselineDigest = editionDigest(baseline);
const unit = {
  id: 'chapter',
  status: 'reviewed',
  scope: [key, 'claims:cl-first'],
  rationale: 'Reader sequence and source check',
  changes: [
    { kind: 'file', key, from: baseline.files[key], to: actual.files[key], rationale: 'Actual manuscript' },
    { kind: 'record', key: 'claims:cl-first', from: previous, to: revised, rationale: 'Selected source checked' },
  ],
  consumers: [{ id: 'cl-old-consumer', rationale: 'Earlier use checked' }, { id: 'cl-new-consumer', rationale: 'New use checked' }],
  outputs: [{ path: '/docs/book/sample', route: '/docs/book/sample', sha256: '3'.repeat(64) }],
};

function attest(candidate) {
  const artifacts = new Map();
  const reviewEvidence = ['source', 'reader', 'output'].map(kind => {
    const date = '2026-11-12', folder = '_docs/editorial/review-evidence/chapter/';
    const artifactFile = folder + kind + '-artifact.json', reportFile = folder + kind + '-report.json';
    const identity = { schemaVersion: 1, kind, unit: candidate.id, subjectSha256: readableBookReviewSubject(candidate, kind), date };
    const artifact = JSON.stringify({ ...identity, scope: candidate.scope, observed: 'Test-only observed artifact' });
    const artifactSha256 = sha256(artifact);
    const report = JSON.stringify({ ...identity, artifactSha256, disposition: 'accepted',
      reviewer: 'Test fixture', provenance: 'Synthetic in-memory test', findings: 'Test-only evidence' });
    artifacts.set(artifactFile, artifact);
    artifacts.set(reportFile, report);
    return { kind, date, artifactFile, reportFile, artifactSha256, reportSha256: sha256(report) };
  });
  return { candidate: { ...candidate, reviewEvidence }, artifacts };
}

const fixed = attest(unit);
const verify = (units = [unit], state = actual, pins, artifactsOverride) => {
  const results = units.map(candidate => candidate.reviewEvidence ? { candidate, artifacts: fixed.artifacts } : attest(candidate));
  const prepared = results.map(row => row.candidate);
  const artifacts = artifactsOverride ?? new Map(results.flatMap(row => [...row.artifacts]));
  return qualifyReadableBookEdition(baseline, baselineDigest,
    { schemaVersion: 1, baselineDigest, status: 'reviewed', units: prepared },
    pins ?? Object.fromEntries(prepared.map(row => [row.id, editionDigest(row)])), state, artifacts);
};

test('approved raw and public record and file expectations resolve only exact successors', () => {
  const current = verify();
  assert.deepEqual(current.errors, []);
  assert(matchesAcceptedRecord(current, 'claims', previousClaim, revisedClaim));
  assert(matchesAcceptedRecord(current, 'claims', previousClaim, revisedClaim, 'public'));
  assert(!matchesAcceptedRecord(current, 'claims', { ...previousClaim, text: 'another predecessor' }, revisedClaim));
  assert(!matchesAcceptedRecord(current, 'claims', previousClaim, { ...revisedClaim, text: 'altered' }));
  assert(matchesAcceptedFile(current, key, baseline.files[key], actual.files[key]));
  assert(!matchesAcceptedFile(current, input, baseline.files[key], actual.files[key]));
});

test('pending, absent, altered or co-deleted acceptance cannot admit changed actual content', () => {
  assert.throws(() => verify([{ ...unit, status: 'pending' }]), /not independently accepted/);
  assert.throws(() => verify([unit], actual, {}), /not independently accepted/);
  assert.throws(() => verify([{ ...unit, rationale: 'replaced' }], actual, { chapter: editionDigest(fixed.candidate) }), /not independently accepted/);
  assert(verify([], actual).errors.some(error => error.includes('unaccepted file')));
  assert.throws(() => verify([], actual, { chapter: editionDigest(fixed.candidate) }), /missing pinned unit/);
  assert(verify([], { ...baseline, files: {} }).errors.some(error => error.includes(input)));
});

test('both dependency graphs, reviewed artifacts and the immutable input are independently required', () => {
  assert.throws(() => verify([{ ...unit, consumers: unit.consumers.slice(1) }]), /missing or extraneous/);
  assert.throws(() => verify([{ ...unit, reviewEvidence: fixed.candidate.reviewEvidence.slice(1) }]), /review evidence/);
  const wrong = { ...unit, scope: [...unit.scope, input], changes: [
    ...unit.changes, { kind: 'file', key: input, from: baseline.files[input], to: 'changed', rationale: 'alteration' },
  ] };
  assert.throws(() => verify([wrong]), /immutable change/);
  const forgedPredecessor = { ...unit, changes: unit.changes.map(row => ({ ...row, from: null })) };
  assert.throws(() => verify([forgedPredecessor]), /stale predecessor/);
});

test('review evidence cannot replay stale subjects or claim nonexistent content', () => {
  assert.throws(() => verify([fixed.candidate], actual, undefined, new Map()), /review evidence/);
  assert.throws(() => verify([{ ...fixed.candidate, rationale: 'Another exact subject' }]), /review evidence/);
  const changed = new Map(fixed.artifacts);
  const file = fixed.candidate.reviewEvidence[0].artifactFile;
  changed.set(file, changed.get(file).replace('observed artifact', 'changed artifact'));
  assert.throws(() => verify([fixed.candidate], actual, undefined, changed), /review evidence/);
  assert.throws(() => verify([{ ...unit, readingEntries: [key] }]), /unscoped current reading entry/);
  assert.throws(() => verify([{ ...unit, layouts: [{ key, from: editionDigest(false), to: true }] }]), /invalid layout amendments/);
});

test('research-only changes bind their linked publications and actual public artifacts', async () => {
  const { readFile } = await import('node:fs/promises');
  const { inspectReadableBookEdition } = await import('./reader-current-edition.mjs');
  const { validateReadableBookReviewedOutput, validateReadableBookPublicArtifacts } = await import('./reader-current-output.mjs');
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const [catalog, readings, literature] = await Promise.all([
    read('knowledge/catalog.json'), read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  const inspect = value => inspectReadableBookEdition({ catalog, readings, literature: value, files: new Map() });
  const old = inspect(literature), modified = structuredClone(literature);
  const record = modified.records.find(row => row.id === 'lit-b01');
  record.contributors = [...record.contributors, 'Unreviewed insertion'];
  modified.gaps.pop();
  modified.protocol.limitations = [...modified.protocol.limitations, 'Unreviewed protocol change'];
  const changed = inspect(modified);
  assert.notDeepEqual(old.records['literature:lit-b01'], changed.records['literature:lit-b01']);
  assert.notDeepEqual(old.records['researchMetadata:literature-protocol'], changed.records['researchMetadata:literature-protocol']);
  assert.equal(Object.keys(old.records).length, Object.keys(changed.records).length + 1);
  assert(record.catalogSourceIds.every(id => changed.dependencies['lit-b01'].includes(id)));
  const current = {
    changes: { file: new Map(), record: new Map([['literature:lit-b01', {}]]) },
    outputs: new Map(), publicArtifacts: new Map(), researchChanged: true,
  };
  assert.match(validateReadableBookReviewedOutput(current, new Map(), new Map(), { units: [] }, catalog)[0], /actual output documents/);
  const errors = await validateReadableBookPublicArtifacts('/unused', current);
  for (const path of ['research/index.html', 'downloads/bibliography.json', 'downloads/research.json']) {
    assert(errors.some(error => error.includes(path)));
  }
});

test('reordering the source register changes the frozen ordered and public projections', async () => {
  const { readFile } = await import('node:fs/promises');
  const { inspectReadableBookEdition } = await import('./reader-current-edition.mjs');
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const [catalog, readings, literature] = await Promise.all([
    read('knowledge/catalog.json'), read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  const inspect = value => inspectReadableBookEdition({ catalog: value, readings, literature, files: new Map() });
  const previous = { ...inspect(catalog), fixedFiles: [] }, nextCatalog = structuredClone(catalog);
  [nextCatalog.sources[0], nextCatalog.sources[1]] = [nextCatalog.sources[1], nextCatalog.sources[0]];
  const next = inspect(nextCatalog), baselineDigest = editionDigest(previous);
  const pending = { schemaVersion: 1, baselineDigest, status: 'pending', units: [] };
  const { errors } = qualifyReadableBookEdition(previous, baselineDigest, pending, {}, next);
  assert(errors.some(error => error.includes('researchMetadata:order:sources')));
  assert(errors.some(error => error.includes('researchMetadata:public-projection')));
});

test('a pinned old research page still fails current passage projection', async () => {
  const { default: parser } = await import('next/dist/compiled/node-html-parser/index.js');
  const { validateReadableBookResearchOutput } = await import('./reader-current-output.mjs');
  const html = '<main id="main-content"><article class="source-record" id="src-fixture"><span id="lit-fixture"></span><span id="rd-fixture"></span><h2><a href="/source">书目</a></h2><p>出版者。版本。</p><details><ul><li id="psg-fixture">原页码</li></ul></details></article></main>';
  const published = { sources: [{ id: 'src-fixture', title: '书目', publisher: '出版者', version: '版本', url: '/source', reading: { readingId: 'rd-fixture' } }] };
  const literature = { records: [{ id: 'lit-fixture' }] };
  const ledger = { readings: [{ id: 'rd-fixture', workId: 'lit-fixture', passages: [{ id: 'psg-fixture', locator: '原页码' }] }] };
  const document = parser.parse(html);
  assert.deepEqual(validateReadableBookResearchOutput(document, published, literature, ledger), []);
  ledger.readings[0].passages[0].locator = '新页码';
  assert.match(validateReadableBookResearchOutput(document, published, literature, ledger)[0], /current locators/);
});

test('the actual adopted source is independently qualified and a changed reviewed paragraph is refused', async () => {
  const { fileURLToPath } = await import('node:url');
  const { readFile } = await import('node:fs/promises');
  const { validateRepository } = await import('./validate.mjs');
  const { validateReadableBookCurrent, validateServiceConstraintsReviewSources, validateSubstitutionRulesReviewSources, validateLoadShiftReviewSources, validateCircularFootprintReviewSources, validateLandRecoveryReviewSources, validateAcidEquivalentsReviewSources, validateMineralResourcesReviewSources, validateFossilResourcesReviewSources, validatePhotochemicalOzoneReviewSources, validateOzoneRadiationReviewSources, validateToxicityComparisonReviewSources, validateWaterScarcityReviewSources, validateBiogenicCarbonReviewSources, validateEutrophicationPathwaysReviewSources, validateParticulateComparisonReviewSources, validatePart4RereadReviewSources, validateWeightingValuationReviewSources, validateLocalizationComparisonReviewSources, validateSocialComparisonReviewSources, validateCostSustainabilityReviewSources, validatePart5RereadReviewSources, validateDataApplicabilityComparisonReviewSources, validateUncertaintyComparisonReviewSources, validateProductFootprintComparisonReviewSources, validateDataQualityComparisonReviewSources, validatePart6RereadReviewSources, validateWallServiceComparisonReviewSources, validateInterpretationBagsReviewSources, validateFutureScenariosReviewSources, validateRevisableJudgmentReviewSources, validateMarketResponseComparisonReviewSources, validatePart7RereadReviewSources, validateFunctionalReferenceComparisonReviewSources, validateHybridInventoryComparisonReviewSources, validatePart2RereadReviewSources } = await import('./reader-current-edition-files.mjs');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
  const serviceConstraints = await read('config/reader-service-constraints.json');
  const substitutionRules = await read('config/reader-substitution-rules.json');
  const loadShift = await read('config/reader-load-shift.json');
  const footprint = await read('config/reader-circular-footprint.json');
  const land = await read('config/reader-land-recovery.json');
  const acid = await read('config/reader-acid-equivalents.json');
  const minerals = await read('config/reader-mineral-resources.json');
  const fossils = await read('config/reader-fossil-resources.json');
  const ozone = await read('config/reader-photochemical-ozone.json');
  const ozrad = await read('config/reader-ozone-radiation.json');
  const tox = await read('config/reader-toxicity-comparison.json');
  const water = await read('config/reader-water-scarcity.json');
  const bio = await read('config/reader-biogenic-carbon.json');
  const eutro = await read('config/reader-eutrophication-pathways.json');
  const particulate = await read('config/reader-particulate-comparison.json');
  const part4 = await read('config/reader-part4-reread.json');
  const part3 = await read('config/reader-part3-reread.json');
  const privatePart3 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part3.status === 'preview';
  const fr = await read('config/reader-functional-reference-comparison.json');
  const privateFr = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && fr.status === 'preview';
  const hyb = await read('config/reader-hybrid-inventory-comparison.json');
  const privateHyb = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && hyb.status === 'preview';
  const part2 = await read('config/reader-part2-reread.json');
  const privatePart2 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part2.status === 'preview';
  const mkt = await read('config/reader-market-response-comparison.json');
  const privateMkt = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && mkt.status === 'preview';
  const part7 = await read('config/reader-part7-reread.json');
  const privatePart7 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part7.status === 'preview';
  const rev = await read('config/reader-revisable-judgment.json');
  const privateRev = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && rev.status === 'preview';
  const fut = await read('config/reader-future-scenarios.json');
  const privateFut = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && fut.status === 'preview';
  const intBags = await read('config/reader-interpretation-bags.json');
  const privateInt = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && intBags.status === 'preview';
  const wsc = await read('config/reader-wall-service-comparison.json');
  const privateWsc = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && wsc.status === 'preview';
  const part6 = await read('config/reader-part6-reread.json');
  const privatePart6 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part6.status === 'preview';
  const dqp = await read('config/reader-data-quality-comparison.json');
  const privateDqp = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && dqp.status === 'preview';
  const pfr = await read('config/reader-product-footprint-comparison.json');
  const privatePfr = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && pfr.status === 'preview';
  const unc = await read('config/reader-uncertainty-comparison.json');
  const privateUnc = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && unc.status === 'preview';
  const dapp = await read('config/reader-data-applicability-comparison.json');
  const privateDapp = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && dapp.status === 'preview';
  const part5 = await read('config/reader-part5-reread.json');
  const privatePart5 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part5.status === 'preview';
  const cost = await read('config/reader-cost-sustainability.json');
  const privateCost = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && cost.status === 'preview';
  const social = await read('config/reader-social-comparison.json');
  const privateSocial = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && social.status === 'preview';
  const localization = await read('config/reader-localization-comparison.json');
  const privateLocalization = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && localization.status === 'preview';
  const weighting = await read('config/reader-weighting-valuation.json');
  const privateWeighting = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && weighting.status === 'preview';
  const privatePart4 = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && part4.status === 'preview';
  const privateParticulate = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && particulate.status === 'preview';
  const privateEutro = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && eutro.status === 'preview';
  const privateBio = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && bio.status === 'preview';
  const privateWater = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && water.status === 'preview';
  const privateTox = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && tox.status === 'preview';
  const privateOzrad = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && ozrad.status === 'preview';
  const privateOzone = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && ozone.status === 'preview';
  const privateFossils = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && fossils.status === 'preview';
  const privateMinerals = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && minerals.status === 'preview';
  const privateAcid = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && acid.status === 'preview';
  const privateLand = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && land.status === 'preview';
  const privateFootprint = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && footprint.status === 'preview';
  const privateLoadShift = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && loadShift.status === 'preview';
  const privateService = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && serviceConstraints.status === 'preview';
  const privateSubstitution = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1' && substitutionRules.status === 'preview';
  if (privateService || privateSubstitution || privateLoadShift || privateFootprint || privateLand || privateAcid || privateMinerals || privateFossils || privateOzone || privateOzrad || privateTox || privateWater || privateBio || privateEutro || privateParticulate || privatePart4 || privateWeighting || privateLocalization || privateSocial || privateCost || privatePart5 || privateDapp || privateUnc || privatePfr || privateDqp || privatePart6 || privateWsc || privateInt || privateFut || privateRev || privatePart7 || privateMkt || privateFr || privateHyb || privatePart2) {
    const name = privatePart2 ? 'Part II continuous reread' : privateHyb ? 'Hybrid inventory comparison' : privateFr ? 'Functional reference comparison' : privateMkt ? 'Market response comparison' : privatePart7 ? 'Part VII continuous reread' : privateRev ? 'Revisable judgment synthesis' : privateFut ? 'Future technology & scenarios comparison' : privateInt ? 'Interpretation & shopping-bag comparison' : privateWsc ? 'Wall service comparison' : privatePart6 ? 'Part VI continuous reread' : privateDqp ? 'Data quality comparison' : privatePfr ? 'Product footprint comparison' : privateUnc ? 'Uncertainty comparison' : privateDapp ? 'Data applicability comparison' : privatePart5 ? 'Part V continuous reread' : privateCost ? 'Cost and sustainability' : privateSocial ? 'Social comparison' : privateLocalization ? 'Localization comparison' : privateWeighting ? 'Weighting and valuation' : privatePart4 ? 'Part IV continuous reread' : privateParticulate ? 'Particulate comparison' : privateEutro ? 'Eutrophication pathways' : privateBio ? 'Biogenic carbon' : privateWater ? 'Water scarcity' : privateTox ? 'Toxicity comparison' : privateOzrad ? 'Ozone and radiation' : privateOzone ? 'Photochemical ozone' : privateFossils ? 'Fossil resources' : privateMinerals ? 'Mineral resources' : privateAcid ? 'Acid equivalents' : privateLand ? 'Land recovery' : privateFootprint ? 'Circular footprint' : privateLoadShift ? 'Load shift' : privateService ? 'Service constraints' : 'Substitution rules';
    assert((await validateRepository(root)).includes(`${name} is not independently accepted`));
  } else assert.deepEqual(await validateRepository(root), []);
  const [acceptance, copyedit, catalog, readings, literature] = await Promise.all([
    read('config/readable-book-current.json'), read('config/reader-copyedit-current.json'), read('knowledge/catalog.json'),
    read('knowledge/research/readings.json'), read('knowledge/research/literature-map.json'),
  ]);
  assert.equal(acceptance.status, 'reviewed');
  const qualify = privatePart2 ? validatePart2RereadReviewSources : privateHyb ? validateHybridInventoryComparisonReviewSources : privateFr ? validateFunctionalReferenceComparisonReviewSources : privateMkt ? validateMarketResponseComparisonReviewSources : privatePart7 ? validatePart7RereadReviewSources : privateRev ? validateRevisableJudgmentReviewSources : privateFut ? validateFutureScenariosReviewSources : privateInt ? validateInterpretationBagsReviewSources : privateWsc ? validateWallServiceComparisonReviewSources : privatePart6 ? validatePart6RereadReviewSources : privateDqp ? validateDataQualityComparisonReviewSources : privatePfr ? validateProductFootprintComparisonReviewSources : privateUnc ? validateUncertaintyComparisonReviewSources : privateDapp ? validateDataApplicabilityComparisonReviewSources : privatePart5 ? validatePart5RereadReviewSources : privateCost ? validateCostSustainabilityReviewSources : privateSocial ? validateSocialComparisonReviewSources : privateLocalization ? validateLocalizationComparisonReviewSources : privateWeighting ? validateWeightingValuationReviewSources : privatePart4 ? validatePart4RereadReviewSources : privateParticulate ? validateParticulateComparisonReviewSources : privateEutro ? validateEutrophicationPathwaysReviewSources : privateBio ? validateBiogenicCarbonReviewSources : privateWater ? validateWaterScarcityReviewSources : privateTox ? validateToxicityComparisonReviewSources : privateOzrad ? validateOzoneRadiationReviewSources : privateOzone ? validatePhotochemicalOzoneReviewSources : privateFossils ? validateFossilResourcesReviewSources : privateMinerals ? validateMineralResourcesReviewSources : privateAcid ? validateAcidEquivalentsReviewSources : privateLand ? validateLandRecoveryReviewSources : privateFootprint ? validateCircularFootprintReviewSources : privateLoadShift ? validateLoadShiftReviewSources : privateSubstitution ? validateSubstitutionRulesReviewSources
    : privateService ? validateServiceConstraintsReviewSources : validateReadableBookCurrent;
  if (privateService || privateSubstitution || privateLoadShift || privateFootprint || privateLand || privateAcid || privateMinerals || privateFossils || privateOzone || privateOzrad || privateTox || privateWater || privateBio || privateEutro || privateParticulate || privatePart4 || privateWeighting || privateLocalization || privateSocial || privateCost || privatePart5 || privateDapp || privateUnc || privatePfr || privateDqp || privatePart6 || privateWsc || privateInt || privateFut || privateRev || privatePart7 || privateMkt || privateFr || privateHyb || privatePart2) assert.deepEqual((await qualify(root, catalog, readings, literature)).errors, []);
  const currentChanges = copyedit.status === 'reviewed' ? copyedit.unit.changes : acceptance.units.flatMap(unit => unit.changes);
  const changed = currentChanges
    .find(row => row.kind === 'record' && row.key.startsWith('claims:') && row.from !== null);
  assert(changed, 'the actual edition contains a reviewed change to an existing paragraph');
  const id = changed.key.slice('claims:'.length);
  const claim = catalog.claims.find(row => row.id === id);
  assert(claim);
  claim.text += '未受审的补充。';
  const rejection = copyedit.status === 'reviewed'
    ? 'Reader copyedit successor differs from actual source'
    : 'stale predecessor, missing successor or mismatched result';
  await assert.rejects(qualify(root, catalog, readings, literature), error => {
    if (privatePart2 || part2.status === 'reviewed') {
      return error.message === 'Part II continuous reread did not recover the independently observed raw 3034503f state'
        || error.message.startsWith('Part II continuous reread lacks its exact candidate transition:')
        || error.message.startsWith('Part II continuous reread actual source state differs');
    }
    if (privateHyb || hyb.status === 'reviewed') {
      return error.message === 'Hybrid inventory comparison did not recover the independently observed raw 744b371af state'
        || error.message.startsWith('Hybrid inventory comparison lacks its exact candidate transition:')
        || error.message.startsWith('Hybrid inventory comparison actual source state differs');
    }
    if (privateFr || fr.status === 'reviewed') {
      return error.message === 'Functional reference comparison did not recover the independently observed raw d4a7e98f state'
        || error.message.startsWith('Functional reference comparison lacks its exact candidate transition:')
        || error.message.startsWith('Functional reference comparison actual source state differs');
    }
    if (privatePart3 || part3.status === 'reviewed') {
      return error.message === 'Part III continuous reread did not recover the independently observed raw f6d1eca5 state'
        || error.message.startsWith('Part III continuous reread lacks its exact candidate transition:')
        || error.message.startsWith('Part III continuous reread actual source state differs');
    }
    if (privateMkt || mkt.status === 'reviewed') {
      return error.message === 'Market response comparison did not recover the independently observed raw 8949778f state'
        || error.message.startsWith('Market response comparison lacks its exact candidate transition:');
    }
    if (privatePart7 || part7.status === 'reviewed') {
      return error.message === 'Part VII continuous reread did not recover the independently observed raw a55c9fb3 state'
        || error.message.startsWith('Part VII continuous reread lacks its exact candidate transition:');
    }
    if (privateRev || rev.status === 'reviewed') {
      return error.message === 'Revisable judgment synthesis did not recover the independently observed raw cb2584d4 state'
        || error.message.startsWith('Revisable judgment synthesis lacks its exact candidate transition:');
    }
    if (privateFut || fut.status === 'reviewed') {
      return error.message === 'Future technology & scenarios comparison did not recover the independently observed raw ac54b259 state'
        || error.message.startsWith('Future technology & scenarios comparison lacks its exact candidate transition:');
    }
    if (privateInt || intBags.status === 'reviewed') {
      return error.message === 'Interpretation & shopping-bag comparison did not recover the independently observed raw c5a257a0 state'
        || error.message.startsWith('Interpretation & shopping-bag comparison lacks its exact candidate transition:');
    }
    if (privateWsc || wsc.status === 'reviewed') {
      return error.message === 'Wall service comparison did not recover the independently observed raw 8d498f48 state'
        || error.message.startsWith('Wall service comparison lacks its exact candidate transition:');
    }
    if (privatePart6 || part6.status === 'reviewed') {
      return error.message === 'Part VI continuous reread did not recover the independently observed raw b1c911ee state'
        || error.message.startsWith('Part VI continuous reread lacks its exact candidate transition:');
    }
    if (privateDqp || dqp.status === 'reviewed') {
      return error.message === 'Data quality comparison did not recover the independently observed raw def232fa state'
        || error.message.startsWith('Data quality comparison lacks its exact candidate transition:');
    }
    if (privatePfr || pfr.status === 'reviewed') {
      return error.message === 'Product footprint comparison did not recover the independently observed raw 3c6844be state'
        || error.message.startsWith('Product footprint comparison lacks its exact candidate transition:');
    }
    if (privateUnc || unc.status === 'reviewed') {
      return error.message === 'Uncertainty comparison did not recover the independently observed raw 4bb50839 state'
        || error.message.startsWith('Uncertainty comparison lacks its exact candidate transition:');
    }
    if (privateDapp || dapp.status === 'reviewed') {
      return error.message === 'Data applicability comparison did not recover the independently observed raw c5b90b03 state'
        || error.message.startsWith('Data applicability comparison lacks its exact candidate transition:');
    }
    if (privatePart5 || part5.status === 'reviewed') {
      return error.message === 'Part V continuous reread did not recover the independently observed raw 915af295 state'
        || error.message.startsWith('Part V continuous reread lacks its exact candidate transition:');
    }
    if (privateCost || cost.status === 'reviewed') {
      return error.message === 'Cost and sustainability did not recover the independently observed raw 8d5f1037 state'
        || error.message.startsWith('Cost and sustainability lacks its exact candidate transition:');
    }
    if (privateSocial || social.status === 'reviewed') {
      return error.message === 'Social comparison did not recover the independently observed raw 79c8ea9c state'
        || error.message.startsWith('Social comparison lacks its exact candidate transition:');
    }
    if (privateLocalization || localization.status === 'reviewed') {
      return error.message === 'Localization comparison did not recover the independently observed raw 0518e6b5 state'
        || error.message.startsWith('Localization comparison lacks its exact candidate transition:');
    }
    if (privateWeighting || weighting.status === 'reviewed') {
      return error.message === 'Weighting and valuation did not recover the independently observed raw 65aafe25 state'
        || error.message.startsWith('Weighting and valuation lacks its exact candidate transition:');
    }
    if (privatePart4 || part4.status === 'reviewed') {
      return error.message === 'Part IV continuous reread did not recover the independently observed raw 2ba0bfe2 state'
        || error.message.startsWith('Part IV continuous reread lacks its exact candidate transition:');
    }
    if (privateParticulate || particulate.status === 'reviewed') {
      return error.message === 'Particulate comparison did not recover the independently observed raw c0ffd968 state';
    }
    if (privateEutro || eutro.status === 'reviewed') {
      return error.message === 'Eutrophication pathways did not recover the independently observed raw 8fcb2485 state';
    }
    if (privateBio || bio.status === 'reviewed') {
      return error.message === 'Biogenic carbon did not recover the independently observed raw 5c982449 state';
    }
    if (privateWater || water.status === 'reviewed') {
      return error.message === 'Water scarcity did not recover the independently observed raw 9486bae9 state';
    }
    if (privateTox || tox.status === 'reviewed') {
      return error.message === 'Toxicity comparison did not recover the independently observed raw 2eba26c6 state';
    }
    if (privateOzrad || ozrad.status === 'reviewed') {
      return error.message === 'Ozone and radiation did not recover the independently observed raw c5e3d886 state'
        || error.message.startsWith('Ozone and radiation lacks the exact predecessor and scope disposition');
    }
    if (privateOzone || ozone.status === 'reviewed') {
      return error.message === 'Photochemical ozone did not recover the independently observed raw 13064f9 state';
    }
    if (privateFossils || fossils.status === 'reviewed') {
      return error.message === 'Fossil resources did not recover the independently observed raw ba8a101 state';
    }
    if (privateMinerals || minerals.status === 'reviewed') {
      return error.message === 'Mineral resources did not recover the independently observed raw 607381d state';
    }
    if (privateAcid || acid.status === 'reviewed') {
      return error.message === 'Acid equivalents did not recover the independently observed raw 5c71ee4 state';
    }
    if (privateLand || land.status === 'reviewed') {
      return error.message === 'Land recovery did not recover the independently observed raw 30f934a state';
    }
    if (privateFootprint || footprint.status === 'reviewed') {
      return error.message === 'Circular footprint did not recover the independently observed raw b7d8cd1 state';
    }
    if (privateLoadShift || loadShift.status === 'reviewed') {
      return error.message === 'Load shift did not recover the independently observed raw 11e2978 state';
    }
    if (privateSubstitution || substitutionRules.status === 'reviewed') {
      return error.message === 'Substitution rules did not reconstruct the independently observed raw f8751d5 state';
    }
    if (serviceConstraints.status === 'reviewed') {
      // This one change also invalidates the current reviewed public catalog.
      return error.message === 'Service constraints lacks exact independent source, reader, and output evidence';
    }
    return error.message.includes(rejection) && error.message.includes(changed.key);
  });
});
