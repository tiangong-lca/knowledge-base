import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import htmlParser from 'next/dist/compiled/node-html-parser/index.js';
import capture from '../config/reader-copyedit-8148-capture.json' with { type: 'json' };
import { editionDigest, matchesAcceptedFile, readableBookReviewSubject, sha256 } from './reader-current-edition.mjs';
import { containerPrintLinkLayout, containerPrintLinks, copyeditChanges, copyeditLayout, copyeditOutput, copyeditSourceStructure, egridTableCopy, qualifyReaderCopyedit, readerCopyeditSupportReferences, restoreWallStaticCopy, selectReaderCopyedit, verifyReaderCopyeditSupport, wallStaticCopy } from './reader-copyedit.mjs';
import { copyeditHistoryEntries, copyeditHistoryPlan, fingerprintCopyeditPrintParts, validateCopyeditHistory } from './reader-copyedit-history.mjs';
import { readerCopyeditCaptureDigest, readerCopyeditSource } from './reader-copyedit-pins.mjs';

const source = readerCopyeditSource;
const unit = {
  id: 'chinese-expression-95', source, captureDigest: readerCopyeditCaptureDigest,
  changes: [], layouts: [], consumers: [], ordinary: [], titles: [], outputs: [], publicArtifacts: [],
};

test('8148 capture is actual, independently pinned, and uses the visible title instead of the stable id', () => {
  assert.equal(editionDigest(capture), readerCopyeditCaptureDigest);
  assert.equal(Object.keys(capture.checkedHtml).length, 50);
  assert.equal(capture.addresses['/docs/book/early-container-policy-and-systems#政策理由与数量对象'].title, '干预理由');
  assert.throws(() => copyeditHistoryPlan({
    ...unit, scope: ['/docs/book/early-container-policy-and-systems#政策理由与数量对象'], titles: [{ address: '/docs/book/early-container-policy-and-systems#政策理由与数量对象',
      from: '政策理由与数量对象', to: '政策干预的理由', rationale: 'Exact title test' }],
  }), /actual 8148 title/);
});

test('private successor plan cannot pass the production selection gate', () => {
  const preview = { schemaVersion: 1, status: 'preview', unit };
  assert.equal(selectReaderCopyedit(preview, null, true), unit);
  assert.throws(() => selectReaderCopyedit(preview, null), /not independently accepted/);
  assert.throws(() => selectReaderCopyedit({ ...preview, status: 'reviewed' }, null), /not independently accepted/);
  assert.throws(() => selectReaderCopyedit({ schemaVersion: 1, status: 'inactive' }, editionDigest(unit)), /predecessor/);
});

test('the original predicate can reach only a matching intermediate 8148 successor', () => {
  const key = 'content/docs/book/reader.mdx';
  const previous = { file: new Map([[key, { from: 'old', to: '8148' }]]), record: new Map() };
  const row = { key, kind: 'file', from: '8148', to: 'copyedited', rationale: 'Actual fixture' };
  const changes = copyeditChanges(previous, { changes: [row] });
  for (const predecessor of ['old', '8148']) assert(matchesAcceptedFile({ changes }, key, predecessor, 'copyedited'));
  assert(!matchesAcceptedFile({ changes }, key, 'forged', 'copyedited'));
  assert.throws(() => copyeditChanges(previous, { changes: [{ ...row, from: 'old' }] }), /stale predecessor/);
  assert.throws(() => copyeditChanges(previous, { changes: [{ ...row, key: 'knowledge/cases/wall-coating-v1.json' }] }), /invalid change/);
});

