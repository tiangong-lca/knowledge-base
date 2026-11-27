import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationShell } from '@/components/publication-shell';
import { LcaTimeline } from '@/components/lca-timeline';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: 'LCA Historical Timeline (1969–2026)',
      description: 'Interactive timeline of 27 life cycle assessment milestones across five historical eras, with primary-source verification badges and direct chapter links.',
      alternates: { canonical: '/en/docs/appendices/lca-timeline/' },
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return {
    title: '生命周期评价发展大事记',
    description: '从 1969 年饮料容器账本到 2026 年欧盟数字产品护照与前瞻动态方法，按时期与主题可视化串联全书关键历史节点、一手来源核验状态与对应正文。',
    alternates: { canonical: '/zh/docs/appendices/lca-timeline/' },
  };
}

export default async function LocalizedTimelinePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        title="LCA Historical Timeline (1969–2026)"
        description="Trace 27 key milestones across five historical eras and four methodological tracks—from early beverage container ledgers and ISO standardization to EU regulatory footprints and prospective dynamic LCA."
      >
        <p className="subtle">
          This timeline is also included in the monograph as{' '}
          <Link href="/en/docs/appendices/lca-timeline/">Appendix E: Historical Timeline of Life Cycle Assessment</Link>
          , and appears at the end of the <Link href="/en/print/">{UI_SURFACES.fullTextPrint.en}</Link>. Every milestone publicly displays its primary-source verification status (Primary source verified / Unverified).
        </p>
        <LcaTimeline lang="en" />
      </PublicationShell>
    );
  }
  return (
    <PublicationShell
      title="生命周期评价发展大事记（1969–2026）"
      description="沿着五个历史时期与四条方法主线，串联起从早期包装资源账本、SETAC 与 ISO 框架成型、数据库与共识模型演进，到欧盟强制法规与前瞻动态 LCA 的关键节点。点击任意节点下方的章名或一手来源即可直达本书正文与引文出处。"
    >
      <p className="subtle">
        本时间线已同步编入书籍{' '}
        <Link href="/zh/docs/appendices/lca-timeline/">附录 E《生命周期评价发展大事记》</Link>
        ，亦可在 <Link href="/zh/print/">{UI_SURFACES.fullTextPrint.zh}</Link> 末尾查看完整纸面排版。所有节点均公开标示一手来源核验状态（已核对一手来源／待核）。
      </p>
      <LcaTimeline />
    </PublicationShell>
  );
}
