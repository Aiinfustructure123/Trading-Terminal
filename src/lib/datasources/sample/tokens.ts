/**
 * Sample token data — realistic synthetic data with simulated latency.
 * Implements TokenDataSource; Phase 1 replaces with live DexScreener calls.
 */

import type {
  Token, ConvictionScore, RiskFlag, RiskTier,
  TokenDataSource, ScreenerParams, OHLCVData, CandleInterval,
  Chain, SourceMeta,
} from "../types";

// ── Seed utilities ──────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const NOW = new Date().toISOString();

const SAMPLE_META: SourceMeta = {
  mode: "sample",
  lastUpdated: NOW,
  provider: "alpha-terminal-sample",
};

// ── Token templates ─────────────────────────────────────────────────────────

const TEMPLATES: Array<{
  symbol: string; name: string; mcapRange: [number, number]; riskTier: RiskTier;
}> = [
  { symbol: "BONK",  name: "Bonk",            mcapRange: [800e6, 1.2e9],  riskTier: "Low"      },
  { symbol: "WIF",   name: "dogwifhat",        mcapRange: [600e6, 900e6],  riskTier: "Low"      },
  { symbol: "MEME",  name: "Memecoin",         mcapRange: [400e6, 700e6],  riskTier: "Low"      },
  { symbol: "POPCAT",name: "Popcat",           mcapRange: [200e6, 400e6],  riskTier: "Moderate" },
  { symbol: "MYRO",  name: "Myro",             mcapRange: [50e6,  150e6],  riskTier: "Moderate" },
  { symbol: "SMOL",  name: "Smolcoin",         mcapRange: [10e6,  50e6],   riskTier: "Moderate" },
  { symbol: "NEIRO", name: "Neiro on ETH",     mcapRange: [5e6,   20e6],   riskTier: "High"     },
  { symbol: "GOAT",  name: "GOAT",             mcapRange: [3e6,   10e6],   riskTier: "Moderate" },
  { symbol: "FWOG",  name: "Fwog",             mcapRange: [1e6,   5e6],    riskTier: "High"     },
  { symbol: "PNUT",  name: "Peanut the Squirrel", mcapRange: [1e6, 8e6],  riskTier: "High"     },
  { symbol: "AIST",  name: "AI Startup Token", mcapRange: [500e3, 3e6],    riskTier: "High"     },
  { symbol: "REKT",  name: "Rektcoin",         mcapRange: [100e3, 800e3],  riskTier: "Avoid"    },
  { symbol: "LUNA2", name: "Luna Classic 2",   mcapRange: [200e3, 600e3],  riskTier: "Avoid"    },
  { symbol: "DOGE2", name: "Doge 2.0",         mcapRange: [300e3, 1e6],    riskTier: "High"     },
  { symbol: "WOJAK", name: "Wojak",            mcapRange: [800e3, 4e6],    riskTier: "Moderate" },
  { symbol: "PEPE2", name: "Pepe 2.0",         mcapRange: [400e3, 2e6],    riskTier: "High"     },
  { symbol: "TURBOS",name: "Turbo Solana",     mcapRange: [200e3, 1e6],    riskTier: "High"     },
  { symbol: "CHAD",  name: "Chad Token",       mcapRange: [100e3, 500e3],  riskTier: "Avoid"    },
  { symbol: "GIGABRAIN",name: "GigaBrain",     mcapRange: [50e3,  300e3],  riskTier: "Avoid"    },
  { symbol: "BASED", name: "Based",            mcapRange: [2e6,   12e6],   riskTier: "Moderate" },
  // AI narrative
  { symbol: "AIAGENT",name: "AI Agent",        mcapRange: [10e6,  50e6],   riskTier: "Moderate" },
  { symbol: "GPUX",  name: "GPU-X Protocol",   mcapRange: [5e6,   25e6],   riskTier: "Moderate" },
  { symbol: "COMPUTE",name: "Compute",         mcapRange: [2e6,   10e6],   riskTier: "High"     },
  // DePIN
  { symbol: "IOTX",  name: "IoTeX",            mcapRange: [100e6, 300e6],  riskTier: "Low"      },
  { symbol: "HNT",   name: "Helium",           mcapRange: [500e6, 800e6],  riskTier: "Low"      },
  // RWA
  { symbol: "ONDO",  name: "Ondo Finance",     mcapRange: [700e6, 1.1e9],  riskTier: "Low"      },
  // Gaming
  { symbol: "GAMER", name: "Gamer Token",      mcapRange: [1e6,   8e6],    riskTier: "High"     },
  { symbol: "PLAY",  name: "PlayDAO",          mcapRange: [3e6,   15e6],   riskTier: "Moderate" },
  // Extra to hit 1000+
  ...Array.from({ length: 50 }, (_, i) => ({
    symbol: `TKN${i + 1}`,
    name:   `Sample Token ${i + 1}`,
    mcapRange: [50e3 + i * 40e3, 200e3 + i * 100e3] as [number, number],
    riskTier: (["Low","Moderate","High","Avoid"] as RiskTier[])[i % 4],
  })),
];

