import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-ozone-radiation.json' with { type: 'json' };
import capture from '../config/reader-ozone-radiation-capture.json' with { type: 'json' };
import rev from '../config/reader-revisable-judgment.json' with { type: 'json' };
import { restoreRevisableJudgmentTestFiles } from './reader-revisable-judgment.mjs';
import fut from '../config/reader-future-scenarios.json' with { type: 'json' };
import { restoreFutureScenariosTestFiles } from './reader-future-scenarios.mjs';
import intBags from '../config/reader-interpretation-bags.json' with { type: 'json' };
import { restoreInterpretationBagsTestFiles } from './reader-interpretation-bags.mjs';
import wsc from '../config/reader-wall-service-comparison.json' with { type: 'json' };
import { restoreWallServiceComparisonTestFiles } from './reader-wall-service-comparison.mjs';
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
import { validateOzoneRadiationFactors } from './reader-ozone-radiation-factors.mjs';
import {
  ozoneRadiationChapter, ozoneRadiationCorrections, ozoneRadiationSource, prepareOzoneRadiationSource,
  selectOzoneRadiation, validateOzoneRadiationCorrectionOutput, verifyOzoneRadiationReceipts,
} from './reader-ozone-radiation.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';

const prefix = 'ev-ozrad121-';

test('Ozone and radiation factors bind primary carriers, 26 XML members, 91 numeric facts, reversals and support links', () => {
  assert.doesNotThrow(() => validateOzoneRadiationFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validateOzoneRadiationFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-ozrad121-ef-method-ir').sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier|changed a verified EF 3\.1 XML member/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-ozrad121-ef-flow-cs137-sw').sha256 = '1'.repeat(64);
  }, /changed a verified EF 3\.1 XML member/);
  probe((_c, _r, evidence) => {
    evidence('rivm-ch3-odp-tables').numericFacts.find(f => f.id === 'rivm-odp-ch3br-20').value = '2.098';
  }, row);
  probe((_c, _r, _ev, passage) => {
    passage('recipe2017-summary').pdfIndices = [2, 3, 5];
  }, row);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-reference-scope');
    claim.text = claim.text.replace('0.786', '0.785');
  }, /changed the displayed reference-scope comparison/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-odp-horizons');
    claim.text = claim.text.replace('高约 27%', '高约 28%');
  }, /changed the displayed ODP rank-reversal calculations/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-ir-horizons');
    claim.text = claim.text.replace('淡水 5.99', '淡水 6.00');
  }, /changed the displayed IR horizon or uranium-series gap values/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-endpoint-choices');
    claim.text = claim.text.replace('57 DALY', '58 DALY');
  }, /changed the displayed endpoint DALY conversion parameters/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-formula-table');
    claim.text = claim.text.replace('2.098', '2.099');
  }, /changed the displayed Table 3\.2 formula-audit values/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-package-discrepancies');
    claim.text = claim.text.replace('共 113 行', '共 115 行');
  }, /changed the displayed EF report\/XML package discrepancy values/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-ozrad121-emission-bridge').evidenceLinks
      .find(link => link.evidenceId === prefix + 'jrc130796-odp-ir').relation = 'supports';
  }, /lost the explicit context link.*jrc130796-odp-ir/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozrad121-package-discrepancies');
    claim.evidenceIds = claim.evidenceIds.filter(id => id !== prefix + 'jrc130796-odp-ir');
    claim.evidenceLinks = claim.evidenceLinks.filter(link => link.evidenceId !== prefix + 'jrc130796-odp-ir');
  }, /changed the evidence link roster.*package-discrepancies/);
});

