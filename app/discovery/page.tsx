"use client";

import { useState } from "react";
import Link from "next/link";
import { useScreener } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/ui/badge";
import { ConvictionRing, COMPONENT_COLORS } from "@/components/conviction/ring";
import { useBreakdownModal } from "@/components/conviction/breakdown-modal";
import { WatchStar } from "@/components/token/watch-star";
import { formatUsd, formatPct, formatAge, deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ScreenerQuery } from "@/lib/datasources/types";

interface DiscoveryScreen {
  id: string;
  name: string;
  description: string;
  query: ScreenerQuery;
}

const SCREENS: DiscoveryScreen[] = [
  {
    id: "early",
    name: "Early Discovery",
    description: "Younger than 7 days, under $5m mcap, risk no worse than Moderate.",
    query: {
      filter: { maxAgeHours: 24 * 7, maxMarketCap: 5_000_000, maxRiskTier: "Moderate" },
      sort: { key: "conviction", dir: "desc" },
      limit: 12,
    },
  },
  {
    id: "momentum",
    name: "Momentum Leaders",
    description: "Strongest 24h structure with at least $100k of real volume.",
    query: {
      filter: { minVolume24h: 100_000, maxRiskTier: "Moderate" },
      sort: { key: "change24h", dir: "desc" },
      limit: 12,
    },
  },
  {
    id: "liquid-small",
    name: "Liquid Small Caps",
    description: "Under $25m mcap with ≥$250k pool depth — tradable size.",
    query: {
      filter: { maxMarketCap: 25_000_000, minLiquidity: 250_000, maxRiskTier: "Moderate" },
      sort: { key: "conviction", dir: "desc" },
      limit: 12,
    },
  },
];

export default function DiscoveryPage() {
  const [screenId, setScreenId] = useState(SCREENS[0].id);
  const screen = SCREENS.find((s) => s.id === screenId)!;
  const { data, isLoading } = useScreener(screen.query);
  const breakdown = useBreakdownModal();

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Discovery</span>
        <h1 className="text-lg font-semibold leading-tight">Ranked opportunities</h1>
        <p className="max-w-xl text-sm text-muted">
          Preset screens ranked by composite conviction. Every card shows the components driving
          its rank — the why, not just the number.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScreenId(s.id)}
            className={cn(
              "rounded border px-2.5 py-1.5 text-xs transition-colors",
              s.id === screenId
                ? "border-signal/50 bg-signal/10 text-signal"
                : "border-panel-border bg-panel text-muted hover:text-ink"
            )}
          >
            {s.name}
          </button>
        ))}
        <p className="w-full text-xs text-muted">{screen.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {isLoading || !data
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
          : data.map((t, rank) => {
              const drivers = [...t.conviction.components]
                .sort((a, b) => b.score * b.weight - a.score * a.weight)
                .slice(0, 3);
              return (
                <Panel key={t.id} source="market" className="relative" bodyClassName="flex flex-col gap-3 p-3">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-muted" data-numeric>
                      #{rank + 1}
                    </span>
                    <button onClick={() => breakdown.open(t)} aria-label={`Score breakdown for ${t.symbol}`}>
                      <ConvictionRing score={t.conviction} size={48} onOpenBreakdown={() => breakdown.open(t)} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/token/${t.id}`} className="truncate font-semibold hover:text-signal">
                          {t.symbol}
                        </Link>
                        <RiskBadge tier={t.riskTier} />
                        <WatchStar tokenId={t.id} symbol={t.symbol} className="ml-auto" />
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] text-muted" data-numeric>
                        <span>{formatUsd(t.priceUsd)}</span>
                        <span className={deltaColor(t.change24h)}>{formatPct(t.change24h)} 24h</span>
                        <span>mc {formatUsd(t.marketCap, { compact: true })}</span>
                        <span>{formatAge(t.ageHours)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-panel-border pt-2">
                    <span className="eyebrow">Why it ranks</span>
                    {drivers.map((c) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ background: COMPONENT_COLORS[c.key] }} />
                        <span className="w-24 shrink-0 text-xs text-ink/85">{c.label}</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-panel-border">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${c.score}%`, background: COMPONENT_COLORS[c.key], opacity: 0.8 }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-[11px]" data-numeric>
                          {Math.round(c.score)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              );
            })}
      </div>
    </div>
  );
}
