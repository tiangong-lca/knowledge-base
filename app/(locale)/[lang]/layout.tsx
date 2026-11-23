import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteChrome, SiteProvider } from '@/components/site-header';
import { EN_PUBLIC_ENABLED, SUPPORTED_LOCALES, isSupportedLocale, toHtmlLang, type Locale } from '@/lib/i18n';
import { getPublishedPaths } from '@/lib/search-entries';
import { homePath, languageAlternates, localeMetadata, siteOrigin } from '@/lib/seo-policy.mjs';
import '../../global.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isSupportedLocale(lang) ? lang : 'zh';
  const meta = localeMetadata[locale];
  const isEn = locale === 'en';
  return {
    metadataBase: new URL(siteOrigin),
    title: { default: meta.title, template: meta.titleTemplate },
    description: meta.description,
    robots: isEn && !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: homePath(locale),
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
      locale: meta.openGraphLocale,
      alternateLocale: isEn ? ['zh_CN'] : (EN_PUBLIC_ENABLED ? ['en_US'] : []),
      siteName: meta.siteName,
      title: meta.title,
      description: meta.description,
      images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: meta.siteName }],
    },
    twitter: {
      card: 'summary',
      title: `${meta.title} | ${meta.siteName}`,
      description: meta.description,
      images: ['/icon-512x512.png'],
    },
  };
}

export default async function LocaleRootLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const locale: Locale = lang;
  const publishedPaths = getPublishedPaths();
  return (
    <html lang={toHtmlLang(locale)} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <SiteProvider lang={locale} publishedPaths={publishedPaths}>
          <a className="skip-link" href="#main-content">
            {locale === 'en' ? 'Skip to main content' : '跳转到正文'}
          </a>
          <SiteChrome lang={locale}>{children}</SiteChrome>
        </SiteProvider>
      </body>
    </html>
  );
}
