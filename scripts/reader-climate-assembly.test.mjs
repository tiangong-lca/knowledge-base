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
import { assertClimateAssemblyOriginal, assertClimateAssemblyHeadingOriginal, assertClimateAssemblyRegistration, assertClimateAssemblyAccepted, inspectClimateAssemblySource, validateClimateAssemblyCoverage, validateClimateAssemblyArtifactBytes, climateAssemblyKey as key, climateAssemblyManuscript as manuscript, climateAssemblyRoutes as routes, climateAssemblyAppendix as appendix, climateAssemblyMovedIds as moved, climateAssemblyTitles as titles, climateAssemblyAppendixTitles as appendixTitles, climateAssemblyDigest as digest, climateAssemblyOriginalEntries, remapClimateAssemblyCitations, validateRenderedClimateAssembly, climateAssemblyBookHref } from "./reader-climate-assembly.mjs";
import { assertClosingSynthesisCurrentAccepted, closingSynthesisDigest, validateClosingSynthesisCoverage, closingSynthesisManuscript, closingSynthesisRoutes, closingSynthesisSections } from "./reader-closing-synthesis.mjs";
const json = async (path) => JSON.parse(await readFile(new URL(`../${path}.json`, import.meta.url), "utf8"));
const [original, captured, edition, rawCatalog, literature, readings, b32, b32Prose] = await Promise.all(["config/climate-assembly-original", "config/climate-assembly-heading-original", "config/book-edition", "knowledge/catalog", "knowledge/research/literature-map", "knowledge/research/readings", "config/closing-synthesis-original", "config/closing-synthesis-prose-accepted"].map(json));
const sources = /* @__PURE__ */ new Map(), accepted = { schemaVersion: 1, status: "reviewed", bookKey: key, manuscript, title: "气候当量", sections: [], appendix: { route: appendix, title: "气候数值的重建", sections: [] }, website: [], sources: [], claims: [], reviewEvidence: [{ kind: "explicit test fixture only; no production approval", reportSha256: "a".repeat(64), receiptSha256: "b".repeat(64) }] };
for (const route of [...routes, manuscript, appendix]) {
  const raw = await readFile(new URL(`../content${route}.mdx`, import.meta.url), "utf8"), found = inspectClimateAssemblySource(raw);
  sources.set(route, raw);
  accepted.sources.push({ route, title: found.title, description: found.description, mdxSha256: createHash("sha256").update(raw).digest("hex"), headings: found.headings, ordinary: found.ordinary, figure: found.figure });
  if (routes.includes(route)) accepted.website.push({ route, claimIds: found.occurrences.map((row) => row.id), occurrences: found.occurrences });
  else {
    const sections = found.headings.map((heading) => ({ ...heading, claimIds: found.occurrences.filter((row) => row.section === heading.id).map((row) => row.id) }));
    if (route === manuscript) accepted.sections = sections;
    else accepted.appendix.sections = sections;
  }
}
const originalRecords = new Map([...original.claims, ...original.scientificClosure.claims].map((row) => [row.id, row]));
originalRecords.set("cl-climate-reference-illustration", { ...structuredClone(original.claims[0]), id: "cl-climate-reference-illustration", text: "Explicit bounded fixture illustration, not candidate semantic approval.", evidenceIds: [], evidenceLinks: [], premiseIds: ["cl-climate-fit", "cl-climate-integral"] });
accepted.claims = [...accepted.sections, ...accepted.appendix.sections].flatMap((section) => section.claimIds).map((id) => structuredClone(originalRecords.get(id)));
const pin = digest(accepted), catalog = structuredClone(rawCatalog);
for (const [kind, records] of [["claims", [...accepted.claims, ...original.scientificClosure.claims]], ["evidence", original.scientificClosure.evidence], ["sources", original.scientificClosure.sources]]) {
  const ids = new Set(records.map((row) => row.id));
  catalog[kind] = catalog[kind].filter((row) => !ids.has(row.id)).concat(structuredClone(records));
}
const frozen = climateAssemblyOriginalEntries(), entries = remapClimateAssemblyCitations(frozen, accepted, pin), allIds = accepted.claims.map((row) => row.id), esc = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
test("climate originals and actual838 heading capture stay independently immutable", () => {
  assertClimateAssemblyOriginal(original);
  assertClimateAssemblyHeadingOriginal(captured);
  const copy = structuredClone(original);
  copy.claims[0].text += "unreviewed";
  assert.throws(() => assertClimateAssemblyOriginal(copy), /immutable original/);
  const headings = structuredClone(captured);
  headings.newNativePrintHeadings[1].hasResponseFigure = false;
  assert.throws(() => assertClimateAssemblyHeadingOriginal(headings), /immutable heading/);
  assert.equal(frozen.length, 237);
  assert.equal(new Set(frozen.map((row) => row.path + "#" + row.id)).size, 237);
});
test("registration and current acceptance fail closed on omission, changed coverage or missing appendix", () => {
  assertClimateAssemblyRegistration(edition);
  assert.throws(() => assertClimateAssemblyAccepted(accepted), /acceptance is incomplete/);
  assertClimateAssemblyAccepted(accepted, pin);
  for (const alter of [(copy) => copy.units = copy.units.filter((row) => row.key !== appendix), (copy) => copy.units.find((row) => row.key === key).coverage.reverse(), (copy) => copy.units.push({ key: routes[1], source: routes[1], kind: "chapter" }), (copy) => copy.units.find((row) => row.key === key).sections.pop()]) {
    const copy = structuredClone(edition);
    alter(copy);
    assert.throws(() => assertClimateAssemblyRegistration(copy), /assembly/);
  }
  for (const alter of [(copy) => copy.claims[0].caveats.push("unreviewed"), (copy) => copy.website[0].claimIds.push(moved[0]), (copy) => copy.appendix.sections[0].claimIds.pop(), (copy) => copy.sources[0].figure.section = "清单比较"]) {
    const copy = structuredClone(accepted);
    alter(copy);
    assert.throws(() => assertClimateAssemblyAccepted(copy, pin), /acceptance is incomplete/);
  }
});
test("source/catalog checks reject stale template text, ordinary navigation, duplicated body and changed scientific closure", () => {
  assert.deepEqual(validateClimateAssemblyCoverage(edition, sources, catalog, accepted, pin), []);
  for (const bad of [sources.get(manuscript).replace("cl-climate-opening", "cl-climate-opening cl-climate-opening"), sources.get(manuscript).replace("#参考响应", "#不存在"), sources.get(manuscript).replace("气候数值的重建", "未审普通导航"), sources.get(manuscript).replace("<figure>", "<figure hidden>")]) {
    const changed = new Map(sources);
    changed.set(manuscript, bad);
    assert(validateClimateAssemblyCoverage(edition, changed, catalog, accepted, pin).length);
  }
  for (const [kind, id] of [["claims", allIds[0]], ["claims", original.scientificClosure.claims[0].id], ["evidence", original.scientificClosure.evidence[0].id], ["sources", original.scientificClosure.sources[0].id]]) {
    const changed = structuredClone(catalog);
    changed[kind].find((row) => row.id === id).scope = "unreviewed";
    assert(validateClimateAssemblyCoverage(edition, sources, changed, accepted, pin).some((error) => error.includes(id)));
  }
  const duplicate = structuredClone(catalog);
  duplicate.claims.push(duplicate.claims.find((row) => row.id === allIds[0]));
  assert(validateClimateAssemblyCoverage(edition, sources, duplicate, accepted, pin).length);
  assert.deepEqual(validateClimateAssemblyCoverage(edition, sources, publicCatalog(catalog), accepted, pin, "public"), []);
});
test("all237 affected historical addresses preserve exact41/7 and heading subsets with real appendix and figure destinations", () => {
  assert.equal(entries.length, 237);
  for (const old of frozen) {
    const current2 = entries.find((row) => row.path === old.path && row.id === old.id);
    assert(current2);
    if (old.targets[0].kind === "note") {
      const target = current2.targets[0];
      assert.equal(target.claimId, old.targets[0].claimId);
      assert.equal(target.route, moved.includes(target.claimId) ? appendix : old.path === "/print" ? key : old.route);
    } else {
      const scoped = current2.scope.targets.filter((row) => row.kind === "note").map((row) => row.claimId);
      if (["chapter", "note-group"].includes(old.targets[0].kind)) assert.deepEqual(scoped, old.route === routes[0] ? original.orderedClaimIds.filter((id) => id.startsWith("cl-climate-")) : original.orderedClaimIds.filter((id) => id.startsWith("cl-time-")));
    }
  }
  const oldFigure = captured.newNativePrintHeadings.find((row) => row.hasResponseFigure), figureScope = entries.find((row) => row.path === "/print" && row.id === oldFigure.id);
  assert.equal(figureScope.scope.targets.filter((row) => row.kind === "note" && row.route === appendix).length, 4);
  assert.equal(figureScope.scope.targets.filter((row) => row.kind === "note" && row.route === key).length, 2);
  assert(figureScope.scope.text.includes("原响应图"));
  assert(figureScope.targets.some((row) => row.route === key && row.id === `${printUnitAnchor(key)}-响应与指标`));
  for (const bad of [frozen.slice(1), [...frozen, frozen[0]], frozen.map((row, index) => index ? row : { ...row, edition: { ...row.edition, sourceCommit: "a".repeat(40) } })]) assert.throws(() => remapClimateAssemblyCitations(bad, accepted, pin), /missing, repeated or changed/);
});
test("bounded book links stay native and retain unknown old scopes", () => {
  assert.equal(climateAssemblyBookHref(`${appendix}/#参考响应`, key), `#${printUnitAnchor(appendix)}-参考响应`);
  assert.equal(climateAssemblyBookHref(`${routes[0]}/#响应与指标`, appendix), `#${printUnitAnchor(key)}-响应与指标`);
  assert.equal(climateAssemblyBookHref("/docs/book/acidification-and-nutrient-pathways/", key), `#${printUnitAnchor("/docs/book/acidification-and-nutrient-pathways")}`);
  assert.equal(climateAssemblyBookHref(`${routes[0]}/#旧范围`, appendix), `${routes[0]}/#旧范围`);
});
test("unchanged source figure and numerical input bytes are independent from current prose acceptance", async () => {
  const bytes = { figure: await readFile(new URL("../public/book-figures/climate-response-and-integral.svg", import.meta.url)), input: await readFile(new URL("../knowledge/cases/climate-metrics-v1.json", import.meta.url)) };
  assert.deepEqual(validateClimateAssemblyArtifactBytes(bytes), []);
  assert(validateClimateAssemblyArtifactBytes({ ...bytes, figure: Buffer.concat([bytes.figure, Buffer.from("changed")]) }).length);
});
// Reuse the actual annotation component and actual catalog projector, not a payload-shaped stub.
const published = publicCatalog(catalog), byId = new Map(published.claims.map((row) => [row.id, row])), require2 = createRequire(import.meta.url), mdxRequire = createRequire(require2.resolve("fumadocs-mdx")), component = { exports: {} };
const compiled = mdxRequire("esbuild").transformSync(await readFile(new URL("../components/evidence.tsx", import.meta.url), "utf8"), { loader: "tsx", jsx: "automatic", format: "cjs" });
new Function("require", "module", "exports", compiled.code)((name) => name === "@/lib/catalog" ? { __esModule: true, default: published, getClaimEvidence, isKnownClaim: (id) => byId.has(id) } : name === "@/knowledge/research/literature-map.json" ? literature : name === "@/knowledge/research/readings.json" ? readings : name === "@/scripts/research.mjs" ? { publicResearch } : require2(name), component, component.exports);
const { ClaimAnnotation } = component.exports;
process.env.__NEXT_TRAILING_SLASH = "true";
const externalIds = [...new Set(accepted.claims.flatMap((row) => row.premiseIds ?? []).filter((id) => !allIds.includes(id)))], externalRoute = "/docs/book/fixture-climate-premises", referencePages = [{ url: key, title: accepted.title, raw: sources.get(manuscript) }, { url: appendix, title: accepted.appendix.title, raw: sources.get(appendix) }, { url: externalRoute, title: "外部前提", raw: `<Prose ids="${externalIds.join(" ")}" />` }];
function label(target) {
  const ids = target.route === key ? accepted.sections.flatMap((row) => row.claimIds) : target.route === appendix ? moved : accepted.website.find((row) => row.route === target.route).claimIds, title = accepted.sources.find((row) => row.route === (target.route === key ? manuscript : target.route)).title;
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
  const index = createChapterReferenceIndex(referencePages, { print: true });
  return [key, appendix].map((route) => {
    const source = accepted.sources.find((row) => row.route === (route === key ? manuscript : route)), sections = route === key ? accepted.sections : accepted.appendix.sections, prefix = printUnitAnchor(route), plan = createChapterNotePlan(sources.get(route === key ? manuscript : route), prefix), options = createChapterAnnotationPlan(plan, published.claims, index, { print: true });
    const ordinary = (section) => source.ordinary.filter((row) => row.section === section).map((row) => `<p>${esc(row.text).replace(esc(row.links[0]?.text ?? "__absent__"), `<a href="${row.links[0] ? climateAssemblyBookHref(row.links[0].href, route) : ""}">${esc(row.links[0]?.text ?? "")}</a>`)}</p>`).join("");
    const body = sections.map((section) => `<h3 id="${prefix}-${section.id}">${section.title}</h3>${section.claimIds.map((id) => {
      const split = splitReferenceTail(byId.get(id).text), note = plan.byClaimId.get(id);
      return `<p>${esc(split.body)}<span>${esc(split.tail)}<sup><a role="doc-noteref" data-reader-reference="${id}" href="#${note.anchor}" aria-label="注 ${note.number}">[${note.number}]</a></sup></span></p>${id === "cl-climate-reference-illustration" ? figureMarkup(source) : ""}`;
    }).join("")}${ordinary(section.id)}`).join("");
    return `<article id="${prefix}" data-reader-route="${route}" data-reader-title="${source.title}"><h2>${source.title}</h2><p>${source.description}</p>${body}<section class="chapter-notes"><h3 id="${prefix}-annotations">注释</h3><ol>${plan.notes.map((note) => `<li id="${note.anchor}" data-reader-claim="${note.id}">${aliases(route, note.anchor)}${renderToStaticMarkup(createElement(ClaimAnnotation, { id: note.id, ...options.get(note.id) }))}</li>`).join("")}</ol></section>${entries.filter((entry) => entry.path === "/print" && entry.route === route && entry.mode === "notice").map(context).join("")}</article>`;
  }).join("") + `<article data-reader-route="${externalRoute}" data-reader-title="外部前提">${externalIds.map((id) => `<li id="${printUnitAnchor(externalRoute)}-claim-${id}" data-reader-claim="${id}">外部前提</li>`).join("")}</article>`;
}
test("actual combined body and appendix retain notes, source conditions, figure and ordinary navigation", () => {
  const html = rendered(), check = (html2) => validateRenderedClimateAssembly(htmlParser.parse(html2), "/print", published, accepted, pin);
  assert.deepEqual(check(html), []);
  const doc = htmlParser.parse(html), figure = doc.querySelector("figure"), paragraph = doc.querySelector('[role="doc-noteref"]').closest("p"), notice = doc.querySelector("[data-legacy-notice]"), limits = doc.querySelector(".annotation-limits"), navigation = doc.querySelector('p a[href*="-参考响应"]')?.closest("p");
  assert(navigation);
  for (const changed of [html.replace(figure.outerHTML, ""), html.replace(figure.outerHTML, "").replace("</article>", figure.outerHTML + "</article>"), html.replace(figure.outerHTML, figure.outerHTML.replace("<figure>", "<figure hidden>")), html.replace('width="700"', 'width="701"'), ...["hidden", 'aria-hidden="true"', 'style="display:none"', 'class="hidden"'].map((hidden) => html.replace("<img ", `<img ${hidden} `)), html.replace(paragraph.outerHTML, ""), html.replace(paragraph.outerHTML, paragraph.outerHTML + paragraph.outerHTML), html.replace(paragraph.outerHTML, paragraph.outerHTML.replace("<p>", "<p hidden>")), html.replace(notice.outerHTML, ""), html.replace(notice.outerHTML, notice.outerHTML + notice.outerHTML), html.replace(limits.outerHTML, ""), html.replace(navigation.outerHTML, navigation.outerHTML.replace("参考响应", "错误入口")), html.replace("</article>", "<p>未审新增文字</p></article>")]) assert(check(changed).length);
});
const timeIds = b32.scientificClosure.claims.filter((row) => row.id.startsWith("cl-time-")).map((row) => row.id), current = { schemaVersion: 1, status: "reviewed", originalDigest: closingSynthesisDigest(b32), changes: timeIds.map((id) => {
  const old = b32.scientificClosure.claims.find((row) => row.id === id);
  return { old, current: { ...structuredClone(old), text: old.text + " Explicit fixture renewed wording." }, rationale: "Fixture renewed source meaning." };
}), consumers: original.downstreamClaims.map((record) => ({ id: record.id, record, rationale: "Fixture confirmed unchanged use." })), reviewEvidence: [{ kind: "fixture only", reportSha256: "c".repeat(64), receiptSha256: "d".repeat(64) }] }, currentPin = closingSynthesisDigest(current), closingCatalog = structuredClone(rawCatalog);
for (const [kind, records] of [["claims", [...b32.scientificClosure.claims, ...b32Prose.claims]], ["evidence", b32.scientificClosure.evidence], ["sources", b32.scientificClosure.sources]]) {
  const ids = new Set(records.map((row) => row.id));
  closingCatalog[kind] = closingCatalog[kind].filter((row) => !ids.has(row.id)).concat(structuredClone(records));
}
for (const change of current.changes) Object.assign(closingCatalog.claims.find((row) => row.id === change.current.id), structuredClone(change.current));
const closingSources = new Map(await Promise.all([...closingSynthesisRoutes, closingSynthesisManuscript].map(async (route) => [route, await readFile(new URL(`../content${route}.mdx`, import.meta.url), "utf8")])));
test("B32 additive current acceptance qualifies only exact seven records, six consumers and reviewed edges", () => {
  assertClosingSynthesisCurrentAccepted(current, currentPin);
  assert.throws(() => assertClosingSynthesisCurrentAccepted(current), /not independently pinned/);
  assert.deepEqual(validateClosingSynthesisCoverage(edition, closingSources, closingCatalog, b32Prose, void 0, "raw", current, currentPin), []);
  assert.deepEqual(validateClosingSynthesisCoverage(edition, closingSources, publicCatalog(closingCatalog), b32Prose, void 0, "public", current, currentPin), []);
  assert(validateClosingSynthesisCoverage(edition, closingSources, closingCatalog, b32Prose, void 0, "raw", null, null).length);
  for (const alter of [(copy) => copy.changes.pop(), (copy) => copy.consumers.pop(), (copy) => copy.changes[0].old.text += "changed", (copy) => copy.changes[0].current.premiseIds.push("unreviewed-edge"), (copy) => copy.consumers[0].record.text += "changed"]) {
    const copy = structuredClone(current);
    alter(copy);
    assert.throws(() => assertClosingSynthesisCurrentAccepted(copy, closingSynthesisDigest(copy)), /exact seven|unqualified original|unchanged consumer/);
  }
  for (const alter of [(copy) => copy.claims.find((row) => row.id === timeIds[0]).reviewedAt = "2099-01-01", (copy) => copy.claims.push(copy.claims.find((row) => row.id === timeIds[0])), (copy) => copy.evidence.find((row) => row.id === b32.scientificClosure.evidence[0].id).locator = "unreviewed", (copy) => copy.sources.find((row) => row.id === b32.scientificClosure.sources[0].id).title = "unreviewed"]) {
    const copy = structuredClone(closingCatalog);
    alter(copy);
    assert(validateClosingSynthesisCoverage(edition, closingSources, copy, b32Prose, void 0, "raw", current, currentPin).length);
  }
});
test("complete production history composition preserves all4129 earlier addresses and adds only11 actual838 headings", async () => {
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
  const { climateAssemblyHeadingEntries } = await import("./reader-climate-assembly.mjs"), current2 = remapClimateAssemblyCitations([...all, ...climateAssemblyHeadingEntries()], accepted, pin);
  assert.equal(current2.length, 4140);
  assert.equal(new Set(current2.map((row) => row.path + "#" + row.id)).size, 4140);
  const affected = new Set(frozen.map((row) => row.path + "#" + row.id));
  for (const entry of current2) {
    const address = entry.path + "#" + entry.id;
    if (!affected.has(address)) assert.deepEqual(entry, before.get(address));
  }
  assert.equal(current2.filter((row) => !before.has(row.path + "#" + row.id)).length, 11);
});
test("native fine-page old41/7 groups and timing heading scopes cannot widen or detach", async () => {
  const { readCitationSurface, validateHistoricalScope } = await import("./reader-surface.mjs");
  for (const entry of entries.filter((row) => row.path !== "/print" && row.mode === "retained" && row.scope)) {
    const markup = `<article><section class="chapter-notes"><h2 id="${entry.id}">注释</h2>${context(entry)}</section></article>`, check = (value) => validateHistoricalScope(readCitationSurface(htmlParser.parse(value), entry.path).ids.get(entry.id), entry);
    assert.deepEqual(check(markup), []);
    assert(check(markup.replace(context(entry), "") + context(entry)).length);
    assert(check(markup.replace(entry.scope.text, "新完整章的全部注释")).length);
    const widened = { ...entry, scope: { ...entry.scope, targets: accepted.sections.flatMap((section) => section.claimIds).map((id) => ({ route: key, path: "/print", kind: "note", id: `${printUnitAnchor(key)}-claim-${id}`, claimId: id })) } };
    assert(check(markup.replace(context(entry), context(widened))).length);
  }
});

