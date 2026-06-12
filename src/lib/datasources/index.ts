import { sourceModeMap } from "@/lib/datasources/config";
import { sampleAISource } from "@/lib/datasources/sample/ai";
import { sampleMarketDataSource } from "@/lib/datasources/sample/market";
import { sampleOnChainSource } from "@/lib/datasources/sample/on-chain";
import { sampleSecuritySource } from "@/lib/datasources/sample/security";
import { AISource, DatasourceRegistry, MarketDataSource, OnChainSource, SecuritySource } from "@/lib/datasources/types";

function unimplementedSource<T>(name: string): T {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(`Live datasource "${name}" is not implemented yet.`);
      },
    },
  ) as T;
}

const liveMarketSource = unimplementedSource<MarketDataSource>("market");
const liveOnChainSource = unimplementedSource<OnChainSource>("onChain");
const liveSecuritySource = unimplementedSource<SecuritySource>("security");
const liveAiSource = unimplementedSource<AISource>("ai");

export const datasources: DatasourceRegistry = {
  market: sourceModeMap.market === "live" ? liveMarketSource : sampleMarketDataSource,
  onChain: sourceModeMap.onChain === "live" ? liveOnChainSource : sampleOnChainSource,
  security: sourceModeMap.security === "live" ? liveSecuritySource : sampleSecuritySource,
  ai: sourceModeMap.ai === "live" ? liveAiSource : sampleAISource,
};
