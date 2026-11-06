// Build-time checks for content/sofia.json, run once per build from
// BaseLayout. A stage that names something the site doesn't have fails the
// build, so the inspector can't show a program, certificate, fund, advisor
// or affinity category that isn't real.
import { getCollection } from 'astro:content';
import sofia from '../../content/sofia.json';
import facts from '../../content/facts.json';
import { fillFacts } from './fill-facts.js';
import { AUDIENCES } from './taxonomy.js';

const INTEREST_SECTIONS = ['academics', 'admissions', 'student-success', 'portal', 'alumni', 'advancement', 'continuing-ed', 'athletics', 'visit'];
const REQUIRED_STAGES = ['prospect', 'student', 'alumna', 'learner'];

let checked;

export function checkSofia() {
  checked ??= run();
  return checked;
}

async function run() {
  const fail = (msg) => {
    throw new Error(`[sofia] content/sofia.json: ${msg}`);
  };
  const programs = new Set((await getCollection('programs')).map((p) => p.id));
  const certificates = new Set((await getCollection('certificates')).map((c) => c.id));
  const teams = new Set((await getCollection('teams')).map((t) => t.id));
  const pages = await getCollection('pages');
  const topics = new Set([...pages.map((p) => p.data.topic).filter(Boolean), ...certificates, ...teams]);
  const funds = new Set(facts.giving.funds.map((f) => f.id));

  if (!programs.has(sofia.person.program)) fail(`unknown program "${sofia.person.program}"`);
  for (const id of REQUIRED_STAGES) if (!sofia.stages[id]) fail(`missing stage "${id}"`);

  for (const [stageId, st] of Object.entries(sofia.stages)) {
    if (!st.label) fail(`stage "${stageId}" needs a label`);
    for (const key of Object.keys(st.affinities ?? {})) {
      const [type, value] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
      const ok =
        (type === 'academic-interest' && programs.has(value)) ||
        (type === 'interest' && INTEREST_SECTIONS.includes(value)) ||
        (type === 'topic' && topics.has(value)) ||
        (type === 'life-stage' && AUDIENCES.includes(value));
      if (!ok) fail(`stage "${stageId}": affinity "${key}" doesn't match a program, section, page topic or audience`);
    }
    // Fill every {{facts}} token so a bad one fails here.
    JSON.stringify(st, (_, v) => (typeof v === 'string' ? fillFacts(v, `content/sofia.json (${stageId})`) : v));
  }

  const { alumna, learner } = sofia.stages;
  for (const g of alumna.gifts ?? []) if (!funds.has(g.fund)) fail(`alumna gift fund "${g.fund}" isn't in facts.giving.funds`);
  if (!certificates.has(learner.credential)) fail(`learner credential "${learner.credential}" isn't a certificate`);
  if (!programs.has(learner.nextStep?.program)) fail(`learner next step program "${learner.nextStep?.program}" isn't a program`);
  return true;
}
