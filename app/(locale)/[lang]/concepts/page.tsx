import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import { EnInPrepPage } from '@/components/en-in-prep-page';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import catalog from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'Concepts Index',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: '概念索引' };
}

export default async function LocalizedConceptsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  if (lang === 'en') {
    return (
      <EnInPrepPage
        title="Concepts Index"
        description="Core LCA concepts, cross-framework definitions, and conceptual mappings."
        zhHref="/zh/concepts/"
        zhLabel="View Chinese Concepts Index"
      />
    );
  }
  const conceptsById = new Map(catalog.concepts.map(c => [c.id, c]));
  const claimsById = new Map(catalog.claims.map(c => [c.id, c]));
  const mappingsByConcept = new Map<string, typeof catalog.mappings>();
  const addMapping = (conceptId: string, m: (typeof catalog.mappings)[number]) => {
    const group = mappingsByConcept.get(conceptId);
    if (group) group.push(m);
    else mappingsByConcept.set(conceptId, [m]);
  };
  for (const m of catalog.mappings) {
    addMapping(m.from, m);
    if (m.to !== m.from) addMapping(m.to, m);
  }
  return <PublicationShell title="概念索引" description="名称只是入口。概念的含义需要结合来源体系、版本、对象层次和适用边界理解。"><div className="concept-jump">{catalog.concepts.map(c => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}</div>{catalog.concepts.map(c => <article className="concept-record" id={c.id} key={c.id}><h2>{c.label}<span className="english-term">{c.english}</span></h2>{c.aliases.length > 0 && <p className="subtle">相关名称：{c.aliases.join('、')}</p>}{c.definitionClaimIds.map(id => <Claim id={id} key={id} />)}{(mappingsByConcept.get(c.id) ?? []).map(m => <aside className="mapping-record" key={m.id}><strong>概念关系：{({ related: '相关', overlaps: '部分重叠', broader: '范围更宽', narrower: '范围更窄', conditional: '条件对应', 'not-equivalent': '不能直接等同' } as Record<string, string>)[m.relation] ?? m.relation}</strong><p><a href={`#${m.from}`}>{conceptsById.get(m.from)?.label}</a> ／ <a href={`#${m.to}`}>{conceptsById.get(m.to)?.label}</a></p><p>{Array.isArray(m.conditions) ? m.conditions.map(text => text.replace(/[。；;\s]+$/, '')).join('；') : m.conditions}</p><p>{m.claimIds.map(id => <a key={id} href={`/zh/claims/#${id}`}>{claimsById.get(id)?.text} </a>)}</p></aside>)}</article>)}</PublicationShell>;
}
