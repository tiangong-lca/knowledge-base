import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-biogenic-carbon.json' with { type: 'json' };
import capture from '../config/reader-biogenic-carbon-capture.json' with { type: 'json' };
import eutro from '../config/reader-eutrophication-pathways.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { inspectClimateAssemblySource } from './reader-climate-assembly.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { flowBoundaryOrdinaryDigest, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  exactDecimal,
  mulScaled,
  ratioScaled,
  validateBiogenicCarbonFactors,
} from './reader-biogenic-carbon-factors.mjs';
import {
  biogenicCarbonCapturePin,
  biogenicCarbonHistoryControls,
  biogenicCarbonLayout,
  biogenicCarbonOrdinaryId,
  biogenicCarbonPreviousSurface,
  biogenicCarbonRoutes,
  biogenicCarbonSource,
  biogenicCarbonSources,
  predecessorReaderSource,
  prepareBiogenicCarbonSource,
  selectBiogenicCarbon,
  verifyBiogenicCarbonReceipts,
} from './reader-biogenic-carbon.mjs';

const prefix = 'ev-bio127-';

test('Biogenic carbon factors bind 11 carriers, 23 EF 3.1 members, 128 numeric facts, reversals and support links', () => {
  assert.doesNotThrow(() => validateBiogenicCarbonFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validateBiogenicCarbonFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-kb54-ipcc-ar6-errata-2025-10-07-pdf').artifacts[0].sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-bio127-ef31-selected-members').artifact.sha256 = '2'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-bio127-ef31-selected-members').reading.readingId = 'rd-forged';
  }, /changed the independently observed carrier/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-bio127-ef-nf-wf-xlsx').sha256 = '1'.repeat(64);
  }, /changed a verified EF 3\.1 member/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-bio127-ef-pef-method-pdf').pageCount = 199;
  }, /changed a verified EF 3\.1 member/);
  probe(c => {
    c.evidence = c.evidence.filter(x => x.id !== prefix + 'recipe2017-climate');
  }, /evidence count differs from its pinned row inventory/);
  probe((_c, _r, evidence) => {
    evidence('ef31-nf-workbook').numericFacts.find(f => f.id === 'ef31-nf-ch4-bio-cf-fgd').value = '27.0';
  }, row);
  probe((_c, _r, _ev, passage) => {
    passage('ar6-errata-fgd-p25').pdfIndices = [23];
  }, row);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-midpoint-endpoint-genealogy');
    claim.text = claim.text.replace('21.06%', '21.05%');
  }, /changed the displayed midpoint-endpoint genealogy prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-feedback-perspective-asymmetry');
    claim.text = claim.text.replace('294 对 264', '293 对 264');
  }, /changed the displayed ReCiPe 2016 feedback-asymmetry prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-ef31-subindicator-partition');
    claim.text = claim.text.replace('1074＋13＋12＝1099', '1073＋14＋12＝1099');
  }, /changed the displayed EF 3\.1 sub-indicator partition prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-zero-zero-vs-minus-plus-one');
    claim.text = claim.text.replace('−3.17 kg CO₂ 当量', '−3.16 kg CO₂ 当量');
  }, /changed the displayed 0\/0 vs -1\/\+1 accounting prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-co-removal-and-methane-shift');
    claim.text = claim.text.replace('141.5 kg CO₂ 当量', '141.6 kg CO₂ 当量');
  }, /changed the displayed CO removal and methane shift prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-package-and-report-discrepancies');
    claim.text = claim.text.replace('1,2684.1', '12,684.1');
  }, /changed the displayed package and report discrepancies prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-storage-abolition-and-dluc-window');
    claim.text = claim.text.replace('评估前 20 年', '评估前 30 年');
  }, /changed the displayed storage abolition and dLUC window prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-bio127-climate-diagnostic-synthesis');
    claim.text = claim.text.replace('终审草稿生物源甲烷值 27.2', '终审草稿生物源甲烷值 27.0');
  }, /changed the displayed five-step diagnostic synthesis prose/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-bio127-climate-diagnostic-synthesis').evidenceLinks.pop();
  }, /changed the evidence link roster/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-bio127-climate-diagnostic-synthesis').conceptIds = ['concept-forged'];
  }, /lacks reviewed status or bounded conceptIds\/mappingIds/);
});

