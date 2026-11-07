// Inspector tab views (PLAN.md §5.6). Plain functions from state to HTML, so
// the drawer and the /data360 companion window render the same thing.
// Every value is escaped.
import { OBJECTS } from './config.js';
import { rankAffinities, TYPE_LABELS } from './affinity.js';
import { stageRows, stageLabel, stageInfo, person, fundName } from './profile.js';
import { displayName } from './identity.js';
import { humanize } from './affinity.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : '–');
const objectTag = (name) => `<p class="d360-object">Object: <code>${esc(name)}</code></p>`;

const ACTION_LABELS = {
  PAGE_VIEW: 'Page view',
  CLICK: 'Click',
  FORM_START: 'Form start',
  FORM_SUBMIT: 'Form submit',
  AGENT_INTERACTION: 'Agent chat',
};

/** Banner when nothing is being recorded. */
export function statusNote({ consent, simulation }) {
  if (!simulation) return `<p class="d360-note">The simulation is switched off in /demo. Nothing is being recorded.</p>`;
  if (consent !== 'all') {
    return `<p class="d360-note">Waiting for cookie consent. Tracking starts when the visitor accepts all cookies.</p>`;
  }
  return '';
}

const facts = (rows) =>
  `<dl class="d360-facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;

function knownProfileView(state, { catalog = {} } = {}) {
  const id = state.identity;
  const info = stageInfo(id.stage);
  const top = rankAffinities(state).slice(0, 3);
  const prefs = info.smsOptIn ? 'Email and text' : 'Email';
  return `
    ${objectTag(OBJECTS.individual)}
    <div class="d360-profile">
      <div class="d360-avatar d360-avatar--known" aria-hidden="true">${esc(person.firstName[0] + person.lastName[0])}</div>
      <div>
        <p class="d360-profile__name">${esc(`${person.firstName} ${person.lastName}`)}</p>
        <p class="d360-muted">${esc(person.email)}</p>
        <p><span class="d360-stage">${esc(stageLabel(id.stage))}</span></p>
      </div>
    </div>
    ${facts([
      ['Unified Individual', id.unifiedId],
      ['Constituent role', info.constituentRole ?? ''],
      ...stageRows(id.stage, catalog),
      ['Contact preferences', prefs],
      ['Top affinities', top.length ? top.map((a) => a.label).join(', ') : 'None yet'],
    ])}
    ${conversionsView(state)}
    <p class="d360-muted">Known since ${esc(time(id.stitchedAt))}, via ${esc(id.via)}. Device <code>${esc(state.deviceId)}</code> and its ${state.events.length} engagement ${state.events.length === 1 ? 'row' : 'rows'} belong to this Unified Individual.</p>`;
}

const usd = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;

/** Gifts and ticket orders made in this demo session. */
function conversionsView(state) {
  const list = state.conversions ?? [];
  if (!list.length) return '';
  const rows = list.map((c) =>
    c.type === 'gift'
      ? [`Gift, ${time(c.ts)}`, `${usd(c.amount)}${c.frequency === 'monthly' ? ' monthly' : ''} to ${fundName(c.fund)}`]
      : [`Tickets, ${time(c.ts)}`, `${c.game}, ${usd(c.total)}`],
  );
  return `<h3 class="d360-group">Conversions this visit</h3>${facts(rows)}`;
}

/** A new contact made from a form (Identity matching: "Match typed email"). */
function newContactView(state, { catalog = {} } = {}) {
  const id = state.identity;
  const p = id.profile ?? {};
  const name = displayName(id);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const label = (v, map) => (v ? map?.[v] ?? humanize(v) : null);
  const rows = [
    ['Unified Individual', id.unifiedId],
    ['Source', `New contact from the ${id.via}`],
    ['Phone', p.phone],
    ['Program of interest', label(p.program, catalog.programs)],
    ['Student type', label(p.studentType)],
    ['Interest', label(p.interest, catalog.certificates)],
    ['Class year', p.classYear],
    ['Job', [p.jobTitle, p.employer].filter(Boolean).join(', ') || null],
    ['City', p.city],
    ['Contact preferences', p.smsOptIn ? 'Email and text' : 'Email'],
    ['Top affinities', rankAffinities(state).slice(0, 3).map((a) => a.label).join(', ') || 'None yet'],
  ].filter(([, v]) => v);
  return `
    ${objectTag(OBJECTS.individual)}
    <div class="d360-profile">
      <div class="d360-avatar d360-avatar--new" aria-hidden="true">${esc(initials || '?')}</div>
      <div>
        <p class="d360-profile__name">${esc(name)}</p>
        <p class="d360-muted">${esc(id.email)}</p>
        <p><span class="d360-stage d360-stage--new">New contact</span></p>
      </div>
    </div>
    ${facts(rows)}
    ${conversionsView(state)}
    <p class="d360-muted">No CRM history yet: this is a new record, so there's no application, gift or credential to personalize on. Personalization and the agent work from affinities and what was typed. Known since ${esc(time(id.stitchedAt))}.</p>`;
}

