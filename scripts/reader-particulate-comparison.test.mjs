import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
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
import config from '../config/reader-particulate-comparison.json' with { type: 'json' };
import capture from '../config/reader-particulate-comparison-capture.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { readCitationSurface, readerInternalIds, validateReaderText } from './reader-surface.mjs';
import { publicCatalog } from './knowledge.mjs';
import {
  displayedDecimal,
  exactDecimal,
  mantissaExp,
  mulScaled,
  ratioScaled,
  validateParticulateComparisonFactors,
} from './reader-particulate-comparison-factors.mjs';
import {
  particulateComparisonCapturePin,
  particulateComparisonChapter,
  particulateComparisonHistoryControls,
  particulateComparisonLayout,
  particulateComparisonOrdinaryId,
  particulateComparisonPreviousSurface,
  particulateComparisonSource,
  prepareParticulateComparisonSource,
  qualifyParticulateComparisonHistory,
  selectParticulateComparison,
  verifyParticulateComparisonReceipts,
} from './reader-particulate-comparison.mjs';

const evPrefix = 'ev-particulate131-';

test('Particulate comparison BigInt fixed-point helpers enforce canonical decimals, zero-division guard and half-up rounding', () => {
  assert.throws(() => exactDecimal('1e-4'), /canonical decimal literal/);
  assert.throws(() => exactDecimal('00'), /canonical decimal literal/);
  assert.throws(() => exactDecimal('-0.0'), /canonical decimal literal/);
  assert.throws(() => exactDecimal('0.' + '1'.repeat(41)), /exceeds 40 places/);
  assert.throws(() => ratioScaled(exactDecimal('1'), 0n), /zero denominator/);

  assert.equal(displayedDecimal(ratioScaled(exactDecimal('2'), exactDecimal('3')), 2), '0.67');
  assert.equal(displayedDecimal(ratioScaled(exactDecimal('-2'), exactDecimal('3')), 2), '-0.67');
  assert.equal(displayedDecimal(mulScaled(exactDecimal('13'), exactDecimal('365')), 0), '4745');
  assert.equal(mantissaExp(exactDecimal('0.00059536682112547822'), -4, 2), '5.95');
});

