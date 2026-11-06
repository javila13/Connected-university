// Demo settings for the /demo control panel (PLAN.md §7).
//
// Precedence, lowest to highest:
//   DEFAULTS  <  saved settings (localStorage)  <  URL overrides (this tab only)
//
// URL params are copied into sessionStorage on first sight, so a presenter can
// open a link like /?piper=0 and keep that override while clicking around in
// the same tab, without permanently changing the saved settings.
import { AGENT_PERSONAS } from '../lib/taxonomy.js';

const STORAGE_KEY = 'cu_demo_settings';
const OVERRIDE_KEY = 'cu_demo_overrides';
export const CHANNEL_NAME = 'cu-demo';

export const WIDGET_MODES = ['auto', 'piper', 'agentforce', 'both'];

export const DEFAULTS = Object.freeze({
  simulation: true,
  widgetMode: 'auto',
  agentPersona: 'auto',
  consentAutoAccept: false,
  simulatedBadge: true,
  // Per-widget kill switches/forcers from URL params; null = follow widgetMode.
  forcePiper: null,
  forceAgentforce: null,
});

const bool = (v) => (v === '1' || v === 'true' || v === 'on' ? true : v === '0' || v === 'false' || v === 'off' ? false : undefined);

/** URL param -> setting. Unknown or invalid values are ignored. */
const PARAMS = {
  sim: (v) => ({ simulation: bool(v) }),
  mode: (v) => ({ widgetMode: WIDGET_MODES.includes(v) ? v : undefined }),
  piper: (v) => ({ forcePiper: bool(v) }),
  agentforce: (v) => ({ forceAgentforce: bool(v) }),
  agent: (v) => ({ agentPersona: v === 'auto' || v in AGENT_PERSONAS ? v : undefined }),
  badge: (v) => ({ simulatedBadge: bool(v) }),
  autoconsent: (v) => ({ consentAutoAccept: bool(v) }),
};
export const URL_PARAMS = Object.keys(PARAMS);

/** Keeps only known keys with valid values. */
export function sanitize(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of ['simulation', 'consentAutoAccept', 'simulatedBadge']) {
    if (typeof input[key] === 'boolean') out[key] = input[key];
  }
  for (const key of ['forcePiper', 'forceAgentforce']) {
    if (typeof input[key] === 'boolean' || input[key] === null) out[key] = input[key];
  }
  if (WIDGET_MODES.includes(input.widgetMode)) out.widgetMode = input.widgetMode;
  if (input.agentPersona === 'auto' || input.agentPersona in AGENT_PERSONAS) out.agentPersona = input.agentPersona;
  return out;
}

function readJSON(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable (private mode); settings then fall back to defaults */
  }
}

/** Parses demo params from a query string. */
export function parseParams(search) {
  const params = new URLSearchParams(search);
  const out = {};
  for (const [name, map] of Object.entries(PARAMS)) {
    if (!params.has(name)) continue;
    for (const [k, v] of Object.entries(map(params.get(name)))) if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Copies demo params from the current URL into this tab's overrides. */
export function captureUrlOverrides() {
  const fromUrl = parseParams(location.search);
  if (!Object.keys(fromUrl).length) return;
  writeJSON(sessionStorage, OVERRIDE_KEY, { ...readJSON(sessionStorage, OVERRIDE_KEY), ...fromUrl });
}

export const getSaved = () => sanitize(readJSON(localStorage, STORAGE_KEY));
export const getOverrides = () => sanitize(readJSON(sessionStorage, OVERRIDE_KEY));

/** Effective settings for this tab. */
export function getSettings() {
  return { ...DEFAULTS, ...getSaved(), ...getOverrides() };
}

let channel;
function getChannel() {
  if (!channel && 'BroadcastChannel' in window) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

function announce() {
  getChannel()?.postMessage({ type: 'settings-changed' });
  window.dispatchEvent(new CustomEvent('cu:settings'));
}

/** Saves a partial change to the persisted settings and notifies other tabs. */
export function saveSettings(patch) {
  writeJSON(localStorage, STORAGE_KEY, sanitize({ ...getSaved(), ...patch }));
  announce();
}

export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  announce();
}

export function clearOverrides() {
  try {
    sessionStorage.removeItem(OVERRIDE_KEY);
  } catch {}
  announce();
}

/** Calls `fn` whenever settings change in this tab or another one. */
export function onSettingsChange(fn) {
  window.addEventListener('cu:settings', fn);
  getChannel()?.addEventListener('message', (e) => {
    if (e.data?.type === 'settings-changed') fn();
  });
}
