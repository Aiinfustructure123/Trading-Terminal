"use client";

import Link from "next/link";
import { useNarratives } from "@/lib/hooks/queries";
import { formatUsdCompact } from "@/lib/format";
import { Delta } from "@/components/terminal/delta";
import { PanelSkeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

function FlowBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow w-6 shrink-0 !text-[9px]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", positive ? "bg-profit/80" : "bg-danger/80")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("num w-16 shrink-0 text-right text-2xs", positive ? "text-profit" : "text-danger")}>
        {positive ? "+" : "−"}{formatUsdCompact(Math.abs(value)).replace("$", "$")}
      </span>
    </div>
  );
}

export function TrendingNarratives() {
  const { data, isPending } = useNarratives();

  if (isPending || !data) return <PanelSkeleton rows={6} />;

  const maxFlow = Math.max(
    ...data.map((n) => Math.max(Math.abs(n.flow24hUsd), Math.abs(n.flow7dUsd) / 5)),
  );

  return (
    <div className="divide-y divide-edge/70">
      {data.map((n, rank) => (
        <Link
          key={n.id}
          href={`/screener?narrative=${n.id}`}
          className="block px-3 py-2.5 transition-colors hover:bg-panel-2/60"
        >
          <div className="flex items-baseline gap-2">
            <span className="num w-4 text-2xs text-muted">{rank + 1}</span>
            <span className="text-xs font-medium text-ink">{n.name}</span>
            <span className="num text-2xs text-muted">{n.tokenCount} tokens</span>
            <span className="num ml-auto text-2xs text-muted">
              {formatUsdCompact(n.marketCapUsd)}
            </span>
            <Delta value={n.change24h} className="w-14 text-right text-xs" />
          </div>
          <div className="mt-1.5 space-y-1 pl-6">
            <FlowBar value={n.flow24hUsd} max={maxFlow} label="24H" />
            <FlowBar value={n.flow7dUsd / 5} max={maxFlow} label="7D" />
          </div>
        </Link>
      ))}
    </div>
  );
}
