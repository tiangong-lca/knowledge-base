import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import config from '../config/reader-water-scarcity.json' with { type: 'json' };
import capture from '../config/reader-water-scarcity-capture.json' with { type: 'json' };
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
import { validateWaterScarcityFactors } from './reader-water-scarcity-factors.mjs';
import {
  prepareWaterScarcitySource,
  qualifyWaterScarcityHistory,
  selectWaterScarcity,
  verifyWaterScarcityReceipts,
  waterScarcityCapturePin,
  waterScarcityChapter,
  waterScarcityHistoryControls,
  waterScarcityOrdinaryId,
  waterScarcityPreviousSurface,
  waterScarcitySource,
} from './reader-water-scarcity.mjs';

const prefix = 'ev-water125-';

test('Water scarcity factors bind 7 carriers, 15 XML members, 101 numeric facts, reversals and support links', () => {
  assert.doesNotThrow(() => validateWaterScarcityFactors(catalog, readings));
  const probe = (mutate, expected) => {
    const c = structuredClone(catalog), r = structuredClone(readings);
    const evidence = name => c.evidence.find(row => row.id === prefix + name);
    const passage = name => {
      const record = evidence(name);
      return r.readings.find(row => row.id === record.readingId).passages.find(row => row.id === record.passageId);
    };
    mutate(c, r, evidence, passage);
    assert.throws(() => validateWaterScarcityFactors(c, r), expected);
  };
  const row = /changed the selected row or support passage/;
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-land111-lcimpact2020-article').artifacts[0].sha256 = '0'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-water125-ef31-selected-members').artifact.sha256 = '2'.repeat(64);
  }, /changed the independently observed carrier/);
  probe(c => {
    c.sources.find(x => x.id === 'src-water125-ef31-selected-members').reading.readingId = 'rd-forged';
  }, /changed the independently observed carrier/);
  probe((_c, r) => {
    r.readings.find(x => x.id === 'rd-flow-pilot-ef31').artifacts
      .find(x => x.id === 'art-water125-ef-flow-water-unspecw-out').sha256 = '1'.repeat(64);
  }, /changed a verified EF 3\.1 XML member/);
  probe(c => {
    c.evidence = c.evidence.filter(x => x.id !== prefix + 'recipe2017-water');
  }, /evidence count differs from its pinned row inventory/);
  probe((_c, _r, evidence) => {
    evidence('ef31-water-xml').numericFacts.find(f => f.id === 'ef31-water-none-unspecw-output').value = '-42.950';
  }, row);
  probe((_c, _r, _ev, passage) => {
    passage('rivm-s6-country-and-corruption').pdfIndices = [164];
  }, row);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-method-genealogy');
    claim.text = claim.text.replace('11050 个流域', '11051 个流域');
  }, /changed the displayed method-genealogy prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-withdrawal-return-accounting');
    claim.text = claim.text.replace('10:1 的分歧', '9:1 的分歧');
  }, /changed the displayed withdrawal-return accounting prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-ef-country-resolution-and-climates');
    claim.text = claim.text.replace('阿鲁巴 100', '阿鲁巴 99');
  }, /changed the displayed country-resolution or threshold prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-value-choices-and-denominator-paradox');
    claim.text = claim.text.replace('1.35 倍', '1.36 倍');
  }, /changed the displayed denominator-paradox or endpoint value-choice prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-country-rank-reversals');
    claim.text = claim.text.replace('3.39×10¹¹ 倍', '3.38×10¹¹ 倍');
  }, /changed the displayed AU\/BD or CL\/CN country reversal prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-belgium-canada-mechanism-contrast');
    claim.text = claim.text.replace('5.40 倍', '5.41 倍');
  }, /changed the displayed Belgium vs Canada physical scarcity prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-package-report-discrepancies');
    claim.text = claim.text.replace('−0.005 m³ world-eq.', '−0.004 m³ world-eq.');
  }, /changed the displayed package discrepancy or Table S6\.2 corruption prose/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-diagnostic-synthesis');
    claim.text = claim.text.replace('X、Y 两流域虚构算例', '两流域示例');
  }, /changed the displayed five-step diagnostic synthesis prose/);
  probe(c => {
    c.claims.push({ ...structuredClone(c.claims.find(x => x.id === 'cl-water125-diagnostic-synthesis')), id: 'cl-water125-extra' });
  }, /claim count differs from its pinned claim inventory/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-water125-diagnostic-synthesis').status = 'draft';
  }, /lacks reviewed status or bounded conceptIds/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-water125-diagnostic-synthesis').conceptIds = ['cpt-forged'];
  }, /lacks reviewed status or bounded conceptIds/);
  probe(c => {
    const claim = c.claims.find(x => x.id === 'cl-water125-package-report-discrepancies');
    claim.evidenceIds = claim.evidenceIds.slice(1);
  }, /changed the evidence link roster/);
  probe(c => {
    c.claims.find(x => x.id === 'cl-water125-package-report-discrepancies').evidenceLinks[0].rationale = '   ';
  }, /lost the explicit supports link/);
});

