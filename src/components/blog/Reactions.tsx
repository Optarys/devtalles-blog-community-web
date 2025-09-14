import { useEffect, useState, type JSX } from "react";
import { FiThumbsUp, FiHeart, FiBookmark } from "react-icons/fi";
import Button from "@/components/ui/Button.tsx";

type Props = { slug: string };

type Counts = Record<"like" | "love" | "save", number>;
type You = Record<"like" | "love" | "save", boolean>;
type Store = { counts: Counts; you: You };

const KEY = (slug: string) => `dt:rxn:${slug}`;

const defaultStore: Store = {
  counts: { like: 0, love: 0, save: 0 },
  you: { like: false, love: false, save: false },
};

export default function Reactions({ slug }: Props) {
  const [store, setStore] = useState<Store>(defaultStore);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY(slug));
      if (raw) setStore(JSON.parse(raw));
    } catch {}
  }, [slug]);

  const toggle = (key: keyof Counts) => {
    setStore((prev) => {
      const youHad = prev.you[key];
      const nextCounts = { ...prev.counts, [key]: Math.max(0, prev.counts[key] + (youHad ? -1 : 1)) };
      const nextYou = { ...prev.you, [key]: !youHad };
      const next = { counts: nextCounts, you: nextYou };
      try {
        localStorage.setItem(KEY(slug), JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const Chip = ({
    active,
    icon,
    label,
    onClick,
  }: {
    active: boolean;
    icon: JSX.Element;
    label: string | number;
    onClick: () => void;
  }) => (
    <Button
      type="button"
      size="sm"
      variant="outline"
      icon={icon}
      onClick={onClick}
      className={
        active
          ? "!border-[var(--color-accent)] !bg-[color:var(--color-accent)]/20 !text-[var(--color-accent)]"
          : "!border-white/10 !bg-white/5 !text-[color:var(--color-text)]/80 hover:!bg-white/10"
      }
    >
      {label}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Chip
        active={store.you.like}
        icon={<FiThumbsUp />}
        label={store.counts.like}
        onClick={() => toggle("like")}
      />
      <Chip
        active={store.you.love}
        icon={<FiHeart />}
        label={store.counts.love}
        onClick={() => toggle("love")}
      />
      <Chip
        active={store.you.save}
        icon={<FiBookmark />}
        label={store.counts.save}
        onClick={() => toggle("save")}
      />
    </div>
  );
}
