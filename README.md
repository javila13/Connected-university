# Connected University demo site

A fictitious university website for Salesforce Higher Ed demos. Data 360 web tracking, Personalization and Agentforce are simulated in the browser; Qualified (Piper) is the only live embed. See `PLAN.md` for the plan, `CLAUDE.md` for the working rules and `docs/decisions.md` for what was decided during the build.

**Status:** Phase 0 (scaffold) is complete and live at https://connected-university-website-64975a496d17.herokuapp.com, auto-deployed from `main`. Phase 1 (content) is in progress, one section per pull request; Academics is done.

## Run it locally

```bash
npm ci
npm run dev        # Astro dev server with hot reload
# or, the way Heroku runs it:
npm run build && npm start      # http://localhost:3000
npm run smoke      # in a second shell, against the running server
```

`npm run smoke` checks robots.txt and the sitemap, and that every sitemap page returns 200 and carries its metadata and the footer disclaimer. It also checks that every internal link resolves, the search index, `noindex` on `/demo` and `/data360`, 404 handling and cache headers. To test a deployed app, set `BASE_URL=https://your-app.herokuapp.com`.

## Deploy to Heroku (Jesse)

1. Create `main` from this branch, or merge the PR into it.
2. Create a Heroku app with the Node.js buildpack. On the Deploy tab, connect the GitHub repo and enable automatic deploys from `main`.
3. Use a **Basic** dyno or higher for live demos; Eco dynos sleep (PLAN.md D8).
4. Optional: set config var `SITE_URL=https://your-domain` once the custom domain is live. Without it, `robots.txt` and `sitemap.xml` use whatever host the request came in on.
5. Run `BASE_URL=https://<app>.herokuapp.com npm run smoke` once deployed.

## Configure

- **Qualified (Piper):** paste the token from your Qualified JS snippet into `public/demo-config.js`. It's a public value, not a secret. Leave it empty to show a placeholder bubble.
- **Brand assets:** drop files into `public/assets/` and rebuild:
  - `logo.svg`: header logo, replaces the text typemark
  - `logo-reversed.svg`: footer logo on navy
  - `home-hero.jpg` (or `.webp`/`.png`): home page hero photo
- **Facts and address:** `content/facts.json` is the only place institutional numbers live.
- **Navigation:** `content/nav.json`. Links to pages that don't exist yet are hidden automatically.

## Demo controls

Open `/demo`, or press **Ctrl+Alt+D** on any page. Settings are saved in the browser and apply live to open tabs.

| Control | What it does |
|---|---|
| Simulation | Turns the simulated Data 360, Personalization and Agentforce mock on or off |
| Chat widgets | `auto` (Piper on public pages, Agentforce on student/alumni/giving pages, both on Continuing Ed and Athletics), `piper`, `agentforce`, `both` |
| Agent persona | Force one Agentforce persona on every page |
| Consent auto-accept | Skip the cookie banner |
| "Simulated" badge | Show or hide the badge on simulated UI |

URL params override the saved settings for one browser tab: `?mode=both`, `?piper=0`, `?agentforce=1`, `?agent=student-success`, `?sim=0`, `?badge=0`, `?autoconsent=1`.

## Site search

The header's search button opens a search bar; results show on `/search/?q=…`. `npm run build` writes `dist/search-index.json` from the rendered pages (`integrations/search-index.mjs`), so new pages are searchable with no extra step. Search doesn't work under `npm run dev`; use `npm run build && npm start`.

## Adding a page

Add a Markdown file under `content/pages/`. Its path is its URL: `content/pages/alumni/events.md` becomes `/alumni/events/`. Frontmatter:

```yaml
---
title: Events & Reunions
description: One sentence; used as the lede and meta description.
section: alumni        # see src/lib/taxonomy.js
audience: alumni       # prospect | student | alumni | donor | learner | fan
program: environmental-science   # optional
topic: reunions                  # optional
personaHook: ...                 # optional
eyebrow: ...                     # optional kicker above the title
---
```

A missing or unknown `section` or `audience` fails the build.

Optional extras for Markdown pages:

```yaml
faqs:                       # rendered as an FAQ block plus schema.org FAQPage data
  - q: Can I study online?
    a: Yes. ...
listPrograms: undergraduate # all | undergraduate | graduate | online: adds program cards
listHeading: Featured programs
listGroupBySchool: true     # group the cards by school
listFaculty: true           # adds the faculty directory
```

### Numbers in copy

Institutional numbers live only in `content/facts.json`. Quote them with tokens, in Markdown or frontmatter: `Choose from {{facts.programs.undergraduate}} majors`. An unknown token fails the build.

### Programs and faculty

- **Program:** add `content/programs/<id>.md`; it's served at `/academics/programs/<id>/`. Frontmatter holds `school` (an id from `facts.json`), `credentials` (name, short, level, formats, credits, duration), `startTerms`, `courses`, `careers`, and optional `faculty`, `related`, `certificate` and `faqs`. See `content/programs/environmental-science.md`.
- **Faculty:** add `content/faculty/<id>.md`; it's served at `/academics/faculty/<id>/`. See `content/faculty/martinez.md`.
- `faculty`, `related` and `programs` lists take ids. A typo fails the build.

## Layout

```
content/          pages, programs, faculty (Markdown); facts.json, nav.json
src/pages/        home, contact, portal, search, 404, /demo, /data360, and the Markdown page route
src/layouts/      BaseLayout (public pages), ToolLayout (presenter tools)
src/scripts/      consent, demo settings, chat widget slots, search
integrations/     build step that writes the search index
src/lib/          metadata vocabulary, nav and route helpers
public/           demo-config.js, assets/
server.js         Express: dist/, robots.txt, sitemap.xml
scripts/smoke.mjs post-deploy smoke test
```

Connected University is not a real school. This is a demo site for Salesforce demo purposes only.