test('Particulate comparison factors guard all 84 numericFacts, prose numeric bindings, support links and reader-visible source prose', () => {
  assert.doesNotThrow(() => validateParticulateComparisonFactors(catalog, readings));
  assert.doesNotThrow(() => validateParticulateComparisonFactors(catalog, readings, { skipRowDigests: true }));

  // Reader-surface check on new sources via validateReaderText + raw SHA-256 guard
  const knownIds = readerInternalIds(publicCatalog(catalog), literature, readings);
  for (const sid of ['src-particulate131-ef31-selected-members', 'src-particulate131-cohen2017']) {
    const src = catalog.sources.find(row => row.id === sid);
    for (const field of ['title', 'version', 'rights', 'preservation']) {
      assert.deepEqual(validateReaderText(src[field], { label: `${sid}.${field}`, knownIds }), []);
    }
  }
  const rawHashCat = structuredClone(catalog);
  rawHashCat.sources.find(s => s.id === 'src-particulate131-cohen2017').preservation += ` ${'a'.repeat(64)}`;
  assert.throws(() => validateParticulateComparisonFactors(rawHashCat, readings, { skipRowDigests: true }), /forbidden reader-surface token/);

  // Exhaustive single-fact mutation check across all 84 numericFacts even under skipRowDigests: true
  const evs = catalog.evidence.filter(row => row.id.startsWith(evPrefix));
  let checkedFacts = 0;
  for (const ev of evs) {
    for (let i = 0; i < (ev.numericFacts?.length ?? 0); i++) {
      checkedFacts++;
      const clone = structuredClone(catalog);
      const target = clone.evidence.find(row => row.id === ev.id).numericFacts[i];
      target.value = target.value === '0' ? '1' : `${target.value}1`;
      assert.throws(
        () => validateParticulateComparisonFactors(clone, readings, { skipRowDigests: true }),
        /exact numeric literal drifted/,
      );
    }
  }
  assert.equal(checkedFacts, 84);

  // Reject singular numericFact injection even under skipRowDigests: true
  const singularCat = structuredClone(catalog);
  singularCat.evidence.find(row => row.id === 'ev-particulate131-ilcd2011-pm').numericFact = {
    id: 'rogue', value: '1', unit: 'count', quantity: 'q', subject: 's', basis: 'b',
  };
  assert.throws(() => validateParticulateComparisonFactors(singularCat, readings, { skipRowDigests: true }), /forbids singular numericFact injection/);

  // Prose numeric mutation checks across all 8 cl-particulate131-* claims
  const proseMutations = [
    ['cl-particulate131-indicator-cutpoints', '8.96%', '9.96%', /displayed numeric bindings in cl-particulate131-indicator-cutpoints/],
    ['cl-particulate131-size-and-subcompartment', '146.36倍', '145.36倍', /displayed numeric bindings in cl-particulate131-size-and-subcompartment/],
    ['cl-particulate131-cohen-gbd2015-scope', '424.11万例', '425.11万例', /displayed numeric bindings in cl-particulate131-cohen-gbd2015-scope/],
    ['cl-particulate131-cohen-empirical-limits', '2型糖尿病', '2型糖尿病_raw', /leaked raw formula syntax/],
    ['cl-particulate131-precursor-perspectives', '0.29', '0.39', /displayed numeric bindings in cl-particulate131-precursor-perspectives/],
    ['cl-particulate131-ef-ammonia-inversion', '10.61倍', '10.62倍', /displayed numeric bindings in cl-particulate131-ef-ammonia-inversion/],
    ['cl-particulate131-regional-endpoint-reversal', '11.7倍', '11.6倍', /displayed numeric bindings in cl-particulate131-regional-endpoint-reversal/],
    ['cl-particulate131-package-discrepancies', '599.69例', '599.70例', /displayed numeric bindings in cl-particulate131-package-discrepancies/],
  ];
  for (const [cid, needle, repl, regex] of proseMutations) {
    const c = structuredClone(catalog);
    const claim = c.claims.find(row => row.id === cid);
    claim.text = claim.text.replace(needle, repl);
    assert.throws(() => validateParticulateComparisonFactors(c, readings, { skipRowDigests: true }), regex);
  }

  // Support link, conceptIds & premiseIds tamper checks
  const badConcept = structuredClone(catalog);
  badConcept.claims.find(row => row.id === 'cl-particulate131-indicator-cutpoints').conceptIds = [];
  assert.throws(() => validateParticulateComparisonFactors(badConcept, readings), /bounded conceptIds\/premiseIds/);

  const badPremise = structuredClone(catalog);
  badPremise.claims.find(row => row.id === 'cl-particulate131-size-and-subcompartment').premiseIds = [];
  assert.throws(() => validateParticulateComparisonFactors(badPremise, readings), /bounded conceptIds\/premiseIds/);

  const badLink = structuredClone(catalog);
  badLink.claims.find(row => row.id === 'cl-particulate131-package-discrepancies').evidenceLinks[0].relation = 'contradicts';
  assert.throws(() => validateParticulateComparisonFactors(badLink, readings), /lost the explicit supports link/);

  // Carrier & 1-to-1 passage tamper checks
  const badReadings = structuredClone(readings);
  badReadings.readings.find(r => r.id === 'rd-particulate131-cohen2017').artifacts[0].sha256 = '0'.repeat(64);
  assert.throws(() => validateParticulateComparisonFactors(catalog, badReadings), /changed the independently observed carrier/);

  const badEf = structuredClone(readings);
  badEf.readings.find(r => r.id === 'rd-flow-pilot-ef31').artifacts.find(a => a.id === 'art-particulate131-ef-flow-pm25-10-nonurban-ground').sha256 = 'f'.repeat(64);
  assert.throws(() => validateParticulateComparisonFactors(catalog, badEf), /changed a verified EF 3\.1 member/);
});

