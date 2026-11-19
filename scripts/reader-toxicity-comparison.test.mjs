import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-toxicity-comparison.json' with { type: 'json' };
import capture from '../config/reader-toxicity-comparison-capture.json' with { type: 'json' };
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
import { flowBoundaryOrdinaryDigest, validateDatedHistoryOutput } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { validateToxicityComparisonFactors } from './reader-toxicity-comparison-factors.mjs';
import {
  prepareToxicityComparisonSource,
  qualifyToxicityComparisonHistory,
  selectToxicityComparison,
  toxicityComparisonCapturePin,
  toxicityComparisonChapter,
  toxicityComparisonHistoryControls,
  toxicityComparisonLayout,
  toxicityComparisonOrdinaryId,
  toxicityComparisonPreviousSurface,
  toxicityComparisonSource,
  verifyToxicityComparisonReceipts,
} from './reader-toxicity-comparison.mjs';

const prefix = 'ev-tox123-';

test('Toxicity comparison factors bind 7 carriers, 34 XML members, 132 numeric facts, reversals and support links', () => {
  assert.doesNotThrow(() => validateToxicityComparisonFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validateToxicityComparisonFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-tox123-ef31-addendum').artifacts[0].sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-tox123-ef31-selected-members').artifact.sha256 = '2'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-tox123-ef31-addendum').reading.readingId = 'rd-forged';
  }, /changed the independently observed carrier/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-tox123-ef-converter-ecotox').sha256 = '1'.repeat(64);
  }, /changed a verified EF 3\.1 XML member/);
  probe(c => {
    c.evidence = c.evidence.filter(x => x.id !== prefix + 'recipe2017-tox');
  }, /evidence count differs from its pinned row inventory/);
  probe((_c, _r, evidence) => {
    evidence('ef31-ecotox-xml').numericFacts.find(f => f.id === 'ef31-ecotox-lactic-lciamethods').value = '0';
  }, row);
  probe((_c, _r, _ev, passage) => {
    passage('rivm-ch9-table93').pdfIndices = [70];
  }, row);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-midpoint-families');
    claim.text = claim.text.replace('每发病例 11.5', '每发病例 11.4');
  }, /changed the displayed midpoint-family or endpoint-factor prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-hc20-and-metals');
    claim.text = claim.text.replace('714 倍', '715 倍');
  }, /changed the displayed HC20 metal reversal calculations/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-hc20-and-metals');
    claim.text = claim.text.replace('+195%', '+196%');
  }, /changed the displayed HC20 metal reversal calculations/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-perspective-switches');
    claim.text = claim.text.replace('844 种', '845 种');
  }, /changed the displayed ReCiPe 2016 five-switch prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-nickel-dcb-reversal');
    claim.text = claim.text.replace('75.95 倍', '76.00 倍');
  }, /changed the displayed Nickel vs 1,4-DCB reversal prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-nickel-dcb-reversal');
    claim.caveats[0] = claim.caveats[0].replace('7.22', '7.25');
  }, /changed the displayed Nickel vs 1,4-DCB reversal prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-speciation-and-proxies');
    claim.text = claim.text.replace('增幅 33%', '增幅 34%');
  }, /changed the displayed speciation, pesticide or unspecified-water prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-normative-zeros');
    claim.text = claim.text.replace('4438%', '4439%');
  }, /changed the displayed normative-zero or avoided-credit prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-package-discrepancies');
    claim.text = claim.text.replace('2301282 字节', '2301280 字节');
  }, /changed the displayed package discrepancy or report errata values/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-cross-system-synthesis');
    claim.text = claim.text.replace('7 条食物链暴露途径', '6 条食物链暴露途径');
  }, /changed the displayed five-step diagnostic synthesis prose/);
  probe(c => {
    c.claims.push({ ...structuredClone(c.claims.find(x => x.id === 'cl-tox123-cross-system-synthesis')), id: 'cl-tox123-extra' });
  }, /claim count differs from its pinned claim inventory/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-tox123-speciation-and-proxies');
    claim.evidenceIds = claim.evidenceIds.slice(1);
  }, /changed the evidence link roster/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-tox123-speciation-and-proxies').evidenceLinks
      .find(link => link.evidenceId === prefix + 'jrc109369-tox').relation = 'supports';
  }, /lost the explicit context link.*jrc109369-tox/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-tox123-speciation-and-proxies').evidenceLinks[0].rationale = '   ';
  }, /lost the explicit context link.*jrc109369-tox/);
});

