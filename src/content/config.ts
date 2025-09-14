import { defineCollection, z } from "astro:content";

const posts = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        excerpt: z.string().max(200),
        date: z.coerce.date(),           // Acepta string o Date
        cover: z.string().optional(),
        tags: z.array(z.string()).default([]),
        published: z.boolean().default(true),
    }),
});

export const collections = { posts };
