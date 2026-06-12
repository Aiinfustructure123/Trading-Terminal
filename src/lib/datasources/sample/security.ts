import type { SecuritySource, ConvictionScore, ScenarioData, SourceMeta } from "../types";
import { SAMPLE_TOKENS } from "./tokens";

const NOW = new Date().toISOString();
const META: SourceMeta = { mode: "sample", lastUpdated: NOW, provider: "alpha-terminal-sample" };

export const sampleSecuritySource: SecuritySource = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConvictionScore(address: string, _chain?: string): Promise<ConvictionScore> {
    await new Promise(r => setTimeout(r, 100));
    const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    return token.score;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getScenarios(address: string, _chain?: string): Promise<ScenarioData> {
    await new Promise(r => setTimeout(r, 80));
    const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    const score = token.score.composite;

    return {
      address,
      scenarios: [
        {
          label: "Bull",
          conditions: [
            `Volume sustains above $${(token.volume24h * 1.5 / 1e6).toFixed(1)}M for 48h`,
            "Buy/sell ratio remains above 1.4× for two consecutive 4h candles",
            "No new risk flags triggered by security audit",
            `Holder count grows past ${(token.holderCount * 1.3).toFixed(0)}`,
          ],
          implications: `Continued accumulation at current levels with improving on-chain metrics would support the current score of ${score.toFixed(0)}. New narrative catalysts could accelerate momentum.`,
        },
        {
          label: "Base",
          conditions: [
            "Volume trades within ±20% of current 24h average",
            "Price structure holds higher lows on the 1h chart",
            "Holder count grows at current pace",
          ],
          implications: "Stable conditions suggest the current risk tier remains appropriate. Monitor volume and liquidity depth weekly.",
        },
        {
          label: "Bear",
          conditions: [
            `Liquidity drops below $${(token.liquidity * 0.6 / 1e3).toFixed(0)}k`,
            "Sell pressure exceeds buys by 2:1 for 6+ hours",
            "Top wallet (>10% supply) initiates transfers to exchange",
          ],
          implications: "Deteriorating liquidity combined with whale movement would warrant reassessment. Risk tier could worsen.",
        },
      ],
      disclaimer: "Scenarios describe observable market conditions only — not price predictions or financial advice. All analysis is for informational purposes.",
      source: META,
    };
  },
};
