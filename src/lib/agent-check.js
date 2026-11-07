// Build-time checks for content/agent-scripts.json (PLAN.md §5.8), run once
// per build from BaseLayout. Fails the build on: an agent that isn't one of
// the three personas; a greeting, intent or response list without a last
// response that works for anyone; a response without quick-reply chips; an
// unknown condition, [[token]] or {{facts}} path; a pattern that doesn't
// compile; or a link to a page that doesn't exist.
import { getCollection } from 'astro:content';
import scripts from '../../content/agent-scripts.json';
import { AGENT_PERSONAS } from './taxonomy.js';
import { fillFacts } from './fill-facts.js';
import { getRouteSet } from './routes.js';
import { checkWhen } from './rules-check.js';
import { AGENT_TOKENS } from '../../sim/agent-tokens.js';

let checked;

export function checkAgentScripts() {
  checked ??= run();
  return checked;
}

async function run() {
  const routes = await getRouteSet();
  const programs = new Set((await getCollection('programs')).map((p) => p.id));
  const where = 'content/agent-scripts.json';

  const text = (s, at) => {
    for (const [, name] of String(s).matchAll(/\[\[(\w+)\]\]/g)) {
      if (!AGENT_TOKENS.includes(name)) throw new Error(`[agent] ${where}, ${at}: unknown token [[${name}]]`);
    }
    fillFacts(String(s), `${where}, ${at}`); // throws on an unknown fact
  };
  const response = (r, at, { needsChips = true } = {}) => {
    const fail = (msg) => {
      throw new Error(`[agent] ${where}, ${at}: ${msg}`);
    };
    if (!r.text) fail('needs text');
    text(r.text, at);
    if (needsChips && !r.chips?.length) fail('needs quick-reply chips');
    for (const c of r.chips ?? []) text(c, at);
    for (const l of r.links ?? []) {
      text(l.label, at);
      text(l.href, at);
      if (l.href.includes('[[')) continue; // filled from the catalog in the browser
      const path = fillFacts(l.href, where).split(/[?#]/)[0];
      if (!routes.has(path)) fail(`link to "${path}", which isn't a page`);
    }
    if (r.card) for (const k of ['title', 'value', 'note']) text(r.card[k] ?? fail(`card needs ${k}`), at);
    checkWhen(r.when, fail, { programs, extraKeys: ['has'] });
    if (r.when?.has && !AGENT_TOKENS.includes(r.when.has)) fail(`has: unknown token "${r.when.has}"`);
  };
  const list = (responses, at, opts) => {
    if (!responses?.length) throw new Error(`[agent] ${where}, ${at}: needs responses`);
    responses.forEach((r, i) => response(r, `${at} #${i + 1}`, opts));
    if (responses.at(-1).when) throw new Error(`[agent] ${where}, ${at}: the last response must have no "when", so it works for anyone`);
  };

  const ids = Object.keys(scripts.agents);
  for (const id of Object.keys(AGENT_PERSONAS)) if (!ids.includes(id)) throw new Error(`[agent] ${where}: no script for agent "${id}"`);
  for (const [id, agent] of Object.entries(scripts.agents)) {
    if (!AGENT_PERSONAS[id]) throw new Error(`[agent] ${where}: "${id}" isn't an agent persona (src/lib/taxonomy.js)`);
    list(agent.greeting, `${id} greeting`);
    const seen = new Set();
    for (const intent of agent.intents) {
      const at = `${id} intent "${intent.id}"`;
      if (!intent.id || seen.has(intent.id)) throw new Error(`[agent] ${where}, ${at}: needs a unique id`);
      seen.add(intent.id);
      if (!intent.match?.length && !intent.mentions?.length) throw new Error(`[agent] ${where}, ${at}: needs match patterns or mentions`);
      for (const p of intent.match ?? []) new RegExp(p, 'i'); // throws on a bad pattern
      for (const m of intent.mentions ?? []) {
        if (!['program', 'certificate'].includes(m)) throw new Error(`[agent] ${where}, ${at}: unknown mention "${m}"`);
      }
      list(intent.responses, at);
    }
    response(agent.fallback, `${id} fallback`);
  }
  const shared = scripts.shared;
  text(shared.thanks.text, 'shared thanks');
  shared.thanks.match.forEach((p) => new RegExp(p, 'i'));
  text(shared.search.text, 'shared search');
  text(shared.identify.prompt, 'shared identify');
  list(shared.identify.responses, 'shared identify', { needsChips: false });
  return true;
}
