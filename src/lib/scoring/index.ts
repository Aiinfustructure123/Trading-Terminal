/**
 * Conviction Score — assembles all components into the final ConvictionScore object.
 * This is the single entry point called by live data sources.
 */

import type { ConvictionScore, ScoreComponent } from "@/lib/datasources/types";
import { computeMomentumScore, type MomentumInputs } from "./momentum";
import { computeRiskFlags, computeRiskTier, type SecurityInputs } from "./risk";

export interface ScoringInputs {
  momentum: MomentumInputs;
  security: SecurityInputs;
}

export function buildConvictionScore(inputs: ScoringInputs): ConvictionScore {
  const momentumSub  = computeMomentumScore(inputs.momentum);
  const riskFlags    = computeRiskFlags(inputs.security);
  const riskTier     = computeRiskTier(riskFlags);

  // Safety sub-score = inverse of risk severity
  const severityWeights: Record<string, number> = { critical: 40, high: 20, medium: 8, low: 3, info: 0 };
  const safetyTriggeredScore = riskFlags
    .filter(f => f.triggered)
    .reduce((s, f) => s + (severityWeights[f.severity] ?? 0), 0);
  const safetySub = Math.max(0, 100 - safetyTriggeredScore);

  // Liquidity sub-score (normalized log scale)
  const liq = inputs.momentum.liquidity;
  const liqSub = Math.max(0, Math.min(100,
    liq <= 0 ? 0 : Math.round((Math.log10(liq) - 3) / (7 - 3) * 100)
  ));

  // Buy pressure sub-score
  const total = inputs.momentum.buys24h + inputs.momentum.sells24h;
  const buyRatio = total > 0 ? inputs.momentum.buys24h / total : 0.5;
  const holderSub = Math.round(buyRatio * 100);

  // Narrative sub-score (placeholder until category data is live)
  const narrativeSub = Math.round((momentumSub * 0.6 + liqSub * 0.4) * 0.8);

  const components: ScoreComponent[] = [
    {
      key:         "momentum",
      label:       "Momentum",
      value:       +inputs.momentum.priceChange24h.toFixed(2),
      subScore:    momentumSub,
      weight:      0.30,
      description: `24h price ${inputs.momentum.priceChange24h >= 0 ? "+" : ""}${inputs.momentum.priceChange24h.toFixed(2)}% with ${inputs.momentum.buys24h.toLocaleString()} buys vs ${inputs.momentum.sells24h.toLocaleString()} sells. Volume/liquidity ratio: ${liq > 0 ? (inputs.momentum.volume24h / liq).toFixed(2) : "—"}×.`,
    },
    {
      key:         "liquidity",
      label:       "Liquidity",
      value:       liq,
      subScore:    liqSub,
      weight:      0.25,
      description: `Pool depth: $${liq.toLocaleString(undefined, {maximumFractionDigits: 0})}. ${liq >= 100_000 ? "Sufficient to support meaningful position sizing." : liq >= 25_000 ? "Moderate — expect some slippage." : "Thin — high slippage and manipulation risk."}`,
    },
    {
      key:         "holders",
      label:       "Holders",
      value:       holderSub,
      subScore:    holderSub,
      weight:      0.20,
      description: `Buy/sell pressure proxy: ${(buyRatio * 100).toFixed(0)}% of 24h transactions are buys. On-chain holder data available with Helius integration.`,
    },
    {
      key:         "risk_inv",
      label:       "Safety",
      value:       safetySub,
      subScore:    safetySub,
      weight:      0.15,
      description: `${riskFlags.filter(f => f.triggered).length} risk flag(s) active. ${safetySub >= 80 ? "No critical security issues detected." : safetySub >= 50 ? "Some flags require attention." : "Multiple high-severity flags — proceed with caution."}`,
    },
    {
      key:         "narrative",
      label:       "Narrative",
      value:       narrativeSub,
      subScore:    narrativeSub,
      weight:      0.10,
      description: "Narrative alignment computed from momentum and liquidity signals. Category capital flow data added in Phase 1 final.",
    },
  ];

  const composite = Math.round(
    components.reduce((sum, c) => sum + c.subScore * c.weight, 0)
  );

  return {
    composite,
    components,
    riskTier,
    riskFlags,
    computedAt: new Date().toISOString(),
  };
}
