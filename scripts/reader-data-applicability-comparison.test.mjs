import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
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
import config from '../config/reader-data-applicability-comparison.json' with { type: 'json' };
import capture from '../config/reader-data-applicability-comparison-capture.json' with { type: 'json' };
import baseline from '../config/readable-book-baseline.json' with { type: 'json' };
import loadShift from '../config/reader-load-shift.json' with { type: 'json' };
import service from '../config/reader-service-constraints.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';
import { chapterAnchorPrefix, printUnitAnchor } from './reader-book.mjs';
import { citationSourceHref } from './reader-citations.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { editionDigest, inspectReadableBookEdition } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import {
  assertCleanDataApplicabilityProse,
  expectedNumericFacts,
  validateDataApplicabilityComparisonFactors,
} from './reader-data-applicability-comparison-factors.mjs';
import {
  dataApplicabilityComparisonCapturePin,
  dataApplicabilityComparisonCorrections,
  dataApplicabilityComparisonLayout,
  dataApplicabilityComparisonOrdinaryId,
  dataApplicabilityComparisonPredecessorPin,
  dataApplicabilityComparisonRoutes,
  dataApplicabilityComparisonSource,
  predecessorDataApplicabilitySource,
  prepareDataApplicabilityComparisonSource,
  qualifyDataApplicabilityComparisonHistory,
  selectDataApplicabilityComparison,
  validateDataApplicabilityComparisonCorrectionOutput,
  verifyDataApplicabilityComparisonReceipts,
} from './reader-data-applicability-comparison.mjs';

test('Data applicability comparison enforces exact 1052 claims, 18 single-artifact evidence pairs, 63 BigInt facts and zero-survivor mutation', () => {
  const prev147 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit);
  assert.equal(prev147.catalog.claims.length, 1052);
  assert.equal(catalog.claims.filter(c => c.id.startsWith('cl-dapp147-')).length, 8);
  assert.equal(catalog.evidence.filter(e => e.id.startsWith('ev-dapp147-')).length, 18);
  assert.equal(
    catalog.evidence
      .filter(e => e.id.startsWith('ev-dapp147-'))
      .reduce((acc, e) => acc + (e.numericFacts?.length ?? 0), 0),
    63,
  );
  validateDataApplicabilityComparisonFactors(prev147.catalog, prev147.readings);

  // Zero-survivor mutation across all 63 numericFacts
  for (const factId of Object.keys(expectedNumericFacts)) {
    const mutated = structuredClone(prev147.catalog);
    const ev = mutated.evidence.find(e => (e.numericFacts ?? []).some(f => f.id === factId));
    assert(ev, `Missing evidence carrying ${factId}`);
    const f = ev.numericFacts.find(row => row.id === factId);
    f.value = f.value === '1' ? '2' : '1';
    assert.throws(
      () => validateDataApplicabilityComparisonFactors(mutated, prev147.readings),
      /missing or mismatched numericFact/,
    );
  }

  // Hygiene negative checks (raw UUID, PDF range, §, angle bracket, Tailwind risk word)
  for (const bad of [
    '引用源数据集 2f8a3ebd-befc-4ea9-a6de-34bb6d426d2f 合规块',
    '见 PDF 第 352 页表 7',
    '见 §4.6.5 表 22',
    '满足 DQR < 3.0 的条件',
    `采用 ${'\x73hadow'} 校验策略`,
  ]) {
    assert.throws(() => assertCleanDataApplicabilityProse(bad, 'negative-check'), /hygiene check failed/);
  }
});

test('Data applicability comparison ordinary IDs, B25 layouts and 12 dual-surface print-visible correction notices fail closed on tampering', () => {
  const web1 = '/docs/book/database-fitness-and-documentation';
  const web2 = '/docs/book/review-support-and-version-boundaries';
  const bookRoute = 'book-data-applicability';

  assert.equal(dataApplicabilityComparisonOrdinaryId(null, web1, false, 0), undefined);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, web1, false, 0), `${chapterAnchorPrefix(web1)}-dapp-147-ordinary-0`);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, web1, false, 1), undefined);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, web1, true, 0), undefined);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, web2, false, 1), `${chapterAnchorPrefix(web2)}-dapp-147-ordinary-1`);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, web2, false, 2), undefined);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, bookRoute, true, 0), `${printUnitAnchor(bookRoute)}-dapp-147-ordinary-0`);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, bookRoute, true, 1), `${printUnitAnchor(bookRoute)}-dapp-147-ordinary-1`);
  assert.equal(dataApplicabilityComparisonOrdinaryId(config.unit, bookRoute, false, 0), undefined);

  const predMono = predecessorDataApplicabilitySource('/monograph/data-applicability');
  const nextMono = dataApplicabilityComparisonLayout(config.unit, 'B25:/monograph/data-applicability:reader-source', predMono);
  assert.equal(nextMono.occurrences.length, 22);
  assert.equal(nextMono.source.tables.length, 2);

  const tamperedUnit = structuredClone(config.unit);
  tamperedUnit.layouts[0].to.source.description += '<script>';
  assert.throws(
    () => dataApplicabilityComparisonLayout(tamperedUnit, 'B25:/monograph/data-applicability:reader-source', predMono),
    /can change only its reviewed B25 description/,
  );

  // Build valid synthetic /print DOM with 22 notes and 6 correction notices
  assert.equal(dataApplicabilityComparisonCorrections.length, 12);
  const printPrefix = printUnitAnchor(bookRoute);
  const monoIds = nextMono.occurrences.map(r => r.id);
  const printRows = dataApplicabilityComparisonCorrections.filter(r => r.chapter === bookRoute);
  assert.equal(printRows.length, 6);
  const lis = monoIds.map((cid, idx) => {
    const corr = printRows.find(r => r.claimId === cid);
    if (corr) assert.equal(corr.noteIndex, idx);
    const notice = corr
      ? `<p class="legacy-citation-context" data-data-applicability-comparison-correction="${cid}" style="display:block"><time datetime="${dataApplicabilityComparisonSource.date}">${dataApplicabilityComparisonSource.date}</time> 修订：${corr.scope} <a href="${citationSourceHref(dataApplicabilityComparisonSource.commit)}">查看前版源文件</a></p>`
      : '';
    return `<li id="${printPrefix}-claim-${cid}" data-reader-claim="${cid}"><div class="claim-annotation">注</div>${notice}</li>`;
  }).join('');
  const printDoc = htmlParser.parse(
    `<article data-reader-route="${bookRoute}"><section class="chapter-notes"><ol>${lis}</ol></section></article>`,
  );
  assert.deepEqual(validateDataApplicabilityComparisonCorrectionOutput(printDoc, '/print', config.unit), []);

  // Removing style="display:block" must fail closed (protecting @media print visibility!)
  const hiddenDoc = htmlParser.parse(
    printDoc.toString().replace('style="display:block"', 'style="display:none"'),
  );
  assert.equal(validateDataApplicabilityComparisonCorrectionOutput(hiddenDoc, '/print', config.unit).length, 1);
});