test('B18 dated history maps ReaderSection markers, rejects ordinary-0 tamper, and qualifies 58 addresses', { skip: !config.unit }, () => {
  const path = waterScarcityChapter;
  const webPrefix = chapterAnchorPrefix(path);
  const prtPrefix = printUnitAnchor(path);
  const webOrdId = waterScarcityOrdinaryId(config.unit, path, false, 0);
  const prtOrdId = waterScarcityOrdinaryId(config.unit, path, true, 0);
  assert.equal(webOrdId, `${webPrefix}-water-125-ordinary-0`);
  assert.equal(prtOrdId, `${prtPrefix}-water-125-ordinary-0`);
  assert.equal(waterScarcityOrdinaryId(config.unit, path, false, 1), undefined);
  assert.equal(waterScarcityOrdinaryId(null, path, false, 0), undefined);

  const controls = waterScarcityHistoryControls(config.unit);
  const webPageCtrl = controls.get(`${path}#nd-page`);
  const webSecCtrl = controls.get(`${path}#剩余量之前先读输入口径`);
  const webAnnCtrl = controls.get(`${path}#${webPrefix}-annotations`);
  const prtUnitCtrl = controls.get(`/print#${prtPrefix}`);
  const prtSecCtrl = controls.get(`/print#${prtPrefix}-剩余量之前先读输入口径`);
  const prtAnnCtrl = controls.get(`/print#${prtPrefix}-annotations`);
  assert(webPageCtrl && webSecCtrl && webAnnCtrl && prtUnitCtrl && prtSecCtrl && prtAnnCtrl);
  // Section 3 (把两处耗水接到同一产品) is unchanged, so it must NOT appear in history controls!
  assert.equal(controls.has(`${path}#把两处耗水接到同一产品`), false);
  assert.equal(webSecCtrl.row.previous.title, '剩余量之前先读输入口径');
  assert.equal(prtSecCtrl.row.previous.title, '剩余量之前先读输入口径');

  const descText = config.unit.description;
  const ordSha = flowBoundaryOrdinaryDigest(htmlParser.parse(`<p id="${webOrdId}">${descText}</p>`).firstChild);

  const webNotes = webPageCtrl.row.previous.claimIds
    .map(id => `<li id="${webPrefix}-claim-${id}" data-reader-claim="${id}">Note</li>`).join('');
  const prtNotes = prtUnitCtrl.row.previous.claimIds
    .map(id => `<li id="${prtPrefix}-claim-${id}" data-reader-claim="${id}">Note</li>`).join('');

  const buildWebDoc = ({ ordText = descText, ordAttrs = '', detailsAttrs = '', between = '' } = {}) => htmlParser.parse(
    `<article id="nd-page" data-reader-route="${path}">`
    + `<h1 id="main-content">耗水与缺水潜势</h1>`
    + `<p id="${webOrdId}"${ordAttrs}>${ordText}</p>`
    + between
    + `<details class="legacy-citation-context" data-water-scarcity-history="nd-page" data-water-scarcity-origins="nd-page main-content"${detailsAttrs}>`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「耗水与缺水潜势」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${waterScarcitySource.commit}" data-water-scarcity-source="">查看该版源文件</a></p>`
    + `<ul><li><a href="#${encodeURIComponent(webOrdId)}" data-water-scarcity-ordinary="">原说明 1 的现行位置</a></li></ul>`
    + `<ul>${webPageCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${webPrefix}-claim-${id}" data-water-scarcity-note="">《耗水与缺水潜势》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<section class="chapter-notes" aria-labelledby="${webPrefix}-annotations">`
    + `<h2 id="${webPrefix}-annotations">注释</h2>`
    + `<details class="legacy-citation-context" data-copyedit-history="${webPrefix}-annotations"><summary>Copyedit</summary></details>`
    + `<details class="legacy-citation-context" data-water-scarcity-history="${webPrefix}-annotations" data-water-scarcity-origins="${webPrefix}-annotations">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「耗水与缺水潜势」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${waterScarcitySource.commit}" data-water-scarcity-source="">查看该版源文件</a></p>`
    + `<ul>${webAnnCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${webPrefix}-claim-${id}" data-water-scarcity-note="">《耗水与缺水潜势》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<ol>${webNotes}</ol></section></article>`,
  );

  const prtReadId = prtUnitCtrl.addresses[1].slice('/print#'.length);
  const defaultPrintSiblings = `<div data-legacy-scope="${prtPrefix}" class="legacy-citation-context">Legacy</div>`
    + `<details class="legacy-citation-context" data-copyedit-history="${prtReadId}"><summary>Copyedit</summary></details>`;
  const buildPrintDoc = ({ siblings = defaultPrintSiblings } = {}) => htmlParser.parse(
    `<article id="${prtPrefix}" data-reader-route="${path}">`
    + `<h3 id="${prtReadId}">耗水与缺水潜势</h3>`
    + `<p id="${prtOrdId}">${descText}</p>`
    + siblings
    + `<details class="legacy-citation-context" data-water-scarcity-history="${prtPrefix}" data-water-scarcity-origins="${prtPrefix} ${prtReadId}">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「耗水与缺水潜势」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${waterScarcitySource.commit}" data-water-scarcity-source="">查看该版源文件</a></p>`
    + `<ul><li><a href="#${encodeURIComponent(prtOrdId)}" data-water-scarcity-ordinary="">原说明 1 的现行位置</a></li></ul>`
    + `<ul>${prtUnitCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${prtPrefix}-claim-${id}" data-water-scarcity-note="">《耗水与缺水潜势》注 ${i + 1}</a></li>`).join('')}</ul>`
    + `</details>`
    + `<section class="chapter-notes" aria-labelledby="${prtPrefix}-annotations">`
    + `<h4 id="${prtPrefix}-annotations">注释</h4>`
    + `<details class="legacy-citation-context" data-water-scarcity-history="${prtPrefix}-annotations" data-water-scarcity-origins="${prtPrefix}-annotations">`
    + `<summary><time datetime="2026-11-17">2026-11-17</time> 版「耗水与缺水潜势」的引用范围</summary>`
    + `<p><a href="https://github.com/tiangong-lca/knowledge-base/tree/${waterScarcitySource.commit}" data-water-scarcity-source="">查看该版源文件</a></p>`
    + `<ul>${prtAnnCtrl.row.previous.claimIds.map((id, i) => `<li><a href="#${prtPrefix}-claim-${id}" data-water-scarcity-note="">《耗水与缺水潜势》注 ${i + 1}</a></li>`).join('')}</ul>`
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
  const checkSubset = (webOpts, prtOpts) => validateDatedHistoryOutput(
    new Map([[path, buildWebDoc(webOpts)], ['/print', buildPrintDoc(prtOpts)]]),
    {
      expected: subsetExpected,
      source: waterScarcitySource,
      attribute: 'water-scarcity',
      ordinaryPattern: /-water-125-ordinary-0$/,
      ordinaryTargets,
      label: 'Water scarcity',
    },
  );

  assert.deepEqual(checkSubset(), []);
  assert(checkSubset({ between: '<p>Detached</p>' }).length > 0);
  assert(checkSubset({ between: '<details data-copyedit-history="rogue-id"><summary>Rogue</summary></details>' }).length > 0);
  assert(checkSubset({ between: '<div data-legacy-scope="rogue-scope">Rogue</div>' }).length > 0);
  assert(checkSubset(undefined, { siblings: `<details data-copyedit-history="${prtPrefix}-体积记录了什么"><summary>Wrong section</summary></details>` }).length > 0);
  assert(checkSubset(undefined, { siblings: `<div data-legacy-scope="${prtPrefix}-体积记录了什么">Wrong section</div>` }).length > 0);
  assert(checkSubset(undefined, { siblings: `<div data-legacy-scope="${prtPrefix}" data-copyedit-history="rogue-foreign">Mixed</div>` }).length > 0);
  assert(checkSubset(undefined, { siblings: `<div data-legacy-scope="${prtPrefix}">Dup1</div><div data-legacy-scope="${prtPrefix}">Dup2</div>` }).length > 0);
  assert(checkSubset({ ordText: descText + '（篡改）' }).length > 0);
  assert(checkSubset({ ordAttrs: ' hidden' }).length > 0);
  assert(checkSubset({ detailsAttrs: ' style="display:none"' }).length > 0);

  const prevPage = config.unit.history.previousAddresses[`${path}#nd-page`];
  const rolledSurface = waterScarcityPreviousSurface(
    `${path}#nd-page`,
    { route: path, kind: 'page', claimIds: ['cl-new'], ordinaryHashes: ['new-sha'] },
    config.unit,
  );
  assert.deepEqual(rolledSurface.claimIds, prevPage.claimIds);
  assert.deepEqual(rolledSurface.ordinaryHashes, prevPage.ordinary);
  const untouched = { route: '/docs/book/other', kind: 'page', claimIds: ['cl-x'], ordinaryHashes: [] };
  assert.equal(waterScarcityPreviousSurface('/docs/book/other#nd-page', untouched, config.unit), untouched);

  const syntheticUnit = structuredClone(config.unit);
  const syntheticActual = Object.fromEntries(
    Object.entries(syntheticUnit.history.previousAddresses).map(([addr, old]) => {
      if (old.kind === 'note' || addr.endsWith('#把两处耗水接到同一产品') || addr.endsWith('-把两处耗水接到同一产品')) return [addr, old];
      return [addr, { ...old, claimIds: [...old.claimIds, 'cl-water125-method-genealogy'], ordinary: old.ordinary.length ? [ordSha] : [] }];
    }),
  );
  syntheticUnit.history.currentAddresses = structuredClone(syntheticActual);
  const qualDocs = new Map([[path, buildWebDoc()], ['/print', buildPrintDoc()]]);
  const qual = qualifyWaterScarcityHistory(qualDocs, syntheticUnit, syntheticActual);
  assert.deepEqual(qual.prior, syntheticUnit.history.previousAddresses);
  assert(!qual.errors.includes('Water scarcity actual versioned description differs'));

  const tamperedUnit = structuredClone(syntheticUnit);
  tamperedUnit.history.ordinaryTargets[`${path}#${webOrdId}`].sha256 = 'f'.repeat(64);
  const badQual = qualifyWaterScarcityHistory(qualDocs, tamperedUnit, syntheticActual);
  assert(badQual.errors.includes('Water scarcity actual versioned description differs'));

  const badPredUnit = structuredClone(syntheticUnit);
  delete badPredUnit.history.previousAddresses[`${path}#nd-page`];
  assert.throws(() => qualifyWaterScarcityHistory(qualDocs, badPredUnit, syntheticActual), /predecessor citation inventory differs/);
});

