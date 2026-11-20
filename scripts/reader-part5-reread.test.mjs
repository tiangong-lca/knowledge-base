import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restorePart7RereadTestFiles } from './reader-part7-reread.mjs';
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
import config from '../config/reader-part5-reread.json' with { type: 'json' };
import capture from '../config/reader-part5-reread-capture.json' with { type: 'json' };
import part4 from '../config/reader-part4-reread.json' with { type: 'json' };
import weighting from '../config/reader-weighting-valuation.json' with { type: 'json' };
import social from '../config/reader-social-comparison.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import numbering from '../config/reader-numbering.json' with { type: 'json' };
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
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { projectScientificOrdinaryTargets } from './reader-scientific-delta.mjs';
import {
  allowedOrdinaryOverrideKeys,
  assertCleanReaderProse,
  part5RereadB22Route,
  part5RereadB23Route,
  part5RereadCapturePin,
  part5RereadCorrections,
  part5RereadHistoryControls,
  part5RereadOrdinaryId,
  part5RereadPredecessorPin,
  part5RereadPreviousSurface,
  part5RereadRoutes,
  part5RereadSource,
  preparePart5RereadSource,
  projectPart5RereadNumbering,
  projectPart5RereadPrintParts,
  qualifyPart5RereadHistory,
  selectPart5Reread,
  validatePart5RereadCorrectionOutput,
  validatePart5RereadPartDisclosure,
  verifyPart5RereadReceipts,
} from './reader-part5-reread.mjs';

test('Part V continuous reread conserves 1044 claims, harmonizes Part V terminology, bridges cross-chapter premises and normalizes all 48 Part V locators', () => {
  const prev145 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit);
  assert.equal(prev145.catalog.claims.length, 1044);
  assert.deepEqual(catalog.claims.filter(c => c.scope.includes('具名方法与证据范围')), []);

  // Terminology, cross-anchors & first-appearance checks
  assert.match(catalog.claims.find(c => c.id === 'cl-loc137-ef31-location-regimes').text, /剩余可用水模型（AWARE）/);
  assert.equal(catalog.claims.find(c => c.id === 'cl-loc137-ef31-location-regimes').text.includes('水资源可用性足迹方法'), false);
  assert.match(catalog.claims.find(c => c.id === 'cl-loc137-open-economy-boundary-reversal').text, /联合国环境规划署全球生命周期影响评价方法共识项目（UNEP GLAM）/);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-glam3-reporting-discipline').text, /联合国环境规划署全球生命周期影响评价方法共识项目（UNEP GLAM）第三阶段范围界定报告/);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-glam3-reporting-discipline').text, /偏好排序组织法（PROMETHEE）/);
  assert.equal(catalog.claims.find(c => c.id === 'cl-weight135-glam3-reporting-discipline').text.includes('2020年范围界定报告'), false);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-comparative-assertion-regimes').text, /荷兰莱顿大学环境科学中心（CML）/);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-monetary-incommensurability').text, /荷兰莱顿大学环境科学中心（CML）2001年科学背景导则/);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-recipe-endpoint-stop').text, /荷兰国家公共卫生与环境研究院（RIVM）/);
  assert.match(catalog.claims.find(c => c.id === 'cl-weight135-ef-coating-indoor').text, /两项表征因子均达室外的约211倍/);
  assert.match(catalog.claims.find(c => c.id === 'cl-lime-national').text, /后来的第二版（LIME2）先抽地点/);
  assert.match(catalog.claims.find(c => c.id === 'cl-soc139-matrix-satellite-linearity-and-software-encoding').text, /原生产品社会影响生命周期评价数据库（PSILCA v3）在开源软件/);
  assert.match(catalog.claims.find(c => c.id === 'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation').text, /10,000 €（欧元）/);
  assert.match(catalog.claims.find(c => c.id === 'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation').text, /全拥有成本（TCO）/);
  assert.match(catalog.claims.find(c => c.id === 'cl-lcc143-five-monetary-quantities-and-shadow-price-double-counting').text, /总表 1\.5 四舍五入印作 0\.46/);
  assert.match(catalog.claims.find(c => c.id === 'cl-lcc143-actor-split-incentive-and-discount-rate-reversal').text, /328,826 USD（美元）/);

  // Cross-chapter & closing synthesis premise bridges
  assert.deepEqual(catalog.claims.find(c => c.id === 'cl-cn-question').premiseIds, ['cl-es-authority', 'cl-weight135-target-vs-hybrid-boundary']);
  assert(catalog.claims.find(c => c.id === 'cl-cn-conclusion').premiseIds.includes('cl-loc137-four-layer-localization-audit'));
  assert(catalog.claims.find(c => c.id === 'cl-lime-decision').premiseIds.includes('cl-weight135-four-paradigm-synthesis'));
  assert.equal(catalog.claims.find(c => c.id === 'cl-soc139-portfolio-reference-and-comparative-assertions').premiseIds[0], 'cl-weight135-comparative-assertion-regimes');
  assert.equal(catalog.claims.find(c => c.id === 'cl-soc139-cross-pillar-overlap-audit').premiseIds[0], 'cl-weight135-ef-coating-indoor');

  // Zero leaked PDF viewer indices or § on both exclusive and shared Part V locators
  for (const evId of [
    'ev-loc137-ilcd2011-european-scope',
    'ev-loc137-cml2001-part3-regional-nf-bias',
    'ev-regional-xie-localization-layers',
    'ev-cn-yang-wang-liu-2001-framework',
    'ev-hkha-2005-hk-glass-numeric',
    'ev-lime-jp-conversion',
    'ev-regional-sun-contemporary-context',
    'ev-sustainability-slca-objects',
    'ev-sustainability-slca-organizational-reference',
    'ev-fossil117-rivm-scp-endpoint',
  ]) {
    const ev = catalog.evidence.find(e => e.id === evId);
    assert.equal(/PDF|§|印刷\s*p|印\s*pp|Chapter\s*\d|Table\s*\d/i.test(ev.locator), false, `${evId} still has leaked shorthand in locator: ${ev.locator}`);
  }

  // Negative regression checks for multi-page PDF ranges and concatenated IDs
  for (const bad of [
    '第 2 节（印第 4—5 页，PDF第4—5页）',
    '第 1 节，PDF第2、4—6页',
    '第 1 章引言，PDF indices15、19–21',
    '第 3.2 节，印刷pp5–6',
    '2020cl-forged-id',
  ]) {
    assert.throws(() => assertCleanReaderProse(bad, 'test'), /invalid or leaked reader-surface token/);
  }
});

