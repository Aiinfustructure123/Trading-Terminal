import { sourceStatus } from "@/lib/datasources/config";
import { sleep } from "@/lib/utils";
import { buildTokenUniverse } from "@/lib/datasources/sample/generator";
import type { DashboardSnapshot, MarketDataSource } from "@/lib/datasources/types";

function wave(amplitude: number, speed = 28_000) {
  return Math.sin(Date.now() / speed) * amplitude;
}

export const sampleMarketDataSource: MarketDataSource = {
  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    await sleep(320);

    const tokens = buildTokenUniverse(32);

    return {
      source: sourceStatus("market"),
      pulse: {
        globalMarketCap: 2_410_000_000_000 + wave(18_000_000_000),
        volume24h: 98_400_000_000 + wave(3_600_000_000, 19_000),
        btcDominance: 52.4 + wave(0.26, 44_000),
        fearGreed: 63 + wave(4.2, 38_000),
        updatedAt: new Date().toISOString()
      },
      narratives: [
        {
          id: "ai",
          name: "AI",
          rank: 1,
          flow24h: 428_000_000 + wave(22_000_000),
          flow7d: 1_840_000_000,
          conviction: 84,
          leaders: ["NEBULA", "VECTOR", "ORBIT"]
        },
        {
          id: "meme",
          name: "Meme",
          rank: 2,
          flow24h: 318_000_000 + wave(29_000_000, 21_000),
          flow7d: 1_140_000_000,
          conviction: 71,
          leaders: ["BLITZ", "PIXEL"]
        },
        {
          id: "rwa",
          name: "RWA",
          rank: 3,
          flow24h: 204_000_000 + wave(10_000_000, 30_000),
          flow7d: 920_000_000,
          conviction: 68,
          leaders: ["QUARTZ"]
        },
        {
          id: "depin",
          name: "DePIN",
          rank: 4,
          flow24h: 171_000_000 + wave(8_000_000, 32_000),
          flow7d: 730_000_000,
          conviction: 62,
          leaders: ["FORGE"]
        },
        {
          id: "gaming",
          name: "Gaming",
          rank: 5,
          flow24h: 96_000_000 + wave(6_000_000, 25_000),
          flow7d: 406_000_000,
          conviction: 54,
          leaders: ["PIXEL"]
        }
      ],
      opportunities: tokens.slice(0, 5),
      newLaunches: [
        {
          id: "ion",
          symbol: "ION",
          name: "Ion Pulse",
          chain: "solana",
          ageMinutes: 18,
          liquidity: 64_200,
          volume1h: 188_400,
          riskTier: "Moderate",
          riskReason: "LP depth growing, creator wallet under 24h old."
        },
        {
          id: "sable",
          symbol: "SABLE",
          name: "Sable Mesh",
          chain: "base",
          ageMinutes: 47,
          liquidity: 112_900,
          volume1h: 241_000,
          riskTier: "Low",
          riskReason: "Verified source and balanced early holder distribution."
        },
        {
          id: "flare",
          symbol: "FLARE",
          name: "FlareBot",
          chain: "solana",
          ageMinutes: 66,
          liquidity: 38_700,
          volume1h: 91_200,
          riskTier: "High",
          riskReason: "Top holder owns 31% and sell tax flag is unresolved."
        },
        {
          id: "rune",
          symbol: "RUNEAI",
          name: "Rune AI",
          chain: "ethereum",
          ageMinutes: 104,
          liquidity: 148_600,
          volume1h: 304_500,
          riskTier: "Moderate",
          riskReason: "Strong flow, but ownership renounce not observed."
        }
      ],
      heatmap: tokens.slice(0, 18).map((token) => ({
        id: token.id,
        symbol: token.symbol,
        marketCap: token.marketCap,
        change24h: token.deltas.h24
      })),
      alerts: [
        {
          id: "alert-1",
          severity: "profit",
          message: "NEBULA liquidity +18.4% in 1h while buy/sell ratio holds above 1.6",
          timestamp: new Date().toISOString()
        },
        {
          id: "alert-2",
          severity: "warn",
          message: "FLARE new launch: top-holder concentration crossed 30%",
          timestamp: new Date().toISOString()
        },
        {
          id: "alert-3",
          severity: "info",
          message: "AI narrative remains rank #1 by 24h capital flow",
          timestamp: new Date().toISOString()
        },
        {
          id: "alert-4",
          severity: "danger",
          message: "ORBIT sell pressure accelerated: sells +27% over trailing hour",
          timestamp: new Date().toISOString()
        }
      ]
    };
  },

  async getTopTokens(limit = 100) {
    await sleep(260);
    return {
      source: sourceStatus("market"),
      tokens: buildTokenUniverse(limit)
    };
  },

  async getToken(tokenId: string) {
    await sleep(220);
    const token = buildTokenUniverse(64).find((item) => item.id === tokenId) ?? null;
    return {
      source: sourceStatus("market"),
      token
    };
  }
};
