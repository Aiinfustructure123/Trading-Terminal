"use client";

import Link from "next/link";
import { useNewLaunches } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { TokenLogo } from "@/components/token-logo";
import { RiskBadge } from "@/components/risk-badge";
import { ConvictionRing } from "@/components/conviction-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAge, formatCompact, formatPrice } from "@/lib/format";

export function NewLaunchesPanel({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { data, isLoading } = useNewLaunches(14);

  return (
    <Panel title="New Launches" sourceKey="market" live bodyClassName="p-0" actions={dragHandle}>
      {isLoading || !data ? (
        <div className="flex flex-col gap-2 p-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      ) : (
        <ul className="flex max-h-[360px] flex-col divide-y divide-edge/60 overflow-y-auto">
          {data.map((t) => (
            <li key={t.id} className="animate-row-slide-in">
              <Link
                href={`/token/${t.id}`}
                className="flex items-center gap-2.5 px-3.5 py-2 transition-colors hover:bg-panel-2"
              >
                <ConvictionRing score={t.conviction} size={24} showValue={false} />
                <TokenLogo symbol={t.symbol} accent={t.accent} size={20} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] font-semibold text-ink">{t.symbol}</p>
                  <p className="truncate text-[10px] text-muted">{t.chain}</p>
                </div>
                <span className="tabular text-[12px] text-ink">{formatPrice(t.priceUsd)}</span>
                <span className="tabular w-12 text-right text-[11px] text-muted">${formatCompact(t.liquidityUsd)}</span>
                <span className="tabular w-8 text-right text-[11px] text-signal">{formatAge(t.createdAt)}</span>
                <RiskBadge tier={t.riskTier} compact />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
