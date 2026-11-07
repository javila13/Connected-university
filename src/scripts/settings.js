// Demo settings for the /demo control panel (PLAN.md §7).
//
// Precedence, lowest to highest:
//   DEFAULTS  <  saved settings (localStorage)  <  URL overrides (this tab only)
//
// URL params are copied into sessionStorage on first sight, so a presenter can
// open a link like /?agentforce=1 and keep that override while clicking around in
// the same tab, without permanently changing the saved settings.
import { AGENT_PERSONAS } from '../lib/taxonomy.js';

const STORAGE_KEY = 'cu_demo_settings';
const OVERRIDE_KEY = 'cu_demo_overrides';
export const CHANNEL_NAME = 'cu-demo';

/** How a demo form's email resolves: always to Sofia, or to whoever was typed. */
export const IDENTITY_MATCHING = ['sofia', 'typed'];

export const DEFAULTS = Object.freeze({
  simulation: true,
  // The Agentforce mock chat, bottom-right on every page. Off by default
  // (Jesse, 2026-11-07); Piper comes from a Chrome extension, not the site.
  agentforce: false,
  agentPersona: 'auto',
  consentAutoAccept: false,
  simulatedBadge: true,
  identityMatching: 'sofia',
  // "Why am I seeing this?" buttons on personalized zones.
  showWhy: true,
  // "Grounded in Data 360" notes under the Agentforce mock's answers.
  showGrounding: true,
});

const bool = (v) => (v === '1' || v === 'true' || v === 'on' ? true : v === '0' || v === 'false' || v === 'off' ? false : undefined);

/** URL param -> setting. Unknown or invalid values are ignored. */
const PARAMS = {
  sim: (v) => ({ simulation: bool(v) }),
  agentforce: (v) => ({ agentforce: bool(v) }),
  agent: (v) => ({ agentPersona: v === 'auto' || v in AGENT_PERSONAS ? v : undefined }),
  badge: (v) => ({ simulatedBadge: bool(v) }),
  autoconsent: (v) => ({ consentAutoAccept: bool(v) }),
  match: (v) => ({ identityMatching: IDENTITY_MATCHING.includes(v) ? v : undefined }),
  why: (v) => ({ showWhy: bool(v) }),
  grounding: (v) => ({ showGrounding: bool(v) }),
};
export const URL_PARAMS = Object.keys(PARAMS);

/** Keeps only known keys with valid values. */
export function sanitize(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of ['simulation', 'agentforce', 'consentAutoAccept', 'simulatedBadge', 'showWhy', 'showGrounding']) {
    if (typeof input[key] === 'boolean') out[key] = input[key];
  }
  if (IDENTITY_MATCHING.includes(input.identityMatching)) out.identityMatching = input.identityMatching;
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
