export type SourceMode = "sample" | "live";

export type Chain = "solana" | "ethereum" | "base";

export type RiskTier = "Low" | "Moderate" | "High" | "Avoid";

export type ScoreComponentKey =
  | "momentum"
  | "liquidity"
  | "holders"
  | "riskInverse"
  | "smartMoney"
  | "narrative";

export type SourceState = {
  mode: SourceMode;
  label: string;
  updatedAt: string;
  degraded?: boolean;
  message?: string;
};

export type ScoreComponent = {
  key: ScoreComponentKey;
  label: string;
  value: number;
  score: number;
  weight: number;
  tone: "signal" | "profit" | "warn" | "danger" | "neutral";
  inputs: Array<{
    label: string;
    value: string;
  }>;
  reasoning: string;
};

export type CompositeScore = {
  value: number;
  components: ScoreComponent[];
  explanation: string;
};

export type Token = {
  id: string;
  chain: Chain;
  symbol: string;
  name: string;
  address: string;
  priceUsd: number;
  deltas: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
    d7: number;
  };
  volume24h: number;
  liquidityUsd: number;
  marketCapUsd: number;
  ageHours: number;
  buys24h: number;
  sells24h: number;
  riskTier: RiskTier;
  conviction: CompositeScore;
  narrative: string;
  source: SourceState;
};

export type MarketPulse = {
  globalMarketCapUsd: number;
  volume24hUsd: number;
  btcDominance: number;
  fearGreed: number;
  source: SourceState;
};

export type NarrativeTrend = {
  id: string;
  label: string;
  rank: number;
  flow24hUsd: number;
  flow7dUsd: number;
  momentum: number;
  source: SourceState;
};

export type LaunchEvent = {
  id: string;
  token: Token;
  launchedAt: string;
  liquiditySeedUsd: number;
  riskFlags: string[];
  source: SourceState;
};

export type AlertEvent = {
  id: string;
  label: string;
  severity: "info" | "warn" | "danger" | "profit";
  timestamp: string;
  source: SourceState;
};

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type RiskFlag = {
  id: string;
  severity: "info" | "warn" | "danger";
  label: string;
  explanation: string;
};

export type HolderSnapshot = {
  holders: number;
  top10Concentration: number;
  creatorWalletStatus: "renounced" | "active" | "unknown";
  source: SourceState;
};

export type ResearchBrief = {
  tokenId: string;
  generatedAt: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  source: SourceState;
};

export type Scenario = {
  name: "Bull" | "Base" | "Bear";
  conditions: string[];
  invalidation: string;
};

export interface MarketDataSource {
  getMarketPulse(): Promise<MarketPulse>;
  getTrendingNarratives(): Promise<NarrativeTrend[]>;
  getTokens(count?: number): Promise<Token[]>;
  getToken(id: string): Promise<Token | null>;
  getNewLaunches(): Promise<LaunchEvent[]>;
  getMovers(): Promise<Token[]>;
  getCandles(tokenId: string, interval: "15m" | "1h" | "4h" | "1d"): Promise<Candle[]>;
  getAlertsTicker(): Promise<AlertEvent[]>;
}

export interface OnChainSource {
  getHolderSnapshot(tokenId: string): Promise<HolderSnapshot>;
}

export interface SecuritySource {
  getRiskFlags(tokenId: string): Promise<{
    tier: RiskTier;
    flags: RiskFlag[];
    source: SourceState;
  }>;
}

export interface AISource {
  getResearchBrief(tokenId: string): Promise<ResearchBrief>;
  getScenarios(tokenId: string): Promise<Scenario[]>;
}

export type DataSources = {
  market: MarketDataSource;
  onChain: OnChainSource;
  security: SecuritySource;
  ai: AISource;
};