test('B17 particulate comparison ordinary IDs, 4-node DOM history qualification and surface rollback preserve 37 prior claims', () => {
  const path = particulateComparisonChapter;
  const webPrefix = chapterAnchorPrefix(path);
  const prtPrefix = printUnitAnchor(path);
  assert.equal(particulateComparisonOrdinaryId(null, path, false, 0), undefined);
  assert.equal(particulateComparisonOrdinaryId(config.unit, '/docs/book/other', false, 0), undefined);
  assert.equal(particulateComparisonOrdinaryId(config.unit, path, false, 4), undefined);
  assert.equal(particulateComparisonOrdinaryId(config.unit, path, false, 0), `${webPrefix}-particulate-131-ordinary-0`);
  assert.equal(particulateComparisonOrdinaryId(config.unit, path, false, 3), `${webPrefix}-particulate-131-ordinary-3`);
  assert.equal(particulateComparisonOrdinaryId(config.unit, path, true, 0), `${prtPrefix}-particulate-131-ordinary-0`);

  const controls = particulateComparisonHistoryControls(config.unit);
  assert.equal(controls.size, 10);
  const pageKey = `${path}#nd-page`;
  assert(controls.has(pageKey));

  const pNotice = `<details data-particulate-comparison-history="nd-page" data-particulate-comparison-origins="nd-page"><summary><time datetime="${particulateComparisonSource.date}">${particulateComparisonSource.date}</time> 版「颗粒物排放与健康损害」的引用范围</summary><p><a data-particulate-comparison-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${particulateComparisonSource.commit}">查看该版源文件</a></p></details>`;
  const surfaceDoc = htmlParser.parse(
    `<article id="nd-page" data-reader-route="${path}" data-reader-title="颗粒物排放与健康损害"><h1 id="main-content" data-reader-heading-key="@unit">颗粒物排放与健康损害</h1><p>导语段落。</p>${pNotice}</article>`,
  );
  const parsedSurface = readCitationSurface(surfaceDoc, path);
  assert.equal(parsedSurface.ids.get('nd-page').ordinaryHashes.length, 1);

  const pageExpected = new Map([[pageKey, {
    addresses: [pageKey],
    row: { address: pageKey, previous: { kind: 'chapter', route: path, title: '颗粒物排放与健康损害', claimIds: [] }, ordinary: [] },
  }]]);
  const okDoc = htmlParser.parse(`<article id="nd-page"><div>${pNotice}</div></article>`);
  assert.deepEqual(validateDatedHistoryOutput(new Map([[path, okDoc]]), {
    expected: pageExpected,
    source: particulateComparisonSource,
    attribute: 'particulate-comparison',
    ordinaryPattern: /-particulate-131-ordinary-[0-3]$/,
    ordinaryTargets: {},
    label: 'Particulate comparison',
  }), []);

  // Full closed-loop test of qualifyParticulateComparisonHistory on synthetic 4-ordinary-paragraph web + print DOM
  if (Object.keys(config.unit?.history?.ordinaryTargets ?? {}).length === 8) {
    const appRoute = '/docs/appendices/particulate-factor-calculations';
    const appPrintPrefix = printUnitAnchor(appRoute);
    const makeOrdTexts = isPrint => {
      const link = (sec, label) => `<a href="${isPrint ? `#${appPrintPrefix}-${sec}` : `${appRoute}#${encodeURIComponent(sec)}`}">${label}</a>`;
      return [
        '从排放量算到人群吸入量、死亡或发病计数与潜在健康损害，辨明各体系的指标截点、前体开关、流行病学外推和发行包边界怎样影响比较。',
        `按排放源高度加权的计算见${link('排放原型与加权', '排放原型与加权')}。区室模型及活动持续时间的说明见${link('区室与活动时间', '区室与活动时间')}。`,
        `生态参照、大气模型对照和工作簿更正的补充见${link('参照与模型核验', '参照与模型核验')}。`,
        `四个发布因子的数值换算及其发行范围见${link('发行范围与因子表', '发行范围与因子表')}。`,
      ];
    };
    const buildHistoryNotices = (isPrint) => {
      const targetPath = isPrint ? '/print' : path;
      const pfx = isPrint ? prtPrefix : webPrefix;
      const html = [];
      for (const [groupKey, group] of controls.entries()) {
        if (!groupKey.startsWith(`${targetPath}#`)) continue;
        const targetId = groupKey.slice(targetPath.length + 1);
        const origins = group.addresses.map(a => a.slice(targetPath.length + 1)).join(' ');
        const ordList = group.row.ordinary.length
          ? `<ul>${group.row.ordinary.map((o, idx) => `<li><a href="#${encodeURIComponent(o.targetId)}" data-particulate-comparison-ordinary="">原说明 ${idx + 1} 的现行位置</a></li>`).join('')}</ul>`
          : '';
        const noteList = group.row.previous.claimIds?.length
          ? `<ul>${group.row.previous.claimIds.map((id, i) => `<li><a href="#${pfx}-claim-${id}" data-particulate-comparison-note="">《颗粒物排放与健康损害》注 ${i + 1}</a></li>`).join('')}</ul>`
          : '';
        html.push(`<details data-particulate-comparison-history="${targetId}" data-particulate-comparison-origins="${origins}"><summary><time datetime="${particulateComparisonSource.date}">${particulateComparisonSource.date}</time> 版「颗粒物排放与健康损害」的引用范围</summary><p><a data-particulate-comparison-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${particulateComparisonSource.commit}">查看该版源文件</a></p>${ordList}${noteList}</details>`);
      }
      return html.join('');
    };
    const makeDoc = (isPrint, mutateIdx = -1) => {
      const pfx = isPrint ? prtPrefix : webPrefix;
      const ordTexts = makeOrdTexts(isPrint);
      const ps = ordTexts.map((t, i) => `<p id="${pfx}-particulate-131-ordinary-${i}">${i === mutateIdx ? t + '篡改' : t}</p>`).join('');
      const notes = config.unit.occurrences.map(id => `<li id="${pfx}-claim-${id}" data-reader-claim="${id}">Note</li>`).join('');
      return htmlParser.parse(`<article id="${isPrint ? prtPrefix : 'nd-page'}" data-reader-route="${path}"><h1 id="main-content">颗粒物排放与健康损害</h1>${ps}${buildHistoryNotices(isPrint)}<section id="${pfx}-annotations"><ol>${notes}</ol></section></article>`);
    };
    const cleanDocs = new Map([[path, makeDoc(false)], ['/print', makeDoc(true)]]);
    const cleanRes = qualifyParticulateComparisonHistory(cleanDocs, config.unit, structuredClone(config.unit.history.currentAddresses));
    assert.deepEqual(cleanRes.prior, config.unit.history.previousAddresses);
    assert(!cleanRes.errors.includes('Particulate comparison actual versioned description differs'));

    const mutatedLeadDocs = new Map([[path, makeDoc(false, 0)], ['/print', makeDoc(true)]]);
    assert.throws(() => qualifyParticulateComparisonHistory(mutatedLeadDocs, config.unit, structuredClone(config.unit.history.currentAddresses)), /exact ordinary explanation destination/);

    const mutatedNavDocs = new Map([[path, makeDoc(false, 3)], ['/print', makeDoc(true)]]);
    assert.throws(() => qualifyParticulateComparisonHistory(mutatedNavDocs, config.unit, structuredClone(config.unit.history.currentAddresses)), /exact ordinary explanation destination/);
  }

  const rolled = particulateComparisonPreviousSurface(
    pageKey,
    { claimIds: config.unit.history.currentAddresses[pageKey].claimIds, ordinaryHashes: config.unit.history.currentAddresses[pageKey].ordinary },
    config.unit,
  );
  assert.equal(rolled.claimIds.length, 37);
  assert.equal(rolled.claimIds.some(id => id.startsWith('cl-particulate131-')), false);

  assert.deepEqual(qualifyParticulateComparisonHistory(new Map(), null, { k: 1 }), { prior: { k: 1 }, errors: [] });
});

