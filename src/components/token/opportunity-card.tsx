"use client";

import Link from "next/link";
import type { TokenSummary } from "@/lib/datasources/types";
import { ConvictionRing, COMPONENT_COLORS } from "@/components/ui/conviction-ring";
import { RiskBadge, TokenAvatar, ChainTag } from "@/components/ui/token-bits";
import { fmtPrice, fmtPct, fmtUsd, fmtAge, changeColor } from "@/lib/utils";

export function OpportunityCard({ token, showDrivers = true }: { token: TokenSummary; showDrivers?: boolean }) {
  const drivers = [...token.conviction.components].sort((a, b) => b.subScore - a.subScore).slice(0, 3);
  return (
    <Link
      href={`/token/${token.address}`}
      className="group flex flex-col gap-3 rounded-md border border-border bg-panel-2/40 p-3 transition-colors hover:border-signal/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TokenAvatar symbol={token.symbol} accent={token.accent} size={32} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-ink">{token.symbol}</span>
              <ChainTag chain={token.chain} />
            </div>
            <div className="truncate text-[11px] text-muted">{token.name}</div>
          </div>
        </div>
        <ConvictionRing score={token.conviction} size={44} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-base tabular-nums text-ink">{fmtPrice(token.priceUsd)}</div>
          <div className={`font-mono text-xs tabular-nums ${changeColor(token.change24h)}`}>{fmtPct(token.change24h)} 24h</div>
        </div>
        <RiskBadge tier={token.riskTier} />
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2 font-mono text-[10px] tabular-nums">
        <div><div className="eyebrow" style={{ fontSize: 8 }}>MCAP</div><div className="text-ink">{fmtUsd(token.marketCap)}</div></div>
        <div><div className="eyebrow" style={{ fontSize: 8 }}>LIQ</div><div className="text-ink">{fmtUsd(token.liquidityUsd)}</div></div>
        <div><div className="eyebrow" style={{ fontSize: 8 }}>AGE</div><div className="text-ink">{fmtAge(token.ageHours)}</div></div>
      </div>

      {showDrivers && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
          {drivers.map((d) => (
            <span key={d.key} className="inline-flex items-center gap-1 rounded bg-bg px-1.5 py-0.5 font-mono text-[9px] text-muted">
              <span className="size-1.5 rounded-full" style={{ background: COMPONENT_COLORS[d.key] }} />
              {d.label} {d.subScore}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
