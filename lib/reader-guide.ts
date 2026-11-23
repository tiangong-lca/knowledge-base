import rawGuide from '@/config/reader-guide.json';

export interface GuideReadingMode {
  id: string;
  badge: string;
  title: string;
  audience: string;
  description: string;
  startHref: string;
  startLabel: string;
}

export interface GuideProblemTarget {
  route: string;
  why: string;
}

export interface GuideProblemRoute {
  id: string;
  question: string;
  summary: string;
  targets: GuideProblemTarget[];
}

export interface GuideCompanion {
  route: string;
  badge: string;
}

export interface GuideTool {
  href: string;
  title: string;
  description: string;
}

export const readerGuideConfig = {
  partQuestions: rawGuide.partQuestions as Record<string, string>,
  readingModes: rawGuide.readingModes as GuideReadingMode[],
  problemRoutes: rawGuide.problemRoutes as GuideProblemRoute[],
  chapterCompanions: rawGuide.chapterCompanions as Record<string, GuideCompanion[]>,
  tools: rawGuide.tools as GuideTool[],
};
