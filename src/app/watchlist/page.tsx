"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { ScreenerQuery, TokenSummary } from "@/lib/datasources";
import { useTokens } from "@/lib/queries";
import { useWatchlist } from "@/lib/watchlist";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { ScreenerTable } from "@/components/screener/screener-table";

type SortKey = NonNullable<ScreenerQuery["sortBy"]>;

function sortVal(t: TokenSummary, key: SortKey): number {
  switch (key) {
    case "conviction": return t.conviction.composite;
    case "change24h": return t.deltas.h24;
    case "priceUsd": return t.priceUsd;
    case "volume24hUsd": return t.volume24hUsd;
    case "liquidityUsd": return t.liquidityUsd;
    case "marketCapUsd": return t.marketCapUsd;
    case "createdAt": return t.createdAt;
    case "holders": return t.holders;
    default: return t.conviction.composite;
  }
}

export default function WatchlistPage() {
  const { ids, hydrated } = useWatchlist();
  const { data, isLoading } = useTokens();
  const [sortBy, setSortBy] = React.useState<SortKey>("conviction");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const tokens = React.useMemo(() => {
    if (!data) return [];
    const set = new Set(ids);
    const filtered = data.filter((t) => set.has(t.id));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => (sortVal(a, sortBy) - sortVal(b, sortBy)) * dir);
  }, [data, ids, sortBy, sortDir]);

  const onSort = (key: SortKey) => {
    if (key === sortBy) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        eyebrow="Saved Tokens"
        title="Watchlist"
        description="Your watched tokens, tracked through the same screener table. The rug early-warning rule runs on these by default in Phase 3."
        actions={<Badge variant="warn">{hydrated ? `${ids.length} watched` : "…"}</Badge>}
      />
      <div className="min-h-0 flex-1 p-5">
        {hydrated && ids.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center">
            <Star className="h-8 w-8 text-muted" />
            <p className="font-display text-data-lg text-ink">Your watchlist is empty</p>
            <p className="max-w-sm text-[13px] text-muted">
              Star tokens from the screener, dashboard, or command palette to track them here.
            </p>
            <Link href="/screener" className="text-[13px] text-signal hover:underline">
              Browse the screener →
            </Link>
          </div>
        ) : (
          <Panel title="Watched" sourceKey="market" bodyClassName="p-0" className="h-full min-h-[420px]">
            <ScreenerTable
              tokens={tokens}
              isLoading={isLoading || !hydrated}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              emptyMessage="No watched tokens match."
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
