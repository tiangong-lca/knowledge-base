import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { currentEditionKeys, validateFrameworkCoverage, assertFrameworkAccepted, assertFrameworkHeadingHistory, remapBookCitations, publishedHeadingEntries, frameworkUnitKey, frameworkManuscript, frameworkAppendix, frameworkBookHref, validateRenderedFrameworkCoverage } from './reader-edition.mjs';
import { createChapterReferenceIndex, createChapterNotePlan, createChapterAnnotationPlan, printUnitAnchor, chapterAnchorPrefix } from './reader-book.mjs';
import { createLegacyCitationEntries, createCanonicalCitationEntries } from './reader-citations.mjs';
const json=async name=>JSON.parse(await readFile(new URL(`../config/${name}.json`,import.meta.url),'utf8'));
const [edition,accepted,baseline,placements,history,headings]=await Promise.all(['book-edition','framework-accepted','citation-baseline','citation-placements','citation-history','framework-heading-history'].map(json));
const body=ids=>`<Prose ids="${ids.join(' ')}" />`;
const manuscript=accepted.sections.map(section=>`## ${section.title}\n${body(section.claimIds)}`).join('\n');
const sources=()=>new Map([
  ...accepted.sources.map(source=>[source.route,body(source.claimIds.filter(id=>!accepted.appendix.claimIds.includes(id)))]),
  [frameworkManuscript,manuscript],[frameworkAppendix,body(accepted.appendix.claimIds)],
]);
const available=()=>[...new Set(edition.units.flatMap(unit=>[unit.source,...unit.coverage??[]])),'/docs/appendices'];

test('accepted B04 65-proposition and actual 19-heading inventories are independently immutable',()=>{
  assertFrameworkAccepted(accepted);assertFrameworkHeadingHistory(headings);
  assert.equal(accepted.sources.flatMap(source=>source.claimIds).length,65);
  for(const mutate of [copy=>copy.sources.pop(),copy=>copy.sections[0].claimIds.pop(),copy=>copy.appendix.claimIds[0]='neighbor']) {
    const copy=structuredClone(accepted);mutate(copy);assert.throws(()=>assertFrameworkAccepted(copy),/65-proposition/);
  }
  const copy=structuredClone(headings);copy.canonicalPrintedHeadings.pop();assert.throws(()=>assertFrameworkHeadingHistory(copy),/actual a0fee0a/);
});

test('actual mixed roster conserves sources and rejects co-deleted registrations, foreign manuscripts and kind substitutions',()=>{
  assert.equal(currentEditionKeys(edition,available(),baseline,placements).length,41);
  for(const key of [frameworkUnitKey,frameworkAppendix]) {
    const copy=structuredClone(edition);const removed=copy.units.find(unit=>unit.key===key);copy.units=copy.units.filter(unit=>unit!==removed);
    assert.throws(()=>currentEditionKeys(copy,available().filter(route=>route!==removed.source),baseline,placements),/Missing accepted/);
  }
  assert.throws(()=>currentEditionKeys(edition,[...available(),'/monograph/unregistered'],baseline,placements),/no current book registration/);
  assert.throws(()=>currentEditionKeys(edition,available().filter(route=>route!==frameworkAppendix),baseline,placements),/Missing book source/);
  const kind=structuredClone(edition);kind.units.find(unit=>unit.key==='/docs/history').kind='chapter';
  assert.throws(()=>currentEditionKeys(kind,available(),baseline,placements),/incorrect source or kind|S01 must remain/);
});

test('actual occurrences guard the body independently of deduplicated note plans',()=>{
  assert.deepEqual(validateFrameworkCoverage(edition,sources(),accepted),[]);
  const id=accepted.sections[0].claimIds[0];
  for(const changed of [manuscript.replace(id,''),manuscript.replace(id,`${id} ${id}`),manuscript.replace('## 清单计算','## 错误章节')]) {
    const input=sources();input.set(frameworkManuscript,changed);
    assert(validateFrameworkCoverage(edition,input,accepted).length);
  }
  const omitted=sources();omitted.set(frameworkAppendix,'');assert(validateFrameworkCoverage(edition,omitted,accepted).some(error=>error.includes('cl-cml-relative-response')));
  const duplicate=sources();duplicate.set(accepted.sources[1].route,duplicate.get(accepted.sources[1].route)+body(['cl-cml-range-bins']));
  assert(validateFrameworkCoverage(edition,duplicate,accepted).some(error=>error.includes('duplicated in website')));
});

