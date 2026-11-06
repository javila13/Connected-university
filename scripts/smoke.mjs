// Smoke test for a running server: `npm start` in one shell, `npm run smoke`
// in another. Set BASE_URL to test a deployed app, e.g.
//   BASE_URL=https://your-app.herokuapp.com npm run smoke
// Uses only Node's built-in fetch; no dependencies.
import facts from '../content/facts.json' with { type: 'json' };

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const failures = [];
let passed = 0;

function check(name, ok, detail = '') {
  if (ok) passed++;
  else failures.push(`${name}${detail ? ` (${detail})` : ''}`);
}

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  return { res, body: await res.text() };
}

const bodyTag = (html) => html.match(/<body[^>]*>/i)?.[0] ?? '';

// robots.txt
{
  const { res, body } = await get('/robots.txt');
  check('robots.txt is 200', res.status === 200, `got ${res.status}`);
  check('robots.txt allows crawling', /Allow: \//.test(body) && !/Disallow: \/\s*$/m.test(body));
  check('robots.txt points at the sitemap', /Sitemap: https?:\/\/\S+\/sitemap\.xml/.test(body));
}

// sitemap.xml, then every page in it
const { res: smRes, body: sitemap } = await get('/sitemap.xml');
check('sitemap.xml is 200', smRes.status === 200, `got ${smRes.status}`);
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
check('sitemap lists the home page', locs.includes('/'));
check('sitemap excludes /demo/ and /data360/', !locs.some((p) => p.startsWith('/demo') || p.startsWith('/data360')));

for (const path of locs) {
  const { res, body } = await get(path);
  const tag = bodyTag(body);
  check(`${path} is 200`, res.status === 200, `got ${res.status}`);
  check(`${path} declares data-section`, /data-section="[a-z-]+"/.test(tag));
  check(`${path} declares data-audience`, /data-audience="[a-z]+"/.test(tag));
  check(`${path} has the footer disclaimer`, body.includes(facts.legal.disclaimer));
  check(`${path} is indexable`, !/name="robots"[^>]*noindex/i.test(body));
  check(`${path} has no copyright line`, !/©|&copy;|Copyright/i.test(body));
}

// Site search index
{
  const { res, body } = await get('/search-index.json');
  check('search-index.json is 200', res.status === 200, `got ${res.status}`);
  check('search-index.json revalidates', /no-cache/.test(res.headers.get('cache-control') || ''));
  let index = [];
  try {
    index = JSON.parse(body);
  } catch {
    check('search-index.json is valid JSON', false);
  }
  const urls = index.map((e) => e.url);
  check('search index has entries', index.length > 0);
  check(
    'search index entries are complete',
    index.every((e) => e.url && e.title && e.section && e.audience && typeof e.text === 'string'),
  );
  check('search index leaves out presenter tools and /search/', !urls.some((u) => /^\/(demo|data360|search)\//.test(u)));
  check('every indexed page is in the sitemap', urls.every((u) => locs.includes(u)));
  check(
    'every sitemap page except /search/ is indexed',
    locs.filter((u) => u !== '/search/').every((u) => urls.includes(u)),
  );
}

// Presenter tools are noindex (meta + header)
for (const path of ['/demo/', '/data360/']) {
  const { res, body } = await get(path);
  check(`${path} is 200`, res.status === 200, `got ${res.status}`);
  check(`${path} has a noindex meta tag`, /name="robots"[^>]*noindex/i.test(body));
  check(`${path} sends X-Robots-Tag: noindex`, /noindex/.test(res.headers.get('x-robots-tag') || ''));
}

// 404s
{
  const { res, body } = await get('/this-page-does-not-exist/');
  check('unknown path is 404', res.status === 404, `got ${res.status}`);
  check('404 page has the footer disclaimer', body.includes(facts.legal.disclaimer));
}

// demo-config.js and fingerprinted assets
{
  const { res } = await get('/demo-config.js');
  check('demo-config.js is served', res.status === 200, `got ${res.status}`);
  check('demo-config.js revalidates', /no-cache/.test(res.headers.get('cache-control') || ''));
  const { body: home } = await get('/');
  const asset = home.match(/\/_astro\/[^"']+\.(?:css|js)/)?.[0];
  check('home page references a built asset', Boolean(asset));
  if (asset) {
    const { res: a } = await get(asset);
    check('built assets are cached immutably', /immutable/.test(a.headers.get('cache-control') || ''));
  }
}

console.log(`${passed} checks passed against ${BASE} (${locs.length} pages in the sitemap)`);
if (failures.length) {
  console.error(`${failures.length} failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
