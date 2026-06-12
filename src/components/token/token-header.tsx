"use client";

import * as React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { TokenSummary } from "@/lib/datasources";
import { ConvictionRing } from "@/components/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/score-breakdown";
import { TokenLogo } from "@/components/token-logo";
import { RiskBadge } from "@/components/risk-badge";
import { DeltaValue } from "@/components/delta-value";
import { WatchButton } from "@/components/watch-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/panel";
import { formatPrice, shortenAddress } from "@/lib/format";

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-sm border border-edge bg-panel-2 px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:text-ink"
    >
      {shortenAddress(address, 6)}
      {copied ? <Check className="h-3 w-3 text-profit" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function TokenHeader({ token }: { token: TokenSummary }) {
  return (
    <div className="flex flex-col gap-5 border-b border-edge px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <ScoreBreakdownDialog
          token={token}
          trigger={
            <button aria-label="Open score breakdown" className="focus-visible:outline-none">
              <ConvictionRing score={token.conviction} size={92} interactive />
            </button>
          }
        />
        <div>
          <div className="flex items-center gap-2">
            <TokenLogo symbol={token.symbol} accent={token.accent} size={26} />
            <h1 className="font-display text-display font-semibold text-ink">{token.symbol}</h1>
            <RiskBadge tier={token.riskTier} />
          </div>
          <p className="mt-0.5 text-[13px] text-muted">{token.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{token.chain}</Badge>
            {token.narrative && <Badge variant="signal">{token.narrative}</Badge>}
            <CopyAddress address={token.address} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <Eyebrow>Price</Eyebrow>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tabular text-metric-lg font-semibold text-ink">{formatPrice(token.priceUsd)}</span>
            <DeltaValue value={token.deltas.h24} showArrow />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <WatchButton id={token.id} withLabel size={16} className="rounded border border-edge bg-panel-2 px-2.5 py-1.5" />
          <a
            href={`https://dexscreener.com/${token.chain}/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-edge bg-panel-2 px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
          >
            DexScreener <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