test('book index takes actual interleaved note numbers and never exposes manuscript URLs',()=>{
  const web=createChapterReferenceIndex([{url:'/docs/a',title:'细页',raw:body(['first','second'])}]);
  const book=createChapterReferenceIndex([{url:frameworkUnitKey,title:'框架职责',raw:body(['second','first']),printOrder:3},{url:frameworkAppendix,title:'指南算例复核',raw:body(['appendix']),printOrder:44}],{print:true});
  assert.equal(web.get('first')[0].number,1);assert.equal(book.get('first')[0].number,2);
  assert.equal(book.get('first')[0].url,'/print');
  assert.equal(book.get('first')[0].anchor,`${printUnitAnchor(frameworkUnitKey)}-claim-first`);
  const notes=createChapterNotePlan(body(['appendix']),printUnitAnchor(frameworkAppendix));
  const annotation=createChapterAnnotationPlan(notes,[{id:'appendix',premiseIds:['first']}],book,{print:true}).get('appendix');
  assert.deepEqual(annotation.premiseReferences.get('first'),{href:`#${printUnitAnchor(frameworkUnitKey)}-claim-first`,label:'《框架职责》注 2'});
  assert(!JSON.stringify([...book]).includes('/monograph/'));
});

test('all 4042 histories plus 19 captured headings retain exact claims and split scope destinations',()=>{
  const historicRoutes=[...baseline.pages.map(page=>page.route),...placements.printAdditions.map(unit=>unit.route)];
  const before=[...createLegacyCitationEntries(baseline,placements,history.pages),...createCanonicalCitationEntries(history,placements,historicRoutes),...publishedHeadingEntries(headings)];
  const after=remapBookCitations(before,edition,accepted,placements);
  assert.equal(after.length,4061);assert.equal(new Set(after.map(entry=>`${entry.path}#${entry.id}`)).size,4061);
  const note=after.find(entry=>entry.path==='/print'&&entry.id==='print-chapter-5-note-13');
  assert.equal(note.targets[0].route,frameworkAppendix);assert.equal(note.targets[0].claimId,'cl-cml-relative-response');
  const split=after.find(entry=>entry.path==='/print'&&entry.id==='print-chapter-5-最大的贡献与最敏感的参数');
  assert.equal(split.mode,'notice');
  assert.deepEqual(split.targets.map(target=>target.id),[`${printUnitAnchor(frameworkUnitKey)}-清单计算`,printUnitAnchor(frameworkAppendix),`${printUnitAnchor(frameworkUnitKey)}-改进与解释`]);
  const unit=after.find(entry=>entry.path==='/print'&&entry.id===printUnitAnchor(accepted.sources[1].route));assert.equal(unit.targets.length,2);
  const web=after.find(entry=>entry.path===accepted.sources[1].route&&entry.id===`${chapterAnchorPrefix(accepted.sources[1].route)}-claim-cl-cml-relative-response`);assert.equal(web.targets[0].path,frameworkAppendix);
  const bad=structuredClone(accepted);bad.sourceHeadings[0].claimIds=['cl-cml-ending'];assert.throws(()=>remapBookCitations(before,edition,bad,placements),/65-proposition/);
});


test('bounded appendix navigation stays native within the actual book and ambiguous source scopes retain their website link',()=>{
  assert.equal(frameworkBookHref(`${frameworkAppendix}/#参数响应`,frameworkUnitKey),`#${printUnitAnchor(frameworkAppendix)}-参数响应`);
  assert.equal(frameworkBookHref('/docs/book/cml-computation-judgment-and-improvement/#从活动平衡到废物贡献',frameworkAppendix),`#${printUnitAnchor(frameworkUnitKey)}-清单计算`);
  assert.equal(frameworkBookHref('/docs/book/cml-computation-judgment-and-improvement/#另一个研究怎样使用这份指南',frameworkAppendix),`#${printUnitAnchor(frameworkUnitKey)}-外部采用`);
  const ambiguous='/docs/book/cml-computation-judgment-and-improvement/#最大的贡献与最敏感的参数';
  assert.equal(frameworkBookHref(ambiguous,frameworkAppendix),ambiguous);
  assert.equal(frameworkBookHref('/print/#actual',frameworkAppendix),'#actual');
});


test('rendered body conservation rejects missing or duplicated propositions even with intact notes and registration',()=>{
  const bodyClaims=new Map([[frameworkUnitKey,accepted.sections.flatMap(section=>section.claimIds)],[frameworkAppendix,[...accepted.appendix.claimIds]]]);
  assert.deepEqual(validateRenderedFrameworkCoverage(bodyClaims,accepted),[]);
  const repeated=new Map([...bodyClaims].map(([key,ids])=>[key,[...ids]]));repeated.get(frameworkUnitKey).push(repeated.get(frameworkUnitKey)[0]);
  assert(validateRenderedFrameworkCoverage(repeated,accepted).some(error=>error.includes('duplicated')));
  bodyClaims.get(frameworkAppendix).pop();assert(validateRenderedFrameworkCoverage(bodyClaims,accepted).some(error=>error.includes('cl-cml-range-bins')));
});
