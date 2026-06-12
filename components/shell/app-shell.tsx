"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Command,
  Compass,
  LayoutDashboard,
  Palette,
  Settings,
  Star,
  Table2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BreakdownModalProvider } from "@/components/conviction/breakdown-modal";
import { CommandPalette } from "./command-palette";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/screener", label: "Screener", icon: Table2 },
  { href: "/discovery", label: "Discovery", icon: Compass },
  { href: "/smart-money", label: "Smart Money", icon: Wallet },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/styleguide", label: "Styleguide", icon: Palette },
] as const;

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" }) + " UTC";
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden font-mono text-xs text-muted sm:block" data-numeric suppressHydrationWarning>
      {now ?? "··:··:·· UTC"}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <BreakdownModalProvider>
      <div className="flex min-h-dvh flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-panel-border bg-bg/95 px-3 backdrop-blur-sm sm:px-4">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="size-4 text-signal" aria-hidden />
            <span className="text-sm font-semibold tracking-[0.18em]">
              ALPHA<span className="text-signal">TERMINAL</span>
            </span>
          </Link>
          <span className="hidden rounded-sm border border-warn/30 bg-warn/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-warn/90 md:block">
            Phase 0 — Sample data
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Clock />
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-1.5 rounded border border-panel-border bg-panel px-2 py-1 text-xs text-muted transition-colors hover:border-signal/40 hover:text-ink"
            >
              <Command className="size-3" aria-hidden />
              <span className="hidden sm:inline">Search</span>
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar — icon rail on mobile, labels on desktop */}
          <nav
            aria-label="Primary"
            className="sticky top-12 z-30 flex h-[calc(100dvh-3rem)] w-12 shrink-0 flex-col gap-0.5 border-r border-panel-border bg-bg py-2 lg:w-44"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "mx-1.5 flex items-center gap-2.5 rounded px-2 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-signal/10 text-signal"
                      : "text-muted hover:bg-white/[0.04] hover:text-ink"
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
            <div className="mt-auto hidden px-3.5 pb-2 lg:block">
              <p className="text-[10px] leading-relaxed text-muted/70">
                Analytical tooling,
                <br />
                not financial advice.
              </p>
            </div>
          </nav>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </BreakdownModalProvider>
  );
}
