import { gql } from "@/lib/graphql";

export const GET_COMMENTS_BY_SLUG = gql`
  query CommentsBySlug($slug: String!) {
    posts(slug: $slug) {
      id
      comments {
        id
        content
        isModerated
        authorName
        authorEmail
        createdAt
      }
    }
  }
`;