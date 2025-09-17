const API_URL = import.meta.env.PUBLIC_API_URL;
export const LOCAL_MODE = true; // false al conectar la API

type GQLReq = { query: string; variables?: Record<string, unknown> };
type GQLResp<T> = { data?: T; errors?: any[] };

export async function graphql<T = any>(req: GQLReq, opts?: RequestInit): Promise<T> {
  if (LOCAL_MODE) throw new Error("GraphQL no disponible en modo local");

  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    credentials: "include", //cookie-session
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${getToken()}`,
      ...(opts?.headers ?? {}),
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = (await res.json()) as GQLResp<T>;
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data!;
}
