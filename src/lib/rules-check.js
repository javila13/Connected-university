// Build-time checks for content/personalization-rules.json, run once per
// build from BaseLayout. A rule that names an unknown zone, variant, stage,
// program or affinity key fails the build.
import { getCollection } from 'astro:content';
import rules from '../../content/personalization-rules.json';
import sofia from '../../content/sofia.json';

const ZONES = ['pz-home-hero', 'pz-recommended-programs', 'pz-giving-cta', 'pz-next-credential'];
const WHEN_KEYS = ['person', 'stage', 'topAffinity', 'minScore', 'affinity', 'conversion'];
const PERSONS = ['sofia', 'visitor', 'known', 'anonymous'];
const TYPES = ['academic-interest', 'interest', 'topic', 'life-stage'];

let checked;

export function checkRules() {
  checked ??= run();
  return checked;
}

async function run() {
  const fail = (id, msg) => {
    throw new Error(`[rules] content/personalization-rules.json, rule "${id}": ${msg}`);
  };
  const variants = new Set((await getCollection('variants')).map((v) => v.id));
  const programs = new Set((await getCollection('programs')).map((p) => p.id));
  const ids = new Set();
  for (const r of rules.rules) {
    if (!r.id || ids.has(r.id)) fail(r.id, 'needs a unique id');
    ids.add(r.id);
    if (!ZONES.includes(r.zone)) fail(r.id, `unknown zone "${r.zone}"`);
    if (!r.reason) fail(r.id, 'needs a reason');
    if (r.zone === 'pz-recommended-programs') {
      if (r.variant !== 'rank') fail(r.id, 'pz-recommended-programs only has the "rank" variant');
      if (r.pin && !programs.has(r.pin)) fail(r.id, `pin "${r.pin}" isn't a program`);
    } else if (!variants.has(`${r.zone}/${r.variant}`)) {
      fail(r.id, `no variant file content/variants/${r.zone}/${r.variant}.md`);
    }
    const w = r.when ?? {};
    for (const k of Object.keys(w)) if (!WHEN_KEYS.includes(k)) fail(r.id, `unknown condition "${k}"`);
    if (w.person && !PERSONS.includes(w.person)) fail(r.id, `unknown person "${w.person}"`);
    if (w.stage && !sofia.stages[w.stage]) fail(r.id, `unknown stage "${w.stage}"`);
    if (w.topAffinity && !['academic-interest', 'certificate'].includes(w.topAffinity) && !programs.has(w.topAffinity)) {
      fail(r.id, `topAffinity "${w.topAffinity}" isn't "academic-interest", "certificate" or a program`);
    }
    if (w.affinity && !TYPES.includes(w.affinity.split(':')[0])) fail(r.id, `affinity "${w.affinity}" needs a type prefix`);
    if (w.conversion && !['gift', 'tickets'].includes(w.conversion)) fail(r.id, `unknown conversion "${w.conversion}"`);
  }
  return true;
}
