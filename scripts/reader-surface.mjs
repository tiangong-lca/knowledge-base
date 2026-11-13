import { copyeditHistoryEntries, copyeditHistoryPlan, validateCopyeditHistory } from './reader-copyedit-history.mjs';
import { observeCopyeditHistory } from './reader-copyedit-observation.mjs';
import { readerNumberingManifest } from './reader-numbering.mjs';
import { editionDigest } from './reader-current-edition.mjs';
import { assertReadablePedigreeAccepted, readablePedigreeHeadingEntries, remapReadablePedigreeCitations, validateReadablePedigreeCaseBytes, validateReadablePedigreeCoverage, validateRenderedReadablePedigree } from './reader-readable-pedigree.mjs';
import { assertPmSelectionAccepted, pmSelectionAppendix, pmSelectionCasePaths, pmSelectionHeadingEntries, remapPmSelectionCitations, validatePmSelectionCaseBytes, validatePmSelectionCoverage, validateRenderedPmSelection } from './reader-pm-selection.mjs';
import { assertToxicityPathwaysAccepted, remapToxicityPathwaysCitations, toxicityPathwaysHeadingEntries, validateToxicityPathwaysCoverage, validateRenderedToxicityPathways } from './reader-toxicity-pathways.mjs';
import { assertDataApplicabilityOriginal, assertDataApplicabilityHeadingOriginal, assertDataApplicabilityAccepted, dataApplicabilityHeadingEntries, remapDataApplicabilityCitations, validateDataApplicabilityCoverage, validateRenderedDataApplicability } from './reader-data-applicability.mjs';
import { assertClimateAssemblyOriginal, assertClimateAssemblyHeadingOriginal, assertClimateAssemblyAccepted, validateClimateAssemblyArtifactBytes, climateAssemblyHeadingEntries, remapClimateAssemblyCitations, validateClimateAssemblyCoverage, validateRenderedClimateAssembly } from './reader-climate-assembly.mjs';
import { assertClosingSynthesisOriginal, assertClosingSynthesisHeadingHistory, assertClosingSynthesisProseAccepted, closingSynthesisHeadingEntries, remapClosingSynthesisCitations, validateClosingSynthesisCoverage, validateRenderedClosingSynthesis } from './reader-closing-synthesis.mjs';
import { assertWallSelectionOriginal, assertWallSelectionHeadingHistory, assertWallSelectionAccepted, wallSelectionHeadingEntries, remapWallSelectionCitations, validateWallSelectionCoverage, validateRenderedWallSelection } from './reader-wall-selection.mjs';
import { validateReaderNumberingOutput } from './reader-numbering-output.mjs';
import { assertReaderNumbering } from './reader-numbering.mjs';
import { validateReadableBookCurrent } from './reader-current-edition-files.mjs';
import { qualifyReadableBookCitations } from './reader-current-citations.mjs';
import { validateReadableBookPublicArtifacts, validateReadableBookReviewedOutput } from './reader-current-output.mjs';
import { qualifyCurrentHistoricalDocument, validateCurrentHistoricalContexts } from './reader-publication-text.mjs';
import { assertJointProductionOriginal, assertJointProductionHeadingHistory, assertJointProductionProseAccepted, jointProductionHeadingEntries, remapJointProductionCitations, validateJointProductionCoverage, validateRenderedJointProduction } from './reader-joint-production.mjs';
import { assertHybridInventoryAccepted, assertHybridInventoryHeadingHistory, assertHybridInventoryProseAccepted, hybridInventoryHeadingEntries, remapHybridInventoryCitations, validateHybridInventoryCoverage, validateRenderedHybridInventory } from './reader-hybrid-inventory.mjs';
import { assertExchangeSemanticsOriginal, assertExchangeSemanticsHeadingHistory, assertExchangeSemanticsCitationSources, assertExchangeSemanticsPartialHistory, assertExchangeSemanticsProseAccepted, exchangeSemanticsHeadingEntries, remapExchangeSemanticsCitations, validateExchangeSemanticsCoverage, validateRenderedExchangeSemantics } from './reader-exchange-semantics.mjs';
import { assertProcessNetworkProseAccepted, processNetworkHeadingEntries, remapProcessNetworkCitations, validateProcessNetworkCoverage, validateRenderedProcessNetwork } from './reader-process-network.mjs';
import { assertFunctionalReferenceProseAccepted, functionalReferenceHeadingEntries, remapFunctionalReferenceCitations, validateFunctionalReferenceCoverage, validateRenderedFunctionalReference } from './reader-functional-reference.mjs';
import { cleanerProductionHeadingEntries, remapCleanerProductionCitations, validateCleanerProductionCoverage, validateRenderedCleanerProduction } from './reader-cleaner-production.mjs';
import { access, readdir, readFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { chapterAnchorPrefix, chapterNoteAnchor, printUnitAnchor } from './reader-book.mjs';
import { assertCitationHistory } from './reader-citation-history.mjs';
import { assertCitationBaseline, assertPrintFrontMatter } from './reader-citation-baseline.mjs';
import { citationHref, citationSourceHref, createCurrentPrintRoutes, createLegacyCitationEntries, createCanonicalCitationEntries } from './reader-citations.mjs';
// Use the parser already bundled by the exact Next dependency (16.4.4).
// This internal bundle is intentionally version-coupled and covered by tests;
// there is no additional parser dependency or hand-written HTML stripping.
import { currentEditionKeys, validateFrameworkCoverage, remapBookCitations, publishedHeadingEntries, validateRenderedFrameworkCoverage } from './reader-edition.mjs';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';

const processPatterns = [
  /本\s*轮/g, /本次\s*核读/g, /首版\s*建设/g, /主任务/g, /源码\s*提交/g,
  /待\s*交付/g, /研究\s*进行中/g, /核查\s*日志/g, /检索\s*日志/g, /构建\s*状态/g,
  /当前为\s*AI\s*辅助来源核查稿/gi,
];
const aiExecution = /AI\s*辅助(?:来源)?核查(?:稿)?|来源核查由\s*AI\s*辅助完成/gi;
const machineKeys = new Set(['inputSha256', 'sourceCommit', 'reviewedAt', 'reviewKind', 'caseBinding', 'schemaVersion', 'artifactKind', 'scientificApproval', 'captureMethod', 'readingStatus', 'accessStatus', 'agent-source-check', 'selected-passages', 'not-close-read', 'working-preview']);
const rawHash = /(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/gi;
const caseId = /\bCASE-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;
const localDeveloperPath = value => /^\/(?:_docs|monograph)(?:\/|$)/.test(value);

/** Actual project identities, not a blanket ban on scientific words. */
export function readerInternalIds(...records) {
  const ids = new Set();
  function visit(value, omitLocalScenarioId = false) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(item => visit(item)); return; }
    if (!omitLocalScenarioId && typeof value.id === 'string') ids.add(value.id);
    if (typeof value.caseId === 'string') ids.add(value.caseId);
    for (const [key, child] of Object.entries(value)) {
      // Native execution scenario names (e.g. "zero") identify run-local input
      // profiles, not publication records. Do not ban the same scientific word
      // across unrelated chapters. Nested record/case identities still count.
      if (value.kind === 'author-derived-native-model-execution' && key === 'scenarios' && Array.isArray(child))
        child.forEach(scenario => visit(scenario, true));
      else visit(child);
    }
  }
  records.forEach(record => visit(record));
  return ids;
}

