import { createElement, type HTMLAttributes, type ReactNode } from 'react';

/** The title remains canonical; only these real text spans carry edition numbers. */
export function NumberedTitle({ number, children }: { number?: string | null; children: ReactNode }) {
  if (!number) return <>{children}</>;
  return <><span data-reader-number="">{number}</span>{' '}<span data-reader-heading-title="">{children}</span></>;
}

export function NumberedHeading({ level, number, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { level: number; number?: string | null }) {
  if (!Number.isInteger(level) || level<1 || level>6) throw new Error(`Unsupported actual heading depth: ${level}`);
  return createElement(`h${level}`, props, <NumberedTitle number={number}>{children}</NumberedTitle>);
}

export type CaseHeadingNumber = {key: string; number: string; title: string; depth: number};
