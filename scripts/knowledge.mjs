/** Structural publication checks. These checks do not establish source entailment. */
const sections = ['sources', 'evidence', 'claims', 'concepts', 'mappings', 'coverage'];
const claimKinds = ['source-statement', 'interpretation', 'synthesis', 'calculation', 'proposal'];
const statuses = ['reviewed', 'draft', 'needs-review', 'withdrawn'];
const reviewKinds = ['agent-source-check', 'human-source-check', 'human-editorial-review', 'human-expert-review', 'not-reviewed'];
const relations = ['supports', 'qualifies', 'contradicts', 'context'];
const accessStatuses = ['public-html-inspected', 'public-passages-inspected', 'passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected', 'metadata-only', 'unavailable'];
const mappingRelations = ['related', 'exact', 'close', 'broader', 'narrower', 'overlap', 'conditional-equivalence', 'not-equivalent', 'unresolved'];
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = v => typeof v === 'string' && v.trim().length > 0;
const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const records = (data, key) => Array.isArray(data?.[key]) ? data[key].filter(isObject) : [];
const ids = value => Array.isArray(value) ? value.filter(isText) : [];
const byId = values => new Map(values.map(v => [v.id, v]));

// A missing kind is the existing retrieved carrier, not a claim about first editions.
export const artifactFields = ['kind', 'sha256', 'pageCount', 'resolvedUrl', 'mediaType', 'originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable'];
const captureFields = ['originUrl', 'captureMethod', 'captureScope', 'originalDocumentMediaType', 'originalDocumentBytesAvailable'];
const mediaType = value => typeof value === 'string' && /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/.test(value);
export function validateArtifact(artifact, path, fail, httpUrl, requirePdfBounds = false) {
  if (!isObject(artifact)) { fail(path, 'must be an object'); return; }
  if (typeof artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(artifact.sha256)) fail(`${path}.sha256`, 'must be a SHA-256 hex digest');
  if (!mediaType(artifact.mediaType)) fail(`${path}.mediaType`, 'must be a valid media type');
  if (artifact.kind !== undefined && !['retrieved', 'derived-text'].includes(artifact.kind)) fail(`${path}.kind`, 'must be retrieved or derived-text when supplied');
  if (artifact.kind === 'derived-text') {
    if (artifact.mediaType !== 'text/plain') fail(`${path}.mediaType`, 'derived-text requires text/plain capture bytes');
    httpUrl(artifact.originUrl, `${path}.originUrl`);
    for (const field of ['captureMethod', 'captureScope']) if (!isText(artifact[field])) fail(`${path}.${field}`, 'derived-text requires a nonempty string');
    if (!mediaType(artifact.originalDocumentMediaType)) fail(`${path}.originalDocumentMediaType`, 'derived-text requires the original document media type');
    if (artifact.originalDocumentBytesAvailable !== false) fail(`${path}.originalDocumentBytesAvailable`, 'must be false; this receipt hashes derived capture bytes only');
    for (const field of ['resolvedUrl', 'pageCount', 'blockCount', 'pdfIndices', 'nepisBlocks']) if (artifact[field] !== undefined) fail(`${path}.${field}`, 'derived-text must not claim retrieved original bytes or page/block bounds');
  } else {
    httpUrl(artifact.resolvedUrl, `${path}.resolvedUrl`);
    for (const field of captureFields) if (artifact[field] !== undefined) fail(`${path}.${field}`, 'capture metadata requires kind derived-text');
    if (artifact.pageCount !== undefined || (requirePdfBounds && artifact.mediaType === 'application/pdf')) {
      if (!Number.isSafeInteger(artifact.pageCount) || artifact.pageCount < 1) fail(`${path}.pageCount`, 'must be a positive safe integer; PDF page bounds are required');
      if (artifact.mediaType !== 'application/pdf') fail(`${path}.pageCount`, 'page counts require an application/pdf carrier');
    }
    if (artifact.blockCount !== undefined && (!Number.isSafeInteger(artifact.blockCount) || artifact.blockCount < 1)) fail(`${path}.blockCount`, 'must be a positive safe integer when recorded');
  }
}

/** Resolve evidence in evidenceIds order. Explicit links replace legacy roles, never supplement them.
 * Missing evidence is omitted here and reported by validateCatalog. Legacy rationales are null.
 */
