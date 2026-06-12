"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Search,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { marketSource } from "@/lib/datasources";
import { TokenSummary } from "@/lib/datasources/types";
import { formatPrice, formatUsdCompact } from "@/lib/format";
import { isWatched, toggleWatch, useWatchlist } from "@/lib/store/watchlist";
import { ConvictionRing } from "@/components/terminal/conviction-ring";
import { RiskBadge } from "@/components/terminal/badges";
import { Delta } from "@/components/terminal/delta";
import { NAV_ITEMS, SECONDARY_NAV } from "./nav";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="glass fixed left-1/2 top-[12vh] z-50 w-[min(94vw,620px)] -translate-x-1/2 overflow-hidden rounded-lg shadow-2xl animate-panel-in"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          {/* state lives here so it resets naturally when the dialog unmounts */}
          <PaletteSurface onOpenChange={onOpenChange} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function PaletteSurface({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState<TokenSummary | null>(null);
  useWatchlist(); // re-render watch state inside the palette

  const { data: tokens } = useQuery({
    queryKey: ["palette-search", search],
    queryFn: () =>
      marketSource.listTokens({
        filter: { search },
        sort: { key: "volume24hUsd", dir: "desc" },
        limit: 8,
      }),
    enabled: search.trim().length > 0 && !selectedToken,
    placeholderData: (prev) => prev,
  });

  function close() {
    onOpenChange(false);
  }

  function go(href: string) {
    router.push(href);
    close();
  }

  return (
    <Command shouldFilter={!selectedToken} loop label="Command palette">
            <div className="flex items-center gap-2.5 border-b border-edge px-4">
              <Search size={14} className="shrink-0 text-muted" />
              {selectedToken ? (
                <span className="num shrink-0 rounded-[3px] border border-signal/40 bg-signal/10 px-1.5 py-0.5 text-[10px] text-signal">
                  ${selectedToken.symbol}
                </span>
              ) : null}
              <Command.Input
                value={search}
                onValueChange={setSearch}
                autoFocus
                placeholder={
                  selectedToken
                    ? "Choose an action…"
                    : "Search tokens, jump to screens, run actions…"
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && search === "" && selectedToken) {
                    setSelectedToken(null);
                  }
                }}
                className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
              />
              <kbd className="num shrink-0 rounded-[3px] border border-edge-bright px-1.5 py-0.5 text-[10px] text-muted">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[52vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-xs text-muted">
                Nothing matches. Try a token symbol, name, or screen.
              </Command.Empty>

              {selectedToken ? (
                <TokenActions
                  token={selectedToken}
                  onGo={go}
                  onDone={close}
                />
              ) : (
                <>
                  {search.trim().length > 0 && tokens && tokens.length > 0 ? (
                    <Command.Group
                      heading={<GroupLabel>Tokens</GroupLabel>}
                    >
                      {tokens.map((t) => (
                        <Command.Item
                          key={t.id}
                          value={`${t.symbol} ${t.name} ${t.id}`}
                          onSelect={() => setSelectedToken(t)}
                          className="group flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 data-[selected=true]:bg-signal/[0.08]"
                        >
                          <ConvictionRing score={t.score.composite} size={16} />
                          <span className="num w-16 truncate text-xs font-medium text-ink">
                            ${t.symbol}
                          </span>
                          <span className="truncate text-xs text-muted">{t.name}</span>
                          <RiskBadge tier={t.riskTier} />
                          <span className="num ml-auto text-xs text-ink">
                            {formatPrice(t.priceUsd)}
                          </span>
                          <Delta value={t.change24h} className="w-16 text-right text-xs" />
                          <span className="num hidden w-16 text-right text-2xs text-muted sm:inline">
                            {formatUsdCompact(t.marketCapUsd)}
                          </span>
                          <ArrowRight size={12} className="text-muted opacity-0 group-data-[selected=true]:opacity-100" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ) : null}

                  <Command.Group heading={<GroupLabel>Screens</GroupLabel>}>
                    {[...NAV_ITEMS, ...SECONDARY_NAV].map((item) => (
                      <Command.Item
                        key={item.href}
                        value={`go ${item.label}`}
                        onSelect={() => go(item.href)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-xs text-ink data-[selected=true]:bg-signal/[0.08]"
                      >
                        <item.icon size={13} className="text-muted" />
                        {item.label}
                        {item.shortcut ? (
                          <kbd className="num ml-auto text-[10px] text-muted/70">{item.shortcut}</kbd>
                        ) : null}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </>
              )}
            </Command.List>

      <div className="flex items-center gap-3 border-t border-edge px-4 py-2 text-[10px] text-muted">
        <span className="num">↑↓ navigate</span>
        <span className="num">↵ select</span>
        <span className="num">⌫ back</span>
        <span className="ml-auto">{selectedToken ? "Token actions" : "Global"}</span>
      </div>
    </Command>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow block px-2.5 pb-1 pt-2">{children}</span>;
}

function TokenActions({
  token,
  onGo,
  onDone,
}: {
  token: TokenSummary;
  onGo: (href: string) => void;
  onDone: () => void;
}) {
  const watched = isWatched(token.id);
  const itemCls =
    "flex cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-xs text-ink data-[selected=true]:bg-signal/[0.08]";
  return (
    <Command.Group heading={<GroupLabel>{token.name}</GroupLabel>}>
      <Command.Item value="open case file" onSelect={() => onGo(`/token/${token.id}`)} className={itemCls}>
        <FileText size={13} className="text-muted" />
        Open case file
      </Command.Item>
      <Command.Item
        value={watched ? "remove from watchlist" : "add to watchlist"}
        onSelect={() => {
          toggleWatch(token.id);
          onDone();
        }}
        className={itemCls}
      >
        {watched ? <EyeOff size={13} className="text-muted" /> : <Eye size={13} className="text-muted" />}
        {watched ? "Remove from watchlist" : "Add to watchlist"}
      </Command.Item>
      <Command.Item
        value="generate research brief"
        onSelect={() => onGo(`/token/${token.id}#brief`)}
        className={itemCls}
      >
        <FileText size={13} className="text-muted" />
        Generate research brief
      </Command.Item>
      <Command.Item
        value="copy contract address"
        onSelect={() => {
          navigator.clipboard.writeText(token.address).catch(() => undefined);
          onDone();
        }}
        className={itemCls}
      >
        <Copy size={13} className="text-muted" />
        Copy contract address
        <span className="num ml-auto text-[10px] text-muted">
          {token.address.slice(0, 6)}…
        </span>
      </Command.Item>
    </Command.Group>
  );
}
