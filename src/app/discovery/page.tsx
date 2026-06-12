"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  ScreenerFilter,
  ScreenerSort,
  TokenSummary,
} from "@/lib/datasources/types";
import { useScreenerTokens } from "@/lib/hooks/queries";
import { formatAge, formatPrice, formatUsdCompact } from "@/lib/format";
import { toggleWatch, useWatchlist } from "@/lib/store/watchlist";
import { ConvictionRing, ringColor } from "@/components/terminal/conviction-ring";
import { RiskBadge, ChainBadge, SourceBadge } from "@/components/terminal/badges";
import { Delta } from "@/components/terminal/delta";
import { Skeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

interface DiscoveryScreen {
  id: string;
  name: string;
  thesis: string;
  filter: ScreenerFilter;
  sort: ScreenerSort;
}

const SCREENS: DiscoveryScreen[] = [
  {
    id: "early",
    name: "Early Discovery",
    thesis: "Younger than 7 days, under $5M mcap, risk no worse than Moderate — the hunting ground for asymmetric entries.",
    filter: { maxAgeDays: 7, maxMarketCapUsd: 5_000_000, maxRiskTier: "Moderate" },
    sort: { key: "composite", dir: "desc" },
  },
  {
    id: "momentum",
    name: "Momentum Leaders",
    thesis: "Highest composite conviction among tokens doing at least $100K of daily volume.",
    filter: { minVolume24hUsd: 100_000, maxRiskTier: "Moderate" },
    sort: { key: "composite", dir: "desc" },
  },
  {
    id: "deep",
    name: "Deep & Clean",
    thesis: "Low forensic risk with at least $250K pooled — for size that needs a real exit door.",
    filter: { minLiquidityUsd: 250_000, maxRiskTier: "Low" },
    sort: { key: "composite", dir: "desc" },
  },
  {
    id: "fresh",
    name: "Fresh Launches",
    thesis: "Under 24 hours old with liquidity already seeded. Highest risk shelf on the terminal.",
    filter: { maxAgeDays: 1, minLiquidityUsd: 10_000 },
    sort: { key: "createdAt", dir: "desc" },
  },
];

function OpportunityCard({
  token,
  rank,
}: {
  token: TokenSummary;
  rank: number;
}) {
  const watchlist = useWatchlist();
  const watched = watchlist.includes(token.id);
  const drivers = [...token.score.components]
    .sort((a, b) => b.subScore * b.weight - a.subScore * a.weight)
    .slice(0, 3);

  return (
    <div className="panel animate-panel-in flex flex-col p-3 transition-colors hover:border-edge-bright">
      <div className="flex items-start gap-3">
        <span className="num w-7 pt-1 text-sm font-semibold text-muted/70">
          {String(rank).padStart(2, "0")}
        </span>
        <ConvictionRing score={token.score} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/token/${token.id}`}
              className="num truncate text-sm font-semibold text-ink hover:text-signal"
            >
              ${token.symbol}
            </Link>
            <ChainBadge chain={token.chain} />
            <button
              type="button"
              onClick={() => toggleWatch(token.id)}
              aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
              className="ml-auto cursor-pointer p-1 text-muted/50 hover:text-warn"
            >
              <Star size={13} className={cn(watched && "fill-warn text-warn")} />
            </button>
          </div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="num text-xs text-ink">{formatPrice(token.priceUsd)}</span>
            <Delta value={token.change24h} className="text-2xs" />
            <span className="num text-2xs text-muted">
              {formatUsdCompact(token.marketCapUsd)} mc · {formatUsdCompact(token.liquidityUsd)} liq · {formatAge(token.createdAt)}
            </span>
          </div>
        </div>
        <RiskBadge tier={token.riskTier} />
      </div>

      <div className="mt-3 space-y-1.5 border-t border-edge/70 pt-2.5">
        <div className="eyebrow !text-[9px]">Why it ranks</div>
        {drivers.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-2xs text-muted">{d.label}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${d.subScore}%`,
                  background: ringColor(d.subScore),
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="num w-7 shrink-0 text-right text-2xs text-ink">
              {d.subScore.toFixed(0)}
            </span>
            <span className="num w-16 shrink-0 text-right text-[9px] text-muted/70">
              w {(d.weight * 100).toFixed(0)}% → +{(d.subScore * d.weight).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const [screenId, setScreenId] = React.useState(SCREENS[0].id);
  const screen = SCREENS.find((s) => s.id === screenId) ?? SCREENS[0];
  const { data, isPending } = useScreenerTokens(screen.filter, screen.sort);
  const ranked = data?.slice(0, 12);

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScreenId(s.id)}
            className={cn(
              "cursor-pointer rounded-[4px] border px-3 py-1.5 text-xs transition-colors",
              s.id === screenId
                ? "border-signal/50 bg-signal/10 text-signal"
                : "border-edge bg-panel text-muted hover:border-edge-bright hover:text-ink",
            )}
          >
            {s.name}
          </button>
        ))}
        <SourceBadge source="market" className="ml-auto" />
      </div>

      <p className="max-w-2xl text-2xs leading-4 text-muted">{screen.thesis}</p>

      {isPending || !ranked ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="panel px-4 py-16 text-center text-xs text-muted">
          Nothing qualifies for this screen right now — the bar stays where it is.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map((t, i) => (
            <OpportunityCard key={t.id} token={t} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
