// Client-side site search over /search-index.json (built by
// integrations/search-index.mjs). Small site, small index, so a simple
// scored match is enough: every query word must appear somewhere on the page
// (prefix match, so "sustain" finds "sustainability"); title hits outrank
// description hits, which outrank body hits.

const STOPWORDS = new Set(
  'a an and are at be can do for from how i in is it me my of on or the to what where who with you your'.split(' '),
);

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = (s) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);

/** Query string -> search terms (lowercased, accents folded, stopwords dropped). */
export function terms(query) {
  const all = words(query);
  const kept = all.filter((w) => !STOPWORDS.has(w));
  return [...new Set(kept.length ? kept : all)];
}

function fieldScore(fieldWords, term, exact, prefix) {
  if (fieldWords.includes(term)) return exact;
  return fieldWords.some((w) => w.startsWith(term)) ? prefix : 0;
}

/** Ranked results: [{ entry, score }], best first. */
export function search(index, query, limit = 25) {
  const qs = terms(query);
  if (!qs.length) return [];
  const phrase = fold(query.trim());
  const results = [];
  for (const entry of index) {
    const t = words(entry.title);
    const d = words(entry.description);
    const b = words(entry.text);
    let score = 0;
    let all = true;
    for (const term of qs) {
      const s =
        fieldScore(t, term, 10, 6) +
        fieldScore(d, term, 4, 2) +
        Math.min(b.filter((w) => w.startsWith(term)).length, 5);
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (qs.length > 1 && fold(entry.title).includes(phrase)) score += 8;
    results.push({ entry, score });
  }
  return results.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).slice(0, limit);
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps query-term matches in <mark>. Input is plain text; output is safe HTML. */
export function highlight(text, qs) {
  if (!qs.length) return escapeHtml(text);
  const pattern = new RegExp(`\\b(${qs.map(escapeRe).join('|')})`, 'gi');
  let out = '';
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    out += `${escapeHtml(text.slice(last, m.index))}<mark>${escapeHtml(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(last));
}

/** The description when it mentions a term, else ~180 characters of body text around the first match. */
export function snippet(entry, qs, size = 180) {
  const descWords = words(entry.description || '');
  if (descWords.some((w) => qs.some((q) => w.startsWith(q)))) return entry.description;
  const text = entry.text || '';
  let at = -1;
  for (const q of qs) {
    const m = text.search(new RegExp(`\\b${escapeRe(q)}`, 'i'));
    if (m !== -1 && (at === -1 || m < at)) at = m;
  }
  if (at === -1) return entry.description || text.slice(0, size);
  // Window around the match, trimmed to whole words.
  let start = Math.max(0, at - 60);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    start = space === -1 || space >= at ? at : space + 1;
  }
  let end = Math.min(text.length, start + size);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > at) end = space;
  }
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

let indexPromise;
/** Fetches the index once per page load. */
export function loadIndex() {
  indexPromise ??= fetch('/search-index.json').then((r) => {
    if (!r.ok) throw new Error(`search-index.json: HTTP ${r.status}`);
    return r.json();
  });
  return indexPromise;
}
