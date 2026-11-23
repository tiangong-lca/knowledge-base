import { defineI18n } from 'fumadocs-core/i18n';

export const SUPPORTED_LOCALES = ['zh', 'en'];
export const DEFAULT_LOCALE = 'zh';

/**
 * Controlled rollout flag: enabled once Preface, Reading Guide, Part I (Chapters 1–5),
 * and Chapter 29 are published so non-Chinese browsers auto-enter /en/ on / and
 * search engines can index published English routes with hreflang alternates.
 */
export const EN_PUBLIC_ENABLED = true;

export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LOCALE,
  languages: SUPPORTED_LOCALES,
  hideLocale: 'never',
  fallbackLanguage: null,
});

export function isSupportedLocale(value) {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
}

export function toHtmlLang(lang) {
  return lang === 'zh' ? 'zh-CN' : 'en';
}

export function localizePath(lang, path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return lang === DEFAULT_LOCALE ? '/' : `/${lang}/`;
  const stripped = normalized.replace(/^\/(zh|en)(?=\/|$)/, '') || '/';
  if (stripped === '/') return `/${lang}/`;
  const withSlash = stripped.endsWith('/') || stripped.includes('#') || stripped.includes('?') ? stripped : `${stripped}/`;
  return `/${lang}${withSlash}`;
}
