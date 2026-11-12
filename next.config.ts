import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { createMDX } from 'fumadocs-mdx/next';
const config: NextConfig = {
  agentRules: false,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { useTypeScriptCli: true },
};
const withMDX = createMDX();

export default function configure(phase: string) {
  const preview = process.env.READABLE_BOOK_REVIEW_PREVIEW === '1';
  if (phase === PHASE_PRODUCTION_BUILD && !preview) {
    execFileSync(process.execPath, [resolve(process.cwd(), 'scripts/validate.mjs')], { stdio: 'inherit' });
  }
  return withMDX(preview ? { ...config, distDir: '.reader-review-output' } : config);
}
