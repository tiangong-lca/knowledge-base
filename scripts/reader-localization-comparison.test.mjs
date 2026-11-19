import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
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
import config from '../config/reader-localization-comparison.json' with { type: 'json' };
import capture from '../config/reader-localization-comparison-capture.json' with { type: 'json' };
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
import { readLoadShiftCaseFiles } from './reader-load-shift.mjs';
import { readServiceConstraintsFiles } from './reader-service-constraints.mjs';
import { validateLocalizationComparisonFactors } from './reader-localization-comparison-factors.mjs';
import {
  localizationComparisonCapturePin,
  localizationComparisonCorrections,
  localizationComparisonOrdinaryId,
  localizationComparisonPredecessorPin,
  localizationComparisonRoute,
  localizationComparisonSource,
  observeLocalizationComparisonOrdinaryTargets,
  prepareLocalizationComparisonSource,
  selectLocalizationComparison,
  validateLocalizationComparisonCorrectionOutput,
  verifyLocalizationComparisonReceipts,
} from './reader-localization-comparison.mjs';

test('Localization comparison enforces exact 1028 claims, 17 single-artifact evidence records, 93 BigInt facts, prose bindings and zero hygiene leaks', () => {
  const prev137 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit);
  assert.equal(prev137.catalog.claims.length, 1028);
  assert.equal(prev137.catalog.claims.filter(c => c.id.startsWith('cl-loc137-')).length, 8);
  assert.equal(prev137.catalog.evidence.filter(e => e.id.startsWith('ev-loc137-')).length, 17);
  assert.equal(
    prev137.catalog.evidence
      .filter(e => e.id.startsWith('ev-loc137-'))
      .reduce((acc, e) => acc + (e.numericFacts?.length ?? 0), 0),
    93,
  );
  assert.deepEqual(catalog.claims.filter(c => c.scope.includes('具名方法与证据范围')), []);

  validateLocalizationComparisonFactors(prev137.catalog, prev137.readings);

  // Verify lib/reader-book.ts binds currentLocalizationComparison in both relabelHistoricalTargets and getCitationLabel
  const readerBookTs = fs.readFileSync(new URL('../lib/reader-book.ts', import.meta.url), 'utf8');
  assert(readerBookTs.includes('...currentLocalizationComparison?.routes ?? []'));
  assert(readerBookTs.includes('currentLocalizationComparison?.routes.includes(target.route)'));

  const extraFactCat = structuredClone(prev137.catalog);
  extraFactCat.evidence.find(e => e.id === 'ev-loc137-ef31-pof-flat-locations').numericFacts.push({
    id: 'nf-loc137-forged',
    value: '1.0',
    unit: 'kg',
    quantity: 'forged',
    subject: 'forged',
    basis: 'forged',
  });
  assert.throws(() => validateLocalizationComparisonFactors(extraFactCat, prev137.readings), /numericFacts count mismatch/);

  const singularFactCat = structuredClone(prev137.catalog);
  singularFactCat.evidence.find(e => e.id === 'ev-loc137-ilcd2011-european-scope').numericFact = {};
  assert.throws(() => validateLocalizationComparisonFactors(singularFactCat, prev137.readings), /evidence\/carrier binding failed/);

  const mutConceptCat = structuredClone(prev137.catalog);
  mutConceptCat.claims.find(c => c.id === 'cl-loc137-ef31-location-regimes').conceptIds = ['cn-reference-value'];
  assert.throws(() => validateLocalizationComparisonFactors(mutConceptCat, prev137.readings), /claim structure invalid/);

  const mutValueCat = structuredClone(prev137.catalog);
  mutValueCat.evidence.find(e => e.id === 'ev-loc137-glam-pm2024-marginal-vs-average').numericFacts[0].value = '0.00064458';
  assert.throws(() => validateLocalizationComparisonFactors(mutValueCat, prev137.readings), /malformed or unexpected numericFact/);

  // F-01: Direct prose and caveat number tamper negative tests
  const mutProseShareCat = structuredClone(prev137.catalog);
  const c2 = mutProseShareCat.claims.find(c => c.id === 'cl-loc137-ef31-global-nf-extrapolation');
  c2.text = c2.text.replace('96.81%', '96.82%');
  assert.throws(() => validateLocalizationComparisonFactors(mutProseShareCat, prev137.readings), /prose binding missing/);

  const mutProseRatioCat = structuredClone(prev137.catalog);
  const c6 = mutProseRatioCat.claims.find(c => c.id === 'cl-loc137-pm-nonlinear-and-endpoint-reversals');
  c6.text = c6.text.replace('48.71倍', '48.72倍');
  assert.throws(() => validateLocalizationComparisonFactors(mutProseRatioCat, prev137.readings), /prose binding missing/);

  const mutCaveatSumCat = structuredClone(prev137.catalog);
  const c2Cav = mutCaveatSumCat.claims.find(c => c.id === 'cl-loc137-ef31-global-nf-extrapolation');
  c2Cav.caveats[0] = c2Cav.caveats[0].replace('58.59%', '58.60%');
  assert.throws(() => validateLocalizationComparisonFactors(mutCaveatSumCat, prev137.readings), /prose binding missing/);

  // F-03: Expanded surface hygiene negative tests across evidence, sources, passages and claims
  const leakCat = structuredClone(prev137.catalog);
  leakCat.claims.find(c => c.id === 'cl-loc137-four-layer-localization-audit').caveats[0] += ' 本仓库测试';
  assert.throws(() => validateLocalizationComparisonFactors(leakCat, prev137.readings), /hygiene check failed/);

  const leakEvCat = structuredClone(prev137.catalog);
  leakEvCat.evidence.find(e => e.id === 'ev-loc137-ef31-water-global-locations').paraphrase += ' pdfIndices=0';
  assert.throws(() => validateLocalizationComparisonFactors(leakEvCat, prev137.readings), /hygiene check failed/);

  const leakSrcCat = structuredClone(prev137.catalog);
  leakSrcCat.sources.find(s => s.id === 'src-loc137-lcimpact-ch1').preservation += ' 公开仓库';
  assert.throws(() => validateLocalizationComparisonFactors(leakSrcCat, prev137.readings), /hygiene check failed/);

  const leakReadings = structuredClone(prev137.readings);
  leakReadings.readings.find(r => r.id === 'rd-loc137-lcimpact-ch1').passages[0].limits[0] += ' 零基索引';
  assert.throws(() => validateLocalizationComparisonFactors(prev137.catalog, leakReadings), /hygiene check failed/);
});

