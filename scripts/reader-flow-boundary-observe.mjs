import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { inspectReadableBookEdition, editionDigest, sha256 } from './reader-current-edition.mjs';
import { readReadableBookFiles } from './reader-current-edition-files.mjs';
import { collectChapterClaimOccurrences, readSourceHeading } from './reader-book.mjs';
import { copyeditSourceStructure } from './reader-copyedit.mjs';
import { flowBoundaryChapter, flowBoundaryGuide, flowBoundaryRoutes, flowBoundaryOrdinaryDigest, observeFlowBoundaryChanges, qualifyFlowBoundarySource } from './reader-flow-boundary.mjs';
import { flowBoundaryAddressPin, flowBoundaryGuidePin, flowBoundaryPredecessorPin, flowBoundarySource } from './reader-flow-boundary-pins.mjs';
import { validateReaderNumberingOutput } from './reader-numbering-output.mjs';
import { observeCopyeditHistory } from './reader-copyedit-observation.mjs';
import { readCitationSurface } from './reader-surface.mjs';
import { fingerprintReaderCss, readerCssArtifact, fingerprintReadableBookPublicArtifact, readerPublicDownloads } from './reader-current-output.mjs';

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
async function source(root) {
  const [catalog, readings, literature, { fixedFiles }, numbering, edition] = await Promise.all([
    'knowledge/catalog.json', 'knowledge/research/readings.json', 'knowledge/research/literature-map.json',
    'config/readable-book-baseline.json', 'config/reader-numbering.json', 'config/book-edition.json',
  ].map(name => readJson(join(root, name))));
  const files = await readReadableBookFiles(root, fixedFiles);
  const state = inspectReadableBookEdition({ catalog, readings, literature, files });
  return { state, catalog, readings, literature, structure: copyeditSourceStructure({ catalog, files }), files, numbering, edition };
}

