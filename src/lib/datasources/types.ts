/**
 * ALPHA TERMINAL — data source contracts.
 *
 * Every panel reads through one of these typed interfaces. Phase 0 ships
 * `sample/*` implementations returning realistic generated data with simulated
 * latency; later phases drop in `live/*` implementations behind the SAME
 * interfaces, so components never change. A single config map (see `config.ts`)
 * controls sample/live per source and drives the SAMPLE / LIVE badges.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

export type Chain = "solana" | "base" | "ethereum";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export const RISK_TIER_ORDER: Record<RiskTier, number> = {
  Low: 0,
  Moderate: 1,
  High: 2,
  Avoid: 3,
};

export type Timeframe = "15m" | "1h" | "4h" | "1d";

/** Liveness of a source — drives the badge shown on every panel. */
export type SourceStatus = "sample" | "live" | "degraded";

/** Identifiers for each pluggable data source. */
export type SourceKey = "market" | "onchain" | "security" | "ai" | "smartMoney";

// ─────────────────────────────────────────────────────────────────────────────
// Scoring / Conviction Ring
// ─────────────────────────────────────────────────────────────────────────────

export type ScoreComponentKey =
  | "momentum"
  | "volume"
  | "liquidity"
  | "holders"
  | "smartMoney"
  | "riskInverse";

/** One segment of the Conviction Ring + one row in the breakdown panel. */
export interface ScoreComponent {
  key: ScoreComponentKey;
  label: string;
  /** 0–100 normalized sub-score (drives the ring segment fill). */
  score: number;
  /** 0–1 weight in the composite. */
  weight: number;
  /** Formatted raw observable input, e.g. "$1.2M / +180% vs 7d avg". */
  rawLabel: string;
  /** Plain-English one-liner explaining the sub-score. */
  explanation: string;
}

export interface ConvictionScore {
  /** 0–100 composite. */
  composite: number;
  components: ScoreComponent[];
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Market data
// ─────────────────────────────────────────────────────────────────────────────

export interface PriceDeltas {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

export type NarrativeKey = "AI" | "Meme" | "RWA" | "DePIN" | "Gaming" | "DeFi";

export interface TokenSummary {
  id: string;
  address: string;
  chain: Chain;
  symbol: string;
  name: string;
  /** Deterministic accent color for the sample logo chip. */
  accent: string;
  priceUsd: number;
  deltas: PriceDeltas;
  volume24hUsd: number;
  liquidityUsd: number;
  marketCapUsd: number;
  fdvUsd: number;
  createdAt: number;
  txns24h: { buys: number; sells: number };
  holders: number;
  riskTier: RiskTier;
  conviction: ConvictionScore;
  narrative: NarrativeKey | null;
}

export interface MarketPulse {
  totalMarketCapUsd: number;
  totalMarketCapChange24h: number;
  volume24hUsd: number;
  volume24hChange: number;
  btcDominance: number;
  btcDominanceChange: number;
  fearGreed: { value: number; label: string };
  updatedAt: number;
}

export interface Narrative {
  key: NarrativeKey;
  label: string;
  marketCapUsd: number;
  /** Capital flow over the window, percent. */
  flow24h: number;
  flow7d: number;
  tokenCount: number;
  topSymbols: string[];
}

export interface Candle {
  /** Unix seconds (lightweight-charts convention). */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MoverCell {
  id: string;
  symbol: string;
  marketCapUsd: number;
  change24h: number;
}

export type AlertSeverity = "info" | "profit" | "warn" | "danger";

export interface AlertTickerItem {
  id: string;
  severity: AlertSeverity;
  text: string;
  timestamp: number;
  tokenId?: string;
}

export interface ScreenerQuery {
  search?: string;
  chain?: Chain | "all";
  mcapMax?: number | null;
  minLiquidity?: number;
  maxAgeDays?: number | null;
  minVolume?: number;
  maxRiskTier?: RiskTier;
  narrative?: NarrativeKey | null;
  sortBy?: keyof TokenSummary | "conviction" | "change24h";
  sortDir?: "asc" | "desc";
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// On-chain (holders)
// ─────────────────────────────────────────────────────────────────────────────

export type CreatorStatus = "holding" | "sold" | "partial" | "unknown";

export interface HolderDistribution {
  totalHolders: number;
  /** Top-10 wallet concentration, percent of supply. */
  top10Pct: number;
  creatorPct: number;
  creatorStatus: CreatorStatus;
  buckets: { label: string; pct: number }[];
  topHolders: { rank: number; address: string; pct: number; label?: string }[];
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security / Forensics
// ─────────────────────────────────────────────────────────────────────────────

export type FlagSeverity = "critical" | "high" | "medium" | "low" | "pass";

export interface RiskFlag {
  id: string;
  label: string;
  severity: FlagSeverity;
  explanation: string;
  value?: string;
}

export interface ForensicsReport {
  tier: RiskTier;
  flags: RiskFlag[];
  mintAuthority: boolean;
  freezeAuthority: boolean;
  lpLocked: boolean;
  lpLockedPct: number;
  buyTaxPct: number;
  sellTaxPct: number;
  honeypot: boolean;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI research
// ─────────────────────────────────────────────────────────────────────────────

export interface ResearchBrief {
  tokenId: string;
  generatedAt: number;
  model: string;
  sections: {
    executiveSummary: string;
    whatTheDataShows: string[];
    bullCase: string[];
    bearCase: string[];
    keyRisks: string[];
    whatWouldChangeThePicture: string[];
  };
}

export type ScenarioKind = "bull" | "base" | "bear";

export interface Scenario {
  kind: ScenarioKind;
  title: string;
  /** Observable, falsifiable conditions — never probabilities or price targets. */
  conditions: string[];
  implication: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart money (premium — stays SAMPLE until a labeled-wallet source is contracted)
// ─────────────────────────────────────────────────────────────────────────────

export interface SmartWalletActivity {
  type: "entry" | "exit";
  tokenSymbol: string;
  amountUsd: number;
  timestamp: number;
}

export interface SmartWallet {
  address: string;
  label: string;
  /** 0–1. */
  winRate: number;
  realizedPnlUsd: number;
  trades30d: number;
  avgHoldHours: number;
  recentActivity: SmartWalletActivity[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Source interfaces — the seam between Phase 0 sample data and live APIs
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getNarratives(): Promise<Narrative[]>;
  getTokens(query?: ScreenerQuery): Promise<TokenSummary[]>;
  getToken(id: string): Promise<TokenSummary | null>;
  getNewLaunches(limit?: number): Promise<TokenSummary[]>;
  getMovers(limit?: number): Promise<MoverCell[]>;
  getCandles(id: string, timeframe: Timeframe): Promise<Candle[]>;
  getAlertsTicker(): Promise<AlertTickerItem[]>;
}

export interface OnChainSource {
  getHolders(id: string): Promise<HolderDistribution>;
}

export interface SecuritySource {
  getForensics(id: string): Promise<ForensicsReport>;
}

export interface AISource {
  getResearchBrief(id: string): Promise<ResearchBrief>;
  regenerateBrief(id: string): Promise<ResearchBrief>;
  getScenarios(id: string): Promise<Scenario[]>;
}

export interface SmartMoneySource {
  getWallets(): Promise<SmartWallet[]>;
}

export interface DataSources {
  market: MarketDataSource;
  onchain: OnChainSource;
  security: SecuritySource;
  ai: AISource;
  smartMoney: SmartMoneySource;
}