test('B19 dated history coexists with real #88 web/print legacy scopes, rejects ordinary-0 tamper, and qualifies 36 addresses', { skip: !config.unit }, () => {
  const path = toxicityComparisonChapter;
  const webPrefix = chapterAnchorPrefix(path);
  const prtPrefix = printUnitAnchor(path);
  const webOrdId = toxicityComparisonOrdinaryId(config.unit, path, false, 0);
  const prtOrdId = toxicityComparisonOrdinaryId(config.unit, path, true, 0);
  assert.equal(webOrdId, `${webPrefix}-tox-123-ordinary-0`);
  assert.equal(prtOrdId, `${prtPrefix}-tox-123-ordinary-0`);
  assert.equal(toxicityComparisonOrdinaryId(config.unit, path, false, 1), undefined);
  assert.equal(toxicityComparisonOrdinaryId(null, path, false, 0), undefined);

  const controls = toxicityComparisonHistoryControls(config.unit);
  const webPageCtrl = controls.get(`${path}#nd-page`);
  const webAnnCtrl = controls.get(`${path}#${webPrefix}-annotations`);
  const prtUnitCtrl = controls.get(`/print#${prtPrefix}`);
  const prtAnnCtrl = controls.get(`/print#${prtPrefix}-annotations`);
  assert(webPageCtrl && webAnnCtrl && prtUnitCtrl && prtAnnCtrl);

  const descText = config.unit.layouts.find(x => x.key === 'B19:reader-source').to.description;
  const ordSha = flowBoundaryOrdinaryDigest(htmlParser.parse(`<p id="${webOrdId}">${descText}</p>`).firstChild);

  const webNotes = webPageCtrl.row.previous.claimIds
    .map(id => `<li id="${webPrefix}-claim-${id}" data-reader-claim="${id}">Note</li>`).join('');
  const prtNotes = prtUnitCtrl.row.previous.claimIds
    .map(id => `<li id="${prtPrefix}-claim-${id}" data-reader-claim="${id}">Note</li>`).join('');

  const buildWebDoc = ({ ordText = descText, ordAttrs = '', detailsAttrs = '', between = '' } = {}) => htmlParser.parse(
    `<article id="nd-page" data-reader-route="${path}">`
    + `<h1 id="main-content">毒性路径</h1>`
    + `<p id="${webOrdId}"${ordAttrs}>${ordText}</p>`
    + between
    + `<details class="legacy-citation-context" data-toxicity-comparison-history="nd-page" data-toxicity-comparison-origins="nd-page main-content"${detailsAttrs}>`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「毒性路径」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${toxicityComparisonSource.commit}" data-toxicity-comparison-source="">查看该版源文件</a></p>`
    + `<ul><li><a href="#${encodeURIComponent(webOrdId)}" data-toxicity-comparison-ordinary="">原说明 1 的现行位置</a></li></ul>`
    + `<ul>${webPageCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${webPrefix}-claim-${id}" data-toxicity-comparison-note="">《毒性路径》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<section class="chapter-notes" aria-labelledby="${webPrefix}-annotations">`
    + `<h2 id="${webPrefix}-annotations">注释</h2>`
    + `<div data-legacy-scope="${webPrefix}-annotations"><p>Retained #88 annotations scope</p></div>`
    + `<details class="legacy-citation-context" data-toxicity-comparison-history="${webPrefix}-annotations" data-toxicity-comparison-origins="${webPrefix}-annotations">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「毒性路径」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${toxicityComparisonSource.commit}" data-toxicity-comparison-source="">查看该版源文件</a></p>`
    + `<ul>${webAnnCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${webPrefix}-claim-${id}" data-toxicity-comparison-note="">《毒性路径》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<ol>${webNotes}</ol></section></article>`,
  );

  const prtReadId = prtUnitCtrl.addresses[1].slice('/print#'.length);
  const buildPrintDoc = () => htmlParser.parse(
    `<article id="${prtPrefix}" data-reader-route="${path}">`
    + `<h3 id="${prtReadId}">毒性路径</h3>`
    + `<p id="${prtOrdId}">${descText}</p>`
    + `<div data-legacy-scope="${prtPrefix}"><p>Retained #88 print unit scope</p></div>`
    + `<details class="legacy-citation-context" data-toxicity-comparison-history="${prtPrefix}" data-toxicity-comparison-origins="${prtPrefix} ${prtReadId}">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「毒性路径」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${toxicityComparisonSource.commit}" data-toxicity-comparison-source="">查看该版源文件</a></p>`
    + `<ul><li><a href="#${encodeURIComponent(prtOrdId)}" data-toxicity-comparison-ordinary="">原说明 1 的现行位置</a></li></ul>`
    + `<ul>${prtUnitCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${prtPrefix}-claim-${id}" data-toxicity-comparison-note="">《毒性路径》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<section class="chapter-notes" aria-labelledby="${prtPrefix}-annotations">`
    + `<h4 id="${prtPrefix}-annotations">注释</h4>`
    + `<div data-legacy-scope="${prtPrefix}-annotations"><p>Retained #88 print annotations scope</p></div>`
    + `<details class="legacy-citation-context" data-toxicity-comparison-history="${prtPrefix}-annotations" data-toxicity-comparison-origins="${prtPrefix}-annotations">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「毒性路径」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${toxicityComparisonSource.commit}" data-toxicity-comparison-source="">查看该版源文件</a></p>`
    + `<ul>${prtAnnCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${prtPrefix}-claim-${id}" data-toxicity-comparison-note="">《毒性路径》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<ol>${prtNotes}</ol></section></article>`,
  );

  const subsetExpected = new Map([
    [`${path}#nd-page`, webPageCtrl],
    [`${path}#${webPrefix}-annotations`, webAnnCtrl],
    [`/print#${prtPrefix}`, prtUnitCtrl],
    [`/print#${prtPrefix}-annotations`, prtAnnCtrl],
  ]);
  const ordinaryTargets = {
    [`${path}#${webOrdId}`]: ordSha,
    [`/print#${prtOrdId}`]: ordSha,
  };
  const checkSubset = webOpts => validateDatedHistoryOutput(
    new Map([[path, buildWebDoc(webOpts)], ['/print', buildPrintDoc()]]),
    {
      expected: subsetExpected,
      source: toxicityComparisonSource,
      attribute: 'toxicity-comparison',
      ordinaryPattern: /-tox-123-ordinary-0$/,
      ordinaryTargets,
      label: 'Toxicity comparison',
    },
  );

  assert.deepEqual(checkSubset(), []);
  assert(checkSubset({ between: '<p>Detached</p>' }).length > 0);
  assert(checkSubset({ ordText: descText + '（篡改）' }).length > 0);
  assert(checkSubset({ ordAttrs: ' hidden' }).length > 0);
  assert(checkSubset({ detailsAttrs: ' style="display:none"' }).length > 0);

  // Unit-test toxicityComparisonPreviousSurface & qualifyToxicityComparisonHistory
  const prevPage = config.unit.history.previousAddresses[`${path}#nd-page`];
  const rolledSurface = toxicityComparisonPreviousSurface(
    `${path}#nd-page`,
    { route: path, kind: 'page', claimIds: ['cl-new'], ordinaryHashes: ['new-sha'] },
    config.unit,
  );
  assert.deepEqual(rolledSurface.claimIds, prevPage.claimIds);
  assert.deepEqual(rolledSurface.ordinaryHashes, prevPage.ordinary);
  const untouched = { route: '/docs/book/other', kind: 'page', claimIds: ['cl-x'], ordinaryHashes: [] };
  assert.equal(toxicityComparisonPreviousSurface('/docs/book/other#nd-page', untouched, config.unit), untouched);

  const syntheticUnit = structuredClone(config.unit);
  const syntheticActual = Object.fromEntries(
    Object.entries(syntheticUnit.history.previousAddresses).map(([addr, old]) => {
      if (old.kind === 'note') return [addr, old];
      return [addr, { ...old, claimIds: [...old.claimIds, 'cl-tox123-midpoint-families'], ordinary: old.ordinary.length ? [ordSha] : [] }];
    }),
  );
  syntheticUnit.history.currentAddresses = structuredClone(syntheticActual);
  const qualDocs = new Map([[path, buildWebDoc()], ['/print', buildPrintDoc()]]);
  const qual = qualifyToxicityComparisonHistory(qualDocs, syntheticUnit, syntheticActual);
  assert.deepEqual(qual.prior, syntheticUnit.history.previousAddresses);
  assert(!qual.errors.includes('Toxicity comparison actual versioned description differs'));

  const tamperedUnit = structuredClone(syntheticUnit);
  tamperedUnit.history.ordinaryTargets[`${path}#${webOrdId}`].sha256 = 'f'.repeat(64);
  const badQual = qualifyToxicityComparisonHistory(qualDocs, tamperedUnit, syntheticActual);
  assert(badQual.errors.includes('Toxicity comparison actual versioned description differs'));

  const badPredUnit = structuredClone(syntheticUnit);
  delete badPredUnit.history.previousAddresses[`${path}#nd-page`];
  assert.throws(() => qualifyToxicityComparisonHistory(qualDocs, badPredUnit, syntheticActual), /predecessor citation inventory differs/);
});