test('copyediting preserves template metadata, scientific links and the exact token roster', () => {
  const path = 'knowledge/cases/sample-v1.publication.json';
  const catalog = { claims: [{ id: 'cl-x', text: '文字。', scope: '条件。', caveats: ['前提。'], premiseIds: ['cl-y'], reviewedAt: '2026-11-12' }] };
  const publication = { inputFile: 'sample-v1.json', reviewedAt: '2026-11-12', claims: [{ id: 'cl-x', textTemplate: '数为{{x.y}}。', caveats: [] }] };
  const structure = (records, data) => copyeditSourceStructure({ catalog: records, files: new Map([[path, Buffer.from(JSON.stringify(data))]]) });
  const original = structure(catalog, publication);
  const changed = (field, value) => ({ claims: [{ ...catalog.claims[0], [field]: value }] });
  assert.deepEqual(structure(changed('text', '表述。'), publication), original);
  assert.notDeepEqual(structure(changed('reviewedAt', '2026-11-13'), publication), original);
  assert.notDeepEqual(structure(changed('premiseIds', []), publication), original);
  assert.notDeepEqual(structure(changed('scope', '范围换成另一种说法。'), publication), original);
  assert.notDeepEqual(structure(changed('caveats', ['同样一条、含义不同。']), publication), original);
  const changeTemplate = (field, value) => ({ ...publication,
    claims: [{ ...publication.claims[0], [field]: value }] });
  const templateWithCaveat = changeTemplate('caveats', ['原条件。']);
  assert.notDeepEqual(structure(catalog, templateWithCaveat), structure(catalog, changeTemplate('caveats', ['假设不同。'])));
  assert.notDeepEqual(structure(catalog, changeTemplate('scope', '改范围。')), original);
  assert.notDeepEqual(structure(catalog, { ...publication, claims: [{ ...publication.claims[0], textTemplate: '数为{{x.z}}。' }] }), original);
});

test('same-place ordinary wording advances exact old destinations without adding historical UI', () => {
  const address = '/docs/book/early-container-policy-and-systems#nd-page';
  const entry = capture.addresses[address];
  const from = entry.ordinary[0], to = 'd'.repeat(64);
  const copyedit = copyeditHistoryPlan({ ...unit, scope: [address], ordinary: [{ address, index: 0, from, to, rationale: 'Same-place punctuation fixture' }] });
  const target = { path: '/docs/book/early-container-policy-and-systems', id: 'nd-page', route: entry.route, kind: 'chapter' };
  const historical = { targets: [target], ordinaryDispositions: [{ oldSha256: 'historical', destinations: [{ address, currentSha256: from }] }] };
  const [rebound] = copyeditHistoryEntries([historical], copyedit);
  assert.deepEqual(rebound.ordinaryDispositions[0].destinations, [{ address, currentSha256: to }]);
  assert.deepEqual(historical.ordinaryDispositions[0].destinations, [{ address, currentSha256: from }]);
  const addresses = { ...capture.addresses, [address]: { ...entry, ordinary: [to, ...entry.ordinary.slice(1)] } };
  assert.deepEqual(validateCopyeditHistory(new Map(), addresses, copyedit), []);
  assert(validateCopyeditHistory(new Map(), { ...addresses, [address]: { ...entry, claimIds: [...entry.claimIds].reverse() } }, copyedit)
    .some(error => error.includes('ordered scope')));
});

test('a changed output replaces only its exact earlier observation', () => {
  const key = '/print#/sample', before = '1'.repeat(64), after = '2'.repeat(64);
  const earlier = new Map([[key, { sha256: before }]]);
  const rows = [{ path: '/print', route: '/sample', from: before, sha256: after, rationale: 'Actual output fixture' }];
  assert.equal(copyeditOutput(earlier, rows, row => `${row.path}#${row.route}`).get(key).sha256, after);
  assert.throws(() => copyeditOutput(earlier, [{ ...rows[0], from: after }], row => `${row.path}#${row.route}`), /stale predecessor/);
});

