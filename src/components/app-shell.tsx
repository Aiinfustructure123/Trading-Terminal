"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Eye,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Table2,
  Wallet,
} from "lucide-react";
import { useCommandPalette } from "@/components/command-palette";
import { AlertsTicker } from "@/components/alerts-ticker";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Screener", href: "/screener", icon: Table2 },
  { label: "Discovery", href: "/discovery", icon: Compass },
  { label: "Smart Money", href: "/smart-money", icon: Wallet },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "Style Guide", href: "/styleguide", icon: Sparkles },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Bell; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors lg:w-full",
        active ? "bg-panel-2 text-signal" : "text-muted hover:bg-panel-2 hover:text-ink",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "drop-shadow-[0_0_6px_rgb(var(--signal)/0.6)]")} />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const palette = useCommandPalette();

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-[60px] shrink-0 flex-col border-r border-edge bg-panel/60 px-2 py-3 lg:w-[208px]">
          <Link href="/" className="mb-5 flex items-center gap-2.5 px-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-signal/15 ring-1 ring-signal/40">
              <span className="h-2.5 w-2.5 rounded-full bg-signal shadow-signal-glow animate-pulse-soft" />
            </span>
            <span className="hidden flex-col leading-none lg:flex">
              <span className="font-display text-[13px] font-semibold tracking-[0.14em] text-ink">ALPHA</span>
              <span className="eyebrow mt-0.5 text-[9px]">Terminal</span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
              />
            ))}
          </nav>

          <Link
            href="/settings"
            title="Settings"
            className={cn(
              "mt-2 flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors",
              pathname.startsWith("/settings") ? "bg-panel-2 text-signal" : "text-muted hover:bg-panel-2 hover:text-ink",
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            <span className="hidden lg:inline">Settings</span>
          </Link>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-edge bg-panel/40 px-4 backdrop-blur-terminal">
            <button
              onClick={palette.toggle}
              className="group flex h-8 flex-1 max-w-md items-center gap-2.5 rounded border border-edge bg-bg px-3 text-left text-muted transition-colors hover:border-muted/40"
            >
              <Search className="h-4 w-4" />
              <span className="text-[13px]">Search tokens, screens, actions…</span>
              <kbd className="ml-auto flex items-center gap-0.5 rounded border border-edge bg-panel-2 px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded border border-edge bg-panel-2 px-2 py-1 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">Phase 0 · Sample</span>
              </span>
            </div>
          </header>

          {/* Content */}
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

          {/* Bottom edge ticker */}
          <AlertsTicker />
        </div>
      </div>
    </div>
  );
}
