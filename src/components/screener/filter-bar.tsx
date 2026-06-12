"use client";

import { useState } from "react";
import { Search, Save, Bookmark, X } from "lucide-react";
import type { Chain, RiskTier } from "@/lib/datasources/types";
import { type FilterState, type Preset } from "@/lib/store/presets";
import { Eyebrow } from "@/components/ui/primitives";
import { fmtUsd, cn } from "@/lib/utils";

const MCAP_BUCKETS: { label: string; value: number | undefined }[] = [
  { label: "<$500K", value: 500_000 },
  { label: "<$1M", value: 1_000_000 },
  { label: "<$2M", value: 2_000_000 },
  { label: "<$5M", value: 5_000_000 },
  { label: "<$25M", value: 25_000_000 },
  { label: "Any", value: undefined },
];

const CHAINS: { label: string; value: Chain | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Solana", value: "solana" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Base", value: "base" },
];

const RISK_TIERS: RiskTier[] = ["Low", "Moderate", "High", "Avoid"];
const AGES: { label: string; value: number | undefined }[] = [
  { label: "<1d", value: 24 },
  { label: "<7d", value: 168 },
  { label: "<30d", value: 720 },
  { label: "Any", value: undefined },
];
const LIQ: { label: string; value: number }[] = [
  { label: "$0", value: 0 },
  { label: "$25K", value: 25_000 },
  { label: "$100K", value: 100_000 },
  { label: "$500K", value: 500_000 },
];
const VOL: { label: string; value: number }[] = [
  { label: "$0", value: 0 },
  { label: "$50K", value: 50_000 },
  { label: "$250K", value: 250_000 },
  { label: "$1M", value: 1_000_000 },
];

function Seg<T>({ label, options, value, onChange }: { label: string; options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-bg p-0.5">
        {options.map((o) => (
          <button
            key={o.label}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded px-2 py-1 font-mono text-[11px] transition-colors",
              o.value === value ? "bg-signal/15 text-signal" : "text-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  filters,
  setFilters,
  presets,
  onSavePreset,
  onRemovePreset,
  resultCount,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onRemovePreset: (id: string) => void;
  resultCount: number;
}) {
  const [savingName, setSavingName] = useState("");
  const [showSave, setShowSave] = useState(false);

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-panel p-3">
      {/* Presets row */}
      <div className="flex flex-wrap items-center gap-2">
        <Bookmark className="size-3.5 text-muted" />
        <Eyebrow>Presets</Eyebrow>
        {presets.map((p) => (
          <span key={p.id} className="group flex items-center">
            <button
              onClick={() => setFilters(p.filters)}
              className={cn(
                "rounded-l border border-border px-2 py-1 font-mono text-[11px] text-muted hover:border-signal/40 hover:text-signal",
                p.builtIn && "border-signal/20 text-signal/80",
                !p.builtIn && "rounded-l",
              )}
            >
              {p.name}
            </button>
            {!p.builtIn && (
              <button onClick={() => onRemovePreset(p.id)} className="rounded-r border border-l-0 border-border px-1 py-1 text-muted hover:text-danger" aria-label="Delete preset">
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted">{resultCount.toLocaleString()} results</span>
          {showSave ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={savingName}
                onChange={(e) => setSavingName(e.target.value)}
                placeholder="Preset name"
                className="w-28 rounded border border-border bg-bg px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-signal/50"
              />
              <button
                onClick={() => { if (savingName.trim()) { onSavePreset(savingName.trim()); setSavingName(""); setShowSave(false); } }}
                className="rounded bg-signal/15 px-2 py-1 font-mono text-[11px] text-signal"
              >
                Save
              </button>
              <button onClick={() => setShowSave(false)} className="text-muted hover:text-ink"><X className="size-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setShowSave(true)} className="flex items-center gap-1 rounded border border-border px-2 py-1 font-mono text-[11px] text-muted hover:border-signal/40 hover:text-signal">
              <Save className="size-3" /> Save filter
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5">
        <Search className="size-3.5 text-muted" />
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Filter by symbol, name, or contract address…"
          className="flex-1 bg-transparent font-mono text-xs text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <Seg label="Chain" options={CHAINS} value={filters.chain} onChange={(v) => setFilters({ ...filters, chain: v })} />
        <Seg label="Max Market Cap" options={MCAP_BUCKETS} value={filters.maxMarketCap} onChange={(v) => setFilters({ ...filters, maxMarketCap: v })} />
        <Seg label="Max Age" options={AGES} value={filters.maxAgeHours} onChange={(v) => setFilters({ ...filters, maxAgeHours: v })} />
        <Seg label="Min Liquidity" options={LIQ} value={filters.minLiquidity} onChange={(v) => setFilters({ ...filters, minLiquidity: v })} />
        <Seg label="Min Volume 24h" options={VOL} value={filters.minVolume24h} onChange={(v) => setFilters({ ...filters, minVolume24h: v })} />
        <Seg label="Max Risk" options={RISK_TIERS.map((t) => ({ label: t, value: t }))} value={filters.maxRiskTier} onChange={(v) => setFilters({ ...filters, maxRiskTier: v })} />
      </div>
    </div>
  );
}

export { MCAP_BUCKETS, fmtUsd };
