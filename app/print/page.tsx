import { currentFlowBoundary } from '@/scripts/reader-current-expectations.mjs';
import { flowBoundaryOrdinaryId } from '@/scripts/reader-flow-boundary.mjs';
import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { PublicationNote } from '@/components/publication-note';
import Link from 'next/link';
import catalog from '@/lib/catalog';
import { getLegacyCitations, getPrintPages } from '@/lib/reader-book';
import { ChapterContent, LegacyCitationAliases } from '@/components/chapter-content';
import { NumberedHeading, NumberedTitle } from '@/components/numbered-heading';
import { PrintButton } from '@/components/print-button';
import { PublicationShell } from '@/components/publication-shell';
import { bookTopicPresentation, getPresentationUnits, getUnitHeadingPlan, printReadingEntryAnchor, readerParts } from '@/scripts/reader-numbering.mjs';
import { printUnitAnchor } from '@/scripts/reader-book.mjs';

export const metadata = { title: '书籍目录、连续阅读与打印' };

export default function Page() {
  const pages = getPrintPages();
  const units = getPresentationUnits('book');
  const byKey = new Map(pages.map(page=>[page.url,page]));
  const frontMatter = units.filter(unit=>unit.kind==='front-matter');
  const topics = units.filter(unit=>unit.kind==='topic');
  const appendices = units.filter(unit=>unit.kind==='appendix');
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
      <LegacyCitationAliases ids={getLegacyCitations(page.url,true).aliases.get(id)} target={id} />
      <NumberedHeading level={unit.kind==='front-matter'?2:3} number={unit.label} id={entry === id ? undefined : entry} tabIndex={entry === id ? undefined : -1} data-reader-heading-key="@unit">{page.data.title}</NumberedHeading>
      {unit.kind!=='front-matter' && <p id={currentFlowBoundary ? flowBoundaryOrdinaryId(unit.key, true, 0) : undefined}>{page.data.description}</p>}
      <ChapterContent page={page} print />
    </article>;
  };
  return <PublicationShell title="生命周期评价的前世今生" description="书籍目录与连续阅读。正文按部、章、节展开，补充篇目与附录分别列后，注释随章。">
    <div className="print-controls"><PrintButton /><p>书籍按连续章次编排；<Link href="/#web-contents">网页细读目录</Link>保留细分篇章。引用时请记录篇名、网址、版本和访问日期。</p></div>
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
        {units.filter(unit=>unit.part===part.number).map(article)}
      </section>)}
      <section className="print-part"><h2 data-reader-book-notes-heading="body">{bookTopicPresentation.title}</h2>{topics.map(article)}</section>
      <section className="print-part"><h2>附录</h2>{appendices.map(article)}</section>
      <section className="print-chapter" id="print-references"><h2>参考文献</h2>{catalog.sources.map(item=><div className="evidence-item" key={item.id}><strong>{item.title}</strong><p>{item.publisher}。{item.version}。</p><a href={item.url}>文献链接</a></div>)}</section>
    </div>
  </PublicationShell>;
}
