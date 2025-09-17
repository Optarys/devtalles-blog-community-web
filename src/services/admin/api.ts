// src/services/admin/api.ts
const API_BASE =
    import.meta.env.PUBLIC_API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

/* function getAuthToken(): string | null {
  return localStorage.getItem("devtalles.jwt");
} */

export type CreatePostInput = {
    title: string;
    summary: string;
    content: string;
    category?: string;
    tags: string[];
    seoMeta?: any;
    status: "draft" | "published";
    banners?: File[];
};

export async function createPostssssssssssssssss(input: CreatePostInput) {
    //const token = getAuthToken();
    //if (!token) throw new Error("Falta token de autenticación.");

    const fd = new FormData();
    fd.set("title", input.title);
    fd.set("summary", input.summary ?? "");
    fd.set("content", input.content ?? "");
    if (input.category) fd.set("category", input.category);
    if (input.tags?.length) fd.set("tags", input.tags.join(","));
    if (input.seoMeta) fd.set("seoMeta", JSON.stringify(input.seoMeta));
    fd.set("status", input.status);

    if (input.banners?.length) {
        for (const f of input.banners) {
            fd.append("banners", f, f.name);
        }
    }

    const rsp = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
            //Authorization: `Bearer ${token}`,
            Accept: "*/*",
        },
        body: fd,
    });

    if (!rsp.ok) {
        const text = await rsp.text().catch(() => "");
        throw new Error(`POST /posts ${rsp.status}: ${text || rsp.statusText}`);
    }
    return rsp.json();
}

export async function createPost(input: CreatePostInput) {
    const fd = new FormData();
    fd.set("title", input.title);
    fd.set("summary", input.summary ?? "");
    fd.set("content", input.content ?? "");
    if (input.category) fd.set("category", input.category);
    if (input.tags?.length) fd.set("tags", input.tags.join(","));
    if (input.seoMeta) fd.set("seoMeta", JSON.stringify(input.seoMeta));
    fd.set("status", input.status);

    // múltiples archivos con la misma key "banners"
    if (input.banners?.length) {
        for (const f of input.banners) {
            fd.append("banners", f, f.name);
        }
    }

    const rsp = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        // NO seteamos Authorization
        headers: {
            // NO pongas Content-Type; FormData ya agrega boundary
            Accept: "*/*",
        },
        body: fd,
    });

    if (!rsp.ok) {
        const text = await rsp.text().catch(() => "");
        throw new Error(`POST /posts ${rsp.status}: ${text || rsp.statusText}`);
    }
    return rsp.json();
}