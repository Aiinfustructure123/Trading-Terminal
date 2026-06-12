"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenSource } from "@/lib/datasources";
import { fmtUsd, fmtPct, fmtPrice, cn } from "@/lib/utils";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { ConvictionRing } from "@/components/ui/ConvictionRing";
import { RiskBadge, ChainBadge } from "@/components/ui/DataBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export function ConvictionOpportunities() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["top-conviction"],
    queryFn:  () => tokenSource.getTokens({ sortBy: "score", sortDir: "desc", limit: 6, riskTiers: ["Low", "Moderate"] }),
    refetchInterval: 60_000,
  });

  return (
    <div className="panel-surface overflow-hidden h-full flex flex-col">
      <PanelHeader label="AI Conviction Opportunities" mode={data?.source.mode ?? "sample"} />
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 gap-2">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : data?.tokens.map(token => (
              <button
                key={token.address}
                onClick={() => router.push(`/token/${token.address}`)}
                className="flex items-center gap-3 p-3 rounded-md border border-border bg-bg/40
                           hover:border-signal/40 hover:bg-signal/5 transition-all text-left group"
              >
                {/* Conviction Ring */}
                <ConvictionRing score={token.score} size={56} showLabel />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-ink group-hover:text-signal transition-colors">
                      {token.symbol}
                    </span>
                    <ChainBadge chain={token.chain} />
                    <RiskBadge tier={token.score.riskTier} />
                  </div>
                  <div className="text-xs text-muted truncate">{token.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="num text-xs text-ink">{fmtPrice(token.price)}</span>
                    <span className={cn("num text-xs", token.priceChange24h >= 0 ? "text-profit" : "text-danger")}>
                      {fmtPct(token.priceChange24h)}
                    </span>
                    <span className="num text-xs text-muted">{fmtUsd(token.marketCap)} mcap</span>
                  </div>
                </div>

                {/* Score components mini-bar */}
                <div className="hidden sm:flex flex-col gap-0.5 w-20">
                  {token.score.components.slice(0, 3).map(c => (
                    <div key={c.key} className="flex items-center gap-1">
                      <span className="text-2xs text-muted w-10 truncate">{c.label}</span>
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.subScore}%`,
                            background: c.subScore >= 70 ? "#3DDC97" : c.subScore >= 45 ? "#FFB020" : "#FF4D5E",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            ))
        }
      </div>
    </div>
  );
}
