"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Command } from "cmdk";
import {
  Bell,
  Compass,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Star,
  StarOff,
  Table2,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMarketSource } from "@/lib/datasources";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { formatUsd, formatPct, deltaColor } from "@/lib/format";
import { ConvictionRing } from "@/components/conviction/ring";
import { cn } from "@/lib/utils";

/**
 * ⌘K command palette — jump to any token or screen, run actions.
 * Glass surface (allowed: it's an overlay), fast fuzzy token search.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { ids: watchlist, toggle } = useWatchlist();

  const close = () => {
    onOpenChange(false);
    setSearch("");
  };

  const { data: tokens } = useQuery({
    queryKey: ["palette-search", search],
    queryFn: () =>
      getMarketSource().screenTokens({
        filter: { search },
        sort: { key: "conviction", dir: "desc" },
        limit: 8,
      }),
    enabled: open,
    placeholderData: (prev) => prev,
  });

  const go = (href: string) => {
    close();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
      onClick={close}
    >
      <Command
        label="Command palette"
        shouldFilter={false}
        className="glass w-full max-w-xl overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <div className="flex items-center gap-2 border-b border-panel-border px-3">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Search tokens, jump to screens, run actions…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-panel-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[55vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            No results.
          </Command.Empty>

          {tokens && tokens.length > 0 && (
            <Command.Group
              heading="Tokens"
              className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {tokens.map((t) => {
                const watched = watchlist.includes(t.id);
                return (
                  <Command.Item
                    key={t.id}
                    value={`token-${t.id}`}
                    onSelect={() => go(`/token/${t.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm data-[selected=true]:bg-signal/10"
                  >
                    <ConvictionRing score={t.conviction} size={20} />
                    <span className="font-medium">{t.symbol}</span>
                    <span className="truncate text-xs text-muted">{t.name}</span>
                    <span className="ml-auto font-mono text-xs" data-numeric>
                      {formatUsd(t.priceUsd)}
                    </span>
                    <span className={cn("font-mono text-xs", deltaColor(t.change24h))} data-numeric>
                      {formatPct(t.change24h)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(t.id);
                      }}
                      aria-label={watched ? `Remove ${t.symbol} from watchlist` : `Add ${t.symbol} to watchlist`}
                      className="rounded p-1 text-muted hover:text-warn"
                    >
                      {watched ? (
                        <Star className="size-3.5 fill-warn text-warn" />
                      ) : (
                        <StarOff className="size-3.5" />
                      )}
                    </button>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          <Command.Group
            heading="Screens"
            className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {(
              [
                ["/", "Dashboard", LayoutDashboard],
                ["/screener", "Token Screener", Table2],
                ["/discovery", "Discovery", Compass],
                ["/smart-money", "Smart Money", Wallet],
                ["/alerts", "Alerts Center", Bell],
                ["/watchlist", "Watchlist", Star],
                ["/settings", "Settings", Settings],
                ["/styleguide", "Styleguide", FileText],
              ] as const
            )
              .filter(([, label]) => !search || label.toLowerCase().includes(search.toLowerCase()))
              .map(([href, label, Icon]) => (
                <Command.Item
                  key={href}
                  value={`screen-${href}`}
                  onSelect={() => go(href)}
                  className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm data-[selected=true]:bg-signal/10"
                >
                  <Icon className="size-4 text-muted" aria-hidden />
                  {label}
                </Command.Item>
              ))}
          </Command.Group>

          {tokens && tokens.length > 0 && (
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              <Command.Item
                value="action-watch-top"
                onSelect={() => {
                  toggle(tokens[0].id);
                  close();
                }}
                className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm data-[selected=true]:bg-signal/10"
              >
                <Star className="size-4 text-muted" aria-hidden />
                {watchlist.includes(tokens[0].id) ? "Remove" : "Add"} {tokens[0].symbol}{" "}
                {watchlist.includes(tokens[0].id) ? "from" : "to"} watchlist
              </Command.Item>
              <Command.Item
                value="action-brief-top"
                onSelect={() => go(`/token/${tokens[0].id}#brief`)}
                className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 text-sm data-[selected=true]:bg-signal/10"
              >
                <FileText className="size-4 text-muted" aria-hidden />
                Generate research brief for {tokens[0].symbol}
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
