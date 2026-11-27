import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';
import { UI_SURFACES } from '@/lib/ui-glossary';

export default function NotFoundPage() {
  return (
    <PublicationShell
      title="页面未找到 / Page Not Found"
      description="请检查网址，或从以下入口继续阅读。 / Please check the URL or continue from one of the entry points below."
    >
      <p>
        您访问的网址不存在或已迁移。请从中文版或英文版入口重新进入：
      </p>
      <p>
        The requested page could not be found or has moved. Continue from the Chinese or English edition:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
        <Link className="primary-link" href="/">中文首页</Link>
        <Link className="secondary-link" href="/zh/coverage/">{UI_SURFACES.bookGuide.zh}</Link>
        <Link className="primary-link" href="/en/">English Home</Link>
        <Link className="secondary-link" href="/en/coverage/">{UI_SURFACES.bookGuide.en}</Link>
      </div>
    </PublicationShell>
  );
}
