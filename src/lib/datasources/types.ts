/**
 * ALPHA TERMINAL — datasource contracts.
 *
 * Every panel in the UI consumes data exclusively through these interfaces.
 * Phase 0 ships `sample/*` implementations (seeded, deterministic, with
 * simulated latency and live-feeling updates). Later phases drop `live/*`
 * implementations behind the exact same interfaces — components never change.
 * The sample/live switch per source lives in `config.ts` and drives the
 * SAMPLE / LIVE badges automatically.
 */

/* ── primitives ─────────────────────────────────────────────── */

export type Chain = "solana" | "base" | "ethereum";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export const RISK_TIER_ORDER: Record<RiskTier, number> = {
  Low: 0,
  Moderate: 1,
  High: 2,
  Avoid: 3,
};

/* ── conviction score ───────────────────────────────────────── */

export type ScoreComponentKey =
  | "momentum"
  | "liquidity"
  | "holders"
  | "volume"
  | "riskInverse";

export interface ScoreComponent {
  key: ScoreComponentKey;
  label: string;
  /** Human-readable raw input behind the sub-score, e.g. "24h vol 3.2× 7d avg". */
  input: string;
  /** 0–100 */
  subScore: number;
  /** 0–1; all component weights sum to 1. */
  weight: number;
  /** Plain-English reasoning for this component's sub-score. */
  explanation: string;
}

export interface ConvictionScore {
  /** 0–100 weighted composite. */
  composite: number;
  components: ScoreComponent[];
  computedAt: string;
}

/* ── market data ────────────────────────────────────────────── */

export interface TokenSummary {
  id: string;
  chain: Chain;
  symbol: string;
  name: string;
  address: string;
  narrative: string;
  priceUsd: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  volume24hUsd: number;
  liquidityUsd: number;
  marketCapUsd: number;
  buys24h: number;
  sells24h: number;
  holders: number;
  createdAt: string;
  score: ConvictionScore;
  riskTier: RiskTier;
}

export interface TokenLink {
  kind: "website" | "x" | "telegram" | "explorer" | "dexscreener";
  url: string;
}

export interface TokenDetail extends TokenSummary {
  description: string;
  links: TokenLink[];
  /** Composite-score history for sparklines (most recent last). */
  scoreHistory: number[];
}

export interface Candle {
  /** Unix seconds. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleInterval = "15m" | "1h" | "4h" | "1d";

export interface GlobalMetrics {
  totalMarketCapUsd: number;
  marketCapChange24h: number;
  volume24hUsd: number;
  btcDominance: number;
  fearGreed: { value: number; label: string };
}

export interface LaunchEvent {
  id: string;
  tokenId: string;
  symbol: string;
  name: string;
  chain: Chain;
  launchedAt: string;
  liquidityUsd: number;
  marketCapUsd: number;
  riskTier: RiskTier;
  initialBuys: number;
}

export interface TickerAlert {
  id: string;
  at: string;
  severity: "info" | "signal" | "caution" | "severe";
  text: string;
  tokenId?: string;
}

export interface ScreenerFilter {
  search?: string;
  narrative?: string;
  chains?: Chain[];
  /** USD ceiling, e.g. 5_000_000. */
  maxMarketCapUsd?: number;
  minLiquidityUsd?: number;
  maxAgeDays?: number;
  minVolume24hUsd?: number;
  maxRiskTier?: RiskTier;
  ids?: string[];
}

export type ScreenerSortKey =
  | "marketCapUsd"
  | "volume24hUsd"
  | "liquidityUsd"
  | "priceUsd"
  | "change5m"
  | "change1h"
  | "change6h"
  | "change24h"
  | "createdAt"
  | "composite";

export interface ScreenerSort {
  key: ScreenerSortKey;
  dir: "asc" | "desc";
}

export interface MarketDataSource {
  getGlobalMetrics(): Promise<GlobalMetrics>;
  listTokens(params?: {
    filter?: ScreenerFilter;
    sort?: ScreenerSort;
    limit?: number;
  }): Promise<TokenSummary[]>;
  getToken(id: string): Promise<TokenDetail | null>;
  getCandles(tokenId: string, interval: CandleInterval): Promise<Candle[]>;
  getNewLaunches(limit?: number): Promise<LaunchEvent[]>;
  getTickerAlerts(limit?: number): Promise<TickerAlert[]>;
}

/* ── trends / narratives ────────────────────────────────────── */

export interface NarrativeCategory {
  id: string;
  name: string;
  tokenCount: number;
  marketCapUsd: number;
  /** Net capital flow estimates, USD (can be negative). */
  flow24hUsd: number;
  flow7dUsd: number;
  change24h: number;
  change7d: number;
}

export interface TrendsSource {
  listNarratives(): Promise<NarrativeCategory[]>;
}

/* ── on-chain ───────────────────────────────────────────────── */

export type CreatorStatus = "holding" | "trimmed" | "exited";

export interface HolderStats {
  tokenId: string;
  holderCount: number;
  holderChange24h: number;
  top10Pct: number;
  creatorStatus: CreatorStatus;
  creatorPct: number;
  distribution: { label: string; pct: number }[];
}

export interface OnChainSource {
  getHolderStats(tokenId: string): Promise<HolderStats>;
}

/* ── security / forensics ───────────────────────────────────── */

export type RiskSeverity = "info" | "caution" | "severe";

export interface RiskFlag {
  id: string;
  severity: RiskSeverity;
  title: string;
  detail: string;
}

export interface RiskReport {
  tokenId: string;
  tier: RiskTier;
  flags: RiskFlag[];
  summary: string;
}

export interface SecuritySource {
  getRiskReport(tokenId: string): Promise<RiskReport>;
}

/* ── AI ─────────────────────────────────────────────────────── */

export interface ScenarioCase {
  kind: "bull" | "base" | "bear";
  title: string;
  /** Observable conditions that define the scenario — never predictions. */
  conditions: string[];
  reading: string;
}

export interface ResearchBrief {
  tokenId: string;
  generatedAt: string;
  model: string;
  executiveSummary: string;
  whatTheDataShows: string[];
  bullCase: string[];
  bearCase: string[];
  keyRisks: string[];
  whatWouldChangeThePicture: string[];
}

export interface AISource {
  getResearchBrief(
    tokenId: string,
    opts?: { regenerate?: boolean },
  ): Promise<ResearchBrief>;
  getScenarios(tokenId: string): Promise<ScenarioCase[]>;
}

/* ── smart money ────────────────────────────────────────────── */

export interface WalletProfile {
  id: string;
  address: string;
  label: string;
  winRate: number;
  realizedPnlUsd: number;
  trades30d: number;
  avgHoldHours: number;
  lastActiveAt: string;
}

export interface WalletEvent {
  id: string;
  walletId: string;
  walletLabel: string;
  kind: "entry" | "exit" | "add" | "trim";
  tokenId: string;
  symbol: string;
  amountUsd: number;
  priceUsd: number;
  at: string;
}

export interface SmartMoneySource {
  listWallets(): Promise<WalletProfile[]>;
  getRecentActivity(limit?: number): Promise<WalletEvent[]>;
}
