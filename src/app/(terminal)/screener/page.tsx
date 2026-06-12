"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tokenSource } from "@/lib/datasources";
import { ScreenerFilters } from "@/components/screener/ScreenerFilters";
import { ScreenerTable } from "@/components/screener/ScreenerTable";
import { DataModeBadge } from "@/components/ui/DataBadge";
import type { ScreenerParams, Token } from "@/lib/datasources/types";
import { Search } from "lucide-react";

const WATCH_KEY = "alpha-terminal-watchlist";

function loadWatchlist(): Set<string> {
  try {
    const s = localStorage.getItem(WATCH_KEY);
    return s ? new Set(JSON.parse(s)) : new Set();
  } catch { return new Set(); }
}

function saveWatchlist(ws: Set<string>) {
  try { localStorage.setItem(WATCH_KEY, JSON.stringify([...ws])); } catch {}
}

const PAGE_SIZE = 50;

export default function ScreenerPage() {
  const [filters, setFilters] = useState<ScreenerParams>({
    sortBy: "score", sortDir: "desc", limit: PAGE_SIZE, offset: 0,
  });
  const [search, setSearch] = useState("");
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [offset, setOffset] = useState(0);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  const queryParams: ScreenerParams = {
    ...filters,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
  };

  type TokensResult = { tokens: Token[]; total: number; source: import("@/lib/datasources/types").SourceMeta };
  const { data, isFetching } = useQuery<TokensResult>({
    queryKey: ["screener", queryParams],
    queryFn: () => tokenSource.getTokens(queryParams),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (data?.tokens) {
      setAllTokens(prev =>
        offset === 0 ? data.tokens : [...prev, ...data.tokens]
      );
    }
  }, [data, offset]);

  const handleFiltersChange = useCallback((f: ScreenerParams) => {
    setFilters(f);
    setOffset(0);
    setAllTokens([]);
  }, []);

  const handleSort = useCallback((key: NonNullable<ScreenerParams["sortBy"]>) => {
    setFilters(prev => ({
      ...prev,
      sortBy: key,
      sortDir: prev.sortBy === key && prev.sortDir === "desc" ? "asc" : "desc",
    }));
    setOffset(0);
    setAllTokens([]);
  }, []);

  const handleLoadMore = useCallback(() => {
    setOffset(prev => prev + PAGE_SIZE);
  }, []);

  const handleToggleWatch = useCallback((addr: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr); else next.add(addr);
      saveWatchlist(next);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-panel border-b border-border">
        <div className="flex items-center gap-3">
          <span className="label-eyebrow text-signal">TOKEN SCREENER</span>
          <DataModeBadge mode={data?.source.mode ?? "sample"} />
        </div>
        <div className="flex-1" />
        {/* Search */}
        <div className="flex items-center gap-2 bg-bg border border-border rounded px-3 py-1.5 w-64 focus-within:border-signal/50 transition-colors">
          <Search size={13} className="text-muted flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setOffset(0); setAllTokens([]); }}
            placeholder="Search tokens, address..."
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <span className="num text-xs text-muted">
          {data?.total.toLocaleString() ?? "—"} results
        </span>
      </div>

      {/* Filters */}
      <ScreenerFilters filters={filters} onChange={handleFiltersChange} />

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <div className="min-w-[1000px] h-full">
          <ScreenerTable
            tokens={allTokens}
            total={data?.total ?? 0}
            isLoading={isFetching}
            sortBy={filters.sortBy ?? "score"}
            sortDir={filters.sortDir ?? "desc"}
            onSort={handleSort}
            onLoadMore={handleLoadMore}
            watchlist={watchlist}
            onToggleWatch={handleToggleWatch}
          />
        </div>
      </div>
    </div>
  );
}
