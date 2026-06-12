"use client";

import { useHolders } from "@/lib/hooks/use-data";
import { Panel, Skeleton, Eyebrow } from "@/components/ui/primitives";
import { fmtNum, fmtPct, changeColor, cn } from "@/lib/utils";

const SEG_COLORS = ["#FF4D5E", "#FFB020", "#9B8CFF", "#62B6FF", "#3DDC97"];

export function HoldersPanel({ address }: { address: string }) {
  const { data, isLoading } = useHolders(address);
  return (
    <Panel title="Holders" source="onchain" className="h-full">
      {isLoading || !data ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Eyebrow>Holders</Eyebrow>
              <div className="font-mono text-lg tabular-nums text-ink">{fmtNum(data.count)}</div>
              <div className={cn("font-mono text-[10px] tabular-nums", changeColor(data.growth24hPct))}>{fmtPct(data.growth24hPct)} 24h</div>
            </div>
            <div>
              <Eyebrow>Top 10</Eyebrow>
              <div className={cn("font-mono text-lg tabular-nums", data.top10Pct > 50 ? "text-danger" : data.top10Pct > 30 ? "text-warn" : "text-profit")}>{data.top10Pct.toFixed(1)}%</div>
            </div>
            <div>
              <Eyebrow>Creator</Eyebrow>
              <div className={cn("font-mono text-lg tabular-nums", data.creatorPct > 10 ? "text-danger" : "text-ink")}>{data.creatorPct.toFixed(1)}%</div>
              <div className="text-[10px] text-muted">{data.creatorStatus}</div>
            </div>
          </div>

          <div>
            <Eyebrow>Top-10 Concentration</Eyebrow>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-border-strong">
              <div className={cn("h-full rounded-full", data.top10Pct > 50 ? "bg-danger" : data.top10Pct > 30 ? "bg-warn" : "bg-profit")} style={{ width: `${data.top10Pct}%` }} />
            </div>
          </div>

          <div>
            <Eyebrow>Supply Distribution</Eyebrow>
            <div className="mt-1.5 flex h-3 w-full overflow-hidden rounded-full">
              {data.distribution.map((d, i) => (
                <div key={d.label} className="h-full" style={{ width: `${d.pct}%`, background: SEG_COLORS[i % SEG_COLORS.length] }} title={`${d.label}: ${d.pct.toFixed(1)}%`} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.distribution.map((d, i) => (
                <span key={d.label} className="flex items-center gap-1 font-mono text-[10px] text-muted">
                  <span className="size-2 rounded-sm" style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
                  {d.label} {d.pct.toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
