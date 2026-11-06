// Build-time helpers for the Academics section: program listings, school
// names and format labels.
import { getCollection } from 'astro:content';
import facts from '../../content/facts.json';

const SCHOOL_NAMES = new Map(facts.schools.map((s) => [s.id, s.name]));
export const schoolName = (id) => SCHOOL_NAMES.get(id) ?? id;

const FORMAT_LABELS = { 'on-campus': 'On campus', online: 'Online', hybrid: 'Hybrid' };
export const formatLabel = (f) => FORMAT_LABELS[f] ?? f;

/** Distinct formats across credentials, in a stable order. */
export function formatsOf(credentials) {
  const set = new Set(credentials.flatMap((c) => c.formats));
  return Object.keys(FORMAT_LABELS).filter((f) => set.has(f));
}

const matches = {
  all: () => true,
  undergraduate: (c) => c.level === 'undergraduate',
  graduate: (c) => c.level === 'graduate',
  online: (c) => c.formats.includes('online'),
};

/**
 * Programs with at least one credential matching the filter, A to Z. Each
 * item carries only the matching credentials, so an "Online" listing shows
 * the online degrees and not the campus ones.
 * @returns {Promise<{ entry: any, credentials: any[] }[]>}
 */
export async function programsFor(filter = 'all') {
  const test = matches[filter];
  if (!test) throw new Error(`[academics] unknown program filter "${filter}"`);
  const all = await getCollection('programs');
  return all
    .map((entry) => ({ entry, credentials: entry.data.credentials.filter(test) }))
    .filter((p) => p.credentials.length)
    .sort((a, b) => a.entry.data.title.localeCompare(b.entry.data.title));
}

/** Groups listing items by school, in facts.json order. */
export function groupBySchool(items) {
  return facts.schools
    .map((s) => ({ school: s, items: items.filter((p) => p.entry.data.school === s.id) }))
    .filter((g) => g.items.length);
}
