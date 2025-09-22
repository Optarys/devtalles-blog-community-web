import type { APIRoute } from "astro";
export const prerender = false;

const clean = (v?: string) => (v ?? "").replace(/\u00A0/g, "").trim();
const API_BASE = clean(import.meta.env.PUBLIC_API_URL).replace(/\/+$/, "");

// GET defensivo: si alguien abre /api/auth/login en el navegador, lo mandamos al form
export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/auth/login", 303);
};

// lectura robusta de errores del API
async function readError(res: Response) {
  const txt = await res.text().catch(() => "");
  try {
    const j = txt ? JSON.parse(txt) : null;
    if (!j) return txt || res.statusText;
    if (typeof j.message === "string") return j.message;
    if (typeof j.error === "string") return j.error;
    if (Array.isArray(j.errors) && j.errors.length) {
      return j.errors.map((e: any) => e?.message ?? String(e)).join(" | ");
    }
    return txt || res.statusText;
  } catch {
    return txt || res.statusText;
  }
}

export const POST: APIRoute = async ({ request, redirect, cookies, url }) => {
  if (!API_BASE) {
    return redirect(`/auth/login?error=${encodeURIComponent("Config faltante: PUBLIC_API_URL")}`, 303);
  }

  const debug =
    new URL(request.url).searchParams.get("debug") === "1" ||
    process.env.DEBUG_AUTH === "1";

  try {
    const fd = await request.formData();
    const next = String(fd.get("next") || "/admin");
    const identifier =
      String(fd.get("identifier") || "").trim() ||
      String(fd.get("email") || "").trim() ||
      String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "");

    if (!identifier || !password) {
      return redirect(`/auth/login?error=${encodeURIComponent("Ingresa correo/usuario y contraseña.")}`, 303);
    }

    if (debug) {
      const maskedId =
        identifier.length > 4
          ? identifier.slice(0, 2) + "***" + identifier.slice(-2)
          : "***";
      console.log("[auth/login] → API request", { API_BASE, identifier: maskedId });
    }

    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifier, password }),
      redirect: "manual",
    });

    const clone = resp.clone();
    let rawBody = "";
    try { rawBody = await clone.text(); } catch {}

    if (debug) {
      const setCookieHeader = resp.headers.get("set-cookie") || "";
      const maskedSetCookie = setCookieHeader.replace(
        /(jwt=)([^;]+)/i,
        (_m, p1, p2) => p1 + (p2.length > 12 ? p2.slice(0, 12) + "...(redacted)" : "***")
      );
      console.log("[auth/login] ← API response", {
        status: resp.status,
        ok: resp.ok,
        setCookie: maskedSetCookie || "(none)",
        bodyPreview: rawBody?.slice(0, 500) ?? "(empty)",
      });
    }

    if (!resp.ok) {
      const msg = await readError(resp);
      if (debug) console.error("[auth/login] API error:", msg);
      return redirect(`/auth/login?error=${encodeURIComponent(msg || "Credenciales inválidas")}`, 303);
    }

    // Copiamos jwt de la respuesta del API a cookie del front
    const setCookie = resp.headers.get("set-cookie") || "";
    const m = setCookie.match(/(?:^|;?\s*)jwt=([^;]+)/i);
    const jwt = m ? decodeURIComponent(m[1]) : "";
    if (!jwt) {
      if (debug) console.error("[auth/login] faltó Set-Cookie jwt en respuesta del API");
      return redirect(`/auth/login?error=${encodeURIComponent("No se recibió cookie 'jwt' del API.")}`, 303);
    }

    cookies.set("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Cookie temporal NO-HttpOnly con user-lite (si el API devolvió JSON)
    try {
      if (rawBody) {
        const j = JSON.parse(rawBody);
        const userLite = {
          email: j?.email ?? "",
          username: j?.username ?? j?.email ?? "",
          roles: Array.isArray(j?.roles) ? j.roles : [],
        };
        cookies.set("dt_user", Buffer.from(JSON.stringify(userLite)).toString("base64"), {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5, // 5 min
        });
        if (debug) console.log("[auth/login] set cookie dt_user (temporal)");
      }
    } catch {
      if (debug) console.warn("[auth/login] body no era JSON; se usará JWT en callback");
    }

    // Redirige al callback
    const cb = new URL("/auth/callback", url.origin);
    cb.searchParams.set("next", next);
    if (debug) console.log("[auth/login] redirect →", cb.toString());
    return redirect(cb.toString(), 303);
  } catch (e: any) {
    console.error("[auth/login] exception:", e?.message || e);
    return redirect(`/auth/login?error=${encodeURIComponent("Error interno al autenticar")}`, 303);
  }
};
