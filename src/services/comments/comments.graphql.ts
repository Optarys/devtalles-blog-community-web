import { gql } from "@/lib/graphql";

export const LIST_COMMENTS = gql`
  query ListComments($postId: ID!) {
    comments(postId: $postId) {
      id
      postId
      parentId
      author { id name avatar }
      content
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      id
      postId
      parentId
      author { id name avatar }
      content
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
