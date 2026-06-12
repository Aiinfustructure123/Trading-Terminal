"use client";

import Link from "next/link";
import { useNewLaunches } from "@/lib/hooks/queries";
import { formatUsdCompact, timeAgo } from "@/lib/format";
import { RiskBadge, ChainBadge } from "@/components/terminal/badges";
import { PanelSkeleton } from "@/components/terminal/skeleton";

export function NewLaunchesFeed() {
  const { data, isPending } = useNewLaunches(14);

  if (isPending || !data) return <PanelSkeleton rows={8} />;

  return (
    <div className="divide-y divide-edge/70 overflow-y-auto">
      {data.map((l, i) => (
        <Link
          key={l.id}
          href={`/token/${l.tokenId}`}
          className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-panel-2/60"
          style={i === 0 ? { animation: "row-in 220ms ease-out both" } : undefined}
        >
          <span className="num w-12 shrink-0 text-2xs text-signal/90">
            {timeAgo(l.launchedAt)}
          </span>
          <span className="num w-14 truncate text-xs font-medium text-ink">
            ${l.symbol}
          </span>
          <ChainBadge chain={l.chain} />
          <RiskBadge tier={l.riskTier} />
          <span className="num ml-auto text-2xs text-muted">
            liq {formatUsdCompact(l.liquidityUsd)}
          </span>
          <span className="num hidden w-16 text-right text-2xs text-muted sm:inline">
            {formatUsdCompact(l.marketCapUsd)} mc
          </span>
        </Link>
      ))}
    </div>
  );
}
