"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { marketSource } from "@/lib/datasources";
import { fmtUsd, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendingUp } from "lucide-react";

function FearGreedDial({ value, label }: { value: number; label: string }) {
  const color =
    value >= 75 ? "#3DDC97" :
    value >= 55 ? "#5CE1E6" :
    value >= 45 ? "#FFB020" :
    value >= 25 ? "#FF4D5E" :
                  "#FF4D5E";

  const angle = -135 + (value / 100) * 270;

  return (
    <div className="flex items-center gap-2">
      <svg width={36} height={24} viewBox="0 0 36 24" aria-label={`Fear & Greed: ${value} — ${label}`}>
        <path d="M 3 21 A 15 15 0 0 1 33 21" fill="none" stroke="#1C2230" strokeWidth={4} strokeLinecap="round" />
        <path d="M 3 21 A 15 15 0 0 1 33 21" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={`${(value / 100) * 47.1} 47.1`} />
        <g transform={`rotate(${angle}, 18, 21)`}>
          <line x1="18" y1="21" x2="18" y2="8" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </g>
      </svg>
      <div>
        <div className="num text-sm font-semibold" style={{ color }}>{value}</div>
        <div className="text-2xs text-muted uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="label-eyebrow">{label}</div>
      <div className="num text-sm font-semibold text-ink">{value}</div>
      {sub && (
        <div className={cn("num text-xs", positive === undefined ? "text-muted" : positive ? "text-profit" : "text-danger")}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function MarketPulseStrip() {
  const { data, isLoading } = useQuery({
    queryKey: ["market-pulse"],
    queryFn:  () => marketSource.getMarketPulse(),
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-6 px-4 py-3 bg-panel border-b border-border">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-panel border-b border-border overflow-x-auto scrollbar-thin">
      <div className="flex-shrink-0">
        <span className="label-eyebrow text-signal">MARKET PULSE</span>
      </div>

      <div className="w-px h-6 bg-border flex-shrink-0" />

      <Stat label="GLOBAL MCAP" value={fmtUsd(data.globalMcap)} />
      <div className="w-px h-6 bg-border flex-shrink-0" />
      <Stat label="24H VOLUME" value={fmtUsd(data.globalVolume)} />
      <div className="w-px h-6 bg-border flex-shrink-0" />
      <Stat label="BTC DOMINANCE" value={`${data.btcDominance.toFixed(1)}%`} />
      <div className="w-px h-6 bg-border flex-shrink-0" />

      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <div className="label-eyebrow">FEAR & GREED</div>
        <FearGreedDial value={data.fearGreedIndex} label={data.fearGreedLabel} />
      </div>

      <div className="w-px h-6 bg-border flex-shrink-0" />

      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <div className="label-eyebrow">TOP GAINER</div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-profit" />
          <span className="num text-sm font-semibold text-ink">{data.topGainerSymbol}</span>
          <span className="num text-sm text-profit">+{data.topGainerPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
