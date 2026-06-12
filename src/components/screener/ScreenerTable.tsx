"use client";

import React, { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Token } from "@/lib/datasources/types";
import { fmtUsd, fmtPct, fmtPrice, fmtAge, truncateAddress, cn } from "@/lib/utils";
import { ConvictionRingInline } from "@/components/ui/ConvictionRing";
import { RiskBadge, ChainBadge } from "@/components/ui/DataBadge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { ArrowUp, ArrowDown, Copy, Star } from "lucide-react";
import type { ScreenerParams } from "@/lib/datasources/types";

type SortKey = NonNullable<ScreenerParams["sortBy"]>;

interface Column {
  key: SortKey | string;
  label: string;
  align?: "left" | "right";
  width: string;
  sortable?: boolean;
}

const COLUMNS: Column[] = [
  { key: "name",        label: "TOKEN",         align: "left",  width: "200px", sortable: false },
  { key: "score",       label: "SCORE",         align: "right", width: "70px",  sortable: true  },
  { key: "priceChange24h", label: "PRICE",      align: "right", width: "120px", sortable: false },
  { key: "priceChange5m",  label: "5M",         align: "right", width: "60px",  sortable: false },
  { key: "priceChange1h",  label: "1H",         align: "right", width: "60px",  sortable: false },
  { key: "priceChange6h",  label: "6H",         align: "right", width: "60px",  sortable: false },
  { key: "priceChange24h", label: "24H",        align: "right", width: "70px",  sortable: true  },
  { key: "volume24h",   label: "VOLUME",        align: "right", width: "90px",  sortable: true  },
  { key: "liquidity",   label: "LIQ",           align: "right", width: "90px",  sortable: true  },
  { key: "mcap",        label: "MCAP",          align: "right", width: "90px",  sortable: true  },
  { key: "age",         label: "AGE",           align: "right", width: "60px",  sortable: true  },
  { key: "txns",        label: "BUYS/SELLS",    align: "right", width: "90px",  sortable: false },
  { key: "risk",        label: "RISK",          align: "right", width: "80px",  sortable: false },
];

const ROW_HEIGHT = 44;

function PctCell({ value }: { value: number }) {
  return (
    <span className={cn("num text-xs tabular-nums", value >= 0 ? "text-profit" : "text-danger")}>
      {fmtPct(value)}
    </span>
  );
}

interface Props {
  tokens: Token[];
  total: number;
  isLoading: boolean;
  sortBy: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onLoadMore: () => void;
  watchlist: Set<string>;
  onToggleWatch: (addr: string) => void;
}

