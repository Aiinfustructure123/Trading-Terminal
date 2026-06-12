/* ============================================================
   DATA SOURCE CONTRACTS
   Every panel in the terminal reads through one of these typed
   interfaces. Phase 0 wires sample implementations behind them;
   later phases drop in `live/*` implementations with identical
   signatures — components never change. The sample/live choice is
   controlled centrally (see config.ts) and drives the SAMPLE/LIVE
   badge on every panel automatically.
   ============================================================ */

export type Chain = "solana" | "ethereum" | "base";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export type SourceMode = "sample" | "live";

/** A single explainable input to a composite score. */
export interface ScoreComponent {
  key: ScoreComponentKey;
  label: string;
  /** Raw observed metric, already formatted for display. */
  valueLabel: string;
  /** 0–100 normalized contribution for this component. */
  subScore: number;
  /** Relative weight in the composite, 0–1, sums to 1 across components. */
  weight: number;
  /** Plain-English line explaining what this measures and why it scored this way. */
  rationale: string;
}

export type ScoreComponentKey =
  | "momentum"
  | "liquidity"
  | "holders"
  | "volume"
  | "riskInverse"
  | "smartMoney";

/** Composite conviction score + its fully explainable breakdown. */
export interface ConvictionScore {
  composite: number; // 0–100
  components: ScoreComponent[];
}

export interface RiskFlag {
  id: string;
  label: string;
  severity: "info" | "caution" | "danger";
  explanation: string;
  /** Whether this rule fired for the token. Untriggered checks are shown as passed. */
  triggered: boolean;
}

/** Market-shaped fields for a token. Sourced from MarketDataSource. */
export interface TokenSummary {
  address: string;
  chain: Chain;
  symbol: string;
  name: string;
  /** Deterministic accent color for the token avatar. */
  accent: string;
  priceUsd: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  fdv: number;
  ageHours: number;
  buys24h: number;
  sells24h: number;
  holders: number;
  narrative: string;
  riskTier: RiskTier;
  conviction: ConvictionScore;
  /** 24-point price sparkline. */
  sparkline: number[];
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleInterval = "15m" | "1h" | "4h" | "1d";

export interface HolderBucket {
  label: string;
  pct: number;
}

export interface HoldersInfo {
  count: number;
  top10Pct: number;
  creatorPct: number;
  creatorStatus: string;
  distribution: HolderBucket[];
  growth24hPct: number;
}

export interface Forensics {
  tier: RiskTier;
  flags: RiskFlag[];
}

export interface Scenario {
  kind: "Bull" | "Base" | "Bear";
  thesis: string;
  conditions: string[];
}

export interface AIBriefSection {
  title: string;
  body: string;
}

export interface AIBrief {
  generatedAt: number;
  model: string;
  sections: AIBriefSection[];
}

export interface ExternalLink {
  label: string;
  url: string;
}

/** Full case-file shape used by the token detail screen. */
export interface TokenDetail extends TokenSummary {
  createdAt: number;
  links: ExternalLink[];
}

/* ----- Dashboard-level market shapes ----- */

export interface MarketPulse {
  totalMarketCap: number;
  mcapChange24h: number;
  totalVolume24h: number;
  volChange24h: number;
  btcDominance: number;
  btcDominanceChange24h: number;
  fearGreed: number; // 0–100
  fearGreedLabel: string;
}

export interface Narrative {
  id: string;
  name: string;
  marketCap: number;
  flow24h: number; // -100..100 capital flow index
  flow7d: number;
  tokenCount: number;
  topSymbols: string[];
}

export interface NewLaunch {
  address: string;
  chain: Chain;
  symbol: string;
  name: string;
  accent: string;
  ageMinutes: number;
  liquidityUsd: number;
  riskTier: RiskTier;
}

export interface MoverCell {
  address: string;
  symbol: string;
  marketCap: number;
  change24h: number;
  narrative: string;
}

export interface AlertEvent {
  id: string;
  time: number;
  severity: "info" | "caution" | "danger" | "profit";
  message: string;
  tokenSymbol?: string;
}

export interface SmartWalletAction {
  action: "BUY" | "SELL";
  symbol: string;
  amountUsd: number;
  time: number;
}

export interface SmartWallet {
  address: string;
  label: string;
  winRate: number; // 0–100
  realizedPnlUsd: number;
  trades30d: number;
  recentActions: SmartWalletAction[];
}

/* ----- Query shape for the screener ----- */

export interface TokenQuery {
  chain?: Chain | "all";
  maxMarketCap?: number;
  minLiquidity?: number;
  maxAgeHours?: number;
  minVolume24h?: number;
  maxRiskTier?: RiskTier;
  search?: string;
  limit?: number;
}

/* ============================================================
   THE FOUR SOURCE INTERFACES
   ============================================================ */

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getNarratives(): Promise<Narrative[]>;
  getTokens(query?: TokenQuery): Promise<TokenSummary[]>;
  getToken(address: string): Promise<TokenDetail | null>;
  getCandles(address: string, interval: CandleInterval): Promise<Candle[]>;
  getNewLaunches(): Promise<NewLaunch[]>;
  getMovers(): Promise<MoverCell[]>;
  getTopOpportunities(limit?: number): Promise<TokenSummary[]>;
  getAlerts(): Promise<AlertEvent[]>;
}

export interface OnChainSource {
  getHolders(address: string): Promise<HoldersInfo>;
  getSmartMoney(): Promise<SmartWallet[]>;
}

export interface SecuritySource {
  getForensics(address: string): Promise<Forensics>;
}

export interface AISource {
  getBrief(address: string): Promise<AIBrief>;
  getScenarios(address: string): Promise<Scenario[]>;
}

export type SourceKey = "market" | "onchain" | "security" | "ai";
