/**
 * Live MarketDataSource — CoinGecko global + Fear & Greed Index.
 */

import type { MarketDataSource, MarketPulse, NarrativesData, HeatmapData, SourceMeta } from "../types";
import { sampleMarketSource } from "../sample/market";

const LIVE_META: SourceMeta = {
  mode: "live",
  lastUpdated: new Date().toISOString(),
  provider: "coingecko",
};

export const liveMarketSource: MarketDataSource = {
  async getMarketPulse(): Promise<MarketPulse> {
    try {
      const res = await fetch("/api/coingecko/global", { next: { revalidate: 0 } });
      if (!res.ok) throw new Error(`coingecko/global ${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      return {
        globalMcap:     data.globalMcap,
        globalVolume:   data.globalVolume,
        btcDominance:   data.btcDominance,
        fearGreedIndex: data.fearGreedIndex,
        fearGreedLabel: data.fearGreedLabel,
        topGainerSymbol: "—",
        topGainerPct: 0,
        source: { ...LIVE_META, lastUpdated: new Date().toISOString() },
      };
    } catch (err) {
      console.error("[live/market] getMarketPulse fallback", err);
      return sampleMarketSource.getMarketPulse();
    }
  },

  // Narratives require paid category data — keep sample for now
  async getNarratives(): Promise<NarrativesData> {
    return sampleMarketSource.getNarratives();
  },

  // Heatmap uses the live screener tokens — keep sample for now
  async getHeatmap(): Promise<HeatmapData> {
    return sampleMarketSource.getHeatmap();
  },
};
