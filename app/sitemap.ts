import type { MetadataRoute } from 'next';
import { getPresentationUnits } from '@/scripts/reader-numbering.mjs';
import { EN_PUBLIC_ENABLED } from '@/lib/i18n';
import { getSource } from '@/lib/source';
import { languageAlternates, siteOrigin } from '@/lib/seo-policy.mjs';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticToolRoutes = [
    '/coverage/',
    '/timeline/',
    '/research/',
    '/sources/',
    '/concepts/',
    '/claims/',
    '/changes/',
    '/print/',
  ];
  const unitRoutes = getPresentationUnits('web').map((unit) => `${unit.key}/`);
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteOrigin}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates('', EN_PUBLIC_ENABLED ? ['zh', 'en'] : ['zh'])).map(
            ([k, v]) => [k, `${siteOrigin}${v}`],
          ),
        ),
      },
    },
  ];

  for (const route of [...new Set([...staticToolRoutes, ...unitRoutes])]) {
    const clean = route.replace(/^\/+|\/+$/g, '');
    const locales = EN_PUBLIC_ENABLED && getSource('en').getPage(clean.replace(/^docs\/?/, '').split('/').filter(Boolean))
      ? ['zh', 'en']
      : ['zh'];
    entries.push({
      url: `${siteOrigin}/zh/${clean}/`,
      changeFrequency: route === '/coverage/' ? 'weekly' : 'monthly',
      priority: route.startsWith('/docs/book/') ? 0.8 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(`/${clean}`, locales)).map(([k, v]) => [k, `${siteOrigin}${v}`]),
        ),
      },
    });
  }

  return entries;
}
