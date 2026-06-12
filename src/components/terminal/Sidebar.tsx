"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Filter, Compass, Wallet2, Bell,
  BookMarked, Settings, Zap, Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/screener",    label: "Screener",    icon: Filter },
  { href: "/discovery",   label: "Discovery",   icon: Compass },
  { href: "/smart-money", label: "Smart Money", icon: Wallet2 },
  { href: "/alerts",      label: "Alerts",      icon: Bell },
  { href: "/watchlist",   label: "Watchlist",   icon: BookMarked },
] as const;

interface SidebarProps {
  onCommandOpen: () => void;
}

export function Sidebar({ onCommandOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-14 lg:w-52 h-full bg-panel border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 lg:px-4 h-12 border-b border-border flex-shrink-0">
        <div className="w-7 h-7 rounded bg-signal/10 border border-signal/40 flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-signal" />
        </div>
        <span className="hidden lg:block text-sm font-semibold tracking-tight text-ink">
          ALPHA<span className="text-signal">TERMINAL</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 lg:px-4 py-2.5 mx-1.5 rounded transition-all duration-100 group focus-ring",
                active
                  ? "bg-signal/10 text-signal border border-signal/20"
                  : "text-muted hover:bg-border/50 hover:text-ink border border-transparent"
              )}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{label}</span>
              {active && (
                <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-signal" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border py-3 space-y-0.5">
        {/* Command palette trigger */}
        <button
          onClick={onCommandOpen}
          className="flex items-center gap-3 px-3 lg:px-4 py-2.5 mx-1.5 rounded w-[calc(100%-12px)]
                     text-muted hover:bg-border/50 hover:text-ink transition-colors focus-ring"
        >
          <Command size={15} className="flex-shrink-0" />
          <span className="hidden lg:flex flex-1 items-center justify-between text-sm">
            <span>Search</span>
            <kbd className="text-2xs border border-border rounded px-1.5 py-0.5">⌘K</kbd>
          </span>
        </button>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 lg:px-4 py-2.5 mx-1.5 rounded transition-colors focus-ring",
            usePathname().startsWith("/settings")
              ? "bg-signal/10 text-signal border border-signal/20"
              : "text-muted hover:bg-border/50 hover:text-ink border border-transparent"
          )}
        >
          <Settings size={15} className="flex-shrink-0" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
