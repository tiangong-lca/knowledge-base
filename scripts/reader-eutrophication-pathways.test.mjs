import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import part4 from '../config/reader-part4-reread.json' with { type: 'json' };
import { restorePart4RereadTestFiles } from './reader-part4-reread.mjs';
import particulate from '../config/reader-particulate-comparison.json' with { type: 'json' };
import config from '../config/reader-eutrophication-pathways.json' with { type: 'json' };
import capture from '../config/reader-eutrophication-pathways-capture.json' with { type: 'json' };
import ozone from '../config/reader-photochemical-ozone.json' with { type: 'json' };
import acid from '../config/reader-acid-equivalents.json' with { type: 'json' };
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
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { readCitationSurface } from './reader-surface.mjs';
import {
  exactDecimal,
  mulScaled,
  ratioScaled,
  validateEutrophicationPathwaysFactors,
} from './reader-eutrophication-pathways-factors.mjs';
import {
  eutrophicationPathwaysCapturePin,
  eutrophicationPathwaysChapter,
  eutrophicationPathwaysHistoryControls,
  eutrophicationPathwaysPreviousSurface,
  eutrophicationPathwaysSource,
  prepareEutrophicationPathwaysSource,
  qualifyEutrophicationPathwaysHistory,
  selectEutrophicationPathways,
  verifyEutrophicationPathwaysReceipts,
} from './reader-eutrophication-pathways.mjs';

const evPrefix = 'ev-eutro129-';

test('Eutrophication pathways BigInt rational helpers compute exact scaled decimals without float drift', () => {
  const one = exactDecimal('1');
  assert.equal(exactDecimal('0.05') * 20n, one);
  assert.equal(mulScaled(exactDecimal('2'), exactDecimal('0.05')), exactDecimal('0.1'));
  assert.equal(mulScaled(exactDecimal('3'), exactDecimal('0.389')), exactDecimal('1.167'));
  assert.equal(ratioScaled(exactDecimal('0.1'), exactDecimal('0.05')), exactDecimal('2'));
  assert.equal(ratioScaled(exactDecimal('4.26'), exactDecimal('3.547')) > exactDecimal('1.201'), true);
  assert.throws(() => exactDecimal('1.23e30'), /requires canonical decimal literal/);
  assert.throws(() => exactDecimal('0.' + '1'.repeat(50)), /decimal exceeds \d+ places/);
  assert.throws(() => ratioScaled(one, 0n), /zero denominator/);
});

