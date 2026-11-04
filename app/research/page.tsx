import Link from 'next/link';
import catalog from '@/lib/catalog';
import { PublicationShell } from '@/components/publication-shell';
import rawMap from '@/knowledge/research/literature-map.json';
import rawLedger from '@/knowledge/research/readings.json';
export const metadata = { title: '参考文献' };
export default function Page() {
  const seenWorks=new Set<string>(), seenReadings=new Set<string>();
  return <PublicationShell title="参考文献" description="正文所引报告、方法论文、指南与软件文档。具体引文位置见各章注释。">
    <p>按文献原题名列示。历史来源的日期指向具体报告、文章或版本；学位论文中的再印文本与原期刊文章分别注明。</p>
    {catalog.sources.map(source => {
      const reading = rawLedger.readings.find(r => r.id === source.reading?.readingId);
      const work = reading && rawMap.records.find(r => r.id === reading.workId || ('workId' in r && r.workId === reading.workId));
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
