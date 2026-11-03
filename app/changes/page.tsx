import { PublicationShell } from '@/components/publication-shell';
import { getBuildIdentity } from '@/lib/build-identity';

export const metadata = { title: '版本与勘误' };

export default function Page() {
  const identity = getBuildIdentity();
  return (
    <PublicationShell
      title="版本与勘误"
      description="保留判断如何变化的依据。证据检索、实质修订与公开发布分别记录。"
    >
      <section className="editorial-note">
        <h2>当前构建身份</h2>
        <p>
          源码提交：{' '}
          <a href={identity.sourceUrl} style={{ overflowWrap: 'anywhere' }}>
            {identity.sourceCommit}
          </a>
        </p>
        <p>
          {identity.dirty
            ? '工作预览：包含未提交修改，提交链接仅标识预览基线。'
            : '源码构建：此提交标识本次构建使用的源码，尚未声明冻结版次。'}
          证据检索与核查日期见对应的专题和观点记录。
        </p>
        <p>
          <a href="/downloads/manifest.json">当前构建清单</a> ·{' '}
          <a href="/downloads/catalog.json">公开知识记录</a> ·{' '}
          <a href="https://github.com/tiangong-lca/knowledge-base/tree/main/releases">版本保存与勘误协议</a>
        </p>
      </section>
      <section className="editorial-note">
        <h2>首版建设</h2>
        <p>
          当前版本建立阅读站点、概念与证据记录，以及四个核心专题。
          研究范围与缺口见<a href="/coverage/">覆盖范围</a>。
        </p>
        <p>
          查看 <a href="https://github.com/tiangong-lca/knowledge-base/releases">正式发布记录</a>与{' '}
          <a href={identity.errataUrl}>公开问题记录</a>。
          正式版本的身份、来源清单和可重建条件随发布产物保存。
        </p>
      </section>
      <section>
        <h2>更新如何进入正文</h2>
        <ol className="process-list">
          <li><strong>发现</strong> 监测来源的新版本、勘误和相关研究。</li>
          <li><strong>核读</strong> 保存来源身份、具体位置、支持关系和限制。</li>
          <li><strong>分析影响</strong> 检查受影响的前提、概念、映射和下游判断。</li>
          <li><strong>审查与发布</strong> 经编辑审查的修订进入当前版，并记录变化理由。</li>
        </ol>
        <p>
          新证据尚未处理完毕时，相关判断标记为待复核。
          发生错误的固定版本保留原身份，并关联勘误或撤回说明。
        </p>
      </section>
      <section className="editorial-note">
        <h2>报告问题</h2>
        <p>
          请在公开 Issue 中提供页面、源码提交或版次、观点编号、来源版本和具体位置。
          受限全文无需上传到公开仓库。
        </p>
        <a href={`${identity.errataUrl}/new`}>提交勘误或补充证据</a>
      </section>
    </PublicationShell>
  );
}
