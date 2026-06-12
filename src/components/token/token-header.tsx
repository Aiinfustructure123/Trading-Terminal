"use client";

import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import type { TokenDetail } from "@/lib/datasources/types";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { ScoreBreakdown } from "@/components/score/score-breakdown";
import { Modal } from "@/components/ui/modal";
import { RiskBadge, TokenAvatar, ChainTag, CopyButton, TickerNumber } from "@/components/ui/token-bits";
import { Eyebrow } from "@/components/ui/primitives";
import { useWatchlist } from "@/lib/store/watchlist";
import { fmtPrice, fmtPct, fmtUsd, fmtAge, shortAddr, changeColor, cn } from "@/lib/utils";

export function TokenHeader({ token }: { token: TokenDetail }) {
  const { has, toggle } = useWatchlist();
  const watched = has(token.address);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <section className="panel animate-panel-in">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <TokenAvatar symbol={token.symbol} accent={token.accent} size={52} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink">{token.symbol}</h1>
              <ChainTag chain={token.chain} />
              <RiskBadge tier={token.riskTier} />
            </div>
            <div className="text-sm text-muted">{token.name}</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">{shortAddr(token.address, 6, 6)}</span>
              <CopyButton text={token.address} label="Copy" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <Eyebrow>Price</Eyebrow>
            <TickerNumber value={token.priceUsd} format={fmtPrice} className="text-2xl text-ink" />
            <div className="flex flex-wrap gap-2 font-mono text-[11px] tabular-nums">
              <span className={changeColor(token.change5m)}>5m {fmtPct(token.change5m)}</span>
              <span className={changeColor(token.change1h)}>1h {fmtPct(token.change1h)}</span>
              <span className={changeColor(token.change6h)}>6h {fmtPct(token.change6h)}</span>
              <span className={changeColor(token.change24h)}>24h {fmtPct(token.change24h)}</span>
            </div>
          </div>

          <button onClick={() => setShowBreakdown(true)} className="shrink-0 rounded-full transition-transform hover:scale-105" aria-label="Open score breakdown">
            <ConvictionRing score={token.conviction} size={96} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-2.5">
        <Stat label="Market Cap" value={fmtUsd(token.marketCap)} />
        <Stat label="FDV" value={fmtUsd(token.fdv)} />
        <Stat label="Liquidity" value={fmtUsd(token.liquidityUsd)} />
        <Stat label="Volume 24h" value={fmtUsd(token.volume24h)} />
        <Stat label="Holders" value={token.holders.toLocaleString()} />
        <Stat label="Age" value={fmtAge(token.ageHours)} />
        <Stat label="Buys/Sells" value={<span><span className="text-profit">{token.buys24h}</span>/<span className="text-danger">{token.sells24h}</span></span>} />

        <div className="ml-auto flex items-center gap-2">
          {token.links.map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded border border-border px-2 py-1 font-mono text-[10px] text-muted hover:border-signal/40 hover:text-signal">
              {l.label} <ExternalLink className="size-2.5" />
            </a>
          ))}
          <button
            onClick={() => toggle(token.address)}
            className={cn("flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-colors", watched ? "border-signal/40 text-signal" : "border-border text-muted hover:text-ink")}
          >
            <Star className={cn("size-3.5", watched && "fill-signal")} /> {watched ? "Watching" : "Watch"}
          </button>
        </div>
      </div>

      <Modal open={showBreakdown} onClose={() => setShowBreakdown(false)} title={`${token.symbol} — Score Breakdown`}>
        <ScoreBreakdown score={token.conviction} ringSize={110} />
      </Modal>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Eyebrow>{label}</Eyebrow>
      <span className="font-mono text-xs tabular-nums text-ink">{value}</span>
    </div>
  );
}
