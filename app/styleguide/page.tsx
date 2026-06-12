"use client";

import { useMemo } from "react";
import { Panel } from "@/components/ui/panel";
import { RiskBadge, SourceBadge, ChainBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvictionRing } from "@/components/conviction/ring";
import { ScoreBreakdown } from "@/components/conviction/breakdown";
import { buildConviction, rng } from "@/lib/datasources/sample/generator";
import { formatUsd, formatPct, deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";

const PALETTE = [
  { name: "--bg", value: "#07080C", note: "near-black blue — the void everything sits in" },
  { name: "--panel", value: "#0E1117", note: "panel surfaces, 1px borders #1C2230" },
  { name: "--ink", value: "#E8ECF4", note: "primary text" },
  { name: "--muted", value: "#6B7488", note: "secondary text, labels" },
  { name: "--signal", value: "#5CE1E6", note: "live data, primary actions, positive momentum" },
  { name: "--danger", value: "#FF4D5E", note: "risk, drawdown, sell pressure — nothing else" },
  { name: "--warn", value: "#FFB020", note: "caution states, Moderate risk" },
  { name: "--profit", value: "#3DDC97", note: "gains, buy pressure" },
];

const TYPE_SCALE = [
  { label: "Display / 28", className: "text-[28px] font-semibold", sample: "Conviction 87" },
  { label: "Heading / 20", className: "text-xl font-semibold", sample: "Token Screener" },
  { label: "Body / 14", className: "text-sm", sample: "Every score is explainable. No black boxes." },
  { label: "Small / 12", className: "text-xs", sample: "Liquidity depth implies a $4.2K trade moves price ≈1%." },
  { label: "Eyebrow / 11", className: "eyebrow", sample: "Score breakdown" },
];

const SAMPLE_ROWS = [
  { symbol: "NEUMI", name: "Neural Mind", price: 0.0427, chg: 12.4, vol: 1_240_000, tier: "Low" as const },
  { symbol: "GIGAFR", name: "Giga Frog", price: 0.0000087, chg: -8.2, vol: 845_000, tier: "Moderate" as const },
  { symbol: "SOLNODE", name: "Solar Node", price: 1.27, chg: 3.1, vol: 412_000, tier: "High" as const },
  { symbol: "APXQ", name: "Apex Quest", price: 0.0031, chg: -31.7, vol: 96_000, tier: "Avoid" as const },
];

export default function StyleguidePage() {
  const demoScore = useMemo(
    () =>
      buildConviction(rng("styleguide-demo"), {
        change24h: 18.4,
        volume24h: 1_400_000,
        marketCap: 3_200_000,
        liquidityUsd: 460_000,
        holderCount: 4_812,
        riskTier: "Moderate",
      }),
    []
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Design system</span>
        <h1 className="text-2xl font-semibold tracking-tight">Styleguide</h1>
        <p className="max-w-xl text-sm text-muted">
          The terminal&apos;s visual contract: palette, type scale, the Conviction Ring at every
          size, badges, and table styles. Everything on every screen is composed from these parts.
        </p>
      </header>

      {/* Palette */}
      <Panel title="Palette" bodyClassName="grid grid-cols-1 gap-px bg-panel-border sm:grid-cols-2">
        {PALETTE.map((c) => (
          <div key={c.name} className="flex items-center gap-3 bg-panel p-3">
            <span
              className="size-10 shrink-0 rounded border border-panel-border"
              style={{ background: c.value }}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <code className="font-mono text-xs text-ink">{c.name}</code>
                <code className="font-mono text-[11px] text-muted">{c.value}</code>
              </div>
              <p className="truncate text-xs text-muted">{c.note}</p>
            </div>
          </div>
        ))}
      </Panel>

      {/* Type scale */}
      <Panel title="Type scale" bodyClassName="divide-y divide-panel-border">
        {TYPE_SCALE.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
            <span className="w-32 shrink-0 font-mono text-[11px] text-muted">{t.label}</span>
            <span className={t.className}>{t.sample}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
          <span className="w-32 shrink-0 font-mono text-[11px] text-muted">Mono / tabular</span>
          <span className="font-mono text-sm" data-numeric>
            $1,420,098.42 · +12.4% · 7xKX…gAsU · 14:32:08 UTC
          </span>
        </div>
      </Panel>

      {/* Conviction Ring */}
      <Panel title="Conviction Ring — signature element" bodyClassName="flex flex-col gap-6 p-4">
        <div className="flex flex-wrap items-end gap-8">
          {[16, 24, 32, 48, 64, 96, 120].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <ConvictionRing score={demoScore} size={size} onOpenBreakdown={() => {}} />
              <span className="font-mono text-[10px] text-muted">{size}px</span>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted">
          Each segment is one score component — arc length is its weight, fill intensity its
          sub-score. At ≥40px the ring is interactive: hover highlights a component, click opens
          the full breakdown. The same component renders at 16px in table rows and 120px on token
          detail.
        </p>
        <div className="border-t border-panel-border pt-4">
          <span className="eyebrow mb-3 block">Full breakdown (hover syncs with ring)</span>
          <ScoreBreakdown score={demoScore} />
        </div>
      </Panel>

      {/* Badges */}
      <Panel title="Badges" bodyClassName="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Data provenance — every panel carries one</span>
          <div className="flex flex-wrap items-center gap-3">
            <SourceBadge source="market" />
            <span className="inline-flex items-center gap-1 rounded-sm border border-signal/40 bg-signal/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-signal">
              <span className="size-1 animate-pulse-dot rounded-full bg-signal" />
              Live
            </span>
            <span className="text-xs text-muted">← what the badge becomes when a source goes live (Phase 1)</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Risk tiers</span>
          <div className="flex flex-wrap gap-3">
            <RiskBadge tier="Low" />
            <RiskBadge tier="Moderate" />
            <RiskBadge tier="High" />
            <RiskBadge tier="Avoid" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Chains</span>
          <div className="flex flex-wrap gap-3">
            <ChainBadge chain="solana" />
            <ChainBadge chain="base" />
            <ChainBadge chain="ethereum" />
          </div>
        </div>
      </Panel>

      {/* Table styles */}
      <Panel title="Table style" source="market" bodyClassName="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-panel-border text-left">
              <th className="eyebrow px-3 py-2 font-medium">Token</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Price</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">24h</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Volume</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Score</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border/60">
            {SAMPLE_ROWS.map((row) => (
              <tr key={row.symbol} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-3 py-2">
                  <span className="font-medium">{row.symbol}</span>
                  <span className="ml-2 text-xs text-muted">{row.name}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono" data-numeric>
                  {formatUsd(row.price)}
                </td>
                <td className={cn("px-3 py-2 text-right font-mono", deltaColor(row.chg))} data-numeric>
                  {formatPct(row.chg)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-muted" data-numeric>
                  {formatUsd(row.vol, { compact: true })}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    <ConvictionRing score={demoScore} size={16} />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <RiskBadge tier={row.tier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-panel-border px-3 py-2 text-xs text-muted">
          No glass on tables — density and readability win. Numbers are JetBrains Mono with
          tabular figures, deltas colored by sign only.
        </p>
      </Panel>

      {/* States */}
      <Panel title="Loading & motion" bodyClassName="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Skeletons — zero layout shift</span>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-7 w-2/3" />
          </div>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-muted">
          Motion is restrained and purposeful: numbers flash cyan on uptick / red on downtick for
          600ms, panels fade-slide in over 150ms on mount, new feed rows slide in from the top.
          All animation collapses under <code className="font-mono">prefers-reduced-motion</code>.
        </p>
      </Panel>
    </div>
  );
}
