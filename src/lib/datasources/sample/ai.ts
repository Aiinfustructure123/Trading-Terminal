import { AISource } from "@/lib/datasources/types";
import { SAMPLE_TOKENS, withLatency } from "@/lib/datasources/sample/shared";

export const sampleAISource: AISource = {
  async getResearchBrief(tokenAddress) {
    const token = SAMPLE_TOKENS.find((item) => item.address === tokenAddress) ?? SAMPLE_TOKENS[0];

    return withLatency(
      {
        generatedAt: new Date().toISOString(),
        executiveSummary:
          `${token.symbol} sits in the upper half of sample conviction rankings due to strong liquidity-adjusted momentum, while risk remains ${token.riskTier}.`,
        whatDataShows:
          "Recent sample flows show elevated buy-side activity, stable pool depth, and a positive multi-window structure with periodic drawdowns.",
        bullCase:
          "If volume sustains above the current 24h baseline and liquidity expands in parallel, conviction components can continue compounding.",
        bearCase:
          "If the buy/sell ratio mean-reverts and liquidity concentration worsens, the structure component may roll over and drop total conviction.",
        keyRisks: [
          "Holder concentration changes can invalidate momentum quickly.",
          "Shallow liquidity in lower-cap bands can amplify downside.",
          "Risk tier escalation rules may trigger abruptly on authority changes.",
        ],
        whatWouldChange:
          "A sustained increase in holder breadth combined with lower concentration and stable liquidity locks would improve the risk-adjusted profile.",
      },
      340,
      760,
    );
  },
};
