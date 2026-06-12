/**
 * Seeded sample-data engine.
 *
 * Generates a deterministic universe of ~1,200 tokens with correlated,
 * realistic metrics, then advances a random walk over time so the terminal
 * feels alive: prices tick, launches appear, alerts stream. Every score is
 * computed from the generated inputs (never invented independently), so the
 * breakdown panels show real arithmetic.
 */

import {
  Candle,
  CandleInterval,
  Chain,
  ConvictionScore,
  GlobalMetrics,
  HolderStats,
  LaunchEvent,
  NarrativeCategory,
  RiskFlag,
  RiskTier,
  RISK_TIER_ORDER,
  ScoreComponent,
  TickerAlert,
  TokenDetail,
  TokenSummary,
  WalletEvent,
  WalletProfile,
} from "../types";

/* ── PRNG ───────────────────────────────────────────────────── */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Roughly-normal noise in [-1, 1]. */
function gauss(rand: () => number): number {
  return (rand() + rand() + rand() + rand() - 2) / 2;
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function logUniform(rand: () => number, min: number, max: number): number {
  return Math.exp(Math.log(min) + rand() * (Math.log(max) - Math.log(min)));
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/* ── vocabulary ─────────────────────────────────────────────── */

export const NARRATIVES = [
  "AI",
  "Meme",
  "RWA",
  "DePIN",
  "Gaming",
  "DeFi",
  "Infra",
] as const;

const NAME_PREFIXES: Record<string, string[]> = {
  AI: ["Neural", "Sentient", "Cortex", "Synth", "Tensor", "Agentic", "Oracle", "Prompt", "Vector", "Lucid"],
  Meme: ["Ponzu", "Waggle", "Moon", "Giga", "Snek", "Chad", "Blorbo", "Wif", "Dank", "Zoomer"],
  RWA: ["Vault", "Estate", "Bond", "Carbon", "Aurum", "Yield", "Treasury", "Brick", "Deed", "Ledger"],
  DePIN: ["Grid", "Mesh", "Node", "Relay", "Spectrum", "Sensor", "Edge", "Beacon", "Antenna", "Uplink"],
  Gaming: ["Quest", "Pixel", "Arcade", "Guild", "Loot", "Raid", "Mana", "Realm", "Arena", "Forge"],
  DeFi: ["Flux", "Swappr", "Lendio", "Stake", "Margin", "Delta", "Perp", "Curveball", "Poolside", "Hedge"],
  Infra: ["Rollup", "Shard", "Bridgr", "Chainline", "Blockmesh", "Zk", "Proofworks", "Layer", "Hashfield", "Validex"],
};

const NAME_SUFFIXES = [
  "Protocol", "Network", "Labs", "World", "Coin", "DAO", "Works", "Engine",
  "Base", "Cat", "Inu", "Capital", "Systems", "Index", "One",
];

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HEX = "0123456789abcdef";

function makeAddress(rand: () => number, chain: Chain): string {
  if (chain === "solana") {
    let s = "";
    for (let i = 0; i < 44; i++) s += BASE58[Math.floor(rand() * BASE58.length)];
    return s;
  }
  let s = "0x";
  for (let i = 0; i < 40; i++) s += HEX[Math.floor(rand() * HEX.length)];
  return s;
}

/* ── internal token state ───────────────────────────────────── */

interface SecurityTraits {
  honeypot: boolean;
  mintAuthority: boolean;
  freezeAuthority: boolean;
  lpLockedPct: number;
  buyTaxPct: number;
  sellTaxPct: number;
  verifiedSource: boolean;
  top10Pct: number;
  creatorStatus: "holding" | "trimmed" | "exited";
  creatorPct: number;
}

interface EngineToken extends TokenSummary {
  traits: SecurityTraits;
  /** 24h volume ÷ 7-day average daily volume. */
  volumeAccel: number;
  holderChange24h: number;
  /** Per-tick volatility of the random walk. */
  walkVol: number;
  description: string;
  scoreHistory: number[];
}

/* ── scoring (deterministic, mirrors future lib/scoring) ────── */

export const SCORE_WEIGHTS = {
  momentum: 0.3,
  liquidity: 0.2,
  holders: 0.15,
  volume: 0.15,
  riskInverse: 0.2,
} as const;

function scoreLog(value: number, floor: number, ceil: number): number {
  if (value <= floor) return 0;
  if (value >= ceil) return 100;
  return (
    ((Math.log(value) - Math.log(floor)) / (Math.log(ceil) - Math.log(floor))) *
    100
  );
}

function computeRiskTier(t: SecurityTraits, liquidityUsd: number, ageDays: number): RiskTier {
  let tier: RiskTier = "Low";
  const raise = (to: RiskTier) => {
    if (RISK_TIER_ORDER[to] > RISK_TIER_ORDER[tier]) tier = to;
  };
  if (t.honeypot) raise("Avoid");
  if (t.sellTaxPct > 10) raise("Avoid");
  if (t.mintAuthority) raise("High");
  if (t.lpLockedPct < 25 && ageDays < 30) raise("High");
  if (t.top10Pct > 60) raise("High");
  if (t.sellTaxPct > 4 || t.buyTaxPct > 4) raise("High");
  if (t.freezeAuthority) raise("Moderate");
  if (t.top10Pct > 40) raise("Moderate");
  if (t.creatorStatus === "exited") raise("Moderate");
  if (liquidityUsd < 20_000) raise("Moderate");
  if (!t.verifiedSource) raise("Moderate");
  return tier;
}

function buildRiskFlags(t: SecurityTraits, liquidityUsd: number, ageDays: number): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (t.honeypot)
    flags.push({
      id: "honeypot",
      severity: "severe",
      title: "Honeypot pattern detected",
      detail: "Simulated sells revert. Holders may be unable to exit this token.",
    });
  if (t.mintAuthority)
    flags.push({
      id: "mint-authority",
      severity: "severe",
      title: "Mint authority active",
      detail: "The deployer can mint unlimited new supply at any time, diluting all holders. Automatic High-risk minimum.",
    });
  if (t.freezeAuthority)
    flags.push({
      id: "freeze-authority",
      severity: "caution",
      title: "Freeze authority active",
      detail: "Token accounts can be frozen by the authority, blocking transfers for any holder.",
    });
  if (t.lpLockedPct < 25)
    flags.push({
      id: "lp-unlocked",
      severity: ageDays < 30 ? "severe" : "caution",
      title: `Only ${t.lpLockedPct.toFixed(0)}% of LP locked`,
      detail: "Most liquidity can be withdrawn by the deployer — classic rug setup on young tokens.",
    });
  else if (t.lpLockedPct < 80)
    flags.push({
      id: "lp-partial",
      severity: "caution",
      title: `${t.lpLockedPct.toFixed(0)}% of LP locked`,
      detail: "A meaningful share of liquidity remains unlocked and could be pulled.",
    });
  if (t.sellTaxPct > 0 || t.buyTaxPct > 0)
    flags.push({
      id: "taxes",
      severity: t.sellTaxPct > 4 || t.buyTaxPct > 4 ? "severe" : "caution",
      title: `Trading taxes: ${t.buyTaxPct.toFixed(1)}% buy / ${t.sellTaxPct.toFixed(1)}% sell`,
      detail: t.sellTaxPct > 10
        ? "Sell tax above 10% — effectively a soft honeypot."
        : "Taxes reduce realized gains and can be raised by the owner on some contracts.",
    });
  if (t.top10Pct > 40)
    flags.push({
      id: "concentration",
      severity: t.top10Pct > 60 ? "severe" : "caution",
      title: `Top 10 wallets hold ${t.top10Pct.toFixed(0)}% of supply`,
      detail: "Concentrated supply means a handful of wallets can move the price at will.",
    });
  if (t.creatorStatus === "exited")
    flags.push({
      id: "creator-exit",
      severity: "caution",
      title: "Creator wallet fully exited",
      detail: "The deployer sold their entire position. Alignment with holders is gone.",
    });
  if (liquidityUsd < 20_000)
    flags.push({
      id: "thin-liquidity",
      severity: "caution",
      title: "Thin liquidity",
      detail: `Pool depth under $20K — even small sells cause outsized price impact.`,
    });
  if (!t.verifiedSource)
    flags.push({
      id: "unverified",
      severity: "info",
      title: "Source not verified",
      detail: "Contract source is not verified on a public explorer. Behavior cannot be independently audited.",
    });
  if (flags.length === 0)
    flags.push({
      id: "clean",
      severity: "info",
      title: "No structural red flags",
      detail: "LP locked, authorities revoked, no taxes, supply reasonably distributed. Market risk still applies.",
    });
  return flags;
}

function riskInverseScore(tier: RiskTier, rand: () => number): number {
  switch (tier) {
    case "Low": return 84 + rand() * 12;
    case "Moderate": return 56 + rand() * 18;
    case "High": return 24 + rand() * 18;
    case "Avoid": return 4 + rand() * 10;
  }
}

function computeScore(t: {
  change1h: number;
  change6h: number;
  change24h: number;
  buys24h: number;
  sells24h: number;
  volumeAccel: number;
  liquidityUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  holders: number;
  holderChange24h: number;
  riskTier: RiskTier;
}, rand: () => number): ConvictionScore {
  const buyRatio = t.buys24h / Math.max(1, t.buys24h + t.sells24h);

  const momentum = clamp(
    50 +
      clamp(t.change1h, -30, 30) * 0.5 +
      clamp(t.change6h, -60, 60) * 0.25 +
      clamp(t.change24h, -120, 120) * 0.08 +
      (buyRatio - 0.5) * 70 +
      clamp((t.volumeAccel - 1) * 12, -18, 24),
    0,
    100,
  );

  const liqDepth = scoreLog(t.liquidityUsd, 8_000, 3_000_000);
  const liqRatio = clamp((t.liquidityUsd / Math.max(1, t.marketCapUsd)) * 400, 0, 30);
  const liquidity = clamp(liqDepth * 0.75 + liqRatio, 0, 100);

  const holderBase = scoreLog(t.holders, 40, 60_000);
  const holderGrowth = clamp(t.holderChange24h * 2.2, -20, 25);
  const holders = clamp(holderBase * 0.8 + holderGrowth + 8, 0, 100);

  const turnover = clamp((t.volume24hUsd / Math.max(1, t.marketCapUsd)) * 55, 0, 35);
  const volume = clamp(scoreLog(t.volume24hUsd, 4_000, 8_000_000) * 0.7 + turnover, 0, 100);

  const riskInv = riskInverseScore(t.riskTier, rand);

  const components: ScoreComponent[] = [
    {
      key: "momentum",
      label: "Momentum",
      input: `1h ${t.change1h >= 0 ? "+" : ""}${t.change1h.toFixed(1)}% · 24h ${t.change24h >= 0 ? "+" : ""}${t.change24h.toFixed(1)}% · vol ${t.volumeAccel.toFixed(1)}× 7d avg · ${(buyRatio * 100).toFixed(0)}% buys`,
      subScore: momentum,
      weight: SCORE_WEIGHTS.momentum,
      explanation:
        momentum >= 65
          ? "Price structure and order flow are both pushing upward; volume is running ahead of its weekly base."
          : momentum >= 45
            ? "Flow is balanced — neither buyers nor sellers control the tape decisively."
            : "Sellers dominate recent flow and volume is fading versus its weekly average.",
    },
    {
      key: "liquidity",
      label: "Liquidity",
      input: `$${Math.round(t.liquidityUsd).toLocaleString("en-US")} pooled · ${((t.liquidityUsd / Math.max(1, t.marketCapUsd)) * 100).toFixed(1)}% of mcap`,
      subScore: liquidity,
      weight: SCORE_WEIGHTS.liquidity,
      explanation:
        liquidity >= 65
          ? "Deep pool relative to market cap — position entry and exit are realistic at size."
          : liquidity >= 40
            ? "Workable depth for small size; large orders will move the price."
            : "Shallow pool — slippage and exit risk are significant.",
    },
    {
      key: "holders",
      label: "Holders",
      input: `${t.holders.toLocaleString("en-US")} holders · ${t.holderChange24h >= 0 ? "+" : ""}${t.holderChange24h.toFixed(1)}% 24h`,
      subScore: holders,
      weight: SCORE_WEIGHTS.holders,
      explanation:
        holders >= 65
          ? "A broad and growing holder base — distribution is improving."
          : holders >= 40
            ? "Holder base is adequate but growth is unremarkable."
            : "Few wallets hold this token; distribution risk is high.",
    },
    {
      key: "volume",
      label: "Volume",
      input: `$${Math.round(t.volume24hUsd).toLocaleString("en-US")} 24h · ${((t.volume24hUsd / Math.max(1, t.marketCapUsd)) * 100).toFixed(0)}% turnover`,
      subScore: volume,
      weight: SCORE_WEIGHTS.volume,
      explanation:
        volume >= 65
          ? "Heavy turnover relative to size — the market is actively pricing this token."
          : volume >= 40
            ? "Steady but unspectacular trading activity."
            : "Thin trading — price discovery here is weak.",
    },
    {
      key: "riskInverse",
      label: "Risk (inverse)",
      input: `Forensic tier: ${t.riskTier}`,
      subScore: riskInv,
      weight: SCORE_WEIGHTS.riskInverse,
      explanation:
        t.riskTier === "Low"
          ? "Forensics are clean: locked LP, revoked authorities, sane distribution."
          : t.riskTier === "Moderate"
            ? "Some structural concerns in forensics — see the risk panel for triggered rules."
            : "Serious structural risk flags are active; they cap the composite hard.",
    },
  ];

  const composite = components.reduce((s, c) => s + c.subScore * c.weight, 0);
  return {
    composite,
    components,
    computedAt: new Date().toISOString(),
  };
}

/* ── engine ─────────────────────────────────────────────────── */

const UNIVERSE_SEED = 0xa17a01;
const TOKEN_COUNT = 1200;
const TICK_MS = 2200;
const LAUNCH_EVERY_MS = 24_000;
const ALERT_EVERY_MS = 7_000;

export class SampleEngine {
  readonly tokens: EngineToken[] = [];
  private byId = new Map<string, EngineToken>();
  private launches: LaunchEvent[] = [];
  private alerts: TickerAlert[] = [];
  private wallets: WalletProfile[] = [];
  private walletEvents: WalletEvent[] = [];
  private candleCache = new Map<string, Candle[]>();
  private lastTickAt: number;
  private lastLaunchAt: number;
  private lastAlertAt: number;
  private launchCounter = 0;
  private liveRand: () => number;
  private global: GlobalMetrics;

  constructor() {
    const rand = mulberry32(UNIVERSE_SEED);
    this.liveRand = mulberry32(UNIVERSE_SEED ^ 0x5eed);
    const now = Date.now();

    const usedNames = new Set<string>();
    for (let i = 0; i < TOKEN_COUNT; i++) {
      this.tokens.push(this.makeToken(rand, i, now, usedNames));
    }
    for (const t of this.tokens) this.byId.set(t.id, t);

    // seed launches feed from the youngest tokens
    const young = [...this.tokens]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 14);
    this.launches = young.map((t, i) => ({
      id: `launch-${i}`,
      tokenId: t.id,
      symbol: t.symbol,
      name: t.name,
      chain: t.chain,
      launchedAt: t.createdAt,
      liquidityUsd: t.liquidityUsd,
      marketCapUsd: t.marketCapUsd,
      riskTier: t.riskTier,
      initialBuys: Math.floor(20 + rand() * 400),
    }));

    this.global = {
      totalMarketCapUsd: 3.41e12,
      marketCapChange24h: 1.8,
      volume24hUsd: 1.62e11,
      btcDominance: 52.4,
      fearGreed: { value: 64, label: "Greed" },
    };

    this.makeWallets(rand, now);
    for (let i = 0; i < 18; i++) this.pushAlert(now - (18 - i) * 45_000);
    this.lastTickAt = now;
    this.lastLaunchAt = now;
    this.lastAlertAt = now;
  }

  /* ── universe generation ──────────────────────────────────── */

  private makeToken(
    rand: () => number,
    index: number,
    now: number,
    usedNames: Set<string>,
  ): EngineToken {
    const narrative = NARRATIVES[Math.floor(rand() * NARRATIVES.length)];
    let name = "";
    let symbol = "";
    for (let tries = 0; tries < 20; tries++) {
      const prefix = pick(rand, NAME_PREFIXES[narrative]);
      const suffix = pick(rand, NAME_SUFFIXES);
      name = `${prefix} ${suffix}`;
      symbol = (prefix.slice(0, 4) + suffix[0]).toUpperCase();
      if (!usedNames.has(name)) break;
    }
    if (usedNames.has(name)) {
      name = `${name} ${index}`;
      symbol = `${symbol}${index % 10}`;
    }
    usedNames.add(name);

    const chainRoll = rand();
    const chain: Chain = chainRoll < 0.7 ? "solana" : chainRoll < 0.9 ? "base" : "ethereum";

    // age skewed young: ~18% under 7 days, tail out to 2 years
    const ageDays = Math.pow(rand(), 2.4) * 730 + rand() * 0.5;
    const createdAt = new Date(now - ageDays * 86_400_000).toISOString();

    const liquidityUsd = logUniform(rand, 4_000, 6_000_000);
    const mcapMult = logUniform(rand, 1.5, 60);
    const marketCapUsd = clamp(liquidityUsd * mcapMult, 8_000, 900_000_000);
    const volume24hUsd = marketCapUsd * logUniform(rand, 0.005, 2.5);
    const priceUsd = logUniform(rand, 1e-7, 40);

    const change24h = gauss(rand) * 28 + (rand() < 0.1 ? gauss(rand) * 120 : 0);
    const change6h = change24h * 0.45 + gauss(rand) * 9;
    const change1h = change6h * 0.4 + gauss(rand) * 4;
    const change5m = change1h * 0.3 + gauss(rand) * 1.4;

    const txns = Math.max(8, Math.round(volume24hUsd / (260 + rand() * 700)));
    const buyBias = clamp(0.5 + change24h / 300 + gauss(rand) * 0.07, 0.25, 0.75);
    const buys24h = Math.round(txns * buyBias);
    const sells24h = Math.max(1, txns - buys24h);

    const holders = Math.max(
      25,
      Math.round(marketCapUsd / logUniform(rand, 18, 320)),
    );
    const holderChange24h = gauss(rand) * 6 + change24h * 0.04;
    const volumeAccel = logUniform(rand, 0.3, 4.2);

    const traits: SecurityTraits = {
      honeypot: rand() < 0.02,
      mintAuthority: rand() < 0.11,
      freezeAuthority: rand() < 0.06,
      lpLockedPct: pick(rand, [0, 10, 25, 60, 80, 95, 100, 100, 100]),
      buyTaxPct: rand() < 0.85 ? 0 : logUniform(rand, 0.5, 12),
      sellTaxPct: rand() < 0.82 ? 0 : logUniform(rand, 0.5, 16),
      verifiedSource: rand() < 0.78,
      top10Pct: clamp(8 + Math.pow(rand(), 1.6) * 80, 5, 92),
      creatorStatus: pick(rand, ["holding", "holding", "holding", "trimmed", "trimmed", "exited"]),
      creatorPct: clamp(Math.pow(rand(), 2) * 18, 0, 18),
    };

    const riskTier = computeRiskTier(traits, liquidityUsd, ageDays);

    const base = {
      change1h, change6h, change24h, buys24h, sells24h, volumeAccel,
      liquidityUsd, marketCapUsd, volume24hUsd, holders, holderChange24h, riskTier,
    };
    const score = computeScore(base, rand);

    const histRand = mulberry32(hashString(`hist-${index}`));
    const scoreHistory: number[] = [];
    let h = clamp(score.composite + gauss(histRand) * 14, 2, 98);
    for (let i = 0; i < 48; i++) {
      scoreHistory.push(h);
      h = clamp(h + gauss(histRand) * 3.2 + (score.composite - h) * 0.08, 2, 98);
    }
    scoreHistory.push(score.composite);

    return {
      id: `t-${index.toString(36).padStart(4, "0")}`,
      chain,
      symbol,
      name,
      address: makeAddress(rand, chain),
      narrative,
      priceUsd,
      change5m, change1h, change6h, change24h,
      volume24hUsd, liquidityUsd, marketCapUsd,
      buys24h, sells24h, holders,
      createdAt,
      score,
      riskTier,
      traits,
      volumeAccel,
      holderChange24h,
      walkVol: 0.0012 + Math.pow(rand(), 2) * 0.012,
      description: this.makeDescription(name, symbol, narrative),
      scoreHistory,
    };
  }

  private makeDescription(name: string, symbol: string, narrative: string): string {
    const blurbs: Record<string, string> = {
      AI: `${name} ($${symbol}) positions itself as an agentic-AI play: token-gated access to autonomous agents with on-chain settlement of inference fees.`,
      Meme: `${name} ($${symbol}) is a pure community memecoin. No utility is claimed — valuation is entirely attention-driven.`,
      RWA: `${name} ($${symbol}) tokenizes claimed real-world cash flows. Verify custodial attestations independently before sizing.`,
      DePIN: `${name} ($${symbol}) rewards operators of physical network hardware with token emissions tied to verified uptime.`,
      Gaming: `${name} ($${symbol}) is the economy token of a web3 game; supply sinks are tied to in-game crafting and seasonal passes.`,
      DeFi: `${name} ($${symbol}) is the governance and fee-share token of a DeFi venue; value accrual depends on sustained protocol volume.`,
      Infra: `${name} ($${symbol}) secures a chain-infrastructure service; demand is a function of integrations, not retail flow.`,
    };
    return blurbs[narrative] ?? `${name} ($${symbol}).`;
  }

  private makeWallets(rand: () => number, now: number) {
    const labels = [
      "Sable Capital", "0xQuant", "Drift Whale 7", "Anon Sniper",
      "Meridian Fund", "TopBlock Trader", "Glass Lizard", "Pivot Desk",
      "Echo Wallet", "Northstar", "Sigma Grind", "Lowkey Whale",
    ];
    this.wallets = labels.map((label, i) => ({
      id: `w-${i}`,
      address: makeAddress(rand, "solana"),
      label,
      winRate: 0.5 + rand() * 0.31,
      realizedPnlUsd: logUniform(rand, 80_000, 6_000_000) * (rand() < 0.12 ? -0.3 : 1),
      trades30d: Math.round(8 + rand() * 90),
      avgHoldHours: Math.round(2 + rand() * 120),
      lastActiveAt: new Date(now - rand() * 6 * 3600_000).toISOString(),
    }));

    const kinds: WalletEvent["kind"][] = ["entry", "exit", "add", "trim"];
    for (let i = 0; i < 40; i++) {
      const w = pick(rand, this.wallets);
      const t = pick(rand, this.tokens.filter((x) => x.marketCapUsd > 100_000));
      this.walletEvents.push({
        id: `we-${i}`,
        walletId: w.id,
        walletLabel: w.label,
        kind: pick(rand, kinds),
        tokenId: t.id,
        symbol: t.symbol,
        amountUsd: logUniform(rand, 900, 250_000),
        priceUsd: t.priceUsd * (0.9 + rand() * 0.2),
        at: new Date(now - i * (300_000 + rand() * 900_000)).toISOString(),
      });
    }
  }

  /* ── live random walk ─────────────────────────────────────── */

  maybeAdvance(): void {
    const now = Date.now();
    const elapsed = now - this.lastTickAt;
    if (elapsed < TICK_MS) return;
    const steps = Math.min(5, Math.floor(elapsed / TICK_MS));
    for (let s = 0; s < steps; s++) this.tick();
    this.lastTickAt = now;

    if (now - this.lastLaunchAt > LAUNCH_EVERY_MS) {
      this.spawnLaunch(now);
      this.lastLaunchAt = now;
    }
    if (now - this.lastAlertAt > ALERT_EVERY_MS) {
      this.pushAlert(now);
      this.lastAlertAt = now;
    }
  }

  private tick(): void {
    const rand = this.liveRand;
    const n = Math.floor(this.tokens.length * 0.16);
    for (let i = 0; i < n; i++) {
      const t = this.tokens[Math.floor(rand() * this.tokens.length)];
      const move = gauss(rand) * t.walkVol * 100; // percent
      t.priceUsd = Math.max(1e-9, t.priceUsd * (1 + move / 100));
      t.change5m = clamp(t.change5m * 0.82 + move, -60, 90);
      t.change1h = clamp(t.change1h * 0.985 + move * 0.55, -85, 250);
      t.change6h = clamp(t.change6h * 0.995 + move * 0.3, -92, 500);
      t.change24h = clamp(t.change24h * 0.998 + move * 0.18, -96, 900);
      t.marketCapUsd = Math.max(5_000, t.marketCapUsd * (1 + move / 100));
      t.volume24hUsd = Math.max(500, t.volume24hUsd * (1 + gauss(rand) * 0.012));
      t.liquidityUsd = Math.max(1_000, t.liquidityUsd * (1 + gauss(rand) * 0.004));
      if (rand() < 0.5) {
        const trades = 1 + Math.floor(rand() * 5);
        if (rand() < 0.5 + move / 40) t.buys24h += trades;
        else t.sells24h += trades;
      }
      if (rand() < 0.12) {
        t.holders = Math.max(10, t.holders + Math.round(gauss(rand) * 6 + 1));
      }
      // recompute score with a deterministic per-token rand so the ring animates honestly
      const scoreRand = mulberry32(hashString(t.id) ^ Math.floor(Date.now() / 60_000));
      t.score = computeScore(t, scoreRand);
      const last = t.scoreHistory[t.scoreHistory.length - 1];
      if (Math.abs(last - t.score.composite) > 0.5) {
        t.scoreHistory.push(t.score.composite);
        if (t.scoreHistory.length > 64) t.scoreHistory.shift();
      }
    }

    this.global = {
      ...this.global,
      totalMarketCapUsd: this.global.totalMarketCapUsd * (1 + gauss(rand) * 0.0006),
      marketCapChange24h: clamp(this.global.marketCapChange24h + gauss(rand) * 0.05, -12, 12),
      volume24hUsd: this.global.volume24hUsd * (1 + gauss(rand) * 0.0015),
      btcDominance: clamp(this.global.btcDominance + gauss(rand) * 0.03, 38, 64),
      fearGreed: (() => {
        const v = Math.round(clamp(this.global.fearGreed.value + gauss(rand) * 0.6, 4, 96));
        const label = v < 25 ? "Extreme Fear" : v < 45 ? "Fear" : v < 55 ? "Neutral" : v < 76 ? "Greed" : "Extreme Greed";
        return { value: v, label };
      })(),
    };
  }

  private spawnLaunch(now: number): void {
    const rand = this.liveRand;
    const index = TOKEN_COUNT + this.launchCounter++;
    const usedNames = new Set(this.tokens.map((t) => t.name));
    const t = this.makeToken(rand, index, now, usedNames);
    // force it brand new
    t.createdAt = new Date(now - rand() * 90_000).toISOString();
    t.marketCapUsd = logUniform(rand, 15_000, 400_000);
    t.liquidityUsd = t.marketCapUsd * (0.2 + rand() * 0.5);
    t.volume24hUsd = t.marketCapUsd * (0.3 + rand() * 2);
    t.holders = Math.round(10 + rand() * 240);
    this.tokens.push(t);
    this.byId.set(t.id, t);

    this.launches.unshift({
      id: `launch-x${index}`,
      tokenId: t.id,
      symbol: t.symbol,
      name: t.name,
      chain: t.chain,
      launchedAt: t.createdAt,
      liquidityUsd: t.liquidityUsd,
      marketCapUsd: t.marketCapUsd,
      riskTier: t.riskTier,
      initialBuys: Math.floor(5 + rand() * 220),
    });
    if (this.launches.length > 40) this.launches.pop();
  }

  private pushAlert(at: number): void {
    const rand = this.liveRand;
    const t = pick(rand, this.tokens.filter((x) => x.marketCapUsd > 50_000));
    const templates: { severity: TickerAlert["severity"]; text: string }[] = [
      { severity: "signal", text: `$${t.symbol} momentum crossed ${Math.round(60 + rand() * 30)} — volume ${t.volumeAccel.toFixed(1)}× 7d average` },
      { severity: "info", text: `$${t.symbol} +${Math.abs(t.change1h).toFixed(1)}% on 1h with ${(t.buys24h / Math.max(1, t.buys24h + t.sells24h) * 100).toFixed(0)}% buy-side flow` },
      { severity: "caution", text: `$${t.symbol} liquidity ${rand() < 0.5 ? "drop" : "drain"} ${(8 + rand() * 30).toFixed(0)}% in the last hour` },
      { severity: "severe", text: `Risk tier worsened on $${t.symbol}: ${t.riskTier === "Avoid" ? "High → Avoid" : "Moderate → High"} — review forensic flags` },
      { severity: "signal", text: `New holder inflow on $${t.symbol}: +${Math.round(20 + rand() * 400)} wallets in 6h` },
      { severity: "info", text: `$${t.symbol} reclaimed its 24h VWAP; turnover ${(t.volume24hUsd / Math.max(1, t.marketCapUsd) * 100).toFixed(0)}% of mcap` },
    ];
    const chosen = pick(rand, templates);
    this.alerts.unshift({
      id: `al-${at}-${Math.floor(rand() * 1e6)}`,
      at: new Date(at).toISOString(),
      severity: chosen.severity,
      text: chosen.text,
      tokenId: t.id,
    });
    if (this.alerts.length > 60) this.alerts.pop();
  }

  /* ── accessors ────────────────────────────────────────────── */

  getGlobalMetrics(): GlobalMetrics {
    return { ...this.global, fearGreed: { ...this.global.fearGreed } };
  }

  getTokenById(id: string): EngineToken | undefined {
    return this.byId.get(id);
  }

  getLaunches(): LaunchEvent[] {
    return [...this.launches];
  }

  getAlerts(): TickerAlert[] {
    return [...this.alerts];
  }

  getWallets(): WalletProfile[] {
    return [...this.wallets];
  }

  getWalletEvents(): WalletEvent[] {
    // drip a synthetic new event roughly every 30s of wall time
    const rand = this.liveRand;
    const newest = this.walletEvents[0];
    if (newest && Date.now() - +new Date(newest.at) > 30_000 && rand() < 0.6) {
      const w = pick(rand, this.wallets);
      const t = pick(rand, this.tokens.filter((x) => x.marketCapUsd > 100_000));
      this.walletEvents.unshift({
        id: `we-${Date.now()}`,
        walletId: w.id,
        walletLabel: w.label,
        kind: pick(rand, ["entry", "exit", "add", "trim"] as const),
        tokenId: t.id,
        symbol: t.symbol,
        amountUsd: logUniform(rand, 900, 250_000),
        priceUsd: t.priceUsd,
        at: new Date().toISOString(),
      });
      if (this.walletEvents.length > 60) this.walletEvents.pop();
    }
    return [...this.walletEvents];
  }

  getNarratives(): NarrativeCategory[] {
    const map = new Map<string, NarrativeCategory>();
    for (const n of NARRATIVES) {
      map.set(n, {
        id: n.toLowerCase(),
        name: n,
        tokenCount: 0,
        marketCapUsd: 0,
        flow24hUsd: 0,
        flow7dUsd: 0,
        change24h: 0,
        change7d: 0,
      });
    }
    const sums = new Map<string, { w24: number; mc: number }>();
    for (const t of this.tokens) {
      const c = map.get(t.narrative);
      if (!c) continue;
      c.tokenCount++;
      c.marketCapUsd += t.marketCapUsd;
      // crude flow estimate: net buy share of volume
      const buyShare = t.buys24h / Math.max(1, t.buys24h + t.sells24h);
      c.flow24hUsd += t.volume24hUsd * (buyShare - 0.5) * 2;
      const s = sums.get(t.narrative) ?? { w24: 0, mc: 0 };
      s.w24 += t.change24h * t.marketCapUsd;
      s.mc += t.marketCapUsd;
      sums.set(t.narrative, s);
    }
    const detRand = mulberry32(UNIVERSE_SEED ^ 0x7e4d);
    for (const c of map.values()) {
      const s = sums.get(c.name);
      c.change24h = s && s.mc > 0 ? s.w24 / s.mc : 0;
      c.change7d = c.change24h * (1.6 + detRand() * 2.2) + gauss(detRand) * 6;
      c.flow7dUsd = c.flow24hUsd * (3.5 + detRand() * 4) + gauss(detRand) * 2e6;
    }
    return [...map.values()].sort((a, b) => b.flow24hUsd - a.flow24hUsd);
  }

  getHolderStats(tokenId: string): HolderStats | null {
    const t = this.byId.get(tokenId);
    if (!t) return null;
    const r = mulberry32(hashString(`hold-${tokenId}`));
    const top10 = t.traits.top10Pct;
    const next40 = clamp((100 - top10) * (0.3 + r() * 0.3), 2, 100 - top10 - 2);
    return {
      tokenId,
      holderCount: t.holders,
      holderChange24h: t.holderChange24h,
      top10Pct: top10,
      creatorStatus: t.traits.creatorStatus,
      creatorPct: t.traits.creatorPct,
      distribution: [
        { label: "Top 10 wallets", pct: top10 },
        { label: "Wallets 11–50", pct: next40 },
        { label: "Everyone else", pct: 100 - top10 - next40 },
      ],
    };
  }

  getRiskReport(tokenId: string): { tier: RiskTier; flags: RiskFlag[] } | null {
    const t = this.byId.get(tokenId);
    if (!t) return null;
    const ageDays = (Date.now() - +new Date(t.createdAt)) / 86_400_000;
    return {
      tier: t.riskTier,
      flags: buildRiskFlags(t.traits, t.liquidityUsd, ageDays),
    };
  }

  toDetail(t: EngineToken): TokenDetail {
    const explorer =
      t.chain === "solana"
        ? `https://solscan.io/token/${t.address}`
        : t.chain === "base"
          ? `https://basescan.org/token/${t.address}`
          : `https://etherscan.io/token/${t.address}`;
    return {
      ...t,
      description: t.description,
      scoreHistory: [...t.scoreHistory],
      links: [
        { kind: "website", url: `https://example.org/${t.symbol.toLowerCase()}` },
        { kind: "x", url: `https://x.com/${t.symbol.toLowerCase()}` },
        { kind: "explorer", url: explorer },
        { kind: "dexscreener", url: `https://dexscreener.com/${t.chain}/${t.address}` },
      ],
    };
  }

  /* ── candles ──────────────────────────────────────────────── */

  getCandles(tokenId: string, interval: CandleInterval): Candle[] {
    const t = this.byId.get(tokenId);
    if (!t) return [];
    const key = `${tokenId}:${interval}`;
    let series = this.candleCache.get(key);
    if (!series) {
      series = this.generateCandles(t, interval);
      this.candleCache.set(key, series);
    }
    // keep the latest bar honest against the walking price
    const last = series[series.length - 1];
    last.close = t.priceUsd;
    last.high = Math.max(last.high, t.priceUsd);
    last.low = Math.min(last.low, t.priceUsd);
    return series.map((c) => ({ ...c }));
  }

  private generateCandles(t: EngineToken, interval: CandleInterval): Candle[] {
    const secondsPer: Record<CandleInterval, number> = {
      "15m": 900,
      "1h": 3600,
      "4h": 14_400,
      "1d": 86_400,
    };
    const step = secondsPer[interval];
    const count = 280;
    const rand = mulberry32(hashString(`${t.id}:${interval}`));
    const volPerBar = t.walkVol * Math.sqrt(step / 60) * 6;

    const nowSec = Math.floor(Date.now() / 1000 / step) * step;
    const ageSec = (Date.now() - +new Date(t.createdAt)) / 1000;
    const bars = Math.min(count, Math.max(12, Math.floor(ageSec / step)));

    // walk backwards from the current price so the chart ends exactly at spot
    const closes: number[] = new Array(bars);
    let p = t.priceUsd;
    for (let i = bars - 1; i >= 0; i--) {
      closes[i] = p;
      const drift = (t.change24h / 100) * (step / 86_400) * 0.6;
      p = Math.max(1e-10, p / (1 + gauss(rand) * volPerBar + drift));
    }

    const out: Candle[] = [];
    for (let i = 0; i < bars; i++) {
      const open = i === 0 ? closes[0] * (1 + gauss(rand) * volPerBar * 0.4) : closes[i - 1];
      const close = closes[i];
      const hi = Math.max(open, close) * (1 + Math.abs(gauss(rand)) * volPerBar * 0.7);
      const lo = Math.min(open, close) * (1 - Math.abs(gauss(rand)) * volPerBar * 0.7);
      out.push({
        time: nowSec - (bars - 1 - i) * step,
        open,
        high: hi,
        low: lo,
        close,
        volume: (t.volume24hUsd / (86_400 / step)) * (0.3 + Math.abs(gauss(rand)) * 1.6),
      });
    }
    return out;
  }
}

/* ── singleton ──────────────────────────────────────────────── */

let engine: SampleEngine | null = null;

export function getEngine(): SampleEngine {
  if (!engine) engine = new SampleEngine();
  engine.maybeAdvance();
  return engine;
}

/** Simulated network latency so loading states are honest. */
export function simulateLatency(min = 120, max = 420): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
