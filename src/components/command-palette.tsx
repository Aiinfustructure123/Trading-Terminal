"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Activity,
  Bell,
  Compass,
  Eye,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Sparkles,
  Table2,
  Wallet,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTokens } from "@/lib/queries";
import { useWatchlist } from "@/lib/watchlist";
import { formatPrice } from "@/lib/format";
import { ConvictionRing } from "@/components/conviction-ring";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const Ctx = React.createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

const SCREENS = [
  { label: "Master Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Token Screener", href: "/screener", icon: Table2 },
  { label: "Discovery", href: "/discovery", icon: Compass },
  { label: "Smart Money", href: "/smart-money", icon: Wallet },
  { label: "Alerts Center", href: "/alerts", icon: Bell },
  { label: "Watchlist", href: "/watchlist", icon: Eye },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Style Guide", href: "/styleguide", icon: Sparkles },
];

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const { data: tokens } = useTokens();
  const watchlist = useWatchlist();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const value = React.useMemo<CommandPaletteContextValue>(
    () => ({ open, setOpen, toggle: () => setOpen((o) => !o) }),
    [open],
  );

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const matchedTokens = React.useMemo(() => (tokens ?? []).slice(0, 80), [tokens]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose className="max-w-xl gap-0 overflow-hidden p-0">
          <Command
            loop
            className="flex max-h-[60vh] flex-col"
            filter={(itemValue, query) =>
              itemValue.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
            }
          >
            <div className="flex items-center gap-2 border-b border-edge px-4">
              <Search className="h-4 w-4 text-muted" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Jump to a token, screen, or run an action…"
                className="h-12 w-full bg-transparent font-mono text-[13px] text-ink outline-none placeholder:text-muted"
              />
              <kbd className="hidden rounded border border-edge bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
                ESC
              </kbd>
            </div>
            <Command.List className="flex-1 overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted">
                No matches found.
              </Command.Empty>

              <Command.Group
                heading="Screens"
                className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {SCREENS.map((s) => (
                  <Command.Item
                    key={s.href}
                    value={`screen ${s.label}`}
                    onSelect={() => go(s.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-ink data-[selected=true]:bg-panel-2 data-[selected=true]:text-signal"
                  >
                    <s.icon className="h-4 w-4 text-muted" />
                    {s.label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading="Tokens"
                className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {matchedTokens.map((t) => (
                  <Command.Item
                    key={t.id}
                    value={`token ${t.symbol} ${t.name}`}
                    onSelect={() => go(`/token/${t.id}`)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-ink data-[selected=true]:bg-panel-2"
                  >
                    <ConvictionRing score={t.conviction} size={22} showValue={false} />
                    <span className="font-mono font-semibold">{t.symbol}</span>
                    <span className="truncate text-muted">{t.name}</span>
                    <span className="tabular ml-auto text-[12px] text-muted">{formatPrice(t.priceUsd)}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {matchedTokens[0] && (
                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                >
                  <Command.Item
                    value={`action add ${matchedTokens[0].symbol} watchlist`}
                    onSelect={() => {
                      watchlist.add(matchedTokens[0]!.id);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-ink data-[selected=true]:bg-panel-2 data-[selected=true]:text-signal"
                  >
                    <Plus className="h-4 w-4 text-muted" />
                    Add {matchedTokens[0].symbol} to watchlist
                  </Command.Item>
                  <Command.Item
                    value={`action generate brief ${matchedTokens[0].symbol}`}
                    onSelect={() => go(`/token/${matchedTokens[0]!.id}#brief`)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-ink data-[selected=true]:bg-panel-2 data-[selected=true]:text-signal"
                  >
                    <Activity className="h-4 w-4 text-muted" />
                    Generate AI brief for {matchedTokens[0].symbol}
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}
