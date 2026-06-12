"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenerSortKey, Token } from "@/lib/datasources/types";
import { deltaColor, formatAge, formatPct, formatUsd } from "@/lib/format";
import { ConvictionRing } from "@/components/conviction/ring";
import { useBreakdownModal } from "@/components/conviction/breakdown-modal";
import { RiskBadge } from "@/components/ui/badge";
import { TickNumber } from "@/components/ui/tick-number";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchStar } from "./watch-star";

const GRID =
  "grid grid-cols-[minmax(150px,1.6fr)_92px_64px_64px_64px_64px_84px_84px_84px_56px_90px_44px_82px_36px] items-center gap-x-2";

interface SortState {
  key: ScreenerSortKey;
  dir: "asc" | "desc";
}

interface TokenTableProps {
  tokens: Token[] | undefined;
  isLoading: boolean;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  emptyMessage?: string;
  /** Virtualization container height; defaults to filling parent */
  className?: string;
}

function HeaderCell({
  label,
  align = "right",
  sortKey,
  sort,
  onSortChange,
}: {
  label: string;
  align?: "left" | "right";
  sortKey?: ScreenerSortKey;
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
}) {
  const active = sort && sortKey && sort.key === sortKey;
  const clickable = !!(sortKey && onSortChange);
  return (
    <button
      disabled={!clickable}
      onClick={() =>
        clickable &&
        onSortChange({
          key: sortKey,
          dir: active && sort.dir === "desc" ? "asc" : "desc",
        })
      }
      className={cn(
        "eyebrow flex items-center gap-0.5 py-2",
        align === "right" ? "justify-end text-right" : "justify-start text-left",
        clickable && "cursor-pointer hover:text-ink",
        active && "text-signal"
      )}
    >
      {label}
      {active &&
        (sort.dir === "desc" ? (
          <ArrowDown className="size-2.5" aria-hidden />
        ) : (
          <ArrowUp className="size-2.5" aria-hidden />
        ))}
    </button>
  );
}

export function TokenTable({
  tokens,
  isLoading,
  sort,
  onSortChange,
  emptyMessage = "No tokens match the current filters.",
  className,
}: TokenTableProps) {
  "use no memo"; // TanStack Virtual returns functions the React Compiler cannot memoize
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const breakdown = useBreakdownModal();

  const rows = tokens ?? [];
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 12,
  });

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-x-auto", className)}>
      <div className="min-w-[1080px]">
        {/* header */}
        <div className={cn(GRID, "sticky top-0 z-10 border-b border-panel-border bg-panel px-3")}>
          <HeaderCell label="Token" align="left" />
          <HeaderCell label="Price" />
          <HeaderCell label="5m" />
          <HeaderCell label="1h" sortKey="change1h" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="6h" />
          <HeaderCell label="24h" sortKey="change24h" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="Volume" sortKey="volume24h" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="Liquidity" sortKey="liquidityUsd" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="MCap" sortKey="marketCap" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="Age" sortKey="ageHours" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="B/S" />
          <HeaderCell label="Score" sortKey="conviction" sort={sort} onSortChange={onSortChange} />
          <HeaderCell label="Risk" />
          <span aria-hidden />
        </div>
      </div>

      {/* body */}
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-w-[1080px]">
          {isLoading && rows.length === 0 ? (
            <div className="flex flex-col gap-1.5 p-3">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">{emptyMessage}</p>
          ) : (
            <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const t = rows[vi.index];
                const buyPct = (t.txns24h.buys / Math.max(1, t.txns24h.buys + t.txns24h.sells)) * 100;
                return (
                  <div
                    key={t.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/token/${t.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/token/${t.id}`)}
                    className={cn(
                      GRID,
                      "absolute left-0 top-0 w-full cursor-pointer border-b border-panel-border/50 px-3 text-[13px] transition-colors hover:bg-white/[0.03]"
                    )}
                    style={{ height: vi.size, transform: `translateY(${vi.start}px)` }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">{t.symbol}</span>
                      <span className="truncate text-xs text-muted">{t.name}</span>
                    </span>
                    <span className="text-right">
                      <TickNumber value={t.priceUsd} format={(v) => formatUsd(v)} className="text-[12px]" />
                    </span>
                    {([t.change5m, t.change1h, t.change6h, t.change24h] as const).map((chg, i) => (
                      <span
                        key={i}
                        className={cn("text-right font-mono text-[12px]", deltaColor(chg))}
                        data-numeric
                      >
                        {formatPct(chg)}
                      </span>
                    ))}
                    <span className="text-right">
                      <TickNumber
                        value={t.volume24h}
                        format={(v) => formatUsd(v, { compact: true })}
                        className="text-[12px] text-ink/90"
                      />
                    </span>
                    <span className="text-right font-mono text-[12px] text-ink/90" data-numeric>
                      {formatUsd(t.liquidityUsd, { compact: true })}
                    </span>
                    <span className="text-right font-mono text-[12px] text-ink/90" data-numeric>
                      {formatUsd(t.marketCap, { compact: true })}
                    </span>
                    <span className="text-right font-mono text-[12px] text-muted" data-numeric>
                      {formatAge(t.ageHours)}
                    </span>
                    <span className="flex flex-col items-end gap-0.5" title={`${t.txns24h.buys} buys / ${t.txns24h.sells} sells`}>
                      <span className="font-mono text-[11px]" data-numeric>
                        <span className="text-profit">{t.txns24h.buys}</span>
                        <span className="text-muted">/</span>
                        <span className="text-danger">{t.txns24h.sells}</span>
                      </span>
                      <span className="h-0.5 w-12 overflow-hidden rounded-full bg-danger/50">
                        <span className="block h-full bg-profit" style={{ width: `${buyPct}%` }} />
                      </span>
                    </span>
                    <span className="flex justify-end pr-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          breakdown.open(t);
                        }}
                        aria-label={`Open score breakdown for ${t.symbol} (score ${Math.round(t.conviction.total)})`}
                        className="flex items-center gap-1.5 rounded p-0.5 hover:bg-white/[0.06]"
                      >
                        <ConvictionRing score={t.conviction} size={16} />
                        <span className="font-mono text-[12px]" data-numeric>
                          {Math.round(t.conviction.total)}
                        </span>
                      </button>
                    </span>
                    <span className="flex justify-end">
                      <RiskBadge tier={t.riskTier} />
                    </span>
                    <span className="flex justify-end">
                      <WatchStar tokenId={t.id} symbol={t.symbol} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
