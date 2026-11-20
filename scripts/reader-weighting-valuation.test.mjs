import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import mkt from '../config/reader-market-response-comparison.json' with { type: 'json' };
import part3 from '../config/reader-part3-reread.json' with { type: 'json' };
import fr from '../config/reader-functional-reference-comparison.json' with { type: 'json' };
import part2 from '../config/reader-part2-reread.json' with { type: 'json' };
import hyb from '../config/reader-hybrid-inventory-comparison.json' with { type: 'json' };
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
import { restoreMarketResponseComparisonTestFiles } from './reader-market-response-comparison.mjs';
import { restorePart3RereadTestFiles } from './reader-part3-reread.mjs';
import { restoreFunctionalReferenceComparisonTestFiles } from './reader-functional-reference-comparison.mjs';
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
import config from '../config/reader-weighting-valuation.json' with { type: 'json' };
import capture from '../config/reader-weighting-valuation-capture.json' with { type: 'json' };
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
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { validateWeightingValuationFactors } from './reader-weighting-valuation-factors.mjs';
import {
  observeWeightingValuationOrdinaryTargets,
  prepareWeightingValuationSource,
  selectWeightingValuation,
  validateWeightingValuationCorrectionOutput,
  verifyWeightingValuationReceipts,
  weightingValuationB20Route,
  weightingValuationB22Route,
  weightingValuationCapturePin,
  weightingValuationCorrections,
  weightingValuationOrdinaryId,
  weightingValuationPredecessorPin,
  weightingValuationSource,
} from './reader-weighting-valuation.mjs';

test('Weighting and valuation enforces exact 1020 claims, 18 single-artifact evidence records, 83 BigInt facts and zero hygiene leaks', () => {
  const prev135 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit);
  assert.equal(prev135.catalog.claims.length, 1020);
  assert.equal(prev135.catalog.claims.filter(c => c.id.startsWith('cl-weight135-')).length, 12);
  assert.equal(prev135.catalog.evidence.filter(e => e.id.startsWith('ev-weight135-')).length, 18);
  assert.deepEqual(catalog.claims.filter(c => c.scope.includes('具名方法与证据范围')), []);

  validateWeightingValuationFactors(prev135.catalog, prev135.readings);

  // Verify lib/reader-book.ts binds currentWeightingValuation in both relabelHistoricalTargets and getCitationLabel
  const readerBookTs = fs.readFileSync(new URL('../lib/reader-book.ts', import.meta.url), 'utf8');
  assert(readerBookTs.includes('...currentWeightingValuation?.routes ?? []'));
  assert(readerBookTs.includes('currentWeightingValuation?.routes.includes(target.route)'));

  const extraFactCat = structuredClone(prev135.catalog);
  extraFactCat.evidence.find(e => e.id === 'ev-weight135-ef31-pof-equal-cf').numericFacts.push({
    id: 'nf-weight135-forged',
    value: '1.0',
    unit: 'kg',
    quantity: 'forged',
    subject: 'forged',
    basis: 'forged',
  });
  assert.throws(() => validateWeightingValuationFactors(extraFactCat, prev135.readings), /numericFacts count mismatch/);

  const mutConceptCat = structuredClone(prev135.catalog);
  mutConceptCat.claims.find(c => c.id === 'cl-weight135-ef-coating-outdoor').conceptIds = ['cn-es-factor'];
  assert.throws(() => validateWeightingValuationFactors(mutConceptCat, prev135.readings), /claim structure invalid/);

  const mutValueCat = structuredClone(prev135.catalog);
  mutValueCat.evidence.find(e => e.id === 'ev-weight135-ef31-nmvoc-htnc-subcompartments').numericFacts[3].value = '0.000008956';
  assert.throws(() => validateWeightingValuationFactors(mutValueCat, prev135.readings), /malformed or unexpected numericFact/);

  const leakCat = structuredClone(prev135.catalog);
  leakCat.claims.find(c => c.id === 'cl-weight135-glam3-reporting-discipline').caveats[0] += ' 本仓库测试';
  assert.throws(() => validateWeightingValuationFactors(leakCat, prev135.readings), /hygiene check failed/);
});

