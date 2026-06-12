"use client";

import { useHolders } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CreatorWalletStatus } from "@/lib/datasources/types";

const CREATOR_LABEL: Record<CreatorWalletStatus, { text: string; className: string }> = {
  holding: { text: "Creator still holding", className: "text-profit" },
  "sold-partial": { text: "Creator sold partial", className: "text-warn" },
  "sold-all": { text: "Creator fully exited", className: "text-danger" },
  unknown: { text: "Creator status unknown", className: "text-muted" },
};

const BUCKET_COLORS = ["#FF4D5E", "#FFB020", "#3DDC97"];

export function HoldersPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useHolders(tokenId);

  return (
    <Panel title="Holders" source="onchain" bodyClassName="flex flex-col gap-3 p-3">
      {isLoading || !data ? (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-16 w-full" />
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xl font-semibold" data-numeric>
              {data.count.toLocaleString()}
            </span>
            <span
              className={cn("font-mono text-xs", deltaColor(data.countChange24h))}
              data-numeric
            >
              {data.countChange24h >= 0 ? "+" : ""}
              {data.countChange24h.toLocaleString()} / 24h
            </span>
            <span className={cn("ml-auto text-xs", CREATOR_LABEL[data.creatorStatus].className)}>
              {CREATOR_LABEL[data.creatorStatus].text}
              {data.creatorHoldingPct > 0 && (
                <span className="font-mono" data-numeric>
                  {" "}
                  ({data.creatorHoldingPct.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Top-10 concentration</span>
              <span
                className={cn(
                  "font-mono text-sm font-semibold",
                  data.top10ConcentrationPct > 40
                    ? "text-danger"
                    : data.top10ConcentrationPct > 25
                      ? "text-warn"
                      : "text-profit"
                )}
                data-numeric
              >
                {data.top10ConcentrationPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel-border" role="img" aria-label="Supply distribution">
              {data.distribution.map((b, i) => (
                <span
                  key={b.label}
                  title={`${b.label}: ${b.pct.toFixed(1)}%`}
                  style={{ width: `${b.pct}%`, background: BUCKET_COLORS[i] , opacity: 0.75 }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {data.distribution.map((b, i) => (
                <span key={b.label} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="size-2 rounded-sm" style={{ background: BUCKET_COLORS[i], opacity: 0.75 }} />
                  {b.label}
                  <span className="font-mono text-ink/80" data-numeric>
                    {b.pct.toFixed(1)}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
