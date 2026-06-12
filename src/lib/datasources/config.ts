import { DataMode } from "@/lib/datasources/types";

export type DataSourceKey = "market" | "onChain" | "security" | "ai";

export const sourceModeMap: Record<DataSourceKey, DataMode> = {
  market: "sample",
  onChain: "sample",
  security: "sample",
  ai: "sample",
};

export function getSourceMode(source: DataSourceKey): DataMode {
  return sourceModeMap[source];
}

export function modeToBadgeLabel(mode: DataMode): string {
  return mode === "live" ? "LIVE" : "SAMPLE DATA";
}
