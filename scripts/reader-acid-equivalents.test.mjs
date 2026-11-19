import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import config from '../config/reader-acid-equivalents.json' with { type: 'json' };
import capture from '../config/reader-acid-equivalents-capture.json' with { type: 'json' };
import part6 from '../config/reader-part6-reread.json' with { type: 'json' };
import { restorePart6RereadTestFiles } from './reader-part6-reread.mjs';
import dqp from '../config/reader-data-quality-comparison.json' with { type: 'json' };
import { restoreDataQualityComparisonTestFiles } from './reader-data-quality-comparison.mjs';
import pfr from '../config/reader-product-footprint-comparison.json' with { type: 'json' };
import { restoreProductFootprintComparisonTestFiles } from './reader-product-footprint-comparison.mjs';
import unc from '../config/reader-uncertainty-comparison.json' with { type: 'json' };
import { restoreUncertaintyComparisonTestFiles } from './reader-uncertainty-comparison.mjs';
import dapp from '../config/reader-data-applicability-comparison.json' with { type: 'json' };
import { restoreDataApplicabilityComparisonTestFiles } from './reader-data-applicability-comparison.mjs';
import part5 from '../config/reader-part5-reread.json' with { type: 'json' };
import { restorePart5RereadTestFiles } from './reader-part5-reread.mjs';
import cost from '../config/reader-cost-sustainability.json' with { type: 'json' };
import { restoreCostSustainabilityTestFiles } from './reader-cost-sustainability.mjs';
import social from '../config/reader-social-comparison.json' with { type: 'json' };
import { restoreSocialComparisonTestFiles } from './reader-social-comparison.mjs';
import localization from '../config/reader-localization-comparison.json' with { type: 'json' };
import { restoreLocalizationComparisonTestFiles } from './reader-localization-comparison.mjs';
import weighting from '../config/reader-weighting-valuation.json' with { type: 'json' };
import { restoreWeightingValuationTestFiles } from './reader-weighting-valuation.mjs';
import part4 from '../config/reader-part4-reread.json' with { type: 'json' };
import { restorePart4RereadTestFiles } from './reader-part4-reread.mjs';
import particulate from '../config/reader-particulate-comparison.json' with { type: 'json' };
import eutro from '../config/reader-eutrophication-pathways.json' with { type: 'json' };
import bio from '../config/reader-biogenic-carbon.json' with { type: 'json' };
import water from '../config/reader-water-scarcity.json' with { type: 'json' };
import tox from '../config/reader-toxicity-comparison.json' with { type: 'json' };
import ozrad from '../config/reader-ozone-radiation.json' with { type: 'json' };
import ozone from '../config/reader-photochemical-ozone.json' with { type: 'json' };
import fossils from '../config/reader-fossil-resources.json' with { type: 'json' };
import minerals from '../config/reader-mineral-resources.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import sourceBaseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import serviceConstraints from '../config/reader-service-constraints.json' with { type: 'json' };
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { prepareAcidEquivalentsSource, verifyAcidEquivalentsReceipts } from './reader-acid-equivalents.mjs';

import { validateAcidEquivalentsFactors } from './reader-acid-equivalents-factors.mjs';
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';

