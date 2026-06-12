import { clamp, hashSeed, seededRandom } from "@/lib/utils";
import type {
  Candle,
  Chain,
  ConvictionScore,
  CreatorStatus,
  ForensicsReport,
  HolderDistribution,
  MarketPulse,
  MoverCell,
  Narrative,
  NarrativeKey,
  ResearchBrief,
  RiskFlag,
  RiskTier,
  Scenario,
  ScoreComponent,
  SmartWallet,
  Timeframe,
  TokenSummary,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Static vocab for believable sample data
// ─────────────────────────────────────────────────────────────────────────────

const CHAINS: Chain[] = ["solana", "base", "ethereum"];

const ACCENTS = [
  "#5CE1E6",
  "#3DDC97",
  "#FFB020",
  "#FF4D5E",
  "#8B5CF6",
  "#F472B6",
  "#38BDF8",
  "#FBBF24",
  "#34D399",
  "#A78BFA",
];

const NARRATIVES: { key: NarrativeKey; label: string }[] = [
  { key: "AI", label: "Artificial Intelligence" },
  { key: "Meme", label: "Memecoins" },
  { key: "RWA", label: "Real-World Assets" },
  { key: "DePIN", label: "DePIN" },
  { key: "Gaming", label: "Gaming" },
  { key: "DeFi", label: "DeFi" },
];

const NAME_PREFIX: Record<NarrativeKey, string[]> = {
  AI: ["Neural", "Cortex", "Synapse", "Oracle", "Sentient", "Quanta", "Cipher", "Logos", "Mind", "Axon"],
  Meme: ["Turbo", "Wojak", "Pepe", "Chad", "Doge", "Floki", "Bonk", "Mog", "Giga", "Based"],
  RWA: ["Tangible", "Ledger", "Bullion", "Estate", "Treasury", "Vault", "Bond", "Asset", "Carbon", "Solar"],
  DePIN: ["Helix", "Mesh", "Grid", "Pulse", "Relay", "Beacon", "Sensor", "Node", "Wave", "Photon"],
  Gaming: ["Pixel", "Arcade", "Quest", "Loot", "Realm", "Forge", "Saga", "Vortex", "Nexus", "Glory"],
  DeFi: ["Yield", "Stake", "Vault", "Lend", "Swap", "Perp", "Liquid", "Curve", "Aave", "Delta"],
};

const NAME_SUFFIX = ["Protocol", "Network", "Finance", "AI", "Labs", "DAO", "X", "Core", "Engine", "OS", ""];

// ─────────────────────────────────────────────────────────────────────────────
// Address helpers
// ─────────────────────────────────────────────────────────────────────────────

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HEX = "0123456789abcdef";

function makeAddress(rng: () => number, chain: Chain): string {
  if (chain === "solana") {
    let s = "";
    for (let i = 0; i < 44; i++) s += B58[Math.floor(rng() * B58.length)];
    return s;
  }
  let s = "0x";
  for (let i = 0; i < 40; i++) s += HEX[Math.floor(rng() * HEX.length)];
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conviction scoring (sample heuristic; real version lands in lib/scoring/*)
// ─────────────────────────────────────────────────────────────────────────────

export const SCORE_WEIGHTS: Record<ScoreComponent["key"], number> = {
  momentum: 0.28,
  volume: 0.18,
  liquidity: 0.16,
  holders: 0.14,
  smartMoney: 0.1,
  riskInverse: 0.14,
};

const COMPONENT_LABELS: Record<ScoreComponent["key"], string> = {
  momentum: "Momentum",
  volume: "Volume",
  liquidity: "Liquidity",
  holders: "Holders",
  smartMoney: "Smart Money",
  riskInverse: "Risk-Inverse",
};

function buildConviction(
  rng: () => number,
  inputs: {
    deltas: { h1: number; h24: number };
    volume24hUsd: number;
    liquidityUsd: number;
    holders: number;
    buyRatio: number;
    riskScore: number;
  },
): ConvictionScore {
  const { deltas, volume24hUsd, liquidityUsd, holders, buyRatio, riskScore } = inputs;

  const volAccel = 60 + clamp((deltas.h24 + deltas.h1) * 1.2, -40, 38) + (rng() * 8 - 4);
  const volScore = clamp(Math.log10(Math.max(volume24hUsd, 1)) * 12 - 30 + rng() * 10, 2, 99);
  const liqScore = clamp(Math.log10(Math.max(liquidityUsd, 1)) * 13 - 40 + rng() * 8, 2, 99);
  const holderScore = clamp(Math.log10(Math.max(holders, 1)) * 22 - 18 + rng() * 8, 2, 99);
  const smartScore = clamp(20 + rng() * 70 + (buyRatio - 0.5) * 40, 2, 99);
  const riskInverse = clamp(100 - riskScore + (rng() * 8 - 4), 2, 99);

  const raw: Record<ScoreComponent["key"], { score: number; rawLabel: string; explanation: string }> = {
    momentum: {
      score: clamp(volAccel, 1, 99),
      rawLabel: `1h ${fmtPct(deltas.h1)} · 24h ${fmtPct(deltas.h24)}`,
      explanation:
        deltas.h24 > 8
          ? "Volume accelerating with higher-highs on the 1h structure."
          : deltas.h24 < -8
            ? "Price structure breaking down; lower-lows on the 1h."
            : "Range-bound; no decisive momentum either direction.",
    },
    volume: {
      score: volScore,
      rawLabel: `$${compact(volume24hUsd)} 24h`,
      explanation:
        volScore > 65
          ? "24h volume well above the trailing 7d average."
          : "24h volume near or below the trailing 7d average.",
    },
    liquidity: {
      score: liqScore,
      rawLabel: `$${compact(liquidityUsd)} pooled`,
      explanation:
        liqScore > 60
          ? "Deep enough liquidity to absorb mid-size orders without heavy slippage."
          : "Thin liquidity — exits of any size will move price materially.",
    },
    holders: {
      score: holderScore,
      rawLabel: `${compact(holders)} holders`,
      explanation:
        holderScore > 55
          ? "Holder base growing steadily; distribution widening."
          : "Small holder base; growth not yet established.",
    },
    smartMoney: {
      score: smartScore,
      rawLabel: `buy/sell ${(buyRatio * 100).toFixed(0)}/${((1 - buyRatio) * 100).toFixed(0)}`,
      explanation:
        smartScore > 60
          ? "Tracked wallets net accumulating over the last 24h (SAMPLE)."
          : "No notable tracked-wallet accumulation (SAMPLE).",
    },
    riskInverse: {
      score: riskInverse,
      rawLabel: `risk score ${riskScore.toFixed(0)}/100`,
      explanation:
        riskInverse > 70
          ? "Few or no forensic flags; authorities renounced, LP locked."
          : riskInverse > 45
            ? "Some forensic concerns present; review the flag list."
            : "Significant forensic flags — treat with caution.",
    },
  };

  const components: ScoreComponent[] = (Object.keys(SCORE_WEIGHTS) as ScoreComponent["key"][]).map((key) => ({
    key,
    label: COMPONENT_LABELS[key],
    score: Math.round(raw[key].score),
    weight: SCORE_WEIGHTS[key],
    rawLabel: raw[key].rawLabel,
    explanation: raw[key].explanation,
  }));

  const composite = Math.round(components.reduce((acc, c) => acc + c.score * c.weight, 0));

  return { composite, components, updatedAt: Date.now() };
}

function riskTierFromScore(riskScore: number, hasMint: boolean): RiskTier {
  if (hasMint && riskScore > 45) return "Avoid";
  if (riskScore >= 70) return "Avoid";
  if (riskScore >= 45) return "High";
  if (riskScore >= 22) return "Moderate";
  return "Low";
}

// ─────────────────────────────────────────────────────────────────────────────
// Token universe (deterministic, memoized)
// ─────────────────────────────────────────────────────────────────────────────

const UNIVERSE_SIZE = 1200;
let universeCache: TokenSummary[] | null = null;

function fmtPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}
function compact(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(0);
}

function buildToken(index: number): TokenSummary {
  const rng = seededRandom(hashSeed(`alpha-token-${index}`));
  const chain = CHAINS[Math.floor(rng() * (index % 7 === 0 ? CHAINS.length : 1))] ?? "solana";
  const narrativeDef = NARRATIVES[Math.floor(rng() * NARRATIVES.length)]!;
  const narrative = narrativeDef.key;

  const prefixes = NAME_PREFIX[narrative];
  const prefix = prefixes[Math.floor(rng() * prefixes.length)]!;
  const suffix = NAME_SUFFIX[Math.floor(rng() * NAME_SUFFIX.length)]!;
  const name = suffix ? `${prefix} ${suffix}` : prefix;
  const symbol = (prefix.slice(0, 4) + (rng() > 0.6 ? Math.floor(rng() * 9) : "")).toUpperCase();

  const address = makeAddress(rng, chain);
  const accent = ACCENTS[Math.floor(rng() * ACCENTS.length)]!;

  // Age: skew toward fresh tokens, some old
  const ageRoll = rng();
  const ageDays = ageRoll < 0.45 ? rng() * 7 : ageRoll < 0.8 ? 7 + rng() * 60 : 60 + rng() * 600;
  const createdAt = Date.now() - ageDays * 86400000;

  // Market structure
  const mcapRoll = rng();
  const marketCapUsd =
    mcapRoll < 0.35
      ? 20_000 + rng() * 480_000
      : mcapRoll < 0.6
        ? 500_000 + rng() * 1_500_000
        : mcapRoll < 0.82
          ? 2_000_000 + rng() * 23_000_000
          : 25_000_000 + rng() * 900_000_000;

  const liquidityUsd = marketCapUsd * (0.04 + rng() * 0.22);
  const volume24hUsd = marketCapUsd * (0.05 + rng() * 1.8);
  const fdvUsd = marketCapUsd * (1 + rng() * 0.8);
  const priceUsd = (0.0000001 + rng() * 0.4) * (mcapRoll > 0.82 ? 50 : 1);

  const trend = (rng() - 0.45) * 2; // -0.9..1.1
  const vol = 4 + rng() * 30;
  const deltas = {
    m5: +(trend * vol * 0.08 + (rng() - 0.5) * 3).toFixed(2),
    h1: +(trend * vol * 0.25 + (rng() - 0.5) * 5).toFixed(2),
    h6: +(trend * vol * 0.6 + (rng() - 0.5) * 8).toFixed(2),
    h24: +(trend * vol + (rng() - 0.5) * 10).toFixed(2),
  };

  const buyRatio = clamp(0.5 + trend * 0.18 + (rng() - 0.5) * 0.2, 0.18, 0.86);
  const txTotal = Math.floor(50 + volume24hUsd / (200 + rng() * 4000));
  const txns24h = {
    buys: Math.floor(txTotal * buyRatio),
    sells: Math.floor(txTotal * (1 - buyRatio)),
  };

  const holders = Math.floor(
    30 + Math.sqrt(marketCapUsd) * (0.4 + rng() * 1.2) + (ageDays > 7 ? rng() * 4000 : rng() * 400),
  );

  // Risk score 0..100 (higher = worse). Young + thin liq + concentrated => risky.
  const hasMint = rng() < (ageDays < 7 ? 0.28 : 0.08);
  let riskScore =
    (ageDays < 3 ? 22 : ageDays < 7 ? 12 : 0) +
    (liquidityUsd < 30_000 ? 26 : liquidityUsd < 120_000 ? 12 : 0) +
    (hasMint ? 28 : 0) +
    rng() * 26;
  riskScore = clamp(riskScore, 2, 96);

  const conviction = buildConviction(rng, {
    deltas,
    volume24hUsd,
    liquidityUsd,
    holders,
    buyRatio,
    riskScore,
  });

  const riskTier = riskTierFromScore(riskScore, hasMint);

  return {
    id: address,
    address,
    chain,
    symbol,
    name,
    accent,
    priceUsd,
    deltas,
    volume24hUsd,
    liquidityUsd,
    marketCapUsd,
    fdvUsd,
    createdAt,
    txns24h,
    holders,
    riskTier,
    conviction,
    narrative,
  };
}

export function getUniverse(): TokenSummary[] {
  if (!universeCache) {
    universeCache = Array.from({ length: UNIVERSE_SIZE }, (_, i) => buildToken(i));
  }
  return universeCache;
}

export function getTokenById(id: string): TokenSummary | null {
  return getUniverse().find((t) => t.id === id || t.symbol.toLowerCase() === id.toLowerCase()) ?? null;
}

// Risk meta cached separately so forensics & holders stay consistent with the token.
function tokenRng(id: string, salt: string) {
  return seededRandom(hashSeed(`${id}:${salt}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// Market pulse / narratives / movers / launches / candles
// ─────────────────────────────────────────────────────────────────────────────

export function buildMarketPulse(): MarketPulse {
  // Vary slightly each minute so the terminal feels alive, but stay deterministic per-minute.
  const minute = Math.floor(Date.now() / 60000);
  const rng = seededRandom(hashSeed(`pulse-${minute}`));
  const fg = Math.round(38 + rng() * 40);
  const fgLabel =
    fg < 25 ? "Extreme Fear" : fg < 45 ? "Fear" : fg < 55 ? "Neutral" : fg < 75 ? "Greed" : "Extreme Greed";
  return {
    totalMarketCapUsd: 2.31e12 + (rng() - 0.5) * 4e10,
    totalMarketCapChange24h: +((rng() - 0.45) * 6).toFixed(2),
    volume24hUsd: 9.4e10 + (rng() - 0.5) * 8e9,
    volume24hChange: +((rng() - 0.5) * 18).toFixed(2),
    btcDominance: +(52 + (rng() - 0.5) * 2).toFixed(2),
    btcDominanceChange: +((rng() - 0.5) * 1.2).toFixed(2),
    fearGreed: { value: fg, label: fgLabel },
    updatedAt: Date.now(),
  };
}

export function buildNarratives(): Narrative[] {
  const universe = getUniverse();
  return NARRATIVES.map((def) => {
    const rng = seededRandom(hashSeed(`narrative-${def.key}-${Math.floor(Date.now() / 60000)}`));
    const tokens = universe.filter((t) => t.narrative === def.key);
    const marketCapUsd = tokens.reduce((acc, t) => acc + t.marketCapUsd, 0);
    const topSymbols = [...tokens]
      .sort((a, b) => b.conviction.composite - a.conviction.composite)
      .slice(0, 4)
      .map((t) => t.symbol);
    return {
      key: def.key,
      label: def.label,
      marketCapUsd,
      flow24h: +((rng() - 0.4) * 40).toFixed(1),
      flow7d: +((rng() - 0.4) * 90).toFixed(1),
      tokenCount: tokens.length,
      topSymbols,
    };
  }).sort((a, b) => b.flow24h - a.flow24h);
}

export function buildMovers(limit = 40): MoverCell[] {
  return [...getUniverse()]
    .sort((a, b) => b.marketCapUsd - a.marketCapUsd)
    .slice(0, limit)
    .map((t) => ({ id: t.id, symbol: t.symbol, marketCapUsd: t.marketCapUsd, change24h: t.deltas.h24 }));
}

export function buildNewLaunches(limit = 20): TokenSummary[] {
  return [...getUniverse()]
    .filter((t) => Date.now() - t.createdAt < 7 * 86400000)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

const TF_SECONDS: Record<Timeframe, number> = {
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

export function buildCandles(id: string, timeframe: Timeframe, count = 180): Candle[] {
  const token = getTokenById(id);
  const rng = tokenRng(id, `candles-${timeframe}`);
  const step = TF_SECONDS[timeframe];
  const nowSec = Math.floor(Date.now() / 1000);
  const start = nowSec - count * step;
  let price = (token?.priceUsd ?? 0.01) / (1 + (token?.deltas.h24 ?? 0) / 100 + 0.0001);
  const drift = ((token?.deltas.h24 ?? 0) / 100 / count) * 1.4;
  const candles: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const time = start + i * step;
    const open = price;
    const noise = (rng() - 0.5) * 0.06 + drift;
    const close = Math.max(open * (1 + noise), 1e-9);
    const high = Math.max(open, close) * (1 + rng() * 0.03);
    const low = Math.min(open, close) * (1 - rng() * 0.03);
    const volume = (token?.volume24hUsd ?? 1e5) / (count / 3) * (0.4 + rng());
    candles.push({
      time,
      open: +open.toPrecision(6),
      high: +high.toPrecision(6),
      low: +low.toPrecision(6),
      close: +close.toPrecision(6),
      volume: Math.round(volume),
    });
    price = close;
  }
  return candles;
}

// ─────────────────────────────────────────────────────────────────────────────
// Holders / forensics / AI / smart money
// ─────────────────────────────────────────────────────────────────────────────

export function buildHolders(id: string): HolderDistribution {
  const token = getTokenById(id);
  const rng = tokenRng(id, "holders");
  const total = token?.holders ?? Math.floor(200 + rng() * 5000);
  const top10Pct = +clamp(12 + rng() * 55 + (token?.riskTier === "Avoid" ? 20 : 0), 8, 92).toFixed(1);
  const creatorPct = +clamp(rng() * (token?.riskTier === "Low" ? 4 : 18), 0, 30).toFixed(1);
  const statuses: CreatorStatus[] = ["holding", "sold", "partial", "unknown"];
  const creatorStatus = statuses[Math.floor(rng() * statuses.length)]!;

  const buckets = [
    { label: "Top 10", pct: top10Pct },
    { label: "11–50", pct: +clamp(15 + rng() * 20, 5, 35).toFixed(1) },
    { label: "51–250", pct: +clamp(10 + rng() * 18, 4, 28).toFixed(1) },
  ];
  const rest = +clamp(100 - buckets.reduce((a, b) => a + b.pct, 0), 1, 80).toFixed(1);
  buckets.push({ label: "Rest", pct: rest });

  const labels = ["", "", "", "CEX hot wallet", "LP pool", "Team (vesting)", "Market maker"];
  const topHolders = Array.from({ length: 10 }, (_, i) => {
    const r = tokenRng(id, `holder-${i}`);
    const pct = +clamp((top10Pct / 10) * (1.8 - i * 0.12) * (0.6 + r() * 0.8), 0.2, 30).toFixed(2);
    return {
      rank: i + 1,
      address: makeAddress(r, token?.chain ?? "solana"),
      pct,
      label: r() < 0.3 ? labels[Math.floor(r() * labels.length)]! || undefined : undefined,
    };
  });

  return { totalHolders: total, top10Pct, creatorPct, creatorStatus, buckets, topHolders, updatedAt: Date.now() };
}

export function buildForensics(id: string): ForensicsReport {
  const token = getTokenById(id);
  const rng = tokenRng(id, "forensics");
  const tier = token?.riskTier ?? "Moderate";
  const risky = tier === "High" || tier === "Avoid";

  const mintAuthority = rng() < (risky ? 0.55 : 0.1);
  const freezeAuthority = rng() < (risky ? 0.4 : 0.06);
  const honeypot = tier === "Avoid" && rng() < 0.25;
  const lpLockedPct = +clamp((risky ? rng() * 60 : 60 + rng() * 40), 0, 100).toFixed(0);
  const lpLocked = lpLockedPct > 80;
  const buyTaxPct = +(risky ? rng() * 12 : rng() * 3).toFixed(1);
  const sellTaxPct = +(risky ? rng() * 18 : rng() * 4).toFixed(1);

  const flags: RiskFlag[] = [
    {
      id: "mint",
      label: "Mint authority",
      severity: mintAuthority ? "high" : "pass",
      value: mintAuthority ? "Active" : "Renounced",
      explanation: mintAuthority
        ? "Deployer can mint new supply at will, diluting holders. Active mint = High risk minimum."
        : "Mint authority renounced — total supply is fixed.",
    },
    {
      id: "freeze",
      label: "Freeze authority",
      severity: freezeAuthority ? "high" : "pass",
      value: freezeAuthority ? "Active" : "Renounced",
      explanation: freezeAuthority
        ? "Deployer can freeze token accounts, preventing holders from selling."
        : "Freeze authority renounced — accounts cannot be frozen.",
    },
    {
      id: "lp",
      label: "LP lock",
      severity: lpLocked ? "pass" : lpLockedPct > 40 ? "medium" : "high",
      value: `${lpLockedPct}% locked`,
      explanation: lpLocked
        ? "Majority of liquidity is locked or burned — reduces rug risk."
        : "Liquidity is largely unlocked; it could be pulled at any time.",
    },
    {
      id: "tax",
      label: "Transfer tax",
      severity: buyTaxPct + sellTaxPct > 12 ? "medium" : buyTaxPct + sellTaxPct > 0 ? "low" : "pass",
      value: `buy ${buyTaxPct}% / sell ${sellTaxPct}%`,
      explanation:
        buyTaxPct + sellTaxPct > 12
          ? "High transfer tax erodes returns and can mask honeypot behavior."
          : buyTaxPct + sellTaxPct > 0
            ? "Modest transfer tax present — factor it into entry/exit math."
            : "No transfer tax detected.",
    },
    {
      id: "honeypot",
      label: "Honeypot simulation",
      severity: honeypot ? "critical" : "pass",
      value: honeypot ? "Cannot sell" : "Sellable",
      explanation: honeypot
        ? "Sell simulation failed — buyers may be unable to exit. Treat as Avoid."
        : "Sell simulation succeeded against current pool state.",
    },
    {
      id: "concentration",
      label: "Holder concentration",
      severity: risky ? "medium" : "low",
      explanation: risky
        ? "Top wallets control a large share of supply; coordinated selling can crater price."
        : "Supply reasonably distributed across the holder base.",
    },
  ];

  return {
    tier,
    flags,
    mintAuthority,
    freezeAuthority,
    lpLocked,
    lpLockedPct,
    buyTaxPct,
    sellTaxPct,
    honeypot,
    updatedAt: Date.now(),
  };
}

export function buildResearchBrief(id: string, regenSalt = 0): ResearchBrief {
  const token = getTokenById(id);
  const rng = tokenRng(id, `brief-${regenSalt}`);
  const sym = token?.symbol ?? "TOKEN";
  const up = (token?.deltas.h24 ?? 0) > 0;
  const conv = token?.conviction.composite ?? 50;

  return {
    tokenId: id,
    generatedAt: Date.now(),
    model: "sample-brief-engine",
    sections: {
      executiveSummary: `${sym} carries a composite conviction of ${conv}/100 driven primarily by ${
        token?.conviction.components.sort((a, b) => b.score * b.weight - a.score * a.weight)[0]?.label.toLowerCase() ??
        "momentum"
      }. Over the last 24h price moved ${fmtPct(token?.deltas.h24 ?? 0)} on $${compact(
        token?.volume24hUsd ?? 0,
      )} of volume. This brief summarizes only observable on-chain and market data — it is not a price forecast.`,
      whatTheDataShows: [
        `24h volume of $${compact(token?.volume24hUsd ?? 0)} against $${compact(
          token?.liquidityUsd ?? 0,
        )} of pooled liquidity (turnover ≈ ${((token?.volume24hUsd ?? 0) / Math.max(token?.liquidityUsd ?? 1, 1)).toFixed(1)}x).`,
        `Buy/sell transaction split of ${token?.txns24h.buys ?? 0}/${token?.txns24h.sells ?? 0} over 24h.`,
        `${compact(token?.holders ?? 0)} holders; risk tier currently ${token?.riskTier ?? "Moderate"}.`,
        `Market cap $${compact(token?.marketCapUsd ?? 0)} versus FDV $${compact(token?.fdvUsd ?? 0)}.`,
      ],
      bullCase: [
        up
          ? "Momentum and volume are aligned positively in the most recent window."
          : "Liquidity-to-mcap ratio leaves room for momentum to re-accelerate if volume returns.",
        "Holder count is non-trivial for an asset of this age, suggesting organic distribution.",
        rng() > 0.5
          ? "Sits within a narrative attracting net capital inflow this week (see Trending Narratives)."
          : "Buy-side transactions outpace sells in the latest 24h window.",
      ],
      bearCase: [
        token && token.liquidityUsd < 80_000
          ? "Liquidity is thin; even modest exits will move price sharply."
          : "Volume could be partly wash/MM activity rather than genuine demand.",
        !up
          ? "Recent price structure is making lower-highs on the 1h timeframe."
          : "Gains may be front-run by early holders looking to distribute into strength.",
        "Composite score depends on sample smart-money signals not yet validated against live data.",
      ],
      keyRisks: [
        token?.riskTier === "Avoid" || token?.riskTier === "High"
          ? "Forensic flags present — review mint authority and LP lock before any position."
          : "Standard small-cap volatility and liquidity risk apply.",
        "No price prediction is implied; relative ranking only.",
      ],
      whatWouldChangeThePicture: [
        "A sustained break of the prior 24h high on rising volume would strengthen momentum.",
        "Liquidity dropping >30% in 1h would trigger the rug early-warning and invalidate the thesis.",
        "Mint or freeze authority changing state would force a risk-tier re-evaluation.",
      ],
    },
  };
}

export function buildScenarios(id: string): Scenario[] {
  const token = getTokenById(id);
  const price = token?.priceUsd ?? 0.01;
  const vol = token?.volume24hUsd ?? 1e5;
  const liq = token?.liquidityUsd ?? 1e5;
  return [
    {
      kind: "bull",
      title: "Bull",
      conditions: [
        `24h volume sustains above $${compact(vol * 1.5)}`,
        `Liquidity grows past $${compact(liq * 1.4)}`,
        "Buy/sell ratio stays above 55% for 6h+",
      ],
      implication: "Conditions consistent with continued accumulation and momentum expansion.",
    },
    {
      kind: "base",
      title: "Base",
      conditions: [
        `Volume oscillates around the current $${compact(vol)}`,
        "No change to mint/freeze authority or LP lock",
        `Price holds the ${price < 1 ? "current sub-$1" : "current"} range`,
      ],
      implication: "Range-bound consolidation; conviction score drifts with volume.",
    },
    {
      kind: "bear",
      title: "Bear",
      conditions: [
        `24h volume falls below $${compact(vol * 0.5)}`,
        "Liquidity drops >30% in 1h (rug early-warning)",
        "Buy/sell ratio inverts below 45%",
      ],
      implication: "Conditions consistent with distribution and elevated exit risk.",
    },
  ];
}

export function buildSmartWallets(): SmartWallet[] {
  const labels = [
    "Solana Sniper 01",
    "Memecoin Maxi",
    "Early LP Provider",
    "Whale 0xCC",
    "Rotation Desk",
    "Diamond Hands",
    "Cohort Alpha",
    "Quant Bot 7",
    "Narrative Trader",
    "Liquidity Hunter",
    "Genesis Wallet",
    "Cycle Veteran",
  ];
  const universe = getUniverse();
  return labels.map((label, i) => {
    const rng = seededRandom(hashSeed(`wallet-${i}`));
    const winRate = +clamp(0.48 + rng() * 0.42, 0.4, 0.94).toFixed(2);
    const realizedPnlUsd = Math.round((rng() - 0.18) * 4_200_000);
    const recentActivity: SmartWallet["recentActivity"] = Array.from({ length: 5 }, (_, j) => {
      const r = seededRandom(hashSeed(`wallet-${i}-act-${j}`));
      const tok = universe[Math.floor(r() * universe.length)]!;
      const type: "entry" | "exit" = r() > 0.5 ? "entry" : "exit";
      return {
        type,
        tokenSymbol: tok.symbol,
        amountUsd: Math.round(2_000 + r() * 240_000),
        timestamp: Date.now() - Math.floor(r() * 36 * 3600000),
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    return {
      address: makeAddress(rng, "solana"),
      label,
      winRate,
      realizedPnlUsd,
      trades30d: Math.floor(20 + rng() * 320),
      avgHoldHours: +(2 + rng() * 120).toFixed(1),
      recentActivity,
    };
  });
}
