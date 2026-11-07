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
 * The Agentforce mock persona for each page audience (PLAN.md D12, §5.8).
 * Whether the mock shows at all is a /demo setting, off by default.
 */
export const AGENT_BY_AUDIENCE = {
  prospect: 'student-recruitment',
  learner: 'student-recruitment',
  student: 'student-success',
  alumni: 'alumni-giving',
  donor: 'alumni-giving',
  fan: 'alumni-giving',
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
