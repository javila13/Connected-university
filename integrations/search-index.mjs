// Writes dist/search-index.json after every build: one entry per indexable
// page, taken from the rendered HTML so .astro and Markdown pages are treated
// the same. Site search reads it today; the Phase 2 Agentforce mock can reuse
// it for content grounding (PLAN.md §5.8).
//
// Skipped: /_astro, 404.html, any page with a `noindex` meta tag (/demo,
// /data360), and the search page itself (section "search").
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP_SECTIONS = new Set(['search', 'system']);
const MAX_TEXT = 6000; // characters of body text kept per page

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];

function toText(html) {
  return decode(
    html
      .replace(/<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parses one built page. Returns null when the page should not be indexed. */
export function extractEntry(html, url) {
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) return null;
  const bodyTag = html.match(/<body\b[^>]*>/i)?.[0] ?? '';
  const section = attr(bodyTag, 'data-section');
  const audience = attr(bodyTag, 'data-audience');
  if (!section || SKIP_SECTIONS.has(section)) return null;

  const rawTitle = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const title = rawTitle.replace(/\s*\|\s*Connected University$/, '').replace(/^Connected University \| Home$/, 'Home');
  const description = decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';

  const entry = { url, title, description, section, audience, text: toText(main).slice(0, MAX_TEXT) };
  const program = attr(bodyTag, 'data-program');
  const topic = attr(bodyTag, 'data-topic');
  if (program) entry.program = program;
  if (topic) entry.topic = topic;
  return entry;
}

async function walk(dir, root, out) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_astro') await walk(full, root, out);
    } else if (entry.name === 'index.html') {
      const rel = path.relative(root, dir).split(path.sep).join('/');
      const parsed = extractEntry(await readFile(full, 'utf8'), rel ? `/${rel}/` : '/');
      if (parsed) out.push(parsed);
    }
  }
  return out;
}

export default function searchIndex() {
  return {
    name: 'cu-search-index',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const entries = (await walk(root, root, [])).sort((a, b) => a.url.localeCompare(b.url));
        await writeFile(path.join(root, 'search-index.json'), JSON.stringify(entries));
        logger.info(`search-index.json: ${entries.length} pages`);
      },
    },
  };
}
