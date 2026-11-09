# Connected University team guide

<!-- Team edition. Source for the team's shareable page: node scripts/guide-page.mjs --team <out.html>.
     Each "include:" comment line below pulls the named section's text from docs/demo-guide.md
     when the page is built, with the confidence markers removed, so the stories and the
     reference stay in one place. Edit those sections in docs/demo-guide.md, not here. -->

Everything you need to run the Connected University demo: where it lives, what's real and what's simulated, the control panel, and click-by-click story paths with what the audience sees and what to say.

## Live site

**https://connected-university-website-64975a496d17.herokuapp.com**

- Use **Google Chrome on a laptop**. The Piper Chrome extension needs Chrome, and the site is tested in Chrome.
- Nothing to install and no login. Everything the demo records stays in your browser.
- Open the site a few minutes before your demo, so the first page loads quickly.
- The control panel is at **/demo** on the same site, or press **Ctrl + Alt + D** on any page.
- Using Piper? Turn on the Piper Chrome extension before you start.
- Connected University is a fictitious school; every page says so in its footer.

## What's real, what's simulated

Data 360, Salesforce Personalization and Agentforce are simulated in the browser, so the demo runs the same way every time and needs no Salesforce org. Piper is the one real product, and it comes from a Chrome extension, not from the site. If anyone asks, say the Salesforce pieces are simulated.

| Product | On this site | What you can reliably demo |
|---|---|---|
| **Data 360** | Simulated in the browser. The inspector uses the object names from our Education Cloud demo org, styled like Lightning. | Anonymous web engagement (page views, clicks, form starts and submits, 30 seconds on a page, chat questions) · affinity scores by program, section, topic and life stage · identity resolution from forms, the Student Portal sign-in and chat, keeping the anonymous history · a unified profile with Sofia's CRM attributes at four life stages · the personalization decision log · a live second-screen view at /data360 |
| **Salesforce Personalization** | Simulated with a rules engine on the page. | Four personalization points: home hero, program recommendations, the giving band, the certificates tile · rules for anonymous visitors (from browsing) and known people (from CRM data) · changes in real time, without a reload · "Why am I seeing this?" on every personalized zone · thresholds you can tune live |
| **Agentforce** | Simulated: three scripted agents (Student Recruitment, Student Success, Alumni & Giving). Not an LLM, so answers are the same every time. | Answers from the visitor's profile: Sofia's record, a new contact's form details, or browsing interests · answers from the site's own pages, with links · chat sign-in as an identity moment · quick replies, buttons that prefill forms, a transfer credit estimate · every question added to the profile |
| **Qualified Piper** | Real, added by the Chrome extension. The site doesn't load it. | Whatever your Piper setup shows. The site is public and crawlable for it. Run through it with the extension before a live demo. |
| **Education Cloud data** | Simulated: Sofia's records live in a file and show in the inspector's Profile tab. | Sofia as an admitted prospect, a current student, an alumna and first-time donor, and a certificate holder |
| **Forms** | Demo forms that send nothing. Give Now and Tickets take no payment. | Request Information, Apply, Campus Tour, Update Your Info, Give Now, Tickets, CE Inquiry and event registration, each one an identity moment |

## Control panel

Open **/demo**, or press **Ctrl + Alt + D** on any page. Settings are saved in your browser and change open site tabs right away. **Restore defaults** resets them.

| Control | What it does |
|---|---|
| **Simulation** | Turns Data 360 tracking, personalization and the Agentforce agents on or off. |
| **Agentforce mock** | Shows the chat agent, bottom right, on every page. Off by default. Each page gets the agent for its audience. |
| **Agent persona** | Forces one agent on every page instead of matching the page. |
| **Consent auto-accept** | Accepts cookies for you, so the banner doesn't interrupt the story. Nothing is recorded until cookies are accepted. |
| **"Simulated" badge** | Shows or hides the "Simulated" label on the inspector, the agent and "Why am I seeing this?". |
| **"Why am I seeing this?"** | Shows or hides the explanation button on each personalized zone. |
| **"Grounded in Data 360" notes** | Shows or hides the notes under the agent's answers that list the profile signals it used. |
| **Agent routing preview** | Shows which agent each kind of page gets with the current settings. |
| **Reset visitor** | Starts a fresh anonymous visitor: clears the profile, the chat and the cookie choice. Settings are kept. |
| **Clear consent only** | Clears the cookie choice but keeps the profile. |
| **Identity matching** | **Always Sofia** (default): any email opens Sofia's profile. **Match typed email**: any other email creates a new contact. |
| **Become Sofia** | Turns the current visitor into Sofia at the life stage you pick, keeping what they've done so far. |
| **Persona presets** | Starts over as Sofia at a life stage, with her history loaded, so a story can start mid-journey. |
| **Open /data360 companion window** | Opens the full inspector for a second screen. It updates live as you click around the site. |
| **Affinity tuner** | Changes the points each action earns and the points each personalization rule needs. **Restore tuner defaults** puts them back. |
| **URL overrides** | Settings added to a page address apply to that browser tab only (list below). **Clear URL overrides** removes them. |

