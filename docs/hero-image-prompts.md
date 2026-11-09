# Connected University hero images: set and prompts

One photo per home-hero variant, so the photo changes along with the headline when personalization kicks in.

**How the swap works:**
- Each hero variant in `content/variants/pz-home-hero/` names its photo (`image: hero/admitted`).
- The program variant uses `hero/program-<program id>`, falling back to `hero/program`.
- When a variant shows, the site loads its photo first and then swaps it in. Anything missing falls back to the default photo, `home-hero`, and with no default the hero shows a soft gradient.
- The **Decisions** tab names the photo each decision used.

**Adding photos:**
- Commit the files to `public/assets/` with the names below. JPG, WebP or PNG all work (`.jpg` is shown).
- `npm run build` prints which of the 16 photos are still missing.
- They go live with the next deploy.

## Specs for every image

- **Shape:** 16:9 landscape, at least 1920 × 1080 (2400 × 1350 is better). Export JPG or WebP, under about 350 KB.
- **Composition:** on a laptop, the white headline card covers roughly the left 60% of the hero. Put the main subject in the **right third**, and keep the left side calm: sky, soft-focus background, open space. On a phone the card covers most of the image, so the photo is mostly atmosphere there.
- **One campus, one look:** the same fictional Southern California campus and the same late-afternoon light in every shot, so the set reads as one school. The school colors, navy and gold, show up only as small accents.
- **Avoid:**
  - readable text, signs, logos or wordmarks (no real universities or brands), including chest scripts on jackets and water bottles and the swoosh-style marks on shoes and socks;
  - split screens or collages: two photos joined into one frame;
  - real landmarks;
  - anyone who looks like a real person;
  - staged stock-photo poses.

  Check hands, eyes and screens for AI glitches before using an image.
- **People:** diverse, candid and generic. Don't make any image read as "this is Sofia": the same heroes appear in the non-Sofia stories.

## Shared style (append to every prompt)

> Documentary-style editorial photograph for a university website hero banner, 16:9 landscape. A fictional modern university campus in Southern California: warm sandstone and glass buildings, palm and jacaranda trees, late-afternoon golden light. Candid, natural moment, diverse people, shallow depth of field. Navy blue and gold appear only as subtle accents. Main subject in the right third of the frame; the left two-thirds is calm and softly out of focus, with room for a headline. No text, no signage, no logos, no watermarks, no real university or brand marks.

For indoor shots (student, learner, the arena and most program labs), drop the "campus in Southern California … palm and jacaranda trees" part and keep the rest.

## Core set: 8 images (one per hero variant)

| File | Hero it backs | Subject (prompt start) |
|---|---|---|
| `home-hero.jpg` | Default: "Connect to Your Future" | A small group of students walking and talking across a sunlit campus quad, backpacks and laptops, a sense of momentum and belonging. |
| `hero/admitted.jpg` | Sofia, admitted: "Your place in the class is waiting" | An admitted first-year student and a parent at an admitted-students event on campus, the student smiling and holding a welcome folder, families and student guides in the soft-focus background. |
| `hero/student.jpg` | Sofia, student: "Here's what's coming up" | A student working with a peer tutor at a library table, chemistry notes and a laptop open (nothing legible), focused but relaxed, evening light through tall windows. |
| `hero/alumna.jpg` | Sofia, alumna: "Once connected, always connected" | Alumni in their late twenties reconnecting at a homecoming weekend on the campus lawn, hugging and laughing, string lights and navy-and-gold bunting behind them, early evening. |
| `hero/learner.jpg` | Sofia, certificate holder: "Your next credential is closer than you think" | A working professional in their thirties taking an online class at home in the evening, laptop showing a video lecture (screen not legible), notebook and a cup of tea, warm lamp light, calm and motivated. |
| `hero/new-contact.jpg` | A new contact: "Let's find your path" | A prospective student and a parent on a guided campus tour, a student tour guide gesturing toward a building, welcoming and curious. |
| `hero/athletics.jpg` | Athletics fan: "Catch a game this season" | Game night in a packed college basketball arena, players in navy and gold uniforms with no logos or readable lettering driving to the basket, crowd cheering, dramatic arena lighting. One continuous photograph, not a split screen or collage. Plain shoes and socks with no brand marks, and a scoreboard with no letters or symbols. |
| `hero/program.jpg` | Top program: "Your future in [program] starts here" (used when a program has no image of its own) | Students working together on a hands-on project in a bright, modern teaching lab, curious and engaged. |

## Optional: one image per program (8 more)

These make the program hero match the program it names, and could later head each program page.

| File | Program | Subject (prompt start) |
|---|---|---|
| `hero/program-environmental-science.jpg` | Environmental Science | Students in waders collecting water samples in a coastal wetland with field kits, tall grasses, light morning haze. |
| `hero/program-nursing.jpg` | Nursing | Nursing students in navy scrubs practicing patient care in a simulation lab with a training manikin, an instructor guiding them. |
| `hero/program-business-administration.jpg` | Business Administration | A diverse student team sharing ideas at a whiteboard in a glass-walled seminar room (whiteboard not legible). |
| `hero/program-computer-science.jpg` | Computer Science | Students pair-programming at large monitors in a collaborative computing lab, screens showing abstract, unreadable code. |
| `hero/program-engineering.jpg` | Engineering | Engineering students assembling a small robotics prototype on a workbench with hand tools and 3D-printed parts. |
| `hero/program-psychology.jpg` | Psychology | A psychology student running a research session with a participant at a table, notebook and tablet, warm and respectful atmosphere. |
| `hero/program-education.jpg` | Education | A student teacher leading a lively elementary classroom activity, children raising their hands, bright classroom. |
| `hero/program-sustainability-studies.jpg` | Sustainability Studies | Students tending a rooftop garden with solar panels behind them, harvesting vegetables, a city skyline soft in the distance. |

## Workflow

1. Generate 3–4 options per prompt, then pick the ones whose light and architecture match each other best.
2. Check hands, faces and screens, and make sure no text or logos crept in.
3. Crop to 16:9 with the subject on the right, then compress (for example with Squoosh) to under about 350 KB.
4. Use an image generator your company approves for customer-facing material.
5. Commit the files to `public/assets/` with the names above and deploy.
