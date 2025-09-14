export type Post = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover: string;         // URL de imagen
    tags: string[];
    content: string;       // markdown o texto
    status: "draft" | "published";
    date: string;          // ISO o dd/mm/yyyy
};

const KEY = "devtalles_posts";

function safeRead(): Post[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Post[]) : [];
    } catch {
        return [];
    }
}
function safeWrite(posts: Post[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(posts));
}

export function getAllPosts(): Post[] {
    return safeRead().sort((a, b) => (a.date < b.date ? 1 : -1));
}
export function getPost(id: string): Post | undefined {
    return safeRead().find((p) => p.id === id);
}
export function upsertPost(post: Post) {
    const list = safeRead();
    const i = list.findIndex((p) => p.id === post.id);
    if (i >= 0) list[i] = post;
    else list.push(post);
    safeWrite(list);
}
export function deletePost(id: string) {
    const list = safeRead().filter((p) => p.id !== id);
    safeWrite(list);
}
export function toggleStatus(id: string) {
    const list = safeRead().map((p) =>
        p.id === id
            ? { ...p, status: (p.status === "draft" ? "published" : "draft") as "draft" | "published" }
            : p
    );
    safeWrite(list);
}
