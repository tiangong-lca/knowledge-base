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
  { label: 'Chapter 10', title: 'Joint Production (Interactive Case)', href: '/en/docs/book/joint-production/' },
  { label: 'Chapter 11', title: 'Market Response', href: '/en/docs/book/market-boundaries-and-response/' },
  { label: 'Chapter 12', title: 'Electricity Systems', href: '/en/docs/book/electricity-service-and-response/' },
  { label: 'Chapter 13', title: 'Material Recycling Chains', href: '/en/docs/book/recycling-chains-and-accounting/' },
  { label: 'Chapter 14', title: 'Midpoints and Endpoints', href: '/en/docs/book/midpoint-endpoint-value-choices/' },
  { label: 'Chapter 15', title: 'Climate Equivalence', href: '/en/docs/book/climate-equivalence/' },
  { label: 'Chapter 16', title: 'Acidification and Nutrient Enrichment', href: '/en/docs/book/acidification-and-nutrient-pathways/' },
  { label: 'Chapter 17', title: 'Particulate Emissions and Health Damage', href: '/en/docs/book/particulate-emissions-and-health/' },
  { label: 'Chapter 18', title: 'Water Consumption and Scarcity Potential', href: '/en/docs/book/water-scarcity-and-reference/' },
  { label: 'Chapter 19', title: 'Toxicity Pathways', href: '/en/docs/book/usetox-pathways-and-boundaries/' },
  { label: 'Chapter 20', title: 'Ecological Scarcity Weighting', href: '/en/docs/book/ecological-scarcity-and-targets/' },
  { label: 'Chapter 21', title: 'Regionalization of Impact Assessment', href: '/en/docs/book/localization-evidence-and-denominators/' },
  { label: 'Chapter 22', title: 'Monetary Valuation of Environmental Damage', href: '/en/docs/book/lime-preferences-and-damage-weights/' },
  { label: 'Chapter 23', title: 'Social Performance and Impacts', href: '/en/docs/book/social-assessment-objects-and-meaning/' },
  { label: 'Chapter 24', title: 'Life Cycle Costing and Integrated Assessment', href: '/en/docs/book/cost-perspectives-and-sustainability-combination/' },
  { label: 'Chapter 25', title: 'Data Applicability', href: '/en/docs/book/data-applicability/' },
  { label: 'Chapter 26', title: 'Variability and Uncertainty', href: '/en/docs/book/uncertainty-and-variability/' },
  { label: 'Chapter 27', title: 'Data Quality Scores and Probability', href: '/en/docs/book/data-quality-and-probability/' },
  { label: 'Chapter 28', title: 'Product Footprint Rules and Practice', href: '/en/docs/book/product-footprint-rules-and-practice/' },
  { label: 'Chapter 29', title: 'Wall Service Comparison (Interactive Case)', href: '/en/docs/book/wall-service-to-comparison/' },
  { label: 'Chapter 30', title: 'Carrier-Bag Studies', href: '/en/docs/book/interpretation-and-limits/' },
  { label: 'Chapter 31', title: 'Future Technologies and Scenarios', href: '/en/docs/book/future-technology-and-context/' },
  { label: 'Chapter 32', title: 'Revisable Judgment', href: '/en/docs/book/revisable-judgment/' },
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
            This complete meaning-equivalent English edition spans all 7 parts, 32 chapters, 5 topical essays, 5 appendices, and 1,117 evidence-bound claims.
          </p>
          <div className="home-actions flex-wrap">
            <Link className="primary-link whitespace-nowrap" href="/en/docs/">
              Start Reading (Preface)
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/coverage/">
              Book Guide (44 Units)
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/timeline/">
              Historical Timeline
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/print/">
              Print Edition
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
          <h2>Complete English Edition (All 7 Parts · 32 Chapters)</h2>
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