export function getClaimEvidence(catalog, claim) {
  const evidenceMap = byId(records(catalog, 'evidence'));
  const legacy = claim?.evidenceLinks === undefined;
  return ids(claim?.evidenceIds).flatMap(id => {
    const evidence = evidenceMap.get(id);
    if (!evidence) return [];
    const link = Array.isArray(claim?.evidenceLinks) ? claim.evidenceLinks.find(item => isObject(item) && item.evidenceId === id) : undefined;
    return [{ evidence, relation: legacy ? evidence.relation : link?.relation, rationale: legacy ? null : link?.rationale, legacy }];
  });
}

export function validateCatalog(data) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  if (!isObject(data)) return ['catalog: must be an object'];
  if (data.schemaVersion !== 1) fail('schemaVersion', 'must equal 1');
  const allIds = new Set();
  for (const section of sections) {
    if (!Array.isArray(data[section])) fail(section, 'must be an array');
    for (const [index, item] of (Array.isArray(data[section]) ? data[section] : []).entries()) {
      const path = `${section}[${index}]`;
      if (!isObject(item)) { fail(path, 'must be an object'); continue; }
      if (!isText(item.id) || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(item.id)) fail(`${path}.id`, 'must be a stable nonempty identifier');
      else if (allIds.has(item.id)) fail(`${path}.id`, `duplicate ID ${item.id}`);
      else allIds.add(item.id);
    }
  }
  const sourceMap = byId(records(data, 'sources'));
  const evidenceMap = byId(records(data, 'evidence'));
  const claimMap = byId(records(data, 'claims'));
  const conceptMap = byId(records(data, 'concepts'));
  const mappingMap = byId(records(data, 'mappings'));
  function textFields(item, path, fields) {
    for (const field of fields) if (!isText(item[field])) fail(`${path}.${field}`, 'must be a nonempty string');
  }
  function choice(item, path, field, choices) {
    if (!choices.includes(item[field])) fail(`${path}.${field}`, `must be one of ${choices.join(', ')}`);
  }
  function date(item, path, field) {
    if (!validDate(item[field])) fail(`${path}.${field}`, 'must be a valid YYYY-MM-DD date');
  }
  function httpUrl(value, path) {
    try {
      const parsed = new URL(value);
      if (!['https:', 'http:'].includes(parsed.protocol)) fail(path, 'must use HTTP or HTTPS');
      if (parsed.username || parsed.password) fail(path, 'must not contain credentials');
      if ([...parsed.searchParams.keys()].some(key => /^(?:token|access_token|signature|awsaccesskeyid|x-amz-signature|x-amz-credential|x-amz-security-token)$/i.test(key))) fail(path, 'must not contain access tokens or ephemeral signed credentials');
    }
    catch { fail(path, 'must be an absolute HTTP or HTTPS URL'); }
  }
  function array(item, path, field, target, nonempty = false) {
    if (!Array.isArray(item[field])) { fail(`${path}.${field}`, 'must be an array'); return; }
    if (nonempty && item[field].length === 0) fail(`${path}.${field}`, 'must not be empty');
    const seen = new Set();
    for (const value of item[field]) {
      if (!isText(value)) { fail(`${path}.${field}`, 'entries must be nonempty strings'); continue; }
      if (seen.has(value)) fail(`${path}.${field}`, `duplicate entry ${value}`);
      seen.add(value);
      if (target && !target.has(value)) fail(`${path}.${field}`, `unknown reference ${value}`);
    }
  }
  for (const source of sourceMap.values()) {
    const p = `sources.${source.id}`;
    textFields(source, p, ['title', 'url', 'version', 'publisher', 'rights', 'preservation']);
    httpUrl(source.url, `${p}.url`);
    if (!validDate(source.accessedAt)) fail(`${p}.accessedAt`, 'must be a valid YYYY-MM-DD date');
    choice(source, p, 'accessStatus', accessStatuses);
    if (source.artifact !== undefined) {
      validateArtifact(source.artifact, `${p}.artifact`, fail, httpUrl);
    }
    if (source.reading !== undefined) {
      if (!isObject(source.reading)) fail(`${p}.reading`, 'must be an object');
      else {
        choice(source.reading, `${p}.reading`, 'status', ['selected-passages', 'web-sections', 'metadata-only']);
        textFields(source.reading, `${p}.reading`, ['scope']);
        date(source.reading, `${p}.reading`, 'checkedAt');
        if (source.reading.readingId !== undefined && !isText(source.reading.readingId)) fail(`${p}.reading.readingId`, 'must be a nonempty string when supplied');
        const inspected = accessStatuses.filter(status => status.endsWith('-inspected'));
        if (source.reading.status === 'metadata-only' && inspected.includes(source.accessStatus)) fail(`${p}.reading.status`, 'metadata-only reading cannot claim inspected source content');
        if (['selected-passages', 'web-sections'].includes(source.reading.status)) {
          if (['metadata-only', 'unavailable'].includes(source.accessStatus)) fail(`${p}.reading.status`, 'inspected passages or sections conflict with uninspected access status');
          if (['public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)) fail(`${p}.reading.status`, 'selected passages or web sections do not establish full-text inspection');
        }
      }
    }
  }
  for (const evidence of evidenceMap.values()) {
    const p = `evidence.${evidence.id}`;
    textFields(evidence, p, ['sourceId', 'locator', 'summary']);
    if (!sourceMap.has(evidence.sourceId)) fail(`${p}.sourceId`, `unknown source ${evidence.sourceId}`);
    if (evidence.relation !== undefined) choice(evidence, p, 'relation', relations);
    else if ([...claimMap.values()].some(claim => ids(claim.evidenceIds).includes(evidence.id) && !(Array.isArray(claim.evidenceLinks) && claim.evidenceLinks.some(link => isObject(link) && link.evidenceId === evidence.id)))) fail(`${p}.relation`, 'may be absent only when every claim use has an explicit evidence link');
    if (evidence.numericFact !== undefined) {
      if (!isObject(evidence.numericFact)) fail(`${p}.numericFact`, 'must be an object');
      else {
        textFields(evidence.numericFact, `${p}.numericFact`, ['unit', 'quantity', 'subject', 'basis']);
        const value = evidence.numericFact.value;
        if (typeof value !== 'string' || value.length > 200 || !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) fail(`${p}.numericFact.value`, 'must be a finite decimal string');
      }
    }
    if (evidence.appraisal !== undefined) {
      if (!isObject(evidence.appraisal)) fail(`${p}.appraisal`, 'must be an object');
      else {
        textFields(evidence.appraisal, `${p}.appraisal`, ['basis', 'independence', 'methodologicalScope']);
        array(evidence.appraisal, `${p}.appraisal`, 'limitations');
        choice(evidence.appraisal, `${p}.appraisal`, 'reviewKind', reviewKinds);
        date(evidence.appraisal, `${p}.appraisal`, 'checkedAt');
      }
    }
  }
  for (const claim of claimMap.values()) {
    const p = `claims.${claim.id}`;
    textFields(claim, p, ['text', 'scope']);
    choice(claim, p, 'kind', claimKinds);
    choice(claim, p, 'status', statuses);
    choice(claim, p, 'reviewKind', reviewKinds);
    array(claim, p, 'evidenceIds', evidenceMap);
    if (claim.evidenceLinks !== undefined) {
      if (!Array.isArray(claim.evidenceLinks)) fail(`${p}.evidenceLinks`, 'must be an array');
      else {
        const linked = new Set();
        for (const [index, link] of claim.evidenceLinks.entries()) {
          const path = `${p}.evidenceLinks[${index}]`;
          if (!isObject(link)) { fail(path, 'must be an object'); continue; }
          textFields(link, path, ['evidenceId', 'rationale']);
          choice(link, path, 'relation', relations);
          if (linked.has(link.evidenceId)) fail(`${p}.evidenceLinks`, `duplicate evidence link ${link.evidenceId}`);
          linked.add(link.evidenceId);
          if (!ids(claim.evidenceIds).includes(link.evidenceId)) fail(`${p}.evidenceLinks`, `link ${link.evidenceId} must exactly match evidenceIds`);
        }
        for (const id of ids(claim.evidenceIds)) if (!linked.has(id)) fail(`${p}.evidenceLinks`, `missing link ${id}; must exactly match evidenceIds`);
      }
    }
    array(claim, p, 'premiseIds', claimMap);
    array(claim, p, 'conceptIds', conceptMap);
    array(claim, p, 'caveats');
    if (claim.mappingIds !== undefined) array(claim, p, 'mappingIds', mappingMap);
    if (claim.caseBinding !== undefined) {
      if (!isObject(claim.caseBinding)) fail(`${p}.caseBinding`, 'must be an object');
      else {
        textFields(claim.caseBinding, `${p}.caseBinding`, ['caseId', 'version']);
        if (claim.caseBinding.inputFile !== undefined && (typeof claim.caseBinding.inputFile !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(claim.caseBinding.inputFile))) fail(`${p}.caseBinding.inputFile`, 'must be a safe public JSON basename');
        if (!/^[A-Za-z][A-Za-z0-9._:-]*$/.test(claim.caseBinding.caseId ?? '')) fail(`${p}.caseBinding.caseId`, 'must be a stable case identifier');
        if (!/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(claim.caseBinding.version ?? '')) fail(`${p}.caseBinding.version`, 'must be an explicit version');
        if (typeof claim.caseBinding.inputSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(claim.caseBinding.inputSha256)) fail(`${p}.caseBinding.inputSha256`, 'must bind the approved public input SHA-256');
      }
    }
    if (claim.reviewedAt !== null && claim.reviewedAt !== undefined && !validDate(claim.reviewedAt)) fail(`${p}.reviewedAt`, 'must be a valid YYYY-MM-DD date or null');
    if (claim.reasoning !== undefined && !isText(claim.reasoning)) fail(`${p}.reasoning`, 'must be a nonempty string when supplied');
    if (claim.status === 'reviewed') {
      if (!validDate(claim.reviewedAt)) fail(`${p}.reviewedAt`, 'reviewed claims need an actual review date');
      if (claim.reviewKind === 'not-reviewed') fail(`${p}.reviewKind`, 'reviewed claims need an explicit review kind');
      for (const premise of ids(claim.premiseIds)) {
        if (claimMap.has(premise) && claimMap.get(premise).status !== 'reviewed') fail(`${p}.premiseIds`, `reviewed claim depends on unpublished premise ${premise}`);
      }
      const evidence = getClaimEvidence(data, claim);
      if (claim.kind === 'source-statement' && !evidence.some(e => e.relation === 'supports')) fail(`${p}.evidenceIds`, 'reviewed source-statement needs supporting evidence; context alone is insufficient');
      if (claim.kind === 'interpretation' && evidence.length === 0 && ids(claim.premiseIds).length === 0) fail(p, 'reviewed interpretation needs evidence or premises');
      if (['synthesis', 'calculation', 'proposal'].includes(claim.kind)) {
        if (!isText(claim.reasoning)) fail(`${p}.reasoning`, 'reviewed derived claims need explicit reasoning');
        if (ids(claim.premiseIds).length === 0) fail(`${p}.premiseIds`, 'reviewed derived claims need identified premises');
      }
      for (const { evidence: e, relation } of evidence) {
        const source = sourceMap.get(e.sourceId);
        if (relation === 'supports' && source && ['metadata-only', 'unavailable'].includes(source.accessStatus)) fail(`${p}.evidenceIds`, `supporting evidence ${e.id} was not inspected`);
      }
    }
  }
  // A premise graph is a directed acyclic argument, even for draft arguments.
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { fail(`claims.${id}.premiseIds`, 'premise cycle detected'); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const premise of ids(claimMap.get(id)?.premiseIds)) if (claimMap.has(premise)) visit(premise);
    visiting.delete(id); visited.add(id);
  }
  for (const id of claimMap.keys()) visit(id);
  for (const concept of conceptMap.values()) {
    const p = `concepts.${concept.id}`;
    textFields(concept, p, ['label', 'english']);
    array(concept, p, 'definitionClaimIds', claimMap, true);
    array(concept, p, 'aliases');
  }
  for (const mapping of mappingMap.values()) {
    const p = `mappings.${mapping.id}`;
    textFields(mapping, p, ['from', 'to']);
    for (const field of ['from', 'to']) if (!conceptMap.has(mapping[field])) fail(`${p}.${field}`, `unknown concept ${mapping[field]}`);
    if (mapping.from === mapping.to) fail(p, 'mapping endpoints must differ');
    choice(mapping, p, 'relation', mappingRelations);
    array(mapping, p, 'conditions', undefined, true);
    array(mapping, p, 'claimIds', claimMap, true);
  }
  for (const item of records(data, 'coverage')) {
    const p = `coverage.${item.id}`;
    textFields(item, p, ['title', 'notes']);
    choice(item, p, 'status', ['sampled', 'planned', 'in-progress', 'reviewed', 'needs-review']);
  }
  return errors;
}

