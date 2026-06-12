import type { ConvictionScore, ScoreComponent, ScoreComponentKey } from "@/lib/datasources/types";
import { clamp } from "@/lib/utils";

/* ============================================================
   CONVICTION SCORING — pure, deterministic, documented.
   Each component returns a 0–100 sub-score; the composite is a
   weighted average. Weights are exported constants so they are
   auditable and unit-testable (see SCORING.md). The component
   breakdown feeds both the Conviction Ring segments and the
   score-breakdown panel.
   ============================================================ */

export const WEIGHTS: Record<ScoreComponentKey, number> = {
  momentum: 0.28,
  liquidity: 0.18,
  holders: 0.16,
  volume: 0.16,
  riskInverse: 0.14,
  smartMoney: 0.08,
};

export const COMPONENT_LABELS: Record<ScoreComponentKey, string> = {
  momentum: "Momentum",
  liquidity: "Liquidity",
  holders: "Holders",
  volume: "Volume",
  riskInverse: "Risk-Inverse",
  smartMoney: "Smart Money",
};

export interface ConvictionInputs {
  /** 24h volume relative to a 7d average (acceleration). 1 = flat, >1 accelerating. */
  volumeAccel: number;
  /** Buy/sell ratio over 24h. >1 means net buying. */
  buySellRatio: number;
  /** Net 24h price change as a fraction (0.2 = +20%). */
  priceChange24h: number;
  /** Absolute liquidity in USD. */
  liquidityUsd: number;
  /** Liquidity-to-marketcap ratio (depth). */
  liqToMcap: number;
  /** Holder count. */
  holders: number;
  /** Holder growth rate over 24h as fraction. */
  holderGrowth: number;
  /** Absolute 24h volume in USD. */
  volume24h: number;
  /** Risk penalty 0–100 where 100 is safest. */
  riskInverse: number;
  /** Smart-money interest signal 0–100 (SAMPLE — gated by premium data). */
  smartMoney: number;
}

function score(weight: number, sub: number, key: ScoreComponentKey, valueLabel: string, rationale: string): ScoreComponent {
  return { key, label: COMPONENT_LABELS[key], subScore: Math.round(clamp(sub, 0, 100)), weight, valueLabel, rationale };
}

/** Log-scaled normalization between a floor and ceiling. */
function logNorm(value: number, floor: number, ceil: number): number {
  if (value <= floor) return 0;
  if (value >= ceil) return 100;
  return (Math.log(value / floor) / Math.log(ceil / floor)) * 100;
}

export function computeConviction(inputs: ConvictionInputs): ConvictionScore {
  // Momentum: volume acceleration + buy pressure + price structure.
  const momentumSub =
    clamp((inputs.volumeAccel - 0.6) / 1.8, 0, 1) * 45 +
    clamp((inputs.buySellRatio - 0.7) / 1.0, 0, 1) * 30 +
    clamp((inputs.priceChange24h + 0.2) / 0.8, 0, 1) * 25;

  const liquiditySub = 0.6 * logNorm(inputs.liquidityUsd, 5_000, 5_000_000) + 0.4 * clamp(inputs.liqToMcap / 0.15, 0, 1) * 100;

  const holdersSub = 0.7 * logNorm(inputs.holders, 50, 50_000) + 0.3 * clamp((inputs.holderGrowth + 0.05) / 0.4, 0, 1) * 100;

  const volumeSub = logNorm(inputs.volume24h, 1_000, 20_000_000);

  const components: ScoreComponent[] = [
    score(WEIGHTS.momentum, momentumSub, "momentum", `${inputs.volumeAccel.toFixed(2)}× accel`,
      `Volume is running ${inputs.volumeAccel.toFixed(2)}× its 7d average with a ${inputs.buySellRatio.toFixed(2)} buy/sell ratio; 24h price ${(inputs.priceChange24h * 100).toFixed(1)}%.`),
    score(WEIGHTS.liquidity, liquiditySub, "liquidity", `$${Math.round(inputs.liquidityUsd).toLocaleString()}`,
      `Pool depth and a liquidity/mcap ratio of ${(inputs.liqToMcap * 100).toFixed(1)}% determine how cleanly a position can be exited.`),
    score(WEIGHTS.holders, holdersSub, "holders", `${inputs.holders.toLocaleString()} holders`,
      `Holder base of ${inputs.holders.toLocaleString()} growing ${(inputs.holderGrowth * 100).toFixed(1)}% in 24h indicates organic distribution.`),
    score(WEIGHTS.volume, volumeSub, "volume", `$${Math.round(inputs.volume24h).toLocaleString()}`,
      `Absolute 24h turnover; sustained volume confirms the move is tradeable, not a single-print wick.`),
    score(WEIGHTS.riskInverse, inputs.riskInverse, "riskInverse", `${Math.round(inputs.riskInverse)}/100 safe`,
      `Inverse of the forensic risk tier — active mint/freeze authority, low LP lock, or high taxes drag this down.`),
    score(WEIGHTS.smartMoney, inputs.smartMoney, "smartMoney", `${Math.round(inputs.smartMoney)}/100`,
      `SAMPLE signal — requires a labeled-wallet data source. Estimates tracked-wallet accumulation interest.`),
  ];

  const composite = Math.round(
    components.reduce((sum, c) => sum + c.subScore * c.weight, 0),
  );

  return { composite: clamp(composite, 0, 100), components };
}
