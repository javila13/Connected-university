# CLAUDE.md — Connected University demo site

Read `PLAN.md` first. It holds the locked decisions (§2), page map (§4), simulation design (§5), embed contract (§6), and phasing (§10). This file is the working rules for the repo.

## What this is
A fictitious university website used in Salesforce Higher Ed demos. It **simulates** Data 360 web tracking, Salesforce Personalization, and Agentforce entirely in the browser (an affinity engine, a Data 360-styled inspector, a local rules engine that adapts page content, and a scripted agent widget), loads one **real** chat widget (Qualified Piper), and is publicly crawlable. Hosted on Heroku, deployed from `main`.

## Stack
- Astro, `output: 'static'`; content collections for pages, programs, news, events, teams
- `server.js` — Express serving `dist/` plus `robots.txt` and `sitemap.xml`; `Procfile: web: node server.js`
- `sim/` — vanilla JS: event store, affinity engine, rules engine, inspector UI, agent widget. State in `localStorage`, cross-tab sync via `BroadcastChannel`. Nothing leaves the browser
- No framework runtime on the client beyond what the vendor snippets need
- No CSP header (vendor embeds would break). No secrets anywhere; every identifier in `public/demo-config.js` is a public web snippet value

## Conventions
- Every page's frontmatter declares `section`, `audience`, optional `program`, `topic`, `personaHook`. The base layout writes them to `<body data-*>`; the simulation reads only from there. Missing `section`/`audience` is a build error
- Simulated objects use the real DMO/stream/field names listed in `PLAN.md` §5.2. Don't invent Salesforce-looking names beyond that table
- Personalization rules live in `content/personalization-rules.json`; variants are content files; every zone renders a default. Zone ids are exactly those in `PLAN.md` §5.4
- Sofia's known-profile attributes live only in `content/sofia.json`, keyed by life stage
- Agent conversations live in `content/agent-scripts.json`, one persona per audience (`PLAN.md` §5.8). Every intent has quick-reply chips and a fallback; responses may read `sim` state and `sofia.json`. Widget mode (`auto` / `piper` / `agentforce` / `both`) is read from `/demo` settings, never hardcoded per page
- Institutional numbers come only from `content/facts.json`. If copy needs a number that isn't there, add it to the file first and note it in `docs/decisions.md`
- One campus address, defined once in `facts.json`
- Named people: Sofia Sanders (persona) and Dr. Martinez (Chemistry faculty, her advisor). Invent everyone else; no real names, no real PII
- Footer disclaimer on every page: "Connected University is not a real school. This is a demo site for Salesforce demo purposes only."
- Keep `docs/decisions.md` — one line per decision made during the build, dated

## Confidence marking
Jesse audits deliverables. Any non-obvious technical claim written into docs, comments, or `docs/decisions.md` carries one of: `(verified — source)`, `(hypothesis — needs validation)`, `(uncertain — flag for review)`. Vendor widget behavior you haven't run against a live account is a hypothesis, not a fact.

## Don't
- Don't integrate the real Data 360, Personalization, or Agentforce SDKs/embeds; those stories are simulated by design (`PLAN.md` D10). Qualified is the only live snippet
- Don't re-litigate `PLAN.md` §2 decisions; raise a question in `docs/decisions.md` instead
- Don't hardcode vendor IDs, org IDs, or deployment names in components
- Don't add `noindex` to anything except `/demo` and `/data360`
- Don't fetch assets from the WordPress site; Jesse drops them into `public/assets/`
- Don't make the inspector or the agent widget pixel-identical to the real Salesforce UI; Lightning-styled is enough, and the "Simulated" badge must be toggleable

## Build order
Phase 0 scaffold → Phase 1 content → Phase 2 simulation (incl. agent mock) → Phase 3 Piper (spikes S1–S2) → Phase 4 demo scripts. Each phase ends with a short summary in `docs/decisions.md` so a retrospective can be run against it.
