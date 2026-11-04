import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteBrand } from '@/components/site-brand';
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <SiteBrand />, url: '/', transparentMode: 'top' },
    githubUrl: 'https://github.com/tiangong-lca/knowledge-base',
    links: [
      { text: '阅读', url: '/docs/' },
      { text: '概念', url: '/concepts/' },
      { text: '参考文献', url: '/research/' },
      { text: '引文出处', url: '/sources/' },
      { text: '注释与论证', url: '/claims/' },
      { text: '全书导览', url: '/coverage/' },
    ],
  };
}