test("inline numeric opacity and collapse visibility cannot conceal image, canonical prose or annotation", () => {
  const html = rendered();
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), "/print", published, accepted, pin);
  const document = htmlParser.parse(html);
  const nodes = [document.querySelector("figure img"), document.querySelector('[role="doc-noteref"]').closest("p"), document.querySelector(".claim-annotation")];
  for (const node of nodes) {
    for (const style of ["opacity:0.0", "opacity:.0", "opacity:-0.00", "opacity:0e0 !important", "opacity:/**/0.0", "visibility:collapse", "visibility: COLLAPSE !important"]) {
      const hidden = node.outerHTML.replace(/^<([a-z][\w-]*)\b/i, `<$1 style="${style}"`);
      assert(check(html.replace(node.outerHTML, hidden)).some((error) => /hidden|concealed/.test(error)), `${node.tagName} ${style}`);
    }
    const visible = node.outerHTML.replace(/^<([a-z][\w-]*)\b/i, '<$1 style="opacity:0.5;visibility:visible"');
    assert.deepEqual(check(html.replace(node.outerHTML, visible)), []);
  }
});

test("only the single approved figure image may occur inside the climate reading unit", () => {
  const html = rendered();
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), "/print", published, accepted, pin);
  const document = htmlParser.parse(html), image = document.querySelector("figure img");
  for (const extra of [image.outerHTML, '<img src="/book-figures/unreviewed.svg" alt="Unreviewed scientific graphic">']) {
    const duplicateInMain = html.replace('</article>', `${extra}</article>`);
    assert(check(duplicateInMain).some((error) => error.includes("scientific-image roster")));
    const appendixUnit = document.querySelector(`article[data-reader-route="${appendix}"]`);
    const duplicateInAppendix = html.replace(appendixUnit.outerHTML, appendixUnit.outerHTML.replace('</article>', `${extra}</article>`));
    assert(check(duplicateInAppendix).some((error) => error.includes("scientific-image roster")));
  }
});

