import { RiskReport, SecuritySource } from "../types";
import { getEngine, simulateLatency } from "./engine";

const TIER_SUMMARY: Record<string, string> = {
  Low: "Structural forensics are clean. Remaining risk is market risk — volatility, narrative decay, liquidity migration.",
  Moderate:
    "One or more structural concerns triggered. Position sizing should assume exits may be slower or costlier than expected.",
  High: "Serious structural flags are active. Treat as trade-only with strict invalidation, or skip entirely.",
  Avoid:
    "Forensics indicate holders may be unable to exit, or dilution is unbounded. This profile matches common rug/honeypot patterns.",
};

export const sampleSecuritySource: SecuritySource = {
  async getRiskReport(tokenId: string): Promise<RiskReport> {
    await simulateLatency(180, 500);
    const report = getEngine().getRiskReport(tokenId);
    if (!report) throw new Error(`Unknown token: ${tokenId}`);
    return {
      tokenId,
      tier: report.tier,
      flags: report.flags,
      summary: TIER_SUMMARY[report.tier],
    };
  },
};