function makeAddress(seed: number): string {
  const r = seededRand(seed);
  return Array.from({ length: 44 }, () =>
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[
      Math.floor(r() * 58)
    ]
  ).join("");
}

function makeRiskFlags(tier: RiskTier, r: () => number): RiskFlag[] {
  const flags: RiskFlag[] = [
    {
      id: "mint_auth",
      severity: "critical",
      label: "Mint Authority Active",
      description: "Creator wallet retains the ability to mint additional tokens, diluting holders.",
      triggered: tier === "Avoid" || (tier === "High" && r() > 0.5),
    },
    {
      id: "freeze_auth",
      severity: "high",
      label: "Freeze Authority Active",
      description: "Token accounts can be frozen by the authority, blocking transfers.",
      triggered: tier === "Avoid",
    },
    {
      id: "lp_unlocked",
      severity: "high",
      label: "Liquidity Unlocked",
      description: "Liquidity pool tokens are not time-locked; rug pull risk is elevated.",
      triggered: tier === "Avoid" || tier === "High",
    },
    {
      id: "high_concentration",
      severity: "medium",
      label: "Top-10 Holder Concentration > 60%",
      description: "A small group controls the majority of supply, enabling coordinated dumps.",
      triggered: tier === "High" || (tier === "Moderate" && r() > 0.7),
    },
    {
      id: "creator_sold",
      severity: "high",
      label: "Creator Wallet Fully Exited",
      description: "The deployer wallet has sold its entire initial allocation.",
      triggered: tier === "Avoid",
    },
    {
      id: "young_contract",
      severity: "low",
      label: "Contract Age < 24h",
      description: "Very new contract — limited on-chain history for risk assessment.",
      triggered: tier === "High" || (r() > 0.6),
    },
    {
      id: "low_liq",
      severity: "medium",
      label: "Liquidity Below $50k",
      description: "Thin liquidity amplifies price impact and manipulation risk.",
      triggered: tier === "Avoid" || (tier === "High" && r() > 0.4),
    },
  ];
  return flags;
}

