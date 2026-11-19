import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Work: projects our team led in prior roles (never name the client), and Spockhart engagements
 * (`kind: 'spockhart'`), which are named, with the client's logo, and lead the page.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    client: z.string(),
    sector: z.string(),
    scope: z.string(),
    kind: z.enum(['team-experience', 'spockhart']).default('team-experience'),
    /** 'in-development': the project itself is still being built (by the client), and is labelled that way. */
    status: z.enum(['complete', 'in-development']).default('complete'),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).min(1).max(5),
    order: z.number(),
    /** The marker above the case study: when or where the work was done */
    origin: z.string().default('Before Spockhart'),
    /** Spockhart engagements: where the client is, and the project's own name */
    location: z.string().optional(),
    project: z.string().optional(),
  }),
});


export const collections = { work };