export function validateReaderText(text, { label = 'Reader prose', knownIds = new Set(), allowAIStatement = false } = {}) {
  const errors = [], prose = String(text).normalize('NFKC');
  for (const pattern of processPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(prose);
    if (match) errors.push(`${label}: project-process prose “${match[0]}” belongs in development Markdown`);
  }
  aiExecution.lastIndex = 0;
  if (!allowAIStatement && aiExecution.test(prose)) errors.push(`${label}: general AI review identity belongs once in the edition or print writing statement`);
  const tokens = prose.match(/[A-Za-z][A-Za-z0-9._:-]*/g) ?? [];
  const exposed = new Set();
  for (const token of tokens) {
    const candidates = [token, token.replace(/[.:]+$/, '')];
    for (const candidate of candidates) if (knownIds.has(candidate) || machineKeys.has(candidate)) exposed.add(candidate);
  }
  for (const identity of exposed) errors.push(`${label}: visible internal identifier/key “${identity}” is not a reader label`);
  rawHash.lastIndex = 0; caseId.lastIndex = 0;
  if (rawHash.test(prose)) errors.push(`${label}: a raw SHA-256 is visible as reader prose`);
  if (caseId.test(prose)) errors.push(`${label}: a raw case identifier is visible as reader prose`);
  return errors;
}

/** Rendered claim fields only; acquisition appraisals/records remain internal. */
export function validateReaderClaims(published, knownIds = readerInternalIds(published)) {
  const errors = [];
  for (const claim of published.claims) {
    for (const field of ['text', 'scope']) errors.push(...validateReaderText(claim[field], { label: `claims.${claim.id}.${field}`, knownIds }));
    for (const [index, caveat] of claim.caveats.entries()) errors.push(...validateReaderText(caveat, { label: `claims.${claim.id}.caveats.${index}`, knownIds }));
  }
  return errors;
}

function proseOutsideCode(raw) {
  const blank = text => text.replace(/[^\n]/g, ' ');
  let fence = null;
  let text = raw.split(/(?<=\n)/).map(line => {
    const marker = /^(?: {0,3}>[ \t]?)* {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$/.exec(line);
    if (fence) { if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = null; return blank(line); }
    if (marker && (marker[1][0] !== '`' || !marker[2].includes('`'))) { fence = { char: marker[1][0], length: marker[1].length }; return blank(line); }
    return line;
  }).join('');
  text = text.replace(/(`+)([\s\S]*?)\1(?!`)/g, blank).replace(/<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g, blank);
  return text;
}
export function validateReaderMdx(raw, label, knownIds = new Set()) {
  const text = proseOutsideCode(raw), errors = [];
  for (const match of text.matchAll(/\]\(\s*(\/[^\s)]*)/g)) if (localDeveloperPath(match[1])) errors.push(`${label}: development Markdown must not be a public reading route`);
  const prose = text.replace(/<[^>]*>/g, '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
  return [...errors, ...validateReaderText(prose, { label, knownIds })];
}

/** Inspect decoded DOM text, not embedded RSC/JSON scripts or attribute values. */
export function validateReaderHtml(html, { label = 'HTML', knownIds = new Set(), allowAIStatement = false } = {}) {
  const document = htmlParser.parse(html), errors = [], ids = new Set();
  for (const node of document.querySelectorAll('script,style')) node.remove();
  for (const node of document.querySelectorAll('[id]')) {
    const id = node.getAttribute('id');
    if (ids.has(id)) errors.push(`${label}: duplicate DOM id “${id}” (including print chapter anchors)`);
    ids.add(id);
  }
  // Preserve block boundaries without separating inline spans: textContent alone
  // would concatenate an exposed ID with the next paragraph's first word.
  const prose = document.structuredText;
  errors.push(...validateReaderText(prose, { label, knownIds, allowAIStatement }));
  const aiStatements = prose.match(aiExecution) ?? [];
  if (allowAIStatement && aiStatements.length > 1) errors.push(`${label}: general AI writing identity must appear only once`);
  for (const node of document.querySelectorAll('[aria-label]')) errors.push(...validateReaderText(node.getAttribute('aria-label'), { label: `${label} aria-label`, knownIds }));
  for (const node of document.querySelectorAll('[href],[src]')) {
    const href = node.getAttribute('href') ?? node.getAttribute('src');
    if (localDeveloperPath(href)) errors.push(`${label}: development Markdown must not be served or indexed as a reader route`);
  }
  return errors;
}

export function validateReaderIndex(text) {
  const errors = validateReaderText(text, { label: 'llms.txt' });
  if (/Research register|Literature map|Coverage and gaps|研究工作台|检索协议|\/downloads\/research\.json/i.test(text)) errors.push('llms.txt: advertise the reader bibliography, not the former research workbench/legacy register endpoint');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) if (localDeveloperPath(match[1])) errors.push('llms.txt: development Markdown must not enter the public AI reading index');
  return errors;
}