test('B14 four-generation scopes stack land-recovery, mineral-resources, fossil-resources and ozone-radiation in exact order', () => {
  const path = ozoneRadiationChapter;
  const pageKey = path + '#nd-page';
  const pageExpected = new Map([[pageKey, { addresses: [pageKey],
    row: { address: pageKey, previous: { kind: 'chapter', route: path, title: '中点与终点', claimIds: [] }, ordinary: [] },
  }]]);
  const source = { date: '2026-11-17', commit: 'c'.repeat(40) };
  const notice = (attribute, id = 'nd-page', title = '中点与终点') => `<details data-${attribute}-history="${id}" data-${attribute}-origins="${id}"><summary><time datetime="${source.date}">${source.date}</time> 版「${title}」的引用范围</summary><p><a data-${attribute}-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></p></details>`;
  const previousHistory = [
    { attribute: 'fossil-resources', expected: pageExpected },
    { attribute: 'mineral-resources', expected: pageExpected },
    { attribute: 'land-recovery', expected: pageExpected },
  ];
  const inspectPage = (inner, prev = previousHistory) => {
    const doc = htmlParser.parse(`<article id="nd-page"><div>${inner}</div></article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected: pageExpected, source, attribute: 'ozone-radiation', ordinaryPattern: /-land-111-ordinary-0$/,
      ordinaryTargets: {}, label: 'Ozone and radiation', previousHistory: prev,
    });
  };
  const pLand = notice('land-recovery');
  const pMineral = notice('mineral-resources');
  const pFossil = notice('fossil-resources');
  const pOzrad = notice('ozone-radiation');
  assert.deepEqual(inspectPage(pLand + pMineral + pFossil + pOzrad), []);
  assert(inspectPage(pLand + pFossil + pMineral + pOzrad).length);
  assert(inspectPage(pLand + pMineral + pOzrad).length);
  assert(inspectPage('<p>Detached</p>' + pLand + pMineral + pFossil + pOzrad).length);

  const headingKey = path + '#sec-1';
  const headingExpected = new Map([[headingKey, { addresses: [headingKey],
    row: { address: headingKey, previous: { kind: 'heading', route: path, title: '指标位置与保护对象', claimIds: [] }, ordinary: [] },
  }]]);
  const prevHeading = [
    { attribute: 'fossil-resources', expected: headingExpected },
    { attribute: 'mineral-resources', expected: headingExpected },
    { attribute: 'land-recovery', expected: headingExpected },
  ];
  const inspectHeading = inner => {
    const doc = htmlParser.parse(`<article><h3 id="sec-1">指标位置与保护对象</h3>${inner}</article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected: headingExpected, source, attribute: 'ozone-radiation', ordinaryPattern: /-land-111-ordinary-0$/,
      ordinaryTargets: {}, label: 'Ozone and radiation', previousHistory: prevHeading,
    });
  };
  const hLand = notice('land-recovery', 'sec-1', '指标位置与保护对象');
  const hMineral = notice('mineral-resources', 'sec-1', '指标位置与保护对象');
  const hFossil = notice('fossil-resources', 'sec-1', '指标位置与保护对象');
  const hOzrad = notice('ozone-radiation', 'sec-1', '指标位置与保护对象');
  assert.deepEqual(inspectHeading(hLand + hMineral + hFossil + hOzrad), []);
  assert(inspectHeading(hLand + hMineral + hOzrad + hFossil).length);
});

test('B14 opening and closing synchronization notices attach print-visibly to Note 1 and Note 41', () => {
  const { date, commit } = ozoneRadiationSource;
  for (const path of [ozoneRadiationChapter, '/print']) {
    const items = ozoneRadiationCorrections.map(({ claimId, scope }) => {
      const { id } = flowBoundaryNoteTarget(path, ozoneRadiationChapter, claimId);
      const p = `<p data-ozone-radiation-correction="${claimId}" style="display:block"><time datetime="${date}">${date}</time> 修订：${scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${commit}">查看前版源文件</a></p>`;
      return { claimId, id, p, li: `<li data-reader-claim="${claimId}" id="${id}">${p}</li>` };
    });
    const build = (lis, elsewhere = '') => htmlParser.parse(
      `<article data-reader-route="${ozoneRadiationChapter}">${elsewhere}<section class="chapter-notes"><ol>${lis}</ol></section></article>`);
    assert.deepEqual(validateOzoneRadiationCorrectionOutput(build(items.map(i => i.li).join('')), path, ozoneRadiationCorrections), []);
    const hiddenInPrint = build(items.map((i, idx) => idx === 0 ? i.li.replace(' style="display:block"', '') : i.li).join(''));
    assert(validateOzoneRadiationCorrectionOutput(hiddenInPrint, path, ozoneRadiationCorrections).length);
    const missingSecond = build(items[0].li);
    assert(validateOzoneRadiationCorrectionOutput(missingSecond, path, ozoneRadiationCorrections).length);
    const detached = build(`<li data-reader-claim="${items[0].claimId}" id="${items[0].id}"></li>${items[1].li}`, items[0].p);
    assert(validateOzoneRadiationCorrectionOutput(detached, path, ozoneRadiationCorrections).length);
    const duplicatedId = build(items.map(i => i.li).join(''), `<div id="${items[0].id}"></div>`);
    assert(validateOzoneRadiationCorrectionOutput(duplicatedId, path, ozoneRadiationCorrections).length);
    const wrongIntraNoteOrder = build(`<li data-reader-claim="${items[0].claimId}" id="${items[0].id}">${items[0].p}<p>Trailing</p></li>${items[1].li}`);
    assert(validateOzoneRadiationCorrectionOutput(wrongIntraNoteOrder, path, ozoneRadiationCorrections).length);
  }
});

test('B14 ozone and radiation source plan preserves all real predecessor transitions and framing synchronizations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectOzoneRadiation(config), /not independently accepted/);
    assert.equal(selectOzoneRadiation(config, undefined, true), config.unit);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restoreRevisableJudgmentTestFiles(files, rev.unit);
  restoreFutureScenariosTestFiles(files, fut.unit);
  restoreInterpretationBagsTestFiles(files, intBags.unit);
  restoreWallServiceComparisonTestFiles(files, wsc.unit);
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
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const input = { ...previousScientificTestRecords(preWater, tox.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = unit => prepareOzoneRadiationSource(unit, input, actual, structure);
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
  await t.test('requires exact framing synchronization metadata', () => {
    const unit = structuredClone(config.unit);
    unit.corrections = unit.corrections.slice(0, 1);
    assert.throws(() => qualify(unit), /synchronization metadata/);
  });
});

test('Ozone and radiation receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const previous = previousScientificTestRecords(preWater, tox.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyOzoneRadiationReceipts(unit, testEnvelopes(capture, unit, mutateOutput, ozoneRadiationSource.date), expected);
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
  assert(!verify(undefined, output => { output.previewDownloads = []; }));
});
