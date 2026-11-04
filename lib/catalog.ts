import rawCatalog from '../knowledge/catalog.json';
import { publicCatalog, getClaimEvidence as resolveClaimEvidence } from '../scripts/knowledge.mjs';

export type EvidenceRelation = 'supports' | 'qualifies' | 'contradicts' | 'context';
export type ClaimKind = 'source-statement' | 'interpretation' | 'synthesis' | 'calculation' | 'proposal';
export type ClaimStatus = 'reviewed' | 'draft' | 'needs-review' | 'withdrawn';
export type ReviewKind = 'agent-source-check' | 'human-source-check' | 'human-editorial-review' | 'human-expert-review' | 'not-reviewed';
export type AccessStatus = 'public-html-inspected' | 'public-passages-inspected' | 'public-full-text-inspected' | 'licensed-full-text-inspected' | 'metadata-only' | 'unavailable';

export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  version: string;
  publisher: string;
  accessedAt: string;
  accessStatus: AccessStatus;
  rights: string;
  preservation: string;
  artifact?: { sha256: string; pageCount?: number; resolvedUrl: string; mediaType: string };
  reading?: { status: 'selected-passages' | 'web-sections' | 'metadata-only'; scope: string; checkedAt: string; readingId?: string };
}

export interface EvidenceAppraisalRecord {
  basis: string;
  limitations: string[];
  independence: string;
  methodologicalScope: string;
  reviewKind: ReviewKind;
  checkedAt: string;
}

export interface EvidenceRecord {
  id: string;
  sourceId: string;
  locator: string;
  summary: string;
  relation?: EvidenceRelation;
  appraisal?: EvidenceAppraisalRecord;
  readingId?: string;
  passageId?: string;
}

export interface ClaimRecord {
  id: string;
  text: string;
  kind: ClaimKind;
  scope: string;
  evidenceIds: string[];
  evidenceLinks?: { evidenceId: string; relation: EvidenceRelation; rationale: string }[];
  premiseIds: string[];
  conceptIds: string[];
  mappingIds?: string[];
  status: ClaimStatus;
  reviewedAt?: string | null;
  reviewKind: ReviewKind;
  caveats: string[];
  reasoning?: string;
}

export interface Catalog {
  schemaVersion: 1;
  sources: SourceRecord[];
  evidence: EvidenceRecord[];
  claims: ClaimRecord[];
  concepts: { id: string; label: string; english: string; definitionClaimIds: string[]; aliases: string[] }[];
  mappings: { id: string; from: string; to: string; relation: string; conditions: string[]; claimIds: string[] }[];
  coverage: { id: string; title: string; status: string; notes: string }[];
}

export interface ClaimEvidenceRecord {
  evidence: EvidenceRecord;
  relation: EvidenceRelation;
  rationale: string | null;
  legacy: boolean;
}

// The projection validates the runtime catalog before renderers use these types.
export const catalog = publicCatalog(rawCatalog) as Catalog;

export function getClaimEvidence(data: Catalog, claim: ClaimRecord): ClaimEvidenceRecord[] {
  return resolveClaimEvidence(data, claim) as ClaimEvidenceRecord[];
}

/** Only membership is exposed, so unpublished text never enters a renderer. */
export function isKnownClaim(id: string): boolean {
  return rawCatalog.claims.some(claim => claim.id === id);
}

export default catalog;
