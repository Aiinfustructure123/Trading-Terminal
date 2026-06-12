"use client";

import * as React from "react";
import Link from "next/link";
import { useTopOpportunities } from "@/lib/hooks/queries";
import { ConvictionScore } from "@/lib/datasources/types";
import { formatPrice, formatUsdCompact } from "@/lib/format";
import { ConvictionRing } from "@/components/terminal/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/terminal/score-breakdown";
import { RiskBadge, ChainBadge } from "@/components/terminal/badges";
import { TickerNumber } from "@/components/terminal/ticker-number";
import { Delta } from "@/components/terminal/delta";
import { Skeleton } from "@/components/terminal/skeleton";

export function ConvictionOpportunities() {
  const { data, isPending } = useTopOpportunities(6);
  const [breakdown, setBreakdown] = React.useState<{
    score: ConvictionScore;
    symbol: string;
  } | null>(null);

  if (isPending || !data) {
    return (
      <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((t) => {
          const drivers = [...t.score.components]
            .sort((a, b) => b.subScore * b.weight - a.subScore * a.weight)
            .slice(0, 2);
          return (
            <div
              key={t.id}
              className="group relative rounded-[5px] border border-edge bg-panel-2/40 p-3 transition-colors hover:border-edge-bright"
            >
              <div className="flex items-start gap-3">
                <ConvictionRing
                  score={t.score}
                  size={48}
                  interactive
                  onSegmentClick={() =>
                    setBreakdown({ score: t.score, symbol: t.symbol })
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/token/${t.id}`}
                      className="num truncate text-xs font-semibold text-ink hover:text-signal"
                    >
                      ${t.symbol}
                    </Link>
                    <ChainBadge chain={t.chain} />
                    <RiskBadge tier={t.riskTier} className="ml-auto" />
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <TickerNumber
                      value={t.priceUsd}
                      format={formatPrice}
                      className="text-xs text-ink"
                    />
                    <Delta value={t.change24h} className="text-2xs" />
                    <span className="num ml-auto text-2xs text-muted">
                      {formatUsdCompact(t.marketCapUsd)} mc
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {drivers.map((d) => (
                      <div key={d.key} className="flex items-center gap-1.5 text-2xs">
                        <span className="h-1 w-1 rounded-full bg-signal/80" />
                        <span className="text-muted">{d.label}</span>
                        <span className="num ml-auto text-ink/80">
                          {d.subScore.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ScoreBreakdownDialog
        score={breakdown?.score ?? null}
        symbol={breakdown?.symbol}
        open={breakdown !== null}
        onOpenChange={(o) => !o && setBreakdown(null)}
      />
    </>
  );
}
