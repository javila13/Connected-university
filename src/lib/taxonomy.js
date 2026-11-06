// Page-metadata vocabulary (PLAN.md §5.1). The content schema, the base
// layout and the client scripts all import from here, so a typo in a page's
// frontmatter fails the build instead of silently skewing the simulation.

/**
 * Values allowed in a page's `section`. `search` is the search page and
 * `system` the 404; the simulation does not track either (docs/decisions.md).
 */
export const SECTIONS = [
  'home',
  'about',
  'news',
  'events',
  'visit',
  'contact',
  'careers',
  'legal',
  'academics',
  'admissions',
  'student-success',
  'portal',
  'alumni',
  'advancement',
  'continuing-ed',
  'athletics',
  'search',
  'system',
];

/** Human labels for sections (search results, breadcrumbs). */
export const SECTION_LABELS = {
  home: 'Home',
  about: 'About',
  news: 'News',
  events: 'Events',
  visit: 'Visit',
  contact: 'Contact',
  careers: 'Careers',
  legal: 'Privacy',
  academics: 'Academics',
  admissions: 'Admissions',
  'student-success': 'Student Success',
  portal: 'Student Portal',
  alumni: 'Alumni',
  advancement: 'Giving',
  'continuing-ed': 'Continuing Ed',
  athletics: 'Athletics',
  search: 'Search',
  system: '',
};

/** Values allowed in a page's `audience` (PLAN.md §5.1). */
export const AUDIENCES = ['prospect', 'student', 'alumni', 'donor', 'learner', 'fan'];

/** Agentforce mock personas (PLAN.md D12, §5.8). */
export const AGENT_PERSONAS = {
  'student-recruitment': 'Student Recruitment Agent',
  'student-success': 'Student Success Agent',
  'alumni-giving': 'Alumni & Giving Agent',
};

/**
 * `auto` widget routing (PLAN.md D6): Piper for inbound inquiry, the
 * Agentforce mock for constituent service. Continuing Ed (learner) and
 * Athletics (fan) pages offer both (Jesse, 2026-11-06; docs/decisions.md).
 * `widget` is 'piper' | 'agentforce' | 'both'.
 */
export const AUDIENCE_ROUTING = {
  prospect: { widget: 'piper', agent: 'student-recruitment' },
  learner: { widget: 'both', agent: 'student-recruitment' },
  fan: { widget: 'both', agent: 'alumni-giving' },
  student: { widget: 'agentforce', agent: 'student-success' },
  alumni: { widget: 'agentforce', agent: 'alumni-giving' },
  donor: { widget: 'agentforce', agent: 'alumni-giving' },
};

/**
 * Throws if a page's metadata breaks the contract. Called by the base
 * layout at build time, so a bad page fails `astro build`.
 */
export function assertPageMeta(meta, where) {
  const problems = [];
  if (!meta.section) problems.push('missing `section`');
  else if (!SECTIONS.includes(meta.section)) problems.push(`unknown section "${meta.section}"`);
  if (!meta.audience) problems.push('missing `audience`');
  else if (!AUDIENCES.includes(meta.audience)) problems.push(`unknown audience "${meta.audience}"`);
  if (problems.length) {
    throw new Error(`[page metadata] ${where}: ${problems.join(', ')}. See PLAN.md §5.1.`);
  }
}
