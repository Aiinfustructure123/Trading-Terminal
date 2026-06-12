"use client";

import Link from "next/link";
import { useNewLaunches } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import { RiskBadge, TokenAvatar, ChainTag } from "@/components/ui/token-bits";
import { fmtUsd } from "@/lib/utils";

export function NewLaunches() {
  const { data, isLoading } = useNewLaunches();
  return (
    <Panel title="New Launches" source="market" className="h-full" dense
      action={<span className="px-3.5 font-mono text-[9px] text-signal">● live feed</span>}
    >
      <div className="max-h-[420px] overflow-y-auto">
        {isLoading || !data ? (
          <div className="space-y-2 p-3.5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <ul>
            {data.map((l) => (
              <li key={l.address} className="animate-row-in">
                <Link href={`/token/${l.address}`} className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-2 hover:bg-panel-2">
                  <TokenAvatar symbol={l.symbol} accent={l.accent} size={26} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-ink">{l.symbol}</span>
                      <ChainTag chain={l.chain} />
                    </div>
                    <div className="truncate text-[10px] text-muted">{l.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] tabular-nums text-ink">{fmtUsd(l.liquidityUsd)}</div>
                    <div className="eyebrow" style={{ fontSize: 8 }}>{l.ageMinutes < 60 ? `${l.ageMinutes}m` : `${Math.round(l.ageMinutes / 60)}h`} old</div>
                  </div>
                  <RiskBadge tier={l.riskTier} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
