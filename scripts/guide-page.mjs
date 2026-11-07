// Builds the shareable demo-guide page from docs/demo-guide.md, which stays
// the source. The page is published as a private claude.ai page (Jesse,
// 2026-11-07); republish it whenever the guide changes.
//
// Usage: node scripts/guide-page.mjs <out.html>
//
// The converter handles the markdown the guide uses: headings, paragraphs,
// ordered and unordered lists, pipe tables, rules, **bold**, *italic*,
// `code` and [links](url). Stories become tabs; everything else is shown.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://connected-university-website-64975a496d17.herokuapp.com';
const src = readFileSync(new URL('../docs/demo-guide.md', import.meta.url), 'utf8');
const out = process.argv[2];
if (!out) throw new Error('Usage: node scripts/guide-page.mjs <out.html>');

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Inline markdown -> HTML. Code spans are protected first. */
function inline(md) {
  const codes = [];
  let s = md.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
    const href = u.startsWith('#') ? `#${STORY_HASH[u.slice(1)] ?? u.slice(1)}` : u;
    const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${ext}>${t}</a>`;
  });
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*\(([^)]*)\)\*/g, '<span class="mark">($1)</span>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** Block markdown -> HTML. Step tables (first column "#") get data labels for the phone layout. */
function blocks(md) {
  const lines = md.split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim() === '---') {
      i++;
    } else if (line.startsWith('### ')) {
      html.push(`<h3 id="${slug(line.slice(4))}">${inline(line.slice(4))}</h3>`);
      i++;
    } else if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]));
      const [head, , ...body] = rows;
      const steps = head[0] === '#';
      html.push(
        `<div class="table-wrap"><table class="${steps ? 'steps' : 'ref'}"><thead><tr>${head.map((h) => `<th scope="col">${inline(h)}</th>`).join('')}</tr></thead><tbody>` +
          body
            .map(
              (r) =>
                `<tr>${r
                  .map((c, j) => {
                    const cls = steps ? ` class="c-${slug(head[j]) || 'n'}"` : '';
                    return j === 0 && steps
                      ? `<th scope="row"${cls}>${inline(c)}</th>`
                      : `<td${cls} data-label="${esc(head[j].replace(/\*/g, ''))}">${inline(c)}</td>`;
                  })
                  .join('')}</tr>`,
            )
            .join('') +
          `</tbody></table></div>`,
      );
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ''));
      html.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`);
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) items.push(lines[i++].slice(2));
      html.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
    } else {
      html.push(`<p>${inline(line)}</p>`);
      i++;
    }
  }
  return html.join('\n');
}

