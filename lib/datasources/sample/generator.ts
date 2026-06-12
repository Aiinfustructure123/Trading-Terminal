import type { CompositeScore, RiskTier, ScoreComponent, SourceState, Token } from "@/lib/datasources/types";
import { datasourceModes } from "@/lib/datasources/config";
import { clamp } from "@/lib/utils";

const symbols = [
  ["NEURAL", "Neural Mesh"],
  ["RIFT", "Rift Protocol"],
  ["SYN", "Synapse Dog"],
  ["EMBER", "Ember AI"],
  ["VECTOR", "Vector RWA"],
  ["LUMA", "Luma Gaming"],
  ["BLOOM", "Bloom DePIN"],
  ["ORBIT", "Orbit Agents"],
  ["PIXEL", "Pixel Forge"],
  ["QUANTA", "Quanta Labs"],
  ["NOVA", "Nova Inu"],
  ["ATLAS", "Atlas Yield"],
];

const narratives = ["AI", "Meme", "RWA", "DePIN", "Gaming"];
const riskTiers: RiskTier[] = ["Low", "Moderate", "High", "Avoid"];

export function sourceState(label = "sample.market"): SourceState {
  return {
    mode: datasourceModes.market,
    label,
    updatedAt: new Date().toISOString(),
  };
}

export function delay(min = 180, max = 620) {
  const duration = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function sampleAddress(index: number) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  let seed = hash(`address-${index}`);
  for (let i = 0; i < 44; i += 1) {
    seed = hash(`${seed}-${i}`);
    address += alphabet[Math.floor(random(seed) * alphabet.length)];
  }
  return address;
}

function liveJitter(index: number, amplitude: number) {
  return Math.sin(Date.now() / 45_000 + index * 0.67) * amplitude;
}

function component(
  key: ScoreComponent["key"],
  label: string,
  base: number,
  weight: number,
  tone: ScoreComponent["tone"],
  inputs: ScoreComponent["inputs"],
  reasoning: string,
): ScoreComponent {
  const score = Math.round(clamp(base, 0, 100));
  return {
    key,
    label,
    value: score,
    score,
    weight,
    tone,
    inputs,
    reasoning,
  };
}

