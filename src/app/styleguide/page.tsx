"use client";

import Link from "next/link";
import { useState } from "react";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { PanelShell } from "@/components/ui/panel-shell";
import { SourceBadge } from "@/components/ui/source-badge";
import { ScoreComponent } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

const ringComponents: ScoreComponent[] = [
  {
    id: "momentum",
    label: "Momentum",
    value: 82.4,
    weight: 0.3,
    reasoning: "Volume acceleration outpaces 7d baseline.",
  },
  {
    id: "liquidity",
    label: "Liquidity",
    value: 76.2,
    weight: 0.22,
    reasoning: "Pool depth stayed stable during expansion.",
  },
  {
    id: "holders",
    label: "Holders",
    value: 69.8,
    weight: 0.18,
    reasoning: "Holder count growth is positive with moderate concentration.",
  },
  {
    id: "structure",
    label: "Structure",
    value: 71.9,
    weight: 0.15,
    reasoning: "Higher-lows hold across 1h and 4h windows.",
  },
  {
    id: "risk-inverse",
    label: "Risk (Inverse)",
    value: 64.6,
    weight: 0.15,
    reasoning: "No critical authority flags in this sample profile.",
  },
];

const palette = [
  { token: "--bg", value: "#07080C", usage: "Global background field" },
  { token: "--panel", value: "#0E1117", usage: "Panel surfaces" },
  { token: "--ink", value: "#E8ECF4", usage: "Primary text" },
  { token: "--muted", value: "#6B7488", usage: "Secondary text and labels" },
  { token: "--signal", value: "#5CE1E6", usage: "Primary signal and live states" },
  { token: "--danger", value: "#FF4D5E", usage: "High risk and drawdowns" },
  { token: "--warn", value: "#FFB020", usage: "Caution and Moderate risk" },
  { token: "--profit", value: "#3DDC97", usage: "Positive pressure and gains" },
];

