/**
 * Deterministic sample-data universe.
 *
 * Everything is generated from a fixed seed so the terminal looks identical
 * across reloads, then drifted in-memory on a tick so panels feel live.
 * Clearly labeled SAMPLE everywhere it surfaces — see lib/datasources/config.ts.
 */

import type {
  Chain,
  ConvictionScore,
  NarrativeId,
  RiskTier,
  ScoreComponent,
  Token,
} from "../types";

// ---------------------------------------------------------------------------
// Seeded RNG
// ---------------------------------------------------------------------------

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seedStr: string) {
  return mulberry32(hashSeed(seedStr));
}

function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function range(r: () => number, min: number, max: number): number {
  return min + r() * (max - min);
}

/** Log-uniform: spreads values across orders of magnitude, like real markets */
function logRange(r: () => number, min: number, max: number): number {
  return Math.exp(range(r, Math.log(min), Math.log(max)));
}

// ---------------------------------------------------------------------------
// Name material
// ---------------------------------------------------------------------------

const PREFIXES = [
  "Neural", "Quantum", "Hyper", "Meta", "Giga", "Turbo", "Astro", "Cyber",
  "Solar", "Lunar", "Nano", "Omni", "Ultra", "Prime", "Apex", "Nova",
  "Photon", "Vector", "Sigma", "Delta", "Zero", "Flux", "Echo", "Onyx",
  "Iron", "Ghost", "Storm", "Ember", "Frost", "Drift",
];

const SUFFIXES_BY_NARRATIVE: Record<NarrativeId, string[]> = {
  ai: ["Mind", "Agent", "Cortex", "Net", "Brain", "GPT", "Synth", "Oracle", "Logic", "Core"],
  meme: ["Doge", "Pepe", "Cat", "Frog", "Moon", "Wif", "Inu", "Chad", "Wojak", "Bonk"],
  rwa: ["Estate", "Gold", "Bond", "Yield", "Credit", "Asset", "Vault", "Treasury", "Property", "Note"],
  depin: ["Node", "Grid", "Mesh", "Relay", "Sensor", "Compute", "Bandwidth", "Storage", "Signal", "Link"],
  gaming: ["Quest", "Arena", "Guild", "Realm", "Loot", "Raid", "Pixel", "Verse", "Forge", "Legends"],
};

const NARRATIVES: NarrativeId[] = ["ai", "meme", "rwa", "depin", "gaming"];

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function fakeSolAddress(r: () => number): string {
  let s = "";
  for (let i = 0; i < 44; i++) s += BASE58[Math.floor(r() * BASE58.length)];
  return s;
}

// ---------------------------------------------------------------------------
// Scoring (sample) — mirrors the Phase 2 component structure exactly
// ---------------------------------------------------------------------------

export const SCORE_WEIGHTS: Record<ScoreComponent["key"], number> = {
  momentum: 0.3,
  volume: 0.2,
  liquidity: 0.2,
  holders: 0.15,
  riskInverse: 0.15,
};

