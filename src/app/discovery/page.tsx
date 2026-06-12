"use client";

import { useMemo, useState } from "react";
import { Compass } from "lucide-react";
import { OpportunityCard } from "@/components/token/opportunity-card";
import { SourceBadge } from "@/components/ui/source-badge";
import { Eyebrow, Skeleton } from "@/components/ui/primitives";
import { useTokens } from "@/lib/hooks/use-data";
import { BUILT_IN_PRESETS } from "@/lib/store/presets";
import { RISK_ORDER } from "@/lib/scoring/risk";
import { cn } from "@/lib/utils";

export default function DiscoveryPage() {
  const [presetId, setPresetId] = useState(BUILT_IN_PRESETS[0].id);
  const preset = BUILT_IN_PRESETS.find((p) => p.id === presetId)!;
  const { data, isLoading } = useTokens({ limit: 1200 });

  const ranked = useMemo(() => {
    if (!data) return [];
    const f = preset.filters;
    return data
      .filter((t) => {
        if (f.chain !== "all" && t.chain !== f.chain) return false;
        if (f.maxMarketCap && t.marketCap > f.maxMarketCap) return false;
        if (t.liquidityUsd < f.minLiquidity) return false;
        if (f.maxAgeHours && t.ageHours > f.maxAgeHours) return false;
        if (t.volume24h < f.minVolume24h) return false;
        if (RISK_ORDER[t.riskTier] > RISK_ORDER[f.maxRiskTier]) return false;
        return true;
      })
      .sort((a, b) => b.conviction.composite - a.conviction.composite)
      .slice(0, 18);
  }, [data, preset]);

  return (
    <div className="flex flex-col gap-4 p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-signal" />
          <Eyebrow>Discovery</Eyebrow>
          <SourceBadge source="market" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-bg p-0.5">
          {BUILT_IN_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={cn("rounded px-3 py-1.5 font-mono text-[11px] transition-colors", p.id === presetId ? "bg-signal/15 text-signal" : "text-muted hover:text-ink")}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <p className="max-w-2xl text-sm text-muted">
        Ranked opportunities from the <span className="text-ink">{preset.name}</span> preset. Each card shows the score components
        driving its rank — the &ldquo;why&rdquo; behind the ranking.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-md" />)
          : ranked.map((t, i) => (
              <div key={t.address} className="relative">
                <span className="absolute -left-1 -top-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-panel font-mono text-[10px] text-signal">{i + 1}</span>
                <OpportunityCard token={t} />
              </div>
            ))}
      </div>
      {!isLoading && ranked.length === 0 && <p className="text-center text-sm text-muted">No tokens match this preset right now.</p>}
    </div>
  );
}