test('Eutrophication pathways factors guard all 126 numericFacts, 22 EF XMLs, XLSX cells, PDF pages and prose bindings', () => {
  assert.doesNotThrow(() => validateEutrophicationPathwaysFactors(catalog, readings));
  assert.doesNotThrow(() => validateEutrophicationPathwaysFactors(catalog, readings, { skipRowDigests: true }));

  // Exhaustive single-fact mutation check across all 126 numericFacts in skipRowDigests mode:
  const eutroEvs = catalog.evidence.filter(e => e.id.startsWith(evPrefix));
  assert.equal(eutroEvs.length, 12);
  let totalFacts = 0;
  for (const ev of eutroEvs) {
    for (let i = 0; i < ev.numericFacts.length; i++) {
      totalFacts++;
      const c = structuredClone(catalog);
      const target = c.evidence.find(e => e.id === ev.id).numericFacts[i];
      target.value = target.value === '0' ? '1' : '0';
      assert.throws(
        () => validateEutrophicationPathwaysFactors(c, readings, { skipRowDigests: true }),
        /Eutrophication pathways/,
        `Mutated numericFact survived: ${ev.id} -> ${target.id}`,
      );
    }
  }
  assert.equal(totalFacts, 126);

  const probe = (mutate, expected, opts) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === evPrefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validateEutrophicationPathwaysFactors(c, r, opts), expected);
  };

  // Carrier & EF 3.1 XML member integrity
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-eutro129-ef-method-fw').sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier|changed a verified EF 3\.1 member/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-eutro129-ef-flow-no3-fw').notes = 'HTTP 200 full zip';
  }, /changed a verified EF 3\.1 member/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-eutro129-lcimpact-ch8-ch9').artifacts[0].pageCount = 183;
  }, /changed the independently observed carrier/);
  probe((_c, _r, _ev, passage) => {
    passage('lcimpact-ch9-marine').pdfIndices = [96, 97];
  }, /changed the selected row or support passage/);

  // Prose cross-binding across all 8 claims
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-category-genealogy');
    cl.text = cl.text.replace('15000 种淡水鱼类', '16000 种淡水鱼类');
  }, /changed the displayed category genealogy prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-phosphorus-soil-water-interface');
    cl.text = cl.text.replace('0.10 kg P 当量', '0.11 kg P 当量');
  }, /changed the displayed 2 kg P soil-water interface prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-phosphorus-stoichiometry-and-p2o5');
    cl.text = cl.text.replace('0.22 kg P 当量/kg', '0.44 kg P 当量/kg');
  }, /changed the displayed P2O5 stoichiometry or Table S4\.2 prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-nitrogen-soil-prohibition');
    cl.text = cl.text.replace('1.33 kg NO₃⁻/kg N', '1.30 kg NO₃⁻/kg N');
  }, /changed the displayed nitrogen soil prohibition prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-aquatic-and-airborne-n-reversals');
    cl.text = cl.text.replace('1.167 kg N 当量', '1.168 kg N 当量');
  }, /changed the displayed aquatic\/airborne N rank reversal prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-location-copies-and-nox-inversion');
    cl.text = cl.text.replace('4.26 mol N 当量/kg', '3.55 mol N 当量/kg');
  }, /changed the displayed location copy and NOx inversion prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-normalization-double-counting-and-xml-anomalies');
    cl.text = cl.text.replace('15.6%', '15.7%');
  }, /changed the displayed NF double-counting and XML anomaly prose/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-operational-synthesis');
    cl.text = cl.text.replace('47.0%', '47.1%');
  }, /changed the displayed five-step operational synthesis prose/);

  // Support link & non-empty conceptIds rejection
  probe(c => {
    c.claims.find(x => x.id === 'cl-eutro129-category-genealogy').conceptIds = ['concept-eutro'];
  }, /lacks reviewed status, caveats or bounded conceptIds/);
  probe(c => {
    const cl = c.claims.find(x => x.id === 'cl-eutro129-operational-synthesis');
    cl.evidenceIds = cl.evidenceIds.slice(1);
    cl.evidenceLinks = cl.evidenceLinks.slice(1);
  }, /changed the evidence link roster/);
});

