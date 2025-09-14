import { ENDPOINTS, http } from '@/lib';
import type { Category } from '@/types';

export async function listCategories() {
  return http.get<Category[]>(ENDPOINTS.categories);
}

export async function getCategoryBySlug(slug: string) {
  return http.get<Category>(ENDPOINTS.categoryBySlug(slug));
}