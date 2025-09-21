// src/services/comments.service.ts
import { API_BASE } from "@/lib/endpoints";

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
  try { body = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const msg = body?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export async function listComments(postId: string): Promise<CommentModel[]> {
  const url = `${API_URL}/comments?postId=${encodeURIComponent(postId)}`;
  const res = await fetch(url, { method: "GET" });
  const data = await jsonOrThrow(res);
  return Array.isArray(data) ? data as CommentModel[] : (data?.items ?? []);
}

export async function listCommentsBySlug(slugPost: string): Promise<CommentModel[]> {
  const url = `${API_URL}/comments?slugPost=${encodeURIComponent(slugPost)}`;
  const res = await fetch(url, { method: "GET" });
  const data = await jsonOrThrow(res);
  return Array.isArray(data) ? data as CommentModel[] : (data?.items ?? []);
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

export async function editComment(id: string, content: string): Promise<CommentModel | void> {
  const res = await fetch(`${API_URL}/comments/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await jsonOrThrow(res);
  return data as CommentModel;
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await jsonOrThrow(res);
}
