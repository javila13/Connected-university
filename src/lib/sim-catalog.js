// Labels the simulation shows: program titles for academic interest,
// certificate and team names for topics, and faculty names and certificate
// titles for Sofia's profile. Written into every page (and /demo, /data360)
// as JSON at build time, so the browser needs no lookup.
import { getCollection } from 'astro:content';
import { programUrl, certificateUrl } from './routes.js';
import { fillFacts } from './fill-facts.js';

let cached;

export async function getSimCatalog() {
  if (cached) return cached;
  const programs = Object.fromEntries((await getCollection('programs')).map((p) => [p.id, p.data.title]));
  const topics = {
    ...Object.fromEntries((await getCollection('certificates')).map((c) => [c.id, `${c.data.shortTitle} certificate`])),
    ...Object.fromEntries((await getCollection('teams')).map((t) => [t.id, t.data.name])),
  };
  const faculty = Object.fromEntries((await getCollection('faculty')).map((f) => [f.id, f.data.name]));
  const certs = await getCollection('certificates');
  const certificates = Object.fromEntries(certs.map((c) => [c.id, c.data.title]));
  // For personalization variants that feature a program or certificate.
  const programInfo = Object.fromEntries(
    (await getCollection('programs')).map((p) => [
      p.id,
      { title: p.data.title, description: fillFacts(p.data.description, p.id), url: programUrl(p.id) },
    ]),
  );
  const certificateInfo = Object.fromEntries(
    certs.map((c) => [c.id, { title: c.data.title, description: c.data.description, url: certificateUrl(c.id) }]),
  );
  cached = { programs, topics, faculty, certificates, programInfo, certificateInfo };
  return cached;
}
