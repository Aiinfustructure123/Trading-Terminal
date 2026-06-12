import type { Chain, ConvictionSegment, RiskTier, Token } from "@/lib/datasources/types";

const tokenSeeds = [
  ["nebula", "NEBULA", "Nebula Agent", "solana"],
  ["orbit", "ORBIT", "Orbit Labs", "solana"],
  ["vector", "VECTOR", "Vector AI", "base"],
  ["manta", "MANTA", "Manta Yield", "ethereum"],
  ["pixel", "PIXEL", "Pixel Swarm", "solana"],
  ["quartz", "QUARTZ", "Quartz RWA", "base"],
  ["forge", "FORGE", "Forge DePIN", "solana"],
  ["blitz", "BLITZ", "Blitz Meme", "solana"]
] as const;

function hash(input: string) {
  let value = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }

  return value >>> 0;
}

function seeded(id: string, salt: string, min: number, max: number) {
  const raw = hash(`${id}:${salt}`) / 0xffffffff;
  return min + raw * (max - min);
}

function liveWave(id: string, amplitude: number) {
  const phase = seeded(id, "phase", 0, Math.PI * 2);
  return Math.sin(Date.now() / 24_000 + phase) * amplitude;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function riskTierFromScore(score: number): RiskTier {
  if (score >= 82) return "Low";
  if (score >= 64) return "Moderate";
  if (score >= 42) return "High";
  return "Avoid";
}

export function buildSegments(id: string): ConvictionSegment[] {
  const momentum = clamp(seeded(id, "momentum", 48, 94) + liveWave(`${id}:mom`, 6));
  const liquidity = clamp(seeded(id, "liquidity", 38, 90) + liveWave(`${id}:liq`, 4));
  const holders = clamp(seeded(id, "holders", 34, 88) + liveWave(`${id}:holders`, 3));
  const riskInverse = clamp(seeded(id, "risk-inverse", 36, 92) - liveWave(`${id}:risk`, 5));

  return [
    {
      key: "momentum",
      label: "Momentum",
      value: momentum,
      weight: 0.3,
      color: "signal",
      reasoning: "Composite of price structure, volume acceleration, and buy/sell pressure."
    },
    {
      key: "liquidity",
      label: "Liquidity",
      value: liquidity,
      weight: 0.24,
      color: "profit",
      reasoning: "Depth, 24h liquidity change, and slippage resilience across pool size."
    },
    {
      key: "holders",
      label: "Holders",
      value: holders,
      weight: 0.2,
      color: "warn",
      reasoning: "Holder growth, wallet concentration, and top-10 distribution pressure."
    },
    {
      key: "risk-inverse",
      label: "Risk inverse",
      value: riskInverse,
      weight: 0.26,
      color: "danger",
      reasoning: "Inverse of security flags, contract control, and creator-wallet caution signals."
    }
  ];
}

function scoreFromSegments(segments: ConvictionSegment[]) {
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
  return segments.reduce((sum, segment) => sum + segment.value * segment.weight, 0) / totalWeight;
}

export function buildToken(id: string, index = 0): Token {
  const seed = tokenSeeds[index % tokenSeeds.length];
  const tokenId = id || seed[0];
  const segments = buildSegments(tokenId);
  const conviction = scoreFromSegments(segments);
  const baseMcap = seeded(tokenId, "mcap", 280_000, 42_000_000);
  const price = seeded(tokenId, "price", 0.00042, 0.18) * (1 + liveWave(`${tokenId}:price`, 0.025));
  const buys24h = Math.round(seeded(tokenId, "buys", 124, 3200));
  const sells24h = Math.round(buys24h * seeded(tokenId, "sell-ratio", 0.48, 0.94));

  return {
    id: tokenId,
    symbol: seed[1],
    name: seed[2],
    chain: seed[3] as Chain,
    address: `0x${hash(tokenId).toString(16).padStart(8, "0")}${hash(`${tokenId}:b`).toString(16).padStart(8, "0")}${hash(`${tokenId}:c`).toString(16).padStart(8, "0")}`,
    ageHours: Math.round(seeded(tokenId, "age", 4, 780)),
    price,
    deltas: {
      m5: seeded(tokenId, "m5", -3.8, 7.2) + liveWave(`${tokenId}:m5`, 0.9),
      h1: seeded(tokenId, "h1", -8, 18) + liveWave(`${tokenId}:h1`, 1.4),
      h6: seeded(tokenId, "h6", -15, 32) + liveWave(`${tokenId}:h6`, 1.8),
      h24: seeded(tokenId, "h24", -24, 64) + liveWave(`${tokenId}:h24`, 2.4)
    },
    volume24h: seeded(tokenId, "volume", 70_000, 9_500_000),
    liquidity: seeded(tokenId, "liquidity-value", 42_000, 3_400_000),
    marketCap: baseMcap * (1 + liveWave(`${tokenId}:mcap-live`, 0.045)),
    buys24h,
    sells24h,
    conviction,
    riskTier: riskTierFromScore(segments.find((segment) => segment.key === "risk-inverse")?.value ?? 50),
    segments,
    summary: "Rank driven by observable momentum, liquidity depth, holder distribution, and inverse risk inputs."
  };
}

export function buildTokenUniverse(count = 24) {
  return Array.from({ length: count }, (_, index) => {
    const seed = tokenSeeds[index % tokenSeeds.length];
    const cycle = Math.floor(index / tokenSeeds.length);
    const id = cycle === 0 ? seed[0] : `${seed[0]}-${cycle}`;
    return buildToken(id, index);
  }).sort((a, b) => b.conviction - a.conviction);
}
