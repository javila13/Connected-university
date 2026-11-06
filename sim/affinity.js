// Affinity engine (PLAN.md §5.3). A page's metadata maps to categories:
//   program  -> Academic interest  (e.g. Environmental Science)
//   section  -> Interest           (Admissions, Giving, Athletics, ...)
//   topic    -> Topic              (a certificate, a team, tickets, ...)
//   audience -> Life stage         (prospective student, alumni, donor, ...)
// Every recorded action adds its weight to each of the page's categories.
// No decay: demos are short (PLAN.md §5.3).
import { SECTION_LABELS } from '../src/lib/taxonomy.js';
import { INTEREST_SECTIONS, LIFE_STAGES } from './config.js';

export const humanize = (slug) => {
  const s = String(slug).replace(/[-_]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Label for a category of a given type and value. */
export function labelFor(type, value, catalog = {}) {
  if (type === 'academic-interest') return catalog.programs?.[value] ?? humanize(value);
  if (type === 'interest') return SECTION_LABELS[value] ?? humanize(value);
  if (type === 'topic') return catalog.topics?.[value] ?? humanize(value);
  if (type === 'life-stage') return LIFE_STAGES[value] ?? humanize(value);
  return humanize(value);
}

/** "academic-interest:nursing" -> { type, value } */
export function parseKey(key) {
  const i = key.indexOf(':');
  return { type: key.slice(0, i), value: key.slice(i + 1) };
}

/**
 * Categories for one page.
 * @param {{ section?: string, audience?: string, program?: string, topic?: string }} meta
 * @param {{ programs?: Record<string,string>, topics?: Record<string,string> }} catalog  labels from the build
 */
export function categoriesFor(meta, catalog = {}) {
  const out = [];
  const add = (type, value, label) => {
    if (value && !out.some((c) => c.key === `${type}:${value}`)) out.push({ key: `${type}:${value}`, type, value, label });
  };
  if (meta.program) add('academic-interest', meta.program, labelFor('academic-interest', meta.program, catalog));
  const sectionLabel = INTEREST_SECTIONS.includes(meta.section) ? SECTION_LABELS[meta.section] : null;
  if (sectionLabel) add('interest', meta.section, sectionLabel);
  if (meta.topic && meta.topic !== meta.section && meta.topic !== meta.program) {
    const label = labelFor('topic', meta.topic, catalog);
    // "giving" on the Giving hub is the same signal as the Giving interest.
    if (label.toLowerCase() !== sectionLabel?.toLowerCase()) add('topic', meta.topic, label);
  }
  if (meta.audience) add('life-stage', meta.audience, labelFor('life-stage', meta.audience, catalog));
  return out;
}

/** Adds `weight` to each category in `state.affinities`. Returns { [key]: points } for the engagement row. */
export function applyPoints(state, categories, weight, ts) {
  const points = {};
  if (!weight) return points;
  for (const c of categories) {
    const a = (state.affinities[c.key] ??= { type: c.type, value: c.value, label: c.label, score: 0, updated: ts });
    a.score += weight;
    a.updated = ts;
    a.label = c.label;
    points[c.key] = weight;
  }
  return points;
}

export const TYPE_LABELS = {
  'academic-interest': 'Academic interest',
  interest: 'Interest',
  topic: 'Topic',
  'life-stage': 'Life stage',
};

/** Affinities by score, highest first; ties go to the most recent. */
export function rankAffinities(state, type) {
  return Object.entries(state.affinities)
    .map(([key, a]) => ({ key, ...a }))
    .filter((a) => !type || a.type === type)
    .sort((a, b) => b.score - a.score || String(b.updated).localeCompare(String(a.updated)));
}

/** The top academic interest, used later by personalization rules (PLAN.md §5.4 `topAffinity`). */
export function topAffinity(state) {
  return rankAffinities(state, 'academic-interest')[0] ?? rankAffinities(state)[0] ?? null;
}
