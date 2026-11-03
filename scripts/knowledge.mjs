/** Structural publication checks. These checks do not establish source entailment. */
const sections = ['sources', 'evidence', 'claims', 'concepts', 'mappings', 'coverage'];
const claimKinds = ['source-statement', 'interpretation', 'synthesis', 'calculation', 'proposal'];
const statuses = ['reviewed', 'draft', 'needs-review', 'withdrawn'];
const reviewKinds = ['agent-source-check', 'human-source-check', 'human-editorial-review', 'human-expert-review', 'not-reviewed'];
const relations = ['supports', 'qualifies', 'contradicts', 'context'];
const accessStatuses = ['public-html-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected', 'metadata-only', 'unavailable'];
const mappingRelations = ['related', 'exact', 'close', 'broader', 'narrower', 'overlap', 'conditional-equivalence', 'not-equivalent', 'unresolved'];
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = v => typeof v === 'string' && v.trim().length > 0;
const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const records = (data, key) => Array.isArray(data?.[key]) ? data[key].filter(isObject) : [];
const ids = value => Array.isArray(value) ? value.filter(isText) : [];
const byId = values => new Map(values.map(v => [v.id, v]));

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
    try { if (!['https:', 'http:'].includes(new URL(source.url).protocol)) fail(`${p}.url`, 'must use HTTP or HTTPS'); }
    catch { fail(`${p}.url`, 'must be an absolute HTTP or HTTPS URL'); }
    if (!validDate(source.accessedAt)) fail(`${p}.accessedAt`, 'must be a valid YYYY-MM-DD date');
    choice(source, p, 'accessStatus', accessStatuses);
  }
  for (const evidence of evidenceMap.values()) {
    const p = `evidence.${evidence.id}`;
    textFields(evidence, p, ['sourceId', 'locator', 'summary']);
    if (!sourceMap.has(evidence.sourceId)) fail(`${p}.sourceId`, `unknown source ${evidence.sourceId}`);
    choice(evidence, p, 'relation', relations);
  }
  for (const claim of claimMap.values()) {
    const p = `claims.${claim.id}`;
    textFields(claim, p, ['text', 'scope']);
    choice(claim, p, 'kind', claimKinds);
    choice(claim, p, 'status', statuses);
    choice(claim, p, 'reviewKind', reviewKinds);
    array(claim, p, 'evidenceIds', evidenceMap);
    array(claim, p, 'premiseIds', claimMap);
    array(claim, p, 'conceptIds', conceptMap);
    array(claim, p, 'caveats');
    if (claim.mappingIds !== undefined) array(claim, p, 'mappingIds', mappingMap);
    if (claim.reviewedAt !== null && claim.reviewedAt !== undefined && !validDate(claim.reviewedAt)) fail(`${p}.reviewedAt`, 'must be a valid YYYY-MM-DD date or null');
    if (claim.reasoning !== undefined && !isText(claim.reasoning)) fail(`${p}.reasoning`, 'must be a nonempty string when supplied');
    if (claim.status === 'reviewed') {
      if (!validDate(claim.reviewedAt)) fail(`${p}.reviewedAt`, 'reviewed claims need an actual review date');
      if (claim.reviewKind === 'not-reviewed') fail(`${p}.reviewKind`, 'reviewed claims need an explicit review kind');
      for (const premise of ids(claim.premiseIds)) {
        if (claimMap.has(premise) && claimMap.get(premise).status !== 'reviewed') fail(`${p}.premiseIds`, `reviewed claim depends on unpublished premise ${premise}`);
      }
      const evidence = ids(claim.evidenceIds).map(id => evidenceMap.get(id)).filter(Boolean);
      if (claim.kind === 'source-statement' && !evidence.some(e => e.relation === 'supports')) fail(`${p}.evidenceIds`, 'reviewed source-statement needs supporting evidence; context alone is insufficient');
      if (claim.kind === 'interpretation' && evidence.length === 0 && ids(claim.premiseIds).length === 0) fail(p, 'reviewed interpretation needs evidence or premises');
      if (['synthesis', 'calculation', 'proposal'].includes(claim.kind)) {
        if (!isText(claim.reasoning)) fail(`${p}.reasoning`, 'reviewed derived claims need explicit reasoning');
        if (ids(claim.premiseIds).length === 0) fail(`${p}.premiseIds`, 'reviewed derived claims need identified premises');
      }
      for (const e of evidence) {
        const source = sourceMap.get(e.sourceId);
        if (e.relation === 'supports' && source && ['metadata-only', 'unavailable'].includes(source.accessStatus)) fail(`${p}.evidenceIds`, `supporting evidence ${e.id} was not inspected`);
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
  sources: ['id', 'title', 'url', 'version', 'publisher', 'accessedAt', 'accessStatus', 'rights', 'preservation'],
  evidence: ['id', 'sourceId', 'locator', 'summary', 'relation'],
  claims: ['id', 'text', 'kind', 'scope', 'evidenceIds', 'premiseIds', 'conceptIds', 'mappingIds', 'status', 'reviewedAt', 'reviewKind', 'caveats', 'reasoning'],
  concepts: ['id', 'label', 'english', 'definitionClaimIds', 'aliases'],
  mappings: ['id', 'from', 'to', 'relation', 'conditions', 'claimIds'],
  coverage: ['id', 'title', 'status', 'notes'],
};
const select = (section, record) => Object.fromEntries(fields[section].filter(key => record[key] !== undefined).map(key => [key, structuredClone(record[key])]));

/** Only reviewed claims and their public reference closure enter projections. */
export function publicCatalog(data) {
  const errors = validateCatalog(data);
  if (errors.length) throw new Error(`Cannot publish invalid catalog:\n${errors.join('\n')}`);
  const claims = data.claims.filter(c => c.status === 'reviewed');
  const claimIds = new Set(claims.map(c => c.id));
  const evidenceIds = new Set(claims.flatMap(c => c.evidenceIds));
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
  for (const e of records(data, 'evidence')) add(e.sourceId, e.id);
  for (const c of records(data, 'claims')) {
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
