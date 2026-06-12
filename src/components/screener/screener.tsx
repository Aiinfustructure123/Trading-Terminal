"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import type { NarrativeKey, ScreenerQuery } from "@/lib/datasources";
import { useTokens } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/lib/use-local-storage";
import { FilterBar } from "@/components/screener/filter-bar";
import { ScreenerTable } from "@/components/screener/screener-table";
import { BUILT_IN_PRESETS, DEFAULT_QUERY, type ScreenerPreset } from "@/components/screener/presets";
import { cn } from "@/lib/utils";

export function Screener() {
  const searchParams = useSearchParams();
  const narrativeParam = searchParams.get("narrative") as NarrativeKey | null;
  const presetParam = searchParams.get("preset");

  const initial = React.useMemo<ScreenerQuery>(() => {
    let q: ScreenerQuery = { ...DEFAULT_QUERY };
    if (presetParam) {
      const p = BUILT_IN_PRESETS.find((x) => x.id === presetParam);
      if (p) q = { ...p.query };
    }
    if (narrativeParam) q.narrative = narrativeParam;
    return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = React.useState<ScreenerQuery>(initial);
  const [activePreset, setActivePreset] = React.useState<string | null>(presetParam ?? null);
  const [saved, setSaved] = useLocalStorage<ScreenerPreset[]>("alpha:presets", []);
  const [newName, setNewName] = React.useState("");

  const { data, isLoading, isFetching } = useTokens(query);
  const tokens = data ?? [];

  const applyPreset = (preset: ScreenerPreset) => {
    setQuery({ ...preset.query });
    setActivePreset(preset.id);
  };

  const onSort = (key: NonNullable<ScreenerQuery["sortBy"]>) => {
    setActivePreset(null);
    setQuery((q) => ({
      ...q,
      sortBy: key,
      sortDir: q.sortBy === key && q.sortDir === "desc" ? "asc" : "desc",
    }));
  };

  const presets = [...BUILT_IN_PRESETS, ...saved];

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <Panel title="Filters" sourceKey="market">
        <FilterBar
          value={query}
          onChange={(q) => {
            setQuery(q);
            setActivePreset(null);
          }}
          onReset={() => {
            setQuery({ ...DEFAULT_QUERY });
            setActivePreset(null);
          }}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-edge pt-3">
          <span className="eyebrow flex items-center gap-1">
            <Bookmark className="h-3 w-3" /> Presets
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors",
                activePreset === p.id
                  ? "border-signal/50 bg-signal/10 text-signal"
                  : "border-edge bg-panel-2 text-muted hover:text-ink",
              )}
            >
              {p.name}
              {!p.builtIn && (
                <Trash2
                  className="h-3 w-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSaved((prev) => prev.filter((x) => x.id !== p.id));
                    if (activePreset === p.id) setActivePreset(null);
                  }}
                />
              )}
            </button>
          ))}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="xs">
                <Plus className="h-3 w-3" /> Save current
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Save filter preset</DialogTitle>
              </DialogHeader>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Preset name"
              />
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    size="sm"
                    disabled={!newName.trim()}
                    onClick={() => {
                      const id = `saved-${Date.now()}`;
                      setSaved((prev) => [...prev, { id, name: newName.trim(), query }]);
                      setActivePreset(id);
                      setNewName("");
                    }}
                  >
                    Save preset
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Panel>

      <Panel
        title="Token Screener"
        sourceKey="market"
        live={isFetching}
        bodyClassName="p-0"
        className="min-h-[420px] flex-1"
        actions={
          <Badge variant="neutral">
            {isLoading ? "…" : `${tokens.length.toLocaleString()} rows`}
          </Badge>
        }
      >
        <ScreenerTable
          tokens={tokens}
          isLoading={isLoading}
          sortBy={query.sortBy}
          sortDir={query.sortDir}
          onSort={onSort}
        />
      </Panel>
    </div>
  );
}
