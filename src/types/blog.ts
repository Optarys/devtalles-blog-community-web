import type { ID, ISODate } from './common';
import type { UserSummary } from './auth';

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: ISODate;
}

export interface Tag {
  id: ID;
  name: string;
  slug: string;
}

export type PostStatus = 'draft' | 'published' | string;

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  cover?: string | null;        // url de portada si la incluyes en seo_meta
  [key: string]: unknown;       // para campos extra en jsonb
}

export interface Post {
  id: ID;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  status: PostStatus;
  category?: Category | null;
  tags: Tag[];
  author?: UserSummary | null;
  seoMeta?: SeoMeta | null;
  publishedAt?: ISODate | null;
  createdAt: ISODate;
  updatedAt?: ISODate | null;
}

export interface Comment {
  id: ID;
  postId: ID;                   // útil para operaciones
  post?: Pick<Post, 'id' | 'slug' | 'title'>;
  user?: UserSummary | null;
  authorName?: string | null;
  authorEmail?: string | null;
  content: string;
  isModerated: boolean;
  createdAt: ISODate;
  deletedAt?: ISODate | null;
}

/* ===== DTOs mínimos para formularios (opcionales pero útiles) ===== */
export interface CreateCommentDTO {
  postId: ID;
  content: string;
  authorName?: string;
  authorEmail?: string;
}

export interface ListPostsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  status?: 'published' | 'draft';
}
