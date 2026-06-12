"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Star } from "lucide-react";
import { useToken } from "@/lib/hooks/queries";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge, ChainBadge } from "@/components/ui/badge";
import { TickNumber } from "@/components/ui/tick-number";
import { ConvictionRing } from "@/components/conviction/ring";
import { ScoreBreakdown } from "@/components/conviction/breakdown";
import { PriceChart } from "@/components/token/price-chart";
import { ForensicsPanel } from "@/components/token/forensics-panel";
import { HoldersPanel } from "@/components/token/holders-panel";
import { ScenariosPanel } from "@/components/token/scenarios-panel";
import { BriefPanel } from "@/components/token/brief-panel";
import { formatAge, formatPct, formatUsd, shortAddress, deltaColor } from "@/lib/format";
import { cn } from "@/lib/utils";

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded border border-panel-border bg-panel px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:text-ink"
      aria-label="Copy contract address"
    >
      {shortAddress(address, 5)}
      {copied ? <Check className="size-3 text-profit" aria-hidden /> : <Copy className="size-3" aria-hidden />}
    </button>
  );
}

export default function TokenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: token, isLoading } = useToken(id);
  const { has, toggle } = useWatchlist();

  if (isLoading && !token) {
    return (
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <p className="text-sm text-muted">Token not found in the current universe.</p>
        <Link href="/screener" className="text-sm text-signal hover:underline">
          Back to screener
        </Link>
      </div>
    );
  }

  const watched = has(token.id);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      {/* ── Case-file header ──────────────────────────────────────────── */}
      <Panel className="live-edge" bodyClassName="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{token.symbol}</h1>
            <span className="truncate text-sm text-muted">{token.name}</span>
            <ChainBadge chain={token.chain} />
            <RiskBadge tier={token.riskTier} />
            <button
              onClick={() => toggle(token.id)}
              aria-pressed={watched}
              className={cn(
                "flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                watched
                  ? "border-warn/40 bg-warn/10 text-warn"
                  : "border-panel-border text-muted hover:text-ink"
              )}
            >
              <Star className={cn("size-3.5", watched && "fill-warn")} aria-hidden />
              {watched ? "Watching" : "Watch"}
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <TickNumber value={token.priceUsd} format={(v) => formatUsd(v)} className="text-3xl font-semibold" />
            {(
              [
                ["5m", token.change5m],
                ["1h", token.change1h],
                ["6h", token.change6h],
                ["24h", token.change24h],
              ] as const
            ).map(([label, chg]) => (
              <span key={label} className="flex items-baseline gap-1">
                <span className="eyebrow">{label}</span>
                <span className={cn("font-mono text-sm", deltaColor(chg))} data-numeric>
                  {formatPct(chg)}
                </span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyAddress address={token.address} />
            {(
              [
                ["Explorer", token.links.explorer],
                ["DexScreener", token.links.dexscreener],
                ...(token.links.twitter ? ([["Twitter", token.links.twitter]] as const) : []),
                ...(token.links.website ? ([["Website", token.links.website]] as const) : []),
              ] as ReadonlyArray<readonly [string, string]>
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded border border-panel-border px-2 py-1 text-[11px] text-muted transition-colors hover:border-signal/40 hover:text-signal"
              >
                {label}
                <ExternalLink className="size-2.5" aria-hidden />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {(
              [
                ["MCap", formatUsd(token.marketCap, { compact: true })],
                ["FDV", formatUsd(token.fdv, { compact: true })],
                ["Liquidity", formatUsd(token.liquidityUsd, { compact: true })],
                ["24h Vol", formatUsd(token.volume24h, { compact: true })],
                ["Age", formatAge(token.ageHours)],
                ["B/S 24h", `${token.txns24h.buys.toLocaleString()}/${token.txns24h.sells.toLocaleString()}`],
              ] as const
            ).map(([label, value]) => (
              <span key={label} className="flex items-baseline gap-1.5">
                <span className="eyebrow">{label}</span>
                <span className="font-mono text-[13px]" data-numeric>
                  {value}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 self-center">
          <ConvictionRing score={token.conviction} size={120} />
          <span className="eyebrow">Conviction</span>
        </div>
      </Panel>

      {/* ── Chart ─────────────────────────────────────────────────────── */}
      <Panel title="Price" source="market" className="h-[420px]" bodyClassName="h-full">
        <PriceChart tokenId={token.id} />
      </Panel>

      {/* ── Score breakdown ───────────────────────────────────────────── */}
      <Panel title="Score breakdown" source="market" bodyClassName="p-4">
        <ScoreBreakdown score={token.conviction} />
      </Panel>

      {/* ── Forensics + Holders ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ForensicsPanel tokenId={token.id} />
        <HoldersPanel tokenId={token.id} />
      </div>

      {/* ── Scenarios ─────────────────────────────────────────────────── */}
      <ScenariosPanel tokenId={token.id} />

      {/* ── AI brief ──────────────────────────────────────────────────── */}
      <div id="brief">
        <BriefPanel tokenId={token.id} />
      </div>
    </div>
  );
}
