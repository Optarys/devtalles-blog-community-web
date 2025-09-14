import { ENDPOINTS, http } from '@/lib';
import type { Paginated, Comment, CreateCommentDTO } from '@/types';

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