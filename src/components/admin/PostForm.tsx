import { useEffect, useMemo, useState } from "react";
import { Textarea, TextInput, Select } from "flowbite-react";
import { Button } from "@/components";
import { FiTag, FiX } from "react-icons/fi";
import { slugify } from "@/lib";
import { createPost } from "@/services/admin/api";

type LocalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
  date: string;
};

type Props = {
  postId?: string;
  mode: "create" | "edit";
};

export default function PostForm({ postId, mode }: Props) {
  const editing = mode === "edit";

  const initial: LocalPost = {
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    excerpt: "",
    cover: "/covers/default.jpg",
    tags: [],
    content: "",
    status: "draft",
    date: new Date().toISOString().slice(0, 10),
  };

  const [data, setData] = useState<LocalPost>(initial);
  const [tagText, setTagText] = useState("");
  const [category, setCategory] = useState("");     // slug o nombre
  const [banners, setBanners] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const autoSlug = useMemo(() => slugify(data.title), [data.title]);

  // Si más adelante quieres cargar datos para editar, conéctalo aquí.
  useEffect(() => {
    if (editing && postId) {
      // TODO: traer post desde API para edición (cuando tengamos endpoint)
      // setData(mappedPost);
    }
  }, [editing, postId]);

  const addTag = () => {
    const clean = tagText.trim();
    if (!clean || data.tags.includes(clean)) return;
    setData({ ...data, tags: [...data.tags, clean] });
    setTagText("");
  };

  const removeTag = (t: string) =>
    setData({ ...data, tags: data.tags.filter((x) => x !== t) });

  async function save(status: "draft" | "published") {
    if (!data.title.trim()) return alert("Falta el título.");
    if (!data.content.trim()) return alert("Falta el contenido.");

    try {
      setSaving(true);

      const seoMeta = {
        description: data.excerpt || data.content.slice(0, 160),
        keywords: data.tags,
      };

      await createPost({
        title: data.title,
        summary: data.excerpt,
        content: data.content,
        category: category || undefined,
        tags: data.tags,
        seoMeta,
        status,
        banners,
      });

      window.location.href = "/admin/posts";
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Error al crear la publicación");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-title)]">
          {editing ? "Editar publicación" : "Nueva publicación"}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            href="/admin/posts"
            onClick={(e) => {
              if (saving) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            aria-disabled={saving}
            className={saving ? "pointer-events-none opacity-60" : undefined}
          >
            Cancelar
          </Button>
          <Button onClick={() => save("draft")} variant="outline" disabled={saving}>
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
          <Button onClick={() => save("published")} disabled={saving}>
            {saving ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {}
          <TextInput
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Título del artículo"
            required
          />

          {}
          <TextInput
            value={data.slug || autoSlug}
            onChange={(e) => setData({ ...data, slug: slugify(e.target.value) })}
            placeholder="slug-del-articulo"
          />
          <span className="text-xs text-gray-400">
            Puedes dejarlo vacío: se muestra como vista previa; el backend puede generar su propio slug.
          </span>

          {}
          <TextInput
            value={data.excerpt}
            onChange={(e) => setData({ ...data, excerpt: e.target.value })}
            placeholder="Resumen corto del artículo (summary)"
          />

          {}
          <TextInput
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Categoría (slug o nombre)"
          />

          {}
          <div>
            <label className="mb-1 block text-sm text-white/80">Banners (imágenes)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setBanners(Array.from(e.target.files || []))}
              className="block w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-accent)]/20 file:px-3 file:py-1.5 file:text-[var(--color-accent)] hover:file:bg-[var(--color-accent)]/30"
            />
            {!!banners.length && (
              <div className="mt-2 text-xs text-white/60">
                {banners.length} archivo(s) listo(s) para subir
              </div>
            )}
          </div>

          {}
          <div>
            <label className="mb-1 block text-sm text-white/80">Tags</label>
            <div className="flex gap-2">
              <TextInput
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Escribe un tag y presiona Enter"
                icon={FiTag}
              />
              <Button onClick={addTag}>Añadir</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/18 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]"
                >
                  {t}
                  <button className="text-[10px]" onClick={() => removeTag(t)} title="Quitar">
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
            <Select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value as LocalPost["status"] })}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </Select>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          <Textarea
            rows={14}
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            placeholder="Contenido (puedes escribir Markdown)."
          />
          {/* Vista previa simple */}
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
            <div className="mb-2 font-semibold text-[var(--color-title)]">Vista previa</div>
            <div className="whitespace-pre-wrap">
              {data.content || "Empieza a escribir…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
