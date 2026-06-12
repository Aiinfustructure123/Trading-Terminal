/**
 * ALPHA TERMINAL — Data Source Interfaces
 *
 * Every data panel in the terminal is backed by one of these typed service
 * interfaces. Phase 0 implements each as a sample/* module. Phase 1+ replaces
 * them with live/* implementations behind the same interface — components
 * never change. A config map controls which implementation is active and
 * drives the SAMPLE/LIVE badges automatically.
 */

// ── Common primitives ───────────────────────────────────────────────────────

export type Chain = "solana" | "ethereum" | "base";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export type DataMode = "sample" | "live" | "degraded";

export interface SourceMeta {
  mode: DataMode;
  /** ISO-8601 timestamp of the last successful refresh */
  lastUpdated: string;
  /** Name of the underlying data provider */
  provider: string;
}

// ── Conviction score components ─────────────────────────────────────────────

export interface ScoreComponent {
  key: string;
  label: string;
  value: number;       // raw metric value
  subScore: number;    // 0–100 normalized
  weight: number;      // 0–1, weights sum to 1 across all components
  description: string; // plain-English explanation of this component
}

export interface ConvictionScore {
  composite: number;          // 0–100
  components: ScoreComponent[];
  riskTier: RiskTier;
  riskFlags: RiskFlag[];
  computedAt: string;         // ISO-8601
}

export interface RiskFlag {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  label: string;
  description: string;
  triggered: boolean;
}

// ── Token ───────────────────────────────────────────────────────────────────

export interface Token {
  address: string;
  symbol: string;
  name: string;
  chain: Chain;
  logoUrl?: string;

  price: number;
  priceChange5m:  number;  // percent
  priceChange1h:  number;
  priceChange6h:  number;
  priceChange24h: number;

  volume24h:  number;   // USD
  liquidity:  number;   // USD
  marketCap:  number;   // USD
  fdv?:       number;

  txns24h:    { buys: number; sells: number };
  age:        number;   // days since creation

  holderCount:  number;
  topHolderConcentration: number; // top-10 % of supply

  score: ConvictionScore;

  /** True when creator wallet has sold > 80% of initial supply */
  creatorSold?: boolean;
  /** Launch timestamp ISO-8601 */
  launchedAt?: string;
  dexUrl?: string;
}

// ── Market overview ─────────────────────────────────────────────────────────

export interface MarketPulse {
  globalMcap:    number;   // USD
  globalVolume:  number;   // USD
  btcDominance:  number;   // percent
  fearGreedIndex: number;  // 0–100
  fearGreedLabel: string;
  topGainerSymbol: string;
  topGainerPct:  number;
  source: SourceMeta;
}

// ── Narratives / categories ─────────────────────────────────────────────────

export interface Narrative {
  id: string;
  label: string;
  tokens: number;
  capitalFlow24h: number;   // USD net flow
  capitalFlow7d:  number;
  avgScore:       number;   // 0–100
  topTokens:      Pick<Token, "symbol" | "priceChange24h">[];
}

export interface NarrativesData {
  narratives: Narrative[];
  source: SourceMeta;
}

// ── OHLCV candles ───────────────────────────────────────────────────────────

export type CandleInterval = "15m" | "1h" | "4h" | "1d";

