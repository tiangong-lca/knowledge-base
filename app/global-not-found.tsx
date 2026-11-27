import type { Metadata } from 'next';
import Link from 'next/link';
import { UI_SURFACES } from '@/lib/ui-glossary';
import './global.css';

export const metadata: Metadata = {
  title: '页面未找到 / Page Not Found — 生命周期评价的前世今生',
  description: '请检查网址，或从中文版与英文版入口继续阅读。',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <main
          id="main-content"
          style={{
            maxWidth: '42rem',
            margin: '5rem auto',
            padding: '0 1.5rem',
            lineHeight: 1.75,
          }}
        >
          <p style={{ fontSize: '0.85rem', letterSpacing: '0.06em', opacity: 0.7, marginBottom: '0.5rem' }}>
            404 · 天工 LCA 知识库 / TianGong LCA Knowledge Base
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            页面未找到 / Page Not Found
          </h1>
          <p style={{ marginBottom: '0.75rem' }}>
            您访问的网址不存在或已迁移。请检查地址，或从以下入口继续阅读《生命周期评价的前世今生》：
          </p>
          <p style={{ marginBottom: '1.5rem', opacity: 0.85 }}>
            The requested page could not be found or has moved. Continue reading <em>The Past and Present of Life Cycle Assessment</em> from the Chinese or English edition:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link className="primary-link" href="/">中文首页</Link>
            <Link className="secondary-link" href="/zh/coverage/">{UI_SURFACES.bookGuide.zh}</Link>
            <Link className="primary-link" href="/en/">English Home</Link>
            <Link className="secondary-link" href="/en/coverage/">{UI_SURFACES.bookGuide.en}</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
