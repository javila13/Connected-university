// The simulated profile: one state object in localStorage, synced across tabs
// with BroadcastChannel (PLAN.md D11) and the `storage` event (which also
// catches /demo "Reset visitor" removing the key). Nothing leaves the browser.
//
// State shape:
//   { version, deviceId, firstSeen,
//     events:     [{ id, ts, action, url, title, section, audience, program?, topic?, detail?, engaged?, points }],
//     affinities: { [key]: { type, value, label, score, updated } } }
import { STATE_KEY, CHANNEL, MAX_EVENTS } from './config.js';

const VERSION = 1;
const randomId = (prefix) => prefix + Math.random().toString(36).slice(2, 10).padEnd(8, '0');

function fresh() {
  return { version: VERSION, deviceId: randomId('dev_'), firstSeen: null, events: [], affinities: {} };
}

function read() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY));
    if (s && s.version === VERSION && Array.isArray(s.events)) return s;
  } catch {
    /* corrupt or unavailable: start fresh */
  }
  return null;
}

function write(s) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    /* private mode or full: the profile lives for this page only */
  }
}

let state = null;
const listeners = new Set();
let channel = null;

function notify() {
  for (const fn of listeners) fn(state);
}

function reload() {
  state = read() ?? fresh();
  notify();
}

/** The current profile. Not saved until the first recorded event, so nothing is stored before consent. */
export function getState() {
  if (!state) state = read() ?? fresh();
  return state;
}

/** Applies a change, saves it and tells this tab and every other tab. */
export function update(mutate) {
  const s = getState();
  s.firstSeen ??= new Date().toISOString();
  mutate(s);
  if (s.events.length > MAX_EVENTS) s.events.splice(0, s.events.length - MAX_EVENTS);
  write(s);
  notify();
  channel?.postMessage({ type: 'state-changed' });
}

/** Forgets the visitor: a new anonymous device, no events, no affinities. */
export function reset() {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch {}
  state = fresh();
  notify();
  channel?.postMessage({ type: 'state-changed' });
}

/** Calls `fn(state)` after every change, in this tab or another one. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Starts listening for changes made in other tabs. Call once per page. */
export function startSync() {
  if (!channel && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL);
    channel.addEventListener('message', (e) => {
      if (e.data?.type === 'state-changed') reload();
    });
  }
  window.addEventListener('storage', (e) => {
    if (e.key === STATE_KEY || e.key === null) reload();
  });
}

export const newEventId = () => randomId('evt_');
