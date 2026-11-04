import { PublicationNote } from '@/components/publication-note';
import Link from 'next/link';
import catalog from '@/lib/catalog';
import { getBookPages, getOrderedPages } from '@/lib/reader-book';
import { ChapterContent } from '@/components/chapter-content';
import { PrintButton } from '@/components/print-button';
import { PublicationShell } from '@/components/publication-shell';
export const metadata = { title: '连续阅读与打印' };
export default function Page() {
  const chapters=getBookPages(), topics=getOrderedPages().filter(p=>p.slugs.length===1&&p.slugs[0]!=='book');
  const pages=[...chapters,...topics];
  return <PublicationShell title="生命周期评价的前世今生" description="连续阅读与打印。正文章节和补充专题沿目录顺序展开，注释随章列出。">
    <div className="print-controls"><PrintButton /><p>引用网页时请记录篇名、网址与访问日期。各章原始来源见章末注释。</p></div>
    <PublicationNote />
    <nav aria-label="合订本目录"><h2>目录</h2><ol className="list-decimal ps-6">{chapters.map((page,index)=><li key={page.url}><Link href={`#print-chapter-${index+1}`}>{page.data.title}</Link></li>)}</ol><h3>概念与实践专题</h3><ul>{topics.map((page,index)=><li key={page.url}><Link href={`#print-chapter-${chapters.length+index+1}`}>{page.data.title}</Link></li>)}</ul><p><Link href="#print-references">参考文献</Link></p></nav>
    <div className="print-book">{pages.map((page,index)=><article className="print-chapter prose" key={page.url} id={`print-chapter-${index+1}`}>
      <h2>{index<chapters.length?`${index+1}　`:''}{page.data.title}</h2><p>{page.data.description}</p>
      <ChapterContent page={page} anchorPrefix={`print-chapter-${index+1}`} print />
    </article>)}
      <section className="print-chapter" id="print-references"><h2>参考文献</h2>{catalog.sources.map(item=><div className="evidence-item" key={item.id}><strong>{item.title}</strong><p>{item.publisher}。{item.version}。</p><a href={item.url}>文献链接</a></div>)}</section>
    </div>
  </PublicationShell>;
}
