import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import fw from '../config/reader-framework-comparison.json' with { type: 'json' };
import part2 from '../config/reader-part2-reread.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
import { restoreFrameworkComparisonTestFiles } from './reader-framework-comparison.mjs';
import { restorePart2RereadTestFiles } from './reader-part2-reread.mjs';
import { restoreHybridInventoryComparisonTestFiles } from './reader-hybrid-inventory-comparison.mjs';
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
import config from '../config/reader-part4-reread.json' with { type: 'json' };
import capture from '../config/reader-part4-reread-capture.json' with { type: 'json' };
import particulate from '../config/reader-particulate-comparison.json' with { type: 'json' };
import bio from '../config/reader-biogenic-carbon.json' with { type: 'json' };
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
import { fingerprintCopyeditPrintParts } from './reader-copyedit-history.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { validateDatedHistoryOutput, visibleHistoryControl } from './reader-flow-boundary.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { projectScientificOrdinaryTargets } from './reader-scientific-delta.mjs';
import { qualifyParticulateComparisonHistory } from './reader-particulate-comparison.mjs';
import { qualifyBiogenicCarbonHistory } from './reader-biogenic-carbon.mjs';
import {
  allowedOrdinaryOverrideKeys,
  part4RereadCapturePin,
  part4RereadCorrections,
  part4RereadHistoryControls,
  part4RereadLayout,
  part4RereadOrdinaryId,
  part4RereadPredecessorPin,
  part4RereadPreviousSurface,
  part4RereadRoutes,
  part4RereadSource,
  preparePart4RereadSource,
  projectPart4RereadNumbering,
  projectPart4RereadPrintParts,
  qualifyPart4RereadHistory,
  selectPart4Reread,
  validatePart4RereadCorrectionOutput,
  validatePart4RereadPartDisclosure,
  verifyPart4RereadReceipts,
} from './reader-part4-reread.mjs';

test('Part IV continuous reread enforces zero remaining mechanical #90 scopes across all 1008 claims and 2 case publications', async () => {
  const prev133 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit);
  assert.equal(prev133.catalog.claims.length, 1008);
  const mechanical = catalog.claims.filter(c => c.scope.includes('具名方法与证据范围'));
  assert.deepEqual(mechanical, []);

  // Verify factual typo fixes, UNEP GLAM attribution, cause-specific severity & B17 closing synchronization
  assert.match(catalog.claims.find(c => c.id === 'cl-pm-evidence-levels').scope, /Gronlund等2015年/);
  assert.equal(/Gronlund\s*2005/.test(catalog.claims.find(c => c.id === 'cl-pm-evidence-levels').scope), false);
  assert.match(
    catalog.claims.find(c => c.id === 'cl-pm-concentration-route').text,
    /联合国环境规划署生命周期倡议的全球共识生命周期影响评价方法（UNEP GLAM）/,
  );
  assert.equal(catalog.claims.find(c => c.id === 'cl-pm-concentration-route').text.includes('SETAC'), false);
  assert.match(catalog.claims.find(c => c.id === 'cl-pm-effect-definition').scope, /高收入北美分病种DALY\/死亡严重度代理/);
  assert.match(
    catalog.claims.find(c => c.id === 'cl-water125-value-choices-and-denominator-paradox').text,
    /第 14 章的臭氧耗竭、电离辐射、第 15 章的气候变化/,
  );
  assert.match(catalog.claims.find(c => c.id === 'cl-pm-population-meaning').text, /疾病发生例数/);
  assert(catalog.claims.find(c => c.id === 'cl-pm-population-meaning').premiseIds.includes('cl-particulate131-indicator-cutpoints'));
  assert.match(catalog.claims.find(c => c.id === 'cl-pm-conclusion').text, /指标截点与前体开关/);
  assert(catalog.claims.find(c => c.id === 'cl-pm-conclusion').premiseIds.includes('cl-particulate131-precursor-perspectives'));
  assert.match(catalog.claims.find(c => c.id === 'cl-water-opening').text, /Available WAter REmaining，AWARE/);
});

