import { DataMode } from "@/lib/datasources/types";

export const sourceModeMap = {
  market: "sample",
  onChain: "sample",
  security: "sample",
  ai: "sample",
} as const satisfies Record<string, DataMode>;

export type DataSourceKey = keyof typeof sourceModeMap;

export function getSourceMode(source: DataSourceKey): DataMode {
  return sourceModeMap[source];
}

export function modeToBadgeLabel(mode: DataMode): string {
  return mode === "live" ? "LIVE" : "SAMPLE DATA";
}
