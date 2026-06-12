/**
 * Sample market overview data — MarketDataSource implementation.
 */

import type {
  MarketDataSource, MarketPulse, NarrativesData, HeatmapData, SourceMeta,
} from "../types";
import { SAMPLE_TOKENS } from "./tokens";

const NOW = new Date().toISOString();
const META: SourceMeta = { mode: "sample", lastUpdated: NOW, provider: "alpha-terminal-sample" };

export const sampleMarketSource: MarketDataSource = {
  async getMarketPulse(): Promise<MarketPulse> {
    await new Promise(r => setTimeout(r, 80));
    return {
      globalMcap:    2.84e12,
      globalVolume:  142e9,
      btcDominance:  54.2,
      fearGreedIndex: 72,
      fearGreedLabel: "Greed",
      topGainerSymbol: "BONK",
      topGainerPct:  34.7,
      source: META,
    };
  },

  async getNarratives(): Promise<NarrativesData> {
    await new Promise(r => setTimeout(r, 100));
    return {
      narratives: [
        {
          id: "ai",
          label: "AI & Agents",
          tokens: 142,
          capitalFlow24h: 380e6,
          capitalFlow7d:  1.4e9,
          avgScore: 68,
          topTokens: [
            { symbol: "AIAGENT", priceChange24h: 42.3 },
            { symbol: "GPUX",    priceChange24h: 28.1 },
            { symbol: "COMPUTE", priceChange24h: -5.2 },
          ],
        },
        {
          id: "meme",
          label: "Meme",
          tokens: 3820,
          capitalFlow24h: 1.2e9,
          capitalFlow7d:  4.8e9,
          avgScore: 45,
          topTokens: [
            { symbol: "BONK",   priceChange24h: 34.7 },
            { symbol: "WIF",    priceChange24h: 18.2 },
            { symbol: "POPCAT", priceChange24h: -8.4 },
          ],
        },
        {
          id: "rwa",
          label: "RWA",
          tokens: 87,
          capitalFlow24h: 220e6,
          capitalFlow7d:  890e6,
          avgScore: 71,
          topTokens: [
            { symbol: "ONDO", priceChange24h: 12.4 },
          ],
        },
        {
          id: "depin",
          label: "DePIN",
          tokens: 234,
          capitalFlow24h: 180e6,
          capitalFlow7d:  620e6,
          avgScore: 62,
          topTokens: [
            { symbol: "HNT",  priceChange24h: 8.1 },
            { symbol: "IOTX", priceChange24h: 5.4 },
          ],
        },
        {
          id: "gaming",
          label: "Gaming",
          tokens: 418,
          capitalFlow24h: -80e6,
          capitalFlow7d:  -320e6,
          avgScore: 38,
          topTokens: [
            { symbol: "PLAY",  priceChange24h: -12.3 },
            { symbol: "GAMER", priceChange24h: -18.7 },
          ],
        },
      ],
      source: META,
    };
  },

  async getHeatmap(): Promise<HeatmapData> {
    await new Promise(r => setTimeout(r, 90));
    const cells = SAMPLE_TOKENS.slice(0, 80).map(t => ({
      address:   t.address,
      symbol:    t.symbol,
      name:      t.name,
      mcap:      t.marketCap,
      change24h: t.priceChange24h,
    }));
    return { cells, source: META };
  },
};
