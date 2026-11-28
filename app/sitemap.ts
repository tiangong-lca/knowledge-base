import type { MetadataRoute } from 'next';
import { getPresentationUnits } from '@/scripts/reader-numbering.mjs';
import { EN_PUBLIC_ENABLED } from '@/lib/i18n';
import { getSource } from '@/lib/source';
import { languageAlternates, siteOrigin } from '@/lib/seo-policy.mjs';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticToolRoutes = [
    '/coverage/',
    '/controversies/',
    '/research/',
    '/sources/',
    '/concepts/',
    '/claims/',
    '/changes/',
    '/print/',
  ];
  const staticToolSet = new Set(staticToolRoutes.map((r) => r.replace(/^\/+|\/+$/g, '')));
  const unitRoutes = getPresentationUnits('web').map((unit) => `${unit.key}/`);
  const homeAlternates = Object.fromEntries(
    Object.entries(languageAlternates('', EN_PUBLIC_ENABLED ? ['zh', 'en'] : ['zh'])).map(
      ([k, v]) => [k, `${siteOrigin}${v}`],
    ),
  );

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteOrigin}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: homeAlternates },
    },
  ];

  if (EN_PUBLIC_ENABLED) {
    entries.push({
      url: `${siteOrigin}/en/`,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: homeAlternates },
    });
  }

  for (const route of [...new Set([...staticToolRoutes, ...unitRoutes])]) {
    const clean = route.replace(/^\/+|\/+$/g, '');
    const hasEn =
      EN_PUBLIC_ENABLED &&
      (staticToolSet.has(clean) ||
        Boolean(getSource('en').getPage(clean.replace(/^docs\/?/, '').split('/').filter(Boolean))));
    const locales = hasEn ? ['zh', 'en'] : ['zh'];
    const alternates = Object.fromEntries(
      Object.entries(languageAlternates(`/${clean}`, locales)).map(([k, v]) => [k, `${siteOrigin}${v}`]),
    );
    const changeFrequency = route === '/coverage/' ? 'weekly' : 'monthly';
    const priority = route.startsWith('/docs/book/') ? 0.8 : 0.7;

    entries.push({
      url: `${siteOrigin}/zh/${clean}/`,
      changeFrequency,
      priority,
      alternates: { languages: alternates },
    });

    if (hasEn) {
      entries.push({
        url: `${siteOrigin}/en/${clean}/`,
        changeFrequency,
        priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
