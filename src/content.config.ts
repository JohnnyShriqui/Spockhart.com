import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Work: projects our team led in prior roles. Never name the client.
 * Spockhart client work can be added later with `kind: 'spockhart'`.
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
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).min(1).max(4),
    order: z.number(),
  }),
});


export const collections = { work };
