// Build-time helpers for navigation. Menus only show links to pages that
// exist, so Phase 1 grows the menus just by adding pages.
import { getCollection } from 'astro:content';
import nav from '../../content/nav.json';

const astroPages = import.meta.glob('/src/pages/**/*.astro');

export const pageUrl = (id) => `/${id}/`;
export const programUrl = (id) => `/academics/programs/${id}/`;
export const facultyUrl = (id) => `/academics/faculty/${id}/`;
export const certificateUrl = (id) => `/continuing-ed/certificates/${id}/`;
export const teamUrl = (id) => `/athletics/teams/${id}/`;
export const newsUrl = (id) => `/news/${id}/`;
export const eventUrl = (id) => `/events/${id}/`;

let cached;

/** Every static route the build will emit, with a trailing slash. */
export async function getRouteSet() {
  if (cached) return cached;
  const set = new Set();
  for (const entry of await getCollection('pages')) set.add(pageUrl(entry.id));
  for (const entry of await getCollection('programs')) set.add(programUrl(entry.id));
  for (const entry of await getCollection('faculty')) set.add(facultyUrl(entry.id));
  for (const entry of await getCollection('certificates')) set.add(certificateUrl(entry.id));
  for (const entry of await getCollection('teams')) set.add(teamUrl(entry.id));
  for (const entry of await getCollection('news')) set.add(newsUrl(entry.id));
  for (const entry of await getCollection('events')) set.add(eventUrl(entry.id));
  for (const file of Object.keys(astroPages)) {
    if (file.includes('[')) continue; // dynamic routes are covered by collections
    let route = file.slice('/src/pages'.length, -'.astro'.length).replace(/(^|\/)index$/, '$1');
    if (!route.endsWith('/')) route += '/';
    set.add(route);
  }
  cached = set;
  return set;
}

const isExternal = (href) => /^(https?:)?\/\//.test(href) || href.startsWith('#') || href.startsWith('mailto:');

/** Drops links to pages that are not built yet. */
export async function liveLinks(links = []) {
  const routes = await getRouteSet();
  return links.filter((l) => isExternal(l.href) || routes.has(l.href));
}

/** Navigation with dead links removed. */
export async function getNav() {
  const main = [];
  for (const item of nav.main) {
    main.push({ ...item, children: await liveLinks(item.children) });
  }
  const footer = [];
  for (const col of nav.footer) {
    const links = await liveLinks(col.links);
    if (links.length) footer.push({ ...col, links });
  }
  return {
    utility: await liveLinks(nav.utility),
    main: await liveLinks(main),
    footer,
    legal: await liveLinks(nav.legal),
  };
}

/** Child links for a section hub, e.g. `/alumni/` -> Alumni menu items. */
export async function hubChildren(route) {
  const item = nav.main.find((m) => m.href === route);
  if (!item) return [];
  return liveLinks(item.children.filter((c) => c.href !== route));
}

/** First href in the list that is built; the last entry is the fallback. */
export async function pickLive(...hrefs) {
  const routes = await getRouteSet();
  return hrefs.find((h) => routes.has(h)) ?? hrefs[hrefs.length - 1];
}

let titles;
/** Route -> page title, for breadcrumbs. */
async function getTitles() {
  if (titles) return titles;
  titles = new Map([['/', 'Home']]);
  for (const e of await getCollection('pages')) titles.set(pageUrl(e.id), e.data.title);
  for (const e of await getCollection('programs')) titles.set(programUrl(e.id), e.data.title);
  for (const e of await getCollection('faculty')) titles.set(facultyUrl(e.id), e.data.name);
  for (const e of await getCollection('certificates')) titles.set(certificateUrl(e.id), e.data.title);
  for (const e of await getCollection('teams')) titles.set(teamUrl(e.id), e.data.name);
  for (const e of await getCollection('news')) titles.set(newsUrl(e.id), e.data.title);
  for (const e of await getCollection('events')) titles.set(eventUrl(e.id), e.data.title);
  return titles;
}

/** Ancestor links for a route, e.g. `/academics/programs/nursing/` -> Home, Academics, Degree Programs. Empty for top-level pages. */
export async function getCrumbs(route) {
  const parts = route.split('/').filter(Boolean);
  if (parts.length < 2) return [];
  const known = await getTitles();
  const crumbs = [{ label: 'Home', href: '/' }];
  for (let i = 1; i < parts.length; i++) {
    const href = `/${parts.slice(0, i).join('/')}/`;
    if (known.has(href)) crumbs.push({ label: known.get(href), href });
  }
  return crumbs;
}
