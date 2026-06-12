export type DataMode = "sample" | "live";

export type ChainId = "solana" | "base" | "ethereum";

export type RiskTier = "low" | "moderate" | "high" | "avoid";

export type ScoreComponent = {
  id: string;
  label: string;
  value: number;
  weight: number;
  reasoning: string;
};

export type ConvictionScore = {
  total: number;
  components: ScoreComponent[];
  updatedAt: string;
};

export type MarketPulse = {
  globalMarketCapUsd: number;
  volume24hUsd: number;
  btcDominancePct: number;
  fearGreed: number;
  updatedAt: string;
};

export type NarrativeTrend = {
  id: string;
  name: string;
  flow24hPct: number;
  flow7dPct: number;
  score: number;
};

export type TokenSummary = {
  symbol: string;
  name: string;
  chain: ChainId;
  address: string;
  logoColor: string;
  priceUsd: number;
  change5mPct: number;
  change1hPct: number;
  change6hPct: number;
  change24hPct: number;
  volume24hUsd: number;
  liquidityUsd: number;
  marketCapUsd: number;
  ageHours: number;
  buys24h: number;
  sells24h: number;
  riskTier: RiskTier;
};

export type ConvictionOpportunity = {
  token: TokenSummary;
  conviction: ConvictionScore;
  rationale: string[];
};

export type LaunchFeedItem = {
  id: string;
  token: TokenSummary;
  launchedAt: string;
  redFlags: string[];
};

export type HeatmapCell = {
  id: string;
  symbol: string;
  marketCapUsd: number;
  change24hPct: number;
};

export type AlertTickerItem = {
  id: string;
  severity: "info" | "warn" | "danger";
  message: string;
  timestamp: string;
};

export type HolderSnapshot = {
  tokenAddress: string;
  holders: number;
  top10ConcentrationPct: number;
  creatorWalletActive: boolean;
};

export type TrackedWallet = {
  label: string;
  address: string;
  winRatePct: number;
  realizedPnlUsd: number;
  recentActions: string[];
};

export type ForensicsFlag = {
  id: string;
  severity: RiskTier;
  title: string;
  explanation: string;
};

export type TokenForensics = {
  tokenAddress: string;
  compositeTier: RiskTier;
  flags: ForensicsFlag[];
};

export type ResearchBrief = {
  generatedAt: string;
  executiveSummary: string;
  whatDataShows: string;
  bullCase: string;
  bearCase: string;
  keyRisks: string[];
  whatWouldChange: string;
};

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getTrendingNarratives(): Promise<NarrativeTrend[]>;
  getConvictionOpportunities(limit?: number): Promise<ConvictionOpportunity[]>;
  getNewLaunches(limit?: number): Promise<LaunchFeedItem[]>;
  getMoversHeatmap(limit?: number): Promise<HeatmapCell[]>;
  getAlertsTicker(limit?: number): Promise<AlertTickerItem[]>;
}

export interface OnChainSource {
  getHolderSnapshot(tokenAddress: string): Promise<HolderSnapshot>;
  getTrackedWallets(limit?: number): Promise<TrackedWallet[]>;
}

export interface SecuritySource {
  getTokenForensics(tokenAddress: string): Promise<TokenForensics>;
}

export interface AISource {
  getResearchBrief(tokenAddress: string): Promise<ResearchBrief>;
}

export type DatasourceRegistry = {
  market: MarketDataSource;
  onChain: OnChainSource;
  security: SecuritySource;
  ai: AISource;
};
