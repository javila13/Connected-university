# Connected University — Demo Website Plan

**Status:** v1.1 plan, 2026-11-06. Brainstormed in Claude.ai; executed in Claude Code.
**Owner:** Jesse (Salesforce SE, Higher Ed Marketing Cloud)
**v1.1 change:** Data 360 and Personalization are client-side simulations, not SDK integrations.
**v1.2 change:** Agentforce is also simulated. Qualified (Piper) is the only live embed.

Confidence labels used throughout: *(verified — source)*, *(hypothesis — needs validation)*, *(uncertain — flag for review)*.

---

## 1. Purpose

A rebuild of the Connected University demo site that lets one website carry six Higher Ed demo stories — Admissions, Student Success, Alumni, Advancement, Continuing Education, Athletics — and six product stories:

| Product story | What the site must do | Real or simulated |
|---|---|---|
| Data 360 web tracking | As the visitor clicks, show the data being collected: events accumulating against an anonymous profile, affinities forming, then stitching to a known constituent on an identity event | **Simulated** on the site (client-side state + a Data 360-styled inspector) |
| Salesforce Personalization | The experience adapts to what the visitor has clicked: hero, recommendations, giving CTA swap based on affinities, with a "why am I seeing this" decision explanation | **Simulated** (local rules engine over the same affinity state) |
| Qualified (Piper) | Load the Qualified snippet; be publicly crawlable so Piper builds its knowledge base | Real embed |
| Agentforce | A chat agent that answers from site content and from what the site already knows about the visitor (affinities, Sofia's profile), with scripted conversations per audience | **Simulated** (mock widget; scripted, grounded in the same state) |
| GitHub | Source of truth in a GitHub repo; Heroku auto-deploys from `main` | Real |
| Contentful | Narrative only. Content lives as markdown/JSON in the repo; the talk track is "same content model, friendlier editor" | Narrative |

Why simulate three of them: no org dependency, no SDK spikes, deterministic and repeatable during a live demo, and the audience sees the collection, the decision, and the agent grounding happen on screen instead of waiting for a data stream to refresh or an agent to find its footing. Piper stays real because the Qualified snippet and crawl *are* the demo.

---

## 2. Decisions (locked — do not re-litigate in Claude Code)

| # | Decision | Rationale |
|---|---|---|
| D1 | Host on **Heroku**, GitHub-connected auto-deploy from `main` | Same pattern as the Campaign Deployer; server available later if needed |
| D2 | **Contentful is narrative-only** | No live CMS integration; content as files |
| D3 | **Static site generator + Express static server** (recommended default: Astro, `output: 'static'`) | No SSR needed; markdown content collections map cleanly to a "content model" talk track |
| D4 | **Alumni and Advancement are two nav sections** | Separate audiences, separate segment stories |
| D5 | **Athletics is a full section** (teams, schedule, tickets, boosters) | New arc; doubles as a second donor path |
| D6 | **Widget mode selector in `/demo`: `auto` (default), `piper`, `agentforce`, `both`** | `auto` routes by audience: Piper on public/prospect pages, the Agentforce mock in the Student Portal and on student, alumni, and giving pages — Piper = inbound inquiry, Agentforce = constituent service. `both` keeps the original both-everywhere option, mock in the opposite corner. Only Piper needs a live snippet |
| D7 | **New site is indexable** (no `noindex,nofollow`), ships `robots.txt` + `sitemap.xml` | Required for Piper crawl; current site blocks indexing *(verified — connecteduniversity-mc.org fetch, 2026-11-06)* |
| D8 | **Run a Basic dyno (or higher) for live demos** | Eco dynos sleep after 30 min of inactivity; Basic does not *(verified — Heroku dynos page; Judoscale "Understanding Eco Dyno Hours")* |
| D9 | **Custom domain, TBD** | Heroku ACM gives free SSL on custom domains at every tier incl. Eco *(verified — Heroku changelog, 2024-08-06)*. Pick the final URL **before** the Qualified crawl, now the only domain-keyed dependency (§8) |
| D10 | **Data 360, Personalization, and Agentforce are simulated client-side** | No SDKs, no org dependency; the site owns the whole story. Real DMO/field names and real Agentforce for Education agent names are used in the mocks for credibility *(verified names — edu-cloud-dc-demo skill; Education Cloud docs, April 2026)* |
| D11 | **Simulation state lives in `localStorage` and syncs across tabs via `BroadcastChannel`** | Enables a companion "Data 360 view" window for dual-screen demos |
| D12 | **Three agent personas in v1: Student Recruitment, Student Success, Alumni & Giving** | One per audience group; names match real Agentforce for Education agents (§5.8) |

Open: domain name. Assume a new purchase; connecteduniversity-mc.org is Salesforce-copyrighted and likely owned by the central demo-site team *(uncertain — flag for review)*.

---

## 3. Anchor persona and story alignment

Single persona across the arc: **Sofia Sanders** — Prospect (Environmental Science) → Enrolled student (dropped and retook Organic Chemistry; early alert from Dr. Martinez) → Alumna and first-time $500 donor → Sustainability certificate holder, not re-enrolled *(verified — edu-cloud-dc-demo skill)*.

The existing site already has a Sustainability program page and a homepage award story (Wilma Grace, Courtney Tran-Kim) *(verified — site fetch)*. Keep both; they're Sofia's academic interest and certificate.

| Section | Sofia hook | Segment story it feeds | Web signal the site emits (simulated) |
|---|---|---|---|
| Admissions | Admitted, not committed (2A) | Priority Yield | Program-page views → academic-interest affinity; Request Info form = identity stitch |
| Student Success | At-risk, recovered (3C/3E) | Early alert, channel switch | Portal "login" identifies Sofia → known-user personalization; advising-page views |
| Alumni | Three years out | ConstituentRole = Alumni | Alumni-content affinity; "Update your info" = identity stitch |
| Advancement | First-time donor, upgrade ask (6C) | Mid-level giving society | Giving-page views → donor intent; Give Now = conversion event |
| Continuing Ed | Credentialed, not enrolled, engaged (8C) | Re-engagement | Certificate views → upsell affinity; CE inquiry = identity stitch |
| Athletics | New arc (no segment yet) | TBD — proposed: Athletics Fund donors | Athletics affinity; tickets + boosters = conversion events |

---

## 4. Information architecture

Mirror the current nav structure and visual language, then add. Target ~60–75 pages (Piper demo crawls are typically ~250 pages *(verified — Qualified SE Field Guide via qualified-piper skill; guide carries an AI-generated caveat, confirm with the Qualified team)*).

### Global (mirror)
Home · About (Mission, Leadership, History) · News (index + 6 articles) · Events (index + 6 events) · Visit (Campus Tour, Virtual Tour, Directions) · Contact · Careers · Student Portal (mock login) · Professor Login (inert, mirror only) · Privacy & Cookie Preferences · **/demo** (control panel, `noindex`) · **/data360** (companion inspector window, `noindex`)

### Academics (mirror + add)
Undergraduate · Graduate · Online · Professional Certificates (→ Continuing Ed)
Program pages (8): Environmental Science (BS) · Sustainability Studies · Business Administration · Computer Science · Nursing · Psychology · Engineering · Education
Faculty (4): Dr. Martinez (Chemistry) + 3 others

### Admissions (mirror + add)
Admissions home · Undergraduate · Graduate · Transfer & Transfer Credits (ties to the Transfer Credit Agent story) · International · Affordability (Tuition & Aid, Scholarships) · **Request Information** (form) · **Apply** (form) · **Admitted Students** (deposit, housing, financial-aid deadlines — Sofia 2A) · Visit

### Student Success / Current Students (new)
Hub · Academic Advising · Tutoring & Learning Center · Registrar & Deadlines · Health & Wellness · Career Services · Campus Life (Housing, Dining, Clubs) · **Student Portal dashboard** (mock, renders as Sofia: advisor Dr. Martinez, resolved early alert, Org Chem retake, upcoming deadlines)

### Alumni (new section)
Alumni home · Events & Reunions · Alumni Network & Careers · Spotlights (incl. Wilma Grace, Courtney Tran-Kim) · Benefits · **Update Your Info** (form)

### Advancement / Giving (new section)
Give Now (mock form) · Ways to Give · **Giving Societies** (name a mid-level society — this page is the upgrade ask) · Giving Day · Impact Stories · Planned Giving · Scholarship Funds · Athletics Fund (cross-link)

### Continuing Education (new)
Hub · Certificate Catalog (Sustainability first; + Project Management, Data Analytics, Leadership, Cybersecurity, Nonprofit Management) · Corporate Training · **Return to CU** (alumni re-enrollment path) · CE Inquiry (form)

### Athletics (new section)
Hub · Teams (6–8 team pages) · Schedule · Tickets (mock purchase) · Boosters / Athletics Fund · Athletics News · Facilities · Prospective Student-Athletes (form)

---

## 5. Simulation layer (Data 360 + Personalization)

Vanilla JS, one module (`sim/`), driven by page metadata. Nothing leaves the browser.

### 5.1 Page metadata contract
Every page's frontmatter declares `section`, `audience` (prospect / student / alumni / donor / learner / fan), optional `program`, optional `topic`, optional `personaHook`. The base layout writes these to `<body data-*>`; the simulation reads them, so no per-page code.

### 5.2 Event model (mirrors real DMO shapes)
Events are stored in the shape the audience would see in Data 360, using the org's real object names *(verified — edu-cloud-dc-demo skill)*:

| Simulated object | Modeled on | Fields shown |
|---|---|---|
| Web engagement row | `UMA_WebsiteEngagement` stream | page URL, channel action (`PAGE_VIEW`, `CLICK`, `FORM_SUBMIT`), timestamp, device id, section, program |
| Individual | `UnifiedssotIndividualMcai__dlm` | anonymous device id → Unified Individual id + name once stitched |
| Party identification | identity stitch | device id ↔ email ↔ Contact id |
| Person affinity | `PersonAffinity_std__dlm` | category, score, last updated |
| Personalization log | `ssot__PersonalizationLog__dlm` | zone, rule fired, variant served, reason |

Action weights (tunable in `sim/config.js`): page view 1 · CTA click 3 · form start 2 · form submit 5 · 30 s dwell bonus +1.

### 5.3 Affinity engine
Affinity categories come from metadata: `program` (academic interest), `section`/`topic` (athletics, giving, continuing-ed…), `audience` (life-stage signal). Each event adds its weight to the matching categories. Top affinity and score thresholds drive personalization. Optional decay off by default (demos are short).

### 5.4 Personalization rules
Rules live in `content/personalization-rules.json`; variants are content files. Shape:

```json
{ "zone": "pz-home-hero", "when": { "topAffinity": "environmental-science", "minScore": 3 }, "variant": "hero-env-sci", "reason": "3+ interactions with Environmental Science content" }
```

Rules can also key on known-profile attributes after a stitch (e.g., `applicationDecision: "Accepted"` → admitted-students hero with deposit deadline). First matching rule wins; every zone has a default variant.

Zones (stable DOM ids, always render default content):
- `pz-home-hero` — audience/affinity-based hero
- `pz-recommended-programs` — Home + program pages; re-ranks programs/certificates by affinity
- `pz-giving-cta` — donor-stage CTA on Alumni and Advancement pages
- `pz-next-credential` — CE catalog tile

Each zone gets a **"Why am I seeing this?"** affordance (small icon, hover/click) that shows the rule and reason — the decision-targeting talk track.

### 5.5 Identity stitch
Before: profile card reads "Anonymous visitor · device `dev_…`". On any identity moment the anonymous events merge into Sofia's known profile from `content/sofia.json` (CRM attributes per life stage: application decision, GPA, program, advisor, gift history, credential). Event history is preserved and now attributed to her Unified Individual — the stitch is shown as a timeline step.

Identity moments: Request Information · Student Portal mock login · Alumni Update Your Info · CE Inquiry · `/demo` → Become Sofia.

### 5.6 Data 360 inspector — two presentations, one state
1. **Drawer** on every page (slide-in, keyboard shortcut) for single-screen demos. Tabs: Profile · Engagement (event rows) · Affinities (live bars) · Identity (stitch timeline) · Decisions (personalization log).
2. **Companion window** at `/data360` for dual-screen demos: same tabs, larger, live-updating via `BroadcastChannel` as the visitor clicks in the other window.

Styling: Lightning-styled (SLDS-like tokens) so it reads as the product; a small "Simulated" badge, toggleable from `/demo`. Whether to show the badge in customer demos is Jesse's call *(uncertain — flag for review)*.

### 5.7 Persona presets
`/demo` offers one-click states so each story starts where Sofia is: **Anonymous** · **Sofia — Prospect** (admitted, not committed) · **Sofia — Student** (junior, early alert resolved) · **Sofia — Alumna/Donor** ($500 first gift) · **Sofia — Learner** (certificate 18 months ago). Each loads fixture attributes plus pre-seeded affinities.

### 5.8 Agentforce mock
A chat widget styled like Agentforce embedded messaging, fully client-side. Scripted, not LLM-backed, in v1 — demos need deterministic answers.

- **Agent personas** (three — locked, D12 — named to match real Agentforce for Education agents so they align with what the org would show *(verified names — Education Cloud docs, April 2026, via education-cloud-knowledge skill)*):
  - *Student Recruitment Agent* — public/prospect pages: programs, admissions, affordability, visit scheduling, plus a transfer-credit estimate modeled on the Transfer Credit Agent
  - *Student Success Agent* — Student Portal: advising, course search, deadlines, fees (modeled on the Advising, Course Search, and Student Financials topics)
  - *Alumni & Giving Agent* — alumni and advancement pages: events, giving societies, update-your-info
- **Scripts** in `content/agent-scripts.json`: intents matched by keyword/regex; quick-reply chips so the demo never depends on typing an exact phrase; a fallback; typing indicator with realistic delay; optional `action` per response (navigate, open a form prefilled, render an estimate card).
- **Grounded in site content**: a build-time JSON index of page titles and summaries lets the agent answer "what sustainability programs do you offer" from actual pages, with a source link — the knowledge-article / data-library talk track.
- **Grounded in the simulation**: after a stitch the agent greets Sofia by name and reads `sofia.json` (deposit deadline, advisor, last gift, credential). Agent turns are logged as `AGENT_INTERACTION` events and bump affinities, so the inspector shows chat as part of the same profile — the "Agentforce grounded in Data 360" story.
- **Stretch, not v1**: LLM-backed replies through an Express proxy on Heroku *(hypothesis — needs validation; adds an API key and non-determinism)*.

Widget mode (D6): `auto` routes by `audience`; `both` places the mock in the corner opposite Piper's bubble.

---

## 6. Real embed (Piper) and consent

| Slot | What loads | Notes |
|---|---|---|
| Consent | Cookie banner; sets `cu_consent`; embeds and simulation wait for it | The current site's "Cookie Preferences" link does nothing — make it real |
| Qualified / Piper | Qualified JS snippet | Visitor ID priority: MAP cookies > Qualified cookies > reverse IP; may need custom JS `identify()` *(verified — Qualified SE Field Guide, same caveat)*. Piper's Data 360 connector is roadmap (Q2 FY27 target), so the Piper story and the simulated Data 360 story run side by side |

The Qualified identifier lives in `public/demo-config.js`; it is a public web snippet value, not a secret. Stub mode (a placeholder bubble) when it is missing.

---

## 7. Demo control panel (`/demo`)

Hidden, `noindex`, also reachable by keyboard shortcut. Persists to `localStorage`; URL params override (`?piper=0&agentforce=1`).

- Toggles: Simulation on/off · Widget mode (`auto` / `piper` / `agentforce` / `both`) · Consent auto-accept · "Simulated" badge
- Agent persona override (force a specific agent regardless of page)
- Persona presets (§5.7) · **Become Sofia** · **Reset visitor**
- Open inspector drawer · Open `/data360` companion window
- Affinity tuner (weights, thresholds) for rehearsal
- Config readout (which embed IDs are populated vs. stubbed)

---

## 8. Org-side checklist (Jesse, not Claude Code)

1. **Domain** — purchase; `heroku domains:add`; enable ACM; CNAME to the Heroku DNS target.
2. **Brand assets** — download the logo/typemark/photo assets from the WordPress site into `public/assets/`.
3. **Sofia fixture** — review `content/sofia.json` once drafted; Claude Code seeds it from the demo-org narrative, but the values should match what the org shows if both appear in one demo.
4. **Qualified** — workspace + JS snippet; build Piper's experience; once live, run the crawl; confirm crawler behavior vs. `robots.txt` *(uncertain — flag for review)*.
5. **Agent scripts review** — read `content/agent-scripts.json` once drafted; the answers are the demo, so the wording should sound like the talk tracks.
6. **Contentful talk track** — decide where in each demo the "content model → Contentful" line lands; no build work.

---

## 9. Technical spikes (do first in Claude Code)

- **S1** Piper bubble + mock widget in `both` mode: confirm positioning (opposite corners) and z-index. The mock's position is ours to set; whether Piper's bubble position is configurable *(hypothesis — needs validation)*.
- **S2** Heroku pipeline: Node buildpack runs `npm run build`, Express serves `dist/`, `robots.txt`/`sitemap.xml` served, auto-deploy from `main` works end to end.
- **S3** Cross-window sync: `BroadcastChannel` + `localStorage` keep the drawer and `/data360` in step with no flicker.

---

## 10. Phasing

| Phase | Scope | Exit criteria |
|---|---|---|
| 0 — Scaffold | Repo, Astro + Express, Heroku pipeline, base layout mirroring the WordPress look, consent banner, `/demo` panel, embed slots with stub config | Site deploys from `main`; `/demo` toggles work |
| 1 — Content | All sections in §4; `content/facts.json` as single source of truth; Sofia-aligned specifics; metadata on every page | Sitemap generated; nav mirrors §4; metadata validated at build |
| 2 — Simulation | Affinity engine, event store, inspector drawer, `/data360` companion, personalization rules + zones, identity stitch, persona presets, Agentforce mock + scripts | Each of the six stories can be clicked through with the inspector showing collection → affinity → decision → stitch, and the right agent answering on the right pages |
| 3 — Piper | Spikes S1–S2; real Qualified ID in config; crawl | Piper live on the custom domain; knowledge base built from the crawl |
| 4 — Demo scripts | One 5-minute click-path per section: page behavior → inspector → personalization → outbound action, using the existing talk tracks | Dry run per story; retrospective |

---

## 11. Content rules for generated copy

- Institution facts come only from `content/facts.json` (seed from the current site: 36 undergrad programs, 12 graduate, 50+ online courses, 20 certificates, $5B research budget, 21 libraries / 18M volumes, 55% of students receive scholarships *(verified — site fetch)*). Don't invent new numbers outside it.
- Pick **one** campus address; the current site shows two (Georges, IN and Santa Fe Springs, CA) *(verified — site fetch)*.
- Keep the brand voice: "Connect to Your Future", "More than just an education", Connect to Opportunity / Passion / Community.
- Keep the footer disclaimer: "Connected University is not a real school. This is a demo site for Salesforce demo purposes only."
- No real people, no real PII. Sofia Sanders and Dr. Martinez are the only named persona anchors; invent the rest.

---

## 12. Sources

- connecteduniversity-mc.org (fetched 2026-11-06) — current IA, metadata, institutional facts, legal footer
- `edu-cloud-dc-demo` skill — persona, segment stories, DMO and stream names, org gotchas
- `education-cloud-knowledge` skill (Education Cloud docs, April 2026) — Agentforce for Education agent names and topics used to shape the mock personas
- `qualified-piper` skill (SE Field Guide; AI-generated caveat) — crawl, visitor ID, roadmap
- Heroku: dynos page, changelog 2024-08-06 (ACM on Eco), Judoscale "Understanding Eco Dyno Hours"
