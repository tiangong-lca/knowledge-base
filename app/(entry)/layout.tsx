import type { Metadata } from 'next';
import { SiteChrome, SiteProvider } from '@/components/site-header';
import { getPublishedPaths, getSearchEntries } from '@/lib/search-entries';
import { EN_PUBLIC_ENABLED } from '@/lib/i18n';
import { languageAlternates, localeMetadata, siteOrigin } from '@/lib/seo-policy.mjs';
import '../global.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: localeMetadata.zh.title, template: localeMetadata.zh.titleTemplate },
  description: localeMetadata.zh.description,
  alternates: {
    canonical: '/',
    languages: languageAlternates('', EN_PUBLIC_ENABLED ? ['zh', 'en'] : ['zh']),
  },
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
    siteName: localeMetadata.zh.siteName,
    title: localeMetadata.zh.title,
    description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。七部 32 章、五篇专题与五份附录的中文 LCA 知识库。',
    images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: localeMetadata.zh.siteName }],
  },
  twitter: {
    card: 'summary',
    title: `${localeMetadata.zh.title} | ${localeMetadata.zh.siteName}`,
    description: localeMetadata.zh.description,
    images: ['/icon-512x512.png'],
  },
};

export default function EntryRootLayout({ children }: { children: React.ReactNode }) {
  const entries = getSearchEntries('zh');
  const publishedPaths = getPublishedPaths();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <SiteProvider lang="zh" entries={entries} publishedPaths={publishedPaths}>
          <a className="skip-link" href="#main-content">跳转到正文</a>
          <SiteChrome lang="zh">{children}</SiteChrome>
        </SiteProvider>
      </body>
    </html>
  );
}
