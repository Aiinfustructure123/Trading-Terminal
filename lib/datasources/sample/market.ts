import type {
  AlertEvent,
  Candle,
  LaunchEvent,
  MarketDataSource,
  MarketPulse,
  NarrativeTrend,
  Token,
} from "@/lib/datasources/types";
import { delay, makeToken, makeTokens, sourceState } from "@/lib/datasources/sample/generator";

const narrativeLabels = ["AI", "Meme", "RWA", "DePIN", "Gaming"];

function move(index: number, amplitude: number) {
  return Math.sin(Date.now() / 60_000 + index * 0.51) * amplitude;
}

export class SampleMarketDataSource implements MarketDataSource {
  async getMarketPulse(): Promise<MarketPulse> {
    await delay(140, 360);
    return {
      globalMarketCapUsd: 2_780_000_000_000 + move(1, 14_000_000_000),
      volume24hUsd: 132_400_000_000 + move(2, 5_200_000_000),
      btcDominance: 53.4 + move(3, 0.6),
      fearGreed: Math.round(64 + move(4, 8)),
      source: sourceState("sample.market.pulse"),
    };
  }

  async getTrendingNarratives(): Promise<NarrativeTrend[]> {
    await delay(180, 440);
    return narrativeLabels
      .map((label, index) => ({
        id: label.toLowerCase(),
        label,
        rank: index + 1,
        flow24hUsd: 118_000_000 - index * 18_000_000 + move(index, 9_500_000),
        flow7dUsd: 620_000_000 - index * 72_000_000 + move(index + 10, 34_000_000),
        momentum: Math.round(91 - index * 8 + move(index + 20, 4)),
        source: sourceState("sample.market.narratives"),
      }))
      .sort((a, b) => b.flow24hUsd - a.flow24hUsd)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  async getTokens(count = 1_000): Promise<Token[]> {
    await delay(240, 720);
    return makeTokens(count).sort((a, b) => b.conviction.value - a.conviction.value);
  }

  async getToken(id: string): Promise<Token | null> {
    await delay(160, 380);
    const index = Number(id.replace("token-", ""));
    if (Number.isNaN(index) || index < 0) return null;
    return makeToken(index);
  }

  async getNewLaunches(): Promise<LaunchEvent[]> {
    await delay(180, 520);
    return Array.from({ length: 8 }, (_, index) => {
      const token = makeToken(36 + index * 7);
      return {
        id: `launch-${token.id}`,
        token: {
          ...token,
          ageHours: Math.max(1, Math.round(2 + index * 4 + move(index, 1.2))),
        },
        launchedAt: new Date(Date.now() - (index + 1) * 28 * 60_000).toISOString(),
        liquiditySeedUsd: token.liquidityUsd * (0.18 + index * 0.025),
        riskFlags:
          token.riskTier === "Low"
            ? []
            : token.riskTier === "Moderate"
              ? ["LP lock partial", "Creator wallet active"]
              : ["Mint authority active", "Top wallet concentration", "Thin liquidity"],
        source: sourceState("sample.market.launches"),
      };
    });
  }

  async getMovers(): Promise<Token[]> {
    await delay(160, 420);
    return makeTokens(32).sort((a, b) => Math.abs(b.deltas.h24) - Math.abs(a.deltas.h24));
  }

  async getCandles(tokenId: string, interval: "15m" | "1h" | "4h" | "1d"): Promise<Candle[]> {
    await delay(200, 520);
    const token = await this.getToken(tokenId);
    if (!token) return [];
    const intervalMs = {
      "15m": 15 * 60_000,
      "1h": 60 * 60_000,
      "4h": 4 * 60 * 60_000,
      "1d": 24 * 60 * 60_000,
    }[interval];

    return Array.from({ length: 96 }, (_, index) => {
      const drift = Math.sin(index / 5) * token.priceUsd * 0.035;
      const base = token.priceUsd * (0.78 + index / 420) + drift;
      const open = base * (1 + Math.sin(index) * 0.008);
      const close = base * (1 + Math.cos(index * 0.7) * 0.009);
      return {
        time: new Date(Date.now() - (96 - index) * intervalMs).toISOString(),
        open,
        high: Math.max(open, close) * 1.018,
        low: Math.min(open, close) * 0.982,
        close,
        volume: token.volume24h * (0.005 + Math.abs(Math.sin(index / 4)) * 0.018),
      };
    });
  }

  async getAlertsTicker(): Promise<AlertEvent[]> {
    await delay(120, 260);
    const alerts: Array<Omit<AlertEvent, "source">> = [
      {
        id: "alert-1",
        label: "NEURAL momentum crossed 80; liquidity growth confirmed",
        severity: "profit",
        timestamp: new Date(Date.now() - 4 * 60_000).toISOString(),
      },
      {
        id: "alert-2",
        label: "RIFT risk tier worsened to High after holder concentration spike",
        severity: "danger",
        timestamp: new Date(Date.now() - 9 * 60_000).toISOString(),
      },
      {
        id: "alert-3",
        label: "AI narrative remains #1 by sampled 24h capital flow",
        severity: "info",
        timestamp: new Date(Date.now() - 14 * 60_000).toISOString(),
      },
      {
        id: "alert-4",
        label: "EMBER new-launch liquidity dropped 22% in 1h",
        severity: "warn",
        timestamp: new Date(Date.now() - 19 * 60_000).toISOString(),
      },
    ];

    return alerts.map((alert) => ({ ...alert, source: sourceState("sample.market.alerts") }));
  }
}
