import type { AIBrief, AISource, Scenario } from "@/lib/datasources/types";
import { buildContext } from "@/lib/datasources/sample/context";
import { getUniverse } from "@/lib/datasources/sample/rng";
import { fmtUsd } from "@/lib/utils";

function latency<T>(value: T, min = 600, max = 1300): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const sampleAISource: AISource = {
  async getBrief(address: string): Promise<AIBrief> {
    const u = getUniverse().find((t) => t.address === address);
    if (!u) return latency({ generatedAt: Date.now(), model: "sample", sections: [] });
    const ctx = buildContext(u);
    const sections = [
      {
        title: "Executive Summary",
        body: `${ctx.name} (${ctx.symbol}) is a ${ctx.narrative}-narrative token on ${ctx.chain} with a composite conviction of ${ctx.conviction}/100 and a ${ctx.riskTier} risk tier. The thesis rests on ${ctx.topDriver.toLowerCase()} as the strongest driver, while ${ctx.weakDriver.toLowerCase()} is the primary drag. This brief reasons only from observable on-chain and market data — it contains no price targets.`,
      },
      {
        title: "What the Data Shows",
        body: `Volume is running ${ctx.volumeAccel.toFixed(2)}× the 7-day average on ${fmtUsd(ctx.volume24h)} of 24h turnover against ${fmtUsd(ctx.liquidityUsd)} of liquidity (${ctx.liqToMcap.toFixed(1)}% of market cap). Buy/sell flow is ${ctx.buySellRatio.toFixed(2)} with ${ctx.holders.toLocaleString()} holders growing ${ctx.holderGrowth.toFixed(1)}% in 24h. Top-10 wallets control ${ctx.top10Pct.toFixed(0)}% of supply.`,
      },
      {
        title: "Bull Case",
        body: `If volume holds above ${fmtUsd(ctx.volume24h * 0.8)} and holder growth stays positive, the structure supports continuation. ${ctx.lpLockedPct >= 50 ? `${ctx.lpLockedPct.toFixed(0)}% LP locked reduces rug risk and` : "Watch LP closely, but"} the ${ctx.liqToMcap.toFixed(1)}% liquidity ratio is ${ctx.liqToMcap > 8 ? "healthy" : "thin"} for the size. Sustained buy-side dominance would be the confirming signal.`,
      },
      {
        title: "Bear Case",
        body: `Concentration is the key fragility: top-10 at ${ctx.top10Pct.toFixed(0)}% means a single exit can break the chart. ${ctx.mintAuthorityActive ? "Mint authority remains active, so dilution is possible at any time. " : ""}${ctx.liqToMcap < 6 ? "The thin liquidity ratio amplifies slippage on the way out. " : ""}A drop in volume acceleration below 1.0× would invalidate the momentum read.`,
      },
      {
        title: "Key Risks",
        body: ctx.riskFlags.length
          ? ctx.riskFlags.map((f) => `• ${f}`).join("\n")
          : "• No critical forensic flags triggered at this snapshot.",
      },
      {
        title: "What Would Change the Picture",
        body: `Upgrade triggers: mint authority renounced, top-10 concentration falling below 30%, and volume acceleration sustaining above 1.5×. Downgrade triggers: liquidity dropping >30% in 1h, buy/sell ratio falling below 0.8, or holder count contracting. Speculative: narrative rotation into ${ctx.narrative} could re-rate the whole cohort (unverified).`,
      },
    ];
    return latency({ generatedAt: Date.now(), model: "sample-brief-v0 (claude-sonnet-4-6 in Phase 2)", sections });
  },

  async getScenarios(address: string): Promise<Scenario[]> {
    const u = getUniverse().find((t) => t.address === address);
    if (!u) return latency([]);
    const ctx = buildContext(u);
    return latency([
      {
        kind: "Bull",
        thesis: "Momentum and distribution improve together.",
        conditions: [
          `Volume sustains above ${fmtUsd(ctx.volume24h * 1.2)} for 48h`,
          "Buy/sell ratio holds above 1.3",
          "Holder count grows >10% with no single wallet >5% accumulation",
          ctx.mintAuthorityActive ? "Mint authority is renounced" : "LP lock extended or burned",
        ],
      },
      {
        kind: "Base",
        thesis: "Range-bound consolidation on current structure.",
        conditions: [
          `Volume oscillates near ${fmtUsd(ctx.volume24h)}`,
          "Buy/sell ratio between 0.9 and 1.2",
          "Liquidity stable within ±15%",
          "No new forensic flags triggered",
        ],
      },
      {
        kind: "Bear",
        thesis: "Distribution and liquidity deteriorate.",
        conditions: [
          "Liquidity drops >30% within 1h",
          "Top-10 concentration rises as a large wallet sells",
          "Buy/sell ratio falls below 0.8 for 24h",
          "Volume acceleration falls below 1.0×",
        ],
      },
    ]);
  },
};
