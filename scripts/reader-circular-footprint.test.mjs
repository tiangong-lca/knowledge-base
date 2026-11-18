import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../config/reader-circular-footprint.json' with { type: 'json' };
import capture from '../config/reader-circular-footprint-capture.json' with { type: 'json' };
import localization from '../config/reader-localization-comparison.json' with { type: 'json' };
import weighting from '../config/reader-weighting-valuation.json' with { type: 'json' };
import part4 from '../config/reader-part4-reread.json' with { type: 'json' };
import particulate from '../config/reader-particulate-comparison.json' with { type: 'json' };
import eutro from '../config/reader-eutrophication-pathways.json' with { type: 'json' };
import bio from '../config/reader-biogenic-carbon.json' with { type: 'json' };
import water from '../config/reader-water-scarcity.json' with { type: 'json' };
import tox from '../config/reader-toxicity-comparison.json' with { type: 'json' };
import ozrad from '../config/reader-ozone-radiation.json' with { type: 'json' };
import ozone from '../config/reader-photochemical-ozone.json' with { type: 'json' };
import fossils from '../config/reader-fossil-resources.json' with { type: 'json' };
import minerals from '../config/reader-mineral-resources.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import { editionDigest } from './reader-current-edition.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { verifyCircularFootprintReceipts } from './reader-circular-footprint.mjs';

import landRecovery from '../config/reader-land-recovery.json' with { type: 'json' };
import acidEquivalents from '../config/reader-acid-equivalents.json' with { type: 'json' };
import { previousScientificTestRecords, testEnvelopes } from './fixtures/scientific-receipt-envelope.mjs';

test('B13 receipts bind captured raw files, normalized article pairs, public pages and JSON', {
  skip: !capture && config.status !== 'reviewed',
}, () => {
  const preWater = previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords(previousScientificTestRecords({ catalog, readings, literature }, localization.unit), weighting.unit), part4.unit), particulate.unit), eutro.unit), bio.unit), water.unit);
  const preTox = previousScientificTestRecords(preWater, tox.unit);
  const preOzrad = previousScientificTestRecords(preTox, ozrad.unit);
  const preOzone = previousScientificTestRecords(preOzrad, ozone.unit);
  const preFossils = previousScientificTestRecords(preOzone, fossils.unit);
  const preMinerals = previousScientificTestRecords(preFossils, minerals.unit);
  const land = previousScientificTestRecords(preMinerals, acidEquivalents.unit);
  const previous = previousScientificTestRecords(land, landRecovery.unit);
  const expected = readerPublicDownloads(previous.catalog, previous.literature, previous.readings);
  const check = (changeUnit = () => {}, changeOutput) => {
    const unit = structuredClone(config.unit);
    changeUnit(unit);
    return verifyCircularFootprintReceipts(unit, testEnvelopes(capture, unit, changeOutput), expected);
  };
  assert(check());
  assert(!check(unit => { unit.outputCapture.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.sourceCommit = '0'.repeat(40); }));
  assert(!check(undefined, output => { output.previewDownloads = []; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.json')).bytes = 1; }));
  assert(!check(undefined, output => { output.artifactFiles.find(row => row.path.endsWith('.html')).sha256 = '0'.repeat(64); }));
  assert(!check(unit => { unit.publicArtifacts.find(row => row.path === 'claims/index.html').sha256 = editionDigest('Different public HTML'); }));
  assert(!check(unit => {
    const [web, print] = unit.outputs;
    [web.sha256, print.sha256] = [print.sha256, web.sha256];
  }));
});
