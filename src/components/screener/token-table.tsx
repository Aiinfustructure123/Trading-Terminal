"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react";
import type { TokenSummary } from "@/lib/datasources/types";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { RiskBadge, TokenAvatar, ChainTag } from "@/components/ui/token-bits";
import { useWatchlist } from "@/lib/store/watchlist";
import { fmtPrice, fmtPct, fmtUsd, fmtAge, changeColor, cn } from "@/lib/utils";

type SortKey =
  | "conviction" | "priceUsd" | "change5m" | "change1h" | "change6h" | "change24h"
  | "volume24h" | "liquidityUsd" | "marketCap" | "ageHours";

interface Col {
  key: string;
  label: string;
  width: number;
  sortKey?: SortKey;
  align?: "left" | "right" | "center";
}

const COLS: Col[] = [
  { key: "idx", label: "#", width: 44, align: "right" },
  { key: "token", label: "Token", width: 188, align: "left" },
  { key: "priceUsd", label: "Price", width: 96, sortKey: "priceUsd", align: "right" },
  { key: "change5m", label: "5m", width: 62, sortKey: "change5m", align: "right" },
  { key: "change1h", label: "1h", width: 62, sortKey: "change1h", align: "right" },
  { key: "change6h", label: "6h", width: 62, sortKey: "change6h", align: "right" },
  { key: "change24h", label: "24h", width: 70, sortKey: "change24h", align: "right" },
  { key: "volume24h", label: "Volume", width: 88, sortKey: "volume24h", align: "right" },
  { key: "liquidityUsd", label: "Liquidity", width: 88, sortKey: "liquidityUsd", align: "right" },
  { key: "marketCap", label: "MCap", width: 88, sortKey: "marketCap", align: "right" },
  { key: "ageHours", label: "Age", width: 56, sortKey: "ageHours", align: "right" },
  { key: "txns", label: "Buys/Sells", width: 120, align: "right" },
  { key: "conviction", label: "Conv.", width: 60, sortKey: "conviction", align: "center" },
  { key: "risk", label: "Risk", width: 84, align: "center" },
  { key: "watch", label: "", width: 40, align: "center" },
];

const TOTAL_WIDTH = COLS.reduce((s, c) => s + c.width, 0);

function ChangeCell({ v }: { v: number }) {
  return <span className={cn("font-mono text-[11px] tabular-nums", changeColor(v))}>{fmtPct(v)}</span>;
}

export function TokenTable({ tokens, loading, emptyMessage }: { tokens: TokenSummary[]; loading?: boolean; emptyMessage?: string }) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const { has, toggle } = useWatchlist();
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "conviction", dir: "desc" });

  const sorted = useMemo(() => {
    const arr = [...tokens];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = sort.key === "conviction" ? a.conviction.composite - b.conviction.composite : (av as number) - (bv as number);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tokens, sort]);

  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 12,
  });

  const toggleSort = (key?: SortKey) => {
    if (!key) return;
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ minWidth: TOTAL_WIDTH }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex border-b border-border bg-panel" style={{ width: TOTAL_WIDTH }}>
          {COLS.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleSort(c.sortKey)}
              disabled={!c.sortKey}
              style={{ width: c.width }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-2 eyebrow font-normal",
                c.align === "right" && "justify-end",
                c.align === "center" && "justify-center",
                c.sortKey && "cursor-pointer hover:text-ink",
              )}
            >
              {c.label}
              {c.sortKey && (sort.key === c.sortKey ? (sort.dir === "asc" ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />) : <ArrowUpDown className="size-2.5 opacity-40" />)}
            </button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 14 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center font-mono text-sm text-muted">{emptyMessage ?? "No tokens match these filters."}</div>
        ) : (
          <div style={{ height: rowVirtualizer.getTotalSize(), width: TOTAL_WIDTH, position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const t = sorted[vi.index];
              const watched = has(t.address);
              return (
                <div
                  key={t.address}
                  onClick={() => router.push(`/token/${t.address}`)}
                  className="absolute left-0 flex cursor-pointer items-center border-b border-border/50 hover:bg-panel-2"
                  style={{ top: 0, transform: `translateY(${vi.start}px)`, height: vi.size, width: TOTAL_WIDTH }}
                >
                  <div style={{ width: 44 }} className="px-2.5 text-right font-mono text-[10px] text-muted">{vi.index + 1}</div>
                  <div style={{ width: 188 }} className="flex items-center gap-2 px-2.5">
                    <TokenAvatar symbol={t.symbol} accent={t.accent} size={24} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-ink">{t.symbol}</span>
                        <ChainTag chain={t.chain} />
                      </div>
                      <div className="truncate text-[10px] text-muted">{t.name}</div>
                    </div>
                  </div>
                  <div style={{ width: 96 }} className="px-2.5 text-right font-mono text-[11px] tabular-nums text-ink">{fmtPrice(t.priceUsd)}</div>
                  <div style={{ width: 62 }} className="px-2.5 text-right"><ChangeCell v={t.change5m} /></div>
                  <div style={{ width: 62 }} className="px-2.5 text-right"><ChangeCell v={t.change1h} /></div>
                  <div style={{ width: 62 }} className="px-2.5 text-right"><ChangeCell v={t.change6h} /></div>
                  <div style={{ width: 70 }} className="px-2.5 text-right"><ChangeCell v={t.change24h} /></div>
                  <div style={{ width: 88 }} className="px-2.5 text-right font-mono text-[11px] tabular-nums text-muted">{fmtUsd(t.volume24h)}</div>
                  <div style={{ width: 88 }} className="px-2.5 text-right font-mono text-[11px] tabular-nums text-muted">{fmtUsd(t.liquidityUsd)}</div>
                  <div style={{ width: 88 }} className="px-2.5 text-right font-mono text-[11px] tabular-nums text-muted">{fmtUsd(t.marketCap)}</div>
                  <div style={{ width: 56 }} className="px-2.5 text-right font-mono text-[11px] tabular-nums text-muted">{fmtAge(t.ageHours)}</div>
                  <div style={{ width: 120 }} className="flex items-center justify-end gap-1 px-2.5 font-mono text-[10px] tabular-nums">
                    <span className="text-profit">{t.buys24h}</span>
                    <span className="text-muted">/</span>
                    <span className="text-danger">{t.sells24h}</span>
                  </div>
                  <div style={{ width: 60 }} className="flex justify-center px-1"><ConvictionRing score={t.conviction} size={26} showValue={false} /></div>
                  <div style={{ width: 84 }} className="flex justify-center px-1"><RiskBadge tier={t.riskTier} /></div>
                  <div style={{ width: 40 }} className="flex justify-center px-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(t.address); }}
                      className={cn("rounded p-1 transition-colors", watched ? "text-signal" : "text-muted/40 hover:text-muted")}
                      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      <Star className={cn("size-3.5", watched && "fill-signal")} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { COLS as TABLE_COLS };