export function profileView(state, ctx = {}) {
  if (state.identity?.known && state.identity.personId !== 'sofia') return newContactView(state, ctx);
  if (state.identity?.known) return knownProfileView(state, ctx);
  const total = state.events.length;
  const top = rankAffinities(state).slice(0, 3);
  return `
    ${objectTag(OBJECTS.individual)}
    <div class="d360-profile">
      <div class="d360-avatar" aria-hidden="true">?</div>
      <div>
        <p class="d360-profile__name">Anonymous visitor</p>
        <p class="d360-muted">Device <code>${esc(state.deviceId)}</code></p>
      </div>
    </div>
    <dl class="d360-facts">
      <dt>Unified Individual</dt><dd>Not resolved yet</dd>
      <dt>First seen</dt><dd>${esc(time(state.firstSeen))}</dd>
      <dt>Engagement rows</dt><dd>${total}</dd>
      <dt>Top affinities</dt><dd>${top.length ? top.map((a) => esc(a.label)).join(', ') : 'None yet'}</dd>
    </dl>
    <p class="d360-muted">Submitting any form with an email (except the recruiting questionnaire), or signing in to the Student Portal, stitches this device to a known person.</p>`;
}

export function identityView(state) {
  const id = state.identity ?? { known: false };
  const steps = [
    ...(state.firstSeen ? [{ ts: state.firstSeen, kind: 'device', text: 'Anonymous device first seen', detail: `Device ${state.deviceId}` }] : []),
    ...(state.timeline ?? []),
  ].sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  return `
    <p class="d360-object">Party identification</p>
    ${facts([
      ['Device ID', state.deviceId],
      ['Email', id.known ? id.email : 'Unknown'],
      ['Unified Individual', id.known ? id.unifiedId : 'Not resolved yet'],
      ['CRM contact', id.known ? (id.personId === 'sofia' ? displayName(id) : `${displayName(id)} (new)`) : 'None'],
    ])}
    <h3 class="d360-group">Identity timeline</h3>
    ${
      steps.length
        ? `<ol class="d360-timeline">${steps
            .map(
              (s) => `
          <li class="d360-timeline__item d360-timeline__item--${esc(s.kind)}">
            <p class="d360-muted">${esc(time(s.ts))}</p>
            <p class="d360-timeline__text">${esc(s.text)}</p>
            ${s.detail ? `<p class="d360-muted">${esc(s.detail)}</p>` : ''}
          </li>`,
            )
            .join('')}</ol>`
        : `<p class="d360-empty">Nothing yet. The device is recorded on the first page view.</p>`
    }`;
}

export function engagementView(state, { isNew = () => false } = {}) {
  const rows = [...state.events].reverse();
  if (!rows.length) return `${objectTag(OBJECTS.engagement)}<p class="d360-empty">No engagement yet. Browse the site to see rows appear.</p>`;
  return `
    ${objectTag(OBJECTS.engagement)}
    <ol class="d360-rows">
      ${rows
        .map((e) => {
          const pts = Object.values(e.points ?? {}).reduce((a, b) => Math.max(a, b), 0);
          const chips = [e.program, e.topic].filter(Boolean).map((c) => `<span class="d360-chip">${esc(c)}</span>`).join('');
          return `
            <li class="d360-row${isNew(e.id) ? ' is-new' : ''}" data-action="${esc(e.action)}">
              <div class="d360-row__head">
                <span class="d360-action d360-action--${esc(e.action.toLowerCase())}">${esc(ACTION_LABELS[e.action] ?? e.action)}</span>
                <span class="d360-muted">${esc(time(e.ts))}</span>
                <span class="d360-points" title="Points added to each matching affinity">+${pts}${e.engaged ? ' · engaged 30s' : ''}</span>
              </div>
              <p class="d360-row__title">${esc(e.title)}${e.detail ? ` <span class="d360-muted">· ${esc(e.detail)}</span>` : ''}</p>
              <p class="d360-row__meta"><code>${esc(e.url)}</code> <span class="d360-chip d360-chip--section">${esc(e.section)}</span>${chips}</p>
            </li>`;
        })
        .join('')}
    </ol>`;
}