const fields = {
  sources: ['id', 'title', 'url', 'version', 'publisher', 'accessedAt', 'accessStatus', 'rights', 'preservation', 'artifact', 'reading'],
  evidence: ['id', 'sourceId', 'locator', 'summary', 'relation', 'appraisal', 'readingId', 'passageId', 'numericFact'],
  claims: ['id', 'text', 'kind', 'scope', 'evidenceIds', 'evidenceLinks', 'premiseIds', 'conceptIds', 'mappingIds', 'status', 'reviewedAt', 'reviewKind', 'caveats', 'reasoning', 'caseBinding'],
  concepts: ['id', 'label', 'english', 'definitionClaimIds', 'aliases'],
  mappings: ['id', 'from', 'to', 'relation', 'conditions', 'claimIds'],
  coverage: ['id', 'title', 'status', 'notes'],
};
const pick = (record, keys) => Object.fromEntries(keys.filter(key => record[key] !== undefined).map(key => [key, structuredClone(record[key])]));
const nestedFields = {
  artifact: artifactFields,
  numericFact: ['value', 'unit', 'quantity', 'subject', 'basis'],
  caseBinding: ['caseId', 'version', 'inputSha256', 'inputFile'],
  reading: ['status', 'scope', 'checkedAt', 'readingId'],
  appraisal: ['basis', 'limitations', 'independence', 'methodologicalScope', 'reviewKind', 'checkedAt'],
};
const select = (section, record) => {
  return Object.fromEntries(fields[section].filter(key => record[key] !== undefined).map(key => {
    if (nestedFields[key]) return [key, pick(record[key], nestedFields[key])];
    if (key === 'evidenceLinks') return [key, record[key].map(link => pick(link, ['evidenceId', 'relation', 'rationale']))];
    return [key, structuredClone(record[key])];
  }));
};

