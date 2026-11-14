import { currentFlowBoundary } from '@/scripts/reader-current-expectations.mjs';
import { flowBoundaryOrdinaryId } from '@/scripts/reader-flow-boundary.mjs';
import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { ChapterContent } from '@/components/chapter-content';
import { NumberedTitle } from '@/components/numbered-heading';
import { getNumberedToc, getUnitNumbering, getWebsitePagination } from '@/lib/reader-numbering';
export const dynamicParams=false;
export function generateStaticParams(){return source.generateParams();}
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const p=source.getPage((await params).slug);return {title:p?.data.title,description:p?.data.description};}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}) {
  const {slug}=await params;
  const page=source.getPage(slug);
  if(!page)notFound();
  const unit=getUnitNumbering('web',page.url);
  if(!unit || unit.title!==page.data.title)throw new Error(`Website title differs from numbered inventory: ${page.url}`);
  return <DocsPage toc={getNumberedToc(page)} footer={{className:'docs-pagination',enabled:Boolean(slug?.length),items:getWebsitePagination(page.url,source.getPages())}} data-reader-route={unit.key} data-reader-title={page.data.title}>
    <p className="reader-view-label">网页细读目录{unit.partTitle?` · ${unit.partLabel} ${unit.partTitle}`:''} · <Link href="/print/">书籍目录与连续阅读</Link></p>
    <DocsTitle id="main-content" tabIndex={-1} data-reader-heading-key="@unit"><NumberedTitle number={unit.label}>{page.data.title}</NumberedTitle></DocsTitle>
    <><CopyeditHistoricalTitle path={page.url} id="main-content" />
      <DocsDescription id={currentFlowBoundary ? flowBoundaryOrdinaryId(unit.key, false, 0) : undefined}>{page.data.description}</DocsDescription></>
    <DocsBody><ChapterContent page={page}/></DocsBody>
  </DocsPage>;
}