**Shortcuts:** **Ctrl + Alt + D** opens the control panel; **Ctrl + Alt + I** opens and closes the Data 360 inspector. If a shortcut doesn't work on your keyboard, click the blue **Data 360** tab on the right edge of the page instead.

**URL options for one tab:** `?agentforce=1` shows the agent · `?agent=student-success` forces an agent · `?sim=0` turns the simulation off · `?badge=0` hides the "Simulated" badge · `?autoconsent=1` accepts cookies · `?match=typed` matches typed emails · `?why=0` hides "Why am I seeing this?" · `?grounding=0` hides the agent's notes.

## Before every demo

<!-- include: ## Before every demo (2 minutes) -->

**If something doesn't look right:**

<!-- include: ### If something doesn't look right -->

## Demo instructions

### Sofia guided stories

Sofia Sanders is our persona across the student lifecycle. Each story starts from **Reset visitor** or a persona preset, and Sofia shows up in the CRM record when she identifies herself.

<!-- include: ## Pick a story -->

#### Story 1: Admissions
<!-- include: ## Story 1: Admissions -->

#### Story 2: Student Success
<!-- include: ## Story 2: Student Success -->

#### Story 3: Alumni
<!-- include: ## Story 3: Alumni -->

#### Story 4: Advancement
<!-- include: ## Story 4: Advancement -->

#### Story 5: Continuing Ed
<!-- include: ## Story 5: Continuing Ed -->

#### Story 6: Athletics
<!-- include: ## Story 6: Athletics -->

### Non-Sofia guided stories

Stories that show one product capability, without Sofia's record. Use them for a short feature demo, or when someone in the audience wants to be the visitor.

