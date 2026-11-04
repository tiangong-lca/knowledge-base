import { publicCatalog } from './knowledge.mjs';
import { validateResearch } from './research.mjs';

const pick = (record, fields) => Object.fromEntries(fields.filter(field => record[field] !== undefined).map(field => {
  const value = record[field];
  if (value !== null && !['string', 'boolean', 'number'].includes(typeof value)) throw new TypeError(`Bibliography ${field} must be a public scalar`);
  return [field, value];
}));
function readerArtifact(artifact) {
  if (!artifact) return undefined;
  return { kind: artifact.kind ?? 'retrieved', ...pick(artifact, [
    'id', 'sha256', 'mediaType', 'pageCount', 'resolvedUrl', 'originUrl',
    'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable',
  ]) };
}

/** Reader bibliography, not a projection of the research workbench. */
export function readerBibliography(catalog, literatureMap, readingLedger) {
  const published = publicCatalog(catalog);
  // Full internal joins and chronology still matter even though their workflow
  // fields are intentionally absent from the new reader-facing schema.
  const errors = validateResearch(literatureMap, readingLedger, catalog);
  if (errors.length) throw new TypeError(`Cannot publish bibliography:\n${errors.join('\n')}`);
  const sources = published.sources.map(source => ({
    ...pick(source, ['id', 'title', 'publisher', 'version', 'url', 'accessedAt']),
    ...(source.artifact ? { artifact: readerArtifact(source.artifact) } : {}),
  }));
  const citations = published.evidence.map(evidence => ({
    ...pick(evidence, ['id', 'sourceId', 'locator', 'summary', 'readingId', 'passageId']),
    ...(evidence.numericFact ? { numericFact: pick(evidence.numericFact, ['value', 'unit', 'quantity', 'subject', 'basis']) } : {}),
  }));
  const passages = [], seen = new Set();
  for (const citation of citations) {
    if (!citation.readingId || !citation.passageId || seen.has(citation.passageId)) continue;
    const reading = readingLedger.readings.find(record => record.id === citation.readingId);
    const passage = reading.passages.find(record => record.id === citation.passageId);
    const artifact = reading.artifacts.find(record => record.id === passage.artifactId);
    passages.push({ readingId: reading.id, ...pick(passage, ['id', 'locator', 'printedPages', 'artifactId']), artifact: readerArtifact(artifact) });
    seen.add(passage.id);
  }
  return { schemaVersion: 2, artifactKind: 'reader-bibliography', sources, citations, passages };
}
