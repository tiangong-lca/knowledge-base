import { defineI18n } from 'fumadocs-core/i18n';

export const SUPPORTED_LOCALES = ['zh', 'en'];
export const DEFAULT_LOCALE = 'zh';

/**
 * Controlled rollout flag: stays false during P1 infrastructure rollout so
 * non-Chinese browsers are not auto-redirected to an empty /en/ shell before
 * Part I + Preface + Guide are published in P3.
 */
export const EN_PUBLIC_ENABLED = false;

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
