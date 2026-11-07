# Connected University demo guide

Click-paths for running the Connected University demo. Each step says what to click, what the audience sees and a line you can say. This guide grows with each Phase 2 release; the six story paths (Admissions, Student Success, Alumni, Advancement, Continuing Ed, Athletics) are complete when Phase 2 is.

**Live site:** https://connected-university-website-64975a496d17.herokuapp.com

**What's real and what's simulated:** Data 360 tracking, Personalization and Agentforce are simulated in the browser, so the demo is the same every time and needs no org. Qualified (Piper) is the only live embed. The inspector uses the object names from our Education Cloud demo org *(verified — edu-cloud-dc-demo skill)*, but it is Lightning-styled, not the real Data 360 screens. Say "simulated" if anyone asks.

---

## Before every demo (2 minutes)

1. Open the demo control panel: go to `/demo` on the site, or press **Ctrl + Alt + D** on any page.
2. Turn on **Consent auto-accept**, so the cookie banner doesn't interrupt the story. Without it, accept cookies on the first page; nothing is recorded until you do.
3. Click **Reset visitor**. This starts a fresh anonymous visitor with no history. Do it before every run.
4. Check **Simulation** is on. Turn the **"Simulated" badge** on or off for your audience.
5. Go back to the site's home page. You're ready.

**Shortcuts:** **Ctrl + Alt + I** opens and closes the Data 360 inspector on any page. **Ctrl + Alt + D** opens the control panel. On some keyboard layouts Ctrl + Alt acts as AltGr; if a shortcut doesn't work, click the blue **Data 360** tab on the right edge instead *(hypothesis — test on your own laptop before a live demo)*.

**Single screen or two:**
- **One screen:** use the inspector drawer. It stays open as you click between pages, and on a laptop the page narrows to make room for it.
- **Two screens:** in `/demo`, click **Open /data360 companion window** and drag it to the second screen. It shows Profile, Affinities, Engagement and Identity all at once, and updates live as you click around the site on the main screen. You never need to touch it.

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

The full story click-paths for each stage come with personalization and the agent in the next releases.

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

## Coming in later releases

| Release | Adds to the guide |
|---|---|
| Identity stitch | Forms and the portal sign-in turn the anonymous visitor into Sofia automatically, at the right life stage |
| Personalization | The home page, program pages, giving bands and the certificate tile changing based on what she's done, with "Why am I seeing this?" |
| Agentforce mock | The right agent answering on the right pages, grounded in the site and in Sofia's profile |
| Wrap-up | The six complete story paths: Admissions, Student Success, Alumni, Advancement, Continuing Ed and Athletics |
