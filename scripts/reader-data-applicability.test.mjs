import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import htmlParser from "next/dist/compiled/node-html-parser/index.js";
import { publicCatalog, getClaimEvidence } from "./knowledge.mjs";
import { publicResearch } from "./research.mjs";
import { citationHref, citationSourceHref } from "./reader-citations.mjs";
import { createChapterNotePlan, createChapterAnnotationPlan, createChapterReferenceIndex, printUnitAnchor, splitReferenceTail } from "./reader-book.mjs";
import { assertDataApplicabilityOriginal, assertDataApplicabilityHeadingOriginal, assertDataApplicabilityRegistration, assertDataApplicabilityAccepted, inspectDataApplicabilitySource, validateDataApplicabilityCoverage, dataApplicabilityKey as key, dataApplicabilityManuscript as manuscript, dataApplicabilityRoutes as routes, dataApplicabilityTitles as titles, dataApplicabilityDigest as digest, dataApplicabilityOriginalEntries, dataApplicabilityHeadingEntries, remapDataApplicabilityCitations, validateRenderedDataApplicability, dataApplicabilityBookHref } from "./reader-data-applicability.mjs";
import { toxicityPathwaysDigest, toxicityPathwaysHeadingEntries } from './reader-toxicity-pathways.mjs';
import { assertClosingSynthesisCurrentAccepted, closingSynthesisDigest, validateClosingSynthesisCoverage, closingSynthesisManuscript, closingSynthesisRoutes, closingSynthesisSections } from "./reader-closing-synthesis.mjs";
const json = async (path) => JSON.parse(await readFile(new URL(`../${path}.json`, import.meta.url), "utf8"));
const [original,captured,edition,catalog,literature,readings,pending] = await Promise.all(["config/data-applicability-original","config/data-applicability-heading-original","config/book-edition","knowledge/catalog","knowledge/research/literature-map","knowledge/research/readings","config/data-applicability-accepted"].map(json));
// Explicit test admission never changes production status or the independent production pin.
const accepted=structuredClone(pending);accepted.status="reviewed";accepted.reviewEvidence=[{kind:"Explicit engineering fixture; no scientific/reader approval",reportSha256:"a".repeat(64),receiptSha256:"b".repeat(64)}];
const pin=digest(accepted),sources=new Map(await Promise.all(accepted.sources.map(async row=>[row.route,await readFile(new URL(`../content${row.route}.mdx`,import.meta.url),"utf8")])));
const frozen=dataApplicabilityOriginalEntries(),entries=remapDataApplicabilityCitations(frozen,accepted,pin),allIds=accepted.claims.map(row=>row.id),esc=text=>String(text).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
test("independent immutable originals and explicit pending gate cannot be refreshed by current records",()=>{
 assertDataApplicabilityOriginal(original);assertDataApplicabilityHeadingOriginal(captured);assert.equal(frozen.length,78);
 const a=structuredClone(original);a.claims[0].text+="changed";assert.throws(()=>assertDataApplicabilityOriginal(a),/immutable original/);
 const h=structuredClone(captured);h.newNativePrintHeadings.pop();assert.throws(()=>assertDataApplicabilityHeadingOriginal(h),/immutable heading/);
 assert.throws(()=>assertDataApplicabilityAccepted({...accepted,status:"pending"},pin),/acceptance is incomplete/);
 assert.throws(()=>assertDataApplicabilityAccepted(accepted),/acceptance is incomplete/);
 assertDataApplicabilityAccepted(accepted,pin);
});
test("B25 consumes exact pair once and retains14 canonical records with7/7 fine-page membership",()=>{
 assertDataApplicabilityRegistration(edition);assert.deepEqual(accepted.sections.map(s=>s.claimIds.length),[3,4,5,2]);
 for(const alter of [x=>x.units.find(r=>r.key===key).coverage.reverse(),x=>x.units.push({key:routes[0],source:routes[0],kind:"chapter"}),x=>x.units.find(r=>r.key===key).sections.pop()]){const x=structuredClone(edition);alter(x);assert.throws(()=>assertDataApplicabilityRegistration(x),/assembly/);}
 for(const alter of [x=>x.sections[0].claimIds.pop(),x=>x.website[0].claimIds.pop(),x=>x.claims.pop()]){const x=structuredClone(accepted);alter(x);assert.throws(()=>assertDataApplicabilityAccepted(x,digest(x)),/conservation|membership|receipt/);}
 assert.deepEqual(validateDataApplicabilityCoverage(edition,sources,catalog,accepted,pin),[]);
 assert.deepEqual(validateDataApplicabilityCoverage(edition,sources,publicCatalog(catalog),accepted,pin,"public"),[]);
 for(const alter of [raw=>raw.replace("cl-db2011-scope-examples","cl-db2011-scope-examples cl-db2011-scope-examples"),raw=>raw.replace("不确定性]","错误出口]"),raw=>raw+"\n<p hidden>未经审阅的内容</p>",raw=>raw.replace("## 质量信息","## 未审标题")]){const x=new Map(sources);x.set(manuscript,alter(x.get(manuscript)));assert(validateDataApplicabilityCoverage(edition,x,catalog,accepted,pin).length);}
 const bad=structuredClone(catalog);bad.evidence.find(r=>r.id===original.scientificClosure.evidence[0].id).locator="unreviewed";assert(validateDataApplicabilityCoverage(edition,sources,bad,accepted,pin).length);
});
test("old72 scopes plus6 actual captured headings preserve original subsets and source generations",()=>{
 assert.equal(new Set(entries.map(r=>r.path+"#"+r.id)).size,78);
 const oldIds=new Set(original.orderedClaimIds);
 for(const entry of entries){if(entry.scope){assert(entry.scope.targets.filter(r=>r.kind==="note").every(r=>oldIds.has(r.claimId)));assert(!entry.scope.targets.some(r=>r.claimId==="cl-db2011-scope-examples"||r.claimId==="cl-db2011-conditional-use"));}}
 const groups=entries.filter(e=>e.targets[0].kind==="note-group"||frozen.find(r=>r.path===e.path&&r.id===e.id)?.targets[0].kind==="note-group");
 for(const entry of groups)assert.equal(entry.scope.targets.length,6);
 for(const bad of [frozen.slice(1),[...frozen,frozen[0]],frozen.map((x,i)=>i?x:{...x,edition:{...x.edition,sourceCommit:"a".repeat(40)}})])assert.throws(()=>remapDataApplicabilityCitations(bad,accepted,pin),/missing, repeated or changed/);
 assert.equal(dataApplicabilityBookHref("/docs/book/uncertainty-and-variability",key),`#${printUnitAnchor("/docs/book/uncertainty-and-variability")}`);
});
const published = publicCatalog(catalog), byId = new Map(published.claims.map((row) => [row.id, row])), require2 = createRequire(import.meta.url), mdxRequire = createRequire(require2.resolve("fumadocs-mdx")), component = { exports: {} };
const compiled = mdxRequire("esbuild").transformSync(await readFile(new URL("../components/evidence.tsx", import.meta.url), "utf8"), { loader: "tsx", jsx: "automatic", format: "cjs" });
new Function("require", "module", "exports", compiled.code)((name) => name === "@/lib/catalog" ? { __esModule: true, default: published, getClaimEvidence, isKnownClaim: (id) => byId.has(id) } : name === "@/knowledge/research/literature-map.json" ? literature : name === "@/knowledge/research/readings.json" ? readings : name === "@/scripts/research.mjs" ? { publicResearch } : require2(name), component, component.exports);
const { ClaimAnnotation } = component.exports;
process.env.__NEXT_TRAILING_SLASH = "true";
const externalIds = [...new Set(accepted.claims.flatMap((row) => row.premiseIds ?? []).filter((id) => !allIds.includes(id)))], externalRoute = "/docs/book/fixture-data-premises", referencePages = [{ url: key, title: accepted.title, raw: sources.get(manuscript) }, { url: externalRoute, title: "外部前提", raw: `<Prose ids="${externalIds.join(" ")}" />` }];
function label(target) {
  const ids = target.route === key ? accepted.sections.flatMap((row) => row.claimIds) : accepted.website.find((row) => row.route === target.route).claimIds, title = accepted.sources.find((row) => row.route === (target.route === key ? manuscript : target.route)).title;
  return `《${title}》${target.kind === "note" ? `注 ${ids.indexOf(target.claimId) + 1}` : target.kind === "heading" ? `·${target.path === "/print" ? target.id.slice(printUnitAnchor(target.route).length + 1) : target.id}` : target.kind === "note-group" ? "注释" : ""}`;
}
function context(entry) {
  const retained = entry.mode === "retained", targets = retained ? entry.scope.targets : entry.targets;
  return `<div ${retained ? `data-legacy-scope="${entry.id}"` : `id="${entry.id}" data-legacy-notice=""`}><div class="legacy-citation-context"><p>此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></p><p>${entry.scope?.text ?? "可从下列链接查阅这一留存版本对应的内容。"}</p><ul>${targets.map((target) => `<li><a ${retained ? "data-legacy-scope-destination" : "data-legacy-destination"} href="${citationHref(target, entry.path)}">${label(target)}</a></li>`).join("")}</ul></div></div>`;
}
function aliases(route, id) {
  return entries.filter((entry) => entry.path === "/print" && entry.route === route && entry.mode === "alias" && entry.targets[0].id === id).map((entry) => `<span id="${entry.id}" data-legacy-for="${id}"><span class="legacy-citation-context">此链接按 <time datetime="${entry.edition.sourceDate}">${entry.edition.sourceDate}</time> 留存文本定位。其他历史版本的引用需核对各自源文件。<a href="${citationSourceHref(entry.edition.sourceCommit)}">查看这一版本的源文件</a></span></span>`).join("");
}
function figureMarkup(source) {
  return source.figure ? `<figure><img src="${source.figure.src}" alt="${source.figure.alt}" width="${source.figure.width}" height="${source.figure.height}"><figcaption>${source.figure.caption}</figcaption></figure>` : "";
}
function rendered() {
  const index = createChapterReferenceIndex(referencePages.filter(row=>!row.url.includes("fixture-data-premises")||externalIds.length), { print: true });
  return [key].map((route) => {
    const source = accepted.sources.find((row) => row.route === (route === key ? manuscript : route)), sections = accepted.sections, prefix = printUnitAnchor(route), plan = createChapterNotePlan(sources.get(route === key ? manuscript : route), prefix), options = createChapterAnnotationPlan(plan, published.claims, index, { print: true });
    const ordinary = (section) => source.ordinary.filter((row) => row.section === section).map((row) => `<p>${esc(row.text).replace(esc(row.links[0]?.text ?? "__absent__"), `<a href="${row.links[0] ? dataApplicabilityBookHref(row.links[0].href, route) : ""}">${esc(row.links[0]?.text ?? "")}</a>`)}</p>`).join("");
    const body = sections.map((section) => `<h3 id="${prefix}-${section.id}">${section.title}</h3>${section.claimIds.map((id) => {
      const split = splitReferenceTail(byId.get(id).text), note = plan.byClaimId.get(id);
      return `<p>${esc(split.body)}<span>${esc(split.tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${note.anchor}" aria-label="注 ${note.number}">[${note.number}]</a></sup></span></p>`;
    }).join("")}${ordinary(section.id)}`).join("");
    return `<article id="${prefix}" data-reader-route="${route}" data-reader-title="${source.title}"><h2>${source.title}</h2><p>${source.description}</p>${body}<section class="chapter-notes"><h3 id="${prefix}-annotations">注释</h3><ol>${plan.notes.map((note) => `<li id="${note.anchor}" data-reader-claim="${note.id}">${aliases(route, note.anchor)}${renderToStaticMarkup(createElement(ClaimAnnotation, { id: note.id, ...options.get(note.id) }))}</li>`).join("")}</ol></section>${entries.filter((entry) => entry.path === "/print" && entry.route === route && entry.mode === "notice").map(context).join("")}</article>`;
  }).join("") + `<article data-reader-route="${externalRoute}" data-reader-title="外部前提">${externalIds.map((id) => `<li id="${printUnitAnchor(externalRoute)}-claim-${id}" data-reader-claim="${id}">外部前提</li>`).join("")}</article>`;
}
test("actual full canonical body, continuous14 notes, source/caveat/premise annotations and continuation are checked",()=>{
 const html=rendered(),check=value=>validateRenderedDataApplicability(htmlParser.parse(value),"/print",published,accepted,pin);assert.deepEqual(check(html),[]);
 const doc=htmlParser.parse(html),paragraph=doc.querySelector('[role="doc-noteref"]').closest("p"),annotation=doc.querySelector(".claim-annotation"),limits=doc.querySelector(".annotation-limits"),notice=doc.querySelector("[data-legacy-notice]"),navigation=doc.querySelectorAll("p").find(node=>node.text==="继续阅读：不确定性。");assert(navigation);
 for(const changed of [html.replace(paragraph.outerHTML,paragraph.outerHTML.replace("[1]","[99]")),html.replace(paragraph.outerHTML,""),html.replace(paragraph.outerHTML,paragraph.outerHTML+paragraph.outerHTML),html.replace(paragraph.outerHTML,paragraph.outerHTML.replace("<p>","<p hidden>")),html.replace(annotation.outerHTML,""),html.replace(limits.outerHTML,""),html.replace(notice.outerHTML,""),html.replace(navigation.outerHTML,navigation.outerHTML.replace("不确定性","错误入口")),html.replace(navigation.outerHTML,navigation.outerHTML.replace(printUnitAnchor("/docs/book/uncertainty-and-variability"),"wrong")),html.replace(navigation.outerHTML,"").replace(doc.querySelectorAll('[role="doc-noteref"]').at(-1).closest("p").outerHTML,navigation.outerHTML+doc.querySelectorAll('[role="doc-noteref"]').at(-1).closest("p").outerHTML),html.replace("</article>","<p>未经审阅的额外正文</p></article>")])assert(check(changed).length);
 for(const visual of ['<img src="unreviewed.svg">','<svg role="img"><path d="M0 0H700V800H0Z"></path></svg>','<canvas width="700" height="800"></canvas>','<video src="unreviewed.webm"></video>','<iframe src="/unreviewed/"></iframe>','<object data="unreviewed.svg"></object>','<embed src="unreviewed.svg">'])assert(check(html.replace("</article>",visual+"</article>")).length);
 for(const style of ['opacity:0.0','visibility:collapse','content-visibility:hidden','clip-path:inset(100%)'])assert(check(html.replace(paragraph.outerHTML,paragraph.outerHTML.replace("<p>",`<p style="${style}">`))).length);
});

test("complete production history composition preserves all4140 earlier addresses and adds only6 actual46b headings", async () => {
  const cfg = async (name) => json("config/" + name), { createLegacyCitationEntries, createCanonicalCitationEntries } = await import("./reader-citations.mjs"), { publishedHeadingEntries, remapBookCitations } = await import("./reader-edition.mjs"), baseline = await cfg("citation-baseline"), placements = await cfg("citation-placements"), history = await cfg("citation-history");
  const names = ["cleaner-production", "functional-reference", "process-network", "exchange-semantics", "hybrid-inventory", "joint-production", "wall-selection", "closing-synthesis"], modules = /* @__PURE__ */ new Map(), configs = /* @__PURE__ */ new Map();
  for (const name of names) {
    modules.set(name, await import(`./reader-${name}.mjs`));
    for (const suffix of ["original", "accepted", "heading-history", "prose-accepted", "partial-history", "citation-sources"]) try {
      configs.set(`${name}-${suffix}`, await cfg(`${name}-${suffix}`));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const m = (name) => modules.get(name), c = (name) => configs.get(name);
  let all = [...createLegacyCitationEntries(baseline, placements, history.pages), ...createCanonicalCitationEntries(history, placements, [...baseline.pages.map((row) => row.route), ...placements.printAdditions.map((row) => row.route)]), ...publishedHeadingEntries(await cfg("framework-heading-history"))];
  for (const name of names) {
    const fn = name.replace(/-([a-z])/g, (_, v) => v.toUpperCase()) + "HeadingEntries";
    all.push(...m(name)[fn](c(`${name}-heading-history`)));
  }
  all = remapBookCitations(all, edition, await cfg("framework-accepted"), placements);
  all = m("cleaner-production").remapCleanerProductionCitations(all, c("cleaner-production-accepted"), c("cleaner-production-heading-history"));
  all = m("functional-reference").remapFunctionalReferenceCitations(all, c("functional-reference-accepted"), c("functional-reference-heading-history"));
  all = m("process-network").remapProcessNetworkCitations(all, c("process-network-accepted"), c("process-network-heading-history"));
  all = m("exchange-semantics").remapExchangeSemanticsCitations(all, c("exchange-semantics-original"), c("exchange-semantics-heading-history"), c("exchange-semantics-partial-history"), c("exchange-semantics-citation-sources"));
  all = m("hybrid-inventory").remapHybridInventoryCitations(all, c("hybrid-inventory-accepted"), c("hybrid-inventory-heading-history"));
  all = m("joint-production").remapJointProductionCitations(all, c("joint-production-original"), c("joint-production-heading-history"), c("joint-production-prose-accepted"));
  all = m("wall-selection").remapWallSelectionCitations(all, c("wall-selection-original"), c("wall-selection-heading-history"), c("wall-selection-accepted"));
  all = m("closing-synthesis").remapClosingSynthesisCitations(all, c("closing-synthesis-heading-history"), c("closing-synthesis-prose-accepted"));
  assert.equal(all.length, 4129);
  const before = new Map(all.map((row) => [row.path + "#" + row.id, row]));
  const climate = await import("./reader-climate-assembly.mjs");
  all = climate.remapClimateAssemblyCitations([...all,...climate.climateAssemblyHeadingEntries()], await cfg("climate-assembly-accepted"));
  assert.equal(all.length,4140);
  const beforeClimate = new Map(all.map(row=>[row.path+"#"+row.id,row]));
  const current2 = remapDataApplicabilityCitations([...all,...dataApplicabilityHeadingEntries()], accepted, pin);
  assert.equal(current2.length, 4146);
  assert.equal(new Set(current2.map((row) => row.path + "#" + row.id)).size, 4146);
  const affected = new Set(frozen.map((row) => row.path + "#" + row.id));
  for (const entry of current2) {
    const address = entry.path + "#" + entry.id;
    if (!affected.has(address)) assert.deepEqual(entry, beforeClimate.get(address));
  }
  assert.equal(current2.filter((row) => !beforeClimate.has(row.path + "#" + row.id)).length, 6);
  const toxicityOriginal = await cfg("toxicity-pathways-original");
  assert.equal(toxicityPathwaysDigest(current2), toxicityOriginal.publication.history.existingGlobalEntriesDigest);
  const withToxicityHeadings = [...current2, ...toxicityPathwaysHeadingEntries()];
  assert.equal(new Set(withToxicityHeadings.map(row => row.path + "#" + row.id)).size, 4149);
});

test("all18 public teaching inputs and immutable case bindings retain their original byte identity",async()=>{
 const frozen=Object.entries(original.frozenFileHashes).filter(([path])=>path.startsWith("knowledge/cases/"));assert.equal(frozen.filter(([path])=>!path.endsWith(".publication.json")).length,18);assert.equal(frozen.length,36);
 for(const [path,hash] of frozen)assert.equal(createHash("sha256").update(await readFile(new URL(`../${path}`,import.meta.url))).digest("hex"),hash,path);
});

test("new evidence cannot drift coherently in catalog and rendered notes outside the accepted closure",()=>{
 for(const id of ["ev-db2011-use-examples","ev-db2011-conditional-consistency"]){
  for(const field of ["summary","locator","passageId"]){
   const changed=structuredClone(catalog),record=changed.evidence.find(row=>row.id===id),oldValue=record[field];record[field]=field==="passageId"?original.scientificClosure.evidence[0].passageId:oldValue+" changed";assert.notEqual(record[field],oldValue);
   assert(validateDataApplicabilityCoverage(edition,sources,changed,accepted,pin).some(error=>error.includes(id)));
   // Summary/passage identity is not visible prose; both actual passages use the same PDF carrier.
   // A changed locator is also coherently substituted in every rendered annotation occurrence.
   const initial=rendered(),coherent=field==="locator"?initial.replaceAll(oldValue,record[field]):initial;
   if(field==="locator")assert.notEqual(coherent,initial);
   assert(validateRenderedDataApplicability(htmlParser.parse(coherent),"/print",publicCatalog(changed),accepted,pin).some(error=>error.includes(id)));
  }
 }
 const changed=structuredClone(accepted);changed.scientificClosure.evidence.find(row=>row.id===original.scientificClosure.evidence[0].id).locator+="changed";assert.throws(()=>assertDataApplicabilityAccepted(changed,digest(changed)),/unchanged originals/);
});

test("unrelated original/acceptance registries and the climate figure retain frozen bytes",async()=>{
 const mutable=new Set(["config/book-edition.json","config/reader-numbering.json","config/closing-synthesis-current-accepted.json"]),frozen=Object.entries(original.frozenFileHashes).filter(([path])=>(path.startsWith("config/")&&!mutable.has(path))||path==="public/book-figures/climate-response-and-integral.svg");
 for(const [path,hash] of frozen)assert.equal(createHash("sha256").update(await readFile(new URL(`../${path}`,import.meta.url))).digest("hex"),hash,path);
});

test("B25 retains its exact c919 source, selected reading and work records when the research register grows",()=>{
 const [source]=original.scientificClosure.sources;
 const actualSources=catalog.sources.filter(row=>row.id===source.id);
 assert.deepEqual(actualSources,[source]);
 const matches=readings.readings.filter(row=>row.id===source.reading.readingId);
 assert.equal(matches.length,1);
 const [reading]=matches, works=literature.records.filter(row=>row.id===reading.workId||row.workId===reading.workId);
 assert.equal(works.length,1);
 assert.deepEqual(works[0].catalogSourceIds,[source.id]);
 const digest=row=>createHash("sha256").update(JSON.stringify(row)).digest("hex");
 // Independent record digests taken from the immutable c919 research registers.
 assert.equal(digest(reading),"d41d418efe6972185cf74c7e9a8cac006e77e64daee6f6d93144a7fec0640063");
 assert.equal(digest(works[0]),"382669cc14440bd2b96295ffff21b0cf94a89656cd3e0b77df1ceee539fa0056");
});

// Reuse the repository's actual nested ChapterProse component; Paragraph retains
// the fixture's already checked canonical text and local note markup.
const chapterSource = await readFile(new URL("../components/chapter-content.tsx", import.meta.url), "utf8");
const actualChapterProseSource = chapterSource.slice(chapterSource.indexOf("  function ChapterProse("), chapterSource.indexOf("  function ReaderSection("));
assert(actualChapterProseSource.startsWith("  function ChapterProse("));
const compiledChapterProse = mdxRequire("esbuild").transformSync(actualChapterProseSource + "\nexports.ChapterProse = ChapterProse;", { loader:"tsx", jsx:"automatic", format:"cjs" });
function wrappedRendered() {
 const document = htmlParser.parse(rendered()), unit = document.querySelector(`article[data-reader-route="${key}"]`);
 for (const section of accepted.sections) {
  const paragraphs = section.claimIds.map(id => unit.querySelector(`[data-reader-reference="${id}"]`).closest("p"));
  const byId = new Map(section.claimIds.map((id,index) => [id,paragraphs[index]])), wrapperModule = {exports:{}};
  new Function("require","exports","Paragraph",compiledChapterProse.code)(require2,wrapperModule.exports,({id})=>createElement("p",{dangerouslySetInnerHTML:{__html:byId.get(id).innerHTML}}));
  const markup = renderToStaticMarkup(createElement(wrapperModule.exports.ChapterProse,{ids:section.claimIds.join(" ")}));
  paragraphs[0].replaceWith(markup);for(const paragraph of paragraphs.slice(1))paragraph.remove();
 }
 return document.toString();
}
test("actual ChapterProse wrapper permits only its last direct paragraph then immediate owner-level continuation",()=>{
 const html=wrappedRendered(),check=value=>validateRenderedDataApplicability(htmlParser.parse(value),"/print",published,accepted,pin);assert.deepEqual(check(html),[]);
 const doc=htmlParser.parse(html),last=doc.querySelector('[data-reader-reference="cl-db2011-conditional-use"]').closest("p"),wrapper=last.parentNode,continuation=wrapper.nextElementSibling;
 assert.equal(wrapper.getAttribute("class"),"scholarly-prose");assert.equal(wrapper.parentNode.tagName,"ARTICLE");
 const faults=[
  html.replace(wrapper.outerHTML,`<div>${wrapper.outerHTML}</div>`),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace('class="scholarly-prose"','class="scholarly-prose" id="unqualified-wrapper"')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace('class="scholarly-prose"','class="scholarly-prose extra"')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace('class="scholarly-prose"','class="scholarly-prose" hidden')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace('</div>','<span></span></div>')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace('</div>','unexpected trailing text</div>')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML.replace(last.outerHTML,`<div>${last.outerHTML}</div>`)),
  html.replace(continuation.outerHTML,"").replace(wrapper.outerHTML,wrapper.outerHTML.replace(last.outerHTML,continuation.outerHTML+last.outerHTML)),
  html.replace(continuation.outerHTML,"").replace(wrapper.outerHTML,wrapper.outerHTML.replace('</div>',continuation.outerHTML+'</div>')),
  html.replace(wrapper.outerHTML,wrapper.outerHTML+'<span></span>'),
 ];
 for(const changed of faults)assert(check(changed).some(error=>error.includes("final-proposition placement")));
});