test("all qualified source generations retain explicit response-figure scope and the exact original six notes", () => {
  const originalScope = original.sectionScopes[routes[0]].find((scope) => scope.hasResponseFigure);
  const figureHeadings = frozen.filter((entry) => entry.route === routes[0] && entry.targets[0].kind === "heading" && entry.targets[0].id.endsWith("co-的参考也需要一个模型"));
  assert.equal(figureHeadings.length, 3); // dd web + dd print + actual838 native print.
  for (const entry of figureHeadings) {
    const mapped = entries.find((row) => row.path === entry.path && row.id === entry.id);
    assert(mapped.scope.text.includes("原响应图的现行入口"));
    assert.deepEqual(mapped.scope.targets.filter((row) => row.kind === "note").map((row) => row.claimId), originalScope.claimIds);
    assert.equal(mapped.scope.targets.filter((row) => row.kind === "note" && row.route === appendix).length, 4);
    assert.equal(mapped.scope.targets.filter((row) => row.kind === "note" && row.route !== appendix).length, 2);
    assert(mapped.scope.targets.some((row) => row.kind === "heading" && row.route === (entry.path === "/print" ? key : routes[0]) && row.id.endsWith("响应与指标")));
  }
  const generationProof = new Set();
  for (const entry of entries.filter((row) => row.scope?.text.includes("原响应图的现行入口"))) generationProof.add(entry.edition.sourceCommit);
  assert.deepEqual([...generationProof].sort(), ["dd715663c3438aa730eef0da1696dc376a7715f1", "a36597d72f8cd89beb285d5d5b439b4aa10e89a3", captured.sourceCommit].sort());
  for (const historical of captured.originalSourceHistory.filter((row) => row.path === `content${routes[0]}.mdx`)) {
    assert.equal(historical.sha256, original.sourceFiles[historical.path].sha256);
    assert.equal(createHash("sha256").update(original.sourceFiles[historical.path].text).digest("hex"), historical.sha256);
    assert.deepEqual(historical.sectionScopes.find((scope) => scope.title === originalScope.title).claimIds, originalScope.claimIds);
  }
  const wrongProof = structuredClone(original);
  wrongProof.sourceFiles[`content${routes[0]}.mdx`].sha256 = "0".repeat(64);
  assert.throws(() => assertClimateAssemblyOriginal(wrongProof), /immutable original/);
});

