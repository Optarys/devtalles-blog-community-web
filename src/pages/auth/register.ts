// src/pages/auth/register.ts
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

export const GET: APIRoute = async () =>
    new Response("REGISTER ENDPOINT OK (GET)", { status: 200 });

export const POST: APIRoute = async ({ request, redirect }) => {
    if (!API_BASE) {
        return redirect(`/auth/signup?error=${encodeURIComponent("Config faltante: PUBLIC_API_URL")}`, 303);
    }

    try {
        const fd = await request.formData();

        const name = String(fd.get("name") || "").trim();
        const firstName = String(fd.get("firstName") || "").trim() || name.split(" ").slice(0, -1).join(" ");
        const lastName = String(fd.get("lastName") || "").trim() || name.split(" ").slice(-1).join(" ");
        const email = String(fd.get("email") || "").trim().toLowerCase();
        const username = String(fd.get("username") || "").trim() || (email ? email.split("@")[0] : "");
        const password = String(fd.get("password") || "");
        const confirm = String(fd.get("confirm") || "");
        const terms = fd.get("terms");

        // Validaciones mínimas
        if (!firstName || !lastName || !email || !username || !password) {
            return redirect(`/auth/signup?error=${encodeURIComponent("Completa todos los campos.")}`, 303);
        }
        if (password !== confirm) {
            return redirect(`/auth/signup?error=${encodeURIComponent("Las contraseñas no coinciden.")}`, 303);
        }
        if (!terms) {
            return redirect(`/auth/signup?error=${encodeURIComponent("Debes aceptar los Términos.")}`, 303);
        }

        // SIGNUP (REST) — sin login automático
        const signupRes = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password, username }),
        });

        if (!signupRes.ok) {
            const msg = await readError(signupRes);
            const friendly = /exist|ya existe|taken|duplicate/i.test(msg)
                ? "Ese correo o usuario ya está registrado. Intenta iniciar sesión."
                : msg;

            return redirect(`/auth/signup?error=${encodeURIComponent(friendly || `Signup ${signupRes.status}`)}`, 303);
        }

        // Éxito → manda al login con bandera OK y next=/admin
        return redirect(`/auth/login?ok=signup_success&next=${encodeURIComponent("/admin")}`, 303);
    } catch (e: any) {
        return redirect(`/auth/signup?error=${encodeURIComponent(e?.message || "Error inesperado")}`, 303);
    }
};
