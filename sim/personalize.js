// Personalization engine (PLAN.md §5.4). For each zone on the page, the first
// rule in content/personalization-rules.json whose `when` matches the visitor
// picks a variant; with no match the zone keeps the default it was built
// with. Variants are <template data-pz-template> elements written at build
// time; pz-recommended-programs reorders its program cards instead. Decisions
// go to the simulated personalization log, and a "Why am I seeing this?"
// button explains each one. It re-runs whenever the profile changes, in this
// tab or another, so a preset or a stitch updates the page live.
import rulesFile from '../content/personalization-rules.json';
import sofia from '../content/sofia.json';
import { getState, update, subscribe } from './store.js';
import { rankAffinities } from './affinity.js';
import { displayName, STAGES } from './identity.js';
import { fundName } from './profile.js';
import { OBJECTS } from './config.js';
import { esc } from './views.js';
import { getSettings, onSettingsChange, effectiveMin } from '../src/scripts/settings.js';
import { isGranted } from '../src/scripts/consent.js';

/** Oldest decisions are dropped beyond this. */
export const MAX_DECISIONS = 200;
const RULES = rulesFile.rules;

const usd = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;
/** "1 point", "4 points". */
export const pts = (n) => `${n} ${Number(n) === 1 ? 'point' : 'points'}`;
const time = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });

/** What the rules can see about the visitor. */
export function contextFor(state, catalog = {}) {
  const id = state.identity ?? { known: false };
  const certIds = Object.keys(catalog.certificateInfo ?? catalog.certificates ?? {});
  const topProgram = rankAffinities(state, 'academic-interest')[0] ?? null;
  const topCertificate = rankAffinities(state, 'topic').find((a) => certIds.includes(a.value)) ?? null;
  const gifts = (state.conversions ?? []).filter((c) => c.type === 'gift');
  return {
    state,
    catalog,
    known: !!id.known,
    person: id.known ? id.personId : 'anonymous',
    stage: id.known ? id.stage : null,
    identity: id,
    topProgram,
    topCertificate,
    gift: gifts[gifts.length - 1] ?? null,
    score: (key) => state.affinities[key]?.score ?? 0,
    label: (key) => state.affinities[key]?.label ?? key,
  };
}

/** True when a rule's `when` fits the visitor. Also used by the agent (sim/agent.js). */
export function matches(when = {}, ctx) {
  if (when.person) {
    if (when.person === 'known' ? !ctx.known : when.person !== ctx.person) return false;
  }
  if (when.stage && when.stage !== ctx.stage) return false;
  const min = when.minScore ?? 1;
  if (when.topAffinity) {
    const top =
      when.topAffinity === 'academic-interest'
        ? ctx.topProgram
        : when.topAffinity === 'certificate'
          ? ctx.topCertificate
          : ctx.topProgram?.value === when.topAffinity
            ? ctx.topProgram
            : null;
    if (!top || top.score < min) return false;
  }
  if (when.affinity && ctx.score(when.affinity) < min) return false;
  if (when.conversion && !(ctx.state.conversions ?? []).some((c) => c.type === when.conversion)) return false;
  return true;
}

/** A rule's `when` with the /demo tuner's threshold, if any. */
const tuned = (rule, settings) =>
  typeof rule.when?.minScore === 'number' ? { ...rule.when, minScore: effectiveMin(rule, settings) } : rule.when;

/** The first matching rule for a zone, or null for the default. */
export function decide(zone, ctx, settings = getSettings()) {
  return RULES.find((r) => r.zone === zone && matches(tuned(r, settings), ctx)) ?? null;
}

/** Values for [[token]] placeholders in variants and reasons. */
export function tokensFor(ctx) {
  const { catalog, identity } = ctx;
  const firstName =
    ctx.person === 'sofia' ? sofia.person.firstName : ctx.person === 'visitor' ? (identity.profile?.firstName ?? '') : '';
  const prog = ctx.topProgram ? (catalog.programInfo?.[ctx.topProgram.value] ?? {}) : {};
  const cert = ctx.topCertificate ? (catalog.certificateInfo?.[ctx.topCertificate.value] ?? {}) : {};
  const lastGift = sofia.stages.alumna.gifts.at(-1);
  return {
    firstName,
    commaFirstName: firstName ? `, ${firstName}` : '',
    herProgramTitle: catalog.programs?.[sofia.person.program] ?? sofia.person.program,
    programId: ctx.topProgram?.value ?? '',
    programTitle: prog.title ?? ctx.topProgram?.label ?? '',
    programDescription: prog.description ?? '',
    programUrl: prog.url ?? '/academics/programs/',
    programScore: String(ctx.topProgram?.score ?? 0),
    programPoints: pts(ctx.topProgram?.score ?? 0),
    certificateId: ctx.topCertificate?.value ?? '',
    certificateTitle: cert.title ?? ctx.topCertificate?.label ?? '',
    certificateDescription: cert.description ?? '',
    certificateUrl: cert.url ?? '/continuing-ed/certificates/',
    certificateScore: String(ctx.topCertificate?.score ?? 0),
    certificatePoints: pts(ctx.topCertificate?.score ?? 0),
    athleticsScore: String(ctx.score('interest:athletics')),
    athleticsPoints: pts(ctx.score('interest:athletics')),
    lastGiftAmount: lastGift ? usd(lastGift.amount) : '',
    lastGiftFund: lastGift ? fundName(lastGift.fund) : '',
    giftAmount: ctx.gift ? `${usd(ctx.gift.amount)}${ctx.gift.frequency === 'monthly' ? ' monthly' : ''}` : '',
    giftFund: ctx.gift ? fundName(ctx.gift.fund) : '',
  };
}

