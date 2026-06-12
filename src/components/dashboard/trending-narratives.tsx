"use client";

import Link from "next/link";
import type { Narrative } from "@/lib/datasources";
import { useNarratives } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { DeltaValue } from "@/components/delta-value";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

function FlowBar({ value, label }: { value: number; label: string }) {
  const width = Math.min(Math.abs(value), 100);
  const up = value >= 0;
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow w-6 shrink-0">{label}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
        <div
          className={cn("absolute top-0 h-full rounded-full", up ? "left-1/2 bg-profit" : "right-1/2 bg-danger")}
          style={{ width: `${width / 2}%` }}
        />
        <div className="absolute left-1/2 top-0 h-full w-px bg-edge" />
      </div>
      <DeltaValue value={value} className="w-14 shrink-0 text-right text-[11px]" />
    </div>
  );
}

function NarrativeCard({ n }: { n: Narrative }) {
  return (
    <Link
      href={`/screener?narrative=${n.key}`}
      className="flex flex-col gap-2 rounded-md border border-edge bg-panel-2/40 p-3 transition-colors hover:border-signal/30 hover:bg-panel-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-[14px] font-medium text-ink">{n.label}</p>
          <p className="eyebrow mt-0.5">{n.tokenCount} tokens · ${formatCompact(n.marketCapUsd)}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">{n.key}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <FlowBar value={n.flow24h} label="24h" />
        <FlowBar value={n.flow7d} label="7d" />
      </div>
      <div className="flex flex-wrap gap-1">
        {n.topSymbols.map((s) => (
          <span key={s} className="rounded-sm bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted">
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function TrendingNarrativesPanel({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { data, isLoading } = useNarratives();

  return (
    <Panel title="Trending Narratives" sourceKey="market" live actions={dragHandle}>
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((n) => (
            <NarrativeCard key={n.key} n={n} />
          ))}
        </div>
      )}
    </Panel>
  );
}
