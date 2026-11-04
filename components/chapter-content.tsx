import Link from 'next/link';
import { createElement, type HTMLAttributes } from 'react';
import catalog from '@/lib/catalog';
import type { ReaderPage } from '@/lib/reader-book';
import { getMDXComponents } from '@/mdx-components';
import { ClaimAnnotation } from '@/components/evidence';
import { chapterAnchorPrefix, createChapterNotePlan } from '@/scripts/reader-book.mjs';

/** One renderer for a chapter page and for the same chapter in continuous print. */
export async function ChapterContent({ page, anchorPrefix, print = false }: { page: ReaderPage; anchorPrefix?: string; print?: boolean }) {
  const plan = createChapterNotePlan(await page.data.getText('raw'), anchorPrefix ?? chapterAnchorPrefix(page.url));
  const claims = new Map(catalog.claims.map(claim => [claim.id, claim]));
  // Check even before rendering: an authored reference must never silently lose
  // its canonical paragraph or note because a record was removed/withdrawn.
  for (const note of plan.notes) if (claims.get(note.id)?.status !== 'reviewed') throw new Error(`Unpublished or unknown chapter claim: ${note.id}`);

  function Paragraph({ id }: { id: string }) {
    const note = plan.byClaimId.get(id), claim = claims.get(id);
    if (!note || !claim || claim.status !== 'reviewed') throw new Error(`Chapter claim is absent from its note map: ${id}`);
    return <p>{claim.text}<sup className="prose-references"><Link href={`#${note.anchor}`} role="doc-noteref" aria-label={`注 ${note.number}`}>[{note.number}]</Link></sup></p>;
  }
  function ChapterProse({ ids }: { ids: string }) {
    return <div className="scholarly-prose">{ids.trim().split(/\s+/).filter(Boolean).map((id, index) => <Paragraph key={`${id}-${index}`} id={id} />)}</div>;
  }
  const MDX = page.data.body;
  const printHeadings = print ? Object.fromEntries([1,2,3,4,5,6].map(level => [`h${level}`, (props: HTMLAttributes<HTMLHeadingElement>) => createElement(`h${Math.min(level+1,6)}`, { ...props, id: props.id ? `${anchorPrefix ?? chapterAnchorPrefix(page.url)}-${props.id}` : undefined })])) : {};
  return <>
    <MDX components={getMDXComponents({ Prose: ChapterProse, Claim: Paragraph, ...printHeadings })} />
    {plan.notes.length > 0 && <section className="chapter-notes not-prose" aria-labelledby={plan.headingId}>
      {print ? <h3 id={plan.headingId}>注释</h3> : <h2 id={plan.headingId}>注释</h2>}
      <ol>{plan.notes.map(note => <li id={note.anchor} key={note.id}><ClaimAnnotation id={note.id} /></li>)}</ol>
    </section>}
  </>;
}
