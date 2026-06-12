import { sourceStatus } from "@/lib/datasources/config";
import { sleep } from "@/lib/utils";
import type { SecuritySource } from "@/lib/datasources/types";

export const sampleSecuritySource: SecuritySource = {
  async getRiskFlags(tokenId: string) {
    await sleep(280);
    const isElevated = tokenId.length % 2 === 0;

    return {
      source: sourceStatus("security"),
      tier: isElevated ? "Moderate" : "Low",
      flags: [
        {
          severity: isElevated ? "Moderate" : "Low",
          title: isElevated ? "Creator wallet is newly funded" : "Creator wallet history observed",
          explanation: isElevated
            ? "Sample forensics mark the deployer as recent, requiring additional monitoring before escalation."
            : "Sample forensics show prior wallet activity and no immediate creator-wallet anomaly."
        },
        {
          severity: "Low",
          title: "No honeypot behavior in sample simulation",
          explanation: "Buy and sell paths are both represented in the generated transaction mix."
        }
      ]
    };
  }
};
