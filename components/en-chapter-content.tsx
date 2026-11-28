import Link from 'next/link';
import catalog, { getClaimEvidence } from '@/lib/catalog';
import enClaimsFile from '@/knowledge/editions/en/claims.json';
import enNotesFile from '@/knowledge/editions/en/notes.json';
import { getMDXComponents } from '@/mdx-components';
import { TeachingCase } from '@/components/teaching-case';
import { LcaTimeline } from '@/components/lca-timeline';
import {
  EN_CLAIM_KINDS,
  EN_EVIDENCE_RELATIONS,
  formatEnConceptTitle,
  getEnEvidenceLocator,
  getEnSourceTitle,
  getEnSourceVersion,
} from '@/lib/en-citation-format';
import { formatMathNotation } from '@/scripts/reader-math-notation.mjs';
import { NumberedTitle } from '@/components/numbered-heading';
import { getEnSectionPrefix, getPresentationUnits, getUnitNumbering } from '@/lib/reader-numbering';
import { logicalPageUrl, type ReaderPage } from '@/lib/reader-book';
import { getSource } from '@/lib/source';
import { loadShiftEvaluationFile } from '@/scripts/reader-load-shift.mjs';
import { serviceConstraintsEvaluationFile } from '@/scripts/reader-service-constraints.mjs';

export interface EnClaimEntry {
  id: string;
  status: string;
  zhDigest?: string;
  text: string;
  scope?: string;
  caveats?: string[];
  reviewedAt?: string;
}

interface EnNoteEntry {
  id: string;
  unitId: string;
  locale: 'en';
  status?: string;
  title: string;
  text: string;
  evidenceIds: string[];
}

const enClaimsList = (enClaimsFile.claims ?? []) as EnClaimEntry[];
export const enClaimsMap: Record<string, EnClaimEntry> = Object.fromEntries(
  enClaimsList.map(c => [c.id, c]),
);
const enNotesList = (enNotesFile.notes ?? []) as EnNoteEntry[];
const enNotesById = new Map(enNotesList.map(n => [n.id, n]));

const catalogClaims = new Map(catalog.claims.map(c => [c.id, c]));
const catalogSources = new Map(catalog.sources.map(s => [s.id, s]));
const catalogConcepts = new Map(catalog.concepts.map(c => [c.id, c]));

function collectClaimOrder(raw: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of raw.matchAll(/<Prose\s+ids="([^"]+)"\s*\/>|<Claim\s+id="([^"]+)"\s*\/>/g)) {
    const ids = (match[1] ?? match[2] ?? '').trim().split(/\s+/).filter(Boolean);
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        ordered.push(id);
      }
    }
  }
  return ordered;
}

function enNoteAnchorPrefix(pageUrl: string, print: boolean): string {
  return print ? `en-print-${pageUrl.replace(/[^a-z0-9]+/gi, '-')}-` : 'en-claim-';
}

interface EnNoteLocation {
  href: string;
  label: string;
}

const enRefIndexCache = new Map<boolean, Promise<Map<string, EnNoteLocation>>>();

async function buildEnChapterReferenceIndex(print: boolean): Promise<Map<string, EnNoteLocation>> {
  const pagesByKey = new Map<string, ReaderPage>(
    getSource('en').getPages().map(p => [logicalPageUrl(p.url), p as ReaderPage]),
  );
  const units = getPresentationUnits(print ? 'book' : 'web');
  const index = new Map<string, EnNoteLocation>();
  const orderedPages: ReaderPage[] = [];
  const seenUrls = new Set<string>();

  for (const unit of units) {
    const routeKey = unit.source ?? unit.key;
    const p = pagesByKey.get(routeKey);
    if (p && !seenUrls.has(p.url)) {
      seenUrls.add(p.url);
      orderedPages.push(p);
    }
  }
  for (const p of pagesByKey.values()) {
    if (!seenUrls.has(p.url)) {
      seenUrls.add(p.url);
      orderedPages.push(p);
    }
  }

  const rawList = await Promise.all(
    orderedPages.map(async p => ({ page: p, raw: await p.data.getText('raw') })),
  );
  for (const { page, raw } of rawList) {
    const order = collectClaimOrder(raw);
    const prefix = enNoteAnchorPrefix(page.url, print);
    const cleanWebPath = page.url.endsWith('/') ? page.url : `${page.url}/`;
    order.forEach((claimId, idx) => {
      if (!index.has(claimId)) {
        const href = print ? `#${prefix}${claimId}` : `${cleanWebPath}#${prefix}${claimId}`;
        index.set(claimId, { href, label: `${page.data.title}, Note ${idx + 1}` });
      }
    });
  }
  return index;
}

