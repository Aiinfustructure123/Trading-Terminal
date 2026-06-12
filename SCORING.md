# Scoring Methodology

Alpha Terminal's core principle is that **every score is explainable**. This document
defines the deterministic scoring functions. They are pure, unit-testable, and have no
hidden inputs — the same inputs always produce the same output, and every output ships
with the breakdown that produced it.

Source of truth:

- Conviction: [`src/lib/scoring/momentum.ts`](src/lib/scoring/momentum.ts)
- Risk tier: [`src/lib/scoring/risk.ts`](src/lib/scoring/risk.ts)

> Phase 0 feeds these functions with sample metrics, so the Conviction Rings and the
> Score Breakdown panel already show *real, computed* numbers — not hard-coded values.
> In Phase 2 the same functions consume live metrics with zero component changes.

## Conviction Score (0–100)

The composite conviction is a **weighted average of six component sub-scores**, each
normalized to 0–100. Weights are exported constants and sum to 1.0.

| Component      | Weight | Measures                                                                 |
| -------------- | -----: | ----------------------------------------------------------------------- |
| `momentum`     |   0.28 | Volume acceleration (24h vs 7d), buy/sell ratio, 24h price structure    |
| `liquidity`    |   0.18 | Absolute pool depth (log-scaled) + liquidity/market-cap ratio           |
| `holders`      |   0.16 | Holder count (log-scaled) + 24h holder growth rate                      |
| `volume`       |   0.16 | Absolute 24h turnover (log-scaled)                                      |
| `riskInverse`  |   0.14 | Inverse of the forensic risk tier (safer = higher)                      |
| `smartMoney`   |   0.08 | Tracked-wallet accumulation interest (**SAMPLE** until premium data)    |

```
composite = round( Σ componentᵢ.subScore × componentᵢ.weight )
```

Each component returns a `ScoreComponent` carrying its `valueLabel` (the raw observed
metric), `subScore`, `weight`, and a plain-English `rationale`. These objects directly
populate both the Conviction Ring segments and the Score Breakdown panel.

### Normalization helpers

- **Momentum** blends three clamped linear ramps: volume acceleration (45%), buy/sell
  ratio (30%), and 24h price change (25%).
- **Log normalization** (`logNorm`) maps a value between a floor and ceiling onto 0–100
  on a log scale — appropriate for liquidity, holders, and volume which span orders of
  magnitude.

## Risk Tier (Low / Moderate / High / Avoid)

Risk is a **deterministic rule set**, not a number. Each rule inspects observable
on-chain/security facts and, when triggered, enforces a **minimum tier floor**. The
composite tier is the worst floor reached. Every rule (triggered or passed) is shown to
the user with its reasoning.

| Rule                  | Trigger                          | Tier floor when triggered |
| --------------------- | -------------------------------- | ------------------------- |
| Honeypot simulation   | sell simulation fails            | **Avoid**                 |
| Mint authority        | mint authority still active      | **High**                  |
| Freeze authority      | freeze authority active          | Moderate                  |
| LP lock / burn        | < 50% locked (< 20% = High)      | Moderate / High           |
| Holder concentration  | top-10 > 35% (> 60% = High)      | Moderate / High           |
| Transfer taxes        | buy or sell tax > 10%            | High                      |
| Creator holdings      | creator > 5% (> 15% = High)      | Moderate / High           |
| Thin liquidity        | < $25k (< $10k = High)           | Moderate / High           |
| New deployment        | < 24h old                        | informational             |

Example hard rule: **active mint authority ⇒ tier ≥ High**, always.

## Guarantees

1. **Deterministic** — no randomness, no time dependence inside the scoring functions.
2. **Explainable** — every number carries its inputs, weights, and rationale.
3. **No price predictions** — scoring produces relative rankings and observable
   conditions only, never probabilities of future returns.
