import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Claim, SourceRef, ConceptRef } from '@/components/evidence';
export function getMDXComponents(components?: MDXComponents) { return { ...defaultComponents, Claim, SourceRef, ConceptRef, ...components }; }
export const useMDXComponents = getMDXComponents;
