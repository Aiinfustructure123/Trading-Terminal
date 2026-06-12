import type {
  AlertEvent,
  Candle,
  CandleInterval,
  MarketDataSource,
  MarketPulse,
  MoverCell,
  Narrative,
  NewLaunch,
  RiskTier,
  TokenDetail,
  TokenQuery,
  TokenSummary,
} from "@/lib/datasources/types";
import { computeConviction } from "@/lib/scoring/momentum";
import { computeRisk, RISK_ORDER } from "@/lib/scoring/risk";
import {
  drift,
  getUniverse,
  hashStr,
  mulberry32,
  NARRATIVES,
  range,
  type UniverseToken,
} from "@/lib/datasources/sample/rng";

/** Simulated network latency so loading states are real. */
function latency<T>(value: T, min = 180, max = 520): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function buildSummary(u: UniverseToken): TokenSummary {
  const priceDrift = drift(u.seed, 0.06);
  const priceUsd = u.basePrice * (1 + priceDrift);
  const marketCap = u.baseMarketCap * (1 + priceDrift);

  const change24h = drift(u.seed + 1, 0.35, 60000) * 100;
  const change6h = drift(u.seed + 2, 0.18, 30000) * 100;
  const change1h = drift(u.seed + 3, 0.08, 12000) * 100;
  const change5m = drift(u.seed + 4, 0.025, 6000) * 100;

  const volume24h = u.baseMarketCap * range(mulberry32(u.seed), 0.05, 1.2) * (1 + Math.abs(change24h) / 200);

  const forensics = computeRisk({
    mintAuthorityActive: u.mintAuthorityActive,
    freezeAuthorityActive: u.freezeAuthorityActive,
    lpLockedPct: u.lpLockedPct,
    top10Pct: u.top10Pct,
    buyTaxPct: u.buyTaxPct,
    sellTaxPct: u.sellTaxPct,
    isHoneypot: u.isHoneypot,
    liquidityUsd: u.liquidityUsd,
    ageHours: u.ageHours,
    creatorHoldingPct: u.creatorHoldingPct,
  });
  const riskInverse = 100 - RISK_ORDER[forensics.tier] * 28 - (u.top10Pct > 50 ? 8 : 0);

  const conviction = computeConviction({
    volumeAccel: u.volumeAccel,
    buySellRatio: u.buySellRatio,
    priceChange24h: change24h / 100,
    liquidityUsd: u.liquidityUsd,
    liqToMcap: u.liquidityUsd / u.baseMarketCap,
    holders: u.holders,
    holderGrowth: u.holderGrowth,
    volume24h,
    riskInverse: Math.max(0, riskInverse),
    smartMoney: u.smartMoney,
  });

  const totalTx = Math.round(volume24h / Math.max(priceUsd * 1000, 200));
  const buys24h = Math.round((totalTx * u.buySellRatio) / (1 + u.buySellRatio));
  const sells24h = Math.max(0, totalTx - buys24h);

  // 24-point sparkline ending at current price.
  const spark: number[] = [];
  const r = mulberry32(u.seed ^ 0xabcdef);
  let v = priceUsd / (1 + change24h / 100);
  for (let i = 0; i < 24; i++) {
    v = v * (1 + (r() - 0.5) * 0.06 + change24h / 100 / 24);
    spark.push(v);
  }
  spark[spark.length - 1] = priceUsd;

  return {
    address: u.address,
    chain: u.chain,
    symbol: u.symbol,
    name: u.name,
    accent: u.accent,
    priceUsd,
    change5m,
    change1h,
    change6h,
    change24h,
    volume24h,
    liquidityUsd: u.liquidityUsd,
    marketCap,
    fdv: marketCap * range(mulberry32(u.seed + 9), 1.0, 1.4),
    ageHours: u.ageHours,
    buys24h,
    sells24h,
    holders: u.holders,
    narrative: u.narrative,
    riskTier: forensics.tier,
    conviction,
    sparkline: spark,
  };
}

function buildDetail(u: UniverseToken): TokenDetail {
  const s = buildSummary(u);
  const explorer = u.chain === "solana" ? "https://solscan.io/token/" : "https://etherscan.io/token/";
  return {
    ...s,
    createdAt: u.createdAt,
    links: [
      { label: "Explorer", url: explorer + u.address },
      { label: "DexScreener", url: `https://dexscreener.com/${u.chain}/${u.address}` },
      { label: "Website", url: "#" },
      { label: "X / Twitter", url: "#" },
    ],
  };
}

