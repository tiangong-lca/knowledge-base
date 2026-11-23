import type { SearchEntry } from '@/components/site-header';
import { getSource } from '@/lib/source';
import catalog from '@/lib/catalog';
import type { Locale } from '@/lib/i18n';

export function getSearchEntries(lang: Locale): SearchEntry[] {
  if (lang === 'en') {
    const enPages = getSource('en').getPages();
    return [
      {
        title: 'LCA Historical Timeline (1969–2026)',
        text: 'Visual timeline of life cycle assessment milestones from early resource inventories to ISO standards, consensus models, and prospective LCA.',
        url: '/en/timeline/',
        kind: 'Timeline',
      },
      ...enPages.map((p) => ({
        title: p.data.title,
        text: p.data.description ?? '',
        url: p.url.endsWith('/') ? p.url : `${p.url}/`,
        kind: 'Chapter',
      })),
      ...catalog.concepts.map((c) => ({
        title: c.english || c.label,
        text: `${c.label} ${c.aliases.join(' ')}`,
        url: `/en/concepts/#${c.id}`,
        kind: 'Concept',
      })),
      ...catalog.sources.map((s) => ({
        title: s.title,
        text: `${s.publisher} ${s.version}`,
        url: `/en/sources/#${s.id}`,
        kind: 'Source',
      })),
    ];
  }

  return [
    {
      title: '生命周期评价发展大事记（1969–2026）',
      text: '可视化历史时间线：早期资源账本、SETAC 与 CML 框架成型、ISO 标准化、数据库与共识模型、欧盟法规与前瞻动态 LCA。',
      url: '/zh/timeline/',
      kind: '大事记',
    },
    ...getSource('zh').getPages().map((p) => ({
      title: p.data.title,
      text: p.data.description ?? '',
      url: p.url.endsWith('/') ? p.url : `${p.url}/`,
      kind: '章节',
    })),
    ...catalog.claims.filter((c) => c.status === 'reviewed').map((c) => ({
      title: c.text,
      text: c.scope,
      url: `/zh/claims/#${c.id}`,
      kind: '论述',
    })),
    ...catalog.concepts.map((c) => ({
      title: c.label,
      text: `${c.english} ${c.aliases.join(' ')}`,
      url: `/zh/concepts/#${c.id}`,
      kind: '概念',
    })),
    ...catalog.sources.map((s) => ({
      title: s.title,
      text: `${s.publisher} ${s.version}`,
      url: `/zh/sources/#${s.id}`,
      kind: '来源',
    })),
  ];
}

export function getPublishedPaths(): string[] {
  const staticToolRoutes = ['/', '/coverage/', '/timeline/', '/research/', '/sources/', '/concepts/', '/claims/', '/changes/', '/print/'];
  const paths = new Set<string>(['/']);
  for (const lang of ['zh', 'en'] as const) {
    for (const r of staticToolRoutes) {
      paths.add(r === '/' ? `/${lang}/` : `/${lang}${r}`);
    }
    for (const page of getSource(lang).getPages()) {
      paths.add(page.url.endsWith('/') ? page.url : `${page.url}/`);
    }
  }
  return [...paths];
}