test("unreviewed scientific visual elements are rejected in main and figure-free appendix", () => {
  const html = rendered(), document = htmlParser.parse(html);
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), "/print", published, accepted, pin);
  const visuals = [
    '<svg role="img" aria-label="unreviewed curve" width="700" height="800"><path fill="red" d="M0 0H700V800H0Z"></path></svg>',
    '<canvas width="700" height="800" style="background:red"></canvas>',
    '<video src="unreviewed.webm"></video>', '<iframe src="/unreviewed/"></iframe>',
    '<object data="unreviewed.svg"></object>', '<embed src="unreviewed.svg">'
  ];
  for (const route of [key, appendix]) {
    const unit = document.querySelector(`article[data-reader-route="${route}"]`);
    for (const visual of visuals) {
      const changed = html.replace(unit.outerHTML, unit.outerHTML.replace('</article>', `${visual}</article>`));
      assert(check(changed).some((error) => error.includes("unreviewed visual element")), `${route}: ${visual}`);
    }
  }
});

test("content visibility, full inset clipping and opacity classes cannot hide scientific output", () => {
  const html = rendered(), document = htmlParser.parse(html);
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), "/print", published, accepted, pin);
  const unit = document.querySelector(`article[data-reader-route="${key}"]`);
  const description = unit.querySelector('h2').nextElementSibling;
  const nodes = [description, unit.querySelector('[role="doc-noteref"]').closest("p"), unit.querySelector(".claim-annotation"), unit.querySelector("figure"), unit.querySelector("figure img")];
  for (const node of nodes) {
    for (const style of ["content-visibility:hidden", "content-visibility: HIDDEN !important", "clip-path:inset(100%)"]) {
      const copy = htmlParser.parse(node.outerHTML).firstChild;
      copy.setAttribute("style", style);
      assert(check(html.replace(node.outerHTML, copy.outerHTML)).some((error) => /hidden|concealed/.test(error)), `${node.tagName}: ${style}`);
    }
    const transparent = htmlParser.parse(node.outerHTML).firstChild;
    transparent.setAttribute("class", `${transparent.getAttribute("class") ?? ""} opacity-0`.trim());
    assert(check(html.replace(node.outerHTML, transparent.outerHTML)).some((error) => /hidden|concealed/.test(error)), `${node.tagName}: opacity-0`);
  }
});