function tierLeq(tier: RiskTier, max: RiskTier): boolean {
  return RISK_ORDER[tier] <= RISK_ORDER[max];
}

export const sampleMarketSource: MarketDataSource = {
  async getMarketPulse(): Promise<MarketPulse> {
    const base = 2_380_000_000_000;
    const mcapDrift = drift(101, 0.02, 90000);
    const fg = Math.round(58 + drift(202, 22, 120000));
    const fgClamped = Math.max(2, Math.min(98, fg));
    const fgLabel =
      fgClamped < 25 ? "Extreme Fear" : fgClamped < 45 ? "Fear" : fgClamped < 55 ? "Neutral" : fgClamped < 75 ? "Greed" : "Extreme Greed";
    return latency({
      totalMarketCap: base * (1 + mcapDrift),
      mcapChange24h: drift(101, 4.5, 90000),
      totalVolume24h: 128_000_000_000 * (1 + drift(303, 0.08, 60000)),
      volChange24h: drift(303, 9, 60000),
      btcDominance: 54.2 + drift(404, 0.6, 120000),
      btcDominanceChange24h: drift(404, 0.4, 120000),
      fearGreed: fgClamped,
      fearGreedLabel: fgLabel,
    });
  },

  async getNarratives(): Promise<Narrative[]> {
    const uni = getUniverse();
    const list: Narrative[] = NARRATIVES.map((name, idx) => {
      const members = uni.filter((u) => u.narrative === name);
      const marketCap = members.reduce((sum, u) => sum + u.baseMarketCap, 0);
      const top = [...members].sort((a, b) => b.baseMarketCap - a.baseMarketCap).slice(0, 4).map((u) => u.symbol);
      return {
        id: name.toLowerCase(),
        name,
        marketCap,
        flow24h: Math.round(drift(hashStr(name) + 1, 60, 70000)),
        flow7d: Math.round(drift(hashStr(name) + 2, 50, 200000)),
        tokenCount: members.length,
        topSymbols: top,
      };
    });
    return latency(list.sort((a, b) => b.flow24h - a.flow24h));
  },

  async getTokens(query: TokenQuery = {}): Promise<TokenSummary[]> {
    const uni = getUniverse();
    let rows = uni.map(buildSummary);
    if (query.chain && query.chain !== "all") rows = rows.filter((r) => r.chain === query.chain);
    if (query.maxMarketCap) rows = rows.filter((r) => r.marketCap <= query.maxMarketCap!);
    if (query.minLiquidity) rows = rows.filter((r) => r.liquidityUsd >= query.minLiquidity!);
    if (query.maxAgeHours) rows = rows.filter((r) => r.ageHours <= query.maxAgeHours!);
    if (query.minVolume24h) rows = rows.filter((r) => r.volume24h >= query.minVolume24h!);
    if (query.maxRiskTier) rows = rows.filter((r) => tierLeq(r.riskTier, query.maxRiskTier!));
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((r) => r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q));
    }
    rows.sort((a, b) => b.conviction.composite - a.conviction.composite);
    if (query.limit) rows = rows.slice(0, query.limit);
    return latency(rows, 220, 620);
  },

  async getToken(address: string): Promise<TokenDetail | null> {
    const u = getUniverse().find((t) => t.address === address);
    return latency(u ? buildDetail(u) : null);
  },

  async getCandles(address: string, interval: CandleInterval): Promise<Candle[]> {
    const u = getUniverse().find((t) => t.address === address);
    if (!u) return latency([]);
    const stepSec = interval === "15m" ? 900 : interval === "1h" ? 3600 : interval === "4h" ? 14400 : 86400;
    const count = 160;
    const r = mulberry32(u.seed ^ hashStr(interval));
    const out: Candle[] = [];
    const now = Math.floor(Date.now() / 1000);
    let price = u.basePrice * 0.6;
    const trend = (u.volumeAccel - 1) * 0.004;
    for (let i = count; i > 0; i--) {
      const time = now - i * stepSec;
      const vol = 0.02 + (u.baseMarketCap < 1_000_000 ? 0.05 : 0.02);
      const open = price;
      const change = (r() - 0.5) * vol + trend;
      const close = Math.max(open * (1 + change), open * 0.5);
      const high = Math.max(open, close) * (1 + r() * vol * 0.5);
      const low = Math.min(open, close) * (1 - r() * vol * 0.5);
      const volume = u.baseMarketCap * (0.01 + r() * 0.06);
      out.push({ time, open, high, low, close, volume });
      price = close;
    }
    return latency(out, 200, 450);
  },

  async getNewLaunches(): Promise<NewLaunch[]> {
    const uni = getUniverse().filter((u) => u.ageHours < 72);
    const sorted = [...uni].sort((a, b) => a.ageHours - b.ageHours).slice(0, 40);
    // Rotate slightly over time to feel live.
    const offset = Math.floor(Date.now() / 5000) % 6;
    const list: NewLaunch[] = sorted.slice(offset, offset + 18).map((u) => {
      const f = computeRisk({
        mintAuthorityActive: u.mintAuthorityActive,
        freezeAuthorityActive: u.freezeAuthorityActive,
        lpLockedPct: u.lpLockedPct,
        top10Pct: u.top10Pct,
        buyTaxPct: u.buyTaxPct,
        sellTaxPct: u.sellTaxPct,
        isHoneypot: u.isHoneypot,
        liquidityUsd: u.liquidityUsd,
        ageHours: u.ageHours,
        creatorHoldingPct: u.creatorHoldingPct,
      });
      return {
        address: u.address,
        chain: u.chain,
        symbol: u.symbol,
        name: u.name,
        accent: u.accent,
        ageMinutes: Math.round(u.ageHours * 60),
        liquidityUsd: u.liquidityUsd,
        riskTier: f.tier,
      };
    });
    return latency(list, 150, 400);
  },

  async getMovers(): Promise<MoverCell[]> {
    const rows = getUniverse().map(buildSummary);
    const top = [...rows].sort((a, b) => b.marketCap - a.marketCap).slice(0, 40);
    return latency(
      top.map((r) => ({
        address: r.address,
        symbol: r.symbol,
        marketCap: r.marketCap,
        change24h: r.change24h,
        narrative: r.narrative,
      })),
    );
  },

  async getTopOpportunities(limit = 8): Promise<TokenSummary[]> {
    const rows = getUniverse()
      .filter((u) => u.ageHours < 24 * 30 && u.baseMarketCap < 25_000_000)
      .map(buildSummary)
      .filter((r) => RISK_ORDER[r.riskTier] <= RISK_ORDER.Moderate);
    rows.sort((a, b) => b.conviction.composite - a.conviction.composite);
    return latency(rows.slice(0, limit));
  },

  async getAlerts(): Promise<AlertEvent[]> {
    const rows = getUniverse().map(buildSummary);
    const now = Date.now();
    const out: AlertEvent[] = [];
    const r = mulberry32(Math.floor(now / 8000));
    const sample = [...rows].sort(() => r() - 0.5).slice(0, 14);
    for (const t of sample) {
      const roll = r();
      let severity: AlertEvent["severity"] = "info";
      let message = "";
      if (t.change24h > 25) {
        severity = "profit";
        message = `${t.symbol} momentum surging — conviction ${t.conviction.composite}, +${t.change24h.toFixed(0)}% 24h`;
      } else if (t.change24h < -25) {
        severity = "danger";
        message = `${t.symbol} drawdown −${Math.abs(t.change24h).toFixed(0)}% 24h — review risk`;
      } else if (t.riskTier === "High" || t.riskTier === "Avoid") {
        severity = "caution";
        message = `${t.symbol} flagged ${t.riskTier} risk — ${t.riskTier === "Avoid" ? "honeypot/mint signal" : "concentration/LP signal"}`;
      } else if (roll < 0.5) {
        severity = "info";
        message = `${t.symbol} liquidity $${Math.round(t.liquidityUsd).toLocaleString()} • vol $${Math.round(t.volume24h).toLocaleString()}`;
      } else {
        severity = "profit";
        message = `${t.symbol} buy/sell pressure rising — ${t.buys24h} buys vs ${t.sells24h} sells`;
      }
      out.push({ id: `${t.address}-${Math.floor(now / 8000)}`, time: now - Math.floor(r() * 600000), severity, message, tokenSymbol: t.symbol });
    }
    return latency(out.sort((a, b) => b.time - a.time), 120, 300);
  },
};
