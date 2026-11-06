// Production server (PLAN.md D1, D3, D7). Serves the static Astro build from
// dist/ and generates robots.txt and sitemap.xml at request time, so the
// sitemap uses whatever domain the site is reached on. The final custom
// domain is still TBD (PLAN.md D9); set SITE_URL to pin it.
import express from 'express';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');

// Presenter tools: noindex (PLAN.md §4, §7). Everything else is crawlable.
const NOINDEX_PREFIXES = ['/demo', '/data360'];

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

/** Walks dist/ and returns the indexable page routes, e.g. ['/', '/about/']. */
async function collectRoutes(dir = DIST) {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_astro') routes.push(...(await collectRoutes(full)));
      continue;
    }
    if (entry.name !== 'index.html') continue; // skips 404.html and non-page files
    const html = await readFile(full, 'utf8');
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) continue;
    const rel = path.relative(DIST, path.dirname(full)).split(path.sep).join('/');
    routes.push(rel ? `/${rel}/` : '/');
  }
  return routes.sort();
}

const routes = await collectRoutes();
const origin = (req) => SITE_URL || `${req.protocol}://${req.get('host')}`;
const xmlEscape = (s) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Heroku's router terminates TLS; trust its X-Forwarded-Proto.

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${origin(req)}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const base = origin(req);
  const urls = routes.map((r) => `  <url><loc>${xmlEscape(base + r)}</loc></url>`).join('\n');
  res
    .type('application/xml')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

app.use((req, res, next) => {
  if (NOINDEX_PREFIXES.some((p) => req.path === p || req.path.startsWith(`${p}/`))) {
    res.set('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

// Fingerprinted build assets never change, so browsers can cache them for a year.
app.use('/_astro', express.static(path.join(DIST, '_astro'), { immutable: true, maxAge: '1y' }));

app.use(
  express.static(DIST, {
    extensions: ['html'],
    setHeaders(res, file) {
      // Pages and the demo config must always revalidate so deploys and config edits show up.
      if (file.endsWith('.html') || file.endsWith('demo-config.js')) res.set('Cache-Control', 'no-cache');
    },
  }),
);

app.use((req, res) => {
  res.status(404).sendFile(path.join(DIST, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Connected University listening on port ${PORT} (${routes.length} indexable pages)`);
});
