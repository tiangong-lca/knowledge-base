import { PublicationShell } from '@/components/publication-shell';
import { getBuildIdentity } from '@/lib/build-identity';
export const metadata = { title: '版本与勘误' };
export default function Page() {
  const identity=getBuildIdentity();
  return <PublicationShell title="版本与勘误" description="《生命周期评价的前世今生》的在线文本与勘误入口。">
    <h2>在线文本</h2><p>引用网页时，请记录篇名、网址和访问日期；引用原始研究时，以章末注释列明的作品与版本为准。历史指南的年份与方法版本，是其解释范围的一部分。</p>
    <p><a href={identity.sourceUrl}>查看本版文本</a> · <a href="/print/">连续阅读与打印</a></p>
    <h2>勘误</h2><p>如发现引文、算式或论述存在问题，可提供篇名、相关段落与原始出处，<a href={identity.errataUrl}>提出勘误或补充证据</a>。第三方文献的更正需要同时辨认原版和更正版本；不能只改一个数字而丢失它的来源。</p>
    <h2>编写说明</h2><p>本书结合文献分析与明确标识的教学推演。来源核查由 AI 辅助完成，不能视为独立领域专家评审，也不构成方法、软件或产品的认证。</p>
    <p>研究与开发记录保存在<a href="https://github.com/tiangong-lca/knowledge-base/tree/main/_docs">项目开发文档</a>，与正文分开。原始来源保留各自权利。</p>
  </PublicationShell>;
}
