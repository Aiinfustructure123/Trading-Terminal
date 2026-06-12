import { computeConviction } from "@/lib/scoring/momentum";
import { computeRisk, RISK_ORDER } from "@/lib/scoring/risk";
import { drift, type UniverseToken } from "@/lib/datasources/sample/rng";

/* Structured context object — mirrors the JSON payload that Phase 2
   assembles and hands to the Claude API. Centralized so the sample
   brief and the future live brief reason over the same shape. */
export function buildContext(u: UniverseToken) {
  const change24h = drift(u.seed + 1, 0.35, 60000) * 100;
  const volume24h = u.baseMarketCap * 0.4 * (1 + Math.abs(change24h) / 200);
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
  const riskInverse = 100 - RISK_ORDER[forensics.tier] * 28;
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
  const sorted = [...conviction.components].sort((a, b) => b.subScore - a.subScore);
  return {
    name: u.name,
    symbol: u.symbol,
    chain: u.chain,
    narrative: u.narrative,
    conviction: conviction.composite,
    riskTier: forensics.tier,
    topDriver: sorted[0].label,
    weakDriver: sorted[sorted.length - 1].label,
    volumeAccel: u.volumeAccel,
    volume24h,
    liquidityUsd: u.liquidityUsd,
    liqToMcap: (u.liquidityUsd / u.baseMarketCap) * 100,
    buySellRatio: u.buySellRatio,
    holders: u.holders,
    holderGrowth: u.holderGrowth * 100,
    top10Pct: u.top10Pct,
    lpLockedPct: u.lpLockedPct,
    mintAuthorityActive: u.mintAuthorityActive,
    riskFlags: forensics.flags.filter((f) => f.triggered && f.severity !== "info").map((f) => f.explanation),
  };
}
