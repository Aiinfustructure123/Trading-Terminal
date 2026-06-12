"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SAMPLE_TOKENS } from "@/lib/datasources/sample/tokens";
import { TokenHeader } from "@/components/token/TokenHeader";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { ScoreBreakdown } from "@/components/token/ScoreBreakdown";
import { ForensicsPanel } from "@/components/token/ForensicsPanel";
import { HoldersPanel } from "@/components/token/HoldersPanel";
import { ScenarioPanel } from "@/components/token/ScenarioPanel";
import { AIBriefPanel } from "@/components/token/AIBriefPanel";
import type { ScoreComponent } from "@/lib/datasources/types";

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

export default function TokenDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [highlightedKey, setHighlightedKey] = useState<string | undefined>();
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => { setWatchlist(loadWatchlist()); }, []);

  // First try to find token in sample data directly
  const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];

  const toggleWatch = () => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(address)) next.delete(address); else next.add(address);
      saveWatchlist(next);
      return next;
    });
  };

  const handleSegmentClick = (comp: ScoreComponent) => {
    setHighlightedKey(prev => prev === comp.key ? undefined : comp.key);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        Token not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <TokenHeader
        token={token}
        onSegmentClick={handleSegmentClick}
        watchlisted={watchlist.has(address)}
        onToggleWatch={toggleWatch}
      />

      {/* Content grid */}
      <div className="p-4 space-y-4">
        {/* Chart — full width */}
        <div className="h-[360px]">
          <CandlestickChart address={address} chain={token.chain} />
        </div>

        {/* Score + Forensics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ScoreBreakdown score={token.score} highlightedKey={highlightedKey} />
          <ForensicsPanel score={token.score} />
        </div>

        {/* Holders + Scenarios */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <HoldersPanel address={address} chain={token.chain} />
          <ScenarioPanel address={address} chain={token.chain} />
        </div>

        {/* AI Brief — full width */}
        <AIBriefPanel address={address} chain={token.chain} />
      </div>
    </div>
  );
}
