// Simulation settings (PLAN.md §5.2, §5.3). These are the defaults; the /demo
// affinity tuner can override the weights per browser (src/scripts/settings.js).

/** localStorage key for the simulated profile. /demo "Reset visitor" clears every key starting with `cu_sim`. */
export const STATE_KEY = 'cu_sim_state';
/** BroadcastChannel name for cross-tab sync of the profile (PLAN.md D11). */
export const CHANNEL = 'cu-sim';
/** Oldest engagement rows are dropped beyond this, to keep localStorage small. */
export const MAX_EVENTS = 300;

/** Points added to every matching affinity category (PLAN.md §5.2). */
export const WEIGHTS = {
  PAGE_VIEW: 1,
  CLICK: 3,
  FORM_START: 2,
  FORM_SUBMIT: 5,
  DWELL: 1,
  // A question to the Agentforce mock: as strong as a call-to-action click (PLAN.md §5.8).
  AGENT_INTERACTION: 3,
};

/** A page view earns the dwell bonus after this long in a visible tab. */
export const DWELL_MS = 30_000;

/** Not tracked at all: the search page and the 404 (docs/decisions.md). */
export const UNTRACKED_SECTIONS = ['search', 'system'];

/** Sections that build an "interest" affinity. Home, news, legal and the like don't. */
export const INTEREST_SECTIONS = [
  'academics',
  'admissions',
  'student-success',
  'portal',
  'alumni',
  'advancement',
  'continuing-ed',
  'athletics',
  'visit',
];

/** Life-stage labels for the audience signal. */
export const LIFE_STAGES = {
  prospect: 'Prospective student',
  student: 'Current student',
  alumni: 'Alumni',
  donor: 'Donor',
  learner: 'Adult learner',
  fan: 'Athletics fan',
};

/**
 * Object names shown in the inspector. Only the names in PLAN.md §5.2 are
 * used (CLAUDE.md: don't invent Salesforce-looking names).
 */
export const OBJECTS = {
  engagement: 'UMA_WebsiteEngagement',
  individual: 'UnifiedssotIndividualMcai__dlm',
  affinity: 'PersonAffinity_std__dlm',
  personalizationLog: 'ssot__PersonalizationLog__dlm',
};
