import type {
  Candle,
  CandleInterval,
  MarketDataSource,
  MarketPulse,
  Narrative,
  NarrativeId,
  NewLaunch,
  RiskTier,
  ScreenerQuery,
  Token,
} from "../types";
import { getUniverse, rng, simulateLatency } from "./generator";

const RISK_ORDER: Record<RiskTier, number> = { Low: 0, Moderate: 1, High: 2, Avoid: 3 };

const INTERVAL_SECONDS: Record<CandleInterval, number> = {
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

const NARRATIVE_NAMES: Record<NarrativeId, string> = {
  ai: "AI",
  meme: "Meme",
  rwa: "RWA",
  depin: "DePIN",
  gaming: "Gaming",
};

export class SampleMarketDataSource implements MarketDataSource {
  async getMarketPulse(): Promise<MarketPulse> {
    await simulateLatency(80, 220);
    // Slow sinusoidal drift on top of fixed baselines — moves like a real tape
    const t = Date.now() / 1000;
    const wave = (period: number, phase = 0) => Math.sin(t / period + phase);
    const fearGreed = Math.round(58 + wave(7200) * 9 + wave(900, 2) * 3);
    return {
      totalMarketCapUsd: 3.42e12 * (1 + wave(3600) * 0.004),
      totalMarketCapChange24h: 1.8 + wave(5400, 1) * 0.6,
      volume24hUsd: 1.47e11 * (1 + wave(2700, 3) * 0.02),
      volume24hChange: 6.2 + wave(4000, 2) * 2,
      btcDominancePct: 52.4 + wave(9000) * 0.3,
      btcDominanceChange24h: -0.3 + wave(6000, 4) * 0.15,
      fearGreedIndex: fearGreed,
      fearGreedLabel:
        fearGreed >= 75 ? "Extreme Greed" : fearGreed >= 55 ? "Greed" : fearGreed >= 45 ? "Neutral" : fearGreed >= 25 ? "Fear" : "Extreme Fear",
      updatedAt: Date.now(),
    };
  }

  async getNarratives(): Promise<Narrative[]> {
    await simulateLatency(100, 300);
    const universe = getUniverse();
    const ids: NarrativeId[] = ["ai", "meme", "rwa", "depin", "gaming"];
    return ids
      .map((id) => {
        const tokens = universe.filter((t) => t.narrative === id);
        const totalMarketCap = tokens.reduce((a, t) => a + t.marketCap, 0);
        const flow24h = tokens.reduce((a, t) => a + (t.change24h / 100) * t.marketCap * 0.18, 0);
        const flow7d = tokens.reduce((a, t) => a + (t.change7d / 100) * t.marketCap * 0.3, 0);
        const change24h =
          tokens.reduce((a, t) => a + t.change24h * t.marketCap, 0) / Math.max(1, totalMarketCap);
        const topTokenIds = [...tokens]
          .sort((a, b) => b.conviction.total - a.conviction.total)
          .slice(0, 3)
          .map((t) => t.id);
        return {
          id,
          name: NARRATIVE_NAMES[id],
          tokenCount: tokens.length,
          totalMarketCap,
          flow24h,
          flow7d,
          change24h,
          topTokenIds,
        };
      })
      .sort((a, b) => b.flow24h - a.flow24h);
  }

  async screenTokens(query: ScreenerQuery): Promise<Token[]> {
    await simulateLatency(150, 450);
    const { filter, sort, limit } = query;
    let rows = getUniverse().filter((t) => {
      if (filter.maxMarketCap !== undefined && t.marketCap > filter.maxMarketCap) return false;
      if (filter.minLiquidity !== undefined && t.liquidityUsd < filter.minLiquidity) return false;
      if (filter.maxAgeHours !== undefined && t.ageHours > filter.maxAgeHours) return false;
      if (filter.minVolume24h !== undefined && t.volume24h < filter.minVolume24h) return false;
      if (
        filter.maxRiskTier !== undefined &&
        RISK_ORDER[t.riskTier] > RISK_ORDER[filter.maxRiskTier]
      )
        return false;
      if (filter.chain && filter.chain !== "all" && t.chain !== filter.chain) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (
          !t.symbol.toLowerCase().includes(q) &&
          !t.name.toLowerCase().includes(q) &&
          !t.address.toLowerCase().startsWith(q)
        )
          return false;
      }
      return true;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    rows = rows.sort((a, b) => {
      const va = sort.key === "conviction" ? a.conviction.total : a[sort.key];
      const vb = sort.key === "conviction" ? b.conviction.total : b[sort.key];
      return (va - vb) * dir;
    });

    return limit ? rows.slice(0, limit) : rows;
  }

  async getToken(id: string): Promise<Token | null> {
    await simulateLatency(60, 180);
    return getUniverse().find((t) => t.id === id) ?? null;
  }

  async getTokens(ids: string[]): Promise<Token[]> {
    await simulateLatency(80, 240);
    const set = new Set(ids);
    return getUniverse().filter((t) => set.has(t.id));
  }

  async getCandles(tokenId: string, interval: CandleInterval): Promise<Candle[]> {
    await simulateLatency(150, 400);
    const token = getUniverse().find((t) => t.id === tokenId);
    if (!token) return [];

    // Deterministic random walk that ends at the current price.
    const r = rng(`candles-${tokenId}-${interval}`);
    const step = INTERVAL_SECONDS[interval];
    const count = 180;
    const now = Math.floor(Date.now() / 1000 / step) * step;

    // Walk backwards from current price
    const closes: number[] = [token.priceUsd];
    for (let i = 1; i < count; i++) {
      const drift = (r() - 0.5) * 0.06 + (token.change24h > 0 ? -0.004 : 0.004);
      closes.push(closes[i - 1] * (1 - drift));
    }
    closes.reverse();

    const candles: Candle[] = [];
    for (let i = 0; i < count; i++) {
      const time = now - (count - 1 - i) * step;
      const close = closes[i];
      const open = i === 0 ? close * (1 + (r() - 0.5) * 0.02) : closes[i - 1];
      const hi = Math.max(open, close) * (1 + r() * 0.025);
      const lo = Math.min(open, close) * (1 - r() * 0.025);
      candles.push({
        time,
        open,
        high: hi,
        low: lo,
        close,
        volume: (token.volume24h / (86400 / step)) * (0.4 + r() * 1.6),
      });
    }
    return candles;
  }

  async getNewLaunches(limit = 12): Promise<NewLaunch[]> {
    await simulateLatency(100, 280);
    const young = getUniverse()
      .filter((t) => t.ageHours < 48)
      .sort((a, b) => a.ageHours - b.ageHours)
      .slice(0, limit);
    return young.map((token) => ({
      token,
      launchedAt: Date.now() - token.ageHours * 3600_000,
      initialLiquidityUsd: token.liquidityUsd * 0.6,
    }));
  }

  async getTopMovers(limit = 49): Promise<Token[]> {
    await simulateLatency(120, 320);
    return [...getUniverse()]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, limit);
  }

  async getTopConviction(limit = 6): Promise<Token[]> {
    await simulateLatency(120, 350);
    return [...getUniverse()]
      .filter((t) => t.riskTier === "Low" || t.riskTier === "Moderate")
      .sort((a, b) => b.conviction.total - a.conviction.total)
      .slice(0, limit);
  }
}
