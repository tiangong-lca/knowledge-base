import { projectOrdinaryReaderNavigation } from './reader-edition.mjs';
import { currentBookLayout, currentBookMdxMatches, currentBookRecordMatches } from './reader-current-expectations.mjs';
import { createHash } from "node:crypto";
import original from "../config/data-applicability-original.json" with { type: "json" };
import captured from "../config/data-applicability-heading-original.json" with { type: "json" };
import baseline from "../config/citation-baseline.json" with { type: "json" };
import history from "../config/citation-history.json" with { type: "json" };
import { assertCitationBaseline } from "./reader-citation-baseline.mjs";
import { assertCitationHistory } from "./reader-citation-history.mjs";
import { createLegacyCitationEntries, createCanonicalCitationEntries } from "./reader-citations.mjs";
import { chapterAnchorPrefix, collectChapterClaimOccurrences, printUnitAnchor } from "./reader-book.mjs";
import { publicCatalog } from "./knowledge.mjs";
import { validateExchangeAnnotationOutput, unaccountedReaderText } from "./reader-exchange-semantics.mjs";
import { isVerifiedReaderPagination } from "./reader-numbering-output.mjs";
import { applyCurrentHistoricalEntries, readerParagraphText, validateReaderHistoricalText } from "./reader-publication-text.mjs";
const dataApplicabilityKey = "book-data-applicability";
const dataApplicabilityManuscript = "/monograph/data-applicability";
const dataApplicabilityTitle = "数据适用性";
const dataApplicabilityRoutes = ["/docs/book/database-fitness-and-documentation", "/docs/book/review-support-and-version-boundaries"];
const dataApplicabilityTitles = ["表示对象", "质量信息", "审查范围", "版本变化"];
// Main owns this independently reviewed current-content pin. Test pins qualify only explicit fixtures.
/** @type {string|null} */
const dataApplicabilityAcceptedDigest = "14cb4efe8d8f1869ca7b05d8795257ba322ddd0d619afdcc19bb53b17c60ee40";
const dataApplicabilityDigest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const rawDigest = (text) => createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");
const ordered = (value) => Array.isArray(value) ? value.map(ordered) : value
    && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, ordered(value[key])])) : value;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b), sameRecord = (a, b) => same(ordered(a), ordered(b));
