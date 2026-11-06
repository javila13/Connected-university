// Content collections. Content lives in /content (repo root), not src/, so it
// reads as a content model (the Contentful talk track, PLAN.md D2).
// Phase 1 adds programs, news, events and teams collections alongside `pages`.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SECTIONS, AUDIENCES } from './lib/taxonomy.js';

// `about/index.md` -> `about`, `alumni/events.md` -> `alumni/events`.
const idFromPath = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, '').replace(/(^|\/)index$/, '');

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // PLAN.md §5.1 page metadata contract. Missing or unknown values fail the build.
    section: z.enum(SECTIONS as [string, ...string[]]),
    audience: z.enum(AUDIENCES as [string, ...string[]]),
    program: z.string().optional(),
    topic: z.string().optional(),
    personaHook: z.string().optional(),
    /** Optional kicker shown above the page title. */
    eyebrow: z.string().optional(),
  }),
});

export const collections = { pages };
