// Builds the shareable demo-guide pages, published as private claude.ai pages
// (Jesse, 2026-11-07 and 2026-11-09). The markdown stays the source;
// republish a page whenever its guide changes.
//
//   node scripts/guide-page.mjs <out.html>          presenter edition, from docs/demo-guide.md
//   node scripts/guide-page.mjs --team <out.html>   team edition, from docs/demo-guide-team.md
//
// The team edition pulls its Sofia stories and reference sections from
// docs/demo-guide.md ("<!-- include: ## Heading -->" lines) and drops the
// confidence markers. An include that names a missing heading fails the build.
import { readFileSync, writeFileSync } from 'node:fs';
import { SITE, esc, slug, inline, blocks, stripMarkers, tableRows, tableHead, storyTab, storyPanel, HEAD, CSS, TAB_SCRIPT } from './guide-md.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const args = process.argv.slice(2);
const team = args[0] === '--team';
const out = team ? args[1] : args[0];
if (!out) throw new Error('Usage: node scripts/guide-page.mjs [--team] <out.html>');

const guide = read('docs/demo-guide.md');
const body = (part) => part.split('\n').slice(1).join('\n');
const h2parts = (md) => md.split(/\n(?=## )/);

/** Stories in a markdown chunk: "## Story 1: Admissions" or "#### Story A: Anonymous visitor". */
function storiesIn(parts, level) {
  const re = new RegExp(`^${'#'.repeat(level)} Story (\\w+): (.+)$`);
  return parts
    .filter((p) => re.test(p.split('\n')[0]))
    .map((p) => {
      const [, n, title] = p.split('\n')[0].match(re);
      return { n, title, label: `Story ${n}`, hash: slug(title), anchor: slug(`Story ${n}: ${title}`), md: body(p) };
    });
}

/** Story metadata from a "pick" table (first column links the story; the rest become facts). */
function withFacts(stories, pickMd) {
  const head = tableHead(pickMd);
  const rows = tableRows(pickMd);
  stories.forEach((s, i) => {
    const r = rows[i];
    s.facts = head.slice(1).map((h, j) => [h, r[j + 1]]);
    s.time = r[r.length - 1];
  });
  return stories;
}

function page(title, mast, main) {
  return `${HEAD(title)}
<style>${CSS}</style>

<header class="mast">
  <div class="wrap">
${mast}
  </div>
</header>

<main>
  <div class="wrap">
${main}
  </div>
</main>
<footer><div class="wrap">Connected University is not a real school. The demo site is for Salesforce demo purposes only. <a href="${SITE}" target="_blank" rel="noopener">Open the live site</a>.</div></footer>
${TAB_SCRIPT}`;
}

function refSections(md, hashFor) {
  const subs = md.split(/\n(?=### )/).filter((s) => s.trim().startsWith('### '));
  const nav = subs.map((s) => {
    const h = s.split('\n')[0].slice(4);
    return `<a href="#ref-${slug(h)}">${inline(h, hashFor)}</a>`;
  });
  const html = subs
    .map((s) => {
      const h = s.split('\n')[0].slice(4);
      return `<section class="ref-section" id="ref-${slug(h)}"><h3>${inline(h, hashFor)}</h3>${blocks(body(s), hashFor)}</section>`;
    })
    .join('\n');
  return { nav: nav.join(''), html, count: subs.length };
}

// ---- Presenter edition ------------------------------------------------------
function presenter() {
  const parts = h2parts(guide);
  const intro = parts.shift();
  const section = (t) => parts.find((p) => p.startsWith(`## ${t}`));
  const stories = withFacts(storiesIn(parts, 2), section('Pick a story'));
  const hashes = Object.fromEntries(stories.map((s) => [s.anchor, s.hash]));
  const hashFor = (h) => hashes[h] ?? h;
  const title = intro.match(/^# (.+)$/m)[1];
  const introParas = intro.split('\n').filter((l) => l && !l.startsWith('#') && l !== '---');
  const pickNote = section('Pick a story').split('\n').filter((l) => l && !l.startsWith('|') && !l.startsWith('#') && l !== '---');
  const before = section('Before every demo');
  const ref = refSections(body(section('Reference')), hashFor);

  const mast = `    <span class="eyebrow">Salesforce Higher Ed · demo playbook</span>
    <h1>${esc(title)}</h1>
    ${introParas.map((p) => `<p>${inline(p, hashFor)}</p>`).join('\n    ')}`;
  const main = `    <section class="card" aria-labelledby="before-h">
      <h2 id="before-h">${inline(before.split('\n')[0].slice(3), hashFor)}</h2>
      ${blocks(body(before), hashFor)}
    </section>

    <nav class="tabs" role="tablist" aria-label="Story paths">${stories.map((s, i) => storyTab(s, i === 0, hashFor)).join('')}
    </nav>
    ${pickNote.map((p) => `<p class="tabs-note">${inline(p, hashFor)}</p>`).join('')}
    ${stories.map((s, i) => storyPanel(s, i === 0, hashFor)).join('')}

    <section class="refs" aria-labelledby="ref-h">
      <h2 id="ref-h">Reference</h2>
      <nav class="ref-nav" aria-label="Reference sections">${ref.nav}</nav>
      ${ref.html}
    </section>`;
  writeFileSync(out, page(title, mast, main));
  console.log(`Wrote ${out}: ${stories.length} stories, ${ref.count} reference sections`);
}

// ---- Team edition -----------------------------------------------------------
/** The text under a heading in docs/demo-guide.md, up to the next heading of the same or a higher level. */
function includeSection(heading) {
  const lines = guide.split('\n');
  const level = heading.match(/^#+/)[0].length;
  const start = lines.findIndex((l) => l.trim() === heading.trim());
  if (start === -1) throw new Error(`[guide] docs/demo-guide-team.md includes "${heading}", which isn't a heading in docs/demo-guide.md`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+) /);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n').trim();
}

function teamEdition() {
  let md = read('docs/demo-guide-team.md').replace(/^<!-- include: (.+?) -->$/gm, (_, h) => includeSection(h));
  md = stripMarkers(md.replace(/<!--[\s\S]*?-->/g, ''));

  const parts = h2parts(md);
  const intro = parts.shift();
  const title = intro.match(/^# (.+)$/m)[1];
  const introParas = intro.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  const section = (t) => parts.find((p) => p.startsWith(`## ${t}`));

  // Demo instructions: groups (###), each with an intro, a pick table and stories (####).
  const demo = section('Demo instructions');
  const groups = body(demo)
    .split(/\n(?=### )/)
    .filter((g) => g.trim().startsWith('### '))
    .map((g) => {
      const name = g.split('\n')[0].slice(4);
      const chunks = body(g).split(/\n(?=#### )/);
      const lead = chunks.shift();
      const stories = withFacts(storiesIn(chunks, 4), lead);
      const notes = lead.split('\n').filter((l) => l.trim() && !l.startsWith('|') && l.trim() !== '---');
      return { name, id: slug(name), stories, notes };
    });
  const all = groups.flatMap((g) => g.stories);
  const hashes = Object.fromEntries(all.map((s) => [s.anchor, s.hash]));
  const hashFor = (h) => hashes[h] ?? h;
  const first = all[0].hash;

  const cardSection = (t, extraClass = '') => {
    const p = section(t);
    const h = p.split('\n')[0].slice(3);
    return `    <section class="card ${extraClass}" id="${slug(h)}" aria-labelledby="${slug(h)}-h">
      <h2 id="${slug(h)}-h">${inline(h, hashFor)}</h2>
      ${blocks(body(p), hashFor)}
    </section>`;
  };
  const fyiPart = section('For your information');
  const fyi = refSections(body(fyiPart), hashFor);
  const jump = [
    ['live-site', 'Live site'],
    ['what-s-real-what-s-simulated', "What's real, what's simulated"],
    ['control-panel', 'Control panel'],
    ['before-every-demo', 'Before every demo'],
    ['demo-instructions', 'Demo instructions'],
    ['for-your-information', 'For your information'],
  ];

  const mast = `    <span class="eyebrow">Salesforce Higher Ed · team guide</span>
    <h1>${esc(title)}</h1>
    ${introParas.map((p) => `<p>${inline(p, hashFor)}</p>`).join('\n    ')}
    <nav class="jump" aria-label="Sections">${jump.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}</nav>`;

  const groupHtml = groups
    .map(
      (g) => `
      <section class="group" aria-labelledby="${g.id}">
        <h3 class="group__title" id="${g.id}">${esc(g.name)}</h3>
        ${g.notes.map((n) => `<p class="group__intro">${inline(n, hashFor)}</p>`).join('')}
        <nav class="tabs" role="tablist" aria-label="${esc(g.name)}">${g.stories.map((s) => storyTab(s, s.hash === first, hashFor)).join('')}
        </nav>
        ${g.stories.map((s) => storyPanel(s, s.hash === first, hashFor)).join('')}
      </section>`,
    )
    .join('');

  const main = `${cardSection('Live site', 'live')}
${cardSection("What's real, what's simulated")}
${cardSection('Control panel')}
${cardSection('Before every demo')}

    <section class="refs" id="demo-instructions" aria-labelledby="demo-h">
      <h2 id="demo-h">Demo instructions</h2>
      ${groupHtml}
    </section>

    <section class="refs" id="for-your-information" aria-labelledby="fyi-h">
      <h2 id="fyi-h">For your information</h2>
      <nav class="ref-nav" aria-label="For your information">${fyi.nav}</nav>
      ${fyi.html}
    </section>`;

  const html = page(title, mast, main).replace('</style>', `
  .group__title { font: 600 24px/1.2 var(--display); }
</style>`);
  if (/\*\((?:verified|hypothesis|uncertain)/.test(html)) throw new Error('[guide] a confidence marker survived in the team edition');
  writeFileSync(out, html);
  console.log(`Wrote ${out}: ${groups.map((g) => `${g.stories.length} ${g.name.toLowerCase()}`).join(', ')}, ${fyi.count} FYI sections`);
}

if (team) teamEdition();
else presenter();
