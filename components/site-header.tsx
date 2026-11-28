'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  SearchDialog, SearchDialogClose, SearchDialogContent, SearchDialogHeader,
  SearchDialogIcon, SearchDialogInput, SearchDialogList, SearchDialogOverlay,
  type SearchItemType, type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { baseOptions } from '@/lib/layout.shared';
import type { Locale } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { entryDestination, languageDestination, saveManualLanguage } from '@/lib/locale-preference.mjs';
import enUi from '@/config/editions/en/ui.json';

export type SearchEntry = { title: string; text: string; url: string; kind: string };
const SearchContext = createContext<{ lang: Locale; entries: SearchEntry[] }>({ lang: 'zh', entries: [] });
const searchIndexCache: Partial<Record<Locale, SearchEntry[]>> = {};

// Retain local knowledge matching, with the same accessible search controls as Docs.
function KnowledgeSearchDialog(props: SharedProps) {
  const { lang, entries: initialEntries } = useContext(SearchContext);
  const [loadedEntries, setLoadedEntries] = useState<SearchEntry[]>(() =>
    initialEntries.length > 0 ? initialEntries : (searchIndexCache[lang] ?? []),
  );
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!props.open) return;
    if (initialEntries.length > 0) {
      setLoadedEntries(initialEntries);
      return;
    }
    const cached = searchIndexCache[lang];
    if (cached) {
      setLoadedEntries(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/downloads/search-index-${lang}.json`)
      .then(res => (res.ok ? res.json() : []))
      .then((data: SearchEntry[]) => {
        if (cancelled || !Array.isArray(data)) return;
        searchIndexCache[lang] = data;
        setLoadedEntries(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [props.open, lang, initialEntries]);

  const results = useMemo<SearchItemType[]>(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return loadedEntries.filter(entry => `${entry.title} ${entry.text}`.toLocaleLowerCase().includes(needle)).slice(0, 12).map((entry, index) => ({
      id: `knowledge-result-${index}`, type: 'page', url: entry.url,
      content: <span className="flex min-w-0 flex-col gap-1"><span className="text-xs text-fd-muted-foreground">{entry.kind}</span><span className="font-medium">{entry.title}</span><span className="text-xs text-fd-muted-foreground">{entry.text.slice(0, 100)}</span></span>,
    }));
  }, [loadedEntries, query]);

  const isEn = lang === 'en';
  return <SearchDialog {...props} search={query} onSearchChange={setQuery}>
    <SearchDialogOverlay className="knowledge-search-overlay" />
    <SearchDialogContent
      className="knowledge-search-dialog"
      onOpenAutoFocus={() => { previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
      onCloseAutoFocus={event => { event.preventDefault(); if (previousFocus.current?.isConnected) previousFocus.current.focus(); }}
    >
      <SearchDialogHeader>
        <SearchDialogIcon />
        <SearchDialogInput
          placeholder={isEn ? enUi.searchPlaceholder : '搜索章节、概念、参考文献或注释'}
          aria-label={isEn ? enUi.searchAriaLabel : '搜索知识库'}
        />
        <SearchDialogClose />
      </SearchDialogHeader>
      <SearchDialogList
        items={results}
        Empty={() => (
          <p role="status" className="px-4 py-10 text-center text-sm text-fd-muted-foreground">
            {loading
              ? (isEn ? 'Loading search index…' : '正在加载搜索索引…')
              : query.trim()
                ? (isEn ? enUi.searchNoResults : '没有找到匹配内容。可换用英文原词或查看全书导览。')
                : (isEn ? enUi.searchEmptyQuery : '试试「waste」「功能单位」或某个来源的名称。')}
          </p>
        )}
      />
    </SearchDialogContent>
  </SearchDialog>;
}

const zhTranslations = {
  displayName: '中文',
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

const localesList = [
  { name: '中文', locale: 'zh' },
  { name: 'English', locale: 'en' },
];

export function SiteProvider({
  lang = 'zh',
  entries = [],
  publishedPaths,
  children,
}: {
  lang?: Locale;
  entries?: SearchEntry[];
  publishedPaths?: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const publishedSet = useMemo(() => (publishedPaths ? new Set(publishedPaths) : undefined), [publishedPaths]);

  useEffect(() => {
    const dest = entryDestination(window.location.href, {
      getStorage: () => window.localStorage,
      languages: navigator.languages ?? [],
      language: navigator.language,
    });
    if (dest) router.replace(dest);
  }, [pathname, router]);

  const onLocaleChange = useCallback((nextLocale: string) => {
    const dest = languageDestination(window.location.href, nextLocale, { publishedPaths: publishedSet });
    saveManualLanguage(() => window.localStorage, nextLocale);
    if (dest) router.push(dest);
  }, [publishedSet, router]);

  const translations = lang === 'en' ? enUi.fumadocs : zhTranslations;
  const searchValue = useMemo(() => ({ lang, entries }), [lang, entries]);

  return (
    <SearchContext.Provider value={searchValue}>
      <RootProvider
        i18n={{ locale: lang, locales: localesList, translations, onLocaleChange }}
        search={{ SearchDialog: KnowledgeSearchDialog }}
      >
        {children}
      </RootProvider>
    </SearchContext.Provider>
  );
}

// Public pages already own their main landmark. Keep the standard HomeLayout
// header/menu while preventing its container from adding another main element.
function HomeContainer({ children, className, ...props }: ComponentPropsWithoutRef<'main'>) {
  return <div id="nd-home-layout" {...props} className={`flex flex-1 flex-col [--fd-layout-width:1400px] ${className ?? ''}`}>{children}</div>;
}

export function SiteChrome({ lang = 'zh', children }: { lang?: Locale; children: ReactNode }) {
  const pathname = usePathname();
  if (
    pathname === '/zh/docs' || pathname.startsWith('/zh/docs/')
    || pathname === '/en/docs' || pathname.startsWith('/en/docs/')
    || pathname === '/docs' || pathname.startsWith('/docs/')
  ) {
    return children;
  }
  const isEn = lang === 'en';
  const prefix = `/${lang}`;
  return (
    <HomeLayout {...baseOptions(lang)} slots={{ container: HomeContainer }}>
      {children}
      <footer className="site-footer">
        <div>
          <strong>{isEn ? enUi.footer.title : '天工 LCA 知识库'}</strong>
          <p>{isEn ? enUi.footer.tagline : '每个判断均可回溯出处，每次修订说明所改之处。'}</p>
        </div>
        <nav aria-label={isEn ? 'Footer navigation' : '页脚导航'}>
          <a href={`${prefix}/timeline/`}>{UI_SURFACES.timeline[lang]}</a>
          <a href={`${prefix}/controversies/`}>{UI_SURFACES.controversies[lang]}</a>
          <a href={`${prefix}/changes/`}>{UI_SURFACES.revisionsErrata[lang]}</a>
          <a href={`${prefix}/print/`}>{UI_SURFACES.fullTextPrint[lang]}</a>
          <a href="https://github.com/tiangong-lca/knowledge-base">GitHub</a>
        </nav>
      </footer>
    </HomeLayout>
  );
}
