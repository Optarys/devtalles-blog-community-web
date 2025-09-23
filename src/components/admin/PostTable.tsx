import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { getAllPosts, deletePost, toggleStatus, type LocalPost } from "@/lib";
import { Button } from "@/components/ui";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function PostTable() {
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const refresh = () => setPosts(getAllPosts());
  useEffect(() => { refresh(); }, []);

  // toasts
  const ok = (m: string) =>
    toast.success(m, { style: { background: "var(--surface-2)", color: "var(--color-text)", border: "1px solid rgba(255,255,255,0.08)" }});
  const err = (m: string) =>
    toast.error(m, { style: { background: "var(--surface-2)", color: "var(--color-text)", border: "1px solid rgba(255,255,255,0.12)" }});

  const confirmToast = (msg: string) =>
    new Promise<boolean>((resolve) => {
      toast.custom(
        (t) => (
          <div className="max-w-sm w-full rounded-xl border border-white/10 bg-[var(--surface-2)] text-[var(--color-text)] shadow-xl backdrop-blur p-4">
            <p className="text-sm">{msg}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                className="rounded-md px-3 py-1.5 text-sm font-medium bg-red-500/90 hover:bg-red-500 text-white"
                onClick={() => (toast.dismiss(t.id), resolve(true))}
              >
                Eliminar
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20"
                onClick={() => (toast.dismiss(t.id), resolve(false))}
              >
                Cancelar
              </button>
            </div>
          </div>
        ),
        { duration: 60000 }
      );
    });

  const onDelete = async (id: string) => {
    if (!(await confirmToast("¿Eliminar esta publicación?"))) return;
    const snapshot = posts;
    setPosts((p) => p.filter((x) => x.id !== id));
    try { await deletePost(id); ok("Publicación eliminada ✅"); }
    catch { setPosts(snapshot); err("No se pudo eliminar la publicación"); }
  };

  const onToggle = async (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
    try { await toggleStatus(id); ok("Estado actualizado"); }
    catch { refresh(); err("No se pudo cambiar el estado"); }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts
      .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
      .filter((p) => term
        ? p.title.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(term))
        : true
      );
  }, [posts, q, statusFilter]);

  const showHeaderCTA = posts.length > 0 || q.length > 0 || statusFilter !== "all";
  const formatDate = (d: string) => (new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" })).format(new Date(d));

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--surface-2)]/80 backdrop-blur">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-title)]">Publicaciones</h2>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* Búsqueda */}
          <div className="relative w-full sm:w-72">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, slug o tag…"
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-[var(--color-text)]
                         placeholder-white/40 focus:border-[var(--color-accent)] focus:outline-none"
            />
          </div>

          {/* Filtro */}
          <div className="flex items-center gap-2">
            <FiFilter className="opacity-60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)]
                         focus:border-[var(--color-accent)] focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {showHeaderCTA && (
            <Button href="/admin/posts/new" icon={<FiPlus />} className="!px-4">
              Nueva publicación
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <Table
          hoverable
          className="
            !bg-transparent w-full
            [&_thead]:!bg-transparent
            [&_thead_th]:!bg-transparent [&_thead_th]:!text-[var(--color-text)]/75
            [&_tbody_tr]:!bg-transparent
            [&_td]:!bg-transparent [&_td]:!text-[var(--color-text)]
          "
        >
          <TableHead className="!bg-white/5">
            <TableHeadCell className="!text-[var(--color-text)]/80">Título</TableHeadCell>
            <TableHeadCell className="!text-[var(--color-text)]/80">Estado</TableHeadCell>
            <TableHeadCell className="!text-[var(--color-text)]/80">Fecha</TableHeadCell>
            <TableHeadCell className="!text-[var(--color-text)]/80">Tags</TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Acciones</span>
            </TableHeadCell>
          </TableHead>

          <TableBody className="divide-y divide-white/10">
            {filtered.map((p) => (
              <TableRow key={p.id} className="!bg-transparent transition-colors hover:bg-white/[0.06]">
                <TableCell className="whitespace-normal">
                  <div className="font-medium text-[var(--color-title)]">{p.title}</div>
                  <div className="text-xs text-white/60">{p.slug}</div>
                </TableCell>

                <TableCell>
                  {p.status === "published" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      ● Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                      ● Borrador
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-[var(--color-text)]/85">
                  {formatDate(p.date)}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/12 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button href={`/admin/posts/${p.id}/edit`} variant="outline" size="sm" icon={<FiEdit />}>
                      Editar
                    </Button>
                    <Button onClick={() => onToggle(p.id)} size="sm">
                      {p.status === "published" ? "Despublicar" : "Publicar"}
                    </Button>
                    <Button onClick={() => onDelete(p.id)} size="sm" variant="ghost" icon={<FiTrash2 />} className="!text-white/70 hover:!text-red-400">
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--color-text)]">
                      No hay resultados
                    </div>
                    <p className="text-center text-white/70">
                      {posts.length === 0
                        ? "Aún no hay publicaciones. Crea la primera."
                        : "No encontramos publicaciones con ese filtro."}
                    </p>
                    {/* CTA aquí cuando no hay ninguna publicación */}
                    {posts.length === 0 && (
                      <Button href="/admin/posts/new">Crear publicación</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