test('Part V continuous reread ordinary IDs, numbering/printParts projection, 4-key overrides and DOM disclosures fail closed on tampering', () => {
  assert.equal(part5RereadOrdinaryId(null, part5RereadB22Route, false, 'table-2'), undefined);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB22Route, false, 'table-1'), undefined);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB22Route, false, 'table-2'), `${chapterAnchorPrefix(part5RereadB22Route)}-part5-145-ordinary-table-2`);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB22Route, true, 'table-2'), `${printUnitAnchor(part5RereadB22Route)}-part5-145-ordinary-table-2`);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB23Route, false, 'table-1'), `${chapterAnchorPrefix(part5RereadB23Route)}-part5-145-ordinary-table-1`);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB23Route, true, 'table-2'), `${printUnitAnchor(part5RereadB23Route)}-part5-145-ordinary-table-2`);
  assert.equal(part5RereadOrdinaryId(config.unit, part5RereadB23Route, false, 'table-3'), undefined);

  const projectedNum = projectPart5RereadNumbering(config.unit, numbering);
  assert.equal(projectedNum.parts.find(p => p.number === 5).introduction, config.unit.partIntroduction.from);
  const badNum = structuredClone(numbering);
  badNum.parts.find(p => p.number === 5).introduction = '篡改第五部导言';
  assert.throws(() => projectPart5RereadNumbering(config.unit, badNum), /differs from the reviewed Part 5 introduction/);

  const fakeParts = Array.from({ length: 7 }, (_, i) => ({
    id: `print-part-${i + 1}`,
    sha256: i === 4 ? config.unit.printPart5.from : `${i}`.repeat(64),
  }));
  const projParts = projectPart5RereadPrintParts(config.unit, fakeParts);
  assert.equal(projParts[4].sha256, config.unit.printPart5.to);
  const tamperedParts = structuredClone(fakeParts);
  tamperedParts[4].sha256 = 'f'.repeat(64);
  assert.throws(() => projectPart5RereadPrintParts(config.unit, tamperedParts), /differs from its accepted 8148\/95 predecessor/);

  assert.equal(allowedOrdinaryOverrideKeys.size, 4);
  const overrides = config.unit.history.ordinaryOverrides;
  assert.deepEqual(new Set(Object.keys(overrides)), allowedOrdinaryOverrideKeys);
  const sampleTargets = Object.fromEntries([...allowedOrdinaryOverrideKeys].map(k => [k, { route: '/docs/book', sha256: overrides[k].to, tag: 'P' }]));
  const projectedTargets = projectScientificOrdinaryTargets(overrides, sampleTargets, 'Part V continuous reread', allowedOrdinaryOverrideKeys);
  for (const k of allowedOrdinaryOverrideKeys) assert.equal(projectedTargets[k].sha256, overrides[k].from);

  assert.throws(
    () => projectScientificOrdinaryTargets({ ...overrides, '/docs/book#extra': { from: '1'.repeat(64), to: '2'.repeat(64) } }, sampleTargets, 'Part V continuous reread', allowedOrdinaryOverrideKeys),
    /differs from the explicit allowed key set/,
  );

  // Correction notice DOM validation enforces exact noteIndex and inline display:block
  const b21Path = '/docs/book/localization-evidence-and-denominators';
  const b21Rows = part5RereadCorrections.filter(r => r.chapter === b21Path);
  const byIdx = new Map(b21Rows.map(r => [r.noteIndex, r]));
  const itemsHtml = Array.from({ length: 36 }, (_, idx) => {
    const r = byIdx.get(idx);
    if (!r) return `<li id="${chapterAnchorPrefix(b21Path)}-claim-dummy-${idx}" data-reader-claim="dummy-${idx}"><p>普通注释</p></li>`;
    const id = `${chapterAnchorPrefix(b21Path)}-claim-${r.claimId}`;
    return `<li id="${id}" data-reader-claim="${r.claimId}"><p>原注释</p><p class="legacy-citation-context" data-part5-reread-correction="${r.claimId}" style="display:block"><time datetime="${part5RereadSource.date}">${part5RereadSource.date}</time> 修订：${r.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${part5RereadSource.commit}">查看前版源文件</a></p></li>`;
  }).join('');
  const goodDoc = htmlParser.parse(`<article data-reader-route="${b21Path}"><section class="chapter-notes"><ol>${itemsHtml}</ol></section></article>`);
  assert.deepEqual(validatePart5RereadCorrectionOutput(goodDoc, b21Path, config.unit), []);

  const wrongIdxDoc = htmlParser.parse(`<article data-reader-route="${b21Path}"><section class="chapter-notes"><ol><li><p>错位</p></li>${itemsHtml}</ol></section></article>`);
  assert.equal(validatePart5RereadCorrectionOutput(wrongIdxDoc, b21Path, config.unit).length, 3);

  const noStyleDoc = htmlParser.parse(goodDoc.toString().replace('style="display:block"', ''));
  assert.equal(validatePart5RereadCorrectionOutput(noStyleDoc, b21Path, config.unit).length, 1);

  const hiddenDoc = htmlParser.parse(goodDoc.toString().replace('style="display:block"', 'style="display:none"'));
  assert.equal(validatePart5RereadCorrectionOutput(hiddenDoc, b21Path, config.unit).length, 1);

  assert.deepEqual(part5RereadRoutes, ['/docs/book', part5RereadB22Route, part5RereadB23Route]);
  assert.equal(part5RereadHistoryControls(config.unit).size > 0, true);
  const firstAddr = Object.keys(config.unit.history.previousAddresses)[0];
  const prevSurf = part5RereadPreviousSurface(firstAddr, { claimIds: ['x'], ordinaryHashes: ['y'] }, config.unit);
  assert.deepEqual(prevSurf.claimIds, config.unit.history.previousAddresses[firstAddr].claimIds);
});

