import { TeachingCase } from '@/components/teaching-case';
import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Claim, Prose, SourceRef, ConceptRef } from '@/components/evidence';
export function getMDXComponents(components?: MDXComponents) { return { ...defaultComponents, TeachingCase, Claim, Prose, SourceRef, ConceptRef, ...components }; }
export const useMDXComponents = getMDXComponents;
