import {
  Candle,
  CandleInterval,
  GlobalMetrics,
  LaunchEvent,
  MarketDataSource,
  RISK_TIER_ORDER,
  ScreenerFilter,
  ScreenerSort,
  TickerAlert,
  TokenDetail,
  TokenSummary,
} from "../types";
import { getEngine, simulateLatency } from "./engine";

function applyFilter(tokens: TokenSummary[], filter?: ScreenerFilter): TokenSummary[] {
  if (!filter) return tokens;
  const now = Date.now();
  const search = filter.search?.trim().toLowerCase();
  return tokens.filter((t) => {
    if (filter.ids && !filter.ids.includes(t.id)) return false;
    if (filter.chains && filter.chains.length > 0 && !filter.chains.includes(t.chain)) return false;
    if (filter.maxMarketCapUsd !== undefined && t.marketCapUsd > filter.maxMarketCapUsd) return false;
    if (filter.minLiquidityUsd !== undefined && t.liquidityUsd < filter.minLiquidityUsd) return false;
    if (filter.minVolume24hUsd !== undefined && t.volume24hUsd < filter.minVolume24hUsd) return false;
    if (filter.maxAgeDays !== undefined) {
      const ageDays = (now - +new Date(t.createdAt)) / 86_400_000;
      if (ageDays > filter.maxAgeDays) return false;
    }
    if (filter.maxRiskTier !== undefined &&
      RISK_TIER_ORDER[t.riskTier] > RISK_TIER_ORDER[filter.maxRiskTier]) return false;
    if (search) {
      const hay = `${t.symbol} ${t.name} ${t.address}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function applySort(tokens: TokenSummary[], sort?: ScreenerSort): TokenSummary[] {
  if (!sort) return tokens;
  const dir = sort.dir === "asc" ? 1 : -1;
  const val = (t: TokenSummary): number => {
    if (sort.key === "composite") return t.score.composite;
    if (sort.key === "createdAt") return +new Date(t.createdAt);
    return t[sort.key];
  };
  return [...tokens].sort((a, b) => (val(a) - val(b)) * dir);
}

export const sampleMarketSource: MarketDataSource = {
  async getGlobalMetrics(): Promise<GlobalMetrics> {
    await simulateLatency(60, 180);
    return getEngine().getGlobalMetrics();
  },

  async listTokens(params): Promise<TokenSummary[]> {
    await simulateLatency(100, 320);
    const engine = getEngine();
    // structural clone so consumers can't mutate engine state
    let rows: TokenSummary[] = engine.tokens.map((t) => ({
      ...t,
      score: { ...t.score, components: t.score.components.map((c) => ({ ...c })) },
    }));
    rows = applyFilter(rows, params?.filter);
    rows = applySort(rows, params?.sort);
    if (params?.limit) rows = rows.slice(0, params.limit);
    return rows;
  },

  async getToken(id: string): Promise<TokenDetail | null> {
    await simulateLatency(90, 260);
    const engine = getEngine();
    const t = engine.getTokenById(id);
    return t ? engine.toDetail(t) : null;
  },

  async getCandles(tokenId: string, interval: CandleInterval): Promise<Candle[]> {
    await simulateLatency(140, 420);
    return getEngine().getCandles(tokenId, interval);
  },

  async getNewLaunches(limit = 14): Promise<LaunchEvent[]> {
    await simulateLatency(80, 220);
    return getEngine().getLaunches().slice(0, limit);
  },

  async getTickerAlerts(limit = 30): Promise<TickerAlert[]> {
    await simulateLatency(40, 120);
    return getEngine().getAlerts().slice(0, limit);
  },
};
