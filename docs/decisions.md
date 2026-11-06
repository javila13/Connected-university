# Decisions log

One line per decision made during the build, dated. Confidence labels per CLAUDE.md: *(verified — source)*, *(hypothesis — needs validation)*, *(uncertain — flag for review)*. Questions for Jesse are marked **Q**.

## Phase 0: Scaffold

### Stack and hosting
- 2026-11-06: Astro 7.4.7 and Express 5.3.0, the latest releases on npm at build time; Node `22.x` in `engines` *(verified — `npm view`, 2026-11-06)*.
- 2026-11-06: `astro` sits in `dependencies`, not `devDependencies`, so the Heroku build doesn't depend on how devDependencies are installed and pruned.
- 2026-11-06: Heroku's Node buildpack runs `npm run build` automatically, then `Procfile` starts `node server.js` *(hypothesis — needs validation; part of spike S2, not yet run on Heroku)*.
- 2026-11-06: Content collections live in `/content` at the repo root, not `src/content`, so the repo reads as a content model for the Contentful talk track (D2).
- 2026-11-06: Phase 0 browser scripts live in `src/scripts/` (consent, settings, widget slots). `sim/` is created in Phase 2 and imports settings from there.

### Page metadata contract (PLAN.md §5.1)
- 2026-11-06: The contract is enforced twice. A zod schema validates Markdown pages, and `assertPageMeta()` in `BaseLayout` covers `.astro` pages. Both fail the build on a missing or unknown `section`/`audience` *(verified — broke a page on purpose; `npm run build` exited 1, 2026-11-06)*.
- 2026-11-06: `section` and `audience` are closed vocabularies (`src/lib/taxonomy.js`), so a typo fails the build instead of skewing affinities. Added `section: system` for the 404 page; Phase 2's affinity engine should ignore it.
- 2026-11-06: `/demo` and `/data360` use a separate `ToolLayout`: `noindex` meta plus an `X-Robots-Tag` header, no page metadata, no chat widgets, no consent banner. They never feed the simulation.

### Crawlability (D7)
- 2026-11-06: `server.js` generates `robots.txt` and `sitemap.xml` per request from the files in `dist/`, using the request's host, or `SITE_URL` when set. Picking the domain (D9) therefore needs no rebuild. Any page with a `noindex` meta tag is left out of the sitemap automatically.
- 2026-11-06: `robots.txt` does not `Disallow` `/demo` or `/data360`. A disallow would stop crawlers from fetching those pages and seeing their `noindex`.
- 2026-11-06: Page URLs use a new, clean scheme (e.g. `/admissions/request-information/`) rather than the WordPress paths. The site moves to a new domain, so no redirects are needed.

### Look and navigation
- 2026-11-06: Visual tokens are mirrored from the live site: navy `#1E3B56`, gold `#D3A44D`, Newsreader for headings *(verified — connecteduniversity-mc.org theme CSS and computed styles, 2026-11-06)*.
- 2026-11-06: The live site's body font, `articulat-cf`, is an Adobe Fonts face and isn't used here; body copy uses a Helvetica/Arial stack. Newsreader is self-hosted via `@fontsource`, so pages make no Google Fonts request.
- 2026-11-06: The logo is a text typemark until Jesse adds `public/assets/logo.svg` and `logo-reversed.svg`. The home hero is a gradient until `public/assets/home-hero.jpg` (or `.webp`/`.png`) exists. Both are picked up at build time with no code change.
- 2026-11-06: The main nav is the §4 sections: Academics, Admissions, Student Success, Continuing Ed, Athletics, Alumni, Giving, About. The global pages (Visit, News, Events, Careers, Contact) plus Student Portal and Professor Login sit in a navy utility bar. The current site's "Campus" dropdown is folded into these.
- 2026-11-06: Menus and footer columns only show links to pages that exist (`src/lib/routes.js`), so Phase 1 fills the menus just by adding pages, and nothing links to a 404 in the meantime.
- 2026-11-06: The current site's header search isn't mirrored yet. **Q:** Do we want site search? Phase 2's agent index could power it.
- 2026-11-06: Home page section order and copy mirror the live site. The hero is wrapped in zone `pz-home-hero` as its default variant.
- 2026-11-06: Section hubs have short copy with no numbers. `topic` is set only where it adds signal (athletics, giving).

