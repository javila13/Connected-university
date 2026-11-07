// Renders personalization variants (content/variants/<zone>/<id>.md) into
// HTML for <template> elements inside each zone. Text is escaped, then
// {{facts}} tokens are filled; [[token]] placeholders are left for the
// browser to fill from the visitor's profile (sim/personalize.js).
import { getCollection } from 'astro:content';
import { fillFacts } from './fill-facts.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const BUTTONS = { gold: 'btn btn--gold', navy: 'btn btn--navy', ghost: 'btn btn--ghost' };

export async function variantTemplates(zone) {
  const all = (await getCollection('variants')).filter((v) => v.data.zone === zone);
  return all
    .map((v) => {
      const id = v.id.split('/').pop();
      const where = `content/variants/${v.id}.md`;
      const prep = (s) => fillFacts(esc(s), where, { html: true });
      const d = v.data;
      const eyebrow = d.eyebrow ? `<p class="eyebrow">${prep(d.eyebrow)}</p>` : '';
      const ctas = d.ctas
        .map((c) => `<a class="${BUTTONS[c.style]}" href="${prep(c.href)}"${c.cta ? ` data-cta="${esc(c.cta)}"` : ''}>${prep(c.label)}</a>`)
        .join('');
      let html;
      if (zone === 'pz-home-hero') {
        html = `${eyebrow}<h1>${prep(d.heading)}</h1><p>${prep(d.body)}</p><div class="hero__actions">${ctas}</div>`;
      } else if (zone === 'pz-giving-cta') {
        html = `<div>${eyebrow}<h2 id="giving-cta-heading">${prep(d.heading)}</h2><p>${prep(d.body)}</p></div><div class="giving-cta__actions">${ctas}</div>`;
      } else {
        html = `${eyebrow}<h2 id="next-credential-heading">${prep(d.heading)}</h2><p>${prep(d.body)}</p><div class="next-credential__actions">${ctas}</div>`;
      }
      return { id, html };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
