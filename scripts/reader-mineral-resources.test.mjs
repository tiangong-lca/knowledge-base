import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-mineral-resources.json' with { type: 'json' };
import capture from '../config/reader-mineral-resources-capture.json' with { type: 'json' };
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
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { flowBoundaryNoteTarget, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { validateMineralResourcesFactors } from './reader-mineral-resources-factors.mjs';
import {
  mineralResourcesChapter, mineralResourcesCorrection, mineralResourcesSource, prepareMineralResourcesSource,
  selectMineralResources, validateMineralResourcesCorrectionOutput, verifyMineralResourcesReceipts,
} from './reader-mineral-resources.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';

const prefix = 'ev-mineral115-';

test('Mineral factors bind original precision, scenario, unit, carrier and claim role', () => {
  assert.doesNotThrow(() => validateMineralResourcesFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, evidence, passage);
    assert.throws(() => validateMineralResourcesFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_, evidence) => { evidence('adp-cu').numericFact.value = '0.02134316735880023'; }, row);
  probe((_, evidence) => { evidence('adp-ni').numericFact.value = '0.0008147183750866022'; }, row);
  probe((_, evidence, passage) => {
    const changed = evidence('adp-cu').locator.replace('I30', 'I31');
    evidence('adp-cu').locator = changed;
    passage('adp-cu').locator = changed;
  }, row);
  probe((_, evidence) => {
    [evidence('sop-i-ni').numericFact, evidence('sop-he-ni').numericFact] =
      [evidence('sop-he-ni').numericFact, evidence('sop-i-ni').numericFact];
  }, row);
  probe((_, evidence) => { evidence('conversion-he').numericFact.unit = 'USD2013/kg'; }, row);
  probe((_, _evidence, passage) => { passage('sop-he-ni').pdfIndices = [91]; }, row);
  probe((_, evidence) => { evidence('scp-start').readingId = 'rd-mineral115-vieira2016-supplement'; }, row);
  probe((_, _evidence, passage) => {
    passage('scp-start').artifactId = 'art-mineral115-vieira2016-supplement';
  }, row);
  probe((_, evidence) => { evidence('scp-start').numericFacts[0].value = '593000000000'; }, row);
  probe((_, evidence) => { evidence('scp-start').summary = evidence('scp-start').summary.replace('5.92', '5.93'); }, row);
  probe((_, evidence) => { evidence('rivm-sop-method').numericFacts[0].unit = 'kg ore'; }, row);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-mineral115-calibration');
    claim.text = claim.text.replace('0.00602', '0.0602');
  }, /changed the displayed reserve-scenario comparison/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-mineral115-cost-proxy');
    claim.text = claim.text.replace('0.0189', '0.189');
  }, /changed the displayed H\/E cost comparison/);
  probe((c) => {
    c.claims.find(row => row.id === 'cl-mineral115-calibration').evidenceLinks
      .find(link => link.evidenceId === prefix + 'scp-start').relation = 'context';
  }, /lost the explicit support.*scp-start/);
  probe((c) => {
    const claim = c.claims.find(row => row.id === 'cl-mineral115-rank');
    claim.evidenceIds = claim.evidenceIds.filter(id => id !== prefix + 'adp-cu');
    claim.evidenceLinks = claim.evidenceLinks.filter(link => link.evidenceId !== prefix + 'adp-cu');
  }, /lost the explicit support.*adp-cu/);
});

