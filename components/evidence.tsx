import Link from 'next/link';
import rawMap from '@/knowledge/research/literature-map.json';
import rawLedger from '@/knowledge/research/readings.json';
import { publicResearch } from '@/scripts/research.mjs';
import catalog, { getClaimEvidence, isKnownClaim } from '@/lib/catalog';
import type { ClaimKind, EvidenceRecord, EvidenceRelation, SourceRecord, SourceArtifact, ReadingLedger } from '@/lib/catalog';

const kinds: Record<ClaimKind, string> = { 'source-statement': '文献陈述', interpretation: '解释', synthesis: '综合论证', calculation: '计算', proposal: '分析建议' };
export const evidenceRelations: Record<EvidenceRelation, string> = { supports: '依据', qualifies: '适用条件', contradicts: '相反证据', context: '相关讨论' };
const readingLedger = publicResearch(rawMap, rawLedger).readingLedger as ReadingLedger;

function ReviewNotice() { return <aside className="review-notice">此处论述暂不提供，请参阅<a href="/changes/">勘误说明</a>。</aside>; }
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

/** Reader-facing citation identity; execution records and hashes remain in the editorial archive. */
export function ArtifactReading({ artifact }: { artifact: SourceArtifact }) {
  if (artifact.kind === 'derived-text') return <>
    <dt>引文依据</dt><dd><a href={artifact.originUrl}>官方文档</a>的文字摘录。原始 PDF 字节及表格图像未对照，引用限于所列文字与数值。</dd>
  </>;
  return <><dt>文献文本</dt><dd><a href={artifact.resolvedUrl}>查看引用版本</a></dd></>;
}
export function SourceReading({ source }: { source: SourceRecord }) {
  return source.artifact ? <dl className="source-reading"><ArtifactReading artifact={source.artifact} /></dl> : null;
}
export function EvidencePassage({ evidence }: { evidence: EvidenceRecord }) {
  if (!evidence.readingId || !evidence.passageId) return null;
  const reading = readingLedger.readings.find(r => r.id === evidence.readingId);
  const passage = reading?.passages.find(p => p.id === evidence.passageId);
  const artifact = reading?.artifacts.find(a => a.id === passage?.artifactId);
  if (!passage || !artifact) throw new Error(`Unresolved evidence passage: ${evidence.id}`);
  const sourceArtifact = catalog.sources.find(source => source.id === evidence.sourceId)?.artifact;
  if (artifact.kind !== 'derived-text' && sourceArtifact && sourceArtifact.kind !== 'derived-text'
    && artifact.sha256 === sourceArtifact.sha256 && artifact.resolvedUrl === sourceArtifact.resolvedUrl) return null;
  return <dl className="source-reading"><ArtifactReading artifact={artifact} /></dl>;
}
export function ClaimAnnotation({ id, showCaseInput = true, premiseReferences }: {
  id: string; showCaseInput?: boolean; premiseReferences?: Map<string, { href: string; label: string }>;
}) {
  const claim = catalog.claims.find(item => item.id === id);
  if (!claim) { if (isKnownClaim(id)) return <ReviewNotice />; throw new Error(`Unknown claim: ${id}`); }
  const evidence = getClaimEvidence(catalog, claim);
  return <div className="claim-annotation">
    <p><strong>{kinds[claim.kind]}。</strong> {claim.scope}</p>
    {evidence.length > 0 && <ul className="annotation-sources">{evidence.map(({ evidence: item, relation }) => {
      const source = catalog.sources.find(record => record.id === item.sourceId);
      if (!source) throw new Error(`Unknown citation source: ${item.sourceId}`);
      return <li key={item.id}><Link href={`/sources/#${item.id}`}>{source.title}</Link>。{item.locator}。
        {relation !== 'supports' && <span>（{evidenceRelations[relation]}）</span>}
        <EvidencePassage evidence={item} />
      </li>;
    })}</ul>}
    {claim.caveats.length > 0 && <p className="annotation-limits">{claim.caveats.map(text => text.replace(/[。；;\s]+$/, '')).join('；')}。</p>}
    {claim.premiseIds.length > 0 && <details><summary>论证联系</summary><ul>{claim.premiseIds.map(premise => {
      const linked = catalog.claims.find(c => c.id === premise);
      if (!linked) throw new Error(`Unknown premise: ${premise}`);
      const reference = premiseReferences?.get(premise);
      return <li key={premise}><Link href={reference?.href ?? `/claims/#${premise}`}>{reference?.label ?? linked.text}</Link></li>;
    })}</ul></details>}
    {showCaseInput && claim.caseBinding?.inputFile && <p><a href={`/downloads/cases/${claim.caseBinding.inputFile}`} download={claim.caseBinding.inputFile}>下载计算输入（版本 {claim.caseBinding.version}）</a></p>}
  </div>;
}

/** Fallback for non-chapter reference pages; chapters inject their own local note sequence. */
export function Prose({ ids }: { ids: string }) {
  return <div className="scholarly-prose">{ids.trim().split(/\s+/).filter(Boolean).map(id => {
    const index = catalog.claims.findIndex(item => item.id === id), claim = catalog.claims[index];
    if (!claim) { if (isKnownClaim(id)) return <ReviewNotice key={id} />; throw new Error(`Unknown claim: ${id}`); }
    if (claim.status !== 'reviewed') return <ReviewNotice key={id} />;
    return <p key={id}>{claim.text}<sup className="prose-references"><Link href={`/claims/#${id}`} aria-label="查看这段论述的出处与条件">注</Link></sup></p>;
  })}</div>;
}
export function Claim({ id, anchor = false }: { id: string; anchor?: boolean }) {
  const index = catalog.claims.findIndex(item => item.id === id), claim = catalog.claims[index];
  if (!claim) { if (isKnownClaim(id)) return <ReviewNotice />; throw new Error(`Unknown claim: ${id}`); }
  if (!anchor) return <div className="concept-definition"><p className="claim-text">{claim.text}</p><details><summary>出处与条件</summary><ClaimAnnotation id={id} /></details></div>;
  return <section className="claim-block" id={id}>
    <blockquote className="claim-text">{claim.text}</blockquote>
    <ClaimAnnotation id={id} />
  </section>;
}