export function buildConviction(
  r: () => number,
  inputs: {
    change24h: number;
    volume24h: number;
    marketCap: number;
    liquidityUsd: number;
    holderCount: number;
    riskTier: RiskTier;
  }
): ConvictionScore {
  const momentumScore = Math.max(
    2,
    Math.min(98, 50 + inputs.change24h * 0.9 + range(r, -12, 12))
  );
  const volToMcap = inputs.volume24h / Math.max(1, inputs.marketCap);
  const volumeScore = Math.max(2, Math.min(98, Math.log10(1 + volToMcap * 100) * 45 + range(r, -8, 8)));
  const liqToMcap = inputs.liquidityUsd / Math.max(1, inputs.marketCap);
  const liquidityScore = Math.max(2, Math.min(98, liqToMcap * 350 + range(r, -10, 10)));
  const holderScore = Math.max(2, Math.min(98, Math.log10(1 + inputs.holderCount) * 22 + range(r, -10, 10)));
  const riskMap: Record<RiskTier, number> = { Low: 88, Moderate: 62, High: 30, Avoid: 8 };
  const riskInverseScore = Math.max(2, Math.min(98, riskMap[inputs.riskTier] + range(r, -6, 6)));

  const components: ScoreComponent[] = [
    {
      key: "momentum",
      label: "Momentum",
      score: momentumScore,
      weight: SCORE_WEIGHTS.momentum,
      inputValue: `${inputs.change24h >= 0 ? "+" : ""}${inputs.change24h.toFixed(1)}% / 24h`,
      reason:
        momentumScore > 65
          ? "Price structure is building higher highs with sustained 24h follow-through."
          : momentumScore > 40
            ? "Price action is consolidating; no decisive trend on the 24h window."
            : "Momentum is fading — recent candles show lower highs and weakening follow-through.",
    },
    {
      key: "volume",
      label: "Volume",
      score: volumeScore,
      weight: SCORE_WEIGHTS.volume,
      inputValue: `${(volToMcap * 100).toFixed(0)}% of mcap traded / 24h`,
      reason:
        volumeScore > 65
          ? "Turnover is unusually high relative to market cap — strong participation."
          : volumeScore > 40
            ? "Turnover is in line with peers of similar size."
            : "Thin turnover relative to market cap; moves here carry less information.",
    },
    {
      key: "liquidity",
      label: "Liquidity",
      score: liquidityScore,
      weight: SCORE_WEIGHTS.liquidity,
      inputValue: `${(liqToMcap * 100).toFixed(1)}% liq/mcap`,
      reason:
        liquidityScore > 65
          ? "Deep pool relative to market cap — entries and exits are cheap."
          : liquidityScore > 40
            ? "Adequate liquidity for the current size, but large orders will slip."
            : "Shallow liquidity — even modest sells can move the price materially.",
    },
    {
      key: "holders",
      label: "Holders",
      score: holderScore,
      weight: SCORE_WEIGHTS.holders,
      inputValue: `${inputs.holderCount.toLocaleString()} holders`,
      reason:
        holderScore > 65
          ? "Broad and growing holder base reduces single-wallet dependency."
          : holderScore > 40
            ? "Holder base is moderate for this market cap tier."
            : "Concentrated holder base — distribution risk is elevated.",
    },
    {
      key: "riskInverse",
      label: "Risk (inverse)",
      score: riskInverseScore,
      weight: SCORE_WEIGHTS.riskInverse,
      inputValue: `tier: ${inputs.riskTier}`,
      reason:
        inputs.riskTier === "Low"
          ? "No critical security flags; contract permissions look clean."
          : inputs.riskTier === "Moderate"
            ? "Minor flags present — review the forensics panel before sizing up."
            : "Serious security flags detected. This component caps the composite hard.",
    },
  ];

  const total = components.reduce((acc, c) => acc + c.score * c.weight, 0);
  return { total: Math.round(total * 10) / 10, components, computedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// Token universe
// ---------------------------------------------------------------------------

export const TOKEN_COUNT = 1250;

function buildToken(i: number): Token {
  const r = rng(`token-${i}`);
  const narrative = pick(r, NARRATIVES);
  const prefix = pick(r, PREFIXES);
  const suffix = pick(r, SUFFIXES_BY_NARRATIVE[narrative]);
  const name = `${prefix} ${suffix}`;
  let symbol = (prefix.slice(0, 3) + suffix.slice(0, 2)).toUpperCase();
  if (r() < 0.3) symbol = suffix.toUpperCase().slice(0, 5);
  symbol = `${symbol}${i % 7 === 0 ? Math.floor(r() * 9) + 1 : ""}`;

  const chain: Chain = "solana";
  const marketCap = logRange(r, 40_000, 600_000_000);
  const liquidityUsd = marketCap * range(r, 0.015, 0.35);
  const volume24h = marketCap * logRange(r, 0.005, 3.5);
  const ageHours = logRange(r, 0.5, 24 * 700);
  const priceUsd = logRange(r, 0.00000095, 8);
  const holderCount = Math.round(Math.sqrt(marketCap) * range(r, 0.4, 4));

  const change24h = range(r, -60, 140) * (r() < 0.62 ? range(r, 0.05, 0.5) : 1);
  const change5m = change24h * range(r, -0.08, 0.15);
  const change1h = change24h * range(r, -0.2, 0.45);
  const change6h = change24h * range(r, 0.1, 0.8);
  const change7d = change24h * range(r, 0.4, 2.6) + range(r, -30, 30);

  const buys = Math.round(volume24h / range(r, 150, 900));
  const sellRatio = change24h > 0 ? range(r, 0.55, 0.95) : range(r, 0.9, 1.5);
  const sells = Math.round(buys * sellRatio);

  // Risk tier skews worse for very young / tiny tokens
  const riskRoll = r() + (ageHours < 72 ? 0.25 : 0) + (marketCap < 300_000 ? 0.2 : 0);
  const riskTier: RiskTier =
    riskRoll > 1.15 ? "Avoid" : riskRoll > 0.9 ? "High" : riskRoll > 0.55 ? "Moderate" : "Low";

  const address = fakeSolAddress(r);
  const conviction = buildConviction(r, {
    change24h,
    volume24h,
    marketCap,
    liquidityUsd,
    holderCount,
    riskTier,
  });

  return {
    id: `smp-${i}`,
    symbol,
    name,
    chain,
    address,
    priceUsd,
    change5m,
    change1h,
    change6h,
    change24h,
    change7d,
    volume24h,
    liquidityUsd,
    marketCap,
    fdv: marketCap * range(r, 1, 2.4),
    ageHours,
    txns24h: { buys, sells },
    holderCount,
    narrative,
    conviction,
    riskTier,
    links: {
      website: r() < 0.7 ? `https://example.com/${symbol.toLowerCase()}` : undefined,
      twitter: r() < 0.8 ? `https://x.com/${symbol.toLowerCase()}` : undefined,
      explorer: `https://solscan.io/token/${address}`,
      dexscreener: `https://dexscreener.com/solana/${address}`,
    },
  };
}

// ---------------------------------------------------------------------------
// In-memory universe with live drift
// ---------------------------------------------------------------------------

let universe: Token[] | null = null;
let lastTick = 0;

export function getUniverse(): Token[] {
  if (!universe) {
    universe = Array.from({ length: TOKEN_COUNT }, (_, i) => buildToken(i));
    lastTick = Date.now();
  }
  maybeTick();
  return universe;
}

/** Drift a subset of tokens every few seconds so the terminal feels alive. */
function maybeTick() {
  const now = Date.now();
  if (!universe || now - lastTick < 3500) return;
  lastTick = now;
  const r = mulberry32(now & 0xffffffff);
  const count = 80;
  for (let n = 0; n < count; n++) {
    const idx = Math.floor(r() * universe.length);
    const t = universe[idx];
    const drift = (r() - 0.485) * 0.025;
    const newPrice = Math.max(t.priceUsd * (1 + drift), 1e-9);
    const pctMove = (newPrice / t.priceUsd - 1) * 100;
    universe[idx] = {
      ...t,
      priceUsd: newPrice,
      change5m: t.change5m * 0.7 + pctMove * 6,
      change1h: t.change1h + pctMove * 0.8,
      change24h: t.change24h + pctMove * 0.25,
      marketCap: t.marketCap * (1 + drift),
      volume24h: t.volume24h * (1 + Math.abs(drift) * r() * 4),
      txns24h: {
        buys: t.txns24h.buys + Math.floor(r() * 5),
        sells: t.txns24h.sells + Math.floor(r() * 5),
      },
    };
  }
}

export function simulateLatency(min = 120, max = 420): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
