/**
 * Data source registry.
 *
 * The active implementation per source is controlled by environment variables.
 * Components import from here — never directly from sample/* or live/*.
 *
 * Badge display (SAMPLE / LIVE / DEGRADED) is driven by the source.mode field
 * returned by each implementation — no manual badge management needed.
 */

import type {
  MarketDataSource, TokenDataSource, OnChainSource,
  SecuritySource, AISource, SmartMoneySource, AlertsSource,
  DataSourceConfig,
} from "./types";

// ── Sample implementations (always available) ─────────────────────────────────
import { sampleMarketSource }    from "./sample/market";
import { sampleTokenSource }     from "./sample/tokens";
import { sampleOnChainSource }   from "./sample/onchain";
import { sampleSecuritySource }  from "./sample/security";
import { sampleAISource }        from "./sample/ai";
import { sampleSmartMoneySource} from "./sample/smartmoney";
import { sampleAlertsSource }    from "./sample/alerts";

// ── Live implementations (used when env vars are present) ─────────────────────
import { liveMarketSource }   from "./live/market";
import { liveTokenSource }    from "./live/dexscreener";
import { liveOnChainSource }  from "./live/onchain";
import { liveSecuritySource } from "./live/security";

// ── Environment-driven config ─────────────────────────────────────────────────
// In Phase 0: everything is "sample".
// As keys are added, sources go live automatically.
// NEXT_PUBLIC_ vars are available client-side; server-only vars only in API routes.

const hasCoingecko   = !!process.env.NEXT_PUBLIC_COINGECKO_LIVE  || !!process.env.COINGECKO_API_KEY;
const hasHelius      = !!process.env.HELIUS_API_KEY;
const hasAnthropic   = !!process.env.ANTHROPIC_API_KEY;

// DexScreener + GoPlus + RugCheck are free — go live immediately (no key required)
const TOKEN_LIVE     = true;
const SECURITY_LIVE  = true;
const MARKET_LIVE    = hasCoingecko;
const ONCHAIN_LIVE   = hasHelius;
const AI_LIVE        = hasAnthropic;

export const DATA_SOURCE_CONFIG: DataSourceConfig = {
  market:     MARKET_LIVE   ? "live" : "sample",
  token:      TOKEN_LIVE    ? "live" : "sample",
  onchain:    ONCHAIN_LIVE  ? "live" : "sample",
  security:   SECURITY_LIVE ? "live" : "sample",
  ai:         AI_LIVE       ? "live" : "sample",
  smartMoney: "sample",  // Phase 4 — requires premium labeled-wallet data
  alerts:     "sample",  // Phase 3
};

// ── Active sources ─────────────────────────────────────────────────────────────

export const marketSource:     MarketDataSource  = MARKET_LIVE   ? liveMarketSource   : sampleMarketSource;
export const tokenSource:      TokenDataSource   = TOKEN_LIVE    ? liveTokenSource    : sampleTokenSource;
export const onChainSource:    OnChainSource     = ONCHAIN_LIVE  ? liveOnChainSource  : sampleOnChainSource;
export const securitySource:   SecuritySource    = SECURITY_LIVE ? liveSecuritySource : sampleSecuritySource;
export const aiSource:         AISource          = sampleAISource;     // Phase 2
export const smartMoneySource: SmartMoneySource  = sampleSmartMoneySource;
export const alertsSource:     AlertsSource      = sampleAlertsSource;

export type {
  MarketDataSource, TokenDataSource, OnChainSource,
  SecuritySource, AISource, SmartMoneySource, AlertsSource,
};
