import type { SourceKey, SourceMode } from "@/lib/datasources/types";

/* ============================================================
   SOURCE MODE CONFIG
   The single switch that controls whether each source serves
   sample or live data. Flipping a value here (and providing the
   matching live/* implementation + env keys) makes a whole class
   of panels go live — and the SAMPLE/LIVE badge updates itself.
   In Phase 0 everything is "sample".
   ============================================================ */

export const SOURCE_MODE: Record<SourceKey, SourceMode> = {
  market: "sample", // DexScreener / GeckoTerminal / CoinGecko (Phase 1)
  onchain: "sample", // Helius holders + transfers (Phase 1) / smart money (Phase 4, gated)
  security: "sample", // GoPlus + RugCheck (Phase 1)
  ai: "sample", // Anthropic Claude (Phase 2)
};

/** Provider integrations surfaced in Settings, grouped by the source they back. */
export interface Integration {
  id: string;
  name: string;
  source: SourceKey;
  envKey: string;
  phase: string;
  description: string;
  /** Whether this provider is wired live yet (Phase 0: none). */
  connected: boolean;
}

export const INTEGRATIONS: Integration[] = [
  { id: "dexscreener", name: "DexScreener", source: "market", envKey: "—", phase: "Phase 1", description: "Pairs, price, volume, liquidity, txns, new launches. Free, 300 req/min.", connected: false },
  { id: "geckoterminal", name: "GeckoTerminal", source: "market", envKey: "—", phase: "Phase 1", description: "OHLCV candles, pool data, trending pools. Free.", connected: false },
  { id: "coingecko", name: "CoinGecko", source: "market", envKey: "COINGECKO_API_KEY", phase: "Phase 1", description: "Market caps, categories, global metrics. Cache 15 min.", connected: false },
  { id: "helius", name: "Helius", source: "onchain", envKey: "HELIUS_API_KEY", phase: "Phase 1", description: "Solana holders, transfers, token metadata. Free tier.", connected: false },
  { id: "goplus", name: "GoPlus Security", source: "security", envKey: "GOPLUS_API_KEY", phase: "Phase 1", description: "Honeypot, mint/freeze authority, taxes, LP lock. Free.", connected: false },
  { id: "rugcheck", name: "RugCheck", source: "security", envKey: "RUGCHECK_API_KEY", phase: "Phase 1", description: "Solana token risk reports. Free.", connected: false },
  { id: "anthropic", name: "Anthropic (Claude)", source: "ai", envKey: "ANTHROPIC_API_KEY", phase: "Phase 2", description: "claude-sonnet-4-6 research briefs + scenarios. Cite-only, no predictions.", connected: false },
  { id: "telegram", name: "Telegram Bot", source: "ai", envKey: "TELEGRAM_BOT_TOKEN", phase: "Phase 3", description: "Alert delivery via user-supplied bot token + chat id.", connected: false },
];

export function sourceMode(key: SourceKey): SourceMode {
  return SOURCE_MODE[key];
}
