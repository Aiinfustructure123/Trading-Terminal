import { sourceStatus } from "@/lib/datasources/config";
import { sleep } from "@/lib/utils";
import type { OnChainSource } from "@/lib/datasources/types";

export const sampleOnChainSource: OnChainSource = {
  async getHolderSummary(tokenId: string) {
    await sleep(240);
    const base = tokenId.length * 137;

    return {
      source: sourceStatus("onchain"),
      holders: 820 + base,
      topTenConcentration: Math.min(58, 18 + tokenId.length * 2.7),
      creatorWalletStatus: tokenId.length % 3 === 0 ? "watch" : "clean"
    };
  }
};
