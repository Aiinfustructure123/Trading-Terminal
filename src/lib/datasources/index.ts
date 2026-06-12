/**
 * Datasource resolver — the only place the rest of the app imports sources
 * from. Resolution follows `DATASOURCE_CONFIG`; when a live implementation
 * lands in `live/<source>.ts`, registering it here flips the entire app
 * (data AND badges) to live for that source.
 */

import { DATASOURCE_CONFIG } from "./config";
import {
  AISource,
  MarketDataSource,
  OnChainSource,
  SecuritySource,
  SmartMoneySource,
  TrendsSource,
} from "./types";
import { sampleAISource } from "./sample/ai";
import { sampleMarketSource } from "./sample/market";
import { sampleOnChainSource } from "./sample/onchain";
import { sampleSecuritySource } from "./sample/security";
import { sampleSmartMoneySource } from "./sample/smartmoney";
import { sampleTrendsSource } from "./sample/trends";

// Phase 1+: import live implementations and register them below.
const registry = {
  market: {
    sample: sampleMarketSource,
    live: null as MarketDataSource | null,
  },
  trends: {
    sample: sampleTrendsSource,
    live: null as TrendsSource | null,
  },
  onchain: {
    sample: sampleOnChainSource,
    live: null as OnChainSource | null,
  },
  security: {
    sample: sampleSecuritySource,
    live: null as SecuritySource | null,
  },
  ai: {
    sample: sampleAISource,
    live: null as AISource | null,
  },
  smartMoney: {
    sample: sampleSmartMoneySource,
    live: null as SmartMoneySource | null,
  },
};

function resolve<K extends keyof typeof registry>(
  key: K,
): (typeof registry)[K]["sample"] {
  const entry = registry[key];
  if (DATASOURCE_CONFIG[key] === "live" && entry.live) {
    return entry.live as (typeof registry)[K]["sample"];
  }
  return entry.sample;
}

export const marketSource: MarketDataSource = resolve("market");
export const trendsSource: TrendsSource = resolve("trends");
export const onChainSource: OnChainSource = resolve("onchain");
export const securitySource: SecuritySource = resolve("security");
export const aiSource: AISource = resolve("ai");
export const smartMoneySource: SmartMoneySource = resolve("smartMoney");
