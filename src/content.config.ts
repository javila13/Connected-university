// Content collections. Content lives in /content (repo root), not src/, so it
// reads as a content model (the Contentful talk track, PLAN.md D2).
//   pages    content/pages/**     -> /<path>/
//   programs content/programs/*  -> /academics/programs/<id>/
//   faculty  content/faculty/*   -> /academics/faculty/<id>/
//   certificates content/certificates/* -> /continuing-ed/certificates/<id>/
//   teams    content/teams/*     -> /athletics/teams/<id>/
//   news     content/news/*      -> /news/<id>/
//   events   content/events/*    -> /events/<id>/
//   variants content/variants/<zone>/<id>.md  personalization variants (PLAN.md §5.4)
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECTIONS, AUDIENCES } from './lib/taxonomy.js';
import facts from '../content/facts.json';

// `about/index.md` -> `about`, `alumni/events.md` -> `alumni/events`.
const idFromPath = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, '').replace(/(^|\/)index$/, '');

const tuple = (values: string[]) => values as [string, ...string[]];

// PLAN.md §5.1 page metadata contract. Missing or unknown values fail the build.
const meta = {
  section: z.enum(tuple(SECTIONS)),
  audience: z.enum(tuple(AUDIENCES)),
  topic: z.string().optional(),
  personaHook: z.string().optional(),
};

const faqs = z.array(z.object({ q: z.string(), a: z.string() })).optional();
const course = z.object({ code: z.string(), title: z.string() });
const school = z.enum(tuple(facts.schools.map((s) => s.id)));

export const LEVELS = ['undergraduate', 'graduate'] as const;
export const FORMATS = ['on-campus', 'online', 'hybrid'] as const;

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ...meta,
    program: z.string().optional(),
    /** Optional kicker shown above the page title. */
    eyebrow: z.string().optional(),
    faqs,
    /** Renders program cards after the copy: every program, or those with a credential at that level or format. */
    listPrograms: z.enum(['all', 'undergraduate', 'graduate', 'online']).optional(),
    listHeading: z.string().optional(),
    listGroupBySchool: z.boolean().optional(),
    /** Renders the faculty directory after the copy. */
    listFaculty: z.boolean().optional(),
    /** Renders the Continuing Ed certificate cards after the copy. */
    listCertificates: z.boolean().optional(),
    /** Renders the pz-next-credential personalization zone after the copy. */
    nextCredential: z.boolean().optional(),
    /** Renders team cards (athletics). */
    listTeams: z.boolean().optional(),
    /** Renders every team's schedule as one table, by date. */
    listSchedule: z.boolean().optional(),
    /** Renders news cards: every article, or one category. */
    listNews: z.enum(['all', 'athletics', 'campus', 'research', 'alumni']).optional(),
    /** Renders event cards, soonest first. */
    listEvents: z.boolean().optional(),
    /** Renders a demo form after the copy. */
    form: z.enum(['request-info', 'apply', 'update-info', 'give', 'ce-inquiry', 'tickets', 'recruit', 'visit']).optional(),
    /** Renders the pz-giving-cta personalization zone at the foot of the page. */
    givingCta: z.boolean().optional(),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/programs', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ...meta,
    // `program` is not declared here: a program page's program is its own id.
    school,
    credentials: z
      .array(
        z.object({
          name: z.string(),
          short: z.string(),
          level: z.enum(LEVELS),
          formats: z.array(z.enum(FORMATS)).min(1),
          credits: z.number().int().positive(),
          duration: z.string(),
        }),
      )
      .min(1),
    startTerms: z.array(z.string()).min(1),
    courses: z.array(course).min(1),
    careers: z.array(z.string()).min(1),
    faculty: z.array(reference('faculty')).default([]),
    related: z.array(reference('programs')).default([]),
    /** A Continuing Ed certificate to point to; shown only once that page exists. */
    certificate: z.object({ label: z.string(), href: z.string() }).optional(),
    faqs,
  }),
});

