import Link from 'next/link';
import catalog from '@/lib/catalog';
import { PublicationShell } from '@/components/publication-shell';
import { ReferencesTabs } from '@/components/references-tabs';
import rawMap from '@/knowledge/research/literature-map.json';
import rawLedger from '@/knowledge/research/readings.json';
export const metadata = { title: '参考文献与出处 — 书目与核读' };
export default function Page() {
  const seenWorks=new Set<string>(), seenReadings=new Set<string>();
  const readingsById = new Map<string, (typeof rawLedger.readings)[number]>();
  for (const r of rawLedger.readings) if (!readingsById.has(r.id)) readingsById.set(r.id, r);
  const worksByKey = new Map<string, (typeof rawMap.records)[number]>();
  for (const r of rawMap.records) {
    if (!worksByKey.has(r.id)) worksByKey.set(r.id, r);
    if ('workId' in r && typeof r.workId === 'string' && !worksByKey.has(r.workId)) worksByKey.set(r.workId, r);
  }
  return <PublicationShell title="参考文献与出处" description="正文所引报告、方法论文、指南与软件文档。具体引文位置见各章注释与引文定位标签页。">
    <ReferencesTabs active="research" sourceCount={catalog.sources.length} evidenceCount={catalog.evidence.length} />
    <p>按文献原题名列示。历史来源的日期指向具体报告、文章或版本；学位论文中的再印文本与原期刊文章分别注明。</p>
    {catalog.sources.map(source => {
      const readingId = source.reading?.readingId;
      const reading = readingId ? readingsById.get(readingId) : undefined;
      const work = reading ? worksByKey.get(reading.workId) : undefined;
      const firstWork=work && !seenWorks.has(work.id); if(work) seenWorks.add(work.id);
      const firstReading=reading && !seenReadings.has(reading.id); if(reading) seenReadings.add(reading.id);
      return <article className="source-record" key={source.id} id={source.id}>
        {firstWork && <span id={work.id} />}
        {firstReading && <span id={reading.id} />}
        <h2><a href={source.url}>{source.title}</a></h2><p>{source.publisher}。{source.version}。</p>
        <p><Link href={`/sources/#${source.id}`}>引文位置与相关论述</Link></p>
        {firstReading && <details><summary>引用章节与页码</summary><ul>{reading.passages.map(passage => <li key={passage.id} id={passage.id}>{passage.locator}{'printedPages' in passage && passage.printedPages && <>，{passage.printedPages}</>}</li>)}</ul></details>}
      </article>;
    })}
  </PublicationShell>;
}