test('Localization comparison ordinary IDs and all 15 print-visible correction notices fail closed on tampering', () => {
  assert.equal(localizationComparisonOrdinaryId(null, localizationComparisonRoute, false, 0), undefined);
  assert.equal(localizationComparisonOrdinaryId(config.unit, localizationComparisonRoute, false, 0), `${chapterAnchorPrefix(localizationComparisonRoute)}-loc-137-ordinary-0`);
  assert.equal(localizationComparisonOrdinaryId(config.unit, localizationComparisonRoute, true, 0), `${printUnitAnchor(localizationComparisonRoute)}-loc-137-ordinary-0`);
  assert.equal(localizationComparisonOrdinaryId(config.unit, localizationComparisonRoute, false, 1), undefined);
  assert.equal(localizationComparisonOrdinaryId(config.unit, '/docs/book/other', false, 0), undefined);

  const pfx = chapterAnchorPrefix(localizationComparisonRoute);
  const ordDoc = htmlParser.parse(
    `<article data-reader-route="${localizationComparisonRoute}"><p id="${pfx}-loc-137-ordinary-0">导语</p></article>`,
  );
  const observed = observeLocalizationComparisonOrdinaryTargets(new Map([[localizationComparisonRoute, ordDoc]]));
  assert.equal(Object.keys(observed).length, 1);
  assert.equal(observed[`${localizationComparisonRoute}#${pfx}-loc-137-ordinary-0`]?.tag, 'P');

  const bangHidden = '!' + 'hidden';
  const buildB21Notes = () => {
    const items = Array.from({ length: 36 }, (_, idx) => {
      const corr = localizationComparisonCorrections.find(r => r.noteIndex === idx);
      const cid = corr?.claimId ?? `cl-dummy-${idx + 1}`;
      const marker = corr
        ? `<p class="legacy-citation-context" data-localization-comparison-correction="${cid}" style="display:block"><time datetime="${localizationComparisonSource.date}">${localizationComparisonSource.date}</time> 修订：${corr.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${localizationComparisonSource.commit}">查看前版源文件</a></p>`
        : '';
      return `<li id="${pfx}-claim-${cid}" data-reader-claim="${cid}"><div class="claim-annotation">C</div>${marker}</li>`;
    }).join('');
    return htmlParser.parse(`<article data-reader-route="${localizationComparisonRoute}"><section class="chapter-notes"><ol>${items}</ol></section></article>`);
  };

  assert.equal(localizationComparisonCorrections.length, 15);
  assert.deepEqual(validateLocalizationComparisonCorrectionOutput(buildB21Notes(), localizationComparisonRoute, config.unit), []);
  assert.deepEqual(validateLocalizationComparisonCorrectionOutput(htmlParser.parse('<article data-reader-route="/docs/book/other"></article>'), '/docs/book/other', config.unit), []);

  const wrongStyle = buildB21Notes().toString().replace('style="display:block"', 'style="display:none"');
  assert(validateLocalizationComparisonCorrectionOutput(htmlParser.parse(wrongStyle), localizationComparisonRoute, config.unit).length >= 1);

  const concealedClass = buildB21Notes().toString().replace('class="legacy-citation-context"', `class="legacy-citation-context ${bangHidden}"`);
  assert(validateLocalizationComparisonCorrectionOutput(htmlParser.parse(concealedClass), localizationComparisonRoute, config.unit).length >= 1);

  const extraSpan = buildB21Notes().toString().replace('</p>', '<span>extra</span></p>');
  assert(validateLocalizationComparisonCorrectionOutput(htmlParser.parse(extraSpan), localizationComparisonRoute, config.unit).length >= 1);
});

