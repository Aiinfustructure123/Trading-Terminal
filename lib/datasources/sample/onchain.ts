import { HolderSnapshot, OnChainSource } from "@/lib/datasources/types";
import { withSampleLatency } from "./utils";

export class SampleOnChainSource implements OnChainSource {
  async getHoldersSnapshot(tokenId: string): Promise<HolderSnapshot> {
    return withSampleLatency(
      () => ({
        tokenId,
        holders: 2840 + tokenId.length * 120 + Math.floor(Math.random() * 120),
        top10Concentration: 29 + Math.random() * 13,
        creatorStatus: "inactive",
      }),
      180,
      320,
    );
  }
}
