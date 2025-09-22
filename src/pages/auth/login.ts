import type { APIRoute } from "astro";
export const prerender = false;

const API_BASE = (import.meta.env.PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const POST: APIRoute = async ({ request, redirect, cookies, url }) => {
  const fd = await request.formData();
  const identifier = String(fd.get("identifier") || "");
  const password = String(fd.get("password") || "");
  const next = String(fd.get("next") || "/");

  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => r.statusText);
    return redirect(`/auth/login?error=${encodeURIComponent(err || "Login inválido")}`, 303);
  }

  const callback = new URL("/auth/callback", url.origin);
  callback.searchParams.set("next", next);
  return redirect(callback.toString(), 303);
};
