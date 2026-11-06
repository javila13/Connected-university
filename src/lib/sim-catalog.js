// Labels the simulation shows for affinity categories: program titles for
// academic interest, and certificate and team names for topics. Written into
// every page as JSON at build time, so the browser needs no lookup.
import { getCollection } from 'astro:content';

let cached;

export async function getSimCatalog() {
  if (cached) return cached;
  const programs = Object.fromEntries((await getCollection('programs')).map((p) => [p.id, p.data.title]));
  const topics = {
    ...Object.fromEntries((await getCollection('certificates')).map((c) => [c.id, `${c.data.shortTitle} certificate`])),
    ...Object.fromEntries((await getCollection('teams')).map((t) => [t.id, t.data.name])),
  };
  cached = { programs, topics };
  return cached;
}
