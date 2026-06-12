"use client";

import * as React from "react";
import Link from "next/link";
import { useTokens } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { ConvictionRing } from "@/components/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/score-breakdown";
import { TokenLogo } from "@/components/token-logo";
import { RiskBadge } from "@/components/risk-badge";
import { DeltaValue } from "@/components/delta-value";
import { WatchButton } from "@/components/watch-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, formatPrice } from "@/lib/format";

export function ConvictionOpportunitiesPanel({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { data, isLoading } = useTokens({
    sortBy: "conviction",
    sortDir: "desc",
    maxRiskTier: "Moderate",
    maxAgeDays: 30,
    limit: 6,
  });

  return (
    <Panel title="AI Conviction Opportunities" sourceKey="ai" live actions={dragHandle}>
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((t) => {
            const top = [...t.conviction.components].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];
            return (
              <div
                key={t.id}
                className="group relative flex items-center gap-3 rounded-md border border-edge bg-panel-2/40 p-3 transition-colors hover:border-signal/30 hover:bg-panel-2"
              >
                <ScoreBreakdownDialog
                  token={t}
                  trigger={
                    <button className="shrink-0 focus-visible:outline-none" aria-label={`${t.symbol} score breakdown`}>
                      <ConvictionRing score={t.conviction} size={48} />
                    </button>
                  }
                />
                <Link href={`/token/${t.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TokenLogo symbol={t.symbol} accent={t.accent} size={18} />
                    <span className="truncate font-mono text-[13px] font-semibold text-ink">{t.symbol}</span>
                    <RiskBadge tier={t.riskTier} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[12px]">
                    <span className="tabular text-ink">{formatPrice(t.priceUsd)}</span>
                    <DeltaValue value={t.deltas.h24} />
                    <span className="tabular text-muted">· ${formatCompact(t.marketCapUsd)}</span>
                  </div>
                  {top && <p className="mt-1 truncate text-[11px] text-muted">▸ {top.explanation}</p>}
                </Link>
                <WatchButton id={t.id} className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
