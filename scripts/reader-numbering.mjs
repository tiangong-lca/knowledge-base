import { createHash } from 'node:crypto';
import { Fragment, isValidElement } from 'react';
import { printUnitAnchor } from './reader-book.mjs';
import numbering from '../config/reader-numbering.json' with { type: 'json' };

/** @typedef {{key:string,source:string,kind:string,title:string,part?:number,label:string|null,prefix:string|null,ordinal:number|null,partLabel:string|null,partTitle?:string|null}} NumberingUnit */
/** @typedef {{key:string,id?:string,title:string,depth:number,type:string,number:string}} HeadingNumber */

const routeKey = value => typeof value === 'string' ? value.replace(/\/+$/, '') || '/' : value;
const chinese = ['', '一', '二', '三', '四', '五', '六', '七'];
// Main owns the independently reviewed current-edition pin, separate from immutable histories.
/** @type {string|null} */
export const readerNumberingDigest = "3fcb91154d373fc928e9dcfad898b82540b536b7734b03efdbe14910f5a77fbd";
export function assertReaderNumbering(value = numbering, independentDigest = readerNumberingDigest) {
  if (createHash('sha256').update(JSON.stringify(value)).digest('hex') !== independentDigest) throw new Error('Reader numbering differs from the independently pinned actual 40-unit/32-chapter/48-web-unit heading and part inventory');
}
export const readerNumberingManifest = numbering;
export const readerParts = numbering.parts.map(part => ({ ...part, label: `第${chinese[part.number]}部` }));

/** Publication numbers belong to a view/edition; routes and claim IDs do not.
 * @returns {NumberingUnit[]}
 */
export function getPresentationUnits(view) {
  assertReaderNumbering();
  if (view !== 'book' && view !== 'web') throw new TypeError(`Unknown reading view: ${view}`);
  const counts = { chapter: 0, topic: 0, appendix: 0 };
  return numbering[view].map(unit => {
    const part = readerParts.find(part => part.number === unit.part);
    if (unit.kind === 'front-matter') return { ...unit, label: null, prefix: null, ordinal: null, partLabel: null };
    const ordinal = ++counts[unit.kind];
    if (!Number.isInteger(ordinal)) throw new TypeError(`Unknown reading unit kind: ${unit.kind}`);
    const prefix = unit.kind === 'chapter' ? String(ordinal) : unit.kind === 'topic' ? `T${ordinal}` : String.fromCharCode(64 + ordinal);
    const label = unit.kind === 'chapter' ? `第${ordinal}${view === 'book' ? '章' : '篇'}` : unit.kind === 'topic' ? `专题${ordinal}` : `附录 ${prefix}`;
    return { ...unit, label, prefix, ordinal, partLabel: part?.label ?? null, partTitle: part?.title ?? null };
  });
}

export function getUnitNumbering(view, route) {
  const key = routeKey(route);
  return getPresentationUnits(view).find(unit => routeKey(unit.key) === key) ?? null;
}

/** The plan includes real component subheadings but only MDX sections enter the TOC.
 * @returns {HeadingNumber[]}
 */
export function getHeadingNumberPlan(view, route) {
  const unit = getUnitNumbering(view, route);
  if (!unit) throw new Error(`Reading unit is absent from ${view} numbering: ${route}`);
  if (!unit.prefix) return [];
  const headings = numbering.headings[unit.source];
  if (!Array.isArray(headings)) throw new Error(`Missing actual heading inventory: ${unit.source}`);
  const counters = [];
  return headings.map(heading => {
    const index = heading.depth - 2;
    if (!Number.isInteger(index) || index < 0 || index > 4 || (index > 0 && !counters[index - 1])) throw new Error(`Invalid actual heading hierarchy: ${unit.source} ${heading.key}`);
    counters[index] = (counters[index] ?? 0) + 1;
    counters.length = index + 1;
    return { ...heading, number: `${unit.prefix}.${counters.join('.')}` };
  });
}

export function getHeadingNumbering(view, route, key) {
  return getHeadingNumberPlan(view, route).find(heading => heading.key === key) ?? null;
}

/**
 * Fumadocs rehype-toc wraps even plain heading text in a JSX Fragment.
 * Admit only static text/Fragment trees; other markup needs explicit review
 * rather than guessing its visible text or invoking a component.
 */
function staticTocTitle(node, context) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) {
    let text = '';
    for (const child of node) text += staticTocTitle(child, context);
    return text;
  }
  if (isValidElement(node) && node.type === Fragment
    && Object.keys(node.props).every(key => key === 'children')) return staticTocTitle(node.props.children, context);
  throw new TypeError(`Unsupported source TOC title; expected static text or React Fragment: ${context}`);
}

