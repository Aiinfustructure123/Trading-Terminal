"use client";

import { Eyebrow, Panel, Skeleton } from "@/components/ui/primitives";
import { ConvictionRing, COMPONENT_COLORS } from "@/components/ui/conviction-ring";
import { RiskBadge, ChainTag, TokenAvatar, Sparkline, TickerNumber, CopyButton } from "@/components/ui/token-bits";
import { SourceBadge } from "@/components/ui/source-badge";
import { FearGreedDial } from "@/components/ui/fear-greed-dial";
import { computeConviction } from "@/lib/scoring/momentum";
import { fmtUsd, fmtPrice } from "@/lib/utils";
import { useEffect, useState } from "react";

const demoScore = computeConviction({
  volumeAccel: 2.1,
  buySellRatio: 1.6,
  priceChange24h: 0.34,
  liquidityUsd: 480_000,
  liqToMcap: 0.12,
  holders: 4200,
  holderGrowth: 0.22,
  volume24h: 1_900_000,
  riskInverse: 72,
  smartMoney: 64,
});

const colors: { name: string; varName: string; hex: string; use: string }[] = [
  { name: "bg", varName: "--color-bg", hex: "#07080C", use: "The void everything sits in" },
  { name: "panel", varName: "--color-panel", hex: "#0E1117", use: "Panel surfaces" },
  { name: "border", varName: "--color-border", hex: "#1C2230", use: "1px panel borders" },
  { name: "ink", varName: "--color-ink", hex: "#E8ECF4", use: "Primary text" },
  { name: "muted", varName: "--color-muted", hex: "#6B7488", use: "Secondary text, labels" },
  { name: "signal", varName: "--color-signal", hex: "#5CE1E6", use: "Live data, primary action, momentum" },
  { name: "danger", varName: "--color-danger", hex: "#FF4D5E", use: "Risk, drawdown, sell pressure" },
  { name: "warn", varName: "--color-warn", hex: "#FFB020", use: "Caution, Moderate risk" },
  { name: "profit", varName: "--color-profit", hex: "#3DDC97", use: "Gains, buy pressure" },
];

const typeScale = [
  { label: "Display / 3xl", cls: "text-3xl font-semibold", sample: "Alpha Terminal" },
  { label: "Heading / xl", cls: "text-xl font-medium", sample: "Token Case File" },
  { label: "Body / sm", cls: "text-sm", sample: "Every score expands into its exact inputs and weights." },
  { label: "Mono data / lg", cls: "text-lg font-mono tabular-nums", sample: "$1,284,920.55" },
  { label: "Mono small / xs", cls: "text-xs font-mono tabular-nums", sample: "0x7af3…9c21 · +12.84%" },
];

