"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { smartMoneySource } from "@/lib/datasources";
import { DataModeBadge } from "@/components/ui/DataBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtUsd, fmtRelTime, cn } from "@/lib/utils";
import { Wallet2, TrendingUp, TrendingDown, Lock } from "lucide-react";

export default function SmartMoneyPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["smart-money"],
    queryFn:  () => smartMoneySource.getSmartWallets(),
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Wallet2 size={18} className="text-signal" />
        <h1 className="text-xl font-semibold text-ink">Smart Money</h1>
        <DataModeBadge mode="sample" />
      </div>
      <p className="text-sm text-muted mb-4">
        Tracked wallet performance from sample data.
      </p>

      {/* Premium notice */}
      <div className="flex items-start gap-3 p-4 mb-6 border border-warn/30 bg-warn/5 rounded-md">
        <Lock size={14} className="text-warn flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-warn mb-1">SAMPLE — Requires Premium Data</div>
          <p className="text-xs text-muted">
            Live smart-money wallet tracking requires a contracted labeled-wallet data source.
            This screen shows sample data only until that integration is live. All wallet labels,
            win rates, and trade history below are synthetic.
          </p>
        </div>
      </div>

      {/* Wallet table */}
      <div className="panel-surface overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-4 py-2.5 bg-bg/40 border-b border-border">
          {[
            { label: "WALLET",    w: "flex-1" },
            { label: "WIN RATE",  w: "w-24 text-right" },
            { label: "REALIZED P&L", w: "w-28 text-right" },
            { label: "TRADES 30D",   w: "w-24 text-right" },
          ].map(c => (
            <div key={c.label} className={`label-eyebrow ${c.w}`}>{c.label}</div>
          ))}
        </div>

        {isLoading
          ? <Skeleton className="h-64 m-4" />
          : data?.wallets.map(wallet => (
              <div key={wallet.address} className="border-b border-border/40 last:border-b-0">
                {/* Row */}
                <div className="flex items-center px-4 py-3 hover:bg-signal/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink">{wallet.label}</div>
                    <div className="text-xs font-mono text-muted truncate">{wallet.address.slice(0, 12)}…</div>
                  </div>
                  <div className="w-24 text-right">
                    <span className={cn(
                      "num text-sm font-semibold",
                      wallet.winRate >= 0.6 ? "text-profit" : wallet.winRate >= 0.45 ? "text-warn" : "text-danger"
                    )}>
                      {(wallet.winRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-28 text-right">
                    <span className={cn("num text-sm font-semibold", wallet.realizedPnl >= 0 ? "text-profit" : "text-danger")}>
                      {wallet.realizedPnl >= 0 ? "+" : ""}{fmtUsd(wallet.realizedPnl)}
                    </span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="num text-sm text-muted">{wallet.trades30d}</span>
                  </div>
                </div>

                {/* Recent trades */}
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {wallet.recentTrades.slice(0, 4).map((trade, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/token/${trade.address}`)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono transition-colors hover:border-signal/40",
                        trade.type === "buy"
                          ? "border-profit/30 bg-profit/5 text-profit"
                          : "border-danger/30 bg-danger/5 text-danger"
                      )}
                    >
                      {trade.type === "buy"
                        ? <TrendingUp size={10} />
                        : <TrendingDown size={10} />
                      }
                      {trade.symbol}
                      <span className="text-muted">{fmtUsd(trade.usdValue)}</span>
                      <span className="text-muted">{fmtRelTime(trade.at)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
