"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { NAV } from "@/components/shell/nav";
import { useTokens } from "@/lib/hooks/use-data";
import { useWatchlist } from "@/lib/store/watchlist";
import { TokenAvatar } from "@/components/ui/token-bits";
import { fmtPrice, fmtPct, changeColor } from "@/lib/utils";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: tokens } = useTokens({ limit: 400 });
  const { toggle } = useWatchlist();

  const results = useMemo(() => {
    if (!tokens) return [];
    if (!search) return tokens.slice(0, 8);
    const q = search.toLowerCase();
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)).slice(0, 12);
  }, [tokens, search]);

  const go = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <Command
        className="glass animate-panel-in w-full max-w-xl overflow-hidden rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        loop
        shouldFilter={false}
      >
        <div className="flex items-center gap-2.5 border-b border-border-strong px-4">
          <Search className="size-4 text-muted" />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Search tokens, jump to a screen, run an action…"
            className="h-12 flex-1 bg-transparent font-display text-sm text-ink outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>
        <Command.List className="max-h-[52vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">No matches.</Command.Empty>

          <Command.Group heading="Tokens" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {results.map((t) => (
              <Command.Item
                key={t.address}
                value={`token-${t.address}`}
                onSelect={() => go(`/token/${t.address}`)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink data-[selected=true]:bg-signal/10 data-[selected=true]:text-signal"
              >
                <TokenAvatar symbol={t.symbol} accent={t.accent} size={22} />
                <span className="font-mono font-semibold">{t.symbol}</span>
                <span className="truncate text-xs text-muted">{t.name}</span>
                <span className="ml-auto font-mono text-xs tabular-nums text-muted">{fmtPrice(t.priceUsd)}</span>
                <span className={`font-mono text-xs tabular-nums ${changeColor(t.change24h)}`}>{fmtPct(t.change24h)}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {!search && (
            <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <Command.Item
                    key={n.href}
                    value={`nav-${n.label}`}
                    onSelect={() => go(n.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink data-[selected=true]:bg-signal/10 data-[selected=true]:text-signal"
                  >
                    <Icon className="size-4 text-muted" />
                    {n.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {results.length > 0 && (
            <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Command.Item
                value="action-watch"
                onSelect={() => {
                  toggle(results[0].address);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink data-[selected=true]:bg-signal/10 data-[selected=true]:text-signal"
              >
                <CornerDownLeft className="size-4 text-muted" />
                Add {results[0].symbol} to watchlist
              </Command.Item>
              <Command.Item
                value="action-brief"
                onSelect={() => go(`/token/${results[0].address}#brief`)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink data-[selected=true]:bg-signal/10 data-[selected=true]:text-signal"
              >
                <CornerDownLeft className="size-4 text-muted" />
                Generate AI brief for {results[0].symbol}
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
