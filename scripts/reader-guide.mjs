const nonempty = value => typeof value === 'string' && value.trim().length > 0;

/**
 * Validates config/reader-guide.json against config/reader-numbering.json so the
 * redesigned /coverage/ guide never has stale routes, missing parts, or broken companions.
 */
export function validateReaderGuideConfig(guide, numbering) {
  const errors = [];
  if (!guide || guide.schemaVersion !== 1) {
    return ['reader-guide.json requires schemaVersion: 1'];
  }
  const webUnits = numbering?.web ?? [];
  const webUnitByKey = new Map(webUnits.map(u => [u.key, u]));
  const appendixBadgeByKey = new Map(
    webUnits.filter(u => u.kind === 'appendix').map((u, idx) => [u.key, `附录 ${String.fromCharCode(65 + idx)}`]),
  );
  const expectedCompanionBadge = unit => (
    unit.kind === 'appendix' ? appendixBadgeByKey.get(unit.key) : (unit.kind === 'topic' ? '专题' : unit.label ?? null)
  );
  const webRouteSet = new Set(webUnits.map(u => u.key));
  const chapterRouteSet = new Set(webUnits.filter(u => u.kind === 'chapter').map(u => u.key));
  const parts = numbering?.parts ?? [];
  const allowedModeAnchors = new Set(['#problem-routes']);

  const validPartKeys = new Set(parts.map(p => String(p.number)));
  for (const part of parts) {
    const q = guide.partQuestions?.[String(part.number)];
    if (!nonempty(q)) errors.push(`reader-guide.json missing core question for Part ${part.number}`);
    const s = guide.partSummaries?.[String(part.number)];
    if (!s || !nonempty(s.establishes) || !nonempty(s.contrasts) || !nonempty(s.gaps) || !nonempty(s.bridge)) {
      errors.push(`reader-guide.json missing complete partSummaries entry for Part ${part.number}`);
    }
  }
  for (const k of Object.keys(guide.partSummaries ?? {})) {
    if (!validPartKeys.has(k)) errors.push(`reader-guide.json partSummaries has unknown part key: ${k}`);
  }

  if (!Array.isArray(guide.readingModes) || guide.readingModes.length !== 5) {
    errors.push('reader-guide.json requires exactly 5 readingModes');
  } else {
    const ids = new Set();
    for (const mode of guide.readingModes) {
      if (
        !nonempty(mode?.id) || !nonempty(mode?.badge) || !nonempty(mode?.title)
        || !nonempty(mode?.audience) || !nonempty(mode?.description)
        || !nonempty(mode?.startHref) || !nonempty(mode?.startLabel)
      ) {
        errors.push(`reader-guide.json invalid readingMode: ${mode?.id ?? 'unknown'}`);
      } else {
        if (ids.has(mode.id)) errors.push(`reader-guide.json duplicate readingMode id: ${mode.id}`);
        ids.add(mode.id);
        if (mode.startHref.startsWith('/')) {
          const norm = mode.startHref.replace(/\/$/, '');
          if (!webRouteSet.has(norm)) errors.push(`reader-guide.json readingMode ${mode.id} points to missing route: ${mode.startHref}`);
        } else if (mode.startHref.startsWith('#')) {
          if (!allowedModeAnchors.has(mode.startHref)) errors.push(`reader-guide.json readingMode ${mode.id} points to unknown anchor: ${mode.startHref}`);
        } else {
          errors.push(`reader-guide.json readingMode ${mode.id} has unsupported startHref: ${mode.startHref}`);
        }
      }
    }
  }

  if (!Array.isArray(guide.problemRoutes) || guide.problemRoutes.length !== 6) {
    errors.push('reader-guide.json requires exactly 6 problemRoutes');
  } else {
    const ids = new Set();
    for (const prob of guide.problemRoutes) {
      if (!nonempty(prob?.id) || !nonempty(prob?.question) || !nonempty(prob?.summary) || !Array.isArray(prob.targets) || !prob.targets.length) {
        errors.push(`reader-guide.json invalid problemRoute: ${prob?.id ?? 'unknown'}`);
        continue;
      }
      if (ids.has(prob.id)) errors.push(`reader-guide.json duplicate problemRoute id: ${prob.id}`);
      ids.add(prob.id);
      for (const target of prob.targets) {
        if (!nonempty(target?.route) || !nonempty(target?.why)) {
          errors.push(`reader-guide.json problemRoute ${prob.id} has incomplete target`);
        } else if (!webRouteSet.has(target.route)) {
          errors.push(`reader-guide.json problemRoute ${prob.id} links to missing route: ${target.route}`);
        }
      }
    }
  }

  for (const [chapterRoute, companions] of Object.entries(guide.chapterCompanions ?? {})) {
    if (!chapterRouteSet.has(chapterRoute)) {
      errors.push(`reader-guide.json chapterCompanions key is not an active chapter: ${chapterRoute}`);
    }
    for (const comp of companions ?? []) {
      const targetUnit = webUnitByKey.get(comp?.route);
      const expectedBadge = targetUnit ? expectedCompanionBadge(targetUnit) : null;
      if (!nonempty(comp?.route) || !nonempty(comp?.badge) || !targetUnit) {
        errors.push(`reader-guide.json chapterCompanions invalid companion on ${chapterRoute}: ${comp?.route}`);
      } else if (expectedBadge && comp.badge !== expectedBadge) {
        errors.push(`reader-guide.json chapterCompanions badge mismatch on ${chapterRoute}: ${comp.route} has "${comp.badge}", expected "${expectedBadge}"`);
      }
    }
  }

  if (!Array.isArray(guide.tools) || guide.tools.length < 4) {
    errors.push('reader-guide.json requires at least 4 tools');
  }
  return errors;
}
