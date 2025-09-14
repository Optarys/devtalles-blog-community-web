import { ENDPOINTS } from '@/lib/endpoints';
import { http } from '@/lib/http';
import type { Category, Paginated } from '@/types';

export async function listCategories() {
  // si tu API pagina categorías, cambia a Paginated<Category>
  return http.get<Category[]>(ENDPOINTS.categories);
}

export async function getCategoryBySlug(slug: string) {
  return http.get<Category>(ENDPOINTS.categoryBySlug(slug));
}