test('a renamed retained section must show its exact original title and source in the native disclosure', () => {
  const path = '/docs/book/early-container-policy-and-systems';
  const id = '政策理由与数量对象';
  const address = `${path}#${id}`, actual = capture.addresses[address];
  const row = { address, from: actual.title, to: '政策干预的理由', rationale: 'Fixture for the actual original section' };
  const plan = copyeditHistoryPlan({ ...unit, scope: [address], titles: [row] });
  const surfaces = { ...capture.addresses, [address]: { ...actual, title: row.to } };
  const valid = `<article><h2 id="${id}">${row.to}</h2><details class="legacy-citation-context" data-copyedit-history="${id}"><summary>此处在 <time datetime="2026-11-12">2026-11-12</time> 版题为“${row.from}”。</summary><a href="https://github.com/tiangong-lca/knowledge-base/tree/${source.commit}">查看该版源文件</a></details></article>`;
  const verify = value => validateCopyeditHistory(new Map([[path, htmlParser.parse(value)]]), surfaces, plan);
  assert.deepEqual(verify(valid), []);
  assert.deepEqual(verify(valid.replace(' 版题为', '<!-- --> 版题为')), []);
  assert(verify(valid.replace(row.from, id)).some(error => error.includes('historical title')));
  assert(verify(valid.replace(source.commit, 'another-commit')).some(error => error.includes('historical title')));
  for (const suppressed of [
    valid.replace('<details ', '<details hidden '),
    valid.replace('<details ', '<details aria-hidden="true" style="display:none" '),
    valid.replace('<summary>', '<summary tabindex="-1">'),
    valid.replace(row.from, `<span hidden>${row.from}</span>`),
    valid.replace(row.from, `<span>${row.from}</span>`),
    valid.replace('</time>', '<span></span></time>'),
    valid.replace('查看该版源文件', '<span>查看该版源文件</span>'),
    valid.replace('</summary>', '</summary><span></span>'),
    valid.replace('<article>', '<article inert>'),
    valid.replace('<article>', '<article style="visibility:hidden!important">'),
  ]) assert(verify(suppressed).some(error => error.includes('historical title')));
});

test('layout selection rejects scientific predicates even in an exact digest-pinned envelope', () => {
  for (const key of ['B04:appendix-claims', 'B17:reverse-premise-consumers', 'B17:reverse-evidence-consumers',
    'B27:external-consumers', 'B29:interaction-mode']) {
    const layout = { key, from: editionDigest(['old']), to: [], rationale: 'Fixture for an impermissible amendment' };
    const subject = { ...unit, layouts: [layout] };
    const config = { schemaVersion: 1, status: 'reviewed', unit: subject };
    assert.throws(() => selectReaderCopyedit(config, editionDigest(subject)), /invalid layout/);
    assert.throws(() => copyeditLayout(key, ['old'], subject), /protected structure/);
  }
});

test('layout wording leaves scientific members, section IDs, navigation destinations, and shape intact', () => {
  function verify(key, old, to) {
    return copyeditLayout(key, old, { layouts: [{ key, from: editionDigest(old), to, rationale: 'Test wording' }] });
  }
  const headings = [{ id: 'frozen-id', title: '旧题', claimIds: ['claim-one'] }];
  assert.deepEqual(verify('B04:sections', headings, [{ ...headings[0], title: '新题' }]), [{ ...headings[0], title: '新题' }]);
  assert.throws(() => verify('B04:sections', headings, [{ ...headings[0], claimIds: [] }]), /protected structure/);
  assert.throws(() => verify('B04:sections', headings, [{ ...headings[0], id: 'changed' }]), /protected structure/);
  assert.throws(() => verify('B04:sections', headings, [{ ...headings[0], extra: true }]), /protected structure/);
  const continuation = [{ key: 'fixed', bookKey: 'old-destination', sourceHref: '/docs/original/', bookLabel: '旧题' }];
  assert.throws(() => verify('book:continuations', continuation, [{ ...continuation[0], sourceHref: '/docs/wrong/' }]), /protected structure/);
  assert.throws(() => verify('book:continuations', continuation, [{ ...continuation[0], bookKey: 'another-chapter' }]), /protected structure/);
  const ordinary = [{ block: 4, sourceHeading: 'frozen-id', text: '参见[旧题](/docs/original/)。' }];
  assert.doesNotThrow(() => verify('S01:ordinary', ordinary, [{ ...ordinary[0], text: '参见[新题](/docs/original/)。' }]));
  assert.throws(() => verify('S01:ordinary', ordinary, [{ ...ordinary[0], text: '参见[新题](/docs/wrong/)。' }]), /protected structure/);
});

test('claim overlay cannot change a protected digest even if accepted endpoints are supplied', () => {
  const from = { raw: editionDigest('old'), public: editionDigest('old'), protected: editionDigest('original caveat') };
  const to = { ...from, raw: editionDigest('revised'), protected: editionDigest('replaced caveat') };
  const change = { kind: 'record', key: 'claims:cl-example', from, to, rationale: 'Test for scope and caveat invariance' };
  assert.throws(() => copyeditChanges({ file: new Map(), record: new Map() }, { changes: [change] }), /invalid change/);
});