test('Part IV continuous reread ordinary IDs, numbering/printParts projection, 4-key overrides and DOM disclosures fail closed on tampering', () => {
  assert.equal(part4RereadOrdinaryId(null, '/docs/book', false, 0), undefined);
  assert.equal(part4RereadOrdinaryId(config.unit, '/docs/book/other', false, 0), undefined);
  assert.equal(part4RereadOrdinaryId(config.unit, '/docs/book', false, 10), undefined);
  assert.equal(part4RereadOrdinaryId(config.unit, '/docs/book', false, 0), `${chapterAnchorPrefix('/docs/book')}-part4-133-ordinary-0`);
  assert.equal(part4RereadOrdinaryId(config.unit, '/docs/book', true, 0), `${printUnitAnchor('/docs/book')}-part4-133-ordinary-0`);
  assert.equal(part4RereadOrdinaryId(config.unit, '/docs/book', true, 9), `${printUnitAnchor('/docs/book')}-part4-133-ordinary-9`);

  const x04 = '/docs/appendices/particulate-factor-calculations';
  assert.equal(part4RereadOrdinaryId(config.unit, x04, false, 5), `${chapterAnchorPrefix(x04)}-part4-133-ordinary-5`);
  assert.equal(part4RereadOrdinaryId(config.unit, x04, false, 6), undefined);

  // Numbering projection restores exact predecessor Part 4 introduction and rejects drift / angle brackets
  const projectedNum = projectPart4RereadNumbering(config.unit, numbering);
  assert.equal(projectedNum.parts.find(p => p.number === 4).introduction, config.unit.partIntroduction.from);
  const badNum = structuredClone(numbering);
  badNum.parts.find(p => p.number === 4).introduction = '篡改导言';
  assert.throws(() => projectPart4RereadNumbering(config.unit, badNum), /differs from the reviewed Part 4 introduction/);

  // printParts projection binds index 3 (print-part-4) and rejects no-op from === to
  const fakeParts = Array.from({ length: 7 }, (_, i) => ({
    id: `print-part-${i + 1}`,
    sha256: i === 3 ? config.unit.printPart4.from : `${i}`.repeat(64),
  }));
  const projParts = projectPart4RereadPrintParts(config.unit, fakeParts);
  assert.equal(projParts[3].sha256, config.unit.printPart4.to);
  const tamperedParts = structuredClone(fakeParts);
  tamperedParts[3].sha256 = 'f'.repeat(64);
  assert.throws(() => projectPart4RereadPrintParts(config.unit, tamperedParts), /differs from its accepted 8148\/95 predecessor/);
  const noopPrintUnit = structuredClone(config.unit);
  noopPrintUnit.printPart4.to = noopPrintUnit.printPart4.from;
  assert.throws(() => projectPart4RereadPrintParts(noopPrintUnit, fakeParts), /differs from its accepted 8148\/95 predecessor/);

  // B1 regression: 4-key allowlist and strict rejection of phantom or cross-generation override keys
  assert.equal(allowedOrdinaryOverrideKeys.size, 4);
  const overrides = config.unit.history.ordinaryOverrides;
  assert.equal(Object.keys(overrides).length, 4);
  for (const key of Object.keys(overrides)) assert(allowedOrdinaryOverrideKeys.has(key));

  const validTargets = Object.fromEntries(
    Object.entries(overrides).map(([k, v]) => [k, { route: part4RereadRoutes[3], sha256: v.to }]),
  );
  const rolledTargets = projectScientificOrdinaryTargets(overrides, validTargets, 'Part IV continuous reread', allowedOrdinaryOverrideKeys);
  for (const [k, v] of Object.entries(overrides)) assert.equal(rolledTargets[k].sha256, v.from);

  // Rejects phantom key absent from projected targets (no silent continue!)
  assert.throws(
    () => projectScientificOrdinaryTargets(
      { ...overrides, '/docs/book#phantom': { from: '1'.repeat(64), to: '2'.repeat(64) } },
      validTargets,
      'Part IV continuous reread',
    ),
    /unexpected ordinary override key/,
  );

  // Rejects cross-generation tamper of an unchanged #131/#127 block (Exploit 1b)
  const roguePart4 = structuredClone(config.unit);
  const unoverridden131Key = `${part4RereadRoutes[3]}#${chapterAnchorPrefix(part4RereadRoutes[3])}-particulate-131-ordinary-0`;
  roguePart4.history.ordinaryOverrides[unoverridden131Key] = { from: '1'.repeat(64), to: '2'.repeat(64) };
  assert.throws(
    () => qualifyParticulateComparisonHistory(new Map(), particulate.unit, {}, roguePart4),
    /violates the 4-key Part IV allowlist/,
  );
  assert.throws(
    () => qualifyBiogenicCarbonHistory(new Map(), bio.unit, {}, roguePart4),
    /violates the 4-key Part IV allowlist/,
  );
  assert.throws(
    () => qualifyPart4RereadHistory(new Map(), roguePart4, {}, particulate.unit, bio.unit),
    /violates the 4-key allowlist/,
  );

  // History controls populate ReaderSection marker title on /docs/book#从系统关系到计算结果
  const controls = part4RereadHistoryControls(config.unit);
  assert.equal(controls.get('/docs/book#从系统关系到计算结果')?.row.previous.title, '从系统关系到计算结果');
  assert.equal(controls.size, 16);

  // Surface rollback restores predecessor ordinaryHashes
  const bookKey = '/docs/book#nd-page';
  const rolledSurface = part4RereadPreviousSurface(
    bookKey,
    { claimIds: [], ordinaryHashes: config.unit.history.currentAddresses[bookKey].ordinary },
    config.unit,
  );
  assert.deepEqual(rolledSurface.ordinaryHashes, config.unit.history.previousAddresses[bookKey].ordinary);

  // B2 concealment regressions on visibleHistoryControl (build modifier tokens dynamically so Tailwind static scanner does not emit extra CSS utilities)
  const bangHidden = `${'!'}${'hidden'}`;
  const printBangHidden = `${'print:!'}${'hidden'}`;
  const clipInsetFull = `${'clip-path'}:${'inset'}(100%)`;
  const parseEl = html => htmlParser.parse(html).childNodes.find(n => n.nodeType === 1);
  assert.equal(visibleHistoryControl(parseEl('<p>visible</p>')), true);
  assert.equal(visibleHistoryControl(parseEl('<p style="opacity:0!important">x</p>')), false);
  assert.equal(visibleHistoryControl(parseEl('<p style="opacity:0.0">x</p>')), false);
  assert.equal(visibleHistoryControl(parseEl('<p style="opacity:0%">x</p>')), false);
  assert.equal(visibleHistoryControl(parseEl(`<p style="${clipInsetFull}">x</p>`)), false);
  assert.equal(visibleHistoryControl(parseEl('<p style="font-size:0">x</p>')), false);
  assert.equal(visibleHistoryControl(parseEl(`<p class="legacy-citation-context ${bangHidden}">x</p>`)), false);
  assert.equal(visibleHistoryControl(parseEl(`<p class="${printBangHidden}">x</p>`)), false);

  // M3 regression: Correction DOM validator enforces exact attrs, childNodes, time visibility & inline display:block
  assert.equal(part4RereadCorrections.length, 4);
  const unrelatedDoc = htmlParser.parse('<article data-reader-route="/docs/book/other"></article>');
  assert.deepEqual(validatePart4RereadCorrectionOutput(unrelatedDoc, '/docs/book/other', config.unit), []);

  const waterRoute = '/docs/book/water-scarcity-and-reference';
  const waterPfx = chapterAnchorPrefix(waterRoute);
  const waterRow = part4RereadCorrections.find(r => r.chapter === waterRoute);
  const validWaterHtml = `<article data-reader-route="${waterRoute}"><section class="chapter-notes"><ol><li id="${waterPfx}-claim-${waterRow.claimId}" data-reader-claim="${waterRow.claimId}"><div class="claim-annotation">A</div><p class="legacy-citation-context" data-part4-reread-correction="${waterRow.claimId}" style="display:block"><time datetime="${part4RereadSource.date}">${part4RereadSource.date}</time> 修订：${waterRow.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${part4RereadSource.commit}">查看前版源文件</a></p></li></ol></section></article>`;
  assert.deepEqual(validatePart4RereadCorrectionOutput(htmlParser.parse(validWaterHtml), waterRoute, config.unit), []);

  assert.equal(validatePart4RereadCorrectionOutput(htmlParser.parse(validWaterHtml.replace('style="display:block"', 'style="display:none"')), waterRoute, config.unit).length, 1);
  assert.equal(validatePart4RereadCorrectionOutput(htmlParser.parse(validWaterHtml.replace('class="legacy-citation-context"', `class="legacy-citation-context ${bangHidden}"`)), waterRoute, config.unit).length, 1);
  assert.equal(validatePart4RereadCorrectionOutput(htmlParser.parse(validWaterHtml.replace(`<time datetime="${part4RereadSource.date}">`, `<time datetime="${part4RereadSource.date}" hidden>`)), waterRoute, config.unit).length, 1);
  assert.equal(validatePart4RereadCorrectionOutput(htmlParser.parse(validWaterHtml.replace('</p>', '<span>extra</span></p>')), waterRoute, config.unit).length, 1);

  // B2 regression: Part 4 introduction disclosure validator enforces exact attrs & childNodes
  assert.equal(validatePart4RereadPartDisclosure(null, config.unit).length, 1);
  const buildPrintDoc = (detailsAttrs = 'class="legacy-citation-context" data-part4-reread-part="4"', extraInner = '') => {
    const html = `<div class="print-book">${Array.from({ length: 7 }, (_, idx) => {
      const n = idx + 1;
      const intro = n === 4 ? config.unit.partIntroduction.to : `Part ${n}`;
      const disc = n === 4
        ? `<details ${detailsAttrs}><summary><time datetime="${part4RereadSource.date}">${part4RereadSource.date}</time> 版第四部导言范围</summary><p>前版导言：“${config.unit.partIntroduction.from}” <a href="https://github.com/tiangong-lca/knowledge-base/tree/${part4RereadSource.commit}" data-part4-reread-part-source="">查看该版源文件</a></p>${extraInner}</details>`
        : '';
      return `<section class="print-part" data-reader-part-group="${n}"><h2 id="print-part-${n}" data-reader-part="${n}">第${n}部</h2><p class="print-part-introduction">${intro}</p>${disc}<article data-reader-route="/docs/book/ch${n}"></article></section>`;
    }).join('')}</div>`;
    return htmlParser.parse(html);
  };
  const cleanPrintDoc = buildPrintDoc();
  const unitForPrintTest = structuredClone(config.unit);
  unitForPrintTest.printPart4.to = fingerprintCopyeditPrintParts(cleanPrintDoc)[3].sha256;
  assert.deepEqual(validatePart4RereadPartDisclosure(cleanPrintDoc, unitForPrintTest), []);
  assert.equal(validatePart4RereadPartDisclosure(buildPrintDoc('open="" class="legacy-citation-context" data-part4-reread-part="4"'), unitForPrintTest).length, 1);
  assert.equal(validatePart4RereadPartDisclosure(buildPrintDoc('style="opacity:0!important" class="legacy-citation-context" data-part4-reread-part="4"'), unitForPrintTest).length, 1);
  assert.equal(validatePart4RereadPartDisclosure(buildPrintDoc('class="legacy-citation-context" data-part4-reread-part="4"', '<div>注入与<a href="https://evil.example">外链</a></div>'), unitForPrintTest).length, 1);

  // M1 regression: non-front-matter chapter on /print cannot attach <details> directly after <h2 data-reader-heading-key="@unit">
  const x04PrintId = printUnitAnchor(x04);
  const x04ReadId = `print-reading-unit-2f646f63732f617070656e64696365732f706172746963756c6174652d666163746f722d63616c63756c6174696f6e73`;
  const detachedPrintDoc = htmlParser.parse(
    `<article id="${x04PrintId}" data-reader-route="${x04}"><h2 id="${x04ReadId}" data-reader-heading-key="@unit">附录D</h2><details data-part4-reread-history="${x04PrintId}" data-part4-reread-origins="${x04PrintId} ${x04ReadId}"><summary><time datetime="${part4RereadSource.date}">${part4RereadSource.date}</time> 版「颗粒物因子的复算」的引用范围</summary><a data-part4-reread-source="" href="https://github.com/tiangong-lca/knowledge-base/tree/${part4RereadSource.commit}">源</a></details><p id="${x04PrintId}-part4-133-ordinary-0">描述</p></article>`,
  );
  const m1Expected = new Map([[`/print#${x04PrintId}`, {
    addresses: [`/print#${x04PrintId}`, `/print#${x04ReadId}`],
    row: {
      address: `/print#${x04PrintId}`,
      previous: { route: x04, kind: 'chapter', title: '颗粒物因子的复算', claimIds: [] },
      ordinary: [],
    },
  }]]);
  const m1Errors = validateDatedHistoryOutput(new Map([['/print', detachedPrintDoc]]), {
    expected: m1Expected,
    source: part4RereadSource,
    attribute: 'part4-reread',
    ordinaryPattern: /-part4-133-ordinary-\d+$/,
    ordinaryTargets: { [`/print#${x04PrintId}-part4-133-ordinary-0`]: editionDigest({ tag: 'P', text: '描述', links: [] }) },
    label: 'M1 test',
  });
  assert(m1Errors.some(e => e.includes('missing or invalid dated scope control')));
});

