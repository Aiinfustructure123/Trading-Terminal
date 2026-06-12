import { RISK_TIER_ORDER } from "../types";
import type {
  AISource,
  AlertTickerItem,
  MarketDataSource,
  OnChainSource,
  ScreenerQuery,
  SecuritySource,
  SmartMoneySource,
  TokenSummary,
} from "../types";
import { hashSeed, seededRandom, sleep } from "@/lib/utils";
import {
  buildCandles,
  buildForensics,
  buildHolders,
  buildMarketPulse,
  buildMovers,
  buildNarratives,
  buildNewLaunches,
  buildResearchBrief,
  buildScenarios,
  buildSmartWallets,
  getTokenById,
  getUniverse,
} from "./generator";

/** Simulated network latency so loading states & skeletons get exercised. */
function latency(min = 120, max = 360) {
  return sleep(min + Math.random() * (max - min));
}

function applyQuery(tokens: TokenSummary[], q?: ScreenerQuery): TokenSummary[] {
  let out = tokens;
  if (!q) return out.slice(0, 1000);

  if (q.search) {
    const s = q.search.toLowerCase();
    out = out.filter(
      (t) => t.symbol.toLowerCase().includes(s) || t.name.toLowerCase().includes(s) || t.address.toLowerCase().includes(s),
    );
  }
  if (q.chain && q.chain !== "all") out = out.filter((t) => t.chain === q.chain);
  if (q.mcapMax != null) out = out.filter((t) => t.marketCapUsd <= q.mcapMax!);
  if (q.minLiquidity) out = out.filter((t) => t.liquidityUsd >= q.minLiquidity!);
  if (q.minVolume) out = out.filter((t) => t.volume24hUsd >= q.minVolume!);
  if (q.maxAgeDays != null) {
    const cutoff = Date.now() - q.maxAgeDays * 86400000;
    out = out.filter((t) => t.createdAt >= cutoff);
  }
  if (q.narrative) out = out.filter((t) => t.narrative === q.narrative);
  if (q.maxRiskTier) {
    const max = RISK_TIER_ORDER[q.maxRiskTier];
    out = out.filter((t) => RISK_TIER_ORDER[t.riskTier] <= max);
  }

  const dir = q.sortDir === "asc" ? 1 : -1;
  const key = q.sortBy ?? "conviction";
  out = [...out].sort((a, b) => {
    const av = sortValue(a, key);
    const bv = sortValue(b, key);
    return (av - bv) * dir;
  });

  return out.slice(0, q.limit ?? 1000);
}

function sortValue(t: TokenSummary, key: NonNullable<ScreenerQuery["sortBy"]>): number {
  switch (key) {
    case "conviction":
      return t.conviction.composite;
    case "change24h":
      return t.deltas.h24;
    case "priceUsd":
      return t.priceUsd;
    case "volume24hUsd":
      return t.volume24hUsd;
    case "liquidityUsd":
      return t.liquidityUsd;
    case "marketCapUsd":
      return t.marketCapUsd;
    case "holders":
      return t.holders;
    case "createdAt":
      return t.createdAt;
    default:
      return t.conviction.composite;
  }
}

export const sampleMarketSource: MarketDataSource = {
  async getMarketPulse() {
    await latency();
    return buildMarketPulse();
  },
  async getNarratives() {
    await latency();
    return buildNarratives();
  },
  async getTokens(query) {
    await latency(180, 450);
    return applyQuery(getUniverse(), query);
  },
  async getToken(id) {
    await latency(100, 240);
    return getTokenById(id);
  },
  async getNewLaunches(limit) {
    await latency();
    return buildNewLaunches(limit);
  },
  async getMovers(limit) {
    await latency();
    return buildMovers(limit);
  },
  async getCandles(id, timeframe) {
    await latency(150, 400);
    return buildCandles(id, timeframe);
  },
  async getAlertsTicker() {
    await latency();
    return buildAlertsTicker();
  },
};

export const sampleOnChainSource: OnChainSource = {
  async getHolders(id) {
    await latency(200, 500);
    return buildHolders(id);
  },
};

export const sampleSecuritySource: SecuritySource = {
  async getForensics(id) {
    await latency(200, 500);
    return buildForensics(id);
  },
};

export const sampleAISource: AISource = {
  async getResearchBrief(id) {
    await latency(400, 800);
    return buildResearchBrief(id);
  },
  async regenerateBrief(id) {
    await latency(900, 1600);
    return buildResearchBrief(id, Math.floor(Math.random() * 1e6));
  },
  async getScenarios(id) {
    await latency(200, 500);
    return buildScenarios(id);
  },
};

export const sampleSmartMoneySource: SmartMoneySource = {
  async getWallets() {
    await latency(250, 600);
    return buildSmartWallets();
  },
};

function buildAlertsTicker(): AlertTickerItem[] {
  const universe = getUniverse();
  const minute = Math.floor(Date.now() / 60000);
  const rng = seededRandom(hashSeed(`ticker-${minute}`));
  const templates: { sev: AlertTickerItem["severity"]; make: (t: TokenSummary) => string }[] = [
    { sev: "profit", make: (t) => `${t.symbol} momentum crossed 75 — conviction rising` },
    { sev: "danger", make: (t) => `${t.symbol} liquidity dropped 34% in 1h — rug early-warning` },
    { sev: "warn", make: (t) => `${t.symbol} risk tier worsened to ${t.riskTier}` },
    { sev: "info", make: (t) => `New launch detected: ${t.symbol} on ${t.chain}` },
    { sev: "profit", make: (t) => `${t.symbol} 24h volume up ${Math.abs(t.deltas.h24).toFixed(0)}%` },
    { sev: "warn", make: (t) => `${t.symbol} top-10 holders now control elevated supply share` },
  ];
  return Array.from({ length: 14 }, (_, i) => {
    const tok = universe[Math.floor(rng() * universe.length)]!;
    const tpl = templates[Math.floor(rng() * templates.length)]!;
    return {
      id: `tick-${minute}-${i}`,
      severity: tpl.sev,
      text: tpl.make(tok),
      timestamp: Date.now() - Math.floor(rng() * 3600000),
      tokenId: tok.id,
    };
  });
}
