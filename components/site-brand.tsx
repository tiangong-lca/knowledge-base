export function SiteBrand() {
  return <span className="knowledge-brand">
    <svg className="knowledge-brand-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M5 5h9v9H5zm13 13h9v9h-9z" fill="currentColor" /><path d="M18 5h9v9H18zM5 18h9v9H5z" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m14 9 4 0M9 14v4m5 5h4m5-9v4" stroke="currentColor" /></svg>
    <span className="knowledge-brand-name" aria-hidden="true">天工 LCA <span className="knowledge-brand-divider">/</span> <span className="knowledge-brand-product">知识库</span></span>
    <span className="sr-only">天工 LCA 知识库首页</span>
  </span>;
}
