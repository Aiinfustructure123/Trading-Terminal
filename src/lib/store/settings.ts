"use client";

import { createLocalStore } from "./local-store";

export interface ApiKeySlot {
  id: string;
  label: string;
  phase: string;
  envVar: string;
  /** Where to obtain the key. */
  hint: string;
  docsUrl: string;
}

export const API_KEY_SLOTS: ApiKeySlot[] = [
  {
    id: "dexscreener",
    label: "DexScreener",
    phase: "Phase 1 · market data",
    envVar: "DEXSCREENER_API_KEY",
    hint: "Free public API, key optional — respects 300 req/min.",
    docsUrl: "https://docs.dexscreener.com/api/reference",
  },
  {
    id: "geckoterminal",
    label: "GeckoTerminal",
    phase: "Phase 1 · OHLCV + pools",
    envVar: "GECKOTERMINAL_API_KEY",
    hint: "Free public API for candles, pools, trending.",
    docsUrl: "https://www.geckoterminal.com/dex-api",
  },
  {
    id: "coingecko",
    label: "CoinGecko",
    phase: "Phase 1 · global + categories",
    envVar: "COINGECKO_API_KEY",
    hint: "Free demo key from the CoinGecko developer dashboard.",
    docsUrl: "https://www.coingecko.com/en/api",
  },
  {
    id: "helius",
    label: "Helius",
    phase: "Phase 1 · Solana on-chain",
    envVar: "HELIUS_API_KEY",
    hint: "Free tier covers holders, transfers, token metadata.",
    docsUrl: "https://www.helius.dev/",
  },
  {
    id: "goplus",
    label: "GoPlus Security",
    phase: "Phase 1 · forensics",
    envVar: "GOPLUS_API_KEY",
    hint: "Free tier — honeypot, authorities, taxes, LP lock.",
    docsUrl: "https://gopluslabs.io/security-api",
  },
  {
    id: "rugcheck",
    label: "RugCheck",
    phase: "Phase 1 · Solana risk reports",
    envVar: "RUGCHECK_API_KEY",
    hint: "Solana token risk reports.",
    docsUrl: "https://rugcheck.xyz/",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    phase: "Phase 2 · AI research agent",
    envVar: "ANTHROPIC_API_KEY",
    hint: "Console key — powers research briefs and scenarios.",
    docsUrl: "https://console.anthropic.com/",
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    phase: "Phase 3 · alert delivery",
    envVar: "TELEGRAM_BOT_TOKEN",
    hint: "Create a bot via @BotFather; chat id from /getUpdates.",
    docsUrl: "https://core.telegram.org/bots",
  },
];

const store = createLocalStore<Record<string, string>>("api-keys", {});

export function useApiKeys(): Record<string, string> {
  return store.useValue();
}

export function setApiKey(slotId: string, value: string): void {
  store.set((prev) => {
    const next = { ...prev };
    if (value.trim() === "") delete next[slotId];
    else next[slotId] = value.trim();
    return next;
  });
}
