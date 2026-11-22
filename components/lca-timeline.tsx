'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  TIMELINE_ERAS,
  TIMELINE_MILESTONES,
  TIMELINE_TRACKS,
  type TimelineEraId,
  type TimelineTrackId,
} from '@/lib/timeline-data';
import styles from './lca-timeline.module.css';

const trackLabelMap = new Map(TIMELINE_TRACKS.map(track => [track.id, track.label]));

export function LcaTimeline() {
  const [selectedEra, setSelectedEra] = useState<TimelineEraId | 'all'>('all');
  const [selectedTrack, setSelectedTrack] = useState<TimelineTrackId | 'all'>('all');
  const [query, setQuery] = useState('');

  const eraCounts = useMemo(() => {
    const counts = new Map<TimelineEraId, number>();
    for (const item of TIMELINE_MILESTONES) {
      counts.set(item.era, (counts.get(item.era) ?? 0) + 1);
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return TIMELINE_MILESTONES.filter(item => {
      if (selectedEra !== 'all' && item.era !== selectedEra) return false;
      if (selectedTrack !== 'all' && item.track !== selectedTrack) return false;
      if (!needle) return true;
      const haystack = `${item.year} ${item.title} ${item.actor} ${item.summary} ${item.significance} ${item.chapters.map(c => c.label).join(' ')}`.toLocaleLowerCase();
      return haystack.includes(needle);
    });
  }, [selectedEra, selectedTrack, query]);

  const groupedByEra = useMemo(() => {
    return TIMELINE_ERAS.map(era => ({
      era,
      items: filtered.filter(item => item.era === era.id),
    })).filter(group => group.items.length > 0);
  }, [filtered]);

  const hasFilter = selectedEra !== 'all' || selectedTrack !== 'all' || query.trim().length > 0;

  return (
    <div className={styles.root}>
      <section aria-label="按历史时期筛选" className={styles.eraOverview}>
        {TIMELINE_ERAS.map(era => {
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
              <span className={styles.eraCount}>{eraCounts.get(era.id) ?? 0} 个节点</span>
            </button>
          );
        })}
      </section>

      <section aria-label="主题与关键词筛选" className={styles.toolbar}>
        <div className={styles.trackGroup} role="group" aria-label="按主题筛选">
          <button
            type="button"
            aria-pressed={selectedTrack === 'all'}
            className={`${styles.pill} ${selectedTrack === 'all' ? styles.pillActive : ''}`}
            onClick={() => setSelectedTrack('all')}
          >
            全部主题
          </button>
          {TIMELINE_TRACKS.map(track => {
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

        <div className={styles.searchWrap}>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜索年份、机构或关键词"
            aria-label="筛选大事记节点"
            className={styles.searchInput}
          />
          <span className={styles.resultMeta} role="status">
            显示 {filtered.length} / {TIMELINE_MILESTONES.length}
          </span>
          {hasFilter && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSelectedEra('all');
                setSelectedTrack('all');
                setQuery('');
              }}
            >
              重置
            </button>
          )}
        </div>
      </section>

      {groupedByEra.length === 0 ? (
        <div className={styles.emptyState}>
          没有匹配的大事记节点。请清空关键词或切换时期与主题筛选。
        </div>
      ) : (
        groupedByEra.map(({ era, items }) => (
          <section key={era.id} className={styles.eraSection} aria-labelledby={`era-${era.id}`}>
            <header className={styles.eraHeading}>
              <span className={styles.eraHeadingSpan}>{era.span}</span>
              <h2 id={`era-${era.id}`} className={styles.eraHeadingTitle}>
                {era.title}
              </h2>
              <p className={styles.eraHeadingSub}>{era.subtitle}</p>
            </header>

            <ol className={styles.spineList}>
              {items.map(item => (
                <li key={item.id} id={item.id} className={styles.milestoneItem}>
                  <span className={styles.yearBadge}>{item.year}</span>
                  <span className={styles.nodeDot} aria-hidden="true" />
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <span
                        className={`${styles.trackBadge} ${
                          item.track === 'framework' ? styles.trackFramework : ''
                        }`}
                      >
                        {trackLabelMap.get(item.track)}
                      </span>
                    </div>
                    <p className={styles.actor}>{item.actor}</p>
                    <p className={styles.summary}>{item.summary}</p>
                    <p className={styles.significance}>
                      <strong>历史意义</strong>
                      {item.significance}
                    </p>
                    <div className={styles.chapterLinks}>
                      <span className={styles.chapterLabel}>对应正文：</span>
                      {item.chapters.map(chapter => (
                        <Link key={chapter.href} href={chapter.href} className={styles.chapterChip}>
                          《{chapter.label}》
                        </Link>
                      ))}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
