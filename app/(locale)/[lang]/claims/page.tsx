import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import { enClaimsMap } from '@/components/en-chapter-content';
import {
  EN_CLAIM_KINDS,
  EN_EVIDENCE_RELATIONS,
  getEnEvidenceLocator,
  getEnSourceTitle,
  getEnSourceVersion,
} from '@/lib/en-citation-format';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import { formatMathNotation } from '@/scripts/reader-math-notation.mjs';
import { UI_SURFACES } from '@/lib/ui-glossary';
import catalog, { getClaimEvidence } from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: UI_SURFACES.chapterNotes.en,
      description: 'Chapter-end notes, primary-source citations, validity scopes, caveats, and premise links.',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: UI_SURFACES.chapterNotes.zh };
}

export default async function LocalizedClaimsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  if (lang === 'en') {
    const sourcesById = new Map(catalog.sources.map(s => [s.id, s]));
    const reviewedClaims = catalog.claims.filter(c => c.status === 'reviewed');
    return (
      <PublicationShell
        lang="en"
        title={UI_SURFACES.chapterNotes.en}
        description="Inspect primary-source evidence, inferential links, validity scopes, and caveats for every chapter note in the book."
      >
        <p>
          Within each chapter, notes are numbered in order of appearance; this index gathers all{' '}
          <strong>{reviewedClaims.length}</strong> notes across the book for cross-reference. Source statements,
          interpretations, syntheses, calculations, and analytical proposals rest on different evidentiary grounds and cannot substitute for one another.
        </p>
        {reviewedClaims.map(claim => {
          const enClaim = enClaimsMap[claim.id];
          const evidence = getClaimEvidence(catalog, claim);
          return (
            <section className="claim-block" id={claim.id} key={claim.id}>
              <blockquote className="claim-text">{formatMathNotation(enClaim?.text ?? claim.text)}</blockquote>
              <div className="claim-annotation">
                <p>
                  <strong>{EN_CLAIM_KINDS[claim.kind]}.</strong> {formatMathNotation(enClaim?.scope ?? claim.scope)}
                </p>
                {evidence.length > 0 && (
                  <ul className="annotation-sources">
                    {evidence.map(({ evidence: item, relation }) => {
                      const source = sourcesById.get(item.sourceId);
                      if (!source) return null;
                      const ver = getEnSourceVersion(source);
                      return (
                        <li key={item.id}>
                          <Link href={`/en/sources/#${item.id}`}>{getEnSourceTitle(source)}</Link>
                          {ver ? ` (${ver})` : ''} — {getEnEvidenceLocator(item)}
                          {relation !== 'supports' && <span> ({EN_EVIDENCE_RELATIONS[relation]})</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {enClaim?.caveats && enClaim.caveats.length > 0 && (
                  <p className="annotation-limits">{formatMathNotation(enClaim.caveats.join(' '))}</p>
                )}
                {claim.premiseIds.length > 0 && (
                  <details>
                    <summary>Premises referenced ({claim.premiseIds.length})</summary>
                    <ul>
                      {claim.premiseIds.map(premId => {
                        const premEn = enClaimsMap[premId];
                        return (
                          <li key={premId}>
                            <a href={`#${premId}`}>{formatMathNotation(premEn?.text ?? premId)}</a>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </div>
            </section>
          );
        })}
      </PublicationShell>
    );
  }
  return <PublicationShell title={UI_SURFACES.chapterNotes.zh} description="查阅各章注释的文献依据、推理联系和适用范围。">
    <p>各章注释按章内出现顺序编号；这里汇集全书论述，供交叉查阅。文献陈述、解释、综合论证、计算与分析建议具有不同的依据，不能互相替代。</p>
    {catalog.claims.filter(c => c.status === 'reviewed').map(c => <Claim id={c.id} anchor key={c.id} />)}
  </PublicationShell>;
}
