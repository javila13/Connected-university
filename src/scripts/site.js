// Runs on every public page (BaseLayout). Wires up consent, demo settings,
// the Agentforce mock slot, the mobile menu and the /demo keyboard shortcut.
import { captureUrlOverrides, getSettings, onSettingsChange, CHANNEL_NAME } from './settings.js';
import { getConsent, setConsent, onConsentGranted } from './consent.js';
import { applyWidgets } from './widgets.js';

captureUrlOverrides();

const body = document.body;
const audience = body.dataset.audience;

// --- Settings reflected on <body> (the simulation and CSS read these) ---
function reflectSettings(settings) {
  body.dataset.sim = settings.simulation ? 'on' : 'off';
  body.dataset.simBadge = settings.simulatedBadge ? 'on' : 'off';
}

// --- Consent banner ---------------------------------------------------------
const banner = document.getElementById('cu-consent');

function showBanner(show) {
  if (!banner) return;
  banner.hidden = !show;
  if (show) banner.querySelector('[data-consent="all"]')?.focus({ preventScroll: true });
}

banner?.addEventListener('click', (e) => {
  const choice = e.target.closest('[data-consent]')?.dataset.consent;
  if (!choice) return;
  setConsent(choice);
  showBanner(false);
});

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-consent-open]')) {
    e.preventDefault();
    showBanner(true);
  }
});

// Withdrawing consent after widgets have loaded needs a reload to unload them.
window.addEventListener('cu:consent', (e) => {
  if (e.detail?.previous === 'all' && e.detail?.value !== 'all') location.reload();
});

// Another tab answered the banner.
if ('BroadcastChannel' in window) {
  new BroadcastChannel(CHANNEL_NAME).addEventListener('message', (e) => {
    if (e.data?.type !== 'consent-changed') return;
    if (e.data.value !== 'all' && document.querySelector('.cu-widget')) {
      location.reload();
      return;
    }
    showBanner(false);
    window.dispatchEvent(new CustomEvent('cu:consent', { detail: { value: e.data.value } }));
  });
}

// --- Widgets ----------------------------------------------------------------
function mountWidgets() {
  applyWidgets(audience, getSettings());
}

function boot() {
  const settings = getSettings();
  reflectSettings(settings);
  if (!getConsent()) {
    if (settings.consentAutoAccept) setConsent('all');
    else showBanner(true);
  }
  onConsentGranted(mountWidgets);
}

onSettingsChange(() => {
  const settings = getSettings();
  reflectSettings(settings);
  if (!getConsent() && settings.consentAutoAccept) {
    setConsent('all');
    showBanner(false);
  } else if (getConsent() === 'all') {
    mountWidgets();
  }
});

boot();

// --- Mobile menu ------------------------------------------------------------
const menuButton = document.querySelector('[data-menu-toggle]');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  document.querySelector('.site-header')?.classList.toggle('is-open', open);
});

// --- Header search panel ----------------------------------------------------
const searchButton = document.querySelector('[data-search-toggle]');
const searchPanel = document.getElementById('site-search');

function setSearchOpen(open, { restoreFocus = false } = {}) {
  if (!searchButton || !searchPanel) return;
  searchPanel.hidden = !open;
  searchButton.setAttribute('aria-expanded', String(open));
  if (open) searchPanel.querySelector('input')?.focus();
  else if (restoreFocus) searchButton.focus();
}

searchButton?.addEventListener('click', () => setSearchOpen(searchPanel.hidden));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchPanel && !searchPanel.hidden) setSearchOpen(false, { restoreFocus: true });
});
document.addEventListener('click', (e) => {
  if (searchPanel && !searchPanel.hidden && !e.target.closest('#site-search, [data-search-toggle]')) setSearchOpen(false);
});

// --- Professor Login is inert (PLAN.md §4: mirror only) -----------------------
document.querySelectorAll('[data-inert-link]').forEach((a) =>
  a.addEventListener('click', (e) => e.preventDefault()),
);

// --- Ctrl+Alt+D opens the demo control panel (PLAN.md §7) --------------------
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey && e.code === 'KeyD') {
    e.preventDefault();
    location.href = '/demo/';
  }
});
