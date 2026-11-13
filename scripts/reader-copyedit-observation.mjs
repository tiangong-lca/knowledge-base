const ordinaryExclusions = '.chapter-notes,[data-legacy-for],[data-legacy-notice],[data-legacy-scope],[data-copyedit-history],.docs-pagination,.reader-view-label,.teaching-case';

const ordinaryBlocks = 'p,ul,ol,dl,blockquote,pre,table,figure';

function observeArticleBindings(article) {
  const blocks = article.querySelectorAll(ordinaryBlocks).filter(node =>
    !node.closest(ordinaryExclusions) && !node.querySelector('a[role="doc-noteref"]')
    && !node.parentNode?.closest(ordinaryBlocks) && node.text.trim());
  const links = blocks.map(block => block.querySelectorAll('a[href]').map(node => node.getAttribute('href')));
  const tables = blocks.filter(node => node.tagName === 'TABLE').map(table => ({
    header: table.querySelectorAll('thead tr').map(row => row.querySelectorAll('th').map(cell => cell.attributes)),
    body: table.querySelectorAll('tbody tr').map(row => row.querySelectorAll('td,th').map(cell => ({
      tag: cell.tagName, attributes: cell.attributes, text: cell.text.replace(/\s+/g, ' ').trim(),
    }))),
  }));
  return { links, tables };
}

const encodeAddress = (path, id) => `${path}#${id}`;
export function observeCopyeditHistory(documents, numbering, readCitationSurface) {
  const addresses = {};
  for (const [path, document] of documents) {
    const surface = readCitationSurface(document, path);
    if (surface.errors.length) throw new Error(surface.errors.join('\n'));
    const register = (node, kind, subject) => {
      const observed = surface.ids.get(node.id);
      if (!observed || observed.alias || observed.notice) throw new Error(`Missing native #95 history: ${path}#${node.id}`);
      const entry = { route: observed.route, kind,
        title: kind === 'heading' || kind === 'reading-title' || kind === 'part' ? observed.visibleHeading : observed.title,
        claimIds: observed.claimIds, ordinary: observed.ordinaryHashes, ...subject };
      addresses[encodeAddress(path, node.id)] = entry;
    };
    for (const article of document.querySelectorAll('article[data-reader-route]')) {
      register(article, 'chapter', { bindings: observeArticleBindings(article) });
      for (const node of article.querySelectorAll('[data-reader-heading-key],[data-reader-section][id],.chapter-notes [id]')) {
        if (!node.id || node.hasAttribute('data-legacy-for') || node.hasAttribute('data-legacy-notice')) continue;
        const note = node.getAttribute('data-reader-claim');
        const heading = node.getAttribute('data-reader-heading-key');
        const group = node.parentNode?.getAttribute('aria-labelledby') === node.id;
        if (note) register(node, 'note');
        else if (group) register(node, 'note-group');
        else if (heading === '@unit') {
          const { claimIds, ordinaryHashes: ordinary } = surface.ids.get(article.id);
          register(node, 'reading-title', { claimIds, ordinary, chapter: article.id });
        } else if (heading || node.hasAttribute('data-reader-section')) register(node, 'heading');
      }
    }
    for (const node of document.querySelectorAll('[data-reader-part][id]')) {
      const number = Number(node.getAttribute('data-reader-part'));
      register(node, 'part', { route: path, part: number,
        members: numbering.book.filter(unit => unit.part === number).map(unit => unit.key),
        introduction: node.parentNode?.querySelector('.print-part-introduction')?.text });
    }
  }
  return addresses;
}
