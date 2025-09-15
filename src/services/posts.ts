import { gql, gqlFetch } from "@/lib";
import type { Post, PostStatus, Tag, Category, Paginated, ListPostsQuery } from "@/types";

type GqlTag = { name: string; slug: string }; // sin id en el schema
type GqlCategory = { name: string; slug: string; description?: string | null };

type GqlPost = {
  id: number;
  title: string;
  slug: string;
  category?: GqlCategory | null;
  content: string;
  authorId?: string | null;
  seoMeta?: Record<string, unknown> | null;
  publishedAt?: string | null;
  tags?: GqlTag[] | null;
};

const POSTS = gql`
  query Posts(
    $slug: String
    $status: String
    $categories: [String!]
    $tags: [String!]
    $from: String
    $to: String
  ) {
    posts(
      slug: $slug
      status: $status
      categories: $categories
      tags: $tags
      from: $from
      to: $to
    ) {
      id
      title
      slug
      category { name slug description }
      content
      authorId
      seoMeta
      publishedAt
      tags { name slug }
    }
  }
`;

const POST_BY_SLUG = gql`
  query PostBySlug($slug: String!) {
    posts(slug: $slug) {
      id
      title
      slug
      category { name slug description }
      content
      authorId
      seoMeta
      publishedAt
      tags { name slug }
    }
  }
`;

function toVars(q: ListPostsQuery = {}) {
  return {
    slug: (q as any).slug,
    status: q.status,
    categories: q.categorySlug ? [q.categorySlug] : undefined,
    tags: q.tagSlug ? [q.tagSlug] : undefined,
    from: (q as any).from,
    to: (q as any).to,
  } as Record<string, unknown>;
}

function mapPost(p: GqlPost): Post {
  const created = p.publishedAt ?? new Date().toISOString();
  const status: PostStatus = p.publishedAt ? "published" : "draft";

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: null,
    content: p.content,
    status,
    category: p.category
      ? {
          id: -1 as any,
          name: p.category.name,
          slug: p.category.slug,
          description: p.category.description ?? null,
          createdAt: created,
        }
      : null,
    tags: (p.tags ?? []).map((t, i) => ({ id: i as any, name: t.name, slug: t.slug })) as Tag[],
    author: p.authorId ? ({ id: p.authorId, firstName: "", lastName: "" } as any) : null,
    seoMeta: p.seoMeta ?? null,
    publishedAt: p.publishedAt ?? null,
    createdAt: created,
    updatedAt: null,
  };
}

export async function listPosts(q: ListPostsQuery = {}) {
  const data = await gqlFetch<{ posts: GqlPost[] }>(POSTS, toVars(q));
  const items = data.posts.map(mapPost);
  return { items, total: items.length, page: 1, pageSize: items.length } as Paginated<Post>;
}

export async function getPostBySlug(slug: string) {
  const data = await gqlFetch<{ posts: GqlPost[] }>(POST_BY_SLUG, { slug });
  const p = data.posts?.[0];
  if (!p) throw new Error("Post no encontrado");
  return mapPost(p);
}