import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { EnChapterContent } from '@/components/en-chapter-content';
import { PublicationNote } from '@/components/publication-note';
import catalog from '@/lib/catalog';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { getLegacyCitations, getPrintPages, logicalPageUrl, type ReaderPage } from '@/lib/reader-book';
import { getSource } from '@/lib/source';
import { currentReaderOrdinaryAttributes, ChapterContent, LegacyCitationAliases } from '@/components/chapter-content';
import { NumberedHeading, NumberedTitle } from '@/components/numbered-heading';
import { PrintButton } from '@/components/print-button';
import { PublicationShell } from '@/components/publication-shell';
import { citationSourceHref } from '@/scripts/reader-citations.mjs';
import { currentPart1Reread, currentPart2Reread, currentPart3Reread, currentPart4Reread, currentPart5Reread, currentPart6Reread, currentPart7Reread, currentWholeBookReread } from '@/scripts/reader-current-expectations.mjs';
import { bookTopicPresentation, getPresentationUnits, getUnitHeadingPlan, printReadingEntryAnchor, readerParts } from '@/scripts/reader-numbering.mjs';
import { showEditorialHistoryInProse } from '@/scripts/reader-editorial-mode.mjs';
import { part4RereadSource } from '@/scripts/reader-part4-reread.mjs';
import { part5RereadSource } from '@/scripts/reader-part5-reread.mjs';
import { part6RereadSource } from '@/scripts/reader-part6-reread.mjs';
import { part7RereadSource } from '@/scripts/reader-part7-reread.mjs';
import { part3RereadSource } from '@/scripts/reader-part3-reread.mjs';
import { part2RereadSource } from '@/scripts/reader-part2-reread.mjs';
import { part1RereadSource } from '@/scripts/reader-part1-reread.mjs';
import { wholeBookRereadSource } from '@/scripts/reader-whole-book-reread.mjs';
import { printUnitAnchor } from '@/scripts/reader-book.mjs';

