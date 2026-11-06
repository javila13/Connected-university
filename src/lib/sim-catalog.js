// Labels the simulation shows: program titles for academic interest,
// certificate and team names for topics, and faculty names and certificate
// titles for Sofia's profile. Written into every page (and /demo, /data360)
// as JSON at build time, so the browser needs no lookup.
import { getCollection } from 'astro:content';

let cached;

export async function getSimCatalog() {
  if (cached) return cached;
  const programs = Object.fromEntries((await getCollection('programs')).map((p) => [p.id, p.data.title]));
  const topics = {
    ...Object.fromEntries((await getCollection('certificates')).map((c) => [c.id, `${c.data.shortTitle} certificate`])),
    ...Object.fromEntries((await getCollection('teams')).map((t) => [t.id, t.data.name])),
  };
  const faculty = Object.fromEntries((await getCollection('faculty')).map((f) => [f.id, f.data.name]));
  const certificates = Object.fromEntries((await getCollection('certificates')).map((c) => [c.id, c.data.title]));
  cached = { programs, topics, faculty, certificates };
  return cached;
}