/** An alias must be inside its destination or immediately before it, so the native fragment scrolls there. */
function aliasDestination(node) {
  const target = node.getAttribute('data-legacy-for');
  if (!target) return null;
  if (node.parentNode?.id === target) return target;
  let sibling = node.nextElementSibling;
  while (sibling?.getAttribute('data-legacy-for') === target) sibling = sibling.nextElementSibling;
  return sibling?.id === target ? target : null;
}

const citationScopeExclusions = '.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope],[data-copyedit-history],.docs-pagination,.reader-view-label,.teaching-case';
const ordinaryCitationBlocks = 'p,ul,ol,dl,blockquote,pre,table,figure';

function nativeCitationScopes(document) {
  const scopes = new Map();
  for (const article of document.querySelectorAll('article[data-reader-route]')) {
    const stack = [];
    const chapter = { claimIds: new Set(), ordinaryHashes: [] };
    for (const node of article.querySelectorAll(`[data-reader-heading-key],[data-reader-section][id],a[role="doc-noteref"],${ordinaryCitationBlocks}`)) {
      if (node.closest(citationScopeExclusions)) continue;
      const key = node.getAttribute('data-reader-heading-key');
      const marker = node.hasAttribute('data-reader-section');
      if (key === '@unit') continue;
      if (key !== undefined || marker) {
        const depth = marker ? 100 : Number(node.tagName.slice(1));
        if (!Number.isInteger(depth)) continue;
        while (stack.length && stack.at(-1).depth >= depth) stack.pop();
        if (!node.id) continue;
        const scope = { claimIds: new Set(), ordinaryHashes: [] };
        scopes.set(node.id, scope);
        stack.push({ depth, scope });
      } else {
        const active = [chapter, ...stack.map(row => row.scope)];
        const id = node.getAttribute('data-reader-reference');
        if (id) {
          for (const scope of active) scope.claimIds.add(id);
        } else if (!node.querySelector('a[role="doc-noteref"]')
            && !node.parentNode?.closest(ordinaryCitationBlocks)) {
          const links = node.querySelectorAll('a[href]').map(link => [link.text, link.getAttribute('href')]);
          const text = node.text.replace(/\s+/g, ' ').trim();
          if (!text) continue;
          const digest = editionDigest({ tag: node.tagName, text, links });
          for (const scope of active) scope.ordinaryHashes.push(digest);
        }
      }
    }
    if (article.id) scopes.set(article.id, chapter);
    for (const group of article.querySelectorAll('.chapter-notes')) {
      const id = group.getAttribute('aria-labelledby');
      if (id) scopes.set(id, {
        claimIds: new Set(group.querySelectorAll('li[data-reader-claim]').map(note => note.getAttribute('data-reader-claim'))),
        ordinaryHashes: [],
      });
    }
  }
  return scopes;
}

export function readCitationSurface(document, path) {
  const ids = new Map();
  const errors = [];
  const noteNumbers = new Map(), nativeScopes = nativeCitationScopes(document);
  for (const section of document.querySelectorAll('.chapter-notes')) {
    const route = path === '/print' ? section.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    if (!route) {
      errors.push(`${path}: notes have no printed unit`);
      continue;
    }
    const prefix = path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route);
    const list = section.querySelector('ol');
    for (const [index, note] of (list?.childNodes.filter(node => node.tagName === 'LI') ?? []).entries()) {
      const claimId = note.getAttribute('data-reader-claim');
      if (!claimId || note.id !== chapterNoteAnchor(prefix, claimId)) errors.push(`${path}: note ${note.id} lacks a stable claim identity`);
      noteNumbers.set(note.id, index + 1);
    }
  }
  const cited = new Set(), bodyClaims = new Map();
  for (const marker of document.querySelectorAll('a[role="doc-noteref"]')) {
    const href = marker.getAttribute('href') ?? '';
    const claimId = marker.getAttribute('data-reader-reference');
    const route = path === '/print' ? marker.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const prefix = route && (path === '/print' ? printUnitAnchor(route) : chapterAnchorPrefix(route));
    const occurrences = bodyClaims.get(route) ?? []; occurrences.push(claimId); bodyClaims.set(route,occurrences);
    const number = href.startsWith('#') ? noteNumbers.get(href.slice(1)) : null;
    if (!prefix || !claimId || href !== `#${chapterNoteAnchor(prefix, claimId)}` || !number
      || marker.text !== `[${number}]` || marker.getAttribute('aria-label') !== `注 ${number}`)
      errors.push(`${path}: note marker does not match its local endnote ${href}`);
    else cited.add(href.slice(1));
  }
  for (const id of noteNumbers.keys()) if (!cited.has(id)) errors.push(`${path}: unreferenced chapter note ${id}`);

  const scopedContexts = new Map();
  for (const scope of document.querySelectorAll('[data-legacy-scope]')) {
    const id = scope.getAttribute('data-legacy-scope'), list = scopedContexts.get(id) ?? [];
    list.push(scope); scopedContexts.set(id, list);
  }
  for (const node of document.querySelectorAll('[id]')) {
    const claimId = node.getAttribute('data-reader-claim');
    const route = path === '/print' ? node.closest('article[data-reader-route]')?.getAttribute('data-reader-route') : path;
    const notice = node.hasAttribute('data-legacy-notice');
    const alias = aliasDestination(node);
    const context = notice || alias ? node.querySelector('.legacy-citation-context') : null;
    const edition = context?.querySelector('a')?.getAttribute('href');
    const date = context?.querySelector('time');
    const editionDate = date && date.text === date.getAttribute('datetime') ? date.text : null;
    const links = notice ? node.querySelectorAll('a[data-legacy-destination]').map(link => link.getAttribute('href')) : [];
    const section = /^H[1-6]$/.test(node.tagName) || node.getAttribute('data-reader-section') === node.id;
    if (ids.has(node.id)) errors.push(`${path}: duplicate citation surface ID ${node.id}`);
    const title = path === '/print' ? node.closest('article[data-reader-route]')?.getAttribute('data-reader-title') : document.querySelector('h1')?.text;
    const scopeNodes = scopedContexts.get(node.id) ?? [];
    const scope = scopeNodes.length === 1 ? scopeNodes[0] : null;
    const scopeLink = scope?.querySelector('a');
    const scopeDate = scope?.querySelector('time');
    ids.set(node.id, { claimIds: [...(nativeScopes.get(node.id)?.claimIds ?? (claimId ? [claimId] : []))],
      ordinaryHashes: nativeScopes.get(node.id)?.ordinaryHashes ?? [],
      visibleHeading: /^H[1-6]$/.test(node.tagName)
        ? (node.querySelector('[data-reader-heading-title]')?.text ?? node.text.replace(/复制章节链接$/, '')) : null,
      scopeAttached: scope && (node.tagName === 'ARTICLE' ? scope.parentNode === node : scope.previousElementSibling === node && scope.parentNode === node.parentNode), scopeCount: scopeNodes.length, scopeText: scope?.text, scopeEdition: scopeLink?.getAttribute('href'), scopeDate: scopeDate?.text === scopeDate?.getAttribute('datetime') ? scopeDate?.text : null, scopeLinks: scope?.querySelectorAll('a[data-legacy-scope-destination]').map(link=>link.getAttribute('href')), noticeText: context?.text, title, route, claimId, section, tag: node.tagName, notice, alias, edition, editionDate, links, number: noteNumbers.get(node.id) });
  }
  const printOrder = path === '/print' ? document.querySelectorAll('article[data-reader-route]').map(article => article.getAttribute('data-reader-route')) : [];
  const noteLinks = document.querySelectorAll('a[href]').map(link=>({href:link.getAttribute('href'),label:link.text})).filter(link=>/-claim-[A-Za-z0-9]/.test(link.href) && /注\s*\d+/.test(link.label));
  return { ids, errors, printOrder, noteLinks, bodyClaims };
}

