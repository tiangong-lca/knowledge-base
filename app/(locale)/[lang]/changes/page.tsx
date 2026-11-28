import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicationNote } from '@/components/publication-note';
import { PublicationShell } from '@/components/publication-shell';
import { getBuildIdentity } from '@/lib/build-identity';
import { EN_PUBLIC_ENABLED, isSupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n';
import { localizedPageAlternates } from '@/lib/seo-policy.mjs';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { buildPublicRevisionsAndErrata } from '@/scripts/reader-public-revisions.mjs';

const KIND_LABELS: Record<string, { zh: string; en: string }> = {
  addition: { zh: '新增内容', en: 'Addition' },
  structure: { zh: '结构调整', en: 'Structure' },
  edition: { zh: '版本发布', en: 'Edition' },
  erratum: { zh: '勘误', en: 'Erratum' },
};

interface ResolvedRoute {
  route: string;
  zhHref: string;
  enHref: string;
  zhLabel: string;
  enLabel: string;
  exists: boolean;
}

interface PublicRevisionEntry {
  id: string;
  date: string;
  kind: string;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  routes: ResolvedRoute[];
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const alternates = localizedPageAlternates('/changes', lang, EN_PUBLIC_ENABLED ? ['zh', 'en'] : ['zh']);
  if (lang === 'en') {
    return {
      title: UI_SURFACES.revisionsErrata.en,
      description: 'Reader-facing content revisions, structural updates, and errata for The Past and Present of Life Cycle Assessment.',
      alternates,
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return {
    title: UI_SURFACES.revisionsErrata.zh,
    description: '《生命周期评价的前世今生》的内容修订、结构调整与勘误记录。',
    alternates,
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  const identity = getBuildIdentity();
  const { revisions, errata } = buildPublicRevisionsAndErrata() as {
    revisions: PublicRevisionEntry[];
    errata: PublicRevisionEntry[];
  };

  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        logicalPath="/changes/"
        title={UI_SURFACES.revisionsErrata.en}
        description="Substantive content revisions, structural updates, and errata for The Past and Present of Life Cycle Assessment."
      >
        <h2>Online Edition &amp; Citation</h2>
        <p>
          When citing web chapters, please record the chapter title, URL, and access date; when citing primary research, refer to the exact
          work and edition listed in the chapter notes. The publication year and version of a methodological guide are part of its validity scope.
        </p>
        <p>
          <a href={identity.sourceUrl} rel="noreferrer">View source commit</a> ·{' '}
          <Link href="/en/print/">{UI_SURFACES.fullTextPrint.en}</Link> ·{' '}
          <Link href="/en/coverage/">{UI_SURFACES.bookGuide.en}</Link>
        </p>

        <section data-reader-changes-ledger="en">
          <h2>Content &amp; Structural Revisions</h2>
          <p>
            This list records substantive additions, chapter reorganizations, and edition milestones visible to readers. Chapter numbers and
            titles below reflect the current edition.
          </p>
          <ul>
            {revisions.map(item => (
              <li key={item.id} data-public-revision={item.id}>
                <p>
                  <strong>
                    <time dateTime={item.date}>{item.date}</time> · {KIND_LABELS[item.kind]?.en ?? item.kind} · {item.title.en}
                  </strong>
                </p>
                <p>{item.summary.en}</p>
                {item.routes.length > 0 && (
                  <p className="subtle">
                    Affected:{' '}
                    {item.routes.map((r, idx) => (
                      <span key={r.route}>
                        {idx > 0 && '; '}
                        <Link href={r.enHref}>{r.enLabel}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <h2>Errata</h2>
          <p>
            Substantive corrections to cross-references, table numbers, scope wording, or numerical citations in published chapters.
          </p>
          <ul>
            {errata.map(item => (
              <li key={item.id} data-public-erratum={item.id}>
                <p>
                  <strong>
                    <time dateTime={item.date}>{item.date}</time> · {item.title.en}
                  </strong>
                </p>
                <p>{item.summary.en}</p>
                {item.routes.length > 0 && (
                  <p className="subtle">
                    Affected:{' '}
                    {item.routes.map((r, idx) => (
                      <span key={r.route}>
                        {idx > 0 && '; '}
                        <Link href={r.enHref}>{r.enLabel}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <h2>Reporting Errata</h2>
        <p>
          If you identify an error in a citation, equation, or claim, please provide the chapter title, relevant passage, and primary source
          when <a href={identity.errataUrl} rel="noreferrer">submitting an erratum or supporting evidence</a>. Third-party errata must identify
          both the original publication and the correction notice rather than silently altering a number without provenance.
        </p>
        <PublicationNote lang="en" />
        <p>
          Detailed commit-level editorial history is maintained in the{' '}
          <a href="https://github.com/tiangong-lca/knowledge-base" rel="noreferrer">GitHub repository</a> separately from the reading surface.
          Original sources retain their respective rights.
        </p>
      </PublicationShell>
    );
  }

  return (
    <PublicationShell
      logicalPath="/changes/"
      title={UI_SURFACES.revisionsErrata.zh}
      description="《生命周期评价的前世今生》的内容修订、结构调整与勘误记录。"
    >
      <h2>在线文本与引用</h2>
      <p>
        引用网页时，请记录篇名、网址和访问日期；引用原始研究时，以章末注释列明的作品与版本为准。历史指南的年份与方法版本，是其解释范围的一部分。
      </p>
      <p>
        <a href={identity.sourceUrl} rel="noreferrer">查看本版文本</a> ·{' '}
        <Link href="/zh/print/">{UI_SURFACES.fullTextPrint.zh}</Link> ·{' '}
        <Link href="/zh/coverage/">{UI_SURFACES.bookGuide.zh}</Link>
      </p>

      <section data-reader-changes-ledger="zh">
        <h2>内容与结构修订</h2>
        <p>
          以下记录面向读者列示实质性的内容增补、章节结构调整与版本发布；所涉章号与章名均按现行目录显示。
        </p>
        <ul>
          {revisions.map(item => (
            <li key={item.id} data-public-revision={item.id}>
              <p>
                <strong>
                  <time dateTime={item.date}>{item.date}</time> · {KIND_LABELS[item.kind]?.zh ?? item.kind} · {item.title.zh}
                </strong>
              </p>
              <p>{item.summary.zh}</p>
              {item.routes.length > 0 && (
                <p className="subtle">
                  涉及章节：
                  {item.routes.map((r, idx) => (
                    <span key={r.route}>
                      {idx > 0 && '、'}
                      <Link href={r.zhHref}>{r.zhLabel}</Link>
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>

        <h2>勘误</h2>
        <p>
          以下列示已出版章节中对表号、跨章引用、范围限定或引文细节所作的实质性更正。
        </p>
        <ul>
          {errata.map(item => (
            <li key={item.id} data-public-erratum={item.id}>
              <p>
                <strong>
                  <time dateTime={item.date}>{item.date}</time> · {item.title.zh}
                </strong>
              </p>
              <p>{item.summary.zh}</p>
              {item.routes.length > 0 && (
                <p className="subtle">
                  涉及章节：
                  {item.routes.map((r, idx) => (
                    <span key={r.route}>
                      {idx > 0 && '、'}
                      <Link href={r.zhHref}>{r.zhLabel}</Link>
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <h2>提交勘误</h2>
      <p>
        如发现引文、算式或论述存在问题，可提供篇名、相关段落与原始出处，<a href={identity.errataUrl} rel="noreferrer">提出勘误或补充证据</a>。
        第三方文献的更正需要同时辨认原版和更正版本；不能只改一个数字而丢失它的来源。
      </p>
      <PublicationNote />
      <p>
        细粒度的提交级修订记录保存在 <a href="https://github.com/tiangong-lca/knowledge-base" rel="noreferrer">GitHub 仓库</a>，与面向读者的正文和勘误页分开维护。原始来源保留各自权利。
      </p>
    </PublicationShell>
  );
}
