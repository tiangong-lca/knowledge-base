import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { EvidenceAppraisal, EvidencePassage, evidenceRelations, SourceReading } from '@/components/evidence';
import catalog, { getClaimEvidence } from '@/lib/catalog';
import type { AccessStatus } from '@/lib/catalog';

export const metadata = { title: '来源与证据' };
const accessLabels: Record<AccessStatus, string> = {
  'public-html-inspected': '已核读公开网页',
  'public-passages-inspected': '已核读公开来源选定段落',
  'public-full-text-inspected': '已核读公开全文',
  'licensed-full-text-inspected': '已核读获许可全文',
  'metadata-only': '仅查阅元数据',
  unavailable: '暂不可访问',
};

export default function Page() {
  return <PublicationShell title="来源与证据" description="核查具体版本、原文位置与访问限制。来源记录保留实际核读范围。">
    <div className="record-list">{catalog.sources.map(source => <article className="source-record" id={source.id} key={source.id}>
      <div className="record-meta"><span>{source.id}</span><span>{accessLabels[source.accessStatus]}</span></div>
      <h2><a href={source.url} rel="noreferrer">{source.title}</a></h2>
      <p>{source.publisher} · {source.version}</p>
      <dl>
        <dt>访问日期</dt><dd>{source.accessedAt}</dd>
        <dt>使用权限</dt><dd>{source.rights}</dd>
        <dt>保存与复核限制</dt><dd>{source.preservation}</dd>
      </dl>
      <SourceReading source={source} />
      <h3>本文使用的证据</h3>
      {catalog.evidence.filter(item => item.sourceId === source.id).map(evidence => <div className="evidence-item" id={evidence.id} key={evidence.id}>
        <strong>{evidence.locator}</strong><p>{evidence.summary}</p>
        <EvidencePassage evidence={evidence} />
        <EvidenceAppraisal appraisal={evidence.appraisal} />
        <ul className="evidence-uses">{catalog.claims.flatMap(claim => getClaimEvidence(catalog, claim).filter(item => item.evidence.id === evidence.id).map(item => <li key={claim.id}>
          <Link href={`/claims/#${claim.id}`}>{claim.id}</Link><span>：{evidenceRelations[item.relation]}</span>
          {item.rationale && <p>{item.rationale}</p>}
        </li>))}</ul>
      </div>)}
    </article>)}</div>
  </PublicationShell>;
}
