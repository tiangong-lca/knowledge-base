import { createHash } from 'node:crypto';
import { readdir, readFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { evaluateTeachingCase, validateTeachingCase } from './teaching-case.mjs';
import { evaluateJointProductionCase, validateJointProductionCase } from './joint-production.mjs';
import { publicCatalog } from './knowledge.mjs';

// Every nested object has an explicit schema. Unknown fields never enter public
// downloads or the approved-input hash, including capture/private metadata.
const scalar = null, list = [scalar], matrix = [list];
const alternative = { kgPerM2PerTreatment: scalar, treatmentTimesYears: list, stipulatedLifeYearsPerTreatment: scalar, requiredKg: scalar };
const scenario = { version: scalar, initialCondition: scalar, demands: { paintA: list, paintB: list }, changed: list, heldFixed: list };
const wallInputShape = {
  caseId: scalar, version: scalar, createdAt: scalar, status: scalar, numericProvenanceDefault: scalar,
  service: { area: scalar, areaUnit: scalar, intervalYears: scalar, performance: scalar, paintA: alternative, paintB: alternative, assumptions: list },
  technosphere: { columns: list, rows: list, signConvention: scalar, matrix, equations: list, determinant: scalar, doubleCountingRule: scalar },
  environment: { rows: list, matrix, rule: scalar },
  characterization: { name: scalar, factorVector: list, factorUnits: list, factorEvidenceIds: list, factorSubjects: list, outputUnit: scalar, sourceId: scalar, sourceStatus: scalar, reportedCH4Uncertainty: scalar, scope: scalar },
  uncertainty: { parameter: scalar, meaning: scalar, unit: scalar, closedRange: list, displayPoint: scalar, sharedRelation: scalar, probability: scalar, interpretation: scalar },
  comparison: { estimand: scalar, tolerance: scalar, toleranceUnit: scalar, toleranceStatus: scalar, strictOrdering: scalar, boundedEquivalence: scalar, predeclaration: scalar },
  scenarios: { smooth: scenario, rough: scenario }, priorExampleRelationship: scalar,
  countercase: { massKg: scalar, meaning: scalar },
};
const productAmounts = { X: scalar, Y: scalar };
const operationAmounts = { joint: scalar, standaloneX: scalar, standaloneY: scalar, wasteY: scalar };
const jointInputShape = {
  caseId: scalar, version: scalar, model: scalar, createdAt: scalar, status: scalar, numericProvenanceDefault: scalar,
  inventoryRows: list, activityBasis: operationAmounts, outputKgPerJointBatch: productAmounts,
  inventoryPerOperation: { joint: list, standaloneX: list, standaloneY: list, wasteY: list },
  pricePerKgCU: productAmounts, functionalDemandKg: productAmounts,
  partitionQuestion: scalar, partitionScope: scalar, decisionQuestion: scalar, qMeaning: scalar, qScenarios: list, qProbability: scalar,
  systemActivities: { reference: operationAmounts, jointRoute: operationAmounts },
  assessment: { kind: scalar, characterizationFactors: scalar, crossFlowAggregation: scalar, interpretation: scalar },
  residualInterpretation: scalar, premises: list,
};
// Closed model registry: a case identity selects its projection, evaluator and
// numeric-source policy together. An input flag cannot disable wall fact checks.
const caseAdapters = new Map([
  ['CASE-WALL-CONNECT', { shape: wallInputShape, validate: validateTeachingCase, context: input => {
    const [low, high] = input.uncertainty.closedRange;
    return Object.fromEntries(['smooth', 'rough'].map(scenario => [scenario,
      Object.fromEntries(Object.entries({ low, display: input.uncertainty.displayPoint, high }).map(([name, theta]) => [name, evaluateTeachingCase(input, { scenario, theta })])),
    ]));
  }, validateFacts: validateWallFactorFacts }],
  ['CASE-JOINT-BATCH', { shape: jointInputShape, validate: validateJointProductionCase,
    context: input => ({ evaluated: evaluateJointProductionCase(input) }),
    // This adapter validates inventory-only/no-factor scope before reaching here.
    validateFacts: () => [] }],
]);
function caseAdapter(spec) {
  const adapter = object(spec) && caseAdapters.get(spec.caseId);
  if (!adapter) throw new TypeError('Unsupported teaching case identity; a reviewed model adapter is required');
  return adapter;
}
const claimShape = {
  id: scalar, text: scalar, kind: scalar, scope: scalar, evidenceIds: list,
  evidenceLinks: [{ evidenceId: scalar, relation: scalar, rationale: scalar }],
  premiseIds: list, conceptIds: list, mappingIds: list, status: scalar,
  reviewedAt: scalar, reviewKind: scalar, caveats: list, reasoning: scalar,
  caseBinding: { caseId: scalar, version: scalar, inputSha256: scalar, inputFile: scalar },
};
const metadataShape = Object.fromEntries(Object.entries(claimShape).filter(([key]) => !['text', 'status', 'reviewedAt', 'reviewKind', 'caseBinding'].includes(key)));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function project(value, shape, path = 'case') {
  if (shape === null) {
    if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) throw new TypeError(`${path}: public scalar cannot contain an object`);
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError(`${path}: public scalar must be finite`);
    return value;
  }
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) throw new TypeError(`${path}: must be an array`);
    return value.map((item, index) => project(item, shape[0], `${path}.${index}`));
  }
  if (!object(value)) throw new TypeError(`${path}: must be an object`);
  return Object.fromEntries(Object.entries(shape).filter(([key]) => Object.hasOwn(value, key)).map(([key, nested]) => [key, project(value[key], nested, `${path}.${key}`)]));
}
function freeze(value) {
  if (value !== null && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export function publicTeachingCase(spec) {
  const adapter = caseAdapter(spec);
  const output = project(spec, adapter.shape);
  const errors = adapter.validate(output);
  if (errors.length) throw new TypeError(`Invalid teaching case:\n${errors.join('\n')}`);
  return output;
}
/** The hash covers precisely the downloadable UTF-8 bytes, including final LF. */
export const canonicalCaseInput = spec => `${JSON.stringify(publicTeachingCase(spec), null, 2)}\n`;
export const caseInputSha256 = spec => createHash('sha256').update(canonicalCaseInput(spec)).digest('hex');

/**
 * Safe primitive paths: input.<public input path> plus model-specific results.
 * Wall: smooth|rough.low|display|high. Joint: evaluated.partitions,
 * evaluated.scenarios.full|half|none, referenceBasket and separate residuals.
 * Numeric array segments are allowed (e.g. evaluated.referenceBasket.0).
 */
export function caseTemplateContext(spec) {
  const input = publicTeachingCase(spec);
  return freeze({ input, ...caseAdapter(input).context(input) });
}
function interpolate(template, context) {
  if (typeof template !== 'string' || !template.trim()) throw new TypeError('textTemplate: must be a nonempty string');
  const text = template.replace(/\{\{([\s\S]*?)\}\}/g, (_, path) => {
    if (!/^[A-Za-z][A-Za-z0-9]*(?:\.(?:[A-Za-z][A-Za-z0-9]*|0|[1-9]\d*))*$/.test(path) || path.split('.').some(part => ['constructor', 'prototype', '__proto__'].includes(part))) throw new TypeError(`textTemplate: unsafe token ${path}`);
    let value = context;
    for (const part of path.split('.')) {
      if (value === null || typeof value !== 'object' || !Object.hasOwn(value, part)) throw new TypeError(`textTemplate: unknown token ${path}`);
      value = value[part];
    }
    if (value === null || !['string', 'number', 'boolean'].includes(typeof value)) throw new TypeError(`textTemplate: token ${path} must resolve to a primitive output`);
    return String(value);
  });
  if (text.includes('{{') || text.includes('}}')) throw new TypeError('textTemplate: malformed token');
  return text;
}
function publicationErrors(spec, publication) {
  const errors = [];
  if (!object(publication)) return ['case publication: must be an object'];
  if (publication.schemaVersion !== 1) errors.push('case publication.schemaVersion: must be 1');
  if (publication.caseId !== spec.caseId || publication.version !== spec.version) errors.push('case publication: caseId/version does not match input');
  if (!safeCaseInputFile(publication.inputFile)) errors.push('case publication.inputFile: must be a safe JSON basename');
  if (publication.approvedInputSha256 !== caseInputSha256(spec)) errors.push('case publication.approvedInputSha256: stale or unapproved canonical case input; explicit new review required');
  if (typeof publication.reviewedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(publication.reviewedAt) || !Number.isFinite(Date.parse(publication.reviewedAt)) || new Date(publication.reviewedAt).toISOString().slice(0, 10) !== publication.reviewedAt) errors.push('case publication.reviewedAt: must be a valid review date');
  if (!['agent-source-check', 'human-source-check', 'human-editorial-review', 'human-expert-review'].includes(publication.reviewKind)) errors.push('case publication.reviewKind: must identify an actual review');
  if (!Array.isArray(publication.claims) || !publication.claims.length) errors.push('case publication.claims: must be a nonempty array');
  else {
    const ids = new Set();
    for (const claim of publication.claims) {
      if (!object(claim) || typeof claim.id !== 'string' || !claim.id.trim()) { errors.push('case publication.claims: each entry needs an id'); continue; }
      if (ids.has(claim.id)) errors.push(`case publication.claims: duplicate ${claim.id}`);
      ids.add(claim.id);
      if (['text', 'status', 'reviewedAt', 'reviewKind', 'caseBinding'].some(key => Object.hasOwn(claim, key))) errors.push(`case publication.claims.${claim.id}: review/text/binding fields are derived, not authored metadata`);
    }
  }
  return errors;
}
/** Read-only expected records. This never writes/approves canonical catalog data. */
export function materializeCaseClaims(spec, publication) {
  const errors = publicationErrors(spec, publication);
  if (errors.length) throw new TypeError(errors.join('\n'));
  const context = caseTemplateContext(spec);
  return freeze(publication.claims.map(claim => ({ ...project(claim, metadataShape, `claims.${claim.id}`),
    text: interpolate(claim.textTemplate, context), status: 'reviewed', reviewedAt: publication.reviewedAt, reviewKind: publication.reviewKind,
    caseBinding: { caseId: spec.caseId, version: spec.version, inputSha256: publication.approvedInputSha256, inputFile: publication.inputFile },
  })));
}

export function validateCasePublication(spec, publication, catalog) {
  const errors = [];
  let expected, published;
  try { expected = materializeCaseClaims(spec, publication); } catch (error) { errors.push(error.message); }
  try { published = publicCatalog(catalog); } catch (error) { errors.push(error.message); }
  if (!expected || !published) return errors;
  const actual = new Map(catalog.claims.map(claim => [claim.id, claim]));
  const expectedIds = new Set(expected.map(claim => claim.id));
  for (const claim of expected) {
    const record = actual.get(claim.id);
    if (!record) { errors.push(`case publication: missing canonical claim ${claim.id}`); continue; }
    try {
      if (!isDeepStrictEqual(project(record, claimShape), claim)) errors.push(`case publication: canonical claim ${claim.id} has stale text, metadata or caseBinding`);
      if (!isDeepStrictEqual(record.caseBinding, claim.caseBinding)) errors.push(`case publication: claim ${claim.id} has unknown caseBinding fields`);
    } catch (error) { errors.push(error.message); }
  }
  for (const claim of catalog.claims) if (claim.caseBinding?.caseId === spec.caseId && claim.caseBinding.version === spec.version && !expectedIds.has(claim.id)) errors.push(`case publication: extra caseBinding on ${claim.id}`);
  errors.push(...caseAdapter(spec).validateFacts(publicTeachingCase(spec), published));
  return errors;
}
function validateWallFactorFacts(spec, published) {
  const errors = [];
  const cf = spec.characterization;
  if (!Array.isArray(cf.factorEvidenceIds) || cf.factorEvidenceIds.length !== cf.factorVector.length || new Set(cf.factorEvidenceIds).size !== cf.factorVector.length) errors.push('case characterization.factorEvidenceIds: each factor needs distinct public numeric evidence');
  if (!Array.isArray(cf.factorSubjects) || cf.factorSubjects.length !== cf.factorVector.length) errors.push('case characterization.factorSubjects: each factor needs an explicit subject');
  const factorSource = published.sources.find(source => source.id === cf.sourceId);
  if (!factorSource) errors.push(`case characterization: source ${cf.sourceId} is not in the reviewed public closure`);
  else if (!['public-html-inspected', 'public-passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected'].includes(factorSource.accessStatus)) errors.push(`case characterization: source ${cf.sourceId} was not inspected for numeric factor use`);
  cf.factorVector.forEach((value, index) => {
    const evidence = published.evidence.find(record => record.id === cf.factorEvidenceIds?.[index]);
    const fact = evidence?.numericFact;
    if (!evidence || evidence.sourceId !== cf.sourceId || !fact || fact.value !== value || fact.unit !== cf.factorUnits[index] || fact.subject !== cf.factorSubjects?.[index]) errors.push(`case characterization.factorVector.${index}: does not match bound public source numericFact value/unit/subject`);
  });
  return errors;
}
export const safeCaseInputFile = name => typeof name === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name);

/** Optional for legacy repositories, but every discovered publication is checked. */
export async function loadCasePublications(root) {
  const directory = resolve(root, 'knowledge/cases');
  let files;
  try { files = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const entries = [];
  for (const file of files.filter(file => file.name.endsWith('.publication.json')).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!file.isFile() || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.publication\.json$/.test(file.name)) throw new TypeError(`Unsafe case publication filename: ${file.name}`);
    const publication = JSON.parse(await readFile(resolve(directory, file.name), 'utf8'));
    if (!safeCaseInputFile(publication.inputFile) || `${publication.inputFile.slice(0, -5)}.publication.json` !== file.name) throw new TypeError(`Unsafe or mismatched case inputFile: ${publication.inputFile}`);
    const input = resolve(directory, publication.inputFile);
    if (!(await lstat(input)).isFile()) throw new TypeError(`Case input must be a regular file: ${publication.inputFile}`);
    entries.push({ inputFile: publication.inputFile, spec: JSON.parse(await readFile(input, 'utf8')), publication });
  }
  return entries;
}
export function validateCasePublications(entries, catalog) {
  const errors = [], cases = new Set(), claims = new Set();
  if (!Array.isArray(entries)) return ['case publications: must be an array'];
  for (const entry of entries) {
    const { spec, publication } = entry ?? {};
    if (!object(spec) || !object(publication)) { errors.push('case publication: input and manifest must be objects'); continue; }
    const identity = `${spec.caseId}@${spec.version}`;
    if (cases.has(identity)) errors.push(`Duplicate case publication ${identity}`);
    cases.add(identity);
    try { errors.push(...validateCasePublication(spec, publication, catalog)); } catch (error) { errors.push(error.message); }
    for (const claim of Array.isArray(publication?.claims) ? publication.claims : []) {
      if (claims.has(claim.id)) errors.push(`Duplicate case-bound claim ${claim.id}`);
      claims.add(claim.id);
    }
  }
  for (const claim of Array.isArray(catalog?.claims) ? catalog.claims.filter(object) : []) if (claim.caseBinding && (!cases.has(`${claim.caseBinding.caseId}@${claim.caseBinding.version}`) || !claims.has(claim.id))) errors.push(`Unknown caseBinding on claim ${claim.id}`);
  return errors;
}
/** Evaluated read-only artifact, not an empirical or scientific approval receipt. */
export function caseEvaluationReceipt(spec, sourceCommit) {
  const { input, ...evaluations } = caseTemplateContext(spec);
  return { schemaVersion: 1, artifactKind: 'read-only-teaching-case-evaluation', caseId: input.caseId, version: input.version,
    inputSha256: caseInputSha256(input), sourceCommit, scientificApproval: false, evaluations };
}
