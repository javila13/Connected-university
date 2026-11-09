# Connected University demo guide

Six story paths for the Connected University demo, one per segment story. Each step says what to click, what the audience sees and a line you can say. Every step was walked in a browser against the site *(verified — Playwright story walk, 2026-11-07)*.

**Live site:** https://connected-university-website-64975a496d17.herokuapp.com

**What's real and what's simulated:** Data 360 tracking, Personalization and Agentforce are simulated in the browser, so the demo is the same every time and needs no org. The site loads no live chat widget: add Qualified (Piper) with the Chrome extension when your story needs it. The inspector uses the object names from our Education Cloud demo org *(verified — edu-cloud-dc-demo skill)*, but it is Lightning-styled, not the real Data 360 screens. Say "simulated" if anyone asks.

---

## Before every demo (2 minutes)

1. Open the demo control panel: go to `/demo` on the site, or press **Ctrl + Alt + D** on any page.
2. **Consent auto-accept** is on by default, so the cookie banner doesn't interrupt the story. Turn it off only if you want to show the banner; nothing is recorded until cookies are accepted.
3. Turn on **Agentforce mock** if your story uses the agent. Chat is off by default. For one tab only, add `?agentforce=1` to a URL instead. Turn on the Piper Chrome extension only if your story uses Piper.
4. Click **Reset visitor**, or the **persona preset** your story starts from. Do it before every run.
5. Check **Simulation** is on. The **"Simulated" badge**, **"Why am I seeing this?"** and the agent's **"Grounded in Data 360" notes** are off by default. Turn on **"Why am I seeing this?"** for any story with a "Why am I seeing this?" step, and the notes if you want the audience to see what the agent's answers are based on. They're separate switches, so you can show one without the other.
6. Go back to the site's home page. You're ready.

**Single screen or two:**
- **One screen:** use the inspector drawer: the blue **Data 360** tab on the right edge, or **Ctrl + Alt + I**. It stays open as you click between pages, and on a laptop the page narrows to make room for it.
- **Two screens:** in `/demo`, click **Open /data360 companion window** and drag it to the second screen. It shows Profile, Affinities, Engagement, Identity and Personalization decisions all at once, and updates live as you click around the site. You never need to touch it.

**Shortcuts:** on some keyboard layouts Ctrl + Alt acts as AltGr; if a shortcut doesn't work, click the blue **Data 360** tab instead *(hypothesis — test on your own laptop before a live demo)*.

---

## Pick a story

