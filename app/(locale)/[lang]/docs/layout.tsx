import { notFound } from 'next/navigation';
import { SidebarKeyboard } from '@/components/sidebar-keyboard';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { getWebsiteTree } from '@/lib/reader-numbering';
import { isSupportedLocale, type Locale } from '@/lib/i18n';

export default async function LocalizedDocsLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const locale: Locale = lang;
  const rawTree = getSource(locale).getPageTree();
  const tree = getWebsiteTree(rawTree, locale);
  return (
    <DocsLayout {...baseOptions(locale)} tree={tree}>
      <SidebarKeyboard />
      {children}
    </DocsLayout>
  );
}
