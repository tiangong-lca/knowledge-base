import assert from 'node:assert/strict';
import fs from 'node:fs';
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
import part5 from '../config/reader-part5-reread.json' with { type: 'json' };
import { restorePart5RereadTestFiles } from './reader-part5-reread.mjs';
import config from '../config/reader-cost-sustainability.json' with { type: 'json' };
import capture from '../config/reader-cost-sustainability-capture.json' with { type: 'json' };
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
import { validateCostSustainabilityFactors } from './reader-cost-sustainability-factors.mjs';
import {
  costSustainabilityCapturePin,
  costSustainabilityCorrections,
  costSustainabilityOrdinaryId,
  costSustainabilityPredecessorPin,
  costSustainabilityRoute,
  costSustainabilitySource,
  observeCostSustainabilityOrdinaryTargets,
  prepareCostSustainabilitySource,
  selectCostSustainability,
  validateCostSustainabilityCorrectionOutput,
  verifyCostSustainabilityReceipts,
} from './reader-cost-sustainability.mjs';

test('Cost and sustainability enforces exact 1044 claims, 21 single-artifact evidence records, 82 BigInt facts, prose bindings and zero hygiene leaks', () => {
  const prev143 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit);
  assert.equal(prev143.catalog.claims.length, 1044);
  assert.equal(prev143.catalog.claims.filter(c => c.id.startsWith('cl-lcc143-')).length, 8);
  assert.equal(prev143.catalog.evidence.filter(e => e.id.startsWith('ev-lcc143-')).length, 21);
  assert.equal(
    prev143.catalog.evidence
      .filter(e => e.id.startsWith('ev-lcc143-'))
      .reduce((acc, e) => acc + (e.numericFacts?.length ?? 0), 0),
    82,
  );
  assert.deepEqual(catalog.claims.filter(c => c.scope.includes('具名方法与证据范围')), []);

  validateCostSustainabilityFactors(prev143.catalog, prev143.readings);

  const readerBookTs = fs.readFileSync(new URL('../lib/reader-book.ts', import.meta.url), 'utf8');
  assert(readerBookTs.includes('...currentCostSustainability?.routes ?? []'));
  assert(readerBookTs.includes('currentCostSustainability?.routes.includes(target.route)'));

  const extraFactCat = structuredClone(prev143.catalog);
  extraFactCat.evidence.find(e => e.id === 'ev-lcc143-swarr2011-code-of-practice').numericFacts.push({
    id: 'nf-lcc143-forged',
    value: '1.0',
    unit: 'USD',
    quantity: 'forged',
    subject: 'forged',
    basis: 'forged',
  });
  assert.throws(() => validateCostSustainabilityFactors(extraFactCat, prev143.readings), /numericFacts count mismatch/);

  const singularFactCat = structuredClone(prev143.catalog);
  singularFactCat.evidence.find(e => e.id === 'ev-lcc143-hsg2013-lcc-value-added').numericFact = {};
  assert.throws(() => validateCostSustainabilityFactors(singularFactCat, prev143.readings), /evidence\/carrier binding failed/);

  const mutConceptCat = structuredClone(prev143.catalog);
  mutConceptCat.claims.find(c => c.id === 'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals').conceptIds = ['cn-lcc-perspective'];
  assert.throws(() => validateCostSustainabilityFactors(mutConceptCat, prev143.readings), /claim structure invalid/);

  const mutValueCat = structuredClone(prev143.catalog);
  mutValueCat.evidence.find(e => e.id === 'ev-lcc143-steinmann2016-pca-footprints').numericFacts[0].value = '977';
  assert.throws(() => validateCostSustainabilityFactors(mutValueCat, prev143.readings), /malformed or unexpected numericFact/);

  const mutNpvCat = structuredClone(prev143.catalog);
  const cNpv = mutNpvCat.claims.find(c => c.id === 'cl-lcc143-actor-split-incentive-and-discount-rate-reversal');
  cNpv.text = cNpv.text.replace('128.68 €', '128.69 €');
  assert.throws(() => validateCostSustainabilityFactors(mutNpvCat, prev143.readings), /prose binding missing/);

  const mutCrossCat = structuredClone(prev143.catalog);
  const cCross = mutCrossCat.claims.find(c => c.id === 'cl-lcc143-actor-split-incentive-and-discount-rate-reversal');
  cCross.text = cCross.text.replace('6.49%', '6.50%');
  assert.throws(() => validateCostSustainabilityFactors(mutCrossCat, prev143.readings), /prose binding missing/);

  const mutIiaCat = structuredClone(prev143.catalog);
  const cIia = mutIiaCat.claims.find(c => c.id === 'cl-lcc143-dashboard-iia-outranking-and-compensatory-reversals');
  cIia.text = cIia.text.replace('816.67', '816.68');
  assert.throws(() => validateCostSustainabilityFactors(mutIiaCat, prev143.readings), /prose binding missing/);

  const mutAesaCat = structuredClone(prev143.catalog);
  const cAesa = mutAesaCat.claims.find(c => c.id === 'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal');
  cAesa.text = cAesa.text.replace('0.833', '0.834');
  assert.throws(() => validateCostSustainabilityFactors(mutAesaCat, prev143.readings), /prose binding missing/);

  const mutCaveatCat = structuredClone(prev143.catalog);
  const cCav = mutCaveatCat.claims.find(c => c.id === 'cl-lcc143-planetary-boundaries-and-sharing-principle-reversal');
  cCav.caveats[0] = cCav.caveats[0].replace('18.0 kg', '18.1 kg');
  assert.throws(() => validateCostSustainabilityFactors(mutCaveatCat, prev143.readings), /prose binding missing/);

  const mutArchCaveatCat = structuredClone(prev143.catalog);
  const cArchCav = mutArchCaveatCat.claims.find(c => c.id === 'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation');
  cArchCav.caveats[0] = cArchCav.caveats[0].replace('5 USD', '6 USD');
  assert.throws(() => validateCostSustainabilityFactors(mutArchCaveatCat, prev143.readings), /prose binding missing/);

  const leakCat = structuredClone(prev143.catalog);
  leakCat.claims.find(c => c.id === 'cl-lcc143-three-lcc-archetypes-and-value-added-consolidation').caveats[0] += ' 本仓库测试';
  assert.throws(() => validateCostSustainabilityFactors(leakCat, prev143.readings), /hygiene check failed/);

  const leakEvCat = structuredClone(prev143.catalog);
  leakEvCat.evidence.find(e => e.id === 'ev-lcc143-unep2011-lcc-flavours-and-cases').paraphrase += ' pdfIndices=0';
  assert.throws(() => validateCostSustainabilityFactors(leakEvCat, prev143.readings), /hygiene check failed/);

  const leakSrcCat = structuredClone(prev143.catalog);
  leakSrcCat.sources.find(s => s.id === 'src-lcc143-unep-setac-2011-lcsa').preservation += ' 公开仓库';
  assert.throws(() => validateCostSustainabilityFactors(leakSrcCat, prev143.readings), /hygiene check failed/);

  const leakReadings = structuredClone(prev143.readings);
  leakReadings.readings.find(r => r.id === 'rd-lcc143-unep-setac-2011-lcsa').passages[0].limits[0] += ' 零基索引';
  assert.throws(() => validateCostSustainabilityFactors(prev143.catalog, leakReadings), /hygiene check failed/);
});

