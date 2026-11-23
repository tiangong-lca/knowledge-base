import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteBrand } from '@/components/site-brand';
import type { Locale } from '@/lib/i18n';
import enUi from '@/config/editions/en/ui.json';

export function baseOptions(lang: Locale = 'zh'): BaseLayoutProps {
  const prefix = `/${lang}`;
  if (lang === 'en') {
    return {
      i18n: true,
      nav: { title: <SiteBrand lang="en" />, url: '/en/', transparentMode: 'top' },
      githubUrl: 'https://github.com/tiangong-lca/knowledge-base',
      links: [
        { text: enUi.nav.read, url: '/en/docs/' },
        { text: enUi.nav.timeline, url: '/en/timeline/' },
        { text: enUi.nav.guide, url: '/en/coverage/' },
        {
          type: 'menu',
          text: enUi.nav.indexMenu,
          items: [
            { text: enUi.nav.concepts, description: enUi.nav.conceptsDesc, url: '/en/concepts/' },
            { text: enUi.nav.references, description: enUi.nav.referencesDesc, url: '/en/research/' },
            { text: enUi.nav.claims, description: enUi.nav.claimsDesc, url: '/en/claims/' },
            { text: enUi.nav.changes, description: enUi.nav.changesDesc, url: '/en/changes/' },
            { text: enUi.nav.print, description: enUi.nav.printDesc, url: '/en/print/' },
          ],
        },
      ],
    };
  }
  return {
    i18n: true,
    nav: { title: <SiteBrand lang="zh" />, url: '/', transparentMode: 'top' },
    githubUrl: 'https://github.com/tiangong-lca/knowledge-base',
    links: [
      { text: '阅读', url: `${prefix}/docs/` },
      { text: '发展大事记', url: `${prefix}/timeline/` },
      { text: '全书导览', url: `${prefix}/coverage/` },
      {
        type: 'menu',
        text: '索引与出处',
        items: [
          {
            text: '概念索引',
            description: '核心术语、英文原词与跨体系定义对照',
            url: `${prefix}/concepts/`,
          },
          {
            text: '参考文献与出处',
            description: '原始文献书目、核读记录与逐条引文出处定位',
            url: `${prefix}/research/`,
          },
          {
            text: '注释与论证',
            description: '全书论述条目、适用边界与前置依赖',
            url: `${prefix}/claims/`,
          },
          {
            text: '版本与勘误',
            description: '历次修订留痕与公开变更日志',
            url: `${prefix}/changes/`,
          },
          {
            text: '连续阅读与打印',
            description: '按全书顺序连续阅读或纸面打印',
            url: `${prefix}/print/`,
          },
        ],
      },
    ],
  };
}
