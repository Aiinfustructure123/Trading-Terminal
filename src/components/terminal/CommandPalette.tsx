"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, Eye, Bell, BookOpen, TrendingUp, Wallet, Settings, X } from "lucide-react";
import { SAMPLE_TOKENS } from "@/lib/datasources/sample/tokens";
import { cn, truncateAddress } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard",    path: "/dashboard",    icon: <Zap size={14} /> },
  { label: "Screener",     path: "/screener",     icon: <TrendingUp size={14} /> },
  { label: "Discovery",    path: "/discovery",    icon: <Eye size={14} /> },
  { label: "Smart Money",  path: "/smart-money",  icon: <Wallet size={14} /> },
  { label: "Alerts",       path: "/alerts",       icon: <Bell size={14} /> },
  { label: "Watchlist",    path: "/watchlist",    icon: <BookOpen size={14} /> },
  { label: "Settings",     path: "/settings",     icon: <Settings size={14} /> },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navItems: CommandItem[] = NAV_ITEMS.map(item => ({
    id: item.path,
    label: `Go to ${item.label}`,
    icon: item.icon,
    group: "Navigation",
    action: () => { router.push(item.path); onClose(); },
  }));

  const tokenItems: CommandItem[] = (query.length >= 1
    ? SAMPLE_TOKENS.filter(t =>
        t.symbol.toLowerCase().includes(query.toLowerCase()) ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.address.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, 6)
    : SAMPLE_TOKENS.slice(0, 6)
  ).map(t => ({
    id: t.address,
    label: t.symbol,
    description: `${t.name} · ${truncateAddress(t.address)}`,
    icon: <span className="text-signal font-mono text-xs">TKN</span>,
    group: "Tokens",
    action: () => { router.push(`/token/${t.address}`); onClose(); },
  }));

  const allItems = query.length === 0
    ? [...navItems, ...tokenItems]
    : [...tokenItems, ...navItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))];

  const groups = allItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  const flatItems = Object.values(groups).flat();

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => (s + 1) % flatItems.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => (s - 1 + flatItems.length) % flatItems.length);
    }
    if (e.key === "Enter" && flatItems[selected]) {
      flatItems[selected].action();
    }
  }, [open, flatItems, selected, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open) return null;

  let idx = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl glass rounded-xl shadow-2xl overflow-hidden animate-fade-slide-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tokens, navigate, run actions..."
            className="flex-1 bg-transparent text-ink text-sm outline-none placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted hover:text-ink">
              <X size={14} />
            </button>
          )}
          <kbd className="text-2xs text-muted border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 py-1.5 label-eyebrow">{group}</div>
              {items.map(item => {
                idx++;
                const isSelected = idx === selected;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isSelected ? "bg-signal/10 text-signal" : "text-ink hover:bg-border/40"
                    )}
                  >
                    <span className={cn("flex-shrink-0", isSelected ? "text-signal" : "text-muted")}>
                      {item.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.description && (
                        <span className="block text-xs text-muted truncate">{item.description}</span>
                      )}
                    </span>
                    {isSelected && (
                      <kbd className="text-2xs text-muted border border-border rounded px-1.5 py-0.5">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center text-muted text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex gap-4 text-2xs text-muted">
          <span><kbd className="border border-border rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="border border-border rounded px-1">↵</kbd> select</span>
          <span><kbd className="border border-border rounded px-1">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
