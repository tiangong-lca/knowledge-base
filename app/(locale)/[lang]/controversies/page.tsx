import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { enClaimsMap } from '@/components/en-chapter-content';
import { EN_PUBLIC_ENABLED, isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { localizedPageAlternates } from '@/lib/seo-policy.mjs';
import { readerGuideConfig } from '@/lib/reader-guide';
import enReaderGuide from '@/config/editions/en/reader-guide.json';
import controversiesData from '@/config/editions/controversies.json';
import alignment from '@/knowledge/editions/alignment.json';
import { EN_PARTS, UI_SURFACES } from '@/lib/ui-glossary';
import catalog from '@/lib/catalog';
import { getPresentationUnits, readerParts } from '@/scripts/reader-numbering.mjs';
import { collectChapterClaimOccurrences } from '@/scripts/reader-book.mjs';
import { formatMathNotation } from '@/scripts/reader-math-notation.mjs';

const sectionBlockStyle = { marginTop: '2.25rem' } as const;
const sectionHeaderStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '0.5rem',
  marginBottom: '0.75rem',
};
const sectionMetaStyle = { margin: 0, fontSize: '0.82rem', color: 'var(--kb-subtle)' } as const;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const alternates = localizedPageAlternates('/controversies', lang, EN_PUBLIC_ENABLED ? ['zh', 'en'] : ['zh']);
  if (lang === 'en') {
    const title = 'Controversies, Boundaries & Knowledge Gaps';
    const description = 'Part-by-part evidence boundaries, eight mainstream LCIA blind spots, ten value-choice reversal loci, seven targeted revision triggers, and qualified or caveated notes across the monograph.';
    return {
      title,
      description,
      alternates,
      openGraph: { title, description },
      twitter: { title, description },
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  const title = '争议、边界与知识缺口';
  const description = '集中呈现全书各部证据边界、八类主流 LCIA 共识盲区、十类规范性价值选择翻转点、七类定向修订触发器与全部限定注释。';
  return {
    title,
    description,
    alternates,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

interface UnitRecord {
  key: string;
  source: string;
  title: string;
  kind: string;
  part?: number;
  ordinal?: number;
  label?: string;
}

function buildClaimUnitIndex(units: UnitRecord[]) {
  const root = process.cwd();
  const claimToUnits = new Map<string, UnitRecord[]>();
  for (const unit of units) {
    const candidates = unit.source === '/docs'
      ? [join(root, 'content/docs/index.mdx')]
      : [
          join(root, `content${unit.source}.mdx`),
          join(root, `content${unit.source}/index.mdx`),
        ];
    const file = candidates.find(p => existsSync(p));
    if (!file) continue;
    const ids = [...new Set(collectChapterClaimOccurrences(readFileSync(file, 'utf8')))];
    for (const id of ids) {
      const list = claimToUnits.get(id) ?? [];
      list.push(unit);
      claimToUnits.set(id, list);
    }
  }
  return claimToUnits;
}

export default async function ControversiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const isEn = lang === 'en';
  const prefix = isEn ? '/en' : '/zh';

  const units = getPresentationUnits('web') as UnitRecord[];
  const unitByKey = new Map(units.map(u => [u.key, u]));
  const unitEntries = alignment.units as Record<string, { enTitle?: string }>;
  const claimToUnits = buildClaimUnitIndex(units);

  const reviewedClaims = catalog.claims.filter(c => c.status === 'reviewed');
  const qualifiesClaims = reviewedClaims.filter(c =>
    (c.evidenceLinks ?? []).some(link => link.relation === 'qualifies'),
  );
  const caveatClaims = reviewedClaims.filter(c => (c.caveats ?? []).length > 0);
  const qualifiesIdSet = new Set(qualifiesClaims.map(c => c.id));
  const overlapCount = caveatClaims.filter(c => qualifiesIdSet.has(c.id)).length;
  const distinctBoundedCount = qualifiesClaims.length + caveatClaims.length - overlapCount;

  const primaryPartOf = (claimId: string) => {
    const mapped = claimToUnits.get(claimId) ?? [];
    const firstChapter = mapped.find(u => u.kind === 'chapter' && typeof u.part === 'number');
    return firstChapter?.part ?? null;
  };

  const unitTitle = (route: string) => {
    const unit = unitByKey.get(route);
    if (isEn) {
      const enTitle = unitEntries[route]?.enTitle ?? unit?.title ?? route;
      return unit?.ordinal ? `Ch. ${unit.ordinal} · ${enTitle}` : enTitle;
    }
    return unit?.label ? `${unit.label}《${unit.title}》` : (unit?.title ?? route);
  };

  const partGroups = readerParts.map(part => {
    const partQualifies = qualifiesClaims.filter(c => primaryPartOf(c.id) === part.number);
    const partCaveats = caveatClaims.filter(c => primaryPartOf(c.id) === part.number);
    const gapsText = isEn
      ? ((enReaderGuide.partSummaries as Record<string, { gaps: string }>)[String(part.number)]?.gaps ?? '')
      : (readerGuideConfig.partSummaries[String(part.number)]?.gaps ?? '');
    const enMeta = EN_PARTS[part.number] ?? { label: `Part ${part.number}`, title: part.title };
    return {
      part,
      label: isEn ? enMeta.label : part.label,
      title: isEn ? enMeta.title : part.title,
      gapsText,
      partQualifies,
      partCaveats,
    };
  });

  const nonChapterQualifies = qualifiesClaims.filter(c => primaryPartOf(c.id) === null);
  const nonChapterCaveats = caveatClaims.filter(c => primaryPartOf(c.id) === null);

  const renderClaimListItem = (claim: (typeof reviewedClaims)[number]) => {
    const enClaim = enClaimsMap[claim.id];
    const displayText = formatMathNotation(isEn ? (enClaim?.text ?? claim.text) : claim.text);
    const caveats = isEn ? (enClaim?.caveats ?? []) : (claim.caveats ?? []);
    const primaryUnit = (claimToUnits.get(claim.id) ?? [])[0];
    return (
      <li key={claim.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--color-fd-border)' }}>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <Link href={`${prefix}/claims/#${claim.id}`} style={{ textDecoration: 'underline' }}>
            {displayText}
          </Link>
        </p>
        {caveats.length > 0 && (
          <p className="annotation-limits" style={{ margin: '0.2rem 0 0.25rem', fontSize: '0.82rem' }}>
            {formatMathNotation(caveats.join(isEn ? ' ' : ''))}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--kb-subtle)' }}>
          {primaryUnit ? (
            <Link href={`${prefix}${primaryUnit.key}/`} style={{ textDecoration: 'underline' }}>
              {unitTitle(primaryUnit.key)}
            </Link>
          ) : (
            <span>{isEn ? 'Shared reference note' : '共享参考注释'}</span>
          )}
          {' · '}
          <Link href={`${prefix}/claims/#${claim.id}`} style={{ textDecoration: 'underline' }}>
            {isEn ? 'Inspect full note' : '查看完整注释'}
          </Link>
        </p>
      </li>
    );
  };

  return (
    <PublicationShell
      lang={lang}
      logicalPath="/controversies/"
      title={isEn ? 'Controversies, Boundaries & Knowledge Gaps' : '争议、边界与知识缺口'}
      description={
        isEn
          ? 'A single cross-book map of unresolved methodological controversies, eight mainstream LCIA blind spots, ten decision-flipping value choices, seven targeted revision triggers, and every qualified or caveated note.'
          : '集中检索全书尚未形成单一共识的方法分歧、八类主流 LCIA 盲区、十类可致排序翻转的价值选择、七类定向修订触发器，以及各部证据边界与限定注释。'
      }
    >
      <div>
        {/* Summary Stats & Quick Navigation */}
        <section className="editorial-note" aria-label={isEn ? 'Overview summary' : '总览摘要'}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', lineHeight: 1.8 }}>
            {isEn ? (
              <>
                This index consolidates <strong>{readerParts.length}</strong> part-level evidence boundaries,{' '}
                <strong>{controversiesData.blindSpots.length}</strong> mainstream LCIA consensus blind spots,{' '}
                <strong>{controversiesData.valueChoices.length}</strong> normative value-choice loci,{' '}
                <strong>{controversiesData.revisionTriggers.length}</strong> targeted revision triggers,{' '}
                <strong>{qualifiesClaims.length}</strong> qualification-linked notes, and{' '}
                <strong>{caveatClaims.length}</strong> caveat-bearing notes (spanning{' '}
                <strong>{distinctBoundedCount}</strong> distinct notes, with {overlapCount} appearing in both sets)
                across the monograph&apos;s <strong>{reviewedClaims.length.toLocaleString('en-US')}</strong> chapter-end
                notes.
              </>
            ) : (
              <>
                本页汇总全书 <strong>{readerParts.length}</strong> 部证据边界、
                <strong>{controversiesData.blindSpots.length}</strong> 类主流生命周期影响评价（LCIA）共识盲区、
                <strong>{controversiesData.valueChoices.length}</strong> 类规范性价值选择节点、
                <strong>{controversiesData.revisionTriggers.length}</strong> 类定向修订触发器，以及全书{' '}
                <strong>{reviewedClaims.length.toLocaleString('en-US')}</strong> 条章末注释中全部{' '}
                <strong>{qualifiesClaims.length}</strong> 条附带限定性证据关系的注释与{' '}
                <strong>{caveatClaims.length}</strong> 条显式标明局限或适用条件的注释（其中 {overlapCount}{' '}
                条同时包含两类标注，合计覆盖 <strong>{distinctBoundedCount}</strong> 条独立注释）。
              </>
            )}
          </p>
          <nav className="concept-jump" aria-label={isEn ? 'Section jump links' : '分节跳转'} style={{ margin: 0 }}>
            <a href="#blind-spots">{isEn ? '8 LCIA Blind Spots' : '八类 LCIA 盲区'}</a>
            <a href="#value-choices">{isEn ? '10 Value-Choice Loci' : '十类价值选择翻转点'}</a>
            <a href="#revision-triggers">{isEn ? '7 Revision Triggers' : '七类定向修订触发器'}</a>
            <a href="#part-boundaries">{isEn ? 'Part I–VIII Boundaries & Caveats' : '第一至八部边界与限定注释'}</a>
            <a href="#access-boundaries">{isEn ? 'Access & Review Boundaries' : '文献访问与审阅边界'}</a>
          </nav>
        </section>

        {/* 1. Eight Consensus Blind Spots */}
        <section id="blind-spots" style={sectionBlockStyle} aria-labelledby="blind-spots-heading">
          <div style={sectionHeaderStyle}>
            <h2 id="blind-spots-heading">
              {isEn ? '1. Eight Consensus Blind Spots in Mainstream LCIA' : '一、主流影响评价仍缺共识的八类环境盲区'}
            </h2>
            <p style={sectionMetaStyle}>
              <Link href={`${prefix}/docs/appendices/lcia-method-coverage/`} style={{ textDecoration: 'underline' }}>
                {isEn ? 'Full matrix in Appendix G →' : '查看附录 G 完整覆盖矩阵 →'}
              </Link>
            </p>
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--kb-subtle)' }}>
            {isEn
              ? 'Unmodeled environmental pressures register as zero in indicator totals and weighted single scores even when real physical damage is substantial. Always disclose these blind spots alongside numerical profiles.'
              : '未进入表征因子表的环境退化在指标总分与加权单分中恒等于零，却绝不意味着物理影响为零。研究范围界定、评审与结论局限披露时须显式单列。'}
          </p>
          <div className="coverage-table">
            <table>
              <thead>
                <tr>
                  <th>{isEn ? 'Blind Spot / Domain' : '盲区或覆盖不足领域'}</th>
                  <th>{isEn ? 'Mainstream Method Status' : '主流影响评价现状'}</th>
                  <th>{isEn ? 'Nuance & Emerging Work' : '关键辨析与新兴进展'}</th>
                  <th>{isEn ? 'Chapters' : '详述章节'}</th>
                </tr>
              </thead>
              <tbody>
                {controversiesData.blindSpots.map(item => {
                  const copy = isEn ? item.en : item.zh;
                  return (
                    <tr key={item.id}>
                      <th>{copy.domain}</th>
                      <td>{copy.status}</td>
                      <td>{copy.nuance}</td>
                      <td>
                        {item.chapters.map((route, idx) => (
                          <span key={route}>
                            {idx > 0 && (isEn ? '; ' : '、')}
                            <Link href={`${prefix}${route}/`} style={{ textDecoration: 'underline' }}>
                              {unitTitle(route)}
                            </Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Ten Normative Value-Choice Loci */}
        <section id="value-choices" style={sectionBlockStyle} aria-labelledby="value-choices-heading">
          <div style={sectionHeaderStyle}>
            <h2 id="value-choices-heading">
              {isEn ? '2. Ten Value-Choice Loci That Can Flip Comparative Rankings' : '二、全书十类可致排序翻转的规范性价值选择'}
            </h2>
            <p style={sectionMetaStyle}>
              <Link href={`${prefix}/docs/book/revisable-judgment/`} style={{ textDecoration: 'underline' }}>
                {isEn ? 'Full synthesis in Chapter 40 →' : '查看第 40 章完整总表 →'}
              </Link>
            </p>
          </div>
          <div className="coverage-table">
            <table>
              <thead>
                <tr>
                  <th>{isEn ? 'Value-Choice Locus' : '价值选择节点'}</th>
                  <th>{isEn ? 'Normative Choice (Must Be Declared)' : '规范性价值选择（须明示前提）'}</th>
                  <th>{isEn ? 'Verified Ranking-Flip Trigger' : '已核验的判定翻转条件'}</th>
                  <th>{isEn ? 'Chapters' : '主章入口'}</th>
                </tr>
              </thead>
              <tbody>
                {controversiesData.valueChoices.map(item => {
                  const copy = isEn ? item.en : item.zh;
                  return (
                    <tr key={item.id}>
                      <th>{copy.locus}</th>
                      <td>{copy.choice}</td>
                      <td>{copy.flip}</td>
                      <td>
                        {item.chapters.map((route, idx) => (
                          <span key={route}>
                            {idx > 0 && (isEn ? '; ' : '、')}
                            <Link href={`${prefix}${route}/`} style={{ textDecoration: 'underline' }}>
                              {unitTitle(route)}
                            </Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Seven Targeted Revision Triggers */}
        <section id="revision-triggers" style={sectionBlockStyle} aria-labelledby="revision-triggers-heading">
          <div style={sectionHeaderStyle}>
            <h2 id="revision-triggers-heading">
              {isEn ? '3. Seven Targeted Revision Triggers When New Evidence Arrives' : '三、新证据到来时的七类定向修订触发器'}
            </h2>
            <p style={sectionMetaStyle}>
              <Link href={`${prefix}/docs/appendices/iso-study-design-checklist/`} style={{ textDecoration: 'underline' }}>
                {isEn ? 'Checklist & triggers in Appendix J →' : '查看附录 J 核对清单 →'}
              </Link>
            </p>
          </div>
          <div className="coverage-table">
            <table>
              <thead>
                <tr>
                  <th>{isEn ? 'Trigger & Checkpoints' : '触发类别与回查核查点'}</th>
                  <th>{isEn ? 'Conclusions to Recalculate' : '应定向重算的结论项'}</th>
                  <th>{isEn ? 'Intact Foundations & Prohibited Inferences' : '保持不变的依据与不得越界的推论'}</th>
                </tr>
              </thead>
              <tbody>
                {controversiesData.revisionTriggers.map(item => {
                  const copy = isEn ? item.en : item.zh;
                  return (
                    <tr key={item.id}>
                      <th>
                        {copy.trigger}
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--kb-subtle)', marginTop: '0.2rem' }}>
                          {isEn ? `Appendix J checkpoints: ${item.checkpoints}` : `附录 J 核查点：${item.checkpoints}`}
                        </div>
                      </th>
                      <td>{copy.recalculate}</td>
                      <td>{copy.boundary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Part-by-Part Evidence Boundaries, Qualifications & Caveats */}
        <section id="part-boundaries" style={sectionBlockStyle} aria-labelledby="part-boundaries-heading">
          <div style={sectionHeaderStyle}>
            <h2 id="part-boundaries-heading">
              {isEn ? '4. Part I–VIII Evidence Boundaries, Qualifications & Caveats' : '四、第一至八部证据边界、限定关系与局限注释索引'}
            </h2>
            <p style={sectionMetaStyle}>
              {isEn
                ? `${qualifiesClaims.length} qualification-linked · ${caveatClaims.length} caveat-bearing`
                : `共 ${qualifiesClaims.length} 条限定性证据关系 · ${caveatClaims.length} 条局限注释`}
            </p>
          </div>
          {partGroups.map(({ part, label, title, gapsText, partQualifies, partCaveats }) => (
            <article key={part.number} id={`gaps-part-${part.number}`} className="mapping-record">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>
                  {label} · {title}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--kb-subtle)' }}>
                  {isEn
                    ? `${partQualifies.length} qualified · ${partCaveats.length} caveated`
                    : `限定性证据 ${partQualifies.length} 条 · 局限注释 ${partCaveats.length} 条`}
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0.75rem', fontSize: '0.9rem', lineHeight: 1.75 }}>
                <strong>{isEn ? 'Remaining evidence gaps and boundaries: ' : '仍缺的证据与边界：'}</strong>
                {gapsText}
              </p>
              {partQualifies.length > 0 && (
                <details style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-fd-border)', paddingTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.86rem', fontWeight: 550 }}>
                    {isEn
                      ? `Qualification-linked notes in ${label} (${partQualifies.length})`
                      : `展开 ${label} 附带限定性证据关系的注释（${partQualifies.length} 条）`}
                  </summary>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
                    {partQualifies.map(renderClaimListItem)}
                  </ul>
                </details>
              )}
              {partCaveats.length > 0 && (
                <details style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-fd-border)', paddingTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.86rem', fontWeight: 550 }}>
                    {isEn
                      ? `Caveat-bearing notes in ${label} (${partCaveats.length})`
                      : `展开 ${label} 标明局限或适用条件的注释（${partCaveats.length} 条）`}
                  </summary>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
                    {partCaveats.map(renderClaimListItem)}
                  </ul>
                </details>
              )}
            </article>
          ))}

          {(nonChapterQualifies.length > 0 || nonChapterCaveats.length > 0) && (
            <article id="gaps-companion" className="mapping-record">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem' }}>
                  {isEn ? 'Topical Essays, Appendices & Shared Reference Notes' : '专题、附录与跨章共享参考注释'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--kb-subtle)' }}>
                  {isEn
                    ? `${nonChapterQualifies.length} qualified · ${nonChapterCaveats.length} caveated`
                    : `限定性证据 ${nonChapterQualifies.length} 条 · 局限注释 ${nonChapterCaveats.length} 条`}
                </span>
              </div>
              {nonChapterQualifies.length > 0 && (
                <details style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-fd-border)', paddingTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.86rem', fontWeight: 550 }}>
                    {isEn
                      ? `Qualification-linked notes (${nonChapterQualifies.length})`
                      : `展开限定性证据关系注释（${nonChapterQualifies.length} 条）`}
                  </summary>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
                    {nonChapterQualifies.map(renderClaimListItem)}
                  </ul>
                </details>
              )}
              {nonChapterCaveats.length > 0 && (
                <details style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-fd-border)', paddingTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.86rem', fontWeight: 550 }}>
                    {isEn
                      ? `Caveat-bearing notes (${nonChapterCaveats.length})`
                      : `展开标明局限或适用条件的注释（${nonChapterCaveats.length} 条）`}
                  </summary>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
                    {nonChapterCaveats.map(renderClaimListItem)}
                  </ul>
                </details>
              )}
            </article>
          )}
        </section>

        {/* 5. Verification, Source-Access & Review Boundaries */}
        <section id="access-boundaries" style={sectionBlockStyle} aria-labelledby="access-boundaries-heading">
          <div style={sectionHeaderStyle}>
            <h2 id="access-boundaries-heading">
              {isEn ? '5. Source-Access, Verification & Review Boundaries' : '五、文献访问、核验与审阅边界说明'}
            </h2>
            <p style={sectionMetaStyle}>
              <Link href={`${prefix}/changes/#writing-note`} style={{ textDecoration: 'underline' }}>
                {isEn ? 'Editorial Note & Licensing →' : '查看编写说明与许可 →'}
              </Link>
            </p>
          </div>
          {controversiesData.accessBoundaries.map(item => {
            const copy = isEn ? item.en : item.zh;
            return (
              <section key={item.id} className="editorial-note">
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{copy.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.8 }}>{copy.body}</p>
              </section>
            );
          })}
          <p style={{ marginTop: '1.25rem', fontSize: '0.86rem', color: 'var(--kb-subtle)' }}>
            {isEn ? (
              <>
                Further navigation: <Link href="/en/coverage/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.bookGuide.en}</Link> ·{' '}
                <Link href="/en/claims/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.chapterNotes.en}</Link> ·{' '}
                <Link href="/en/research/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.references.en}</Link> ·{' '}
                <Link href="/en/changes/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.revisionsErrata.en}</Link>
              </>
            ) : (
              <>
                相关入口：<Link href="/zh/coverage/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.bookGuide.zh}</Link> ·{' '}
                <Link href="/zh/claims/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.chapterNotes.zh}</Link> ·{' '}
                <Link href="/zh/research/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.references.zh}</Link> ·{' '}
                <Link href="/zh/changes/" style={{ textDecoration: 'underline' }}>{UI_SURFACES.revisionsErrata.zh}</Link>
              </>
            )}
          </p>
        </section>
      </div>
    </PublicationShell>
  );
}