/** Verify native source-subset context independently of the target's existence. */
function matchesCapturedScope(source, entry) {
  const captured = entry.currentCapturedScope ?? entry.capturedScope;
  if (!captured || !source) return !captured;
  return JSON.stringify(source.claimIds) === JSON.stringify(captured.claimIds)
    && JSON.stringify(source.ordinaryHashes) === JSON.stringify(captured.ordinaryHashes ?? [])
    && (entry.targets[0]?.kind !== 'heading' || source.visibleHeading === captured.title)
    && (!['chapter', 'note-group'].includes(entry.targets[0]?.kind) || source.title === captured.title);
}

export function validateHistoricalScope(source, entry, address = `${entry.path}/#${entry.id}`) {
  if (!entry.scope) {
    if (entry.mode === 'retained' && entry.capturedScope
        && !matchesCapturedScope(source, entry))
      return [`${address}: old ${entry.capturedScope.title} scope changed without a reviewed migration`];
    return [];
  }
  if (entry.mode === 'retained') {
    if (!source.scopeAttached || source.scopeCount !== 1 || !source.scopeText?.includes(entry.scope.text)
      || source.scopeEdition !== citationSourceHref(entry.edition.sourceCommit) || source.scopeDate !== entry.edition.sourceDate
      || JSON.stringify(source.scopeLinks) !== JSON.stringify(entry.scope.targets.map(target => citationHref(target, entry.path))))
      return [`${address}: missing or changed exact retained source-subset context`];
  } else if (!source.noticeText?.includes(entry.scope.text)) return [`${address}: missing exact relocated source-subset explanation`];
  return [];
}

export function getHistoricalCitationEntries(sourceBaseline, locations, history, historicPrintRoutes, book) {
  let entries = [...createLegacyCitationEntries(sourceBaseline, locations, history?.pages),
    ...(history ? createCanonicalCitationEntries(history, locations, historicPrintRoutes) : [])];
  if (book) entries = remapDataApplicabilityCitations(remapClimateAssemblyCitations(remapClosingSynthesisCitations(remapWallSelectionCitations(remapJointProductionCitations(remapHybridInventoryCitations(remapExchangeSemanticsCitations(remapProcessNetworkCitations(remapFunctionalReferenceCitations(remapCleanerProductionCitations(remapBookCitations(
    [...entries,...publishedHeadingEntries(book.headingHistory),...cleanerProductionHeadingEntries(book.cleanerHeadingHistory),...functionalReferenceHeadingEntries(book.functionalHeadings),...processNetworkHeadingEntries(book.processHeadings),...exchangeSemanticsHeadingEntries(book.exchangeHeadings),...hybridInventoryHeadingEntries(book.hybridHeadings),...jointProductionHeadingEntries(book.jointHeadings),...wallSelectionHeadingEntries(book.wallHeadings),...closingSynthesisHeadingEntries(book.closingHistory),...climateAssemblyHeadingEntries(),...dataApplicabilityHeadingEntries()],book.edition,book.accepted,locations),book.cleanerAccepted,book.cleanerHeadingHistory),book.functionalAccepted,book.functionalHeadings),book.processAccepted,book.processHeadings),book.exchangeOriginal,book.exchangeHeadings,book.exchangePartial,book.exchangeCitations),book.hybridAccepted,book.hybridHeadings),book.jointOriginal,book.jointHeadings,book.jointProse),book.wallOriginal,book.wallHeadings,book.wallAccepted),book.closingHistory,book.closingProse),book.climateAccepted),book.dataAccepted);
  if (book) {
    entries = remapToxicityPathwaysCitations([...entries, ...toxicityPathwaysHeadingEntries()],book.toxicityAccepted);
    entries = remapReadablePedigreeCitations([...entries, ...readablePedigreeHeadingEntries()], book.pedigreeAccepted);
    entries = remapPmSelectionCitations([...entries, ...pmSelectionHeadingEntries()], book.pmAccepted);
    if (book.hostedHistory) entries = qualifyReadableBookCitations(entries, book.hostedHistory, book.current?.migrations);
  }
  return entries;
}