// ---- Split the guide into its parts ---------------------------------------
const parts = src.split(/\n(?=## )/);
const intro = parts.shift();
const section = (title) => parts.find((p) => p.startsWith(`## ${title}`));
const body = (p) => p.split('\n').slice(1).join('\n');

const STORY_HASH = {};
const stories = parts
  .filter((p) => /^## Story \d+: /.test(p))
  .map((p) => {
    const title = p.split('\n')[0].replace(/^## Story \d+: /, '');
    const n = p.match(/^## Story (\d+)/)[1];
    const hash = slug(title);
    STORY_HASH[slug(`Story ${n}: ${title}`)] = hash;
    return { n, title, hash, md: body(p) };
  });

// "Pick a story" table: one row per story, in the same order.
const pick = section('Pick a story');
const pickRows = pick
  .split('\n')
  .filter((l) => l.startsWith('|'))
  .slice(2)
  .map(cells);
const pickHead = cells(pick.split('\n').find((l) => l.startsWith('|')));
const pickNote = pick.split('\n').filter((l) => l && !l.startsWith('|') && !l.startsWith('#') && l !== '---');
stories.forEach((s, i) => {
  const r = pickRows[i];
  s.meta = { who: r[1], segment: r[2], start: r[3], time: r[4] };
});

const title = intro.match(/^# (.+)$/m)[1];
const introParas = intro.split('\n').filter((l) => l && !l.startsWith('#') && l !== '---');
const before = section('Before every demo');
const reference = section('Reference');
const refSubs = body(reference).split(/\n(?=### )/).filter((s) => s.trim());

const tabs = stories
  .map(
    (s, i) => `
      <a class="tab" role="tab" id="tab-${s.hash}" href="#${s.hash}" aria-controls="panel-${s.hash}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        <span class="tab__n">Story ${s.n}</span>
        <span class="tab__title">${esc(s.title)}</span>
        <span class="tab__meta">${inline(s.meta.time)}</span>
      </a>`,
  )
  .join('');

const panels = stories
  .map(
    (s, i) => `
    <section class="panel" role="tabpanel" id="panel-${s.hash}" aria-labelledby="tab-${s.hash}"${i === 0 ? '' : ' hidden'}>
      <header class="panel__head">
        <h2>Story ${s.n}: ${esc(s.title)}</h2>
        <dl class="facts">
          <div><dt>${inline(pickHead[1])}</dt><dd>${inline(s.meta.who)}</dd></div>
          <div><dt>${inline(pickHead[2])}</dt><dd>${inline(s.meta.segment)}</dd></div>
          <div><dt>${inline(pickHead[3])}</dt><dd>${inline(s.meta.start)}</dd></div>
          <div><dt>${inline(pickHead[4])}</dt><dd>${inline(s.meta.time)}</dd></div>
        </dl>
      </header>
      ${blocks(s.md)}
    </section>`,
  )
  .join('');

const refNav = refSubs.map((s) => {
  const h = s.split('\n')[0].slice(4);
  return `<a href="#ref-${slug(h)}">${inline(h)}</a>`;
});
const refHtml = refSubs
  .map((s) => {
    const h = s.split('\n')[0].slice(4);
    return `<section class="ref-section" id="ref-${slug(h)}"><h3>${inline(h)}</h3>${blocks(s.split('\n').slice(1).join('\n'))}</section>`;
  })
  .join('\n');

const page = `<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600&display=swap">
<style>
  /* Layout: a navy masthead in the demo site's brand, story tabs as cards, one story's
     click table at a time, then the reference sections in full. */
  :root {
    --bg: #f4f6f9;
    --surface: #ffffff;
    --ink: #1c1e27;
    --muted: #5b6b7b;
    --line: #dfe3ea;
    --brand: #1e3b56;
    --brand-ink: #ffffff;
    --gold: #b98a33;
    --gold-soft: #fbf3e3;
    --say: #2c4a66;
    --focus: #d3a44d;
    --display: 'Newsreader', Georgia, 'Times New Roman', serif;
    --body: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0f1822; --surface: #16222f; --ink: #e6ebf1; --muted: #9db0c3; --line: #263646;
      --brand: #142b40; --brand-ink: #f1f4f8; --gold: #e0b866; --gold-soft: #2a2416; --say: #b9cde2; --focus: #e0b866;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --bg: #0f1822; --surface: #16222f; --ink: #e6ebf1; --muted: #9db0c3; --line: #263646;
    --brand: #142b40; --brand-ink: #f1f4f8; --gold: #e0b866; --gold-soft: #2a2416; --say: #b9cde2; --focus: #e0b866;
    color-scheme: dark;
  }
  body { background: var(--bg); color: var(--ink); font: 15px/1.55 var(--body); }
  .wrap { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  a { color: inherit; text-decoration-color: var(--gold); text-underline-offset: 2px; }
  a:focus-visible, .tab:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  code { font: 0.86em/1.3 var(--mono); background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: 0.05em 0.3em; overflow-wrap: anywhere; }
  .mark { color: var(--muted); font-style: italic; font-size: 0.92em; }
  h1, h2, h3 { font-family: var(--display); font-weight: 600; line-height: 1.15; text-wrap: balance; margin: 0; }

  .mast { background: var(--brand); color: var(--brand-ink); }
  .mast .wrap { padding-block: 28px 30px; display: grid; gap: 10px; }
  .eyebrow { font: 600 12px/1 var(--body); letter-spacing: 0.14em; text-transform: uppercase; color: var(--focus); }
  .mast h1 { font-size: clamp(30px, 5vw, 44px); }
  .mast p { margin: 0; max-width: 70ch; opacity: 0.92; }
  .mast a { color: var(--brand-ink); }
  .mast code { background: transparent; border-color: rgba(255,255,255,0.3); color: var(--brand-ink); }
  .mast .mark { color: inherit; opacity: 0.8; }

  main .wrap { padding-block: 28px 48px; display: grid; gap: 28px; }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 20px 22px; min-width: 0; }
  .card > h2 { font-size: 24px; margin-bottom: 10px; }
  .card p { margin: 0.4em 0; max-width: 80ch; }
  .before ol { margin: 0.2em 0 0.6em; padding-left: 1.4em; display: grid; gap: 6px; max-width: 85ch; }
  .before ul { margin: 0.3em 0; padding-left: 1.2em; }

  .tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
  .tab { display: grid; gap: 4px; text-decoration: none; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; color: var(--ink); min-width: 0; }
  .tab:hover { border-color: var(--gold); }
  .tab[aria-selected="true"] { border-color: var(--gold); box-shadow: inset 0 -3px 0 var(--gold); }
  .tab__n { font: 600 11px/1 var(--body); letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
  .tab__title { font: 600 19px/1.15 var(--display); }
  .tab__meta { font-size: 12.5px; color: var(--muted); }
  .tabs-note { margin: -16px 0 0; font-size: 13px; color: var(--muted); }

  .panel { display: grid; gap: 14px; min-width: 0; }
  .panel__head { display: grid; gap: 12px; }
  .panel__head h2 { font-size: clamp(26px, 4vw, 34px); }
  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 0; }
  .facts div { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; }
  .facts dt { font: 600 11px/1.2 var(--body); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 3px; }
  .facts dd { margin: 0; }
  .panel > p { margin: 0; max-width: 85ch; }

  .table-wrap { overflow-x: auto; min-width: 0; }
  table { border-collapse: collapse; width: 100%; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; font-size: 14px; }
  th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-top: 1px solid var(--line); }
  thead th { font: 600 11.5px/1.2 var(--body); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); background: var(--bg); border-top: 0; }
  .steps tbody th { font: 600 18px/1 var(--display); color: var(--gold); width: 2.2em; font-variant-numeric: tabular-nums; }
  .steps .c-click { width: 26%; font-weight: 500; }
  .steps .c-say { width: 30%; color: var(--say); font-style: italic; border-left: 3px solid var(--gold-soft); }
  .ref td:first-child { font-weight: 600; }

  .ref-nav { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 14px; }
  .ref-section { display: grid; gap: 10px; min-width: 0; scroll-margin-top: 16px; }
  .ref-section h3 { font-size: 22px; }
  .ref-section p { margin: 0; max-width: 85ch; }
  .ref-section ul { margin: 0; padding-left: 1.2em; display: grid; gap: 4px; max-width: 85ch; }
  .refs { display: grid; gap: 30px; }
  .refs > h2 { font-size: 28px; }
  footer { color: var(--muted); font-size: 13px; padding-block: 0 32px; }

  @media (max-width: 720px) {
    .steps, .steps tbody, .steps tr, .steps td, .steps th { display: block; width: auto !important; }
    .steps thead { display: none; }
    .steps tr { border-top: 1px solid var(--line); padding: 10px 12px; }
    .steps tbody tr:first-child { border-top: 0; }
    .steps th, .steps td { border: 0; padding: 4px 0; }
    .steps td::before { content: attr(data-label); display: block; font: 600 10.5px/1.4 var(--body); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
    .steps .c-say { border-left: 3px solid var(--gold-soft); padding-left: 10px; }
  }
  @media (prefers-reduced-motion: no-preference) { .tab { transition: border-color 0.15s, box-shadow 0.15s; } }
</style>

<header class="mast">
  <div class="wrap">
    <span class="eyebrow">Salesforce Higher Ed · demo playbook</span>
    <h1>${esc(title)}</h1>
    ${introParas.map((p) => `<p>${inline(p)}</p>`).join('\n    ')}
  </div>
</header>

<main>
  <div class="wrap">
    <section class="card before" aria-labelledby="before-h">
      <h2 id="before-h">${inline(before.split('\n')[0].slice(3))}</h2>
      ${blocks(body(before))}
    </section>

    <nav class="tabs" role="tablist" aria-label="Story paths">${tabs}
    </nav>
    ${pickNote.map((p) => `<p class="tabs-note">${inline(p)}</p>`).join('')}
    ${panels}

    <section class="refs" aria-labelledby="ref-h">
      <h2 id="ref-h">Reference</h2>
      <nav class="ref-nav" aria-label="Reference sections">${refNav.join('')}</nav>
      ${refHtml}
    </section>
  </div>
</main>
<footer><div class="wrap">Built from <code>docs/demo-guide.md</code> in the Connected University repo. Connected University is not a real school; the demo site is for Salesforce demo purposes only. <a href="${SITE}" target="_blank" rel="noopener">Open the live site</a>.</div></footer>

<script>
  (function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    var names = tabs.map(function (t) { return t.getAttribute('href').slice(1); });
    function show(name, focus) {
      if (names.indexOf(name) === -1) name = names[0];
      tabs.forEach(function (t) {
        var on = t.getAttribute('href') === '#' + name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
    }
    window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (names.indexOf(h) !== -1) show(h); });
    document.querySelector('.tabs').addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault();
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      location.hash = next.getAttribute('href');
      show(next.getAttribute('href').slice(1), true);
    });
    show(location.hash.slice(1));
  })();
</script>
`;

writeFileSync(out, page);
console.log(`Wrote ${out}: ${stories.length} stories, ${refSubs.length} reference sections`);
