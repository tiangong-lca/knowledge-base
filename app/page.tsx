import Link from 'next/link';
import { getBookPages, getOrderedPages } from '@/lib/reader-book';
export default function Home() {
  const chapters = getBookPages();
  const topics = getOrderedPages().filter(p => p.slugs.length === 1 && p.slugs[0] !== 'book');
  return <main id="main-content">
    <section className="home-intro"><div className="home-copy">
      <p className="publication-name">天工 LCA 知识库</p><h1>生命周期评价的<br/>前世今生</h1>
      <p className="home-lead">一件物品背后的世界，如何进入计算，又如何成为环境判断？从早期研究到方法分歧，沿着概念、模型与证据，理解生命周期评价。</p>
      <div className="home-actions"><Link className="primary-link" href="/docs/">开始阅读</Link><Link className="secondary-link" href="/docs/book/">全书导览</Link></div>
    </div><div className="knowledge-figure" aria-label="阅读主线：现实问题经过概念、方法和模型，形成有依据的判断">
      <div className="figure-source">现实中的问题</div><div className="figure-branches"><span>概念的来历</span><span>方法的选择</span><span>模型的含义</span></div><div className="figure-line"/><div className="figure-center">沿着证据<br/><strong>理解判断</strong></div><div className="figure-foot">历史 · 方法 · 论证</div>
    </div></section>
    <section className="reading-section"><div className="section-heading"><h2>沿全书主线阅读</h2></div><div className="chapter-list">{chapters.map((page,index) => <Link className="chapter-row" href={page.url} key={page.url}><span className="chapter-position">{index+1}</span><div><h3>{page.data.title}</h3><p>{page.data.description}</p></div><span className="chapter-action">阅读</span></Link>)}</div></section>
    <section className="reading-section"><div className="section-heading"><h2>概念与实践专题</h2></div><div className="chapter-list">{topics.map(page => <Link className="chapter-row" href={page.url} key={page.url}><div><h3>{page.data.title}</h3><p>{page.data.description}</p></div><span className="chapter-action">查阅</span></Link>)}</div></section>
    <section className="evidence-overview"><div><h2>从论述回到出处</h2><p>章末注释列出文献、原文位置与适用条件。遇到同名概念、方法分歧或不同版本时，可以沿引文进一步比较。</p></div><div className="overview-links"><Link href="/concepts/">概念索引</Link><Link href="/research/">参考文献</Link><Link href="/sources/">引文出处</Link><Link href="/changes/">版本与勘误</Link></div></section>
  </main>;
}
