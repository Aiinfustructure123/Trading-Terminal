/**
 * Typed service interfaces — the contract every data layer implements.
 *
 * Phase 0 implements these in `sample/*` with realistic generated data.
 * Phase 1+ drops in `live/*` implementations behind the SAME interfaces;
 * components never change. `config.ts` controls sample vs live per source,
 * which drives the SAMPLE / LIVE badges automatically.
 */

// ---------------------------------------------------------------------------
// Domain model
// ---------------------------------------------------------------------------

export type Chain = "solana" | "base" | "ethereum";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export type ScoreComponentKey =
  | "momentum"
  | "liquidity"
  | "holders"
  | "volume"
  | "riskInverse";

export interface ScoreComponent {
  key: ScoreComponentKey;
  label: string;
  /** 0–100 sub-score for this component */
  score: number;
  /** 0–1 weight; weights across components sum to 1 */
  weight: number;
  /** Raw input value the sub-score was derived from, human-readable */
  inputValue: string;
  /** Plain-English explanation of what this component measures and why it scored this way */
  reason: string;
}

export interface ConvictionScore {
  /** 0–100 composite */
  total: number;
  components: ScoreComponent[];
  computedAt: number;
}

export interface TxnStats {
  buys: number;
  sells: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  chain: Chain;
  address: string;
  priceUsd: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  fdv: number;
  ageHours: number;
  txns24h: TxnStats;
  holderCount: number;
  narrative: NarrativeId;
  conviction: ConvictionScore;
  riskTier: RiskTier;
  links: { website?: string; twitter?: string; explorer: string; dexscreener: string };
}

export interface MarketPulse {
  totalMarketCapUsd: number;
  totalMarketCapChange24h: number;
  volume24hUsd: number;
  volume24hChange: number;
  btcDominancePct: number;
  btcDominanceChange24h: number;
  /** 0–100 */
  fearGreedIndex: number;
  fearGreedLabel: string;
  updatedAt: number;
}

export type NarrativeId = "ai" | "meme" | "rwa" | "depin" | "gaming";

export interface Narrative {
  id: NarrativeId;
  name: string;
  tokenCount: number;
  totalMarketCap: number;
  /** Net capital flow, USD (signed) */
  flow24h: number;
  flow7d: number;
  change24h: number;
  topTokenIds: string[];
}

export interface Candle {
  /** Unix seconds */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleInterval = "15m" | "1h" | "4h" | "1d";

export interface ScreenerFilter {
  maxMarketCap?: number;
  minLiquidity?: number;
  maxAgeHours?: number;
  minVolume24h?: number;
  maxRiskTier?: RiskTier;
  chain?: Chain | "all";
  search?: string;
}

export type ScreenerSortKey =
  | "conviction"
  | "marketCap"
  | "volume24h"
  | "liquidityUsd"
  | "change24h"
  | "change1h"
  | "ageHours";

export interface ScreenerQuery {
  filter: ScreenerFilter;
  sort: { key: ScreenerSortKey; dir: "asc" | "desc" };
  limit?: number;
}

export interface NewLaunch {
  token: Token;
  launchedAt: number;
  initialLiquidityUsd: number;
}

// ---------------------------------------------------------------------------
// Forensics / security
// ---------------------------------------------------------------------------

export type RiskFlagSeverity = "info" | "warning" | "critical";

export interface RiskFlag {
  id: string;
  severity: RiskFlagSeverity;
  title: string;
  explanation: string;
}

export interface RiskReport {
  tokenId: string;
  tier: RiskTier;
  flags: RiskFlag[];
  mintAuthorityActive: boolean;
  freezeAuthorityActive: boolean;
  lpLockedPct: number;
  buyTaxPct: number;
  sellTaxPct: number;
  honeypot: boolean;
  checkedAt: number;
}

// ---------------------------------------------------------------------------
// On-chain / holders
// ---------------------------------------------------------------------------

export type CreatorWalletStatus = "holding" | "sold-partial" | "sold-all" | "unknown";

export interface HolderBucket {
  label: string;
  pct: number;
}

export interface HoldersInfo {
  tokenId: string;
  count: number;
  countChange24h: number;
  top10ConcentrationPct: number;
  creatorStatus: CreatorWalletStatus;
  creatorHoldingPct: number;
  distribution: HolderBucket[];
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// AI layer
// ---------------------------------------------------------------------------

export interface ResearchBrief {
  tokenId: string;
  generatedAt: number;
  executiveSummary: string;
  whatTheDataShows: string[];
  bullCase: string[];
  bearCase: string[];
  keyRisks: string[];
  whatWouldChangeThePicture: string[];
}

export type ScenarioKind = "bull" | "base" | "bear";

export interface Scenario {
  kind: ScenarioKind;
  title: string;
  /** Observable conditions that define the scenario — never price targets or probabilities */
  conditions: string[];
  summary: string;
}

// ---------------------------------------------------------------------------
// Smart money
// ---------------------------------------------------------------------------

export interface TrackedWallet {
  address: string;
  label: string;
  winRatePct: number;
  realizedPnlUsd: number;
  trades30d: number;
  avgHoldHours: number;
}

export interface WalletEvent {
  id: string;
  walletAddress: string;
  walletLabel: string;
  kind: "entry" | "exit";
  tokenId: string;
  tokenSymbol: string;
  amountUsd: number;
  at: number;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export type AlertMetric =
  | "momentum"
  | "conviction"
  | "liquidityChange1h"
  | "priceChange1h"
  | "riskTier"
  | "volumeChange1h";

export type AlertCondition = "crosses-above" | "crosses-below" | "drops-more-than" | "worsens";

export interface AlertRule {
  id: string;
  name: string;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
  scope: "watchlist" | "all" | string; // string = specific token id
  enabled: boolean;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  ruleId: string;
  ruleName: string;
  tokenId: string;
  tokenSymbol: string;
  message: string;
  severity: "info" | "warning" | "critical";
  at: number;
  read: boolean;
}

// ---------------------------------------------------------------------------
// Source interfaces — implemented by sample/* (Phase 0) and live/* (Phase 1+)
// ---------------------------------------------------------------------------

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getNarratives(): Promise<Narrative[]>;
  screenTokens(query: ScreenerQuery): Promise<Token[]>;
  getToken(id: string): Promise<Token | null>;
  getTokens(ids: string[]): Promise<Token[]>;
  getCandles(tokenId: string, interval: CandleInterval): Promise<Candle[]>;
  getNewLaunches(limit?: number): Promise<NewLaunch[]>;
  getTopMovers(limit?: number): Promise<Token[]>;
  getTopConviction(limit?: number): Promise<Token[]>;
}

export interface OnChainSource {
  getHolders(tokenId: string): Promise<HoldersInfo>;
}

export interface SecuritySource {
  getRiskReport(tokenId: string): Promise<RiskReport>;
}

export interface AISource {
  getResearchBrief(tokenId: string, opts?: { regenerate?: boolean }): Promise<ResearchBrief>;
  getScenarios(tokenId: string): Promise<Scenario[]>;
}

export interface SmartMoneySource {
  getTrackedWallets(): Promise<TrackedWallet[]>;
  getRecentActivity(limit?: number): Promise<WalletEvent[]>;
}

export interface AlertsSource {
  getNotifications(limit?: number): Promise<NotificationItem[]>;
}
