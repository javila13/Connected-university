# Connected University demo guide

Click-paths for running the Connected University demo. Each step says what to click, what the audience sees and a line you can say. This guide grows with each Phase 2 release; the six story paths (Admissions, Student Success, Alumni, Advancement, Continuing Ed, Athletics) are complete when Phase 2 is.

**Live site:** https://connected-university-website-64975a496d17.herokuapp.com

**What's real and what's simulated:** Data 360 tracking, Personalization and Agentforce are simulated in the browser, so the demo is the same every time and needs no org. Qualified (Piper) is the only live embed. The inspector uses the object names from our Education Cloud demo org *(verified — edu-cloud-dc-demo skill)*, but it is Lightning-styled, not the real Data 360 screens. Say "simulated" if anyone asks.

---

## Before every demo (2 minutes)

1. Open the demo control panel: go to `/demo` on the site, or press **Ctrl + Alt + D** on any page.
2. Turn on **Consent auto-accept**, so the cookie banner doesn't interrupt the story. Without it, accept cookies on the first page; nothing is recorded until you do.
3. Click **Reset visitor**. This starts a fresh anonymous visitor with no history. Do it before every run.
4. Check **Simulation** is on. Turn the **"Simulated" badge** and **"Why am I seeing this?"** on or off for your audience.
5. Go back to the site's home page. You're ready.

**Shortcuts:** **Ctrl + Alt + I** opens and closes the Data 360 inspector on any page. **Ctrl + Alt + D** opens the control panel. On some keyboard layouts Ctrl + Alt acts as AltGr; if a shortcut doesn't work, click the blue **Data 360** tab on the right edge instead *(hypothesis — test on your own laptop before a live demo)*.

**Single screen or two:**
- **One screen:** use the inspector drawer. It stays open as you click between pages, and on a laptop the page narrows to make room for it.
- **Two screens:** in `/demo`, click **Open /data360 companion window** and drag it to the second screen. It shows Profile, Affinities, Engagement, Identity and Personalization decisions all at once, and updates live as you click around the site on the main screen. You never need to touch it.

**Starting mid-journey:** most stories don't start with an anonymous visitor. Use a **persona preset** in `/demo` instead of Reset visitor (see "Persona presets" below).

---

## Click-path 1: Watch an anonymous visitor's profile build

**Story:** the opening of the Admissions story (Sofia as a prospect), or a standalone Data 360 "collection" demo. **Time:** about 3 minutes. **Starts from:** a reset visitor on the home page.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | On the home page, click the blue **Data 360** tab on the right edge. | The inspector opens on **Engagement** with one **Page view** row for Home. | "Every visitor starts anonymous, and Data 360 is already collecting engagement against this device." |
| 2 | Click the **Profile** tab. | **Anonymous visitor** with a device ID like `dev_k3x9…`, and "Unified Individual: Not resolved yet". | "We don't know who this is yet. Everything we collect is attached to this device until she tells us." |
| 3 | Click **Engagement**, then in the menu go to **Academics → Degree Programs → Environmental Science**. | New **Page view** rows flash in as each page loads. | "Each row is a web engagement event, with the page, the action and the time." |
| 4 | Stay on the Environmental Science page for 30 seconds while you talk about the program. | The latest page-view row changes to **+2 · engaged 30s**. | "Time on page counts too. Thirty seconds of real reading is a stronger signal than a click-through." |
| 5 | Click the **Affinities** tab. | **Environmental Science** appears under **Academic interest**, highlighted as the top interest. Below it: **Academics** (interest) and **Prospective student** (life stage). | "Every page carries metadata: the program, the section, the audience. One page view feeds several affinities at once, and Environmental Science is now her top academic interest." |
| 6 | Click **Request Information** in the **At a glance** box. | On the next page, a **Click** row worth **+3** (recorded on the program page) and a page view for Request Information. Environmental Science grows. | "A click on a call to action is worth more than a page view. She's not just browsing anymore." |
| 7 | Fill in the form with **Sofia**, **Sanders** and **sofia.sanders@demo.com**, choose **First-year student**, then click **Request Information**. | **Form start** (+2) and **Form submit** (+5) rows. **Admissions** jumps to the top of Interest. The visitor is now Sofia Sanders (see Click-path 2). | "Form activity is the strongest signal we collect. And this is the moment she tells us who she is." Then continue straight into Click-path 2. |