const EN_PARTS: Record<number, { label: string; title: string }> = {
  1: { label: 'Part I', title: 'Origins, Questions, and Methodological Framework' },
  2: { label: 'Part II', title: 'Functional Unit, Process Networks, and Life Cycle Inventory' },
  3: { label: 'Part III', title: 'Multifunctionality, Allocation, and System Boundaries' },
  4: { label: 'Part IV', title: 'Life Cycle Impact Assessment Pathways and Models' },
  5: { label: 'Part V', title: 'Normalization, Weighting, Regionalization, and Sustainability Extensions' },
  6: { label: 'Part VI', title: 'Data Quality, Uncertainty, Footprints, and Databases' },
  7: { label: 'Part VII', title: 'Case Synthesis, Interpretation, and Revisable Judgment' },
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'Continuous Reading & Print Edition',
      description: 'Complete continuous reading and printable English edition covering all 7 parts, 32 chapters, 5 topical essays, 5 appendices, and references.',
    };
  }
  return { title: '书籍目录、连续阅读与打印' };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const units = getPresentationUnits('book');
  const frontMatter = units.filter(unit => unit.kind === 'front-matter');
  const topics = units.filter(unit => unit.kind === 'topic');
  const appendices = units.filter(unit => unit.kind === 'appendix');

  if (lang === 'en') {
    const enPagesByKey = new Map<string, ReaderPage>(
      getSource('en').getPages().map(page => [logicalPageUrl(page.url), page as ReaderPage]),
    );
    const enUnitLabel = (unit: typeof units[number], idx: number) => {
      if (unit.kind === 'chapter') return `Chapter ${unit.ordinal}`;
      if (unit.kind === 'topic') return `Topic ${idx + 1}`;
      if (unit.kind === 'appendix') return `Appendix ${String.fromCharCode(65 + idx)}`;
      return undefined;
    };
    const renderEnTocItems = (items: typeof units) =>
      items.map((unit, idx) => {
        const page = enPagesByKey.get(unit.key);
        if (!page) return null;
        return (
          <li key={unit.key}>
            <a href={`#en-${printUnitAnchor(unit.key)}`}>
              <NumberedTitle number={enUnitLabel(unit, idx)}>{page.data.title}</NumberedTitle>
            </a>
          </li>
        );
      });
    const renderEnArticle = (unit: typeof units[number], idx: number) => {
      const page = enPagesByKey.get(unit.key);
      if (!page) return null;
      const id = `en-${printUnitAnchor(unit.key)}`;
      return (
        <article className="print-chapter prose" key={unit.key} id={id}>
          <NumberedHeading level={unit.kind === 'front-matter' ? 2 : 3} number={enUnitLabel(unit, idx)}>
            {page.data.title}
          </NumberedHeading>
          {unit.kind !== 'front-matter' && page.data.description && <p>{page.data.description}</p>}
          <EnChapterContent page={page} print />
        </article>
      );
    };

    return (
      <PublicationShell
        lang="en"
        title="The Past and Present of Life Cycle Assessment"
        description="Complete continuous reading and print edition. Arranged by part and chapter, followed by topical essays, appendices, and primary references."
      >
        <div className="print-controls">
          <PrintButton />
          <p>
            The English web chapters and continuous print edition follow the same 32-chapter numbering. See the{' '}
            <Link href="/en/coverage/">Book Guide</Link> for structured navigation. When citing, please record the chapter title, URL, version, and access date.
          </p>
        </div>
        <nav aria-label="Book Contents" className="reader-book-contents">
          <h2>Contents</h2>
          <ul>{renderEnTocItems(frontMatter)}</ul>
          {readerParts.map(part => {
            const enPart = EN_PARTS[part.number];
            return (
              <section key={part.number}>
                <h3>
                  <a href={`#en-print-part-${part.number}`}>
                    <NumberedTitle number={enPart?.label ?? `Part ${part.number}`}>
                      {enPart?.title ?? part.title}
                    </NumberedTitle>
                  </a>
                </h3>
                <ul>{renderEnTocItems(units.filter(u => u.part === part.number))}</ul>
              </section>
            );
          })}
          <h3>Topical Essays</h3>
          <ul>{renderEnTocItems(topics)}</ul>
          <h3>Appendices</h3>
          <ul>{renderEnTocItems(appendices)}</ul>
          <p><a href="#en-print-references">References</a></p>
        </nav>

        <div className="print-book">
          {frontMatter.map((u, idx) => renderEnArticle(u, idx))}
          {readerParts.map(part => {
            const enPart = EN_PARTS[part.number];
            return (
              <section className="print-part" key={part.number}>
                <h2 id={`en-print-part-${part.number}`}>
                  <NumberedTitle number={enPart?.label ?? `Part ${part.number}`}>
                    {enPart?.title ?? part.title}
                  </NumberedTitle>
                </h2>
                {units.filter(u => u.part === part.number).map((u, idx) => renderEnArticle(u, idx))}
              </section>
            );
          })}
          <section className="print-part">
            <h2>Topical Essays</h2>
            {topics.map((u, idx) => renderEnArticle(u, idx))}
          </section>
          <section className="print-part">
            <h2>Appendices</h2>
            {appendices.map((u, idx) => renderEnArticle(u, idx))}
          </section>
          <section className="print-chapter" id="en-print-references">
            <h2>References</h2>
            {catalog.sources.map(item => (
              <div className="evidence-item" key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.publisher}. {item.version}.</p>
                <a href={item.url} rel="noreferrer">Source link</a>
              </div>
            ))}
          </section>
        </div>
      </PublicationShell>
    );
  }

  const pages = getPrintPages();
  const byKey = new Map(pages.map(page=>[logicalPageUrl(page.url),page]));
  const tocLinks = (items: typeof units) => items.map(unit =>
    <li key={unit.key}><a href={`#${printReadingEntryAnchor(unit.key)}`} data-reader-toc-unit={unit.key}><NumberedTitle number={unit.label}>{unit.title}</NumberedTitle></a>
      {getUnitHeadingPlan('book',unit.key).some(heading=>heading.type==='mdx') && <ul>{getUnitHeadingPlan('book',unit.key).filter(heading=>heading.type==='mdx').map(heading=><li key={heading.key}><a href={`#${printUnitAnchor(unit.key)}-${heading.id}`} data-reader-route={unit.key} data-reader-toc-heading={heading.key}><NumberedTitle number={heading.number}>{heading.title}</NumberedTitle></a></li>)}</ul>}
    </li>);
  const article = (unit: typeof units[number]) => {
    const page = byKey.get(unit.key);
    if (!page || page.data.title!==unit.title) throw new Error(`Actual book title differs from numbering inventory: ${unit.key}`);
    const id = printUnitAnchor(unit.key);
    const entry = printReadingEntryAnchor(unit.key);
    return <article className="print-chapter prose" key={unit.key} id={id} data-reader-route={unit.key} data-reader-title={page.data.title}>
      <LegacyCitationAliases ids={getLegacyCitations(unit.key,true).aliases.get(id)} target={id} />
      <NumberedHeading level={unit.kind==='front-matter'?2:3} number={unit.label} id={entry === id ? undefined : entry} tabIndex={entry === id ? undefined : -1} data-reader-heading-key="@unit">{page.data.title}</NumberedHeading>
      {unit.kind!=='front-matter' && <p {...currentReaderOrdinaryAttributes(unit.key, true, 0)}>{page.data.description}</p>}
      <ChapterContent page={page} print />
    </article>;
  };
  return <PublicationShell title="生命周期评价的前世今生" description="书籍目录与连续阅读。正文按部、章、节展开，补充篇目与附录分别列后，注释随章。">
    <div className="print-controls"><PrintButton /><p>书籍与网页正文统一按连续章次编排；<Link href="/#web-contents">网页目录</Link>与连续阅读版逐章对应。引用时请记录章名、网址、版本和访问日期。</p></div>
    <PublicationNote />
    <nav aria-label="书籍目录" data-reader-contents="book" className="reader-book-contents">
      <h2>书籍目录</h2>
      <ul>{tocLinks(frontMatter)}</ul>
      {readerParts.map(part=><section key={part.number}><h3 data-reader-toc-part={part.number}><a href={`#print-part-${part.number}`}><NumberedTitle number={part.label}>{part.title}</NumberedTitle></a></h3><ul>{tocLinks(units.filter(unit=>unit.part===part.number))}</ul></section>)}
      <h3 data-reader-book-notes-heading="contents">{bookTopicPresentation.title}</h3><ul>{tocLinks(topics)}</ul>
      <h3>附录</h3><ul>{tocLinks(appendices)}</ul>
      <p><a href="#print-references">参考文献</a></p>
    </nav>
    <div className="print-book">
      {frontMatter.map(article)}
      {readerParts.map(part=><section className="print-part" data-reader-part-group={part.number} key={part.number}>
        <><h2 id={`print-part-${part.number}`} data-reader-part={part.number}><NumberedTitle number={part.label}>{part.title}</NumberedTitle></h2>
          <CopyeditHistoricalTitle path="/print" id={`print-part-${part.number}`} /></>
        <p className="print-part-introduction">{part.introduction}</p>
        {showEditorialHistoryInProse() && currentWholeBookReread && part.number === 4 && <details className="legacy-citation-context" data-whole-book-reread-part="4">
          <summary><time dateTime={wholeBookRereadSource.date}>{wholeBookRereadSource.date}</time> 版第四部导言范围</summary>
          <p>{'前版导言：“'}{currentWholeBookReread.partIntroduction.from}{'” '}<a href={citationSourceHref(wholeBookRereadSource.commit)} data-whole-book-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart1Reread && part.number === 1 && <details className="legacy-citation-context" data-part1-reread-part="1">
          <summary><time dateTime={part1RereadSource.date}>{part1RereadSource.date}</time> 版第一部导言范围</summary>
          <p>{'前版导言：“'}{currentPart1Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part1RereadSource.commit)} data-part1-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart2Reread && part.number === 2 && <details className="legacy-citation-context" data-part2-reread-part="2">
          <summary><time dateTime={part2RereadSource.date}>{part2RereadSource.date}</time> 版第二部导言范围</summary>
          <p>{'前版导言：“'}{currentPart2Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part2RereadSource.commit)} data-part2-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart3Reread && part.number === 3 && <details className="legacy-citation-context" data-part3-reread-part="3">
          <summary><time dateTime={part3RereadSource.date}>{part3RereadSource.date}</time> 版第三部导言范围</summary>
          <p>{'前版导言：“'}{currentPart3Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part3RereadSource.commit)} data-part3-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart4Reread && part.number === 4 && <details className="legacy-citation-context" data-part4-reread-part="4">
          <summary><time dateTime={part4RereadSource.date}>{part4RereadSource.date}</time> 版第四部导言范围</summary>
          <p>{'前版导言：“'}{currentPart4Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part4RereadSource.commit)} data-part4-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart5Reread && part.number === 5 && <details className="legacy-citation-context" data-part5-reread-part="5">
          <summary><time dateTime={part5RereadSource.date}>{part5RereadSource.date}</time> 版第五部导言范围</summary>
          <p>{'前版导言：“'}{currentPart5Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part5RereadSource.commit)} data-part5-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart6Reread && part.number === 6 && <details className="legacy-citation-context" data-part6-reread-part="6">
          <summary><time dateTime={part6RereadSource.date}>{part6RereadSource.date}</time> 版第六部导言范围</summary>
          <p>{'前版导言：“'}{currentPart6Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part6RereadSource.commit)} data-part6-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {showEditorialHistoryInProse() && currentPart7Reread && part.number === 7 && <details className="legacy-citation-context" data-part7-reread-part="7">
          <summary><time dateTime={part7RereadSource.date}>{part7RereadSource.date}</time> 版第七部导言范围</summary>
          <p>{'前版导言：“'}{currentPart7Reread.partIntroduction.from}{'” '}<a href={citationSourceHref(part7RereadSource.commit)} data-part7-reread-part-source="">查看该版源文件</a></p>
        </details>}
        {units.filter(unit=>unit.part===part.number).map(article)}
      </section>)}
      <section className="print-part"><h2 data-reader-book-notes-heading="body">{bookTopicPresentation.title}</h2>{topics.map(article)}</section>
      <section className="print-part"><h2>附录</h2>{appendices.map(article)}</section>
      <section className="print-chapter" id="print-references"><h2>参考文献</h2>{catalog.sources.map(item=><div className="evidence-item" key={item.id}><strong>{item.title}</strong><p>{item.publisher}。{item.version}。</p><a href={item.url}>文献链接</a></div>)}</section>
    </div>
  </PublicationShell>;
}
