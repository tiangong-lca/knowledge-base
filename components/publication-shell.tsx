import Link from 'next/link';
import { EN_PUBLIC_ENABLED } from '@/lib/i18n';

export function PublicationShell({
  title,
  description,
  children,
  lang = 'zh',
  logicalPath,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  lang?: 'zh' | 'en';
  logicalPath?: string;
}) {
  const isEn = lang === 'en';
  const cleanPath = logicalPath ? logicalPath.replace(/^\/+|\/+$/g, '') : '';
  const counterpartHref = cleanPath
    ? (isEn ? `/zh/${cleanPath}/` : `/en/${cleanPath}/`)
    : (isEn ? '/' : '/en/');
  return (
    <main id="main-content" className="publication-shell">
      <header className="page-intro">
        <nav
          aria-label={isEn ? 'Page navigation and language switcher' : '页面导航与语言切换'}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--kb-subtle)',
          }}
        >
          <a href={isEn ? '/en/' : '/'}>{isEn ? 'Knowledge Base' : '知识库'}</a>
          {(isEn || EN_PUBLIC_ENABLED) && (
            <Link
              href={counterpartHref}
              hrefLang={isEn ? 'zh-CN' : 'en'}
              style={{ textDecoration: 'underline' }}
            >
              {isEn ? '中文版' : 'English'}
            </Link>
          )}
        </nav>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}
