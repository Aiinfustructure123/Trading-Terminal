/**
 * Live SecuritySource — GoPlus + RugCheck forensics.
 */

import type { SecuritySource, ConvictionScore, ScenarioData, Chain } from "../types";
import type { GoPlusTokenResult } from "../schemas/goplus";
import type { RugCheckReport } from "../schemas/rugcheck";
import { buildConvictionScore } from "@/lib/scoring";
import { sampleSecuritySource } from "../sample/security";
import { SAMPLE_TOKENS } from "../sample/tokens";


async function fetchGoPlus(address: string, chain: Chain): Promise<GoPlusTokenResult | null> {
  try {
    const res = await fetch(`/api/goplus?address=${address}&chain=${chain}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result?.[address] ?? Object.values(data?.result ?? {})[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchRugCheck(address: string): Promise<RugCheckReport | null> {
  try {
    const res = await fetch(`/api/rugcheck?address=${address}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.error ? null : data;
  } catch {
    return null;
  }
}

export const liveSecuritySource: SecuritySource = {
  async getConvictionScore(address: string, chain: Chain): Promise<ConvictionScore> {
    try {
      // Run GoPlus and RugCheck in parallel
      const [goplus, rugcheck] = await Promise.all([
        fetchGoPlus(address, chain),
        chain === "solana" ? fetchRugCheck(address) : Promise.resolve(null),
      ]);

      if (!goplus && !rugcheck) throw new Error("No security data");

      // We need market data to build a full score — try to get it from the token
      const sampleToken = SAMPLE_TOKENS.find(t => t.address === address);
      const liquidity = sampleToken?.liquidity ?? 0;
      const ageHours  = sampleToken ? sampleToken.age * 24 : 0;

      // Top holder concentration from RugCheck
      const topHolderPct = rugcheck?.topHolders
        ?.slice(0, 10)
        .reduce((s, h) => s + h.pct, 0) ?? 0;

      return buildConvictionScore({
        momentum: {
          priceChange5m:  sampleToken?.priceChange5m ?? 0,
          priceChange1h:  sampleToken?.priceChange1h ?? 0,
          priceChange6h:  sampleToken?.priceChange6h ?? 0,
          priceChange24h: sampleToken?.priceChange24h ?? 0,
          volume24h:      sampleToken?.volume24h ?? 0,
          volume6h:       (sampleToken?.volume24h ?? 0) / 4,
          volume1h:       (sampleToken?.volume24h ?? 0) / 24,
          buys24h:        sampleToken?.txns24h.buys ?? 0,
          sells24h:       sampleToken?.txns24h.sells ?? 0,
          liquidity,
        },
        security: {
          goplus,
          rugcheck,
          liquidity,
          ageHours,
          topHolderConcentrationPct: topHolderPct,
        },
      });
    } catch (err) {
      console.error("[live/security] fallback", err);
      return sampleSecuritySource.getConvictionScore(address, chain);
    }
  },

  async getScenarios(address: string, chain: Chain): Promise<ScenarioData> {
    // Scenario generation is AI-powered in Phase 2 — keep sample for now
    return sampleSecuritySource.getScenarios(address, chain);
  },
};