/** Only reviewed claims and their public reference closure enter projections. */
export function publicCatalog(data) {
  const errors = validateCatalog(data);
  if (errors.length) throw new Error(`Cannot publish invalid catalog:\n${errors.join('\n')}`);
  const claims = data.claims.filter(c => c.status === 'reviewed');
  const claimIds = new Set(claims.map(c => c.id));
  const evidenceIds = new Set(claims.flatMap(c => getClaimEvidence(data, c).map(({ evidence }) => evidence.id)));
  const evidence = data.evidence.filter(e => evidenceIds.has(e.id));
  const sourceIds = new Set(evidence.map(e => e.sourceId));
  const conceptIds = new Set(claims.flatMap(c => c.conceptIds));
  const concepts = data.concepts.filter(c => conceptIds.has(c.id) || c.definitionClaimIds.some(id => claimIds.has(id)))
    .map(c => ({ ...c, definitionClaimIds: c.definitionClaimIds.filter(id => claimIds.has(id)) }));
  for (const concept of concepts) conceptIds.add(concept.id);
  const mappings = data.mappings.filter(m => m.claimIds.every(id => claimIds.has(id)) && conceptIds.has(m.from) && conceptIds.has(m.to));
  const mappingIds = new Set(mappings.map(m => m.id));
  // Explicitly referenced unpublished mappings cannot be silently discarded.
  for (const claim of claims) if (ids(claim.mappingIds).some(id => !mappingIds.has(id))) throw new Error(`Cannot publish claim ${claim.id} with an unpublished mapping`);
  const result = { schemaVersion: 1, sources: data.sources.filter(s => sourceIds.has(s.id)), evidence, claims, concepts, mappings, coverage: data.coverage };
  return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, key === 'schemaVersion' ? value : value.map(record => select(key, record))]));
}

