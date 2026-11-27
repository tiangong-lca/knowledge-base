import rawGlossary from '@/config/editions/ui-glossary.json';

export interface LocalizedPartTitle {
  label: string;
  title: string;
}

export interface BilingualGlossaryPart {
  zh: LocalizedPartTitle;
  en: LocalizedPartTitle;
}

export const UI_GLOSSARY = rawGlossary;
export const UI_SURFACES = rawGlossary.surfaces;
export type UiSurfaceKey = keyof typeof rawGlossary.surfaces;

export function uiLabel(key: UiSurfaceKey, lang: 'zh' | 'en' = 'zh'): string {
  return UI_SURFACES[key][lang];
}

export const EN_PARTS: Record<number, LocalizedPartTitle> = Object.fromEntries(
  Object.entries(rawGlossary.parts as Record<string, BilingualGlossaryPart>).map(([num, entry]) => [
    Number(num),
    entry.en,
  ]),
);

export const ZH_PARTS: Record<number, LocalizedPartTitle> = Object.fromEntries(
  Object.entries(rawGlossary.parts as Record<string, BilingualGlossaryPart>).map(([num, entry]) => [
    Number(num),
    entry.zh,
  ]),
);