export default function StyleguidePage() {
  const [selected, setSelected] = useState<ScoreComponent>(ringComponents[0]);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 px-4 py-6 md:px-6">
      <header className="panel-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="eyebrow">ALPHA TERMINAL / PHASE 0</p>
          <h1 className="text-lg font-semibold">Interface Styleguide</h1>
        </div>
        <nav className="flex items-center gap-2 text-xs">
          <Link
            className="rounded-md border border-border px-3 py-2 text-muted transition hover:border-signal/60 hover:text-signal"
            href="/"
          >
            Home
          </Link>
          <Link
            className="rounded-md border border-signal/50 bg-signal/10 px-3 py-2 text-signal transition hover:bg-signal/15"
            href="/dashboard"
          >
            Open Dashboard
          </Link>
        </nav>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <PanelShell eyebrow="Design Tokens" title="Signal Palette" badge={<SourceBadge source="market" />}>
          <div className="grid gap-2">
            {palette.map((color) => (
              <div
                key={color.token}
                className="grid grid-cols-[90px_120px_1fr] items-center gap-3 rounded-lg border border-border/80 bg-bg/80 px-3 py-2"
              >
                <span className="data-mono text-xs text-muted">{color.token}</span>
                <span
                  className="data-mono inline-flex items-center gap-2 text-xs text-ink"
                  style={{ color: color.value }}
                >
                  <span className="inline-flex h-4 w-4 rounded border border-border" style={{ background: color.value }} />
                  {color.value}
                </span>
                <span className="text-xs text-muted">{color.usage}</span>
              </div>
            ))}
          </div>
        </PanelShell>

        <PanelShell eyebrow="Typography" title="Type System">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="eyebrow">Display / Space Grotesk</p>
              <p className="text-3xl font-semibold tracking-tight text-ink">Opportunity Signal Matrix</p>
              <p className="text-sm text-muted">Dense, technical, minimal ornamentation.</p>
            </div>
            <div className="space-y-1">
              <p className="eyebrow">Data / JetBrains Mono</p>
              <p className="data-mono text-2xl text-signal">$0.042981 · +12.48% · 2026-06-12 02:28:31 UTC</p>
              <p className="data-mono text-xs text-muted">Tabular numerals are mandatory for all metrics.</p>
            </div>
            <div className="space-y-1">
              <p className="eyebrow">Eyebrow Label</p>
              <p className="eyebrow">market pulse</p>
            </div>
          </div>
        </PanelShell>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <PanelShell eyebrow="Signature Component" title="Conviction Ring">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-wrap items-center gap-5">
              <ConvictionRing size={16} score={73} components={ringComponents} />
              <ConvictionRing size={28} score={73} components={ringComponents} />
              <ConvictionRing size={48} score={73} components={ringComponents} />
              <ConvictionRing
                size={120}
                score={73}
                components={ringComponents}
                showCenterValue
                interactive
                onSegmentSelect={setSelected}
              />
            </div>
            <div className="space-y-3">
              <p className="eyebrow">Selected Segment</p>
              <div className="rounded-lg border border-border bg-bg/80 p-3">
                <p className="text-sm font-semibold text-ink">{selected.label}</p>
                <p className="data-mono mt-1 text-xs text-signal">
                  value {selected.value.toFixed(1)} · weight {(selected.weight * 100).toFixed(0)}%
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{selected.reasoning}</p>
              </div>
              <p className="text-xs text-muted">
                Hovering highlights a segment; clicking exposes the exact component input behind the score.
              </p>
            </div>
          </div>
        </PanelShell>

        <PanelShell eyebrow="State Language" title="Badges + Risk States">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <SourceBadge source="market" />
              <span className="inline-flex rounded-md border border-signal/50 bg-signal/10 px-2 py-1 text-[10px] font-semibold tracking-[0.11em] text-signal">
                LIVE
              </span>
              <span className="inline-flex rounded-md border border-danger/50 bg-danger/10 px-2 py-1 text-[10px] font-semibold tracking-[0.11em] text-danger">
                SOURCE DEGRADED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { label: "LOW", cls: "border-profit/50 bg-profit/10 text-profit" },
                { label: "MODERATE", cls: "border-warn/50 bg-warn/10 text-warn" },
                { label: "HIGH", cls: "border-danger/45 bg-danger/10 text-danger" },
                { label: "AVOID", cls: "border-danger/70 bg-danger/20 text-danger" },
              ].map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md border px-2 py-2 font-semibold tracking-[0.11em]",
                    item.cls,
                  )}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </PanelShell>
      </section>

      <PanelShell eyebrow="Density Pattern" title="Terminal Table Treatment" subtitle="Monospaced numbers, restrained color-as-signal">
        <div className="overflow-x-auto rounded-lg border border-border bg-bg/80">
          <table className="min-w-full border-collapse text-sm">
            <thead className="border-b border-border bg-panel/80">
              <tr className="text-left">
                {["Token", "Price", "1h", "24h", "Volume", "Liquidity", "Risk"].map((header) => (
                  <th key={header} className="px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["NEON", "$0.0291", "+5.8%", "+28.4%", "$2.49M", "$1.14M", "MODERATE"],
                ["AURA", "$0.0042", "+2.1%", "+16.5%", "$1.12M", "$550K", "LOW"],
                ["DUST", "$0.00043", "-6.4%", "-19.2%", "$810K", "$180K", "HIGH"],
              ].map((row, index) => (
                <tr key={row[0]} className={cn(index !== 2 && "border-b border-border/70")}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cell}
                      className={cn(
                        "px-3 py-2 align-middle",
                        cellIndex > 0 && "data-mono",
                        cell.includes("+")
                          ? "text-profit"
                          : cell.includes("-")
                            ? "text-danger"
                            : cellIndex === row.length - 1
                              ? "text-warn"
                              : "text-ink",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelShell>
    </main>
  );
}
