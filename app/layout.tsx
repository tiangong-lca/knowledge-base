import type { Metadata } from 'next';
import { SiteChrome, SiteProvider, type SearchEntry } from '@/components/site-header';
import { source } from '@/lib/source';
import catalog from '@/lib/catalog';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://prism.tiangong.earth'),
  title: { default: '生命周期评价的前世今生', template: '%s | 天工 LCA 知识库' },
  description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。持续修订的 LCA 知识库与研究综述。',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-light.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '天工 LCA 知识库',
    title: '生命周期评价的前世今生',
    description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。七部 32 章、五篇专题与五份附录的中文 LCA 知识库。',
    images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: '天工 LCA 知识库' }],
  },
  twitter: {
    card: 'summary',
    title: '生命周期评价的前世今生 | 天工 LCA 知识库',
    description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。',
    images: ['/icon-512x512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries: SearchEntry[] = [
    {
      title: '生命周期评价发展大事记（1969–2026）',
      text: '可视化历史时间线：早期资源账本、SETAC 与 CML 框架成型、ISO 标准化、数据库与共识模型、欧盟法规与前瞻动态 LCA。',
      url: '/timeline/',
      kind: '大事记',
    },
    ...source.getPages().map(p => ({ title: p.data.title, text: p.data.description ?? '', url: p.url, kind: '章节' })),
    ...catalog.claims.filter(c => c.status === 'reviewed').map(c => ({ title: c.text, text: c.scope, url: `/claims/#${c.id}`, kind: '论述' })),
    ...catalog.concepts.map(c => ({ title: c.label, text: `${c.english} ${c.aliases.join(' ')}`, url: `/concepts/#${c.id}`, kind: '概念' })),
    ...catalog.sources.map(s => ({ title: s.title, text: `${s.publisher} ${s.version}`, url: `/sources/#${s.id}`, kind: '来源' })),
  ];
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <SiteProvider entries={entries}>
          <a className="skip-link" href="#main-content">跳转到正文</a>
          <SiteChrome>{children}</SiteChrome>
        </SiteProvider>
      </body>
    </html>
  );
}