test('B14 scopes can stack at an exact address while older validation stays strict', () => {
  const path = '/docs/book/midpoint-endpoint-value-choices';
  const key = path + '#heading';
  const expected = new Map([[key, { addresses: [key],
    row: { address: key, previous: { kind: 'heading', route: path, title: '旧题', claimIds: [] }, ordinary: [] },
  }]]);
  const source = { date: '2026-11-16', commit: 'a'.repeat(40) };
  const notice = (attribute, id = 'heading') => `<details data-${attribute}-history="${id}" data-${attribute}-origins="${id}"><summary><time datetime="${source.date}">${source.date}</time> 版「旧题」的引用范围</summary><p><a data-${attribute}-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></p></details>`;
  const inspect = (prefix, options = {}) => {
    const doc = htmlParser.parse(`<article><h2 id="heading">旧题</h2>${prefix}</article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected, source, attribute: 'mineral-resources', ordinaryPattern: /-land-111-ordinary-0$/,
      ordinaryTargets: {}, label: 'Mineral resources', ...options,
    });
  };
  const older = notice('land-recovery'), current = notice('mineral-resources');
  const previousHistory = { attribute: 'land-recovery', expected };
  assert.deepEqual(inspect(older + current, { previousHistory }), []);
  assert(inspect(older + current).some(error => error.includes('invalid dated scope control')));
  assert(inspect(notice('land-recovery', 'other') + current, { previousHistory }).length);
  assert(inspect('<p>Detached</p>' + older + current, { previousHistory }).length);
  assert(inspect(current + older, { attribute: 'land-recovery' }).length);
  assert.deepEqual(inspect(older + current, { attribute: 'land-recovery' }), []);
});

test('B14 opening correction attaches to the unique native first note', () => {
  const { claimId, scope } = mineralResourcesCorrection;
  const { date, commit } = mineralResourcesSource;
  for (const path of [mineralResourcesChapter, '/print']) {
    const { id } = flowBoundaryNoteTarget(path, mineralResourcesChapter, claimId);
    const correction = `<p data-mineral-resources-correction="${claimId}" style="display:block"><time datetime="${date}">${date}</time> 修订：${scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${commit}">查看前版源文件</a></p>`;
    const build = (native, elsewhere = '') => htmlParser.parse(
      `<article data-reader-route="${mineralResourcesChapter}">${elsewhere}<section class="chapter-notes"><ol><li data-reader-claim="${claimId}" id="${id}">${native}</li></ol></section></article>`);
    assert.deepEqual(validateMineralResourcesCorrectionOutput(build(correction), path, mineralResourcesCorrection), []);
    const hiddenInPrint = build(correction.replace(' style="display:block"', ''));
    assert(validateMineralResourcesCorrectionOutput(hiddenInPrint, path, mineralResourcesCorrection).length);
    const detached = build('', `<div data-reader-claim="${claimId}">${correction}</div>`);
    assert(validateMineralResourcesCorrectionOutput(detached, path, mineralResourcesCorrection).length);
    const duplicatedId = build(correction, `<div id="${id}"></div>`);
    assert(validateMineralResourcesCorrectionOutput(duplicatedId, path, mineralResourcesCorrection).length);
  }
});

test('B14 mineral source preview preserves all real predecessor transitions', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectMineralResources(config), /not independently accepted/);
    assert.equal(selectMineralResources(config, undefined, true), config.unit);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
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
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const preTox = previousScientificTestRecords(preWater, tox.unit);
  const preOzrad = previousScientificTestRecords(preTox, ozrad.unit);
  const preOzone = previousScientificTestRecords(preOzrad, ozone.unit);
  const input = { ...previousScientificTestRecords(preOzone, fossils.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = unit => prepareMineralResourcesSource(unit, input, actual, structure);
  assert.doesNotThrow(() => qualify(config.unit));
  const key = 'researchMetadata:order:queries';
  await t.test('omitted ordered transition', () => {
    const unit = structuredClone(config.unit);
    unit.scope = unit.scope.filter(id => id !== key);
    unit.changes = unit.changes.filter(row => row.key !== key);
    assert.throws(() => qualify(unit), /missing actual record transition: researchMetadata:order:queries/);
  });
  await t.test('forged predecessor', () => {
    const unit = structuredClone(config.unit);
    unit.changes.find(row => row.key === key).from = { raw: 'f'.repeat(64), protected: 'e'.repeat(64), public: null };
    assert.throws(() => qualify(unit), /inexact predecessor for record transition: researchMetadata:order:queries/);
  });
  if (config.unit.correction) await t.test('changed opening must retain its exact correction disposition', () => {
    const unit = structuredClone(config.unit);
    delete unit.correction;
    assert.throws(() => qualify(unit), /scope disposition for its opening correction/);
  });
});

test('Mineral receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const preTox = previousScientificTestRecords(preWater, tox.unit);
  const preOzrad = previousScientificTestRecords(preTox, ozrad.unit);
  const preOzone = previousScientificTestRecords(preOzrad, ozone.unit);
  const previous = previousScientificTestRecords(preOzone, fossils.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyMineralResourcesReceipts(unit, testEnvelopes(capture, unit, mutateOutput, mineralResourcesSource.date), expected);
  };
  assert(verify());
  assert(!verify(unit => { unit.outputCapture.manifestSha256 = '0'.repeat(64); }));
  assert(!verify(undefined, output => { output.articleFiles[0].bytes++; }));
  assert(!verify(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).sha256 = '0'.repeat(64); }));
  assert(!verify(unit => {
    const [first, second] = unit.outputs.filter(row => row.path === '/print');
    [first.sha256, second.sha256] = [second.sha256, first.sha256];
  }));
  assert(!verify(unit => { unit.publicArtifacts[0].sha256 = editionDigest('unreviewed HTML'); }));
});