test('the successor rejects self-consistent prepublication and incomplete review receipts', () => {
  function receipts(date) {
    const subject = { ...unit, scope: ['fixture'] };
    const artifacts = new Map();
    subject.reviewEvidence = ['source', 'reader', 'output'].map(kind => {
      const shared = { schemaVersion: 1, kind, date, unit: subject.id, subjectSha256: readableBookReviewSubject(subject, kind) };
      const artifact = JSON.stringify({ ...shared, observed: 'placeholder', scope: subject.scope });
      const artifactSha256 = sha256(artifact);
      const report = JSON.stringify({ ...shared, artifactSha256, disposition: 'accepted',
        findings: 'placeholder', reviewer: 'placeholder', provenance: 'placeholder' });
      const prefix = '_docs/editorial/review-evidence/copyedit-fixture/' + kind;
      const reportFile = prefix + '-report.json', artifactFile = prefix + '-artifact.json';
      artifacts.set(reportFile, report);
      artifacts.set(artifactFile, artifact);
      return { kind, date, reportFile, artifactFile, reportSha256: sha256(report), artifactSha256 };
    });
    return { unit: subject, artifacts, previous: { outputs: new Map(), publicArtifacts: new Map(),
      changes: { file: new Map(), record: new Map() } } };
  }
  for (const date of ['2000-01-01', source.capturedAt])
    assert.throws(() => qualifyReaderCopyedit(receipts(date)), /complete source, reader or output review evidence/);
});

test('printed part fingerprints cover their wrapper, title, introduction and historical disclosure', () => {
  const html = Array.from({ length: 7 }, (_, index) => {
    const id = `print-part-${index + 1}`;
    return `<section data-reader-part-group="${index + 1}"><h2 id="${id}">部题</h2><details data-copyedit-history="${id}"><summary>旧题</summary></details><p class="print-part-introduction">部引言</p><article>章正文</article></section>`;
  }).join('');
  const fingerprint = input => fingerprintCopyeditPrintParts(htmlParser.parse(input));
  assert.equal(fingerprint(html).length, 7);
  assert.deepEqual(fingerprint(html.replace('章正文', '修订正文')), fingerprint(html));
  for (const changed of [html.replace('部引言', '改引言'), html.replace('部题', '改题'),
    html.replace('<details ', '<details aria-hidden="true" '), html.replace('<section ', '<section inert ')])
    assert.notEqual(fingerprint(changed)[0].sha256, fingerprint(html)[0].sha256);
});

test('handwritten table data and actual ordinary links remain protected independently of prose hashes', () => {
  const key = 'content/docs/book/early-container-comparisons.mdx';
  const mdx = '| 对象 | 数字 | 单位 |\n| --- | --- | --- |\n| 对象 | 5965.910 | 百万Btu |\n参见表8。';
  const structure = value => copyeditSourceStructure({ catalog: { claims: [] }, files: new Map([[key, Buffer.from(value)]]) });
  assert.deepEqual(structure(mdx.replace('参见表8', '见表9').replace('数字', '数值')), structure(mdx));
  for (const text of [mdx.replace('5965.910', '9999.999'), mdx.replace('百万Btu', '千瓦时')])
    assert.notDeepEqual(structure(text), structure(mdx));

  const address = '/docs/book/early-container-comparisons#nd-page';
  const old = capture.addresses[address];
  const links = structuredClone(old.bindings.links);
  const from = links.findIndex(row => row.length);
  const next = (from + 1) % links.length;
  const previousOrder = links.flat();
  if (next > from) links[next].unshift(...links[from].splice(0));
  else links[next].push(...links[from].splice(0));
  assert.deepEqual(links.flat(), previousOrder);
  const changed = { ...old, bindings: { ...old.bindings, links } };
  const plan = copyeditHistoryPlan(unit);
  const errors = validateCopyeditHistory(new Map(), { ...capture.addresses, [address]: changed }, plan);
  assert(errors.some(error => error.includes('ordinary link destinations')));
});

