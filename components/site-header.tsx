'use client';

import { createContext, useContext, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  SearchDialog, SearchDialogClose, SearchDialogContent, SearchDialogHeader,
  SearchDialogIcon, SearchDialogInput, SearchDialogList, SearchDialogOverlay,
  type SearchItemType, type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { baseOptions } from '@/lib/layout.shared';

export type SearchEntry = { title: string; text: string; url: string; kind: string };
const SearchEntries = createContext<SearchEntry[]>([]);

// Retain local knowledge matching, with the same accessible search controls as Docs.
function KnowledgeSearchDialog(props: SharedProps) {
  const entries = useContext(SearchEntries);
  const [query, setQuery] = useState('');
  const previousFocus = useRef<HTMLElement | null>(null);
  const results = useMemo<SearchItemType[]>(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return entries.filter(entry => `${entry.title} ${entry.text}`.toLocaleLowerCase().includes(needle)).slice(0, 12).map((entry, index) => ({
      id: `knowledge-result-${index}`, type: 'page', url: entry.url,
      content: <span className="flex min-w-0 flex-col gap-1"><span className="text-xs text-fd-muted-foreground">{entry.kind}</span><span className="font-medium">{entry.title}</span><span className="text-xs text-fd-muted-foreground">{entry.text.slice(0, 100)}</span></span>,
    }));
  }, [entries, query]);

  return <SearchDialog {...props} search={query} onSearchChange={setQuery}>
    <SearchDialogOverlay className="knowledge-search-overlay" />
    <SearchDialogContent
      className="knowledge-search-dialog"
      onOpenAutoFocus={() => { previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
      onCloseAutoFocus={event => { event.preventDefault(); if (previousFocus.current?.isConnected) previousFocus.current.focus(); }}
    >
      <SearchDialogHeader>
        <SearchDialogIcon />
        <SearchDialogInput placeholder="搜索概念、观点、来源或章节" aria-label="搜索知识库" />
        <SearchDialogClose />
      </SearchDialogHeader>
      <SearchDialogList items={results} Empty={() => <p role="status" className="px-4 py-10 text-center text-sm text-fd-muted-foreground">{query.trim() ? '没有找到匹配内容。可换用英文原词或查看全书导览。' : '试试「waste」「功能单位」或某个来源的名称。'}</p>} />
    </SearchDialogContent>
  </SearchDialog>;
}

const translations = {
  'Search(search trigger)': '搜索',
  'Search(search dialog)': '搜索知识库',
  'Open Search(search trigger)(aria-label)': '搜索知识库',
  'Close Search(search dialog)(aria-label)': '关闭搜索',
  'Open Sidebar(sidebar)(aria-label)': '打开章节目录',
  'Close Sidebar(sidebar)(aria-label)': '关闭章节目录',
  'Close Sidebar(aria-label)': '关闭章节目录',
  'Collapse Sidebar(sidebar)(aria-label)': '收起章节目录',
  'Toggle Menu(mobile menu)(aria-label)': '打开导航菜单',
  'Toggle Theme(theme switcher)(aria-label)': '切换明暗主题',
  'Light(theme switcher)(aria-label)': '浅色',
  'Dark(theme switcher)(aria-label)': '深色',
  'System(theme switcher)(aria-label)': '跟随系统',
  'Table of Contents(inline table of contents)': '目录',
  'On this page(table of contents)': '本页目录',
  'No Headings(table of contents)': '本页没有小节标题',
  'Next Page(pagination)': '下一章',
  'Previous Page(pagination)': '上一章',
  'Copy Anchor Link(heading anchor)(aria-label)': '复制章节链接',
  'Copied Anchor Link(heading anchor)(aria-label)': '已复制章节链接',
};

export function SiteProvider({ entries, children }: { entries: SearchEntry[]; children: ReactNode }) {
  return <SearchEntries.Provider value={entries}><RootProvider i18n={{ locale: 'zh', translations }} search={{ SearchDialog: KnowledgeSearchDialog }}>{children}</RootProvider></SearchEntries.Provider>;
}

// Public pages already own their main landmark. Keep the standard HomeLayout
// header/menu while preventing its container from adding another main element.
function HomeContainer({ children, className, ...props }: ComponentPropsWithoutRef<'main'>) {
  return <div id="nd-home-layout" {...props} className={`flex flex-1 flex-col [--fd-layout-width:1400px] ${className ?? ''}`}>{children}</div>;
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/docs' || pathname.startsWith('/docs/')) return children;
  return <HomeLayout {...baseOptions()} slots={{ container: HomeContainer }}>
    {children}
    <footer className="site-footer"><div><strong>天工 LCA 知识库</strong><p>每个判断都可以追问，每次修订都留下依据。</p></div><nav aria-label="页脚导航"><a href="/changes/">版本与勘误</a><a href="/print/">连续阅读与打印</a><a href="https://github.com/tiangong-lca/knowledge-base">GitHub</a></nav></footer>
  </HomeLayout>;
}
