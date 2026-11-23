const nonempty = value => typeof value === 'string' && value.trim().length > 0;

/**
 * Validates knowledge/timeline.json against catalog.json and active web routes.
 */
export function validateTimelineData(timeline, catalog, activeRoutes = null) {
  const errors = [];
  if (!timeline || timeline.schemaVersion !== 1) {
    return ['timeline.json requires schemaVersion: 1'];
  }
  const eraIds = new Set();
  for (const era of timeline.eras ?? []) {
    if (!nonempty(era?.id) || !nonempty(era?.span) || !nonempty(era?.title) || !nonempty(era?.subtitle)) {
      errors.push(`timeline.json invalid era entry: ${era?.id ?? 'unknown'}`);
      continue;
    }
    if (eraIds.has(era.id)) errors.push(`timeline.json duplicate era id: ${era.id}`);
    eraIds.add(era.id);
  }
  const trackIds = new Set();
  for (const track of timeline.tracks ?? []) {
    if (!nonempty(track?.id) || !nonempty(track?.label)) {
      errors.push(`timeline.json invalid track entry: ${track?.id ?? 'unknown'}`);
      continue;
    }
    if (trackIds.has(track.id)) errors.push(`timeline.json duplicate track id: ${track.id}`);
    trackIds.add(track.id);
  }

  const catalogSources = new Set((catalog?.sources ?? []).map(s => s.id));
  const catalogClaims = new Set((catalog?.claims ?? []).map(c => c.id));
  const routeSet = activeRoutes ? new Set([...activeRoutes].map(r => r.replace(/\/$/, ''))) : null;

  const seenIds = new Set();
  for (const m of timeline.milestones ?? []) {
    if (!nonempty(m?.id) || !nonempty(m?.year) || !nonempty(m?.title) || !nonempty(m?.actor)
        || !nonempty(m?.summary) || !nonempty(m?.significance)) {
      errors.push(`timeline.json milestone missing required fields: ${m?.id ?? 'unknown'}`);
      continue;
    }
    if (seenIds.has(m.id)) errors.push(`timeline.json duplicate milestone id: ${m.id}`);
    seenIds.add(m.id);
    if (!eraIds.has(m.era)) errors.push(`timeline.json milestone ${m.id} references unknown era: ${m.era}`);
    if (!trackIds.has(m.track)) errors.push(`timeline.json milestone ${m.id} references unknown track: ${m.track}`);
    if (m.status !== 'verified' && m.status !== 'pending') {
      errors.push(`timeline.json milestone ${m.id} has invalid status: ${m.status}`);
    }
    const sourceIds = m.evidence?.sourceIds ?? [];
    const claimIds = m.evidence?.claimIds ?? [];
    if (m.status === 'verified') {
      if (!sourceIds.length) errors.push(`timeline.json verified milestone ${m.id} requires at least one sourceId`);
      if (!claimIds.length) errors.push(`timeline.json verified milestone ${m.id} requires at least one claimId`);
    } else if (m.status === 'pending') {
      if (!nonempty(m.pendingNote)) errors.push(`timeline.json pending milestone ${m.id} requires a non-empty pendingNote`);
    }
    for (const sid of sourceIds) {
      if (!catalogSources.has(sid)) errors.push(`timeline.json milestone ${m.id} references unknown catalog source: ${sid}`);
    }
    for (const cid of claimIds) {
      if (!catalogClaims.has(cid)) errors.push(`timeline.json milestone ${m.id} references unknown catalog claim: ${cid}`);
    }
    if (!Array.isArray(m.chapters) || !m.chapters.length) {
      errors.push(`timeline.json milestone ${m.id} requires at least one chapter link`);
    }
    for (const ch of m.chapters ?? []) {
      if (!nonempty(ch?.label) || !nonempty(ch?.href) || !ch.href.startsWith('/')) {
        errors.push(`timeline.json milestone ${m.id} has invalid chapter link`);
        continue;
      }
      const norm = ch.href.replace(/\/$/, '');
      if (routeSet && !routeSet.has(norm)) {
        errors.push(`timeline.json milestone ${m.id} links to missing active route: ${ch.href}`);
      }
    }
  }
  return errors;
}
