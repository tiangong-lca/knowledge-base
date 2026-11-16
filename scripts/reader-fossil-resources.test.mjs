import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-fossil-resources.json' with { type: 'json' };
import capture from '../config/reader-fossil-resources-capture.json' with { type: 'json' };
import ozrad from '../config/reader-ozone-radiation.json' with { type: 'json' };
import ozone from '../config/reader-photochemical-ozone.json' with { type: 'json' };
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
import { validateFossilResourcesFactors } from './reader-fossil-resources-factors.mjs';
import {
  fossilResourcesChapter, fossilResourcesCorrection, fossilResourcesSource, prepareFossilResourcesSource,
  selectFossilResources, validateFossilResourcesCorrectionOutput, verifyFossilResourcesReceipts,
} from './reader-fossil-resources.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';

const prefix = 'ev-fossil117-';

test('Fossil and energy-carrier factors bind original precision, carriers, arithmetic and claim supports', () => {
  assert.doesNotThrow(() => validateFossilResourcesFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, evidence, passage, r);
    assert.throws(() => validateFossilResourcesFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_, evidence) => { evidence('esm1-uranium').numericFact.value = '0.007823176189743574'; }, row);
  probe((_, evidence) => { evidence('rivm-ffp-and-hhv').numericFacts[0].value = '45.9'; }, row);
  probe((_, evidence) => { evidence('rivm-scp-endpoint').numericFacts[0].unit = 'USD2008/kg'; }, row);
  probe((_, evidence, passage) => {
    const changed = evidence('esm1-elements-scope').locator.replace('C10', 'A10');
    evidence('esm1-elements-scope').locator = changed;
    passage('esm1-elements-scope').locator = changed;
  }, row);
  probe((_, _evidence, passage) => { passage('jrc109369-energy-carriers').pdfIndices = [24]; }, row);
  probe((_c, _evidence, _passage, r) => {
    r.readings.find(row => row.id === 'rd-flow-pilot-ef31')
      .artifacts.find(row => row.id === 'art-fossil117-ef-flow-uranium').sha256 = '0'.repeat(64);
  }, /changed a verified EF 3\.1 XML member/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-fossil117-equal-midpoint');
    claim.text = claim.text.replace('0.081', '0.181');
  }, /changed the displayed equal-midpoint SCP divergence calculation/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-fossil117-equal-midpoint');
    claim.text = claim.text.replace('1.190', '9.190');
  }, /changed the displayed equal-midpoint SCP divergence calculation/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-fossil117-proxy-consequence');
    claim.text = claim.text.replace('0.155', '0.165');
  }, /changed the displayed egalitarian brown-coal\/peat proxy calculation/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-fossil117-proxy-consequence');
    claim.text = claim.text.replace('9.9 对 19.1', '8.9 对 19.1');
  }, /changed the displayed egalitarian brown-coal\/peat proxy calculation/);
  probe(c => {
    c.claims.find(row => row.id === 'cl-fossil117-equal-midpoint').evidenceLinks
      .find(link => link.evidenceId === 'ev-lcia-mid-end-conversion-limits').relation = 'context';
  }, /lost the explicit supports link.*ev-lcia-mid-end-conversion-limits/);
  probe(c => {
    c.claims.find(row => row.id === 'cl-fossil117-uranium-boundary').evidenceLinks
      .find(link => link.evidenceId === prefix + 'esm1-uranium').relation = 'context';
  }, /lost the explicit supports link.*esm1-uranium/);
  probe(c => {
    c.claims.find(row => row.id === 'cl-fossil117-scarcity-energy').evidenceLinks
      .find(link => link.evidenceId === prefix + 'adp2020-split').relation = 'supports';
  }, /lost the explicit context link.*adp2020-split/);
  probe(c => {
    const claim = c.claims.find(row => row.id === 'cl-fossil117-heating-basis');
    claim.evidenceIds = claim.evidenceIds.filter(id => id !== prefix + 'ef31-ncv-and-mineral-boundary');
    claim.evidenceLinks = claim.evidenceLinks.filter(link => link.evidenceId !== prefix + 'ef31-ncv-and-mineral-boundary');
  }, /changed the evidence link roster.*heating-basis/);
});

