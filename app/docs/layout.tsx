import { SidebarKeyboard } from '@/components/sidebar-keyboard';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { getWebsiteTree } from '@/lib/reader-numbering';
export default function Layout({ children }: { children:React.ReactNode }) { return <DocsLayout {...baseOptions()} tree={getWebsiteTree(source.getPageTree())}><SidebarKeyboard />{children}</DocsLayout>; }
