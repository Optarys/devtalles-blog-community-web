import { gqlFetch } from "@/lib/graphql";
import * as Q from "./reactions.graphql";

export type ReactionSummary = {
  type: string;      // ej: 'like' | 'love' | 'clap'
  count: number;
  userReacted: boolean;
};

export async function getReactions(postId: string): Promise<ReactionSummary[]> {
  const data = await gqlFetch<{ postReactions: ReactionSummary[] }>(Q.GET_REACTIONS, { postId });
  return data.postReactions ?? [];
}

export async function addReaction(postId: string, type: string): Promise<ReactionSummary[]> {
  const data = await gqlFetch<{ addPostReaction: ReactionSummary[] }>(Q.ADD_REACTION, { postId, type });
  return data.addPostReaction ?? [];
}

export async function removeReaction(postId: string, type: string): Promise<ReactionSummary[]> {
  const data = await gqlFetch<{ removePostReaction: ReactionSummary[] }>(Q.REMOVE_REACTION, { postId, type });
  return data.removePostReaction ?? [];
}