test('Weighting and valuation ordinary IDs (including B22 table) and all 5 print-visible correction notices fail closed on tampering', () => {
  assert.equal(weightingValuationOrdinaryId(null, weightingValuationB20Route, false, 0), undefined);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB20Route, false, 0), `${chapterAnchorPrefix(weightingValuationB20Route)}-weight-135-ordinary-0`);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB20Route, false, 1), undefined);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB20Route, false, 'table'), undefined);

  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB22Route, false, 2), `${chapterAnchorPrefix(weightingValuationB22Route)}-weight-135-ordinary-2`);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB22Route, false, 3), undefined);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB22Route, false, 'table'), `${chapterAnchorPrefix(weightingValuationB22Route)}-weight-135-ordinary-table`);
  assert.equal(weightingValuationOrdinaryId(config.unit, weightingValuationB22Route, true, 'table'), `${printUnitAnchor(weightingValuationB22Route)}-weight-135-ordinary-table`);

  const pfx = chapterAnchorPrefix(weightingValuationB22Route);
  const tblDoc = htmlParser.parse(
    `<article data-reader-route="${weightingValuationB22Route}"><p id="${pfx}-weight-135-ordinary-0">导语</p><table id="${pfx}-weight-135-ordinary-table"><tbody><tr><td>572,000</td></tr></tbody></table></article>`,
  );
  const observed = observeWeightingValuationOrdinaryTargets(new Map([[weightingValuationB22Route, tblDoc]]));
  assert.equal(Object.keys(observed).length, 2);
  assert.equal(observed[`${weightingValuationB22Route}#${pfx}-weight-135-ordinary-table`]?.tag, 'TABLE');

  const bangHidden = '!' + 'hidden';
  const b22Rows = weightingValuationCorrections.filter(r => r.chapter === weightingValuationB22Route);
  const buildB22Notes = () => {
    const items = Array.from({ length: 41 }, (_, idx) => {
      const corr = b22Rows.find(r => r.noteIndex === idx);
      const cid = corr?.claimId ?? `cl-dummy-${idx + 1}`;
      const marker = corr
        ? `<p class="legacy-citation-context" data-weighting-valuation-correction="${cid}" style="display:block"><time datetime="${weightingValuationSource.date}">${weightingValuationSource.date}</time> 修订：${corr.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${weightingValuationSource.commit}">查看前版源文件</a></p>`
        : '';
      return `<li id="${pfx}-claim-${cid}" data-reader-claim="${cid}"><div class="claim-annotation">C</div>${marker}</li>`;
    }).join('');
    return htmlParser.parse(`<article data-reader-route="${weightingValuationB22Route}"><section class="chapter-notes"><ol>${items}</ol></section></article>`);
  };

  assert.deepEqual(validateWeightingValuationCorrectionOutput(buildB22Notes(), weightingValuationB22Route, config.unit), []);
  assert.deepEqual(validateWeightingValuationCorrectionOutput(htmlParser.parse('<article data-reader-route="/docs/book/other"></article>'), '/docs/book/other', config.unit), []);

  const wrongStyle = buildB22Notes().toString().replace('style="display:block"', 'style="display:none"');
  assert(validateWeightingValuationCorrectionOutput(htmlParser.parse(wrongStyle), weightingValuationB22Route, config.unit).length >= 1);

  const concealedClass = buildB22Notes().toString().replace('class="legacy-citation-context"', `class="legacy-citation-context ${bangHidden}"`);
  assert(validateWeightingValuationCorrectionOutput(htmlParser.parse(concealedClass), weightingValuationB22Route, config.unit).length >= 1);

  const extraSpan = buildB22Notes().toString().replace('</p>', '<span>extra</span></p>');
  assert(validateWeightingValuationCorrectionOutput(htmlParser.parse(extraSpan), weightingValuationB22Route, config.unit).length >= 1);
});

