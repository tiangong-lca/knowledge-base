import Link from 'next/link';
import rawMap from '@/knowledge/research/literature-map.json';
import rawLedger from '@/knowledge/research/readings.json';
import { publicResearch } from '@/scripts/research.mjs';
import catalog, { getClaimEvidence, isKnownClaim } from '@/lib/catalog';
import type { ClaimKind, EvidenceRecord, EvidenceAppraisalRecord, EvidenceRelation, ReviewKind, SourceRecord } from '@/lib/catalog';

const kinds: Record<ClaimKind, string> = { 'source-statement': '来源陈述', interpretation: '解释', synthesis: '综合判断', calculation: '计算', proposal: '建议' };
export const evidenceRelations: Record<EvidenceRelation, string> = { supports: '支持', qualifies: '限定', contradicts: '反对', context: '背景' };
const reviewKinds: Record<ReviewKind, string> = {
  'agent-source-check': 'AI 辅助来源核查',
  'human-source-check': '人工来源核查',
  'human-editorial-review': '人工编辑复核',
  'human-expert-review': '专家复核',
  'not-reviewed': '尚未复核',
};

function ReviewNotice() {
  return <aside className="review-notice">此观点正在复核，详见版本与勘误记录。</aside>;
}

export function SourceRef({ id }: { id: string }) {
  const source = catalog.sources.find(item => item.id === id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return <Link href={`/sources/#${id}`}>{source.title}</Link>;
}

export function ConceptRef({ id }: { id: string }) {
  const concept = catalog.concepts.find(item => item.id === id);
  if (!concept) throw new Error(`Unknown concept: ${id}`);
  return <Link href={`/concepts/#${id}`}>{concept.label}</Link>;
}

export function SourceReading({ source }: { source: SourceRecord }) {
  if (!source.reading && !source.artifact) return null;
  return <dl className="source-reading">
    {source.reading && <>
      <dt>核读范围</dt><dd>{source.reading.scope}</dd>
      <dt>核读状态</dt><dd>{{ 'selected-passages': '选定段落核读', 'web-sections': '网页选定章节核读', 'metadata-only': '仅核对元数据' }[source.reading.status]}</dd>
      <dt>核读记录日期</dt><dd>{source.reading.checkedAt}</dd>
      {source.reading.readingId && <><dt>核读记录</dt><dd><Link href={`/research/#${source.reading.readingId}`}>{source.reading.readingId}</Link></dd></>}
    </>}
    {source.artifact && <>
      <dt>核对文件</dt><dd><a href={source.artifact.resolvedUrl}>所核文件</a> · {source.artifact.mediaType}{source.artifact.pageCount !== undefined && <> · {source.artifact.pageCount} 页</>}</dd>
      <dt>SHA-256</dt><dd><code className="artifact-hash">{source.artifact.sha256}</code></dd>
    </>}
  </dl>;
}

const readingLedger = publicResearch(rawMap, rawLedger).readingLedger as typeof rawLedger;
export function EvidencePassage({ evidence }: { evidence: EvidenceRecord }) {
  if (!evidence.readingId || !evidence.passageId) return null;
  const reading = readingLedger.readings.find(r => r.id === evidence.readingId);
  const passage = reading?.passages.find(p => p.id === evidence.passageId);
  const artifact = reading?.artifacts.find(a => a.id === passage?.artifactId);
  if (!passage || !artifact) throw new Error(`Unresolved evidence passage: ${evidence.id}`);
  return <details className="evidence-appraisal"><summary>这条证据使用的载体</summary>
    <p><Link href={`/research/#${passage.id}`}>阅读定位与限制</Link> · <a href={artifact.resolvedUrl}>原始载体</a> · {artifact.mediaType}</p>
    <p><code className="artifact-hash">{artifact.sha256}</code></p>
    <p>{passage.limits.join('；')}</p>
  </details>;
}

export function EvidenceAppraisal({ appraisal }: { appraisal?: EvidenceAppraisalRecord }) {
  if (!appraisal) return null;
  return <details className="evidence-appraisal">
    <summary>证据评估与限制</summary>
    <dl>
      <dt>评估依据</dt><dd>{appraisal.basis}</dd>
      <dt>适用范围</dt><dd>{appraisal.methodologicalScope}</dd>
      <dt>独立性</dt><dd>{appraisal.independence}</dd>
      {appraisal.limitations.length > 0 && <><dt>限制</dt><dd><ul>{appraisal.limitations.map(item => <li key={item}>{item}</li>)}</ul></dd></>}
      <dt>复核</dt><dd>{reviewKinds[appraisal.reviewKind]} · {appraisal.checkedAt}</dd>
    </dl>
  </details>;
}

/** Authored paragraphs resolve their text only from reviewed canonical claims. */
export function Prose({ ids }: { ids: string }) {
  const claimIds = ids.trim().split(/\s+/).filter(Boolean);
  return <div className="scholarly-prose">{claimIds.map((id, index) => {
    const claim = catalog.claims.find(item => item.id === id);
    if (!claim) {
      if (isKnownClaim(id)) return <ReviewNotice key={id} />;
      throw new Error(`Unknown claim: ${id}`);
    }
    if (claim.status !== 'reviewed') return <ReviewNotice key={id} />;
    const evidence = getClaimEvidence(catalog, claim);
    return <p key={id}>{claim.text}<sup className="prose-references">
      <Link href={`/claims/#${id}`} aria-label={`观点 ${index + 1}：${id}，依据与适用条件`} title={`${id} · ${kinds[claim.kind]}`}>[{index + 1}]</Link>
      {evidence.map(({ evidence: item, relation }, evidenceIndex) => <Link key={item.id} href={`/sources/#${item.id}`} aria-label={`观点 ${index + 1} 的证据 ${evidenceIndex + 1}：${evidenceRelations[relation]}，${item.locator}`} title={`${evidenceRelations[relation]} · ${item.locator}`}>[{index + 1}.{evidenceIndex + 1}]</Link>)}
    </sup></p>;
  })}</div>;
}

export function Claim({ id, anchor = false }: { id: string; anchor?: boolean }) {
  const claim = catalog.claims.find(item => item.id === id);
  if (!claim) {
    if (isKnownClaim(id)) return <ReviewNotice />;
    throw new Error(`Unknown claim: ${id}`);
  }
  if (claim.status !== 'reviewed') return <ReviewNotice />;
  const evidence = getClaimEvidence(catalog, claim);
  return <section className="claim-block" id={anchor ? id : undefined}>
    <div className="claim-label"><span>{kinds[claim.kind]}</span><Link href={`/claims/#${id}`}>{id}</Link></div>
    <p className="claim-text">{claim.text}</p>
    <details>
      <summary>查看依据与适用条件 <span>{evidence.length} 条证据</span></summary>
      <div className="evidence-detail">
        <p><strong>适用范围</strong> {claim.scope}</p>
        {evidence.map(({ evidence: item, relation, rationale }) => {
          const source = catalog.sources.find(record => record.id === item.sourceId);
          return <div key={item.id} className="evidence-item">
            <Link href={`/sources/#${item.id}`}>{source?.title ?? item.sourceId}</Link>
            {source && <a className="original-source" href={source.url}>原始来源</a>}
            <small>{item.locator}</small><p>{item.summary}</p>
            <p className="subtle">与本观点的关系：{evidenceRelations[relation]}</p>
            {rationale && <p><strong>关联理由</strong> {rationale}</p>}
            <EvidencePassage evidence={item} />
            <EvidenceAppraisal appraisal={item.appraisal} />
            {source && <SourceReading source={source} />}
          </div>;
        })}
        {claim.caveats.length > 0 && <p><strong>限制</strong> {claim.caveats.join('；')}</p>}
        {claim.reasoning && <p><strong>推理过程</strong> {claim.reasoning}</p>}
        {claim.premiseIds.length > 0 && <p><strong>依赖观点</strong> {claim.premiseIds.map(premise => <Link key={premise} href={`/claims/#${premise}`}>{premise} </Link>)}</p>}
        <small>证据复核：{claim.reviewedAt} · {reviewKinds[claim.reviewKind]}</small>
      </div>
    </details>
  </section>;
}
