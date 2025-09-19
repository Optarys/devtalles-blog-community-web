import { API_BASE } from "@/lib/endpoints";

export const GQL_ENDPOINT =
  import.meta.env.PUBLIC_GRAPHQL_URL ?? `${API_BASE}/graphql`;

export const gql = String.raw;
type Vars = Record<string, unknown>;

export async function gqlFetch<T>(query: string, variables?: Vars): Promise<T> {
  const res = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.errors?.length) {
    throw new Error(json?.errors?.[0]?.message ?? `GraphQL error (${res.status})`);
  }
  return json.data as T;
}