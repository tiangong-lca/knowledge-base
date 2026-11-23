import Link from 'next/link';

export function EnHomePage() {
  return (
    <main id="main-content">
      <section className="home-intro">
        <div className="home-copy">
          <p className="publication-name">TianGong LCA Knowledge Base</p>
          <h1>
            The Evolution and Foundations of
            <br />
            Life Cycle Assessment
          </h1>
          <p className="home-lead">
            How does the world behind a product enter calculation and become an environmental judgment?
            This meaning-equivalent English edition is being authored progressively from primary standards, handbooks, and peer-reviewed studies.
          </p>
          <div className="home-actions flex-wrap">
            <Link className="primary-link whitespace-nowrap" href="/en/docs/">
              About the English Edition
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/coverage/">
              Book Guide &amp; Rollout Status
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/zh/">
              Read Complete Chinese Edition
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
          <h2>Progressive Publication Status</h2>
          <Link href="/en/coverage/">View 32-chapter roadmap</Link>
        </div>
        <p className="home-lead">
          All 32 chapters, 5 topical essays, and 5 appendices are currently live in the Chinese edition and share the same evidence, primary-source locators, and numerical calculation inputs. English chapters are being authored by part and published progressively as each batch completes bilingual meaning review and independent English reader audit.
        </p>
      </section>
    </main>
  );
}
