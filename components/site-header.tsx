'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'fumadocs-ui/provider/base';
export type SearchEntry = { title: string; text: string; url: string; kind: string };
export function SiteHeader({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => { if (!open) return; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = old; trigger.current?.focus(); }; }, [open]);
  const results = query.trim() ? entries.filter(e => `${e.title} ${e.text}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 12) : [];
  return <><header className="site-header"><div className="site-header-inner">
    <Link className="site-brand" href="/" aria-label="天工 LCA 知识库首页"><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M5 5h9v9H5zm13 13h9v9h-9z" fill="currentColor"/><path d="M18 5h9v9h-9zM5 18h9v9H5z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="m14 9 4 0M9 14v4m5 5h4m5-9v4" stroke="currentColor"/></svg><span>天工 LCA <span className="brand-divider">知识库</span></span></Link>
    <nav aria-label="主导航"><Link href="/docs/">阅读</Link><Link href="/concepts/">概念</Link><Link href="/sources/">来源</Link><Link href="/coverage/">覆盖范围</Link></nav>
    <details className="mobile-menu"><summary>目录</summary><nav aria-label="移动导航"><Link href="/docs/">阅读</Link><Link href="/concepts/">概念</Link><Link href="/sources/">来源</Link><Link href="/coverage/">覆盖范围</Link></nav></details>
    <button className="theme-toggle" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="切换明暗主题">明暗</button><button ref={trigger} className="search-trigger" onClick={() => setOpen(true)} aria-label="搜索知识库">搜索 <kbd>⌕</kbd></button>
  </div></header>
  {open && <div className="search-backdrop" onClick={() => setOpen(false)}><section ref={panel} className="search-panel" role="dialog" aria-modal="true" aria-label="搜索知识库" onClick={e => e.stopPropagation()} onKeyDown={e => {if(e.key==='Escape') setOpen(false); if(e.key==='Tab'){const items=panel.current?.querySelectorAll<HTMLElement>('input,button,a[href]');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><div className="search-input-row"><input autoFocus aria-label="搜索词" placeholder="搜索概念、观点、来源或章节" value={query} onChange={e => setQuery(e.target.value)} /><button onClick={() => setOpen(false)} aria-label="关闭搜索">关闭</button></div><div className="search-results" aria-live="polite">{!query.trim() ? <p>试试「waste」「功能单位」或某个来源的名称。</p> : results.length ? results.map((r,i)=><Link href={r.url} key={`${r.url}-${i}`} onClick={()=>setOpen(false)}><small>{r.kind}</small><strong>{r.title}</strong><span>{r.text.slice(0,100)}</span></Link>) : <p>没有找到匹配内容。可换用英文原词或查看覆盖范围。</p>}</div></section></div>}
  </>;
}
