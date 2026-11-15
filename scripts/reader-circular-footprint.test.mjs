import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../config/reader-circular-footprint.json' with { type: 'json' };
import capture from '../config/reader-circular-footprint-capture.json' with { type: 'json' };
import catalog from '../knowledge/catalog.json' with { type: 'json' };
import literature from '../knowledge/research/literature-map.json' with { type: 'json' };
import readings from '../knowledge/research/readings.json' with { type: 'json' };
import { editionDigest, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';
import { readerPublicDownloads } from './reader-current-output.mjs';
import { verifyCircularFootprintReceipts } from './reader-circular-footprint.mjs';

// These in-memory envelopes exercise the receipt predicates. They carry no editorial approval.
function testEnvelopes(unit, mutateOutput = () => {}) {
  const raw = new Map(capture.files.map(file => [file.path, file]));
  const articlePaths = [...new Set(unit.outputs.map(row => row.path.slice(1) + '/index.html'))];
  const observations = {
    source: { state: unit.state, changes: unit.changes, consumers: unit.consumers },
    reader: { routes: unit.routes, history: unit.history.history.map(row => row.address) },
    output: {
      outputs: unit.outputs, publicArtifacts: unit.publicArtifacts, addresses: unit.history.currentAddresses,
      source: 'actual-export', sourceCommit: capture.identity.sourceCommit, capture: unit.outputCapture,
      articleFiles: articlePaths.map(path => raw.get(path)),
      artifactFiles: unit.publicArtifacts.map(row => ({ ...raw.get(row.path), contentSha256: row.sha256 })),
    },
  };
  mutateOutput(observations.output);
  const artifacts = new Map();
  unit.reviewEvidence = Object.entries(observations).map(([kind, actual]) => {
    const base = `_docs/editorial/review-evidence/${unit.id}/${kind}`;
    const artifactFile = base + '-artifact.json';
    const reportFile = base + '-report.json';
    const identity = {
      schemaVersion: 1, kind, unit: unit.id, date: '2026-11-15', subjectSha256: readableBookReviewSubject(unit, kind),
    };
    const artifact = JSON.stringify({ ...identity, scope: unit.scope, observed: 'In-memory regression fixture', observations: actual });
    const artifactSha256 = sha256(artifact);
    const report = JSON.stringify({ ...identity, artifactSha256, disposition: 'accepted', reviewer: 'Regression fixture',
      findings: 'None asserted', provenance: 'In-memory regression fixture' });
    artifacts.set(artifactFile, Buffer.from(artifact));
    artifacts.set(reportFile, Buffer.from(report));
    return { kind, date: identity.date, artifactFile, artifactSha256, reportFile, reportSha256: sha256(report) };
  });
  return artifacts;
}

test('B13 receipts bind captured raw files, normalized article pairs, public pages and JSON', {
  skip: !capture && config.status !== 'reviewed',
}, () => {
  const expected = readerPublicDownloads(catalog, literature, readings);
  const check = (changeUnit = () => {}, changeOutput) => {
    const unit = structuredClone(config.unit);
    changeUnit(unit);
    return verifyCircularFootprintReceipts(unit, testEnvelopes(unit, changeOutput), expected);
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
