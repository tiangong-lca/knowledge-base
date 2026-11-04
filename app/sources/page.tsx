import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { EvidencePassage, SourceReading } from '@/components/evidence';
import catalog, { getClaimEvidence } from '@/lib/catalog';
export const metadata = { title: '引文出处' };
export default function Page() {
  return <PublicationShell title="引文出处" description="文献的具体版本、引用位置与相应论证。">
    <p>历史报告、方法论文、指南和软件文档各有用途。引文保留各自的年代与语境；不同版本或同一作品的不同文本，不能仅凭名称相同互相替代。</p>
    <div className="record-list">{catalog.sources.map(source => <article className="source-record" id={source.id} key={source.id}>
      <h2><a href={source.url} rel="noreferrer">{source.title}</a></h2>
      <p>{source.publisher}。{source.version}。</p><p className="subtle">网页访问日期：{source.accessedAt}</p>
      <SourceReading source={source} /><details><summary>使用与保存说明</summary><p>{source.rights}</p><p>{source.preservation}</p></details>
      {catalog.evidence.filter(item => item.sourceId === source.id).map(evidence => <section className="evidence-item" id={evidence.id} key={evidence.id}>
        <h3>{evidence.locator}</h3><p>{evidence.summary}</p><EvidencePassage evidence={evidence} />
        <details><summary>相关论述</summary><ul>{catalog.claims.filter(claim => getClaimEvidence(catalog, claim).some(item => item.evidence.id === evidence.id)).map(claim => <li key={claim.id}><Link href={`/claims/#${claim.id}`}>{claim.text}</Link></li>)}</ul></details>
      </section>)}
    </article>)}</div>
  </PublicationShell>;
}
