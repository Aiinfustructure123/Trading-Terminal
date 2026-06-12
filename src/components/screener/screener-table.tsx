"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ScreenerQuery, TokenSummary } from "@/lib/datasources";
import { ConvictionRing } from "@/components/conviction-ring";
import { TokenLogo } from "@/components/token-logo";
import { RiskBadge } from "@/components/risk-badge";
import { DeltaValue } from "@/components/delta-value";
import { WatchButton } from "@/components/watch-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAge, formatCompact, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = NonNullable<ScreenerQuery["sortBy"]>;

interface Column {
  key: string;
  label: string;
  width: number;
  align: "left" | "right" | "center";
  sortKey?: SortKey;
}

const COLUMNS: Column[] = [
  { key: "watch", label: "", width: 32, align: "center" },
  { key: "token", label: "Token", width: 188, align: "left" },
  { key: "price", label: "Price", width: 96, align: "right", sortKey: "priceUsd" },
  { key: "m5", label: "5m", width: 60, align: "right" },
  { key: "h1", label: "1h", width: 60, align: "right" },
  { key: "h6", label: "6h", width: 60, align: "right" },
  { key: "h24", label: "24h", width: 72, align: "right", sortKey: "change24h" },
  { key: "volume", label: "Volume", width: 88, align: "right", sortKey: "volume24hUsd" },
  { key: "liquidity", label: "Liquidity", width: 88, align: "right", sortKey: "liquidityUsd" },
  { key: "mcap", label: "MCap", width: 88, align: "right", sortKey: "marketCapUsd" },
  { key: "age", label: "Age", width: 52, align: "right", sortKey: "createdAt" },
  { key: "txns", label: "Buys / Sells", width: 116, align: "center" },
  { key: "conviction", label: "Conv", width: 52, align: "center", sortKey: "conviction" },
  { key: "risk", label: "Risk", width: 78, align: "left" },
];

const TOTAL_WIDTH = COLUMNS.reduce((a, c) => a + c.width, 0);
const ROW_HEIGHT = 50;

function HeaderCell({
  col,
  sortBy,
  sortDir,
  onSort,
}: {
  col: Column;
  sortBy?: SortKey;
  sortDir?: "asc" | "desc";
  onSort?: (key: SortKey) => void;
}) {
  const sortable = Boolean(col.sortKey && onSort);
  const active = col.sortKey && sortBy === col.sortKey;
  return (
    <div
      style={{ width: col.width }}
      className={cn(
        "flex shrink-0 items-center gap-1 px-2 py-2",
        col.align === "right" && "justify-end",
        col.align === "center" && "justify-center",
        sortable && "cursor-pointer select-none hover:text-ink",
        active ? "text-signal" : "text-muted",
      )}
      onClick={() => sortable && onSort?.(col.sortKey!)}
    >
      <span className="eyebrow text-[10px]" style={{ color: "inherit" }}>
        {col.label}
      </span>
      {active && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </div>
  );
}

export function ScreenerTable({
  tokens,
  isLoading,
  sortBy,
  sortDir,
  onSort,
  emptyMessage = "No tokens match these filters.",
}: {
  tokens: TokenSummary[];
  isLoading?: boolean;
  sortBy?: SortKey;
  sortDir?: "asc" | "desc";
  onSort?: (key: SortKey) => void;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
      <div style={{ minWidth: TOTAL_WIDTH }} className="flex min-w-full flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex border-b border-edge bg-panel">
          {COLUMNS.map((col) => (
            <HeaderCell key={col.key} col={col} sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
          ))}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-col gap-px p-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[13px] text-muted">{emptyMessage}</div>
        ) : (
          <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto" style={{ contain: "strict" }}>
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const t = tokens[vi.index]!;
                return (
                  <div
                    key={t.id}
                    className="absolute left-0 top-0 flex w-full cursor-pointer items-center border-b border-edge/50 text-[13px] transition-colors hover:bg-panel-2"
                    style={{ height: vi.size, transform: `translateY(${vi.start}px)` }}
                    onClick={() => router.push(`/token/${t.id}`)}
                  >
                    <div style={{ width: 32 }} className="flex shrink-0 justify-center">
                      <WatchButton id={t.id} size={14} />
                    </div>
                    <div style={{ width: 188 }} className="flex shrink-0 items-center gap-2 px-2">
                      <TokenLogo symbol={t.symbol} accent={t.accent} size={26} />
                      <div className="min-w-0 leading-tight">
                        <p className="truncate font-mono font-semibold text-ink">{t.symbol}</p>
                        <p className="truncate text-[10px] text-muted">{t.name}</p>
                      </div>
                    </div>
                    <div style={{ width: 96 }} className="tabular shrink-0 px-2 text-right text-ink">
                      {formatPrice(t.priceUsd)}
                    </div>
                    <div style={{ width: 60 }} className="shrink-0 px-2 text-right">
                      <DeltaValue value={t.deltas.m5} className="text-[12px]" />
                    </div>
                    <div style={{ width: 60 }} className="shrink-0 px-2 text-right">
                      <DeltaValue value={t.deltas.h1} className="text-[12px]" />
                    </div>
                    <div style={{ width: 60 }} className="shrink-0 px-2 text-right">
                      <DeltaValue value={t.deltas.h6} className="text-[12px]" />
                    </div>
                    <div style={{ width: 72 }} className="shrink-0 px-2 text-right">
                      <DeltaValue value={t.deltas.h24} />
                    </div>
                    <div style={{ width: 88 }} className="tabular shrink-0 px-2 text-right text-ink">
                      ${formatCompact(t.volume24hUsd)}
                    </div>
                    <div style={{ width: 88 }} className="tabular shrink-0 px-2 text-right text-ink">
                      ${formatCompact(t.liquidityUsd)}
                    </div>
                    <div style={{ width: 88 }} className="tabular shrink-0 px-2 text-right text-ink">
                      ${formatCompact(t.marketCapUsd)}
                    </div>
                    <div style={{ width: 52 }} className="tabular shrink-0 px-2 text-right text-muted">
                      {formatAge(t.createdAt)}
                    </div>
                    <div style={{ width: 116 }} className="tabular shrink-0 px-2 text-center text-[12px]">
                      <span className="text-profit">{formatCompact(t.txns24h.buys)}</span>
                      <span className="text-muted"> / </span>
                      <span className="text-danger">{formatCompact(t.txns24h.sells)}</span>
                    </div>
                    <div style={{ width: 52 }} className="flex shrink-0 justify-center px-1" onClick={(e) => e.stopPropagation()}>
                      <ConvictionRing score={t.conviction} size={30} showValue={false} interactive />
                    </div>
                    <div style={{ width: 78 }} className="shrink-0 px-2">
                      <RiskBadge tier={t.riskTier} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
