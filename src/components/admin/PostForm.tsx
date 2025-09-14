import { useEffect, useMemo, useState } from "react";
import { Textarea, TextInput, Select } from "flowbite-react";
import Button from "@/components/ui/Button";
import { upsertPost, getPost, type Post } from "@/lib/adminStore";
import slugify from "@/lib/slugify";
import { FiTag, FiX } from "react-icons/fi";

type Props = {
  postId?: string;           // si existe = editar
  mode: "create" | "edit";
};

export default function PostForm({ postId, mode }: Props) {
  const editing = mode === "edit";
  const initial: Post = {
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

  const [data, setData] = useState<Post>(initial);
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    if (editing && postId) {
      const p = getPost(postId);
      if (p) setData(p);
    }
  }, [editing, postId]);

  const autoSlug = useMemo(() => slugify(data.title), [data.title]);

  const addTag = () => {
    const clean = tagText.trim();
    if (!clean) return;
    if (data.tags.includes(clean)) return;
    setData({ ...data, tags: [...data.tags, clean] });
    setTagText("");
  };
  const removeTag = (t: string) => setData({ ...data, tags: data.tags.filter((x) => x !== t) });

  const save = (status: "draft" | "published") => {
    const payload: Post = {
      ...data,
      slug: data.slug || autoSlug,
      status,
      date: data.date || new Date().toISOString().slice(0, 10),
    };
    upsertPost(payload);
    window.location.href = "/admin/posts";
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-title)]">
          {editing ? "Editar publicación" : "Nueva publicación"}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" href="/admin/posts">Cancelar</Button>
          <Button onClick={() => save("draft")} variant="outline">Guardar borrador</Button>
          <Button onClick={() => save("published")}>Publicar</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <TextInput
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="Título del artículo"
            required
          />
          <TextInput
            value={data.slug || autoSlug}
            onChange={(e) => setData({ ...data, slug: slugify(e.target.value) })}
            placeholder="slug-del-articulo"
          />
          <span className="text-xs text-gray-400">Puedes dejarlo vacío y se genera desde el título.</span>
          <TextInput
            value={data.excerpt}
            onChange={(e) => setData({ ...data, excerpt: e.target.value })}
            placeholder="Resumen corto del artículo"
          />
          <TextInput
            value={data.cover}
            onChange={(e) => setData({ ...data, cover: e.target.value })}
            placeholder="URL de la imagen de portada"
          />
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
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/18 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                  {t}
                  <button className="text-[10px]" onClick={() => removeTag(t)} title="Quitar">
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
            <Select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value as Post["status"] })}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </Select>
          </div>
        </div>

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
            <div className="whitespace-pre-wrap">{data.content || "Empieza a escribir…"} </div>
          </div>
        </div>
      </div>
    </div>
  );
}
