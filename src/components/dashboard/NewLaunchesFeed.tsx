"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenSource } from "@/lib/datasources";
import { fmtUsd, fmtRelTime, cn } from "@/lib/utils";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { RiskBadge, ChainBadge } from "@/components/ui/DataBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Zap } from "lucide-react";

export function NewLaunchesFeed() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["new-launches"],
    queryFn:  () => tokenSource.getNewLaunches("solana", 15),
    refetchInterval: 30_000,
  });

  return (
    <div className="panel-surface overflow-hidden h-full flex flex-col">
      <PanelHeader
        label="New Launches"
        mode={data?.source.mode ?? "sample"}
        actions={
          <div className="flex items-center gap-1.5 text-signal text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
            LIVE FEED
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12 mx-3 my-1.5" />)
          : data?.launches.map((launch, i) => (
              <div
                key={launch.address}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 hover:bg-signal/5 cursor-pointer transition-colors",
                  i === 0 ? "animate-slide-in-top" : ""
                )}
                onClick={() => router.push(`/token/${launch.address}`)}
              >
                {/* Live dot */}
                <div className="flex-shrink-0">
                  {i < 2 && <Zap size={10} className="text-signal" />}
                  {i >= 2 && <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                </div>

                {/* Token */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink">{launch.symbol}</span>
                    <ChainBadge chain={launch.chain} />
                  </div>
                  <div className="text-xs text-muted truncate">{launch.name}</div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className="label-eyebrow">LIQ</div>
                    <div className="num text-xs text-ink">{fmtUsd(launch.currentLiquidity)}</div>
                  </div>
                  <div className="text-right">
                    <div className="label-eyebrow">1H VOL</div>
                    <div className="num text-xs text-ink">{fmtUsd(launch.volume1h)}</div>
                  </div>
                </div>

                {/* Risk + time */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <RiskBadge tier={launch.riskTier} />
                  <span className="text-2xs text-muted">{fmtRelTime(launch.launchedAt)}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
