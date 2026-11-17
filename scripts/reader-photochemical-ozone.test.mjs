import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-photochemical-ozone.json' with { type: 'json' };
import capture from '../config/reader-photochemical-ozone-capture.json' with { type: 'json' };
import tox from '../config/reader-toxicity-comparison.json' with { type: 'json' };
import ozrad from '../config/reader-ozone-radiation.json' with { type: 'json' };
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
import { validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { validatePhotochemicalOzoneFactors } from './reader-photochemical-ozone-factors.mjs';
import {
  photochemicalOzoneChapter, photochemicalOzoneHistoryControls, photochemicalOzoneSource,
  preparePhotochemicalOzoneSource, selectPhotochemicalOzone, verifyPhotochemicalOzoneReceipts,
} from './reader-photochemical-ozone.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';

const prefix = 'ev-ozone119-';

test('Photochemical ozone factors bind primary carriers, XML members, order reversals, titration sign flips and support links', () => {
  assert.doesNotThrow(() => validatePhotochemicalOzoneFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validatePhotochemicalOzoneFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-ozone119-ef-method-pof').sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier|changed a verified EF 3\.1 XML member/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-ozone119-ef-flow-chloromethane').sha256 = '1'.repeat(64);
  }, /changed a verified EF 3\.1 XML member/);
  probe((_c, _r, evidence) => {
    evidence('ef31-pof-core-factors').numericFacts.find(f => f.id === 'ef31-pof-voc-generic').value = '0.234';
  }, row);
  probe((_c, _r, _ev, passage) => {
    passage('jrc130796-pof-synonyms').pdfIndices = [4, 6, 9, 11];
  }, row);
  probe((_c, _r, evidence) => {
    evidence('rivm-s21-titration').numericFacts.find(f => f.id === 'rivm-s21-benelux-hofp-nox').value = '0.48';
  }, row);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-pocp-to-lotos');
    claim.text = claim.text.replace('乙烯为 1.69', '乙烯为 1.70');
  }, /changed the displayed POCP\/LOTOS-EUROS\/TM5-FASST factor summary/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-printed-limits');
    claim.text = claim.text.replace('0.14 kg CFC-11 当量/kg', '0.15 kg CFC-11 当量/kg');
  }, /changed the displayed synonym or isomer factor limits/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-order-reversal');
    claim.text = claim.text.replace('5.56 倍', '5.60 倍');
  }, /changed the displayed order-reversal calculation/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-titration-sign');
    claim.text = claim.text.replace('−0.48', '−0.49');
  }, /changed the displayed Table S2\.1 titration numbers/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-ef-location-copy');
    claim.text = claim.text.replace('0.0811 kg NMVOC 当量/kg', '0.081 kg NMVOC 当量/kg');
  }, /changed the displayed EF 3\.1 location-copy vs regional contrast/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-multipath-accounting');
    claim.text = claim.text.replace('0.00845', '0.0085');
  }, /changed the displayed multi-pathway precursor values/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-ozone119-pocp-to-lotos').evidenceLinks
      .find(link => link.evidenceId === prefix + 'recipe2017-ozone-overview').relation = 'supports';
  }, /lost the explicit context link.*recipe2017-ozone-overview/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-ozone119-ef-location-copy');
    claim.evidenceIds = claim.evidenceIds.filter(id => id !== prefix + 'ef31-multipath-uuid');
    claim.evidenceLinks = claim.evidenceLinks.filter(link => link.evidenceId !== prefix + 'ef31-multipath-uuid');
  }, /changed the evidence link roster.*ef-location-copy/);
});

test('B16 two-generation scopes stack acid-equivalents before photochemical-ozone and title the §4 ReaderSection marker', () => {
  const controls = photochemicalOzoneHistoryControls(config.unit);
  const webMarker = `${photochemicalOzoneChapter}#同一排放不同的环境问题`;
  assert.equal(controls.get(webMarker)?.row.previous.title, '同一排放不同的环境问题');

  const path = photochemicalOzoneChapter;
  const pageKey = path + '#nd-page';
  const pageExpected = new Map([[pageKey, { addresses: [pageKey],
    row: { address: pageKey, previous: { kind: 'chapter', route: path, title: '酸化与营养富集', claimIds: [] }, ordinary: [] },
  }]]);
  const source = { date: '2026-11-17', commit: '1'.repeat(40) };
  const notice = (attribute, id = 'nd-page') => `<details data-${attribute}-history="${id}" data-${attribute}-origins="${id}"><summary><time datetime="${source.date}">${source.date}</time> 版「酸化与营养富集」的引用范围</summary><p><a data-${attribute}-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></p></details>`;
  const previousHistory = [{ attribute: 'acid-equivalents', expected: pageExpected }];
  const inspectPage = (inner, prev = previousHistory) => {
    const doc = htmlParser.parse(`<article id="nd-page"><div>${inner}</div></article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected: pageExpected, source, attribute: 'photochemical-ozone', ordinaryPattern: /-acid-113-ordinary-0$/,
      ordinaryTargets: {}, label: 'Photochemical ozone', previousHistory: prev,
    });
  };
  const pAcid = notice('acid-equivalents');
  const pOzone = notice('photochemical-ozone');
  assert.deepEqual(inspectPage(pAcid + pOzone), []);
  assert(inspectPage(pOzone + pAcid).length);
  assert(inspectPage(pOzone).length);
  assert(inspectPage('<p>Detached</p>' + pAcid + pOzone).length);
});

test('B16 photochemical ozone source plan preserves all real predecessor transitions and forbids unreviewed corrections', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectPhotochemicalOzone(config), /not independently accepted/);
    assert.equal(selectPhotochemicalOzone(config, undefined, true), config.unit);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  if (tox.unit) files.set(`content${tox.unit.routes[0]}.mdx`, Buffer.from(tox.unit.previousMdx));
  if (ozrad.unit) files.set(`content${ozrad.unit.routes[0]}.mdx`, Buffer.from(ozrad.unit.previousMdx));
  const preTox = previousScientificTestRecords({ catalog, readings, literature }, tox.unit);
  const input = { ...previousScientificTestRecords(preTox, ozrad.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = unit => preparePhotochemicalOzoneSource(unit, input, actual, structure);
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
  await t.test('forbids unreviewed prior-claim correction metadata', () => {
    const unit = structuredClone(config.unit);
    unit.correction = { claimId: 'cl-path-multiple-paths', scope: 'forged' };
    assert.throws(() => qualify(unit), /must not declare an unreviewed prior-claim correction/);
  });
});

test('Photochemical ozone receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const preTox = previousScientificTestRecords({ catalog, readings, literature }, tox.unit);
  const previous = previousScientificTestRecords(preTox, ozrad.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyPhotochemicalOzoneReceipts(unit, testEnvelopes(capture, unit, mutateOutput, photochemicalOzoneSource.date), expected);
  };
  assert(verify());
  assert(!verify(unit => { unit.outputCapture.manifestSha256 = '0'.repeat(64); }));
  assert(!verify(undefined, output => { output.articleFiles[0].bytes++; }));
  assert(!verify(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).sha256 = '0'.repeat(64); }));
  assert(!verify(unit => {
    const [first, second] = unit.outputs;
    [first.sha256, second.sha256] = [second.sha256, first.sha256];
  }));
  assert(!verify(unit => { unit.publicArtifacts[0].sha256 = editionDigest('unreviewed HTML'); }));
});
