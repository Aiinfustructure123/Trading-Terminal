"use client";

import { useNarratives } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, formatPct, deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";

function FlowBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (Math.abs(value) / Math.max(1, max)) * 100);
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 font-mono text-[10px] text-muted">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-panel-border">
        <div
          className={cn("h-full rounded-full", positive ? "bg-profit/80" : "bg-danger/80")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn("w-16 shrink-0 text-right font-mono text-[11px]", positive ? "text-profit" : "text-danger")}
        data-numeric
      >
        {positive ? "+" : "−"}${formatCompact(Math.abs(value))}
      </span>
    </div>
  );
}

export function NarrativesPanel() {
  const { data, isLoading } = useNarratives();
  const maxFlow = Math.max(1, ...(data?.map((n) => Math.abs(n.flow7d)) ?? [1]));

  return (
    <Panel title="Trending narratives" source="market" bodyClassName="flex flex-col divide-y divide-panel-border overflow-y-auto">
      {isLoading || !data
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3">
              <Skeleton className="h-14 w-full" />
            </div>
          ))
        : data.map((n, rank) => (
            <div key={n.id} className="flex flex-col gap-1.5 px-3 py-2.5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] text-muted" data-numeric>
                  {String(rank + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold">{n.name}</span>
                <span className="font-mono text-[11px] text-muted" data-numeric>
                  {n.tokenCount} tokens · ${formatCompact(n.totalMarketCap)}
                </span>
                <span className={cn("ml-auto font-mono text-xs", deltaColor(n.change24h))} data-numeric>
                  {formatPct(n.change24h)}
                </span>
              </div>
              <FlowBar label="24h" value={n.flow24h} max={maxFlow} />
              <FlowBar label="7d" value={n.flow7d} max={maxFlow} />
            </div>
          ))}
    </Panel>
  );
}
