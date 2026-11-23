import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { LcaTimeline } from '@/components/lca-timeline';

export const metadata: Metadata = {
  title: '生命周期评价发展大事记',
  description: '从 1969 年饮料容器账本到 2026 年欧盟数字产品护照与前瞻动态方法，按时期与主题可视化串联全书关键历史节点、一手来源核验状态与对应正文。',
  alternates: {
    canonical: '/docs/appendices/lca-timeline/',
  },
};

export default function TimelinePage() {
  return (
    <PublicationShell
      title="生命周期评价发展大事记（1969–2026）"
      description="沿着五个历史时期与四条方法主线，串联起从早期包装资源账本、SETAC 与 ISO 框架成型、数据库与共识模型演进，到欧盟强制法规与前瞻动态 LCA 的关键节点。点击任意节点下方的章名或一手来源即可直达本书正文与引文出处。"
    >
      <p className="subtle">
        本时间线已同步编入书籍{' '}
        <Link href="/docs/appendices/lca-timeline/">附录 E《生命周期评价发展大事记》</Link>
        ，亦可在 <Link href="/print/">连续阅读与打印版</Link> 末尾查看完整纸面排版。所有节点均公开标示一手来源核验状态（已核对一手来源／待核）。
      </p>
      <LcaTimeline />
    </PublicationShell>
  );
}