test('Cost and sustainability ordinary IDs and all 7 print-visible correction notices fail closed on tampering', () => {
  assert.equal(costSustainabilityOrdinaryId(null, costSustainabilityRoute, false, 0), undefined);
  assert.equal(costSustainabilityOrdinaryId(config.unit, costSustainabilityRoute, false, 0), `${chapterAnchorPrefix(costSustainabilityRoute)}-lcc-143-ordinary-0`);
  assert.equal(costSustainabilityOrdinaryId(config.unit, costSustainabilityRoute, true, 0), `${printUnitAnchor(costSustainabilityRoute)}-lcc-143-ordinary-0`);
  assert.equal(costSustainabilityOrdinaryId(config.unit, costSustainabilityRoute, false, 1), undefined);
  assert.equal(costSustainabilityOrdinaryId(config.unit, '/docs/book/other', false, 0), undefined);

  const pfx = chapterAnchorPrefix(costSustainabilityRoute);
  const ordDoc = htmlParser.parse(
    `<article data-reader-route="${costSustainabilityRoute}"><p id="${pfx}-lcc-143-ordinary-0">导语</p></article>`,
  );
  const observed = observeCostSustainabilityOrdinaryTargets(new Map([[costSustainabilityRoute, ordDoc]]));
  assert.equal(Object.keys(observed).length, 1);
  assert.equal(observed[`${costSustainabilityRoute}#${pfx}-lcc-143-ordinary-0`]?.tag, 'P');

  const bangHidden = '!' + 'hidden';
  const buildB24Notes = () => {
    const items = Array.from({ length: 17 }, (_, idx) => {
      const corr = costSustainabilityCorrections.find(r => r.noteIndex === idx);
      const cid = corr?.claimId ?? `cl-dummy-${idx + 1}`;
      const marker = corr
        ? `<p class="legacy-citation-context" data-cost-sustainability-correction="${cid}" style="display:block"><time datetime="${costSustainabilitySource.date}">${costSustainabilitySource.date}</time> 修订：${corr.scope} <a href="https://github.com/tiangong-lca/knowledge-base/tree/${costSustainabilitySource.commit}">查看前版源文件</a></p>`
        : '';
      return `<li id="${pfx}-claim-${cid}" data-reader-claim="${cid}"><div class="claim-annotation">C</div>${marker}</li>`;
    }).join('');
    return htmlParser.parse(`<article data-reader-route="${costSustainabilityRoute}"><section class="chapter-notes"><ol>${items}</ol></section></article>`);
  };

  assert.equal(costSustainabilityCorrections.length, 7);
  assert.deepEqual(validateCostSustainabilityCorrectionOutput(buildB24Notes(), costSustainabilityRoute, config.unit), []);
  assert.deepEqual(validateCostSustainabilityCorrectionOutput(htmlParser.parse('<article data-reader-route="/docs/book/other"></article>'), '/docs/book/other', config.unit), []);

  const wrongStyle = buildB24Notes().toString().replace('style="display:block"', 'style="display:none"');
  assert(validateCostSustainabilityCorrectionOutput(htmlParser.parse(wrongStyle), costSustainabilityRoute, config.unit).length >= 1);

  const concealedClass = buildB24Notes().toString().replace('class="legacy-citation-context"', `class="legacy-citation-context ${bangHidden}"`);
  assert(validateCostSustainabilityCorrectionOutput(htmlParser.parse(concealedClass), costSustainabilityRoute, config.unit).length >= 1);

  const extraSpan = buildB24Notes().toString().replace('</p>', '<span>extra</span></p>');
  assert(validateCostSustainabilityCorrectionOutput(htmlParser.parse(extraSpan), costSustainabilityRoute, config.unit).length >= 1);
});

