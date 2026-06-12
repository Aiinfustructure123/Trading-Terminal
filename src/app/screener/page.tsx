"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerFilter, ScreenerSort } from "@/lib/datasources/types";
import { useScreenerTokens } from "@/lib/hooks/queries";
import { EARLY_DISCOVERY_PRESET } from "@/lib/store/presets";
import { FilterBar } from "@/components/screener/filter-bar";
import { ScreenerTable } from "@/components/screener/screener-table";

function ScreenerContent() {
  const params = useSearchParams();
  const narrative = params.get("narrative");
  const presetParam = params.get("preset");

  const [filter, setFilter] = React.useState<ScreenerFilter>(() => {
    if (presetParam === EARLY_DISCOVERY_PRESET.id) {
      return { ...EARLY_DISCOVERY_PRESET.filter };
    }
    return narrative ? { narrative } : {};
  });
  const [activePresetId, setActivePresetId] = React.useState<string | null>(
    presetParam === EARLY_DISCOVERY_PRESET.id ? presetParam : null,
  );
  const [sort, setSort] = React.useState<ScreenerSort>({
    key: "volume24hUsd",
    dir: "desc",
  });

  const { data, isPending, isFetching } = useScreenerTokens(filter, sort);

  return (
    <div className="flex h-[calc(100dvh-3rem-4rem)] flex-col gap-3 p-3 sm:p-4 lg:h-[calc(100dvh-3rem)]">
      <FilterBar
        filter={filter}
        onChange={setFilter}
        activePresetId={activePresetId}
        onPresetChange={setActivePresetId}
      />
      <ScreenerTable
        tokens={data}
        isPending={isPending || (isFetching && !data)}
        sort={sort}
        onSortChange={setSort}
      />
    </div>
  );
}

export default function ScreenerPage() {
  return (
    <React.Suspense>
      <ScreenerContent />
    </React.Suspense>
  );
}