| Story | Sofia is… | Segment story | Starts from | Time |
|---|---|---|---|---|
| [1. Admissions](#story-1-admissions) | Admitted, not committed | Priority Yield (2A) | Reset visitor | about 7 min |
| [2. Student Success](#story-2-student-success) | A junior whose early alert is resolved | Early alert, channel switch (3C, 3E) | Reset visitor | about 4 min |
| [3. Alumni](#story-3-alumni) | Three years out | Constituent role: Alumni | Reset visitor | about 4 min |
| [4. Advancement](#story-4-advancement) | A first-time donor nobody has asked to upgrade | Mid-level giving society (6C) | Preset **Sofia · Alumna/Donor** | about 3 min |
| [5. Continuing Ed](#story-5-continuing-ed) | A certificate holder, not enrolled, still engaged | Re-engagement (8C) | Reset visitor | about 4 min |
| [6. Athletics](#story-6-athletics) | A fan who becomes a known alum | Athletics Fund donors (proposed) | Reset visitor | about 4 min |

Times are estimates for a first run with talk track.

---

## Story 1: Admissions

**Sofia is admitted to Environmental Science and hasn't committed: the Priority Yield audience (2A).** The story shows collection, the identity stitch, personalization before and after she's known, and the agent. **Starts from:** Agentforce mock on, **Reset visitor**, home page. Two screens make this one land best.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | On the home page, click the blue **Data 360** tab, then **Profile**. | **Engagement** has one **Page view** row for Home. **Profile** shows **Anonymous visitor**, a device ID and "Unified Individual: Not resolved yet". | "Every visitor starts anonymous, and Data 360 is already collecting engagement against this device." |
| 2 | In the menu, go to **Academics → Degree Programs → Environmental Science**. Stay 30 seconds if you're talking about the program. Open **Affinities**. | New **Page view** rows flash in. **Environmental Science** leads **Academic interest**, with **Academics** (interest) and **Prospective student** (life stage) below. After 30 seconds the page-view row shows **+2 · engaged 30s**. | "Every page carries metadata: the program, the section, the audience. One page view feeds several affinities at once." |
| 3 | Click **Request Information** in the **At a glance** box. Don't submit yet. | A **Click** row worth **+3**, recorded on the program page. | "A click on a call to action is worth more than a page view. She's not just browsing anymore." |
| 4 | Click the **Connected University** logo. | The hero now says **Recommended for you · Your future in Environmental Science starts here**. **Programs to explore** leads with Environmental Science. | "Same home page, but not the generic one. She's still anonymous, and her browsing alone was enough for Personalization to pick a hero for her." |
| 5 | Click **Why am I seeing this?** on the hero. | "Environmental Science is the visitor's top academic interest, with N points (3 or more needed)", the signal it used, the personalization point `pz-home-hero`, the rule and variant, and that the decision was logged. | "Every decision is explainable. Marketers set the rules; Data 360 supplies the signals." |
| 6 | Click **Request Information** in the hero. Fill in **Sofia**, **Sanders**, **sofia.sanders@demo.com** and **First-year student**, then submit. | Environmental Science is already selected. After submit, **Identity** shows **Identity moment: Request Information form** and how many rows now belong to her. **Profile** shows Sofia Sanders, **Prospect: admitted, not committed**: GPA 3.8, SAT 1320, two campus visits, her scholarship offer and the May 1 deposit deadline. | "The moment she identifies herself, the device resolves to a known person, and none of the anonymous history is lost. She's admitted, she has a scholarship offer, and she hasn't committed. She's exactly who the Priority Yield campaign is for." |
| 7 | Click the logo, then **Why am I seeing this?** | **Welcome back, Sofia · Your place in the class is waiting**, with her deposit date and **Submit Your Deposit**. Why: "…so she's in the Priority Yield audience (2A)." | "Same personalization point, now with the Priority Yield message. Known-profile rules come first, so CRM data beats browsing when we have it." |
| 8 | Click the chat bubble (bottom right). Click **My scholarships**, then **What does it cost?** | No sign-in form: the **Student Recruitment Agent** already knows her. "Welcome back, Sofia! Congratulations again on your admission to Environmental Science. Your enrollment deposit is due May 1." Then her Dean's and Sustainability Leaders scholarships, and "Your scholarships cover $20,000 of it each year." | "Same profile, now in a conversation. The agent doesn't guess; it answers from her record." |
| 9 | Open the inspector's **Decisions** tab. | The hero decisions in order (`hero-top-program`, then `hero-admitted`) and the program ranking, on `ssot__PersonalizationLog__dlm`. | "Each decision lands in the personalization log, so you can report on what each visitor saw and why." |

**Type Sofia's email if you can.** Any email works, because the demo resolves every identity to Sofia, but the Identity timeline then says "Email entered: … In this demo every identity resolves to Sofia Sanders". That's honest, but a distraction in front of a customer.

**No form in your story?** `/demo` → **Become Sofia** does the same stitch from the control panel.

---

## Story 2: Student Success

**Sofia is a junior. She withdrew from Organic Chemistry, got an early alert from Dr. Martinez, retook it with tutoring and is back on track (3C, 3E).** **Starts from:** Agentforce mock on, **Reset visitor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Click **Student Portal** in the top bar, then **Sign in as Sofia (demo)**. | Her dashboard: academic progress, her advisor **Dr. Olga Martinez**, upcoming deadlines, this term's courses and the resolved early alert. **Identity** shows **Identity moment: Student Portal sign-in**; **Profile** shows **Student: junior, early alert resolved**. | "Signing in to the portal is an identity moment. Everything she browsed before is now hers." |
| 2 | Click **Book an appointment**. | "Appointment request sent to Dr. Olga Martinez." **Engagement** gets a **Click** row (`book-advising`). | "Self-service actions are engagement too, and they tell us she's acting on the alert." |
| 3 | Click the chat bubble. | The **Student Success Agent**: "Hi Sofia! Your next advising appointment with Dr. Olga Martinez is Tuesday, 2:00 p.m., and spring registration opens November 10." | "The agent starts from what matters to her this week, not a generic menu." |
| 4 | Click **Am I on track?** | "You're in good academic standing with a 3.05 GPA and 74 credits earned, and you're on track to graduate with your class. Your early alert in CHEM 2310 (sophomore fall) is resolved." | "This is the early-alert story with a good ending, told in her own channel." |
| 5 | Click **Find tutoring**. | "The Tutoring & Learning Center helped you get back on track in CHEM 2310. It's free, and it can help with this term's courses too, like CHEM 2320." | "It remembers what worked for her and points her back to it." |
| 6 | Close the chat and click the logo. | **Welcome back, Sofia · Here's what's coming up**, with spring registration on November 10 and a **Student Portal** button. | "Even the public home page stops recruiting her and starts serving her." |

---

## Story 3: Alumni

**Sofia graduated three years ago. She works as a water quality specialist and gave once.** **Starts from:** Agentforce mock on, **Reset visitor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Alumni** in the menu and scroll to the gold band at the bottom. | The generic band: **Help the next Connected U student**. The chat bubble is the **Alumni & Giving Agent**. | "An alum who hasn't told us who she is yet gets the generic ask." |
| 2 | Click **Update Your Info**. Fill in **Sofia**, **Sanders**, **sofia.sanders@demo.com** and a class year (for example 2023), then submit. | "Thanks, Sofia." **Identity** shows **Identity moment: Update Your Info form**; **Profile** shows **Alumna and first-time donor**: water quality specialist, Long Beach, one $500 gift. | "Updating her details is an identity moment. Now her browsing joins her alumni record." |
| 3 | Click the logo. | **Welcome home, Sofia · Once connected, always connected**. | "The home page stops recruiting her and welcomes her home." |
| 4 | Go back to **Alumni** and scroll to the band. | **Thank you, Sofia · Your first gift made a difference. Ready to double it?** | "And now the giving ask is about her. That's where the Advancement story picks up (Story 4)." |
| 5 | Click the chat bubble, then **Update my info**, then **Alumni events**. | "Welcome back, Sofia! Thank you for your $500 gift to the Tutoring & Learning Center." Then "Your record shows you're a water quality specialist at a regional water district, in Long Beach, CA." Then Homecoming & Reunion Weekend, every October. | "The agent knows her record, so 'update my info' starts from what we have." |

---

## Story 4: Advancement

**Sofia is a first-time donor ($500 last year) who hasn't been asked to upgrade: the mid-level giving society audience (6C).** **Starts from:** Agentforce mock on, `/demo` → **Sofia · Alumna/Donor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Alumni** in the menu and scroll to the gold band. | **Thank you, Sofia · Your first gift made a difference. Ready to double it?** It names her $500 gift to the Tutoring & Learning Center and offers **Join with $1,000** or **$84 a Month**. | "Sofia gave once last year. Instead of a generic 'give now', the site thanks her for that gift and invites her into the Connected Circle." |
| 2 | Click **Why am I seeing this?** on the band. | "Known profile: first-time donor ($500 to the Tutoring & Learning Center) who hasn't been asked to upgrade (6C)." | "It's the same audience the email campaign targets, so web and email tell one story." |
| 3 | Click **Join with $1,000**. | Give Now, with $1,000 already filled in. | "One click, with the right amount already there." |
| 4 | Fill in **Sofia**, **Sanders** and **sofia.sanders@demo.com**, then submit. | The thank-you confirmation. No payment is taken; it's a demo form. | |
| 5 | Go to **Giving** in the menu and scroll to the band. | **Thank you, Sofia · Your gift is already at work**: "Thank you for your $1,000 gift to the Connected Fund (greatest need) today." | "Personalization reacts within the same visit. She isn't asked again two minutes after she gave." |
| 6 | Open the inspector's **Profile** tab. | **Conversions this visit:** the $1,000 gift to the Connected Fund (greatest need). | "The gift is a conversion on her profile, right next to her history." |
| 7 | Click the chat bubble. | "Thank you, Sofia! Your $1,000 gift to the Connected Fund (greatest need) is already at work." | "Every channel knows she just gave." |

---

## Story 5: Continuing Ed

**Sofia earned the Professional Certificate in Sustainability 18 months ago, isn't enrolled and still opens Continuing Ed emails (8C).** This story uses the chat as the identity moment. **Starts from:** Agentforce mock on, **Reset visitor**. Two screens help.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Continuing Ed**, then **Certificate Catalog**. | The navy tile shows the default: **Featured certificate · Professional Certificate in Sustainability**. | "An anonymous visitor gets our featured certificate." |
| 2 | Click the chat bubble. Fill in **Sofia**, **Sanders** and **sofia.sanders@demo.com** and click **Start chat**. | The **Student Recruitment Agent** asked for a name and email first. Then "Thanks, Sofia! I found your record." and "Welcome back, Sofia! You earned the Professional Certificate in Sustainability 18 months ago." **Identity** shows **Identity moment: Agentforce chat**. | "Chat is an identity moment too. Her browsing and this conversation now belong to her Unified Individual." |
| 3 | Look at the tile behind the chat; don't reload. | It changed to **Recommended for you, Sofia · Turn your certificate into an MBA**. | "The page changed while we were chatting, because the same profile drives both." |
| 4 | Click **What's my next step?** | Her recommended next step, the online MBA with a Sustainable Business focus, with **Explore the MBA**. With the notes switch on, under it: **Grounded in Data 360: Identity: Sofia Sanders · Life stage: Learner…** | "The answer comes from her profile, and it says which signals it used." |
| 5 | Close the chat and click **Why am I seeing this?** on the tile. | "Known profile: holds the Professional Certificate in Sustainability and isn't enrolled (8C)." | "Her certificate's graduate credits count toward the MBA, so that's the offer, not another certificate." |
| 6 | Click the logo. | **Your next credential is closer than you think**, with **Explore the MBA**. **Programs to explore** leads with Business Administration. | "The whole site now points her to her next step." |

**For an anonymous visitor:** view one certificate page three times (for example **Data Analytics**), then go back to the catalog. The tile features that certificate instead of the default one.

---

## Story 6: Athletics

**A fan browses Athletics, buys tickets and turns out to be Sofia, an alum.** This arc has no segment yet; the proposal is Athletics Fund donors. **Starts from:** Agentforce mock on, **Reset visitor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Athletics**, then **Schedule**, **Teams**, **Men's Basketball** and **Boosters** (any five Athletics pages work). Open **Affinities**. | **Athletics** reaches 5 points under **Interest**. | "Five page views, and Data 360 knows this visitor is an Athletics fan." |
| 2 | Click the logo, then **Why am I seeing this?** | **Go Condors · Catch a game this season**. Why: "Athletics interest of 5 points (5 or more needed)." | "The same home page, now about game day." |
| 3 | Go to **Giving** and scroll to the band. | **Back the Condors · Join the Condor Club**, with levels from the booster club. | "The giving ask follows the interest: the Athletics Fund, not the general fund." |
| 4 | Click the chat bubble, click **Skip**, then **Athletics tickets**. | The **Alumni & Giving Agent**: "Go Condors!…" Then ticket prices: "$10 for adults and $5 for youth and seniors." | "Even before we know who this is, the agent leads with what this visitor cares about." |
| 5 | Close the chat. Go to **Athletics → Teams → Men's Basketball** and click **Get Tickets**. Choose 2 adult tickets, fill in **Sofia**, **Sanders** and **sofia.sanders@demo.com**, then submit. | The next home game is already selected. **Profile** shows **Alumna and first-time donor**, and **Conversions this visit** lists the ticket order ($20). | "Buying tickets is an identity moment. The fan is Sofia, one of our alumni." |
| 6 | Click the logo. | **Welcome home, Sofia**: the alumna hero replaces the athletics one. | "Once we know who she is, her record outranks her browsing, and she's also a Condor Club prospect." |

---

## Reference

### Identity moments: which actions make her known, and as whom

Submitting any of these forms, signing in to the Student Portal, or signing in to the chat stitches the visitor to Sofia at the life stage that fits. If she's already known, the stage changes and the step is logged; she stays the same person.

| Where | Sofia becomes | Story |
|---|---|---|
| Request Information, Apply, Campus Tour request | Prospect: admitted, not committed | 1 |
| Student Portal sign-in (any username, or **Sign in as Sofia**) | Student: junior, early alert resolved | 2 |
| Update Your Info, Give Now, Tickets | Alumna and first-time donor | 3, 4, 6 |
| CE Inquiry | Learner: certificate holder, not enrolled | 5 |
| Event registration | Depends on the event: Open House, Admitted Students Day and the lecture → prospect; Homecoming and Giving Day → alumna; the certificate info session → learner | Any |
| Agentforce chat: the sign-in form, or an email typed in a message | Depends on the page: prospect pages → prospect; Continuing Ed → learner; Student Success → student; Alumni, Giving and Athletics → alumna | 5, or any |

The **recruiting questionnaire** doesn't stitch: it's for high-school athletes, not Sofia. **Give Now** and **Tickets** are also logged as conversions, under **Conversions this visit** in Profile.

### Identity matching: Sofia, or whoever typed

`/demo` → **Identity matching** decides whose profile a form's email opens:

| Setting | What happens | Use it when |
|---|---|---|
| **Always Sofia** (default) | Any email resolves to Sofia, so every story beat works, even with a typo. | Story demos. Leave it here unless you have a reason not to. |
| **Match typed email** | Sofia's email opens her profile. Any other email creates a **new contact** with only what was typed: name, email, phone, program, student type and the like. There's no CRM history, so no application, gift or credential; personalization and the agent work from browsing interests alone. | A net-new inquiry demo, or letting someone in the audience type their own name. |

In **Match typed email**:
- The **first identity wins** in a browser. A later form with a different email (even Sofia's) is logged as "Identity unchanged". To switch people, use **Reset visitor**.
- The same email again adds the new details to the contact.
- The **Student Portal** demo sign-in always signs in as Sofia.
- Whatever someone types stays only in this browser until **Reset visitor**. Nothing is sent anywhere.

For one tab only, add `?match=typed` to a page URL.

### Persona presets: start any story mid-journey

In `/demo` → **Persona presets**, one click starts over as Sofia at a life stage. Her CRM attributes and earlier affinities are loaded (marked "From earlier engagement" in Affinities), and anything she does next adds to them. Presets also accept cookies if needed.

| Preset | Profile shows | Use it for |
|---|---|---|
| **Anonymous** | A new anonymous visitor (same as Reset visitor, but keeps the cookie choice) | Stories 1, 2, 3, 5, 6 |
| **Sofia · Prospect** | Admitted to Environmental Science, not committed; GPA 3.8, SAT 1320, two visits; Dean's and Sustainability Leaders scholarships; deposit due May 1 | Story 1 from step 7 |
| **Sofia · Student** | Junior; GPA 3.05; advisor Dr. Olga Martinez; Organic Chemistry early alert, resolved | Story 2 from step 3 (the portal still shows its sign-in; the chat and home page know her) |
| **Sofia · Alumna/Donor** | Class of three years ago; water quality specialist; one $500 gift to the Tutoring & Learning Center; next ask: Connected Circle at $1,000 | Story 4; Story 3 from step 3 |
| **Sofia · Learner** | Professional Certificate in Sustainability, earned 18 months ago; not enrolled; recommended next step: online MBA, Sustainable Business focus | Story 5 from step 3 |

**Say, when you load a preset:** "Let's skip ahead. Sofia has been in our system for a while, so Data 360 already has her profile and what she's shown interest in."

With a page already open on one screen, loading a preset or doing **Become Sofia** in `/demo` on the other changes the page in place, without a reload.

### Personalization at a glance

Four personalization points; the first matching rule wins. Known-profile rules come before browsing rules. Without consent, or with the Simulation off, every zone shows its default.

| Personalization point | Where | Rules, in order |
|---|---|---|
| `pz-home-hero` | Home page hero | Sofia prospect → **admitted** · student → **student** · alumna → **alumna** · learner → **learner** · a new contact (Match typed email) → **new-contact**, welcomed by name · top academic interest of 3+ points → **program** · Athletics interest of 5+ points → **athletics** |
| `pz-recommended-programs` | Home "Programs to explore"; program pages "You might also like" | Sofia learner → Business Administration first, then by interest · any academic interest → reordered by interest score. Ties keep the default order. A program page never recommends itself. |
| `pz-giving-cta` | Gold band on Alumni and Giving pages | Gave this visit → **thanks** · Sofia alumna → **upgrade** · Athletics interest of 5+ points → **athletics** (Condor Club) |
| `pz-next-credential` | Continuing Ed → Certificate Catalog | Sofia learner → **mba** · top certificate interest of 3+ points → **certificate** |

Each home hero variant also shows its own photo, and the program hero shows a photo of that program. A variant whose photo hasn't been added yet shows the default photo.

The point thresholds above are defaults; the affinity tuner can change them (see below). **"Why am I seeing this?"** is off by default; turn it on in `/demo` when your story uses it, or add `?why=1` to a URL for one tab. Personalized content shows either way, and decisions are still logged.

### The Agentforce agents

**Where each agent appears** (with **Agentforce mock** on, always bottom-right):
- **Student Recruitment Agent:** Admissions, Academics and other prospect pages, and Continuing Ed.
- **Student Success Agent:** Student Success pages and the Student Portal.
- **Alumni & Giving Agent:** Alumni, Giving and Athletics pages.

`/demo` → **Agent persona** forces one agent on every page.

**Who the agent knows:**
- **Anonymous** (skipped the sign-in): general answers, plus suggestions from browsing ("It looks like you've been exploring Nursing").
- **A new contact** (Match typed email): greeted by name, and honest about personal questions: "I don't see an application for you yet. Want to start one?"
- **Sofia:** answers from her record at her life stage.

**Good questions to ask Sofia** (load the preset first):

| Preset · page | Agent | Ask | She hears |
|---|---|---|---|
| Prospect · Admitted Students | Student Recruitment | When is my deposit due? · My scholarships · What does it cost? | Her $400 deposit and May 1 deadline; the Dean's and Sustainability Leaders scholarships; that they cover $20,000 a year |
| Student · Student Portal | Student Success | (greeting) · Am I on track? · My courses · Find tutoring | Her appointment with Dr. Olga Martinez; good standing, 3.05 GPA, 74 credits, early alert resolved; her four courses |
| Alumna/Donor · Alumni | Alumni & Giving | (greeting) · Join the Connected Circle · Update my info | Thanks for her $500 gift; the $1,000 or $84-a-month ask; her job and city |
| Learner · Continuing Ed | Student Recruitment | What's my next step? · Alumni discount | The MBA pathway; her 15% alumni discount |

**Also try:** ask the Student Recruitment Agent about **transfer credit**, then pick a credit count, for an estimate card. Ask something unscripted, like **is there parking on campus**, and it answers from the site's own pages.

The conversation follows you from page to page; **Reset visitor** or a persona preset starts it over. The "Grounded in Data 360" notes are off by default; turn them on in `/demo` or with `?grounding=1`. They appear only on answers chosen from the profile.

### How the scoring works, and the affinity tuner

| Action | Points to each matching affinity (default) |
|---|---|
| Page view | 1 |
| Click on a call to action | 3 |
| Form start | 2 |
| Form submit | 5 |
| 30 seconds engaged on a page | +1 |
| A question to the agent | 3 |

Each page maps to up to four affinities: its program (academic interest), its section (interest, such as Admissions or Giving), its topic (such as a certificate or a team) and its audience (life stage). There's no decay; demos are short.

**Affinity tuner:** `/demo` → **Affinity tuner** changes the points per action and the points each personalization rule needs. Changes are saved in that browser and apply live; a changed value is highlighted, and **Restore tuner defaults** puts them back. New weights apply to new activity; points already earned stay. Lower a threshold to make a story fire in fewer clicks, for example the program hero at 1 point instead of 3. "Why am I seeing this?" always quotes the current threshold.

### If something doesn't look right

- **Nothing in the inspector:** check that cookies were accepted (the drawer says "Waiting for cookie consent" if not) and that **Simulation** is on.
- **No chat bubble:** turn on **Agentforce mock** in `/demo`, or add `?agentforce=1` to the URL.
- **No "Why am I seeing this?" button:** it's off by default; turn it on in `/demo`, or add `?why=1` to the URL.
- **A story step doesn't fire:** start again from **Reset visitor** or the story's preset. Check the affinity tuner hasn't raised a threshold.
- **Piper and the agent overlap:** the Piper Chrome extension may put its bubble in the same corner *(hypothesis — check with the extension before a live demo)*. Turn one off for the part of the story that doesn't need it.