test('B16 receipts bind captured raw files, normalized article pairs, public pages and JSON', {
  skip: !capture && config.status !== 'reviewed',
}, () => {
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const preTox = previousScientificTestRecords(preWater, tox.unit);
  const preOzrad = previousScientificTestRecords(preTox, ozrad.unit);
  const preOzone = previousScientificTestRecords(preOzrad, ozone.unit);
  const preFossils = previousScientificTestRecords(preOzone, fossils.unit);
  const previous = previousScientificTestRecords(preFossils, minerals.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const check = (changeUnit = () => {}, changeOutput) => {
    const unit = structuredClone(config.unit);
    changeUnit(unit);
    return verifyAcidEquivalentsReceipts(unit, testEnvelopes(capture, unit, changeOutput), expected);
  };
  assert(check());
  assert(!check(unit => { unit.outputCapture.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.previewDownloads = []; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).bytes = 1; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.html')).sha256 = '0'.repeat(64); }));
  assert(!check(unit => { unit.publicArtifacts.find(row => row.path === 'claims/index.html').sha256 = editionDigest('Different public HTML'); }));
  assert(!check(unit => {
    const [first, second] = unit.outputs.filter(row => row.path === '/print');
    [first.sha256, second.sha256] = [second.sha256, first.sha256];
  }));
});


test('B16 source plan declares every actual transition with its real predecessor', { skip: !config.unit }, async t => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, sourceBaseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, serviceConstraints.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restorePart6RereadTestFiles(files, part6.unit);
  restoreDataQualityComparisonTestFiles(files, dqp.unit);
  restoreProductFootprintComparisonTestFiles(files, pfr.unit);
  restoreUncertaintyComparisonTestFiles(files, unc.unit);
  restoreDataApplicabilityComparisonTestFiles(files, dapp.unit);
  restorePart5RereadTestFiles(files, part5.unit);
  restoreCostSustainabilityTestFiles(files, cost.unit);
  restoreSocialComparisonTestFiles(files, social.unit);
  restoreLocalizationComparisonTestFiles(files, localization.unit);
  restoreWeightingValuationTestFiles(files, weighting.unit);
  restorePart4RereadTestFiles(files, part4.unit);
  if (particulate.unit) files.set(`content${particulate.unit.routes[0]}.mdx`, Buffer.from(particulate.unit.previousMdx));
  if (eutro.unit) files.set(`content${eutro.unit.routes[0]}.mdx`, Buffer.from(eutro.unit.previousMdx));
  if (bio.unit) for (const [p, text] of Object.entries(bio.unit.previousMdx)) files.set(p, Buffer.from(text));
  if (water.unit) files.set(`content${water.unit.routes[0]}.mdx`, Buffer.from(water.unit.previousMdx));
  if (tox.unit) files.set(`content${tox.unit.routes[0]}.mdx`, Buffer.from(tox.unit.previousMdx));
  if (ozrad.unit) files.set(`content${ozrad.unit.routes[0]}.mdx`, Buffer.from(ozrad.unit.previousMdx));
  if (ozone.unit) files.set(`content${ozone.unit.routes[0]}.mdx`, Buffer.from(ozone.unit.previousMdx));
  if (fossils.unit) files.set(`content${fossils.unit.routes[0]}.mdx`, Buffer.from(fossils.unit.previousMdx));
  if (minerals.unit) files.set(`content${minerals.unit.routes[0]}.mdx`, Buffer.from(minerals.unit.previousMdx));
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const preTox = previousScientificTestRecords(preWater, tox.unit);
  const preOzrad = previousScientificTestRecords(preTox, ozrad.unit);
  const preOzone = previousScientificTestRecords(preOzrad, ozone.unit);
  const preFossils = previousScientificTestRecords(preOzone, fossils.unit);
  const input = { ...previousScientificTestRecords(preFossils, minerals.unit), files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const qualify = unit => prepareAcidEquivalentsSource(unit, input, actual, structure);
  const key = 'researchMetadata:order:queries';

  assert.doesNotThrow(() => qualify(config.unit));
  await t.test('omitted transition', () => {
    const omitted = structuredClone(config.unit);
    omitted.scope = omitted.scope.filter(id => id !== key);
    omitted.changes = omitted.changes.filter(row => row.key !== key);
    assert.throws(() => qualify(omitted), /missing actual record transition: researchMetadata:order:queries/);
  });
  await t.test('forged predecessor', () => {
    const forged = structuredClone(config.unit);
    forged.changes.find(row => row.key === key).from = { raw: 'f'.repeat(64), protected: 'e'.repeat(64), public: null };
    assert.throws(() => qualify(forged), /inexact predecessor for record transition: researchMetadata:order:queries/);
  });
});


test('EF counterchecks retain the six original row values and exact publication identities', () => {
  assert.doesNotThrow(() => validateAcidEquivalentsFactors(catalog, readings));
  const check = (mutate, diagnostic) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const fact = c.evidence.find(row => row.id === 'ev-acid113-ef-nh3-acid-cz');
    const pair = c.evidence.find(row => row.id === 'ev-acid113-ef-nh3-acid-al');
    const read = r.readings.find(row => row.id === 'rd-flow-pilot-ef31');
    mutate(fact, pair, read, c);
    assert.throws(() => validateAcidEquivalentsFactors(c,r), diagnostic);
  };
  const identity = /changed the verified EF factor/;
  check((fact,pair) => { [fact.numericFact,pair.numericFact] = [pair.numericFact,fact.numericFact]; }, identity);
  check(fact => { fact.numericFact.unit = 'mol N eq/kg NH₃'; }, identity);
  check((fact,pair,read) => {
    fact.locator = fact.locator.replace('03.00.004','03.00.003');
    read.passages.find(row => row.id === fact.passageId).locator = fact.locator;
  }, identity);
  check((fact,pair,read) => {
    read.artifacts.find(row => row.id === 'art-acid113-ef-method-acid').sha256 = '0'.repeat(64);
  }, /independently observed EF XML member/);
  check((fact,pair,read,c) => {
    const claim = c.claims.find(row => row.id === 'cl-acid113-nh3-control');
    claim.evidenceIds = claim.evidenceIds.filter(id => id !== fact.id);
  }, /lost the evidence for the actual comparison/);
  for (const [name, wrong] of [['mass', 'art-flow99-ef-mass-units'], ['kg', 'art-flow99-ef-mass']]) {
    check((fact,pair,read) => {
      read.passages.find(row => row.id === `psg-acid113-ef-${name}`).artifactId = wrong;
    }, /verified kilogram evidence carrier/);
  }
  check((fact,pair,read,c) => {
    c.evidence.find(row => row.id === 'ev-acid113-ef-kg').passageId = 'psg-acid113-ef-mass';
  }, /verified kilogram evidence carrier/);
  for (const id of ['cl-acid113-so2-rows', 'cl-acid113-nh3-control']) {
    check((fact,pair,read,c) => {
      const claim = c.claims.find(row => row.id === id);
      const numeric = claim.evidenceLinks.find(link => /ef-(so2|nh3)/.test(link.evidenceId));
      numeric.relation = 'context';
    }, /lost the evidence for the actual comparison/);
  }
});

test('PM retains the original GLAM reading and accepts only its scoped, exact successor', { skip: !config.unit }, async () => {
  const { validatePmSelectionCoverage } = await import('./reader-pm-selection.mjs');
  const { default: accepted } = await import('../config/pm-selection-accepted.json', { with: { type: 'json' } });
  const { default: edition } = await import('../config/book-edition.json', { with: { type: 'json' } });
  const root = fileURLToPath(new URL('../', import.meta.url));
  const files = await readReadableBookFiles(root, sourceBaseline.fixedFiles);
  const sources = new Map([...files].filter(([path]) => /^content\/.+\.mdx?$/.test(path))
    .map(([path, bytes]) => [path.slice(7).replace(/\.mdx?$/, '').replace(/\/index$/, ''), bytes.toString()]));
  const validate = ledger => validatePmSelectionCoverage(edition,sources,catalog,accepted,undefined,{readings:ledger,literature});
  assert.deepEqual(validate(readings), []);
  const changed = structuredClone(readings);
  const glam = changed.readings.find(row => row.id === 'rd-unep-glam-2019-pathways');
  glam.passages[0].locator += ' Unreviewed relocation.';
  assert(validate(changed).includes('PM selection reviewed research readings differs'));
  const unrelated = structuredClone(readings);
  const retained = accepted.research.readings.find(row => row.id !== glam.id);
  unrelated.readings.find(row => row.id === retained.id).passages[0].locator += ' Unreviewed relocation.';
  assert(validate(unrelated).includes('PM selection reviewed research readings differs'));
});
