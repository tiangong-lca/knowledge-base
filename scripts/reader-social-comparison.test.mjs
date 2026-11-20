import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import part7 from '../config/reader-part7-reread.json' with { type: 'json' };
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
import config from '../config/reader-social-comparison.json' with { type: 'json' };
import capture from '../config/reader-social-comparison-capture.json' with { type: 'json' };
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
import { validateSocialComparisonFactors } from './reader-social-comparison-factors.mjs';
import {
  socialComparisonCapturePin,
  socialComparisonCorrections,
  socialComparisonOrdinaryId,
  socialComparisonPredecessorPin,
  socialComparisonRoute,
  socialComparisonSource,
  observeSocialComparisonOrdinaryTargets,
  prepareSocialComparisonSource,
  selectSocialComparison,
  validateSocialComparisonCorrectionOutput,
  verifySocialComparisonReceipts,
} from './reader-social-comparison.mjs';

test('Social comparison enforces exact 1036 claims, 14 single-artifact evidence records, 90 BigInt facts, prose bindings and zero hygiene leaks', () => {
  const prev139 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit);
  assert.equal(prev139.catalog.claims.length, 1036);
  assert.equal(prev139.catalog.claims.filter(c => c.id.startsWith('cl-soc139-')).length, 8);
  assert.equal(prev139.catalog.evidence.filter(e => e.id.startsWith('ev-soc139-')).length, 14);
  assert.equal(
    prev139.catalog.evidence
      .filter(e => e.id.startsWith('ev-soc139-'))
      .reduce((acc, e) => acc + (e.numericFacts?.length ?? 0), 0),
    90,
  );
  assert.deepEqual(catalog.claims.filter(c => c.scope.includes('具名方法与证据范围')), []);

  validateSocialComparisonFactors(prev139.catalog, prev139.readings);

  const readerBookTs = fs.readFileSync(new URL('../lib/reader-book.ts', import.meta.url), 'utf8');
  assert(readerBookTs.includes('...currentSocialComparison?.routes ?? []'));
  assert(readerBookTs.includes('currentSocialComparison?.routes.includes(target.route)'));

  const extraFactCat = structuredClone(prev139.catalog);
  extraFactCat.evidence.find(e => e.id === 'ev-soc139-cml2001-part3-casualties-history').numericFacts.push({
    id: 'nf-soc139-forged',
    value: '1.0',
    unit: 'kg',
    quantity: 'forged',
    subject: 'forged',
    basis: 'forged',
  });
  assert.throws(() => validateSocialComparisonFactors(extraFactCat, prev139.readings), /numericFacts count mismatch/);

  const singularFactCat = structuredClone(prev139.catalog);
  singularFactCat.evidence.find(e => e.id === 'ev-soc139-ilcd2010-workplace-boundary-separation').numericFact = {};
  assert.throws(() => validateSocialComparisonFactors(singularFactCat, prev139.readings), /evidence\/carrier binding failed/);

  const mutConceptCat = structuredClone(prev139.catalog);
  mutConceptCat.claims.find(c => c.id === 'cl-soc139-portfolio-reference-and-comparative-assertions').conceptIds = ['cn-social-assessment'];
  assert.throws(() => validateSocialComparisonFactors(mutConceptCat, prev139.readings), /claim structure invalid/);

  const mutValueCat = structuredClone(prev139.catalog);
  mutValueCat.evidence.find(e => e.id === 'ev-soc139-glam-work-env-2024-workbook').numericFacts[0].value = '421';
  assert.throws(() => validateSocialComparisonFactors(mutValueCat, prev139.readings), /malformed or unexpected numericFact/);

  const mutProseRatioCat = structuredClone(prev139.catalog);
  const cRev = mutProseRatioCat.claims.find(c => c.id === 'cl-soc139-ordinal-vs-exponential-scale-reversal');
  cRev.text = cRev.text.replace('15.77 倍', '15.78 倍');
  assert.throws(() => validateSocialComparisonFactors(mutProseRatioCat, prev139.readings), /prose binding missing/);

  const mutWageRatioCat = structuredClone(prev139.catalog);
  const cWage = mutWageRatioCat.claims.find(c => c.id === 'cl-soc139-wage-price-and-automation-paradoxes');
  cWage.text = cWage.text.replace('28.76 倍', '28.77 倍');
  assert.throws(() => validateSocialComparisonFactors(mutWageRatioCat, prev139.readings), /prose binding missing/);

  const mutCaveatCat = structuredClone(prev139.catalog);
  const cPort = mutCaveatCat.claims.find(c => c.id === 'cl-soc139-portfolio-reference-and-comparative-assertions');
  cPort.caveats[1] = cPort.caveats[1].replace('0.4968', '0.4969');
  assert.throws(() => validateSocialComparisonFactors(mutCaveatCat, prev139.readings), /prose binding missing/);

  const leakCat = structuredClone(prev139.catalog);
  leakCat.claims.find(c => c.id === 'cl-soc139-cross-pillar-overlap-audit').caveats[0] += ' 本仓库测试';
  assert.throws(() => validateSocialComparisonFactors(leakCat, prev139.readings), /hygiene check failed/);

  const leakEvCat = structuredClone(prev139.catalog);
  leakEvCat.evidence.find(e => e.id === 'ev-soc139-psilca-v3-architecture-and-scales').paraphrase += ' pdfIndices=0';
  assert.throws(() => validateSocialComparisonFactors(leakEvCat, prev139.readings), /hygiene check failed/);

  const leakSrcCat = structuredClone(prev139.catalog);
  leakSrcCat.sources.find(s => s.id === 'src-soc139-psilca-v3-doc').preservation += ' 公开仓库';
  assert.throws(() => validateSocialComparisonFactors(leakSrcCat, prev139.readings), /hygiene check failed/);

  const leakReadings = structuredClone(prev139.readings);
  leakReadings.readings.find(r => r.id === 'rd-soc139-psilca-v3-doc').passages[0].limits[0] += ' 零基索引';
  assert.throws(() => validateSocialComparisonFactors(prev139.catalog, leakReadings), /hygiene check failed/);
});

