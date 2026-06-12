import type { Chain } from "@/lib/datasources/types";

/* ============================================================
   Deterministic pseudo-random generation.
   The token universe is generated once from fixed seeds so that
   the same token shows identical core data everywhere (screener
   row ↔ detail page). Live-feeling movement is layered on top as
   a time-based drift, never changing identity.
   ============================================================ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/** Smooth, deterministic time drift in [-amp, amp] for a given seed. */
export function drift(seed: number, amp: number, periodMs = 8000): number {
  const t = Date.now() / periodMs;
  const a = Math.sin(t + (seed % 1000)) * 0.6;
  const b = Math.sin(t * 0.37 + (seed % 777)) * 0.4;
  return (a + b) * amp;
}

const NARRATIVES = ["AI", "Meme", "RWA", "DePIN", "Gaming", "DeFi", "L2"] as const;

const PREFIX = [
  "Quantum", "Neuro", "Solar", "Hyper", "Astro", "Pixel", "Turbo", "Lunar", "Cyber", "Nano",
  "Mega", "Aero", "Volt", "Echo", "Nova", "Omni", "Flux", "Zen", "Apex", "Prism",
  "Giga", "Kilo", "Vortex", "Helio", "Cosmo", "Photon", "Delta", "Sigma", "Vega", "Orbit",
];
const SUFFIX = [
  "AI", "Net", "Dao", "Fi", "Chain", "Labs", "Protocol", "Coin", "Pad", "Swap",
  "Verse", "Core", "X", "Grid", "Forge", "Pump", "Inu", "Cat", "Dog", "Bot",
  "Engine", "Node", "Mind", "Pulse", "Wave", "Loop", "Byte", "Bit", "Gen", "Mesh",
];
const MEME = ["Doge", "Pepe", "Wojak", "Bonk", "Shib", "Floki", "Moo", "Wif", "Chad", "Giga", "Mog", "Brett", "Toshi", "Popcat"];

const CHAINS: Chain[] = ["solana", "solana", "solana", "solana", "ethereum", "base"];

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HEX = "0123456789abcdef";

function makeAddress(rand: () => number, chain: Chain): string {
  if (chain === "solana") {
    let s = "";
    for (let i = 0; i < 44; i++) s += B58[Math.floor(rand() * B58.length)];
    return s;
  }
  let s = "0x";
  for (let i = 0; i < 40; i++) s += HEX[Math.floor(rand() * HEX.length)];
  return s;
}

const ACCENTS = ["#5CE1E6", "#3DDC97", "#FFB020", "#FF4D5E", "#9B8CFF", "#FF8FB1", "#7CE38B", "#62B6FF", "#F5D76E", "#FF9F45"];

export interface UniverseToken {
  address: string;
  chain: Chain;
  symbol: string;
  name: string;
  accent: string;
  narrative: string;
  basePrice: number;
  baseMarketCap: number;
  liquidityUsd: number;
  holders: number;
  ageHours: number;
  createdAt: number;
  volumeAccel: number;
  buySellRatio: number;
  // raw risk facts
  mintAuthorityActive: boolean;
  freezeAuthorityActive: boolean;
  lpLockedPct: number;
  top10Pct: number;
  buyTaxPct: number;
  sellTaxPct: number;
  isHoneypot: boolean;
  creatorHoldingPct: number;
  holderGrowth: number;
  smartMoney: number;
  seed: number;
}

let UNIVERSE: UniverseToken[] | null = null;
const UNIVERSE_SIZE = 1200;

export function getUniverse(): UniverseToken[] {
  if (UNIVERSE) return UNIVERSE;
  const out: UniverseToken[] = [];
  const usedSymbols = new Set<string>();
  for (let i = 0; i < UNIVERSE_SIZE; i++) {
    const rand = mulberry32(0x9e3779b9 ^ (i * 2654435761));
    const narrative = pick(rand, NARRATIVES as unknown as string[]);
    const chain = pick(rand, CHAINS);

    let name: string;
    let symbol: string;
    if (narrative === "Meme") {
      const a = pick(rand, MEME);
      const b = pick(rand, SUFFIX);
      name = `${a} ${b}`;
      symbol = (a.slice(0, 3) + b.slice(0, 2)).toUpperCase();
    } else {
      const a = pick(rand, PREFIX);
      const b = pick(rand, SUFFIX);
      name = `${a}${b}`;
      symbol = (a.slice(0, 2) + b.slice(0, 2)).toUpperCase();
    }
    // ensure symbol uniqueness
    let sym = symbol;
    let n = 1;
    while (usedSymbols.has(sym)) sym = symbol + (n++ % 10);
    usedSymbols.add(sym);
    symbol = sym;

    // Age distribution: skew toward newer tokens for discovery feel.
    const ageRoll = rand();
    const ageHours = ageRoll < 0.35 ? range(rand, 0.2, 168) : ageRoll < 0.7 ? range(rand, 168, 24 * 60) : range(rand, 24 * 60, 24 * 700);

    // Market cap buckets, weighted to small caps (the product's focus).
    const mcapRoll = rand();
    const baseMarketCap =
      mcapRoll < 0.3 ? range(rand, 20_000, 500_000) :
      mcapRoll < 0.55 ? range(rand, 500_000, 2_000_000) :
      mcapRoll < 0.75 ? range(rand, 2_000_000, 5_000_000) :
      mcapRoll < 0.9 ? range(rand, 5_000_000, 25_000_000) :
      range(rand, 25_000_000, 900_000_000);

    const liqRatio = range(rand, 0.02, 0.2);
    const liquidityUsd = baseMarketCap * liqRatio;
    const basePrice = range(rand, 0.0000004, 4.2) * (baseMarketCap < 1_000_000 ? 0.4 : 1);
    const holders = Math.round(range(rand, 30, 1) + Math.pow(baseMarketCap, 0.42) * range(rand, 0.4, 1.6));

    const mintAuthorityActive = rand() < 0.18;
    const isHoneypot = rand() < 0.03;
    const top10Pct = range(rand, 8, 78);
    const lpLockedPct = rand() < 0.6 ? range(rand, 55, 100) : range(rand, 0, 55);
    const taxRoll = rand();
    const buyTaxPct = taxRoll < 0.7 ? 0 : range(rand, 0, 18);
    const sellTaxPct = taxRoll < 0.7 ? 0 : range(rand, 0, 22);

    out.push({
      address: makeAddress(rand, chain),
      chain,
      symbol,
      name,
      accent: pick(rand, ACCENTS),
      narrative,
      basePrice,
      baseMarketCap,
      liquidityUsd,
      holders,
      ageHours,
      createdAt: Date.now() - ageHours * 3600_000,
      volumeAccel: range(rand, 0.4, 3.2),
      buySellRatio: range(rand, 0.5, 2.0),
      mintAuthorityActive,
      freezeAuthorityActive: rand() < 0.12,
      lpLockedPct,
      top10Pct,
      buyTaxPct,
      sellTaxPct,
      isHoneypot,
      creatorHoldingPct: range(rand, 0, 22),
      holderGrowth: range(rand, -0.08, 0.5),
      smartMoney: range(rand, 5, 95),
      seed: hashStr(`${symbol}-${i}`),
    });
  }
  UNIVERSE = out;
  return out;
}

export { NARRATIVES };
