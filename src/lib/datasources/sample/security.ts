import { SecuritySource, TokenForensics } from "@/lib/datasources/types";
import { SAMPLE_TOKENS, withLatency } from "@/lib/datasources/sample/shared";

export const sampleSecuritySource: SecuritySource = {
  async getTokenForensics(tokenAddress) {
    const token = SAMPLE_TOKENS.find((item) => item.address === tokenAddress) ?? SAMPLE_TOKENS[0];

    const flags: TokenForensics["flags"] = [
      {
        id: "authority",
        severity: token.riskTier === "avoid" ? "avoid" : token.riskTier,
        title: "Contract authority profile",
        explanation:
          token.riskTier === "low"
            ? "Authority settings appear stable with no dangerous toggles in sample data."
            : "Authority mutability and concentration are elevated in this sample profile.",
      },
      {
        id: "liquidity-lock",
        severity: token.riskTier === "high" || token.riskTier === "avoid" ? "high" : "moderate",
        title: "Liquidity lock coverage",
        explanation: "Locked liquidity duration is below preferred threshold for the current mcap bucket.",
      },
      {
        id: "holder-concentration",
        severity: token.riskTier === "low" ? "moderate" : token.riskTier,
        title: "Top holder concentration",
        explanation: "Top wallets control a notable share of supply; monitor coordinated exits.",
      },
    ];

    return withLatency({
      tokenAddress,
      compositeTier: token.riskTier,
      flags,
    });
  },
};
