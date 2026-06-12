"use client";

import { useGlobalMetrics } from "@/lib/hooks/queries";
import { formatUsdCompact } from "@/lib/format";
import { SourceBadge } from "@/components/terminal/badges";
import { TickerNumber } from "@/components/terminal/ticker-number";
import { Delta } from "@/components/terminal/delta";
import { FearGreedDial } from "@/components/terminal/fear-greed-dial";
import { Skeleton } from "@/components/terminal/skeleton";

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-32 flex-col gap-1 border-r border-edge px-4 py-2.5 last:border-r-0">
      <span className="eyebrow">{label}</span>
      <div className="flex items-baseline gap-2">{children}</div>
    </div>
  );
}

export function MarketPulse() {
  const { data, isPending } = useGlobalMetrics();

  return (
    <section className="panel animate-panel-in flex items-stretch overflow-x-auto">
      <div className="flex shrink-0 items-center border-r border-edge px-3">
        <SourceBadge source="market" />
      </div>
      {isPending || !data ? (
        <div className="flex flex-1 items-center gap-6 px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-36" />
          ))}
        </div>
      ) : (
        <>
          <Stat label="Global MCap">
            <TickerNumber
              value={data.totalMarketCapUsd}
              format={formatUsdCompact}
              className="text-lg font-semibold text-ink"
            />
            <Delta value={data.marketCapChange24h} className="text-xs" />
          </Stat>
          <Stat label="24h Volume">
            <TickerNumber
              value={data.volume24hUsd}
              format={formatUsdCompact}
              className="text-lg font-semibold text-ink"
            />
          </Stat>
          <Stat label="BTC Dominance">
            <TickerNumber
              value={data.btcDominance}
              format={(v) => `${v.toFixed(1)}%`}
              className="text-lg font-semibold text-ink"
            />
          </Stat>
          <div className="flex flex-col gap-1 px-4 py-2.5">
            <span className="eyebrow">Fear / Greed</span>
            <FearGreedDial value={data.fearGreed.value} label={data.fearGreed.label} />
          </div>
        </>
      )}
    </section>
  );
}
