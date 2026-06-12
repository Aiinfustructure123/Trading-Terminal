import {
  AlertTickerItem,
  ConvictionOpportunity,
  ConvictionScore,
  HeatmapCell,
  MarketDataSource,
  MarketPulse,
  NarrativeTrend,
  ScoreComponent,
} from "@/lib/datasources/types";
import { SAMPLE_TOKENS, clamp, jitter, riskTierToScoreFloor, withLatency } from "@/lib/datasources/sample/shared";

const NARRATIVES: Omit<NarrativeTrend, "flow24hPct" | "flow7dPct">[] = [
  { id: "ai", name: "AI", score: 84 },
  { id: "meme", name: "Meme", score: 69 },
  { id: "rwa", name: "RWA", score: 71 },
  { id: "depin", name: "DePIN", score: 74 },
  { id: "gaming", name: "Gaming", score: 63 },
];

function buildComponents(symbol: string, baseScore: number): ScoreComponent[] {
  const phase = symbol.charCodeAt(0) / 5;
  const momentum = clamp(baseScore + Math.sin(Date.now() / 16_000 + phase) * 9, 0, 100);
  const liquidity = clamp(baseScore + Math.cos(Date.now() / 21_000 + phase) * 11, 0, 100);
  const holders = clamp(baseScore + Math.sin(Date.now() / 24_000 + phase) * 7, 0, 100);
  const structure = clamp(baseScore + Math.cos(Date.now() / 13_000 + phase) * 8, 0, 100);
  const riskInverse = clamp(baseScore + Math.sin(Date.now() / 27_000 + phase) * 10, 0, 100);

  return [
    {
      id: "momentum",
      label: "Momentum",
      value: Number(momentum.toFixed(1)),
      weight: 0.3,
      reasoning: "Volume acceleration and intraday trend continuity are both positive.",
    },
    {
      id: "liquidity",
      label: "Liquidity",
      value: Number(liquidity.toFixed(1)),
      weight: 0.22,
      reasoning: "Liquidity depth is holding while turnover increases.",
    },
    {
      id: "holders",
      label: "Holders",
      value: Number(holders.toFixed(1)),
      weight: 0.18,
      reasoning: "Holder count growth remains positive with moderate concentration.",
    },
    {
      id: "structure",
      label: "Structure",
      value: Number(structure.toFixed(1)),
      weight: 0.15,
      reasoning: "Higher-low structure holds on 1h and 4h sample candles.",
    },
    {
      id: "risk-inverse",
      label: "Risk (Inverse)",
      value: Number(riskInverse.toFixed(1)),
      weight: 0.15,
      reasoning: "No major critical flags in the simulated forensics profile.",
    },
  ];
}

function buildConvictionScore(symbol: string, floor: number): ConvictionScore {
  const components = buildComponents(symbol, floor);
  const weightedTotal = components.reduce((sum, component) => sum + component.value * component.weight, 0);

  return {
    total: Number(weightedTotal.toFixed(1)),
    components,
    updatedAt: new Date().toISOString(),
  };
}

