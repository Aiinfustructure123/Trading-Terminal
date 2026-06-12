"use client";

import { useMarketPulse } from "@/lib/queries";
import { Eyebrow } from "@/components/panel";
import { SourceBadge } from "@/components/source-badge";
import { DeltaValue } from "@/components/delta-value";
import { TickNumber } from "@/components/tick-number";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

function FearGreedDial({ value, label }: { value: number; label: string }) {
  const angle = -90 + (value / 100) * 180;
  const color = value < 25 ? "var(--danger)" : value < 45 ? "var(--warn)" : value < 55 ? "var(--muted)" : value < 75 ? "var(--profit)" : "var(--profit)";
  return (
    <div className="flex items-center gap-3">
      <svg width="58" height="34" viewBox="0 0 58 34" className="overflow-visible">
        <path d="M 5 30 A 24 24 0 0 1 53 30" fill="none" stroke="rgb(var(--edge))" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M 5 30 A 24 24 0 0 1 53 30"
          fill="none"
          stroke={`rgb(${color})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 75.4} 200`}
        />
        <line
          x1="29"
          y1="30"
          x2={29 + 18 * Math.cos((angle * Math.PI) / 180)}
          y2={30 + 18 * Math.sin((angle * Math.PI) / 180)}
          stroke="rgb(var(--ink))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="29" cy="30" r="2" fill="rgb(var(--ink))" />
      </svg>
      <div className="leading-tight">
        <p className="tabular text-metric font-semibold text-ink" style={{ color: `rgb(${color})` }}>
          {value}
        </p>
        <p className="text-[11px] text-muted">{label}</p>
      </div>
    </div>
  );
}

function Metric({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-[140px] flex-col gap-1 px-4", className)}>
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

export function MarketPulseStrip() {
  const { data, isLoading } = useMarketPulse();

  return (
    <section className="panel flex flex-wrap items-center divide-edge animate-fade-slide-in lg:divide-x">
      <div className="flex items-center gap-2 px-4 py-3">
        <Eyebrow>Market Pulse</Eyebrow>
        <SourceBadge sourceKey="market" />
      </div>

      {isLoading || !data ? (
        <div className="flex flex-1 flex-wrap gap-6 px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-wrap items-center justify-between gap-y-3 py-3">
          <Metric label="Total Market Cap">
            <div className="flex items-baseline gap-2">
              <TickNumber value={data.totalMarketCapUsd} format={(v) => "$" + formatCompact(v)} className="text-metric font-semibold text-ink" />
              <DeltaValue value={data.totalMarketCapChange24h} className="text-[12px]" showArrow />
            </div>
          </Metric>
          <Metric label="24h Volume">
            <div className="flex items-baseline gap-2">
              <TickNumber value={data.volume24hUsd} format={(v) => "$" + formatCompact(v)} className="text-metric font-semibold text-ink" />
              <DeltaValue value={data.volume24hChange} className="text-[12px]" showArrow />
            </div>
          </Metric>
          <Metric label="BTC Dominance">
            <div className="flex items-baseline gap-2">
              <span className="tabular text-metric font-semibold text-ink">{data.btcDominance.toFixed(1)}%</span>
              <DeltaValue value={data.btcDominanceChange} className="text-[12px]" showArrow />
            </div>
          </Metric>
          <Metric label="Fear / Greed">
            <FearGreedDial value={data.fearGreed.value} label={data.fearGreed.label} />
          </Metric>
        </div>
      )}
    </section>
  );
}
