"use client";

import React from "react";
import { ConvictionRing, ConvictionRingInline } from "@/components/ui/ConvictionRing";
import { DataModeBadge, RiskBadge, ScorePill, ChainBadge, SeverityBadge } from "@/components/ui/DataBadge";
import { SkeletonPanel, SkeletonTable } from "@/components/ui/Skeleton";
import type { ConvictionScore } from "@/lib/datasources/types";

// ── Sample scores for the styleguide ─────────────────────────────────────────

const makeScore = (composite: number, tier: string): ConvictionScore => ({
  composite,
  riskTier: tier as import("@/lib/datasources/types").RiskTier,
  riskFlags: [],
  computedAt: new Date().toISOString(),
  components: [
    { key: "momentum",  label: "Momentum",  value: 1.4,   subScore: composite * 1.1 > 100 ? 98 : composite * 1.1, weight: 0.30, description: "Volume acceleration vs 7-day average." },
    { key: "liquidity", label: "Liquidity", value: 400e3, subScore: composite * 0.9, weight: 0.25, description: "Pool depth relative to market cap." },
    { key: "holders",   label: "Holders",   value: 3200,  subScore: composite * 0.8, weight: 0.20, description: "Holder count and distribution quality." },
    { key: "risk_inv",  label: "Safety",    value: 85,    subScore: composite * 0.95, weight: 0.15, description: "Inverse of risk flag severity." },
    { key: "narrative", label: "Narrative", value: 72,    subScore: composite * 0.7, weight: 0.10, description: "Category capital flow alignment." },
  ],
});

