"use client";

import * as React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { ScreenerSort } from "@/lib/datasources/types";
import { useScreenerTokens } from "@/lib/hooks/queries";
import { useWatchlist } from "@/lib/store/watchlist";
import { ScreenerTable } from "@/components/screener/screener-table";
import { SourceBadge } from "@/components/terminal/badges";

export default function WatchlistPage() {
  const watchlist = useWatchlist();
  const [sort, setSort] = React.useState<ScreenerSort>({
    key: "composite",
    dir: "desc",
  });

  const { data, isPending } = useScreenerTokens(
    watchlist.length > 0 ? { ids: watchlist } : undefined,
    sort,
  );

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <Eye size={20} className="text-muted" />
        <p className="eyebrow">Watchlist empty</p>
        <p className="max-w-sm text-sm text-muted">
          Star tokens from the screener, discovery cards, or the command
          palette (⌘K) and they collect here with live scores and alerts.
        </p>
        <Link href="/screener" className="text-xs text-signal hover:underline">
          Open the screener →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3rem-4rem)] flex-col gap-3 p-3 sm:p-4 lg:h-[calc(100dvh-3rem)]">
      <div className="flex items-center gap-2">
        <span className="eyebrow">
          {watchlist.length} watched token{watchlist.length === 1 ? "" : "s"}
        </span>
        <SourceBadge source="market" />
        <span className="ml-auto text-2xs text-muted">
          The rug early-warning rule (liquidity −30% / 1h) arms automatically on
          watchlisted tokens in Phase 3.
        </span>
      </div>
      <ScreenerTable
        tokens={data ? data.filter((t) => watchlist.includes(t.id)) : undefined}
        isPending={isPending}
        sort={sort}
        onSortChange={setSort}
        emptyMessage="Watched tokens no longer exist in the sample universe."
      />
    </div>
  );
}
