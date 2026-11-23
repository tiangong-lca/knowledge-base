import Link from 'next/link';
import catalog from '@/lib/catalog';
import enClaimsFile from '@/knowledge/editions/en/claims.json';
import enNotesFile from '@/knowledge/editions/en/notes.json';
import { getMDXComponents } from '@/mdx-components';
import { TeachingCase } from '@/components/teaching-case';
import { LcaTimeline } from '@/components/lca-timeline';
import { formatEnBibliographicText, formatEnConceptTitle } from '@/lib/en-citation-format';
import type { ReaderPage } from '@/lib/reader-book';

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
const catalogEvidence = new Map(catalog.evidence.map(e => [e.id, e]));
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

export async function EnChapterContent({ page, print = false }: { page: ReaderPage; print?: boolean }) {
  const raw = await page.data.getText('raw');
  const noteOrder = collectClaimOrder(raw);
  const noteNumberById = new Map(noteOrder.map((id, idx) => [id, idx + 1]));
  const noteAnchorPrefix = print ? `en-print-${page.url.replace(/[^a-z0-9]+/gi, '-')}-` : 'en-claim-';

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
        {enClaim.text}
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
    return <Link href={`/en/sources/#${id}`}>{source.title}</Link>;
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
          English edition reader note · {note.title}
        </p>
        <p style={{ margin: 0 }}>{note.text}</p>
      </aside>
    );
  }

  function EnTeachingCase(props: Omit<Parameters<typeof TeachingCase>[0], 'lang'>) {
    return <TeachingCase {...props} lang="en" />;
  }

  const MDX = page.data.body;

  return (
    <>
      <MDX
        components={getMDXComponents(
          {
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
          <h2 id={`${noteAnchorPrefix}notes`}>Notes</h2>
          <ol>
            {noteOrder.map(id => {
              const canonical = catalogClaims.get(id)!;
              const enClaim = enClaimsMap[id]!;
              return (
                <li key={id} id={`${noteAnchorPrefix}${id}`} data-en-claim={id}>
                  {enClaim.scope && <p><strong>Scope:</strong> {enClaim.scope}</p>}
                  {canonical.evidenceIds.length > 0 && (
                    <ul>
                      {canonical.evidenceIds.map(evId => {
                        const ev = catalogEvidence.get(evId);
                        const src = ev ? catalogSources.get(ev.sourceId) : undefined;
                        if (!ev || !src) return null;
                        return (
                          <li key={evId}>
                            <Link href={`/en/sources/#${evId}`}>{src.title}</Link>
                            {src.version ? ` (${formatEnBibliographicText(src.version)})` : ''} — {formatEnBibliographicText(ev.locator)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {enClaim.caveats && enClaim.caveats.length > 0 && (
                    <p>
                      <strong>Caveats:</strong> {enClaim.caveats.join(' ')}
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
                          const premEn = enClaimsMap[premId];
                          const premZh = catalogClaims.get(premId);
                          return (
                            <li key={premId}>
                              <Link href={`/en/claims/#${premId}`}>
                                {premEn?.text ?? premZh?.text ?? premId}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
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
