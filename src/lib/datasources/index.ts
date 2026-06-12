/**
 * Data source registry — swap sample → live per source via DATA_SOURCE_CONFIG.
 * Components import from here, never directly from sample/* or live/*.
 */

import { DATA_SOURCE_CONFIG } from "./types";
import type {
  MarketDataSource, TokenDataSource, OnChainSource,
  SecuritySource, AISource, SmartMoneySource, AlertsSource,
} from "./types";

import { sampleMarketSource }    from "./sample/market";
import { sampleTokenSource }     from "./sample/tokens";
import { sampleOnChainSource }   from "./sample/onchain";
import { sampleSecuritySource }  from "./sample/security";
import { sampleAISource }        from "./sample/ai";
import { sampleSmartMoneySource} from "./sample/smartmoney";
import { sampleAlertsSource }    from "./sample/alerts";

export const marketSource:    MarketDataSource  = sampleMarketSource;
export const tokenSource:     TokenDataSource   = sampleTokenSource;
export const onChainSource:   OnChainSource     = sampleOnChainSource;
export const securitySource:  SecuritySource    = sampleSecuritySource;
export const aiSource:        AISource          = sampleAISource;
export const smartMoneySource:SmartMoneySource  = sampleSmartMoneySource;
export const alertsSource:    AlertsSource      = sampleAlertsSource;

export { DATA_SOURCE_CONFIG };
export type { MarketDataSource, TokenDataSource, OnChainSource, SecuritySource, AISource, SmartMoneySource, AlertsSource };
