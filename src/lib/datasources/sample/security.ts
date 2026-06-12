import type { Forensics, SecuritySource } from "@/lib/datasources/types";
import { computeRisk } from "@/lib/scoring/risk";
import { getUniverse } from "@/lib/datasources/sample/rng";

function latency<T>(value: T, min = 220, max = 600): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const sampleSecuritySource: SecuritySource = {
  async getForensics(address: string): Promise<Forensics> {
    const u = getUniverse().find((t) => t.address === address);
    if (!u) return latency({ tier: "Avoid", flags: [] });
    return latency(
      computeRisk({
        mintAuthorityActive: u.mintAuthorityActive,
        freezeAuthorityActive: u.freezeAuthorityActive,
        lpLockedPct: u.lpLockedPct,
        top10Pct: u.top10Pct,
        buyTaxPct: u.buyTaxPct,
        sellTaxPct: u.sellTaxPct,
        isHoneypot: u.isHoneypot,
        liquidityUsd: u.liquidityUsd,
        ageHours: u.ageHours,
        creatorHoldingPct: u.creatorHoldingPct,
      }),
    );
  },
};