/** JSON-serializable reverse dependency graph; cycles in semantic links are safe. */
export function buildDependencies(data) {
  const graph = Object.create(null);
  const add = (id, dependent) => {
    if (!isText(id) || !isText(dependent)) return;
    graph[id] ??= [];
    if (!graph[id].includes(dependent)) graph[id].push(dependent);
  };
  for (const section of sections) for (const item of records(data, section)) if (isText(item.id)) graph[item.id] ??= [];
  for (const source of records(data, 'sources')) add(source.reading?.readingId, source.id);
  for (const e of records(data, 'evidence')) {
    add(e.sourceId, e.id);
    add(e.readingId, e.id);
    add(e.passageId, e.id);
  }
  for (const c of records(data, 'claims')) {
    if (isObject(c.caseBinding)) { add(c.caseBinding.caseId, c.id); add(`${c.caseBinding.caseId}@${c.caseBinding.version}`, c.id); }
    for (const dependency of [...ids(c.evidenceIds), ...ids(c.premiseIds), ...ids(c.conceptIds), ...ids(c.mappingIds)]) add(dependency, c.id);
  }
  for (const c of records(data, 'concepts')) for (const claim of ids(c.definitionClaimIds)) add(claim, c.id);
  for (const m of records(data, 'mappings')) {
    add(m.from, m.id); add(m.to, m.id);
    for (const claim of ids(m.claimIds)) { add(claim, m.id); add(m.id, claim); }
  }
  return graph;
}

export function affectedClaims(data, changedIds) {
  const graph = buildDependencies(data);
  const seen = new Set(Array.isArray(changedIds) ? changedIds : []);
  const queue = [...seen];
  for (let i = 0; i < queue.length; i++) for (const next of graph[queue[i]] ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return records(data, 'claims').filter(c => seen.has(c.id)).map(c => c.id);
}
