"use client";

import * as React from "react";
import type { ConvictionScore } from "@/lib/datasources/types";
import { ConvictionRing } from "@/components/terminal/conviction-ring";
import { ScoreBreakdownDialog, ScoreBreakdownTable } from "@/components/terminal/score-breakdown";
import { SourceBadge, RiskBadge, ChainBadge } from "@/components/terminal/badges";
import { TickerNumber } from "@/components/terminal/ticker-number";
import { Delta } from "@/components/terminal/delta";
import { Sparkline } from "@/components/terminal/sparkline";
import { Skeleton } from "@/components/terminal/skeleton";
import { AddressChip } from "@/components/terminal/address-chip";
import { Panel } from "@/components/terminal/panel";
import { Button } from "@/components/ui/button";
import { formatPrice, formatUsdCompact } from "@/lib/format";

const PALETTE = [
  { token: "--bg", value: "#07080C", role: "The void. Everything sits in it." },
  { token: "--panel", value: "#0E1117", role: "Panel surfaces, 1px #1C2230 borders." },
  { token: "--ink", value: "#E8ECF4", role: "Primary text." },
  { token: "--muted", value: "#6B7488", role: "Secondary text, eyebrow labels." },
  { token: "--signal", value: "#5CE1E6", role: "Live data, primary actions, positive momentum." },
  { token: "--danger", value: "#FF4D5E", role: "Risk, drawdown, sell pressure. Nothing else." },
  { token: "--warn", value: "#FFB020", role: "Caution states, Moderate risk." },
  { token: "--profit", value: "#3DDC97", role: "Gains, buy pressure." },
];

const TYPE_SCALE = [
  { cls: "eyebrow", label: "Eyebrow · 11px caps letterspaced", sample: "Score Breakdown" },
  { cls: "text-xs", label: "Data cell · 12px", sample: "Liquidity pool depth at execution" },
  { cls: "text-sm", label: "Panel body · 13px", sample: "Volume is running 2.4× its weekly base." },
  { cls: "text-base", label: "Prose · 15px", sample: "Every score expands into its exact inputs." },
  { cls: "text-lg font-medium", label: "Panel headline · 18px", sample: "Neural Protocol" },
  { cls: "text-xl font-semibold", label: "Screen title · 24px", sample: "Token Screener" },
  { cls: "text-2xl font-semibold num", label: "Hero number · 32px", sample: "$3.41B" },
  { cls: "text-3xl font-semibold num", label: "Detail price · 44px", sample: "$0.0₅4821" },
];

function demoScore(composite: number): ConvictionScore {
  const subs: Record<string, number> = {
    momentum: Math.min(100, composite * 1.15),
    liquidity: Math.min(100, composite * 0.9 + 8),
    holders: Math.max(0, composite * 0.85),
    volume: Math.min(100, composite * 1.05),
    riskInverse: Math.max(0, composite * 0.95 + 4),
  };
  return {
    composite,
    computedAt: new Date().toISOString(),
    components: [
      { key: "momentum", label: "Momentum", weight: 0.3, subScore: subs.momentum, input: "1h +4.2% · 24h +18.9% · vol 2.4× 7d avg · 58% buys", explanation: "Price structure and order flow are both pushing upward." },
      { key: "liquidity", label: "Liquidity", weight: 0.2, subScore: subs.liquidity, input: "$412,000 pooled · 8.2% of mcap", explanation: "Deep pool relative to market cap." },
      { key: "holders", label: "Holders", weight: 0.15, subScore: subs.holders, input: "4,812 holders · +3.1% 24h", explanation: "A broad and growing holder base." },
      { key: "volume", label: "Volume", weight: 0.15, subScore: subs.volume, input: "$1.9M 24h · 38% turnover", explanation: "Heavy turnover relative to size." },
      { key: "riskInverse", label: "Risk (inverse)", weight: 0.2, subScore: subs.riskInverse, input: "Forensic tier: Low", explanation: "Forensics are clean: locked LP, revoked authorities." },
    ],
  };
}

