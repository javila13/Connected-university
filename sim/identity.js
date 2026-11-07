// Identity stitch and persona presets (PLAN.md §5.5, §5.7). The simulation
// knows one person, Sofia Sanders (content/sofia.json). A stitch attaches the
// anonymous device's history to her Unified Individual; a preset starts fresh
// as Sofia at a given life stage with that stage's seeded affinities.
import sofia from '../content/sofia.json';
import { update, reset } from './store.js';
import { labelFor, parseKey } from './affinity.js';

export const STAGES = Object.fromEntries(Object.entries(sofia.stages).map(([id, s]) => [id, s.label]));
export const fullName = `${sofia.person.firstName} ${sofia.person.lastName}`;
export const SOFIA_EMAIL = sofia.person.email;

/** Form fields kept on a new contact (Identity matching: "Match typed email"). */
const VISITOR_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'program', 'studentType', 'classYear', 'employer', 'jobTitle', 'city', 'interest', 'smsOptIn'];

/** The known person's display name, for Sofia or a new contact. */
export function displayName(identity) {
  if (!identity?.known) return 'Anonymous visitor';
  if (identity.personId === 'sofia') return fullName;
  const p = identity.profile ?? {};
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || identity.email;
}

function keepFirstIdentity(s, { ts, via, email }) {
  s.timeline.push({
    ts,
    kind: 'confirm',
    text: `Identity unchanged: ${via}`,
    detail: `Email entered: ${email || 'none'}. This browser is already known as ${displayName(s.identity)}, so the first identity stays.`,
  });
}

const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const now = () => new Date().toISOString();

function becomeKnown(s, { stage, via, ts }) {
  s.identity = {
    known: true,
    personId: 'sofia',
    unifiedId: `ui_${hex(12)}`,
    email: sofia.person.email,
    stage,
    stitchedAt: ts,
    via,
  };
  let moved = 0;
  for (const e of s.events) {
    e.individualId = s.identity.unifiedId;
    moved++;
  }
  return moved;
}

/**
 * Stitches the current visitor to Sofia at `stage`. If she's already known,
 * only the stage changes (and the step is logged).
 * @param {{ stage: string, via: string, email?: string }} opts
 *   via: what triggered it, e.g. "Request Information form"; email: what the visitor typed, if anything
 */
export function stitch({ stage, via, email }) {
  if (!STAGES[stage]) throw new Error(`[sim] unknown Sofia stage "${stage}"`);
  update((s) => {
    const ts = now();
    if (s.identity?.known && s.identity.personId !== 'sofia') {
      keepFirstIdentity(s, { ts, via, email });
      return;
    }
    if (!s.identity?.known) {
      const moved = becomeKnown(s, { stage, via, ts });
      const typed = email?.trim().toLowerCase();
      const match =
        typed && typed !== sofia.person.email
          ? `Email entered: ${email.trim()}. In this demo every identity resolves to ${fullName} (${sofia.person.email}).`
          : `Matched ${sofia.person.email} to ${fullName}.`;
      s.timeline.push({
        ts,
        kind: 'stitch',
        text: `Identity moment: ${via}`,
        detail: `${match} ${moved} engagement ${moved === 1 ? 'row' : 'rows'} from device ${s.deviceId} now belong to her Unified Individual.`,
      });
    } else if (s.identity.stage !== stage) {
      s.identity.stage = stage;
      s.timeline.push({ ts, kind: 'stage', text: `Life stage: ${STAGES[stage]}`, detail: via });
    } else {
      s.timeline.push({ ts, kind: 'confirm', text: `Identity confirmed: ${via}` });
    }
  });
}

/**
 * Identity matching "Match typed email": a form with an email that isn't
 * Sofia's creates a new known person from what was typed. No CRM history, so
 * no life stage: personalization and the agent work from affinities alone.
 * If this browser is already known, the first identity stays.
 */
export function stitchVisitor({ via, fields = {} }) {
  update((s) => {
    const ts = now();
    const email = fields.email?.trim();
    if (s.identity?.known) {
      if (s.identity.personId === 'visitor' && s.identity.email === email?.toLowerCase()) {
        for (const k of VISITOR_FIELDS) if (fields[k]) s.identity.profile[k] = fields[k];
        s.timeline.push({ ts, kind: 'confirm', text: `Identity confirmed: ${via}`, detail: 'Details from this form were added to the contact.' });
      } else {
        keepFirstIdentity(s, { ts, via, email });
      }
      return;
    }
    const profile = Object.fromEntries(VISITOR_FIELDS.filter((k) => fields[k]).map((k) => [k, fields[k]]));
    s.identity = {
      known: true,
      personId: 'visitor',
      unifiedId: `ui_${hex(12)}`,
      email: email.toLowerCase(),
      stage: null,
      stitchedAt: ts,
      via,
      profile,
    };
    let moved = 0;
    for (const e of s.events) {
      e.individualId = s.identity.unifiedId;
      moved++;
    }
    s.timeline.push({
      ts,
      kind: 'stitch',
      text: `Identity moment: ${via}`,
      detail: `No existing record matched ${s.identity.email}, so a new contact and Unified Individual were created for ${displayName(s.identity)}. ${moved} engagement ${moved === 1 ? 'row' : 'rows'} from device ${s.deviceId} now belong to it.`,
    });
  });
}

/** Starts over as Sofia at `stage`, with that stage's seeded affinities (PLAN.md §5.7). */
export function loadPreset(stage, catalog = {}) {
  if (!STAGES[stage]) throw new Error(`[sim] unknown Sofia stage "${stage}"`);
  reset();
  update((s) => {
    const ts = now();
    becomeKnown(s, { stage, via: 'Persona preset', ts });
    for (const [key, score] of Object.entries(sofia.stages[stage].affinities ?? {})) {
      const { type, value } = parseKey(key);
      s.affinities[key] = { type, value, label: labelFor(type, value, catalog), score, updated: ts, seeded: true };
    }
    s.timeline.push({
      ts,
      kind: 'preset',
      text: `Profile loaded: ${fullName}, ${STAGES[stage]}`,
      detail: 'Persona preset from /demo. Affinities are seeded from her earlier engagement; new activity adds to them.',
    });
  });
}

export { reset as resetVisitor };
