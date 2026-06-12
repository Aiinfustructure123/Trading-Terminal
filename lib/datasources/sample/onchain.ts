import type { CreatorWalletStatus, HoldersInfo, OnChainSource } from "../types";
import { getUniverse, rng, simulateLatency } from "./generator";

export class SampleOnChainSource implements OnChainSource {
  async getHolders(tokenId: string): Promise<HoldersInfo> {
    await simulateLatency(150, 450);
    const token = getUniverse().find((t) => t.id === tokenId);
    const r = rng(`holders-${tokenId}`);
    const count = token?.holderCount ?? Math.round(500 + r() * 20_000);

    const tierConcentration: Record<string, [number, number]> = {
      Low: [12, 28],
      Moderate: [22, 42],
      High: [35, 62],
      Avoid: [50, 85],
    };
    const [lo, hi] = tierConcentration[token?.riskTier ?? "Moderate"];
    const top10 = lo + r() * (hi - lo);

    const statuses: CreatorWalletStatus[] = ["holding", "sold-partial", "sold-all", "unknown"];
    const creatorStatus = statuses[Math.floor(r() * statuses.length)];

    const top10Share = top10;
    const next40 = Math.min(90 - top10Share, 18 + r() * 22);
    const rest = Math.max(0, 100 - top10Share - next40);

    return {
      tokenId,
      count,
      countChange24h: Math.round((r() - 0.35) * count * 0.06),
      top10ConcentrationPct: top10,
      creatorStatus,
      creatorHoldingPct:
        creatorStatus === "holding" ? 2 + r() * 8 : creatorStatus === "sold-partial" ? 0.5 + r() * 2 : 0,
      distribution: [
        { label: "Top 10 wallets", pct: top10Share },
        { label: "Wallets 11–50", pct: next40 },
        { label: "Everyone else", pct: rest },
      ],
      updatedAt: Date.now(),
    };
  }
}
