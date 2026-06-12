import type { RiskFlag, RiskTier, SecuritySource } from "@/lib/datasources/types";
import { datasourceModes } from "@/lib/datasources/config";
import { delay, makeToken } from "@/lib/datasources/sample/generator";

const flagCatalog: Record<RiskTier, RiskFlag[]> = {
  Low: [
    {
      id: "low-liquidity-watch",
      severity: "info",
      label: "Liquidity monitored",
      explanation: "Liquidity is adequate for the sampled peer group and remains under observation.",
    },
  ],
  Moderate: [
    {
      id: "partial-lp-lock",
      severity: "warn",
      label: "LP lock partial",
      explanation: "A partial liquidity lock requires continued monitoring before risk can improve.",
    },
    {
      id: "creator-active",
      severity: "warn",
      label: "Creator wallet active",
      explanation: "The creator wallet has recent activity in the sample event stream.",
    },
  ],
  High: [
    {
      id: "concentration",
      severity: "danger",
      label: "Top-wallet concentration",
      explanation: "Top wallets exceed the concentration threshold used by the sample risk model.",
    },
    {
      id: "thin-liquidity",
      severity: "warn",
      label: "Thin liquidity",
      explanation: "Available liquidity is low relative to the sampled market cap.",
    },
  ],
  Avoid: [
    {
      id: "mint-authority",
      severity: "danger",
      label: "Mint authority active",
      explanation: "Active mint authority is treated as an automatic severe risk in the sample rules.",
    },
    {
      id: "freeze-authority",
      severity: "danger",
      label: "Freeze authority active",
      explanation: "Active freeze authority can restrict transfers and raises the sample risk tier.",
    },
  ],
};

export class SampleSecuritySource implements SecuritySource {
  async getRiskFlags(tokenId: string): Promise<{
    tier: RiskTier;
    flags: RiskFlag[];
    source: { mode: "sample" | "live"; label: string; updatedAt: string };
  }> {
    await delay(180, 460);
    const index = Number(tokenId.replace("token-", "")) || 0;
    const tier = makeToken(index).riskTier;
    return {
      tier,
      flags: flagCatalog[tier],
      source: {
        mode: datasourceModes.security,
        label: "sample.security.flags",
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