test('Sign-aware fixed-point math and zero-survivor mutation guard across all 128 numericFacts with row digests bypassed', () => {
  const s = exactDecimal('1');
  assert.equal(mulScaled(exactDecimal('3.6666666666666666666666666666666666666667'), exactDecimal('-1.0')),
    exactDecimal('-3.6666666666666666666666666666666666666667'));
  assert.equal(ratioScaled(-3n * s, 2n * s), exactDecimal('-1.5'));
  assert.throws(() => ratioScaled(s, 0n), /zero denominator/);
  assert.throws(() => exactDecimal('100.5.999'), /canonical decimal literal/);
  assert.throws(() => exactDecimal(''), /canonical decimal literal/);
  assert.throws(() => exactDecimal('-'), /canonical decimal literal/);
  assert.throws(() => exactDecimal('01'), /canonical decimal literal/);

  assert.doesNotThrow(() => validateBiogenicCarbonFactors(catalog, readings, { skipRowDigests: true }));

  const evRows = catalog.evidence.filter(e => e.id.startsWith(prefix));
  let checkedCount = 0;
  for (const row of evRows) {
    for (const item of row.numericFacts ?? []) {
      checkedCount++;
      const orig = item.value;
      const dotIdx = orig.indexOf('.');
      const stepStr = dotIdx < 0 ? '1' : '0.' + '0'.repeat(orig.length - dotIdx - 2) + '1';
      const bumpedVal = orig === '0' ? '1' : orig === '0.0' ? '0.1' : orig + '1';
      for (const candidate of [bumpedVal, orig === '0' ? '-1' : (orig.includes('.') ? orig.slice(0, -1) + (orig.endsWith('9') ? '8' : '9') : String(BigInt(orig) + 1n))]) {
        const c = structuredClone(catalog);
        c.evidence.find(e => e.id === row.id).numericFacts.find(f => f.id === item.id).value = candidate;
        assert.throws(
          () => validateBiogenicCarbonFactors(c, readings, { skipRowDigests: true }),
          /drifted from verified primary literal|canonical decimal literal/,
          `Fact ${item.id} survived mutation ${orig} -> ${candidate} (${stepStr})`,
        );
      }
    }
  }
  assert.equal(checkedCount, 128);
});

