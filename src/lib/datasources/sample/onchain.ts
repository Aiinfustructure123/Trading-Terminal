import type { HoldersInfo, OnChainSource, SmartWallet, SmartWalletAction } from "@/lib/datasources/types";
import { getUniverse, mulberry32, range, hashStr } from "@/lib/datasources/sample/rng";

function latency<T>(value: T, min = 200, max = 560): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const sampleOnChainSource: OnChainSource = {
  async getHolders(address: string): Promise<HoldersInfo> {
    const u = getUniverse().find((t) => t.address === address);
    if (!u) {
      return latency({ count: 0, top10Pct: 0, creatorPct: 0, creatorStatus: "Unknown", distribution: [], growth24hPct: 0 });
    }
    const top10 = u.top10Pct;
    const creator = u.creatorHoldingPct;
    const distribution = [
      { label: "Top 1", pct: Math.min(top10, top10 * 0.42) },
      { label: "Top 2–10", pct: top10 * 0.58 },
      { label: "Top 11–50", pct: range(mulberry32(u.seed + 5), 12, 28) },
      { label: "Top 51–250", pct: range(mulberry32(u.seed + 6), 10, 22) },
      { label: "Rest", pct: 0 },
    ];
    const sum = distribution.reduce((s, d) => s + d.pct, 0);
    distribution[4].pct = Math.max(0, 100 - sum);
    return latency({
      count: u.holders,
      top10Pct: top10,
      creatorPct: creator,
      creatorStatus:
        creator > 15 ? "High insider overhang" : creator > 5 ? "Holds moderate stake" : creator < 0.5 ? "Sold / minimal" : "Low stake",
      distribution,
      growth24hPct: u.holderGrowth * 100,
    });
  },

  async getSmartMoney(): Promise<SmartWallet[]> {
    // SAMPLE — labeled smart-money data requires a contracted premium source.
    const uni = getUniverse();
    const labels = [
      "Ansem-adjacent", "Frank Whale", "MEV Sniper 0x", "Cobie Cluster", "Solana OG",
      "Tetranode-adj", "Smart LP", "Early Bonk Buyer", "Jump-adjacent", "GCR Cluster",
      "Mochi Whale", "Pumpfun Vet",
    ];
    const out: SmartWallet[] = labels.map((label, i) => {
      const r = mulberry32(hashStr(label) ^ 0x55);
      const actions: SmartWalletAction[] = [];
      for (let k = 0; k < 5; k++) {
        const tok = uni[Math.floor(r() * uni.length)];
        actions.push({
          action: r() < 0.6 ? "BUY" : "SELL",
          symbol: tok.symbol,
          amountUsd: Math.round(range(r, 2000, 240000)),
          time: Date.now() - Math.floor(r() * 86400000 * 3),
        });
      }
      return {
        address: uni[(i * 37) % uni.length].address,
        label,
        winRate: Math.round(range(r, 48, 86)),
        realizedPnlUsd: Math.round(range(r, -120000, 4_200_000)),
        trades30d: Math.round(range(r, 8, 220)),
        recentActions: actions.sort((a, b) => b.time - a.time),
      };
    });
    return latency(out.sort((a, b) => b.realizedPnlUsd - a.realizedPnlUsd));
  },
};
