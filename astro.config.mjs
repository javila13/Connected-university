import { defineConfig } from 'astro/config';
import searchIndex from './integrations/search-index.mjs';

// Static output only (PLAN.md D3). Express serves dist/ on Heroku (server.js).
// SITE_URL is optional; the final domain is still TBD (PLAN.md D9) and nothing
// in Phase 0 needs it at build time.
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [searchIndex()],
});
