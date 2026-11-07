// Records engagement rows (PLAN.md §5.2), modeled on the UMA_WebsiteEngagement
// stream: PAGE_VIEW on load, CLICK on calls to action, FORM_START and
// FORM_SUBMIT from the demo forms, and a +1 dwell bonus after 30 seconds on
// a page, plus AGENT_INTERACTION rows from the Agentforce mock. Runs only
// with consent `all` and the simulation switched on.
import { getSettings } from '../src/scripts/settings.js';
import { WEIGHTS, DWELL_MS, UNTRACKED_SECTIONS } from './config.js';
import { categoriesFor, applyPoints } from './affinity.js';
import { update, newEventId } from './store.js';

/** The page metadata contract (PLAN.md §5.1), read from <body data-*>. */
export function readMeta() {
  const d = document.body.dataset;
  if (!d.section || !d.audience) return null;
  return { section: d.section, audience: d.audience, program: d.program, topic: d.topic };
}

const pageTitle = () => document.title.replace(/\s*\|\s*Connected University$/, '').replace(/^Connected University \| /, '');

let started = false;
let record = () => null;

/**
 * Records a row for this page from outside the tracker (the Agentforce mock).
 * `extra` adds categories beyond the page's own, such as a program the visitor
 * named in chat. Does nothing before consent or with the simulation off.
 */
export function recordEvent(action, detail, extra = []) {
  return record(action, detail, extra);
}

export function startTracking({ catalog }) {
  if (started) return;
  const meta = readMeta();
  if (!meta || UNTRACKED_SECTIONS.includes(meta.section)) return;
  started = true;
  const categories = categoriesFor(meta, catalog);

  record = (action, detail, extra = []) => {
    if (!getSettings().simulation) return null;
    const id = newEventId();
    const ts = new Date().toISOString();
    const cats = [...categories];
    for (const c of extra) {
      const key = `${c.type}:${c.value}`;
      if (!cats.some((x) => x.key === key)) cats.push({ key, type: c.type, value: c.value, label: c.label ?? c.value });
    }
    update((s) => {
      const points = applyPoints(s, cats, WEIGHTS[action], ts);
      s.events.push({
        id,
        ts,
        action,
        url: location.pathname,
        title: pageTitle(),
        ...meta,
        ...(detail ? { detail } : {}),
        points,
        ...(s.identity?.known ? { individualId: s.identity.unifiedId } : {}),
      });
    });
    return id;
  };

  const viewId = record('PAGE_VIEW');

  // Dwell bonus: 30 seconds with the tab visible, once per page view.
  let remaining = DWELL_MS;
  let since = document.visibilityState === 'visible' ? Date.now() : null;
  let timer = null;
  const arm = () => {
    clearTimeout(timer);
    if (since !== null) timer = setTimeout(dwell, remaining);
  };
  const dwell = () => {
    timer = null;
    remaining = 0;
    if (!viewId || !getSettings().simulation) return;
    const ts = new Date().toISOString();
    update((s) => {
      const row = s.events.find((e) => e.id === viewId);
      if (!row || row.engaged) return;
      const extra = applyPoints(s, categories, WEIGHTS.DWELL, ts);
      row.engaged = true;
      for (const [k, v] of Object.entries(extra)) row.points[k] = (row.points[k] ?? 0) + v;
    });
  };
  document.addEventListener('visibilitychange', () => {
    if (remaining <= 0) return;
    if (document.visibilityState === 'visible') {
      since = Date.now();
    } else if (since !== null) {
      remaining -= Date.now() - since;
      since = null;
    }
    arm();
  });
  arm();

  // Calls to action: anything marked data-cta, plus button-styled links and
  // buttons in the page. Form submit buttons are logged as FORM_SUBMIT instead.
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target.closest('[data-cta], a.btn, button.btn');
      if (!el || el.closest('.d360, .cu-widget, #cu-consent, form[data-cu-form]')) return;
      if (el.matches('button[type="submit"]')) return;
      const label = el.dataset.cta || el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60);
      record('CLICK', label);
    },
    true,
  );

  document.addEventListener('cu:form-start', (e) => record('FORM_START', e.detail?.form));
  document.addEventListener('cu:form-submit', (e) => record('FORM_SUBMIT', e.detail?.form));
  // Student Portal: the sign-in is a form submit; booking an advising appointment is a click.
  document.addEventListener('cu:portal-sign-in', () => record('FORM_SUBMIT', 'portal-sign-in'));
  document.addEventListener('cu:portal-action', (e) => record('CLICK', e.detail?.action));
}
