import { ENDPOINTS, http } from "@/lib";
import type { Paginated, ListPostsQuery, Post } from '@/types';

function qs<T extends object>(q: T): string {
  const params = new URLSearchParams();
  (Object.entries(q) as [keyof T, unknown][])
    .forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params.append(String(k), String(v));
    });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function listPosts(query: ListPostsQuery = {}) {
  return http.get<Paginated<Post>>(`${ENDPOINTS.posts}${qs(query)}`);
}

export async function getPostBySlug(slug: string) {
  return http.get<Post>(ENDPOINTS.postsBySlug(slug));
}
export async function getPostById(id: number | string) {
  return http.get<Post>(ENDPOINTS.postById(id));
}
export async function createPost(data: Partial<Post>) {
  return http.post<Post>(ENDPOINTS.posts, data);
}
export async function updatePost(id: number | string, data: Partial<Post>) {
  return http.put<Post>(ENDPOINTS.postById(id), data);
}
export async function deletePost(id: number | string) {
  return http.del<void>(ENDPOINTS.postById(id));
}