import {
  AlertTickerItem,
  ConvictionBreakdown,
  MarketDataSource,
  MarketPulse,
  MoverHeatmapItem,
  NarrativeFlow,
  NewLaunch,
  RankedToken,
  RiskTier,
  ScoreComponent,
} from "@/lib/datasources/types";
import { pickSeeded, timeOscillator, withSampleLatency } from "./utils";

const componentReasoning: Record<ScoreComponent, string> = {
  momentum: "1h and 4h structure retains higher highs with controlled pullbacks.",
  liquidity: "Pool depth remains stable relative to transaction throughput.",
  holders: "Net new unique holders sustained over the last three sessions.",
  riskInverse: "Contract risk flags remain below moderate thresholds.",
  volumeTrend: "24h volume acceleration is above rolling weekly baseline.",
};

const riskTiers: RiskTier[] = ["low", "moderate", "high", "avoid"];

const universe = [
  "AURX",
  "NOVA",
  "RIFT",
  "PRSM",
  "ORBT",
  "VRTX",
  "MNTA",
  "KITE",
  "NODE",
  "TIDE",
  "SYNC",
  "LUMA",
  "ARIA",
  "PIX",
  "FUSE",
];

const buildBreakdown = (seed: number): ConvictionBreakdown[] => {
  const components: ScoreComponent[] = [
    "momentum",
    "liquidity",
    "holders",
    "riskInverse",
    "volumeTrend",
  ];
  const weights = [0.28, 0.2, 0.18, 0.2, 0.14];

  return components.map((component, index) => {
    const score = Math.round(50 + Math.sin(seed * 0.8 + index) * 30 + index * 3);
    return {
      component,
      score: Math.min(100, Math.max(0, score)),
      weight: weights[index],
      reasoning: componentReasoning[component],
    };
  });
};

export class SampleMarketDataSource implements MarketDataSource {
  async getMarketPulse(): Promise<MarketPulse> {
    return withSampleLatency(() => {
      const drift = timeOscillator(35_000);
      return {
        globalMarketCap: 2.54e12 + drift * 3.1e10,
        volume24h: 1.23e11 + drift * 5.8e9,
        btcDominance: 52.4 + drift * 0.55,
        fearGreed: Math.round(58 + drift * 7),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async getTrendingNarratives(): Promise<NarrativeFlow[]> {
    return withSampleLatency(() => {
      const narratives: NarrativeFlow["name"][] = ["AI", "Meme", "RWA", "DePIN", "Gaming"];
      return narratives.map((name, index) => {
        const swing = timeOscillator(26_000, index);
        const flow24h = 7 + swing * 5 + index * 2;
        const flow7d = 11 + swing * 7 + index * 2.4;
        return {
          id: name.toLowerCase(),
          name,
          flow24h,
          flow7d,
          tokenCount: 42 + index * 11,
        };
      });
    });
  }

  async getConvictionOpportunities(): Promise<RankedToken[]> {
    return withSampleLatency(() => {
      const drift = timeOscillator(24_000);
      return universe.slice(0, 8).map((symbol, index) => {
        const seed = index + 4;
        const breakdown = buildBreakdown(seed + drift);
        const conviction = Math.round(
          breakdown.reduce((acc, part) => acc + part.score * part.weight, 0),
        );

        return {
          id: symbol.toLowerCase(),
          symbol,
          name: `${symbol} Protocol`,
          chain: "solana",
          price: 0.12 + seed * 0.03 + drift * 0.01,
          change24h: 2.6 + Math.sin(seed) * 6 + drift,
          volume24h: 3.2e6 + seed * 4.4e5,
          liquidityUsd: 1.3e6 + seed * 2.4e5,
          marketCapUsd: 9.1e6 + seed * 1.1e6,
          ageHours: 30 + seed * 7,
          riskTier: riskTiers[(index + 1) % 3],
          conviction,
          breakdown,
        };
      });
    });
  }

  async getNewLaunches(): Promise<NewLaunch[]> {
    return withSampleLatency(() => {
      const now = Date.now();
      return universe.slice(7, 15).map((symbol, index) => {
        const cycle = Math.max(0, Math.floor((Date.now() / 20_000 + index) % 4));
        return {
          id: `launch-${symbol.toLowerCase()}`,
          symbol,
          pair: `${symbol}/SOL`,
          launchedAt: new Date(now - (index * 16 + cycle * 3) * 60_000).toISOString(),
          marketCapUsd: 4.4e5 + index * 1.8e5 + cycle * 7.5e4,
          liquidityUsd: 1.2e5 + index * 4.1e4,
          buys1h: 68 + index * 11 + cycle * 5,
          sells1h: 31 + index * 7 + (3 - cycle) * 4,
          riskTier: pickSeeded(index + cycle, riskTiers),
        };
      });
    });
  }

  async getMoversHeatmap(): Promise<MoverHeatmapItem[]> {
    return withSampleLatency(() => {
      const wave = timeOscillator(30_000);
      return universe.map((symbol, index) => ({
        id: symbol.toLowerCase(),
        symbol,
        marketCapUsd: 1.8e6 + index * 1.3e6,
        change24h: Math.sin(index * 0.7 + wave) * 16,
      }));
    });
  }

  async getAlertsTicker(): Promise<AlertTickerItem[]> {
    return withSampleLatency(() => {
      const now = new Date().toISOString();
      return [
        {
          id: "alt-1",
          level: "signal",
          message: "AI basket momentum crossed 78 composite threshold.",
          timestamp: now,
        },
        {
          id: "alt-2",
          level: "warn",
          message: "RIFT liquidity fell 24% over 60m; monitoring continuation.",
          timestamp: now,
        },
        {
          id: "alt-3",
          level: "danger",
          message: "ORBT risk tier changed from Moderate to High.",
          timestamp: now,
        },
      ];
    }, 90, 160);
  }
}
