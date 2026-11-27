import Link from 'next/link';
import { getSource } from '@/lib/source';
import { NumberedTitle } from '@/components/numbered-heading';
import { EN_PARTS, UI_SURFACES } from '@/lib/ui-glossary';
import { getPresentationUnits, readerParts } from '@/scripts/reader-numbering.mjs';

const logicalKey = (url: string) => url.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/\/+$/, '') || '/';

export function EnHomePage() {
  const enPages = new Map(getSource('en').getPages().map(page => [logicalKey(page.url), page]));
  const units = getPresentationUnits('web');
  const chapters = units.filter(unit => unit.kind === 'chapter');
  const topics = units.filter(unit => unit.kind === 'topic');
  const appendices = units.filter(unit => unit.kind === 'appendix');

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
            This complete meaning-equivalent English edition spans all {readerParts.length} parts, {chapters.length} chapters, {topics.length} topical essays, and {appendices.length} appendices.
          </p>
          <div className="home-actions flex-wrap">
            <Link className="primary-link whitespace-nowrap" href="/en/docs/">
              Start Reading
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/coverage/">
              {UI_SURFACES.bookGuide.en}
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/timeline/">
              {UI_SURFACES.timeline.en}
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/en/print/">
              {UI_SURFACES.fullTextPrint.en}
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

      <section className="reading-section reader-web-contents" id="web-contents">
        <div className="section-heading">
          <h2>All {chapters.length} Chapters Across {readerParts.length} Parts</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/en/coverage/">{UI_SURFACES.bookGuide.en}</Link>
            <Link href="/en/print/">{UI_SURFACES.fullTextPrint.en}</Link>
          </div>
        </div>
        {readerParts.map(part => {
          const enPart = EN_PARTS[part.number];
          return (
            <section className="reader-web-part" key={part.number}>
              <h3>
                <NumberedTitle number={enPart?.label ?? `Part ${part.number}`}>
                  {enPart?.title ?? part.title}
                </NumberedTitle>
              </h3>
              <div className="chapter-list">
                {units
                  .filter(unit => unit.part === part.number)
                  .map(unit => {
                    const page = enPages.get(logicalKey(unit.key));
                    if (!page) return null;
                    return (
                      <Link className="chapter-row" href={page.url} key={unit.key}>
                        <div>
                          <h4>
                            <NumberedTitle number={`Chapter ${unit.ordinal}`}>{page.data.title}</NumberedTitle>
                          </h4>
                          <p>{page.data.description}</p>
                        </div>
                        <span className="chapter-action">Read</span>
                      </Link>
                    );
                  })}
              </div>
            </section>
          );
        })}
      </section>

      <section className="reading-section">
        <div className="section-heading">
          <h2>Topical Essays</h2>
          <Link href="/en/coverage/#en-guide-appendices">View Appendices A–E</Link>
        </div>
        <div className="chapter-list">
          {topics.map((unit, idx) => {
            const page = enPages.get(logicalKey(unit.key));
            if (!page) return null;
            return (
              <Link className="chapter-row" href={page.url} key={unit.key}>
                <div>
                  <h3>
                    <NumberedTitle number={`Topic ${idx + 1}`}>{page.data.title}</NumberedTitle>
                  </h3>
                  <p>{page.data.description}</p>
                </div>
                <span className="chapter-action">Explore</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="evidence-overview">
        <div>
          <h2>Trace Claims Back to Primary Sources</h2>
          <p>
            Chapter-end notes record primary sources, exact passage locators, validity scopes, and caveats. Use the reference apparatus below
            to compare frameworks, verify dates, or inspect every reviewed claim.
          </p>
        </div>
        <div className="overview-links">
          <Link href="/en/coverage/">
            {UI_SURFACES.bookGuide.en}<span>{readerParts.length} parts, {chapters.length} chapters, {topics.length} topical essays, and {appendices.length} appendices</span>
          </Link>
          <Link href="/en/timeline/">
            {UI_SURFACES.timeline.en}<span>Milestones from 1969 to 2026 with source links</span>
          </Link>
          <Link href="/en/research/">
            {UI_SURFACES.references.en}<span>Primary bibliography and passage-level citation locators</span>
          </Link>
          <Link href="/en/concepts/">
            {UI_SURFACES.conceptIndex.en}<span>Core LCA terminology and cross-framework mappings</span>
          </Link>
          <Link href="/en/claims/">
            {UI_SURFACES.chapterNotes.en}<span>All chapter notes with sources, scopes, and caveats</span>
          </Link>
          <Link href="/en/changes/">
            {UI_SURFACES.revisionsErrata.en}<span>Reader-facing revisions and errata reporting</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
