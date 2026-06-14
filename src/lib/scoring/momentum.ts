/**
 * Momentum Score — pure, deterministic, unit-testable.
 *
 * Inputs: raw market data available from DexScreener.
 * Output: 0–100 sub-score.
 *
 * Weights are exported constants — documented and changeable without
 * touching the formula.
 */

export interface MomentumInputs {
  priceChange5m:  number;   // %
  priceChange1h:  number;   // %
  priceChange6h:  number;   // %
  priceChange24h: number;   // %
  volume24h:      number;   // USD
  volume6h:       number;   // USD (used to approximate 7d avg via extrapolation)
  volume1h:       number;   // USD
  buys24h:        number;
  sells24h:       number;
  liquidity:      number;   // USD
}

// Weights — must sum to 1.0
export const MOMENTUM_WEIGHTS = {
  priceAcceleration: 0.30,  // short-term price trend
  volumeStrength:    0.30,  // volume relative to liquidity
  buyPressure:       0.25,  // buy/sell ratio
  liquidityGrowth:   0.15,  // proxy: volume/liquidity ratio health
} as const;

/**
 * Normalize a value to 0–100 using sigmoid-style clamping.
 * @param value    raw value
 * @param neutral  value that maps to ~50
 * @param scale    how many units = 1 standard deviation
 */
function normalize(value: number, neutral: number, scale: number): number {
  const z = (value - neutral) / scale;
  // sigmoid: 1 / (1 + e^-z), scaled to 0-100
  const sig = 1 / (1 + Math.exp(-z));
  return Math.round(sig * 100);
}

export function computeMomentumScore(inputs: MomentumInputs): number {
  // 1. Price acceleration: recent moves weighted toward shorter timeframes
  const priceSignal =
    inputs.priceChange5m  * 0.40 +
    inputs.priceChange1h  * 0.30 +
    inputs.priceChange6h  * 0.20 +
    inputs.priceChange24h * 0.10;
  const priceScore = normalize(priceSignal, 0, 5); // neutral=0%, scale=5%

  // 2. Volume / liquidity ratio — high volume relative to pool depth = interest
  const volLiqRatio = inputs.liquidity > 0 ? inputs.volume24h / inputs.liquidity : 0;
  const volumeScore = normalize(volLiqRatio, 1.5, 2); // neutral=1.5×, scale=2

  // 3. Buy pressure: buys / (buys + sells)
  const total = inputs.buys24h + inputs.sells24h;
  const buyRatio = total > 0 ? inputs.buys24h / total : 0.5;
  const buyScore = normalize(buyRatio, 0.5, 0.15); // neutral=50%, scale=15%

  // 4. Liquidity health: absolute liquidity (>$50k = healthy)
  const liqScore = normalize(Math.log10(Math.max(inputs.liquidity, 1)), 4.7, 1); // neutral=log10(50k)

  const composite =
    priceScore  * MOMENTUM_WEIGHTS.priceAcceleration +
    volumeScore * MOMENTUM_WEIGHTS.volumeStrength    +
    buyScore    * MOMENTUM_WEIGHTS.buyPressure       +
    liqScore    * MOMENTUM_WEIGHTS.liquidityGrowth;

  return Math.max(0, Math.min(100, Math.round(composite)));
}

export function describeFromScore(score: number, label: string): string {
  if (score >= 70) return `${label} is strong — signals above baseline.`;
  if (score >= 45) return `${label} is moderate — mixed signals.`;
  return `${label} is weak — bearish pressure or thin activity.`;
}
