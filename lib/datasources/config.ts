/**
 * Single config map controlling sample vs live per source.
 *
 * Flipping a source to "live" (Phase 1+) swaps the implementation returned by
 * `lib/datasources/index.ts` AND flips the panel badge from SAMPLE to LIVE —
 * automatically, everywhere that source is used. The user always knows which
 * data is real.
 */

export type SourceMode = "sample" | "live";

export type SourceKey =
  | "market"
  | "onchain"
  | "security"
  | "ai"
  | "smartMoney"
  | "alerts";

export const SOURCE_MODES: Record<SourceKey, SourceMode> = {
  market: "sample",
  onchain: "sample",
  security: "sample",
  ai: "sample",
  smartMoney: "sample", // stays sample until a labeled-wallet data source is contracted
  alerts: "sample",
};

export function sourceMode(key: SourceKey): SourceMode {
  return SOURCE_MODES[key];
}

/** Provider metadata for the Settings screen — visibly anticipating Phase 1+. */
export interface IntegrationSlot {
  id: string;
  name: string;
  description: string;
  envVar: string;
  docsUrl: string;
  sources: SourceKey[];
  phase: number;
}

export const INTEGRATIONS: IntegrationSlot[] = [
  {
    id: "dexscreener",
    name: "DexScreener",
    description: "Pairs, price, volume, liquidity, txns, new launches. Primary market data.",
    envVar: "DEXSCREENER_API_KEY",
    docsUrl: "https://docs.dexscreener.com/api/reference",
    sources: ["market"],
    phase: 1,
  },
  {
    id: "geckoterminal",
    name: "GeckoTerminal",
    description: "OHLCV candles, pool data, trending pools. Charts + backup market data.",
    envVar: "GECKOTERMINAL_API_KEY",
    docsUrl: "https://www.geckoterminal.com/dex-api",
    sources: ["market"],
    phase: 1,
  },
  {
    id: "coingecko",
    name: "CoinGecko",
    description: "Market caps, categories, global metrics. Cached 15 min.",
    envVar: "COINGECKO_API_KEY",
    docsUrl: "https://www.coingecko.com/en/api",
    sources: ["market"],
    phase: 1,
  },
  {
    id: "helius",
    name: "Helius",
    description: "Solana holders, transfers, token metadata.",
    envVar: "HELIUS_API_KEY",
    docsUrl: "https://docs.helius.dev",
    sources: ["onchain"],
    phase: 1,
  },
  {
    id: "goplus",
    name: "GoPlus Security",
    description: "Honeypot detection, mint/freeze authority, taxes, LP lock.",
    envVar: "GOPLUS_API_KEY",
    docsUrl: "https://gopluslabs.io/security-api",
    sources: ["security"],
    phase: 1,
  },
  {
    id: "rugcheck",
    name: "RugCheck",
    description: "Solana token risk reports for the forensics panel.",
    envVar: "RUGCHECK_API_KEY",
    docsUrl: "https://api.rugcheck.xyz",
    sources: ["security"],
    phase: 1,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude generates research briefs and scenario analysis from structured data.",
    envVar: "ANTHROPIC_API_KEY",
    docsUrl: "https://docs.anthropic.com",
    sources: ["ai"],
    phase: 2,
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Alert delivery. User-supplied bot token + chat id.",
    envVar: "TELEGRAM_BOT_TOKEN",
    docsUrl: "https://core.telegram.org/bots/api",
    sources: ["alerts"],
    phase: 3,
  },
];
