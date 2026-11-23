import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { getOrderedPages, logicalPageUrl } from '@/lib/reader-book';
import { readerGuideConfig } from '@/lib/reader-guide';
import { getPresentationUnits, readerParts } from '@/scripts/reader-numbering.mjs';
import alignment from '@/knowledge/editions/alignment.json';
import styles from '@/components/reader-guide.module.css';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'Book Guide',
      description: 'Complete seven-part, 32-chapter roadmap, 5 topical essays, 5 appendices, and reference apparatus for the English edition.',
    };
  }
  return {
    title: '全书导览',
    description: '七部 32 章逻辑主线、三种阅读路径、六条按问题入口、五篇专题与五份附录的完整阅读地图。',
  };
}

const EN_PART_TITLES: Record<number, { label: string; title: string }> = {
  1: { label: 'Part I', title: 'Origins, Questions, and Methodological Framework' },
  2: { label: 'Part II', title: 'Functional Unit, Process Networks, and Life Cycle Inventory' },
  3: { label: 'Part III', title: 'Multifunctionality, Allocation, and System Boundaries' },
  4: { label: 'Part IV', title: 'Life Cycle Impact Assessment Pathways and Models' },
  5: { label: 'Part V', title: 'Normalization, Weighting, Regionalization, and Sustainability Extensions' },
  6: { label: 'Part VI', title: 'Data Quality, Uncertainty, Footprints, and Databases' },
  7: { label: 'Part VII', title: 'Case Synthesis, Interpretation, and Revisable Judgment' },
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const pages = new Map(getOrderedPages().map(page => [logicalPageUrl(page.url), page]));
  const webUnits = getPresentationUnits('web');
  const unitByKey = new Map(webUnits.map(unit => [unit.key, unit]));

  const frontMatter = webUnits.filter(u => u.kind === 'front-matter');
  const chapters = webUnits.filter(u => u.kind === 'chapter');
  const topics = webUnits.filter(u => u.kind === 'topic');
  const appendices = webUnits.filter(u => u.kind === 'appendix');

  if (lang === 'en') {
    const unitEntries = alignment.units as Record<string, { enStatus?: string; enTitle?: string }>;
    const publishedEnUnits = new Set(
      Object.entries(unitEntries)
        .filter(([, meta]) => meta?.enStatus === 'published')
        .map(([unitId]) => unitId)
    );
    return (
      <PublicationShell
        lang="en"
        title="Book Guide"
        description="Complete seven-part, 32-chapter roadmap, 5 topical essays, 5 appendices, and reference apparatus for the meaning-equivalent English edition."
      >
        <div className={styles.root} data-en-guide="">
          <section className={styles.sectionBlock} aria-labelledby="en-guide-status">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-status">Edition Status</h2>
              <p className={styles.sectionMeta}>7 Parts · 32 Chapters · 5 Topics · 5 Appendices</p>
            </div>
            <p>
              Published English units: <strong>{publishedEnUnits.size}</strong> / {webUnits.length}. All main chapters,
              topical essays, appendices, interactive cases, and global reference pages are published and aligned to the Chinese edition.
            </p>
          </section>

          <section className={styles.sectionBlock} aria-labelledby="en-guide-front">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-front">Front Matter</h2>
              <p className={styles.sectionMeta}>Orientation and editorial conventions</p>
            </div>
            <div className={styles.frontGrid}>
              {frontMatter.map(unit => (
                <Link key={unit.key} href={`/en${unit.key}/`} className={styles.frontCard}>
                  <span className={styles.frontTitle}>{unitEntries[unit.key]?.enTitle ?? unit.title}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock} aria-labelledby="en-guide-chapters">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-chapters">Parts and Chapters</h2>
              <p className={styles.sectionMeta}>Full 32-chapter structure shared with the Chinese edition</p>
            </div>
            {readerParts.map(part => {
              const partChapters = chapters.filter(u => u.part === part.number);
              const enMeta = EN_PART_TITLES[part.number] ?? { label: `Part ${part.number}`, title: part.title };
              const firstOrd = partChapters[0]?.ordinal ?? 0;
              const lastOrd = partChapters.at(-1)?.ordinal ?? 0;
              return (
                <section key={part.number} id={`part-${part.number}`} className={styles.partSection}>
                  <div className={styles.partHeading}>
                    <h3>{enMeta.label}: {enMeta.title}</h3>
                    <span className={styles.rangeTag}>
                      {firstOrd === lastOrd ? `Chapter ${firstOrd}` : `Chapters ${firstOrd}–${lastOrd}`}
                    </span>
                  </div>
                  <ol className={styles.chapterList}>
                    {partChapters.map(unit => {
                      const isPublished = publishedEnUnits.has(unit.key);
                      return (
                        <li key={unit.key} className={styles.chapterItem}>
                          <div className={styles.chapterRowTop}>
                            <div className={styles.chapterTitleWrap}>
                              <span className={styles.chapterNumber}>Chapter {unit.ordinal}</span>
                              {isPublished ? (
                                <Link href={`/en${unit.key}/`} className={styles.chapterLink}>
                                  {unitEntries[unit.key]?.enTitle ?? unit.title}
                                </Link>
                              ) : (
                                <span className={styles.chapterLink}>{unitEntries[unit.key]?.enTitle ?? unit.title}</span>
                              )}
                            </div>
                            <span className={styles.rangeTag}>
                              {isPublished ? 'Published' : 'In preparation'}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </section>

          <section className={styles.sectionBlock} aria-labelledby="en-guide-topics">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-topics">Topical Essays</h2>
              <p className={styles.sectionMeta}>5 standalone conceptual and methodological essays</p>
            </div>
            <ul className={styles.cardGrid}>
              {topics.map((unit, idx) => (
                <li key={unit.key} className={styles.unitCard}>
                  <div className={styles.unitCardTop}>
                    <span className={styles.unitLabel}>Topic {idx + 1}</span>
                    <Link href={`/en${unit.key}/`} className={styles.unitLink}>
                      {unitEntries[unit.key]?.enTitle ?? unit.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.sectionBlock} aria-labelledby="en-guide-appendices">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-appendices">Appendices</h2>
              <p className={styles.sectionMeta}>Appendices A–E: Numerical reconstructions, factor checks, and LCA timeline</p>
            </div>
            <ol className={styles.cardGrid}>
              {appendices.map((unit, idx) => (
                <li key={unit.key} className={styles.unitCard}>
                  <div className={styles.unitCardTop}>
                    <span className={styles.unitLabel}>Appendix {String.fromCharCode(65 + idx)}</span>
                    <Link href={`/en${unit.key}/`} className={styles.unitLink}>
                      {unitEntries[unit.key]?.enTitle ?? unit.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.sectionBlock} aria-labelledby="en-guide-tools">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-tools">Reference &amp; Publication Tools</h2>
              <p className={styles.sectionMeta}>Trace claims, concepts, primary sources, timeline milestones, and print edition</p>
            </div>
            <ul className={styles.cardGrid}>
              {[
                { href: '/en/claims/', title: 'Notes & Claims', desc: 'All 1,117 reviewed claims with evidence bindings, scopes, and caveats.' },
                { href: '/en/concepts/', title: 'Concepts Index', desc: 'Core LCA concepts, definitions, and cross-framework mappings.' },
                { href: '/en/research/', title: 'References & Sources', desc: 'Primary standards, reports, papers, and passage-level citation locators.' },
                { href: '/en/timeline/', title: 'LCA Historical Timeline', desc: '27 milestones (1969–2026) with primary-source verification status.' },
                { href: '/en/print/', title: 'Continuous Reading & Print Edition', desc: 'Full monograph assembled in one printable document.' },
                { href: '/en/changes/', title: 'Editions & Errata', desc: 'Source commit traceability, bilingual alignment, and errata submission.' },
              ].map(tool => (
                <li key={tool.href} className={styles.unitCard}>
                  <Link href={tool.href} className={styles.unitLink}>{tool.title}</Link>
                  <p className={styles.unitDesc}>{tool.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </PublicationShell>
    );
  }

  const partGroups = readerParts.map(part => {
    const partChapters = chapters.filter(u => u.part === part.number);
    const firstOrd = partChapters[0]?.ordinal ?? 0;
    const lastOrd = partChapters.at(-1)?.ordinal ?? 0;
    return {
      part,
      chapters: partChapters,
      rangeLabel: firstOrd === lastOrd ? `第 ${firstOrd} 章` : `第 ${firstOrd}–${lastOrd} 章`,
      coreQuestion: readerGuideConfig.partQuestions[String(part.number)] ?? '',
    };
  });

  const zhHref = (href: string) =>
    href.startsWith('#') || href.startsWith('/zh/') || href.startsWith('http') ? href : `/zh${href}`;

  return (
    <PublicationShell
      title="全书导览"
      description="按七部 32 章、五篇概念与实践专题、五份复核与大事记附录梳理全书结构，支持顺读、按问题速查或从经典案例倒推。"
    >
      <div className={styles.root}>
        {/* A. 7-Part Roadmap */}
        <section className={styles.sectionBlock} aria-labelledby="guide-roadmap">
          <div className={styles.sectionHeader}>
            <h2 id="guide-roadmap">七部逻辑主线</h2>
            <p className={styles.sectionMeta}>全书 32 章 · 5 篇专题 · 5 份附录</p>
          </div>
          <ol className={styles.roadmapGrid}>
            {partGroups.map(({ part, rangeLabel, coreQuestion }) => (
              <li key={part.number}>
                <a href={`#part-${part.number}`} className={styles.roadmapCard}>
                  <div className={styles.roadmapTop}>
                    <span className={styles.partTag}>{part.label}</span>
                    <span className={styles.rangeTag}>{rangeLabel}</span>
                  </div>
                  <span className={styles.roadmapTitle}>{part.title}</span>
                  <p className={styles.roadmapQuestion}>{coreQuestion}</p>
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* B1. 3 Reading Modes */}
        <section className={styles.sectionBlock} aria-labelledby="guide-modes" data-guide-section="modes">
          <div className={styles.sectionHeader}>
            <h2 id="guide-modes">三种阅读路径</h2>
            <p className={styles.sectionMeta}>同一套案例与文献依据，按需选择切入方式</p>
          </div>
          <div className={styles.modesGrid}>
            {readerGuideConfig.readingModes.map(mode => (
              <div key={mode.id} className={styles.modeCard} data-guide-mode={mode.id}>
                <span className={styles.modeBadge}>{mode.badge}</span>
                <h3 className={styles.modeTitle}>{mode.title}</h3>
                <p className={styles.modeAudience}>适合：{mode.audience}</p>
                <p className={styles.modeDesc}>{mode.description}</p>
                {mode.startHref.startsWith('#') ? (
                  <a href={mode.startHref} className={styles.modeAction}>
                    {mode.startLabel} →
                  </a>
                ) : (
                  <Link href={zhHref(mode.startHref)} className={styles.modeAction}>
                    {mode.startLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* B2. 6 Problem-First Entries */}
        <section id="problem-routes" className={styles.sectionBlock} aria-labelledby="guide-problems" data-guide-section="problems">
          <div className={styles.sectionHeader}>
            <h2 id="guide-problems">按实务问题速查</h2>
            <p className={styles.sectionMeta}>六类高频建模、评价与审查问题直达入口</p>
          </div>
          <div className={styles.problemGrid}>
            {readerGuideConfig.problemRoutes.map(prob => (
              <div key={prob.id} className={styles.problemCard} data-guide-problem={prob.id}>
                <h3 className={styles.problemQuestion}>{prob.question}</h3>
                <p className={styles.problemSummary}>{prob.summary}</p>
                <div className={styles.problemLinks}>
                  {prob.targets.map(target => {
                    const unit = unitByKey.get(target.route);
                    return (
                      <Link key={target.route} href={`/zh${target.route}/`} className={styles.problemChip}>
                        <span>{unit?.label ? `${unit.label}《${unit.title}》` : target.route}</span>
                        <span className={styles.problemChipWhy}>· {target.why}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* C. Front Matter */}
        <section className={styles.sectionBlock} aria-labelledby="guide-front" data-guide-section="front-matter">
          <div className={styles.sectionHeader}>
            <h2 id="guide-front">序言与导读</h2>
            <p className={styles.sectionMeta}>进入正文章节前的全书脉络与使用约定</p>
          </div>
          <div className={styles.frontGrid}>
            {frontMatter.map(unit => {
              const page = pages.get(unit.key);
              return (
                <Link key={unit.key} href={`/zh${unit.key}/`} className={styles.frontCard}>
                  <span className={styles.frontTitle}>{unit.title}</span>
                  <p className={styles.frontDesc}>{page?.data.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* D. 7 Parts / 32 Chapters */}
        <section className={styles.sectionBlock} aria-labelledby="guide-chapters" data-guide-section="chapters">
          <div className={styles.sectionHeader}>
            <h2 id="guide-chapters">正文章节</h2>
            <p className={styles.sectionMeta}>七部 32 章，网页与书籍打印版逐章对应</p>
          </div>
          {partGroups.map(({ part, chapters: partChapters, rangeLabel }) => (
            <section key={part.number} id={`part-${part.number}`} className={styles.partSection}>
              <div className={styles.partHeading}>
                <h3>
                  {part.label} {part.title}
                </h3>
                <span className={styles.rangeTag}>{rangeLabel}</span>
              </div>
              <p className={styles.partIntro}>{part.introduction}</p>
              <ol className={styles.chapterList} data-guide-part-chapters={part.number}>
                {partChapters.map(unit => {
                  const page = pages.get(unit.key);
                  const companions = readerGuideConfig.chapterCompanions[unit.key] ?? [];
                  return (
                    <li key={unit.key} className={styles.chapterItem}>
                      <div className={styles.chapterRowTop}>
                        <div className={styles.chapterTitleWrap}>
                          <span className={styles.chapterNumber}>{unit.label}</span>
                          <Link href={`/zh${unit.key}/`} className={styles.chapterLink} data-guide-chapter-link={unit.key}>
                            {unit.title}
                          </Link>
                        </div>
                        {companions.length > 0 && (
                          <div className={styles.companionGroup}>
                            {companions.map(comp => {
                              const targetUnit = unitByKey.get(comp.route);
                              return (
                                <Link
                                  key={comp.route}
                                  href={`/zh${comp.route}/`}
                                  className={styles.companionBadge}
                                  title={targetUnit ? `${comp.badge}：${targetUnit.title}` : comp.badge}
                                >
                                  {comp.badge}：{targetUnit?.title ?? comp.route}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <p className={styles.chapterDesc} data-guide-chapter-desc="">
                        {page?.data.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </section>

        {/* E. Topics */}
        <section className={styles.sectionBlock} aria-labelledby="guide-topics" data-guide-section="topics">
          <div className={styles.sectionHeader}>
            <h2 id="guide-topics">概念与实践专题</h2>
            <p className={styles.sectionMeta}>5 篇独立深挖专题，配合正文辨析核心概念与软件语义</p>
          </div>
          <ul className={styles.cardGrid} data-guide-topics-list="">
            {topics.map(unit => {
              const page = pages.get(unit.key);
              return (
                <li key={unit.key} className={styles.unitCard}>
                  <div className={styles.unitCardTop}>
                    <span className={styles.unitLabel}>{unit.label}</span>
                    <Link href={`/zh${unit.key}/`} className={styles.unitLink} data-guide-topic-link={unit.key}>
                      {unit.title}
                    </Link>
                  </div>
                  <p className={styles.unitDesc} data-guide-topic-desc="">
                    {page?.data.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* F. Appendices */}
        <section className={styles.sectionBlock} aria-labelledby="guide-appendices" data-guide-section="appendices">
          <div className={styles.sectionHeader}>
            <h2 id="guide-appendices">复核与大事记附录</h2>
            <p className={styles.sectionMeta}>附录 A–E：算例方程重建、因子复算与 1969–2026 发展大事记</p>
          </div>
          <ol className={styles.cardGrid} data-guide-appendices-list="">
            {appendices.map(unit => {
              const page = pages.get(unit.key);
              return (
                <li key={unit.key} className={styles.unitCard}>
                  <div className={styles.unitCardTop}>
                    <span className={styles.unitLabel}>{unit.label}</span>
                    <Link href={`/zh${unit.key}/`} className={styles.unitLink} data-guide-appendix-link={unit.key}>
                      {unit.title}
                    </Link>
                  </div>
                  <p className={styles.unitDesc}>{page?.data.description}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* G. Tools */}
        <section className={styles.sectionBlock} aria-labelledby="guide-tools" data-guide-section="tools">
          <div className={styles.sectionHeader}>
            <h2 id="guide-tools">交叉检索与出版工具</h2>
            <p className={styles.sectionMeta}>从正文论述一键溯源至一手文献、术语定义与历次修订记录</p>
          </div>
          <ul className={styles.cardGrid}>
            {readerGuideConfig.tools.map(tool => (
              <li key={tool.href} className={styles.unitCard}>
                <Link href={zhHref(tool.href)} className={styles.unitLink}>
                  {tool.title}
                </Link>
                <p className={styles.unitDesc}>{tool.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PublicationShell>
  );
}
