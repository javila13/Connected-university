// Inspector tab views (PLAN.md §5.6). Plain functions from state to HTML, so
// the drawer and the /data360 companion window render the same thing.
// Every value is escaped.
import { OBJECTS } from './config.js';
import { rankAffinities, TYPE_LABELS } from './affinity.js';
import { stageRows, stageLabel, stageInfo, person } from './profile.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : '–');
const objectTag = (name) => `<p class="d360-object">Object: <code>${esc(name)}</code></p>`;

const ACTION_LABELS = {
  PAGE_VIEW: 'Page view',
  CLICK: 'Click',
  FORM_START: 'Form start',
  FORM_SUBMIT: 'Form submit',
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
    <p class="d360-muted">Known since ${esc(time(id.stitchedAt))}, via ${esc(id.via)}. Device <code>${esc(state.deviceId)}</code> and its ${state.events.length} engagement ${state.events.length === 1 ? 'row' : 'rows'} belong to this Unified Individual.</p>`;
}

export function profileView(state, ctx = {}) {
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
    <p class="d360-muted">Coming in the identity-stitch release: submitting any form with an email, or signing in to the Student Portal, stitches this device to a known person. Until then, use <b>Become Sofia</b> or a persona preset in /demo.</p>`;
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
      ['CRM contact', id.known ? `${person.firstName} ${person.lastName}` : 'None'],
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

export const TABS = [
  { id: 'profile', label: 'Profile', render: profileView },
  { id: 'engagement', label: 'Engagement', render: engagementView },
  { id: 'affinities', label: 'Affinities', render: affinitiesView },
  { id: 'identity', label: 'Identity', render: identityView },
];
