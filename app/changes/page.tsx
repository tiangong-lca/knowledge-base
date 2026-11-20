import { PublicationNote } from '@/components/publication-note';
import { PublicationShell } from '@/components/publication-shell';
import { getBuildIdentity } from '@/lib/build-identity';
import { printUnitAnchor } from '@/scripts/reader-book.mjs';
import { buildPublicChangesLedger } from '@/scripts/reader-changes-ledger.mjs';

export const metadata = { title: '版本与勘误' };

export default function Page() {
  const identity = getBuildIdentity();
  const ledger = buildPublicChangesLedger();
  const iterations = ledger.iterations.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const corrections = ledger.corrections;
  const partIntroductions = ledger.partIntroductions.filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <PublicationShell title="版本与勘误" description="《生命周期评价的前世今生》的在线文本、修订清单与勘误入口。">
    <h2>在线文本</h2>
    <p>引用网页时，请记录篇名、网址和访问日期；引用原始研究时，以章末注释列明的作品与版本为准。历史指南的年份与方法版本，是其解释范围的一部分。为保持正文与打印版连续洁净，各轮修订说明与历史版本追踪统一汇总于本页，不再嵌入正文章节阅读流。</p>
    <p><a href={identity.sourceUrl}>查看本版文本</a> · <a href="/print/">连续阅读与打印</a></p>
    <h2>勘误</h2>
    <p>如发现引文、算式或论述存在问题，可提供篇名、相关段落与原始出处，<a href={identity.errataUrl}>提出勘误或补充证据</a>。第三方文献的更正需要同时辨认原版和更正版本；不能只改一个数字而丢失它的来源。</p>
    <PublicationNote />
    <section data-reader-changes-ledger="">
      <h2>已发布迭代修订清单（共 {iterations.length} 轮）</h2>
      <p>以下记录由仓库受控版本账本自动汇总，按时间倒序列明各轮审定更新的涉及篇章、修订概要与对应前版源码链接。</p>
      <ul>
        {iterations.map(item => <li key={item.id} data-changes-iteration={item.id}>
          <p>
            <strong><time dateTime={item.date}>{item.date}</time></strong>
            {item.routeLabels.length > 0 && <> · 涉及：{item.routeLabels.join('、')}</>}
            {item.sourceHref && <> · <a href={item.sourceHref}>查看前版源文件</a></>}
          </p>
          {item.rationale && <p>{item.rationale}</p>}
        </li>)}
      </ul>

      <h2>具名论述更正清单（共 {corrections.length} 项）</h2>
      <p>下表汇总各轮修订中对既有规范论述所作的具名更正说明及前版源码链接，供核对前后文口径变化。</p>
      <ul>
        {corrections.map((row, idx) => <li key={`${row.unitId}-${row.claimId}-${idx}`} data-changes-correction={row.claimId} data-changes-correction-key={`${row.unitId}|${row.claimId}`}>
          <strong><time dateTime={row.date}>{row.date}</time></strong>
          {' · '}
          {row.chapter.startsWith('/')
            ? <a href={`${row.chapter}/`}>{row.chapterTitle}</a>
            : <a href={`/print/#${printUnitAnchor(row.chapter)}`}>{row.chapterTitle}</a>}
          {'：'}
          {row.scope}
          {' '}
          <a href={row.sourceHref}>查看前版源文件</a>
        </li>)}
      </ul>

      {partIntroductions.length > 0 && <>
        <h2>部首导言修订记录（共 {partIntroductions.length} 项）</h2>
        <ul>
          {partIntroductions.map(item => <li key={`part-${item.part}`} data-changes-part-intro={String(item.part)}>
            <p>
              <strong><time dateTime={item.date}>{item.date}</time> · 第{item.part}部《{item.title}》</strong>
              {' · '}
              <a href={item.sourceHref}>查看前版源文件</a>
            </p>
            <p>前版导言：{item.from}</p>
          </li>)}
        </ul>
      </>}
    </section>
    <p>研究与开发记录保存在<a href="https://github.com/tiangong-lca/knowledge-base/tree/main/_docs">项目开发文档</a>，与正文分开。原始来源保留各自权利。</p>
  </PublicationShell>;
}