function makeScore(tier: RiskTier, seed: number): ConvictionScore {
  const r = seededRand(seed);

  const baseComposite = {
    Low: 70 + r() * 25,
    Moderate: 45 + r() * 25,
    High: 20 + r() * 25,
    Avoid: 5 + r() * 15,
  }[tier];

  const components = [
    { key: "momentum",  label: "Momentum",   weight: 0.30 },
    { key: "liquidity", label: "Liquidity",  weight: 0.25 },
    { key: "holders",   label: "Holders",    weight: 0.20 },
    { key: "risk_inv",  label: "Safety",     weight: 0.15 },
    { key: "narrative", label: "Narrative",  weight: 0.10 },
  ].map(({ key, label, weight }) => {
    const subScore = Math.max(0, Math.min(100,
      baseComposite + (r() - 0.5) * 30
    ));
    const rawValue = (() => {
      switch (key) {
        case "momentum":  return +(lerp(-20, 200, r())).toFixed(1);
        case "liquidity": return +(lerp(10e3, 5e6, r())).toFixed(0);
        case "holders":   return +(lerp(50, 15000, r())).toFixed(0);
        case "risk_inv":  return +(lerp(0, 100, 1 - r() * 0.5)).toFixed(1);
        case "narrative": return +(lerp(0, 100, r())).toFixed(1);
        default: return 0;
      }
    })();
    const description = (() => {
      switch (key) {
        case "momentum":
          return `Volume has ${rawValue > 0 ? "accelerated" : "decelerated"} ${Math.abs(rawValue as number).toFixed(0)}% vs the 7-day average. Buy/sell ratio trending ${subScore > 50 ? "positive" : "negative"}.`;
        case "liquidity":
          return `Pool depth is $${Number(rawValue).toLocaleString()}. ${subScore > 60 ? "Sufficient to support position sizing." : "Thin — high slippage expected."}`;
        case "holders":
          return `${Number(rawValue).toLocaleString()} unique holders. ${subScore > 60 ? "Healthy distribution across wallets." : "Concentrated — whale risk elevated."}`;
        case "risk_inv":
          return `Safety score of ${rawValue}/100 based on contract flags, LP status, and creator behavior. ${subScore > 70 ? "No critical flags triggered." : "One or more risk flags active."}`;
        case "narrative":
          return `Narrative alignment score. Token belongs to a ${subScore > 60 ? "trending" : "cooling"} category with ${subScore > 60 ? "strong" : "weak"} capital inflow signals.`;
        default: return "";
      }
    })();
    return { key, label, value: rawValue as number, subScore: +subScore.toFixed(1), weight, description };
  });

  return {
    composite: +baseComposite.toFixed(1),
    components,
    riskTier: tier,
    riskFlags: makeRiskFlags(tier, r),
    computedAt: NOW,
  };
}

// ── Build token list ─────────────────────────────────────────────────────────

// Expand templates to 1000+ tokens
const expandedTemplates = [...TEMPLATES];
for (let i = 0; expandedTemplates.length < 1050; i++) {
  const base = TEMPLATES[i % TEMPLATES.length];
  expandedTemplates.push({
    symbol: `${base.symbol}X${Math.floor(i / TEMPLATES.length)}`,
    name:   `${base.name} Clone ${Math.floor(i / TEMPLATES.length) + 1}`,
    mcapRange: base.mcapRange,
    riskTier: base.riskTier,
  });
}

export const SAMPLE_TOKENS: Token[] = expandedTemplates.map((tmpl, i) => {
  const r = seededRand(i * 31337);
  const mcap = lerp(tmpl.mcapRange[0], tmpl.mcapRange[1], r());
  const liquidity = mcap * lerp(0.02, 0.15, r());
  const volume24h = liquidity * lerp(0.5, 8, r());
  const price = lerp(0.00001, 0.05, r());
  const age = lerp(0.5, 180, r());

  return {
    address: makeAddress(i * 999983),
    symbol:  tmpl.symbol,
    name:    tmpl.name,
    chain:   (["solana", "ethereum", "solana", "solana", "base"] as Chain[])[i % 5],
    price,
    priceChange5m:  +(lerp(-5, 8, r())).toFixed(2),
    priceChange1h:  +(lerp(-15, 20, r())).toFixed(2),
    priceChange6h:  +(lerp(-25, 35, r())).toFixed(2),
    priceChange24h: +(lerp(-40, 60, r())).toFixed(2),
    volume24h,
    liquidity,
    marketCap: mcap,
    fdv: mcap * lerp(1, 3, r()),
    txns24h: {
      buys:  Math.floor(lerp(20, 5000, r())),
      sells: Math.floor(lerp(10, 4000, r())),
    },
    age,
    holderCount: Math.floor(lerp(50, 20000, r())),
    topHolderConcentration: +(lerp(15, 85, r())).toFixed(1),
    score: makeScore(tmpl.riskTier, i * 77777),
    creatorSold: tmpl.riskTier === "Avoid",
    launchedAt: new Date(Date.now() - age * 86400e3).toISOString(),
    dexUrl: `https://dexscreener.com/solana/${makeAddress(i * 999983)}`,
  };
});

// ── Service implementation ───────────────────────────────────────────────────

