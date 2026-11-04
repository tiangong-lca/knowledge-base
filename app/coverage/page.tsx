import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { getBookPages, getOrderedPages } from '@/lib/reader-book';
export const metadata = { title: '全书导览' };
export default function Page() {
  const chapters=getBookPages(), topics=getOrderedPages().filter(p=>p.slugs.length===1&&p.slugs[0]!=='book');
  return <PublicationShell title="全书导览" description="沿问题的形成、模型的建立与结果的解释，阅读生命周期评价。">
    <p>前面的历史说明问题为何出现，方法章节追踪现实怎样进入模型，解释章节再把结果接回它能够支持的判断。各章可以顺序阅读，也可以从具体概念或案例进入。</p>
    <h2>正文章节</h2><ol>{chapters.map(page=><li key={page.url}><Link href={page.url}>{page.data.title}</Link><p>{page.data.description}</p></li>)}</ol>
    <h2>概念与实践专题</h2><ul>{topics.map(page=><li key={page.url}><Link href={page.url}>{page.data.title}</Link></li>)}</ul>
    <p><Link href="/research/">参考文献</Link>与<Link href="/concepts/">概念索引</Link>提供交叉查阅入口。</p>
  </PublicationShell>;
}
