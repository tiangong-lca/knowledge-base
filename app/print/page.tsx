import { source } from '@/lib/source';
import catalog from '@/lib/catalog';
import { getBuildIdentity } from '@/lib/build-identity';
import { getMDXComponents } from '@/mdx-components';
import { PrintButton } from '@/components/print-button';
import { PublicationShell } from '@/components/publication-shell';

export const metadata = { title: '打印与引用' };

export default function Page() {
  const identity = getBuildIdentity();
  return (
    <PublicationShell
      title="打印与引用"
      description="打印当前专题合订本。引用时请同时记录版本或提交身份、访问日期与具体观点编号。"
    >
      <section className="editorial-note" aria-label="本次构建的源码身份">
        <h2>本合订本的源码身份</h2>
        <p>
          源码提交：{' '}
          <a href={identity.sourceUrl} style={{ overflowWrap: 'anywhere' }}>
            {identity.sourceCommit}
          </a>
        </p>
        <p>
          构建状态：{identity.dirty ? '工作预览（包含未提交修改）' : '源码构建（尚非冻结版次）'}。
          {identity.dirty
            ? '该提交仅标识预览基线，未提交修改未包含在提交中；请勿作为固定版次引用。'
            : '此提交可定位本次构建使用的源码；固定版次还需对应的发布清单。'}
        </p>
        <p>
          证据核查日期见各观点记录。源码身份与构建状态不代表证据已在构建日重新核查。
        </p>
        <p>
          后续勘误与撤回说明：{' '}
          <a href={identity.errataUrl}>{identity.errataUrl}</a>。
          核对时请提供本页源码提交和相关观点编号。
        </p>
      </section>
      <div className="print-controls">
        <PrintButton />
        <p>浏览器打印对话框中可选择“另存为 PDF”。固定版本与发布清单见正式发布记录。</p>
      </div>
      <div className="print-book">
        {source.getPages().map((page) => {
          const MDX = page.data.body;
          return (
            <article className="print-chapter prose" key={page.url}>
              <h2>{page.data.title}</h2>
              <p>{page.data.description}</p>
              <MDX components={getMDXComponents()} />
            </article>
          );
        })}
        <section className="print-chapter">
          <h2>来源目录</h2>
          {catalog.sources.map((item) => (
            <div className="evidence-item" key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.publisher} · {item.version} · 访问：{item.accessedAt}</p>
              <a href={item.url}>{item.url}</a>
              <p>{item.preservation}</p>
            </div>
          ))}
        </section>
      </div>
    </PublicationShell>
  );
}