test('supporting receipts resolve exact, nonrecursive bytes with their own subject, kind, role and date', () => {
  const date = source.capturedAt, name = '_docs/editorial/review-evidence/chinese-expression-95/';
  const roles = { source: ['before-after', 'source-meaning-review'], reader: ['reader-review'], output: ['actual-output-review'] };
  const artifactFile = kind => name + kind + '-artifact.json';
  const subject = { ...unit, reviewEvidence: Object.keys(roles).map(kind => ({
    kind, date, artifactFile: artifactFile(kind), reportFile: name + kind + '-report.json',
  })) };
  const artifacts = new Map();
  for (const [kind, names] of Object.entries(roles)) {
    const subjectSha256 = readableBookReviewSubject(subject, kind);
    const supportingEvidence = names.map(role => {
      const file = name + role + '.json';
      const bytes = JSON.stringify({ schemaVersion: 1, kind, role, date, subjectSha256,
        unit: subject.id, summary: 'Test fixture for verifying actual support bytes.' });
      artifacts.set(file, bytes);
      return { role, label: role, file, sha256: sha256(bytes) };
    });
    artifacts.set(artifactFile(kind), JSON.stringify({ supportingEvidence }));
  }
  const references = readerCopyeditSupportReferences(subject, artifacts);
  assert.equal(references.length, 4);
  for (const reference of references) assert(verifyReaderCopyeditSupport(reference, subject, artifacts.get(reference.file)));
  const [reference] = references;
  assert(!verifyReaderCopyeditSupport(reference, subject, undefined));
  assert(!verifyReaderCopyeditSupport(reference, subject, artifacts.get(reference.file) + ' '));
  for (const change of [{ date: '2000-01-01' }, { subjectSha256: 'x' }, { kind: 'reader' }, { role: 'reader-review' }, { supportingEvidence: [] }]) {
    const bytes = JSON.stringify({ ...JSON.parse(artifacts.get(reference.file)), ...change });
    assert(!verifyReaderCopyeditSupport({ ...reference, sha256: sha256(bytes) }, subject, bytes));
  }
  const original = JSON.parse(artifacts.get(artifactFile('source'))).supportingEvidence;
  for (const items of [[original[0], original[0]], [{ ...original[0], file: '/tmp/review.json' }, original[1]]]) {
    const invalid = new Map(artifacts).set(artifactFile('source'), JSON.stringify({ supportingEvidence: items }));
    assert.throws(() => readerCopyeditSupportReferences(subject, invalid), /supporting evidence/);
  }
});

test('the wall caption permits only its exact source bytes and its matching static display transition', () => {
  const original = readFileSync(new URL('../' + wallStaticCopy.path, import.meta.url), 'utf8');
  const frozen = restoreWallStaticCopy(original) ?? original;
  assert.equal(sha256(frozen), wallStaticCopy.beforeSha256);
  const revised = frozen.replace(`<p>${wallStaticCopy.from}</p>`, `<p>${wallStaticCopy.to}</p>`);
  assert.equal(sha256(revised), wallStaticCopy.afterSha256);
  assert.equal(restoreWallStaticCopy(revised), frozen);
  assert.equal(restoreWallStaticCopy(revised.replace(`${wallStaticCopy.from}</figcaption>`, `${wallStaticCopy.to}</figcaption>`)), null);
  assert.equal(restoreWallStaticCopy(revised + '\n'), null);

  const change = { kind: 'file', key: wallStaticCopy.path, from: wallStaticCopy.beforeSha256, to: wallStaticCopy.afterSha256, rationale: 'Static caption only' };
  const layout = { key: wallStaticCopy.layout, from: editionDigest(wallStaticCopy.from), to: wallStaticCopy.to, rationale: 'Static caption only' };
  const previous = { file: new Map(), record: new Map() };
  assert.equal(copyeditChanges(previous, { changes: [change], layouts: [layout] }).file.get(change.key).to, change.to);
  for (const candidate of [
    { changes: [change], layouts: [] },
    { changes: [], layouts: [layout] },
    { changes: [{ ...change, to: sha256(revised + '\n') }], layouts: [layout] },
    { changes: [change], layouts: [{ ...layout, to: '其他任意句子' }] },
  ]) assert.throws(() => copyeditChanges(previous, candidate), /exact paired wall static-caption/);
});

