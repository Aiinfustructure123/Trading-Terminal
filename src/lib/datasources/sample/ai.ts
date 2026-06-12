import type { AISource, AIBrief, SourceMeta } from "../types";
import { SAMPLE_TOKENS } from "./tokens";

const NOW = new Date().toISOString();
const META: SourceMeta = { mode: "sample", lastUpdated: NOW, provider: "alpha-terminal-sample" };

export const sampleAISource: AISource = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBrief(address: string, _chain?: string): Promise<AIBrief> {
    await new Promise(r => setTimeout(r, 200));
    const token = SAMPLE_TOKENS.find(t => t.address === address) ?? SAMPLE_TOKENS[0];
    const score = token.score;

    return {
      address,
      executiveSummary: `${token.name} (${token.symbol}) is a ${token.chain} token with a Conviction Score of ${score.composite.toFixed(0)}/100 and a ${score.riskTier} risk tier. The composite score reflects ${score.components[0].subScore > 60 ? "strong" : "moderate"} momentum, ${score.components[1].subScore > 60 ? "adequate" : "thin"} liquidity, and ${score.riskFlags.filter(f => f.triggered && (f.severity === "critical" || f.severity === "high")).length} high-severity risk flags currently active.`,

      whatDataShows: `On-chain data shows ${token.holderCount.toLocaleString()} unique holders with top-10 wallets controlling ${token.topHolderConcentration.toFixed(1)}% of supply. 24-hour volume of $${(token.volume24h / 1e6).toFixed(2)}M against $${(token.liquidity / 1e6).toFixed(2)}M liquidity represents a volume/liquidity ratio of ${(token.volume24h / token.liquidity).toFixed(2)}×. The buy/sell distribution (${token.txns24h.buys.toLocaleString()} buys vs ${token.txns24h.sells.toLocaleString()} sells) ${token.txns24h.buys > token.txns24h.sells ? "favors buyers" : "favors sellers"}.`,

      bullCase: `If momentum sustains and no new risk flags emerge, the improving holder distribution could attract further retail participation. Volume acceleration beyond the 7-day average would validate the current momentum sub-score of ${score.components[0].subScore.toFixed(0)}.`,

      bearCase: `The ${score.riskTier === "High" || score.riskTier === "Avoid" ? "elevated" : "moderate"} risk tier reflects structural concerns. Thin liquidity relative to market cap creates asymmetric downside — a coordinated exit by top holders could have outsized price impact.`,

      keyRisks: [
        ...score.riskFlags.filter(f => f.triggered).map(f => `${f.label}: ${f.description}`),
        `Liquidity depth of $${(token.liquidity / 1e3).toFixed(0)}k limits safe position sizing.`,
        "Token is ${token.age < 7 ? `only ${token.age.toFixed(0)} days old — limited on-chain history` : `${token.age.toFixed(0)} days old — some track record available`}.".replace(/\$\{[^}]+\}/g, token.age < 7 ? `only ${token.age.toFixed(0)} days old — limited on-chain history` : `${token.age.toFixed(0)} days old — some track record available`),
      ].filter(Boolean).slice(0, 5),

      whatWouldChange: `A sustained improvement in the buy/sell ratio above 1.5× for 48h, combined with liquidity growth past $${(token.liquidity * 1.5 / 1e3).toFixed(0)}k and no new mint or freeze authority activity, would warrant reassessing the current ${score.riskTier} risk tier upward. Conversely, any top-10 wallet movement to exchanges or a liquidity drawdown above 30% in a single hour would trigger immediate score revision.`,

      generatedAt: NOW,
      model: "alpha-terminal-sample-v0",
      source: META,
    };
  },
};