export function ScreenerTable({
  tokens, total, isLoading, sortBy, sortDir, onSort, onLoadMore, watchlist, onToggleWatch,
}: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 200;
    if (nearBottom && tokens.length < total && !isLoading) onLoadMore();
  }, [tokens.length, total, isLoading, onLoadMore]);

  const copyAddr = (e: React.MouseEvent, addr: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr).catch(() => {});
  };

  if (isLoading && tokens.length === 0) return <SkeletonTable rows={10} />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex bg-panel border-b border-border px-4 flex-shrink-0">
        {COLUMNS.map(col => (
          <div
            key={`${col.key}-${col.label}`}
            className={cn(
              "flex items-center gap-1 py-2.5 label-eyebrow flex-shrink-0",
              col.align === "right" ? "justify-end" : "justify-start",
              col.sortable ? "cursor-pointer hover:text-ink select-none" : "",
            )}
            style={{ width: col.width }}
            onClick={() => col.sortable && onSort(col.key as SortKey)}
          >
            {col.label}
            {col.sortable && sortBy === col.key && (
              sortDir === "desc" ? <ArrowDown size={10} className="text-signal" /> : <ArrowUp size={10} className="text-signal" />
            )}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map(vRow => {
            const token = tokens[vRow.index];
            if (!token) return null;
            const inWatch = watchlist.has(token.address);

            return (
              <div
                key={token.address}
                style={{
                  position: "absolute",
                  top: vRow.start,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                }}
                className="flex items-center px-4 border-b border-border/40 cursor-pointer
                           hover:bg-signal/5 group transition-colors"
                onClick={() => router.push(`/token/${token.address}`)}
              >
                {/* TOKEN col */}
                <div className="flex items-center gap-2 flex-shrink-0" style={{ width: "200px" }}>
                  <ConvictionRingInline score={token.score} size={20} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink group-hover:text-signal transition-colors">
                        {token.symbol}
                      </span>
                      <ChainBadge chain={token.chain} className="hidden xl:inline-flex" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xs text-muted font-mono">{truncateAddress(token.address, 4)}</span>
                      <button
                        onClick={e => copyAddr(e, token.address)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-ink transition-all"
                      >
                        <Copy size={9} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SCORE */}
                <div className="flex-shrink-0 text-right" style={{ width: "70px" }}>
                  <span
                    className="num text-xs font-semibold"
                    style={{ color: token.score.composite >= 70 ? "#3DDC97" : token.score.composite >= 45 ? "#FFB020" : "#FF4D5E" }}
                  >
                    {token.score.composite.toFixed(0)}
                  </span>
                </div>

                {/* PRICE */}
                <div className="flex-shrink-0 text-right" style={{ width: "120px" }}>
                  <span className="num text-xs text-ink">{fmtPrice(token.price)}</span>
                </div>

                {/* 5M / 1H / 6H / 24H */}
                <div className="flex-shrink-0 text-right" style={{ width: "60px" }}><PctCell value={token.priceChange5m} /></div>
                <div className="flex-shrink-0 text-right" style={{ width: "60px" }}><PctCell value={token.priceChange1h} /></div>
                <div className="flex-shrink-0 text-right" style={{ width: "60px" }}><PctCell value={token.priceChange6h} /></div>
                <div className="flex-shrink-0 text-right" style={{ width: "70px" }}><PctCell value={token.priceChange24h} /></div>

                {/* VOLUME */}
                <div className="flex-shrink-0 text-right" style={{ width: "90px" }}>
                  <span className="num text-xs text-ink">{fmtUsd(token.volume24h)}</span>
                </div>

                {/* LIQ */}
                <div className="flex-shrink-0 text-right" style={{ width: "90px" }}>
                  <span className="num text-xs text-ink">{fmtUsd(token.liquidity)}</span>
                </div>

                {/* MCAP */}
                <div className="flex-shrink-0 text-right" style={{ width: "90px" }}>
                  <span className="num text-xs text-ink">{fmtUsd(token.marketCap)}</span>
                </div>

                {/* AGE */}
                <div className="flex-shrink-0 text-right" style={{ width: "60px" }}>
                  <span className="num text-xs text-muted">{fmtAge(token.age)}</span>
                </div>

                {/* BUYS/SELLS */}
                <div className="flex-shrink-0 text-right" style={{ width: "90px" }}>
                  <span className="num text-xs">
                    <span className="text-profit">{token.txns24h.buys.toLocaleString()}</span>
                    <span className="text-muted">/</span>
                    <span className="text-danger">{token.txns24h.sells.toLocaleString()}</span>
                  </span>
                </div>

                {/* RISK */}
                <div className="flex-shrink-0 text-right flex items-center justify-end gap-2" style={{ width: "80px" }}>
                  <RiskBadge tier={token.score.riskTier} />
                  <button
                    onClick={e => { e.stopPropagation(); onToggleWatch(token.address); }}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-all",
                      inWatch ? "text-signal opacity-100" : "text-muted hover:text-signal"
                    )}
                  >
                    <Star size={12} fill={inWatch ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && tokens.length > 0 && (
          <div className="py-4 text-center text-xs text-muted">Loading more…</div>
        )}
        {!isLoading && tokens.length >= total && tokens.length > 0 && (
          <div className="py-4 text-center text-xs text-muted">
            Showing all {total.toLocaleString()} results
          </div>
        )}
      </div>
    </div>
  );
}