function getEnChapterReferenceIndex(print: boolean): Promise<Map<string, EnNoteLocation>> {
  if (process.env.NODE_ENV !== 'production') return buildEnChapterReferenceIndex(print);
  const cached = enRefIndexCache.get(print);
  if (cached) return cached;
  const pending = buildEnChapterReferenceIndex(print).catch(err => {
    enRefIndexCache.delete(print);
    throw err;
  });
  enRefIndexCache.set(print, pending);
  return pending;
}

export async function EnChapterContent({ page, print = false }: { page: ReaderPage; print?: boolean }) {
  const raw = await page.data.getText('raw');
  const noteOrder = collectClaimOrder(raw);
  const noteNumberById = new Map(noteOrder.map((id, idx) => [id, idx + 1]));
  const noteAnchorPrefix = enNoteAnchorPrefix(page.url, print);
  const crossChapterRefs = await getEnChapterReferenceIndex(print);

  for (const id of noteOrder) {
    const canonical = catalogClaims.get(id);
    if (!canonical || canonical.status !== 'reviewed') {
      throw new Error(`English chapter references unreviewed or unknown canonical claim: ${id}`);
    }
    if (!enClaimsMap[id]?.text) {
      throw new Error(`English chapter claim missing in knowledge/editions/en/claims.json: ${id}`);
    }
  }

  function Paragraph({ id }: { id: string }) {
    const enClaim = enClaimsMap[id];
    const num = noteNumberById.get(id);
    if (!enClaim || !num) {
      throw new Error(`English claim missing from note map: ${id}`);
    }
    return (
      <p>
        {formatMathNotation(enClaim.text)}
        <sup className="prose-references">
          <Link href={`#${noteAnchorPrefix}${id}`} role="doc-noteref" aria-label={`Note ${num}`}>
            [{num}]
          </Link>
        </sup>
      </p>
    );
  }

  function ChapterProse({ ids }: { ids: string }) {
    return (
      <div className="scholarly-prose">
        {ids.trim().split(/\s+/).filter(Boolean).map((id, idx) => (
          <Paragraph key={`${id}-${idx}`} id={id} />
        ))}
      </div>
    );
  }

  function ReaderSection({ id }: { id: string }) {
    return <span id={print ? `${noteAnchorPrefix}${id}` : id} className="reader-section-target" />;
  }

  function ReaderFigure(props: React.HTMLAttributes<HTMLElement>) {
    return <figure {...props} />;
  }

  function EnSourceRef({ id }: { id: string }) {
    const source = catalogSources.get(id);
    if (!source) throw new Error(`Unknown source: ${id}`);
    return <Link href={`/en/sources/#${id}`}>{getEnSourceTitle(source)}</Link>;
  }

  function EnConceptRef({ id }: { id: string }) {
    const concept = catalogConcepts.get(id);
    if (!concept) throw new Error(`Unknown concept: ${id}`);
    return <Link href={`/en/concepts/#${id}`}>{formatEnConceptTitle(concept.english || concept.label)}</Link>;
  }

  function EnLcaTimeline(props: Omit<Parameters<typeof LcaTimeline>[0], 'lang'>) {
    return <LcaTimeline {...props} lang="en" />;
  }

  function EditionNote({ id }: { id: string }) {
    const note = enNotesById.get(id);
    if (!note) throw new Error(`Unknown English edition note: ${id}`);
    return (
      <aside
        data-edition-note={id}
        data-edition-locale="en"
        style={{
          margin: '1.25rem 0',
          padding: '0.9rem 1.1rem',
          borderLeft: '3px solid var(--color-fd-primary)',
          background: 'var(--color-fd-secondary)',
          borderRadius: '0 0.5rem 0.5rem 0',
        }}
      >
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', fontWeight: 600, opacity: 0.8 }}>
          Note · {note.title}
        </p>
        <p style={{ margin: 0 }}>{formatMathNotation(note.text)}</p>
      </aside>
    );
  }

  function EnTeachingCase(props: Omit<Parameters<typeof TeachingCase>[0], 'lang'>) {
    return <TeachingCase {...props} print={print} lang="en" />;
  }

  const MDX = page.data.body;
  const logicalUrl = page.url.replace(/^\/en(?=\/|$)/, '') || '/';
  const unit = getUnitNumbering('web', logicalUrl);
  const sectionPrefix = getEnSectionPrefix(unit);
  let h2Counter = 0;
  let h3Counter = 0;

  function EnH2({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    h2Counter += 1;
    h3Counter = 0;
    const num = sectionPrefix ? `${sectionPrefix}.${h2Counter}` : `${h2Counter}`;
    if (print) {
      return (
        <h4 {...props} id={props.id ? `${noteAnchorPrefix}${props.id}` : undefined}>
          <NumberedTitle number={num}>{children}</NumberedTitle>
        </h4>
      );
    }
    return (
      <h2 {...props}>
        <NumberedTitle number={num}>{children}</NumberedTitle>
      </h2>
    );
  }

  function EnH3({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    h3Counter += 1;
    const num = h2Counter > 0 ? (sectionPrefix ? `${sectionPrefix}.${h2Counter}.${h3Counter}` : `${h2Counter}.${h3Counter}`) : undefined;
    if (print) {
      return (
        <h5 {...props} id={props.id ? `${noteAnchorPrefix}${props.id}` : undefined}>
          <NumberedTitle number={num}>{children}</NumberedTitle>
        </h5>
      );
    }
    return (
      <h3 {...props}>
        <NumberedTitle number={num}>{children}</NumberedTitle>
      </h3>
    );
  }

  const NotesHeading = print ? 'h4' : 'h2';
  const sectionIds = new Set<string>();
  for (const m of raw.matchAll(/^#{2,6}\s+.*?\[#([^\]]+)\]/gm)) sectionIds.add(m[1]);
  for (const m of raw.matchAll(/<ReaderSection\s+id="([^"]+)"/g)) sectionIds.add(m[1]);

  function EnReaderLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    const resolvedHref = print && href && href.startsWith('#') && sectionIds.has(href.slice(1))
      ? `#${noteAnchorPrefix}${href.slice(1)}`
      : href;
    return <a {...props} href={resolvedHref}>{children}</a>;
  }

  const seenCaseInputs = new Set<string>();

  return (
    <>
      <MDX
        components={getMDXComponents(
          {
            h2: EnH2,
            h3: EnH3,
            a: EnReaderLink,
            Prose: ChapterProse,
            Claim: Paragraph,
            ReaderSection,
            ReaderFigure,
            SourceRef: EnSourceRef,
            ConceptRef: EnConceptRef,
            LcaTimeline: EnLcaTimeline,
            EditionNote,
            TeachingCase: EnTeachingCase,
          },
          'en',
        )}
      />

      {noteOrder.length > 0 && (
        <section className="chapter-notes not-prose" aria-labelledby={`${noteAnchorPrefix}notes`}>
          <NotesHeading id={`${noteAnchorPrefix}notes`}>Notes</NotesHeading>
          <ol>
            {noteOrder.map(id => {
              const canonical = catalogClaims.get(id)!;
              const enClaim = enClaimsMap[id]!;
              const claimEvidence = getClaimEvidence(catalog, canonical);
              const binding = canonical.caseBinding;
              const inputKey = binding?.inputFile
                ? JSON.stringify([binding.caseId, binding.version, binding.inputSha256, binding.inputFile])
                : null;
              const showCaseInput = inputKey !== null && !seenCaseInputs.has(inputKey);
              if (inputKey !== null) seenCaseInputs.add(inputKey);
              const evaluation = binding
                ? (serviceConstraintsEvaluationFile(binding) ?? loadShiftEvaluationFile(binding))
                : null;

              return (
                <li key={id} id={`${noteAnchorPrefix}${id}`} data-en-claim={id}>
                  <p>
                    <strong>{EN_CLAIM_KINDS[canonical.kind]}.</strong>{' '}
                    {formatMathNotation(enClaim.scope ?? '')}
                  </p>
                  {claimEvidence.length > 0 && (
                    <ul>
                      {claimEvidence.map(({ evidence: ev, relation }) => {
                        const src = catalogSources.get(ev.sourceId);
                        if (!src) return null;
                        const ver = getEnSourceVersion(src);
                        return (
                          <li key={ev.id}>
                            <Link href={`/en/sources/#${ev.id}`}>{getEnSourceTitle(src)}</Link>
                            {ver ? ` (${ver})` : ''} — {getEnEvidenceLocator(ev)}
                            {relation !== 'supports' && <span> ({EN_EVIDENCE_RELATIONS[relation]})</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {enClaim.caveats && enClaim.caveats.length > 0 && (
                    <p>
                      <strong>Caveats:</strong> {formatMathNotation(enClaim.caveats.join(' '))}
                    </p>
                  )}
                  {canonical.premiseIds.length > 0 && (
                    <details>
                      <summary>Premises referenced ({canonical.premiseIds.length})</summary>
                      <ul>
                        {canonical.premiseIds.map(premId => {
                          const localNum = noteNumberById.get(premId);
                          if (localNum) {
                            return (
                              <li key={premId}>
                                <a href={`#${noteAnchorPrefix}${premId}`}>Chapter Note {localNum}</a>
                              </li>
                            );
                          }
                          const ref = crossChapterRefs.get(premId);
                          if (ref) {
                            return (
                              <li key={premId}>
                                <Link href={ref.href}>{ref.label}</Link>
                              </li>
                            );
                          }
                          const fallbackLabels: Record<string, string> = {
                            'cl-ipcc-ar6-2025-co2-gwp100': 'IPCC AR6 WGI Table 7.15 — CO2 GWP100',
                            'cl-ipcc-ar6-2025-fossil-ch4-gwp100': 'IPCC AR6 WGI Table 7.15 — Fossil CH4 GWP100',
                            'cl-ipcc-ar6-gwp-definition': 'IPCC AR6 WGI — GWP100 Definition',
                          };
                          const fallbackLabel = fallbackLabels[premId] ?? enClaimsMap[premId]?.scope?.replace(/\.$/, '') ?? 'Referenced Note';
                          return (
                            <li key={premId}>
                              <Link href={`/en/claims/#${premId}`}>{formatMathNotation(fallbackLabel)}</Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  )}
                  {showCaseInput && binding?.inputFile && (
                    <p>
                      <a href={`/downloads/cases/${binding.inputFile}`} download={binding.inputFile}>
                        Download calculation input (v{binding.version})
                      </a>
                      {evaluation && (
                        <>
                          {' · '}
                          <a href={`/downloads/cases/${evaluation}`} download={evaluation}>
                            Download calculation results (v{binding.version})
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </>
  );
}
