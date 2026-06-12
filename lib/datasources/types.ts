export type SourceMode = "sample" | "live";

export type SourceKey = "market" | "onChain" | "security" | "ai";

export type RiskTier = "low" | "moderate" | "high" | "avoid";

export type SourceStatus = {
  key: SourceKey;
  mode: SourceMode;
  label: string;
};

export type MarketPulse = {
  globalMarketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreed: number;
  updatedAt: string;
};

export type NarrativeFlow = {
  id: string;
  name: "AI" | "Meme" | "RWA" | "DePIN" | "Gaming";
  flow24h: number;
  flow7d: number;
  tokenCount: number;
};

export type ScoreComponent =
  | "momentum"
  | "liquidity"
  | "holders"
  | "riskInverse"
  | "volumeTrend";

export type ConvictionBreakdown = {
  component: ScoreComponent;
  score: number;
  weight: number;
  reasoning: string;
};

export type RankedToken = {
  id: string;
  symbol: string;
  name: string;
  chain: "solana" | "base" | "ethereum";
  price: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  marketCapUsd: number;
  ageHours: number;
  riskTier: RiskTier;
  conviction: number;
  breakdown: ConvictionBreakdown[];
};

export type NewLaunch = {
  id: string;
  symbol: string;
  pair: string;
  launchedAt: string;
  marketCapUsd: number;
  liquidityUsd: number;
  buys1h: number;
  sells1h: number;
  riskTier: RiskTier;
};

export type MoverHeatmapItem = {
  id: string;
  symbol: string;
  marketCapUsd: number;
  change24h: number;
};

export type AlertTickerItem = {
  id: string;
  level: "signal" | "warn" | "danger";
  message: string;
  timestamp: string;
};

export type HolderSnapshot = {
  tokenId: string;
  holders: number;
  top10Concentration: number;
  creatorStatus: "active" | "inactive" | "unknown";
};

export type SecurityForensics = {
  tokenId: string;
  tier: RiskTier;
  flags: Array<{
    id: string;
    severity: "info" | "warn" | "critical";
    title: string;
    description: string;
  }>;
};

export type AIResearchBrief = {
  tokenId: string;
  generatedAt: string;
  sections: {
    executiveSummary: string;
    whatDataShows: string;
    bullCase: string;
    bearCase: string;
    keyRisks: string;
    whatChangesPicture: string;
  };
  model: string;
  disclaimer: string;
};

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getTrendingNarratives(): Promise<NarrativeFlow[]>;
  getConvictionOpportunities(): Promise<RankedToken[]>;
  getNewLaunches(): Promise<NewLaunch[]>;
  getMoversHeatmap(): Promise<MoverHeatmapItem[]>;
  getAlertsTicker(): Promise<AlertTickerItem[]>;
}

export interface OnChainSource {
  getHoldersSnapshot(tokenId: string): Promise<HolderSnapshot>;
}

export interface SecuritySource {
  getForensics(tokenId: string): Promise<SecurityForensics>;
}

export interface AISource {
  getResearchBrief(tokenId: string): Promise<AIResearchBrief>;
}

export type DataSources = {
  market: MarketDataSource;
  onChain: OnChainSource;
  security: SecuritySource;
  ai: AISource;
};
