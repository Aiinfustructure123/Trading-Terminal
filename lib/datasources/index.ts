import { SampleAISource } from "./sample/ai";
import { SampleMarketDataSource } from "./sample/market";
import { SampleOnChainSource } from "./sample/onchain";
import { SampleSecuritySource } from "./sample/security";
import { DataSources } from "./types";

export const dataSources: DataSources = {
  market: new SampleMarketDataSource(),
  onChain: new SampleOnChainSource(),
  security: new SampleSecuritySource(),
  ai: new SampleAISource(),
};