export const sampleMarketDataSource: MarketDataSource = {
  async getMarketPulse(): Promise<MarketPulse> {
    return withLatency({
      globalMarketCapUsd: Math.round(jitter(2_590_000_000_000, 0.009, 0)),
      volume24hUsd: Math.round(jitter(114_000_000_000, 0.04, 1)),
      btcDominancePct: Number(jitter(54.1, 0.012, 2).toFixed(2)),
      fearGreed: Math.round(clamp(jitter(68, 0.06, 3), 0, 100)),
      updatedAt: new Date().toISOString(),
    });
  },

  async getTrendingNarratives(): Promise<NarrativeTrend[]> {
    const trends = NARRATIVES.map((narrative, index) => ({
      ...narrative,
      flow24hPct: Number(jitter(4 + index * 1.6, 0.24, index + 1).toFixed(2)),
      flow7dPct: Number(jitter(13 + index * 3.5, 0.18, index + 4).toFixed(2)),
    })).sort((a, b) => b.score - a.score);

    return withLatency(trends);
  },

  async getConvictionOpportunities(limit = 6): Promise<ConvictionOpportunity[]> {
    const opportunities = SAMPLE_TOKENS.map((token, index) => {
      const conviction = buildConvictionScore(token.symbol, riskTierToScoreFloor(token.riskTier) + 15 + index * 2);
      return {
        token: {
          ...token,
          priceUsd: Number(jitter(token.priceUsd, 0.025, index + 20).toFixed(6)),
          change24hPct: Number(jitter(token.change24hPct, 0.2, index + 14).toFixed(2)),
          volume24hUsd: Math.round(jitter(token.volume24hUsd, 0.08, index + 30)),
        },
        conviction,
        rationale: [
          `Conviction is lifted by ${conviction.components[0]?.label.toLowerCase()} and liquidity depth.`,
          `Risk tier is ${token.riskTier.toUpperCase()} under sample rules.`,
        ],
      };
    })
      .sort((a, b) => b.conviction.total - a.conviction.total)
      .slice(0, limit);

    return withLatency(opportunities);
  },

  async getNewLaunches(limit = 8) {
    const launches = SAMPLE_TOKENS.filter((token) => token.ageHours < 96)
      .map((token, index) => ({
        id: `${token.symbol}-launch`,
        token: {
          ...token,
          priceUsd: Number(jitter(token.priceUsd, 0.03, index + 40).toFixed(6)),
          liquidityUsd: Math.round(jitter(token.liquidityUsd, 0.06, index + 42)),
        },
        launchedAt: new Date(Date.now() - token.ageHours * 3_600_000).toISOString(),
        redFlags:
          token.riskTier === "low"
            ? []
            : token.riskTier === "moderate"
              ? ["Liquidity concentration is above baseline."]
              : token.riskTier === "high"
                ? ["Contract ownership pattern is concentrated."]
                : ["Tax policy is opaque and ownership is mutable."],
      }))
      .sort((a, b) => (a.launchedAt < b.launchedAt ? 1 : -1))
      .slice(0, limit);

    return withLatency(launches);
  },

  async getMoversHeatmap(limit = 18): Promise<HeatmapCell[]> {
    const nodes = SAMPLE_TOKENS.map((token, index) => ({
      id: `${token.symbol}-heatmap`,
      symbol: token.symbol,
      marketCapUsd: Math.round(jitter(token.marketCapUsd, 0.05, index + 50)),
      change24hPct: Number(jitter(token.change24hPct, 0.2, index + 59).toFixed(2)),
    }))
      .sort((a, b) => b.marketCapUsd - a.marketCapUsd)
      .slice(0, limit);

    return withLatency(nodes);
  },

  async getAlertsTicker(limit = 12): Promise<AlertTickerItem[]> {
    const now = Date.now();
    const items: AlertTickerItem[] = [
      {
        id: "alert-1",
        severity: "warn",
        message: "NOVA liquidity drawdown reached 18% over 60m.",
        timestamp: new Date(now - 180_000).toISOString(),
      },
      {
        id: "alert-2",
        severity: "info",
        message: "AI narrative inflow exceeded 6.2% in last 24h.",
        timestamp: new Date(now - 320_000).toISOString(),
      },
      {
        id: "alert-3",
        severity: "danger",
        message: "WISP risk tier escalated to AVOID under tax mutability rule.",
        timestamp: new Date(now - 540_000).toISOString(),
      },
      {
        id: "alert-4",
        severity: "info",
        message: "NEON conviction crossed 78 threshold.",
        timestamp: new Date(now - 760_000).toISOString(),
      },
      {
        id: "alert-5",
        severity: "warn",
        message: "DUST buy/sell imbalance worsened by 22% over 4h window.",
        timestamp: new Date(now - 930_000).toISOString(),
      },
    ];

    return withLatency(items.slice(0, limit), 80, 240);
  },
};