const nonempty = (value) => typeof value === "string" && !!value.trim(), hashLike = (value) => /^[a-f0-9]{64}$/.test(value ?? "");
const unique = (values) => [...new Set(values)];
const location = (route, path) => path === "/print" ? printUnitAnchor(route) : chapterAnchorPrefix(route);
const target = (route, path, kind, id, claimId) => ({ route, path, kind, id, ...claimId ? { claimId } : {} });
const sourceRoutes = [...dataApplicabilityRoutes, dataApplicabilityManuscript];
const plainSections = (titles) => titles.map((title) => ({ id: title, title }));
function assertDataApplicabilityOriginal(value = original) {
  if (dataApplicabilityDigest(value) !== "488161a7f37b84d8ccaacf8cd4801ec415ec2e029a6642779a86c61d576fde96") throw new Error("Data applicability immutable original12/source/scientific closure differs");
}
function assertDataApplicabilityHeadingOriginal(value = captured) {
  if (dataApplicabilityDigest(value) !== "a02cbe0de04408d94c5fc0e7e15bfc4575b27892537ce01981aa6fb60c3a2051") throw new Error("Data applicability actual46b immutable heading/scope capture differs");
}
function assertDataApplicabilityRegistration(edition) {
  const units = edition?.units ?? [], matches = units.filter(row => row.key === dataApplicabilityKey), unit = matches[0];
  if (matches.length !== 1 || unit.source !== dataApplicabilityManuscript || unit.kind !== "chapter"
      || unit.part !== currentBookLayout('book:part-title:6', "证据分量") || !same(unit.coverage, dataApplicabilityRoutes)
      || !same(unit.sections, currentBookLayout('B25:registered-sections', plainSections(dataApplicabilityTitles))) || units.some(row => dataApplicabilityRoutes.includes(row.key)))
    throw new Error("Data applicability requires actual four-section/two-source book assembly");
}
/** Inspect only the bounded static MDX shape used by these three authored sources. */
function inspectDataApplicabilitySource(raw) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw ?? "")?.[1] ?? "", field = (name) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(front)?.[1]?.replace(/^(['"])(.*)\1$/, "$2");
  const pieces = raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, "").split(/^## (.+)\s*$/m), headings = [], occurrences = [], ordinary = [], figures = [];
  for (let i = 1; i < pieces.length; i += 2) {
    const explicit = /^(.*?)\s+\[#([^\]]+)\]$/.exec(pieces[i]), title = explicit ? explicit[1] : pieces[i], id = explicit ? explicit[2] : title, body = pieces[i + 1];
    headings.push({ id, title });
    occurrences.push(...collectChapterClaimOccurrences(body).map((claim) => ({ id: claim, section: id })));
    const rest = body.replace(/<figure>[\s\S]*?<\/figure>/g, (figure) => {
      const attr = (name) => new RegExp(`\\b${name}="([^"]*)"`).exec(figure)?.[1];
      figures.push({ section: id, src: attr("src"), alt: attr("alt"), width: attr("width"), height: attr("height"), caption: /<figcaption>([^<]*)<\/figcaption>/.exec(figure)?.[1] });
      return "";
    }).replace(/<(?:Prose|Claim)\b[^>]*\/>/g, "");
    for (const block of rest.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean)) {
      const links = [...block.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({ text: match[1], href: match[2] })), text = block.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1").replace(/\s*\n\s*/g, "");
      ordinary.push({ section: id, text, links });
    }
  }
  return { title: field("title"), description: field("description"), headings, occurrences, ordinary, figure: figures.length === 1 ? figures[0] : null, figureCount: figures.length, outsideOccurrences: collectChapterClaimOccurrences(pieces[0]) };
}
function assertDataApplicabilityAccepted(accepted, independentDigest = dataApplicabilityAcceptedDigest) {
  assertDataApplicabilityOriginal();
  assertDataApplicabilityHeadingOriginal();
  if (!accepted
      || accepted.schemaVersion !== 1
      || accepted.status !== "reviewed"
      || !hashLike(independentDigest)
      || dataApplicabilityDigest(accepted) !== independentDigest) throw new Error("Data applicability requires independently reviewed current content; acceptance is incomplete");
  const all = accepted.sections?.flatMap(section => section.claimIds ?? []) ?? [], wanted = [...original.orderedClaimIds, "cl-db2011-scope-examples", "cl-db2011-conditional-use"];
  if (accepted.bookKey !== dataApplicabilityKey || accepted.manuscript !== dataApplicabilityManuscript || accepted.title !== dataApplicabilityTitle
      || !same(accepted.sections?.map(({id,title}) => ({id,title})), plainSections(dataApplicabilityTitles))
      || !same(accepted.sections.map(section => section.claimIds.length), [3,4,5,2])
      || all.length !== 14 || unique(all).length !== 14 || !same([...all].sort(), wanted.sort())
      || !same(accepted.claims?.map(row => row.id), all) || accepted.claims.some(row => row.status !== "reviewed"))
    throw new Error("Data applicability accepted14/order/four-section conservation differs");
  const closure = accepted.scientificClosure, expectedEvidenceIds = [...original.scientificClosure.evidence.map(row => row.id), "ev-db2011-use-examples", "ev-db2011-conditional-consistency"];
  if (!closure || !same(Object.keys(closure).sort(), ["claims","evidence","sources"])
      || !same(closure.claims, []) || !same(closure.evidence?.map(row => row.id).sort(), expectedEvidenceIds.sort())
      || !sameRecord(closure.sources, original.scientificClosure.sources)
      || original.scientificClosure.evidence.some(fixed => !sameRecord(closure.evidence.find(row => row.id === fixed.id), fixed))
      || !same(unique(accepted.claims.flatMap(row => row.evidenceIds)).sort(), [...expectedEvidenceIds].sort())
      || accepted.claims.some(row => (row.premiseIds ?? []).some(id => !all.includes(id)))
      || closure.evidence.some(row => !closure.sources.some(source => source.id === row.sourceId)))
    throw new Error("Data applicability needs exact14 evidence/one source closure, unchanged originals and internal premises");
  if (!same(accepted.website?.map(page => page.route), dataApplicabilityRoutes)) throw new Error("Data applicability requires both fine website memberships");
  for (const [index, added] of [[0,"cl-db2011-scope-examples"],[1,"cl-db2011-conditional-use"]]) {
    const wantedIds = [...collectChapterClaimOccurrences(original.sourceFiles[`content${dataApplicabilityRoutes[index]}.mdx`].text), added], page = accepted.website[index];
    if (!Array.isArray(page.occurrences) || !same(page.occurrences.map(row => row.id), page.claimIds)
        || unique(page.claimIds).length !== 7 || page.claimIds.length !== 7 || !same([...page.claimIds].sort(), wantedIds.sort()))
      throw new Error("Data applicability fine website exact7/7 membership or section receipt differs");
  }
  if (!same(accepted.sources?.map((row) => row.route), sourceRoutes)
      || accepted.sources.some((row) => !nonempty(row.title)
      || !nonempty(row.description)
      || !hashLike(row.mdxSha256)
      || !Array.isArray(row.headings)
      || !Array.isArray(row.ordinary)
      || row.ordinary.some((item) => !nonempty(item.section)
      || !nonempty(item.text)
      || !Array.isArray(item.links)
      || item.links.some((link) => !nonempty(link.text)
      || !nonempty(link.href))))) throw new Error("Data applicability acceptance needs all three exact source metadata/headings/ordinary navigation receipts");
  if (!Array.isArray(accepted.reviewEvidence)
      || !accepted.reviewEvidence.length
      || accepted.reviewEvidence.some((row) => !nonempty(row.kind)
      || !hashLike(row.reportSha256)
      || !hashLike(row.receiptSha256))) throw new Error("Data applicability acceptance requires explicit substantive and reader review evidence");
  if (accepted.sources.some(row => row.figure !== null)) throw new Error("Data applicability has no reviewed scientific images");
  const continuation = [{section:"版本变化",text:"继续阅读：不确定性。",links:[{text:"不确定性",href:"/docs/book/uncertainty-and-variability"}]}];
  if (!same(accepted.sources[0].ordinary, []) || !same(accepted.sources[1].ordinary, continuation) || !same(accepted.sources[2].ordinary, continuation))
    throw new Error("Data applicability requires its exact final uncertainty continuation");
}
function reviewedDataApplicabilitySource(accepted, route) {
  const source = accepted.sources.find(row => row.route === route);
  const occurrences = route === dataApplicabilityManuscript ? accepted.sections.flatMap(section => section.claimIds.map(id => ({ id, section: section.id }))) : accepted.website.find(page => page.route === route).occurrences;
  return currentBookLayout(`B25:${route}:reader-source`, { source, occurrences });
}
/** Keep original external scientific records exact; only the separately reviewed14 are authored here. */
function validateDataApplicabilityCoverage(edition, sources, catalog, accepted, independentDigest = dataApplicabilityAcceptedDigest, catalogProjection = "raw") {
  assertDataApplicabilityRegistration(edition);
  assertDataApplicabilityAccepted(accepted, independentDigest);
  if (!["raw", "public"].includes(catalogProjection)) throw new Error("Data applicability requires explicit raw or public catalog projection");
  const errors = [];
  for (const frozen of accepted.sources) {
    const raw = sources.get(frozen.route);
    if (typeof raw !== "string") {
      errors.push(`Data applicability missing source: ${frozen.route}`);
      continue;
    }
    const { source, occurrences: expectedOccurrences } = reviewedDataApplicabilitySource(accepted, frozen.route);
    const found = inspectDataApplicabilitySource(raw);
    if (!currentBookMdxMatches(frozen.route, frozen.mdxSha256, rawDigest(raw))
        || !sameRecord({ title: found.title, description: found.description, headings: found.headings, ordinary: found.ordinary, figure: found.figure }, { title: source.title, description: source.description, headings: source.headings, ordinary: source.ordinary, figure: source.figure })
        || found.outsideOccurrences.length
        || found.figureCount !== (source.figure ? 1 : 0)
        || !same(found.occurrences, expectedOccurrences)
        || collectChapterClaimOccurrences(raw).length !== expectedOccurrences.length) errors.push(`Data applicability actual MDX/body/navigation/figure differs from reviewed source: ${source.route}`);
  }
  errors.push(...validateDataApplicabilityCatalog(catalog, accepted, catalogProjection));
  return errors;
}
function validateDataApplicabilityCatalog(catalog, accepted, catalogProjection) {
  if (!["raw","public"].includes(catalogProjection)) throw new Error("Data applicability requires explicit raw or public catalog projection");
  const errors = [];
  const groups = [["claims", accepted.claims], ...Object.entries(accepted.scientificClosure)], reference = structuredClone(catalog);
  for (const [kind, records] of groups) {
    const fixed = new Map(records.map((record) => [record.id, record]));
    reference[kind] = [...(reference[kind] ?? []).filter((record) => !fixed.has(record.id)), ...records];
  }
  const expected = catalogProjection === "public" ? publicCatalog(reference) : reference;
  for (const [kind, records] of groups) for (const fixed of records) {
    const found = catalog?.[kind]?.filter((row) => row.id === fixed.id) ?? [], wanted = expected[kind].find((row) => row.id === fixed.id);
    if (found.length !== 1 || !currentBookRecordMatches(kind, wanted, found[0], catalogProjection)) errors.push(`Data applicability reviewed ${kind} record differs: ${fixed.id}`);
  }
  return errors;
}
function dataApplicabilityHeadingEntries() {
  assertDataApplicabilityHeadingOriginal();
  return captured.newNativePrintHeadings.map((row) => ({ route: row.route, path: row.path, id: row.id, targets: [target(row.route, row.path, "heading", row.id)], mode: "retained", edition: { sourceCommit: captured.sourceCommit, sourceDate: "2026-11-09" } }));
}
function originalEntries() {
  assertCitationBaseline(baseline);
  assertCitationHistory(history);
  const placements = { frontMatter: ["/docs", "/docs/book"], notes: [], printAdditions: [] };
  return [...createLegacyCitationEntries(baseline, placements, history.pages), ...createCanonicalCitationEntries(history, placements, baseline.pages.map((page) => page.route))].filter((entry) => dataApplicabilityRoutes.includes(entry.route));
}
const dataApplicabilityOriginalEntries = () => [...originalEntries(), ...dataApplicabilityHeadingEntries()];
function currentPlace(id, print, accepted) {
  if (print) {
    const section = accepted.sections.find((row) => row.claimIds.includes(id));
    if (section) return { route: dataApplicabilityKey, section: section.id };
  } else {
    for (const page of accepted.website) {
      const occurrence = page.occurrences.find((row) => row.id === id);
      if (occurrence) return { route: page.route, section: occurrence.section };
    }
  }
  throw new Error(`Data applicability original proposition has no current destination: ${id}`);
}
function remapDataApplicabilityCitations(entries, accepted, independentDigest = dataApplicabilityAcceptedDigest) {
  assertDataApplicabilityAccepted(accepted, independentDigest);
  const frozen = dataApplicabilityOriginalEntries(), byAddress = new Map(frozen.map((row) => [`${row.path}#${row.id}`, row]));
  if (frozen.length !== 78 || byAddress.size !== 78) throw new Error("Data applicability requires72original plus6actual captured obligations");
  for (const [address, fixed] of byAddress) {
    const found = entries.filter((row) => `${row.path}#${row.id}` === address);
    if (found.length !== 1 || !sameRecord(found[0], fixed)) throw new Error(`Data applicability historical entry missing, repeated or changed: ${address}`);
  }
  for (const entry of entries) if (dataApplicabilityRoutes.includes(entry.route)
      && !byAddress.has(`${entry.path}#${entry.id}`)) throw new Error(`Data applicability unexpected historical entry: ${entry.id}`);
  return entries.map((entry) => {
    if (!byAddress.has(`${entry.path}#${entry.id}`)) return entry;
    const print = entry.path === "/print", route = print ? dataApplicabilityKey : entry.route, path = entry.path, first = entry.targets[0];
    const note = (id) => {
      const where = currentPlace(id, print, accepted), destinationPath = print ? "/print" : where.route;
      return target(where.route, destinationPath, "note", `${location(where.route, destinationPath)}-claim-${id}`, id);
    };
    if (first.kind === "note") {
      const targets2 = entry.targets.map((row) => note(row.claimId)), native = targets2.length === 1 && targets2[0].path === path;
      return { ...entry, route: native ? targets2[0].route : route, targets: targets2, mode: native ? entry.id === targets2[0].id ? "retained" : "alias" : "notice" };
    }
    const sourcePath = `content${entry.route}.mdx`;
    const oldSource = captured.originalSourceHistory.find((row) => row.commit === entry.edition.sourceCommit
        && row.path === sourcePath);
    let scopes = entry.edition.sourceCommit === captured.sourceCommit
      ? captured.sourceSections[entry.route]
      : oldSource?.sectionScopes;
    if (!scopes) throw new Error(`Data applicability historical source identity is unknown: ${entry.id}`);
    const sourceTitle = oldSource?.title ?? /^title:\s*(.+)$/m.exec(original.sourceFiles[sourcePath].text)[1], group = first.kind === "note-group", heading = first.kind === "heading";
    let scope;
    if (heading) {
      const row = captured.newNativePrintHeadings.find((row2) => row2.route === entry.route
          && (first.id === row2.id
          || first.id === row2.id.slice(`${printUnitAnchor(entry.route)}-`.length)));
      scope = scopes.find((item) => item.title === row?.title);
      if (!scope) throw new Error(`Data applicability unmapped original heading: ${entry.id}`);
    } else scope = { claimIds: oldSource?.claimIds ?? collectChapterClaimOccurrences(original.sourceFiles[sourcePath].text) };
    const notes = scope.claimIds.map(note), destinations = unique(scope.claimIds.map((id) => {
      const where = currentPlace(id, print, accepted);
      return JSON.stringify(target(where.route, print ? "/print" : where.route, "heading", `${print ? `${printUnitAnchor(where.route)}-` : ""}${where.section}`));
    })).map((value) => JSON.parse(value));
    const targets = group ? notes : [...destinations, ...notes], text = `原《${sourceTitle}》${heading ? `“${scope.title}”` : group ? "注释组" : "篇章"}的范围由下列原有${notes.length}则注释${group ? "" : "与具名内容位置"}界定；链接保留原命题及原顺序，现行篇章另有其他内容。`;
    const nativeId = group ? `${location(route, path)}-annotations` : heading ? entry.id : location(route, path), retained = entry.id === nativeId
        && (group ? route !== dataApplicabilityKey : heading
        && !print
        && accepted.sources.find((row) => row.route === route)?.headings.some((row) => row.id === entry.id));
    return retained ? { ...entry, route, targets: [target(route, path, first.kind, nativeId)], mode: "retained", scope: { text, targets } } : { ...entry, route, targets, mode: "notice", scope: { text, targets } };
  });
}
/** Only destinations used by this bounded assembly are translated. */
function dataApplicabilityBookHref(href, currentKey) {
  if (typeof href !== "string") return href;
  const [path, fragment] = href.split("#"), route = path.replace(/\/$/, "");
  if (dataApplicabilityRoutes.includes(route)) {
    const section = decodeURIComponent(fragment ?? "");
    if (!section) return `#${printUnitAnchor(dataApplicabilityKey)}`;
    if (dataApplicabilityTitles.includes(section)) return `#${printUnitAnchor(dataApplicabilityKey)}-${section}`;
  }
  if (currentKey === dataApplicabilityKey
      && route === "/docs/book/uncertainty-and-variability"
      && !fragment) return `#${printUnitAnchor(route)}`;
  return href;
}
const headingCopyQualifications = new WeakMap();
const frameworkSvgAttributes = {
  xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
  "stroke-linejoin": "round", "aria-hidden": "true"
};
const copyButtonClass = "inline-flex items-center justify-center rounded-md text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring hover:bg-fd-accent hover:text-fd-accent-foreground p-1 [&_svg]:size-4 not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100";
const copyPathData = [
  "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
  "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
];
function frameworkSvgShape(svg, className, pathData) {
  if (svg?.tagName !== "SVG" || !sameRecord(svg.attributes, { ...frameworkSvgAttributes, class: className })) return false;
  const children = svg.childNodes.filter((node) => node.nodeType === 1);
  return svg.text === "" && children.length === pathData.length
    && children.every((path, index) => path.tagName === "PATH"
      && path.childNodes.length === 0 && sameRecord(path.attributes, { d: pathData[index] }));
}
function dataBodyOwner(unit) {
  const wrappers = unit.querySelectorAll("div").filter((node) => node.getAttribute("class") === "prose flex-1");
  if (!wrappers.length) return unit; // Explicit direct-child fixtures and their known renderer shape.
  if (wrappers.length !== 1 || wrappers[0].parentNode !== unit
      || !sameRecord(wrappers[0].attributes, { class: "prose flex-1" })) return null;
  return wrappers[0];
}
function qualifyHeadingCopyButtons(unit, source) {
  const owner = dataBodyOwner(unit);
  if (!owner) return;
  for (const heading of unit.querySelectorAll("h2")) {
    if (heading.parentNode !== owner || !source.headings.some((row) => row.id === heading.id)) continue;
    const children = heading.childNodes.filter((node) => node.nodeType === 1);
    const [anchor, button] = children;
    if (children.length !== 2 || anchor?.tagName !== "A" || button?.tagName !== "BUTTON"
        || anchor.getAttribute("href") !== `#${heading.id}`
        || !sameRecord(button.attributes, { "aria-live": "polite", class: copyButtonClass })) continue;
    const controls = button.childNodes.filter((node) => node.nodeType === 1);
    if (controls.length !== 2 || !frameworkSvgShape(controls[0], "lucide lucide-link", copyPathData)
        || controls[1].tagName !== "SPAN" || !sameRecord(controls[1].attributes, { class: "sr-only" })
        || controls[1].childNodes.length !== 1 || controls[1].firstChild?.nodeType !== 3
        || controls[1].text !== "复制章节链接" || button.text !== "复制章节链接") continue;
    headingCopyQualifications.set(button, { unit, owner, heading, headingId: heading.id, digest: rawDigest(button.outerHTML) });
  }
}
function trustedHeadingCopyButton(button) {
  const proof = headingCopyQualifications.get(button);
  return !!proof && button.parentNode === proof.heading && proof.heading.parentNode === proof.owner
    && dataBodyOwner(proof.unit) === proof.owner && proof.heading.id === proof.headingId && rawDigest(button.outerHTML) === proof.digest;
}
function trustedFrameworkSvg(svg) {
  if (trustedHeadingCopyButton(svg.parentNode)) return true;
  const footer = svg.closest(".docs-pagination");
  if (!footer || !isVerifiedReaderPagination(footer)) return false;
  const container = svg.parentNode, link = container?.parentNode;
  if (container?.tagName !== "DIV" || link?.tagName !== "A" || link.parentNode !== footer
      || link.querySelectorAll("svg").length !== 1) return false;
  const children = container.childNodes.filter((node) => node.nodeType === 1);
  if (children.length !== 2 || children[0] !== svg || children[1].tagName !== "P") return false;
  return container.getAttribute("class") === "inline-flex items-center gap-1.5 font-medium"
      && frameworkSvgShape(svg, "lucide lucide-chevron-left -mx-1 size-4 shrink-0 rtl:rotate-180", ["m15 18-6-6 6-6"])
    || container.getAttribute("class") === "inline-flex items-center gap-1.5 font-medium flex-row-reverse"
      && frameworkSvgShape(svg, "lucide lucide-chevron-right -mx-1 size-4 shrink-0 rtl:rotate-180", ["m9 18 6-6-6-6"]);
}
/** URL identity remains exact except for one semantic decode of the fragment. */
function ordinaryHrefIdentity(href) {
  if (typeof href !== "string") return null;
  const hash = href.indexOf("#");
  if (hash < 0) return { path: href, hasFragment: false };
  try {
    return { path: href.slice(0, hash), hasFragment: true, fragment: decodeURIComponent(href.slice(hash + 1)) };
  } catch {
    return null;
  }
}
function sameOrdinaryNavigation(actual, expected) {
  const normalize = (rows) => {
    let invalid = false;
    const normalized = rows.map((row) => ({ ...row, links: row.links.map((link) => {
      const href = ordinaryHrefIdentity(link.href);
      if (href === null) invalid = true;
      return { ...link, href };
    }) }));
    return invalid ? null : normalized;
  };
  const found = normalize(actual), wanted = normalize(expected);
  return found !== null && wanted !== null && sameRecord(found, wanted);
}
function concealedByInlineStyle(style) {
  // Normalize only actual opacity numbers and the hidden display/visibility
  // keywords. Caption text cannot establish whether a textless image is visible.
  for (const declaration of style.replace(/\/\*[\s\S]*?\*\//g, "").split(";")) {
    const colon = declaration.indexOf(":");
    if (colon < 0) continue;
    const property = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).replace(/\s*!important\s*$/i, "").trim().toLowerCase();
    if (property === "display" && value === "none") return true;
    if (property === "content-visibility" && value === "hidden") return true;
    const inset = property === "clip-path" && /^inset\(\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))%\s*\)$/.exec(value);
    if (inset && Number(inset[1]) === 100) return true;
    if (property === "visibility" && ["hidden", "collapse"].includes(value)) return true;
    if (property === "opacity" && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%?$/.test(value)
        && Number(value.replace(/%$/, "")) === 0) return true;
  }
  return false;
}
function concealed(node) {
  for (let current = node; current; current = current.parentNode) {
    if (current.hasAttribute?.("hidden")
        || current.getAttribute?.("aria-hidden") === "true"
        || concealedByInlineStyle(current.getAttribute?.("style") ?? "")
        || /(?:^|\s)(?:hidden|invisible)(?:\s|$)/.test(current.getAttribute?.("class") ?? "")
        || /(?:^|\s)opacity-0(?:\s|$)/.test(current.getAttribute?.("class") ?? "") && !trustedHeadingCopyButton(current)
        || /(?:^|\s)sr-only(?:\s|$)/.test(current.getAttribute?.("class") ?? "")
          && !(current.tagName === "SPAN" && trustedHeadingCopyButton(current.parentNode))) return true;
  }
  return false;
}
function concealedText(node) {
  return concealed(node) || (node?.querySelectorAll("*") ?? []).some((child) => child.text.trim() && concealed(child));
}
function headingConcealed(node) {
  return concealedText(node);
}
/** Admit only a direct canonical paragraph or the actual ChapterProse renderer shape. */
function continuationAfterFinalParagraph(paragraph, unit) {
  const owner = dataBodyOwner(unit);
  if (!owner || !paragraph) return null;
  let predecessor = paragraph;
  if (paragraph.parentNode !== owner) {
    const wrapper = paragraph.parentNode;
    if (wrapper?.tagName !== "DIV" || wrapper.parentNode !== owner
        || !sameRecord(wrapper.attributes, { class: "scholarly-prose" })
        || wrapper.childNodes.some(node => node.nodeType === 1 && node.tagName !== "P"
          || node.nodeType === 3 && node.text.trim())
        || wrapper.childNodes.filter(node => node.nodeType === 1).at(-1) !== paragraph) return null;
    predecessor = wrapper;
  }
  const continuation = predecessor.nextElementSibling;
  if (!continuation || continuation.parentNode !== owner) return null;
  const siblings = owner.childNodes, start = siblings.indexOf(predecessor), end = siblings.indexOf(continuation);
  if (siblings.slice(start + 1, end).some(node => node.nodeType === 1 || node.nodeType === 3 && node.text.trim())) return null;
  return continuation;
}
/** Numbering has already been independently verified and normalized by reader-numbering-output. */
function validateRenderedDataApplicability(document, path, catalog, accepted, independentDigest = dataApplicabilityAcceptedDigest, catalogProjection = "public") {
  if (![...dataApplicabilityRoutes, "/print"].includes(path)) return [];
  assertDataApplicabilityAccepted(accepted, independentDigest);
  const print = path === "/print", routes = print ? [dataApplicabilityKey] : [path], errors = validateDataApplicabilityCatalog(catalog, accepted, catalogProjection), entries = applyCurrentHistoricalEntries(document, remapDataApplicabilityCitations(dataApplicabilityOriginalEntries(), accepted, independentDigest));
  if (errors.length) return errors;
  for (const route of routes) {
    const units = print ? document.querySelectorAll(`article[data-reader-route="${route}"]`) : document.querySelectorAll("article");
    if (units.length !== 1) {
      errors.push(`${path}: Data applicability actual reading unit missing/repeated: ${route}`);
      continue;
    }
    const { source, occurrences: expected } = reviewedDataApplicabilitySource(accepted, route === dataApplicabilityKey ? dataApplicabilityManuscript : route);
    const unit = units[0], prefix = location(route, path), checked = /* @__PURE__ */ new Set(), children = unit.childNodes.filter((node) => node.nodeType === 1), title = children.find((node) => node.tagName === (print ? "H2" : "H1"));
    if (!print) qualifyHeadingCopyButtons(unit, source);
    if (!title
        || title.text !== source.title
        || concealedText(title)
        || print
        && unit.getAttribute("data-reader-title") !== source.title) errors.push(`${path}: Data applicability title differs or hidden: ${route}`);
    else checked.add(title);
    const description = title && children[children.indexOf(title) + 1];
    if (description?.tagName !== "P"
        || description.text !== source.description
        || concealedText(description)) errors.push(`${path}: Data applicability description differs or hidden: ${route}`);
    else checked.add(description);
    if (!print) {
      for (const node of children.filter((node2) => node2.tagName === "DIV" && node2.text === "生命周期评价的前世今生")) checked.add(node);
      const pagination = unit.querySelectorAll(".docs-pagination");
      if (pagination.length !== 1 || !isVerifiedReaderPagination(pagination[0])) errors.push(`${path}: Data applicability website pagination lacks independent qualification`);
      else checked.add(pagination[0]);
    }
    const actual = [], headings = [];
    let section = null;
    for (const node of unit.querySelectorAll('h1,h2,h3,h4,h5,h6,a[role="doc-noteref"]')) {
      if (node.closest("[data-legacy-for],[data-legacy-notice],[data-legacy-scope]")) continue;
      if (node.getAttribute("role") === "doc-noteref") {
        const id = node.getAttribute("data-reader-reference"), paragraph = node.closest("p"), found = (catalog.claims ?? []).filter((row) => row.id === id), fixed = accepted.claims.find((row) => row.id === id);
        actual.push({ id, section });
        if (!paragraph
            || found.length !== 1
            || node.getAttribute("href") !== `#${prefix}-claim-${id}`
            || node.text !== `[${expected.findIndex(row => row.id === id) + 1}]`
            || node.getAttribute("aria-label") !== `注 ${expected.findIndex(row => row.id === id) + 1}`
            || readerParagraphText(paragraph, node) !== found[0]?.text
            || !currentBookRecordMatches('claims', fixed, found[0])
            || concealedText(paragraph)) errors.push(`${path}: Data applicability canonical body differs or hidden: ${id}`);
        else checked.add(paragraph);
      } else if (node.closest(".chapter-notes")) {
        section = null;
        if (node.id !== `${prefix}-annotations`
            || node.text !== "注释"
            || node.tagName !== (print ? "H3" : "H2")
            || concealedText(node)) errors.push(`${path}: Data applicability annotation heading differs`);
        else checked.add(node);
      } else if (node !== title) {
        section = print ? node.id.slice(prefix.length + 1) : node.id;
        headings.push({ id: section, title: node.text.replace(/复制章节链接$/, "") });
        if (node.tagName !== (print ? "H3" : "H2") || headingConcealed(node)) errors.push(`${path}: Data applicability content heading differs or hidden`);
        else checked.add(node);
      }
    }
    if (!same(actual, expected) || !same(headings, source.headings)) errors.push(`${path}: Data applicability actual body order/sections differ: ${route}`);
    const ordinary = [];
    let currentSection = null;
    for (const node of unit.querySelectorAll("h1,h2,h3,h4,h5,h6,p,figure")) {
      if (node.closest("[data-legacy-for],[data-legacy-notice],[data-legacy-scope],.chapter-notes,.docs-pagination")) continue;
      if (/^H[1-6]$/.test(node.tagName) && node !== title) currentSection = print ? node.id.slice(prefix.length + 1) : node.id;
      if (node.tagName === "P" && !checked.has(node) && !node.closest("figure") && !node.querySelector('[role="doc-noteref"]')) {
        const row = { section: currentSection, text: node.text, links: node.querySelectorAll("a").map((link) => ({ text: link.text, href: link.getAttribute("href") })) };
        ordinary.push(row);
        if (concealedText(node)) errors.push(`${path}: Data applicability ordinary navigation hidden`);
        else checked.add(node);
      }
    }
    // This chapter admits no scientific image. Captured framework controls are qualified separately.
    if (unit.querySelectorAll("img,figure").length)
      errors.push(`${path}: Data applicability scientific-image roster differs: ${route}`);
    for (const visual of unit.querySelectorAll("svg,canvas,video,iframe,object,embed")) {
      if (visual.tagName !== "SVG" || !trustedFrameworkSvg(visual))
        errors.push(`${path}: Data applicability unreviewed visual element: ${visual.tagName}`);
    }
    if (source.ordinary.length) {
      const finalReference = unit.querySelectorAll('a[role="doc-noteref"]').at(-1), paragraph = finalReference?.closest("p"), continuation = continuationAfterFinalParagraph(paragraph, unit);
      if (finalReference?.getAttribute("data-reader-reference") !== "cl-db2011-conditional-use"
          || continuation?.tagName !== "P" || continuation.text !== source.ordinary[0].text)
        errors.push(`${path}: Data applicability continuation loses actual final-proposition placement`);
    }
    const expectedOrdinary = source.ordinary.map(row => projectOrdinaryReaderNavigation(row, route, print));
    if (!sameOrdinaryNavigation(ordinary, expectedOrdinary)
        || unit.querySelectorAll("figure").length !== (source.figure ? 1 : 0)) errors.push(`${path}: Data applicability reviewed ordinary navigation/figure count differs: ${route}`);
    const notes = unit.querySelectorAll("[data-reader-claim]");
    if (unit.querySelectorAll(".chapter-notes").length !== 1
        || !same(notes.map((node) => node.getAttribute("data-reader-claim")), expected.map((row) => row.id))) errors.push(`${path}: Data applicability exact continuous note plan differs: ${route}`);
    const annotations = validateExchangeAnnotationOutput(document, unit, route, catalog, { print });
    errors.push(...annotations);
    if (!annotations.length) for (const note of notes) {
      const annotation = note.querySelector(".claim-annotation");
      if (concealedText(note) || concealedText(annotation)) errors.push(`${path}: Data applicability annotation hidden`);
      else checked.add(annotation);
    }
    const unitEntries = entries.filter((entry) => entry.path === path && entry.route === route), label = (destination) => {
      const destSource = accepted.sources.find((row) => row.route === (destination.route === dataApplicabilityKey ? dataApplicabilityManuscript : destination.route)), ids = destination.route === dataApplicabilityKey ? accepted.sections.flatMap((row) => row.claimIds) : accepted.website.find((row) => row.route === destination.route)?.claimIds ?? [];
      return `《${destSource?.title}》${destination.kind === "note" ? `注 ${ids.indexOf(destination.claimId) + 1}` : destination.kind === "heading" ? `·${destination.path === "/print" ? destination.id.slice(printUnitAnchor(destination.route).length + 1) : destination.id}` : destination.kind === "note-group" ? "注释" : ""}`;
    };
    for (const entry of unitEntries) {
      if (entry.mode === "notice"
          && unit.querySelectorAll(`[id="${entry.id}"][data-legacy-notice]`).length !== 1) errors.push(`${path}: Data applicability historical notice missing/repeated: ${entry.id}`);
      if (entry.mode === "alias"
          && unit.querySelectorAll(`[id="${entry.id}"][data-legacy-for="${entry.targets[0].id}"]`).length !== 1) errors.push(`${path}: Data applicability historical alias missing/repeated: ${entry.id}`);
      if (entry.mode === "retained" && entry.scope) {
        const contexts = unit.querySelectorAll(`[data-legacy-scope="${entry.id}"]`), context = contexts[0];
        if (contexts.length !== 1
            || !(context.parentNode === unit
            && unit.id === entry.id
            || context.previousElementSibling?.id === entry.id
            && context.parentNode === context.previousElementSibling.parentNode)) errors.push(`${path}: Data applicability native historical subset missing/detached: ${entry.id}`);
      }
    }
    const historical = validateReaderHistoricalText(unit, unitEntries, path, label);
    errors.push(...historical.errors);
    for (const node of historical.checked) {
      if (concealedText(node)) errors.push(`${path}: Data applicability historical context hidden`);
      else checked.add(node);
    }
    if (unaccountedReaderText(unit, checked).length) errors.push(`${path}: Data applicability output contains unexpected unreviewed text: ${route}`);
  }
  return errors;
}
export {
  concealedText,
  qualifyHeadingCopyButtons,
  trustedFrameworkSvg,
  assertDataApplicabilityAccepted,
  assertDataApplicabilityHeadingOriginal,
  assertDataApplicabilityOriginal,
  assertDataApplicabilityRegistration,
  dataApplicabilityAcceptedDigest,
  dataApplicabilityBookHref,
  dataApplicabilityDigest,
  dataApplicabilityHeadingEntries,
  dataApplicabilityKey,
  dataApplicabilityManuscript,
  dataApplicabilityOriginalEntries,
  dataApplicabilityRoutes,
  dataApplicabilityTitle,
  dataApplicabilityTitles,
  inspectDataApplicabilitySource,
  remapDataApplicabilityCitations,
  validateDataApplicabilityCoverage,
  validateRenderedDataApplicability
};