### Facts
- 2026-11-06: Campus address is Santa Fe Springs (Jesse's pick): 11721 Telegraph Rd, Santa Fe Springs, CA 90670, (100) 123-4567 *(verified — live site footer, 2026-11-06)*. It is defined once, in `content/facts.json`.
- 2026-11-06: `facts.json` is seeded with the §11 figures (36 / 12 / 50+ / 20 programs; $5B research; 21 libraries, 18M volumes; 55% scholarships) *(verified — live site home page, 2026-11-06)*.
- 2026-11-06: The footer's legal links mirror the live site (salesforce.com Legal, Terms, Privacy, Responsible Disclosure, Trust), as does the copyright line, plus our own "Privacy & Cookies" page and a "Cookie Preferences" button. **Q:** Keep the Salesforce copyright and links on the new domain?

### Consent (PLAN.md §6)
- 2026-11-06: `cu_consent` is a first-party cookie, `all` or `necessary`, kept for 180 days. `necessary` blocks the simulation and both chat widgets; the Agentforce mock counts as part of the simulation.
- 2026-11-06: Withdrawing consent reloads the page, because a loaded third-party embed can't be cleanly removed.

### Demo settings and widget routing (PLAN.md D6, §7)
- 2026-11-06: In `auto` mode, `prospect`, `learner` and `fan` pages get Piper; `student`, `alumni` and `donor` pages get the Agentforce mock. **Q:** D6 doesn't say where learner (Continuing Ed) and fan (Athletics) pages go. I treated both as inbound inquiry, so Piper.
- 2026-11-06: Agent persona by audience: prospect and learner → Student Recruitment; student → Student Success; alumni, donor and fan → Alumni & Giving. **Q:** Same gap for fan and learner; this only matters in `agentforce` and `both` modes.
- 2026-11-06: Switching Simulation off also hides the Agentforce mock, since it is part of the simulation; Piper is unaffected.
- 2026-11-06: URL params: `sim`, `mode`, `piper`, `agentforce`, `agent`, `badge`, `autoconsent`. `piper=` and `agentforce=` force one widget on or off on top of the mode. Overrides last for the browser tab (`sessionStorage`), so a shared demo link doesn't permanently change the presenter's saved settings.
- 2026-11-06: Settings reach open tabs and `/data360` live via `BroadcastChannel('cu-demo')`, plus a same-tab event *(verified — Playwright, Chromium only, 2026-11-06)*. Firefox and Safari are untested *(uncertain — flag for review)*.
- 2026-11-06: `Ctrl+Alt+D` opens `/demo` in the same tab. On some keyboard layouts the OS treats Ctrl+Alt as AltGr *(hypothesis — needs validation on Jesse's demo machine)*.

### Embeds
- 2026-11-06: The Qualified loader uses the standard snippet shape (a command queue plus `js.qualified.com/qualified.js?token=…`) *(hypothesis — needs validation against the snippet in Jesse's Qualified workspace)*. It loads only when a token is set, consent is `all`, and routing says Piper. Otherwise a placeholder bubble shows.
- 2026-11-06: Piper's stub sits bottom-right. In `both` mode the mock moves bottom-left. Whether the real Piper bubble's position can be configured is still spike S1 *(hypothesis — needs validation)*.

### Environment
- 2026-11-06: Created a personal cloud environment, "Connected-university", that allows `connecteduniversity-mc.org` so the build could read the live site's layout, colors and copy. No assets were downloaded (CLAUDE.md).

### Phase 0 summary (for the retrospective)
- **Delivered:** Astro + Express scaffold, `Procfile`, base layout mirroring the live site, 16 indexable pages (home, 8 section hubs, Visit, News, Events, Careers, Contact, Privacy, Student Portal shell), 404, consent banner, the `/demo` panel, a `/data360` placeholder that follows settings live, embed slots with stub config, a dynamic `robots.txt`/`sitemap.xml`, and `npm run smoke`.
- **Exit criteria:** "`/demo` toggles work" is **met** *(verified — 46 Playwright checks and 98 smoke checks, locally, 2026-11-06)*. "Site deploys from `main`" is **not met**: the repo has no `main` branch yet and no Heroku app is connected. Both are Jesse's steps; see the README.
- **Not started:** Phase 1 pages, the simulation, the agent mock, the inspector.
- **Open questions:** marked **Q** above.