const TOKEN = /\[\[(\w+)\]\]/g;
/** Fills [[tokens]] in plain text. */
export const fillText = (text, tokens) => String(text).replace(TOKEN, (_, k) => tokens[k] ?? '');
/** Fills [[tokens]] in already-escaped HTML, escaping each value. */
const fillHtml = (html, tokens) => html.replace(TOKEN, (_, k) => esc(tokens[k] ?? ''));

/** The signals a rule looked at, as plain-text lines for the popover and the log. */
export function signalsFor(rule, ctx) {
  const w = rule.when ?? {};
  const out = [];
  if (w.person) out.push(`Identity: ${ctx.known ? displayName(ctx.identity) : 'anonymous visitor'}${ctx.person === 'visitor' ? ' (new contact)' : ''}`);
  if (w.stage) out.push(`Life stage: ${STAGES[ctx.stage] ?? ctx.stage}`);
  if (w.topAffinity === 'certificate' && ctx.topCertificate) {
    out.push(`Top certificate interest: ${ctx.topCertificate.label}, ${pts(ctx.topCertificate.score)}`);
  } else if (w.topAffinity && ctx.topProgram) {
    out.push(`Top academic interest: ${ctx.topProgram.label}, ${pts(ctx.topProgram.score)}`);
  }
  if (w.affinity) out.push(`${ctx.label(w.affinity)}: ${pts(ctx.score(w.affinity))}`);
  if (w.conversion === 'gift' && ctx.gift) out.push(`Gift this visit: ${usd(ctx.gift.amount)} to ${fundName(ctx.gift.fund)}`);
  if (w.conversion === 'tickets') out.push('Ticket order this visit');
  if (rule.pin) out.push(`Pinned first: ${ctx.catalog.programs?.[rule.pin] ?? rule.pin}`);
  return out;
}

// ---- Zones on this page --------------------------------------------------

function readZones() {
  return [...document.querySelectorAll('[data-pz-zone]')].map((el) => {
    const slot = el.querySelector('[data-pz-slot]') ?? el;
    const list = el.querySelector('[data-pz-rank]');
    return {
      el,
      id: el.dataset.pzZone,
      slot,
      defaultHtml: slot.innerHTML,
      list,
      defaultOrder: list ? [...list.children] : [],
      limit: Number(el.dataset.pzLimit) || 0,
      templates: Object.fromEntries([...el.querySelectorAll('template[data-pz-template]')].map((t) => [t.dataset.pzTemplate, t])),
      applied: { key: 'default' },
    };
  });
}

/** Program ids in display order: the pin first, then by academic interest, ties in default order. */
function rankOrder(zone, rule, ctx) {
  const items = zone.defaultOrder.map((li, i) => ({ li, i, id: li.querySelector('[data-program]')?.dataset.program }));
  const score = (id) => ctx.score(`academic-interest:${id}`);
  return items.sort((a, b) => (b.id === rule.pin) - (a.id === rule.pin) || score(b.id) - score(a.id) || a.i - b.i);
}

function setOrder(zone, items) {
  items.forEach(({ li }, i) => {
    zone.list.append(li);
    li.hidden = zone.limit > 0 && i >= zone.limit;
  });
}

/** Applies a decision to a zone. Returns what's now shown, or null if nothing changed. */
function apply(zone, rule, ctx, tokens, salt = '') {
  if (!rule) {
    if (zone.applied.key === 'default') return null;
    if (zone.list) setOrder(zone, zone.defaultOrder.map((li) => ({ li })));
    else zone.slot.innerHTML = zone.defaultHtml;
    zone.el.dataset.pzVariant = 'default';
    zone.applied = { key: 'default' };
    return { key: 'default' };
  }
  if (zone.list) {
    const items = rankOrder(zone, rule, ctx);
    const shown = items.slice(0, zone.limit || items.length).map((x) => x.id);
    const key = `${rule.id}|${salt}|${items.map((x) => x.id).join(',')}`;
    if (zone.applied.key === key) return null;
    setOrder(zone, items);
    zone.el.dataset.pzVariant = rule.variant;
    zone.applied = { key, shown };
    return zone.applied;
  }
  const tpl = zone.templates[rule.variant];
  if (!tpl) {
    console.warn(`[sim] ${zone.id}: no template for variant "${rule.variant}" on this page`);
    return null;
  }
  const html = fillHtml(tpl.innerHTML, tokens);
  const key = `${rule.id}|${salt}|${html}`;
  if (zone.applied.key === key) return null;
  zone.slot.innerHTML = html;
  zone.el.dataset.pzVariant = rule.variant;
  zone.applied = { key };
  return zone.applied;
}

