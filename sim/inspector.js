// Data 360 inspector drawer (PLAN.md §5.6): a slide-in panel on every public
// page, opened with the "Data 360" tab on the right edge or Ctrl+Alt+I. It
// stays open, on the same tab, as the presenter moves between pages.
// Lightning-styled, not pixel-identical (CLAUDE.md); the "Simulated" badge
// follows the /demo setting.
import { getSettings, onSettingsChange } from '../src/scripts/settings.js';
import { getConsent } from '../src/scripts/consent.js';
import { TABS, statusNote, esc } from './views.js';

const UI_KEY = 'cu_inspector';

function readUi() {
  try {
    return { open: false, tab: 'engagement', ...JSON.parse(sessionStorage.getItem(UI_KEY) || '{}') };
  } catch {
    return { open: false, tab: 'engagement' };
  }
}
function writeUi(ui) {
  try {
    sessionStorage.setItem(UI_KEY, JSON.stringify(ui));
  } catch {}
}

export function mountInspector({ store }) {
  const ui = readUi();
  if (!TABS.some((t) => t.id === ui.tab)) ui.tab = 'engagement';
  // Rows first seen in the last 2 seconds are highlighted. Rows already in the
  // profile when the page loads aren't.
  const firstSeen = new Map(store.getState().events.map((e) => [e.id, 0]));
  const HIGHLIGHT_MS = 2000;

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'd360 d360-launcher';
  launcher.setAttribute('aria-controls', 'd360-drawer');
  launcher.innerHTML = `<span>Data 360</span>`;

  const drawer = document.createElement('aside');
  drawer.id = 'd360-drawer';
  drawer.className = 'd360 d360-drawer';
  drawer.setAttribute('aria-label', 'Data 360 inspector');
  drawer.innerHTML = `
    <header class="d360-head">
      <div class="d360-title"><span class="d360-logo" aria-hidden="true"></span><strong>Data 360</strong> <span class="sim-badge">Simulated</span></div>
      <button type="button" class="d360-close" aria-label="Close inspector">×</button>
    </header>
    <div class="d360-tabs" role="tablist">
      ${TABS.map((t) => `<button type="button" role="tab" id="d360-tab-${t.id}" data-tab="${t.id}" aria-controls="d360-panel">${esc(t.label)}</button>`).join('')}
    </div>
    <div class="d360-status"></div>
    <div class="d360-panel" id="d360-panel" role="tabpanel" tabindex="0"></div>
    <footer class="d360-foot">Simulated in this browser. Nothing leaves your device. <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd></footer>`;

  document.body.append(launcher, drawer);
  const panel = drawer.querySelector('.d360-panel');
  const status = drawer.querySelector('.d360-status');

  function render() {
    const settings = getSettings();
    launcher.hidden = !settings.simulation;
    drawer.hidden = !settings.simulation || !ui.open;
    launcher.setAttribute('aria-expanded', String(!drawer.hidden));
    document.body.classList.toggle('d360-open', !drawer.hidden);
    if (drawer.hidden) return;
    const state = store.getState();
    const now = Date.now();
    for (const e of state.events) if (!firstSeen.has(e.id)) firstSeen.set(e.id, now);
    const isNew = (id) => now - (firstSeen.get(id) ?? 0) < HIGHLIGHT_MS;
    status.innerHTML = statusNote({ consent: getConsent(), simulation: settings.simulation });
    for (const btn of drawer.querySelectorAll('[data-tab]')) {
      const active = btn.dataset.tab === ui.tab;
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
    }
    panel.setAttribute('aria-labelledby', `d360-tab-${ui.tab}`);
    const tab = TABS.find((t) => t.id === ui.tab);
    panel.innerHTML = tab.render(state, { isNew });
  }

  function setOpen(open, { focus = false } = {}) {
    ui.open = open;
    writeUi(ui);
    render();
    if (open && focus) drawer.querySelector(`[data-tab="${ui.tab}"]`)?.focus();
    if (!open && focus) launcher.focus();
  }

  launcher.addEventListener('click', () => setOpen(drawer.hidden, { focus: true }));
  drawer.querySelector('.d360-close').addEventListener('click', () => setOpen(false, { focus: true }));
  drawer.querySelector('.d360-tabs').addEventListener('click', (e) => {
    const id = e.target.closest('[data-tab]')?.dataset.tab;
    if (!id) return;
    ui.tab = id;
    writeUi(ui);
    render();
  });
  drawer.querySelector('.d360-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.findIndex((t) => t.id === ui.tab);
    ui.tab = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length].id;
    writeUi(ui);
    render();
    drawer.querySelector(`[data-tab="${ui.tab}"]`)?.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey && e.code === 'KeyI') {
      e.preventDefault();
      if (getSettings().simulation) setOpen(drawer.hidden, { focus: true });
    } else if (e.key === 'Escape' && !drawer.hidden && drawer.contains(document.activeElement)) {
      setOpen(false, { focus: true });
    }
  });

  store.subscribe(render);
  onSettingsChange(render);
  window.addEventListener('cu:consent', render);
  render();
}
