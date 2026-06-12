"use client";

import React from "react";
import type { ScreenerParams, RiskTier, Chain } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";
import { X, Bookmark } from "lucide-react";

type FilterState = ScreenerParams;

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const MCAP_PRESETS = [
  { label: "Any",   value: undefined },
  { label: "<$500K", value: 500_000 },
  { label: "<$1M",  value: 1_000_000 },
  { label: "<$2M",  value: 2_000_000 },
  { label: "<$5M",  value: 5_000_000 },
  { label: "<$25M", value: 25_000_000 },
];

const CHAINS: { label: string; value: Chain | undefined }[] = [
  { label: "All",      value: undefined },
  { label: "Solana",   value: "solana" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Base",     value: "base" },
];

const RISK_TIERS: RiskTier[] = ["Low", "Moderate", "High", "Avoid"];

const FILTER_PRESETS: { label: string; filters: Partial<FilterState> }[] = [
  {
    label: "Early Discovery",
    filters: { ageMaxDays: 7, mcapMax: 5_000_000, riskTiers: ["Low", "Moderate"] },
  },
  {
    label: "High Conviction",
    filters: { sortBy: "score", sortDir: "desc", riskTiers: ["Low", "Moderate"] },
  },
  {
    label: "New Launches",
    filters: { ageMaxDays: 1, sortBy: "volume24h", sortDir: "desc" },
  },
];

function Btn({ active, onClick, children, className }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded text-xs font-mono border transition-colors",
        active
          ? "bg-signal/15 text-signal border-signal/40"
          : "bg-bg text-muted border-border hover:border-signal/30 hover:text-ink"
      , className)}
    >
      {children}
    </button>
  );
}

export function ScreenerFilters({ filters, onChange }: Props) {
  const toggleRisk = (tier: RiskTier) => {
    const current = filters.riskTiers ?? [];
    const next = current.includes(tier)
      ? current.filter(r => r !== tier)
      : [...current, tier];
    onChange({ ...filters, riskTiers: next.length ? next : undefined });
  };

  const reset = () => onChange({
    sortBy: "score", sortDir: "desc", limit: 50, offset: 0,
  });

  const hasFilters = !!(filters.mcapMax || filters.chain || filters.ageMaxDays ||
    filters.liquidityMin || (filters.riskTiers?.length));

  return (
    <div className="bg-panel border-b border-border px-4 py-3 space-y-3">
      {/* Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="label-eyebrow flex items-center gap-1.5">
          <Bookmark size={11} /> PRESETS
        </span>
        {FILTER_PRESETS.map(preset => (
          <Btn key={preset.label} onClick={() => onChange({ ...filters, ...preset.filters })}>
            {preset.label}
          </Btn>
        ))}
      </div>

      {/* Filter controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Mcap buckets */}
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">MCAP</span>
          <div className="flex gap-1">
            {MCAP_PRESETS.map(p => (
              <Btn
                key={p.label}
                active={filters.mcapMax === p.value}
                onClick={() => onChange({ ...filters, mcapMax: p.value })}
              >
                {p.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Chain */}
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">CHAIN</span>
          <div className="flex gap-1">
            {CHAINS.map(c => (
              <Btn
                key={c.label}
                active={filters.chain === c.value}
                onClick={() => onChange({ ...filters, chain: c.value })}
              >
                {c.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">AGE</span>
          {[
            { label: "Any", v: undefined },
            { label: "<1d", v: 1 },
            { label: "<7d", v: 7 },
            { label: "<30d", v: 30 },
          ].map(({ label, v }) => (
            <Btn
              key={label}
              active={filters.ageMaxDays === v}
              onClick={() => onChange({ ...filters, ageMaxDays: v })}
            >
              {label}
            </Btn>
          ))}
        </div>

        {/* Risk tier */}
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow">RISK</span>
          {RISK_TIERS.map(tier => {
            const active = (filters.riskTiers ?? []).includes(tier);
            const color = {
              Low: "border-profit/40 text-profit bg-profit/10",
              Moderate: "border-warn/40 text-warn bg-warn/10",
              High: "border-danger/40 text-danger bg-danger/10",
              Avoid: "border-danger/60 text-danger bg-danger/20",
            }[tier];
            return (
              <button
                key={tier}
                onClick={() => toggleRisk(tier)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-mono border transition-colors",
                  active ? color : "bg-bg text-muted border-border hover:border-signal/30"
                )}
              >
                {tier}
              </button>
            );
          })}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted hover:text-danger transition-colors"
          >
            <X size={11} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
