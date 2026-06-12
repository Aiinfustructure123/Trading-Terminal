import type { SourceMode } from "@/lib/datasources/types";

export type DataSourceKey = "market" | "onChain" | "security" | "ai";

export const datasourceModes: Record<DataSourceKey, SourceMode> = {
  market: "sample",
  onChain: "sample",
  security: "sample",
  ai: "sample",
};

export function getSourceLabel(source: DataSourceKey) {
  return datasourceModes[source] === "live" ? `${source}:live` : `${source}:sample`;
}
