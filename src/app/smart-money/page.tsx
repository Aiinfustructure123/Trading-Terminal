"use client";

import { Lock } from "lucide-react";
import { useSmartWallets } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/source-badge";
import { formatCompact, formatRelativeTime, shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SmartMoneyPage() {
  const { data, isLoading } = useSmartWallets();

  const activity = (data ?? [])
    .flatMap((w) => w.recentActivity.map((a) => ({ ...a, wallet: w.label })))
    .sort((x, y) => y.timestamp - x.timestamp)
    .slice(0, 16);

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Tracked Wallets"
        title="Smart Money"
        description="Labeled-wallet performance and flow. This screen requires a contracted labeled-wallet dataset — it stays SAMPLE until that data is in place. We never fake it as live."
        actions={<SourceBadge sourceKey="smartMoney" />}
      />

      <div className="px-5 pt-4">
        <div className="flex items-center gap-3 rounded-md border border-warn/30 bg-warn/5 px-4 py-3">
          <Lock className="h-4 w-4 shrink-0 text-warn" />
          <p className="text-[13px] text-ink">
            <span className="font-semibold text-warn">SAMPLE — requires premium data.</span> Wallet labels, win rates,
            and PnL shown here are generated for demonstration. Goes live only when a labeled-wallet source is
            contracted (Phase 4).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
        <Panel title="Tracked Wallets" sourceKey="smartMoney" className="lg:col-span-2" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-edge text-left">
                  {["Wallet", "Win Rate", "Realized PnL", "Trades 30d", "Avg Hold"].map((h) => (
                    <th key={h} className="eyebrow px-3.5 py-2 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading || !data
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-edge/60">
                        <td colSpan={5} className="px-3.5 py-2">
                          <Skeleton className="h-7 w-full" />
                        </td>
                      </tr>
                    ))
                  : data.map((w) => (
                      <tr key={w.address} className="border-b border-edge/60 transition-colors hover:bg-panel-2">
                        <td className="px-3.5 py-2.5">
                          <p className="font-display text-ink">{w.label}</p>
                          <p className="tabular text-[11px] text-muted">{shortenAddress(w.address)}</p>
                        </td>
                        <td className="tabular px-3.5 py-2.5">
                          <span className={cn(w.winRate >= 0.6 ? "text-profit" : "text-ink")}>
                            {(w.winRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className={cn("tabular px-3.5 py-2.5", w.realizedPnlUsd >= 0 ? "text-profit" : "text-danger")}>
                          {w.realizedPnlUsd >= 0 ? "+" : "-"}${formatCompact(Math.abs(w.realizedPnlUsd))}
                        </td>
                        <td className="tabular px-3.5 py-2.5 text-ink">{w.trades30d}</td>
                        <td className="tabular px-3.5 py-2.5 text-muted">{w.avgHoldHours}h</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Recent Entries / Exits" sourceKey="smartMoney" bodyClassName="p-0">
          {isLoading || !data ? (
            <div className="flex flex-col gap-2 p-3.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : (
            <ul className="flex max-h-[520px] flex-col divide-y divide-edge/60 overflow-y-auto">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-2 px-3.5 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-ink">
                      <span className="text-muted">{a.wallet}</span>
                    </p>
                    <p className="text-[11px] text-muted">{formatRelativeTime(a.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.type === "entry" ? "profit" : "danger"}>{a.type}</Badge>
                    <span className="font-mono text-[12px] font-semibold text-ink">{a.tokenSymbol}</span>
                    <span className="tabular w-14 text-right text-[11px] text-muted">${formatCompact(a.amountUsd)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
