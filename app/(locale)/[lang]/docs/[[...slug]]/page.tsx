import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { availableDocLocales, getSource } from '@/lib/source';
import { currentReaderOrdinaryAttributes, ChapterContent } from '@/components/chapter-content';
import { EnChapterContent } from '@/components/en-chapter-content';
import { NumberedTitle } from '@/components/numbered-heading';
import { EN_PARTS, getEnNumberedToc, getEnUnitLabel, getNumberedToc, getUnitNumbering, getWebsitePagination } from '@/lib/reader-numbering';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { EN_PUBLIC_ENABLED, SUPPORTED_LOCALES, isSupportedLocale, type Locale } from '@/lib/i18n';
import { getMDXComponents } from '@/mdx-components';
import { languageAlternates } from '@/lib/seo-policy.mjs';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    getSource(lang as Locale).generateParams().map((entry) => ({ lang, slug: entry.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) return {};
  const locale: Locale = lang;
  const page = getSource(locale).getPage(slug);
  if (!page) return {};
  const logicalPath = `/docs${slug?.length ? `/${slug.join('/')}` : ''}`;
  const publishedLocales = availableDocLocales(slug).filter((l) => l === 'zh' || EN_PUBLIC_ENABLED);
  return {
    title: page.data.title,
    description: page.data.description,
    robots: locale === 'en' && !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: page.url.endsWith('/') ? page.url : `${page.url}/`,
      languages: languageAlternates(logicalPath, publishedLocales.length ? publishedLocales : ['zh']),
    },
  };
}

export default async function LocalizedDocsPage({ params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const locale: Locale = lang;
  const src = getSource(locale);
  const page = src.getPage(slug);
  if (!page) notFound();

  const counterpartLocales = availableDocLocales(slug);
  if (locale === 'en') {
    const logicalEnUrl = page.url.replace(/^\/en(?=\/|$)/, '') || '/';
    const zhCounterpartHref = `/zh${logicalEnUrl.endsWith('/') ? logicalEnUrl : `${logicalEnUrl}/`}`;
    const enUnit = getUnitNumbering('web', logicalEnUrl);
    const enPart = enUnit?.part ? EN_PARTS[enUnit.part] : undefined;
    const enLabel = enUnit ? getEnUnitLabel(enUnit) : undefined;
    return (
      <DocsPage
        toc={getEnNumberedToc(page)}
        footer={{
          className: 'docs-pagination',
          enabled: Boolean(slug?.length),
          items: getWebsitePagination(logicalEnUrl, src.getPages(), 'en'),
        }}
      >
        <p className="reader-view-label">
          {UI_SURFACES.contents.en}
          {enPart ? ` · ${enPart.label} · ${enPart.title}` : ''} ·{' '}
          <Link href="/en/print/">{UI_SURFACES.fullTextPrint.en}</Link>
          {counterpartLocales.includes('zh') && (
            <>
              {' · '}
              <Link href={zhCounterpartHref} hrefLang="zh-CN">中文版</Link>
            </>
          )}
        </p>
        <DocsTitle id="main-content" tabIndex={-1}>
          <NumberedTitle number={enLabel}>{page.data.title}</NumberedTitle>
        </DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <EnChapterContent page={page} />
        </DocsBody>
      </DocsPage>
    );
  }

  const logicalUrl = page.url.replace(/^\/zh(?=\/|$)/, '') || '/';
  const unit = getUnitNumbering('web', logicalUrl);
  if (!unit || unit.title !== page.data.title) {
    throw new Error(`Website title differs from numbered inventory: ${page.url}`);
  }
  const enCounterpartHref = `/en${logicalUrl.endsWith('/') ? logicalUrl : `${logicalUrl}/`}`;
  return (
    <DocsPage
      toc={getNumberedToc(page)}
      footer={{
        className: 'docs-pagination',
        enabled: Boolean(slug?.length),
        items: getWebsitePagination(logicalUrl, src.getPages()),
      }}
      data-reader-route={unit.key}
      data-reader-title={page.data.title}
    >
      <p className="reader-view-label">
        {UI_SURFACES.contents.zh}{unit.partTitle ? ` · ${unit.partLabel} ${unit.partTitle}` : ''} ·{' '}
        <Link href="/zh/print/">{UI_SURFACES.fullTextPrint.zh}</Link>
      </p>
      {EN_PUBLIC_ENABLED && counterpartLocales.includes('en') && (
        <nav
          aria-label="语言切换"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '-0.5rem',
            marginBottom: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--color-fd-muted-foreground)',
          }}
        >
          <Link href={enCounterpartHref} hrefLang="en" style={{ textDecoration: 'underline' }}>English</Link>
        </nav>
      )}
      <DocsTitle id="main-content" tabIndex={-1} data-reader-heading-key="@unit">
        <NumberedTitle number={unit.label}>{page.data.title}</NumberedTitle>
      </DocsTitle>
      <>
        <CopyeditHistoricalTitle path={logicalUrl} id="main-content" />
        <DocsDescription {...currentReaderOrdinaryAttributes(unit.key, false, 0)}>
          {page.data.description}
        </DocsDescription>
      </>
      <DocsBody><ChapterContent page={page} /></DocsBody>
    </DocsPage>
  );
}
