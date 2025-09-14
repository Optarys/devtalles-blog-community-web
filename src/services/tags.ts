import { ENDPOINTS } from '@/lib/endpoints';
import { http } from '@/lib/http';
import type { Tag } from '@/types';

export async function listTags() {
  return http.get<Tag[]>(ENDPOINTS.tags);
}

export async function getTagBySlug(slug: string) {
  return http.get<Tag>(ENDPOINTS.tagBySlug(slug));
}