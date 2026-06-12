import { RiskTier, SecurityForensics, SecuritySource } from "@/lib/datasources/types";
import { withSampleLatency } from "./utils";

const tierOrder: RiskTier[] = ["low", "moderate", "high", "avoid"];

export class SampleSecuritySource implements SecuritySource {
  async getForensics(tokenId: string): Promise<SecurityForensics> {
    return withSampleLatency(
      () => {
        const tier = tierOrder[tokenId.length % tierOrder.length];

        return {
          tokenId,
          tier,
          flags: [
            {
              id: "authority",
              severity: tier === "high" || tier === "avoid" ? "critical" : "warn",
              title: "Mint authority posture",
              description:
                tier === "low"
                  ? "Mint authority revoked."
                  : "Mint authority remains active; continuous monitoring advised.",
            },
            {
              id: "liquidity",
              severity: tier === "avoid" ? "critical" : "warn",
              title: "Liquidity lock confidence",
              description:
                "Primary LP lock is short-duration on sample data; verify lock extension before entry.",
            },
            {
              id: "distribution",
              severity: "info",
              title: "Holder concentration",
              description:
                "Top wallet concentration is elevated versus mature assets in this segment.",
            },
          ],
        };
      },
      180,
      380,
    );
  }
}
