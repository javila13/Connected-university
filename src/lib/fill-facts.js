// Copy quotes institutional facts with {{facts.path}} tokens, e.g.
// "{{facts.programs.undergraduate}} majors", so numbers live only in
// content/facts.json (CLAUDE.md). Tokens are filled when a page renders, so a
// change to facts.json shows up on the next build with no cache to clear.
// An unknown path or a malformed token fails the build. Numbers print with
// thousands separators (47850 -> 47,850); keep years as strings. Add |raw for
// a bare number, e.g. in a link: ?amount={{facts.giving.connectedCircle.member|raw}}.
import facts from '../../content/facts.json';

const TOKEN = /\{\{\s*facts\.([\w.]+?)(\|raw)?\s*\}\}/g;
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * @param {string | undefined} text
 * @param {string} where  shown in the build error, e.g. the page id
 * @param {{ html?: boolean }} [opts]  html: escape values for an HTML string
 */
export function fillFacts(text, where, { html = false } = {}) {
  if (typeof text !== 'string' || !text.includes('{{')) return text;
  const out = text.replace(TOKEN, (token, path, raw) => {
    const value = path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), facts);
    if (value == null || typeof value === 'object') {
      throw new Error(`[facts] ${where}: ${token} is not in content/facts.json. Add it there first.`);
    }
    const text = typeof value === 'number' && !raw ? value.toLocaleString('en-US') : String(value);
    return html ? escapeHtml(text) : text;
  });
  const stray = out.match(/\{\{[^}]*\}\}/);
  if (stray) throw new Error(`[facts] ${where}: malformed token ${stray[0]}. Use {{facts.path.to.value}}.`);
  return out;
}
