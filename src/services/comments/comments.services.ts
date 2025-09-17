import { gqlFetch } from "@/lib/graphql";
import * as Q from "./comments.graphql";

export type CommentUser = { id: string; name: string; avatar?: string | null };
export type CommentModel = {
  id: string;
  postId: string;
  parentId?: string | null;
  author: CommentUser;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

export async function listComments(postId: string): Promise<CommentModel[]> {
  const data = await gqlFetch<{ comments: CommentModel[] }>(Q.LIST_COMMENTS, { postId });
  return data.comments ?? [];
}

export async function addComment(args: { postId: string; content: string; parentId?: string | null }) {
  const input = { postId: args.postId, content: args.content, parentId: args.parentId ?? null };
  const data = await gqlFetch<{ createComment: CommentModel }>(Q.CREATE_COMMENT, { input });
  return data.createComment;
}

export async function editComment(id: string, content: string) {
  const data = await gqlFetch<{ updateComment: CommentModel }>(Q.UPDATE_COMMENT, { id, content });
  return data.updateComment;
}

export async function deleteComment(id: string) {
  await gqlFetch(Q.DELETE_COMMENT, { id });
}
