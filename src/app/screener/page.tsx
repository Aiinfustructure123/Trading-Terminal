"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/screener/filter-bar";
import { TokenTable } from "@/components/screener/token-table";
import { SourceBadge } from "@/components/ui/source-badge";
import { Eyebrow } from "@/components/ui/primitives";
import { useTokens } from "@/lib/hooks/use-data";
import { DEFAULT_FILTERS, type FilterState, usePresets } from "@/lib/store/presets";
import { RISK_ORDER } from "@/lib/scoring/risk";

export default function ScreenerPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { presets, save, remove } = usePresets();

  // Sample source already filters; keep query lean and apply the rest client-side.
  const { data, isLoading } = useTokens({ limit: 1200 });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      if (filters.chain !== "all" && t.chain !== filters.chain) return false;
      if (filters.maxMarketCap && t.marketCap > filters.maxMarketCap) return false;
      if (t.liquidityUsd < filters.minLiquidity) return false;
      if (filters.maxAgeHours && t.ageHours > filters.maxAgeHours) return false;
      if (t.volume24h < filters.minVolume24h) return false;
      if (RISK_ORDER[t.riskTier] > RISK_ORDER[filters.maxRiskTier]) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!t.symbol.toLowerCase().includes(q) && !t.name.toLowerCase().includes(q) && !t.address.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-panel px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Eyebrow>Token Screener</Eyebrow>
          <SourceBadge source="market" />
        </div>
        <span className="font-mono text-[10px] text-muted">{data?.length.toLocaleString() ?? "—"} tokens in universe</span>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        presets={presets}
        onSavePreset={(name) => save(name, filters)}
        onRemovePreset={remove}
        resultCount={filtered.length}
      />

      <div className="min-h-0 flex-1">
        <TokenTable tokens={filtered} loading={isLoading} />
      </div>
    </div>
  );
}
