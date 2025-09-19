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
import { Button } from "@/components/ui";
import { FiEdit } from "react-icons/fi";
import { getAllPosts, type LocalPost } from "@/lib";

export default function RecentPosts() {
  const [rows, setRows] = useState<LocalPost[]>([]);

  useEffect(() => {
    const list = getAllPosts().slice(0, 5);
    setRows(list);
  }, []);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-white/70">Sin publicaciones aún.</p>;
  }

  return (
    <Table hoverable>
      <TableHead>
        <TableHeadCell>Título</TableHeadCell>
        <TableHeadCell>Estado</TableHeadCell>
        <TableHeadCell>Fecha</TableHeadCell>
        <TableHeadCell>
          <span className="sr-only">Acciones</span>
        </TableHeadCell>
      </TableHead>

      <TableBody className="divide-y divide-white/10">
        {rows.map((p) => (
          <TableRow key={p.id} className="bg-transparent">
            <TableCell>
              <div className="font-medium text-[var(--color-title)]">{p.title}</div>
              <div className="text-xs text-white/60">{p.slug}</div>
            </TableCell>
            <TableCell>
              <Badge color={p.status === "published" ? "success" : "warning"}>
                {p.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">{p.date}</TableCell>
            <TableCell className="text-right">
              <Button
                href={`/admin/posts/${p.id}/edit`}
                size="sm"
                variant="outline"
                icon={<FiEdit />}
              >
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