test('display successor preserves wrapped claim order, navigation and static table values', () => {
  const compare = (key, from, to) => copyeditLayout(key, from, { layouts: [{ key, from: editionDigest(from), to }] });
  const key = 'B15:/docs/book/climate-response-and-metrics:reader-source';
  const href = '/docs/appendices/climate-numerical-reconstruction/';
  const from = { source: { title: '气候指标', mdxSha256: 'a'.repeat(64),
    ordinary: [{ section: '旧节', text: '旧句', links: [{ text: '旧链接', href }] }],
    figure: { src: '/figure.svg', width: '700' } },
    occurrences: [{ id: 'cl-first', section: '旧节' }] };
  const to = structuredClone(from);
  to.source.title = '气候响应';
  to.source.ordinary[0].text = '新句';
  to.source.ordinary[0].links[0].text = '新链接';
  assert.deepEqual(compare(key, from, to), to);
  for (const mutate of [
    value => value.occurrences[0].id = 'another',
    value => value.source.mdxSha256 = 'b'.repeat(64),
    value => value.source.ordinary[0].links[0].href = '/docs/',
    value => value.source.figure.width = '1',
  ]) {
    const invalid = structuredClone(to);
    mutate(invalid);
    assert.throws(() => compare(key, from, invalid), /protected structure/);
  }
  const table = { introduction: '旧导语', headers: ['旧题'], rows: [['5965.910 Btu']], explanation: '旧解释' };
  assert.doesNotThrow(() => compare('B09:invoice-table', table, { ...table, headers: ['新题'] }));
  assert.throws(() => compare('B09:invoice-table', table, { ...table, rows: [['9999 Btu']] }), /protected structure/);
});

test('eGRID data table permits only the independently reviewed text in its known cell', () => {
  const table = text => `| 资料 | 用途 |\n| --- | --- |\n| ${egridTableCopy.label} | ${text} |\n| 另一资料 | 固定数据与单位 |`;
  const structure = value => copyeditSourceStructure({ catalog: { claims: [] },
    files: new Map([[egridTableCopy.path, Buffer.from(value)]]) });
  const from = table(egridTableCopy.from), to = table(egridTableCopy.to);
  assert.deepEqual(structure(from), structure(to));
  assert.notDeepEqual(structure(from), structure(to.replace('年净发电量','用户购电量')));
  assert.notDeepEqual(structure(from), structure(to.replace('固定数据与单位','另一个单位')));

  const plan = copyeditHistoryPlan({ ...unit,
    layouts: [{ key: egridTableCopy.key, from: editionDigest(egridTableCopy.from), to: egridTableCopy.to }] });
  const observed = structuredClone(capture.addresses);
  for (const row of Object.values(observed).filter(item => item.route === egridTableCopy.route && item.kind === 'chapter'))
    row.bindings.tables[0].body[0][1].text = egridTableCopy.to;
  assert.deepEqual(validateCopyeditHistory(new Map(), observed, plan), []);
  const web = observed[egridTableCopy.route + '#nd-page'];
  web.bindings.tables[0].body[1][1].text = '另外一个单位';
  assert(validateCopyeditHistory(new Map(), observed, plan).some(error => error.includes('table data')));
});

test('the container print pair accepts only its two fixed authored links and matched 8148 section scopes', () => {
  const layout = { key: containerPrintLinkLayout, from: editionDigest([]), to: containerPrintLinks };
  const candidate = { ...unit, layouts: [layout] };
  const plan = copyeditHistoryPlan(candidate);
  assert.equal(plan.printLinks.length, 2);
  assert.throws(() => copyeditLayout(containerPrintLinkLayout, [], {
    layouts: [{ ...layout, to: [{ ...containerPrintLinks[0], printId: containerPrintLinks[1].printId }, containerPrintLinks[1]] }],
  }), /protected structure/);
  const observed = structuredClone(capture.addresses);
  for (const link of containerPrintLinks) {
    const entry = Object.entries(observed).find(([address, row]) =>
      address.startsWith('/print#') && row.kind === 'chapter' && row.route === link.source)?.[1];
    assert(entry);
    entry.bindings.links = entry.bindings.links.map(block =>
      block.map(href => href === encodeURI(link.href) ? '#' + link.printId : href));
  }
  assert.deepEqual(validateCopyeditHistory(new Map(), observed, plan), []);
  const target = containerPrintLinks[0];
  const scope = observed['/print#' + target.printId];
  scope.claimIds = ['different-claim'];
  assert(validateCopyeditHistory(new Map(), observed, plan).some(error => error.includes('ordered scope')));
});
