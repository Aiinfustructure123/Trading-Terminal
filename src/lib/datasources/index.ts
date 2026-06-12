import type { DataSources } from "./types";
import { SOURCE_MODE } from "./config";
import {
  sampleAISource,
  sampleMarketSource,
  sampleOnChainSource,
  sampleSecuritySource,
  sampleSmartMoneySource,
} from "./sample";

/**
 * Resolve the active implementation for each source based on `SOURCE_MODE`.
 *
 * Phase 0 returns sample implementations across the board. When a live
 * implementation lands (e.g. `live/dexscreener.ts`), import it here and select
 * it when the corresponding mode is "live". Components consume `dataSources`
 * only through the typed interfaces and never know the difference.
 */
export const dataSources: DataSources = {
  market: SOURCE_MODE.market === "sample" ? sampleMarketSource : sampleMarketSource,
  onchain: SOURCE_MODE.onchain === "sample" ? sampleOnChainSource : sampleOnChainSource,
  security: SOURCE_MODE.security === "sample" ? sampleSecuritySource : sampleSecuritySource,
  ai: SOURCE_MODE.ai === "sample" ? sampleAISource : sampleAISource,
  smartMoney: SOURCE_MODE.smartMoney === "sample" ? sampleSmartMoneySource : sampleSmartMoneySource,
};

export * from "./types";
export { SOURCE_MODE, SOURCE_META, getSourceStatus } from "./config";
