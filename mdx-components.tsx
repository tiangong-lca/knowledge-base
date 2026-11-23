import { TeachingCase } from '@/components/teaching-case';
import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import { Claim, Prose, SourceRef, ConceptRef } from '@/components/evidence';

const LOCALIZED_PREFIXES = ['/docs', '/sources', '/research', '/coverage', '/timeline', '/concepts', '/claims', '/changes', '/print'];

function localizeHref(href: string | undefined, locale: 'zh' | 'en' = 'zh'): string | undefined {
  if (!href || !href.startsWith('/')) return href;
  if (href.startsWith('/zh/') || href === '/zh' || href.startsWith('/en/') || href === '/en' || href.startsWith('/downloads/')) {
    return href;
  }
  for (const prefix of LOCALIZED_PREFIXES) {
    if (href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}#`) || href.startsWith(`${prefix}?`)) {
      return `/${locale}${href}`;
    }
  }
  return href;
}

const DefaultAnchor = defaultComponents.a;

function createLocalizedAnchor(locale: 'zh' | 'en') {
  return function LocalizedAnchor({ href, ...props }: ComponentPropsWithoutRef<'a'>) {
    const resolved = localizeHref(href, locale);
    if (DefaultAnchor) return <DefaultAnchor href={resolved} {...props} />;
    return <a href={resolved} {...props} />;
  };
}

export function getMDXComponents(components?: MDXComponents, locale: 'zh' | 'en' = 'zh') {
  return {
    ...defaultComponents,
    a: createLocalizedAnchor(locale),
    TeachingCase,
    Claim,
    Prose,
    SourceRef,
    ConceptRef,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
