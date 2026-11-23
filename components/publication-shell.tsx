export function PublicationShell({
  title,
  description,
  children,
  lang = 'zh',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  lang?: 'zh' | 'en';
}) {
  const isEn = lang === 'en';
  return (
    <main id="main-content" className="publication-shell">
      <header className="page-intro">
        <a href={isEn ? '/en/' : '/'}>{isEn ? 'Knowledge Base' : '知识库'}</a>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}
