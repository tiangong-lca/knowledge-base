import type { Metadata } from 'next';
import { SiteChrome, SiteProvider, type SearchEntry } from '@/components/site-header';
import { source } from '@/lib/source';
import catalog from '@/lib/catalog';
import './global.css';
export const metadata: Metadata = { title: { default: '生命周期评价的前世今生', template: '%s | 天工 LCA 知识库' }, description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。持续修订的 LCA 知识库与研究综述。' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries: SearchEntry[] = [
    ...source.getPages().map(p=>({ title:p.data.title, text:p.data.description??'', url:p.url, kind:'章节' })),
    ...catalog.claims.filter(c=>c.status==='reviewed').map(c=>({title:c.text,text:c.scope,url:`/claims/#${c.id}`,kind:'观点'})),
    ...catalog.concepts.map(c=>({title:c.label,text:`${c.english} ${c.aliases.join(' ')}`,url:`/concepts/#${c.id}`,kind:'概念'})),
    ...catalog.sources.map(s=>({title:s.title,text:`${s.publisher} ${s.version}`,url:`/sources/#${s.id}`,kind:'来源'})),
  ];
  return <html lang="zh-CN" suppressHydrationWarning><body className="flex min-h-screen flex-col"><SiteProvider entries={entries}><a className="skip-link" href="#main-content">跳转到正文</a><SiteChrome>{children}</SiteChrome></SiteProvider></body></html>;
}
