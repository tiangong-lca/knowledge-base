import { selectFlowBoundary, prepareFlowBoundarySource, effectiveFlowBoundary, verifyFlowBoundaryReceipts } from './reader-flow-boundary.mjs';
import { flowBoundaryUnitPin, flowBoundaryPredecessorPin } from './reader-flow-boundary-pins.mjs';
import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { editionDigest, inspectReadableBookEdition, qualifyReadableBookEdition, readableBookReviewPlan, pinnedReadableBookUnits, validReadableBookReviewFile, verifyReadableBookReviewReceipts } from './reader-current-edition.mjs';

import { copyeditSourceStructure, effectiveReaderCopyedit, qualifyReaderCopyedit, readerCopyeditSupportReferences, selectReaderCopyedit } from './reader-copyedit.mjs';
import { readerCopyeditUnitPin, readerCopyeditCaptureDigest } from './reader-copyedit-pins.mjs';
import { readableBookBaselineDigest, readableBookAcceptancePins } from './reader-current-edition-pins.mjs';

export function isReadableBookMutableFile(path) {
  return /^content\/.+\.(mdx?|json)$/.test(path)
    || /^knowledge\/cases\/[^/]+\.publication\.json$/.test(path)
    || ['config/book-edition.json', 'config/reader-numbering.json', 'components/teaching-case-client.tsx', 'components/joint-production-case.tsx', 'app/global.css'].includes(path);
}

export async function readReadableBookFiles(root, fixedFiles) {
  const result = new Map(await Promise.all(fixedFiles.map(async path => [path, await readFile(join(root, path))])));
  async function discover(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await discover(path);
      else if (entry.isFile() && isReadableBookMutableFile(path)) result.set(path, await readFile(join(root, path)));
    }
  }
  await Promise.all([discover('content'), discover('knowledge/cases')]);
  for (const path of ['config/book-edition.json', 'config/reader-numbering.json', 'components/teaching-case-client.tsx', 'components/joint-production-case.tsx', 'app/global.css']) result.set(path, await readFile(join(root, path)));
  return result;
}

export async function validateReadableBookCurrent(root, catalog, readings, literature) {
  const readConfig = async name => JSON.parse(await readFile(join(root, 'config', name), 'utf8'));
  const baseline = await readConfig('readable-book-baseline.json');
  const acceptance = await readConfig('readable-book-current.json');
  if (editionDigest(baseline) !== readableBookBaselineDigest) throw new Error('Readable book integration baseline differs');
  const files = await readReadableBookFiles(root, baseline.fixedFiles);
  const config = await readConfig('reader-copyedit-current.json');
  const unit = selectReaderCopyedit(config, readerCopyeditUnitPin);
  const flowBoundary = selectFlowBoundary(await readConfig('reader-flow-boundary.json'), flowBoundaryUnitPin);
  if (flowBoundary && !unit) throw new Error('Flow boundary requires the accepted #95 language generation');
  const reviewUnits = [...acceptance.units, ...[unit, flowBoundary].filter(Boolean)];
  const realRoot = await realpath(root);
  const reviewFiles = new Set((reviewUnits ?? []).flatMap(unit =>
    (unit.reviewEvidence ?? []).flatMap(row => [row.reportFile, row.artifactFile])));
  const artifacts = new Map();
  for (const name of reviewFiles) {
    if (!validReadableBookReviewFile(name)) throw new Error(`Invalid readable book review evidence path: ${name}`);
    const path = resolve(realRoot, name);
    if (!(await lstat(path)).isFile() || await realpath(path) !== path) throw new Error(`Readable book review evidence must be a regular file: ${name}`);
    artifacts.set(name, await readFile(path));
  }

  const actual = inspectReadableBookEdition({ catalog, readings, literature, files });
  const structure = copyeditSourceStructure({ catalog, files });
  if (flowBoundary && !verifyFlowBoundaryReceipts(flowBoundary, artifacts))
    throw new Error('Flow boundary lacks exact independent source, reader, and output evidence');
  const flow = flowBoundary && prepareFlowBoundarySource(flowBoundary, actual, structure, flowBoundaryPredecessorPin, { readings, catalog });
  if (!unit) return qualifyReadableBookEdition(baseline, readableBookBaselineDigest, acceptance, readableBookAcceptancePins, actual, artifacts);

  if (!verifyReadableBookReviewReceipts(unit, artifacts)) throw new Error('Reader copyedit requires exact primary review evidence');
  for (const { file } of readerCopyeditSupportReferences(unit, artifacts)) {
    const path = resolve(realRoot, file);
    if (!(await lstat(path)).isFile() || await realpath(path) !== path)
      throw new Error(`Reader copyedit supporting evidence must be a regular file in its review directory: ${file}`);
    artifacts.set(file, await readFile(path));
  }
  const capture = await readConfig('reader-copyedit-8148-capture.json');
  if (editionDigest(capture) !== readerCopyeditCaptureDigest) throw new Error('Reader copyedit differs from its independently pinned 8148 capture');
  const previousUnits = pinnedReadableBookUnits(acceptance, readableBookBaselineDigest, readableBookAcceptancePins);
  const previous = readableBookReviewPlan(previousUnits);
  const { previousState } = qualifyReaderCopyedit({ unit, actual: flow?.previous ?? actual, previous, capture, artifacts,
    sourceStructure: flow?.previous.structure ?? structure });
  const qualified = qualifyReadableBookEdition(baseline, readableBookBaselineDigest, acceptance, readableBookAcceptancePins, previousState, artifacts);
  flow?.verifyCurrentState();
  return effectiveFlowBoundary(effectiveReaderCopyedit(qualified, unit), flowBoundary, flow?.affectedClaimIds ?? []);
}