test('B16 three-generation history stacks acid-equivalents -> photochemical-ozone -> eutrophication-pathways and rolls back surface', () => {
  const controls = eutrophicationPathwaysHistoryControls(config.unit);
  assert.equal(controls.size, 6);
  const webSection = `${eutrophicationPathwaysChapter}#从施用量走到净排放和指标`;
  assert.equal(controls.get(webSection)?.row.previous.title, '清单与类别指标');

  const path = eutrophicationPathwaysChapter;
  const pageKey = path + '#nd-page';
  const pageExpected = new Map([[pageKey, {
    addresses: [pageKey],
    row: { address: pageKey, previous: { kind: 'chapter', route: path, title: '酸化与营养富集', claimIds: [] }, ordinary: [] },
  }]]);
  const source = { date: '2026-11-17', commit: '8fcb2485b97a1476896549806740a030b637d00b' };
  const notice = (attribute, id = 'nd-page') =>
    `<details data-${attribute}-history="${id}" data-${attribute}-origins="${id}"><summary><time datetime="${source.date}">${source.date}</time> 版「酸化与营养富集」的引用范围</summary><p><a data-${attribute}-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></p></details>`;
  // previousHistory in validateDatedHistoryOutput is newest-to-oldest!
  const previousHistory = [
    { attribute: 'photochemical-ozone', expected: pageExpected },
    { attribute: 'acid-equivalents', expected: pageExpected },
  ];
  const inspectPage = inner => {
    const doc = htmlParser.parse(`<article id="nd-page"><div>${inner}</div></article>`);
    return validateDatedHistoryOutput(new Map([[path, doc]]), {
      expected: pageExpected,
      source,
      attribute: 'eutrophication-pathways',
      ordinaryPattern: /-acid-113-ordinary-0$/,
      ordinaryTargets: {},
      label: 'Eutrophication pathways',
      previousHistory,
    });
  };
  const pAcid = notice('acid-equivalents');
  const pOzone = notice('photochemical-ozone');
  const pEutro = notice('eutrophication-pathways');
  assert.deepEqual(inspectPage(pAcid + pOzone + pEutro), []);
  assert(inspectPage(pOzone + pAcid + pEutro).length, 'wrong prior order must fail');
  assert(inspectPage(pAcid + pEutro + pOzone).length, 'eutro before ozone must fail');
  assert(inspectPage(pAcid + pEutro).length, 'missing photochemical-ozone must fail');
  assert(inspectPage('<p>Detached</p>' + pAcid + pOzone + pEutro).length, 'detached control must fail');

  // citationScopeExclusions must exclude [data-eutrophication-pathways-history] from ordinaryHashes:
  assert.deepEqual(config.unit.history.currentAddresses[pageKey].ordinary, ozone.unit.history.currentAddresses[pageKey].ordinary);
  assert.deepEqual(config.unit.history.currentAddresses[webSection].ordinary, []);
  const surfaceDoc = htmlParser.parse(
    `<article id="nd-page" data-reader-route="${path}" data-reader-title="酸化与营养富集"><h1 id="main-content" data-reader-heading-key="@unit">酸化与营养富集</h1><p>导语段落。</p>${pEutro}</article>`,
  );
  const parsedSurface = readCitationSurface(surfaceDoc, path);
  assert.equal(parsedSurface.ids.get('nd-page').ordinaryHashes.length, 1);

  // Surface rollback restores exact 30-claim predecessor B16 surface:
  const rolled = eutrophicationPathwaysPreviousSurface(
    pageKey,
    { claimIds: config.unit.history.currentAddresses[pageKey].claimIds, ordinaryHashes: config.unit.history.currentAddresses[pageKey].ordinary },
    config.unit,
  );
  assert.equal(rolled.claimIds.length, 30);
  assert.equal(rolled.claimIds.some(id => id.startsWith('cl-eutro129-')), false);
  assert.deepEqual(rolled.claimIds, ozone.unit.history.currentAddresses[pageKey].claimIds);

  // Disabled unit pass-through:
  const noop = qualifyEutrophicationPathwaysHistory(new Map(), null, { k: 1 }, ozone.unit, acid.unit);
  assert.deepEqual(noop, { prior: { k: 1 }, errors: [] });
});

