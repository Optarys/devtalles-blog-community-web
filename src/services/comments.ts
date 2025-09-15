import { ENDPOINTS, http } from "@/lib";
import type { Paginated, Comment, CreateCommentDTO } from "@/types";

export async function listComments(
  postId: number | string,
  page = 1,
  pageSize = 20
) {
  const q = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  }).toString();

  return http.get<Paginated<Comment>>(
    `${ENDPOINTS.commentsByPostId(postId)}?${q}`
  );
}

export async function createComment(input: CreateCommentDTO) {
  return http.post<Comment>(ENDPOINTS.commentsByPostId(input.postId), input);
}

export async function deleteComment(
  postId: number | string,
  commentId: number | string
) {
  return http.del<void>(`${ENDPOINTS.commentsByPostId(postId)}/${commentId}`);
}
