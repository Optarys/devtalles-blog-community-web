import { useEffect, useMemo, useState } from "react";
import { Textarea, TextInput, Select } from "flowbite-react";
import { Button } from "@/components";
import {
  FiTag,
  FiX,
  FiImage,
  FiEdit3,
  FiSettings
} from "react-icons/fi";
import { slugify } from "@/lib";
import { createPost } from "@/services/admin/api";
import toast, { Toaster } from "react-hot-toast";

// 👇 Nuevo import para Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  categories?: { name: string; slug: string; description?: string | null }[];
};

export default function PostForm({
  postId,
  mode,
  categories: initialCategories
}: Props) {
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
    date: new Date().toISOString().slice(0, 10)
  };

  const [data, setData] = useState<LocalPost>(initial);
  const [tagText, setTagText] = useState("");
  const [banners, setBanners] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [catOptions] = useState(
    initialCategories ??
      ([] as { name: string; slug: string; description?: string | null }[])
  );
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryManual, setCategoryManual] = useState("");

  const autoSlug = useMemo(() => slugify(data.title), [data.title]);

  // Preview de la imagen principal (primer banner)
  useEffect(() => {
    if (!banners.length) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(banners[0]);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [banners]);

  useEffect(() => {
    if (editing && postId) {
      // Aquí podrías cargar el post por ID y setear estado
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

  function wordCount(s: string) {
    return (s.trim().match(/\b\w+\b/g) || []).length;
  }

  const titleChars = data.title.trim().length;
  const excerptChars = data.excerpt.trim().length;
  const contentWords = wordCount(data.content);
  const titlePct = Math.min(
    100,
    Math.round((titleChars / 60) * 100)
  );
  const excerptPct = Math.min(
    100,
    Math.round((excerptChars / 160) * 100)
  );
  const contentPct = Math.min(
    100,
    Math.round((contentWords / 800) * 100)
  );

  function bar(pct: number) {
    return (
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-[var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }

  async function save(status: "draft" | "published") {
    if (!data.title.trim()) {
      toast.error("Falta el título.");
      return;
    }
    if (!data.content.trim()) {
      toast.error("Falta el contenido.");
      return;
    }

    const resolvedCategorySlug =
      categorySlug ||
      (categoryManual.trim()
        ? slugify(categoryManual.trim())
        : undefined);

    try {
      setSaving(true);

      const seoMeta = {
        description: data.excerpt || data.content.slice(0, 160),
        keywords: data.tags
      };

      await createPost({
        title: data.title,
        summary: data.excerpt,
        content: data.content,
        category: resolvedCategorySlug,
        tags: data.tags,
        seoMeta,
        status,
        banners
      });

      toast.success(
        status === "published" ? "¡Publicado! 🎉" : "Borrador guardado 💾"
      );
      setTimeout(() => (window.location.href = "/admin/posts"), 350);
    } catch (err) {
      console.error(err);
      toast.error(
        (err as Error).message || "Error al crear la publicación"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <Toaster position="bottom-right" />

      {/* Barra de acciones sticky */}
      <div
        className="sticky top-0 z-20 -mx-5 -mt-5 mb-5 bg-[var(--surface-2)]/75 backdrop-blur
                      border-b border-white/10 px-5 py-3 rounded-t-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[var(--color-text)]">
              <FiEdit3 /> {editing ? "Editar publicación" : "Nueva publicación"}
            </span>
            <span className="hidden text-[var(--color-text)]/60 sm:inline">
              • {titleChars} chars título · {excerptChars} chars resumen ·{" "}
              {contentWords} palabras
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => save("draft")}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar borrador"}
            </Button>
            <Button onClick={() => save("published")} disabled={saving}>
              {saving ? "Publicando…" : "Publicar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        {/* Columna izquierda: contenido */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-[var(--color-title)]">
              <FiEdit3 /> <span className="font-medium">Contenido</span>
            </div>

            {/* Título */}
            <TextInput
              value={data.title}
              onChange={(e) =>
                setData({ ...data, title: e.target.value })
              }
              placeholder="Título del artículo"
              required
            />
            <div className="mt-1 flex items-center justify-between text-xs text-white/60">
              <span>Recomendado 30–60 caracteres</span>
              <span>{titleChars} / 60</span>
            </div>
            <div className="mt-1">{bar(titlePct)}</div>

            {/* Slug */}
            <div className="mt-4 grid gap-1">
              <TextInput
                value={data.slug || autoSlug}
                onChange={(e) =>
                  setData({ ...data, slug: slugify(e.target.value) })
                }
                placeholder="slug-del-articulo"
              />
              <span className="text-xs text-white/60">
                Puedes dejarlo vacío: el backend puede generar su propio slug.
              </span>
            </div>

            {/* Resumen */}
            <div className="mt-4">
              <TextInput
                value={data.excerpt}
                onChange={(e) =>
                  setData({ ...data, excerpt: e.target.value })
                }
                placeholder="Resumen corto del artículo (summary)"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-white/60">
                <span>Meta descripción ≤ 160 caracteres</span>
                <span>{excerptChars} / 160</span>
              </div>
              <div className="mt-1">{bar(excerptPct)}</div>
            </div>

            {/* Contenido */}
            <div className="mt-4">
              <Textarea
                rows={14}
                value={data.content}
                onChange={(e) =>
                  setData({ ...data, content: e.target.value })
                }
                placeholder="Contenido (puedes escribir Markdown)."
              />
              <div className="mt-1 flex items-center justify-between text-xs text-white/60">
                <span>Sugerido 800+ palabras</span>
                <span>{contentWords} palabras</span>
              </div>
              <div className="mt-1">{bar(contentPct)}</div>
            </div>

            {/* Vista previa Markdown */}
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              <div className="mb-2 font-semibold text-[var(--color-title)]">
                Vista previa (Markdown)
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.content || "Empieza a escribir…"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: medios / metadatos */}
        <div className="space-y-4">
          {/* Medios / portada */}
          <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-[var(--color-title)]">
              <FiImage /> <span className="font-medium">Imágenes</span>
            </div>

            <label className="mb-1 block text-sm text-white/80">
              Banners (imágenes)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setBanners(Array.from(e.target.files || []))
              }
              className="block w-full text-sm text-white/80
                         file:mr-3 file:rounded-md file:border-0
                         file:bg-[var(--color-accent)]/20 file:px-3 file:py-1.5
                         file:text-[var(--color-accent)] hover:file:bg-[var(--color-accent)]/30"
            />

            {(coverPreview || data.cover) && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                <img
                  src={coverPreview || data.cover}
                  alt="Vista previa de portada"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-[var(--color-title)]">
              <FiSettings /> <span className="font-medium">Metadatos</span>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <label className="block text-sm text-white/80">Categoría</label>
              {catOptions?.length ? (
                <Select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {catOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </Select>
              ) : (
                <TextInput
                  value={categoryManual}
                  onChange={(e) => setCategoryManual(e.target.value)}
                  placeholder="Categoría (escribe una nueva)"
                />
              )}
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="mb-1 block text-sm text-white/80">
                Tags
              </label>
              <div className="flex gap-2">
                <TextInput
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
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
                    <button
                      className="text-[10px]"
                      onClick={() => removeTag(t)}
                      title="Quitar"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Fecha / Estado */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-white/80">
                  Fecha
                </label>
                <TextInput
                  type="date"
                  value={data.date}
                  onChange={(e) =>
                    setData({ ...data, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-white/80">
                  Estado
                </label>
                <Select
                  value={data.status}
                  onChange={(e) =>
                    setData({
                      ...data,
                      status: e.target.value as LocalPost["status"]
                    })
                  }
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de formulario */}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => save("draft")}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar borrador"}
        </Button>
        <Button onClick={() => save("published")} disabled={saving}>
          {saving ? "Publicando…" : "Publicar"}
        </Button>
      </div>
    </div>
  );
}
