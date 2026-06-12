"use client";

import { useMarketPulse } from "@/lib/hooks/use-data";
import { Eyebrow, Skeleton } from "@/components/ui/primitives";
import { SourceBadge } from "@/components/ui/source-badge";
import { FearGreedDial } from "@/components/ui/fear-greed-dial";
import { TickerNumber } from "@/components/ui/token-bits";
import { fmtUsd, fmtPct, changeColor, cn } from "@/lib/utils";

function Metric({ label, value, change }: { label: string; value: number; change?: number }) {
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      <TickerNumber value={value} format={(n) => fmtUsd(n)} className="text-xl text-ink" />
      {change !== undefined && <span className={cn("font-mono text-xs tabular-nums", changeColor(change))}>{fmtPct(change)} 24h</span>}
    </div>
  );
}

export function MarketPulse() {
  const { data, isLoading } = useMarketPulse();

  return (
    <section className="panel animate-panel-in">
      <header className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <Eyebrow>Market Pulse</Eyebrow>
        <SourceBadge source="market" />
      </header>
      <div className="flex flex-wrap items-center justify-between gap-6 p-4">
        {isLoading || !data ? (
          <div className="flex w-full gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Metric label="Total Market Cap" value={data.totalMarketCap} change={data.mcapChange24h} />
            <Metric label="24h Volume" value={data.totalVolume24h} change={data.volChange24h} />
            <div className="flex min-w-[120px] flex-col gap-1">
              <Eyebrow>BTC Dominance</Eyebrow>
              <TickerNumber value={data.btcDominance} format={(n) => `${n.toFixed(1)}%`} className="text-xl text-ink" />
              <span className={cn("font-mono text-xs tabular-nums", changeColor(data.btcDominanceChange24h))}>{fmtPct(data.btcDominanceChange24h)} 24h</span>
            </div>
            <FearGreedDial value={data.fearGreed} label={data.fearGreedLabel} size={120} />
          </>
        )}
      </div>
    </section>
  );
}