// Grouped by type, academic interest first: it's the signal the stories key on,
// and the life-stage signal (every page has one) would otherwise always lead.
const TYPE_ORDER = ['academic-interest', 'interest', 'topic', 'life-stage'];

export function affinitiesView(state) {
  const all = rankAffinities(state);
  if (!all.length) return `${objectTag(OBJECTS.affinity)}<p class="d360-empty">No affinities yet. They form as the visitor engages.</p>`;
  const max = all[0].score;
  const groups = TYPE_ORDER.map((type) => ({ type, items: all.filter((a) => a.type === type) })).filter((g) => g.items.length);
  return `
    ${objectTag(OBJECTS.affinity)}
    ${groups
      .map(
        (g) => `
      <h3 class="d360-group">${esc(TYPE_LABELS[g.type])}</h3>
      <ol class="d360-affinities" data-type="${esc(g.type)}">
        ${g.items
          .map(
            (a, i) => `
            <li class="d360-affinity${i === 0 && g.type === 'academic-interest' ? ' is-top' : ''}" data-key="${esc(a.key)}">
              <div class="d360-affinity__head">
                <span class="d360-affinity__label">${esc(a.label)}</span>
                <span class="d360-affinity__score">${a.score}</span>
              </div>
              <div class="d360-bar" aria-hidden="true"><span style="width:${Math.max(4, Math.round((a.score / max) * 100))}%"></span></div>
              <p class="d360-muted">${a.seeded ? 'From earlier engagement · ' : ''}Updated ${esc(time(a.updated))}</p>
            </li>`,
          )
          .join('')}
      </ol>`,
      )
      .join('')}`;
}

/** Personalization decisions, newest first (PLAN.md §5.4, §5.6). */
export function decisionsView(state, { catalog = {} } = {}) {
  const list = [...(state.decisions ?? [])].reverse();
  if (!list.length) {
    return `${objectTag(OBJECTS.personalizationLog)}<p class="d360-empty">No personalization decisions yet. Zones on the home page, program pages, Alumni and Giving pages and Continuing Ed change as the profile builds.</p>`;
  }
  return `
    ${objectTag(OBJECTS.personalizationLog)}
    <ol class="d360-rows d360-decisions">
      ${list
        .map(
          (d) => `
          <li class="d360-row" data-decision="${esc(d.id)}">
            <div class="d360-row__head">
              <span class="d360-action d360-action--decision">${esc(d.variant)}</span>
              <span class="d360-muted">${esc(time(d.ts))}</span>
            </div>
            <p class="d360-row__title"><code>${esc(d.zone)}</code> <span class="d360-muted">· rule <code>${esc(d.ruleId)}</code></span></p>
            <p class="d360-decision__reason">${esc(d.reason)}</p>
            ${d.shown?.length ? `<p class="d360-muted">Shown: ${d.shown.map((id) => esc(catalog.programs?.[id] ?? id)).join(', ')}</p>` : ''}
            ${d.signals?.length ? `<ul class="d360-decision__signals">${d.signals.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
            <p class="d360-row__meta"><code>${esc(d.page)}</code> <span class="d360-muted">· ${esc(d.person)}</span></p>
          </li>`,
        )
        .join('')}
    </ol>`;
}

export const TABS = [
  { id: 'profile', label: 'Profile', render: profileView },
  { id: 'engagement', label: 'Engagement', render: engagementView },
  { id: 'affinities', label: 'Affinities', render: affinitiesView },
  { id: 'identity', label: 'Identity', render: identityView },
  { id: 'decisions', label: 'Decisions', render: decisionsView },
];
