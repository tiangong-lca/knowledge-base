import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { SUPPORTED_LOCALES, type Locale } from './i18n';

const zhDocs = defineDocs({ dir: 'content/docs' });
const enDocs = defineDocs({ dir: 'content-en/docs' });

export const zhSource = loader({ baseUrl: '/zh/docs', source: zhDocs.toFumadocsSource() });
export const enSource = loader({ baseUrl: '/en/docs', source: enDocs.toFumadocsSource() });

/** Default export alias retained for Chinese-side consumers. */
export const source = zhSource;

export function getSource(lang: Locale) {
  return lang === 'en' ? enSource : zhSource;
}

export function availableDocLocales(slugs?: string[]): Locale[] {
  return SUPPORTED_LOCALES.filter((lang) => Boolean(getSource(lang as Locale).getPage(slugs))) as Locale[];
}
