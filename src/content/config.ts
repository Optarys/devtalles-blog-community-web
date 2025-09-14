import { defineCollection, z } from "astro:content";

const posts = defineCollection({
    type: "content", // 👈 obligatorio, si no lo pones TS infiere mal
    schema: z.object({
        title: z.string(),
        date: z.string(),
        tags: z.array(z.string()).optional(),
        cover: z.string().optional(),
        excerpt: z.string().optional(),
        published: z.boolean().optional(),
    }),
});

export const collections = { posts };
