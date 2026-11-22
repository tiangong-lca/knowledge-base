import type { Metadata } from 'next';
import { PublicationShell } from '@/components/publication-shell';
import { LcaTimeline } from '@/components/lca-timeline';

export const metadata: Metadata = {
  title: '生命周期评价发展大事记',
  description: '从 1969 年饮料容器账本到 2026 年欧盟数字产品护照与前瞻动态方法，按时期与主题可视化串联全书关键历史节点与对应正文。',
};

export default function TimelinePage() {
  return (
    <PublicationShell
      title="生命周期评价发展大事记（1969–2026）"
      description="沿着五个历史时期与四条方法主线，串联起从早期包装资源账本、SETAC 与 ISO 框架成型、数据库与共识模型演进，到欧盟强制法规与前瞻动态 LCA 的关键节点。点击任意节点下方的篇名即可直达本书正文。"
    >
      <LcaTimeline />
    </PublicationShell>
  );
}
