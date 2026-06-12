import { SmartMoneySource, WalletEvent, WalletProfile } from "../types";
import { getEngine, simulateLatency } from "./engine";

/**
 * Honest placeholder: labeled smart-money wallet data requires a paid
 * provider. This source stays in sample mode until one is contracted —
 * the screen carries a permanent "SAMPLE — requires premium data" notice.
 */
export const sampleSmartMoneySource: SmartMoneySource = {
  async listWallets(): Promise<WalletProfile[]> {
    await simulateLatency(200, 500);
    return getEngine()
      .getWallets()
      .sort((a, b) => b.realizedPnlUsd - a.realizedPnlUsd);
  },

  async getRecentActivity(limit = 30): Promise<WalletEvent[]> {
    await simulateLatency(150, 400);
    return getEngine().getWalletEvents().slice(0, limit);
  },
};
