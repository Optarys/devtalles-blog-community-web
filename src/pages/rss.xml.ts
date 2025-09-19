// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET() {
    const posts = await getCollection("posts", p => p.data.published !== false);
    return rss({
        title: "DevTalles Community",
        description: "Blog de la comunidad",
        site: import.meta.env.SITE,
        items: posts.map(p => ({
            title: p.data.title,
            description: p.data.excerpt,
            link: `/blog/${p.slug}/`,
            pubDate: p.data.date,
        })),
    });
}