test('B16 eutrophication pathways source plan preserves 8fcb2485 predecessor, 38-claim layout and forbids unreviewed mutations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectEutrophicationPathways(config), /not independently accepted/);
    assert.equal(selectEutrophicationPathways(config, undefined, true), config.unit);
    assert.throws(() => selectEutrophicationPathways(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectEutrophicationPathways(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectEutrophicationPathways({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restorePart4RereadTestFiles(files, part4.unit);
  if (particulate.unit) files.set(`content${particulate.unit.routes[0]}.mdx`, Buffer.from(particulate.unit.previousMdx));
  const input = { ...previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part4.unit), particulate.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareEutrophicationPathwaysSource(unit, customInput, customActual, customStruct);
  const res = qualify(config.unit);
  assert.equal(config.unit.occurrences.length, 38);
  assert.equal(res.affectedClaimIds.length, 323);

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
  await t.test('forbids unreviewed prior-claim correction and corrections metadata', () => {
    const u1 = structuredClone(config.unit);
    u1.correction = { claimId: 'cl-path-operation-indicator', scope: 'forged' };
    assert.throws(() => qualify(u1), /must not declare an unreviewed prior-claim correction/);
    const u2 = structuredClone(config.unit);
    u2.corrections = [];
    assert.throws(() => qualify(u2), /must not declare an unreviewed prior-claim correction/);
  });
  await t.test('enforces append-only prior research history and psg-eutro129-/art-eutro129- prefixes', () => {
    const unit1 = structuredClone(config.unit);
    unit1.rawRecords.find(r => r.path === 'catalog.sources' && r.id === 'src-kb44-ec2021').from.reading.scope = 'tampered';
    assert.throws(() => qualify(unit1), /changed a previous source or its acquisition scope: src-kb44-ec2021/);

    const unit2 = structuredClone(config.unit);
    unit2.rawRecords.find(r => r.path === 'literature.records' && r.id === 'lit-m05').from.limitations = [];
    assert.throws(() => qualify(unit2), /changed a previous work or its acquisition history: lit-m05/);

    const badReadings = structuredClone(input.readings);
    badReadings.readings.find(r => r.id === 'rd-flow-pilot-ef31').artifacts.at(-1).id = 'art-rogue-xml';
    const badInput = { ...input, readings: badReadings };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const unit3 = structuredClone(config.unit);
    for (const ch of unit3.changes) {
      if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    }
    assert.throws(() => qualify(unit3, badInput, badActual, badStruct), /changed a previous reading, carrier or passage prefix: rd-flow-pilot-ef31/);
  });
  await t.test('rejects protected B16 MDX edits and consumer review omissions', () => {
    const mdxPath = 'content/docs/book/acidification-and-nutrient-pathways.mdx';
    const uMdx = structuredClone(config.unit);
    uMdx.previousMdx = uMdx.previousMdx + '\n';
    assert.throws(() => qualify(uMdx), /independently preserved predecessor B16 MDX bytes/);

    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const uTrail = structuredClone(config.unit);
    uTrail.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(uTrail, badInput, badActual, badStruct), /changed protected B16 text or moved its single §4 addition/);

    const uConsumers = structuredClone(config.unit);
    uConsumers.consumers = uConsumers.consumers.slice(1);
    assert.throws(() => qualify(uConsumers), /exact cross-generation consumer review/);
  });
});

test('Eutrophication pathways receipt verifier fails closed when capture or capture pin is absent', () => {
  if (eutrophicationPathwaysCapturePin !== null) return;
  if (!config.unit) return;
  const expected = readerPublicDownloads(catalog, literature, readings);
  const unit = structuredClone(config.unit);
  unit.outputs = [{ path: eutrophicationPathwaysChapter, route: eutrophicationPathwaysChapter, sha256: '1'.repeat(64), rationale: 'r' }];
  unit.publicArtifacts = [{ path: 'claims/index.html', sha256: '2'.repeat(64), rationale: 'r' }];
  unit.outputCapture = {
    sourceCommit: '8fcb2485b97a1476896549806740a030b637d00b',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: '8fcb2485b97a1476896549806740a030b637d00b', manifestSha256: '3'.repeat(64) },
    normalization: { articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })), publicHtml: [{ path: 'claims/index.html', sha256: '2'.repeat(64) }] },
    files: [
      { path: 'docs/book/acidification-and-nutrient-pathways/index.html', sha256: '5'.repeat(64), bytes: 100 },
      { path: 'claims/index.html', sha256: '2'.repeat(64), bytes: 200 },
    ],
  };
  assert.equal(verifyEutrophicationPathwaysReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), expected), false);
});

test('Eutrophication pathways receipts bind actual output capture independently', { skip: !eutrophicationPathwaysCapturePin && config.status !== 'reviewed' }, () => {
  const previous = previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part4.unit), particulate.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyEutrophicationPathwaysReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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
  assert(!verify(undefined, output => { output.previewDownloads = []; }));
});

test('PM retains the original GLAM work and accepts only its scoped, exact literature successor', { skip: !config.unit }, async () => {
  const { validatePmSelectionCoverage } = await import('./reader-pm-selection.mjs');
  const { default: accepted } = await import('../config/pm-selection-accepted.json', { with: { type: 'json' } });
  const { default: edition } = await import('../config/book-edition.json', { with: { type: 'json' } });
  const root = fileURLToPath(new URL('../', import.meta.url));
  const files = await readReadableBookFiles(root, baseline.fixedFiles);
  const sources = new Map([...files].filter(([path]) => /^content\/.+\.mdx?$/.test(path))
    .map(([path, bytes]) => [path.slice(7).replace(/\.mdx?$/, '').replace(/\/index$/, ''), bytes.toString()]));
  const validate = lit => validatePmSelectionCoverage(edition, sources, catalog, accepted, undefined, { readings, literature: lit });
  assert.deepEqual(validate(literature), []);

  const tamperedGlam = structuredClone(literature);
  tamperedGlam.records.find(row => row.id === 'work-unep-glam-2019-volume2').limitations.push('Unreviewed addition.');
  assert(validate(tamperedGlam).includes('PM selection reviewed research literature differs'));

  const tamperedOther = structuredClone(literature);
  const otherId = accepted.research.literature.find(row => !['work-unep-glam-2019-volume2', 'work-kb46-lcimpact2020'].includes(row.id)).id;
  tamperedOther.records.find(row => row.id === otherId).limitations.push('Unreviewed addition.');
  assert(validate(tamperedOther).includes('PM selection reviewed research literature differs'));
});
