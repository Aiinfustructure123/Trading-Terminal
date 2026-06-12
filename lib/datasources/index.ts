import { sampleAISource } from "@/lib/datasources/sample/ai";
import { sampleMarketDataSource } from "@/lib/datasources/sample/market";
import { sampleOnChainSource } from "@/lib/datasources/sample/onchain";
import { sampleSecuritySource } from "@/lib/datasources/sample/security";
import type { DatasourceRegistry } from "@/lib/datasources/types";

export const datasources: DatasourceRegistry = {
  market: sampleMarketDataSource,
  onchain: sampleOnChainSource,
  security: sampleSecuritySource,
  ai: sampleAISource
};