test('Biogenic carbon ordinary IDs and history apparatus cover P and FIGURE targets on B15 routes', () => {
  const unit = config.unit ?? { id: 'biogenic-carbon-127' };
  const webMetrics = '/docs/book/climate-response-and-metrics';
  const webTime = '/docs/book/emission-time-and-assessment';
  const bookKey = 'book-climate-equivalence';

  assert.equal(biogenicCarbonOrdinaryId(null, webMetrics, false, 0), undefined);
  assert.equal(biogenicCarbonOrdinaryId(unit, '/docs/book/other', false, 0), undefined);
  assert.equal(biogenicCarbonOrdinaryId(unit, bookKey, false, 0), undefined);
  assert.equal(biogenicCarbonOrdinaryId(unit, webMetrics, true, 0), undefined);
  assert.equal(biogenicCarbonOrdinaryId(unit, webTime, false, 'figure'), undefined);

  const webDescId = `${chapterAnchorPrefix(webMetrics)}-bio-127-ordinary-0`;
  const webFigId = `${chapterAnchorPrefix(webMetrics)}-bio-127-ordinary-figure`;
  const prtDescId = `${printUnitAnchor(bookKey)}-bio-127-ordinary-0`;
  const prtFigId = `${printUnitAnchor(bookKey)}-bio-127-ordinary-figure`;
  assert.equal(biogenicCarbonOrdinaryId(unit, webMetrics, false, 0), webDescId);
  assert.equal(biogenicCarbonOrdinaryId(unit, webMetrics, false, 'figure'), webFigId);
  assert.equal(biogenicCarbonOrdinaryId(unit, bookKey, true, 0), prtDescId);
  assert.equal(biogenicCarbonOrdinaryId(unit, bookKey, true, 'figure'), prtFigId);

  const mismatched = inspectClimateAssemblySource(
    '---\ntitle: t\ndescription: d\n---\n\n## 响应与指标 [#响应与指标]\n\n<ReaderFigure>\n  <img src="/a.svg" alt="a" width="1" height="1" />\n  <figcaption>c</figcaption>\n</figure>\n',
  );
  assert.equal(mismatched.figureCount, 0);

  const descNode = htmlParser.parse(`<p id="${webDescId}">更新后的简介</p>`).querySelector('p');
  const figNode = htmlParser.parse(`<figure id="${webFigId}"><img src="/book-figures/climate-response-and-integral.svg" /><figcaption>同一响应的剩余比例与时间积分</figcaption></figure>`).querySelector('figure');
  const descSha = flowBoundaryOrdinaryDigest(descNode);
  const figSha = flowBoundaryOrdinaryDigest(figNode);

  const syntheticHistory = {
    previousAddresses: {
      [`${webMetrics}#nd-page`]: {
        route: webMetrics,
        kind: 'chapter',
        title: '气候响应与当量',
        claimIds: ['cl-climate-opening'],
        ordinary: ['a'.repeat(64), figSha],
      },
    },
    currentAddresses: {},
    ordinaryTargets: {
      [`${webMetrics}#${webDescId}`]: { route: webMetrics, sha256: descSha, tag: 'P' },
      [`${webMetrics}#${webFigId}`]: { route: webMetrics, sha256: figSha, tag: 'FIGURE' },
    },
    history: [
      {
        address: `${webMetrics}#nd-page`,
        from: 'b'.repeat(64),
        ordinary: [
          { from: 'a'.repeat(64), to: descSha, address: `${webMetrics}#nd-page`, targetId: webDescId, rationale: '简介更新' },
          { from: figSha, to: figSha, address: `${webMetrics}#nd-page`, targetId: webFigId, rationale: '原响应图保留' },
        ],
        rationale: '保留基线范围',
      },
    ],
  };

  const syntheticUnit = { history: syntheticHistory };
  const controls = biogenicCarbonHistoryControls(syntheticUnit);
  const ctrl = controls.get(`${webMetrics}#nd-page`);
  assert(ctrl);

  const webPrefix = chapterAnchorPrefix(webMetrics);
  const doc = htmlParser.parse(
    `<article id="nd-page" data-reader-route="${webMetrics}">`
    + `<h1 id="main-content">气候响应与当量</h1>`
    + `<p id="${webDescId}">更新后的简介</p>`
    + `<div class="prose flex-1">`
    + `<details class="legacy-citation-context" data-biogenic-carbon-history="nd-page" data-biogenic-carbon-origins="nd-page">`
    + `<summary><time datetime="${biogenicCarbonSource.date}">${biogenicCarbonSource.date}</time> 版「气候响应与当量」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${biogenicCarbonSource.commit}" data-biogenic-carbon-source="">查看该版源文件</a></p>`
    + `<ul>`
    + `<li><a href="#${webDescId}" data-biogenic-carbon-ordinary="">原说明 1 的现行位置</a></li>`
    + `<li><a href="#${webFigId}" data-biogenic-carbon-ordinary="">原说明 2 的现行位置</a></li>`
    + `</ul>`
    + `<ul><li><a href="#${webPrefix}-claim-cl-climate-opening" data-biogenic-carbon-note="">《气候响应与当量》注 1</a></li></ul>`
    + `</details>`
    + `<figure id="${webFigId}"><img src="/book-figures/climate-response-and-integral.svg" /><figcaption>同一响应的剩余比例与时间积分</figcaption></figure>`
    + `</div>`
    + `<section class="chapter-notes"><ol><li id="${webPrefix}-claim-cl-climate-opening" data-reader-claim="cl-climate-opening">注1</li></ol></section>`
    + `</article>`,
  );

  const errors = validateDatedHistoryOutput(new Map([[webMetrics, doc]]), {
    expected: controls,
    source: biogenicCarbonSource,
    attribute: 'biogenic-carbon',
    ordinaryPattern: /-bio-127-ordinary-(?:\d+|figure)$/,
    ordinaryTags: ['P', 'FIGURE'],
    ordinaryTargets: {
      [`${webMetrics}#${webDescId}`]: descSha,
      [`${webMetrics}#${webFigId}`]: figSha,
    },
    label: 'Biogenic carbon',
  });
  assert.deepEqual(errors, []);

  const rolled = biogenicCarbonPreviousSurface(
    `${webMetrics}#nd-page`,
    { claimIds: ['cl-climate-opening', 'cl-bio127-midpoint-endpoint-genealogy'], ordinaryHashes: [descSha, figSha] },
    syntheticUnit,
  );
  assert.deepEqual(rolled.claimIds, ['cl-climate-opening']);
  assert.deepEqual(rolled.ordinaryHashes, ['a'.repeat(64), figSha]);
});

