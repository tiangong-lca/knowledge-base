import Link from 'next/link';

const PUBLISHED_EN_CHAPTERS = [
  { label: 'Preface', title: 'Preface', href: '/en/docs/' },
  { label: 'Guide', title: 'Reading Guide', href: '/en/docs/book/' },
  { label: 'Chapter 1', title: 'Life Cycle Perspective', href: '/en/docs/book/integrative-ambitions/' },
  { label: 'Chapter 2', title: 'Beverage Container Ledgers', href: '/en/docs/book/early-container-comparisons/' },
  { label: 'Chapter 3', title: 'Container Comparisons and Policy Judgment', href: '/en/docs/book/early-container-policy-and-systems/' },
  { label: 'Chapter 4', title: 'Assessment Frameworks and Analytical Steps', href: '/en/docs/book/framework-responsibilities/' },
  { label: 'Chapter 5', title: 'Life Cycle Assessment in Cleaner Production', href: '/en/docs/book/cleaner-production-purpose-and-prospects/' },
  { label: 'Chapter 6', title: 'Functional Reference', href: '/en/docs/book/service-and-reference/' },
  { label: 'Chapter 7', title: 'Process Networks', href: '/en/docs/book/inventory-calculation/' },
  { label: 'Chapter 8', title: 'Flows, Exchanges, and Boundaries', href: '/en/docs/book/exchange-semantics-and-conversion/' },
  { label: 'Chapter 9', title: 'Hybrid Inventory Analysis', href: '/en/docs/book/inventory-boundary-and-hybrid/' },
  { label: 'Chapter 29', title: 'Wall Service Comparison (Interactive Case)', href: '/en/docs/book/wall-service-to-comparison/' },
];

export function EnHomePage() {
  return (
    <main id="main-content">
      <section className="home-intro">
        <div className="home-copy">
          <p className="publication-name">TianGong LCA Knowledge Base</p>
          <h1>
            The Past and Present of
            <br />
            Life Cycle Assessment
          </h1>
          <p className="home-lead">
            How does the world behind a product enter calculation and become an environmental judgment?
            This meaning-equivalent English edition is authored progressively from primary standards, handbooks, and peer-reviewed studies.
          </p>
          <div className="home-actions flex-wrap">
            <Link className="primary-link whitespace-nowrap" href="/en/docs/">
              Start Reading (Preface)
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/docs/book/integrative-ambitions/">
              Part I: Chapters 1–5
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/coverage/">
              Book Guide &amp; Release Status
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/zh/">
              Chinese Edition
            </Link>
          </div>
        </div>
        <div className="knowledge-figure" aria-label="Reading arc: from real-world questions through concepts, methods, and models to evidence-bound judgment">
          <div className="figure-source">Real-World Questions</div>
          <div className="figure-branches">
            <span>Conceptual Origins</span>
            <span>Method Choices</span>
            <span>Model Meaning</span>
          </div>
          <div className="figure-line" />
          <div className="figure-center">
            Follow the Evidence
            <br />
            <strong>Revisable Judgment</strong>
          </div>
          <div className="figure-foot">History · Methods · Argument</div>
        </div>
      </section>

      <section className="reading-section">
        <div className="section-heading">
          <h2>Published English Chapters (Parts I–II + Pilot)</h2>
          <Link href="/en/coverage/">View full 32-chapter roadmap</Link>
        </div>
        <div className="chapter-grid">
          {PUBLISHED_EN_CHAPTERS.map(item => (
            <Link key={item.href} href={item.href} className="chapter-card">
              <span className="chapter-kicker">{item.label}</span>
              <h3>{item.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
