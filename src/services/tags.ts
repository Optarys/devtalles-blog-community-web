import { ENDPOINTS, http } from "@/lib";
import type { Tag } from "@/types";

export async function listTags() {
  return http.get<Tag[]>(ENDPOINTS.tags);
}

export async function getTagBySlug(slug: string) {
  return http.get<Tag>(ENDPOINTS.tagBySlug(slug));
}