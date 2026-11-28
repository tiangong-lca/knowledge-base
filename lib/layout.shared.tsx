import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteBrand } from '@/components/site-brand';
import type { Locale } from '@/lib/i18n';
import { UI_SURFACES } from '@/lib/ui-glossary';
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
        { text: UI_SURFACES.timeline.en, url: '/en/timeline/' },
        { text: UI_SURFACES.bookGuide.en, url: '/en/coverage/' },
        {
          type: 'menu',
          text: enUi.nav.indexMenu,
          items: [
            { text: UI_SURFACES.conceptIndex.en, description: enUi.nav.conceptsDesc, url: '/en/concepts/' },
            { text: UI_SURFACES.references.en, description: enUi.nav.referencesDesc, url: '/en/research/' },
            { text: UI_SURFACES.chapterNotes.en, description: enUi.nav.claimsDesc, url: '/en/claims/' },
            { text: UI_SURFACES.controversies.en, description: enUi.nav.controversiesDesc, url: '/en/controversies/' },
            { text: UI_SURFACES.revisionsErrata.en, description: enUi.nav.changesDesc, url: '/en/changes/' },
            { text: UI_SURFACES.fullTextPrint.en, description: enUi.nav.printDesc, url: '/en/print/' },
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
      { text: UI_SURFACES.timeline.zh, url: `${prefix}/timeline/` },
      { text: UI_SURFACES.bookGuide.zh, url: `${prefix}/coverage/` },
      {
        type: 'menu',
        text: '索引与参考',
        items: [
          {
            text: UI_SURFACES.conceptIndex.zh,
            description: '核心术语、英文原词与跨体系定义对照',
            url: `${prefix}/concepts/`,
          },
          {
            text: UI_SURFACES.references.zh,
            description: '全书引用的原始报告、论文、标准与出处位置',
            url: `${prefix}/research/`,
          },
          {
            text: UI_SURFACES.chapterNotes.zh,
            description: '全书章末注释、适用条件与前提关系总览',
            url: `${prefix}/claims/`,
          },
          {
            text: UI_SURFACES.controversies.zh,
            description: '各部证据边界、八类 LCIA 盲区、价值选择翻转点与限定注释',
            url: `${prefix}/controversies/`,
          },
          {
            text: UI_SURFACES.revisionsErrata.zh,
            description: '影响读者理解的内容修订、章节调整与勘误入口',
            url: `${prefix}/changes/`,
          },
          {
            text: UI_SURFACES.fullTextPrint.zh,
            description: '按全书顺序连续阅读或输出纸面打印版',
            url: `${prefix}/print/`,
          },
        ],
      },
    ],
  };
}
