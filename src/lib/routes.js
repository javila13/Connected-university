// Build-time helpers for navigation. Menus only show links to pages that
// exist, so Phase 1 grows the menus just by adding pages.
import { getCollection } from 'astro:content';
import nav from '../../content/nav.json';

const astroPages = import.meta.glob('/src/pages/**/*.astro');

let cached;

/** Every static route the build will emit, with a trailing slash. */
export async function getRouteSet() {
  if (cached) return cached;
  const set = new Set();
  for (const entry of await getCollection('pages')) set.add(`/${entry.id}/`);
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
