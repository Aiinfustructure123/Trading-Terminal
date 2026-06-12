"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useSmartMoneyActivity, useSmartMoneyWallets } from "@/lib/hooks/queries";
import { WalletEvent } from "@/lib/datasources/types";
import { formatUsdCompact, shortAddress, timeAgo } from "@/lib/format";
import { Panel } from "@/components/terminal/panel";
import { PanelSkeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<WalletEvent["kind"], { label: string; cls: string }> = {
  entry: { label: "ENTRY", cls: "border-profit/40 text-profit bg-profit/[0.07]" },
  add: { label: "ADD", cls: "border-profit/30 text-profit/80 bg-profit/[0.05]" },
  trim: { label: "TRIM", cls: "border-warn/40 text-warn bg-warn/[0.07]" },
  exit: { label: "EXIT", cls: "border-danger/40 text-danger bg-danger/[0.07]" },
};

export default function SmartMoneyPage() {
  const wallets = useSmartMoneyWallets();
  const activity = useSmartMoneyActivity();

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Honesty banner — this entire screen requires premium data */}
      <div className="flex items-start gap-3 rounded-[6px] border border-warn/35 bg-warn/[0.06] px-4 py-3">
        <Lock size={14} className="mt-0.5 shrink-0 text-warn" />
        <div>
          <div className="text-xs font-medium text-warn">
            SAMPLE — requires premium data
          </div>
          <p className="mt-0.5 max-w-2xl text-2xs leading-4 text-muted">
            Labeled smart-money wallets need a paid data provider (e.g. Nansen-class
            wallet labeling). Everything on this screen is generated sample data and
            stays that way until a real source is contracted — it will never be
            silently faked. Win rates and PnL below are illustrative only.
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Panel
          title="Tracked Wallets"
          source="smartMoney"
          className="xl:col-span-7"
          bodyClassName="overflow-x-auto"
        >
          {wallets.isPending || !wallets.data ? (
            <PanelSkeleton rows={8} />
          ) : (
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="border-b border-edge text-left">
                  {["Wallet", "Win rate", "Realized PnL", "Trades 30d", "Avg hold", "Last active"].map((h) => (
                    <th key={h} className="eyebrow px-3 py-2 !text-[10px] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {wallets.data.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-panel-2/60">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink">{w.label}</div>
                      <div className="num text-[10px] text-muted">{shortAddress(w.address, 5)}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-edge">
                          <div
                            className="h-full rounded-full bg-signal/80"
                            style={{ width: `${w.winRate * 100}%` }}
                          />
                        </div>
                        <span className="num">{(w.winRate * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className={cn("num px-3 py-2.5", w.realizedPnlUsd >= 0 ? "text-profit" : "text-danger")}>
                      {w.realizedPnlUsd >= 0 ? "+" : "−"}
                      {formatUsdCompact(Math.abs(w.realizedPnlUsd))}
                    </td>
                    <td className="num px-3 py-2.5 text-muted">{w.trades30d}</td>
                    <td className="num px-3 py-2.5 text-muted">{w.avgHoldHours}h</td>
                    <td className="num px-3 py-2.5 text-muted">{timeAgo(w.lastActiveAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel
          title="Recent Entries / Exits"
          source="smartMoney"
          className="xl:col-span-5"
          bodyClassName="max-h-[560px] overflow-y-auto"
        >
          {activity.isPending || !activity.data ? (
            <PanelSkeleton rows={10} />
          ) : (
            <div className="divide-y divide-edge/60">
              {activity.data.map((e, i) => {
                const kind = KIND_STYLE[e.kind];
                return (
                  <Link
                    key={e.id}
                    href={`/token/${e.tokenId}`}
                    className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-panel-2/60"
                    style={i === 0 ? { animation: "row-in 220ms ease-out both" } : undefined}
                  >
                    <span className={cn("num w-12 shrink-0 rounded-[3px] border px-1 py-px text-center text-[9px] tracking-wider", kind.cls)}>
                      {kind.label}
                    </span>
                    <span className="num w-14 truncate text-xs font-medium text-ink">${e.symbol}</span>
                    <span className="truncate text-2xs text-muted">{e.walletLabel}</span>
                    <span className="num ml-auto text-xs text-ink">{formatUsdCompact(e.amountUsd)}</span>
                    <span className="num w-14 shrink-0 text-right text-[10px] text-muted">{timeAgo(e.at)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