test("only the captured heading-owned exact copy icon receives the framework visual and hover-opacity allowance", () => {
  // Partial web fixture isolates control admission; missing body/notes are still rejected.
  const title = accepted.sources.find((source) => source.route === routes[0]);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
  const button = `<button aria-live="polite" class="inline-flex items-center justify-center rounded-md text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring hover:bg-fd-accent hover:text-fd-accent-foreground p-1 [&amp;_svg]:size-4 not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100">${svg}<span class="sr-only">复制章节链接</span></button>`;
  const heading = `<h2 id="响应与指标" data-reader-heading-key="响应与指标"><a data-card="" href="#响应与指标">响应与指标</a>${button}</h2>`;
  const html = `<article><h1>${title.title}</h1><p>${title.description}</p>${heading}</article>`;
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), routes[0], published, accepted, pin);
  const baseline = check(html);
  assert(baseline.length, "partial fixture still lacks the accepted body");
  assert(!baseline.some((error) => /unreviewed visual|content heading differs or hidden/.test(error)));
  const observedWrapper = html.replace(heading, `<div class="prose flex-1">${heading}</div>`);
  assert(!check(observedWrapper).some((error) => /unreviewed visual|content heading differs or hidden/.test(error)));
  for (const wrongOwner of [
    html.replace(heading, `<div><div class="prose flex-1">${heading}</div></div>`),
    observedWrapper.replace('</article>', '<div class="prose flex-1"></div></article>'),
    observedWrapper.replace('class="prose flex-1"', 'class="prose flex-1" id="unqualified-owner"'),
    observedWrapper.replace('class="prose flex-1"', 'class="prose flex-1 other-owner"')
  ]) assert(check(wrongOwner).some((error) => error.includes("unreviewed visual element")));
  for (const changed of [
    html.replace(button, '').replace('</article>', button + '</article>'),
    html.replace('id="响应与指标"', 'id="unqualified-heading"'),
    html.replace('width="24"', 'width="700"'),
    html.replace('d="M10 13a5', 'd="M0 0H700V800H0Z M10 13a5'),
    html.replace('aria-live="polite"', 'aria-live="polite" style="content-visibility:hidden"'),
    html.replace(svg, svg + svg),
    html.replace(button, `<button aria-live="polite">${svg}</button>`)
  ]) assert(check(changed).some((error) => error.includes("unreviewed visual element")));
});