**Reset between runs:** `/demo` → **Reset visitor**. Open tabs clear automatically.

**If nothing appears:** check that cookies were accepted (the drawer says "Waiting for cookie consent" if not) and that **Simulation** is on in `/demo`.

---

## Click-path 2: The anonymous history becomes Sofia's (identity stitch)

**Story:** follows Click-path 1, or stands alone as the "anonymous to known" moment. **Time:** about 2 minutes. **Starts from:** a reset visitor who has browsed a few pages (do Click-path 1 up to step 6, or visit Environmental Science and Affordability). Two screens make this one land best.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Open the **Identity** tab (drawer) or look at the **Identity** panel (`/data360`). | **Party identification:** a device ID, email "Unknown", Unified Individual "Not resolved yet". The timeline has one step: **Anonymous device first seen**. | "Right now all we have is a device. Everything she's done is attached to it." |
| 2 | Go to **Request Information** (any program page's button, or Admissions → Request Information). Fill in **Sofia**, **Sanders**, **sofia.sanders@demo.com**, choose **First-year student** and submit. | The Identity panel fills in: her email, a Unified Individual ID and **CRM contact: Sofia Sanders**. The timeline adds **Identity moment: Request Information form**, with how many engagement rows now belong to her. | "The moment she identifies herself, Data 360 resolves the device to a known person, and none of the anonymous history is lost. Every page she looked at is now part of her profile." |
| 3 | Open **Profile**. | **Sofia Sanders**, prospect stage: admitted to Environmental Science, not committed yet, GPA 3.8, SAT 1320, two campus visits, her scholarship offer, and the May 1 deposit deadline. | "Now we see the whole picture: what she did on the site, plus what we already knew in CRM. She's admitted, she has a scholarship offer, and she hasn't committed. She's exactly who the Priority Yield campaign is for." |
| 4 | Open **Engagement**, then click any page on the site. | New rows keep arriving, now attributed to Sofia. | "From here on, everything she does is attributed to her, not to an anonymous device." |

**Type Sofia's email if you can.** Any name and email work, because the demo resolves every identity to Sofia, but the timeline then says "Email entered: … In this demo every identity resolves to Sofia Sanders". That's honest, but it's a distraction in front of a customer.

**No form in your story?** `/demo` → **Become Sofia** does the same stitch from the control panel.

---

## Identity moments: which forms make her known, and as whom

Submitting any of these forms (or signing in to the Student Portal) stitches the visitor to Sofia at the life stage that fits the story. If she's already known, the stage changes and the step is logged; she stays the same person.

| Where | Sofia becomes | Story |
|---|---|---|
| Request Information, Apply, Campus Tour request | Prospect: admitted, not committed | Admissions |
| Student Portal sign-in (any username, or **Sign in as Sofia**) | Student: junior, early alert resolved | Student Success |
| Update Your Info, Give Now, Tickets | Alumna and first-time donor | Alumni, Advancement, Athletics |
| CE Inquiry | Learner: certificate holder, not enrolled | Continuing Ed |
| Event registration | Depends on the event: Open House, Admitted Students Day and the lecture → prospect; Homecoming and Giving Day → alumna; the certificate info session → learner | Any |

The **recruiting questionnaire** doesn't stitch: it's for high-school athletes, not Sofia. **Give Now** and **Tickets** are also logged as conversions, and they appear under **Conversions this visit** in Profile.

### Identity matching: Sofia, or whoever typed

`/demo` → **Identity matching** decides whose profile a form's email opens:

| Setting | What happens | Use it when |
|---|---|---|
| **Always Sofia** (default) | Any email resolves to Sofia, so every story beat works, even with a typo. | Story demos. Leave it here unless you have a reason not to. |
| **Match typed email** | Sofia's email opens her profile. Any other email creates a **new contact** with only what was typed: name, email, phone, program, student type and the like. There's no CRM history, so there's no application, gift or credential; personalization and the agent work from browsing interests alone. | A net-new inquiry demo ("a brand-new prospect fills in Request Information"), or letting someone in the audience type their own name. |

Rules worth knowing in **Match typed email**:
- The **first identity wins** in a browser. A later form with a different email (even Sofia's) is logged as "Identity unchanged". To switch people, use **Reset visitor**.
- The same email again adds the new details to the contact.
- The **Student Portal** demo sign-in always signs in as Sofia.
- Whatever someone types stays only in this browser until **Reset visitor**. Nothing is sent anywhere.

For one tab only, add `?match=typed` to a page URL.

---

## Persona presets: start any story mid-journey

In `/demo` → **Persona presets**, one click starts over as Sofia at a life stage. Her CRM attributes and her earlier affinities are loaded (marked "From earlier engagement" in Affinities), and anything she does next adds to them. Presets also accept cookies if needed.

| Preset | Use it for | What the Profile shows |
|---|---|---|
| **Anonymous** | Click-paths 1 and 2 | A new anonymous visitor (same as Reset visitor, but keeps the cookie choice) |
| **Sofia · Prospect** | Admissions (Priority Yield) | Admitted to Environmental Science, not committed; GPA 3.8, SAT 1320, two visits; Dean's and Sustainability Leaders scholarships; deposit due May 1 |
| **Sofia · Student** | Student Success | Junior; GPA 3.05; advisor Dr. Olga Martinez; Organic Chemistry early alert, resolved |
| **Sofia · Alumna/Donor** | Alumni and Advancement | Class of three years ago; water quality specialist; one $500 gift to the Tutoring & Learning Center; next ask: Connected Circle at $1,000 |
| **Sofia · Learner** | Continuing Ed | Professional Certificate in Sustainability, earned 18 months ago; not enrolled; recommended next step: online MBA, Sustainable Business focus |

**Say, when you load a preset:** "Let's skip ahead. Sofia has been in our system for a while now, so Data 360 already has her profile and what she's shown interest in."

Click-paths 4 and 5 below start from presets. The complete story paths, with the agent, come in the next releases.

### How the scoring works (for Q&A)

| Action | Points to each matching affinity |
|---|---|
| Page view | 1 |
| Click on a call to action | 3 |
| Form start | 2 |
| Form submit | 5 |
| 30 seconds engaged on a page | +1 |

Each page maps to up to four affinities: its program (academic interest), its section (interest, such as Admissions or Giving), its topic (such as a certificate or a team) and its audience (life stage). There's no decay; demos are short. The weights will be adjustable in `/demo` later in Phase 2.

---

## Click-path 3: The home page adapts to her (personalization)

**Story:** continues Click-paths 1 and 2 (Admissions), or stands alone as the Personalization demo. **Time:** about 3 minutes. **Starts from:** Click-path 1 up to step 6 (don't submit the form yet), or a reset visitor who has viewed **Environmental Science** and clicked one of its buttons. Two screens make this one land best.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Click the **Connected University** logo to go to the home page. | The hero has changed. It now says **Recommended for you · Your future in Environmental Science starts here**, with **Explore Environmental Science** and **Request Information** buttons. **Programs to explore** lists Environmental Science first. | "Same home page, but it's not the generic one any more. She's still anonymous, and her browsing alone was enough for Personalization to pick a hero for her." |
| 2 | Click **Why am I seeing this?** on the hero. | A panel shows the rule's reason ("Environmental Science is the visitor's top academic interest, with N points"), the signal it used, the personalization point `pz-home-hero`, the rule and the variant, and that the decision was logged. | "Every decision is explainable. Here's the rule, the signal it read from her profile, and the threshold. Marketers set the rules; Data 360 supplies the signals." |
| 3 | Open the inspector's **Decisions** tab (or the **Personalization decisions** panel in `/data360`). | One row for the hero and one for the program list, with the rule, reason and signals, on the object `ssot__PersonalizationLog__dlm`. | "Each decision lands in the personalization log in Data 360, so you can report on what each visitor saw and why." |
| 4 | Click **Request Information** in the hero. Fill in **Sofia**, **Sanders** and **sofia.sanders@demo.com** (Environmental Science is already selected), choose **First-year student** and submit. | The confirmation page. In the inspector, she's now **Sofia Sanders**, prospect. | "The personalized hero just generated an inquiry, with the program already filled in." |
| 5 | Click the logo again. | The hero now says **Welcome back, Sofia · Your place in the class is waiting**, with her deposit deadline and **Submit Your Deposit**. | "Now we know who she is: admitted, not committed. The same personalization point now serves the Priority Yield message." |
| 6 | Click **Why am I seeing this?** | "Known profile: admitted to Environmental Science and not committed yet, so she's in the Priority Yield audience (2A)." Signals: her identity and her life stage. | "Known-profile rules come first, so CRM data beats browsing when we have it." |

**Live updates:** with the home page open on one screen, loading a preset or doing **Become Sofia** in `/demo` on the other changes the hero in place, without a reload.

---

## Click-path 4: The upgrade ask, then a thank you (Advancement)

**Story:** Advancement (Sofia as a first-time donor). **Time:** about 2 minutes. **Starts from:** `/demo` → **Sofia · Alumna/Donor**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to **Alumni** in the menu and scroll to the gold band at the bottom. | **Thank you, Sofia · Your first gift made a difference. Ready to double it?** It names her $500 gift to the Tutoring & Learning Center and offers **Join with $1,000** or **$84 a Month**. | "Sofia gave once last year. She's a first-time donor nobody has asked to upgrade, so instead of a generic 'give now', the site thanks her for that gift and invites her into the Connected Circle." |
| 2 | Click **Why am I seeing this?** on the band. | "Known profile: first-time donor ($500 to the Tutoring & Learning Center) who hasn't been asked to upgrade (6C)." | "It's the same audience the email campaign targets, so web and email tell one story." |
| 3 | Click **Join with $1,000**. | Give Now, with $1,000 already selected. | "One click, with the right amount already filled in." |
| 4 | Fill in **Sofia**, **Sanders** and **sofia.sanders@demo.com** and submit. | The thank-you confirmation. No payment is taken; it's a demo form. | |
| 5 | Go to **Giving** in the menu and scroll to the band. | **Thank you, Sofia · Your gift is already at work**, naming the $1,000 gift she just made, with links to impact stories. | "Personalization reacts within the same visit. She isn't asked again two minutes after she gave." |

---

## Click-path 5: Her next credential (Continuing Ed)

**Story:** Continuing Ed (Sofia as a certificate holder). **Time:** about 2 minutes. **Starts from:** `/demo` → **Sofia · Learner**.

| # | Click | What the audience sees | Say |
|---|---|---|---|
| 1 | Go to the home page. | **Welcome back, Sofia · Your next credential is closer than you think**, with **Explore the MBA**. In **Programs to explore**, Business Administration comes first. | "Sofia earned our sustainability certificate, isn't enrolled, and still opens our emails. The home page points her to her next step." |
| 2 | Go to **Continuing Ed → Certificates**. | The navy tile reads **Recommended for you, Sofia · Turn your certificate into an MBA**. | "Her certificate's graduate credits count toward the MBA, so that's the offer, not another certificate." |
| 3 | Click **Why am I seeing this?** on the tile. | "Known profile: holds the Professional Certificate in Sustainability and isn't enrolled (8C)." | |

**For an anonymous visitor:** view one certificate page three times (for example **Data Analytics**), then go back to **Certificates**. The tile features that certificate instead of the default one.

---

## Personalization at a glance

Four personalization points; the first matching rule wins. Known-profile rules come before browsing rules. Without consent, or with the Simulation off, every zone shows its default.

| Personalization point | Where | Rules, in order |
|---|---|---|
| `pz-home-hero` | Home page hero | Sofia prospect → **admitted** · student → **student** · alumna → **alumna** · learner → **learner** · a new contact (Identity matching: Match typed email) → **new-contact**, welcomed by name · top academic interest of 3+ points → **program** · Athletics interest of 5+ points → **athletics** |
| `pz-recommended-programs` | Home "Programs to explore"; program pages "You might also like" | Sofia learner → Business Administration first, then by interest · any academic interest → reordered by interest score. Ties keep the default order. A program page never recommends itself. |
| `pz-giving-cta` | Gold band on Alumni and Giving pages | Gave this visit → **thanks** · Sofia alumna → **upgrade** · Athletics interest of 5+ points → **athletics** (Condor Club) |
| `pz-next-credential` | Continuing Ed → Certificates | Sofia learner → **mba** · top certificate interest of 3+ points → **certificate** |

**"Why am I seeing this?"** is on by default. Turn it off in `/demo` for a cleaner look, or add `?why=0` to a URL for one tab. Personalized content stays either way, and decisions are still logged.

**Athletics in one minute:** from a reset visitor, view five Athletics pages (the hub, the schedule, two teams and Boosters). The home hero changes to **Catch a game this season**, and the Giving band asks for the Condor Club.

---

## Coming in later releases

| Release | Adds to the guide |
|---|---|
| Agentforce mock | The right agent answering on the right pages, grounded in the site and in Sofia's profile |
| Wrap-up | The six complete story paths: Admissions, Student Success, Alumni, Advancement, Continuing Ed and Athletics |
