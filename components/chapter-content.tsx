import { CopyeditHistoricalTitle } from '@/components/copyedit-history';
import { NumberedTitle } from '@/components/numbered-heading';
import { assertNumberingToc, currentPrintReadingHref, printReadingEntryAnchor, getContinuationLink, getHeadingNumbering, getUnitHeadingPlan } from '@/scripts/reader-numbering.mjs';
import { TeachingCase } from '@/components/teaching-case';
import { projectExchangeSemanticsRaw, historyPrintCrossReference, historyPrintDestination } from '@/scripts/reader-exchange-semantics.mjs';
import Link from 'next/link';
import { createElement, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import catalog from '@/lib/catalog';
import { getChapterReferenceIndex, getCitationLabel, getLegacyCitations, type ReaderPage } from '@/lib/reader-book';
import { getMDXComponents } from '@/mdx-components';
import { ClaimAnnotation } from '@/components/evidence';
import { chapterAnchorPrefix, createChapterAnnotationPlan, createChapterNotePlan, printUnitAnchor, splitReferenceTail } from '@/scripts/reader-book.mjs';
import { frameworkBookHref } from '@/scripts/reader-edition.mjs';
import { citationHref, citationSourceHref, type LegacyEntry } from '@/scripts/reader-citations.mjs';

function CitationVersion({ edition }: { edition: LegacyEntry['edition'] }) {
  return <>此链接按 <time dateTime={edition.sourceDate}>{edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href={citationSourceHref(edition.sourceCommit)}>查看这一版本的源文件</a></>;
}

/** Keep the fragment itself in the HTML so the notice works without scripting. */
export function LegacyCitationAliases({ ids, target }: { ids?: LegacyEntry[]; target: string }) {
  return ids?.map(entry => <span key={entry.id} id={entry.id} className="legacy-citation-target" data-legacy-for={target} tabIndex={-1}>
    <span className="legacy-citation-context"><CitationVersion edition={entry.edition} /></span>
  </span>);
}

/** One renderer for a website page and its corresponding continuous print unit. */
export async function ChapterContent({ page, print = false }: { page: ReaderPage; print?: boolean }) {
  const view = print ? 'book' : 'web';
  assertNumberingToc(view, page.url, page.data.toc);
  const prefix = print ? printUnitAnchor(page.url) : chapterAnchorPrefix(page.url);
  const plan = createChapterNotePlan(projectExchangeSemanticsRaw(page.url, await page.data.getText('raw'), print), prefix);
  const legacy = getLegacyCitations(page.url, print);
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  // Check even before rendering: an authored reference must never silently lose
  // its canonical paragraph or note because a record was removed/withdrawn.
  for (const note of plan.notes) if (claims.get(note.id)?.status !== 'reviewed') throw new Error(`Unpublished or unknown chapter claim: ${note.id}`);
  const annotations = createChapterAnnotationPlan(plan, catalog.claims, await getChapterReferenceIndex(print), { print });

  function Paragraph({ id }: { id: string }) {
    const crossReference = historyPrintCrossReference(page.url, id, print);
    if (crossReference) return <p data-reader-partial-claim={id}><a href={`#${historyPrintDestination(crossReference).id}`}>{crossReference.text}</a></p>;
    const note = plan.byClaimId.get(id), claim = claims.get(id);
    if (!note || !claim || claim.status !== 'reviewed') throw new Error(`Chapter claim is absent from its note map: ${id}`);
    const text = splitReferenceTail(claim.text);
    return <p>{text.body}<span className="prose-reference-tail">{text.tail}<sup className="prose-references"><Link href={`#${note.anchor}`} role="doc-noteref" aria-label={`注 ${note.number}`} data-reader-reference={id}>[{note.number}]</Link></sup></span></p>;
  }
  function ChapterProse({ ids }: { ids: string }) {
    return <div className="scholarly-prose">{ids.trim().split(/\s+/).filter(Boolean).map((id, index) => <Paragraph key={`${id}-${index}`} id={id} />)}</div>;
  }
  function ReaderSection({ id: section }: { id: string }) {
    const id = print ? `${prefix}-${section}` : section;
    return <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />
      <span id={id} data-reader-section={id} className="reader-section-target" /><RetainedScope entry={legacy.scopes.get(id)} /></>;
  }
  function ChapterTeachingCase(props: Parameters<typeof TeachingCase>[0]) { return <TeachingCase {...props} print={print} numbering={getUnitHeadingPlan(view, page.url).filter(heading=>heading.type==='case')} />; }
  const MDX = page.data.body;
  function ReaderLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const continuation = typeof props.children==='string' ? getContinuationLink(view, page.url, props.href, props.children) : null;
    return <a {...props} href={continuation?.href ?? (print ? frameworkBookHref(props.href, page.url) : currentPrintReadingHref(props.href))}>{continuation?.label ?? props.children}</a>;
  }
  const defaults = getMDXComponents();
  const headings = Object.fromEntries(([1, 2, 3, 4, 5, 6] as const).map(level => {
    const name = `h${level}` as const;
    return [name, (props: HTMLAttributes<HTMLHeadingElement>) => {
      const id = print && props.id ? `${prefix}-${props.id}` : props.id;
      const numbered = props.id ? getHeadingNumbering(view, page.url, props.id) : null;
      if (!numbered) throw new Error(`Actual content heading has no numbering slot: ${page.url} ${props.id}`);
      const headingProps: HTMLAttributes<HTMLHeadingElement> & {'data-reader-heading-key': string} = { ...props, id, 'data-reader-heading-key': numbered.key };
      if (print && level+2>6) throw new Error(`Book heading exceeds the available HTML hierarchy: ${page.url} ${props.id}`);
      const heading = createElement(print ? `h${level + 2}` : defaults[name] ?? name, headingProps, <NumberedTitle number={numbered.number}>{props.children}</NumberedTitle>);
      return id ? <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />{heading}<RetainedScope entry={legacy.scopes.get(id)} /><CopyeditHistoricalTitle path={print ? '/print' : page.url} id={id} /></> : heading;
    }];
  }));
  async function RetainedScope({ entry, readingTitle }: { entry?: LegacyEntry; readingTitle?: string }) {
    const history = readingTitle ? <CopyeditHistoricalTitle path="/print" id={readingTitle} /> : null;
    if (!entry?.scope) return history;
    const links = await Promise.all(entry.scope.targets.map(async target => ({ href: citationHref(target, entry.path), label: await getCitationLabel(target) })));
    return <><div data-legacy-scope={entry.id} className="legacy-citation-context">
      <p><CitationVersion edition={entry.edition} /></p><p>{entry.scope.text}</p>
      <ul>{links.map(link => <li key={link.href}><a href={link.href} data-legacy-scope-destination="">{link.label}</a></li>)}</ul>
    </div>{history}</>;
  }
  const notices = await Promise.all(legacy.notices.map(async notice => ({
    ...notice,
    links: await Promise.all(notice.targets.map(async target => ({
      href: citationHref(target, notice.path),
      label: await getCitationLabel(target),
    }))),
  })));

  return <>
    <RetainedScope entry={legacy.scopes.get(prefix)} readingTitle={print ? printReadingEntryAnchor(page.url) : undefined} />
    <MDX components={getMDXComponents({ Prose: ChapterProse, Claim: Paragraph, ReaderSection, TeachingCase: ChapterTeachingCase, a: ReaderLink, ...headings })} />
    {plan.notes.length > 0 && <section className="chapter-notes not-prose" aria-labelledby={plan.headingId}>
      <LegacyCitationAliases ids={legacy.aliases.get(plan.headingId)} target={plan.headingId} />
      {print ? <h4 id={plan.headingId}>注释</h4> : <h2 id={plan.headingId}>注释</h2>}
      <RetainedScope entry={legacy.scopes.get(plan.headingId)} />
      <ol>{plan.notes.map(note => <li id={note.anchor} data-reader-claim={note.id} key={note.id}>
        <LegacyCitationAliases ids={legacy.aliases.get(note.anchor)} target={note.anchor} />
        <ClaimAnnotation id={note.id} {...annotations.get(note.id)} />
      </li>)}</ol>
    </section>}
    {notices.map(notice => <div key={notice.id} id={notice.id} className="legacy-citation-target not-prose" data-legacy-notice="" tabIndex={-1}>
      <div className="legacy-citation-context">
        <p><CitationVersion edition={notice.edition} /></p>
        <p>{notice.scope?.text ?? '可从下列链接查阅这一留存版本对应的内容。'}</p>
        <ul>{notice.links.map(link => <li key={link.href}><a href={link.href} data-legacy-destination="">{link.label}</a></li>)}</ul>
      </div>
    </div>)}
  </>;
}
