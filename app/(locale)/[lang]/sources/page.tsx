import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { ReferencesTabs } from '@/components/references-tabs';
import { EvidencePassage, SourceReading } from '@/components/evidence';
import { EnInPrepPage } from '@/components/en-in-prep-page';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import catalog, { getClaimEvidence } from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'References & Sources — Citation Locators',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: '参考文献与出处 — 引文定位' };
}

export default async function LocalizedSourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  if (lang === 'en') {
    return (
      <EnInPrepPage
        title="References & Sources — Citation Locators"
        description="Passage-level citation locators, summaries, and linked claims."
        zhHref="/zh/sources/"
        zhLabel="View Chinese Citation Locators"
      />
    );
  }
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
  return <PublicationShell title="参考文献与出处" description="文献的具体版本、引用位置与相应论证。">
    <ReferencesTabs active="sources" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} prefix="/zh" />
    <p>历史报告、方法论文、指南和软件文档各有用途。引文保留各自的年代与语境；不同版本或同一作品的不同文本，不能仅凭名称相同互相替代。</p>
    <div className="record-list">{catalog.sources.map(source => <article className="source-record" id={source.id} key={source.id}>
      <h2><a href={source.url} rel="noreferrer">{source.title}</a></h2>
      <p>{source.publisher}。{source.version}。</p><p className="subtle">网页访问日期：{source.accessedAt}</p>
      <SourceReading source={source} /><details><summary>使用与保存说明</summary><p>{source.rights}</p><p>{source.preservation}</p></details>
      {(evidenceBySource.get(source.id) ?? []).map(evidence => <section className="evidence-item" id={evidence.id} key={evidence.id}>
        <h3>{evidence.locator}</h3><p>{evidence.summary}</p><EvidencePassage evidence={evidence} />
        <details><summary>相关论述</summary><ul>{(claimsByEvidence.get(evidence.id) ?? []).map(claim => <li key={claim.id}><Link href={`/zh/claims/#${claim.id}`}>{claim.text}</Link></li>)}</ul></details>
      </section>)}
    </article>)}</div>
  </PublicationShell>;
}