test('Social comparison ordinary IDs and all 7 print-visible correction notices fail closed on tampering', () => {
  assert.equal(socialComparisonOrdinaryId(null, socialComparisonRoute, false, 0), undefined);
  assert.equal(socialComparisonOrdinaryId(config.unit, socialComparisonRoute, false, 0), `${chapterAnchorPrefix(socialComparisonRoute)}-soc-139-ordinary-0`);
  assert.equal(socialComparisonOrdinaryId(config.unit, socialComparisonRoute, true, 0), `${printUnitAnchor(socialComparisonRoute)}-soc-139-ordinary-0`);
  assert.equal(socialComparisonOrdinaryId(config.unit, socialComparisonRoute, false, 1), undefined);
  assert.equal(socialComparisonOrdinaryId(config.unit, '/docs/book/other', false, 0), undefined);

  const pfx = chapterAnchorPrefix(socialComparisonRoute);
  const ordDoc = htmlParser.parse(
    `<article data-reader-route="${socialComparisonRoute}"><p id="${pfx}-soc-139-ordinary-0">导语</p></article>`,
  );
  const observed = observeSocialComparisonOrdinaryTargets(new Map([[socialComparisonRoute, ordDoc]]));
  assert.equal(Object.keys(observed).length, 1);
  assert.equal(observed[`${socialComparisonRoute}#${pfx}-soc-139-ordinary-0`]?.tag, 'P');

  const bangHidden = '!' + 'hidden';
  const buildB23Notes = () => {
    const items = Array.from({ length: 17 }, (_, idx) => {
      const corr = socialComparisonCorrections.find(r => r.noteIndex === idx);
      const cid = corr?.claimId ?? `cl-dummy-${idx + 1}`;
      const marker = corr
        ? `<p class="legacy-citation-context" data-social-comparison-correction="${cid}" style="display:block"><time datetime="${socialComparisonSource.date}">${socialComparisonSource.date}</time> 修订：${corr.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${socialComparisonSource.commit}">查看前版源文件</a></p>`
        : '';
      return `<li id="${pfx}-claim-${cid}" data-reader-claim="${cid}"><div class="claim-annotation">C</div>${marker}</li>`;
    }).join('');
    return htmlParser.parse(`<article data-reader-route="${socialComparisonRoute}"><section class="chapter-notes"><ol>${items}</ol></section></article>`);
  };

  assert.equal(socialComparisonCorrections.length, 7);
  assert.deepEqual(validateSocialComparisonCorrectionOutput(buildB23Notes(), socialComparisonRoute, config.unit), []);
  assert.deepEqual(validateSocialComparisonCorrectionOutput(htmlParser.parse('<article data-reader-route="/docs/book/other"></article>'), '/docs/book/other', config.unit), []);

  const wrongStyle = buildB23Notes().toString().replace('style="display:block"', 'style="display:none"');
  assert(validateSocialComparisonCorrectionOutput(htmlParser.parse(wrongStyle), socialComparisonRoute, config.unit).length >= 1);

  const concealedClass = buildB23Notes().toString().replace('class="legacy-citation-context"', `class="legacy-citation-context ${bangHidden}"`);
  assert(validateSocialComparisonCorrectionOutput(htmlParser.parse(concealedClass), socialComparisonRoute, config.unit).length >= 1);

  const extraSpan = buildB23Notes().toString().replace('</p>', '<span>extra</span></p>');
  assert(validateSocialComparisonCorrectionOutput(htmlParser.parse(extraSpan), socialComparisonRoute, config.unit).length >= 1);
});