test('B17 particulate comparison source plan preserves c0ffd968 predecessor, 45-claim layout and forbids unreviewed mutations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectParticulateComparison(config), /not independently accepted/);
    assert.equal(selectParticulateComparison(config, undefined, true), config.unit);
    assert.throws(() => selectParticulateComparison(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectParticulateComparison(withEvidence, null, true), /not independently accepted/);
  }
  const nullLayoutCfg = structuredClone(config);
  nullLayoutCfg.unit.layouts[0] = null;
  assert.throws(() => selectParticulateComparison(nullLayoutCfg, null, true), /bounded B17 plan/);
  assert.equal(selectParticulateComparison({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
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
  const input = { ...previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareParticulateComparisonSource(unit, customInput, customActual, customStruct);
  const res = qualify(config.unit);
  assert.equal(config.unit.occurrences.length, 45);
  assert(res.affectedClaimIds.length >= 8);

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
    u1.correction = { claimId: 'cl-pm-conclusion', scope: 'forged' };
    assert.throws(() => qualify(u1), /must not declare an unreviewed prior-claim correction/);
    const u2 = structuredClone(config.unit);
    u2.corrections = [];
    assert.throws(() => qualify(u2), /must not declare an unreviewed prior-claim correction/);
  });
  await t.test('enforces append-only prior research history and psg-particulate131-/art-particulate131- prefixes', () => {
    const unit1 = structuredClone(config.unit);
    unit1.rawRecords.find(r => r.path === 'catalog.sources' && r.id === 'src-kb46-lcimpact2020').from.reading.scope = 'tampered';
    assert.throws(() => qualify(unit1), /changed a previous source or its acquisition scope: src-kb46-lcimpact2020/);

    const unit2 = structuredClone(config.unit);
    unit2.rawRecords.find(r => r.path === 'literature.records' && r.id === 'work-kb46-cohen2017').from.limitations = [];
    assert.throws(() => qualify(unit2), /changed a previous bibliography record: work-kb46-cohen2017/);

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
  await t.test('rejects protected B17 MDX edits, source/concept layout tampering, HTML injection and consumer review omissions', () => {
    const mdxPath = 'content/docs/book/particulate-emissions-and-health.mdx';
    const uMdx = structuredClone(config.unit);
    uMdx.previousMdx = uMdx.previousMdx + '\n';
    assert.throws(() => qualify(uMdx), /independently preserved predecessor B17 MDX bytes/);

    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const uTrail = structuredClone(config.unit);
    uTrail.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(uTrail, badInput, badActual, badStruct), /changed protected B17 text or its scoped additions/);

    const uLayout = structuredClone(config.unit);
    uLayout.layouts.find(l => l.key === 'B17:reverse-premise-consumers').to = [];
    assert.throws(() => particulateComparisonLayout(uLayout, 'B17:reverse-premise-consumers', []), /exact B17 direct-premise consumer review/);

    const uConcept = structuredClone(config.unit);
    uConcept.layouts.find(l => l.key === 'B17:reverse-concept-consumers').to = [];
    assert.throws(() => particulateComparisonLayout(uConcept, 'B17:reverse-concept-consumers', []), /exact B17 shared-concept consumer review/);

    const srcKey = 'B17:/docs/book/particulate-emissions-and-health:source';
    const uSwap = structuredClone(config.unit);
    const srcRow = uSwap.layouts.find(l => l.key === srcKey);
    const swappedIds = [...srcRow.to.blocks[1].ids];
    [swappedIds[11], swappedIds[12]] = [swappedIds[12], swappedIds[11]];
    srcRow.to.blocks[1].ids = swappedIds;
    assert.throws(() => qualify(uSwap), /exact 45-claim block order/);

    const uHtmlDesc = structuredClone(config.unit);
    uHtmlDesc.layouts.find(l => l.key === srcKey).to.description = '恶意<script>alert(1)</script>';
    assert.throws(() => qualify(uHtmlDesc), /exact 45-claim block order/);

    const uConsumers = structuredClone(config.unit);
    uConsumers.consumers = uConsumers.consumers.slice(1);
    assert.throws(() => qualify(uConsumers), /exact cross-generation consumer review/);
  });
});

test('Particulate comparison receipt verifier fails closed when capture or capture pin is absent', () => {
  if (particulateComparisonCapturePin !== null) return;
  if (!config.unit) return;
  const prev131 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit);
  const expected = readerPublicDownloads(prev131.catalog, prev131.literature, prev131.readings);
  const unit = structuredClone(config.unit);
  unit.outputs = [{ path: particulateComparisonChapter, route: particulateComparisonChapter, sha256: '1'.repeat(64), rationale: 'r' }];
  unit.publicArtifacts = [{ path: 'claims/index.html', sha256: '2'.repeat(64), rationale: 'r' }];
  unit.outputCapture = {
    sourceCommit: 'c0ffd968e60754679f815f6c36d393794e25f858',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: 'c0ffd968e60754679f815f6c36d393794e25f858', manifestSha256: '3'.repeat(64) },
    normalization: { articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })), publicHtml: [{ path: 'claims/index.html', sha256: '2'.repeat(64) }] },
    files: [
      { path: 'docs/book/particulate-emissions-and-health/index.html', sha256: '5'.repeat(64), bytes: 100 },
      { path: 'claims/index.html', sha256: '2'.repeat(64), bytes: 200 },
    ],
  };
  assert.equal(verifyParticulateComparisonReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), expected), false);
});

