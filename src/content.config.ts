// Content collections. Content lives in /content (repo root), not src/, so it
// reads as a content model (the Contentful talk track, PLAN.md D2).
//   pages    content/pages/**     -> /<path>/
//   programs content/programs/*  -> /academics/programs/<id>/
//   faculty  content/faculty/*   -> /academics/faculty/<id>/
// News, events and teams collections arrive with their sections.
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

export const collections = { pages, programs, faculty };