test('B19 toxicity comparison source plan preserves 2eba26c6 predecessor, 20-claim layout and forbids unreviewed mutations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectToxicityComparison(config), /not independently accepted/);
    assert.equal(selectToxicityComparison(config, undefined, true), config.unit);
    assert.throws(() => selectToxicityComparison(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectToxicityComparison(withEvidence, null, true), /not independently accepted/);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
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
  const input = { ...previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareToxicityComparisonSource(unit, customInput, customActual, customStruct);
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
  await t.test('forbids unreviewed prior-claim correction and corrections metadata', () => {
    const u1 = structuredClone(config.unit);
    u1.correction = { claimId: 'cl-usetox-conclusion', scope: 'forged' };
    assert.throws(() => qualify(u1), /must not declare an unreviewed prior-claim correction/);
    const u2 = structuredClone(config.unit);
    u2.corrections = [];
    assert.throws(() => qualify(u2), /must not declare an unreviewed prior-claim correction/);
  });
  await t.test('refuses layout reordering of conserved USEtox paragraphs and B17 reverse-concept consumers', () => {
    const unit = structuredClone(config.unit);
    const base = {
      title: '毒性路径',
      description: '说明USEtox怎样从排放估计暴露和效应，以及资料缺口和因子标记怎样影响毒性比较。',
      sections: [
        { id: '排放与受体', title: '排放与受体', claimIds: ['cl-usetox-matched-emissions', 'cl-usetox-fate-exposure-effect', 'cl-usetox-intake-and-effects', 'cl-usetox-indicators-not-observed-cases'] },
        { id: '模型与范围', title: '模型与范围', claimIds: ['cl-usetox-model-comparison', 'cl-usetox-comparison-uncertainty', 'cl-usetox-boxes-and-time', 'cl-usetox-internal-feature-conflict'] },
        { id: '比较的依据', title: '比较的依据', claimIds: ['cl-usetox-missing-data-model-zero', 'cl-usetox-factor-flags-and-conditions', 'cl-usetox-prioritization', 'cl-usetox-conclusion'] },
      ],
    };
    const b19Row = unit.layouts.find(x => x.key === 'B19:reader-source');
    const [first, second, ...rest] = b19Row.to.sections[0].claimIds;
    b19Row.to.sections[0].claimIds = [second, first, ...rest];
    assert.throws(() => toxicityComparisonLayout(unit, 'B19:reader-source', base), /exact 20-claim section order/);

    const baseRev = [
      'cl-lcia-endpoint-units', 'cl-lcia-mid-end-conversion-limits',
      'cl-usetox-fate-exposure-effect', 'cl-usetox-indicators-not-observed-cases',
      'cl-lime-units', 'cl-rule-why-chain', 'cl-rule-results-layer',
      'cl-rule-reconstruction-limit', 'cl-rule-evidence-judgment', 'cl-native-preservation-meaning',
    ];
    const unitRev = structuredClone(config.unit);
    unitRev.layouts.find(x => x.key === 'B17:reverse-concept-consumers').to.pop();
    assert.throws(() => toxicityComparisonLayout(unitRev, 'B17:reverse-concept-consumers', baseRev), /exact B17 shared-concept consumer review/);
  });
  await t.test('enforces append-only prior research history and psg-tox123-/art-tox123- prefixes', () => {
    const unit1 = structuredClone(config.unit);
    unit1.rawRecords.find(r => r.path === 'catalog.sources' && r.id === 'src-land111-rivm2016').from.reading.scope = 'tampered';
    assert.throws(() => qualify(unit1), /changed a previous source or its acquisition scope: src-land111-rivm2016/);

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
  await t.test('rejects protected B19 MDX edits, newline in description, and consumer review omissions', () => {
    const uMdx = structuredClone(config.unit);
    uMdx.previousMdx = uMdx.previousMdx + '\n';
    assert.throws(() => qualify(uMdx), /independently preserved predecessor B19 MDX bytes/);

    const mdxPath = `content${toxicityComparisonChapter}.mdx`;
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const uTrail = structuredClone(config.unit);
    uTrail.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(uTrail, badInput, badActual, badStruct), /changed protected B19 text or its scoped additions/);

    const uConsumers = structuredClone(config.unit);
    uConsumers.consumers = uConsumers.consumers.slice(1);
    assert.throws(() => qualify(uConsumers), /exact cross-generation consumer review/);
  });
});

test('Toxicity comparison receipt verifier fails closed when capture or capture pin is absent', () => {
  if (capture !== null || toxicityComparisonCapturePin !== null) return;
  if (!config.unit) return;
  const previous = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const unit = structuredClone(config.unit);
  unit.outputs = [{ path: toxicityComparisonChapter, route: toxicityComparisonChapter, sha256: '1'.repeat(64), rationale: 'r' }];
  unit.publicArtifacts = [{ path: 'claims/index.html', sha256: '2'.repeat(64), rationale: 'r' }];
  unit.outputCapture = {
    sourceCommit: '438768c855a317681214fc7fdf9be2a53596e8da',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: '438768c855a317681214fc7fdf9be2a53596e8da', manifestSha256: '3'.repeat(64) },
    normalization: { articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })), publicHtml: [{ path: 'claims/index.html', sha256: '2'.repeat(64) }] },
    files: [
      { path: 'docs/book/usetox-pathways-and-boundaries/index.html', sha256: '5'.repeat(64), bytes: 100 },
      { path: 'claims/index.html', sha256: '2'.repeat(64), bytes: 200 },
    ],
  };
  assert.equal(verifyToxicityComparisonReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, toxicityComparisonSource.date), expected), false);
});

test('Toxicity comparison receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const previous = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyToxicityComparisonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, toxicityComparisonSource.date), expected);
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
