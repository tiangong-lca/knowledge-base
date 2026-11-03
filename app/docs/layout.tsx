import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
export default function Layout({ children }: { children:React.ReactNode }) { return <><div className="docs-mobile-index"><details><summary>章节目录</summary><nav aria-label="章节目录">{source.getPages().map(p=><a key={p.url} href={p.url}>{p.data.title}</a>)}</nav></details></div><DocsLayout {...baseOptions()} tree={source.getPageTree()}>{children}</DocsLayout></>; }
