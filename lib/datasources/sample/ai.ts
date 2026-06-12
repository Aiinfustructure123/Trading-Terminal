import type { AISource, ResearchBrief, Scenario } from "@/lib/datasources/types";
import { datasourceModes } from "@/lib/datasources/config";
import { delay, makeToken } from "@/lib/datasources/sample/generator";

export class SampleAISource implements AISource {
  async getResearchBrief(tokenId: string): Promise<ResearchBrief> {
    await delay(420, 900);
    const token = makeToken(Number(tokenId.replace("token-", "")) || 0);
    return {
      tokenId,
      generatedAt: new Date().toISOString(),
      source: {
        mode: datasourceModes.ai,
        label: "sample.ai.research",
        updatedAt: new Date().toISOString(),
      },
      sections: [
        {
          heading: "Executive Summary",
          body: `${token.symbol} ranks highly in the sample set because conviction components are aligned across momentum, liquidity, and narrative strength. This is analytical tooling, not financial advice.`,
        },
        {
          heading: "What the Data Shows",
          body: `Sample 24h volume is ${(token.volume24h / 1_000_000).toFixed(2)}M with a ${(
            token.buys24h / Math.max(1, token.sells24h)
          ).toFixed(2)}x buy/sell ratio. Risk tier is ${token.riskTier}.`,
        },
        {
          heading: "Bull Case",
          body: "The constructive scenario requires observable follow-through: sustained volume, improving liquidity, and no new severe risk flags.",
        },
        {
          heading: "Bear Case",
          body: "The risk scenario is defined by liquidity deterioration, concentrated holder exits, or a worsened security tier.",
        },
        {
          heading: "Key Risks",
          body: "Sample risks can include active authorities, partial LP lock, wallet concentration, or thin liquidity. Each must be verified by live sources in later phases.",
        },
        {
          heading: "What Would Change the Picture",
          body: "A live improvement would require stronger holder distribution, deeper liquidity, and a stable or improving security report.",
        },
      ],
    };
  }

  async getScenarios(tokenId: string): Promise<Scenario[]> {
    await delay(240, 620);
    const token = makeToken(Number(tokenId.replace("token-", "")) || 0);
    return [
      {
        name: "Bull",
        conditions: [
          "24h volume remains above the sampled 7d baseline",
          "Liquidity grows while slippage proxy stays low",
          "Risk tier does not worsen on the next security refresh",
        ],
        invalidation: `${token.symbol} loses momentum if liquidity falls while sell pressure accelerates.`,
      },
      {
        name: "Base",
        conditions: [
          "Volume normalizes but remains above peer median",
          "Holder concentration stays within the current band",
          "Narrative rank remains top three in sampled categories",
        ],
        invalidation: "Base case weakens if narrative flow and buy/sell balance both fade.",
      },
      {
        name: "Bear",
        conditions: [
          "Liquidity drops more than 30% over a monitored hour",
          "Risk tier worsens to High or Avoid",
          "Top-wallet concentration rises with clustered exits",
        ],
        invalidation: "Bear case recedes only after liquidity and holder distribution recover.",
      },
    ];
  }
}
