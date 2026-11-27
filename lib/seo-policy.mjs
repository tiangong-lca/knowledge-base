import { i18n } from './i18n.mjs';

export const siteOrigin = process.env.CANONICAL_ORIGIN ?? 'https://prism.tiangong.earth';

export const localeMetadata = {
  zh: {
    siteName: '天工 LCA 知识库',
    title: '生命周期评价的前世今生',
    titleTemplate: '%s | 天工 LCA 知识库',
    description: '从早期问题到方法分歧，沿着概念、模型与原始证据理解生命周期评价。',
    openGraphLocale: 'zh_CN',
  },
  en: {
    siteName: 'TianGong LCA Knowledge Base',
    title: 'The Past and Present of Life Cycle Assessment',
    titleTemplate: '%s | TianGong LCA Knowledge Base',
    description: 'From early questions to methodological debates, understanding life cycle assessment through concepts, models, and primary evidence.',
    openGraphLocale: 'en_US',
  },
};

export function withTrailingSlash(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Chinese is the x-default home at `/`; English keeps `/en/`.
 * `/zh/` is an explicit Chinese home with canonical `/`, so it is never a canonical or hreflang target.
 */
export function homePath(lang) {
  return lang === i18n.defaultLanguage ? '/' : `/${lang}/`;
}

/**
 * Emit hreflang entries ONLY for locales that actually publish this logical path.
 * Never emits `/zh/` for the home route.
 * @param {string} path Logical path without locale prefix (e.g. '' for home, '/docs/book/joint-production')
 * @param {readonly string[]} [availableLocales]
 */
export function languageAlternates(path = '', availableLocales = [i18n.defaultLanguage]) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const suffix = clean.length === 0 ? '' : `/${clean}`;
  const localized = (lang) => (suffix === '' ? homePath(lang) : `/${lang}${suffix}/`);
  const published = availableLocales.filter((lang) => i18n.languages.includes(lang));
  const defaultTarget = published.includes(i18n.defaultLanguage)
    ? localized(i18n.defaultLanguage)
    : localized(published[0] ?? i18n.defaultLanguage);
  return {
    'x-default': suffix === '' ? '/' : defaultTarget,
    ...Object.fromEntries(
      published.map((lang) => [lang === 'zh' ? 'zh-CN' : lang, localized(lang)]),
    ),
  };
}
