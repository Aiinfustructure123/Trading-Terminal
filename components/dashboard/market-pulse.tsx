"use client";

import { useMarketPulse } from "@/lib/hooks/queries";
import { formatCompact, formatPct, deltaColor } from "@/lib/format";
import { TickNumber } from "@/components/ui/tick-number";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function FearGreedDial({ value, label }: { value: number; label: string }) {
  // Half-circle gauge, 0 (fear, red) → 100 (greed, green)
  const angle = Math.PI * (1 - value / 100);
  const r = 22;
  const cx = 26;
  const cy = 26;
  const nx = cx + r * 0.78 * Math.cos(angle);
  const ny = cy - r * 0.78 * Math.sin(angle);
  return (
    <div className="flex items-center gap-2">
      <svg width="52" height="30" viewBox="0 0 52 30" aria-label={`Fear & Greed ${value} — ${label}`}>
        <path d="M 4 26 A 22 22 0 0 1 48 26" fill="none" stroke="#1C2230" strokeWidth="4" />
        <path
          d="M 4 26 A 22 22 0 0 1 48 26"
          fill="none"
          stroke="url(#fg-grad)"
          strokeWidth="4"
          strokeDasharray={`${(value / 100) * Math.PI * 22} 999`}
        />
        <defs>
          <linearGradient id="fg-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF4D5E" />
            <stop offset="50%" stopColor="#FFB020" />
            <stop offset="100%" stopColor="#3DDC97" />
          </linearGradient>
        </defs>
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#E8ECF4" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="2" fill="#E8ECF4" />
      </svg>
      <div className="flex flex-col">
        <span className="font-mono text-sm font-semibold" data-numeric>
          {value}
        </span>
        <span className="text-[10px] text-muted">{label}</span>
      </div>
    </div>
  );
}

function PulseStat({
  label,
  value,
  format,
  change,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  change: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="eyebrow">{label}</span>
      <div className="flex items-baseline gap-2">
        <TickNumber value={value} format={format} className="text-sm font-semibold" />
        <span className={cn("font-mono text-[11px]", deltaColor(change))} data-numeric>
          {formatPct(change)}
        </span>
      </div>
    </div>
  );
}

export function MarketPulseStrip() {
  const { data, isLoading } = useMarketPulse();

  return (
    <div className="panel live-edge flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-2.5">
      {isLoading || !data ? (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-36" />
          ))}
        </>
      ) : (
        <>
          <PulseStat
            label="Global MCap"
            value={data.totalMarketCapUsd}
            format={(v) => `$${formatCompact(v)}`}
            change={data.totalMarketCapChange24h}
          />
          <PulseStat
            label="24h Volume"
            value={data.volume24hUsd}
            format={(v) => `$${formatCompact(v)}`}
            change={data.volume24hChange}
          />
          <PulseStat
            label="BTC Dominance"
            value={data.btcDominancePct}
            format={(v) => `${v.toFixed(1)}%`}
            change={data.btcDominanceChange24h}
          />
          <div className="flex flex-col gap-0.5">
            <span className="eyebrow">Fear / Greed</span>
            <FearGreedDial value={data.fearGreedIndex} label={data.fearGreedLabel} />
          </div>
        </>
      )}
      <div className="ml-auto">
        <SourceBadge source="market" />
      </div>
    </div>
  );
}
