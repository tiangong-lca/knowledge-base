import { PublicationNote } from '@/components/publication-note';
import Link from 'next/link';
import catalog from '@/lib/catalog';
import { getLegacyCitations, getPrintPages, printFrontMatterCount } from '@/lib/reader-book';
import { ChapterContent, LegacyCitationAliases } from '@/components/chapter-content';
import { PrintButton } from '@/components/print-button';
import { PublicationShell } from '@/components/publication-shell';
import { printUnitAnchor } from '@/scripts/reader-book.mjs';

export const metadata = { title: '连续阅读与打印' };

export default function Page() {
  const pages = getPrintPages();
  const frontMatter = pages.slice(0, printFrontMatterCount);
  const body = pages.slice(printFrontMatterCount);
  const chapters = body.filter(page => page.slugs[0] === 'book');
  const topics = body.filter(page => page.slugs[0] !== 'book' && page.slugs[0] !== 'appendices');
  const appendices = body.filter(page => page.slugs[0] === 'appendices');
  const chapterNumbers = new Map(chapters.map((page, index) => [page.url, index + 1]));
  const tocLinks = (units: typeof pages) => units.map(page =>
    <li key={page.url}><Link href={`#${printUnitAnchor(page.url)}`}>{page.data.title}</Link></li>);

  return <PublicationShell title="生命周期评价的前世今生" description="连续阅读与打印。正文章节、补充专题和附录沿目录顺序展开，注释随章列出。">
    <div className="print-controls"><PrintButton /><p>引用时请记录篇名、网址、版本和访问日期。各章原始来源见章末注释。</p></div>
    <PublicationNote />
    <nav aria-label="合订本目录">
      <h2>目录</h2>
      {frontMatter.length > 0 && <ul>{tocLinks(frontMatter)}</ul>}
      <ol className="list-decimal ps-6">{tocLinks(chapters)}</ol>
      <h3>概念与实践专题</h3><ul>{tocLinks(topics)}</ul>
      {appendices.length > 0 && <><h3>附录</h3><ul>{tocLinks(appendices)}</ul></>}
      <p><Link href="#print-references">参考文献</Link></p>
    </nav>
    <div className="print-book">{pages.map((page, index) => {
      const id = printUnitAnchor(page.url);
      const chapterIndex = index - printFrontMatterCount;
      const chapterNumber = chapterNumbers.get(page.url);
      return <article className="print-chapter prose" key={page.url} id={id} data-reader-route={page.url}>
        <LegacyCitationAliases ids={getLegacyCitations(page.url, true).aliases.get(id)} target={id} />
        <h2>{chapterNumber ? `${chapterNumber}　` : ''}{page.data.title}</h2>
        {chapterIndex >= 0 && <p>{page.data.description}</p>}
        <ChapterContent page={page} print />
      </article>;
    })}
      <section className="print-chapter" id="print-references"><h2>参考文献</h2>{catalog.sources.map(item => <div className="evidence-item" key={item.id}><strong>{item.title}</strong><p>{item.publisher}。{item.version}。</p><a href={item.url}>文献链接</a></div>)}</section>
    </div>
  </PublicationShell>;
}
