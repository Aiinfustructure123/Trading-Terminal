"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { TokenTable } from "@/components/screener/token-table";
import { SourceBadge } from "@/components/ui/source-badge";
import { Eyebrow } from "@/components/ui/primitives";
import { useTokens } from "@/lib/hooks/use-data";
import { useWatchlist } from "@/lib/store/watchlist";

export default function WatchlistPage() {
  const { items } = useWatchlist();
  const { data, isLoading } = useTokens({ limit: 1200 });

  const rows = useMemo(() => {
    if (!data) return [];
    const set = new Set(items);
    return data.filter((t) => set.has(t.address));
  }, [data, items]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-panel px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Star className="size-3.5 text-signal" />
          <Eyebrow>Watchlist</Eyebrow>
          <SourceBadge source="market" />
        </div>
        <span className="font-mono text-[10px] text-muted">{items.length} saved</span>
      </div>
      <div className="min-h-0 flex-1">
        <TokenTable
          tokens={rows}
          loading={isLoading && items.length > 0}
          emptyMessage="No tokens watchlisted yet. Star a token in the screener or on its detail page."
        />
      </div>
    </div>
  );
}
