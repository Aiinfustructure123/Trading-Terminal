import type { HolderSnapshot, OnChainSource } from "@/lib/datasources/types";
import { datasourceModes } from "@/lib/datasources/config";
import { delay } from "@/lib/datasources/sample/generator";

export class SampleOnChainSource implements OnChainSource {
  async getHolderSnapshot(tokenId: string): Promise<HolderSnapshot> {
    await delay(160, 420);
    const index = Number(tokenId.replace("token-", "")) || 0;
    const holders = 1_200 + index * 83 + Math.round(Math.sin(Date.now() / 90_000 + index) * 80);
    return {
      holders,
      top10Concentration: Math.max(8, 34 - (index % 18) * 0.8),
      creatorWalletStatus: index % 5 === 0 ? "active" : index % 7 === 0 ? "unknown" : "renounced",
      source: {
        mode: datasourceModes.onChain,
        label: "sample.onchain.holders",
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