test('Social comparison source plan recovers exact b1f96c03 predecessor and rejects tampering', async t => {
  assert(config.unit, 'expected active social comparison unit');
  if (config.status === 'preview') {
    assert.throws(() => selectSocialComparison(config), /not independently accepted/);
    assert.equal(selectSocialComparison(config, null, true), config.unit);
    assert.throws(() => selectSocialComparison(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectSocialComparison(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectSocialComparison({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

  const root = fileURLToPath(new URL('../', import.meta.url));
  const [files, shiftFiles, serviceFiles] = await Promise.all([
    readReadableBookFiles(root, baseline.fixedFiles),
    readLoadShiftCaseFiles(root, loadShift.unit),
    readServiceConstraintsFiles(root, service.unit),
  ]);
  for (const [path, bytes] of [...shiftFiles, ...serviceFiles]) files.set(path, bytes);
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
  const prev139Rec = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit);
  const input = { ...prev139Rec, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareSocialComparisonSource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), socialComparisonPredecessorPin);

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
        sourceCommit: socialComparisonSource.commit,
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

    const validRev = makeSyntheticReviewed();
    assert.equal(selectSocialComparison(validRev, editionDigest(validRev.unit), false), validRev.unit);

    const revPart = makeSyntheticReviewed();
    revPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectSocialComparison(revPart, editionDigest(revPart.unit), false), /unauthorized or unreviewed properties/);

    const revEvExtra = makeSyntheticReviewed();
    revEvExtra.unit.reviewEvidence[0].extra = true;
    assert.throws(() => selectSocialComparison(revEvExtra, editionDigest(revEvExtra.unit), false), /unauthorized or unreviewed properties/);

    const revCapExtra = makeSyntheticReviewed();
    revCapExtra.unit.outputCapture.extra = true;
    assert.throws(() => selectSocialComparison(revCapExtra, editionDigest(revCapExtra.unit), false), /unauthorized or unreviewed properties/);

    const cPart = makePreview();
    cPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectSocialComparison(cPart, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cPart.unit), /unauthorized or unreviewed properties/);

    const cMig = makePreview();
    cMig.unit.migrations = [];
    assert.throws(() => selectSocialComparison(cMig, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cMig.unit), /unauthorized or unreviewed properties/);

    const cOver = makePreview();
    cOver.unit.history.ordinaryOverrides = {};
    assert.throws(() => selectSocialComparison(cOver, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cOver.unit), /unauthorized or unreviewed properties/);

    const cBadPreviewCap = makePreview();
    cBadPreviewCap.unit.outputCapture = { forged: 1 };
    assert.throws(() => selectSocialComparison(cBadPreviewCap, null, true), /unauthorized or unreviewed properties/);

    for (const mutate of [
      u => { u.changes[0].extra = 1; },
      u => { u.consumers[0].extra = 1; },
      u => { u.rawRecords[0].extra = 1; },
      u => { u.rawFields = [{ path: 'x', from: 'a', to: 'b', extra: 1 }]; },
      u => { u.history.history = [{ address: '/docs/book/social-assessment-objects-and-meaning#nd-page', from: '1'.repeat(64), rationale: '测试历史条目。', ordinary: [], extra: 1 }]; },
      u => {
        u.history.history = [{
          address: '/docs/book/social-assessment-objects-and-meaning#nd-page',
          from: '1'.repeat(64),
          rationale: '测试历史条目。',
          ordinary: [{ from: '1'.repeat(64), to: '1'.repeat(64), address: '/docs/book/social-assessment-objects-and-meaning#nd-page', targetId: 't0', rationale: '测试普通块。', extra: 1 }],
        }];
      },
    ]) {
      const cSub = makePreview();
      mutate(cSub.unit);
      assert.throws(() => selectSocialComparison(cSub, null, true), /unauthorized or unreviewed properties/);
      assert.throws(() => qualify(cSub.unit), /unauthorized or unreviewed properties/);
    }
  });

  await t.test('rejects unauthorized MDX edits in B23 (including both 6-column comparison tables)', () => {
    const mdxPath = 'content/docs/book/social-assessment-objects-and-meaning.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString().replace('跨支柱消重规则', '篡改导语')));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed protected B23 MDX text/);
  });

  await t.test('rejects unauthorized caveat or dependency mutation on corrected prior claims', () => {
    const badCat = structuredClone(prev139Rec.catalog);
    badCat.claims.find(c => c.id === 'cl-sustainability-risk-not-facility-performance').caveats = ['私自附加'];
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /modified unauthorized fields on cl-sustainability-risk-not-facility-performance/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });
});

test('Social comparison receipt binding behaves fail-closed before and after capture pinning', async () => {
  if (!socialComparisonCapturePin && config.status !== 'reviewed') {
    const unit = structuredClone(config.unit);
    unit.outputCapture = {
      sourceCommit: '79c8ea9cf1c79eb0b773a2109188095037f9873a',
      dirty: true,
      status: 'working-preview',
      manifestSha256: '3'.repeat(64),
      normalizedProofSha256: '4'.repeat(64),
    };
    const fakeCapture = {
      schemaVersion: 1,
      identity: { sourceCommit: '79c8ea9cf1c79eb0b773a2109188095037f9873a', dirty: true, status: 'working-preview', manifestSha256: '3'.repeat(64) },
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
    assert.equal(verifySocialComparisonReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), new Map()), false);
    return;
  }

  const { readerPublicDownloads } = await import('./reader-current-output.mjs');
  const prev139 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit), cost.unit);
  const expected = readerPublicDownloads(prev139.catalog, prev139.literature, prev139.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifySocialComparisonReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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
