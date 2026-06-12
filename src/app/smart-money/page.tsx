"use client";

import { Wallet, ArrowDownRight, ArrowUpRight, Lock } from "lucide-react";
import { useSmartMoney } from "@/lib/hooks/use-data";
import { Panel, Skeleton, Eyebrow } from "@/components/ui/primitives";
import { fmtUsd, fmtTimeAgo, shortAddr, cn } from "@/lib/utils";

export default function SmartMoneyPage() {
  const { data, isLoading } = useSmartMoney();

  return (
    <div className="flex flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center gap-2">
        <Wallet className="size-4 text-signal" />
        <Eyebrow>Smart Money</Eyebrow>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-warn/30 bg-warn/5 p-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-warn" />
        <div>
          <div className="font-display text-sm font-medium text-warn">Entire screen is SAMPLE — requires premium data</div>
          <p className="mt-0.5 text-[12px] text-muted">
            Labeled smart-money wallet data requires a contracted source. This screen never silently fakes live data: it goes live
            only when a real labeled-wallet provider is connected (Phase 4). Everything below is illustrative sample data.
          </p>
        </div>
      </div>

      <Panel title="Tracked Wallets" source="onchain" dense>
        {isLoading || !data ? (
          <div className="space-y-2 p-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Wallet", "Win Rate", "Realized PnL (30d)", "Trades", "Recent Activity"].map((h) => (
                    <th key={h} className="px-3.5 py-2 eyebrow font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((w) => (
                  <tr key={w.address} className="border-b border-border/60 align-top hover:bg-panel-2">
                    <td className="px-3.5 py-3">
                      <div className="font-display text-sm text-ink">{w.label}</div>
                      <div className="font-mono text-[10px] text-muted">{shortAddr(w.address, 6, 6)}</div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={cn("font-mono text-sm tabular-nums", w.winRate >= 65 ? "text-profit" : w.winRate >= 50 ? "text-warn" : "text-danger")}>{w.winRate}%</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={cn("font-mono text-sm tabular-nums", w.realizedPnlUsd >= 0 ? "text-profit" : "text-danger")}>
                        {w.realizedPnlUsd >= 0 ? "+" : "−"}{fmtUsd(Math.abs(w.realizedPnlUsd))}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-sm tabular-nums text-muted">{w.trades30d}</td>
                    <td className="px-3.5 py-3">
                      <div className="flex flex-col gap-1">
                        {w.recentActions.slice(0, 3).map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5 font-mono text-[11px]">
                            {a.action === "BUY" ? <ArrowDownRight className="size-3 text-profit" /> : <ArrowUpRight className="size-3 text-danger" />}
                            <span className={a.action === "BUY" ? "text-profit" : "text-danger"}>{a.action}</span>
                            <span className="text-ink">{a.symbol}</span>
                            <span className="text-muted">{fmtUsd(a.amountUsd)}</span>
                            <span className="text-muted/60">{fmtTimeAgo(a.time)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
