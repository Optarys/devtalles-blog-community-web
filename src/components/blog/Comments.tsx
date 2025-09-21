import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { addComment } from "@/services"; // POST /comments { content, slugPost }

type Props = {
  slug: string;
  // Lo que viene del servidor (ya mapeado en el servicio con authorName & createdAt -> name & ts)
  initialComments?: { id: string; name: string; text: string; ts: number }[];
};

type Comment = { id: string; name: string; text: string; ts: number; clientId: string };

const KEY = (slug: string) => `dt:cmt:${slug}`;
const CLIENT_KEY = "dt:clientId";

// id para cliente (y para comentarios optimistas)
function localId() {
  const r = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
  return `local-${r}`;
}

// firma simple para reconciliar optimistas: mismo contenido en la misma ventana de minuto
function signature(text: string, ts: number) {
  const min = Math.floor(ts / 60000);
  return `${text.trim()}::${min}`;
}

export default function Comments({ slug, initialComments = [] }: Props) {
  const [clientId, setClientId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");    // opcional si luego quieres capturarlo
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Asegura un clientId por navegador
  useEffect(() => {
    try {
      const id = localStorage.getItem(CLIENT_KEY) || localId();
      localStorage.setItem(CLIENT_KEY, id);
      setClientId(id);
    } catch {}
  }, []);

  // Merge: servidor (prioridad) + optimistas locales no cubiertos
  useEffect(() => {
    const server: Comment[] = (initialComments || []).map((c) => ({ ...c, clientId: "" }));

    let local: Comment[] = [];
    try {
      const raw = localStorage.getItem(KEY(slug));
      if (raw) local = JSON.parse(raw) as Comment[];
    } catch {}

    // Índice de firmas del server para detectar duplicados de optimistas
    const serverSig = new Set(server.map((c) => signature(c.text, c.ts)));

    // Conserva SOLO optimistas (id local-*) que no estén cubiertos por el server
    const onlyOptimisticNotCovered = local.filter((c) => {
      const isOptimistic = c.id.startsWith("local-");
      if (!isOptimistic) return false;
      return !serverSig.has(signature(c.text, c.ts));
    });

    // Prioriza server y añade optimistas restantes
    const merged = [...server, ...onlyOptimisticNotCovered].sort((a, b) => b.ts - a.ts);

    setComments(merged);
    try { localStorage.setItem(KEY(slug), JSON.stringify(merged)); } catch {}
  }, [slug, initialComments]);

  const persist = (next: Comment[]) => {
    setComments(next);
    try { localStorage.setItem(KEY(slug), JSON.stringify(next)); } catch {}
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = (name || "Anónimo").trim();
    const t = (text || "").trim();
    if (t.length < 3 || submitting) return;

    // Optimista
    const optimistic: Comment = { id: localId(), name: n, text: t, ts: Date.now(), clientId };
    const snapshot = comments;
    const next = [optimistic, ...comments].slice(0, 200);
    persist(next);
    setText("");
    setSubmitting(true);

    try {
      await addComment({ content: t, slugPost: slug });
      // No hacemos refetch: en la próxima visita (o SSR) el server traerá el real
      // y el merge eliminará este optimista si coincide por firma.
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "No se pudo enviar el comentario");
      persist(snapshot); // rollback
    } finally {
      setSubmitting(false);
    }
  };

  // Solo se permite borrar los que creó este cliente (optimistas locales)
  const del = (id: string) => {
    const c = comments.find((x) => x.id === id);
    if (!c) return;
    if (c.clientId !== clientId) return;
    if (!confirm("¿Eliminar tu comentario?")) return;
    persist(comments.filter((x) => x.id !== id));
  };

  const sorted = useMemo(() => [...comments].sort((a, b) => b.ts - a.ts), [comments]);

  const format = (ts: number) =>
    new Date(ts).toLocaleString("es-NI", { dateStyle: "medium", timeStyle: "short" });

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
                {c.clientId === clientId && (
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
        {/* Si deseas capturar nombre visible, descomenta y usa `name` arriba
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
