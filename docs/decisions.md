# Decisions log

One line per decision made during the build, dated. Confidence labels per CLAUDE.md: *(verified — source)*, *(hypothesis — needs validation)*, *(uncertain — flag for review)*. Questions for Jesse are marked **Q**.

## Phase 0: Scaffold

### Stack and hosting
- 2026-11-06: Astro 7.4.7 and Express 5.3.0, the latest releases on npm at build time; Node `22.x` in `engines` *(verified — `npm view`, 2026-11-06)*.
- 2026-11-06: `astro` sits in `dependencies`, not `devDependencies`, so the Heroku build doesn't depend on how devDependencies are installed and pruned.
- 2026-11-06: Heroku runs the `build` script from `package.json` during the build, after installing dependencies *(verified — Heroku Dev Center "Node.js Classic Buildpack Builds", updated 2025-09-04)*. A `Procfile` takes precedence over the `start` script for the web process, and `NODE_ENV` defaults to `production` *(verified — "Node.js Behavior in Heroku", updated 2025-09-04)*. Confirmed on a real app: see the S2 line below.
- 2026-11-06: Spike S2, mostly done. Jesse created the Heroku app `connected-university-website` (https://connected-university-website-64975a496d17.herokuapp.com) and manually deployed `claude/new-session-pkohbl`. The build ran, Express serves `dist/`, `robots.txt` and `sitemap.xml` use the https Heroku host, and `/demo` sends `X-Robots-Tag: noindex` *(verified — `npm run smoke`, 127/127, and the browser suite, 66/66, against the live app, 2026-11-06)*. `main` was created from this branch at `256d15e`, and Jesse turned on Heroku automatic deploys from `main` *(verified — `main` exists on GitHub; auto-deploy setting confirmed by Jesse, not seen from here; the first merge to `main` will show it working)*.
- 2026-11-06: New Common Runtime apps are Cedar-generation, so they use the classic Node.js buildpack; Fir is only available in Private Spaces *(verified — "Getting Started on Heroku with Node.js")*.
- 2026-11-06: Node `22.x` is Maintenance LTS on Heroku until 2027-04-30 *(verified — "Heroku Node.js Support", updated 2026-11-05)*. `22.x` currently resolves to 22.23.4, which is exactly Astro 7.4.7's minimum (`>=22.23.4`) *(verified — heroku-buildpack-nodejs `inventory/node.toml`, 2026-11-06)*. If a future Astro update raises its minimum ahead of Heroku's inventory, the build will fail; check this when upgrading Astro.
- 2026-11-06: D8 check: an Eco web dyno sleeps after 30 minutes without traffic; Basic doesn't sleep. Eco is a $5/month account-wide pool and Basic is $7/month per dyno. Without an Eco subscription, new apps default to Basic *(verified — Heroku "Dyno Sizes", "Eco Dyno Hours", pricing page, and "Getting Started on Heroku with Node.js", fetched 2026-11-06)*.
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
- 2026-11-06: Site search added (Jesse). The header's navy search button mirrors the live site and opens a search bar; results show on `/search/`. Details under "Site search" below.
- 2026-11-06: Home page section order and copy mirror the live site. The hero is wrapped in zone `pz-home-hero` as its default variant.
- 2026-11-06: Section hubs have short copy with no numbers. `topic` is set only where it adds signal (athletics, giving).

### Facts
- 2026-11-06: Campus address is Santa Fe Springs (Jesse's pick): 11721 Telegraph Rd, Santa Fe Springs, CA 90670, (100) 123-4567 *(verified — live site footer, 2026-11-06)*. It is defined once, in `content/facts.json`.
- 2026-11-06: `facts.json` is seeded with the §11 figures (36 / 12 / 50+ / 20 programs; $5B research; 21 libraries, 18M volumes; 55% scholarships) *(verified — live site home page, 2026-11-06)*.
- 2026-11-06: Removed the Salesforce copyright line and the five salesforce.com legal links (Legal, Terms, Privacy, Responsible Disclosure, Trust) from the footer (Jesse). The footer's legal bar now holds "Privacy & Cookies", "Cookie Preferences" and the required disclaimer. `copyrightHolder` is gone from `facts.json`.

### Consent (PLAN.md §6)
- 2026-11-06: `cu_consent` is a first-party cookie, `all` or `necessary`, kept for 180 days. `necessary` blocks the simulation and both chat widgets; the Agentforce mock counts as part of the simulation.
- 2026-11-06: Withdrawing consent reloads the page, because a loaded third-party embed can't be cleanly removed.

### Demo settings and widget routing (PLAN.md D6, §7)
- 2026-11-06: In `auto` mode, `prospect` pages get Piper and `student`, `alumni` and `donor` pages get the Agentforce mock (D6). `learner` (Continuing Ed) and `fan` (Athletics) pages, which D6 didn't cover, get **both** (Jesse), with the mock bottom-left as in `both` mode. PLAN.md is unchanged; this log records the extension.
- 2026-11-06: Agent persona by audience: prospect and learner → Student Recruitment; student → Student Success; alumni, donor and fan → Alumni & Giving. Learner and fan were my picks: CE inquiries fit the recruitment agent, and tickets and boosters fit alumni and giving.
- 2026-11-06: Switching Simulation off also hides the Agentforce mock, since it is part of the simulation; Piper is unaffected.
- 2026-11-06: URL params: `sim`, `mode`, `piper`, `agentforce`, `agent`, `badge`, `autoconsent`. `piper=` and `agentforce=` force one widget on or off on top of the mode. Overrides last for the browser tab (`sessionStorage`), so a shared demo link doesn't permanently change the presenter's saved settings.
- 2026-11-06: Settings reach open tabs and `/data360` live via `BroadcastChannel('cu-demo')`, plus a same-tab event *(verified — Playwright, Chromium only, 2026-11-06)*. Firefox and Safari are untested *(uncertain — flag for review)*.
- 2026-11-06: `Ctrl+Alt+D` opens `/demo` in the same tab. On some keyboard layouts the OS treats Ctrl+Alt as AltGr *(hypothesis — needs validation on Jesse's demo machine)*.

### Embeds
- 2026-11-06: The Qualified loader uses the standard snippet shape (a command queue plus `js.qualified.com/qualified.js?token=…`) *(hypothesis — needs validation against the snippet in Jesse's Qualified workspace)*. It loads only when a token is set, consent is `all`, and routing says Piper. Otherwise a placeholder bubble shows.
- 2026-11-06: Piper's stub sits bottom-right. In `both` mode the mock moves bottom-left. Whether the real Piper bubble's position can be configured is still spike S1 *(hypothesis — needs validation)*.

### Site search
- 2026-11-06: Search is client-side, with no dependency and no service. A build step (`integrations/search-index.mjs`) reads the rendered HTML of every page into `dist/search-index.json`: title, description, section, audience, program, topic and main-content text. `.astro` and Markdown pages are indexed the same way.
- 2026-11-06: The index leaves out `noindex` pages (`/demo`, `/data360`), the 404 and `/search/` itself. `/search/` stays indexable and in the sitemap, per CLAUDE.md's `noindex` rule.
- 2026-11-06: Matching: every query word must appear on the page, with prefix matching ("sustain" finds "sustainability"). Title hits outrank description hits, which outrank body text. Common words are ignored. This is enough for a 60–75-page site *(hypothesis — revisit if Phase 1 copy makes results noisy; Pagefind is the fallback)*.
- 2026-11-06: The same index is meant for the Phase 2 Agentforce mock's content grounding (PLAN.md §5.8), so there is one index, not two.
- 2026-11-06: Search doesn't work under `astro dev`, because the index is only written by `npm run build`. The search page says so in dev.
- 2026-11-06: Searches are **not** a tracked visitor action (Jesse). Phase 2's simulation logs no engagement row and no affinity for a search; the `/search/` page view itself is ignored like the 404's (`section: search`). Clicking a result lands on a normal page, which is tracked as usual.

### Environment
- 2026-11-06: Created a personal cloud environment, "Connected-university", that allows `connecteduniversity-mc.org` so the build could read the live site's layout, colors and copy. No assets were downloaded (CLAUDE.md).
- 2026-11-06: Added `devcenter.heroku.com` and `www.heroku.com` to that environment so the Heroku setup steps could be checked against the live docs.

### Phase 0 summary (for the retrospective)
- **Delivered:** Astro + Express scaffold, `Procfile`, base layout mirroring the live site, 17 indexable pages (home, 8 section hubs, Visit, News, Events, Careers, Contact, Privacy, Student Portal shell, Search), 404, consent banner, site search, the `/demo` panel, a `/data360` placeholder that follows settings live, embed slots with stub config, a dynamic `robots.txt`/`sitemap.xml`, and `npm run smoke`.
- **Follow-up round (same day, Jesse's answers):** both widgets on Continuing Ed and Athletics, site search added, Salesforce copyright and legal links removed.
- **Exit criteria:** both **met**. "`/demo` toggles work" *(verified — 66 Playwright checks and 127 smoke checks, locally and on Heroku, 2026-11-06)*. "Site deploys from `main`": `main` exists and Heroku auto-deploys from it (confirmed by Jesse, 2026-11-06).
- **Status:** Phase 0 complete, 2026-11-06. Live at https://connected-university-website-64975a496d17.herokuapp.com. Work continues on `claude/new-session-pkohbl` and reaches `main` through pull requests.
- **Not started:** Phase 1 pages, the simulation, the agent mock, the inspector.
- **Open questions:** none left from Phase 0.

## Phase 1: Content

### How Phase 1 runs
- 2026-11-06: Jesse skipped the Phase 0 retrospective. Phase 1 goes section by section, with one pull request per section into `main`. Jesse reviews on the live Heroku site after merging. Order: Academics → Admissions → Student Success → Alumni → Giving → Continuing Ed → Athletics → global pages (About, News, Events, Visit).
- 2026-11-06: Copy depth is "medium" (Jesse): roughly 250–500 words per page. Key pages get an FAQ block, because Piper's crawl and the Phase 2 agent mock both answer from page text.

### Content model
- 2026-11-06: Two new collections. `programs` (`content/programs/<id>.md` → `/academics/programs/<id>/`) and `faculty` (`content/faculty/<id>.md` → `/academics/faculty/<id>/`). Each holds structured frontmatter (credentials, courses, careers, office hours) plus Markdown body copy. Program ↔ faculty and related-program links use `reference()`, so a bad id fails the build *(verified — broke one on purpose, 2026-11-06)*.
- 2026-11-06: A "program" is an area of study that can hold several credentials. Business Administration holds the B.S. and the MBA, and Nursing holds the B.S.N., RN to B.S.N. and M.S.N. Listings filter by credential: the Online page shows only the online degrees.
- 2026-11-06: A program page's `data-program` is its own id, not a frontmatter field, so it can't drift from the URL. Phase 2 reads it as academic interest (§5.3).
- 2026-11-06: Markdown pages can list programs (`listPrograms: all | undergraduate | graduate | online`) or the faculty (`listFaculty: true`), and any page can carry `faqs`. FAQs render as page text plus schema.org `FAQPage` data.
- 2026-11-06: Breadcrumbs appear on every page below a section hub.
- 2026-11-06: Added "Degree Programs" (`/academics/programs/`) to the Academics menu, as an A–Z index grouped by school. §4 doesn't name an index page, but program pages need a parent.

### Facts in copy
- 2026-11-06: Copy quotes `facts.json` with `{{facts.path}}` tokens (e.g. `{{facts.programs.undergraduate}}`). Tokens are filled when the page renders, not when Markdown is parsed, so a `facts.json` change can't be hidden by Astro's content cache. An unknown or malformed token fails the build *(verified — 2026-11-06)*.
- 2026-11-06: Added the five schools to `facts.json` (`schools`): Science & Sustainability, Business, Engineering & Computing, Nursing & Health Sciences, and Education & Human Development. They're invented. Copy names the schools but doesn't count them.
- 2026-11-06: Program-level numbers (credits, length, start terms) live only in each program's frontmatter; `facts.json` keeps the institution-wide figures (Jesse, after reviewing the trade-offs). CLAUDE.md's numbers rule now says so, and says not to restate these numbers by hand in copy. Removed the three restatements found in review: Computer Science "two years", Nursing "about a year" and the MBA's "eight-week terms" (cut rather than added as a field), plus "four years" in an Undergraduate FAQ. Tokens can't quote program fields yet; I'll extend them only if a later section needs to.
- 2026-11-06: All program details are invented: degree names, credits (120 for most bachelor's degrees, 128 for Engineering), course codes, start terms, concentrations and careers. No salary, placement or ranking figures, and no real accreditors, hospitals or employers.

### Academics (PR 1)
- 2026-11-06: Pages: Academics hub (rewritten), Undergraduate, Graduate, Online, Degree Programs index, Faculty directory, 8 program pages (§4) and 4 faculty profiles. That is 17 new pages plus the rewritten hub; the site now has 34 indexable pages.
- 2026-11-06: The 8 program pages cover 4 of the 12 graduate programs (MBA, M.S. Computer Science, M.S.N., M.Ed.) and a few of the 36 undergraduate ones. Listing pages say "featured" so the counts in `facts.json` stay true.
- 2026-11-06: Sofia hooks: Environmental Science is her program (`personaHook: sofia-prospect`). Its FAQ and advising copy set up the Organic Chemistry early alert. Dr. Olga Martinez (`sofia-student`) teaches Organic Chemistry, advises Environmental Science majors, and raises early alerts. Sustainability Studies and Dr. Ostrowski (`sofia-learner`) point to the Continuing Ed sustainability certificate.
- 2026-11-06: Dr. Martinez's first name is Olga (Jesse): "Dr. Olga Martinez" on first mention, "Dr. Martinez" after that, at `/academics/faculty/olga-martinez/`. The copy still uses no pronouns, since none have been given. Phase 2's `sofia.json` should name her advisor the same way. The other three faculty (Helena Ostrowski, Samuel Okonjo, Rebecca Thornbury) are invented. The faculty directory is sorted by last name.
- 2026-11-06: The Sustainability Studies page names Wilma Grace (YSS ’18) and Courtney Tran-Kim (YSS ’22) as graduates of the program. The live site gives their award but not their program; the link is invented and Jesse chose to keep it. "YSS" is kept as written on the live site.
- 2026-11-06: Program pages link to their Continuing Ed certificate (Sustainability, Data Analytics) only once that certificate page exists. The URLs are reserved now: `/continuing-ed/certificates/<id>/`.
- 2026-11-06: Program pages carry the `pz-recommended-programs` zone with its default variant (the program's `related` list). The home page doesn't have the zone yet; it's added with the Phase 2 rules.
- 2026-11-06: Program-page CTAs (Request Information, Apply) point to the Admissions hub until the Admissions PR adds those pages; they switch over automatically.
- 2026-11-06: `npm run smoke` now also checks that every internal link on every page resolves, that no `{{facts}}` token is left unfilled, that structured data parses, and that program pages declare their `data-program`.

### Process after PR 1
- 2026-11-06: Merged PR #1 into `main` at Jesse's request (`5dd3e7a`), then restarted `claude/new-session-pkohbl` from `main`.
- 2026-11-06: Before that merge, the live site was already serving the branch's latest commit while `main` hadn't moved *(verified — live pages showed `d6077f9` copy, GitHub showed `main` at `256d15e`, 2026-11-06)*. So Heroku deployed the branch directly, by a manual deploy or because automatic deploys point at the branch. **Q** for Jesse: confirm Heroku → Deploy → Automatic deploys says `main`, so pushes don't go live before review.

### Admissions (PR 2)
- 2026-11-06: Pages: Admissions hub (rewritten), Undergraduate Admission, Graduate Admission, Transfer Admission & Credits, International Admission, Affordability, Tuition & Financial Aid, Scholarships, Request Information, Apply and Admitted Students. That is 10 new pages plus the rewritten hub; the site now has 44 indexable pages. Visit stays a global page and is filled in with the global pages.
- 2026-11-06: Pricing is a private university's (Jesse). Undergraduate tuition $47,850 a year; the cost-of-attendance total is added up from its parts when the page builds, so there's no total to keep in sync. Online bachelor's $550 and graduate $1,150 per credit. All invented.
- 2026-11-06: New `facts.json` blocks, all invented: `costs`, `admissions` (deadlines, deposits, English test minimums, transfer credit limit and GPA) and `scholarships` (amounts for six named scholarships).
- 2026-11-06: Deadlines are month and day with no year (e.g. Early Action November 15, enrollment deposit May 1), so the site doesn't go stale each cycle. May 1 is the common US deposit date. Whether it matches the deposit deadline your org's Sofia emails use is unknown *(uncertain — flag for review)*.
- 2026-11-06: Numbers in `{{facts}}` tokens print with thousands separators (47850 → 47,850). Years should be stored as strings.
- 2026-11-06: Admissions policy is invented and kept simple: free application, test-optional, rolling graduate admission, up to 90 transfer credits. Copy names real-world requirements (FAFSA, TOEFL, IELTS, Duolingo English Test, I-20) but no real application platform, federal school code, accreditor or partner college.
- 2026-11-06: Scholarships: Presidential, Dean's, Connected Scholars, Transfer Achievement, Global Scholars and a field-of-study Sustainability Leaders Scholarship for Environmental Science and Sustainability Studies students. Suggestion for Phase 2: Sofia's aid offer in `sofia.json` could include a Dean's Scholarship plus Sustainability Leaders *(hypothesis — check against what the org shows)*.
- 2026-11-06: Sofia hooks: Request Information, Apply and Admitted Students carry `personaHook: sofia-prospect`. Admitted Students is her "admitted, not committed" page (2A): deposit, housing and aid steps with their dates, and a "Submit your deposit" link to the Student Portal.
- 2026-11-06: Request Information and Apply are working demo forms (`components/DemoForm.astro`, `src/scripts/forms.js`). They have no action URL and send or store nothing *(verified — Playwright saw no network request on submit, 2026-11-06)*. A valid submit shows a confirmation and fires `cu:form-start` / `cu:form-submit` browser events with the field values; Phase 2 listens for these to log FORM_START / FORM_SUBMIT rows and run the identity stitch (§5.5).
- 2026-11-06: Each form carries the line "This is a demo form. Nothing you enter leaves your browser." (Jesse).
- 2026-11-06: Links can preselect form fields: `?program=<id>` and `?type=<student type>`. Program pages' Request Information and Apply buttons now pass their program, and the Transfer page passes `?type=transfer-student`.
- 2026-11-06: Request Information has an optional "Text me reminders" checkbox, so Phase 2 can show an SMS opt-in on the profile for the channel-switch story.
- 2026-11-06: A `<!-- cost-table -->` line in a Markdown page places the cost-of-attendance table at that spot (used on Tuition & Financial Aid).
- 2026-11-06: `npm run smoke` now also checks that no form posts off-site and that every demo form has no action and carries the demo note. The Student Portal's disabled sign-in form is exempt from the demo-note check.

### Process after PR 2
- 2026-11-06: Merged PR #2 at Jesse's request (`035670d`) and restarted the branch from `main`. Heroku auto-deploy from `main` now works: the Admissions pages went live about 60 seconds after the merge with no manual deploy *(verified — polled the live site; `npm run smoke` 457/457 against it, 2026-11-06)*. This closes the deploy-branch **Q** above. Only the Automatic deploys setting needs to say `main`; Manual deploy is a one-off picker *(verified — Heroku Dev Center "GitHub Integration", updated 2026-08-07)*.

### Student Success (PR 3)
- 2026-11-06: Pages: Student Success hub (rewritten), Academic Advising, Tutoring & Learning Center, Registrar & Deadlines, Health & Wellness, Career Services and Campus Life, plus the Student Portal sign-in and dashboard. §4 lists Housing, Dining and Clubs under Campus Life; they're sections of one page, not three pages. The site now has 50 indexable pages.
- 2026-11-06: Early alerts run through the section. The hub, Advising, Tutoring and Registrar pages explain what Sofia went through: an instructor raises an alert, the advisor follows up by email and by text if the student opted in, and the student can withdraw with a W and retake the course. The email-and-text detail sets up the channel-switch story (3E).
- 2026-11-06: Registrar dates are in `facts.json` (`registrar`), month and day only, all invented: spring registration opens November 10, spring balance due January 5, and so on.
- 2026-11-06: Health & Wellness names the real 988 Suicide & Crisis Lifeline and 911, because real people can land on a public page. 988 is the US crisis line *(verified — SAMHSA; 988 launched July 2022)*.
- 2026-11-06: Student Portal (Jesse: build it now, behind a demo sign-in). Any username and password, or the "Sign in as Sofia (demo)" button, signs in as Sofia for the browser tab (`sessionStorage` `cu_portal_user`). Nothing leaves the browser. Sign-in, sign-out and "Book an appointment" fire `cu:portal-sign-in` / `cu:portal-sign-out` / `cu:portal-action` for Phase 2's identity stitch.
- 2026-11-06: The dashboard is built in the browser from `content/sofia.json`, which is bundled into the page's script. The page HTML only carries public catalog data: course titles, faculty offices and program credits. `npm run smoke` checks that Sofia's email, GPA and alert text aren't in the HTML *(verified — 2026-11-06)*. The record is still readable in the JS bundle under `/_astro/`; crawlers don't usually index script bundles *(hypothesis — needs validation against Qualified's crawler)*.
- 2026-11-06: Created `content/sofia.json` with her identity and the **student** stage. The prospect, alumni and learner stages come in Phase 2. The build checks it against the site: her program, advisor, course codes and date tokens must exist, or the build fails.
- 2026-11-06: Sofia values from the demo-org narrative: name, email, Environmental Science, advisor Dr. Martinez, junior, dropped Organic Chemistry mid-semester, early alert, retook and recovered. The order (dropped, then the alert) follows the narrative *(verified — edu-cloud-dc-demo skill)*. Drafted values for Jesse to check against the org: cumulative GPA 3.05, 74 credits, term GPAs 1.90 then 3.30, retake grade B, current courses, next advising time, SMS opt-in on *(uncertain — flag for review, PLAN.md §8.3)*.
- 2026-11-06: The dashboard reads the degree's 120 credits from the Environmental Science program file, so the number isn't restated in `sofia.json`.
- 2026-11-06: Professor Login stays inert.

### Process after PR 3
- 2026-11-06: Merged PR #3 at Jesse's request (`33fbc49`) and restarted the branch from `main`. Student Success went live about 20 seconds after the merge *(verified — `npm run smoke` 520/520 against the live site, 2026-11-06)*.

### Alumni (PR 4)
- 2026-11-06: Pages: Alumni hub (rewritten), Events & Reunions, Alumni Network & Careers, Alumni Spotlights, Alumni Benefits and Update Your Info. The site now has 55 indexable pages.
- 2026-11-06: Sofia stays off public pages (Jesse). Her alumna and donor stages appear only through the Phase 2 simulation, so the "we recognized her" moment stays fresh in demos. No Sofia spotlight now, and no "Why I give" story on Giving later.
- 2026-11-06: Alumni save 15% on Continuing Education certificates (Jesse). It sets up Sofia's learner stage and the Return to CU page. In `facts.json` as `alumni.ceDiscountPercent`.
- 2026-11-06: More invented `alumni` facts: "120,000+" alumni, milestone reunions every 5 years, Young Alumni = graduates of the last 10 years. The reunion and Young Alumni windows are policy numbers, but they went into `facts.json` too, under the numbers rule.
- 2026-11-06: Update Your Info is a third demo form (`form: update-info`): class year (four digits), degree program, employer, job title, city, and opt-ins for the newsletter (on by default), events near me, mentoring and text reminders. It fires the same `cu:form-start` / `cu:form-submit` events; Phase 2 uses the submit as the alumni identity stitch (§5.5) *(verified — Playwright: events carry the fields, no network request, 2026-11-06)*. Page carries `personaHook: sofia-alumna`, as does the Alumni hub.
- 2026-11-06: The `pz-giving-cta` zone (§5.4) now renders its default variant at the foot of every Alumni page except Update Your Info ("Help the next Connected U student", Give Now and Ways to Give). Pages opt in with `givingCta: true`, and Giving pages will use it too. Give Now points to the Giving hub until the Giving PR adds `/giving/give/`.
- 2026-11-06: Spotlights: Wilma Grace and Courtney Tran-Kim plus three invented graduates (Daniel Okafor ’09, Engineering; Rosa Jimenez ’15 and ’21, Nursing; Kevin Lu ’19, Computer Science). What Wilma Grace and Courtney Tran-Kim do now is invented, beyond the award the live site gives them *(uncertain — flag for review)*. The copy uses names rather than pronouns for all five.
- 2026-11-06: Regional chapters name real US cities, but no real employer, venue or partner.
- 2026-11-06: Career Services now links to the alumni network.
- 2026-11-06: `npm run smoke` now checks that every personalization zone on every page uses a §5.4 id, has a matching element id and renders a variant.

### Process after PR 4
- 2026-11-06: Merged PR #4 at Jesse's request (`4fcda79`) and restarted the branch from `main`. Alumni went live about 20 seconds after the merge *(verified — `npm run smoke` 600/600 against the live site, 2026-11-06)*.

### Giving (PR 5)
- 2026-11-06: Pages: Giving hub (rewritten), Give Now, Ways to Give, Giving Societies, Giving Day, Impact Stories, Planned Giving and Scholarship Funds. Athletics Fund stays a menu link to `/athletics/boosters/`, which appears once the Athletics PR builds it. The site now has 62 indexable pages.
- 2026-11-06: The mid-level society is the **Connected Circle** (Jesse). Levels: Member $1,000 a year or $84 a month, Leader $2,500, Benefactor $5,000, and a separate President's Council at $10,000+. Member to Benefactor sits inside the org's mid-level segment ($500–$9,999, 6B); President's Council matches major gifts ($10,000+, 6A) *(verified — segment filters in the edu-cloud-dc-demo skill)*. Sofia's upgrade ask is to join at $1,000, double her $500 first gift. Giving Societies carries `personaHook: sofia-donor`, as do the Giving hub and Give Now.
- 2026-11-06: Give Now has **no payment fields at all**. Nothing is sent, stored or charged, and a public page shouldn't invite real card numbers. The form takes amount (preset buttons or another amount), one-time or monthly, fund, name, email, optional class year and tribute, and an anonymity opt-out. A valid submit fires `cu:form-submit` with `form: 'give'`, which Phase 2 logs as the Give Now conversion (§3) *(verified — Playwright: no payment inputs, no network request, 2026-11-06)*.
- 2026-11-06: New `giving` facts, all invented: fiscal year July 1 to June 30, preset amounts, society levels, $25,000 minimum for a named endowed scholarship, and the list of funds a gift can go to. The form, the Ways to Give, Societies and Scholarship Funds copy, and Phase 2 rules all read from that one list.
- 2026-11-06: Links can preselect gift fields: `?amount=`, `?frequency=monthly`, `?designation=<fund id>`. The Societies page's join buttons prefill $1,000 or $84 a month, and Scholarship Funds links preselect their fund. Bad values are ignored.
- 2026-11-06: Markdown block markers are now general. A marker on its own line places a component: `<!-- cost-table -->` or `<!-- society-join -->`. The join buttons use one, so their amounts come from `facts.json` instead of being typed into the link URLs.
- 2026-11-06: The `pz-giving-cta` zone shows its default variant on every Giving page except Give Now, so a donor's next step is never more than a scroll away. Give Now in the zone now points to `/giving/give/`.
- 2026-11-06: Impact Stories feature invented students (Jordan Reyes, Amara Osei), with no pronouns. Jordan's story deliberately echoes Sofia's: an Environmental Science major who withdrew from Organic Chemistry and passed on the retake thanks to donor-funded study sessions. It shows what donor-funded tutoring does without naming Sofia, who stays off public pages *(uncertain — flag for review: keep the echo or change it?)*.
- 2026-11-06: Ways to Give and Planned Giving use general tax language ("as allowed by law", "not tax advice") and give no federal tax ID. Mailing address and phone are `{{facts.campus.*}}` tokens.
- 2026-11-06: Giving Day is "every March" with no date, like the other evergreen dates.

### Process after PR 5
- 2026-11-06: Merged PR #5 at Jesse's request (`264f76e`) and restarted the branch from `main`. Giving went live about 20 seconds after the merge *(verified — `npm run smoke` 686/686 against the live site, 2026-11-06)*.

### Continuing Ed (PR 6)
- 2026-11-06: Pages: Continuing Education hub (rewritten), Certificate Catalog, six certificate pages, Corporate Training, Return to CU and CE Inquiry. The site now has 72 indexable pages. All Continuing Ed pages are `audience: learner`, so `auto` mode shows both chat widgets there (Phase 0 decision).
- 2026-11-06: Sofia's credential is the **Professional Certificate in Sustainability** (Jesse: keep the site's name). Phase 2's `sofia.json` learner stage uses the same name, and the org's `ssot__CredentialNameText__c` should match it.
- 2026-11-06: Sofia's natural next step is the **online MBA with a Sustainable Business focus** (Jesse). The Sustainability certificate's graduate credits count toward it, and Return to CU says so. Phase 2's `pz-next-credential` rule should recommend it to credential holders like Sofia.
- 2026-11-06: New `certificates` collection (`content/certificates/<id>.md` → `/continuing-ed/certificates/<id>/`). Six of the 20 certificates are featured: Sustainability, Project Management, Data Analytics, Leadership, Cybersecurity and Nonprofit Management. A certificate page's `data-topic` is its id, which Phase 2 reads for the "certificate views → upsell affinity" signal (§3).
- 2026-11-06: Certificate numbers are invented and live in each certificate's frontmatter, as program numbers do: 4-course certificates are 12 graduate credits, 8 months, $4,800; 3-course certificates are 9 credits, 6 months, $3,600. Each page works out the alumni price from `facts.alumni.ceDiscountPercent` (e.g. $4,080). **Q** for Jesse: extend CLAUDE.md's program-numbers rule to certificates? *(uncertain — flag for review)*
- 2026-11-06: Pathways, all invented: Sustainability → MBA (Sustainable Business), Data Analytics → MBA (Analytics), Project Management and Leadership → MBA (Leadership), Cybersecurity → M.S. in Computer Science. Nonprofit Management has none. A `<!-- certificate-pathways -->` block marker renders the table from the certificate files, so credit numbers aren't restated in copy.
- 2026-11-06: The `pz-next-credential` zone (§5.4) renders on the Certificate Catalog. Its default variant features the one certificate marked `featured: true` (Sustainability), and the build fails unless exactly one is featured.
- 2026-11-06: Program directors: Dr. Ostrowski (Sustainability, as her faculty page already says) and Dr. Okonjo (Data Analytics). The rest have none listed.
- 2026-11-06: CE Inquiry is a fourth demo form (`form: ce-inquiry`, PLAN.md §5.5 identity moment). It asks which certificate (or master's, finishing a degree, corporate training) and preferred start, and has an "I'm a Connected University graduate" checkbox. `?interest=<id>` preselects it, and certificate pages, Corporate Training and Return to CU link that way. Sends nothing *(verified — Playwright, 2026-11-06)*.
- 2026-11-06: The certificate callouts reserved in the Academics PR are now live: Environmental Science and Sustainability Studies link the Sustainability certificate, and Computer Science links Data Analytics.
- 2026-11-06: Project Management says it covers what "most professional certification exams" test, without naming a real certification body.

### Process after PR 6
- 2026-11-06: Merged PR #6 at Jesse's request (`a53d472`) and restarted the branch from `main`. Continuing Ed went live about 20 seconds after the merge *(verified — `npm run smoke` 791/791 against the live site, 2026-11-06)*. The certificate-numbers **Q** above is still open; CLAUDE.md is unchanged.
- 2026-11-06: Scope for the rest of Phase 1 (Jesse): follow §4 at its low end — 6 team pages, 6 news articles, 6 events — for about 105 pages in total, over §4's 60–75 target. More pages give Piper's crawl more to work with.

### Athletics (PR 7)
- 2026-11-06: The teams are the **Connected U Condors** (Jesse), after the California condor, a native conservation success story that quietly ties Athletics to the sustainability thread. Colors stay navy and gold.
- 2026-11-06: Pages: Athletics hub (rewritten), Teams, six team pages, Schedule, Tickets, Boosters & Athletics Fund, Athletics News, three news articles, Facilities and Prospective Student-Athletes. The site now has 88 indexable pages.
- 2026-11-06: Six teams: Women's Soccer, Men's Soccer, Women's Volleyball (fall); Men's and Women's Basketball (winter); Baseball (spring). Coaches, opponents, highlights and the **Coastal Mesa Athletic Conference** are all invented. No NCAA or other real governing body is named. Whether any opponent name matches a real school wasn't checked *(uncertain — flag for review)*.
- 2026-11-06: New `teams` collection (`content/teams/<id>.md` → `/athletics/teams/<id>/`) with a schedule per team. Game dates are full ISO dates in the files, for sorting, but pages show month and day only ("Nov 14"), like the other evergreen dates. The Schedule page merges every team's games by date, and home games link to tickets with `?game=<team>-<date>`. A team page's `data-topic` is its id.
- 2026-11-06: New `news` collection (`content/news/<id>.md` → `/news/<id>/`), started with three athletics stories. Each article carries its own section and audience (athletics stories are `section: athletics`, `audience: fan`) and optional `team` and `program`. The wetland story is tagged `environmental-science`, linking athletics and Sofia's program. Athletics News lists the athletics stories; the global News page now lists every article. The global pages PR adds the other six.
- 2026-11-06: Tickets is a demo form with **no payment fields**, like Give Now. You pick a home game (built from the team files) and quantities by type. A running total is worked out from `facts.athletics.tickets` (adult $10, youth/senior $5, students free), and the form requires at least one ticket. It fires `cu:form-submit` (`form: 'tickets'`), which Phase 2 logs as the ticket conversion (§3) *(verified — Playwright, 2026-11-06)*.
- 2026-11-06: Boosters: the **Condor Club**, levels Fan $100, Flight Crew $250, Captain $500, Champion $1,000, all in `facts.json`. Gifts go to the Athletics Fund via `/giving/give/?designation=athletics`, and count toward the Connected Circle. That makes Athletics the second donor path (D5) and sets up the proposed Athletics Fund donor segment. Giving's "Athletics Fund" menu link now appears.
- 2026-11-06: Prospective Student-Athletes is a recruiting questionnaire demo form (`form: recruit`; sport, graduation year, school, optional position and highlight-video link). It's `audience: prospect`, so it gets Piper in `auto` mode. `?sport=<team id>` preselects the sport, and team pages link that way.
- 2026-11-06: Renamed a volleyball game note from "Dig Pink" (a real, trademarked charity program) to "Awareness Night".
- 2026-11-06: The Homecoming game is Men's Soccer in October, matching Homecoming & Reunion Weekend on the Alumni pages.

### Process after PR 7
- 2026-11-06: Merged PR #7 at Jesse's request (`3313c03`) and restarted the branch from `main`. Athletics went live about 20 seconds after the merge *(verified — `npm run smoke` 945/945 against the live site, 2026-11-06)*.

### Global pages (PR 8)
- 2026-11-06: Pages:
  - **About:** hub (rewritten, with an at-a-glance facts table), Mission & Values, Leadership, History.
  - **Visit:** hub (rewritten), Campus Tour, Virtual Tour, Directions & Parking.
  - **News:** six more articles; the News page now lists all nine.
  - **Events:** six event pages; the Events page now lists them.
  - **Careers:** expanded.

  The site now has 106 indexable pages.
- 2026-11-06: Founded in **1923** (Jesse), as a teachers college; in `facts.json` as `founded` (a string, so it prints without a thousands separator). History names no other years; it uses "after World War II" and "a century after its founding".
- 2026-11-06: Leadership is invented and pronoun-free: President Dr. Catherine Alvarado-Shaw, Provost Dr. Neil Barrington, and Vice Presidents Dr. Monique Fairbanks (Student Success), Marisa Delgado (Enrollment) and Thomas Reilly-Chen (Advancement). Dr. Andrea Lindqvist is Dean of Continuing Education.
- 2026-11-06: New `events` collection (`content/events/<id>.md` → `/events/<id>/`). Like news, each event carries its own section and audience, so the Homecoming page builds alumni affinity and the certificate info session builds learner affinity. Pages show month and day only. Events: Sustainability Lecture, Fall Open House, Sustainability certificate info session, Giving Day, Admitted Students Day (`sofia-prospect`), Homecoming & Reunion Weekend (`sofia-alumna`).
- 2026-11-06: Every event page has an RSVP demo form (`form: 'rsvp'`, with the event id in the submitted fields). Campus Tour has a visit-request demo form (`form: 'visit'`): visit type, preferred date, guests and program, preselected with `?visit=` and `?program=`. Visit scheduling is a Student Recruitment Agent topic (§5.8), so Phase 2's agent can link straight to it. Tour times are in `facts.json` (`visits`). Both send nothing *(verified — Playwright, 2026-11-06)*.
- 2026-11-06: News adds six stories: Dr. Martinez's water-test research (tagged `environmental-science`), the Sustainability House garden, the award winners returning to teach, tutoring evening hours, the Computer Science energy model and a record year for first-time gifts. That last story is `section: advancement`, `audience: donor`, and sets up Sofia's first-gift story without naming her.
- 2026-11-06: Directions mentions the I-5 and I-605 freeways and the LAX, Long Beach and John Wayne airports *(hypothesis — needs validation; real geography near the campus address)*. It names no transit lines, and the page has no map embed.
- 2026-11-06: About's FAQ answers "Is Connected University a real school?" plainly (no), so Piper's crawl and site search give an honest answer.
- 2026-11-06: The home page now has the `pz-recommended-programs` zone (§5.4), with Environmental Science, Nursing and Business Administration as its default. All four §5.4 zones now exist with default variants: `pz-home-hero`, `pz-recommended-programs`, `pz-giving-cta` and `pz-next-credential`.

### Phase 1 summary (for the retrospective)
- **Delivered:** 8 pull requests (#1–#8), one per section, each merged by Jesse's say-so and auto-deployed from `main`. The site grew from 17 to **106 indexable pages**: every §4 section plus the global pages.
  - **Content model:** pages, programs (8), faculty (4), certificates (6), teams (6), news (9) and events (6).
  - **Forms:** nine demo forms that send nothing. Two of them, Give Now and Tickets, have no payment fields.
  - **Student Portal:** a demo sign-in that shows Sofia's dashboard, built from `content/sofia.json`.
  - **Personalization zones:** all four §5.4 zones exist with default variants.
- **Exit criteria:** all three **met**.
  - "Sitemap generated": 106 pages *(verified — `npm run smoke`, 2026-11-06)*.
  - "Nav mirrors §4": all 60 menu and footer links point to built pages *(verified — script against `dist/`, 2026-11-06)*.
  - "Metadata validated at build": collection schemas, `assertPageMeta`, `reference()` ids, `{{facts}}` tokens and the `sofia.json` catalog checks all fail the build on a bad value *(verified — broken on purpose during the phase)*.
- **Rules added during the phase:**
  - Institution-wide numbers live in `facts.json`, quoted with tokens.
  - A program's own numbers live in its own file (CLAUDE.md updated, Jesse).
  - Dates are evergreen: month and day, with no year.
  - Sofia stays off public pages.
  - No payment fields on any page.
- **Still open for Jesse:**
  - Should CLAUDE.md's numbers rule cover certificate files too?
  - Does May 1 match the deposit deadline in the org?
  - Do the drafted `sofia.json` student values match the org?
  - Keep the Jordan Reyes story that echoes Sofia's?
  - Keep the invented current roles for Wilma Grace and Courtney Tran-Kim?
  - Do any opponent school names match a real school?
- **Tests at the end of the phase:**
  - Smoke: 1,135 checks.
  - Browser suites: global 48, Athletics 62, Continuing Ed 47, Giving 46, Alumni 31, Portal 37, Forms 43, regression 66, all passing locally.
- **Next:** Phase 2 (simulation): event store, affinity engine, inspector drawer, `/data360`, personalization rules for the four zones, identity stitch on the forms and portal sign-in, persona presets, and the Agentforce mock with scripts.

### Process after PR 8
- 2026-11-06: Merged PR #8 at Jesse's request (`55c1386`). The global pages went live about 20 seconds after the merge *(verified — `npm run smoke` 1,135/1,135 against the live site, 2026-11-06)*. **Phase 1 is complete.** Jesse skipped the retrospective.

## Phase 2: Simulation

### How Phase 2 runs
- 2026-11-06: Smaller pull requests (Jesse):
  1. Collection (event store, affinity engine, inspector drawer)
  2. Companion window and presets
  3. Identity stitch
  4. Personalization
  5. Agentforce mock
  6. Wrap-up (tuner, polish, summary)
- 2026-11-06: Review is by demo click-through (Jesse). Each PR's click-through is written the way the team would run the demo, in `docs/demo-guide.md`. Each step gives the click, what the audience sees and a line to say (Jesse's pick). The guide lives in the repo so it changes with the site. It's published as a shareable page once all six story paths exist (Jesse).

### Collection (Phase 2 PR 1)
- 2026-11-06: The simulation lives in `sim/` at the repo root (CLAUDE.md), as plain browser JavaScript: `config.js` (weights and object names), `store.js` (profile), `affinity.js`, `tracker.js`, `views.js` (tab rendering, shared with `/data360` next) and `inspector.js` (drawer). `BaseLayout` loads it after `src/scripts/site.js`; `/demo` and `/data360` don't.
- 2026-11-06: The profile is one object in `localStorage` (`cu_sim_state`): device ID, engagement rows (capped at 300) and affinities. It syncs across tabs with `BroadcastChannel('cu-sim')` (D11), plus the `storage` event, which also catches `/demo` "Reset visitor" *(verified — Playwright: a page view in one tab appears live in another tab's drawer; reset clears an open drawer, 2026-11-06)*. Nothing is saved before the first recorded event, and nothing is recorded without consent `all` and the Simulation switched on *(verified — 2026-11-06)*.
- 2026-11-06: Engagement rows are modeled on `UMA_WebsiteEngagement` (§5.2): page URL, channel action, timestamp, device ID, section, program and topic. Recorded actions:
  - `PAGE_VIEW` on load
  - `CLICK` on calls to action (`[data-cta]`, `.btn` links and buttons)
  - `FORM_START` and `FORM_SUBMIT` from the demo forms' events

  Submit buttons aren't double-counted as clicks. The 30-second dwell bonus updates the page-view row ("engaged 30s") rather than adding a row. Search and the 404 aren't tracked (Phase 0 decision).
- 2026-11-06: Affinities are modeled on `PersonAffinity_std__dlm` (§5.3). Each page maps to up to four categories:
  - **Academic interest:** its program
  - **Interest:** its section. Only for Academics, Admissions, Student Success, Student Portal, Alumni, Giving, Continuing Ed, Athletics and Visit, not Home, News or legal pages.
  - **Topic:** its topic, skipped when it repeats the section or program
  - **Life stage:** its audience

  Weights follow §5.2: page view 1, click 3, form start 2, form submit 5, dwell +1. There's no decay. Labels come from a small build-time catalog in each page (`#cu-sim-catalog`: program titles, certificate and team names).
- 2026-11-06: The Affinities tab groups by type, with academic interest first. Ranked together, the life-stage signal (every page has one) would always come out on top and bury the academic interest the stories key on.
- 2026-11-06: The inspector drawer opens from a blue "Data 360" tab on the right edge or with **Ctrl+Alt+I**. It remembers whether it's open, and which tab, across page loads (per browser tab, `sessionStorage`). Tabs in this PR: Profile (anonymous visitor and device), Engagement and Affinities. Identity and Decisions arrive with their PRs. New rows flash for 2 seconds. Under `.d360` the styles are Lightning-like, not a copy (CLAUDE.md), and the "Simulated" badge follows `/demo`.
- 2026-11-06: On screens 1024px and wider, the open drawer narrows the page instead of covering it, so the presenter can keep clicking sidebar buttons while watching. To keep the header fitting, the menu now collapses by the header's own width (a CSS container query) rather than the window's. A browser test caught the drawer hiding the "At a glance" Request Information button *(verified — Playwright, 2026-11-06)*.
- 2026-11-06: `/demo`: the disabled "Open inspector drawer" button is replaced by instructions (tab or Ctrl+Alt+I), since the drawer lives on site pages, not in `/demo`.
- 2026-11-06: **Identity moments widened (Jesse):** every demo form that collects an email stitches the anonymous visitor to Sofia, not only PLAN.md §5.5's list. The recruiting questionnaire is the exception, since it's for high-school athletes. Each form loads the Sofia life stage that fits:

  | Form | Sofia stage |
  | --- | --- |
  | Request Information, Apply, Campus Tour | prospect |
  | Student Portal sign-in | student |
  | Update Your Info, Give Now, Tickets | alumna/donor |
  | CE Inquiry | learner |
  | Event RSVP | the event's audience: Open House, Admitted Students Day and the lecture → prospect; Homecoming → alumna; Giving Day → donor; certificate info session → learner |

  Tickets mapping to alumna/donor is my call, because Athletics has no Sofia stage *(uncertain — flag for review)*.
- 2026-11-06: In real life a gift is an identity moment too. It becomes a Gift Transaction on a Contact, and Data 360 resolves that Contact to the Unified Individual. The demo org needs the Contact ID on the Gift Transaction for that to work *(verified — edu-cloud-dc-demo skill)*. Whether a live website stitches at the moment of the gift depends on the giving platform sending an identity event with the email; many process the gift first and sync it to CRM later *(hypothesis — needs validation against the giving platform used in a demo)*. If the visitor is already Sofia, a gift is logged as a conversion and changes nothing else. This ships in the identity-stitch release (Phase 2 PR 3). PLAN.md is unchanged; this log records the extension.
- 2026-11-06: The inspector's Profile tab now says the stitch is coming in the identity-stitch release, and that any form with an email or a portal sign-in triggers it.

### Process after Phase 2 PR 1
- 2026-11-06: Merged PR #9 at Jesse's request (`d453d9c`). The collection release went live about 20 seconds after the merge *(verified — `npm run smoke` 1,135/1,135 and the simulation browser suite 40/40 against the live site, 2026-11-06)*.

### Companion window and presets (Phase 2 PR 2)
- 2026-11-06: `content/sofia.json` now has all four life stages (`prospect`, `student`, `alumna`, `learner`). Each has a label, its CRM attributes and the affinities its persona preset seeds.
  - From the demo-org narrative *(verified — edu-cloud-dc-demo skill)*:
    - Prospect: admitted to Environmental Science, not committed, GPA 3.8, SAT 1320, visited twice.
    - Alumna: graduated three years ago; first gift of $500 last year; hasn't been asked to upgrade.
    - Learner: sustainability certificate 18 months ago, not enrolled, still opening emails.
  - Drafts for Jesse to check *(uncertain — flag for review, PLAN.md §8.3)*:
    - Prospect: aid offer of Dean's + Sustainability Leaders scholarships.
    - Alumna: the $500 gift went to the Tutoring & Learning Center (the help she got as a student); water quality specialist at a regional water district; Long Beach.
    - All stages: the SMS opt-ins and every seeded affinity score.
- 2026-11-06: The alumna's class year is worked out in the browser as the current year minus `graduatedYearsAgo` (3), so it never goes stale. Amounts and deadlines are `{{facts}}` tokens.
- 2026-11-06: The build now checks `sofia.json` (`src/lib/sofia-check.js`, from BaseLayout). These must exist on the site or the build fails *(verified — broke a fund and a topic on purpose, 2026-11-06)*: all four stages, every seeded affinity (its program, section, page topic or audience), the alumna's gift funds, the learner's certificate and next-step program, and every token.
- 2026-11-06: Unified Individual IDs are random (`ui_` + 12 hex characters), made when Sofia first becomes known in a browser. The demo org's real Contact and Unified Individual IDs aren't used (CLAUDE.md: no org IDs).
- 2026-11-06: **Become Sofia** (`/demo`) stitches the current visitor at the stage picked. It keeps the device, the anonymous engagement rows (re-attributed to her Unified Individual) and the affinities she earned. It logs the stitch with the number of rows moved. Doing it again with another stage only changes the stage (logged); the Unified Individual stays the same *(verified — Playwright, 2026-11-06)*.
- 2026-11-06: **Persona presets** start over as Sofia at a stage, with that stage's affinities seeded and marked "From earlier engagement". New activity adds to them. Presets don't invent engagement rows. Presets and Become Sofia accept cookies if they haven't been answered, since a presenter is driving.
- 2026-11-06: New **Identity** tab, in the drawer and `/data360`. It shows a Party identification table (device ID, email, Unified Individual, CRM contact) and the identity timeline (device first seen, stitches, stage changes, preset loads). The Profile tab now shows Sofia's attributes for her current stage.
- 2026-11-06: The `/data360` companion shows Profile, Affinities, Engagement and Identity **all at once**, not as tabs. It's meant for a second screen the presenter shouldn't have to touch. It updates live through the same cross-tab sync and only reads the profile; it never records.

### Process after Phase 2 PR 2
- 2026-11-07: Merged PR #10 at Jesse's request (`2db8f7f`). The release went live about 20 seconds after the merge *(verified — `npm run smoke` 1,135/1,135 and the presets/companion suite 35/35 against the live site)*.

### Automatic identity stitch (Phase 2 PR 3)
- 2026-11-07: `sim/stitcher.js` runs the 2026-11-06 identity-moment table. A valid submit of any demo form with an email (except the recruiting questionnaire), or the Student Portal sign-in, stitches the visitor to Sofia at the mapped stage. RSVPs use the event page's audience (alumni, donor and fan → alumna). The tracker registers first, so the form's own FORM_SUBMIT row is recorded before the stitch and gets re-attributed with the rest *(verified — Playwright, 60 checks, each in a fresh browser, 2026-11-07)*.
- 2026-11-07: Every identity resolves to Sofia, whatever email is typed. When the typed email isn't hers, the identity timeline says so ("Email entered: …. In this demo every identity resolves to Sofia Sanders"), rather than pretending. The demo guide tells presenters to type sofia.sanders@demo.com.
- 2026-11-07: Portal: the sign-in is logged as a FORM_SUBMIT row (`portal-sign-in`) and stitches as **student**; "Book an appointment" is a CLICK row (`book-advising`).
- 2026-11-07: Give Now and Tickets also record a **conversion** in the profile (`conversions`: gift amount, frequency and fund, or game and order total). It's shown under "Conversions this visit" in Profile. Phase 2's personalization can use it, for example to thank a donor instead of asking again. A conversion doesn't rewrite Sofia's CRM gift history in `sofia.json`; it's this session's activity.
- 2026-11-07: Nothing stitches without consent `all` and the Simulation on, the same as tracking *(verified — 2026-11-07)*.
- 2026-11-07: **Identity matching switch (Jesse):** `/demo` now has an Identity matching setting (`identityMatching`, URL `?match=typed`).
  - **Always Sofia** (default) keeps the behavior above.
  - **Match typed email**: Sofia's email still opens her profile. Any other email creates a **new contact** (`personId: 'visitor'`, no life stage) from the form's name, email, phone, program, student type, class year, employer, job title, city, interest and SMS opt-in. Free text like messages and tributes isn't kept.

  The new contact has no CRM history, so personalization and the agent must fall back to affinities and typed details for anyone who isn't Sofia (Phase 2 PRs 4–5). The trade-off agreed with Jesse: realism and audience participation, against story beats that only fire for Sofia. That's why the default stays Always Sofia.
- 2026-11-07: In Match typed email, the **first identity wins** in a browser. A later form with the same email adds details ("Identity confirmed"). A different email, even Sofia's, is logged as "Identity unchanged", and Reset visitor is the way to switch people. Real identity resolution would match on more than email, and might merge profiles; this is a simplification *(hypothesis — needs validation against the org's identity resolution rules)*. The Student Portal demo sign-in always signs in as Sofia. Become Sofia and the presets are unchanged.
- 2026-11-07: Whatever a visitor types is stored only in that browser's `localStorage`, inside the simulated profile, until Reset visitor. Nothing leaves the browser *(verified — no network requests from the simulation, Playwright 2026-11-07)*. The demo guide tells presenters so.

### Personalization (Phase 2 PR 4)
- 2026-11-07: **Rules engine** (`sim/personalize.js`). For each zone on the page, the first rule in `content/personalization-rules.json` whose `when` matches picks the variant; no match keeps the default. Conditions: `person` (sofia, visitor, known, anonymous), `stage`, `topAffinity` (any program, any certificate, or one program) with `minScore`, `affinity` (one category key) with `minScore`, and `conversion` (gift, tickets). It re-runs on every profile change, in this tab or another, so presets, stitches and gifts update an open page live *(verified — Playwright, sim4 suite, 72 checks, 2026-11-07)*.
- 2026-11-07: **Rule order.** Known-profile rules come before browsing rules in every zone, so CRM data beats browsing when we have it. A new contact (Match typed email) gets the "Welcome, <name>" hero before the program hero: the name is the payoff of that setting. In the giving band, a gift this visit (thanks) beats Sofia's upgrade ask.
- 2026-11-07: **Thresholds:** top academic interest of 3+ points for the program hero (a page view plus a CTA click, or three views), 1+ for re-ranking programs, 5+ Athletics interest for the athletics hero and band (five Athletics pages), 3+ for a certificate tile. They're demo tuning, picked so a story fires in two or three clicks *(hypothesis — revisit with the affinity tuner in Phase 2 PR 6)*.
- 2026-11-07: **Variants are content files** (`content/variants/<zone>/<id>.md`: eyebrow, heading, body, up to two CTAs). The build renders each one into a `<template>` inside its zone. `{{facts.*}}` tokens are filled at build time; a new `|raw` suffix prints a number without thousands separators, for URLs (`?amount=1000`). `[[token]]` placeholders (first name, top program, last gift and the like) are filled and escaped in the browser from the simulated profile. The served HTML holds no personal data *(verified — sim4 suite checks `/` has no "Sofia")*.
- 2026-11-07: The **admitted** hero names Sofia's own program from `sofia.json` (`[[herProgramTitle]]`), not whatever she browsed most.
- 2026-11-07: `pz-recommended-programs` has one variant, `rank`. The zone renders every program; home shows 3 and program pages show as many as their `related` list, the rest hidden until re-ranked. Order: an optional pin first (Business Administration for Sofia as a learner), then academic-interest score, ties in the default order. A program page never recommends itself.
- 2026-11-07: **Build check** (`src/lib/rules-check.js`, run from BaseLayout): a rule that names an unknown zone, variant file, stage, program, condition, person or conversion fails `npm run build`.
- 2026-11-07: **Decisions log.** Each time a zone's served variant changes on a page (including the first render), a row goes to `state.decisions` (capped at 200): time, zone, rule, variant, reason, signals, programs shown, page and person. Defaults aren't logged. The inspector's new **Decisions** tab and a fifth `/data360` panel show it as `ssot__PersonalizationLog__dlm`, the name from PLAN.md §5.2. Real Salesforce Personalization logs per request; our "log on change" is a simplification to keep the tab readable *(hypothesis — needs validation against the org's personalization log)*.
- 2026-11-07: **"Why am I seeing this?" (Jesse):** a button on each personalized zone, with the rule's reason, the signals it read, the personalization point, rule and variant, and the log time. New setting `showWhy`, on by default, with a `/demo` switch and `?why=0`. "Personalization point" is Salesforce Personalization's term for a placement *(verified — personalization-knowledge skill)*. The button carries the "Simulated" badge, which follows the badge setting.
- 2026-11-07: **Anti-flicker.** With consent and a saved profile, an inline script in `<head>` hides zone content until the engine has picked a variant, for at most 1.5 seconds, so the default hero doesn't flash before Sofia's. How the real Personalization web SDK handles flicker wasn't compared *(uncertain — flag for review)*.
- 2026-11-07: Rule reasons for browsing rules say "the visitor", since the visitor may be anonymous. Sofia's known-profile reasons use she/her.
- 2026-11-07: The home hero's styles moved from scoped to global CSS, because variant markup injected at runtime doesn't carry Astro's scoping attribute.

### Agentforce mock (Phase 2 PR 5)
- 2026-11-07: **The agent isn't tied to Sofia (Jesse, option 1).** Every greeting and intent lists responses with the same `when` conditions as personalization, plus `has` (a [[token]] has a value). The first that fits is used, so the agent answers from whatever the profile holds: Sofia's record, a new contact's typed details, browsing interests, or nothing. Personal questions from someone with no record get an honest answer ("I don't see an application for you yet") instead of Sofia's data *(verified — Playwright agent suite: a new contact and an anonymous visitor never see "Sofia")*.
- 2026-11-07: **Chat is an identity moment (Jesse).** An anonymous visitor who opens the chat is asked for a name and email first, with a Skip link; a personal question later shows the same form in the chat, and an email typed in a message also counts. It goes through the same stitch as the demo forms, as form `agent-chat` ("Agentforce chat" in the Identity timeline), so Identity matching applies. The stage comes from the page's audience, like event registration. Real Agentforce chat on a website can collect these details before the chat starts *(hypothesis — needs validation against the org's chat setup)*.
- 2026-11-07: **Matching:** an intent's score is how many of its `match` patterns hit, plus one if it accepts a program or certificate the message names; ties go to the earlier intent, so "How much does nursing cost?" is a cost question. Program names match on the full title or its first word; "continuing education" isn't the Education program, and "the sustainability certificate" is the certificate.
- 2026-11-07: **Grounded in site content:** a question no intent matches is looked up in `search-index.json` (the site search index) and answered with up to three linked pages. Chat filler words are dropped, and if no page has every word, the pages with the most words win. Only then does the fallback appear. This stands in for Agentforce's knowledge grounding *(uncertain — flag for review: compare with how the org's agent grounds on knowledge)*.
- 2026-11-07: Each question is an `AGENT_INTERACTION` row (the name from PLAN.md §5.8) worth 3 points, the same as a CTA click, to the page's affinities, plus the program or certificate the visitor named. The sign-in is a FORM_SUBMIT row. The weight is demo tuning *(hypothesis — revisit with the affinity tuner)*.
- 2026-11-07: Agent answers show a "Grounded in Data 360" note listing the signals the response used. It follows the `/demo` "Why am I seeing this?" switch, so one switch hides every explanation.
- 2026-11-07: **The transfer credit estimate** is the lower of the credits entered and the transfer limit in `facts.json`, with the GPA minimum and "final credit comes from an official evaluation". It's a stand-in for the Transfer Credit Agent's course-by-course evaluation, not a model of it *(hypothesis — needs validation against the org's Transfer Credit Agent)*.
- 2026-11-07: A conversation is kept per agent in `localStorage` (`cu_sim_chat`), tied to the simulated device, so it follows the presenter between pages and starts over on Reset visitor or a preset. Whether the panel is open is kept per tab. The agent code loads only on pages that show the agent.
- 2026-11-07: Agent copy quotes `facts.json` with `{{facts.*}}` tokens and Sofia's record with [[tokens]] from `sofia.json`; it restates no program numbers. Claims about services (free tutoring, counseling, where Tutoring is, what Career Services and alumni benefits include, that most scholarships are automatic) were checked against the site's own pages. `src/lib/agent-check.js` fails the build on an unknown token, fact, condition or mention, a bad pattern, a response without chips, a list without a catch-all last response, or a link to a page that doesn't exist *(verified — a misspelled token and a dead link each failed the build, 2026-11-07)*.
- 2026-11-07: **Open for Jesse:** PLAN.md review step 5, the agent scripts read-through. The answers are the demo, so their wording should match the talk tracks.
