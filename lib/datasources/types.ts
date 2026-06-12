export type SourceMode = "sample" | "live";

export type SourceStatus = {
  mode: SourceMode;
  label: string;
  generatedAt: string;
};

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";
export type Chain = "solana" | "base" | "ethereum";

export type TokenIdentity = {
  id: string;
  symbol: string;
  name: string;
  chain: Chain;
  address: string;
  ageHours: number;
};

export type TokenMarket = {
  price: number;
  deltas: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  volume24h: number;
  liquidity: number;
  marketCap: number;
  buys24h: number;
  sells24h: number;
};

export type ConvictionSegment = {
  key: string;
  label: string;
  value: number;
  weight: number;
  color: "signal" | "profit" | "warn" | "danger";
  reasoning: string;
};

export type TokenScore = {
  conviction: number;
  riskTier: RiskTier;
  segments: ConvictionSegment[];
  summary: string;
};

export type Token = TokenIdentity & TokenMarket & TokenScore;

export type MarketPulse = {
  globalMarketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreed: number;
  updatedAt: string;
};

export type Narrative = {
  id: string;
  name: string;
  rank: number;
  flow24h: number;
  flow7d: number;
  conviction: number;
  leaders: string[];
};

export type NewLaunch = {
  id: string;
  symbol: string;
  name: string;
  chain: Chain;
  ageMinutes: number;
  liquidity: number;
  volume1h: number;
  riskTier: RiskTier;
  riskReason: string;
};

export type HeatmapTile = {
  id: string;
  symbol: string;
  marketCap: number;
  change24h: number;
};

export type AlertTickerItem = {
  id: string;
  severity: "info" | "warn" | "danger" | "profit";
  message: string;
  timestamp: string;
};

export type DashboardSnapshot = {
  source: SourceStatus;
  pulse: MarketPulse;
  narratives: Narrative[];
  opportunities: Token[];
  newLaunches: NewLaunch[];
  heatmap: HeatmapTile[];
  alerts: AlertTickerItem[];
};

export type ScoreComponent = {
  label: string;
  value: string;
  score: number;
  weight: number;
  explanation: string;
};

export interface MarketDataSource {
  getDashboardSnapshot(): Promise<DashboardSnapshot>;
  getTopTokens(limit?: number): Promise<{ source: SourceStatus; tokens: Token[] }>;
  getToken(tokenId: string): Promise<{ source: SourceStatus; token: Token | null }>;
}

export interface OnChainSource {
  getHolderSummary(tokenId: string): Promise<{
    source: SourceStatus;
    holders: number;
    topTenConcentration: number;
    creatorWalletStatus: "clean" | "watch" | "flagged";
  }>;
}

export interface SecuritySource {
  getRiskFlags(tokenId: string): Promise<{
    source: SourceStatus;
    tier: RiskTier;
    flags: Array<{
      severity: RiskTier;
      title: string;
      explanation: string;
    }>;
  }>;
}

export interface AISource {
  generateResearchBrief(tokenId: string): Promise<{
    source: SourceStatus;
    sections: Array<{
      title: string;
      body: string;
    }>;
  }>;
}

export type DatasourceRegistry = {
  market: MarketDataSource;
  onchain: OnChainSource;
  security: SecuritySource;
  ai: AISource;
};