test('B15 biogenic carbon source plan preserves 5c982449 predecessor, 49/41/8 layouts and forbids unreviewed or HTML-injected mutations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectBiogenicCarbon(config), /not independently accepted/);
    assert.equal(selectBiogenicCarbon(config, undefined, true), config.unit);
    assert.throws(() => selectBiogenicCarbon(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectBiogenicCarbon(withEvidence, null, true), /not independently accepted/);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  if (eutro.unit) files.set(`content${eutro.unit.routes[0]}.mdx`, Buffer.from(eutro.unit.previousMdx));
  const input = { ...previousScientificTestRecords({ catalog, readings, literature }, eutro.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareBiogenicCarbonSource(unit, customInput, customActual, customStruct);
  assert.doesNotThrow(() => qualify(config.unit));
  assert.deepEqual(biogenicCarbonRoutes.length, 3);

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
    u1.correction = { claimId: 'cl-climate-conclusion', scope: 'forged' };
    assert.throws(() => qualify(u1), /must not declare an unreviewed prior-claim correction/);
    const u2 = structuredClone(config.unit);
    u2.corrections = [];
    assert.throws(() => qualify(u2), /must not declare an unreviewed prior-claim correction/);
  });
  await t.test('refuses layout reordering and HTML tag injection in description', () => {
    const unit = structuredClone(config.unit);
    const route = biogenicCarbonSources[0];
    const layoutKey = `B15:${route}:reader-source`;
    const base = predecessorReaderSource(route);
    const row = unit.layouts.find(x => x.key === layoutKey);
    const [first, second, ...rest] = row.to.occurrences;
    row.to.occurrences = [second, first, ...rest];
    assert.throws(() => biogenicCarbonLayout(unit, layoutKey, base), /exact occurrence insertions/);

    const uHtml = structuredClone(config.unit);
    const timeRoute = '/docs/book/emission-time-and-assessment';
    const timeKey = `B15:${timeRoute}:reader-source`;
    const timeBase = predecessorReaderSource(timeRoute);
    uHtml.layouts.find(x => x.key === timeKey).to.source.description = '区分固定时间窗<script>alert(1)</script>与共同日历终点。';
    assert.throws(() => biogenicCarbonLayout(uHtml, timeKey, timeBase), /reviewed B15 description/);
  });
  await t.test('enforces append-only prior research history and psg-bio127-/art-bio127- prefixes', () => {
    const unit1 = structuredClone(config.unit);
    unit1.rawRecords.find(r => r.path === 'catalog.sources' && r.id === 'src-kb54-ipcc-ar6-errata-2025-10-07-pdf').from.reading.scope = 'tampered';
    assert.throws(() => qualify(unit1), /changed a previous source or its acquisition scope: src-kb54-ipcc-ar6-errata-2025-10-07-pdf/);

    const unit2 = structuredClone(config.unit);
    unit2.rawRecords.find(r => r.path === 'literature.records' && r.id === 'lit-m05').from.limitations = [];
    assert.throws(() => qualify(unit2), /changed a previous work or its acquisition history: lit-m05/);

    const badReadings = structuredClone(input.readings);
    badReadings.readings.find(r => r.id === 'rd-land111-rivm2016').passages.at(-1).id = 'psg-rogue-id';
    const badInput = { ...input, readings: badReadings };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const unit3 = structuredClone(config.unit);
    for (const ch of unit3.changes) {
      if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    }
    assert.throws(() => qualify(unit3, badInput, badActual, badStruct), /changed a previous reading, carrier or passage prefix: rd-land111-rivm2016/);
  });
  await t.test('rejects protected B15 MDX edits and consumer review omissions', () => {
    const mdxPath = 'content/monograph/climate-equivalence.mdx';
    const uMdx = structuredClone(config.unit);
    uMdx.previousMdx[mdxPath] = uMdx.previousMdx[mdxPath] + '\n';
    assert.throws(() => qualify(uMdx), /independently preserved predecessor B15 MDX bytes/);

    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const uTrail = structuredClone(config.unit);
    uTrail.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(uTrail, badInput, badActual, badStruct), /changed protected B15 MDX text or its scoped additions/);

    const uConsumers = structuredClone(config.unit);
    uConsumers.consumers = uConsumers.consumers.slice(1);
    assert.throws(() => qualify(uConsumers), /exact cross-generation consumer review/);
  });
});

test('Biogenic carbon receipt verifier fails closed when capture or capture pin is absent', () => {
  if (biogenicCarbonCapturePin !== null) return;
  if (!config.unit) return;
  const previous = previousScientificTestRecords({ catalog, readings, literature }, eutro.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const unit = structuredClone(config.unit);
  unit.outputs = [{ path: '/docs/book/climate-response-and-metrics', route: '/docs/book/climate-response-and-metrics', sha256: '1'.repeat(64), rationale: 'r' }];
  unit.publicArtifacts = [{ path: 'claims/index.html', sha256: '2'.repeat(64), rationale: 'r' }];
  unit.outputCapture = {
    sourceCommit: '5c98244958fdb290f506429b98c600fe7f50e361',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: '5c98244958fdb290f506429b98c600fe7f50e361', manifestSha256: '3'.repeat(64) },
    normalization: { articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })), publicHtml: [{ path: 'claims/index.html', sha256: '2'.repeat(64) }] },
    files: [
      { path: 'docs/book/climate-response-and-metrics/index.html', sha256: '5'.repeat(64), bytes: 100 },
      { path: 'claims/index.html', sha256: '2'.repeat(64), bytes: 200 },
    ],
  };
  assert.equal(verifyBiogenicCarbonReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, biogenicCarbonSource.date), expected), false);
});

test('Biogenic carbon receipts bind actual output capture independently', { skip: !biogenicCarbonCapturePin && config.status !== 'reviewed' }, () => {
  const previous = previousScientificTestRecords({ catalog, readings, literature }, eutro.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyBiogenicCarbonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, biogenicCarbonSource.date), expected);
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
