import { HolderStats, OnChainSource } from "../types";
import { getEngine, simulateLatency } from "./engine";

export const sampleOnChainSource: OnChainSource = {
  async getHolderStats(tokenId: string): Promise<HolderStats> {
    await simulateLatency(150, 450);
    const stats = getEngine().getHolderStats(tokenId);
    if (!stats) throw new Error(`Unknown token: ${tokenId}`);
    return stats;
  },
};
