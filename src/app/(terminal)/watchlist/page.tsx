"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SAMPLE_TOKENS } from "@/lib/datasources/sample/tokens";
import { ScreenerTable } from "@/components/screener/ScreenerTable";
import { DataModeBadge } from "@/components/ui/DataBadge";
import { BookMarked, Star } from "lucide-react";
import type { Token, ScreenerParams } from "@/lib/datasources/types";

const WATCH_KEY = "alpha-terminal-watchlist";

function loadWatchlist(): Set<string> {
  try {
    const s = typeof window !== "undefined" ? localStorage.getItem(WATCH_KEY) : null;
    return s ? new Set(JSON.parse(s)) : new Set();
  } catch { return new Set(); }
}

function saveWatchlist(ws: Set<string>) {
  try { localStorage.setItem(WATCH_KEY, JSON.stringify([...ws])); } catch {}
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<NonNullable<ScreenerParams["sortBy"]>>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  const tokens: Token[] = [...watchlist]
    .map(addr => SAMPLE_TOKENS.find(t => t.address === addr))
    .filter(Boolean) as Token[];

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
      <div className="flex items-center gap-3 px-4 py-3 bg-panel border-b border-border">
        <BookMarked size={16} className="text-signal" />
        <span className="label-eyebrow text-signal">WATCHLIST</span>
        <DataModeBadge mode="sample" />
        <span className="text-xs text-muted ml-auto">{watchlist.size} tokens</span>
      </div>

      {watchlist.size === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <Star size={48} className="text-border" />
          <div>
            <div className="text-lg font-medium text-ink mb-1">Your watchlist is empty</div>
            <p className="text-sm text-muted">
              Star tokens in the Screener or Token Detail to track them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto">
          <div className="min-w-[1000px] h-full">
            <ScreenerTable
              tokens={tokens}
              total={tokens.length}
              isLoading={false}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={(key) => {
                if (key === sortBy) setSortDir(d => d === "desc" ? "asc" : "desc");
                else { setSortBy(key); setSortDir("desc"); }
              }}
              onLoadMore={() => {}}
              watchlist={watchlist}
              onToggleWatch={handleToggleWatch}
            />
          </div>
        </div>
      )}
    </div>
  );
}
