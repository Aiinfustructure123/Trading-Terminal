"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTrackedWallets, useWalletActivity } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, shortAddress, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SmartMoneyPage() {
  const { data: wallets, isLoading: walletsLoading } = useTrackedWallets();
  const { data: events, isLoading: eventsLoading } = useWalletActivity(24);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Smart money</span>
        <h1 className="text-lg font-semibold leading-tight">Tracked wallets</h1>
      </header>

      {/* Honest banner — this entire screen requires premium data */}
      <div className="flex items-start gap-3 rounded border border-warn/30 bg-warn/5 px-3 py-2.5">
        <span className="mt-0.5 size-2 shrink-0 animate-pulse-dot rounded-full bg-warn" aria-hidden />
        <p className="text-xs leading-relaxed text-warn/90">
          <span className="font-semibold uppercase tracking-wider">Sample — requires premium data.</span>{" "}
          Labeled smart-money wallet data needs a contracted provider (e.g. Nansen-class labeling).
          Everything below is generated sample data demonstrating the screen. It goes live only when
          a real labeled-wallet source exists — it will never be silently faked.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr]">
        {/* Wallet table */}
        <Panel title="Tracked wallets" source="smartMoney" bodyClassName="overflow-x-auto">
          {walletsLoading || !wallets ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <table className="w-full min-w-[620px] text-[13px]">
              <thead>
                <tr className="border-b border-panel-border">
                  <th className="eyebrow px-3 py-2 text-left font-medium">Wallet</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Win rate</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Realized PnL</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Trades 30d</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Avg hold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-border/60">
                {wallets.map((w) => (
                  <tr key={w.address} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-3 py-2">
                      <span className="font-medium">{w.label}</span>
                      <span className="ml-2 font-mono text-[11px] text-muted">{shortAddress(w.address)}</span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-mono",
                        w.winRatePct >= 55 ? "text-profit" : w.winRatePct >= 45 ? "text-ink" : "text-danger"
                      )}
                      data-numeric
                    >
                      {w.winRatePct.toFixed(0)}%
                    </td>
                    <td
                      className={cn("px-3 py-2 text-right font-mono", w.realizedPnlUsd >= 0 ? "text-profit" : "text-danger")}
                      data-numeric
                    >
                      {w.realizedPnlUsd >= 0 ? "+" : "−"}${formatCompact(Math.abs(w.realizedPnlUsd))}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-muted" data-numeric>
                      {w.trades30d}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-muted" data-numeric>
                      {w.avgHoldHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* Activity feed */}
        <Panel title="Recent entries / exits" source="smartMoney" bodyClassName="overflow-y-auto">
          {eventsLoading || !events ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-panel-border/60">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/token/${e.tokenId}`}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-white/[0.03]"
                  >
                    {e.kind === "entry" ? (
                      <ArrowUpRight className="size-3.5 shrink-0 text-profit" aria-label="Entry" />
                    ) : (
                      <ArrowDownRight className="size-3.5 shrink-0 text-danger" aria-label="Exit" />
                    )}
                    <span className="min-w-0 truncate text-xs text-muted">{e.walletLabel}</span>
                    <span className="font-mono font-medium" data-numeric>
                      {e.tokenSymbol}
                    </span>
                    <span
                      className={cn("ml-auto font-mono text-xs", e.kind === "entry" ? "text-profit" : "text-danger")}
                      data-numeric
                    >
                      {e.kind === "entry" ? "+" : "−"}${formatCompact(e.amountUsd)}
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-[10px] text-muted" data-numeric>
                      {timeAgo(e.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
