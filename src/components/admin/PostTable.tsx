import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "flowbite-react";
import {
  getAllPosts,
  deletePost,
  toggleStatus,
  type LocalPost,
} from "@/lib";
import { Button } from "@/components/ui";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

export default function PostTable() {
  const [posts, setPosts] = useState<LocalPost[]>([]);

  const refresh = () => setPosts(getAllPosts());
  useEffect(() => {
    refresh();
  }, []);

  const onDelete = (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    deletePost(id);
    refresh();
  };

  const onToggle = (id: string) => {
    toggleStatus(id);
    refresh();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 backdrop-blur">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-[var(--color-title)]">
          Publicaciones
        </h2>
        <Button href="/admin/posts/new" icon={<FiPlus />} className="!px-4">
          Nueva publicación
        </Button>
      </div>

      <Table hoverable>
        <TableHead>
          <TableHeadCell>Título</TableHeadCell>
          <TableHeadCell>Estado</TableHeadCell>
          <TableHeadCell>Fecha</TableHeadCell>
          <TableHeadCell>Tags</TableHeadCell>
          <TableHeadCell>
            <span className="sr-only">Acciones</span>
          </TableHeadCell>
        </TableHead>

        <TableBody className="divide-y divide-white/10">
          {posts.map((p) => (
            <TableRow key={p.id} className="bg-transparent">
              <TableCell className="whitespace-normal">
                <div className="font-medium text-[var(--color-title)]">
                  {p.title}
                </div>
                <div className="text-xs text-white/60">{p.slug}</div>
              </TableCell>

              <TableCell>
                <Badge color={p.status === "published" ? "success" : "warning"}>
                  {p.status === "published" ? "Publicado" : "Borrador"}
                </Badge>
              </TableCell>

              <TableCell className="text-sm">{p.date}</TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[var(--color-accent)]/18 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    href={`/admin/posts/${p.id}/edit`}
                    variant="outline"
                    size="sm"
                    icon={<FiEdit />}
                  >
                    Editar
                  </Button>
                  <Button onClick={() => onToggle(p.id)} size="sm">
                    {p.status === "published" ? "Despublicar" : "Publicar"}
                  </Button>
                  <Button
                    onClick={() => onDelete(p.id)}
                    size="sm"
                    variant="ghost"
                    icon={<FiTrash2 />}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-white/70">
                Aún no hay publicaciones. Crea la primera.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