test('B18 water scarcity source plan preserves 9486bae9 predecessor, 28-claim layout and forbids unreviewed mutations', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectWaterScarcity(config), /not independently accepted/);
    assert.equal(selectWaterScarcity(config, undefined, true), config.unit);
    assert.throws(() => selectWaterScarcity(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectWaterScarcity(withEvidence, null, true), /not independently accepted/);
  }
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restoreCostSustainabilityTestFiles(files, cost.unit);
  restoreSocialComparisonTestFiles(files, social.unit);
  restoreLocalizationComparisonTestFiles(files, localization.unit);
  restoreWeightingValuationTestFiles(files, weighting.unit);
  restorePart4RereadTestFiles(files, part4.unit);
  if (particulate.unit) files.set(`content${particulate.unit.routes[0]}.mdx`, Buffer.from(particulate.unit.previousMdx));
  if (eutro.unit) files.set(`content${eutro.unit.routes[0]}.mdx`, Buffer.from(eutro.unit.previousMdx));
  if (bio.unit) for (const [p, text] of Object.entries(bio.unit.previousMdx)) files.set(p, Buffer.from(text));
  const input = { ...previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareWaterScarcitySource(unit, customInput, customActual, customStruct);
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
    u1.correction = { claimId: 'cl-water-conclusion', scope: 'forged' };
    assert.throws(() => qualify(u1), /must not declare an unreviewed prior-claim correction/);
    const u2 = structuredClone(config.unit);
    u2.corrections = [];
    assert.throws(() => qualify(u2), /must not declare an unreviewed prior-claim correction/);
  });
  await t.test('enforces append-only prior research history and psg-water125-/art-water125- prefixes', () => {
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
  await t.test('rejects protected B18 MDX edits, newline in description, and consumer review omissions', () => {
    const uMdx = structuredClone(config.unit);
    uMdx.previousMdx = uMdx.previousMdx + '\n';
    assert.throws(() => qualify(uMdx), /independently preserved predecessor B18 MDX bytes/);

    const uDesc = structuredClone(config);
    uDesc.unit.description = 'line1\nline2';
    assert.throws(() => selectWaterScarcity(uDesc, undefined, true), /bounded B18 plan/);

    const mdxPath = `content${waterScarcityChapter}.mdx`;
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const uTrail = structuredClone(config.unit);
    uTrail.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(uTrail, badInput, badActual, badStruct), /changed protected B18 text or its four scoped additions/);

    const uConsumers = structuredClone(config.unit);
    uConsumers.consumers = uConsumers.consumers.slice(1);
    assert.throws(() => qualify(uConsumers), /exact cross-generation consumer review/);
  });
});

