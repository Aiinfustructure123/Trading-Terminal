import { datasourceModes } from "@/lib/datasources/config";
import type { DataSources } from "@/lib/datasources/types";
import { SampleAISource } from "@/lib/datasources/sample/ai";
import { SampleMarketDataSource } from "@/lib/datasources/sample/market";
import { SampleOnChainSource } from "@/lib/datasources/sample/onchain";
import { SampleSecuritySource } from "@/lib/datasources/sample/security";

function assertSampleOnly(source: keyof DataSources) {
  if (datasourceModes[source] !== "sample") {
    throw new Error(`Live datasource for "${source}" is not implemented in Phase 0.`);
  }
}

assertSampleOnly("market");
assertSampleOnly("onChain");
assertSampleOnly("security");
assertSampleOnly("ai");

export const dataSources: DataSources = {
  market: new SampleMarketDataSource(),
  onChain: new SampleOnChainSource(),
  security: new SampleSecuritySource(),
  ai: new SampleAISource(),
};
