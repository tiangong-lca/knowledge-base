import { execFileSync } from 'node:child_process';

const repositoryUrl = 'https://github.com/tiangong-lca/knowledge-base';

/** Read the actual checkout during static generation; never infer review dates. */
export function getBuildIdentity() {
  const sourceCommit = execFileSync('git', ['rev-parse', '--verify', 'HEAD^{commit}'], {
    encoding: 'utf8',
  }).trim();
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(sourceCommit)) {
    throw new Error('Cannot publish an unverified source commit identity');
  }
  const textDate = execFileSync('git', ['show', '-s', '--format=%cs', sourceCommit], { encoding: 'utf8' }).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(textDate)) throw new Error('Cannot identify the text version date');
  const dirty = Boolean(
    execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], {
      encoding: 'utf8',
    }).trim(),
  );
  return {
    sourceCommit,
    textDate,
    dirty,
    status: dirty ? 'working-preview' : 'source-build',
    sourceUrl: `${repositoryUrl}/commit/${sourceCommit}`,
    errataUrl: `${repositoryUrl}/issues`,
  };
}
