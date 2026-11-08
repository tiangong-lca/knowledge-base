import type { Root, Node, Item } from 'fumadocs-core/page-tree';
import type { TOCItemType } from 'fumadocs-core/toc';
import { NumberedTitle } from '@/components/numbered-heading';
import { assertNumberingToc, getHeadingNumbering, getPresentationUnits, getUnitNumbering, readerParts } from '@/scripts/reader-numbering.mjs';

const routeKey = (value: string) => value.replace(/\/+$/, '') || '/';

/** Clone navigation for this view; never overwrite source titles or URLs. */
export function getWebsiteTree(tree: Root): Root {
  const pages = new Map<string, Item>();
  const visit = (node: Node) => {
    if (node.type === 'page') pages.set(routeKey(node.url), node);
    if (node.type === 'folder') { if (node.index) visit(node.index); node.children.forEach(visit); }
  };
  tree.children.forEach(visit);
  const units = getPresentationUnits('web');
  const item = (unit: typeof units[number]): Item => {
    const page = pages.get(routeKey(unit.key));
    if (!page) throw new Error(`Website numbered navigation has no source page: ${unit.key}`);
    return { ...page, name: <span data-reader-unit-name={unit.key}><NumberedTitle number={unit.label}>{page.name}</NumberedTitle></span> };
  };
  const children: Node[] = units.filter(unit => unit.kind === 'front-matter').map(item);
  for (const part of readerParts) children.push({ type: 'folder', $id: `reader-web-part-${part.number}`, name: <span data-reader-part-name={part.number}><NumberedTitle number={part.label}>{part.title}</NumberedTitle></span>, defaultOpen: true, children: units.filter(unit => unit.part === part.number).map(item) });
  children.push({ type: 'folder', $id: 'reader-web-topics', name: '概念与实践专题', defaultOpen: true, children: units.filter(unit => unit.kind === 'topic').map(item) });
  children.push({ type: 'folder', $id: 'reader-web-appendices', name: '附录', defaultOpen: true, children: units.filter(unit => unit.kind === 'appendix').map(item) });
  const represented = new Set(units.map(unit => routeKey(unit.key)));
  for (const route of pages.keys()) if (!represented.has(route)) throw new Error(`Website page absent from numbered navigation: ${route}`);
  return { ...tree, name: '网页细读目录', children };
}

export function getNumberedToc(page: {url: string; data: {toc: TOCItemType[]}}, view: 'web' | 'book' = 'web'): TOCItemType[] {
  assertNumberingToc(view, page.url, page.data.toc);
  return page.data.toc.map(item => {
    const key = decodeURIComponent(item.url.slice(1));
    const heading = getHeadingNumbering(view, page.url, key);
    if (!heading) throw new Error(`Actual TOC heading has no number: ${page.url} ${key}`);
    return { ...item, title: <NumberedTitle number={heading.number}>{item.title}</NumberedTitle> };
  });
}

export function getWebsitePagination(route: string, pages: {url: string;data:{title:string;description?:string}}[]) {
  const map = new Map(pages.map(page => [routeKey(page.url), page]));
  const units = getPresentationUnits('web');
  const at = units.findIndex(unit => routeKey(unit.key) === routeKey(route));
  const item = (index: number) => {
    const unit = units[index];
    if (!unit) return undefined;
    const page = map.get(routeKey(unit.key));
    if (!page) throw new Error(`Numbered pagination has no source: ${unit.key}`);
    return { url: page.url, description: page.data.description, name: <span data-reader-unit-name={unit.key}><NumberedTitle number={unit.label}>{page.data.title}</NumberedTitle></span> };
  };
  return {previous:item(at-1),next:item(at+1)};
}

export { getHeadingNumbering, getPresentationUnits, getUnitNumbering, readerParts };
