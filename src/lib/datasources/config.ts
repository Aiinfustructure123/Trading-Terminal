/**
 * Single switchboard controlling sample vs live per source.
 *
 * Flipping a key to "live" makes `lib/datasources/index.ts` resolve the
 * `live/<source>` implementation AND flips every panel badge fed by that
 * source from SAMPLE to LIVE — there is no separate badge wiring.
 *
 * Phase 0: everything is sample. Phase 1 flips market → trends → security →
 * onchain as each live integration lands. `smartMoney` stays sample until a
 * labeled-wallet data source is contracted — never silently faked.
 */

export type SourceMode = "sample" | "live";

export type SourceKey =
  | "market"
  | "trends"
  | "onchain"
  | "security"
  | "ai"
  | "smartMoney";

export const DATASOURCE_CONFIG: Record<SourceKey, SourceMode> = {
  market: "sample",
  trends: "sample",
  onchain: "sample",
  security: "sample",
  ai: "sample",
  smartMoney: "sample",
};

export function sourceMode(key: SourceKey): SourceMode {
  return DATASOURCE_CONFIG[key];
}

export function isLive(key: SourceKey): boolean {
  return DATASOURCE_CONFIG[key] === "live";
}
