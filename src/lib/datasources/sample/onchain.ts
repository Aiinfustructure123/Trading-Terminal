import type { OnChainSource, HolderData, SourceMeta } from "../types";
import { SAMPLE_TOKENS } from "./tokens";

const NOW = new Date().toISOString();
const META: SourceMeta = { mode: "sample", lastUpdated: NOW, provider: "alpha-terminal-sample" };

export const sampleOnChainSource: OnChainSource = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getHolders(address: string, _chain?: string): Promise<HolderData> {
    await new Promise(r => setTimeout(r, 120));
    const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    const seed = address.charCodeAt(0) * 999;
    const total = token.holderCount;

    const topHolders = Array.from({ length: 10 }, (_, i) => {
      const pct = Math.max(1, 20 - i * 1.8 + ((seed + i * 137) % 5));
      return {
        rank: i + 1,
        address: `${address.slice(0, 8)}...${(i + 1).toString().padStart(4, "0")}`,
        label: i === 0 ? "Creator Wallet" : i < 3 ? `Whale ${i}` : undefined,
        pct: +pct.toFixed(2),
        value: token.marketCap * pct / 100,
        isCreator: i === 0,
      };
    });

    return {
      address,
      holderCount: total,
      topHolders,
      creatorWalletStatus: token.creatorSold ? "sold" : "holding",
      source: META,
    };
  },
};
