import { API_BASE } from './endpoints';

export class HttpError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const base: HeadersInit = { 'Content-Type': 'application/json' };
  if (authToken) (base as any).Authorization = `Bearer ${authToken}`;
  return { ...base, ...(extra ?? {}) };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error('PUBLIC_API_URL no está configurada.');
  }
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers: buildHeaders(init?.headers) });

  let body: unknown = undefined;
  const text = await res.text();
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }

  if (!res.ok) throw new HttpError(`HTTP ${res.status} ${url}`, res.status, body);
  return body as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T, B = unknown>(path: string, body: B) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
