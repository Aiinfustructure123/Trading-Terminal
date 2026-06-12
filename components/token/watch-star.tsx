"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/hooks/use-watchlist";

export function WatchStar({ tokenId, symbol, className }: { tokenId: string; symbol: string; className?: string }) {
  const { has, toggle } = useWatchlist();
  const watched = has(tokenId);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(tokenId);
      }}
      aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      aria-pressed={watched}
      className={cn(
        "rounded p-1 transition-colors",
        watched ? "text-warn" : "text-muted/50 hover:text-muted",
        className
      )}
    >
      <Star className={cn("size-3.5", watched && "fill-warn")} aria-hidden />
    </button>
  );
}