const [mode, a, b] = process.argv.slice(2);
if (mode === 'source') {
  const captured = await readJson(resolve(a));
  const after = await source(resolve(b));
  const before = captured.previousState;
  if (captured.stateDigest !== flowBoundaryPredecessorPin || editionDigest({ ...before, structure: captured.structure }) !== flowBoundaryPredecessorPin
      || captured.addressDigest !== flowBoundaryAddressPin || editionDigest(captured.addresses) !== flowBoundaryAddressPin
      || captured.errors.length) throw new Error('Source observation needs the independently qualified hosted predecessor capture');
  function changed(beforeRows, afterRows) {
    return [...new Set([...Object.keys(beforeRows), ...Object.keys(afterRows)])]
      .filter(key => editionDigest(beforeRows[key] ?? null) !== editionDigest(afterRows[key] ?? null))
      .map(key => ({ key, from: beforeRows[key] ?? null, to: afterRows[key] ?? null }));
  }
  const changes = [['file', 'files'], ['record', 'records']]
    .flatMap(([kind, field]) => changed(before[field], after.state[field]).map(row => ({ kind, ...row, rationale: '待复核' })));
  const { dependencies, publishedClaims } = before;
  const raw = after.files.get(`content${flowBoundaryChapter}.mdx`).toString();
  const headings = raw.split(/^## (.+)\s*$/m);
  const chapterSections = [];
  for (let index = 1; index < headings.length; index += 2) {
    chapterSections.push({ ...readSourceHeading(headings[index]), claimIds: collectChapterClaimOccurrences(headings[index + 1]) });
  }
  const predecessorRoot = join(resolve(a, '..'), 'baseline-source');
  const [oldNumbering, oldReadings, oldCatalog] = await Promise.all([
    readJson(join(predecessorRoot, 'config/reader-numbering.json')),
    readJson(join(predecessorRoot, 'knowledge/research/readings.json')),
    readJson(join(predecessorRoot, 'knowledge/catalog.json')),
  ]);
  function changedIds(kind) {
    const prefix = `${kind}:`;
    return new Set(changes.filter(row => row.from !== null && row.key.startsWith(prefix))
      .map(row => row.key.slice(prefix.length)));
  }
  const changedReadingIds = changedIds('readings');
  const changedSourceIds = changedIds('sources');
  const relevantHeadings = numbering => Object.fromEntries(flowBoundaryRoutes.map(route => [route, numbering.headings[route]]));
  const unit = {
    id: 'flow-boundary-99', source: flowBoundarySource, rationale: '待复核',
    scope: changes.map(row => row.key), changes,
    consumers: observeFlowBoundaryChanges(before, after.state, changes).map(id => ({ id, rationale: '待复核' })),
    state: { before: { digest: captured.stateDigest, dependencies, publishedClaims, protectedClaims: captured.structure.claims },
      after: { digest: editionDigest({ ...after.state, structure: after.structure }) } },
    structure: changed(captured.structure.files, after.structure.files),
    occurrences: changed(before.sourceOccurrences, after.state.sourceOccurrences),
    numbering: {
      before: relevantHeadings(oldNumbering), after: relevantHeadings(after.numbering),
      titles: flowBoundaryRoutes.flatMap(route => {
        const from = oldNumbering.web.find(row => row.key === route).title;
        const to = after.numbering.web.find(row => row.key === route).title;
        return from === to ? [] : [{ route, from, to }];
      }),
    },
    chapterSections,
    previousReadings: oldReadings.readings.filter(row => changedReadingIds.has(row.id)),
    previousSources: oldCatalog.sources.filter(row => changedSourceIds.has(row.id)),
    previousAddresses: captured.addresses, currentAddresses: captured.addresses, history: [], ordinaryTargets: {},
    outputs: [], publicArtifacts: [],
  };
  qualifyFlowBoundarySource(unit, after.state, after.structure, flowBoundaryPredecessorPin, { catalog: after.catalog, readings: after.readings });
  console.log(JSON.stringify({ schemaVersion: 1, status: 'preview', unit }, null, 2));
} else if (mode === 'output') {
  const root = resolve(a);
  const { files, catalog, readings, literature, edition, numbering } = await source(resolve(root, '..'));
  const sources = new Map([...files].filter(([path]) => /^content\/.+\.mdx?$/.test(path)).map(([path, bytes]) => [
    path.slice('content'.length).replace(/\.mdx?$/, '').replace(/\/index$/, ''), bytes.toString(),
  ]));
  const { documents, errors } = await validateReaderNumberingOutput(root, { sources, edition });
  if (errors.length) throw new Error(errors.join('\n'));
  const addresses = Object.fromEntries(Object.entries(observeCopyeditHistory(documents, numbering, readCitationSurface))
    .filter(([, row]) => flowBoundaryRoutes.includes(row.route)));
  const unit = (await readJson(join(root, '..', 'config/reader-flow-boundary.json'))).unit;
  const ordinaryTargets = Object.fromEntries([...documents].flatMap(([path, document]) =>
    document.querySelectorAll('p[id]').filter(node => /-flow-99-ordinary-\d+$/.test(node.id))
      .map(node => [`${path}#${node.id}`, flowBoundaryOrdinaryDigest(node)])));
  const history = Object.entries(unit.previousAddresses)
    .filter(([address, row]) => row.kind !== 'note' && editionDigest(row) !== editionDigest(addresses[address]))
    .map(([address, row]) => ({
      address, from: editionDigest(row), rationale: '待复核',
      ordinary: row.ordinary.map(digest => {
        const destination = addresses[address]?.ordinary.includes(digest) ? address : Object.keys(addresses).find(key =>
          key.split('#')[0] === address.split('#')[0] && addresses[key].route === row.route && addresses[key].ordinary.includes(digest));
        const target = destination && Object.keys(ordinaryTargets).find(key =>
          key.split('#')[0] === destination.split('#')[0] && ordinaryTargets[key] === digest);
        return { from: digest, address: destination ?? null, targetId: target?.slice(target.indexOf('#') + 1) ?? null,
          to: destination ? digest : null, rationale: '待复核' };
      }),
    }));
  const outputIdentity = row => `${row.path}#${row.route}`;
  const accepted = await readJson(join(root, '..', 'config/readable-book-current.json'));
  const copyedit = await readJson(join(root, '..', 'config/reader-copyedit-current.json'));
  function previous(field, key) {
    return new Map([...accepted.units, copyedit.unit].flatMap(unit => unit[field]).map(row => [key(row), row.sha256]));
  }
  const previousArticles = previous('outputs', outputIdentity);
  const outputs = [];
  for (const [path, document] of documents) for (const article of document.querySelectorAll('article[data-reader-route]')) {
    const route = article.getAttribute('data-reader-route');
    const from = previousArticles.get(outputIdentity({ path, route }));
    if (!from) throw new Error(`Actual article is missing a reviewed predecessor: ${path}#${route}`);
    const hash = sha256(article.outerHTML);
    if (from !== hash) outputs.push({ path, route, from, sha256: hash, rationale: '待复核' });
  }
  const previousArtifacts = previous('publicArtifacts', row => row.path);
  previousArtifacts.set(flowBoundaryGuide, flowBoundaryGuidePin);
  const publicArtifacts = [];
  const projectedDownloads = readerPublicDownloads(catalog, literature, readings);
  const previewDownloads = [];
  const artifactFiles = [];
  for (const [path, from] of previousArtifacts) {
    if (path === readerCssArtifact) {
      const sha256 = await fingerprintReaderCss(root);
      if (sha256 !== from) {
        throw new Error('Flow boundary changed compiled CSS outside its narrowed publication work');
      }
      continue;
    }
    const bytes = await readFile(join(root, path)).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (!bytes && !projectedDownloads.has(path)) throw new Error(`Missing actual public artifact: ${path}`);
    if (!bytes) previewDownloads.push(path);
    const hash = fingerprintReadableBookPublicArtifact(path, bytes ?? projectedDownloads.get(path));
    if (from !== hash) {
      publicArtifacts.push({ path, from, sha256: hash, rationale: '待复核' });
      if (bytes) artifactFiles.push({ path, sha256: hash, bytes: bytes.length });
    }
  }
  const provenance = previewDownloads.length ? { source: 'isolated-preview', previewDownloads } : { source: 'actual-export', artifactFiles };
  console.log(JSON.stringify({ currentAddresses: addresses, ordinaryTargets, history, outputs, publicArtifacts, ...provenance }, null, 2));
} else {
  throw new Error('Use source <baseline observations.json> <candidate-source> or output <candidate true-HTML directory>');
}