function buildScore(index: number, token: Pick<Token, "volume24h" | "liquidityUsd" | "riskTier" | "buys24h" | "sells24h" | "narrative">): CompositeScore {
  const buySell = token.buys24h / Math.max(1, token.sells24h);
  const riskPenalty = token.riskTier === "Low" ? 86 : token.riskTier === "Moderate" ? 63 : token.riskTier === "High" ? 36 : 12;
  const momentum = 58 + random(hash(`momentum-${index}`)) * 36 + liveJitter(index, 4);
  const liquidity = 44 + Math.log10(token.liquidityUsd) * 6 + liveJitter(index + 8, 3);
  const holders = 52 + random(hash(`holders-${index}`)) * 34;
  const smartMoney = 40 + random(hash(`smart-${index}`)) * 48;
  const narrative = 55 + narratives.indexOf(token.narrative) * 5 + random(hash(`narrative-${index}`)) * 24;

  const components = [
    component("momentum", "Momentum", momentum, 0.26, "signal", [
      { label: "24h Volume", value: `$${(token.volume24h / 1_000_000).toFixed(2)}M` },
      { label: "Buy/Sell", value: `${buySell.toFixed(2)}x` },
      { label: "Impulse", value: `${Math.round(momentum)} / 100` },
    ], "Volume acceleration and buy-side pressure are compared against the sampled peer set."),
    component("liquidity", "Liquidity", liquidity, 0.2, liquidity > 70 ? "profit" : "warn", [
      { label: "Depth", value: `$${(token.liquidityUsd / 1_000_000).toFixed(2)}M` },
      { label: "Slippage Proxy", value: liquidity > 70 ? "Low" : "Elevated" },
      { label: "Growth", value: `${(8 + liveJitter(index, 7)).toFixed(1)}%` },
    ], "Depth and recent liquidity growth are weighted to avoid thin books with noisy moves."),
    component("holders", "Holders", holders, 0.16, "neutral", [
      { label: "Estimated Holders", value: `${Math.round(1_000 + holders * 180).toLocaleString()}` },
      { label: "Top 10", value: `${Math.max(8, 42 - holders / 2).toFixed(1)}%` },
      { label: "Creator", value: holders > 65 ? "Renounced" : "Unknown" },
    ], "Holder quality rewards broader ownership and lower top-wallet concentration."),
    component("riskInverse", "Risk Inverse", riskPenalty, 0.18, riskPenalty > 70 ? "profit" : riskPenalty > 45 ? "warn" : "danger", [
      { label: "Tier", value: token.riskTier },
      { label: "Flags", value: token.riskTier === "Low" ? "0" : token.riskTier === "Moderate" ? "2" : "4" },
      { label: "Authority", value: token.riskTier === "Avoid" ? "Active" : "Checked" },
    ], "Risk inverse declines as sample security flags become more severe."),
    component("smartMoney", "Smart Money", smartMoney, 0.1, smartMoney > 68 ? "profit" : "neutral", [
      { label: "Tracked Entries", value: `${Math.round(smartMoney / 12)}` },
      { label: "Net Flow", value: smartMoney > 65 ? "Positive" : "Mixed" },
      { label: "Exit Cluster", value: smartMoney > 60 ? "No" : "Watch" },
    ], "Sample tracked-wallet flow is included at low weight until a premium source is live."),
    component("narrative", "Narrative", narrative, 0.1, narrative > 78 ? "signal" : "neutral", [
      { label: "Category", value: token.narrative },
      { label: "Peer Rank", value: `#${1 + (index % 9)}` },
      { label: "Flow", value: narrative > 75 ? "Leading" : "Stable" },
    ], "Narrative score follows sampled capital-flow strength across terminal categories."),
  ];

  const value = Math.round(
    components.reduce((sum, item) => sum + item.score * item.weight, 0) /
      components.reduce((sum, item) => sum + item.weight, 0),
  );

  return {
    value,
    components,
    explanation:
      "The composite score is deterministic sample math over momentum, liquidity, holders, risk inverse, smart-money proxy, and narrative strength. It ranks observable conditions; it is not a price prediction.",
  };
}

export function makeToken(index: number): Token {
  const [symbolRoot, nameRoot] = symbols[index % symbols.length];
  const seed = hash(`token-${index}`);
  const narrative = narratives[index % narratives.length];
  const riskTier = riskTiers[Math.min(riskTiers.length - 1, Math.floor(random(seed + 3) * riskTiers.length))];
  const basePrice = 10 ** (-5 + random(seed) * 7);
  const priceUsd = basePrice * (1 + liveJitter(index, 0.018));
  const liquidityUsd = 40_000 + random(seed + 1) * 7_500_000;
  const marketCapUsd = liquidityUsd * (2.2 + random(seed + 2) * 18);
  const volume24h = liquidityUsd * (0.35 + random(seed + 4) * 6.2);
  const buys24h = Math.round(80 + random(seed + 5) * 4_800);
  const sells24h = Math.round(60 + random(seed + 6) * 4_100);
  const tokenBase = {
    id: `token-${index}`,
    chain: "solana" as const,
    symbol: index < symbols.length ? symbolRoot : `${symbolRoot}${index}`,
    name: index < symbols.length ? nameRoot : `${nameRoot} ${index}`,
    address: sampleAddress(index),
    priceUsd,
    deltas: {
      m5: liveJitter(index, 1.8) + (random(seed + 7) - 0.5) * 3,
      h1: liveJitter(index, 4.8) + (random(seed + 8) - 0.45) * 8,
      h6: liveJitter(index, 8.2) + (random(seed + 9) - 0.42) * 16,
      h24: liveJitter(index, 16) + (random(seed + 10) - 0.38) * 34,
      d7: liveJitter(index, 24) + (random(seed + 11) - 0.35) * 90,
    },
    volume24h,
    liquidityUsd,
    marketCapUsd,
    ageHours: Math.round(2 + random(seed + 12) * 1_600),
    buys24h,
    sells24h,
    riskTier,
    narrative,
    source: sourceState("sample.market"),
  };

  return {
    ...tokenBase,
    conviction: buildScore(index, tokenBase),
  };
}

export function makeTokens(count = 1_000) {
  return Array.from({ length: count }, (_, index) => makeToken(index));
}
