import { useEffect, useState, type JSX } from "react";
import { getAllPosts, type LocalPost } from "@/lib";
import { FiFileText, FiCheckCircle, FiEdit3, FiTag } from "react-icons/fi";

type Stat = {
  label: string;
  value: number | string;
  icon: JSX.Element;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const posts = getAllPosts();
    const published = posts.filter(p => p.status === "published").length;
    const drafts = posts.filter(p => p.status === "draft").length;
    const tagsSet = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => tagsSet.add(t)));

    setStats([
      { label: "Total artículos", value: posts.length, icon: <FiFileText /> },
      { label: "Publicados", value: published, icon: <FiCheckCircle /> },
      { label: "Borradores", value: drafts, icon: <FiEdit3 /> },
      { label: "Tags únicos", value: tagsSet.size, icon: <FiTag /> },
    ]);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/10 bg-[var(--surface-2)]/80 p-4 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-semibold text-[var(--color-title)]">{s.value}</div>
              <div className="text-xs text-white/70">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
