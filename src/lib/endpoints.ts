export const API_BASE = import.meta.env.PUBLIC_API_URL;

export const ENDPOINTS = {
  posts: '/posts',
  postById: (id: number | string) => `/posts/${id}`,
  postsBySlug: (slug: string) => `/posts/slug/${slug}`,
  commentsByPost: (postId: number | string) => `/posts/${postId}/comments`,
  categories: '/categories',
  categoryBySlug: (slug: string) => `/categories/${slug}`,
  tags: '/tags',
  tagBySlug: (slug: string) => `/tags/${slug}`,
};