export interface Candle {
  time:   number;  // unix seconds
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface OHLCVData {
  address:  string;
  interval: CandleInterval;
  candles:  Candle[];
  source:   SourceMeta;
}

// ── Holder data ─────────────────────────────────────────────────────────────

export interface HolderEntry {
  rank:     number;
  address:  string;
  label?:   string;
  pct:      number;   // percent of supply
  value:    number;   // USD
  isCreator?: boolean;
}

export interface HolderData {
  address:      string;
  holderCount:  number;
  topHolders:   HolderEntry[];
  creatorWalletStatus: "holding" | "sold" | "partial" | "unknown";
  source: SourceMeta;
}

// ── Scenario analysis ───────────────────────────────────────────────────────

export interface Scenario {
  label:      "Bull" | "Base" | "Bear";
  conditions: string[];   // observable on-chain / market conditions
  implications: string;   // what this would suggest
}

export interface ScenarioData {
  address:  string;
  scenarios: Scenario[];
  disclaimer: string;
  source: SourceMeta;
}

// ── AI research brief ───────────────────────────────────────────────────────

export interface AIBrief {
  address:        string;
  executiveSummary: string;
  whatDataShows:  string;
  bullCase:       string;
  bearCase:       string;
  keyRisks:       string[];
  whatWouldChange: string;
  generatedAt:    string;  // ISO-8601
  model:          string;
  source: SourceMeta;
}

// ── New launches ────────────────────────────────────────────────────────────

export interface NewLaunch {
  address:     string;
  symbol:      string;
  name:        string;
  chain:       Chain;
  launchedAt:  string;  // ISO-8601
  initialLiquidity: number;
  currentLiquidity: number;
  volume1h:    number;
  riskTier:    RiskTier;
  score?:      number;
}

export interface NewLaunchesData {
  launches: NewLaunch[];
  source:   SourceMeta;
}

// ── Smart money wallets ─────────────────────────────────────────────────────

export interface SmartWallet {
  address:    string;
  label:      string;
  winRate:    number;   // 0–1
  realizedPnl: number;  // USD
  trades30d:  number;
  recentTrades: {
    type:     "buy" | "sell";
    symbol:   string;
    address:  string;
    usdValue: number;
    at:       string;   // ISO-8601
  }[];
}

export interface SmartMoneyData {
  wallets: SmartWallet[];
  source:  SourceMeta;
}

// ── Alerts ──────────────────────────────────────────────────────────────────

export type AlertConditionType =
  | "momentum_crosses"
  | "liquidity_drops"
  | "risk_worsens"
  | "price_moves"
  | "volume_spikes";

export interface AlertRule {
  id:         string;
  name:       string;
  condition:  AlertConditionType;
  params:     Record<string, number | string>;
  tokenAddress?: string;
  enabled:    boolean;
  createdAt:  string;
}

export interface AlertEvent {
  id:       string;
  ruleId:   string;
  ruleName: string;
  message:  string;
  severity: "info" | "warn" | "critical";
  at:       string;  // ISO-8601
  tokenSymbol?: string;
}

export interface AlertsData {
  rules:  AlertRule[];
  events: AlertEvent[];
  source: SourceMeta;
}

// ── Movers heatmap ──────────────────────────────────────────────────────────

export interface HeatmapCell {
  address:   string;
  symbol:    string;
  name:      string;
  mcap:      number;
  change24h: number;
}

export interface HeatmapData {
  cells:  HeatmapCell[];
  source: SourceMeta;
}

// ── Service interfaces ──────────────────────────────────────────────────────

/** Global market overview (CoinGecko global, Fear & Greed) */
export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getNarratives():  Promise<NarrativesData>;
  getHeatmap():     Promise<HeatmapData>;
}

/** Token market data and screening (DexScreener, GeckoTerminal) */
export interface TokenDataSource {
  getToken(address: string, chain: Chain): Promise<Token>;
  getTokens(params: ScreenerParams): Promise<{ tokens: Token[]; total: number; source: SourceMeta }>;
  getNewLaunches(chain: Chain, limit?: number): Promise<NewLaunchesData>;
  getOHLCV(address: string, chain: Chain, interval: CandleInterval): Promise<OHLCVData>;
}

/** On-chain data (Helius for Solana) */
export interface OnChainSource {
  getHolders(address: string, chain: Chain): Promise<HolderData>;
}

/** Security / forensics (GoPlus, RugCheck) */
export interface SecuritySource {
  getConvictionScore(address: string, chain: Chain): Promise<ConvictionScore>;
  getScenarios(address: string, chain: Chain): Promise<ScenarioData>;
}

/** AI research brief (Anthropic) */
export interface AISource {
  getBrief(address: string, chain: Chain): Promise<AIBrief>;
}

/** Smart money wallet tracker */
export interface SmartMoneySource {
  getSmartWallets(): Promise<SmartMoneyData>;
}

/** Alert rule management + event history */
export interface AlertsSource {
  getRules():    Promise<AlertRule[]>;
  getEvents():   Promise<AlertEvent[]>;
  createRule(rule: Omit<AlertRule, "id" | "createdAt">): Promise<AlertRule>;
  updateRule(id: string, patch: Partial<AlertRule>): Promise<AlertRule>;
  deleteRule(id: string): Promise<void>;
}

// ── Screener params ─────────────────────────────────────────────────────────

export interface ScreenerParams {
  chain?:       Chain;
  mcapMax?:     number;
  mcapMin?:     number;
  liquidityMin?: number;
  ageMaxDays?:  number;
  volumeMin?:   number;
  riskTiers?:   RiskTier[];
  sortBy?:      "score" | "volume24h" | "mcap" | "age" | "priceChange24h" | "liquidity";
  sortDir?:     "asc" | "desc";
  limit?:       number;
  offset?:      number;
  search?:      string;
}

// ── Config map ──────────────────────────────────────────────────────────────

export interface DataSourceConfig {
  market:      DataMode;
  token:       DataMode;
  onchain:     DataMode;
  security:    DataMode;
  ai:          DataMode;
  smartMoney:  DataMode;
  alerts:      DataMode;
}

/** Current Phase 0 config — everything on sample */
export const DATA_SOURCE_CONFIG: DataSourceConfig = {
  market:     "sample",
  token:      "sample",
  onchain:    "sample",
  security:   "sample",
  ai:         "sample",
  smartMoney: "sample",
  alerts:     "sample",
};
