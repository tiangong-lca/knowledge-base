import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { getOrderedPages, logicalPageUrl } from '@/lib/reader-book';
import { readerGuideConfig } from '@/lib/reader-guide';
import enReaderGuide from '@/config/editions/en/reader-guide.json';
import { getSource } from '@/lib/source';
import { EN_PARTS } from '@/lib/reader-numbering';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { getPresentationUnits, readerParts } from '@/scripts/reader-numbering.mjs';
import alignment from '@/knowledge/editions/alignment.json';
import styles from '@/components/reader-guide.module.css';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const webUnits = getPresentationUnits('web');
  const chCount = webUnits.filter(u => u.kind === 'chapter').length;
  const topicCount = webUnits.filter(u => u.kind === 'topic').length;
  const appCount = webUnits.filter(u => u.kind === 'appendix').length;
  if (lang === 'en') {
    return {
      title: UI_SURFACES.bookGuide.en,
      description: `Complete ${readerParts.length}-part, ${chCount}-chapter roadmap, ${topicCount} topical essays, ${appCount} appendices, and reference apparatus.`,
    };
  }
  return {
    title: UI_SURFACES.bookGuide.zh,
    description: `${readerParts.length} 部 ${chCount} 章逻辑主线、多种阅读路径、按问题速查、${topicCount} 篇专题与 ${appCount} 份附录的完整阅读地图。`,
  };
}

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
  const appendixRange = appendices.length > 1 ? `A–${String.fromCharCode(64 + appendices.length)}` : 'A';

  if (lang === 'en') {
    const unitEntries = alignment.units as Record<string, { enStatus?: string; enTitle?: string }>;
    const enPages = new Map(getSource('en').getPages().map(page => [logicalPageUrl(page.url), page]));
    const enCompanionBadge = (route: string) => {
      const aIdx = appendices.findIndex(u => u.key === route);
      if (aIdx >= 0) return `Appendix ${String.fromCharCode(65 + aIdx)}`;
      const tIdx = topics.findIndex(u => u.key === route);
      if (tIdx >= 0) return `Topic ${tIdx + 1}`;
      return 'Companion';
    };
    const enPartGroups = readerParts.map(part => {
      const partChapters = chapters.filter(u => u.part === part.number);
      const enMeta = EN_PARTS[part.number] ?? { label: `Part ${part.number}`, title: part.title };
      const firstOrd = partChapters[0]?.ordinal ?? 0;
      const lastOrd = partChapters.at(-1)?.ordinal ?? 0;
      return {
        part,
        enMeta,
        chapters: partChapters,
        rangeLabel: firstOrd === lastOrd ? `Chapter ${firstOrd}` : `Chapters ${firstOrd}–${lastOrd}`,
        coreQuestion: (enReaderGuide.partQuestions as Record<string, string>)[String(part.number)] ?? '',
      };
    });
    return (
      <PublicationShell
        lang="en"
        title={UI_SURFACES.bookGuide.en}
        description={`Navigate all ${readerParts.length} parts and ${chapters.length} chapters, ${enReaderGuide.readingModes.length} reading paths, ${enReaderGuide.problemRoutes.length} practical entry questions, ${topics.length} topical essays, and ${appendices.length} appendices.`}
      >
        <div className={styles.root} data-en-guide="">
          {/* A. Multi-Part Roadmap */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-roadmap">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-roadmap">Book Roadmap ({readerParts.length} Parts)</h2>
              <p className={styles.sectionMeta}>{chapters.length} Chapters · {topics.length} Topics · {appendices.length} Appendices</p>
            </div>
            <ol className={styles.roadmapGrid}>
              {enPartGroups.map(({ part, enMeta, rangeLabel, coreQuestion }) => (
                <li key={part.number}>
                  <a href={`#part-${part.number}`} className={styles.roadmapCard}>
                    <div className={styles.roadmapTop}>
                      <span className={styles.partTag}>{enMeta.label}</span>
                      <span className={styles.rangeTag}>{rangeLabel}</span>
                    </div>
                    <span className={styles.roadmapTitle}>{enMeta.title}</span>
                    <p className={styles.roadmapQuestion}>{coreQuestion}</p>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {/* B1. Reading Paths */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-modes" data-guide-section="modes">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-modes">Reading Paths</h2>
              <p className={styles.sectionMeta}>Same worked cases and primary evidence, {enReaderGuide.readingModes.length} ways in</p>
            </div>
            <div className={styles.modesGrid}>
              {enReaderGuide.readingModes.map(mode => (
                <div key={mode.id} className={styles.modeCard} data-guide-mode={mode.id}>
                  <span className={styles.modeBadge}>{mode.badge}</span>
                  <h3 className={styles.modeTitle}>{mode.title}</h3>
                  <p className={styles.modeAudience}>Best for: {mode.audience}</p>
                  <p className={styles.modeDesc}>{mode.description}</p>
                  {mode.startHref.startsWith('#') ? (
                    <a href={mode.startHref} className={styles.modeAction}>
                      {mode.startLabel} →
                    </a>
                  ) : (
                    <Link href={mode.startHref} className={styles.modeAction}>
                      {mode.startLabel} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* B2. Problem-First Entries */}
          <section id="en-problem-routes" className={styles.sectionBlock} aria-labelledby="en-guide-problems" data-guide-section="problems">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-problems">Browse by Practical Question</h2>
              <p className={styles.sectionMeta}>Direct entry points for recurring modeling and review questions</p>
            </div>
            <div className={styles.problemGrid}>
              {enReaderGuide.problemRoutes.map(prob => (
                <div key={prob.id} className={styles.problemCard} data-guide-problem={prob.id}>
                  <h3 className={styles.problemQuestion}>{prob.question}</h3>
                  <p className={styles.problemSummary}>{prob.summary}</p>
                  <div className={styles.problemLinks}>
                    {prob.targets.map(target => {
                      const unit = unitByKey.get(target.route);
                      const enTitle = unitEntries[target.route]?.enTitle ?? enPages.get(target.route)?.data.title ?? target.route;
                      return (
                        <Link key={target.route} href={`/en${target.route}/`} className={styles.problemChip}>
                          <span>{unit?.ordinal ? `Ch. ${unit.ordinal} · ${enTitle}` : enTitle}</span>
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
          <section className={styles.sectionBlock} aria-labelledby="en-guide-front">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-front">Front Matter</h2>
              <p className={styles.sectionMeta}>Orientation and editorial conventions</p>
            </div>
            <div className={styles.frontGrid}>
              {frontMatter.map(unit => {
                const page = enPages.get(unit.key);
                return (
                  <Link key={unit.key} href={`/en${unit.key}/`} className={styles.frontCard}>
                    <span className={styles.frontTitle}>{unitEntries[unit.key]?.enTitle ?? unit.title}</span>
                    {page?.data.description && <p className={styles.frontDesc}>{page.data.description}</p>}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* D. Parts and Chapters */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-chapters">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-chapters">Parts and Chapters</h2>
              <p className={styles.sectionMeta}>{readerParts.length} parts, {chapters.length} chapters—aligned across web and print editions</p>
            </div>
            {enPartGroups.map(({ part, enMeta, chapters: partChapters, rangeLabel }) => {
              const enIntro = (enReaderGuide.partIntroductions as Record<string, string>)[String(part.number)];
              const enSummary = (enReaderGuide.partSummaries as Record<string, { establishes: string; contrasts: string; gaps: string; bridge: string }>)[String(part.number)];
              return (
                <section key={part.number} id={`part-${part.number}`} className={styles.partSection}>
                  <div className={styles.partHeading}>
                    <h3>{enMeta.label}: {enMeta.title}</h3>
                    <span className={styles.rangeTag}>{rangeLabel}</span>
                  </div>
                  {enIntro && <p className={styles.partIntro}>{enIntro}</p>}
                  <ol className={styles.chapterList}>
                    {partChapters.map(unit => {
                      const page = enPages.get(unit.key);
                      const companions = readerGuideConfig.chapterCompanions[unit.key] ?? [];
                      return (
                        <li key={unit.key} className={styles.chapterItem}>
                          <div className={styles.chapterRowTop}>
                            <div className={styles.chapterTitleWrap}>
                              <span className={styles.chapterNumber}>Chapter {unit.ordinal}</span>
                              <Link href={`/en${unit.key}/`} className={styles.chapterLink}>
                                {unitEntries[unit.key]?.enTitle ?? unit.title}
                              </Link>
                            </div>
                            {companions.length > 0 && (
                              <div className={styles.companionGroup}>
                                {companions.map(comp => {
                                  const enBadge = enCompanionBadge(comp.route);
                                  const enCompTitle = unitEntries[comp.route]?.enTitle ?? enPages.get(comp.route)?.data.title ?? comp.route;
                                  return (
                                    <Link
                                      key={comp.route}
                                      href={`/en${comp.route}/`}
                                      className={styles.companionBadge}
                                      title={`${enBadge}: ${enCompTitle}`}
                                    >
                                      {enBadge}: {enCompTitle}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {page?.data.description && <p className={styles.chapterDesc}>{page.data.description}</p>}
                        </li>
                      );
                    })}
                  </ol>
                  {enSummary && (
                    <aside className={styles.partClosing} data-guide-part-closing={part.number} aria-label={`${enMeta.label} closing summary`}>
                      <p className={styles.partClosingTitle}>{enMeta.label} Closing Summary</p>
                      <dl className={styles.partClosingList}>
                        <div><dt>What this part establishes</dt><dd>{enSummary.establishes}</dd></div>
                        <div><dt>Key cross-framework contrasts</dt><dd>{enSummary.contrasts}</dd></div>
                        <div><dt>Remaining evidence gaps and boundaries</dt><dd>{enSummary.gaps}</dd></div>
                        <div><dt>{part.number === readerParts.length ? 'Monograph synthesis' : 'Bridge to the next part'}</dt><dd>{enSummary.bridge}</dd></div>
                      </dl>
                    </aside>
                  )}
                </section>
              );
            })}
          </section>

          {/* E. Topical Essays */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-topics">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-topics">Topical Essays</h2>
              <p className={styles.sectionMeta}>{topics.length} standalone methodological reading guides complementing the main chapters (historical source criticism and database system models—aligned across web and print)</p>
            </div>
            <ul className={styles.cardGrid}>
              {topics.map((unit, idx) => {
                const page = enPages.get(unit.key);
                return (
                  <li key={unit.key} className={styles.unitCard}>
                    <div className={styles.unitCardTop}>
                      <span className={styles.unitLabel}>Topic {idx + 1}</span>
                      <Link href={`/en${unit.key}/`} className={styles.unitLink}>
                        {unitEntries[unit.key]?.enTitle ?? unit.title}
                      </Link>
                    </div>
                    {page?.data.description && <p className={styles.unitDesc}>{page.data.description}</p>}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* F. Appendices */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-appendices">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-appendices">Appendices</h2>
              <p className={styles.sectionMeta}>Appendices {appendixRange}: Numerical reconstructions, factor checks, timeline, reference matrices, and study checklist</p>
            </div>
            <ol className={styles.cardGrid}>
              {appendices.map((unit, idx) => {
                const page = enPages.get(unit.key);
                return (
                  <li key={unit.key} className={styles.unitCard}>
                    <div className={styles.unitCardTop}>
                      <span className={styles.unitLabel}>Appendix {String.fromCharCode(65 + idx)}</span>
                      <Link href={`/en${unit.key}/`} className={styles.unitLink}>
                        {unitEntries[unit.key]?.enTitle ?? unit.title}
                      </Link>
                    </div>
                    {page?.data.description && <p className={styles.unitDesc}>{page.data.description}</p>}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* G. Reference & Publication Tools */}
          <section className={styles.sectionBlock} aria-labelledby="en-guide-tools">
            <div className={styles.sectionHeader}>
              <h2 id="en-guide-tools">Reference Apparatus</h2>
              <p className={styles.sectionMeta}>Trace notes, concepts, primary sources, historical milestones, and the continuous print edition</p>
            </div>
            <ul className={styles.cardGrid}>
              {[
                { href: '/en/research/', title: UI_SURFACES.references.en, desc: 'Primary standards, reports, papers, and passage-level citation locators.' },
                { href: '/en/concepts/', title: UI_SURFACES.conceptIndex.en, desc: 'Core LCA concepts, definitions, and cross-framework mappings.' },
                { href: '/en/claims/', title: UI_SURFACES.chapterNotes.en, desc: 'All chapter notes with primary sources, validity scopes, and caveats.' },
                { href: '/en/timeline/', title: UI_SURFACES.timeline.en, desc: 'Key historical milestones from 1969 to 2026 with source provenance.' },
                { href: '/en/print/', title: UI_SURFACES.fullTextPrint.en, desc: 'Complete book assembled in one continuous printable document.' },
                { href: '/en/changes/', title: UI_SURFACES.revisionsErrata.en, desc: 'Reader-facing revisions, chapter updates, and errata submission.' },
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
      title={UI_SURFACES.bookGuide.zh}
      description={`按 ${readerParts.length} 部 ${chapters.length} 章、${topics.length} 篇概念与实践专题、${appendices.length} 份附录梳理全书结构，支持系统通读、课程教学、环境产品声明（EPD）与产品碳足迹实务、按问题速查或从经典案例倒推。`}
    >
      <div className={styles.root}>
        {/* A. Part Roadmap */}
        <section className={styles.sectionBlock} aria-labelledby="guide-roadmap">
          <div className={styles.sectionHeader}>
            <h2 id="guide-roadmap">全书逻辑主线（共 {readerParts.length} 部）</h2>
            <p className={styles.sectionMeta}>全书 {chapters.length} 章 · {topics.length} 篇专题 · {appendices.length} 份附录</p>
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

        {/* B1. Reading Modes */}
        <section className={styles.sectionBlock} aria-labelledby="guide-modes" data-guide-section="modes">
          <div className={styles.sectionHeader}>
            <h2 id="guide-modes">阅读路径</h2>
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

        {/* B2. Problem-First Entries */}
        <section id="problem-routes" className={styles.sectionBlock} aria-labelledby="guide-problems" data-guide-section="problems">
          <div className={styles.sectionHeader}>
            <h2 id="guide-problems">按实务问题速查</h2>
            <p className={styles.sectionMeta}>高频建模、评价与审查问题直达入口</p>
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

        {/* D. Parts / Chapters */}
        <section className={styles.sectionBlock} aria-labelledby="guide-chapters" data-guide-section="chapters">
          <div className={styles.sectionHeader}>
            <h2 id="guide-chapters">正文章节</h2>
            <p className={styles.sectionMeta}>共 {readerParts.length} 部 {chapters.length} 章，分章网页与全书连续版逐章对应</p>
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
              {readerGuideConfig.partSummaries[String(part.number)] && (
                <aside className={styles.partClosing} data-guide-part-closing={part.number} aria-label={`${part.label}部末小结`}>
                  <p className={styles.partClosingTitle}>{part.label}小结</p>
                  <dl className={styles.partClosingList}>
                    <div><dt>本部回答</dt><dd>{readerGuideConfig.partSummaries[String(part.number)].establishes}</dd></div>
                    <div><dt>主要对照</dt><dd>{readerGuideConfig.partSummaries[String(part.number)].contrasts}</dd></div>
                    <div><dt>仍缺的证据与边界</dt><dd>{readerGuideConfig.partSummaries[String(part.number)].gaps}</dd></div>
                    <div><dt>{part.number === readerParts.length ? '全书收束' : '承接下一部'}</dt><dd>{readerGuideConfig.partSummaries[String(part.number)].bridge}</dd></div>
                  </dl>
                </aside>
              )}
            </section>
          ))}
        </section>

        {/* E. Topics */}
        <section className={styles.sectionBlock} aria-labelledby="guide-topics" data-guide-section="topics">
          <div className={styles.sectionHeader}>
            <h2 id="guide-topics">概念与实践专题</h2>
            <p className={styles.sectionMeta}>{topics.length} 篇独立方法论导读，分别聚焦史料核验原则与背景数据库系统模型辨读（与连续版目录一致）</p>
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
            <h2 id="guide-appendices">附录</h2>
            <p className={styles.sectionMeta}>附录 {appendixRange}：算例方程重建、因子复算、发展大事记、参引总表与研究核对清单</p>
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
            <h2 id="guide-tools">参考与检索</h2>
            <p className={styles.sectionMeta}>从正文注释直达原始文献、术语定义与修订记录</p>
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
