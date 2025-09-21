import { gqlFetch } from "@/lib/graphql";
import * as Q from "./posts.graphql";

/** === Tipos GQL crudos === */
type GQLTag = { name: string; slug: string };
type GQLBanner = { key: string; url: string };
type GQLCategory = { name: string; slug: string; description?: string | null };

export type AdminComment = { id: string; name: string; text: string; ts: number };

type GQLComment = {
  id: string | number;
  content: string;
  isModerated?: boolean | null;
  authorName?: string | null;
  authorEmail?: string | null;
  createdAt?: string | null;
};

function mapComments(arr?: GQLComment[] | null): AdminComment[] {
  if (!arr?.length) return [];
  return arr.map((c, i) => ({
    id: String(c.id),
    name: (c.authorName ?? "").trim() || "Anónimo",
    text: c.content || "",
    ts: c.createdAt ? Date.parse(c.createdAt) : (Date.now() - i), // usa fecha real
  }));
}

type GQLPost = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  seoMeta?: Record<string, unknown> | string | null;
  publishedAt?: string | null;
  summary?: string | null;
  banners?: unknown;
  tags?: GQLTag[] | null;
  category?: GQLCategory | null;
  comments?: GQLComment[] | null;
};

export type AdminPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  tags: string[];
  content: string;
  status: "draft" | "published" | "archived";
  date: string;
  comments?: AdminComment[];
};

export type AdminCategory = { name: string; slug: string; description?: string | null };

export function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function exec<T>(doc: any, vars?: any): Promise<T> {
  const res = await gqlFetch<T>(doc, vars);
  return ((res as any)?.data ?? res) as T;
}

function unwrapArray<T>(root: any, key: string): T[] {
  const v = root?.[key] ?? root;
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v?.items)) return v.items as T[];
  if (Array.isArray(v?.data)) return v.data as T[];
  if (Array.isArray(v?.results)) return v.results as T[];
  if (Array.isArray(v?.nodes)) return v.nodes as T[];
  if (Array.isArray(v?.edges)) return (v.edges as any[]).map(e => e.node as T);
  return [];
}

function firstBannerUrl(b: unknown): string | null {
  if (!b) return null;

  // si viene como string
  if (typeof b === "string") return b;

  // si viene como array
  if (Array.isArray(b)) {
    const first = b[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const o: any = first;
      return o.url ?? o.href ?? o.src ?? null;
    }
    return null;
  }

  // si viene como objeto suelto
  if (typeof b === "object") {
    const o: any = b;
    return o.url ?? o.href ?? o.src ?? null;
  }

  return null;
}

function mapToAdmin(p: GQLPost): AdminPost {
  let seo: any = p.seoMeta;
  if (typeof seo === "string") { try { seo = JSON.parse(seo); } catch { } }

  const status: AdminPost["status"] = p.publishedAt ? "published" : "draft";
  const dateStr = p.publishedAt ? p.publishedAt.slice(0, 10) : "";

  const coverFromBanners = firstBannerUrl(p.banners);
  const coverFromSeo = seo?.cover ?? seo?.image ?? null;

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.summary ?? "",
    cover: coverFromBanners ?? coverFromSeo ?? "/covers/default.jpg",
    tags: (p.tags ?? []).map(t => t.name),
    content: p.content ?? "",
    status,
    date: dateStr,
  };
}

export type ListParams = {
  slug?: string;
  status?: "draft" | "published" | string;
  categories?: string[];
  tags?: string[];
  from?: string;
  to?: string;

  offset?: number;
  limit?: number;
  orderBy?: string;
  search?: string;
};

const ALLOWED_KEYS = ["slug", "status", "categories", "tags", "from", "to"] as const;
type AllowedKey = typeof ALLOWED_KEYS[number];

function pickAllowed(params?: ListParams): Partial<Record<AllowedKey, any>> {
  if (!params) return {};
  const out: Partial<Record<AllowedKey, any>> = {};
  for (const k of ALLOWED_KEYS) {
    let v = (params as any)[k];
    if (Array.isArray(v)) v = v.filter(x => x != null && String(x).trim() !== "");
    if (v === "") v = undefined;
    if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) {
      out[k] = v;
    }
  }
  return out;
}

export async function getAllPosts(params?: ListParams): Promise<AdminPost[]> {
  const variables = pickAllowed(params);
  const data = await exec<{ posts: unknown }>(Q.LIST_POSTS, variables);
  const raw = unwrapArray<GQLPost>(data, "posts");
  return raw.map(mapToAdmin);
}

export async function getPost(id: string): Promise<AdminPost | null> {
  const data = await exec<{ post: GQLPost | null }>(Q.GET_POST_BY_ID, { id });
  return data.post ? mapToAdmin(data.post) : null;
}

export async function getPostBySlug(slug: string): Promise<AdminPost | null> {
  const data = await exec<{ posts: unknown }>(Q.GET_POST_BY_SLUG, { slug });
  const arr = unwrapArray<GQLPost>(data, "posts");
  if (!arr.length) return null;

  const base = mapToAdmin(arr[0]);
  const comments = mapComments(arr[0].comments);

  return { ...base, comments };
}

export async function upsertPost(p: AdminPost & {
  categorySlug?: string;
  tagSlugs?: string[];
  banners?: { key: string; url: string }[];
  seoMeta?: any;
}): Promise<void> {
  const input: any = {
    id: Number(p.id),
    title: p.title,
    slug: p.slug || slugify(p.title),
    summary: p.excerpt || null,
    content: p.content,
    publishedAt: p.status === "published" ? new Date(p.date).toISOString() : null,
    banners: p.banners ?? (p.cover ? [{ key: p.cover, url: p.cover }] : []),
    seoMeta: p.seoMeta ?? null,
    categorySlug: p.categorySlug,
    tagSlugs: p.tagSlugs ?? p.tags?.map(t => slugify(t)),
  };

  await exec(Q.UPSERT_POST, { input });
}

export async function deletePost(id: string): Promise<void> {
  await exec(Q.DELETE_POST, { id });
}

export async function toggleStatus(id: string): Promise<void> {
  await exec(Q.TOGGLE_POST_STATUS, { id });
}

export async function suggestUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = base, i = 2;
  while (await getPostBySlug(candidate)) candidate = `${base}-${i++}`;
  return candidate;
}

export async function listRecentForCards(limit = 6) {
  const posts = await getAllPosts({ status: "published" });
  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts.slice(0, limit).map(p => ({
    href: `/blog/${p.slug}/`,
    title: p.title,
    excerpt: p.excerpt || (p.content ? p.content.slice(0, 160) + "…" : ""),
    cover: p.cover || "/assets/png/DEVI NORMAL.png",
    tags: p.tags,
    date: p.date,
  }));
}

export async function listCategories(): Promise<AdminCategory[]> {
  try {
    const data = await exec<{ categories: AdminCategory[] }>(Q.LIST_CATEGORIES);
    const cats = data?.categories ?? [];
    if (cats.length) return cats;
  } catch (e) {
    console.warn("[listCategories] Query.categories no existe en el schema:", (e as Error)?.message);
  }

  const dedup = new Map<string, AdminCategory>();

  const data2 = await exec<{ posts: { category?: AdminCategory | null }[] }>(
    Q.LIST_POSTS_ONLY_CATEGORIES,
    { status: "published" }
  );

  for (const p of data2?.posts ?? []) {
    const c = p?.category;
    if (c?.slug && !dedup.has(c.slug)) {
      dedup.set(c.slug, {
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
      });
    }
  }

  return Array.from(dedup.values());
}