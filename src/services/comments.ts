import { ENDPOINTS } from '@/lib/endpoints';
import { http } from '@/lib/http';
import type { Paginated } from '@/types/common';
import type { Comment, CreateCommentDTO } from '@/types/blog';

export async function listComments(postId: number | string, page = 1, pageSize = 20) {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();
  return http.get<Paginated<Comment>>(`${ENDPOINTS.commentsByPost(postId)}?${q}`);
}

export async function createComment(input: CreateCommentDTO) {
  return http.post<Comment>(ENDPOINTS.commentsByPost(input.postId), input);
}

export async function deleteComment(postId: number | string, commentId: number | string) {
  // ajusta si tu API usa otra ruta para borrar
  return http.del<void>(`${ENDPOINTS.commentsByPost(postId)}/${commentId}`);
}