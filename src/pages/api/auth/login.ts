import type { APIRoute } from "astro";
export const prerender = false;

const clean = (v?: string) => (v ?? "").replace(/\u00A0/g, "").trim();
const API_BASE = clean(import.meta.env.PUBLIC_API_URL).replace(/\/+$/, "");

// Lee mensaje de error del backend de forma robusta
async function readError(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    const j = text ? JSON.parse(text) : null;
    if (!j) return text || res.statusText;
    if (typeof j.message === "string") return j.message;
    if (typeof j.error === "string") return j.error;
    if (Array.isArray(j.errors) && j.errors.length) {
      return j.errors.map((e: any) => e?.message ?? String(e)).join(" | ");
    }
    return text || res.statusText;
  } catch {
    return text || res.statusText;
  }
}

export const POST: APIRoute = async ({ request, redirect, cookies, url }) => {
  if (!API_BASE) {
    return redirect(`/auth/login?error=${encodeURIComponent("Config faltante: PUBLIC_API_URL")}`, 303);
  }

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

    // Login contra el API
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifier, password }),
      redirect: "manual",
    });

    if (!resp.ok) {
      const msg = await readError(resp);
      return redirect(`/auth/login?error=${encodeURIComponent(msg || "Credenciales inválidas")}`, 303);
    }

    // Extrae cookie jwt del backend
    const setCookie = resp.headers.get("set-cookie") || "";
    const m = setCookie.match(/(?:^|;?\s*)jwt=([^;]+)/i);
    const jwt = m ? decodeURIComponent(m[1]) : "";
    if (!jwt) {
      return redirect(`/auth/login?error=${encodeURIComponent("No se recibió cookie 'jwt' del API.")}`, 303);
    }

    // Copia cookie jwt al dominio del front
    cookies.set("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Lee el body JSON del login (email, username, roles) y guárdalo en cookie temporal NO-HttpOnly
    let userLite: any = null;
    try {
      const bodyText = await resp.text(); // algunos backends permiten leer body aun con set-cookie
      if (bodyText) {
        const j = JSON.parse(bodyText);
        userLite = {
          email: j?.email ?? "",
          username: j?.username ?? j?.email ?? "",
          roles: Array.isArray(j?.roles) ? j.roles : [],
        };
      }
    } catch {
      // si no se pudo leer, no pasa nada; el callback intentará decodificar el JWT
    }

    if (userLite) {
      // cookie temporal 5 minutos para que el callback escriba localStorage
      cookies.set("dt_user", Buffer.from(JSON.stringify(userLite)).toString("base64"), {
        httpOnly: false,          // para que el cliente/SSR pueda leerla
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      });
    }

    // Redirige al callback (ahí se escribe localStorage)
    const cb = new URL("/auth/callback", url.origin);
    cb.searchParams.set("next", next);
    return redirect(cb.toString(), 303);
  } catch (e: any) {
    return redirect(`/auth/login?error=${encodeURIComponent(e?.message || "Error inesperado")}`, 303);
  }
};
