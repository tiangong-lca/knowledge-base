import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '生命周期评价的前世今生 | 天工 LCA 知识库',
    short_name: '天工 LCA 知识库',
    description: '从概念的来历到方法的含义，沿着证据理解生命周期评价。持续修订的中文 LCA 知识库与研究综述。',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#1f5f43',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
