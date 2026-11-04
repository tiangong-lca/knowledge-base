import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { ChapterContent } from '@/components/chapter-content';
export const dynamicParams=false;
export function generateStaticParams(){return source.generateParams();}
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const p=source.getPage((await params).slug);return {title:p?.data.title,description:p?.data.description};}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}){const {slug}=await params;const p=source.getPage(slug);if(!p)notFound();return <DocsPage toc={p.data.toc} footer={{className:'docs-pagination',enabled:Boolean(slug?.length)}}><DocsTitle id="main-content" tabIndex={-1}>{p.data.title}</DocsTitle><DocsDescription>{p.data.description}</DocsDescription><DocsBody><ChapterContent page={p}/></DocsBody></DocsPage>;}
