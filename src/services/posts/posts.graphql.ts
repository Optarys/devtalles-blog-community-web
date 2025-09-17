import { gql } from "@/lib/graphql";

export const LIST_POSTS = gql`
  query ListPosts(
    $slug: String
    $status: String
    $categories: [String!]
    $tags: [String!]
    $from: String
    $to: String
  ) {
    posts(
      slug: $slug
      status: $status
      categories: $categories
      tags: $tags
      from: $from
      to: $to
    ) {
      id
      title
      slug
      summary
      content
      seoMeta
      publishedAt
      banners           # <- JSON, sin subcampos
      category { name slug description }
      tags { name slug }
    }
  }
`;

/** GET by ID */
export const GET_POST_BY_ID = gql`
  query PostById($id: ID!) {
    post(id: $id) {
      id
      title
      slug
      summary
      content
      seoMeta
      publishedAt
      banners           # <- JSON, sin subcampos
      category { name slug description }
      tags { name slug }
    }
  }
`;

/** GET by slug (público) */
export const GET_POST_BY_SLUG = gql`
  query PostBySlug($slug: String!) {
    posts(slug: $slug) {
      id
      title
      slug
      summary
      content
      seoMeta
      publishedAt
      banners           # <- JSON, sin subcampos
      category { name slug description }
      tags { name slug }
    }
  }
`;

/** UPSERT */
export const UPSERT_POST = gql`
  mutation UpsertPost($input: PostInput!) {
    upsertPost(input: $input) {
      id
      publishedAt
    }
  }
`;

/** DELETE */
export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

/** TOGGLE status */
export const TOGGLE_POST_STATUS = gql`
  mutation TogglePostStatus($id: ID!) {
    togglePostStatus(id: $id) {
      id
      publishedAt
    }
  }
`;
