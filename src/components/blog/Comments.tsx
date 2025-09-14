import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button.tsx";

type Props = { slug: string };
type Comment = { id: string; name: string; text: string; ts: number; clientId: string };

const KEY = (slug: string) => `dt:cmt:${slug}`;
const CLIENT_KEY = "dt:clientId";

function uuid() {
  return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
}

export default function Comments({ slug }: Props) {
  const [clientId, setClientId] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const id = localStorage.getItem(CLIENT_KEY) || uuid();
      localStorage.setItem(CLIENT_KEY, id);
      setClientId(id);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY(slug));
      if (raw) setComments(JSON.parse(raw));
    } catch {}
  }, [slug]);

  const save = (next: Comment[]) => {
    setComments(next);
    try {
      localStorage.setItem(KEY(slug), JSON.stringify(next));
    } catch {}
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = (name || "Anónimo").trim();
    const t = (text || "").trim();
    if (t.length < 3) return;
    const c: Comment = { id: uuid(), name: n, text: t, ts: Date.now(), clientId };
    const next = [c, ...comments].slice(0, 200);
    save(next);
    setText("");
  };

  const del = (id: string) => {
    const c = comments.find((x) => x.id === id);
    if (!c) return;
    if (c.clientId !== clientId) return;
    if (!confirm("¿Eliminar tu comentario?")) return;
    save(comments.filter((x) => x.id !== id));
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
      <h2 className="text-lg font-semibold text-[var(--color-title)]">Comentarios ({comments.length})</h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="w-full rounded-lg border border-white/10 bg-[var(--color-bg)] p-3 text-[var(--color-text)]
                       placeholder-white/40 focus:border-[var(--color-accent)] focus:outline-none"
          />
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

          <Button
            type="submit"
            size="sm"
            disabled={text.trim().length < 3}
            className="disabled:opacity-50"
          >
            Comentar
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {sorted.map((c) => (
          <div key={c.id} className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
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
    </section>
  );
}