| Story | Shows | Starts from | Time |
|---|---|---|---|
| [A. Anonymous visitor](#story-a-anonymous-visitor) | Data 360 collection and Personalization for someone who never fills in a form | Reset visitor | about 3 min |
| [B. Brand-new prospect](#story-b-brand-new-prospect) | Identity resolution creating a new contact, then personalization and the agent with no CRM history | Identity matching: Match typed email, then Reset visitor | about 4 min |
| [C. Ask the agent](#story-c-ask-the-agent) | Agentforce answers for an anonymous visitor, from the site's own pages | Reset visitor, Admissions page | about 4 min |
| [D. Fan to booster](#story-d-fan-to-booster) | Interest from browsing driving the giving ask and the agent | Reset visitor | about 3 min |
| [E. Tune a rule](#story-e-tune-a-rule) | Changing a personalization rule's threshold live | Reset visitor, with /demo open beside the site | about 2 min |

#### Story A: Anonymous visitor

**Most visitors never fill in a form. This story shows what Data 360 and Personalization do for them.** **Starts from:** **Reset visitor**, home page.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | On the home page, click the blue **Data 360** tab, then **Profile**. | **Anonymous visitor**, with a device ID and "Unified Individual: Not resolved yet". | "Most of our visitors never tell us who they are. Let's see what we can still do for them." |
| 2 | Go to **Academics → Degree Programs → Nursing**. Click **Request Information** in the **At a glance** box, but don't submit. | A **Page view** row for Nursing, then a **Click** row worth **+3**, recorded on the Nursing page. | "A program page and a click on a call to action: two strong signals of interest." |
| 3 | Click the **Connected University** logo. | The hero says **Recommended for you · Your future in Nursing starts here**. **Programs to explore** shows Nursing, Environmental Science and Business Administration, in that order. | "The home page adapts to an anonymous visitor in real time, from first-party behavior." |
| 4 | Click **Why am I seeing this?** on the hero, then on **Programs to explore**. | "Nursing is the visitor's top academic interest, with 4 points (3 or more needed)." Then "Programs reordered by academic interest. Nursing leads with 4 points." | "Every decision is explainable: the rule, the signal and the threshold." |
| 5 | Go to **Academics → Degree Programs → Psychology** and scroll to **You might also like**. | Nursing comes first. | "Recommendations follow the visitor across the site." |
| 6 | Open the inspector's **Decisions** tab. | Decisions for the hero and the program lists, on the home page and on Psychology. | "Each decision is logged, so you can report on what visitors saw and why." |

#### Story B: Brand-new prospect

**A prospect we've never heard of fills in Request Information. Data 360 finds no match and creates a new contact.** Use a name from the audience, or make one up. **Starts from:** in /demo, set **Identity matching** to **Match typed email**, turn on **Agentforce mock**, then **Reset visitor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Admissions → Request Information**. Fill in a first and last name, an email that isn't Sofia's, **First-year student** and **Nursing**, then submit. | The confirmation thanks them by first name. **Identity** shows **Identity moment: Request Information form** and "No existing record matched … so a new contact and Unified Individual were created". **Profile** shows the new contact with what was typed. | "A brand-new inquiry. There was no match, so Data 360 created a new contact, and kept everything they'd browsed." |
| 2 | Click the logo, then **Why am I seeing this?** | **Welcome, [first name] · Let's find your path**. Why: "Known contact with no CRM history yet: welcomed by name, with next steps for a new inquiry." | "We know their name, not a history, and the page doesn't pretend otherwise." |
| 3 | Click the chat bubble, then **How do I apply?** | No sign-in form: "Hi [first name]! I'm the Student Recruitment Agent…". Then "Glad you're interested in Nursing, [first name]… I don't see an application for you yet. Want to start one?", with a **Start your application** button that fills in Nursing. | "The agent uses what they told us on the form." |
| 4 | Type **When is my deposit due?** | "I don't see an admission decision for you yet, [first name], so there's no deposit due." | "With no record, the agent says so instead of guessing." |

**Afterwards:** set **Identity matching** back to **Always Sofia** and click **Reset visitor**. What someone types stays only in your browser until you reset.

#### Story C: Ask the agent

**Agentforce answering an anonymous visitor from the site's own content.** **Starts from:** **Agentforce mock** on, **Reset visitor**, then go to **Admissions**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Click the chat bubble, then **Skip**. | The **Student Recruitment Agent** asked for a name and email first. After Skip: "Hi! I'm the Student Recruitment Agent…" with quick replies. | "The agent can ask who you are up front, but it helps anonymous visitors too." |
| 2 | Click **Find a program**, then **Nursing**. | "We offer 36 undergraduate and 12 graduate programs…", then a short description of Nursing with **Explore Nursing** and **Request information** buttons. | "Answers link straight to the page and a form that's already filled in." |
| 3 | Click **What does it cost?** | Tuition of $47,850 a year, fees, housing and meals, graduate cost per credit, and that 55% of students receive scholarships. | "The same numbers as the website, every time." |
| 4 | Type **transfer credit**, then click **60 credits**. | The transfer rules, then an estimate card: **Up to 60 credits**. | "A quick, useful estimate in the conversation." |
| 5 | Type **is there parking on campus**. | "Here's what I found on our site:" with linked pages. | "There's no scripted answer for that, so it grounds itself in our own pages instead of making something up." |
| 6 | Click **Talk to a person**. | The admissions phone number, with **Request information** and **Contact us**. | "And a clear handoff to a person." |
| 7 | Close the chat. Open the inspector's **Engagement** tab, then **Affinities**. | An **Agent chat** row for every question. **Nursing** now shows under **Academic interest**, from the chat alone. | "Chat is engagement too. It feeds the same profile that drives personalization." |

#### Story D: Fan to booster

**An anonymous Athletics fan gets a giving ask that matches their interest.** **Starts from:** **Agentforce mock** on, **Reset visitor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Athletics**, then **Schedule**, **Teams**, **Men's Basketball** and **Boosters**. Open **Affinities**. | **Athletics** reaches 5 points under **Interest**. | "Five page views, and Data 360 knows this visitor is a fan." |
| 2 | Click the logo. | **Go Condors · Catch a game this season**. | "The home page is now about game day." |
| 3 | Go to **Giving**, scroll to the gold band and click **Why am I seeing this?** | **Back the Condors · Join the Condor Club**: "Condor Club levels start at $100 a year." Why: "Athletics interest of 5 points (5 or more needed), so the ask is the Athletics Fund." | "The giving ask follows the interest: the Athletics Fund, not the general fund." |
| 4 | Click the chat bubble, **Skip**, then **Condor Club**. | "Go Condors!…" Then "The Condor Club supports scholarships, travel, equipment and sports medicine for every Condors team. Levels start at $100 a year." | "The agent leads with what this visitor cares about, before we know who they are." |

#### Story E: Tune a rule

**Personalization rules are configurable. This story changes one live.** **Starts from:** **Reset visitor**, with the site and **/demo** open side by side.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | On the site, go to **Academics → Degree Programs → Nursing**, then click the logo. | The default hero: one page view gives Nursing 1 point, and the program hero needs 3. | "One page view isn't enough for this rule yet." |
| 2 | In /demo, under **Affinity tuner → Points a rule needs**, set **Home hero: program** to **1**, then click elsewhere. | The site switches to **Your future in Nursing starts here** without a reload. The changed row is highlighted in /demo. | "Marketers decide how much signal a rule needs. Change it, and the site follows." |
| 3 | On the site, click **Why am I seeing this?** | "…with 1 point (1 or more needed)." | "The explanation always quotes the current rule." |
| 4 | In /demo, click **Restore tuner defaults**. | The hero goes back to the default. | |

## For your information

### Identity moments and identity matching

<!-- include: ### Identity moments: which actions make her known, and as whom -->

<!-- include: ### Identity matching: Sofia, or whoever typed -->

### Persona presets

<!-- include: ### Persona presets: start any story mid-journey -->

### Personalization at a glance

<!-- include: ### Personalization at a glance -->

### How the scoring works, and the affinity tuner

<!-- include: ### How the scoring works, and the affinity tuner -->

### The Agentforce agents

<!-- include: ### The Agentforce agents -->
