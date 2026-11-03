import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';
export const dynamicParams=false;
export function generateStaticParams(){return source.generateParams();}
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const p=source.getPage((await params).slug);return {title:p?.data.title,description:p?.data.description};}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}){const p=source.getPage((await params).slug);if(!p)notFound();const MDX=p.data.body;return <DocsPage toc={p.data.toc}><div id="main-content"><DocsTitle>{p.data.title}</DocsTitle><DocsDescription>{p.data.description}</DocsDescription><DocsBody><MDX components={getMDXComponents()}/></DocsBody></div></DocsPage>;}