test('Part IV continuous reread source plan preserves exact 2ba0bfe2 state and rejects file, claim, caveat, prose, layout or consumer tampering', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectPart4Reread(config), /not independently accepted/);
    assert.equal(selectPart4Reread(config, undefined, true), config.unit);
    assert.throws(() => selectPart4Reread(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectPart4Reread(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectPart4Reread({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(restorePart2RereadTestFiles(restoreFrameworkComparisonTestFiles(files, fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit);
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
  restorePart5RereadTestFiles(files, part5.unit);
  restoreCostSustainabilityTestFiles(files, cost.unit);
  restoreSocialComparisonTestFiles(files, social.unit);
  restoreLocalizationComparisonTestFiles(files, localization.unit);
  restoreWeightingValuationTestFiles(files, weighting.unit);
  const prev133Rec = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit);
  const input = { ...prev133Rec, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    preparePart4RereadSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), part4RereadPredecessorPin);
  assert(res.affectedClaimIds.length >= 61);

  // Layout predicates verify exact predecessor & bounded navigation edits
  for (const prior of [...bio.unit.layouts.slice(0, 2), particulate.unit.layouts[0]]) {
    const out = part4RereadLayout(config.unit, prior.key, prior.to);
    assert.notDeepEqual(out, prior.to);
  }

  await t.test('rejects unreviewed correction properties on unit JSON', () => {
    const u1 = structuredClone(config.unit);
    u1.correction = { claimId: 'cl-pm-conclusion', scope: 'x' };
    assert.throws(() => qualify(u1), /binds corrections strictly through code-pinned part4RereadCorrections/);
  });

  await t.test('M2: rejects forged partIntroduction.from', () => {
    const u = structuredClone(config.unit);
    u.partIntroduction.from = '完全伪造的前版第四部导言文本';
    assert.throws(() => qualify(u), /partIntroduction does not match exact predecessor/);
  });

  await t.test('M2: rejects deleting caveats or mutating prose on scope-only claims', () => {
    const noCavCat = structuredClone(prev133Rec.catalog);
    noCavCat.claims.find(c => c.id === 'cl-path-acid-indicator').caveats = [];
    const noCavInput = { ...input, catalog: noCavCat };
    const noCavActual = inspectReadableBookEdition(noCavInput), noCavStruct = copyeditSourceStructure(noCavInput);
    const uCav = structuredClone(config.unit);
    for (const ch of uCav.changes) if (ch.kind === 'record') ch.to = noCavActual.records[ch.key];
    assert.throws(() => qualify(uCav, noCavInput, noCavActual, noCavStruct), /altered protected caveats/);

    const mutTextCat = structuredClone(prev133Rec.catalog);
    mutTextCat.claims.find(c => c.id === 'cl-pm-opening').text += '未受审改写。';
    const mutTextInput = { ...input, catalog: mutTextCat };
    const mutTextActual = inspectReadableBookEdition(mutTextInput), mutTextStruct = copyeditSourceStructure(mutTextInput);
    const uText = structuredClone(config.unit);
    for (const ch of uText.changes) if (ch.kind === 'record') ch.to = mutTextActual.records[ch.key];
    assert.throws(() => qualify(uText, mutTextInput, mutTextActual, mutTextStruct), /altered frozen prose text/);
  });

  await t.test('rejects protected claim binding mutation (evidenceIds/premiseIds/conceptIds)', () => {
    const badCat = structuredClone(prev133Rec.catalog);
    badCat.claims.find(c => c.id === 'cl-pm-opening').conceptIds = [];
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /altered protected evidence/);
  });

  await t.test('rejects mechanical placeholder regression, angle brackets or leaked internal ID in modified claims', () => {
    const badCat = structuredClone(prev133Rec.catalog);
    badCat.claims.find(c => c.id === 'cl-pm-opening').scope = '颗粒物排放与健康损害中的具名方法与证据范围。';
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /mechanical placeholder scope/);

    const leakCat = structuredClone(prev133Rec.catalog);
    leakCat.claims.find(c => c.id === 'cl-pm-opening').scope = '泄露内部标识 ev-particulate131-ilcd2011-pm。';
    const leakInput = { ...input, catalog: leakCat };
    const leakActual = inspectReadableBookEdition(leakInput), leakStruct = copyeditSourceStructure(leakInput);
    const uLeak = structuredClone(config.unit);
    for (const ch of uLeak.changes) if (ch.kind === 'record') ch.to = leakActual.records[ch.key];
    assert.throws(() => qualify(uLeak, leakInput, leakActual, leakStruct), /invalid or leaked reader-surface token/);

    const htmlCat = structuredClone(prev133Rec.catalog);
    htmlCat.claims.find(c => c.id === 'cl-pm-opening').scope = '注入尖括号 <b>x</b> 范围';
    const htmlInput = { ...input, catalog: htmlCat };
    const htmlActual = inspectReadableBookEdition(htmlInput), htmlStruct = copyeditSourceStructure(htmlInput);
    const uHtml = structuredClone(config.unit);
    for (const ch of uHtml.changes) if (ch.kind === 'record') ch.to = htmlActual.records[ch.key];
    assert.throws(() => qualify(uHtml, htmlInput, htmlActual, htmlStruct), /invalid newline or angle bracket/);
  });

  await t.test('rejects unauthorized MDX edits outside scoped dual-view and 4-factor lines', () => {
    const mdxPath = 'content/docs/book/index.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /outside the Part IV paragraph/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });
});

test('Part IV continuous reread receipt verifier fails closed when capture pin is absent', () => {
  if (part4RereadCapturePin !== null || !config.unit) return;
  const prev133 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit);
  const expected = readerPublicDownloads(prev133.catalog, prev133.literature, prev133.readings);
  const unit = structuredClone(config.unit);
  unit.outputCapture = {
    sourceCommit: '2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: '2ba0bfe2f39d28bfa42e61f5e2b70585770bcb73', manifestSha256: '3'.repeat(64) },
    normalization: {
      articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })),
      publicHtml: unit.publicArtifacts.filter(r => r.path.endsWith('.html')).map(({ path, sha256 }) => ({ path, sha256 })),
    },
    files: [
      ...new Set(unit.outputs.map(r => `${r.path.slice(1)}/index.html`)).values().map(p => ({ path: p, sha256: '5'.repeat(64), bytes: 100 })),
      ...unit.publicArtifacts.map(r => ({ path: r.path, sha256: r.sha256, bytes: 200 })),
    ],
  };
  assert.equal(verifyPart4RereadReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), expected), false);
});

test('Part IV continuous reread receipts bind actual output capture independently', { skip: !part4RereadCapturePin && config.status !== 'reviewed' }, () => {
  const prev133 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fw.unit), part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit), weighting.unit);
  const expected = readerPublicDownloads(prev133.catalog, prev133.literature, prev133.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyPart4RereadReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
  };
  assert(verify());
  assert(!verify(unit => { unit.outputCapture.manifestSha256 = '0'.repeat(64); }));
  assert(!verify(undefined, output => { output.articleFiles[0].bytes++; }));
  assert(!verify(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).sha256 = '0'.repeat(64); }));
  assert(!verify(unit => {
    const [first, second] = unit.outputs;
    [first.sha256, second.sha256] = [second.sha256, first.sha256];
  }));
  assert(!verify(undefined, output => { output.previewDownloads = []; }));
});