test('B14 three-generation scopes stack strictly in chronological order without loosening attachment', () => {
  const path = '/docs/book/midpoint-endpoint-value-choices';
  const key = path + '#heading';
  const expected = new Map([[key, { addresses: [key],
    row: { address: key, previous: { kind: 'heading', route: path, title: '旧题', claimIds: [] }, ordinary: [] },
  }]]);
  const source = { date: '2026-11-16', commit: 'b'.repeat(40) };
  const notice = (attribute, id = 'heading') => `<details data-${attribute}-history="${id}" data-${attribute}-origins="${id}"><summary><time datetime="${source.date}">${source.date}</time> 版「旧题」的引用范围</summary><p><a data-${attribute}-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></p></details>`;
  const inspect = (prefix, options = {}) => {
    const doc = htmlParser.parse(`<article><h2 id="heading">旧题</h2>${prefix}</article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected, source, attribute: 'fossil-resources', ordinaryPattern: /-land-111-ordinary-0$/,
      ordinaryTargets: {}, label: 'Fossil resources', ...options,
    });
  };
  const land = notice('land-recovery');
  const mineral = notice('mineral-resources');
  const fossil = notice('fossil-resources');
  const previousHistory = [
    { attribute: 'mineral-resources', expected },
    { attribute: 'land-recovery', expected },
  ];
  assert.deepEqual(inspect(land + mineral + fossil, { previousHistory }), []);
  assert(inspect(land + mineral + fossil).some(error => error.includes('invalid dated scope control')));
  assert(inspect(mineral + land + fossil, { previousHistory }).length);
  assert(inspect(land + fossil, { previousHistory }).length);
  assert(inspect(mineral + fossil, { previousHistory }).length);
  assert(inspect(fossil, { previousHistory }).length);
  assert(inspect(land + notice('mineral-resources', 'other') + fossil, { previousHistory }).length);
  assert(inspect('<p>Detached</p>' + land + mineral + fossil, { previousHistory }).length);

  // Chapter-level (#nd-page) controls must also enforce strict three-generation order and forbid detached siblings.
  const pageKey = path + '#nd-page';
  const pageExpected = new Map([[pageKey, { addresses: [pageKey],
    row: { address: pageKey, previous: { kind: 'chapter', route: path, title: '旧题', claimIds: [] }, ordinary: [] },
  }]]);
  const pagePrev = [
    { attribute: 'mineral-resources', expected: pageExpected },
    { attribute: 'land-recovery', expected: pageExpected },
  ];
  const inspectPage = inner => {
    const doc = htmlParser.parse(`<article id="nd-page"><div>${inner}</div></article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected: pageExpected, source, attribute: 'fossil-resources', ordinaryPattern: /-land-111-ordinary-0$/,
      ordinaryTargets: {}, label: 'Fossil resources', previousHistory: pagePrev,
    });
  };
  const pLand = notice('land-recovery', 'nd-page');
  const pMineral = notice('mineral-resources', 'nd-page');
  const pFossil = notice('fossil-resources', 'nd-page');
  assert.deepEqual(inspectPage(pLand + pMineral + pFossil), []);
  assert(inspectPage(pMineral + pLand + pFossil).length);
  assert(inspectPage(pLand + pFossil).length);
  assert(inspectPage('<p>Detached</p>' + pLand + pMineral + pFossil).length);
});

test('B14 closing sync notice attaches print-visibly to its native note', () => {
  const { claimId, scope } = fossilResourcesCorrection;
  const { date, commit } = fossilResourcesSource;
  for (const path of [fossilResourcesChapter, '/print']) {
    const { id } = flowBoundaryNoteTarget(path, fossilResourcesChapter, claimId);
    const correction = `<p data-fossil-resources-correction="${claimId}" style="display:block"><time datetime="${date}">${date}</time> 修订：${scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${commit}">查看前版源文件</a></p>`;
    const build = (native, elsewhere = '') => htmlParser.parse(
      `<article data-reader-route="${fossilResourcesChapter}">${elsewhere}<section class="chapter-notes"><ol><li data-reader-claim="${claimId}" id="${id}">${native}</li></ol></section></article>`);
    assert.deepEqual(validateFossilResourcesCorrectionOutput(build(correction), path, fossilResourcesCorrection), []);
    const hiddenInPrint = build(correction.replace(' style="display:block"', ''));
    assert(validateFossilResourcesCorrectionOutput(hiddenInPrint, path, fossilResourcesCorrection).length);
    const detached = build('', `<div data-reader-claim="${claimId}">${correction}</div>`);
    assert(validateFossilResourcesCorrectionOutput(detached, path, fossilResourcesCorrection).length);
    const duplicatedId = build(correction, `<div id="${id}"></div>`);
    assert(validateFossilResourcesCorrectionOutput(duplicatedId, path, fossilResourcesCorrection).length);
  }
});

test('B14 fossil source preview preserves all real predecessor transitions', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectFossilResources(config), /not independently accepted/);
    assert.equal(selectFossilResources(config, undefined, true), config.unit);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  if (ozrad.unit) files.set(`content${ozrad.unit.routes[0]}.mdx`, Buffer.from(ozrad.unit.previousMdx));
  if (ozone.unit) files.set(`content${ozone.unit.routes[0]}.mdx`, Buffer.from(ozone.unit.previousMdx));
  const preOzrad = previousScientificTestRecords({ catalog, readings, literature }, ozrad.unit);
  const input = { ...previousScientificTestRecords(preOzrad, ozone.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = unit => prepareFossilResourcesSource(unit, input, actual, structure);
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
  if (config.unit.correction) await t.test('changed closing judgment must retain its exact sync disposition', () => {
    const unit = structuredClone(config.unit);
    delete unit.correction;
    assert.throws(() => qualify(unit), /scope disposition for its closing sync/);
  });
});

test('Fossil receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const preOzrad = previousScientificTestRecords({ catalog, readings, literature }, ozrad.unit);
  const previous = previousScientificTestRecords(preOzrad, ozone.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyFossilResourcesReceipts(unit, testEnvelopes(capture, unit, mutateOutput, fossilResourcesSource.date), expected);
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
