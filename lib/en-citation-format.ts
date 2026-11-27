import enBibliographyFile from '@/knowledge/editions/en/bibliography.json';
import type { ClaimKind, EvidenceRelation } from '@/lib/catalog';
import {
  formatZhReaderLocator,
  getEnEvidenceLocator as resolveEnEvidenceLocator,
  getEnPassageLocator as resolveEnPassageLocator,
  getEnPassagePrintedPages as resolveEnPassagePrintedPages,
  getEnSourcePublisher as resolveEnSourcePublisher,
  getEnSourceTitle as resolveEnSourceTitle,
  getEnSourceVersion as resolveEnSourceVersion,
} from '@/scripts/reader-citation-display.mjs';

interface EnBibliographyData {
  schemaVersion: number;
  sources: Record<string, { title?: string; publisher?: string; version?: string }>;
  evidence: Record<string, { locator?: string }>;
  passages: Record<string, { locator?: string; printedPages?: string }>;
}

const enBib = enBibliographyFile as EnBibliographyData;

export const EN_CLAIM_KINDS: Record<ClaimKind, string> = {
  'source-statement': 'Source statement',
  interpretation: 'Interpretation',
  synthesis: 'Synthesis',
  calculation: 'Calculation',
  proposal: 'Analytical proposal',
};

export const EN_EVIDENCE_RELATIONS: Record<EvidenceRelation, string> = {
  supports: 'supports',
  qualifies: 'qualifies',
  contradicts: 'contradicts',
  context: 'context',
};

export { formatZhReaderLocator };

export function getEnSourceTitle(source: { id: string; title: string }): string {
  return resolveEnSourceTitle(source, enBib);
}

export function getEnSourcePublisher(source: { id: string; publisher?: string }): string {
  return resolveEnSourcePublisher(source, enBib);
}

export function getEnSourceVersion(source: { id: string; version?: string }): string {
  return resolveEnSourceVersion(source, enBib);
}

export function getEnEvidenceLocator(evidence: { id: string; locator: string }): string {
  return resolveEnEvidenceLocator(evidence, enBib);
}

export function getEnPassageLocator(passage: { id: string; locator: string }): string {
  return resolveEnPassageLocator(passage, enBib);
}

export function getEnPassagePrintedPages(passage: { id: string; printedPages?: string }): string {
  return resolveEnPassagePrintedPages(passage, enBib);
}

export function formatEnConceptTitle(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw
    .replace(/\bthe1974container\b/g, 'the 1974 container')
    .replace(/\bthe1974REPA\b/g, 'the 1974 REPA')
    .replace(/([a-z])(19\d\d|20\d\d)([A-Za-z])/g, '$1 $2 $3');
}
