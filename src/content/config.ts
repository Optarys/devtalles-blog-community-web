// src/content/config.ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),          // acepta string y lo convierte a Date
        tags: z.array(z.string()).default([]),
        cover: z.string().optional(),
        excerpt: z.string().optional(),
        published: z.boolean().default(true),
    }),
});

export const collections = { posts };
