// Cookie consent (PLAN.md §6). Sets a first-party `cu_consent` cookie:
//   all        -> chat widgets and the simulation may run
//   necessary  -> neither runs
// Embeds and the simulation call onConsentGranted() and wait for it.
import { CHANNEL_NAME } from './settings.js';

const COOKIE = 'cu_consent';
const MAX_AGE_DAYS = 180;
export const CONSENT_VALUES = ['all', 'necessary'];

export function getConsent() {
  const match = document.cookie.match(/(?:^|;\s*)cu_consent=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return CONSENT_VALUES.includes(value) ? value : null;
}

export const isGranted = () => getConsent() === 'all';

export function setConsent(value) {
  if (!CONSENT_VALUES.includes(value)) throw new Error(`Unknown consent value: ${value}`);
  const previous = getConsent();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${value}; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent('cu:consent', { detail: { value, previous } }));
  if ('BroadcastChannel' in window) {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: 'consent-changed', value });
    ch.close();
  }
}

export function clearConsent() {
  document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent('cu:consent', { detail: { value: null } }));
}

/** Runs `fn` once consent is `all` (now, or whenever the visitor accepts). */
export function onConsentGranted(fn) {
  if (isGranted()) {
    fn();
    return;
  }
  const handler = (e) => {
    if (e.detail?.value === 'all') {
      window.removeEventListener('cu:consent', handler);
      fn();
    }
  };
  window.addEventListener('cu:consent', handler);
}
