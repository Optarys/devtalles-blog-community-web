import { API_BASE } from "@/lib/endpoints";
import { gqlFetch } from "@/lib/graphql";
import * as Q from "./comments.graphql";

export type CommentUser = { id: string; name: string; avatar?: string | null };
export type CommentModel = {
  id: string;
  postId: string;
  parentId?: string | null;
  author: CommentUser;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

const API_URL =
  import.meta.env.PUBLIC_API_URL ??
  import.meta.env.PUBLIC_API_BASE ??
  API_BASE;

async function jsonOrThrow(res: Response) {
  let body: any = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
  return body;
}

export async function addComment(args: {
  content: string;
  postId: number;
  slugPost?: string;
}): Promise<CommentModel | void> {
  const res = await fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      content: args.content,
      postId: args.postId,
      ...(args.slugPost ? { slugPost: args.slugPost } : {}),
    }),
  });
  const data = await jsonOrThrow(res);
  return data as CommentModel;
}

/* export async function editComment(id: string, content: string): Promise<CommentModel | void> {
  const res = await fetch(`${API_URL}/comments/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await jsonOrThrow(res);
  return data as CommentModel;
} */

export async function deleteComment(id: string | number): Promise<{ success: boolean; message?: string; commentId?: number }> {
  const res = await fetch(`${API_URL}/comments/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  const data = await jsonOrThrow(res);
  return data as { success: boolean; message?: string; commentId?: number };
}

export type ClientComment = { id: string; name: string; text: string; ts: number };

type GQLComment = {
  id: string | number;
  content: string;
  authorName?: string | null;
  createdAt?: string | null;
};

function map(arr?: GQLComment[] | null): ClientComment[] {
  if (!arr?.length) return [];
  return arr.map((c, i) => ({
    id: String(c.id),
    name: (c.authorName ?? "").trim() || "Anónimo",
    text: c.content || "",
    ts: c.createdAt ? Date.parse(c.createdAt) : (Date.now() - i),
  }));
}

export async function listCommentsByGraphSlug(slug: string): Promise<ClientComment[]> {
  const rsp = await gqlFetch<{ posts: Array<{ comments?: GQLComment[] | null }> }>(
    Q.GET_COMMENTS_BY_SLUG,
    { slug }
  );

  const posts = rsp?.posts ?? [];
  return map(posts[0]?.comments);
}