import type { SourceKey, SourceStatus } from "./types";

/**
 * The single switch that controls whether each source is sample or live.
 *
 * Phase 0: everything is "sample". As each `live/<source>.ts` implementation
 * lands, flip its entry to "live" (or "degraded" when an upstream is failing).
 * The badge on every panel reads from here automatically — there is no other
 * place to update, and a panel can NEVER silently present sample data as live.
 *
 * `smartMoney` stays "sample" indefinitely: it requires a contracted
 * labeled-wallet data source (see Phase 4). We never fake it as live.
 */
export const SOURCE_MODE: Record<SourceKey, SourceStatus> = {
  market: "sample",
  onchain: "sample",
  security: "sample",
  ai: "sample",
  smartMoney: "sample",
};

export interface SourceMeta {
  label: string;
  /** Upstream providers this source will use once live. */
  liveProviders: string[];
  /** Whether this source is ever expected to go live without a paid plan. */
  premiumOnly?: boolean;
}

export const SOURCE_META: Record<SourceKey, SourceMeta> = {
  market: { label: "Market Data", liveProviders: ["DexScreener", "GeckoTerminal", "CoinGecko"] },
  onchain: { label: "On-Chain", liveProviders: ["Helius"] },
  security: { label: "Forensics", liveProviders: ["GoPlus", "RugCheck"] },
  ai: { label: "AI Research", liveProviders: ["Anthropic Claude"] },
  smartMoney: {
    label: "Smart Money",
    liveProviders: ["Labeled-wallet dataset (contracted)"],
    premiumOnly: true,
  },
};

export function getSourceStatus(key: SourceKey): SourceStatus {
  return SOURCE_MODE[key];
}
