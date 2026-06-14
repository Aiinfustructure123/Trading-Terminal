/**
 * Live AISource — Anthropic Claude via /api/ai/brief.
 * Falls back to sample brief when ANTHROPIC_API_KEY is not set.
 */

import type { AISource, AIBrief, Chain } from "../types";
import { sampleAISource } from "../sample/ai";
import { SAMPLE_TOKENS } from "../sample/tokens";

export const liveAISource: AISource = {
  async getBrief(address: string, chain: Chain): Promise<AIBrief> {
    try {
      // Build context from available token data
      const token = SAMPLE_TOKENS.find(t => t.address === address);

      // Try to get live token data first
      let liveToken = token;
      try {
        const res = await fetch(
          `/api/dexscreener/tokens?addresses=${encodeURIComponent(address)}`,
          { next: { revalidate: 0 } }
        );
        const data = await res.json();
        const pair = data.pairs?.[0];
        if (pair) {
          liveToken = {
            address,
            symbol:         pair.baseToken?.symbol ?? token?.symbol ?? "UNKNOWN",
            name:           pair.baseToken?.name ?? token?.name ?? "Unknown Token",
            chain,
            price:          parseFloat(pair.priceUsd ?? "0"),
            priceChange24h: pair.priceChange?.h24 ?? 0,
            priceChange1h:  pair.priceChange?.h1  ?? 0,
            priceChange6h:  pair.priceChange?.h6  ?? 0,
            priceChange5m:  pair.priceChange?.m5  ?? 0,
            volume24h:      pair.volume?.h24 ?? 0,
            liquidity:      pair.liquidity?.usd ?? 0,
            marketCap:      pair.marketCap ?? 0,
            fdv:            pair.fdv ?? undefined,
            age:            pair.pairCreatedAt
              ? (Date.now() - pair.pairCreatedAt) / 86400_000
              : (token?.age ?? 0),
            txns24h:   {
              buys:  pair.txns?.h24?.buys  ?? 0,
              sells: pair.txns?.h24?.sells ?? 0,
            },
            holderCount:              token?.holderCount ?? 0,
            topHolderConcentration:   token?.topHolderConcentration ?? 0,
            score:                    token?.score ?? liveToken!.score,
            creatorSold:              token?.creatorSold,
            launchedAt:               token?.launchedAt,
            dexUrl:                   pair.url,
          } as typeof token;
        }
      } catch {
        // use sample token data
      }

      if (!liveToken) {
        return sampleAISource.getBrief(address, chain);
      }

      const ctx = {
        address,
        symbol:          liveToken.symbol,
        name:            liveToken.name,
        chain,
        price:           liveToken.price,
        priceChange24h:  liveToken.priceChange24h,
        priceChange1h:   liveToken.priceChange1h,
        volume24h:       liveToken.volume24h,
        liquidity:       liveToken.liquidity,
        marketCap:       liveToken.marketCap,
        age:             liveToken.age,
        buys24h:         liveToken.txns24h.buys,
        sells24h:        liveToken.txns24h.sells,
        holderCount:     liveToken.holderCount > 0 ? liveToken.holderCount : undefined,
        topHolderConcentration: liveToken.topHolderConcentration > 0 ? liveToken.topHolderConcentration : undefined,
        convictionScore: liveToken.score.composite,
        riskTier:        liveToken.score.riskTier,
        triggeredFlags:  liveToken.score.riskFlags
          .filter(f => f.triggered)
          .map(f => ({ label: f.label, severity: f.severity, description: f.description })),
        scoreComponents: liveToken.score.components.map(c => ({
          label:       c.label,
          subScore:    c.subScore,
          weight:      c.weight,
          description: c.description,
        })),
      };

      const res = await fetch("/api/ai/brief", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(ctx),
        next:    { revalidate: 0 },
      });

      if (!res.ok) throw new Error(`AI brief API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      return {
        address,
        executiveSummary: data.executiveSummary,
        whatDataShows:    data.whatDataShows,
        bullCase:         data.bullCase,
        bearCase:         data.bearCase,
        keyRisks:         data.keyRisks,
        whatWouldChange:  data.whatWouldChange,
        generatedAt:      data.generatedAt,
        model:            data.model,
        source: {
          mode:        "live",
          lastUpdated: data.generatedAt,
          provider:    "anthropic",
        },
      };
    } catch (err) {
      console.error("[live/ai] fallback to sample", err);
      return sampleAISource.getBrief(address, chain);
    }
  },
};