const faculty = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/faculty', generateId: idFromPath }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    description: z.string(),
    ...meta,
    program: z.string().optional(),
    department: z.string(),
    school,
    programs: z.array(reference('programs')).default([]),
    courses: z.array(course).default([]),
    research: z.array(z.string()).default([]),
    office: z.string(),
    officeHours: z.string(),
    advises: z.string().optional(),
  }),
});

// Continuing Ed certificates. Like a program, a certificate's own numbers
// (credits, price, length) live in its frontmatter. body[data-topic] is the
// certificate's id, which the Phase 2 affinity engine reads (PLAN.md §5.3).
const certificates = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/certificates', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    /** Short name for cards and menus, e.g. "Sustainability". */
    shortTitle: z.string(),
    description: z.string(),
    ...meta,
    formats: z.array(z.enum(FORMATS)).min(1),
    credits: z.number().int().positive(),
    length: z.string(),
    /** Total tuition in dollars; the alumni price is worked out from facts.alumni.ceDiscountPercent. */
    price: z.number().int().positive(),
    startTerms: z.array(z.string()).min(1),
    courses: z.array(course).min(1),
    outcomes: z.array(z.string()).min(1),
    director: reference('faculty').optional(),
    /** The degree its credits count toward. */
    pathway: z
      .object({ program: reference('programs'), credential: z.string(), focus: z.string().optional() })
      .optional(),
    /** The default certificate in the pz-next-credential zone. Exactly one should be featured. */
    featured: z.boolean().optional(),
    faqs,
  }),
});

// Athletics teams. body[data-topic] is the team's id (PLAN.md §3 Athletics:
// "athletics affinity"). Game dates are full ISO dates for sorting; pages
// show month and day only, so the site doesn't look stale between seasons.
const teams = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/teams', generateId: idFromPath }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    ...meta,
    season: z.enum(['Fall', 'Winter', 'Spring']),
    venue: z.string(),
    headCoach: z.string(),
    highlights: z.array(z.string()).default([]),
    schedule: z
      .array(z.object({ date: z.coerce.date(), opponent: z.string(), home: z.boolean(), time: z.string(), note: z.string().optional() }))
      .min(1),
    faqs,
  }),
});

// News articles. Dates are full ISO dates for sorting; pages show month and day.
const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/news', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ...meta,
    program: z.string().optional(),
    date: z.coerce.date(),
    category: z.enum(['athletics', 'campus', 'research', 'alumni']),
    team: reference('teams').optional(),
  }),
});

// Events. Each event carries its own section and audience, so an alumni
// event builds alumni affinity in Phase 2. Dates are full ISO dates for
// sorting; pages show month and day only.
const events = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/events', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ...meta,
    program: z.string().optional(),
    date: z.coerce.date(),
    /** Display text, e.g. "Friday through Sunday" or "6:00–7:30 p.m." */
    time: z.string(),
    location: z.string(),
    category: z.enum(['Admissions', 'Alumni', 'Academic', 'Continuing Ed', 'Giving']),
    faqs,
  }),
});

// Personalization variants (PLAN.md §5.4). Rules in
// content/personalization-rules.json pick one per zone; every zone also has
// its default, which is the page's own markup. [[token]] placeholders are
// filled in the browser from the visitor's profile, so no personal data is in
// the page; {{facts.*}} tokens are filled at build time.
const variants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/variants', generateId: idFromPath }),
  schema: z.object({
    zone: z.enum(['pz-home-hero', 'pz-giving-cta', 'pz-next-credential']),
    eyebrow: z.string().optional(),
    // Home hero only: a photo in public/assets/hero/ ("hero/admitted"), and a fallback.
    // The program variant names "hero/program-[[programId]]" with "hero/program" as the fallback.
    image: z.string().regex(/^hero\/[a-z0-9-]*(?:\[\[programId\]\])?[a-z0-9-]*$/).optional(),
    imageFallback: z.string().regex(/^hero\/[a-z0-9-]+$/).optional(),
    heading: z.string(),
    body: z.string(),
    ctas: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          style: z.enum(['gold', 'navy', 'ghost']).default('gold'),
          cta: z.string().optional(),
        }),
      )
      .max(2),
  }),
});

export const collections = { pages, programs, faculty, certificates, teams, news, events, variants };
