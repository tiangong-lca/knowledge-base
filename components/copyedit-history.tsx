import { currentCopyedit } from '@/scripts/reader-current-expectations.mjs';
import { copyeditHistoryPlan } from '@/scripts/reader-copyedit-history.mjs';
import { readerCopyeditSource } from '@/scripts/reader-copyedit-pins.mjs';
import { citationSourceHref } from '@/scripts/reader-citations.mjs';

const titles = copyeditHistoryPlan(currentCopyedit)?.titles;

export function CopyeditHistoricalTitle({ path, id }: { path: string; id: string }) {
  const row = titles?.get(`${path}#${id}`);
  if (!row) return null;
  return <details className="legacy-citation-context" data-copyedit-history={id}>
    <summary>此处在 <time dateTime={readerCopyeditSource.capturedAt}>{readerCopyeditSource.capturedAt}</time> 版题为“{row.from}”。</summary>
    <a href={citationSourceHref(readerCopyeditSource.commit)}>查看该版源文件</a>
  </details>;
}
