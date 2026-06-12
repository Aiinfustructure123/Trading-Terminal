"use client";

import Link from "next/link";
import { useNewLaunches } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/ui/badge";
import { formatAge, formatUsd } from "@/lib/format";

export function LaunchesPanel() {
  const { data, isLoading } = useNewLaunches(14);

  return (
    <Panel title="New launches" source="market" bodyClassName="overflow-y-auto">
      {isLoading || !data ? (
        <div className="flex flex-col gap-1.5 p-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-panel-border/60">
          {data.map(({ token }, i) => (
            <li
              key={token.id}
              className="animate-row-in"
              style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
            >
              <Link
                href={`/token/${token.id}`}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-white/[0.03]"
              >
                <span className="w-10 shrink-0 font-mono text-[11px] text-signal" data-numeric>
                  {formatAge(token.ageHours)}
                </span>
                <span className="min-w-0 truncate font-medium">{token.symbol}</span>
                <span className="hidden truncate text-xs text-muted xl:inline">{token.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted" data-numeric>
                  liq {formatUsd(token.liquidityUsd, { compact: true })}
                </span>
                <RiskBadge tier={token.riskTier} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
