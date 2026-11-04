import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { publicCatalog, buildDependencies } from './knowledge.mjs';
import { publicResearch } from './research.mjs';
import { loadCasePublications, validateCasePublications, canonicalCaseInput, caseEvaluationReceipt } from './case-publication.mjs';
import { validateRepository } from './validate.mjs';
const literatureMap = JSON.parse(readFileSync('knowledge/research/literature-map.json', 'utf8'));
const readingLedger = JSON.parse(readFileSync('knowledge/research/readings.json', 'utf8'));
const research = publicResearch(literatureMap, readingLedger);
const catalog = JSON.parse(readFileSync('knowledge/catalog.json', 'utf8'));
const cases = await loadCasePublications(process.cwd());
// Revalidate joins and public MDX independently of the preceding build step.
const errors = [...new Set([...validateCasePublications(cases, catalog), ...await validateRepository(process.cwd())])];
if (errors.length) throw new Error(errors.join('\n'));
for (const route of ['', 'docs', 'sources', 'claims', 'concepts', 'coverage', 'changes', 'print', 'research']) {
  if (!existsSync(`out/${route ? `${route}/` : ''}index.html`)) throw new Error(`Missing static route: ${route}`);
}
const published = publicCatalog(catalog);
const digest = createHash('sha256').update(JSON.stringify(published)).digest('hex');
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const worktreeStatus = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8' }).trimEnd();
const dirty = Boolean(worktreeStatus);
if (dirty) {
  console.warn(`Git worktree status (paths only, porcelain format):\n${worktreeStatus}`);
}
mkdirSync('out/downloads', { recursive: true });
for (const { inputFile, spec } of cases) {
  mkdirSync('out/downloads/cases', { recursive: true });
  writeFileSync(`out/downloads/cases/${inputFile}`, canonicalCaseInput(spec));
  writeFileSync(`out/downloads/cases/${inputFile.slice(0, -5)}.evaluated.json`, `${JSON.stringify(caseEvaluationReceipt(spec, sourceCommit), null, 2)}\n`);
}
writeFileSync('out/downloads/research.json', `${JSON.stringify(research, null, 2)}\n`);
writeFileSync('out/downloads/catalog.json', `${JSON.stringify(published, null, 2)}\n`);
writeFileSync('out/downloads/dependencies.json', `${JSON.stringify(buildDependencies(published), null, 2)}\n`);

writeFileSync('out/llms.txt', '# LCA Living Knowledge Base and Review\n\nChinese source-grounded living publication. Agent source checks are not human expert review.\n\n- [Review](/docs/)\n- [Claims and evidence](/claims/)\n- [Sources](/sources/)\n- [Literature map and selected readings](/research/)\n- [Research register](/downloads/research.json)\n- [Coverage and gaps](/coverage/)\n- [Machine-readable public catalog](/downloads/catalog.json)\n- [Build identity](/downloads/manifest.json)\n');
console.log(`Public export verified: ${published.claims.length} claims; source ${sourceCommit}${dirty ? ' (working preview)' : ''}`);

const files = {};
function hashTree(dir, prefix = '') {
  for (const entry of readdirSync(dir, {withFileTypes:true})) {
    const path = `${prefix}${entry.name}`;
    if (path === 'downloads/manifest.json') continue;
    if (entry.isDirectory()) hashTree(join(dir, entry.name), `${path}/`);
    else if (entry.isFile()) files[path] = createHash('sha256').update(readFileSync(join(dir,entry.name))).digest('hex');
    else throw new Error(`Unexpected output entry ${path}`);
  }
}
hashTree('out');
writeFileSync('out/downloads/manifest.json', JSON.stringify({schemaVersion:1, sourceCommit, dirty, catalogSha256:digest, status:dirty?'working-preview':'source-build', scientificApproval:false, files},null,2)+'\n');
