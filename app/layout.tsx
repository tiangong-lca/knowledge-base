import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { SiteHeader, type SearchEntry } from '@/components/site-header';
import { source } from '@/lib/source';
import catalog from '@/lib/catalog';
import './global.css';
export const metadata: Metadata = { title: { default: 'LCA Living Knowledge Base and Review', template: '%s | 天工 LCA 知识库' }, description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。持续修订的 LCA 知识库与研究综述。' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries: SearchEntry[] = [
    ...source.getPages().map(p=>({ title:p.data.title, text:p.data.description??'', url:p.url, kind:'章节' })),
    ...catalog.claims.filter(c=>c.status==='reviewed').map(c=>({title:c.text,text:c.scope,url:`/claims/#${c.id}`,kind:'观点'})),
    ...catalog.concepts.map(c=>({title:c.label,text:`${c.english} ${c.aliases.join(' ')}`,url:`/concepts/#${c.id}`,kind:'概念'})),
    ...catalog.sources.map(s=>({title:s.title,text:`${s.publisher} ${s.version}`,url:`/sources/#${s.id}`,kind:'来源'})),
  ];
  return <html lang="zh-CN" suppressHydrationWarning><body><RootProvider search={{enabled:false}}><a className="skip-link" href="#main-content">跳转到正文</a><SiteHeader entries={entries}/>{children}<footer className="site-footer"><div><strong>天工 LCA 知识库</strong><p>每个判断都可以追问，每次修订都留下依据。</p></div><nav aria-label="页脚导航"><a href="/changes/">版本与勘误</a><a href="/print/">打印与引用</a><a href="https://github.com/tiangong-lca/knowledge-base">GitHub</a></nav></footer></RootProvider></body></html>;
}
