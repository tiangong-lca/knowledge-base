import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import { EnInPrepPage } from '@/components/en-in-prep-page';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import catalog from '@/lib/catalog';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'Notes & Claims',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: '注释与论证' };
}

export default async function LocalizedClaimsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  if (lang === 'en') {
    return (
      <EnInPrepPage
        title="Notes & Claims"
        description="Canonical claim statements, evidence bindings, validity scopes, and premises."
        zhHref="/zh/claims/"
        zhLabel="View Chinese Notes & Claims"
      />
    );
  }
  return <PublicationShell title="注释与论证" description="查阅论述的文献依据、推理联系和适用范围。">
    <p>各章注释按章内出现顺序编号；这里汇集全书论述，供交叉查阅。文献陈述、解释、综合论证、计算与分析建议具有不同的依据，不能互相替代。</p>
    {catalog.claims.filter(c => c.status === 'reviewed').map(c => <Claim id={c.id} anchor key={c.id} />)}
  </PublicationShell>;
}
