import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationNote } from '@/components/publication-note';
import { PublicationShell } from '@/components/publication-shell';
import { getBuildIdentity } from '@/lib/build-identity';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { printUnitAnchor } from '@/scripts/reader-book.mjs';
import { buildPublicChangesLedger } from '@/scripts/reader-changes-ledger.mjs';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: UI_SURFACES.revisionsErrata.en,
      description: 'Reader-facing revisions, chapter updates, and errata reporting for The Past and Present of Life Cycle Assessment.',
    };
  }
  return { title: UI_SURFACES.revisionsErrata.zh };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const identity = getBuildIdentity();

  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        title={UI_SURFACES.revisionsErrata.en}
        description="Reader-facing revisions, chapter updates, and errata reporting for The Past and Present of Life Cycle Assessment."
      >
        <h2>Online Edition</h2>
        <p>
          When citing web chapters, please record the chapter title, URL, and access date; when citing primary research, refer to the exact
          work and edition listed in the chapter notes. The publication year and version of a methodological guide are part of its validity scope.
        </p>
        <p>
          <a href={identity.sourceUrl} rel="noreferrer">View source commit</a> ·{' '}
          <Link href="/en/print/">{UI_SURFACES.fullTextPrint.en}</Link> ·{' '}
          <Link href="/en/coverage/">{UI_SURFACES.bookGuide.en}</Link>
        </p>

        <h2>Bilingual Alignment &amp; Completeness</h2>
        <p>
          The English edition is authored as a meaning-equivalent monograph rather than a literal sentence-by-sentence translation. All main
          chapters, 5 topical essays, 5 appendices, 2 interactive teaching cases, and reviewed claims are published and cryptographically
          aligned to the canonical Chinese edition via claim-level digests.
        </p>
        <p>
          For the detailed historical Chinese revision and copyedit ledger prior to the bilingual release, see the{' '}
          <Link href="/zh/changes/">Chinese Editions &amp; Errata ledger</Link>.
        </p>

        <h2>Errata &amp; Evidence Corrections</h2>
        <p>
          If you identify an error in a citation, equation, or claim, please provide the chapter title, relevant passage, and primary source
          when <a href={identity.errataUrl} rel="noreferrer">submitting an erratum or supporting evidence</a>. Third-party errata must identify
          both the original publication and the correction notice rather than silently altering a number without provenance.
        </p>
        <p>
          Research and editorial records are maintained in the{' '}
          <a href="https://github.com/tiangong-lca/knowledge-base/tree/main/_docs" rel="noreferrer">repository documentation</a> separately
          from the monograph text. Original sources retain their respective rights.
        </p>
      </PublicationShell>
    );
  }

  const ledger = buildPublicChangesLedger();
  const iterations = ledger.iterations.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const corrections = ledger.corrections;
  const partIntroductions = ledger.partIntroductions.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const revisions = ledger.revisions ?? [];
  const retirements = ledger.retirements ?? [];
  const merges = ledger.merges ?? [];
  return <PublicationShell title={UI_SURFACES.revisionsErrata.zh} description="《生命周期评价的前世今生》的在线文本、修订清单与勘误入口。">
    <h2>在线文本</h2>
    <p>引用网页时，请记录篇名、网址和访问日期；引用原始研究时，以章末注释列明的作品与版本为准。历史指南的年份与方法版本，是其解释范围的一部分。</p>
    <p><a href={identity.sourceUrl}>查看本版文本</a> · <a href="/zh/print/">{UI_SURFACES.fullTextPrint.zh}</a></p>
    <h2>勘误</h2>
    <p>如发现引文、算式或论述存在问题，可提供篇名、相关段落与原始出处，<a href={identity.errataUrl}>提出勘误或补充证据</a>。第三方文献的更正需要同时辨认原版和更正版本；不能只改一个数字而丢失它的来源。</p>
    <PublicationNote />
    <section data-reader-changes-ledger="">
      {revisions.length > 0 && <>
        <h2>整合修订记录（共 {revisions.length} 项）</h2>
        <ul>
          {revisions.map(rev => <li key={rev.id} data-changes-revision={rev.id}>
            <p>
              <strong><time dateTime={rev.date}>{rev.date}</time> · {rev.title}</strong>
              {rev.routeLabels.length > 0 && <> · 涉及：{rev.routeLabels.join('、')}</>}
              {rev.sourceHref && <> · <a href={rev.sourceHref}>查看前版源文件</a></>}
            </p>
            <p>{rev.rationale}</p>
          </li>)}
        </ul>
      </>}

      {merges.length > 0 && <>
        <h2>章节合并记录（共 {merges.length} 项）</h2>
        <ul>
          {merges.map(m => <li key={`${m.revisionId}-${m.to}`} data-changes-merge={m.to}>
            <p>
              <strong><time dateTime={m.date}>{m.date}</time> · {m.fromLabels.join('、')} → <a href={`/zh${m.to}/`}>{m.toLabel}</a></strong>
            </p>
            <p>{m.rationale}</p>
          </li>)}
        </ul>
      </>}

      {retirements.length > 0 && <>
        <h2>已合并或退役的旧论述（共 {retirements.length} 项）</h2>
        <ul>
          {retirements.map(ret => <li key={`${ret.revisionId}-${ret.id}`} data-changes-retirement={ret.id}>
            <strong><time dateTime={ret.date}>{ret.date}</time></strong>
            {ret.routeLabels.length > 0 && <> · {ret.routeLabels.join('、')}</>}
            {'：'}
            {ret.rationale}
            {ret.sourceHref && <> <a href={ret.sourceHref}>查看前版源文件</a></>}
          </li>)}
        </ul>
      </>}

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
            ? <a href={`/zh${row.chapter}/`}>{row.chapterTitle}</a>
            : <a href={`/zh/print/#${printUnitAnchor(row.chapter)}`}>{row.chapterTitle}</a>}
          {'：'}
          {row.scope}
          {row.sourceHref && <> <a href={row.sourceHref}>查看前版源文件</a></>}
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
