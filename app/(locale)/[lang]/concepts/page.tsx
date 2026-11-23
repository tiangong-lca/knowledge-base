import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import { enClaimsMap } from '@/components/en-chapter-content';
import enMappingsFile from '@/knowledge/editions/en/mappings.json';
import { formatEnConceptTitle } from '@/lib/en-citation-format';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import catalog from '@/lib/catalog';

const enMappingConditions = (enMappingsFile.mappings ?? {}) as Record<string, string[]>;

const EN_RELATIONS: Record<string, string> = {
  related: 'Related',
  overlaps: 'Partially overlaps',
  broader: 'Broader scope',
  narrower: 'Narrower scope',
  conditional: 'Conditional correspondence',
  'not-equivalent': 'Not directly equivalent',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'Concepts Index',
      description: 'Core LCA concepts, cross-framework definitions, and conceptual mappings.',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: '概念索引' };
}

export default async function LocalizedConceptsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
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

  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        title="Concepts Index"
        description="Names are only entry points. Each concept's meaning depends on its source framework, version, object level, and scope of applicability."
      >
        <div className="concept-jump">
          {catalog.concepts.map(c => (
            <a key={c.id} href={`#${c.id}`}>{formatEnConceptTitle(c.english || c.label)}</a>
          ))}
        </div>
        {catalog.concepts.map(c => (
          <article className="concept-record" id={c.id} key={c.id}>
            <h2>
              {formatEnConceptTitle(c.english || c.label)}
              <span className="english-term">{c.label}</span>
            </h2>
            {c.definitionClaimIds.map(id => {
              const enClaim = enClaimsMap[id];
              return (
                <div className="concept-definition" key={id}>
                  <p className="claim-text">{enClaim?.text ?? claimsById.get(id)?.text}</p>
                  {enClaim?.scope && (
                    <p className="subtle">
                      <strong>Scope:</strong> {enClaim.scope}{' '}
                      <Link href={`/en/claims/#${id}`}>View full note &amp; sources →</Link>
                    </p>
                  )}
                </div>
              );
            })}
            {(mappingsByConcept.get(c.id) ?? []).map(m => {
              const fromConcept = conceptsById.get(m.from);
              const toConcept = conceptsById.get(m.to);
              const conditions = enMappingConditions[m.id];
              return (
                <aside className="mapping-record" key={m.id}>
                  <strong>Concept relation: {EN_RELATIONS[m.relation] ?? m.relation}</strong>
                  <p>
                    <a href={`#${m.from}`}>{formatEnConceptTitle(fromConcept?.english || fromConcept?.label)}</a> /{' '}
                    <a href={`#${m.to}`}>{formatEnConceptTitle(toConcept?.english || toConcept?.label)}</a>
                  </p>
                  {conditions && conditions.length > 0 && (
                    <p>{conditions.join(' ')}</p>
                  )}
                  <p>
                    {m.claimIds.map(id => (
                      <Link key={id} href={`/en/claims/#${id}`}>
                        {enClaimsMap[id]?.text ?? claimsById.get(id)?.text}{' '}
                      </Link>
                    ))}
                  </p>
                </aside>
              );
            })}
          </article>
        ))}
      </PublicationShell>
    );
  }

  return <PublicationShell title="概念索引" description="名称只是入口。概念的含义需要结合来源体系、版本、对象层次和适用边界理解。"><div className="concept-jump">{catalog.concepts.map(c => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}</div>{catalog.concepts.map(c => <article className="concept-record" id={c.id} key={c.id}><h2>{c.label}<span className="english-term">{c.english}</span></h2>{c.aliases.length > 0 && <p className="subtle">相关名称：{c.aliases.join('、')}</p>}{c.definitionClaimIds.map(id => <Claim id={id} key={id} />)}{(mappingsByConcept.get(c.id) ?? []).map(m => <aside className="mapping-record" key={m.id}><strong>概念关系：{({ related: '相关', overlaps: '部分重叠', broader: '范围更宽', narrower: '范围更窄', conditional: '条件对应', 'not-equivalent': '不能直接等同' } as Record<string, string>)[m.relation] ?? m.relation}</strong><p><a href={`#${m.from}`}>{conceptsById.get(m.from)?.label}</a> ／ <a href={`#${m.to}`}>{conceptsById.get(m.to)?.label}</a></p><p>{Array.isArray(m.conditions) ? m.conditions.map(text => text.replace(/[。；;\s]+$/, '')).join('；') : m.conditions}</p><p>{m.claimIds.map(id => <a key={id} href={`/zh/claims/#${id}`}>{claimsById.get(id)?.text} </a>)}</p></aside>)}</article>)}</PublicationShell>;
}
