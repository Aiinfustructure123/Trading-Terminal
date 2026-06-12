import { OnChainSource, TrackedWallet } from "@/lib/datasources/types";
import { SAMPLE_TOKENS, clamp, jitter, withLatency } from "@/lib/datasources/sample/shared";

const SAMPLE_WALLETS: TrackedWallet[] = [
  {
    label: "Argo 7",
    address: "9VArgo77777777777777777777777777777777777777",
    winRatePct: 71.2,
    realizedPnlUsd: 482_000,
    recentActions: ["Entered NOVA", "Trimmed MIRA", "Exited DUST"],
  },
  {
    label: "Blue Finch",
    address: "8BlueFinch88888888888888888888888888888888888",
    winRatePct: 64.9,
    realizedPnlUsd: 309_200,
    recentActions: ["Accumulated RIFT", "Added AURA"],
  },
  {
    label: "Delta Node",
    address: "7DeltaNode999999999999999999999999999999999999",
    winRatePct: 59.7,
    realizedPnlUsd: 191_700,
    recentActions: ["Opened AXIS", "Closed WISP"],
  },
];

export const sampleOnChainSource: OnChainSource = {
  async getHolderSnapshot(tokenAddress) {
    const token = SAMPLE_TOKENS.find((item) => item.address === tokenAddress) ?? SAMPLE_TOKENS[0];
    const holders = Math.round(clamp(jitter(token.marketCapUsd / 1_350, 0.06, 6), 340, 90_000));
    const top10Concentration = clamp(jitter(28 + token.ageHours / 40, 0.16, 8), 10, 93);

    return withLatency({
      tokenAddress,
      holders,
      top10ConcentrationPct: Number(top10Concentration.toFixed(2)),
      creatorWalletActive: token.riskTier !== "low",
    });
  },

  async getTrackedWallets(limit = 12) {
    return withLatency(SAMPLE_WALLETS.slice(0, limit));
  },
};