test('Cost and sustainability source plan recovers exact 9dbf6777 predecessor and rejects tampering', async t => {
  assert(config.unit, 'expected active cost sustainability unit');
  if (config.status === 'preview') {
    assert.throws(() => selectCostSustainability(config), /not independently accepted/);
    assert.equal(selectCostSustainability(config, null, true), config.unit);
    assert.throws(() => selectCostSustainability(config, 'a'.repeat(64), true), /not independently accepted/);
    const withEvidence = structuredClone(config);
    withEvidence.unit.reviewEvidence = [];
    assert.throws(() => selectCostSustainability(withEvidence, null, true), /not independently accepted/);
  }
  assert.equal(selectCostSustainability({ schemaVersion: 1, status: 'inactive', unit: null }, null), null);

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
  restorePart5RereadTestFiles(files, part5.unit);
  const prev143 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit);
  const input = { ...prev143, files };
  const actual = inspectReadableBookEdition(input), structure = copyeditSourceStructure(input);
  const qualify = (unit, customInput = input, customActual = actual, customStruct = structure) =>
    prepareCostSustainabilitySource(unit, customInput, customActual, customStruct);

  const res = qualify(config.unit);
  assert.equal(editionDigest({ ...res.previous, structure: res.structure }), costSustainabilityPredecessorPin);

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
        sourceCommit: costSustainabilitySource.commit,
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
    assert.equal(selectCostSustainability(validRev, editionDigest(validRev.unit), false), validRev.unit);

    const revPart = makeSyntheticReviewed();
    revPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectCostSustainability(revPart, editionDigest(revPart.unit), false), /unauthorized or unreviewed properties/);

    const revEvExtra = makeSyntheticReviewed();
    revEvExtra.unit.reviewEvidence[0].extra = true;
    assert.throws(() => selectCostSustainability(revEvExtra, editionDigest(revEvExtra.unit), false), /unauthorized or unreviewed properties/);

    const revCapExtra = makeSyntheticReviewed();
    revCapExtra.unit.outputCapture.extra = true;
    assert.throws(() => selectCostSustainability(revCapExtra, editionDigest(revCapExtra.unit), false), /unauthorized or unreviewed properties/);

    const cPart = makePreview();
    cPart.unit.partIntroduction = { part: 5, from: 'a', to: 'b' };
    assert.throws(() => selectCostSustainability(cPart, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cPart.unit), /unauthorized or unreviewed properties/);

    const cMig = makePreview();
    cMig.unit.migrations = [];
    assert.throws(() => selectCostSustainability(cMig, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cMig.unit), /unauthorized or unreviewed properties/);

    const cOver = makePreview();
    cOver.unit.history.ordinaryOverrides = {};
    assert.throws(() => selectCostSustainability(cOver, null, true), /unauthorized or unreviewed properties/);
    assert.throws(() => qualify(cOver.unit), /unauthorized or unreviewed properties/);

    const cBadPreviewCap = makePreview();
    cBadPreviewCap.unit.outputCapture = { forged: 1 };
    assert.throws(() => selectCostSustainability(cBadPreviewCap, null, true), /unauthorized or unreviewed properties/);

    for (const mutate of [
      u => { u.changes[0].extra = 1; },
      u => { u.consumers[0].extra = 1; },
      u => { u.rawRecords[0].extra = 1; },
      u => { u.rawFields = [{ path: 'x', from: 'a', to: 'b', extra: 1 }]; },
      u => { u.history.history = [{ address: '/docs/book/cost-perspectives-and-sustainability-combination#nd-page', from: '1'.repeat(64), rationale: '测试历史条目。', ordinary: [], extra: 1 }]; },
      u => {
        u.history.history = [{
          address: '/docs/book/cost-perspectives-and-sustainability-combination#nd-page',
          from: '1'.repeat(64),
          rationale: '测试历史条目。',
          ordinary: [{ from: '1'.repeat(64), to: '1'.repeat(64), address: '/docs/book/cost-perspectives-and-sustainability-combination#nd-page', targetId: 't0', rationale: '测试普通块。', extra: 1 }],
        }];
      },
    ]) {
      const cSub = makePreview();
      mutate(cSub.unit);
      assert.throws(() => selectCostSustainability(cSub, null, true), /unauthorized or unreviewed properties/);
      assert.throws(() => qualify(cSub.unit), /unauthorized or unreviewed properties/);
    }
  });

  await t.test('rejects unauthorized MDX edits in B24 (including both 6-column comparison tables)', () => {
    const mdxPath = 'content/docs/book/cost-perspectives-and-sustainability-combination.mdx';
    const badFiles = new Map(files);
    badFiles.set(mdxPath, Buffer.from(files.get(mdxPath).toString().replace('三类生命周期成本账本', '篡改导语')));
    const badInput = { ...input, files: badFiles };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    u.changes.find(c => c.key === mdxPath).to = badActual.files[mdxPath];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /changed protected B24 MDX text/);
  });

  await t.test('rejects unauthorized caveat or dependency mutation on corrected prior claims or B24-exclusive evidence', () => {
    const badCat = structuredClone(prev143.catalog);
    badCat.claims.find(c => c.id === 'cl-sustainability-lcc-actor-perspective').caveats = ['私自附加'];
    const badInput = { ...input, catalog: badCat };
    const badActual = inspectReadableBookEdition(badInput), badStruct = copyeditSourceStructure(badInput);
    const u = structuredClone(config.unit);
    for (const ch of u.changes) if (ch.kind === 'record') ch.to = badActual.records[ch.key];
    assert.throws(() => qualify(u, badInput, badActual, badStruct), /modified unauthorized fields on cl-sustainability-lcc-actor-perspective/);

    const badEvCat = structuredClone(prev143.catalog);
    badEvCat.evidence.find(e => e.id === 'ev-sustainability-lcsa-social-reference').paraphrase += '私自附加';
    const badEvInput = { ...input, catalog: badEvCat };
    const badEvActual = inspectReadableBookEdition(badEvInput), badEvStruct = copyeditSourceStructure(badEvInput);
    const uEv = structuredClone(config.unit);
    for (const ch of uEv.changes) if (ch.kind === 'record') ch.to = badEvActual.records[ch.key];
    assert.throws(() => qualify(uEv, badEvInput, badEvActual, badEvStruct), /changed unauthorized field on prior evidence: ev-sustainability-lcsa-social-reference/);
  });

  await t.test('rejects omitted consumer review', () => {
    const u = structuredClone(config.unit);
    u.consumers = u.consumers.slice(1);
    assert.throws(() => qualify(u), /exact cross-generation consumer review/);
  });
});

