export function SiteBrand() {
  return (
    <span className="knowledge-brand">
      <span className="knowledge-brand-mark" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export serves public SVGs directly */}
        <img src="/logo-light.svg" alt="" width={28} height={28} className="dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.svg" alt="" width={28} height={28} className="hidden dark:block" />
      </span>
      <span className="knowledge-brand-name" aria-hidden="true">
        天工 LCA <span className="knowledge-brand-divider">/</span>{' '}
        <span className="knowledge-brand-product">知识库</span>
      </span>
      <span className="sr-only">天工 LCA 知识库首页</span>
    </span>
  );
}
