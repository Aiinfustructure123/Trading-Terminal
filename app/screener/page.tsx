"use client";

import { useState } from "react";
import { Bookmark, Plus, Search, X } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { TokenTable } from "@/components/token/token-table";
import { useScreener } from "@/lib/hooks/queries";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import type {
  RiskTier,
  ScreenerFilter,
  ScreenerSortKey,
} from "@/lib/datasources/types";

interface Preset {
  id: string;
  name: string;
  builtIn?: boolean;
  filter: ScreenerFilter;
}

const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "early-discovery",
    name: "Early Discovery",
    builtIn: true,
    filter: { maxAgeHours: 24 * 7, maxMarketCap: 5_000_000, maxRiskTier: "Moderate", chain: "all" },
  },
];

const MCAP_BUCKETS = [
  { label: "<$500k", value: 500_000 },
  { label: "<$1m", value: 1_000_000 },
  { label: "<$2m", value: 2_000_000 },
  { label: "<$5m", value: 5_000_000 },
  { label: "<$25m", value: 25_000_000 },
  { label: "Any", value: undefined },
] as const;

const LIQ_OPTIONS = [
  { label: "Any liq", value: undefined },
  { label: "≥$10k", value: 10_000 },
  { label: "≥$50k", value: 50_000 },
  { label: "≥$250k", value: 250_000 },
] as const;

const AGE_OPTIONS = [
  { label: "Any age", value: undefined },
  { label: "<24h", value: 24 },
  { label: "<7d", value: 24 * 7 },
  { label: "<30d", value: 24 * 30 },
] as const;

const VOL_OPTIONS = [
  { label: "Any vol", value: undefined },
  { label: "≥$10k", value: 10_000 },
  { label: "≥$100k", value: 100_000 },
  { label: "≥$1m", value: 1_000_000 },
] as const;

const RISK_OPTIONS: Array<{ label: string; value: RiskTier | undefined }> = [
  { label: "Any risk", value: undefined },
  { label: "≤ Low", value: "Low" },
  { label: "≤ Moderate", value: "Moderate" },
  { label: "≤ High", value: "High" },
];

function FilterSelect<T>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<{ label: string; value: T }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={options.findIndex((o) => o.value === value)}
      onChange={(e) => onChange(options[Number(e.target.value)].value)}
      className="h-7 rounded border border-panel-border bg-panel px-1.5 font-mono text-[11px] text-ink outline-none transition-colors hover:border-signal/40 focus:border-signal/60"
    >
      {options.map((o, i) => (
        <option key={o.label} value={i}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function ScreenerPage() {
  const [filter, setFilter] = useState<ScreenerFilter>({ chain: "all" });
  const [sort, setSort] = useState<{ key: ScreenerSortKey; dir: "asc" | "desc" }>({
    key: "conviction",
    dir: "desc",
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [savedPresets, setSavedPresets] = useLocalStorage<Preset[]>("alpha:screener-presets", []);

  const { data, isLoading, isFetching } = useScreener({ filter, sort });

  const presets = [...BUILT_IN_PRESETS, ...savedPresets];

  const applyPreset = (p: Preset) => {
    setFilter(p.filter);
    setActivePreset(p.id);
  };

  const set = (patch: Partial<ScreenerFilter>) => {
    setFilter((f) => ({ ...f, ...patch }));
    setActivePreset(null);
  };

  const savePreset = () => {
    const name = window.prompt("Preset name");
    if (!name) return;
    const preset: Preset = { id: `user-${Date.now()}`, name, filter };
    setSavedPresets((prev) => [...prev, preset]);
    setActivePreset(preset.id);
  };

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col">
          <span className="eyebrow">Screener</span>
          <h1 className="text-lg font-semibold leading-tight">
            {data ? `${data.length.toLocaleString()} tokens` : "Token screener"}
          </h1>
        </div>

        {/* presets */}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <span key={p.id} className="flex items-center">
              <button
                onClick={() => applyPreset(p)}
                className={cn(
                  "flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                  activePreset === p.id
                    ? "border-signal/50 bg-signal/10 text-signal"
                    : "border-panel-border bg-panel text-muted hover:text-ink"
                )}
              >
                <Bookmark className="size-3" aria-hidden />
                {p.name}
              </button>
              {!p.builtIn && (
                <button
                  onClick={() => setSavedPresets((prev) => prev.filter((x) => x.id !== p.id))}
                  aria-label={`Delete preset ${p.name}`}
                  className="-ml-1 rounded p-0.5 text-muted/50 hover:text-danger"
                >
                  <X className="size-3" aria-hidden />
                </button>
              )}
            </span>
          ))}
          <button
            onClick={savePreset}
            className="flex items-center gap-1 rounded border border-dashed border-panel-border px-2 py-1 text-xs text-muted transition-colors hover:border-signal/40 hover:text-ink"
          >
            <Plus className="size-3" aria-hidden />
            Save preset
          </button>
        </div>
      </header>

      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted" aria-hidden />
          <input
            value={filter.search ?? ""}
            onChange={(e) => set({ search: e.target.value || undefined })}
            placeholder="Symbol, name, address…"
            aria-label="Search tokens"
            className="h-7 w-44 rounded border border-panel-border bg-panel pl-6 pr-2 text-xs outline-none transition-colors placeholder:text-muted/60 focus:border-signal/60"
          />
        </div>
        <FilterSelect
          ariaLabel="Max market cap"
          options={MCAP_BUCKETS}
          value={filter.maxMarketCap}
          onChange={(v) => set({ maxMarketCap: v })}
        />
        <FilterSelect
          ariaLabel="Min liquidity"
          options={LIQ_OPTIONS}
          value={filter.minLiquidity}
          onChange={(v) => set({ minLiquidity: v })}
        />
        <FilterSelect
          ariaLabel="Max age"
          options={AGE_OPTIONS}
          value={filter.maxAgeHours}
          onChange={(v) => set({ maxAgeHours: v })}
        />
        <FilterSelect
          ariaLabel="Min 24h volume"
          options={VOL_OPTIONS}
          value={filter.minVolume24h}
          onChange={(v) => set({ minVolume24h: v })}
        />
        <FilterSelect
          ariaLabel="Max risk tier"
          options={RISK_OPTIONS}
          value={filter.maxRiskTier}
          onChange={(v) => set({ maxRiskTier: v })}
        />
        <FilterSelect
          ariaLabel="Chain"
          options={[
            { label: "All chains", value: "all" as const },
            { label: "Solana", value: "solana" as const },
          ]}
          value={filter.chain ?? "all"}
          onChange={(v) => set({ chain: v })}
        />
        {isFetching && <span className="size-1.5 animate-pulse-dot rounded-full bg-signal" aria-hidden />}
      </div>

      <Panel source="market" className="min-h-0 flex-1" bodyClassName="flex flex-col">
        <TokenTable tokens={data} isLoading={isLoading} sort={sort} onSortChange={setSort} />
      </Panel>
    </div>
  );
}
