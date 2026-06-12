"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { NAV } from "@/components/shell/nav";
import { useMarketPulse } from "@/lib/hooks/use-data";
import { fmtUsd, fmtPct, changeColor, cn } from "@/lib/utils";
import { useState } from "react";

function MiniStat({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="hidden items-baseline gap-1.5 lg:flex">
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-xs tabular-nums text-ink">{value}</span>
      {change !== undefined && <span className={cn("font-mono text-[10px] tabular-nums", changeColor(change))}>{fmtPct(change)}</span>}
    </div>
  );
}

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname();
  const { data } = useMarketPulse();
  const [mobileNav, setMobileNav] = useState(false);
  const current = NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));

  return (
    <header className="relative flex h-12 shrink-0 items-center gap-3 border-b border-border bg-panel px-3">
      <button className="text-muted md:hidden" onClick={() => setMobileNav((v) => !v)} aria-label="Menu">
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <span className="font-display text-sm font-semibold text-signal">ALPHA</span>
      </div>

      <div className="hidden items-center gap-1.5 md:flex">
        <span className="font-display text-sm font-medium text-ink">{current?.label ?? "Terminal"}</span>
      </div>

      <div className="mx-2 hidden h-5 w-px bg-border md:block" />

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
        {data ? (
          <>
            <MiniStat label="MCAP" value={fmtUsd(data.totalMarketCap)} change={data.mcapChange24h} />
            <MiniStat label="VOL 24H" value={fmtUsd(data.totalVolume24h)} change={data.volChange24h} />
            <MiniStat label="BTC.D" value={`${data.btcDominance.toFixed(1)}%`} change={data.btcDominanceChange24h} />
            <MiniStat label="F&G" value={`${data.fearGreed} ${data.fearGreedLabel}`} />
          </>
        ) : (
          <span className="font-mono text-[11px] text-muted">loading market…</span>
        )}
      </div>

      <button
        onClick={onOpenPalette}
        className="ml-auto flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-1.5 text-muted transition-colors hover:border-signal/40 hover:text-ink"
      >
        <Search className="size-3.5" />
        <span className="hidden font-display text-xs sm:inline">Search…</span>
        <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[9px]">⌘K</kbd>
      </button>

      {mobileNav && (
        <div className="absolute left-0 top-12 z-50 w-full border-b border-border bg-panel p-2 shadow-xl md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileNav(false)}
                  className={cn("flex items-center gap-2 rounded-md px-3 py-2.5 text-sm", active ? "bg-signal/10 text-signal" : "text-muted")}
                >
                  <Icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