test('Weighting and valuation source plan recovers exact ff59fb32 predecessor and rejects tampering', { skip: !config.unit }, async t => {
  if (config.status === 'preview') {
    assert.throws(() => selectWeightingValuation(config), /not independently accepted/);
    assert.equal(selectWeightingValuation(config, undefined, true), config.unit);
    assert.throws(() => selectWeightingValuation(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectWeightingValuation(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectWeightingValuation({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
  restoreMarketResponseComparisonTestFiles(restorePart3RereadTestFiles(restoreFunctionalReferenceComparisonTestFiles(restoreHybridInventoryComparisonTestFiles(restorePart2RereadTestFiles(files, part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit);
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
  const prev135Rec = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit);
  const input = { ...prev135Rec, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareWeightingValuationSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), weightingValuationPredecessorPin);

  await t.test('rejects layouts, partIntroduction, migrations and history.ordinaryOverrides smuggling', () => {
    const uLayouts = structuredClone(config.unit);
    uLayouts.layouts = [];
    assert.throws(() => qualify(uLayouts), /must not amend earlier locked chapter layouts/);

    const makePreview = () => {
      const c = structuredClone(config);
      c.status = 'preview';
      delete c.unit.reviewEvidence;
      return c;
    };

    const cPart = makePreview();
    cPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectWeightingValuation(cPart, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cPart.unit), /unauthorized or unreviewed properties/);

    const cRev = structuredClone(config);
    if (cRev.status === 'reviewed') {
      cRev.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
      assert.throws(() => selectWeightingValuation(cRev, editionDigest(cRev.unit), false), /unauthorized or unreviewed properties/);
    }

    const cMig = makePreview();
    cMig.unit.migrations = [];
    assert.throws(() => selectWeightingValuation(cMig, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cMig.unit), /unauthorized or unreviewed properties/);

    const cOver = makePreview();
    cOver.unit.history.ordinaryOverrides = {};
    assert.throws(() => selectWeightingValuation(cOver, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cOver.unit), /unauthorized or unreviewed properties/);
  });

  await t.test('rejects unauthorized MDX edits in B20 or B22 (including synthesis table)', () => {
    const mdxPath = 'content/docs/book/lime-preferences-and-damage-weights.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString().replace('四项保护对象终点损害折算为单一日元估值', '篡改表格内容')));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed protected B20 or B22 MDX text/);
  });

  await t.test('rejects unauthorized caveat or dependency mutation on corrected prior claims', () => {
    const badCat = structuredClone(prev135Rec.catalog);
    badCat.claims.find(c => c.id === 'cl-lime-policy-contrast').caveats = ['私自附加'];
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /modified unauthorized fields on cl-lime-policy-contrast/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });
});

test('Weighting and valuation receipt verifier fails closed when capture pin is absent', () => {
  if (weightingValuationCapturePin !== null || !config.unit) return;
  const prev135 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit);
  const expected = readerPublicDownloads(prev135.catalog, prev135.literature, prev135.readings);
  const unit = structuredClone(config.unit);
  unit.outputCapture = {
    sourceCommit: '65aafe25a19865d61bd5a251584ce8cc39dc1941',
    manifestSha256: '3'.repeat(64),
    normalizedProofSha256: '4'.repeat(64),
  };
  const fakeCapture = {
    identity: { sourceCommit: '65aafe25a19865d61bd5a251584ce8cc39dc1941', manifestSha256: '3'.repeat(64) },
    normalization: {
      articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })),
      publicHtml: unit.publicArtifacts.filter(r => r.path.endsWith('.html')).map(({ path, sha256 }) => ({ path, sha256 })),
    },
    files: [
      ...new Set(unit.outputs.map(r => `${r.path.slice(1)}/index.html`)).values().map(p => ({ path: p, sha256: '5'.repeat(64), bytes: 100 })),
      ...unit.publicArtifacts.map(r => ({ path: r.path, sha256: r.sha256, bytes: 200 })),
    ],
  };
  assert.equal(verifyWeightingValuationReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), expected), false);
});

test('Weighting and valuation receipts bind actual output capture independently', { skip: !weightingValuationCapturePin && config.status !== 'reviewed' }, () => {
  const prev135 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part2.unit), hyb.unit), fr.unit), part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit), localization.unit);
  const expected = readerPublicDownloads(prev135.catalog, prev135.literature, prev135.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyWeightingValuationReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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
