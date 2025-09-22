import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { addComment, deleteComment, listCommentsByGraphSlug } from "@/services";

const LS_USER_KEY = "dt:user";
const CLIENT_KEY = "dt:clientId";

type CachedUser = { username: string };

function cacheUser(username: string | null) {
  try {
    if (!username) localStorage.removeItem(LS_USER_KEY);
    else localStorage.setItem(LS_USER_KEY, JSON.stringify({ username } as CachedUser));
  } catch { }
}
function getCachedUser(): string | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUser;
    return parsed?.username || null;
  } catch {
    return null;
  }
}

type Props = {
  postId: number;
  slug?: string;
  initialComments?: { id: string; name: string; text: string; ts: number }[];
};

type Comment = { id: string; name: string; text: string; ts: number; clientId: string };

const KEY = (key: string) => `dt:cmt:${key}`;

function localId() {
  const r = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
  return `local-${r}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const minuteDiff = (a: number, b: number) => Math.abs(Math.floor(a / 60000) - Math.floor(b / 60000));

export default function Comments({ postId, slug, initialComments = [] }: Props) {
  const [clientId, setClientId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const storageKey = KEY(slug ?? String(postId));

  useEffect(() => {
    try {
      const id = localStorage.getItem(CLIENT_KEY) || localId();
      localStorage.setItem(CLIENT_KEY, id);
      setClientId(id);

      setUsername(getCachedUser());

      const onStorage = (e: StorageEvent) => {
        if (e.key === LS_USER_KEY) setUsername(getCachedUser());
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    } catch { }
  }, []);

  useEffect(() => {
    const server: Comment[] = (initialComments || []).map((c) => ({ ...c, clientId: "" }));

    let local: Comment[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) local = JSON.parse(raw) as Comment[];
    } catch { }

    const serverByText = new Map(server.map((c) => [c.text.trim(), c] as const));
    local = local.filter((c) => {
      if (!c.id.startsWith("local-")) return true;
      const s = serverByText.get(c.text.trim());
      return !s || minuteDiff(s.ts, c.ts) > 1440;
    });

    const onlyOptimisticNotCovered = local.filter(
      (c) => c.id.startsWith("local-") && !serverByText.has(c.text.trim())
    );

    const merged = [...server, ...onlyOptimisticNotCovered].sort((a, b) => b.ts - a.ts);
    const marked = markMine(merged, username, clientId);
    setComments(marked);
    try { localStorage.setItem(storageKey, JSON.stringify(marked)); } catch { }
  }, [storageKey, initialComments, username, clientId]);

  useEffect(() => {
    if (!comments.length) return;
    const marked = markMine(comments, username, clientId);
    if (marked !== comments) setComments(marked);
  }, [username, clientId]);

  const persist = (next: Comment[]) => {
    setComments(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { }
  };

  function markMine(list: Comment[], username: string | null, clientId: string) {
    if (!username || !clientId) return list;
    const u = username.trim().toLowerCase();
    let touched = false;
    const out = list.map(c => {
      const n = (c.name ?? "").trim().toLowerCase();
      if (n && n === u && c.clientId !== clientId) {
        touched = true;
        return { ...c, clientId };
      }
      return c;
    });
    return touched ? out : list;
  }

  async function refreshAndReconcile(optimistic?: Comment, currentLocal: Comment[] = []) {
    if (!slug) return;

    const tryOnce = async () => {
      const server = await listCommentsByGraphSlug(slug!);
      if (!server.length) return null;

      let serverMapped: Comment[] = server.map((s: any) => ({
        id: String(s.id),
        name: (s.name ?? s.authorName ?? "Anónimo") as string,
        text: s.text || s.content || "",
        ts: s.ts || (s.createdAt ? Date.parse(s.createdAt) : Date.now()),
        clientId: "",
      }));

      if (username) {
        const u = username.toLowerCase();
        for (const c of serverMapped) {
          if (c.name && c.name.toLowerCase() === u) c.clientId = clientId;
        }
      }

      if (optimistic) {
        const sameText = serverMapped.filter((s) => s.text.trim() === optimistic.text.trim());
        if (sameText.length) {
          let best = sameText[0];
          let bestDiff = minuteDiff(best.ts, optimistic.ts);
          for (let i = 1; i < sameText.length; i++) {
            const d = minuteDiff(sameText[i].ts, optimistic.ts);
            if (d < bestDiff) { best = sameText[i]; bestDiff = d; }
          }
          if (bestDiff <= 5) {
            const idx = serverMapped.findIndex((x) => x.id === best.id);
            if (idx !== -1) serverMapped[idx].clientId = clientId;
            currentLocal = currentLocal.filter((c) => c.id !== optimistic.id);
          }
        }
      }

      const serverTexts = new Set(serverMapped.map((c) => c.text.trim()));
      const onlyOptimisticNotCovered = currentLocal.filter(
        (c) => c.id.startsWith("local-") && !serverTexts.has(c.text.trim())
      );

      return [...serverMapped, ...onlyOptimisticNotCovered].sort((a, b) => b.ts - a.ts);
    };

    let merged = await tryOnce();
    if (!merged) {
      await sleep(400);
      merged = await tryOnce();
    }
    if (merged) persist(merged);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = (name || "Anónimo").trim();
    const t = (text || "").trim();
    if (t.length < 3 || submitting) return;

    const optimistic: Comment = { id: localId(), name: n, text: t, ts: Date.now(), clientId };
    const snapshot = comments;
    const withOptimistic = [optimistic, ...comments].slice(0, 200);
    persist(withOptimistic);
    setText("");
    setSubmitting(true);

    try {
      const saved: any = await addComment({ content: t, postId });

      const backendName: string | undefined =
        saved?.author?.name ?? saved?.authorName ?? saved?.author?.username ?? undefined;

      if (backendName && backendName.trim()) {
        cacheUser(backendName.trim());
        setUsername(backendName.trim());
      }

      await refreshAndReconcile(optimistic, withOptimistic);
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "No se pudo enviar el comentario");
      persist(snapshot);
    } finally {
      setSubmitting(false);
    }
  };

  const canDelete = (c: Comment) =>
    (username && (c.name ?? "").trim().toLowerCase() === username.trim().toLowerCase()) ||
    c.clientId === clientId;

  const del = async (id: string) => {
    const target = comments.find((x) => x.id === id);
    if (!target) return;
    if (!canDelete(target)) return;
    if (!confirm("¿Eliminar tu comentario?")) return;

    const snapshot = comments;
    persist(comments.filter((x) => x.id !== id));

    try {
      await deleteComment(id);
    } catch (e) {
      alert((e as Error)?.message || "No se pudo eliminar el comentario");
      persist(snapshot);
    }
  };

  const sorted = useMemo(() => [...comments].sort((a, b) => b.ts - a.ts), [comments]);
  const format = (ts: number) => new Date(ts).toLocaleString("es-NI", { dateStyle: "medium", timeStyle: "short" });

  const Avatar = ({ name }: { name: string }) => {
    const letter = (name?.[0] || "A").toUpperCase();
    return (
      <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold">
        {letter}
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--surface-2)]/70 p-5 backdrop-blur">
      <h2 className="text-lg font-semibold text-[var(--color-title)]">
        Comentarios ({comments.length})
      </h2>

      <div className="mt-6 space-y-4">
        {sorted.map((c) => (
          <div key={`${c.id}-${c.ts}`} className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <Avatar name={c.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-medium text-[var(--color-title)]">{c.name}</span>
                  <span className="ml-2 text-xs text-[var(--color-text)]/60">{format(c.ts)}</span>
                </div>
                {canDelete(c) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => del(c.id)}
                    className="!text-[var(--color-text)]/60 hover:!text-red-400"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[var(--color-text)]">{c.text}</p>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-[var(--color-text)]/60">Sé el primero en comentar ✍️</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-12 space-y-3">
        {/* Si deseas capturar nombre visible, descomenta y usa `name`
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="w-full rounded-lg border border-white/10 bg-[var(--color-bg)] p-3 text-[var(--color-text)] placeholder-white/40"
        /> */}
        <div className="grid gap-3 sm:grid-cols-[1fr]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu comentario…"
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-[var(--color-bg)] p-3 text-[var(--color-text)]
                       placeholder-white/40 focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text)]/60">Sin cuenta. Se guardará en este navegador.</p>
          <Button type="submit" size="sm" disabled={text.trim().length < 3 || submitting} className="disabled:opacity-50">
            {submitting ? "Enviando…" : "Comentar"}
          </Button>
        </div>
      </form>
    </section>
  );
}