test('Cost and sustainability receipt binding behaves fail-closed before and after capture pinning', async () => {
  if (!costSustainabilityCapturePin && config.status !== 'reviewed') {
    const unit = structuredClone(config.unit);
    unit.outputCapture = {
      sourceCommit: '8d5f1037a2ab30b29c197fe89a422a5c69f81a93',
      dirty: true,
      status: 'working-preview',
      manifestSha256: '3'.repeat(64),
      normalizedProofSha256: '4'.repeat(64),
    };
    const fakeCapture = {
      schemaVersion: 1,
      identity: { sourceCommit: '8d5f1037a2ab30b29c197fe89a422a5c69f81a93', dirty: true, status: 'working-preview', manifestSha256: '3'.repeat(64) },
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
    assert.equal(verifyCostSustainabilityReceipts(unit, testEnvelopes(fakeCapture, unit, undefined, '2026-11-18'), new Map()), false);
    return;
  }

  const { readerPublicDownloads } = await import('./reader-current-output.mjs');
  const prev143 = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, part3.unit), mkt.unit), part7.unit), rev.unit), fut.unit), intBags.unit), wsc.unit), part6.unit), dqp.unit), pfr.unit), unc.unit), dapp.unit), part5.unit);
  const expected = readerPublicDownloads(prev143.catalog, prev143.literature, prev143.readings);
  const verify = (mutateUnit = () => {}, mutateOutput) => {
    const unit = structuredClone(config.unit);
    mutateUnit(unit);
    return verifyCostSustainabilityReceipts(unit, testEnvelopes(capture, unit, mutateOutput, '2026-11-18'), expected);
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
