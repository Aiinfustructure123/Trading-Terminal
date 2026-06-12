"use client";

import { useHolderStats } from "@/lib/hooks/queries";
import { CreatorStatus } from "@/lib/datasources/types";
import { formatPercent } from "@/lib/format";
import { Delta } from "@/components/terminal/delta";
import { PanelSkeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

const CREATOR_LABEL: Record<CreatorStatus, { text: string; tone: string }> = {
  holding: { text: "Creator holding", tone: "text-profit" },
  trimmed: { text: "Creator trimmed position", tone: "text-warn" },
  exited: { text: "Creator fully exited", tone: "text-danger" },
};

export function HoldersPanel({ tokenId }: { tokenId: string }) {
  const { data, isPending, isError } = useHolderStats(tokenId);

  if (isPending) return <PanelSkeleton rows={4} />;
  if (isError || !data) {
    return (
      <div className="p-4 text-2xs text-muted">
        Source degraded — holder data unavailable.
      </div>
    );
  }

  const creator = CREATOR_LABEL[data.creatorStatus];
  const concentrationTone =
    data.top10Pct > 60 ? "bg-danger" : data.top10Pct > 40 ? "bg-warn" : "bg-profit";

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-baseline gap-3">
        <div>
          <div className="eyebrow !text-[9px]">Holders</div>
          <div className="num mt-0.5 text-lg font-semibold text-ink">
            {data.holderCount.toLocaleString("en-US")}
          </div>
        </div>
        <Delta value={data.holderChange24h} className="text-xs" />
        <span className="num text-2xs text-muted">24h</span>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="eyebrow !text-[9px]">Top-10 concentration</span>
          <span className="num text-xs text-ink">{formatPercent(data.top10Pct, { sign: false })}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-edge">
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", concentrationTone)}
            style={{ width: `${Math.min(100, data.top10Pct)}%`, opacity: 0.85 }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {data.distribution.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-2xs text-muted">{d.label}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-signal/70"
                style={{ width: `${Math.min(100, d.pct)}%` }}
              />
            </div>
            <span className="num w-12 shrink-0 text-right text-2xs text-ink">
              {d.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-edge pt-2.5">
        <span className={cn("text-xs font-medium", creator.tone)}>{creator.text}</span>
        <span className="num ml-2 text-2xs text-muted">
          {data.creatorPct.toFixed(1)}% of supply
        </span>
      </div>
    </div>
  );
}
