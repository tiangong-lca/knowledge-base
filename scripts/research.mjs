import { artifactFields, validateArtifact } from './knowledge.mjs';
/** Integrity checks for discovery and selected-reading records, not scientific approval. */
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) ? value : [];
const objects = value => list(value).filter(object);
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
const inspected = ['selected-passages', 'web-sections'];
const readingStates = [...inspected, 'metadata-only', 'not-close-read'];
const accessStates = ['metadata-only', 'abstract-or-excerpt', 'public-fulltext-available', 'login-required', 'unavailable'];
const indexById = values => new Map(objects(values).map(value => [value.id, value]));

export function validateResearch(literatureMap, readingRegister, catalog = {}) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const sourceMap = indexById(catalog?.sources);
  const bound = objects(catalog?.sources).some(source => source.reading?.readingId !== undefined)
    || objects(catalog?.evidence).some(evidence => evidence.readingId !== undefined || evidence.passageId !== undefined);
  // A legacy catalog may have neither register nor reading bindings.
  if (literatureMap == null && readingRegister == null && !bound) return errors;
  for (const [name, value] of [['literature-map', literatureMap], ['readings', readingRegister]]) {
    if (!object(value)) { fail(name, 'must be an object when research records or bindings exist'); continue; }
    if (value.schemaVersion !== 1) fail(`${name}.schemaVersion`, 'must equal 1');
    if (!validDate(value.updatedAt)) fail(`${name}.updatedAt`, 'must be a valid YYYY-MM-DD date');
  }
  const allIds = new Set();
  function id(value, path) {
    if (!text(value) || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(value)) fail(path, 'must be a stable nonempty identifier');
    else if (allIds.has(value)) fail(path, `duplicate ID ${value}`);
    else allIds.add(value);
  }
  function fields(value, path, names) {
    for (const name of names) if (!text(value[name])) fail(`${path}.${name}`, 'must be a nonempty string');
  }
  function array(value, path, name, target, nonempty = false) {
    if (!Array.isArray(value[name])) { fail(`${path}.${name}`, 'must be an array'); return []; }
    if (nonempty && value[name].length === 0) fail(`${path}.${name}`, 'must not be empty');
    const seen = new Set();
    for (const item of value[name]) {
      if (!text(item)) { fail(`${path}.${name}`, 'entries must be nonempty strings'); continue; }
      if (seen.has(item)) fail(`${path}.${name}`, `duplicate entry ${item}`);
      seen.add(item);
      if (target && !target.has(item)) fail(`${path}.${name}`, `unknown reference ${item}`);
    }
    return value[name];
  }
  function records(value, path, name) {
    if (!Array.isArray(value?.[name])) { fail(`${path}.${name}`, 'must be an array'); return []; }
    for (const [i, item] of value[name].entries()) if (!object(item)) fail(`${path}.${name}[${i}]`, 'must be an object');
    return objects(value[name]);
  }
  function date(value, path, name, ceiling) {
    if (!validDate(value[name])) fail(`${path}.${name}`, 'must be a valid YYYY-MM-DD date');
    else if (validDate(ceiling) && value[name] > ceiling) fail(`${path}.${name}`, 'must not follow the register update/check date');
  }
  function url(value, path) {
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail(path, 'must be an absolute HTTP(S) URL without credentials');
      if ([...parsed.searchParams.keys()].some(key => /^(?:token|access_token|signature|awsaccesskeyid|x-amz-signature|x-amz-credential|x-amz-security-token)$/i.test(key))) fail(path, 'must not contain access tokens or ephemeral signed credentials');
    } catch { fail(path, 'must be an absolute HTTP(S) URL'); }
  }
  const works = records(literatureMap, 'literature-map', 'records');
  const workMap = indexById(works);
  for (const work of works) {
    if (work.workId === undefined) continue;
    const path = `literature-map.records.${work.id}.workId`;
    if (!text(work.workId) || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(work.workId)) fail(path, 'must be a stable work alias');
    else if (workMap.has(work.workId) && workMap.get(work.workId) !== work) fail(path, `work alias collision ${work.workId}`);
    else workMap.set(work.workId, work);
  }
  if (!object(literatureMap?.protocol)) fail('literature-map.protocol', 'must be an object');
  const protocol = object(literatureMap?.protocol) ? literatureMap.protocol : {};
  fields(protocol, 'literature-map.protocol', ['id', 'sourcesPolicy']);
  array(protocol, 'literature-map.protocol', 'questions', undefined, true);
  array(protocol, 'literature-map.protocol', 'limitations', undefined, true);
  const queries = records(protocol, 'literature-map.protocol', 'queries');
  const queryMap = indexById(queries);
  for (const query of queries) {
    const path = `literature-map.queries.${query.id}`;
    id(query.id, `${path}.id`); fields(query, path, ['query', 'channel']);
    date(query, path, 'date', literatureMap?.updatedAt);
  }
  const seedIds = new Set();
  for (const work of works) {
    const path = `literature-map.records.${work.id}`;
    id(work.id, `${path}.id`);
    fields(work, path, ['title', 'contributors', 'year', 'kind', 'rights']);
    for (const field of ['goalSeedIds', 'volumes', 'topics', 'languages', 'regions', 'traditions', 'limitations']) array(work, path, field);
    array(work, path, 'catalogSourceIds', sourceMap);
    for (const seed of list(work.goalSeedIds)) {
      if (seedIds.has(seed)) fail(`${path}.goalSeedIds`, `seed ${seed} occurs in more than one record; merge same-work corrections`);
      seedIds.add(seed);
    }
    if (!object(work.identifiers)) fail(`${path}.identifiers`, 'must be an object');
    const urls = records(work, path, 'urls');
    if (!urls.length) fail(`${path}.urls`, 'must contain at least one source route');
    for (const [i, route] of urls.entries()) { url(route.url, `${path}.urls[${i}].url`); fields(route, `${path}.urls[${i}]`, ['role']); }
    if (!['verified', 'partial', 'unresolved'].includes(work.identityStatus)) fail(`${path}.identityStatus`, 'unsupported identity status');
    if (!accessStates.includes(work.accessStatus)) fail(`${path}.accessStatus`, 'unsupported access status');
    if (work.readingStatus !== 'not-close-read') fail(`${path}.readingStatus`, 'discovery records must remain not-close-read; bind actual selected reading separately');
    date(work, path, 'accessedAt', work.lastCheckedAt); date(work, path, 'lastCheckedAt', literatureMap?.updatedAt);
    if (!object(work.discovery)) fail(`${path}.discovery`, 'must be an object');
    const discovery = object(work.discovery) ? work.discovery : {};
    fields(discovery, `${path}.discovery`, ['reason']);
    array(discovery, `${path}.discovery`, 'queryIds', queryMap, true);
    array(discovery, `${path}.discovery`, 'citationParents', workMap);
    if (list(discovery.citationParents).includes(work.id)) fail(`${path}.discovery.citationParents`, 'must not cite itself as a discovery parent');
  }
  for (const gap of records(literatureMap, 'literature-map', 'gaps')) {
    const path = `literature-map.gaps.${gap.id}`; id(gap.id, `${path}.id`);
    fields(gap, path, ['description', 'nextSearch']); array(gap, path, 'volumes');
    if (!['high', 'normal'].includes(gap.priority)) fail(`${path}.priority`, 'must be high or normal');
  }
  const readings = records(readingRegister, 'readings', 'readings');
  const readingMap = indexById(readings);
  const passageMap = new Map();
  for (const reading of readings) {
    const path = `readings.${reading.id}`; id(reading.id, `${path}.id`);
    fields(reading, path, ['workId', 'title', 'version', 'rights']); url(reading.url, `${path}.url`);
    if (!workMap.has(reading.workId)) fail(`${path}.workId`, `unknown literature-map work ${reading.workId}`);
    if (!readingStates.includes(reading.readingStatus)) fail(`${path}.readingStatus`, 'unsupported reading upgrade; this schema records selected passages/web sections, not full-work close reading');
    date(reading, path, 'accessedAt', readingRegister?.updatedAt);
    const didRead = inspected.includes(reading.readingStatus);
    if (didRead) {
      date(reading, path, 'readAt', readingRegister?.updatedAt);
      if (validDate(reading.readAt) && validDate(reading.accessedAt) && reading.readAt < reading.accessedAt) fail(`${path}.readAt`, 'must not precede access');
      fields(reading, path, ['question', 'argumentSummary']);
    } else if (reading.readAt !== undefined && reading.readAt !== null) fail(`${path}.readAt`, 'unread/metadata-only record cannot claim a reading date');
    array(reading, path, 'unread');
    if (reading.sourceKeys !== undefined) array(reading, path, 'sourceKeys');
    if (didRead && !object(reading.appraisal)) fail(`${path}.appraisal`, 'inspected passages need an explicit appraisal');
    if (object(reading.appraisal)) {
      const appraisal = reading.appraisal;
      fields(appraisal, `${path}.appraisal`, ['basis', 'methodologicalScope', 'independence']);
      array(appraisal, `${path}.appraisal`, 'limitations');
      if (!['agent-source-check', 'human-source-check', 'human-editorial-review', 'human-expert-review', 'not-reviewed'].includes(appraisal.reviewKind)) fail(`${path}.appraisal.reviewKind`, 'unsupported review kind');
      if (didRead && appraisal.reviewKind === 'not-reviewed') fail(`${path}.appraisal.reviewKind`, 'inspected reading cannot claim no review');
      date(appraisal, `${path}.appraisal`, 'checkedAt', readingRegister?.updatedAt);
      if (validDate(appraisal.checkedAt) && validDate(reading.readAt) && appraisal.checkedAt < reading.readAt) fail(`${path}.appraisal.checkedAt`, 'must not precede reading');
    }
    const artifacts = records(reading, path, 'artifacts');
    if (didRead && !artifacts.length) fail(`${path}.artifacts`, 'inspected reading needs a fixed artifact identity');
    const localArtifacts = indexById(artifacts);
    for (const artifact of artifacts) {
      const ap = `${path}.artifacts.${artifact.id}`; id(artifact.id, `${ap}.id`);
      validateArtifact(artifact, ap, fail, url, true);
    }
    const passages = records(reading, path, 'passages');
    if (didRead && !passages.length) fail(`${path}.passages`, 'selected reading needs actual located passages');
    if (!didRead && passages.length) fail(`${path}.passages`, 'metadata-only or unread records cannot contain inspected passages');
    for (const passage of passages) {
      const pp = `${path}.passages.${passage.id}`; id(passage.id, `${pp}.id`);
      passageMap.set(passage.id, { passage, reading });
      fields(passage, pp, ['artifactId', 'locator']); array(passage, pp, 'topics', undefined, true); array(passage, pp, 'limits');
      const artifact = localArtifacts.get(passage.artifactId);
      if (!artifact) fail(`${pp}.artifactId`, `unknown artifact ${passage.artifactId} within this reading`);
      for (const [field, mediaType, boundField] of [['pdfIndices', 'application/pdf', 'pageCount'], ['nepisBlocks', 'text/html', 'blockCount']]) {
        if (passage[field] === undefined) continue;
        if (!Array.isArray(passage[field]) || !passage[field].length) { fail(`${pp}.${field}`, 'must be a nonempty array of zero-based indices'); continue; }
        if (artifact && artifact.mediaType !== mediaType) fail(`${pp}.${field}`, `requires a ${mediaType} artifact, not another carrier`);
        const seen = new Set();
        for (const index of passage[field]) {
          if (!Number.isSafeInteger(index) || index < 0) fail(`${pp}.${field}`, 'indices must be nonnegative safe integers');
          else if (artifact && Number.isSafeInteger(artifact[boundField]) && index >= artifact[boundField]) fail(`${pp}.${field}`, `index ${index} is outside artifact ${boundField} ${artifact[boundField]}`);
          if (seen.has(index)) fail(`${pp}.${field}`, `duplicate index ${index}`);
          seen.add(index);
        }
      }
      if (artifact?.mediaType === 'application/pdf' && !Array.isArray(passage.pdfIndices)) fail(`${pp}.pdfIndices`, 'PDF passages need explicit zero-based indices');
    }
  }
  for (const gap of records(readingRegister, 'readings', 'gaps')) {
    const path = `readings.gaps.${gap.id}`; id(gap.id, `${path}.id`);
    fields(gap, path, ['description', 'nextAction']); array(gap, path, 'affectedUnits', undefined, true);
  }
  for (const revision of records(readingRegister, 'readings', 'revisions')) {
    const path = `readings.revisions.${revision.id}`; id(revision.id, `${path}.id`);
    fields(revision, path, ['before', 'after', 'reasoning', 'status']);
    array(revision, path, 'triggerPassageIds', passageMap, true); array(revision, path, 'affectedUnits', undefined, true);
  }
  for (const source of sourceMap.values()) {
    if (!object(source.reading) || source.reading.readingId === undefined) continue;
    const path = `sources.${source.id}`;
    const reading = readingMap.get(source.reading.readingId);
    if (!reading) { fail(`${path}.reading.readingId`, `unknown reading ${source.reading.readingId}`); continue; }
    if (source.reading.status !== reading.readingStatus) fail(`${path}.reading.status`, 'must match the bound reading scope/status');
    if (validDate(source.reading.checkedAt) && validDate(reading.readAt) && source.reading.checkedAt < reading.readAt) fail(`${path}.reading.checkedAt`, 'must not precede the bound reading');
    if (inspected.includes(reading.readingStatus)) {
      if (['metadata-only', 'unavailable'].includes(source.accessStatus)) fail(`${path}.accessStatus`, 'cannot bind inspected reading to uninspected source access');
      if (['public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)) fail(`${path}.accessStatus`, 'selected reading does not establish full-text inspection');
      if (!object(source.artifact)) fail(`${path}.artifact`, 'bound selected reading needs its artifact snapshot');
    }
    if (object(source.artifact)) {
      const match = objects(reading.artifacts).find(artifact => digest(artifact.sha256) && digest(source.artifact.sha256) && artifact.sha256.toLowerCase() === source.artifact.sha256.toLowerCase());
      if (!match) fail(`${path}.artifact.sha256`, 'does not match any artifact in the bound reading');
      else for (const field of artifactFields.filter(field => field !== 'sha256')) {
        const sourceValue = field === 'kind' ? source.artifact.kind ?? 'retrieved' : source.artifact[field];
        const readingValue = field === 'kind' ? match.kind ?? 'retrieved' : match[field];
        if (sourceValue !== readingValue) fail(`${path}.artifact.${field}`, 'must match the same bound artifact identity');
      }
    }
    const work = workMap.get(reading.workId);
    if (work && list(work.catalogSourceIds).length && !work.catalogSourceIds.includes(source.id)) fail(`${path}.reading.readingId`, 'bound source is absent from the work catalogSourceIds');
  }
  // catalogSourceIds are optional joins, but populated joins must agree in both directions.
  for (const work of works) for (const sourceId of list(work.catalogSourceIds)) {
    const readingId = sourceMap.get(sourceId)?.reading?.readingId;
    if (readingId !== undefined && readingMap.has(readingId) && workMap.get(readingMap.get(readingId).workId) !== work) fail(`literature-map.records.${work.id}.catalogSourceIds`, `source ${sourceId} is bound to another work`);
  }
  for (const evidence of objects(catalog?.evidence)) {
    if (evidence.readingId === undefined && evidence.passageId === undefined) continue;
    const path = `evidence.${evidence.id}`;
    if (!text(evidence.readingId) || !text(evidence.passageId)) { fail(path, 'readingId and passageId must be supplied together as nonempty identifiers'); continue; }
    const reading = readingMap.get(evidence.readingId); const located = passageMap.get(evidence.passageId);
    if (!reading) fail(`${path}.readingId`, `unknown reading ${evidence.readingId}`);
    if (!located) fail(`${path}.passageId`, `unknown passage ${evidence.passageId}`);
    else if (located.reading.id !== evidence.readingId) fail(`${path}.passageId`, 'passage belongs to another reading');
    if (reading && !inspected.includes(reading.readingStatus)) fail(`${path}.readingId`, 'evidence requires an inspected selected reading');
    const source = sourceMap.get(evidence.sourceId);
    if (!source || source.reading?.readingId !== evidence.readingId) fail(`${path}.sourceId`, 'source must bind to the same reading as the evidence');
  }
  return errors;
}

// Public projections use explicit shape/primitive allowlists at every level. Unknown
// fields (including local cache paths or collaborator notes) never enter exports.
// Call validateResearch with the catalog before publishing; projection alone does
// not establish identity, reading completion, source rights or scientific review.
const select = (value, scalarFields, arrayFields = []) => {
  const result = {};
  if (!object(value)) return result;
  for (const field of scalarFields) {
    const entry = value[field];
    if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' || entry === null) result[field] = entry;
  }
  for (const field of arrayFields) if (Array.isArray(value[field])) result[field] = value[field].filter(text);
  return result;
};
const publicArtifact = artifact => select(artifact, ['id', ...artifactFields, 'blockCount']);
const publicPassage = passage => {
  const result = select(passage, ['id', 'artifactId', 'locator', 'printedPages'], ['topics', 'limits']);
  for (const field of ['pdfIndices', 'nepisBlocks']) if (Array.isArray(passage[field])) result[field] = passage[field].filter(Number.isSafeInteger);
  return result;
};
export function publicResearch(literatureMap, readingRegister) {
  const literature = select(literatureMap, ['schemaVersion', 'updatedAt']);
  literature.protocol = select(literatureMap?.protocol, ['id', 'sourcesPolicy'], ['questions', 'limitations']);
  literature.protocol.queries = objects(literatureMap?.protocol?.queries).map(query => select(query, ['id', 'query', 'date', 'channel']));
  literature.records = objects(literatureMap?.records).map(work => ({
    ...select(work, ['id', 'workId', 'title', 'contributors', 'year', 'kind', 'identityStatus', 'accessStatus', 'readingStatus', 'accessedAt', 'lastCheckedAt', 'rights'],
      ['goalSeedIds', 'volumes', 'topics', 'languages', 'regions', 'traditions', 'limitations', 'catalogSourceIds']),
    urls: objects(work.urls).map(route => select(route, ['url', 'role'])),
    identifiers: select(work.identifiers, ['doi', 'isbn', 'report', 'edition', 'ncid', 'standard', 'adoption', 'celex', 'series', 'articleNumber', 'correctionDoi', 'discoveryRecord', 'manifestationNote']),
    discovery: select(work.discovery, ['reason'], ['queryIds', 'citationParents']),
  }));
  literature.gaps = objects(literatureMap?.gaps).map(gap => select(gap, ['id', 'description', 'priority', 'nextSearch'], ['volumes']));
  const ledger = select(readingRegister, ['schemaVersion', 'updatedAt']);
  ledger.readings = objects(readingRegister?.readings).map(reading => {
    const result = {
      ...select(reading, ['id', 'workId', 'title', 'version', 'url', 'accessedAt', 'readAt', 'readingStatus', 'question', 'argumentSummary', 'rights'], ['unread', 'sourceKeys']),
      artifacts: objects(reading.artifacts).map(publicArtifact),
      passages: objects(reading.passages).map(publicPassage),
    };
    if (object(reading.appraisal)) result.appraisal = select(reading.appraisal, ['basis', 'methodologicalScope', 'independence', 'reviewKind', 'checkedAt'], ['limitations']);
    return result;
  });
  ledger.gaps = objects(readingRegister?.gaps).map(gap => select(gap, ['id', 'description', 'nextAction'], ['affectedUnits']));
  ledger.revisions = objects(readingRegister?.revisions).map(revision => select(revision, ['id', 'before', 'after', 'reasoning', 'status'], ['triggerPassageIds', 'affectedUnits']));
  return { literatureMap: literature, readingLedger: ledger };
}
