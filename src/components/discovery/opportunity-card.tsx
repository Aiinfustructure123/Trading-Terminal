"use client";

import Link from "next/link";
import type { TokenSummary } from "@/lib/datasources";
import { ConvictionRing } from "@/components/conviction-ring";
import { ScoreBreakdownDialog } from "@/components/score-breakdown";
import { TokenLogo } from "@/components/token-logo";
import { RiskBadge } from "@/components/risk-badge";
import { DeltaValue } from "@/components/delta-value";
import { WatchButton } from "@/components/watch-button";
import { Eyebrow } from "@/components/panel";
import { formatCompact, formatPrice } from "@/lib/format";

export function OpportunityCard({ token }: { token: TokenSummary }) {
  const drivers = [...token.conviction.components].sort((a, b) => b.score * b.weight - a.score * a.weight).slice(0, 3);

  return (
    <div className="group relative flex flex-col gap-3 rounded-md border border-edge bg-panel p-4 transition-colors hover:border-signal/30">
      <WatchButton id={token.id} className="absolute right-3 top-3" />
      <div className="flex items-center gap-3">
        <ScoreBreakdownDialog
          token={token}
          trigger={
            <button aria-label="Score breakdown" className="focus-visible:outline-none">
              <ConvictionRing score={token.conviction} size={56} interactive />
            </button>
          }
        />
        <Link href={`/token/${token.id}`} className="min-w-0">
          <div className="flex items-center gap-2">
            <TokenLogo symbol={token.symbol} accent={token.accent} size={20} />
            <span className="truncate font-mono text-[14px] font-semibold text-ink">{token.symbol}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[12px]">
            <span className="tabular text-ink">{formatPrice(token.priceUsd)}</span>
            <DeltaValue value={token.deltas.h24} />
          </div>
          <p className="eyebrow mt-1">${formatCompact(token.marketCapUsd)} mcap</p>
        </Link>
      </div>

      <div className="border-t border-edge/60 pt-2.5">
        <Eyebrow>Why it ranks</Eyebrow>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {drivers.map((d) => (
            <li key={d.key} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[11px] text-muted">{d.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full bg-signal/70" style={{ width: `${d.score}%` }} />
              </div>
              <span className="tabular w-7 shrink-0 text-right text-[11px] text-ink">{d.score}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <RiskBadge tier={token.riskTier} />
        <Link href={`/token/${token.id}`} className="text-[12px] text-signal hover:underline">
          Open case file →
        </Link>
      </div>
    </div>
  );
}
