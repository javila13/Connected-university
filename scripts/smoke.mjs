// Smoke test for a running server: `npm start` in one shell, `npm run smoke`
// in another. Set BASE_URL to test a deployed app, e.g.
//   BASE_URL=https://your-app.herokuapp.com npm run smoke
// Uses only Node's built-in fetch; no dependencies.
import facts from '../content/facts.json' with { type: 'json' };
import sofia from '../content/sofia.json' with { type: 'json' };

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

const internalLinks = new Map(); // href -> first page that links to it
for (const path of locs) {
  const { res, body } = await get(path);
  const tag = bodyTag(body);
  check(`${path} is 200`, res.status === 200, `got ${res.status}`);
  check(`${path} declares data-section`, /data-section="[a-z-]+"/.test(tag));
  check(`${path} declares data-audience`, /data-audience="[a-z]+"/.test(tag));
  check(`${path} has the footer disclaimer`, body.includes(facts.legal.disclaimer));
  check(`${path} is indexable`, !/name="robots"[^>]*noindex/i.test(body));
  check(`${path} has no copyright line`, !/©|&copy;|Copyright/i.test(body));
  check(`${path} has no unfilled {{facts}} tokens`, !body.includes('{{'));
  const program = path.match(/^\/academics\/programs\/([a-z0-9-]+)\/$/)?.[1];
  if (program) check(`${path} declares data-program="${program}"`, tag.includes(`data-program="${program}"`));
  for (const [, json] of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ok = true;
    try {
      JSON.parse(json);
    } catch {
      ok = false;
    }
    check(`${path} structured data is valid JSON`, ok);
  }
  // Personalization zones use only the PLAN.md §5.4 ids and render a default variant.
  for (const [zone] of body.matchAll(/<[a-z]+\b[^>]*data-pz-zone="[^"]*"[^>]*>/g)) {
    const name = zone.match(/data-pz-zone="([^"]*)"/)[1];
    check(`${path} zone ${name} is a §5.4 zone`, ['pz-home-hero', 'pz-recommended-programs', 'pz-giving-cta', 'pz-next-credential'].includes(name));
    check(`${path} zone ${name} has id="${name}" and a variant`, zone.includes(`id="${name}"`) && /data-pz-variant="[a-z0-9-]+"/.test(zone));
  }
  // No form posts off-site. Demo forms (data-cu-form) have no action at all and tell the visitor so.
  for (const [form] of body.matchAll(/<form\b[^>]*>/g)) {
    check(`${path} form doesn't post off-site`, !/\saction="(https?:)?\/\//i.test(form), form);
    if (!/data-cu-form="/.test(form)) continue;
    check(`${path} demo form has no action`, !/\saction=/.test(form), form);
    check(`${path} demo form carries the demo note`, body.includes('Nothing you enter leaves your browser'));
  }
  for (const [, href] of body.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)) {
    if (!internalLinks.has(href)) internalLinks.set(href, path);
  }
}

// Every internal link on every page resolves (catches copy that links to a page that isn't built yet).
for (const [href, from] of internalLinks) {
  const { res } = await get(href);
  check(`link ${href} (from ${from}) resolves`, res.status === 200, `got ${res.status}`);
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

// Sofia's record stays out of the portal's HTML; the dashboard is built in the browser.
{
  const { body } = await get('/portal/');
  const s = sofia.stages.student;
  check('/portal/ HTML has no student record', ![sofia.person.email, s.cumulativeGpa.toFixed(2), s.earlyAlert.timeline[0].detail].some((v) => body.includes(v)));
  check('/portal/ has the demo sign-in', body.includes('data-portal-demo') && body.includes('id="portal-catalog"'));
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

// No Piper from the site (it comes from a Chrome extension), and fingerprinted assets
{
  const { body: home } = await get('/');
  check('home page loads no Qualified script', !/qualified\.com|demo-config\.js/i.test(home));
  const asset = home.match(/\/_astro\/[^"']+\.(?:css|js)/)?.[0];
  check('home page references a built asset', Boolean(asset));
  if (asset) {
    const { res: a } = await get(asset);
    check('built assets are cached immutably', /immutable/.test(a.headers.get('cache-control') || ''));
  }
  // Hero photos: the list the personalization engine swaps from (src/lib/hero-images.js).
  const raw = home.match(/data-pz-images="([^"]*)"/)?.[1];
  let photos = null;
  try {
    photos = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  } catch {}
  check('home hero lists its photos', photos && typeof photos === 'object');
  for (const [key, url] of Object.entries(photos ?? {})) {
    const { res: img } = await get(url);
    check(`hero photo ${key} is served`, img.status === 200 && /^image\//.test(img.headers.get('content-type') || ''), `${url}: ${img.status}`);
  }
}

console.log(`${passed} checks passed against ${BASE} (${locs.length} pages in the sitemap, ${internalLinks.size} internal links)`);
if (failures.length) {
  console.error(`${failures.length} failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
