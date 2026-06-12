import { AIResearchBrief, AISource } from "@/lib/datasources/types";
import { withSampleLatency } from "./utils";

export class SampleAISource implements AISource {
  async getResearchBrief(tokenId: string): Promise<AIResearchBrief> {
    return withSampleLatency(
      () => ({
        tokenId,
        generatedAt: new Date().toISOString(),
        model: "sample-brief-v1",
        disclaimer: "Analytical tooling, not financial advice.",
        sections: {
          executiveSummary:
            "Momentum and liquidity are improving, but concentration risk keeps conviction below top-tier candidates.",
          whatDataShows:
            "Recent sessions show sustained buy-side flow and steady liquidity depth. Holder growth remains positive with moderate wallet concentration.",
          bullCase:
            "If volume remains above its weekly baseline and liquidity expands with stable spread, the token can continue ranking higher within the discovery cohort.",
          bearCase:
            "If buy/sell ratio weakens while concentrated wallets distribute into lower depth, momentum score likely compresses quickly.",
          keyRisks:
            "Active contract privileges, short liquidity lock profile, and above-average top-wallet concentration.",
          whatChangesPicture:
            "Revoked authorities, longer lock horizon, and broader holder distribution would reduce structural risk tier.",
        },
      }),
      320,
      460,
    );
  }
}
