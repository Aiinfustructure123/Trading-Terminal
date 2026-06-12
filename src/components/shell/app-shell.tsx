"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/format";
import { DATASOURCE_CONFIG } from "@/lib/datasources/config";
import { useWatchlist } from "@/lib/store/watchlist";
import { NAV_ITEMS, SECONDARY_NAV, SCREEN_TITLES, RadarIcon } from "./nav";
import { CommandPalette } from "./command-palette";

function FeedModeChip() {
  const modes = Object.values(DATASOURCE_CONFIG);
  const live = modes.filter((m) => m === "live").length;
  const label =
    live === 0 ? "SAMPLE FEED" : live === modes.length ? "LIVE FEED" : "MIXED FEED";
  const tone =
    live === 0
      ? "border-warn/35 text-warn/90"
      : live === modes.length
        ? "border-signal/40 text-signal"
        : "border-edge-bright text-muted";
  return (
    <span
      className={cn(
        "num hidden items-center gap-1.5 rounded-[3px] border px-2 py-0.5 text-[10px] tracking-[0.14em] sm:inline-flex",
        tone,
      )}
      title="Aggregate datasource mode. Each panel also carries its own badge."
    >
      <span className={cn("inline-block h-1 w-1 rounded-full", live > 0 ? "bg-signal pulse-dot" : "bg-warn/80")} />
      {label}
    </span>
  );
}

function UtcClock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    const tick = () => setNow(new Date());
    const start = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, []);
  return (
    <span className="num hidden w-[88px] text-right text-xs text-muted md:inline-block">
      {now ? `${formatClock(now)} UTC` : "—"}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const watchlist = useWatchlist();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const title = pathname.startsWith("/token/")
    ? "Token Case File"
    : (SCREEN_TITLES[pathname] ?? "ALPHA TERMINAL");

  return (
    <div className="flex min-h-dvh">
      {/* sidebar — desktop */}
      <aside className="sticky top-0 hidden h-dvh w-50 shrink-0 flex-col border-r border-edge bg-panel lg:flex">
        <Link
          href="/"
          className="flex h-12 items-center gap-2.5 border-b border-edge px-4"
        >
          <RadarIcon size={16} className="text-signal" />
          <span className="text-xs font-semibold tracking-[0.18em] text-ink">
            ALPHA<span className="text-signal">TERMINAL</span>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-xs transition-colors",
                  active
                    ? "bg-signal/[0.08] text-signal"
                    : "text-muted hover:bg-edge/50 hover:text-ink",
                )}
              >
                <item.icon size={14} />
                {item.label}
                {item.href === "/watchlist" && watchlist.length > 0 ? (
                  <span className="num ml-auto rounded-[3px] border border-edge-bright px-1 text-[10px] text-muted">
                    {watchlist.length}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-edge p-2">
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-xs transition-colors",
                pathname === item.href
                  ? "bg-signal/[0.08] text-signal"
                  : "text-muted hover:bg-edge/50 hover:text-ink",
              )}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
          <p className="num px-2.5 pb-1 pt-2 text-[10px] leading-4 text-muted/60">
            PHASE 0 · UI ON SAMPLE DATA
            <br />
            Analytical tooling, not financial advice.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b border-edge bg-bg/90 px-3 backdrop-blur-sm sm:px-4">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <RadarIcon size={15} className="text-signal" />
            <span className="text-2xs font-semibold tracking-[0.16em] text-ink">
              ALPHA<span className="text-signal">TERMINAL</span>
            </span>
          </Link>
          <h1 className="eyebrow hidden truncate lg:block">{title}</h1>
          <div className="ml-auto flex items-center gap-2.5">
            <FeedModeChip />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-7 cursor-pointer items-center gap-2 rounded-[4px] border border-edge bg-panel px-2.5 text-xs text-muted transition-colors hover:border-edge-bright hover:text-ink"
            >
              <Search size={12} />
              <span className="hidden sm:inline">Search tokens, screens…</span>
              <kbd className="num rounded-[3px] border border-edge-bright bg-panel-2 px-1 text-[10px]">
                ⌘K
              </kbd>
            </button>
            <UtcClock />
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</main>

        {/* bottom nav — mobile */}
        <nav
          aria-label="Primary mobile"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-edge bg-panel/95 backdrop-blur-sm lg:hidden"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-wider",
                  active ? "text-signal" : "text-muted",
                )}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
