import type { APIRoute } from "astro";
export const prerender = false;

const clean = (v?: string) => (v ?? "").replace(/\u00A0/g, "").trim();
const API_BASE = clean(import.meta.env.PUBLIC_API_URL).replace(/\/+$/, "");

async function readError(res: Response) {
  try {
    const txt = await res.text();
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
  } catch {
    return res.statusText || "Error";
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

    // Llamada al backend
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifier, password }),
      // no seguimos redirects del backend; nosotros controlamos el flujo
      redirect: "manual",
    });

    // Si el backend respondió error → pasar mensaje textual
    if (!resp.ok) {
      const msg = await readError(resp);
      return redirect(`/auth/login?error=${encodeURIComponent(msg || "Credenciales inválidas")}`, 303);
    }

    // 1) Extrae cookie jwt del backend y cópiala al dominio del front
    const setCookie = resp.headers.get("set-cookie") || "";
    const m = setCookie.match(/(?:^|;?\s*)jwt=([^;]+)/i);
    const jwt = m ? decodeURIComponent(m[1]) : "";

    if (!jwt) {
      return redirect(`/auth/login?error=${encodeURIComponent("No se recibió cookie 'jwt' del API.")}`, 303);
    }

    cookies.set("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // 2) Intenta leer el body del backend de forma segura (clonando)
    try {
      const bodyText = await resp.clone().text();
      if (bodyText) {
        try {
          const j = JSON.parse(bodyText);
          const userLite = {
            email: j?.email ?? "",
            username: j?.username ?? j?.email ?? "",
            roles: Array.isArray(j?.roles) ? j.roles : [],
          };
          // cookie temporal NO-HttpOnly para que el callback escriba localStorage
          cookies.set("dt_user", Buffer.from(JSON.stringify(userLite)).toString("base64"), {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 5, // 5 minutos
          });
        } catch {
          // si no se puede parsear, el callback decodificará el JWT
        }
      }
    } catch {
      // si falla leer body, no interrumpir el flujo
    }

    // 3) Redirige al callback: allí se guarda dt:user en localStorage
    const cb = new URL("/auth/callback", url.origin);
    cb.searchParams.set("next", next);
    return redirect(cb.toString(), 303);
  } catch (e: any) {
    // No filtres el mensaje del backend aquí; muestra uno genérico
    return redirect(`/auth/login?error=${encodeURIComponent("Error interno al autenticar")}`, 303);
  }
};
