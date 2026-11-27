import type { Root, Node, Item } from 'fumadocs-core/page-tree';
import type { TOCItemType } from 'fumadocs-core/toc';
import { NumberedTitle } from '@/components/numbered-heading';
import { assertNumberingToc, getHeadingNumbering, getPresentationUnits, getUnitNumbering, readerParts } from '@/scripts/reader-numbering.mjs';

const routeKey = (value: string) => value.replace(/^\/(zh|en)(?=\/|$)/, '').replace(/\/+$/, '') || '/';

export const EN_PARTS: Record<number, { label: string; title: string }> = {
  1: { label: 'Part I', title: 'Origins, Questions, and Methodological Framework' },
  2: { label: 'Part II', title: 'Functional Unit, Process Networks, and Life Cycle Inventory' },
  3: { label: 'Part III', title: 'Multifunctionality, Allocation, and System Boundaries' },
  4: { label: 'Part IV', title: 'Life Cycle Impact Assessment Pathways and Models' },
  5: { label: 'Part V', title: 'Normalization, Weighting, Regionalization, and Sustainability Extensions' },
  6: { label: 'Part VI', title: 'Background Databases and Interoperability' },
  7: { label: 'Part VII', title: 'Data Quality, Uncertainty, and Product Footprint Rules' },
  8: { label: 'Part VIII', title: 'Case Synthesis, Interpretation, and Revisable Judgment' },
};

export function getEnUnitLabel(unit: ReturnType<typeof getPresentationUnits>[number]): string | undefined {
  if (unit.kind === 'chapter') return `Chapter ${unit.ordinal}`;
  if (unit.kind === 'topic') return `Topic ${unit.ordinal}`;
  if (unit.kind === 'appendix') return `Appendix ${String.fromCharCode(64 + (unit.ordinal ?? 1))}`;
  return undefined;
}

/** Clone navigation for this view; never overwrite source titles or URLs. */
export function getWebsiteTree(tree: Root, locale: 'zh' | 'en' = 'zh'): Root {
  const pages = new Map<string, Item>();
  const visit = (node: Node) => {
    if (node.type === 'page') pages.set(routeKey(node.url), node);
    if (node.type === 'folder') { if (node.index) visit(node.index); node.children.forEach(visit); }
  };
  tree.children.forEach(visit);
  const units = getPresentationUnits('web');
  const isEn = locale === 'en';
  const item = (unit: typeof units[number]): Item => {
    const page = pages.get(routeKey(unit.key));
    if (!page) throw new Error(`Website numbered navigation has no source page: ${unit.key}`);
    const label = isEn ? getEnUnitLabel(unit) : unit.label;
    return { ...page, name: <span data-reader-unit-name={unit.key}><NumberedTitle number={label}>{page.name}</NumberedTitle></span> };
  };
  const children: Node[] = units.filter(unit => unit.kind === 'front-matter').map(item);
  for (const part of readerParts) {
    const enPart = EN_PARTS[part.number];
    const partLabel = isEn ? (enPart?.label ?? `Part ${part.number}`) : part.label;
    const partTitle = isEn ? (enPart?.title ?? part.title) : part.title;
    children.push({
      type: 'folder',
      $id: `reader-web-part-${part.number}`,
      name: <span data-reader-part-name={part.number}><NumberedTitle number={partLabel}>{partTitle}</NumberedTitle></span>,
      defaultOpen: true,
      children: units.filter(unit => unit.part === part.number).map(item),
    });
  }
  children.push({ type: 'folder', $id: 'reader-web-topics', name: isEn ? 'Topical Essays' : '概念与实践专题', defaultOpen: true, children: units.filter(unit => unit.kind === 'topic').map(item) });
  children.push({ type: 'folder', $id: 'reader-web-appendices', name: isEn ? 'Appendices' : '附录', defaultOpen: true, children: units.filter(unit => unit.kind === 'appendix').map(item) });
  const represented = new Set(units.map(unit => routeKey(unit.key)));
  for (const route of pages.keys()) if (!represented.has(route)) throw new Error(`Website page absent from numbered navigation: ${route}`);
  return { ...tree, name: isEn ? 'Web Reading Contents' : '网页细读目录', children };
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

export function getEnSectionPrefix(unit: ReturnType<typeof getUnitNumbering> | undefined): string | undefined {
  if (!unit) return undefined;
  if (unit.kind === 'chapter') return `${unit.ordinal}`;
  if (unit.kind === 'appendix') return String.fromCharCode(64 + (unit.ordinal ?? 1));
  return undefined;
}

export function getEnNumberedToc(page: { url: string; data: { toc: TOCItemType[] } }): TOCItemType[] {
  const unit = getUnitNumbering('web', routeKey(page.url));
  const prefix = getEnSectionPrefix(unit);
  let h2Idx = 0;
  let h3Idx = 0;
  return page.data.toc.map(item => {
    if (item.depth === 2) {
      h2Idx += 1;
      h3Idx = 0;
      const num = prefix ? `${prefix}.${h2Idx}` : `${h2Idx}`;
      return { ...item, title: <NumberedTitle number={num}>{item.title}</NumberedTitle> };
    }
    if (item.depth === 3 && h2Idx > 0) {
      h3Idx += 1;
      const num = prefix ? `${prefix}.${h2Idx}.${h3Idx}` : `${h2Idx}.${h3Idx}`;
      return { ...item, title: <NumberedTitle number={num}>{item.title}</NumberedTitle> };
    }
    return item;
  });
}

export function getWebsitePagination(
  route: string,
  pages: { url: string; data: { title: string; description?: string } }[],
  locale: 'zh' | 'en' = 'zh',
) {
  const map = new Map(pages.map(page => [routeKey(page.url), page]));
  const units = getPresentationUnits('web');
  const at = units.findIndex(unit => routeKey(unit.key) === routeKey(route));
  const isEn = locale === 'en';
  const item = (index: number) => {
    const unit = units[index];
    if (!unit) return undefined;
    const page = map.get(routeKey(unit.key));
    if (!page) throw new Error(`Numbered pagination has no source: ${unit.key}`);
    const label = isEn ? getEnUnitLabel(unit) : unit.label;
    return { url: page.url, description: page.data.description, name: <span data-reader-unit-name={unit.key}><NumberedTitle number={label}>{page.data.title}</NumberedTitle></span> };
  };
  return { previous: item(at - 1), next: item(at + 1) };
}

export { getHeadingNumbering, getPresentationUnits, getUnitNumbering, readerParts };
