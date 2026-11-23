import type { MetadataRoute } from 'next';
import { getPresentationUnits } from '@/scripts/reader-numbering.mjs';

export const dynamic = 'force-static';

const SITE_ORIGIN = 'https://prism.tiangong.earth';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/coverage/',
    '/timeline/',
    '/research/',
    '/sources/',
    '/concepts/',
    '/claims/',
    '/changes/',
    '/print/',
  ];
  const unitRoutes = getPresentationUnits('web').map(unit => `${unit.key}/`);
  const all = [...new Set([...staticRoutes, ...unitRoutes])];
  return all.map(route => ({
    url: `${SITE_ORIGIN}${route}`,
    changeFrequency: route === '/' || route === '/coverage/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1.0 : route.startsWith('/docs/book/') ? 0.8 : 0.7,
  }));
}
