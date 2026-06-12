import { SOURCE_MODE } from "@/lib/datasources/config";
import type { AISource, MarketDataSource, OnChainSource, SecuritySource, SourceKey } from "@/lib/datasources/types";
import { sampleMarketSource } from "@/lib/datasources/sample/market";
import { sampleOnChainSource } from "@/lib/datasources/sample/onchain";
import { sampleSecuritySource } from "@/lib/datasources/sample/security";
import { sampleAISource } from "@/lib/datasources/sample/ai";

/* ============================================================
   SOURCE REGISTRY
   Components import these resolved sources (never the concrete
   implementations). When a live/* module exists and config flips
   to "live", swap the assignment below — nothing else changes.
   ============================================================ */

// Phase 0: only sample implementations exist. Live modules will be added
// under live/* and wired here once SOURCE_MODE flips and env keys are set.
export const market: MarketDataSource = sampleMarketSource;
export const onchain: OnChainSource = sampleOnChainSource;
export const security: SecuritySource = sampleSecuritySource;
export const ai: AISource = sampleAISource;
void SOURCE_MODE;

export function modeFor(key: SourceKey) {
  return SOURCE_MODE[key];
}