test('Water scarcity receipt verifier fails closed when capture or capture pin is absent', () => {
  if (capture !== null || waterScarcityCapturePin !== null) return;
  if (!config.unit) return;
  const previous = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const unit = structuredClone(config.unit);
  unit.outputs = [{ path: waterScarcityChapter, route: waterScarcityChapter, sha256: '1'.repeat(64), rationale: 'r' }];
  unit.publicArtifacts = [{ path: 'claims/index.html', sha256: '2'.repeat(64), rationale: 'r' }];
  unit.outputCapture = {
    sourceCommit: 'f5611f12a21e804497d9521944361c84c5b75833',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: 'f5611f12a21e804497d9521944361c84c5b75833', manifestSha256: '3'.repeat(64) },
    normalization: { articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })), publicHtml: [{ path: 'claims/index.html', sha256: '2'.repeat(64) }] },
    files: [
      { path: 'docs/book/water-scarcity-and-reference/index.html', sha256: '5'.repeat(64), bytes: 100 },
      { path: 'claims/index.html', sha256: '2'.repeat(64), bytes: 200 },
    ],
  };
  assert.equal(verifyWaterScarcityReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, waterScarcitySource.date), expected), false);
});

test('Water scarcity receipts bind actual output capture independently', { skip: !capture && config.status !== 'reviewed' }, () => {
  const previous = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, cost.unit), social.unit), localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyWaterScarcityReceipts(unit, testEnvelopes(capture, unit, mutateOutput, waterScarcitySource.date), expected);
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