// ---- "Why am I seeing this?" --------------------------------------------

function closeAllWhy(except) {
  for (const btn of document.querySelectorAll('.pz-why__btn[aria-expanded="true"]')) {
    if (btn === except) continue;
    btn.setAttribute('aria-expanded', 'false');
    btn.nextElementSibling.hidden = true;
  }
}

function renderWhy(zone, decision, show) {
  const host = zone.el.querySelector('[data-pz-why-host]') ?? zone.el;
  let box = host.querySelector(':scope > .pz-why');
  if (!show || !decision) {
    box?.remove();
    return;
  }
  if (box?.dataset.decision === decision.id) return;
  if (!box) {
    box = document.createElement('div');
    box.className = 'pz-why';
    host.classList.add('pz-why-host');
    host.append(box);
  }
  box.dataset.decision = decision.id;
  const wasOpen = box.querySelector('.pz-why__btn')?.getAttribute('aria-expanded') === 'true';
  const panelId = `pz-why-${zone.id}`;
  box.innerHTML = `
    <button type="button" class="pz-why__btn" aria-expanded="${wasOpen}" aria-controls="${panelId}">
      <span class="pz-why__icon" aria-hidden="true">i</span> Why am I seeing this?
    </button>
    <div class="pz-why__panel" id="${panelId}" role="region" aria-label="Why this content is shown"${wasOpen ? '' : ' hidden'}>
      <p class="pz-why__title"><strong>Personalized for this visitor</strong> <span class="sim-badge">Simulated</span></p>
      <p>${esc(decision.reason)}</p>
      ${decision.signals.length ? `<ul class="pz-why__signals">${decision.signals.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <dl class="pz-why__facts">
        <dt>Personalization point</dt><dd><code>${esc(zone.id)}</code></dd>
        <dt>Rule</dt><dd><code>${esc(decision.ruleId)}</code></dd>
        <dt>Variant</dt><dd><code>${esc(decision.variant)}</code></dd>
      </dl>
      <p class="pz-why__log">Decision logged to <code>${esc(OBJECTS.personalizationLog)}</code> at ${esc(time(decision.ts))}.</p>
    </div>`;
  const btn = box.querySelector('.pz-why__btn');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    closeAllWhy(btn);
    btn.setAttribute('aria-expanded', String(open));
    btn.nextElementSibling.hidden = !open;
  });
}

// ---- Run -----------------------------------------------------------------

let started = false;

/** Starts personalizing this page's zones. Call once; it checks consent and the /demo switch itself. */
export function startPersonalization({ catalog = {} } = {}) {
  document.documentElement.classList.remove('pz-pending');
  if (started) return;
  started = true;
  const zones = readZones();
  if (!zones.length) return;
  const current = new Map(); // zone id -> decision shown

  function run() {
    const settings = getSettings();
    const active = settings.simulation && isGranted();
    const state = getState();
    const ctx = contextFor(state, catalog);
    const tokens = tokensFor(ctx);
    const logged = [];
    for (const zone of zones) {
      const rule = active ? decide(zone.id, ctx, settings) : null;
      // The threshold is part of the key, so tuning it re-logs the decision with the new reason.
      const changed = apply(zone, rule, ctx, tokens, rule ? String(effectiveMin(rule, settings) ?? '') : '');
      if (changed && rule) {
        const decision = {
          id: `pzd_${Math.random().toString(36).slice(2, 10)}`,
          ts: new Date().toISOString(),
          zone: zone.id,
          ruleId: rule.id,
          variant: rule.variant,
          reason: fillText(rule.reason, { ...tokens, minScore: String(effectiveMin(rule, settings) ?? '') }),
          signals: signalsFor(rule, ctx),
          shown: changed.shown,
          page: location.pathname,
          person: ctx.known ? displayName(ctx.identity) : 'Anonymous visitor',
        };
        current.set(zone.id, decision);
        logged.push(decision);
      } else if (changed) {
        current.delete(zone.id);
      }
      renderWhy(zone, current.get(zone.id), active && settings.showWhy);
    }
    // Logged after the zones are set, so the change this causes re-runs as a no-op.
    if (logged.length) {
      update((s) => {
        s.decisions.push(...logged);
        if (s.decisions.length > MAX_DECISIONS) s.decisions.splice(0, s.decisions.length - MAX_DECISIONS);
      });
    }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pz-why')) closeAllWhy();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.pz-why__btn[aria-expanded="true"]');
    if (open) {
      closeAllWhy();
      open.focus();
    }
  });
  subscribe(run);
  onSettingsChange(run);
  window.addEventListener('cu:consent', run);
  run();
}
