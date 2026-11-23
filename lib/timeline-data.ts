import rawTimeline from '@/knowledge/timeline.json';
import catalog from '@/lib/catalog';

export type TimelineEraId = 'origins' | 'framing' | 'standardization' | 'consensus' | 'regulation';
export type TimelineTrackId = 'framework' | 'inventory' | 'impact' | 'case-policy';
export type TimelineStatus = 'verified' | 'pending';

export interface TimelineEra {
  id: TimelineEraId;
  span: string;
  title: string;
  subtitle: string;
}

export interface TimelineTrack {
  id: TimelineTrackId;
  label: string;
}

export interface TimelineChapterLink {
  label: string;
  href: string;
}

export interface TimelineSourceRef {
  id: string;
  title: string;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  era: TimelineEraId;
  track: TimelineTrackId;
  title: string;
  actor: string;
  summary: string;
  significance: string;
  status: TimelineStatus;
  verificationNote?: string;
  pendingNote?: string;
  sources: TimelineSourceRef[];
  claimIds: string[];
  chapters: TimelineChapterLink[];
}

const sourceTitleMap = new Map(catalog.sources.map(s => [s.id, s.title]));

export const TIMELINE_ERAS: TimelineEra[] = rawTimeline.eras as TimelineEra[];
export const TIMELINE_TRACKS: TimelineTrack[] = rawTimeline.tracks as TimelineTrack[];
export const TIMELINE_MILESTONES: TimelineMilestone[] = rawTimeline.milestones.map(m => ({
  id: m.id,
  year: m.year,
  era: m.era as TimelineEraId,
  track: m.track as TimelineTrackId,
  title: m.title,
  actor: m.actor,
  summary: m.summary,
  significance: m.significance,
  status: m.status as TimelineStatus,
  verificationNote: 'verificationNote' in m ? (m.verificationNote as string | undefined) : undefined,
  pendingNote: 'pendingNote' in m ? (m.pendingNote as string | undefined) : undefined,
  sources: (m.evidence?.sourceIds ?? []).map(id => ({
    id,
    title: sourceTitleMap.get(id) ?? id,
  })),
  claimIds: m.evidence?.claimIds ?? [],
  chapters: m.chapters,
}));
