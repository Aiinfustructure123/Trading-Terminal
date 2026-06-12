"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { onChainSource } from "@/lib/datasources";
import type { Chain } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { truncateAddress, fmtUsd, cn } from "@/lib/utils";
import { Shield, ShieldAlert } from "lucide-react";

interface Props {
  address: string;
  chain: Chain;
}

export function HoldersPanel({ address, chain }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["holders", address, chain],
    queryFn:  () => onChainSource.getHolders(address, chain),
  });

  if (isLoading) return (
    <div className="panel-surface overflow-hidden">
      <PanelHeader label="Holders" />
      <Skeleton className="h-48 m-4" />
    </div>
  );

  if (!data) return null;

  const totalConc = data.topHolders.reduce((s, h) => s + h.pct, 0);

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader label="Holders" mode={data.source.mode} />
      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="label-eyebrow">TOTAL HOLDERS</div>
            <div className="num text-xl font-semibold text-ink">{data.holderCount.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            {data.creatorWalletStatus === "sold" ? (
              <div className="flex items-center gap-1.5 text-danger">
                <ShieldAlert size={14} />
                <span className="text-xs">Creator exited</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-profit">
                <Shield size={14} />
                <span className="text-xs">Creator holding</span>
              </div>
            )}
          </div>
        </div>

        {/* Top-10 concentration bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="label-eyebrow">TOP-10 CONCENTRATION</span>
            <span className={cn(
              "num text-sm font-semibold",
              totalConc > 60 ? "text-danger" : totalConc > 40 ? "text-warn" : "text-profit"
            )}>
              {totalConc.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden flex">
            {data.topHolders.map((h, i) => (
              <div
                key={h.address}
                className="h-full"
                style={{
                  width: `${(h.pct / totalConc) * 100}%`,
                  background: h.isCreator ? "#FF4D5E" :
                    i < 3 ? "#FFB020" : "#5CE1E6",
                  opacity: 1 - i * 0.07,
                }}
                title={`${h.label ?? truncateAddress(h.address)}: ${h.pct.toFixed(2)}%`}
              />
            ))}
          </div>
        </div>

        {/* Top holders table */}
        <div className="space-y-1">
          {data.topHolders.map((h) => (
            <div
              key={h.address}
              className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-border/30 transition-colors"
            >
              <span className="num text-xs text-muted w-4 text-right">{h.rank}</span>
              <span
                className={cn(
                  "font-mono text-xs flex-1 truncate",
                  h.isCreator ? "text-danger" : "text-ink"
                )}
              >
                {h.label ?? truncateAddress(h.address)}
              </span>
              <span className="num text-xs text-muted">{fmtUsd(h.value)}</span>
              <span
                className={cn(
                  "num text-xs w-12 text-right",
                  h.isCreator ? "text-danger" : h.rank <= 3 ? "text-warn" : "text-muted"
                )}
              >
                {h.pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
