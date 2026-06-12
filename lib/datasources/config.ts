import type { SourceMode } from "@/lib/datasources/types";

export const datasourceModes: Record<"market" | "onchain" | "security" | "ai", SourceMode> = {
  market: "sample",
  onchain: "sample",
  security: "sample",
  ai: "sample"
};

export function sourceStatus(source: keyof typeof datasourceModes) {
  const mode = datasourceModes[source];

  return {
    mode,
    label: mode === "live" ? "LIVE" : "SAMPLE DATA",
    generatedAt: new Date().toISOString()
  };
}
