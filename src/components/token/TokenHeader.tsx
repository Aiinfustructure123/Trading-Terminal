"use client";

import React, { useState } from "react";
import type { Token } from "@/lib/datasources/types";
import { ConvictionRing } from "@/components/ui/ConvictionRing";
import { RiskBadge, ChainBadge, DataModeBadge } from "@/components/ui/DataBadge";
import { fmtPrice, fmtPct, fmtUsd, truncateAddress, cn } from "@/lib/utils";
import { Copy, ExternalLink, Star, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ScoreComponent } from "@/lib/datasources/types";

interface Props {
  token: Token;
  onSegmentClick?: (c: ScoreComponent) => void;
  watchlisted: boolean;
  onToggleWatch: () => void;
}

export function TokenHeader({ token, onSegmentClick, watchlisted, onToggleWatch }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyAddr = () => {
    navigator.clipboard.writeText(token.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  return (
    <div className="bg-panel border-b border-border px-6 py-4">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="text-muted hover:text-ink transition-colors flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <span className="text-muted">/</span>
        <span className="text-xs text-muted">Token Detail</span>
        <span className="text-muted">/</span>
        <span className="text-xs text-ink font-medium">{token.symbol}</span>
      </div>

      <div className="flex items-start gap-6 flex-wrap">
        {/* Conviction Ring */}
        <ConvictionRing
          score={token.score}
          size={120}
          showLabel
          onSegmentClick={onSegmentClick}
        />

        {/* Identity + price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-ink">{token.symbol}</h1>
            <span className="text-lg text-muted">{token.name}</span>
            <ChainBadge chain={token.chain} />
            <RiskBadge tier={token.score.riskTier} />
            <DataModeBadge mode="sample" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap mb-3">
            <span className="num text-3xl font-semibold text-ink">{fmtPrice(token.price)}</span>
            <span className={cn("num text-lg font-medium", token.priceChange24h >= 0 ? "text-profit" : "text-danger")}>
              {fmtPct(token.priceChange24h)} 24h
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 flex-wrap">
            {[
              { label: "MCAP",    value: fmtUsd(token.marketCap) },
              { label: "FDV",     value: token.fdv ? fmtUsd(token.fdv) : "—" },
              { label: "VOLUME",  value: fmtUsd(token.volume24h) },
              { label: "LIQ",     value: fmtUsd(token.liquidity) },
              { label: "HOLDERS", value: token.holderCount.toLocaleString() },
            ].map(s => (
              <div key={s.label}>
                <div className="label-eyebrow">{s.label}</div>
                <div className="num text-sm text-ink font-medium">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-end">
          <button
            onClick={onToggleWatch}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium transition-all",
              watchlisted
                ? "bg-signal/10 border-signal/40 text-signal"
                : "bg-border/40 border-border text-muted hover:text-signal hover:border-signal/30"
            )}
          >
            <Star size={14} fill={watchlisted ? "currentColor" : "none"} />
            {watchlisted ? "Watching" : "Add to Watchlist"}
          </button>

          {token.dexUrl && (
            <a
              href={token.dexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-signal transition-colors"
            >
              DexScreener <ExternalLink size={11} />
            </a>
          )}

          {/* Contract address */}
          <button
            onClick={copyAddr}
            className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink transition-colors"
          >
            <span>{truncateAddress(token.address)}</span>
            <Copy size={11} className={copied ? "text-signal" : ""} />
            {copied && <span className="text-signal">copied!</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
