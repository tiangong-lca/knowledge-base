import Link from 'next/link';
import { getOrderedPages } from '@/lib/reader-book';
import { NumberedTitle } from '@/components/numbered-heading';
import { UI_SURFACES } from '@/lib/ui-glossary';
import { getPresentationUnits, readerParts } from '@/scripts/reader-numbering.mjs';

const logicalKey = (url: string) => url.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/\/+$/, '') || '/';

export function ZhHomePage() {
  const pages = new Map(getOrderedPages().map(page => [logicalKey(page.url), page]));
  const units = getPresentationUnits('web');
  const chapters = units.filter(unit => unit.kind === 'chapter');
  const topics = units.filter(unit => unit.kind === 'topic');
  const appendices = units.filter(unit => unit.kind === 'appendix');
  const appendixRange = appendices.length > 1 ? `A–${String.fromCharCode(64 + appendices.length)}` : 'A';
  return (
    <main id="main-content">
      <section className="home-intro">
        <div className="home-copy">
          <p className="publication-name">天工 LCA 知识库</p>
          <h1>
            生命周期评价的
            <br />
            前世今生
          </h1>
          <p className="home-lead">
            一件物品背后的世界，如何进入计算，又如何成为环境判断？从早期研究到方法分歧，沿着概念、模型与证据，理解生命周期评价。
          </p>
          <div className="home-actions flex-wrap">
            <Link className="primary-link whitespace-nowrap" href="/zh/docs/">
              开始阅读
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/zh/coverage/">
              {UI_SURFACES.bookGuide.zh}
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/zh/timeline/">
              {UI_SURFACES.timeline.zh}
            </Link>
            <Link className="secondary-link whitespace-nowrap" href="/zh/print/">
              {UI_SURFACES.fullTextPrint.zh}
            </Link>
          </div>
        </div>
        <div className="knowledge-figure" aria-label="阅读主线：现实问题经过概念、方法和模型，形成有依据的判断">
          <div className="figure-source">现实中的问题</div>
          <div className="figure-branches">
            <span>概念的来历</span>
            <span>方法的选择</span>
            <span>模型的含义</span>
          </div>
          <div className="figure-line" />
          <div className="figure-center">
            沿着证据
            <br />
            <strong>理解判断</strong>
          </div>
          <div className="figure-foot">历史 · 方法 · 论证</div>
        </div>
      </section>

      <section className="reading-section reader-web-contents" id="web-contents" data-reader-contents="web">
        <div className="section-heading">
          <h2>全书 {chapters.length} 章目录</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/zh/coverage/">{UI_SURFACES.bookGuide.zh}</Link>
            <Link href="/zh/print/">{UI_SURFACES.fullTextPrint.zh}</Link>
          </div>
        </div>
        {readerParts.map(part => (
          <section className="reader-web-part" key={part.number}>
            <h3 data-reader-web-part={part.number}>
              <NumberedTitle number={part.label}>{part.title}</NumberedTitle>
            </h3>
            <div className="chapter-list">
              {units
                .filter(unit => unit.part === part.number)
                .map(unit => {
                  const page = pages.get(logicalKey(unit.key));
                  if (!page || page.data.title !== unit.title) {
                    throw new Error(`Missing website contents source: ${unit.key}`);
                  }
                  return (
                    <Link className="chapter-row" href={page.url} key={unit.key} data-reader-web-unit={unit.key}>
                      <div>
                        <h4>
                          <NumberedTitle number={unit.label}>{page.data.title}</NumberedTitle>
                        </h4>
                        <p>{page.data.description}</p>
                      </div>
                      <span className="chapter-action">阅读</span>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
      </section>

      <section className="reading-section">
        <div className="section-heading">
          <h2>概念与实践专题</h2>
          <Link href="/zh/coverage/#guide-appendices">查看附录 {appendixRange}</Link>
        </div>
        <div className="chapter-list">
          {topics.map(unit => {
            const page = pages.get(logicalKey(unit.key));
            if (!page) throw new Error(`Missing website topic: ${unit.key}`);
            return (
              <Link className="chapter-row" href={page.url} key={unit.key}>
                <div>
                  <h3>
                    <NumberedTitle number={unit.label}>{page.data.title}</NumberedTitle>
                  </h3>
                  <p>{page.data.description}</p>
                </div>
                <span className="chapter-action">查阅</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="evidence-overview">
        <div>
          <h2>从论述回到出处</h2>
          <p>
            章末注释列出原始文献、具体位置与适用条件。遇到同名概念、方法分歧或不同版本时，可沿引文进一步对照，或通过大事记与全书导览回看关键节点。
          </p>
        </div>
        <div className="overview-links">
          <Link href="/zh/coverage/">
            {UI_SURFACES.bookGuide.zh}<span>{readerParts.length} 部主线、多种阅读路径与按问题速查</span>
          </Link>
          <Link href="/zh/timeline/">
            {UI_SURFACES.timeline.zh}<span>1969–2026 关键节点与原始文献脉络</span>
          </Link>
          <Link href="/zh/research/">
            {UI_SURFACES.references.zh}<span>全书引用的原始书目与逐条出处位置</span>
          </Link>
          <Link href="/zh/concepts/">
            {UI_SURFACES.conceptIndex.zh}<span>核心术语定义、英文原词与跨体系辨析</span>
          </Link>
          <Link href="/zh/claims/">
            {UI_SURFACES.chapterNotes.zh}<span>全书章末注释、前提关系与适用条件</span>
          </Link>
          <Link href="/zh/changes/">
            {UI_SURFACES.revisionsErrata.zh}<span>读者可见修订与勘误入口</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
