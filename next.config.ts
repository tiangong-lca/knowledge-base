import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';
const config: NextConfig = {
  agentRules: false,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { useTypeScriptCli: true },
};
export default createMDX()(config);
