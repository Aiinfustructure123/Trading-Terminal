"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { marketSource } from "@/lib/datasources";
import { fmtUsd, fmtPct, cn } from "@/lib/utils";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Narrative } from "@/lib/datasources/types";

function FlowBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.abs(value) / max * 100);
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", positive ? "bg-profit" : "bg-danger")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("num text-xs font-mono w-16 text-right", positive ? "text-profit" : "text-danger")}>
        {positive ? "+" : ""}{fmtUsd(value)}
      </span>
    </div>
  );
}

function NarrativeCard({ n, maxFlow }: { n: Narrative; maxFlow: number }) {
  return (
    <div className="p-3 rounded-md border border-border bg-bg/40 hover:border-signal/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-ink">{n.label}</div>
          <div className="text-xs text-muted">{n.tokens.toLocaleString()} tokens</div>
        </div>
        <div className="text-right">
          <div className="num text-xs text-muted">AVG SCORE</div>
          <div
            className="num text-sm font-semibold"
            style={{ color: n.avgScore >= 60 ? "#3DDC97" : n.avgScore >= 40 ? "#FFB020" : "#FF4D5E" }}
          >
            {n.avgScore}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div>
          <div className="label-eyebrow mb-1">24H FLOW</div>
          <FlowBar value={n.capitalFlow24h} max={maxFlow} />
        </div>
        <div>
          <div className="label-eyebrow mb-1">7D FLOW</div>
          <FlowBar value={n.capitalFlow7d} max={maxFlow * 7} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {n.topTokens.map(t => (
          <span
            key={t.symbol}
            className={cn(
              "text-2xs num px-1.5 py-0.5 rounded border",
              t.priceChange24h >= 0
                ? "bg-profit/5 text-profit border-profit/20"
                : "bg-danger/5 text-danger border-danger/20"
            )}
          >
            {t.symbol} {fmtPct(t.priceChange24h)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NarrativesPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["narratives"],
    queryFn:  () => marketSource.getNarratives(),
    refetchInterval: 120_000,
  });

  const maxFlow = Math.max(...(data?.narratives ?? []).map(n => Math.abs(n.capitalFlow24h)), 1);

  return (
    <div className="panel-surface overflow-hidden h-full flex flex-col">
      <PanelHeader label="Trending Narratives" mode={data?.source.mode ?? "sample"} />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : data?.narratives.map(n => (
              <NarrativeCard key={n.id} n={n} maxFlow={maxFlow} />
            ))
        }
      </div>
    </div>
  );
}