const HIGH_SCORE  = makeScore(84, "Low");
const MED_SCORE   = makeScore(55, "Moderate");
const LOW_SCORE   = makeScore(28, "High");
const AVOID_SCORE = makeScore(9, "Avoid");

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-ink mb-1">{title}</h2>
      <div className="w-12 h-0.5 bg-signal mb-6" />
      {children}
    </section>
  );
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-16 h-16 rounded-md border border-border" style={{ background: hex }} />
      <div className="text-xs font-medium text-ink">{label}</div>
      <div className="text-2xs font-mono text-muted">{hex}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-bg p-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-12">
        <div className="label-eyebrow text-signal mb-2">DESIGN SYSTEM</div>
        <h1 className="text-4xl font-bold text-ink mb-3">AlphaTerminal Styleguide</h1>
        <p className="text-muted text-base max-w-2xl">
          Complete reference for the terminal design language — palette, typography, components, and the
          Conviction Ring at all scales. Use this as the source of truth before building any new panel.
        </p>
      </div>

      {/* ── Palette ──────────────────────────────────────────────────────────── */}
      <Section title="Colour Palette">
        <div className="flex flex-wrap gap-6">
          <Swatch label="Background" hex="#07080C" />
          <Swatch label="Panel"      hex="#0E1117" />
          <Swatch label="Border"     hex="#1C2230" />
          <Swatch label="Ink"        hex="#E8ECF4" />
          <Swatch label="Muted"      hex="#6B7488" />
          <Swatch label="Signal"     hex="#5CE1E6" />
          <Swatch label="Danger"     hex="#FF4D5E" />
          <Swatch label="Warn"       hex="#FFB020" />
          <Swatch label="Profit"     hex="#3DDC97" />
        </div>
        <p className="text-xs text-muted mt-4">
          Rule: colour is <em>signal</em>, never decoration. Cyan = live data / positive action. Red = risk only.
          Large surfaces stay dark so signals read instantly.
        </p>
      </Section>

      {/* ── Typography ───────────────────────────────────────────────────────── */}
      <Section title="Typography">
        <div className="space-y-4">
          <div>
            <div className="label-eyebrow mb-2">DISPLAY — Space Grotesk (UI font)</div>
            <p className="text-4xl font-bold text-ink">ALPHA TERMINAL</p>
            <p className="text-2xl font-semibold text-ink">Signal Intelligence Platform</p>
            <p className="text-lg font-medium text-ink">Real-time crypto intelligence</p>
            <p className="text-base text-ink">14px base body — panel content</p>
            <p className="text-sm text-muted">13px — secondary labels</p>
            <p className="text-xs text-muted">11px uppercase — EYEBROW LABELS</p>
            <p className="text-2xs text-muted">10px — metadata, footnotes</p>
          </div>
          <div>
            <div className="label-eyebrow mb-2">DATA — JetBrains Mono (all numbers)</div>
            <div className="space-y-1 font-mono">
              <p className="text-2xl num text-ink tabular-nums">$1,234,567.89</p>
              <p className="text-lg num text-profit tabular-nums">+42.37%</p>
              <p className="text-base num text-danger tabular-nums">-8.12%</p>
              <p className="text-sm num text-muted tabular-nums">5Abc…xYz9</p>
              <p className="text-xs num text-muted tabular-nums">2026-06-12T14:30:00Z</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Conviction Ring ───────────────────────────────────────────────────── */}
      <Section title="Conviction Ring — Signature Component">
        <p className="text-sm text-muted mb-6 max-w-2xl">
          Each segment corresponds to a score component (weight = arc span). Sub-score fills
          the arc proportionally. Hover to inspect, click to open breakdown. The ring appears
          at every scale — 16px in table rows to 120px+ on token detail.
        </p>

        {/* All sizes × all tiers */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="label-eyebrow text-left py-2 pr-6">TIER / SIZE →</th>
                {[16, 28, 48, 80, 120].map(s => (
                  <th key={s} className="label-eyebrow text-center py-2 px-4">{s}px</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                [HIGH_SCORE,  "Low"],
                [MED_SCORE,   "Moderate"],
                [LOW_SCORE,   "High"],
                [AVOID_SCORE, "Avoid"],
              ] as [ConvictionScore, string][]).map(([score, label]) => (
                <tr key={label} className="border-b border-border/40">
                  <td className="py-4 pr-6">
                    <RiskBadge tier={label as import("@/lib/datasources/types").RiskTier} />
                  </td>
                  {[16, 28, 48, 80, 120].map(s => (
                    <td key={s} className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ConvictionRing
                          score={score}
                          size={s}
                          showLabel={s >= 48}
                          strokeWidth={s <= 28 ? 3 : undefined}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive demo */}
        <div className="mt-8 p-6 panel-surface">
          <div className="label-eyebrow mb-4">INTERACTIVE — hover segments, click for breakdown</div>
          <div className="flex items-center gap-8 flex-wrap">
            <ConvictionRing
              score={HIGH_SCORE}
              size={140}
              showLabel
              onSegmentClick={(comp) => alert(`Clicked: ${comp.label} = ${comp.subScore.toFixed(0)}/100\n\n${comp.description}`)}
            />
            <div className="space-y-2">
              {HIGH_SCORE.components.map(c => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-20">{c.label}</span>
                  <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.subScore}%`,
                        background: c.subScore >= 70 ? "#3DDC97" : c.subScore >= 45 ? "#FFB020" : "#FF4D5E",
                      }}
                    />
                  </div>
                  <span className="num text-xs text-ink w-8">{c.subScore.toFixed(0)}</span>
                  <span className="text-2xs text-muted">×{(c.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Badges ───────────────────────────────────────────────────────────── */}
      <Section title="Badges">
        <div className="space-y-4">
          <div>
            <div className="label-eyebrow mb-3">DATA MODE</div>
            <div className="flex gap-3 flex-wrap">
              <DataModeBadge mode="sample" />
              <DataModeBadge mode="live" />
              <DataModeBadge mode="degraded" />
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">RISK TIER</div>
            <div className="flex gap-3 flex-wrap">
              <RiskBadge tier="Low" />
              <RiskBadge tier="Moderate" />
              <RiskBadge tier="High" />
              <RiskBadge tier="Avoid" />
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">SCORE PILL</div>
            <div className="flex gap-3 flex-wrap">
              <ScorePill score={84} />
              <ScorePill score={55} />
              <ScorePill score={28} />
              <ScorePill score={9} />
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">CHAIN</div>
            <div className="flex gap-3 flex-wrap">
              <ChainBadge chain="solana" />
              <ChainBadge chain="ethereum" />
              <ChainBadge chain="base" />
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">SEVERITY</div>
            <div className="flex gap-3 flex-wrap">
              <SeverityBadge severity="critical" />
              <SeverityBadge severity="high" />
              <SeverityBadge severity="medium" />
              <SeverityBadge severity="low" />
              <SeverityBadge severity="info" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Table styles ─────────────────────────────────────────────────────── */}
      <Section title="Table Styles">
        <div className="panel-surface overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-border bg-bg/40">
            <div className="label-eyebrow flex-1">TOKEN</div>
            <div className="label-eyebrow w-16 text-right">SCORE</div>
            <div className="label-eyebrow w-24 text-right">PRICE</div>
            <div className="label-eyebrow w-20 text-right">24H</div>
            <div className="label-eyebrow w-24 text-right">MCAP</div>
            <div className="label-eyebrow w-20 text-right">RISK</div>
          </div>
          {[
            { sym: "BONK", score: HIGH_SCORE, price: "$0.000024", ch: "+34.7%", mcap: "$892M", tier: "Low" as const },
            { sym: "AIAGENT", score: MED_SCORE, price: "$0.0082", ch: "+12.1%", mcap: "$18.4M", tier: "Moderate" as const },
            { sym: "REKT", score: LOW_SCORE, price: "$0.000003", ch: "-22.8%", mcap: "$280K", tier: "High" as const },
            { sym: "RUGME", score: AVOID_SCORE, price: "$0.0000008", ch: "-61.3%", mcap: "$42K", tier: "Avoid" as const },
          ].map(row => (
            <div key={row.sym} className="flex items-center px-4 py-3 border-b border-border/40 last:border-0 hover:bg-signal/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 flex-1">
                <ConvictionRingInline score={row.score} size={18} />
                <span className="text-sm font-semibold text-ink">{row.sym}</span>
                <ChainBadge chain="solana" />
              </div>
              <div className="w-16 text-right">
                <span className="num text-xs font-semibold text-profit">{row.score.composite.toFixed(0)}</span>
              </div>
              <div className="w-24 text-right">
                <span className="num text-xs text-ink">{row.price}</span>
              </div>
              <div className="w-20 text-right">
                <span className={`num text-xs ${row.ch.startsWith("+") ? "text-profit" : "text-danger"}`}>{row.ch}</span>
              </div>
              <div className="w-24 text-right">
                <span className="num text-xs text-ink">{row.mcap}</span>
              </div>
              <div className="w-20 text-right">
                <RiskBadge tier={row.tier} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Skeleton loaders ─────────────────────────────────────────────────── */}
      <Section title="Skeleton Loaders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="panel-surface overflow-hidden">
            <SkeletonPanel rows={5} />
          </div>
          <div className="panel-surface overflow-hidden">
            <SkeletonTable rows={5} />
          </div>
        </div>
      </Section>

      {/* ── Buttons ──────────────────────────────────────────────────────────── */}
      <Section title="Interactive Elements">
        <div className="space-y-4">
          <div>
            <div className="label-eyebrow mb-3">BUTTONS</div>
            <div className="flex gap-3 flex-wrap">
              <button className="btn-terminal">Terminal Button</button>
              <button className="btn-terminal text-signal border-signal/40 bg-signal/10">Active State</button>
              <button className="btn-terminal text-danger border-danger/30 hover:bg-danger/10">Danger</button>
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">GLASS SURFACE (overlays / modals)</div>
            <div className="relative h-24 bg-gradient-to-r from-bg via-panel to-bg rounded-md overflow-hidden">
              <div className="absolute inset-4 glass rounded-md flex items-center justify-center">
                <span className="text-sm text-ink">Glassmorphism overlay</span>
              </div>
            </div>
          </div>
          <div>
            <div className="label-eyebrow mb-3">LIVE BORDER (marks live-data panels)</div>
            <div className="panel-surface live-border p-4 w-64">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                <span className="text-sm text-signal">Live data source</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="border-t border-border pt-6 pb-12">
        <p className="text-xs text-muted">
          AlphaTerminal Design System · Phase 0 · All data panels on SAMPLE — no external APIs connected
        </p>
      </div>
    </div>
  );
}
