"use client";

import Link from "next/link";
import { useTopConviction } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvictionRing } from "@/components/conviction/ring";
import { useBreakdownModal } from "@/components/conviction/breakdown-modal";
import { RiskBadge } from "@/components/ui/badge";
import { formatUsd, formatPct, deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OpportunitiesPanel() {
  const { data, isLoading } = useTopConviction(6);
  const breakdown = useBreakdownModal();

  return (
    <Panel
      title="AI conviction opportunities"
      source="ai"
      bodyClassName="grid grid-cols-1 gap-px overflow-y-auto bg-panel-border sm:grid-cols-2"
    >
      {isLoading || !data
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-panel p-3">
              <Skeleton className="h-20 w-full" />
            </div>
          ))
        : data.map((t) => {
            const top = [...t.conviction.components].sort(
              (a, b) => b.score * b.weight - a.score * a.weight
            )[0];
            return (
              <div key={t.id} className="group relative flex gap-3 bg-panel p-3 transition-colors hover:bg-white/[0.02]">
                <button
                  onClick={() => breakdown.open(t)}
                  className="shrink-0 self-center"
                  aria-label={`Score breakdown for ${t.symbol}`}
                >
                  <ConvictionRing score={t.conviction} size={56} onOpenBreakdown={() => breakdown.open(t)} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/token/${t.id}`}
                      className="truncate text-sm font-semibold hover:text-signal"
                    >
                      {t.symbol}
                    </Link>
                    <RiskBadge tier={t.riskTier} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs" data-numeric>
                      {formatUsd(t.priceUsd)}
                    </span>
                    <span className={cn("font-mono text-[11px]", deltaColor(t.change24h))} data-numeric>
                      {formatPct(t.change24h)} 24h
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted" title={`${top.label}: ${top.reason}`}>
                    <span className="text-ink/70">{top.label} {Math.round(top.score)}</span> — {top.reason}
                  </p>
                </div>
              </div>
            );
          })}
    </Panel>
  );
}