test("ordinary links accept one fragment encoding while path and malformed/double encoding remain exact", () => {
  const source = accepted.sources.find((row) => row.route === routes[0]);
  const ordinaryParagraph = (row) => {
    let cursor = 0, text = "";
    for (const link of row.links) {
      const index = row.text.indexOf(link.text, cursor);
      assert(index >= cursor);
      text += esc(row.text.slice(cursor, index)) + `<a href="${link.href}">${esc(link.text)}</a>`;
      cursor = index + link.text.length;
    }
    return `<p>${text + esc(row.text.slice(cursor))}</p>`;
  };
  // Partial observed web shape isolates exact ordinary-navigation comparison.
  const body = source.headings.map((heading) => `<h2 id="${heading.id}">${heading.title}</h2>${source.figure?.section === heading.id ? figureMarkup(source) : ''}${source.ordinary.filter((row) => row.section === heading.id).map(ordinaryParagraph).join('')}`).join('');
  const html = `<article><h1>${source.title}</h1><p>${source.description}</p><div class="prose flex-1">${body}</div></article>`;
  const check = (value) => validateRenderedClimateAssembly(htmlParser.parse(value), routes[0], published, accepted, pin);
  const navigationErrors = (value) => check(value).filter((error) => error.includes("ordinary navigation/figure count differs"));
  assert.deepEqual(navigationErrors(html), []);
  const link = source.ordinary.flatMap((row) => row.links).find((row) => row.href.includes('#参考响应'));
  assert(link);
  const [path, fragment] = link.href.split('#'), encoded = `${path}#${encodeURIComponent(fragment)}`;
  assert.deepEqual(navigationErrors(html.replace(link.href, encoded)), []);
  for (const wrong of [
    `${path}#${encodeURIComponent(encodeURIComponent(fragment))}`,
    `${path}#%E5%8F%82%ZZ`, `${path}#%`, `${path}#其他位置`,
    `${path.replace('/docs/', '/other/')}#${encodeURIComponent(fragment)}`,
    `${path.replace(/\/$/, '')}#${encodeURIComponent(fragment)}`,
    `${path}?unreviewed=1#${encodeURIComponent(fragment)}`
  ]) assert(navigationErrors(html.replace(link.href, wrong)).length, wrong);
});