test('Part V continuous reread rollback recovers exact 915af295 state and rejects missing-key, nested-key, scope/caveat or premise tampering', async t => {
  if (config.status === 'reviewed') {
    assert.equal(selectPart5Reread(config), config.unit);
    assert.throws(() => selectPart5Reread(config, '0'.repeat(64)), /not independently accepted/);
  } else {
    assert.throws(() => selectPart5Reread(config), /not independently accepted/);
    assert.equal(selectPart5Reread(config, undefined, true), config.unit);
    assert.throws(() => selectPart5Reread(config, 'a'.repeat(64), true), /not independently accepted/);
  }
  assert.equal(selectPart5Reread({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  assert.throws(() => selectPart5Reread({ ...config, extra: 1 }, undefined, true), /closed generation configuration/);
  const withLayouts = structuredClone(config);
  withLayouts.unit.layouts = [];
  assert.throws(() => selectPart5Reread(withLayouts, undefined, true), /closed Part V plan/);

  // Missing-key bypass checks on unit and outputs[]
  const missingCapture = structuredClone(config);
  delete missingCapture.unit.outputCapture;
  assert.throws(() => selectPart5Reread(missingCapture, undefined, true), /closed Part V plan/);

  if (config.unit.outputs.length > 0) {
    const missingFromOut = structuredClone(config);
    delete missingFromOut.unit.outputs[0].from;
    assert.throws(() => selectPart5Reread(missingFromOut, undefined, true), /unauthorized, missing or invalid keys/);
  }

  if (config.unit.history.history.length > 0) {
    const extraHistKey = structuredClone(config);
    extraHistKey.unit.history.history[0].unreviewedWaiver = true;
    assert.throws(() => selectPart5Reread(extraHistKey, undefined, true), /unauthorized or invalid keys/);

    const extraOrdKey = structuredClone(config);
    extraOrdKey.unit.history.history[0].ordinary[0].extra = 1;
    assert.throws(() => selectPart5Reread(extraOrdKey, undefined, true), /unauthorized or invalid keys/);
  }

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(files, part3.unit), mkt.unit);
  restorePart7RereadTestFiles(files, part7.unit);
  restoreRevisableJudgmentTestFiles(files, rev.unit);
  restoreFutureScenariosTestFiles(files, fut.unit);
  restoreInterpretationBagsTestFiles(files, intBags.unit);
  restoreWallServiceComparisonTestFiles(files, wsc.unit);
  restorePart6RereadTestFiles(files, part6.unit);
  restoreDataQualityComparisonTestFiles(files, dqp.unit);
  restoreProductFootprintComparisonTestFiles(files, pfr.unit);
  restoreUncertaintyComparisonTestFiles(files, unc.unit);
  restoreDataApplicabilityComparisonTestFiles(files, dapp.unit);
  const prev145 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit);
  const input = { ...prev145, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    preparePart5RereadSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), part5RereadPredecessorPin);
  assert(res.affectedClaimIds.length >= 57);

  await t.test('rejects unreviewed correction properties on unit JSON', () => {
    const u1 = structuredClone(config.unit);
    u1.corrections = [];
    assert.throws(() => qualify(u1), /closed Part V plan/);
  });

  await t.test('rejects forged partIntroduction.from', () => {
    const u = structuredClone(config.unit);
    u.partIntroduction.from = '伪造的前版第五部导言文本';
    assert.throws(() => qualify(u), /partIntroduction does not match exact predecessor/);
  });

  await t.test('rejects mutating prose/scope/caveats outside per-field allowlists or leaking PDF range tokens', () => {
    const mutTextCat = structuredClone(input.catalog);
    mutTextCat.claims.find(c => c.id === 'cl-cn-question').text += '未受审改写。';
    const mutTextInput = { ...input, catalog: mutTextCat };
    const mutTextActual = inspectReadableBookEdition(mutTextInput), mutTextStruct = copyeditSourceStructure(mutTextInput);
    const uText = structuredClone(config.unit);
    for (const ch of uText.changes) if (ch.kind === 'record') ch.to = mutTextActual.records[ch.key];
    assert.throws(() => qualify(uText, mutTextInput, mutTextActual, mutTextStruct), /altered frozen prose text/);

    const mutScopeCat = structuredClone(input.catalog);
    mutScopeCat.claims.find(c => c.id === 'cl-lime-national').scope += '未受审范围';
    const mutScopeInput = { ...input, catalog: mutScopeCat };
    const mutScopeActual = inspectReadableBookEdition(mutScopeInput), mutScopeStruct = copyeditSourceStructure(mutScopeInput);
    const uScope = structuredClone(config.unit);
    for (const ch of uScope.changes) if (ch.kind === 'record') ch.to = mutScopeActual.records[ch.key];
    assert.throws(() => qualify(uScope, mutScopeInput, mutScopeActual, mutScopeStruct), /altered frozen scope/);

    const leakCat = structuredClone(input.catalog);
    leakCat.evidence.find(e => e.id === 'ev-regional-xie-localization-layers').locator = '第 1 节与第 3 节（PDF第2、4—6页）';
    const leakInput = { ...input, catalog: leakCat };
    const leakActual = inspectReadableBookEdition(leakInput), leakStruct = copyeditSourceStructure(leakInput);
    const uLeak = structuredClone(config.unit);
    for (const ch of uLeak.changes) if (ch.kind === 'record') ch.to = leakActual.records[ch.key];
    assert.throws(() => qualify(uLeak, leakInput, leakActual, leakStruct), /invalid or leaked reader-surface token/);
  });

  await t.test('rejects mutating evidence numericFacts outside locator', () => {
    const badCat = structuredClone(input.catalog);
    badCat.evidence.find(e => e.id === 'ev-loc137-pef-method-global-nf').summary += 'x';
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /altered protected evidence fields outside locator/);
  });

  await t.test('rejects unauthorized MDX edits outside scoped lines/cells', () => {
    const mdxPath = 'content/docs/book/index.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /outside lines 18 and 22/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });

  assert.match(validatePart5RereadPartDisclosure(null, config.unit)[0], /missing \/print document/);
  assert.deepEqual(qualifyPart5RereadHistory(new Map(), null, { a: 1 }, part4.unit, weighting.unit, social.unit), { prior: { a: 1 }, errors: [] });
});

test('Part V continuous reread receipt verifier fails closed when capture pin is absent', () => {
  if (part5RereadCapturePin !== null || !config.unit) return;
  const prev145 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit);
  const expected = readerPublicDownloads(prev145.catalog, prev145.literature, prev145.readings);
  const unit = structuredClone(config.unit);
  unit.outputCapture = {
    sourceCommit: '915af29592cee16d42772ba76080ed913d630e6b',
    dirty: true,
    status: 'working-preview',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    schemaVersion: 1,
    manifestPaths: 468,
    identity: { sourceCommit: '915af29592cee16d42772ba76080ed913d630e6b', dirty: true, status: 'working-preview', manifestSha256: '3'.repeat(64) },
    normalization: {
      articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })),
      publicHtml: unit.publicArtifacts.filter(r => r.path.endsWith('.html')).map(({ path, sha256 }) => ({ path, sha256 })),
    },
    files: [
      ...new Set(unit.outputs.map(r => `${r.path.slice(1)}/index.html`)).values().map(p => ({ path: p, sha256: '5'.repeat(64), bytes: 100 })),
      ...unit.publicArtifacts.map(r => ({ path: r.path, sha256: r.sha256, bytes: 200 })),
    ],
  };
  const envelopes = testEnvelopes(fakeCapture, unit, undefined, '2026-11-19');
  unit.reviewEvidence = ['source', 'reader', 'output'].map(kind => ({
    kind,
    date: '2026-11-19',
    artifactFile: `_docs/editorial/review-evidence/part5-reread-145/${kind}-artifact.json`,
    artifactSha256: 'a'.repeat(64),
    reportFile: `_docs/editorial/review-evidence/part5-reread-145/${kind}-report.json`,
    reportSha256: 'b'.repeat(64),
  }));
  assert.equal(verifyPart5RereadReceipts(unit, envelopes, expected), false);
});

test('Part V continuous reread receipts bind actual output capture independently', { skip: !part5RereadCapturePin && config.status !== 'reviewed' }, () => {
  const prev145 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit);
  const expected = readerPublicDownloads(prev145.catalog, prev145.literature, prev145.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyPart5RereadReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-19'), expected);
  };
  assert(verify());
  assert(!verify(unit => { unit.outputCapture.manifestSha256 = '0'.repeat(64); }));
  assert(!verify(undefined, output => { output.articleFiles[0].bytes++; }));
  assert(!verify(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).sha256 = '0'.repeat(64); }));
  assert(!verify(unit => {
    const [first, second] = unit.outputs;
    [first.sha256, second.sha256] = [second.sha256, first.sha256];
  }));
});
