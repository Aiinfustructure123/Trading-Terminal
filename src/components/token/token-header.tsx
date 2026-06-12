"use client";

import * as React from "react";
import { ExternalLink, Globe, Star } from "lucide-react";
import { TokenDetail } from "@/lib/datasources/types";
import { formatAge, formatPrice, formatUsdCompact } from "@/lib/format";
import { toggleWatch, useWatchlist } from "@/lib/store/watchlist";
import { ConvictionRing } from "@/components/terminal/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/terminal/score-breakdown";
import { RiskBadge, ChainBadge, SourceBadge } from "@/components/terminal/badges";
import { TickerNumber } from "@/components/terminal/ticker-number";
import { Delta } from "@/components/terminal/delta";
import { AddressChip } from "@/components/terminal/address-chip";
import { Sparkline } from "@/components/terminal/sparkline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINK_LABELS: Record<string, string> = {
  website: "Site",
  x: "X",
  telegram: "TG",
  explorer: "Explorer",
  dexscreener: "DexScreener",
};

export function TokenHeader({ token }: { token: TokenDetail }) {
  const watchlist = useWatchlist();
  const watched = watchlist.includes(token.id);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);

  return (
    <section className="panel animate-panel-in p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="num text-lg font-semibold text-ink">${token.symbol}</h1>
            <span className="truncate text-sm text-muted">{token.name}</span>
            <ChainBadge chain={token.chain} />
            <RiskBadge tier={token.riskTier} />
            <span className="num rounded-[3px] border border-edge-bright px-1.5 py-px text-[10px] uppercase tracking-wider text-muted">
              {token.narrative}
            </span>
            <span className="num text-[10px] text-muted">age {formatAge(token.createdAt)}</span>
            <SourceBadge source="market" className="ml-auto" />
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <TickerNumber
              value={token.priceUsd}
              format={formatPrice}
              className="text-3xl font-semibold text-ink"
            />
            <Delta value={token.change24h} className="text-base" />
            <span className="num text-xs text-muted">24h</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {(
              [
                ["MCap", token.marketCapUsd],
                ["Liquidity", token.liquidityUsd],
                ["Volume 24h", token.volume24hUsd],
              ] as const
            ).map(([label, value]) => (
              <span key={label} className="flex items-baseline gap-1.5">
                <span className="eyebrow !text-[9px]">{label}</span>
                <TickerNumber value={value} format={formatUsdCompact} className="text-xs text-ink" flash="none" />
              </span>
            ))}
            <span className="flex items-baseline gap-1.5">
              <span className="eyebrow !text-[9px]">Holders</span>
              <TickerNumber
                value={token.holders}
                format={(v) => v.toLocaleString("en-US")}
                className="text-xs text-ink"
                flash="signal"
              />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AddressChip address={token.address} chars={6} />
            {token.links.map((l) => (
              <a
                key={l.kind}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="num inline-flex items-center gap-1 rounded-[4px] border border-edge px-2 py-0.5 text-2xs text-muted transition-colors hover:border-edge-bright hover:text-ink"
              >
                {l.kind === "website" ? <Globe size={10} /> : <ExternalLink size={10} />}
                {LINK_LABELS[l.kind] ?? l.kind}
              </a>
            ))}
            <Button
              variant={watched ? "primary" : "default"}
              size="sm"
              onClick={() => toggleWatch(token.id)}
              className="ml-auto"
            >
              <Star size={12} className={cn(watched && "fill-signal")} />
              {watched ? "Watching" : "Watch"}
            </Button>
          </div>

          <p className="max-w-2xl text-2xs leading-4 text-muted">{token.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-5 md:flex-col md:items-end">
          <ConvictionRing
            score={token.score}
            size={120}
            interactive
            onSegmentClick={() => setBreakdownOpen(true)}
          />
          <div className="text-right">
            <div className="eyebrow mb-1 !text-[9px]">Score · 48 snapshots</div>
            <Sparkline values={token.scoreHistory} width={120} height={30} stroke="var(--signal)" />
          </div>
        </div>
      </div>

      <ScoreBreakdownDialog
        score={token.score}
        symbol={token.symbol}
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
      />
    </section>
  );
}
