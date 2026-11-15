import { selectLandRecovery, prepareLandRecoverySource, effectiveLandRecovery, verifyLandRecoveryReceipts } from './reader-land-recovery.mjs';
import { selectCircularFootprint, prepareCircularFootprintSource, effectiveCircularFootprint, verifyCircularFootprintReceipts } from './reader-circular-footprint.mjs';
import { selectLoadShift, readLoadShiftCaseFiles, prepareLoadShiftSource, effectiveLoadShift, verifyLoadShiftReceipts } from './reader-load-shift.mjs';
import { selectSubstitutionRules, prepareSubstitutionRulesSource, effectiveSubstitutionRules, verifySubstitutionRulesReceipts } from './reader-substitution-rules.mjs';
import { loadCasePublications } from './case-publication.mjs';
import { selectServiceConstraints, readServiceConstraintsFiles, prepareServiceConstraintsSource, effectiveServiceConstraints, verifyServiceConstraintsReceipts } from './reader-service-constraints.mjs';
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

async function qualifyCurrentReaderSources(root, catalog, readings, literature, preview = null) {
  const readConfig = async name => JSON.parse(await readFile(join(root, 'config', name), 'utf8'));
  const baseline = await readConfig('readable-book-baseline.json');
  const acceptance = await readConfig('readable-book-current.json');
  if (editionDigest(baseline) !== readableBookBaselineDigest) throw new Error('Readable book integration baseline differs');
  const files = await readReadableBookFiles(root, baseline.fixedFiles);
  const serviceConfig = await readConfig('reader-service-constraints.json');
  const serviceConstraints = selectServiceConstraints(serviceConfig, undefined, preview === 'service');
  const substitutionConfig = await readConfig('reader-substitution-rules.json');
  const substitutionRules = selectSubstitutionRules(substitutionConfig, undefined, preview === 'substitution');
  const landConfig = await readConfig('reader-land-recovery.json');
  const landRecovery = selectLandRecovery(landConfig, undefined, preview === 'land-recovery');
  if (preview === 'land-recovery' && landConfig.status !== 'preview') throw new Error('Land recovery review requires a private preview state');
  const circularConfig = await readConfig('reader-circular-footprint.json');
  const circularFootprint = selectCircularFootprint(circularConfig, undefined, preview === 'circular-footprint');
  if (preview === 'circular-footprint' && circularConfig.status !== 'preview') throw new Error('Circular footprint review requires a private preview state');
  const loadShiftConfig = await readConfig('reader-load-shift.json');
  const loadShift = selectLoadShift(loadShiftConfig, undefined, preview === 'load-shift');
  if (preview === 'load-shift' && loadShiftConfig.status !== 'preview') throw new Error('Load shift review requires a private preview state');
  if (preview === 'substitution' && substitutionConfig.status !== 'preview')
    throw new Error('Substitution rules review requires a private preview state');
  if (preview === 'service' && serviceConfig.status !== 'preview') throw new Error('Service constraints review requires a private preview state');
  const config = await readConfig('reader-copyedit-current.json');
  const unit = selectReaderCopyedit(config, readerCopyeditUnitPin);
  const flowBoundary = selectFlowBoundary(await readConfig('reader-flow-boundary.json'), flowBoundaryUnitPin);
  if (flowBoundary && !unit) throw new Error('Flow boundary requires the accepted #95 language generation');
  if (serviceConstraints && !flowBoundary) throw new Error('Service constraints requires the accepted #99 generation');
  if (substitutionRules && !serviceConstraints) throw new Error('Substitution rules requires the accepted #102 generation');
  if (loadShift && !substitutionRules) throw new Error('Load shift requires the accepted #105 generation');
  if (circularFootprint && !loadShift) throw new Error('Circular footprint requires the accepted #107 generation');
  if (landRecovery && !circularFootprint) throw new Error('Land recovery requires the accepted #109 generation');
  for (const [path, bytes] of await readLoadShiftCaseFiles(root, loadShift)) files.set(path, bytes);
  for (const [path, bytes] of await readServiceConstraintsFiles(root, serviceConstraints)) files.set(path, bytes);
  const reviewUnits = [...acceptance.units, ...[unit, flowBoundary, serviceConstraints, substitutionRules, loadShift, circularFootprint, landRecovery].filter(Boolean)];
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

  const input = { catalog, readings, literature, files };
  const actual = inspectReadableBookEdition(input);
  const structure = copyeditSourceStructure(input);
  const land = landRecovery && prepareLandRecoverySource(landRecovery, input, actual, structure);
  const footprintInput = land ? { ...land.previousRecords, files: land.files } : input;
  const footprint = circularFootprint && prepareCircularFootprintSource(circularFootprint, footprintInput,
    land?.previous ?? actual, land?.structure ?? structure);
  const shiftInput = footprint ? { ...footprint.previousRecords, files: footprint.files } : input;
  const shift = loadShift && prepareLoadShiftSource(loadShift, shiftInput, footprint?.previous ?? actual, footprint?.structure ?? structure);
  shift?.verifyCurrentState();
  const substitutionInput = shift ? { ...shift.previousRecords, files: shift.files } : input;
  const substitution = substitutionRules && prepareSubstitutionRulesSource(substitutionRules, substitutionInput,
    shift?.previous ?? actual, shift?.structure ?? structure);
  substitution?.verifyCurrentState();
  const previousRecords = substitution?.previousRecords ?? substitutionInput;
  if (flowBoundary && !verifyFlowBoundaryReceipts(flowBoundary, artifacts))
    throw new Error('Flow boundary lacks exact independent source, reader, and output evidence');
  if (serviceConstraints && preview !== 'service') {
    const [cases, { readerPublicDownloads }] = await Promise.all([
      loadCasePublications(root), import('./reader-current-output.mjs'),
    ]);
    if (!verifyServiceConstraintsReceipts(serviceConstraints, artifacts, cases, readerPublicDownloads(previousRecords.catalog, previousRecords.literature, previousRecords.readings)))
      throw new Error('Service constraints lacks exact independent source, reader, and output evidence');
  }
  if (substitutionRules && preview !== 'substitution') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifySubstitutionRulesReceipts(substitutionRules, artifacts, readerPublicDownloads(substitutionInput.catalog, substitutionInput.literature, substitutionInput.readings)))
      throw new Error('Substitution rules lacks exact independent source, reader, and output evidence');
  }
  if (loadShift && preview !== 'load-shift') {
    const [cases, { readerPublicDownloads }] = await Promise.all([loadCasePublications(root), import('./reader-current-output.mjs')]);
    if (!verifyLoadShiftReceipts(loadShift, artifacts, readerPublicDownloads(shiftInput.catalog, shiftInput.literature, shiftInput.readings), cases))
      throw new Error('Load shift lacks exact independent source, reader, and output evidence');
  }
  if (circularFootprint && preview !== 'circular-footprint') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyCircularFootprintReceipts(circularFootprint, artifacts, readerPublicDownloads(footprintInput.catalog, footprintInput.literature, footprintInput.readings)))
      throw new Error('Circular footprint lacks exact independent source, reader, and output evidence');
  }
  if (landRecovery && preview !== 'land-recovery') {
    const { readerPublicDownloads } = await import('./reader-current-output.mjs');
    if (!verifyLandRecoveryReceipts(landRecovery, artifacts, readerPublicDownloads(catalog, literature, readings)))
      throw new Error('Land recovery lacks exact independent source, reader, and output evidence');
  }
  const service = serviceConstraints && prepareServiceConstraintsSource(serviceConstraints, substitution?.previous ?? actual,
    substitution?.structure ?? structure, { ...previousRecords, files: substitutionInput.files });
  const flow = flowBoundary && prepareFlowBoundarySource(flowBoundary, service?.previous ?? actual,
    service?.previous.structure ?? structure, flowBoundaryPredecessorPin, service?.previousRecords ?? { readings, catalog });
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
  service?.verifyCurrentState();
  const qualifiedFlow = effectiveFlowBoundary(effectiveReaderCopyedit(qualified, unit), flowBoundary, flow?.affectedClaimIds ?? []);
  const qualifiedService = effectiveServiceConstraints(qualifiedFlow, serviceConstraints, service?.affectedClaimIds);
  const qualifiedSubstitution = effectiveSubstitutionRules(qualifiedService, substitutionRules, substitution?.affectedClaimIds);
  const qualifiedShift = effectiveLoadShift(qualifiedSubstitution, loadShift, shift?.affectedClaimIds);
  const qualifiedFootprint = effectiveCircularFootprint(qualifiedShift, circularFootprint, footprint?.affectedClaimIds);
  return effectiveLandRecovery(qualifiedFootprint, landRecovery, land?.affectedClaimIds);
}

export function validateReadableBookCurrent(root, catalog, readings, literature) {
  return qualifyCurrentReaderSources(root, catalog, readings, literature);
}

export function validateServiceConstraintsReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Service constraints review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'service');
}

export function validateSubstitutionRulesReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Substitution rules review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'substitution');
}

export function validateLoadShiftReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1') throw new Error('Load shift review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'load-shift');
}

export function validateCircularFootprintReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Circular footprint review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'circular-footprint');
}

export function validateLandRecoveryReviewSources(root, catalog, readings, literature) {
  if (process.env.READABLE_BOOK_REVIEW_PREVIEW !== '1')
    throw new Error('Land recovery review requires the explicit private preview');
  return qualifyCurrentReaderSources(root, catalog, readings, literature, 'land-recovery');
}
