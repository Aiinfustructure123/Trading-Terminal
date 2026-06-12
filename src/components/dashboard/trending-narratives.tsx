"use client";

import { useNarratives } from "@/lib/hooks/use-data";
import { Panel, Skeleton, Eyebrow } from "@/components/ui/primitives";
import { fmtUsd, cn } from "@/lib/utils";

function FlowBar({ value, label }: { value: number; label: string }) {
  const pos = value >= 0;
  const w = Math.min(100, Math.abs(value));
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 font-mono text-[9px] text-muted">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
        <div
          className={cn("absolute top-0 h-full rounded-full", pos ? "bg-profit" : "bg-danger")}
          style={{ left: pos ? "50%" : `${50 - w / 2}%`, width: `${w / 2}%` }}
        />
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
      </div>
      <span className={cn("w-9 text-right font-mono text-[10px] tabular-nums", pos ? "text-profit" : "text-danger")}>
        {pos ? "+" : ""}{value}
      </span>
    </div>
  );
}

export function TrendingNarratives() {
  const { data, isLoading } = useNarratives();

  return (
    <Panel title="Trending Narratives" source="market" className="h-full">
      <div className="flex flex-col gap-2.5">
        {isLoading || !data
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : data.map((n, i) => (
              <div key={n.id} className="rounded-md border border-border bg-panel-2/40 p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted">#{i + 1}</span>
                    <span className="font-display text-sm font-medium text-ink">{n.name}</span>
                    <span className="font-mono text-[10px] text-muted">{n.tokenCount} tokens</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted">{fmtUsd(n.marketCap)}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  <FlowBar value={n.flow24h} label="24h" />
                  <FlowBar value={n.flow7d} label="7d" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {n.topSymbols.map((s) => (
                    <span key={s} className="rounded bg-bg px-1.5 py-0.5 font-mono text-[9px] text-muted">{s}</span>
                  ))}
                </div>
              </div>
            ))}
      </div>
      <Eyebrow className="mt-3">Capital-flow index, −100…+100</Eyebrow>
    </Panel>
  );
}