function applyFilters(tokens: Token[], params: ScreenerParams): Token[] {
  return tokens.filter(t => {
    if (params.chain && t.chain !== params.chain) return false;
    if (params.mcapMax !== undefined && t.marketCap > params.mcapMax) return false;
    if (params.mcapMin !== undefined && t.marketCap < params.mcapMin) return false;
    if (params.liquidityMin !== undefined && t.liquidity < params.liquidityMin) return false;
    if (params.ageMaxDays !== undefined && t.age > params.ageMaxDays) return false;
    if (params.volumeMin !== undefined && t.volume24h < params.volumeMin) return false;
    if (params.riskTiers && params.riskTiers.length > 0 && !params.riskTiers.includes(t.score.riskTier)) return false;
    if (params.search) {
      const q = params.search.toLowerCase();
      if (!t.symbol.toLowerCase().includes(q) && !t.name.toLowerCase().includes(q) && !t.address.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySortAndPage(tokens: Token[], params: ScreenerParams): Token[] {
  const sortBy = params.sortBy ?? "score";
  const dir = params.sortDir === "asc" ? 1 : -1;
  const sorted = [...tokens].sort((a, b) => {
    let av: number, bv: number;
    switch (sortBy) {
      case "score":       av = a.score.composite; bv = b.score.composite; break;
      case "volume24h":   av = a.volume24h;       bv = b.volume24h;       break;
      case "mcap":        av = a.marketCap;       bv = b.marketCap;       break;
      case "age":         av = a.age;             bv = b.age;             break;
      case "priceChange24h": av = a.priceChange24h; bv = b.priceChange24h; break;
      case "liquidity":   av = a.liquidity;       bv = b.liquidity;       break;
      default:            av = a.score.composite; bv = b.score.composite;
    }
    return (av - bv) * dir;
  });
  const offset = params.offset ?? 0;
  const limit  = params.limit ?? 50;
  return sorted.slice(offset, offset + limit);
}

async function delay(ms = 120) {
  return new Promise(r => setTimeout(r, ms));
}

export const sampleTokenSource: TokenDataSource = {
  async getToken(address: string) {
    await delay(80);
    const t = SAMPLE_TOKENS.find(t => t.address === address);
    if (!t) throw new Error(`Token not found: ${address}`);
    return t;
  },

  async getTokens(params: ScreenerParams) {
    await delay(150);
    const filtered = applyFilters(SAMPLE_TOKENS, params);
    const page = applySortAndPage(filtered, params);
    return { tokens: page, total: filtered.length, source: SAMPLE_META };
  },

  async getNewLaunches(_chain: Chain, limit = 20) {
    await delay(100);
    const launches = [...SAMPLE_TOKENS]
      .filter(t => t.age < 3)
      .slice(0, limit)
      .map(t => ({
        address:          t.address,
        symbol:           t.symbol,
        name:             t.name,
        chain:            t.chain,
        launchedAt:       t.launchedAt!,
        initialLiquidity: t.liquidity * 0.6,
        currentLiquidity: t.liquidity,
        volume1h:         t.volume24h / 24,
        riskTier:         t.score.riskTier,
        score:            t.score.composite,
      }));
    return { launches, source: SAMPLE_META };
  },

  async getOHLCV(address: string, _chain: Chain, interval: CandleInterval): Promise<OHLCVData> {
    await delay(120);
    const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    const count = { "15m": 96, "1h": 168, "4h": 90, "1d": 180 }[interval];
    const msPerCandle = { "15m": 15*60e3, "1h": 3600e3, "4h": 4*3600e3, "1d": 86400e3 }[interval];
    const r = seededRand(address.charCodeAt(0) * 31337);

    let price = token.price;
    const candles = Array.from({ length: count }, (_, i) => {
      const time = Math.floor((Date.now() - (count - i) * msPerCandle) / 1000);
      const change = (r() - 0.48) * 0.04;
      const open  = price;
      const close = price * (1 + change);
      const high  = Math.max(open, close) * (1 + r() * 0.02);
      const low   = Math.min(open, close) * (1 - r() * 0.02);
      const volume = token.volume24h / count * lerp(0.5, 2, r());
      price = close;
      return { time, open, high, low, close, volume };
    });
    return { address, interval, candles, source: SAMPLE_META };
  },
};
