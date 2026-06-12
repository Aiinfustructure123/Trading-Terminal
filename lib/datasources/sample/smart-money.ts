import type { SmartMoneySource, TrackedWallet, WalletEvent } from "../types";
import { getUniverse, rng, simulateLatency } from "./generator";

const WALLET_LABELS = [
  "Ansem-adjacent",
  "DeFi OG #4",
  "Pump Sniper A",
  "CT Whale 7",
  "Quiet Accumulator",
  "Narrative Frontrunner",
  "Sol Season Vet",
  "The Patient One",
  "Rotation Bot 12",
  "Anon Insider B",
  "Gem Hunter 3",
  "Exit Liquidity Provider",
];

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function walletAddress(r: () => number): string {
  let s = "";
  for (let i = 0; i < 44; i++) s += BASE58[Math.floor(r() * BASE58.length)];
  return s;
}

export class SampleSmartMoneySource implements SmartMoneySource {
  async getTrackedWallets(): Promise<TrackedWallet[]> {
    await simulateLatency(200, 500);
    return WALLET_LABELS.map((label, i) => {
      const r = rng(`wallet-${i}`);
      return {
        address: walletAddress(r),
        label,
        winRatePct: 38 + r() * 42,
        realizedPnlUsd: (r() - 0.18) * 2_400_000,
        trades30d: Math.round(8 + r() * 140),
        avgHoldHours: Math.round(2 + r() * 240),
      };
    }).sort((a, b) => b.realizedPnlUsd - a.realizedPnlUsd);
  }

  async getRecentActivity(limit = 20): Promise<WalletEvent[]> {
    await simulateLatency(180, 450);
    const universe = getUniverse();
    const events: WalletEvent[] = [];
    const seedBlock = Math.floor(Date.now() / 60_000); // refreshes every minute
    for (let i = 0; i < limit; i++) {
      const r = rng(`event-${seedBlock}-${i}`);
      const wi = Math.floor(r() * WALLET_LABELS.length);
      const wr = rng(`wallet-${wi}`);
      const token = universe[Math.floor(r() * universe.length)];
      events.push({
        id: `evt-${seedBlock}-${i}`,
        walletAddress: walletAddress(wr),
        walletLabel: WALLET_LABELS[wi],
        kind: r() > 0.45 ? "entry" : "exit",
        tokenId: token.id,
        tokenSymbol: token.symbol,
        amountUsd: 1_500 + r() * 180_000,
        at: Date.now() - Math.floor(r() * 3600_000 * 6),
      });
    }
    return events.sort((a, b) => b.at - a.at);
  }
}
