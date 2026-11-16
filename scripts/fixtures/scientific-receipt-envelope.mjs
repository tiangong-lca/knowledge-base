import { readableBookReviewSubject, sha256 } from '../reader-current-edition.mjs';
import { restoreScientificRecords } from '../reader-scientific-delta.mjs';

// These in-memory envelopes exercise the receipt predicates. They carry no editorial approval.
export function testEnvelopes(capture, unit, mutateOutput = () => {}, date = '2026-11-15') {
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
      schemaVersion: 1, kind, unit: unit.id, date, subjectSha256: readableBookReviewSubject(unit, kind),
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

export function previousScientificTestRecords(raw, unit) {
  if (!unit) return raw;
  const records = new Map(unit.changes.filter(row => row.kind === 'record').map(row => [row.key,row]));
  return restoreScientificRecords(raw, unit.rawRecords, unit.rawFields, records, () => true);
}