test('Data applicability comparison source plan recovers exact c5b90b03 state and rejects tampering', async t => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [p, bytes] of [...shiftFiles, ...serviceFiles]) files.set(p, bytes);
  restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(files, hyb.unit), fr.unit), part3.unit), mkt.unit);
  restorePart7RereadTestFiles(files, part7.unit);
  restoreRevisableJudgmentTestFiles(files, rev.unit);
  restoreFutureScenariosTestFiles(files, fut.unit);
  restoreInterpretationBagsTestFiles(files, intBags.unit);
  restoreWallServiceComparisonTestFiles(files, wsc.unit);
  restorePart6RereadTestFiles(files, part6.unit);
  restoreDataQualityComparisonTestFiles(files, dqp.unit);
  restoreProductFootprintComparisonTestFiles(files, pfr.unit);
  restoreUncertaintyComparisonTestFiles(files, unc.unit);
  const prev147 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit);
  const input = { ...prev147, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareDataApplicabilityComparisonSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), dataApplicabilityComparisonPredecessorPin);

  await t.test('rejects extraneous envelope keys or malformed nested properties', () => {
    const badCfg = structuredClone(config);
    badCfg.unit.unexpectedField = true;
    assert.throws(() => selectDataApplicabilityComparison(badCfg, null, true), /envelope contains missing, extraneous or malformed/);
  });

  await t.test('rejects unauthorized MDX edits in B25 monograph or web companions', () => {
    const mdxPath = 'content/monograph/data-applicability.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString() + '\n'));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed protected B25 MDX text/);
  });

  await t.test('rejects unauthorized mutation on prior cl-db2011-* claims or ev-db2011-* evidence outside locator', () => {
    const badCat = structuredClone(input.catalog);
    badCat.evidence.find(e => e.id === 'ev-db2011-goal').summary += '篡改';
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed unauthorized field on prior evidence/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });

  assert.deepEqual(qualifyDataApplicabilityComparisonHistory(new Map(), null, { x: 1 }), { prior: { x: 1 }, errors: [] });
  assert.equal(dataApplicabilityComparisonRoutes.length, 3);
});

test('Data applicability comparison receipt binding behaves fail-closed before and after capture pinning', () => {
  const prev147 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit);
  const expected = readerPublicDownloads(prev147.catalog, prev147.literature, prev147.readings);
  if (dataApplicabilityComparisonCapturePin === null) {
    const unit = structuredClone(config.unit);
    unit.outputCapture = {
      sourceCommit: 'c5b90b0352abaeaf0eec6706685076c8825d8925',
      dirty: true,
      status: 'working-preview',
      manifestSha256: '3'.repeat(64),
      normalizedProofSha256: '4'.repeat(64),
    };
    unit.reviewEvidence = ['source', 'reader', 'output'].map(kind => ({
      kind,
      date: '2026-11-19',
      artifactFile: `_docs/editorial/review-evidence/data-applicability-comparison-147/${kind}-artifact.json`,
      artifactSha256: 'a'.repeat(64),
      reportFile: `_docs/editorial/review-evidence/data-applicability-comparison-147/${kind}-report.json`,
      reportSha256: 'b'.repeat(64),
    }));
    assert.equal(verifyDataApplicabilityComparisonReceipts(unit, new Map(), expected), false);
    return;
  }

  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyDataApplicabilityComparisonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-19'), expected);
  };
  assert(verify());
  assert(!verify(unit => { unit.outputCapture.manifestSha256 = '0'.repeat(64); }));
  assert(!verify(undefined, output => { output.articleFiles[0].bytes++; }));
  assert(!verify(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).sha256 = '0'.repeat(64); }));
});
