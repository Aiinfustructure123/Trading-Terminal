"use client";

import * as React from "react";
import { getUniverse } from "@/lib/datasources/sample/generator";
import { PageHeader } from "@/components/page-header";
import { Panel, Eyebrow } from "@/components/panel";
import { ConvictionRing } from "@/components/conviction-ring";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { SourceBadge } from "@/components/source-badge";
import { DeltaValue } from "@/components/delta-value";
import { formatCompact, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const PALETTE = [
  { name: "--bg", hex: "#07080C", note: "the void everything sits in", text: "text-ink" },
  { name: "--panel", hex: "#0E1117", note: "panel surfaces (1px #1C2230 borders)", text: "text-ink" },
  { name: "--ink", hex: "#E8ECF4", note: "primary text", text: "text-bg" },
  { name: "--muted", hex: "#6B7488", note: "secondary text, labels", text: "text-bg" },
  { name: "--signal", hex: "#5CE1E6", note: "live data, primary actions, positive momentum", text: "text-bg" },
  { name: "--danger", hex: "#FF4D5E", note: "risk, drawdown, sell pressure", text: "text-bg" },
  { name: "--warn", hex: "#FFB020", note: "caution states, Moderate risk", text: "text-bg" },
  { name: "--profit", hex: "#3DDC97", note: "gains, buy pressure", text: "text-bg" },
];

const TYPE_SCALE: { cls: string; label: string; sample: string }[] = [
  { cls: "text-display font-display font-semibold", label: "display / 28", sample: "Alpha Terminal" },
  { cls: "text-metric-lg font-mono tabular", label: "metric-lg / 34 mono", sample: "$2.31T" },
  { cls: "text-metric font-mono tabular", label: "metric / 22 mono", sample: "+148.2%" },
  { cls: "text-data-lg font-display", label: "data-lg / 15", sample: "Conviction Opportunities" },
  { cls: "text-base font-display", label: "base / 14", sample: "Body copy and descriptions." },
  { cls: "text-data font-mono tabular", label: "data / 13 mono", sample: "0x7f3a…9c21" },
  { cls: "eyebrow", label: "eyebrow / 11 upper", sample: "Market Pulse" },
  { cls: "text-micro font-mono", label: "micro / 10 mono", sample: "updated 3s ago" },
];

export default function StyleGuidePage() {
  const tokens = React.useMemo(() => getUniverse().slice(0, 6), []);
  const featured = tokens[0]!;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Phase 0 · Design System"
        title="Style Guide"
        description="The design token system, type scale, the Conviction Ring at every scale, badges, and table styles. This is the visual contract every screen is built against."
        actions={<SourceBadge sourceKey="market" />}
      />

      <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
        {/* Palette */}
        <Panel title="Palette" className="xl:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PALETTE.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-md border border-edge">
                <div
                  className={cn("flex h-20 items-end p-2", c.text)}
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="font-mono text-[11px]">{c.hex}</span>
                </div>
                <div className="bg-panel p-2.5">
                  <p className="font-mono text-[12px] text-ink">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Color is <span className="text-ink">signal, never decoration</span>: a glowing cyan edge means live data;
            red means risk, nothing else. Large areas stay dark and quiet so signals read instantly.
          </p>
        </Panel>

        {/* Type scale */}
        <Panel title="Type Scale">
          <ul className="flex flex-col divide-y divide-edge">
            {TYPE_SCALE.map((t) => (
              <li key={t.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className={cn("truncate text-ink", t.cls)}>{t.sample}</span>
                <span className="eyebrow shrink-0">{t.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-muted">
            Display/UI uses <span className="text-ink">Space Grotesk</span>; all data, prices, addresses & timestamps
            use <span className="text-ink">JetBrains Mono</span> with <span className="font-mono">tabular-nums</span>.
          </p>
        </Panel>

        {/* Conviction Ring scales */}
        <Panel title="Conviction Ring · all scales">
          <div className="flex flex-wrap items-end gap-7">
            {[
              { size: 16, label: "16px · table" },
              { size: 22, label: "22px · list" },
              { size: 40, label: "40px · card" },
              { size: 72, label: "72px · panel" },
              { size: 120, label: "120px · detail" },
            ].map((r) => (
              <div key={r.size} className="flex flex-col items-center gap-2">
                <ConvictionRing score={featured.conviction} size={r.size} interactive={r.size >= 40} />
                <span className="eyebrow">{r.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted">
            Each segment is one score component (momentum, volume, liquidity, holders, smart-money, risk-inverse).
            Hover a segment to highlight it; click any ring to open the full breakdown. Segment color encodes
            component health.
          </p>
        </Panel>

        {/* Badges */}
        <Panel title="Badges & Status" className="xl:col-span-2">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Eyebrow>Source liveness</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-2">
                <SourceBadge sourceKey="market" />
                <SourceBadge sourceKey="ai" />
                <SourceBadge sourceKey="smartMoney" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Every panel declares where its data comes from.</p>
            </div>
            <div>
              <Eyebrow>Risk tiers</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-2">
                <RiskBadge tier="Low" />
                <RiskBadge tier="Moderate" />
                <RiskBadge tier="High" />
                <RiskBadge tier="Avoid" />
              </div>
            </div>
            <div>
              <Eyebrow>Generic</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="signal">Live</Badge>
                <Badge variant="profit">+ Buy</Badge>
                <Badge variant="danger">Sell</Badge>
                <Badge variant="warn">Caution</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Eyebrow>Buttons</Eyebrow>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button size="sm">Small</Button>
              <Button size="xs">XS</Button>
            </div>
          </div>
        </Panel>

        {/* Table styles */}
        <Panel title="Table styles" sourceKey="market" className="xl:col-span-2" bodyClassName="p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-edge text-left">
                {["Token", "Price", "24h", "Volume", "Liquidity", "MCap", "Conv", "Risk"].map((h) => (
                  <th key={h} className="eyebrow px-3.5 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-b border-edge/60 transition-colors hover:bg-panel-2">
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-sm font-mono text-[10px] font-bold text-bg"
                        style={{ backgroundColor: t.accent }}
                      >
                        {t.symbol.slice(0, 2)}
                      </span>
                      <div className="leading-tight">
                        <p className="font-mono font-semibold text-ink">{t.symbol}</p>
                        <p className="text-[11px] text-muted">{t.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="tabular px-3.5 py-2.5 text-ink">{formatPrice(t.priceUsd)}</td>
                  <td className="px-3.5 py-2.5">
                    <DeltaValue value={t.deltas.h24} />
                  </td>
                  <td className="tabular px-3.5 py-2.5 text-ink">${formatCompact(t.volume24hUsd)}</td>
                  <td className="tabular px-3.5 py-2.5 text-ink">${formatCompact(t.liquidityUsd)}</td>
                  <td className="tabular px-3.5 py-2.5 text-ink">${formatCompact(t.marketCapUsd)}</td>
                  <td className="px-3.5 py-2.5">
                    <ConvictionRing score={t.conviction} size={26} showValue={false} />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <RiskBadge tier={t.riskTier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Score breakdown */}
        <Panel title={`Score breakdown · ${featured.symbol}`} className="xl:col-span-2">
          <ScoreBreakdown score={featured.conviction} />
        </Panel>
      </div>
    </div>
  );
}
