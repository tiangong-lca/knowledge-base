import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
export function baseOptions(): BaseLayoutProps {
  return { nav: { enabled: false }, searchToggle: { enabled: false }, githubUrl: 'https://github.com/tiangong-lca/knowledge-base' };
}