test('Particulate comparison receipts bind actual output capture independently', { skip: !particulateComparisonCapturePin && config.status !== 'reviewed' }, () => {
  const prev131 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit);
  const expected = readerPublicDownloads(prev131.catalog, prev131.literature, prev131.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyParticulateComparisonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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

test('PM selection coverage retains all 54 cl-pm-* claims and X04 unchanged while rejecting unauthorized LC-IMPACT work or reading edits', { skip: !config.unit }, async () => {
  const { validatePmSelectionCoverage } = await import('./reader-pm-selection.mjs');
  const { default: accepted } = await import('../config/pm-selection-accepted.json', { with: { type: 'json' } });
  const { default: edition } = await import('../config/book-edition.json', { with: { type: 'json' } });
  const root = fileURLToPath(new URL('../', import.meta.url));
  const files = await readReadableBookFiles(root, baseline.fixedFiles);
  const sources = new Map([...files].filter(([path]) => /^content\/.+\.mdx?$/.test(path))
    .map(([path, bytes]) => [path.slice(7).replace(/\.mdx?$/, '').replace(/\/index$/, ''), bytes.toString()]));
  assert.deepEqual(validatePmSelectionCoverage(edition, sources, catalog, accepted, undefined, { readings, literature }), []);

  const tamperedLcWork = structuredClone(literature);
  tamperedLcWork.records.find(row => row.id === 'work-kb46-lcimpact2020').limitations.push('Unreviewed addition.');
  assert(validatePmSelectionCoverage(edition, sources, catalog, accepted, undefined, { readings, literature: tamperedLcWork })
    .includes('PM selection reviewed research literature differs'));

  const tamperedLcReading = structuredClone(readings);
  tamperedLcReading.readings.find(row => row.id === 'rd-kb46-lcimpact2020').unread.push('Unreviewed unread note.');
  assert(validatePmSelectionCoverage(edition, sources, catalog, accepted, undefined, { readings: tamperedLcReading, literature })
    .includes('PM selection reviewed research readings differs'));
});
