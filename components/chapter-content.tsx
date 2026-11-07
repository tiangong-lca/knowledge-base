import Link from 'next/link';
import { createElement, type HTMLAttributes } from 'react';
import catalog from '@/lib/catalog';
import { getChapterReferenceIndex, getCitationLabel, getLegacyCitations, type ReaderPage } from '@/lib/reader-book';
import { getMDXComponents } from '@/mdx-components';
import { ClaimAnnotation } from '@/components/evidence';
import { chapterAnchorPrefix, createChapterAnnotationPlan, createChapterNotePlan, printUnitAnchor } from '@/scripts/reader-book.mjs';
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
  const prefix = print ? printUnitAnchor(page.url) : chapterAnchorPrefix(page.url);
  const plan = createChapterNotePlan(await page.data.getText('raw'), prefix);
  const legacy = getLegacyCitations(page.url, print);
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  // Check even before rendering: an authored reference must never silently lose
  // its canonical paragraph or note because a record was removed/withdrawn.
  for (const note of plan.notes) if (claims.get(note.id)?.status !== 'reviewed') throw new Error(`Unpublished or unknown chapter claim: ${note.id}`);
  const annotations = createChapterAnnotationPlan(plan, catalog.claims, await getChapterReferenceIndex(), { print });

  function Paragraph({ id }: { id: string }) {
    const note = plan.byClaimId.get(id), claim = claims.get(id);
    if (!note || !claim || claim.status !== 'reviewed') throw new Error(`Chapter claim is absent from its note map: ${id}`);
    return <p>{claim.text}<sup className="prose-references"><Link href={`#${note.anchor}`} role="doc-noteref" aria-label={`注 ${note.number}`} data-reader-reference={id}>[{note.number}]</Link></sup></p>;
  }
  function ChapterProse({ ids }: { ids: string }) {
    return <div className="scholarly-prose">{ids.trim().split(/\s+/).filter(Boolean).map((id, index) => <Paragraph key={`${id}-${index}`} id={id} />)}</div>;
  }
  function ReaderSection({ id: section }: { id: string }) {
    const id = print ? `${prefix}-${section}` : section;
    return <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />
      <span id={id} data-reader-section={id} className="reader-section-target" /></>;
  }
  const MDX = page.data.body;
  const defaults = getMDXComponents();
  const headings = Object.fromEntries(([1, 2, 3, 4, 5, 6] as const).map(level => {
    const name = `h${level}` as const;
    return [name, (props: HTMLAttributes<HTMLHeadingElement>) => {
      const id = print && props.id ? `${prefix}-${props.id}` : props.id;
      const heading = createElement(print ? `h${Math.min(level + 1, 6)}` : defaults[name] ?? name, { ...props, id });
      return id ? <><LegacyCitationAliases ids={legacy.aliases.get(id)} target={id} />{heading}</> : heading;
    }];
  }));
  const notices = await Promise.all(legacy.notices.map(async notice => ({
    ...notice,
    links: await Promise.all(notice.targets.map(async target => ({
      href: citationHref(target, notice.path),
      label: await getCitationLabel(target),
    }))),
  })));

  return <>
    <MDX components={getMDXComponents({ Prose: ChapterProse, Claim: Paragraph, ReaderSection, ...headings })} />
    {plan.notes.length > 0 && <section className="chapter-notes not-prose" aria-labelledby={plan.headingId}>
      <LegacyCitationAliases ids={legacy.aliases.get(plan.headingId)} target={plan.headingId} />
      {print ? <h3 id={plan.headingId}>注释</h3> : <h2 id={plan.headingId}>注释</h2>}
      <ol>{plan.notes.map(note => <li id={note.anchor} data-reader-claim={note.id} key={note.id}>
        <LegacyCitationAliases ids={legacy.aliases.get(note.anchor)} target={note.anchor} />
        <ClaimAnnotation id={note.id} {...annotations.get(note.id)} />
      </li>)}</ol>
    </section>}
    {notices.map(notice => <div key={notice.id} id={notice.id} className="legacy-citation-target not-prose" data-legacy-notice="" tabIndex={-1}>
      <div className="legacy-citation-context">
        <p><CitationVersion edition={notice.edition} /></p>
        <p>可从下列链接查阅这一留存版本对应的内容。</p>
        <ul>{notice.links.map(link => <li key={link.href}><a href={link.href} data-legacy-destination="">{link.label}</a></li>)}</ul>
      </div>
    </div>)}
  </>;
}
