"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useTokens } from "@/lib/hooks/queries";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { Panel } from "@/components/ui/panel";
import { TokenTable } from "@/components/token/token-table";
import type { ScreenerSortKey, Token } from "@/lib/datasources/types";

const SORTERS: Record<ScreenerSortKey, (a: Token, b: Token) => number> = {
  conviction: (a, b) => a.conviction.total - b.conviction.total,
  marketCap: (a, b) => a.marketCap - b.marketCap,
  volume24h: (a, b) => a.volume24h - b.volume24h,
  liquidityUsd: (a, b) => a.liquidityUsd - b.liquidityUsd,
  change24h: (a, b) => a.change24h - b.change24h,
  change1h: (a, b) => a.change1h - b.change1h,
  ageHours: (a, b) => a.ageHours - b.ageHours,
};

export default function WatchlistPage() {
  const { ids, hydrated } = useWatchlist();
  const { data, isLoading } = useTokens(ids);
  const [sort, setSort] = useState<{ key: ScreenerSortKey; dir: "asc" | "desc" }>({
    key: "conviction",
    dir: "desc",
  });

  const sorted = data
    ? [...data].sort((a, b) => SORTERS[sort.key](a, b) * (sort.dir === "asc" ? 1 : -1))
    : undefined;

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Watchlist</span>
        <h1 className="text-lg font-semibold leading-tight">
          {ids.length} saved token{ids.length === 1 ? "" : "s"}
        </h1>
      </header>

      {hydrated && ids.length === 0 ? (
        <Panel className="flex-1" bodyClassName="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <Star className="size-8 text-muted/40" aria-hidden />
          <p className="max-w-sm text-sm text-muted">
            Nothing watched yet. Star tokens from the{" "}
            <Link href="/screener" className="text-signal hover:underline">
              screener
            </Link>
            , token pages, or the command palette (⌘K) and they&apos;ll collect here. The rug
            early-warning alert is enabled by default for watchlisted tokens.
          </p>
        </Panel>
      ) : (
        <Panel source="market" className="min-h-0 flex-1" bodyClassName="flex flex-col">
          <TokenTable
            tokens={sorted}
            isLoading={isLoading || !hydrated}
            sort={sort}
            onSortChange={setSort}
            emptyMessage="Loading watchlist…"
          />
        </Panel>
      )}
    </div>
  );
}
