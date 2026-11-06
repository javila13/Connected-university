// Identity stitch and persona presets (PLAN.md §5.5, §5.7). The simulation
// knows one person, Sofia Sanders (content/sofia.json). A stitch attaches the
// anonymous device's history to her Unified Individual; a preset starts fresh
// as Sofia at a given life stage with that stage's seeded affinities.
import sofia from '../content/sofia.json';
import { update, reset } from './store.js';
import { labelFor, parseKey } from './affinity.js';

export const STAGES = Object.fromEntries(Object.entries(sofia.stages).map(([id, s]) => [id, s.label]));
export const fullName = `${sofia.person.firstName} ${sofia.person.lastName}`;

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
 * @param {{ stage: string, via: string }} opts  via: what triggered it, e.g. "Request Information form"
 */
export function stitch({ stage, via }) {
  if (!STAGES[stage]) throw new Error(`[sim] unknown Sofia stage "${stage}"`);
  update((s) => {
    const ts = now();
    if (!s.identity?.known) {
      const moved = becomeKnown(s, { stage, via, ts });
      s.timeline.push({
        ts,
        kind: 'stitch',
        text: `Identity moment: ${via}`,
        detail: `Matched ${sofia.person.email} to ${fullName}. ${moved} engagement ${moved === 1 ? 'row' : 'rows'} from device ${s.deviceId} now belong to her Unified Individual.`,
      });
    } else if (s.identity.stage !== stage) {
      s.identity.stage = stage;
      s.timeline.push({ ts, kind: 'stage', text: `Life stage: ${STAGES[stage]}`, detail: via });
    } else {
      s.timeline.push({ ts, kind: 'confirm', text: `Identity confirmed: ${via}` });
    }
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
