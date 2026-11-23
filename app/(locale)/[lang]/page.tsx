import { notFound } from 'next/navigation';
import { isSupportedLocale } from '@/lib/i18n';
import { ZhHomePage } from '@/components/zh-home-page';
import { EnHomePage } from '@/components/en-home-page';

export default async function LocaleHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  return lang === 'en' ? <EnHomePage /> : <ZhHomePage />;
}
