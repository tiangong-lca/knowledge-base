import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { publicCatalog, validateCatalog, buildDependencies } from './knowledge.mjs';
const catalog = JSON.parse(readFileSync('knowledge/catalog.json', 'utf8'));
const errors = validateCatalog(catalog);
if (errors.length) throw new Error(errors.join('\n'));
for (const route of ['', 'docs', 'sources', 'claims', 'concepts', 'coverage', 'changes', 'print']) {
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
writeFileSync('out/downloads/catalog.json', `${JSON.stringify(published, null, 2)}\n`);
writeFileSync('out/downloads/dependencies.json', `${JSON.stringify(buildDependencies(published), null, 2)}\n`);

writeFileSync('out/llms.txt', '# LCA Living Knowledge Base and Review\n\nChinese source-grounded living publication. Agent source checks are not human expert review.\n\n- [Review](/docs/)\n- [Claims and evidence](/claims/)\n- [Sources](/sources/)\n- [Coverage and gaps](/coverage/)\n- [Machine-readable public catalog](/downloads/catalog.json)\n- [Build identity](/downloads/manifest.json)\n');
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
