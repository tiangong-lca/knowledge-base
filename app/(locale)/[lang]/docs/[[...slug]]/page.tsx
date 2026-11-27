import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { availableDocLocales, getSource } from '@/lib/source';
import { currentReaderOrdinaryAttributes, ChapterContent } from '@/components/chapter-content';
import { EnChapterContent } from '@/components/en-chapter-content';
import { NumberedTitle } from '@/components/numbered-heading';
import { EN_PARTS, getEnNumberedToc, getEnUnitLabel, getNumberedToc, getUnitNumbering, getWebsitePagination } from '@/lib/reader-numbering';
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

  if (locale === 'en') {
    const logicalEnUrl = page.url.replace(/^\/en(?=\/|$)/, '') || '/';
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
          Web Reading Contents
          {enPart ? ` · ${enPart.label} · ${enPart.title}` : ''} ·{' '}
          <Link href="/en/print/">Continuous Reading &amp; Print</Link>
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
        网页细读目录{unit.partTitle ? ` · ${unit.partLabel} ${unit.partTitle}` : ''} ·{' '}
        <Link href="/zh/print/">书籍目录与连续阅读</Link>
      </p>
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
