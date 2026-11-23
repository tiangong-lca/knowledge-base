'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  TIMELINE_ERAS,
  TIMELINE_ERAS_EN,
  TIMELINE_MILESTONES,
  TIMELINE_MILESTONES_EN,
  TIMELINE_TRACKS,
  TIMELINE_TRACKS_EN,
  type TimelineEraId,
  type TimelineStatus,
  type TimelineTrackId,
} from '@/lib/timeline-data';
import styles from './lca-timeline.module.css';

interface LcaTimelineProps {
  embedded?: boolean;
  lang?: 'zh' | 'en';
}

export function LcaTimeline({ embedded = false, lang = 'zh' }: LcaTimelineProps) {
  const isEn = lang === 'en';
  const eras = isEn ? TIMELINE_ERAS_EN : TIMELINE_ERAS;
  const tracks = isEn ? TIMELINE_TRACKS_EN : TIMELINE_TRACKS;
  const milestones = isEn ? TIMELINE_MILESTONES_EN : TIMELINE_MILESTONES;
  const trackLabelMap = useMemo(() => new Map(tracks.map(track => [track.id, track.label])), [tracks]);

  const [selectedEra, setSelectedEra] = useState<TimelineEraId | 'all'>('all');
  const [selectedTrack, setSelectedTrack] = useState<TimelineTrackId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TimelineStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const eraCounts = useMemo(() => {
    const counts = new Map<TimelineEraId, number>();
    for (const item of milestones) {
      counts.set(item.era, (counts.get(item.era) ?? 0) + 1);
    }
    return counts;
  }, [milestones]);

  const verifiedCount = useMemo(
    () => milestones.filter(item => item.status === 'verified').length,
    [milestones],
  );
  const pendingCount = milestones.length - verifiedCount;

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return milestones.filter(item => {
      if (selectedEra !== 'all' && item.era !== selectedEra) return false;
      if (selectedTrack !== 'all' && item.track !== selectedTrack) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (!needle) return true;
      const haystack = `${item.year} ${item.title} ${item.actor} ${item.summary} ${item.significance} ${item.pendingNote ?? ''} ${item.sources.map(s => s.title).join(' ')} ${item.chapters.map(c => c.label).join(' ')}`.toLocaleLowerCase();
      return haystack.includes(needle);
    });
  }, [milestones, selectedEra, selectedTrack, selectedStatus, query]);

  const groupedByEra = useMemo(() => {
    return eras.map(era => ({
      era,
      items: filtered.filter(item => item.era === era.id),
    })).filter(group => group.items.length > 0);
  }, [eras, filtered]);

  const hasFilter =
    selectedEra !== 'all'
    || selectedTrack !== 'all'
    || selectedStatus !== 'all'
    || query.trim().length > 0;

  return (
    <div className={styles.root}>
      <section aria-label={isEn ? 'Filter by historical era' : '按历史时期筛选'} className={styles.eraOverview}>
        {eras.map(era => {
          const active = selectedEra === era.id;
          return (
            <button
              key={era.id}
              type="button"
              aria-pressed={active}
              className={`${styles.eraCard} ${active ? styles.eraCardActive : ''}`}
              onClick={() => setSelectedEra(prev => (prev === era.id ? 'all' : era.id))}
            >
              <span className={styles.eraSpan}>{era.span}</span>
              <span className={styles.eraTitle}>{era.title}</span>
              <span className={styles.eraCount}>
                {isEn ? `${eraCounts.get(era.id) ?? 0} milestones` : `${eraCounts.get(era.id) ?? 0} 个节点`}
              </span>
            </button>
          );
        })}
      </section>

      <section aria-label={isEn ? 'Filter by theme, verification status, and keyword' : '主题、核验状态与关键词筛选'} className={styles.toolbar}>
        <div className={styles.filterRows}>
          <div className={styles.trackGroup} role="group" aria-label={isEn ? 'Filter by theme' : '按主题筛选'}>
            <button
              type="button"
              aria-pressed={selectedTrack === 'all'}
              className={`${styles.pill} ${selectedTrack === 'all' ? styles.pillActive : ''}`}
              onClick={() => setSelectedTrack('all')}
            >
              {isEn ? 'All themes' : '全部主题'}
            </button>
            {tracks.map(track => {
              const active = selectedTrack === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  aria-pressed={active}
                  className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                  onClick={() => setSelectedTrack(prev => (prev === track.id ? 'all' : track.id))}
                >
                  {track.label}
                </button>
              );
            })}
          </div>

          <div className={styles.trackGroup} role="group" aria-label={isEn ? 'Filter by primary-source verification status' : '按一手来源核验状态筛选'}>
            <button
              type="button"
              aria-pressed={selectedStatus === 'all'}
              className={`${styles.pill} ${selectedStatus === 'all' ? styles.pillActive : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              {isEn ? `All (${milestones.length})` : `全部状态（${milestones.length}）`}
            </button>
            <button
              type="button"
              aria-pressed={selectedStatus === 'verified'}
              className={`${styles.pill} ${selectedStatus === 'verified' ? styles.pillActive : ''}`}
              onClick={() => setSelectedStatus(prev => (prev === 'verified' ? 'all' : 'verified'))}
            >
              {isEn ? `Primary source verified (${verifiedCount})` : `已核对一手来源（${verifiedCount}）`}
            </button>
            <button
              type="button"
              aria-pressed={selectedStatus === 'pending'}
              className={`${styles.pill} ${selectedStatus === 'pending' ? styles.pillActive : ''}`}
              onClick={() => setSelectedStatus(prev => (prev === 'pending' ? 'all' : 'pending'))}
            >
              {isEn ? `Unverified (${pendingCount})` : `待核（${pendingCount}）`}
            </button>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={isEn ? 'Search year, institution, or keyword' : '搜索年份、机构或关键词'}
            aria-label={isEn ? 'Filter timeline milestones' : '筛选大事记节点'}
            className={styles.searchInput}
          />
          <span className={styles.resultMeta} role="status">
            {isEn ? `Showing ${filtered.length} / ${milestones.length}` : `显示 ${filtered.length} / ${milestones.length}`}
          </span>
          {hasFilter && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSelectedEra('all');
                setSelectedTrack('all');
                setSelectedStatus('all');
                setQuery('');
              }}
            >
              {isEn ? 'Reset' : '重置'}
            </button>
          )}
        </div>
      </section>

      {groupedByEra.length === 0 ? (
        <div className={styles.emptyState}>
          {isEn
            ? 'No matching milestones. Clear the search query or adjust era, theme, and verification filters.'
            : '没有匹配的大事记节点。请清空关键词或切换时期、主题与核验状态筛选。'}
        </div>
      ) : (
        groupedByEra.map(({ era, items }) => {
          const eraHeadingId = embedded ? `appendix-era-${era.id}` : `era-${era.id}`;
          return (
            <section key={era.id} className={styles.eraSection} aria-labelledby={eraHeadingId}>
              <header className={styles.eraHeading}>
                <span className={styles.eraHeadingSpan}>{era.span}</span>
                {embedded ? (
                  <div id={eraHeadingId} className={styles.eraHeadingTitle}>
                    {era.title}
                  </div>
                ) : (
                  <h2 id={eraHeadingId} className={styles.eraHeadingTitle}>
                    {era.title}
                  </h2>
                )}
                <p className={styles.eraHeadingSub}>{era.subtitle}</p>
              </header>

              <ol className={styles.spineList}>
                {items.map(item => (
                  <li key={item.id} id={embedded ? `appendix-${item.id}` : item.id} className={styles.milestoneItem}>
                    <span className={styles.yearBadge}>{item.year}</span>
                    <span className={styles.nodeDot} aria-hidden="true" />
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        {embedded ? (
                          <div className={styles.cardTitle}>{item.title}</div>
                        ) : (
                          <h3 className={styles.cardTitle}>{item.title}</h3>
                        )}
                        <div className={styles.badgeGroup}>
                          <span
                            className={`${styles.statusBadge} ${
                              item.status === 'verified' ? styles.statusVerified : styles.statusPending
                            }`}
                            data-timeline-status={item.status}
                          >
                            {item.status === 'verified'
                              ? (isEn ? 'Primary source verified' : '已核对一手来源')
                              : (isEn ? 'Unverified' : '待核')}
                          </span>
                          <span
                            className={`${styles.trackBadge} ${
                              item.track === 'framework' ? styles.trackFramework : ''
                            }`}
                          >
                            {trackLabelMap.get(item.track)}
                          </span>
                        </div>
                      </div>
                      <p className={styles.actor}>{item.actor}</p>
                      <p className={styles.summary}>{item.summary}</p>
                      <p className={styles.significance}>
                        <strong>{isEn ? 'Historical significance' : '历史意义'}</strong>
                        {item.significance}
                      </p>

                      {item.status === 'verified' && item.sources.length > 0 && (
                        <div className={styles.evidenceBox}>
                          <span className={styles.chapterLabel}>{isEn ? 'Primary sources:' : '一手来源：'}</span>
                          {item.sources.map(src => (
                            <Link
                              key={src.id}
                              href={isEn ? `/en/sources/#${src.id}` : `/zh/sources/#${src.id}`}
                              className={styles.sourceChip}
                              title={src.title}
                            >
                              {src.title.length > 52 ? `${src.title.slice(0, 52)}…` : src.title}
                            </Link>
                          ))}
                          {item.verificationNote && (
                            <p className={styles.evidenceNote}>{item.verificationNote}</p>
                          )}
                        </div>
                      )}

                      {item.status === 'pending' && item.pendingNote && (
                        <p className={styles.pendingBox}>
                          <strong>{isEn ? 'Verification note: ' : '待核说明：'}</strong>
                          {item.pendingNote}
                        </p>
                      )}

                      <div className={styles.chapterLinks}>
                        <span className={styles.chapterLabel}>{isEn ? 'Related chapters:' : '对应正文：'}</span>
                        {item.chapters.map(chapter => (
                          <Link
                            key={chapter.href}
                            href={
                              isEn
                                ? (chapter.href.startsWith('/en/') ? chapter.href : `/en${chapter.href}`)
                                : (chapter.href.startsWith('/zh/') ? chapter.href : `/zh${chapter.href}`)
                            }
                            className={styles.chapterChip}
                          >
                            {isEn ? chapter.label : `《${chapter.label}》`}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })
      )}
    </div>
  );
}
