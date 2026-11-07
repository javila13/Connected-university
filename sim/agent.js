// Agentforce mock: the conversation logic (PLAN.md §5.8). Scripted, not
// LLM-backed. A message is matched to an intent in content/agent-scripts.json;
// the intent's first response whose `when` fits the visitor is used, so the
// agent answers from whatever the profile holds: Sofia's record, a new
// contact's typed details, browsing affinities, or nothing (Jesse,
// 2026-11-07, option 1). The UI is sim/agent-ui.js.
import scripts from '../content/agent-scripts.json';
import sofia from '../content/sofia.json';
import { fillFacts } from '../src/lib/fill-facts.js';
import { contextFor, tokensFor, matches, signalsFor } from './personalize.js';
import { AGENT_TOKENS } from './agent-tokens.js';

export const AGENTS = scripts.agents;
export const SHARED = scripts.shared;

const TOKEN = /\[\[(\w+)\]\]/g;
const facts = (s) => fillFacts(s, 'content/agent-scripts.json');
const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '');
const usd = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;
const listJoin = (items, last = 'and') =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} ${last} ${items.at(-1)}`;
const TIMES = { 1: 'once', 2: 'twice' };

/** Program or certificate named in a message, and a credit count for the transfer estimate. */
export function readMessage(text, catalog = {}) {
  // "continuing education" isn't the Education program.
  const lower = ` ${text.toLowerCase().replace(/continuing ed(ucation)?/g, ' ')} `;
  const wantsCertificate = /certificate/.test(lower);
  let program = null;
  for (const [id, info] of Object.entries(catalog.programInfo ?? {})) {
    const title = info.title.toLowerCase();
    const first = title.split(/\s+/)[0];
    if (lower.includes(title) || new RegExp(`\\b${first}\\b`).test(lower)) {
      program = id;
      break;
    }
  }
  let certificate = null;
  for (const [id, info] of Object.entries(catalog.certificateInfo ?? {})) {
    const short = (info.shortTitle ?? '').toLowerCase();
    if (short && lower.includes(short)) {
      certificate = id;
      break;
    }
  }
  // "the sustainability certificate" is the certificate, not the program.
  if (certificate && program && wantsCertificate) program = null;
  if (certificate && program && !wantsCertificate) certificate = null;
  const n = lower.match(/\b(\d{1,3})\s*\+?\s*(credits?|cr)\b/);
  return { program, certificate, credits: n ? Number(n[1]) : null };
}

/** Every [[token]] value for this visitor and message. */
export function agentTokens(ctx, said = {}) {
  const { catalog } = ctx;
  const t = tokensFor(ctx);
  const st = sofia.stages;
  const fill = (s) => fillFacts(s, 'content/sofia.json');
  const aid = st.prospect.aid.map((a) => ({ name: a.name, amount: fill(a.amount) }));
  const student = st.student;
  const alumna = st.alumna;
  const learner = st.learner;
  const profile = ctx.identity?.profile ?? {};
  const prog = said.program ? catalog.programInfo?.[said.program] : null;
  const cert = said.certificate ? catalog.certificateInfo?.[said.certificate] : null;
  const typed = profile.program && catalog.programs?.[profile.program] ? profile.program : null;
  Object.assign(t, {
    aidList: listJoin(aid.map((a) => `${a.name} (${a.amount})`), 'and the'),
    aidTotal: usd(aid.reduce((sum, a) => sum + Number(a.amount.replace(/[^\d]/g, '')), 0)),
    campusVisits: TIMES[st.prospect.campusVisits] ?? `${st.prospect.campusVisits} times`,
    credentialTitle: catalog.certificates?.[learner.credential] ?? learner.credential,
    credentialEarned: learner.credentialEarned,
    nextStepLabel: learner.nextStep.label,
    advisorName: catalog.faculty?.[student.advisor] ?? student.advisor,
    nextAdvising: student.nextAdvising,
    standing: lowerFirst(student.standing),
    cumulativeGpa: student.cumulativeGpa.toFixed(2),
    creditsEarned: String(student.creditsEarned),
    earlyAlertCourse: student.earlyAlert.course,
    earlyAlertTerm: lowerFirst(student.earlyAlert.term),
    courseList: listJoin(student.currentCourses.map((c) => c.code)),
    firstCourse: student.currentCourses[0]?.code ?? '',
    studentDeadlines: student.deadlines.map((d) => `${d.label}: ${fill(d.date)}`).join('; '),
    jobTitle: lowerFirst(alumna.jobTitle),
    employer: lowerFirst(alumna.employer),
    city: alumna.city,
    typedProgramId: typed ?? '',
    typedProgramTitle: typed ? catalog.programs[typed] : '',
    askedProgramId: prog ? said.program : '',
    askedProgramTitle: prog?.title ?? '',
    askedProgramDescription: prog?.description ?? '',
    askedProgramUrl: prog?.url ?? '',
    askedCertificateId: cert ? said.certificate : '',
    askedCertificateTitle: cert?.title ?? '',
    askedCertificateDescription: cert?.description ?? '',
    askedCertificateUrl: cert?.url ?? '',
    estimateCredits: said.credits != null ? String(Math.min(said.credits, Number(facts('{{facts.admissions.transfer.maxCredits|raw}}')))) : '',
  });
  return t;
}

/** Fills [[tokens]] and {{facts}} in plain text. */
export function fill(text, tokens) {
  return facts(String(text ?? '').replace(TOKEN, (_, k) => tokens[k] ?? ''));
}

const fits = (when, ctx, tokens) => !when || ((!when.has || !!tokens[when.has]) && matches(when, ctx));

/** The first response in a list whose `when` fits. */
export function pick(responses, ctx, tokens) {
  return responses.find((r) => fits(r.when, ctx, tokens)) ?? responses.at(-1);
}

/** A response as a chat message: text, links, chips and the signals it used, all filled. */
export function toMessage(resp, ctx, tokens, extra = {}) {
  return {
    from: 'agent',
    text: fill(resp.text, tokens),
    ...(resp.links?.length ? { links: resp.links.map((l) => ({ label: fill(l.label, tokens), href: fill(l.href, tokens) })) } : {}),
    ...(resp.chips?.length ? { chips: resp.chips.map((c) => fill(c, tokens)) } : {}),
    ...(resp.card ? { card: { title: fill(resp.card.title, tokens), value: fill(resp.card.value, tokens), note: fill(resp.card.note, tokens) } } : {}),
    ...(resp.identify ? { identify: true } : {}),
    ...(resp.when ? { grounding: signalsFor({ when: resp.when }, ctx) } : {}),
    ...extra,
  };
}

/** The agent's greeting for this visitor. */
export function greet(agentId, state, catalog) {
  const ctx = contextFor(state, catalog);
  const tokens = agentTokens(ctx);
  return toMessage(pick(AGENTS[agentId].greeting, ctx, tokens), ctx, tokens);
}

/** The thank-you after the chat sign-in form. */
export function identified(state, catalog) {
  const ctx = contextFor(state, catalog);
  const tokens = agentTokens(ctx);
  return toMessage(pick(SHARED.identify.responses, ctx, tokens), ctx, tokens, { grounding: undefined });
}

const compiled = new Map();
const re = (p) => {
  if (!compiled.has(p)) compiled.set(p, new RegExp(p, 'i'));
  return compiled.get(p);
};

/** Best intent for a message: most pattern hits, a mention of a program or certificate counts once; ties go to the earlier intent. */
export function matchIntent(agentId, text, said) {
  let best = null;
  let bestScore = 0;
  for (const intent of AGENTS[agentId].intents) {
    let score = (intent.match ?? []).filter((p) => re(p).test(text)).length;
    if (intent.mentions?.some((m) => said[m])) score++;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}

/**
 * The agent's reply to a message. Returns { message, intent, said }, or
 * { search: true, said } when no intent matched, so the UI can look the
 * question up in the site's pages before falling back.
 */
export function reply(agentId, text, state, catalog) {
  const said = readMessage(text, catalog);
  const ctx = contextFor(state, catalog);
  const tokens = agentTokens(ctx, said);
  if (SHARED.thanks.match.some((p) => re(p).test(text))) {
    return { message: { from: 'agent', text: fill(SHARED.thanks.text, tokens), chips: fallbackChips(agentId, tokens) }, intent: 'thanks', said };
  }
  const intent = matchIntent(agentId, text, said);
  if (!intent) return { search: true, said };
  return { message: toMessage(pick(intent.responses, ctx, tokens), ctx, tokens), intent: intent.id, said };
}

function fallbackChips(agentId, tokens) {
  return AGENTS[agentId].fallback.chips.map((c) => fill(c, tokens));
}

/** The fallback, when neither an intent nor the site's pages answer. */
export function fallback(agentId, state, catalog) {
  const tokens = agentTokens(contextFor(state, catalog));
  return { from: 'agent', text: fill(AGENTS[agentId].fallback.text, tokens), chips: fallbackChips(agentId, tokens) };
}

export const SEARCH_INTRO = () => SHARED.search.text;
export const IDENTIFY_PROMPT = () => SHARED.identify.prompt;
export { AGENT_TOKENS };