/** Compiled source headings independently check the presentation inventory. */
export function assertNumberingToc(view, route, toc) {
  const actual = toc.map(item => ({ id: decodeURIComponent(item.url.replace(/^#/, '')), title: staticTocTitle(item.title, `${view} ${route} ${item.url}`), depth: item.depth }));
  const expected = getHeadingNumberPlan(view, route).filter(heading => heading.type === 'mdx').map(({id,title,depth}) => ({id,title,depth}));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Actual source TOC differs from numbered heading inventory: ${view} ${route}`);
}

/**
 * Exact DOM extraction for semantic guards. Numbers are checked, never stripped
 * by a broad regex that could conceal an incorrect title or edition ordinal.
 * Fumadocs may wrap the two spans in its anchor and append its copy-link button.
 */
export function readNumberedHeading(node, expected) {
  if (!node || !expected || typeof expected.number !== 'string' || typeof expected.title !== 'string') throw new TypeError('A rendered heading and exact expected number/title are required');
  if (expected.key && node.getAttribute('data-reader-heading-key') !== expected.key) throw new Error('Wrong stable heading key');
  const numbers = node.querySelectorAll('[data-reader-number]');
  const titles = node.querySelectorAll('[data-reader-heading-title]');
  if (numbers.length !== 1 || titles.length !== 1 || numbers[0].tagName !== 'SPAN' || titles[0].tagName !== 'SPAN'
    || numbers[0].querySelectorAll('[data-reader-heading-title]').length || titles[0].querySelectorAll('[data-reader-number]').length
    || numbers[0].getAttribute('data-reader-number') !== '' || titles[0].getAttribute('data-reader-heading-title') !== '') throw new Error('Numbered heading must contain exactly one number span and one title span');
  const number = numbers[0].textContent ?? numbers[0].text;
  const title = titles[0].textContent ?? titles[0].text;
  const text = node.textContent ?? node.text;
  if (number !== expected.number || title !== expected.title || (text !== `${number} ${title}` && text !== `${number} ${title}复制章节链接`)) throw new Error(`Wrong visible heading number/title: expected ${expected.number} ${expected.title}`);
  return title;
}
export const numberedHeadingText = readNumberedHeading;

/** Ordered complete actual content hierarchy; apparatus deliberately has no slots. */
export const getUnitHeadingPlan = getHeadingNumberPlan;


/** Source-qualified continuations; other old scopes keep their own meaning. */
export const readerContinuationContracts = [
  { key: 'data-to-uncertainty', route: '/docs/book/review-support-and-version-boundaries', bookSource: '/monograph/data-applicability', bookSourceKey: 'book-data-applicability', sourceHref: '/docs/book/uncertainty-and-variability', sourceLabel: '不确定性', bookKey: '/docs/book/uncertainty-and-variability', bookLabel: '不确定性', webContext: '继续阅读：不确定性。', bookContext: '继续阅读：不确定性。' },
  { key: 'policy-to-framework', route: '/docs/book/early-container-policy-and-systems', sourceHref: '/docs/book/framework-history/', sourceLabel: '评价框架的形成', bookKey: 'book-framework-responsibilities', bookLabel: '框架职责', webContext: '沿着这些职责，下一章进入评价框架的形成。', bookContext: '沿着这些职责，下一章进入框架职责。' },
  { key: 'emission-time-to-future', route: '/docs/book/emission-time-and-assessment', bookSource: '/monograph/climate-equivalence', bookSourceKey: 'book-climate-equivalence', sourceHref: '/docs/book/future-technology-and-context/', sourceLabel: '未来技术置于怎样的世界', bookKey: '/docs/book/future-technology-and-context', bookLabel: '未来技术置于怎样的世界', webContext: '前瞻技术的情景设定，见未来技术置于怎样的世界。', bookContext: '未来清单的技术与背景设定，另见后面的未来技术置于怎样的世界。' },
];

export function getContinuationLink(view, route, href, label) {
  if (view !== 'book' && view !== 'web') throw new TypeError(`Unknown reading view: ${view}`);
  const contract = readerContinuationContracts.find(row => (view === 'book' ? row.bookSourceKey ?? row.route : row.route) === routeKey(route) && row.sourceHref === href && row.sourceLabel === label);
  if (!contract) return null;
  return { key: contract.key, href: view === 'book' ? `#${printUnitAnchor(contract.bookKey)}` : contract.sourceHref, label: view === 'book' ? contract.bookLabel : contract.sourceLabel };
}
