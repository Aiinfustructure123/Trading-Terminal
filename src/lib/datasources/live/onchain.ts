/**
 * Live OnChainSource — Helius (Solana).
 * Falls back gracefully to sample if HELIUS_API_KEY is not set.
 */

import type { OnChainSource, HolderData, HolderEntry, Chain, SourceMeta } from "../types";
import { sampleOnChainSource } from "../sample/onchain";

const LIVE_META: SourceMeta = {
  mode: "live",
  lastUpdated: new Date().toISOString(),
  provider: "helius",
};

export const liveOnChainSource: OnChainSource = {
  async getHolders(address: string, chain: Chain): Promise<HolderData> {
    if (chain !== "solana") {
      return sampleOnChainSource.getHolders(address, chain);
    }

    try {
      const res = await fetch(`/api/helius/holders?mint=${address}`, {
        next: { revalidate: 0 },
      });
      const data = await res.json();

      if (data.degraded || data.error) throw new Error(data.error ?? "degraded");

      const holders = data.holders as Array<{ address: string; amount: number }>;
      const totalSupply = holders.reduce((s, h) => s + h.amount, 0) || 1;

      const topHolders: HolderEntry[] = holders.slice(0, 10).map((h, i) => ({
        rank:    i + 1,
        address: h.address,
        pct:     +(h.amount / totalSupply * 100).toFixed(2),
        value:   0, // would need price to compute
        isCreator: i === 0,
      }));

      return {
        address,
        holderCount:         holders.length,
        topHolders,
        creatorWalletStatus: "unknown",
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.warn("[live/onchain] fallback to sample:", err);
      // Helius not configured — return sample with degraded mode badge
      const result = await sampleOnChainSource.getHolders(address, chain);
      return {
        ...result,
        source: {
          mode: "degraded",
          lastUpdated: new Date().toISOString(),
          provider: "helius (key not configured)",
        },
      };
    }
  },
};
