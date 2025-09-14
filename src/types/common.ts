export type ID = number | string;
export type ISODate = string;

export type SortOrder = 'asc' | 'desc';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
  order?: SortOrder;
}