export default function StyleguidePage() {
  const [tick, setTick] = useState(1245.32);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + (Math.random() - 0.5) * 40), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <Eyebrow>Design System</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Styleguide</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The instrument&apos;s building blocks. Color is signal, never decoration. The 11px uppercase eyebrow labeling
          system is the structural grid of every panel.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Palette */}
        <Panel title="Palette">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {colors.map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                <div className="size-10 shrink-0 rounded-md border border-border-strong" style={{ background: c.hex }} />
                <div className="min-w-0">
                  <div className="font-mono text-xs text-ink">--{c.name}</div>
                  <div className="font-mono text-[10px] text-muted">{c.hex}</div>
                  <div className="truncate text-[10px] text-muted">{c.use}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Type scale */}
          <Panel title="Type Scale">
            <div className="flex flex-col gap-4">
              {typeScale.map((t) => (
                <div key={t.label} className="flex flex-col gap-1">
                  <Eyebrow>{t.label}</Eyebrow>
                  <div className={`${t.cls} text-ink`}>{t.sample}</div>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <Eyebrow>Eyebrow / 11px uppercase</Eyebrow>
                <div className="eyebrow">Market Pulse · Liquidity · Conviction</div>
              </div>
            </div>
          </Panel>

          {/* Badges */}
          <Panel title="Badges & Tags">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Eyebrow>Source honesty badges</Eyebrow>
                <div className="flex flex-wrap items-center gap-2">
                  <SourceBadge source="market" />
                  <SourceBadge source="onchain" />
                  <span className="font-mono text-[10px] text-muted">← reads the central sample/live config</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Eyebrow>Risk tiers</Eyebrow>
                <div className="flex flex-wrap gap-2">
                  <RiskBadge tier="Low" />
                  <RiskBadge tier="Moderate" />
                  <RiskBadge tier="High" />
                  <RiskBadge tier="Avoid" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Eyebrow>Chains & avatars</Eyebrow>
                <div className="flex flex-wrap items-center gap-2">
                  <ChainTag chain="solana" />
                  <ChainTag chain="ethereum" />
                  <ChainTag chain="base" />
                  <TokenAvatar symbol="QN" accent="#5CE1E6" />
                  <TokenAvatar symbol="PE" accent="#3DDC97" />
                  <TokenAvatar symbol="RW" accent="#FFB020" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Eyebrow>Copy / ticking number</Eyebrow>
                <div className="flex flex-wrap items-center gap-3">
                  <CopyButton text="0x7af39c21" label="0x7af3…9c21" />
                  <TickerNumber value={tick} format={(n) => fmtUsd(n)} className="text-lg text-ink" />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Conviction Ring */}
        <Panel title="The Conviction Ring — at every scale" source="market">
          <div className="flex flex-wrap items-end gap-8">
            {[16, 24, 40, 64, 88, 120].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <ConvictionRing score={demoScore} size={s} interactive={s >= 40} />
                <span className="font-mono text-[10px] text-muted">{s}px</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
            {demoScore.components.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COMPONENT_COLORS[c.key] }} />
                <span className="font-mono text-[11px] text-ink">{c.label}</span>
                <span className="font-mono text-[10px] text-muted">{c.subScore}·w{(c.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Hover a segment (≥40px) to isolate its component. Each segment&apos;s width is its weight; its fill is its sub-score.</p>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Fear greed + sparklines */}
          <Panel title="Gauges & Sparklines" source="market">
            <div className="flex items-center justify-around">
              <FearGreedDial value={72} label="Greed" />
              <div className="flex flex-col gap-3">
                <Sparkline data={[3, 4, 3.5, 5, 6, 5.5, 7, 8, 7.5, 9]} width={120} height={36} />
                <Sparkline data={[9, 8, 8.5, 6, 5, 5.5, 4, 3, 3.5, 2]} width={120} height={36} />
              </div>
            </div>
          </Panel>

          {/* Skeletons */}
          <Panel title="Skeleton Loaders">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Table styles */}
        <Panel title="Table Styles" source="market" dense>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Token", "Price", "24h", "Volume", "Liquidity", "Risk", "Conviction"].map((h) => (
                  <th key={h} className="px-3.5 py-2 eyebrow font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { s: "QNAI", n: "QuantumAI", p: 0.0421, c: 12.4, v: 1_900_000, l: 480_000, r: "Low" as const },
                { s: "PEPE", n: "Pepe Forge", p: 0.0000084, c: -7.2, v: 920_000, l: 210_000, r: "Moderate" as const },
                { s: "RWAX", n: "RwaProtocol", p: 1.24, c: 3.1, v: 4_200_000, l: 1_100_000, r: "High" as const },
              ].map((row, i) => (
                <tr key={row.s} className="border-b border-border/60 hover:bg-panel-2">
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <TokenAvatar symbol={row.s} accent={["#5CE1E6", "#3DDC97", "#FFB020"][i]} size={22} />
                      <div>
                        <div className="font-mono text-xs font-semibold text-ink">{row.s}</div>
                        <div className="text-[10px] text-muted">{row.n}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-xs tabular-nums">{fmtPrice(row.p)}</td>
                  <td className={`px-3.5 py-2.5 font-mono text-xs tabular-nums ${row.c >= 0 ? "text-profit" : "text-danger"}`}>{row.c >= 0 ? "+" : ""}{row.c}%</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs tabular-nums text-muted">{fmtUsd(row.v)}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs tabular-nums text-muted">{fmtUsd(row.l)}</td>
                  <td className="px-3.5 py-2.5"><RiskBadge tier={row.r} /></td>
                  <td className="px-3.5 py-2.5"><ConvictionRing score={demoScore} size={24} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