const SPARK = [42, 44, 41, 47, 52, 50, 56, 61, 58, 63, 69, 66, 72, 75];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-panel-in">
      <h2 className="eyebrow mb-3 border-b border-edge pb-2">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const [tick, setTick] = React.useState(184_230.42);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const score = demoScore(72);

  React.useEffect(() => {
    const id = setInterval(
      () => setTick((v) => v * (1 + (Math.random() - 0.48) * 0.004)),
      1500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <header>
        <p className="eyebrow">Design System</p>
        <h1 className="mt-1 text-xl font-semibold">ALPHA TERMINAL · Styleguide</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          A signals-intelligence instrument: Bloomberg density, Apple restraint,
          mission-control readouts. Color is signal, never decoration. Every
          number is JetBrains Mono with tabular figures.
        </p>
      </header>

      <Section title="Palette — use exactly">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {PALETTE.map((c) => (
            <div key={c.token} className="panel overflow-hidden">
              <div
                className="h-14 border-b border-edge"
                style={{ background: c.value }}
              />
              <div className="p-2.5">
                <div className="num text-xs text-ink">{c.token}</div>
                <div className="num text-2xs text-muted">{c.value}</div>
                <p className="mt-1 text-2xs leading-4 text-muted">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale — Space Grotesk display · JetBrains Mono data">
        <div className="panel divide-y divide-edge">
          {TYPE_SCALE.map((t) => (
            <div key={t.label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="eyebrow w-56 shrink-0">{t.label}</span>
              <span className={t.cls}>{t.sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Conviction Ring — the signature element, every scale">
        <div className="panel p-5">
          <div className="flex flex-wrap items-end gap-8">
            {[16, 24, 36, 48, 72, 120].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <ConvictionRing
                  score={size < 28 ? score.composite : score}
                  size={size}
                  interactive={size >= 48}
                  onSegmentClick={() => setBreakdownOpen(true)}
                />
                <span className="num text-2xs text-muted">{size}px</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <ConvictionRing score={demoScore(31)} size={72} />
              <span className="num text-2xs text-muted">low score</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ConvictionRing score={demoScore(52)} size={72} />
              <span className="num text-2xs text-muted">mid score</span>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-2xs leading-4 text-muted">
            One segment per score component; arc length ∝ weight, fill ∝
            sub-score. Hover a segment (≥48px) for the component readout; click
            to open the full breakdown. Below 28px the ring simplifies to a
            composite arc.
          </p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setBreakdownOpen(true)}>
            Open score breakdown
          </Button>
        </div>
      </Section>

      <Section title="Badges & chips">
        <div className="panel flex flex-wrap items-center gap-3 p-4">
          <SourceBadge source="market" />
          <span
            className="num inline-flex items-center gap-1 rounded-[3px] border border-signal/40 bg-signal/10 px-1.5 py-px text-[10px] font-medium tracking-[0.12em] text-signal"
            title="Preview of the live badge (Phase 1+)"
          >
            <span className="pulse-dot inline-block h-1 w-1 rounded-full bg-signal" />
            LIVE
          </span>
          <span className="w-px self-stretch bg-edge" />
          <RiskBadge tier="Low" />
          <RiskBadge tier="Moderate" />
          <RiskBadge tier="High" />
          <RiskBadge tier="Avoid" />
          <span className="w-px self-stretch bg-edge" />
          <ChainBadge chain="solana" />
          <ChainBadge chain="base" />
          <ChainBadge chain="ethereum" />
          <span className="w-px self-stretch bg-edge" />
          <AddressChip address="7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs" />
        </div>
      </Section>

      <Section title="Live numerals — tick flash, deltas, sparklines">
        <div className="panel flex flex-wrap items-center gap-8 p-4">
          <div>
            <div className="eyebrow mb-1">Ticking value</div>
            <TickerNumber value={tick} format={(v) => formatUsdCompact(v)} className="text-lg" />
          </div>
          <div>
            <div className="eyebrow mb-1">Price</div>
            <span className="num text-lg">{formatPrice(0.000004821)}</span>
          </div>
          <div>
            <div className="eyebrow mb-1">Deltas</div>
            <div className="flex gap-3 text-sm">
              <Delta value={12.4} />
              <Delta value={-8.61} />
              <Delta value={0} />
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Sparkline</div>
            <Sparkline values={SPARK} />
          </div>
          <div>
            <div className="eyebrow mb-1">Skeleton</div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </Section>

      <Section title="Table style — dense, no glass, tabular numerals">
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="border-b border-edge text-left">
                {["Token", "Price", "24h", "Volume", "Liquidity", "Conv", "Risk"].map((h) => (
                  <th key={h} className="eyebrow px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60">
              {[
                { s: "NEUR", n: "Neural Protocol", p: 0.0421, d: 18.9, v: 1_920_000, l: 412_000, c: 72, r: "Low" as const },
                { s: "WAGC", n: "Waggle Cat", p: 0.000004821, d: -6.2, v: 230_000, l: 38_000, c: 44, r: "Moderate" as const },
                { s: "GRIDX", n: "Grid Works", p: 1.27, d: 3.4, v: 5_400_000, l: 1_900_000, c: 81, r: "Low" as const },
                { s: "MOOND", n: "Moon DAO", p: 0.00009, d: -41.7, v: 89_000, l: 9_400, c: 22, r: "Avoid" as const },
              ].map((row) => (
                <tr key={row.s} className="transition-colors hover:bg-panel-2/60">
                  <td className="px-3 py-2">
                    <span className="num font-medium text-ink">${row.s}</span>
                    <span className="ml-2 hidden text-muted sm:inline">{row.n}</span>
                  </td>
                  <td className="num px-3 py-2">{formatPrice(row.p)}</td>
                  <td className="px-3 py-2"><Delta value={row.d} /></td>
                  <td className="num px-3 py-2 text-muted">{formatUsdCompact(row.v)}</td>
                  <td className="num px-3 py-2 text-muted">{formatUsdCompact(row.l)}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <ConvictionRing score={row.c} size={16} />
                      <span className="num">{row.c}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2"><RiskBadge tier={row.r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Panel chrome & score breakdown">
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Score Breakdown" source="market" bodyClassName="overflow-hidden">
            <ScoreBreakdownTable score={score} />
          </Panel>
          <div className="space-y-3">
            <Panel title="Buttons" bodyClassName="flex flex-wrap items-center gap-2 p-3">
              <Button variant="primary">Primary action</Button>
              <Button>Default</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Destructive</Button>
            </Panel>
            <Panel title="Motion rules" bodyClassName="p-3 text-2xs leading-5 text-muted">
              Numbers flash cyan/green/red for 650ms on tick. Panels fade-slide
              in over 150ms on mount. New feed rows slide from the top. Ring
              segments animate on score change. No ambient particles, no
              gradient meshes. <span className="text-ink">prefers-reduced-motion</span> is
              respected globally.
            </Panel>
          </div>
        </div>
      </Section>

      <ScoreBreakdownDialog
        score={score}
        symbol="NEUR"
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </div>
  );
}
