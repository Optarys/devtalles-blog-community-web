import { gql, gqlFetch } from "@/lib/graphql";

export type GqlListPostsVars = {
  slug?: string;
  status?: string;
  categories?: string[];
  tags?: string[];
  from?: string;
  to?: string;
};

type GQLTag = { name: string; slug: string };
type GQLCategory = { name: string; slug: string; description?: string | null };

export type GQLPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  authorId?: string | number | null;
  seoMeta?: Record<string, unknown> | null;
  publishedAt?: string | null;
  category?: GQLCategory | null;
  tags?: GQLTag[] | null;
};

const POSTS_QUERY = gql`
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
      content
      authorId
      seoMeta
      publishedAt
      category { name slug description }
      tags { name slug }
    }
  }
`;

export async function listPostsGQL(vars: GqlListPostsVars = {}) {
  const data = await gqlFetch<{ posts: GQLPost[] }>(POSTS_QUERY, vars);
  return data.posts ?? [];
}


const POST_BY_SLUG_QUERY = gql`
  query PostBySlug($slug: String!) {
    posts(slug: $slug) {
      id
      title
      slug
      content
      authorId
      seoMeta
      publishedAt
      category { name slug description }
      tags { name slug }
    }
  }
`;

export async function getPostBySlugGQL(slug: string) {
  const data = await gqlFetch<{ posts: any[] }>(POST_BY_SLUG_QUERY, { slug });
  const p = data.posts?.[0];
  if (!p) throw new Error("Post no encontrado");
  return p as {
    id: number;
    title: string;
    slug: string;
    content: string;
    seoMeta?: Record<string, unknown> | null;
    publishedAt?: string | null;
    tags?: { name: string; slug: string }[] | null;
  };
}