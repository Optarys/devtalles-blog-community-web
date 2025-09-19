import { gql } from "@/lib/graphql";

/** Define los tipos de reacción reales cuando tengas el schema */
export const GET_REACTIONS = gql`
  query GetReactions($postId: ID!) {
    postReactions(postId: $postId) {
      type
      count
      userReacted
    }
  }
`;

export const ADD_REACTION = gql`
  mutation AddReaction($postId: ID!, $type: String!) {
    addPostReaction(postId: $postId, type: $type) {
      type
      count
      userReacted
    }
  }
`;

export const REMOVE_REACTION = gql`
  mutation RemoveReaction($postId: ID!, $type: String!) {
    removePostReaction(postId: $postId, type: $type) {
      type
      count
      userReacted
    }
  }
`;