test('Localization comparison source plan recovers exact cec53208 predecessor and rejects tampering', async t => {
  assert(config.unit, 'expected active localization comparison unit');
  if (config.status === 'preview') {
    assert.throws(() => selectLocalizationComparison(config), /not independently accepted/);
    assert.equal(selectLocalizationComparison(config, null, true), config.unit);
    assert.throws(() => selectLocalizationComparison(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectLocalizationComparison(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectLocalizationComparison({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
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
  const prev137Rec = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit);
  const input = { ...prev137Rec, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareLocalizationComparisonSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), localizationComparisonPredecessorPin);

  await t.test('rejects layouts, partIntroduction, migrations, history.ordinaryOverrides and nested sub-envelope smuggling unconditionally', () => {
    const uLayouts = structuredClone(config.unit);
    uLayouts.layouts = [];
    assert.throws(() => qualify(uLayouts), /must not amend earlier locked chapter layouts/);

    const makePreview = () => {
      const c = structuredClone(config);
      c.status = 'preview';
      c.unit.outputCapture = null;
      delete c.unit.reviewEvidence;
      return c;
    };

    const makeSyntheticReviewed = () => {
      const c = structuredClone(config);
      c.status = 'reviewed';
      c.unit.outputCapture = {
        sourceCommit: localizationComparisonSource.commit,
        dirty: true,
        status: 'working-preview',
        manifestSha256: '1'.repeat(64),
        normalizedProofSha256: '2'.repeat(64),
      };
      c.unit.reviewEvidence = ['source', 'reader', 'output'].map(kind => ({
        kind,
        date: '2026-11-18',
        artifactFile: `${kind}.json`,
        artifactSha256: '3'.repeat(64),
        reportFile: `${kind}-report.json`,
        reportSha256: '4'.repeat(64),
      }));
      return c;
    };

    // Unconditional reviewed-mode baseline and smuggling checks (F-02)
    const validRev = makeSyntheticReviewed();
    assert.equal(selectLocalizationComparison(validRev, editionDigest(validRev.unit), false), validRev.unit);

    const revPart = makeSyntheticReviewed();
    revPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectLocalizationComparison(revPart, editionDigest(revPart.unit), false), /unauthorized or unreviewed properties/);

    const revEvExtra = makeSyntheticReviewed();
    revEvExtra.unit.reviewEvidence[0].extra = true;
    assert.throws(() => selectLocalizationComparison(revEvExtra, editionDigest(revEvExtra.unit), false), /unauthorized or unreviewed properties/);

    const revCapExtra = makeSyntheticReviewed();
    revCapExtra.unit.outputCapture.extra = true;
    assert.throws(() => selectLocalizationComparison(revCapExtra, editionDigest(revCapExtra.unit), false), /unauthorized or unreviewed properties/);

    const cPart = makePreview();
    cPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectLocalizationComparison(cPart, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cPart.unit), /unauthorized or unreviewed properties/);

    const cMig = makePreview();
    cMig.unit.migrations = [];
    assert.throws(() => selectLocalizationComparison(cMig, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cMig.unit), /unauthorized or unreviewed properties/);

    const cOver = makePreview();
    cOver.unit.history.ordinaryOverrides = {};
    assert.throws(() => selectLocalizationComparison(cOver, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cOver.unit), /unauthorized or unreviewed properties/);

    const cBadPreviewCap = makePreview();
    cBadPreviewCap.unit.outputCapture = { forged: 1 };
    assert.throws(() => selectLocalizationComparison(cBadPreviewCap, null, true), /unauthorized or unreviewed properties/);

    for (const mutate of [
      u => { u.changes[0].extra = 1; },
      u => { u.consumers[0].extra = 1; },
      u => { u.rawRecords[0].extra = 1; },
      u => { u.rawFields = [{ path: 'x', from: 'a', to: 'b', extra: 1 }]; },
      u => { u.history.history = [{ address: '/docs/book/localization-evidence-and-denominators#nd-page', from: '1'.repeat(64), rationale: '测试历史条目。', ordinary: [], extra: 1 }]; },
      u => {
        u.history.history = [{
          address: '/docs/book/localization-evidence-and-denominators#nd-page',
          from: '1'.repeat(64),
          rationale: '测试历史条目。',
          ordinary: [{ from: '1'.repeat(64), to: '1'.repeat(64), address: '/docs/book/localization-evidence-and-denominators#nd-page', targetId: 't0', rationale: '测试普通块。', extra: 1 }],
        }];
      },
    ]) {
      const cSub = makePreview();
      mutate(cSub.unit);
      assert.throws(() => selectLocalizationComparison(cSub, null, true), /unauthorized or unreviewed properties/);
      assert.throws(() => qualify(cSub.unit), /unauthorized or unreviewed properties/);
    }
  });

  await t.test('rejects unauthorized MDX edits in B21 (including both 6-column comparison tables)', () => {
    const mdxPath = 'content/docs/book/localization-evidence-and-denominators.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString().replace('四重分界', '篡改导语')));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed protected B21 MDX text/);
  });

  await t.test('rejects unauthorized caveat or dependency mutation on corrected prior claims', () => {
    const badCat = structuredClone(prev137Rec.catalog);
    badCat.claims.find(c => c.id === 'cl-cn-hk-borrowing').caveats = ['私自附加'];
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /modified unauthorized fields on cl-cn-hk-borrowing/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });
});

test('Localization comparison receipt binding behaves fail-closed before and after capture pinning', async () => {
  if (!localizationComparisonCapturePin && config.status !== 'reviewed') {
    const unit = structuredClone(config.unit);
    unit.outputCapture = {
      sourceCommit: '0518e6b529789b8dde9ffebf36d2eeb716a94390',
      dirty: true,
      status: 'working-preview',
      manifestSha256: '3'.repeat(64),
      normalizedProofSha256: '4'.repeat(64),
    };
    const fakeCapture = {
      schemaVersion: 1,
      identity: { sourceCommit: '0518e6b529789b8dde9ffebf36d2eeb716a94390', dirty: true, status: 'working-preview', manifestSha256: '3'.repeat(64) },
      manifestPaths: 468,
      normalization: {
        articles: unit.outputs.map(({ path, route, sha256 }) => ({ path, route, sha256 })),
        publicHtml: unit.publicArtifacts.filter(r => r.path.endsWith('.html')).map(({ path, sha256 }) => ({ path, sha256 })),
      },
      files: [
        ...new Set(unit.outputs.map(r => `${r.path.slice(1)}/index.html`)).values().map(p => ({ path: p, sha256: '5'.repeat(64), bytes: 100 })),
        ...unit.publicArtifacts.map(r => ({ path: r.path, sha256: r.sha256, bytes: 200 })),
      ],
    };
    assert.equal(verifyLocalizationComparisonReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), new Map()), false);
    return;
  }

  const { readerPublicDownloads } = await import('./reader-current-output.mjs');
  const prev137 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit), social.unit);
  const expected = readerPublicDownloads(prev137.catalog, prev137.literature, prev137.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyLocalizationComparisonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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
