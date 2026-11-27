import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { ReferencesTabs } from '@/components/references-tabs';
import { EvidencePassage, SourceReading } from '@/components/evidence';
import { enClaimsMap } from '@/components/en-chapter-content';
import {
  formatZhReaderLocator,
  getEnEvidenceLocator,
  getEnSourcePublisher,
  getEnSourceTitle,
  getEnSourceVersion,
} from '@/lib/en-citation-format';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';
import catalog, { getClaimEvidence } from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: `${UI_SURFACES.references.en} — Citation Locators`,
      description: 'Primary source versions, passage-level citation locators, and linked English notes.',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: `${UI_SURFACES.references.zh} — 引文定位` };
}

export default async function LocalizedSourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const evidenceBySource = new Map<string, typeof catalog.evidence>();
  for (const item of catalog.evidence) {
    const group = evidenceBySource.get(item.sourceId);
    if (group) group.push(item);
    else evidenceBySource.set(item.sourceId, [item]);
  }
  const claimsByEvidence = new Map<string, typeof catalog.claims>();
  for (const claim of catalog.claims) {
    const seen = new Set<string>();
    for (const { evidence } of getClaimEvidence(catalog, claim)) {
      if (seen.has(evidence.id)) continue;
      seen.add(evidence.id);
      const group = claimsByEvidence.get(evidence.id);
      if (group) group.push(claim);
      else claimsByEvidence.set(evidence.id, [claim]);
    }
  }

  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        title={UI_SURFACES.references.en}
        description="Exact editions, passage-level citation locators, and linked notes across all primary sources."
      >
        <ReferencesTabs active="sources" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} prefix="/en" lang="en" />
        <p>
          Historical reports, methodological papers, standards, and software documentation serve distinct roles. Citations retain their original
          publication year and context; different editions or reprint texts of the same work cannot be substituted for one another by title alone.
        </p>
        <div className="record-list" style={{ overflowWrap: 'anywhere' }}>
          {catalog.sources.map(source => (
            <article className="source-record" id={source.id} key={source.id}>
              <h2><a href={source.url} rel="noreferrer">{getEnSourceTitle(source)}</a></h2>
              <p>{getEnSourcePublisher(source)}. {getEnSourceVersion(source)}.</p>
              <p className="subtle">Accessed: {source.accessedAt}</p>
              {(evidenceBySource.get(source.id) ?? []).map(evidence => (
                <section className="evidence-item" id={evidence.id} key={evidence.id}>
                  <h3>{getEnEvidenceLocator(evidence)}</h3>
                  <details>
                    <summary>Related notes ({(claimsByEvidence.get(evidence.id) ?? []).length})</summary>
                    <ul>
                      {(claimsByEvidence.get(evidence.id) ?? []).map(claim => (
                        <li key={claim.id}>
                          <Link href={`/en/claims/#${claim.id}`}>{enClaimsMap[claim.id]?.text ?? claim.text}</Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </section>
              ))}
            </article>
          ))}
        </div>
      </PublicationShell>
    );
  }

  return <PublicationShell title={UI_SURFACES.references.zh} description="文献的具体版本、引用位置与相应注释。">
    <ReferencesTabs active="sources" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} prefix="/zh" />
    <p>历史报告、方法论文、指南和软件文档各有用途。引文保留各自的年代与语境；不同版本或同一作品的不同文本，不能仅凭名称相同互相替代。</p>
    <div className="record-list">{catalog.sources.map(source => <article className="source-record" id={source.id} key={source.id}>
      <h2><a href={source.url} rel="noreferrer">{source.title}</a></h2>
      <p>{source.publisher}。{formatZhReaderLocator(source.version)}。</p><p className="subtle">网页访问日期：{source.accessedAt}</p>
      <SourceReading source={source} />
      {(evidenceBySource.get(source.id) ?? []).map(evidence => <section className="evidence-item" id={evidence.id} key={evidence.id}>
        <h3>{formatZhReaderLocator(evidence.locator)}</h3><p>{formatZhReaderLocator(evidence.summary)}</p><EvidencePassage evidence={evidence} />
        <details><summary>相关论述</summary><ul>{(claimsByEvidence.get(evidence.id) ?? []).map(claim => <li key={claim.id}><Link href={`/zh/claims/#${claim.id}`}>{claim.text}</Link></li>)}</ul></details>
      </section>)}
    </article>)}</div>
  </PublicationShell>;
}
