// Simulation entry point, loaded on every public page by BaseLayout after
// src/scripts/site.js. Presenter tools (/demo, /data360) don't load it.
import { onConsentGranted } from '../src/scripts/consent.js';
import * as store from './store.js';
import { startTracking } from './tracker.js';
import { mountInspector } from './inspector.js';

// Labels for programs, certificates and teams, written into the page at build time.
let catalog = {};
try {
  catalog = JSON.parse(document.getElementById('cu-sim-catalog')?.textContent || '{}');
} catch {}

store.startSync();
mountInspector({ store, catalog });
onConsentGranted(() => startTracking({ catalog }));
