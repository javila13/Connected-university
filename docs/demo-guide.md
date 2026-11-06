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

**Single screen or two:** on one screen, use the inspector drawer; it stays open as you click between pages, and on a laptop the page narrows to make room for it. A two-screen companion view (`/data360`) comes in the next release.

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
| 7 | Start filling in the form (any name and email), then click **Request Information**. | **Form start** (+2) and **Form submit** (+5) rows. **Admissions** jumps to the top of Interest. | "Form activity is the strongest signal we collect. And this is the moment she tells us who she is: in the next part of the demo, this form stitches everything we just saw to her known profile." |

**Reset between runs:** `/demo` → **Reset visitor**. Open tabs clear automatically.

**If nothing appears:** check that cookies were accepted (the drawer says "Waiting for cookie consent" if not) and that **Simulation** is on in `/demo`.

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
| Companion window and presets | The two-screen `/data360` view; **Become Sofia** and the persona presets, so a story can start mid-journey |
| Identity stitch | Click-paths where a form or the portal sign-in turns the anonymous visitor into Sofia |
| Personalization | The home page, program pages, giving bands and the certificate tile changing based on what she's done, with "Why am I seeing this?" |
| Agentforce mock | The right agent answering on the right pages, grounded in the site and in Sofia's profile |
| Wrap-up | The six complete story paths: Admissions, Student Success, Alumni, Advancement, Continuing Ed and Athletics |
