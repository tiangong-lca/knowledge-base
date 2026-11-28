import Link from 'next/link';
import { notFound } from 'next/navigation';
import catalog from '@/lib/catalog';
import { PublicationShell } from '@/components/publication-shell';
import { ReferencesTabs } from '@/components/references-tabs';
import {
  formatZhReaderLocator,
  getEnPassageLocator,
  getEnPassagePrintedPages,
  getEnSourcePublisher,
  getEnSourceTitle,
  getEnSourceVersion,
} from '@/lib/en-citation-format';
import { EN_PUBLIC_ENABLED, isSupportedLocale } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';
import rawMap from '@/knowledge/research/literature-map.json';
import rawLedger from '@/knowledge/research/readings.json';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang === 'en') {
    return {
      title: `${UI_SURFACES.references.en} — Bibliography`,
      description: 'Primary standards, reports, scholarly papers, and verified passage-level reading locators.',
      robots: !EN_PUBLIC_ENABLED ? { index: false, follow: false } : undefined,
    };
  }
  return { title: `${UI_SURFACES.references.zh} — 原始书目` };
}

export default async function LocalizedResearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();
  const seenWorks = new Set<string>(), seenReadings = new Set<string>();
  const readingsById = new Map<string, (typeof rawLedger.readings)[number]>();
  for (const r of rawLedger.readings) if (!readingsById.has(r.id)) readingsById.set(r.id, r);
  const worksByKey = new Map<string, (typeof rawMap.records)[number]>();
  for (const r of rawMap.records) {
    if (!worksByKey.has(r.id)) worksByKey.set(r.id, r);
    if ('workId' in r && typeof r.workId === 'string' && !worksByKey.has(r.workId)) worksByKey.set(r.workId, r);
  }

  if (lang === 'en') {
    return (
      <PublicationShell
        lang="en"
        title={UI_SURFACES.references.en}
        description="Primary reports, methodological papers, standards, and software documentation cited in the text."
      >
        <ReferencesTabs active="research" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} prefix="/en" lang="en" />
        <p>
          Listed under original publication titles. Dates point to the specific report, article, or edition consulted; dissertation reprints
          and original journal articles are distinguished explicitly.
        </p>
        {catalog.sources.map(source => {
          const readingId = source.reading?.readingId;
          const reading = readingId ? readingsById.get(readingId) : undefined;
          const work = reading ? worksByKey.get(reading.workId) : undefined;
          const firstWork = work && !seenWorks.has(work.id); if (work) seenWorks.add(work.id);
          const firstReading = reading && !seenReadings.has(reading.id); if (reading) seenReadings.add(reading.id);
          return (
            <article className="source-record" key={source.id} id={source.id} style={{ overflowWrap: 'anywhere' }}>
              {firstWork && <span id={work.id} />}
              {firstReading && <span id={reading.id} />}
              <h2><a href={source.url} rel="noreferrer">{getEnSourceTitle(source)}</a></h2>
              <p>{getEnSourcePublisher(source)}. {getEnSourceVersion(source)}.</p>
              <p><Link href={`/en/sources/#${source.id}`}>Citation locators &amp; linked notes</Link></p>
              {firstReading && (
                <details>
                  <summary>Cited sections &amp; pages ({reading.passages.length})</summary>
                  <ul>
                    {reading.passages.map(passage => {
                      const printed = 'printedPages' in passage && passage.printedPages
                        ? getEnPassagePrintedPages({ id: passage.id, printedPages: passage.printedPages })
                        : '';
                      return (
                        <li key={passage.id} id={passage.id}>
                          {getEnPassageLocator(passage)}
                          {printed && <>, {printed}</>}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </PublicationShell>
    );
  }

  return <PublicationShell title={UI_SURFACES.references.zh} description="正文所引报告、方法论文、指南与软件文档。具体引文位置见各章注释与引文定位标签页。">
    <ReferencesTabs active="research" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} prefix="/zh" />
    <p>按文献原题名列示。历史来源的日期指向具体报告、文章或版本；学位论文中的再印文本与原期刊文章分别注明。</p>
    {catalog.sources.map(source => {
      const readingId = source.reading?.readingId;
      const reading = readingId ? readingsById.get(readingId) : undefined;
      const work = reading ? worksByKey.get(reading.workId) : undefined;
      const firstWork = work && !seenWorks.has(work.id); if (work) seenWorks.add(work.id);
      const firstReading = reading && !seenReadings.has(reading.id); if (reading) seenReadings.add(reading.id);
      return <article className="source-record" key={source.id} id={source.id}>
        {firstWork && <span id={work.id} />}
        {firstReading && <span id={reading.id} />}
        <h2><a href={source.url}>{source.title}</a></h2><p>{source.publisher.replace(/。+$/u, '')}。{formatZhReaderLocator(source.version).replace(/。+$/u, '')}。</p>
        <p><Link href={`/zh/sources/#${source.id}`}>引文位置与相关论述</Link></p>
        {firstReading && <details><summary>引用章节与页码</summary><ul>{reading.passages.map(passage => <li key={passage.id} id={passage.id}>{formatZhReaderLocator(passage.locator)}{'printedPages' in passage && passage.printedPages && <>，{formatZhReaderLocator(passage.printedPages)}</>}</li>)}</ul></details>}
      </article>;
    })}
  </PublicationShell>;
}