export function validateReadableBookOrdinaryDestinations(pages, entry, address) {
  const errors = [];
  for (const row of entry.ordinaryDispositions ?? []) {
    for (const destination of row.destinations) {
      const target = (entry.scope?.targets ?? entry.targets).find(item => `${item.path}#${item.id}` === destination.address);
      const actual = target && pages.get(target.path)?.ids.get(target.id);
      if (!actual || (destination.currentSha256
        ? !actual.ordinaryHashes.includes(destination.currentSha256)
        : !actual.claimIds.includes(destination.claimId))) {
        errors.push(`${address}: actual ordinary-content destination differs: ${destination.address}`);
      }
    }
  }
  return errors;
}

async function validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, validateArtifacts) {
  const numbered = book ? await validateReaderNumberingOutput(root,{sources:book.sources,edition:book.edition}) : null;
  if (numbered?.errors.length) return numbered.errors;
  const sourceRoutes = availableRoutes ?? [...sourceBaseline.pages.map(page => page.route), ...(locations.printAdditions ?? []).map(page => page.route)];
  const printRoutes = book ? currentEditionKeys(book.edition, sourceRoutes, sourceBaseline, locations) : createCurrentPrintRoutes(sourceBaseline, locations, sourceRoutes);
  const historicPrintRoutes = book ? [...sourceBaseline.pages.filter(page=>page.printOrdinal!==undefined).map(page=>page.route),...locations.frontMatter,...(locations.printAdditions??[]).map(unit=>unit.route)] : printRoutes;
  const copyedit = copyeditHistoryPlan(book?.current?.copyedit);
  const entries = copyeditHistoryEntries(getHistoricalCitationEntries(sourceBaseline, locations, history, historicPrintRoutes, book), copyedit);
  const addresses = new Set();
  for (const entry of entries) {
    const address = `${entry.path}#${entry.id}`;
    if (addresses.has(address)) throw new Error(`Duplicate historical citation address: ${address}`);
    addresses.add(address);
  }
  const pages = new Map(), documents = new Map();
  const errors = book ? [
    ...validateReadableBookReviewedOutput(book.current, numbered?.documents, book.sources, book.edition, book.catalog, book.readings),
    ...await validateArtifacts(root, book.current, book),
  ] : [];
  for (const path of new Set([...sourceBaseline.pages.map(page => page.route), ...(history?.pages ?? []).map(page => page.route), ...(locations.printAdditions ?? []).map(page => page.route), ...(book ? [...numbered.documents.keys(), pmSelectionAppendix, ...entries.flatMap(entry => [entry.path, ...entry.targets.map(target => target.path), ...entry.scope?.targets?.map(target => target.path) ?? []])] : []), '/print'])) {
    const html = await readFile(join(root, path.slice(1), 'index.html'), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (html === null) {
      errors.push(`${path}: missing legacy reader route`);
      continue;
    }
    const document = numbered ? numbered.documents.get(path) : htmlParser.parse(html);
    if (!document) { errors.push(`${path}: missing independently verified numbered semantic document`); continue; }
    documents.set(path, document);
    const surface = readCitationSurface(document, path);
    if (!surface.ids.has('main-content')) errors.push(`${path}: missing main-content fragment`);
    pages.set(path, surface);
    errors.push(...surface.errors);
  }
  if (copyedit) {
    const copyeditErrors = validateCopyeditHistory(documents,
      observeCopyeditHistory(documents, readerNumberingManifest, readCitationSurface), copyedit, book.current.copyedit.printParts);
    errors.push(...copyeditErrors);
    // Article fingerprints already checked the complete normalized output.
    // Earlier chapter predicates inspect a prose projection after the new
    // historical apparatus has independently passed its exact DOM checks.
    if (!copyeditErrors.length) for (const document of documents.values()) {
      for (const notice of document.querySelectorAll('[data-copyedit-history]')) notice.remove();
    }
  }
  for (const [path, document] of documents) {
    qualifyCurrentHistoricalDocument(document, entries, book?.current?.migrations, pages);
    if (book?.current?.migrations?.length)
      errors.push(...validateCurrentHistoricalContexts(document, entries, path));
    if (book) errors.push(...validateRenderedDataApplicability(document,path,book.catalog,book.dataAccepted,undefined,"raw"), ...validateRenderedClimateAssembly(document,path,book.catalog,book.climateAccepted), ...validateRenderedClosingSynthesis(document,path,book.catalog,book.closingProse,book.closingHistory), ...validateRenderedWallSelection(document,path,book.wallOriginal,book.catalog,book.wallAccepted), ...validateRenderedJointProduction(document,path,book.jointOriginal,book.catalog,book.jointProse), ...validateRenderedCleanerProduction(document,path,book.cleanerAccepted,book.catalog), ...validateRenderedFunctionalReference(document,path,book.functionalAccepted,book.catalog,book.functionalProse), ...validateRenderedProcessNetwork(document,path,book.processAccepted,book.catalog,book.processProse), ...validateRenderedExchangeSemantics(document,path,book.exchangeOriginal,book.catalog,book.exchangeProse,book.exchangePartial), ...validateRenderedHybridInventory(document,path,book.hybridAccepted,book.catalog,book.hybridProse));
    if (book) {
      errors.push(...validateRenderedToxicityPathways(document,path,book.catalog,book.toxicityAccepted));
      errors.push(...validateRenderedReadablePedigree(document, path, book.catalog, book.pedigreeAccepted, undefined, book.readings));
      errors.push(...validateRenderedPmSelection(document, path, book.catalog, book.pmAccepted));
    }
  }
  const print = pages.get('/print');
  if (print) {
    if (JSON.stringify(print.printOrder) !== JSON.stringify(printRoutes)) errors.push('/print: printed unit order differs from the explicit current reading edition');
    for (const id of ['writing-note', 'print-references']) if (!print.ids.has(id)) errors.push(`/print: missing ${id} fragment`);
  }

  for (const entry of entries) {
    const address = `${entry.path}/#${entry.id}`;
    const page = pages.get(entry.path);
    if (!page) continue;
    const source = page.ids.get(entry.id);
    if (!source) {
      errors.push(`${address}: missing old citation target`);
      continue;
    }
    if (entry.mode !== 'retained' && (source.edition !== citationSourceHref(entry.edition.sourceCommit) || source.editionDate !== entry.edition.sourceDate))
      errors.push(`${address}: missing exact edition context`);
    if (entry.mode === 'alias' && source.alias !== entry.targets[0].id) errors.push(`${address}: alias does not land at its destination`);
    if (entry.mode === 'notice') {
      const expected = entry.targets.map(target => citationHref(target, entry.path));
      if (!source.notice || JSON.stringify(source.links) !== JSON.stringify(expected)) errors.push(`${address}: migration notice has the wrong native links`);
    }
    errors.push(...validateHistoricalScope(source, entry, address));
    errors.push(...validateReadableBookOrdinaryDestinations(pages, entry, address));
    for (const target of [...entry.targets, ...(entry.scope?.targets ?? [])]) {
      const actual = pages.get(target.path)?.ids.get(target.id);
      const semanticMatch = actual?.route === target.route && (
        target.kind === 'note' ? actual.tag === 'LI' && actual.claimId === target.claimId && actual.number :
        target.kind === 'chapter' ? actual.tag === 'ARTICLE' :
        target.kind === 'note-group' ? /^H[23]$/.test(actual.tag) : actual.section);
      if (!semanticMatch) errors.push(`${address}: wrong or missing ${target.kind} destination ${target.path}/#${target.id}`);
      if (entry.mode === 'alias' && !entry.scope && entry.capturedScope
          && !matchesCapturedScope(actual, entry))
        errors.push(`${address}: old ${entry.capturedScope.title} aliased scope changed without a reviewed migration`);

    }
  }
  // Every displayed cross-unit note label must use the actual destination plan.
  for (const [path, surface] of pages) for (const link of surface.noteLinks) {
    const match = /^(?:([^#]+?)\/?)?#(.+)$/.exec(link.href);
    if (!match) continue;
    const destinationPath = match[1]?.replace(/\/$/,'') || path;
    const actual = pages.get(destinationPath)?.ids.get(decodeURIComponent(match[2]));
    const number = /注\s*(\d+)/.exec(link.label)?.[1];
    if (!actual?.number || Number(number)!==actual.number) errors.push(`${path}: wrong or missing destination note label ${link.href}`);
    const title = /^《(.+?)》注/.exec(link.label)?.[1];
    if (title && actual?.title && title !== actual.title) errors.push(`${path}: wrong destination note title ${link.href}`);
  }
  if (book?.sources) {
    errors.push(...validatePmSelectionCoverage(book.edition, book.sources, book.catalog, book.pmAccepted, undefined, { readings: book.readings, literature: book.literature }));
    errors.push(...validateToxicityPathwaysCoverage(book.edition,book.sources,book.catalog,book.toxicityAccepted,undefined,{ readings:book.readings, literature:book.literature }));
    errors.push(...validateDataApplicabilityCoverage(book.edition,book.sources,book.catalog,book.dataAccepted));
    errors.push(...validateClimateAssemblyCoverage(book.edition,book.sources,book.catalog,book.climateAccepted));
    errors.push(...validateReadablePedigreeCoverage(book.edition, book.sources, book.catalog, book.pedigreeAccepted, undefined, 'raw', book.readings));
    errors.push(...validateClosingSynthesisCoverage(book.edition,book.sources,book.catalog,book.closingProse,undefined,'raw',undefined,undefined,book.toxicityAccepted,undefined,book.pedigreeAccepted));
    errors.push(...validateWallSelectionCoverage(book.edition,book.sources,book.wallOriginal,book.catalog,book.wallAccepted));
    errors.push(...validateJointProductionCoverage(book.edition,book.sources,book.jointOriginal,book.catalog,book.jointProse));
    errors.push(...validateFrameworkCoverage(book.edition,book.sources,book.accepted));
    errors.push(...validateCleanerProductionCoverage(book.edition,book.sources,book.cleanerAccepted,book.catalog));
    errors.push(...validateFunctionalReferenceCoverage(book.edition,book.sources,book.functionalAccepted,book.catalog,book.functionalProse));
    errors.push(...validateHybridInventoryCoverage(book.edition,book.sources,book.hybridAccepted,book.catalog,book.hybridProse));
    errors.push(...validateProcessNetworkCoverage(book.edition,book.sources,book.processAccepted,book.catalog,book.processProse));
    errors.push(...validateExchangeSemanticsCoverage(book.edition,book.sources,book.exchangeOriginal,book.catalog,book.exchangeProse,book.exchangePartial));
  }
  if (book && print) errors.push(...validateRenderedFrameworkCoverage(print.bodyClaims,book.accepted));
  return errors;
}

export function validateLegacyCitationOutput(root, sourceBaseline, locations, availableRoutes = null, history = null, book = null) {
  return validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, validateReadableBookPublicArtifacts);
}

export function validateCopyeditPreviewOutput(root, sourceBaseline, locations, availableRoutes, history, book) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1' || basename(root) !== '.reader-review-output' || !book.current?.copyedit)
    throw new Error('Expected isolated reader copyedit preview output');
  return validateCitationOutput(root, sourceBaseline, locations, availableRoutes, history, book, () => []);
}

async function validatePublicationOutput(root, { knownIds = new Set(), sourceCommit }, requireCurrent) {
  const errors = [];
  let bookOutput = false;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), label = relative(root, path).replaceAll('\\', '/');
      if (entry.name === '_docs') { errors.push(`${label}: development Markdown must remain outside public output`); continue; }
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const html = await readFile(path, 'utf8');
        if (label.startsWith('docs/book/') || (label === 'print/index.html' && /<article[^>]+class="print-chapter\b/.test(html))) bookOutput = true;
        errors.push(...validateReaderHtml(html, { label, knownIds, allowAIStatement: label === 'changes/index.html' || label === 'print/index.html' }));
      }
      else if (entry.isFile() && entry.name === 'llms.txt') errors.push(...validateReaderIndex(await readFile(path, 'utf8')));
      else if (!entry.isFile()) errors.push(`${label}: unexpected public output entry`);
    }
  }
  await visit(root);
  // A standalone exporter fixture may have no book. A partial or cached book export still needs both files.
  const config = resolve(root, '..', 'config');
  const bookSource = await access(resolve(root, '..', 'content', 'docs', 'book', 'meta.json')).then(() => true, error => {
    if (error.code !== 'ENOENT') throw error;
    return false;
  });
  const [baseline, placements, history] = await Promise.all(['citation-baseline.json', 'citation-placements.json', 'citation-history.json'].map(async file => {
    const raw = await readFile(join(config, file), 'utf8').catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    return raw === null ? null : JSON.parse(raw);
  }));
  const numberingArtifact = await readFile(join(config,'reader-numbering.json'),'utf8').then(JSON.parse,error=>{if(error.code==='ENOENT')return null;throw error;});
  if (numberingArtifact) assertReaderNumbering(numberingArtifact);
  if (baseline && placements) {
    assertCitationBaseline(baseline);
    assertPrintFrontMatter(placements.frontMatter);
    if (history) assertCitationHistory(history);
    const sourceDirectory = resolve(root, '..', 'content', 'docs');
    const sourceRoutes = [];
    async function discover(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await discover(path);
        else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
          const slug = relative(sourceDirectory, path).replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/(?:^|\/)index$/, '');
          sourceRoutes.push(`/docs${slug ? `/${slug}` : ''}`);
        }
      }
    }
    const hasReaderSource = await access(sourceDirectory).then(() => true, error => {
      if (error.code !== 'ENOENT') throw error;
      return false;
    });
    if (hasReaderSource) await discover(sourceDirectory);
    const readConfig = async file => readFile(join(config,file),'utf8').then(JSON.parse,error=>{if(error.code==='ENOENT')return null;throw error;});
    const [edition,accepted,headingHistory,cleanerAccepted,cleanerHeadingHistory,functionalAccepted,functionalHeadings,functionalProse,processAccepted,processHeadings,processProse] = await Promise.all(['book-edition.json','framework-accepted.json','framework-heading-history.json','cleaner-production-accepted.json','cleaner-production-heading-history.json','functional-reference-accepted.json','functional-reference-heading-history.json','functional-reference-prose-accepted.json','process-network-accepted.json','process-network-heading-history.json','process-network-prose-accepted.json'].map(readConfig));
    const dataAccepted = await readConfig('data-applicability-accepted.json');
    const climateAccepted = await readConfig('climate-assembly-accepted.json');
    const toxicityAccepted = await readConfig('toxicity-pathways-accepted.json');
    const pedigreeAccepted = await readConfig('readable-pedigree-accepted.json');
    const pmAccepted = await readConfig('pm-selection-accepted.json');
    const [closingHistory,closingProse] = await Promise.all(['heading-history','prose-accepted'].map(name=>readConfig(`closing-synthesis-${name}.json`)));
    const [jointOriginal,jointHeadings,jointProse] = await Promise.all(['original','heading-history','prose-accepted'].map(name=>readConfig(`joint-production-${name}.json`)));
    const [wallOriginal,wallHeadings,wallAccepted] = await Promise.all(['original','heading-history','accepted'].map(name=>readConfig(`wall-selection-${name}.json`)));
    const [hybridAccepted,hybridHeadings,hybridProse] = await Promise.all(['accepted','heading-history','prose-accepted'].map(name=>readConfig(`hybrid-inventory-${name}.json`)));
    const [exchangeOriginal,exchangeHeadings,exchangeCitations,exchangePartial,exchangeProse] = await Promise.all(["original","heading-history","citation-sources","partial-history","prose-accepted"].map(name=>readConfig(`exchange-semantics-${name}.json`)));
    let book = null;
    if (edition || accepted || headingHistory || cleanerAccepted || cleanerHeadingHistory || bookOutput || numberingArtifact) {
      if (!edition || !accepted || !headingHistory || !cleanerAccepted || !cleanerHeadingHistory || !functionalAccepted || !functionalHeadings || !functionalProse || !processAccepted || !processHeadings || !processProse || !exchangeOriginal || !exchangeHeadings || !exchangeCitations || !exchangePartial || !exchangeProse) throw new Error('Book edition requires its accepted proposition and published heading inventories');
      const missingHybrid = [['accepted',hybridAccepted],['heading-history',hybridHeadings],['prose-accepted',hybridProse]].filter(([,value])=>!value).map(([name])=>`hybrid-inventory-${name}.json`);
      if (missingHybrid.length) throw new Error(`Book edition requires its independent B09 original, captured-heading and final-prose inventories; missing: ${missingHybrid.join(', ')}`);
      assertHybridInventoryAccepted(hybridAccepted); assertHybridInventoryHeadingHistory(hybridHeadings); assertHybridInventoryProseAccepted(hybridProse);
      const missingJoint = [['original',jointOriginal],['heading-history',jointHeadings],['prose-accepted',jointProse]].filter(([,value])=>!value).map(([name])=>`joint-production-${name}.json`);
      if (missingJoint.length) throw new Error(`Book edition requires its independent B10 original, actual capture and final-prose inventories; missing: ${missingJoint.join(', ')}`);
      assertJointProductionOriginal(jointOriginal); assertJointProductionHeadingHistory(jointHeadings); assertJointProductionProseAccepted(jointProse);
      const missingWall = [['original',wallOriginal],['heading-history',wallHeadings],['accepted',wallAccepted]].filter(([,value])=>!value).map(([name])=>`wall-selection-${name}.json`);
      if (missingWall.length) throw new Error(`Book edition requires its wall original, captured headings and final selection; missing: ${missingWall.join(', ')}`);
      assertWallSelectionOriginal(wallOriginal); assertWallSelectionHeadingHistory(wallHeadings); assertWallSelectionAccepted(wallAccepted);
      assertDataApplicabilityOriginal(); assertDataApplicabilityHeadingOriginal(); assertDataApplicabilityAccepted(dataAccepted);
      assertClimateAssemblyOriginal(); assertClimateAssemblyHeadingOriginal(); assertClimateAssemblyAccepted(climateAccepted);
      errors.push(...validateClimateAssemblyArtifactBytes({figure:await readFile(join(root,'book-figures/climate-response-and-integral.svg')),input:await readFile(resolve(root,'..','knowledge/cases/climate-metrics-v1.json'))}));
      assertClosingSynthesisOriginal(); assertClosingSynthesisHeadingHistory(closingHistory); assertClosingSynthesisProseAccepted(closingProse);
      const sources = new Map();
      async function discoverRaw(directory,prefix) {
        for (const entry of await readdir(directory,{withFileTypes:true})) {
          const path=join(directory,entry.name);
          if(entry.isDirectory())await discoverRaw(path,`${prefix}/${entry.name}`);
          else if(entry.isFile()&&/\.mdx?$/.test(entry.name)) {
            const route=`${prefix}/${entry.name.replace(/\.mdx?$/,'')}`.replace(/\/index$/,'');
            sources.set(route,await readFile(path,'utf8'));
          }
        }
      }
      await discoverRaw(sourceDirectory,'/docs');
      const manuscriptDirectory=resolve(root,'..','content','monograph');
      await discoverRaw(manuscriptDirectory,'/monograph');
      const catalog = JSON.parse(await readFile(resolve(root,'..','knowledge','catalog.json'),'utf8'));
      assertFunctionalReferenceProseAccepted(functionalProse);
      assertProcessNetworkProseAccepted(processProse);
      assertExchangeSemanticsOriginal(exchangeOriginal); assertExchangeSemanticsHeadingHistory(exchangeHeadings); assertExchangeSemanticsCitationSources(exchangeCitations); assertExchangeSemanticsPartialHistory(exchangePartial); assertExchangeSemanticsProseAccepted(exchangeProse);
      assertToxicityPathwaysAccepted(toxicityAccepted);
      assertPmSelectionAccepted(pmAccepted);
      const pmCaseBytes = Object.fromEntries(await Promise.all(pmSelectionCasePaths.map(async path => [path, await readFile(resolve(root, '..', path))])));
      errors.push(...validatePmSelectionCaseBytes(pmCaseBytes, pedigreeAccepted));
      assertReadablePedigreeAccepted(pedigreeAccepted);
      const [pedigreeInput, pedigreePublication] = await Promise.all([
        readFile(resolve(root, '..', 'knowledge/cases/pedigree-calibration-v1.json')),
        readFile(resolve(root, '..', 'knowledge/cases/pedigree-calibration-v1.publication.json')),
      ]);
      errors.push(...validateReadablePedigreeCaseBytes(pedigreeAccepted, { input: pedigreeInput, publication: pedigreePublication }));
      const [readings,literature]=await Promise.all(['readings','literature-map'].map(async name=>JSON.parse(await readFile(resolve(root,'..','knowledge','research',name+'.json'),'utf8'))));
      const sourceRoot = resolve(root, '..');
      let current, hostedHistory;
      if (requireCurrent) {
        current = await validateReadableBookCurrent(sourceRoot, catalog, readings, literature);
        hostedHistory = await readConfig('readable-book-hosted-history.json');
        if (!hostedHistory) throw new Error('Current reader publication requires its verified hosted history');
        errors.push(...current.errors);
      }
      book={current,hostedHistory,sourceCommit,pmAccepted,toxicityAccepted,pedigreeAccepted,readings,literature,dataAccepted,climateAccepted,closingHistory,closingProse,wallOriginal,wallHeadings,wallAccepted,jointOriginal,jointHeadings,jointProse,hybridAccepted,hybridHeadings,hybridProse,edition,accepted,headingHistory,cleanerAccepted,cleanerHeadingHistory,functionalAccepted,functionalHeadings,functionalProse,processAccepted,processHeadings,processProse,exchangeOriginal,exchangeHeadings,exchangeCitations,exchangePartial,exchangeProse,sources,catalog};
      sourceRoutes.splice(0,sourceRoutes.length,...sources.keys());
    }
    errors.push(...await validateLegacyCitationOutput(root, baseline, placements, hasReaderSource ? sourceRoutes : null, history,book));
    if (!history) errors.push('The book export requires the historical canonical citation inventory');
  } else if (baseline || placements || history || bookSource || bookOutput || numberingArtifact) errors.push('The book export requires both the reader citation baseline and placement files');
  if (requireCurrent && (!bookOutput || !baseline || !placements || !history || !numberingArtifact)) errors.push('Current reader publication requires its actual numbered book output');
  return [...new Set(errors)];
}

export const validateReaderOutput = (root, options = {}) => validatePublicationOutput(root, options, true);
export const validateReaderOutputFixture = (root, options = {}) => validatePublicationOutput(root, options, false);
