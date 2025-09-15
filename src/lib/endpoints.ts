export const API_BASE =
  import.meta.env.PUBLIC_API_BASE ?? "http://localhost:3000";

export const ENDPOINTS = {
  posts: `${API_BASE}/posts`,
  postById: (id: number | string) => `${API_BASE}/posts/${id}`,
  postsBySlug: (slug: string) => `${API_BASE}/posts/slug/${slug}`,

  categories: `${API_BASE}/categories`,
  categoryBySlug: (slug: string) => `${API_BASE}/categories/slug/${slug}`,

  tags: `${API_BASE}/tags`,
  tagBySlug: (slug: string) => `${API_BASE}/tags/slug/${slug}`,

  commentsByPostId: (postId: number | string) =>
    `${API_BASE}/posts/${postId}/comments`,
};