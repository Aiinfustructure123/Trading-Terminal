"use client";

import { Star } from "lucide-react";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export function WatchButton({
  id,
  className,
  size = 16,
  withLabel = false,
}: {
  id: string;
  className?: string;
  size?: number;
  withLabel?: boolean;
}) {
  const { has, toggle, hydrated } = useWatchlist();
  const active = hydrated && has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-muted transition-colors hover:text-warn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60",
        active && "text-warn",
        className,
      )}
    >
      <Star style={{ width: size, height: size }} className={cn(active && "fill-warn")} />
      {withLabel && <span className="text-[12px]">{active ? "Watching" : "Watch"}</span>}
    </button>
  );
}
