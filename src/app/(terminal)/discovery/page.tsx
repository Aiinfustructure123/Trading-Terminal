"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenSource } from "@/lib/datasources";
import { ConvictionRing } from "@/components/ui/ConvictionRing";
import { RiskBadge, ChainBadge, DataModeBadge } from "@/components/ui/DataBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtUsd, fmtPct, fmtPrice, fmtAge, cn } from "@/lib/utils";
import type { Token, ScoreComponent } from "@/lib/datasources/types";
import { Compass, TrendingUp } from "lucide-react";

const PRESETS = [
  {
    id: "early-discovery",
    label: "Early Discovery",
    description: "Age <7d · Mcap <$5M · Risk ≤ Moderate",
    params: { ageMaxDays: 7, mcapMax: 5_000_000, riskTiers: ["Low", "Moderate"] as const, sortBy: "score" as const, sortDir: "desc" as const, limit: 9 },
    icon: "🔍",
  },
  {
    id: "high-momentum",
    label: "High Momentum",
    description: "Top 24h gainers with score ≥ 60",
    params: { sortBy: "priceChange24h" as const, sortDir: "desc" as const, limit: 9, riskTiers: ["Low", "Moderate"] as const },
    icon: "⚡",
  },
  {
    id: "micro-cap",
    label: "Micro-Cap Alpha",
    description: "Mcap <$500K · Volume >$10K",
    params: { mcapMax: 500_000, volumeMin: 10_000, sortBy: "score" as const, sortDir: "desc" as const, limit: 9 },
    icon: "💎",
  },
];

function TokenCard({ token, onNavigate }: { token: Token; onNavigate: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="panel-surface p-4 hover:border-signal/40 transition-all text-left group animate-fade-slide-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ConvictionRing score={token.score} size={52} showLabel />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink group-hover:text-signal transition-colors">
                {token.symbol}
              </span>
              <ChainBadge chain={token.chain} />
            </div>
            <div className="text-xs text-muted">{token.name}</div>
          </div>
        </div>
        <RiskBadge tier={token.score.riskTier} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "PRICE",  value: fmtPrice(token.price) },
          { label: "MCAP",   value: fmtUsd(token.marketCap) },
          { label: "24H VOL",value: fmtUsd(token.volume24h) },
        ].map(m => (
          <div key={m.label}>
            <div className="label-eyebrow">{m.label}</div>
            <div className="num text-xs text-ink font-medium">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Change + Age */}
      <div className="flex items-center justify-between">
        <span className={cn("num text-sm font-semibold", token.priceChange24h >= 0 ? "text-profit" : "text-danger")}>
          {fmtPct(token.priceChange24h)} 24h
        </span>
        <span className="text-xs text-muted">Age: {fmtAge(token.age)}</span>
      </div>

      {/* Score components why-bar */}
      <div className="mt-3 space-y-1">
        <div className="label-eyebrow mb-1">WHY THIS RANKS</div>
        {token.score.components.slice(0, 3).map((c: ScoreComponent) => (
          <div key={c.key} className="flex items-center gap-2">
            <span className="text-2xs text-muted w-16 truncate">{c.label}</span>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${c.subScore}%`,
                  background: c.subScore >= 70 ? "#3DDC97" : c.subScore >= 45 ? "#FFB020" : "#FF4D5E",
                }}
              />
            </div>
            <span className="num text-2xs text-muted w-6 text-right">{c.subScore.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function PresetSection({ preset }: { preset: typeof PRESETS[number] }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["discovery", preset.id],
    queryFn:  () => tokenSource.getTokens(preset.params as import("@/lib/datasources/types").ScreenerParams),
    staleTime: 60_000,
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{preset.icon}</span>
            <h2 className="text-lg font-semibold text-ink">{preset.label}</h2>
          </div>
          <p className="text-xs text-muted mt-0.5">{preset.description}</p>
        </div>
        <button
          onClick={() => router.push(`/screener`)}
          className="btn-terminal text-xs"
        >
          View All <TrendingUp size={11} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-48 w-full" />)
          : data?.tokens.map(token => (
              <TokenCard
                key={token.address}
                token={token}
                onNavigate={() => router.push(`/token/${token.address}`)}
              />
            ))
        }
      </div>
    </section>
  );
}

export default function DiscoveryPage() {

  return (
    <div className="p-4">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Compass size={18} className="text-signal" />
            <h1 className="text-xl font-semibold text-ink">Discovery</h1>
            <DataModeBadge mode="sample" />
          </div>
          <p className="text-sm text-muted">Ranked opportunities from preset screens. Each card shows the signals driving the rank.</p>
        </div>
      </div>

      {PRESETS.map(preset => (
        <PresetSection key={preset.id} preset={preset} />
      ))}
    </div>
  );
}
