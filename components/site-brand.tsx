import type { Locale } from '@/lib/i18n';

export function SiteBrand({ lang = 'zh' }: { lang?: Locale }) {
  const isEn = lang === 'en';
  return (
    <span className="knowledge-brand">
      <span className="knowledge-brand-mark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export serves public SVGs directly */}
        <img src="/logo-light.svg" alt="" width={28} height={28} className="dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.svg" alt="" width={28} height={28} className="hidden dark:block" />
      </span>
      <span className="knowledge-brand-name" aria-hidden="true">
        {isEn ? 'TianGong LCA' : '天工 LCA'} <span className="knowledge-brand-divider">/</span>{' '}
        <span className="knowledge-brand-product">{isEn ? 'Knowledge Base' : '知识库'}</span>
      </span>
      <span className="sr-only">{isEn ? 'TianGong LCA Knowledge Base Home' : '天工 LCA 知识库首页'}</span>
    </span>
  );
}
