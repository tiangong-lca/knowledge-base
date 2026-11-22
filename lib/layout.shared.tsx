import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteBrand } from '@/components/site-brand';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <SiteBrand />, url: '/', transparentMode: 'top' },
    githubUrl: 'https://github.com/tiangong-lca/knowledge-base',
    links: [
      { text: '阅读', url: '/docs/' },
      { text: '发展大事记', url: '/timeline/' },
      { text: '全书导览', url: '/coverage/' },
      {
        type: 'menu',
        text: '索引与出处',
        items: [
          {
            text: '概念索引',
            description: '核心术语、英文原词与跨体系定义对照',
            url: '/concepts/',
          },
          {
            text: '参考文献',
            description: '原始文献书目、版本信息与核读记录',
            url: '/research/',
          },
          {
            text: '引文出处',
            description: '逐条引文位置、页码与一手来源核验',
            url: '/sources/',
          },
          {
            text: '注释与论证',
            description: '全书论述条目、适用边界与前置依赖',
            url: '/claims/',
          },
          {
            text: '版本与勘误',
            description: '历次修订留痕与公开变更日志',
            url: '/changes/',
          },
          {
            text: '连续阅读与打印',
            description: '按全书顺序连续阅读或纸面打印',
            url: '/print/',
          },
        ],
      },
    ],
  };
}
