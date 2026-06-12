import type { SmartMoneySource, SmartMoneyData, SourceMeta } from "../types";
import { SAMPLE_TOKENS } from "./tokens";

const NOW = new Date().toISOString();
const META: SourceMeta = { mode: "sample", lastUpdated: NOW, provider: "alpha-terminal-sample" };

const LABELS = [
  "Lookonchain-tracked Whale",
  "DeFi Degen Alpha",
  "NFT-to-DeFi Rotator",
  "Meme Season Sniper",
  "VC Unlock Hedger",
  "Narrative Surfer",
  "High-Freq Scalper",
  "Accumulation Thesis",
];

export const sampleSmartMoneySource: SmartMoneySource = {
  async getSmartWallets(): Promise<SmartMoneyData> {
    await new Promise(r => setTimeout(r, 150));
    const wallets = LABELS.map((label, i) => {
      const seed = i * 137 + 42;
      const winRate = 0.45 + (seed % 40) / 100;
      const realizedPnl = (seed % 10) * 150e3 - 200e3;
      const trades30d = 10 + (seed % 80);
      const recentTrades = SAMPLE_TOKENS.slice(i * 3, i * 3 + 4).map((t, j) => ({
        type: (j % 3 === 0 ? "sell" : "buy") as "buy" | "sell",
        symbol: t.symbol,
        address: t.address,
        usdValue: 5000 + (i + j) * 8000,
        at: new Date(Date.now() - (j + 1) * 3600e3 * (i + 1)).toISOString(),
      }));
      return {
        address: `W${i.toString().padStart(43, "0")}`,
        label,
        winRate,
        realizedPnl,
        trades30d,
        recentTrades,
      };
    });
    return { wallets, source: META };
  },
};
