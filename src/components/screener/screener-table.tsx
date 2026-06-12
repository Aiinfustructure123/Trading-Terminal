"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import {
  ConvictionScore,
  ScreenerSort,
  ScreenerSortKey,
  TokenSummary,
} from "@/lib/datasources/types";
import { formatAge, formatCompact, formatPrice, formatUsdCompact } from "@/lib/format";
import { toggleWatch, useWatchlist } from "@/lib/store/watchlist";
import { ConvictionRing } from "@/components/terminal/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/terminal/score-breakdown";
import { RiskBadge, ChainBadge } from "@/components/terminal/badges";
import { TickerNumber } from "@/components/terminal/ticker-number";
import { Delta } from "@/components/terminal/delta";
import { Skeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

const GRID =
  "grid grid-cols-[28px_minmax(150px,1.3fr)_92px_62px_62px_62px_62px_84px_84px_84px_52px_88px_64px_80px] items-center gap-x-1";

interface HeaderCol {
  label: string;
  sortKey?: ScreenerSortKey;
  align?: "right";
}

const COLUMNS: HeaderCol[] = [
  { label: "" },
  { label: "Token" },
  { label: "Price", sortKey: "priceUsd", align: "right" },
  { label: "5m", sortKey: "change5m", align: "right" },
  { label: "1h", sortKey: "change1h", align: "right" },
  { label: "6h", sortKey: "change6h", align: "right" },
  { label: "24h", sortKey: "change24h", align: "right" },
  { label: "Volume", sortKey: "volume24hUsd", align: "right" },
  { label: "Liquidity", sortKey: "liquidityUsd", align: "right" },
  { label: "MCap", sortKey: "marketCapUsd", align: "right" },
  { label: "Age", sortKey: "createdAt", align: "right" },
  { label: "Buys/Sells", align: "right" },
  { label: "Conv", sortKey: "composite", align: "right" },
  { label: "Risk" },
];

interface ScreenerTableProps {
  tokens: TokenSummary[] | undefined;
  isPending: boolean;
  sort: ScreenerSort;
  onSortChange: (sort: ScreenerSort) => void;
  emptyMessage?: string;
  className?: string;
}

export function ScreenerTable({
  tokens,
  isPending,
  sort,
  onSortChange,
  emptyMessage = "No tokens match the current filters.",
  className,
}: ScreenerTableProps) {
  const router = useRouter();
  const watchlist = useWatchlist();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [breakdown, setBreakdown] = React.useState<{
    score: ConvictionScore;
    symbol: string;
  } | null>(null);

  const rows = tokens ?? [];
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 12,
  });

  function header(col: HeaderCol, i: number) {
    const active = col.sortKey && sort.key === col.sortKey;
    const content = (
      <>
        {col.label}
        {active ? (
          sort.dir === "desc" ? (
            <ArrowDown size={10} className="text-signal" />
          ) : (
            <ArrowUp size={10} className="text-signal" />
          )
        ) : null}
      </>
    );
    if (!col.sortKey) {
      return (
        <span key={i} className={cn("eyebrow flex items-center gap-1 !text-[10px]", col.align === "right" && "justify-end")}>
          {content}
        </span>
      );
    }
    return (
      <button
        key={i}
        type="button"
        onClick={() =>
          onSortChange({
            key: col.sortKey as ScreenerSortKey,
            dir: active && sort.dir === "desc" ? "asc" : "desc",
          })
        }
        className={cn(
          "eyebrow flex cursor-pointer items-center gap-1 !text-[10px] transition-colors hover:!text-ink",
          col.align === "right" && "justify-end",
          active && "!text-signal",
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn("panel flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="min-h-0 flex-1 overflow-auto" ref={parentRef}>
        <div className="min-w-[1080px]">
          <div className={cn(GRID, "sticky top-0 z-10 h-8 border-b border-edge bg-panel px-2")}>
            {COLUMNS.map(header)}
          </div>

          {isPending && rows.length === 0 ? (
            <div className="space-y-1.5 p-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-16 text-center text-xs text-muted">{emptyMessage}</div>
          ) : (
            <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((vRow) => {
                const t = rows[vRow.index];
                const watched = watchlist.includes(t.id);
                return (
                  <div
                    key={t.id}
                    role="row"
                    onClick={() => router.push(`/token/${t.id}`)}
                    className={cn(
                      GRID,
                      "absolute left-0 top-0 w-full cursor-pointer border-b border-edge/50 px-2 text-xs transition-colors hover:bg-panel-2/70",
                    )}
                    style={{ height: vRow.size, transform: `translateY(${vRow.start}px)` }}
                  >
                    <button
                      type="button"
                      aria-label={watched ? `Remove ${t.symbol} from watchlist` : `Add ${t.symbol} to watchlist`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(t.id);
                      }}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-muted/50 hover:text-warn"
                    >
                      <Star
                        size={12}
                        className={cn(watched && "fill-warn text-warn")}
                      />
                    </button>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="num truncate font-medium text-ink">${t.symbol}</span>
                      <span className="hidden truncate text-2xs text-muted xl:inline">{t.name}</span>
                      <ChainBadge chain={t.chain} />
                    </span>
                    <TickerNumber value={t.priceUsd} format={formatPrice} className="text-right" />
                    <Delta value={t.change5m} className="text-right text-2xs" />
                    <Delta value={t.change1h} className="text-right text-2xs" />
                    <Delta value={t.change6h} className="text-right text-2xs" />
                    <Delta value={t.change24h} className="text-right text-2xs" />
                    <TickerNumber value={t.volume24hUsd} format={formatUsdCompact} className="text-right text-muted" flash="none" />
                    <TickerNumber value={t.liquidityUsd} format={formatUsdCompact} className="text-right text-muted" flash="none" />
                    <TickerNumber value={t.marketCapUsd} format={formatUsdCompact} className="text-right text-muted" flash="none" />
                    <span className="num text-right text-2xs text-muted">{formatAge(t.createdAt)}</span>
                    <span className="num text-right text-2xs">
                      <span className="text-profit">{formatCompact(t.buys24h)}</span>
                      <span className="text-muted">/</span>
                      <span className="text-danger">{formatCompact(t.sells24h)}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Score breakdown for ${t.symbol}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setBreakdown({ score: t.score, symbol: t.symbol });
                      }}
                      className="flex cursor-pointer items-center justify-end gap-1.5 hover:brightness-125"
                    >
                      <ConvictionRing score={t.score.composite} size={16} />
                      <span className="num w-5 text-right">{Math.round(t.score.composite)}</span>
                    </button>
                    <span>
                      <RiskBadge tier={t.riskTier} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-7 shrink-0 items-center gap-2 border-t border-edge px-3">
        <span className="num text-[10px] text-muted">
          {rows.length.toLocaleString("en-US")} tokens
        </span>
        {isPending ? <span className="num text-[10px] text-signal/70">refreshing…</span> : null}
      </div>

      <ScoreBreakdownDialog
        score={breakdown?.score ?? null}
        symbol={breakdown?.symbol}
        open={breakdown !== null}
        onOpenChange={(o) => !o && setBreakdown(null)}
      />
    </div>
  );
}
