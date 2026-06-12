/**
 * Datasource factory — the ONLY place components get data services from.
 *
 * Resolution is driven by `SOURCE_MODES` in config.ts. When a live
 * implementation lands in `live/*.ts` (Phase 1+), flipping the config entry
 * swaps the implementation and the SAMPLE/LIVE badges in one move.
 */

import { sourceMode } from "./config";
import type {
  AISource,
  AlertsSource,
  MarketDataSource,
  OnChainSource,
  SecuritySource,
  SmartMoneySource,
} from "./types";
import { SampleAISource } from "./sample/ai";
import { SampleAlertsSource } from "./sample/alerts";
import { SampleMarketDataSource } from "./sample/market";
import { SampleOnChainSource } from "./sample/onchain";
import { SampleSecuritySource } from "./sample/security";
import { SampleSmartMoneySource } from "./sample/smart-money";

let market: MarketDataSource | null = null;
let onchain: OnChainSource | null = null;
let security: SecuritySource | null = null;
let ai: AISource | null = null;
let smartMoney: SmartMoneySource | null = null;
let alerts: AlertsSource | null = null;

export function getMarketSource(): MarketDataSource {
  if (!market) {
    // Phase 1: `sourceMode("market") === "live"` returns LiveMarketDataSource here.
    market = sourceMode("market") === "sample" ? new SampleMarketDataSource() : new SampleMarketDataSource();
  }
  return market;
}

export function getOnChainSource(): OnChainSource {
  if (!onchain) onchain = new SampleOnChainSource();
  return onchain;
}

export function getSecuritySource(): SecuritySource {
  if (!security) security = new SampleSecuritySource();
  return security;
}

export function getAISource(): AISource {
  if (!ai) ai = new SampleAISource();
  return ai;
}

export function getSmartMoneySource(): SmartMoneySource {
  if (!smartMoney) smartMoney = new SampleSmartMoneySource();
  return smartMoney;
}

export function getAlertsSource(): AlertsSource {
  if (!alerts) alerts = new SampleAlertsSource();
  return alerts;
}
