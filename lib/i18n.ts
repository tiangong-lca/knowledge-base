import {
  DEFAULT_LOCALE,
  EN_PUBLIC_ENABLED,
  SUPPORTED_LOCALES,
  i18n,
  isSupportedLocale as isSupportedLocaleRaw,
  localizePath,
  toHtmlLang,
} from './i18n.mjs';

export type Locale = 'zh' | 'en';

export {
  DEFAULT_LOCALE,
  EN_PUBLIC_ENABLED,
  SUPPORTED_LOCALES,
  i18n,
  localizePath,
  toHtmlLang,
};

export function isSupportedLocale(value: unknown): value is Locale {
  return isSupportedLocaleRaw(value);
}
