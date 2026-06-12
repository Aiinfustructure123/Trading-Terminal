import { formatUsdCompact, formatAge } from "@/lib/format";
import { AISource, ResearchBrief, ScenarioCase } from "../types";
import { getEngine, simulateLatency } from "./engine";

/**
 * Templated "AI" output assembled from the token's actual generated metrics —
 * the same structured-context-in, grounded-prose-out shape the live Claude
 * integration will produce in Phase 2. Never includes price predictions.
 */

function pct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export const sampleAISource: AISource = {
  async getResearchBrief(tokenId, opts): Promise<ResearchBrief> {
    await simulateLatency(opts?.regenerate ? 1200 : 300, opts?.regenerate ? 2600 : 700);
    const engine = getEngine();
    const t = engine.getTokenById(tokenId);
    if (!t) throw new Error(`Unknown token: ${tokenId}`);
    const risk = engine.getRiskReport(tokenId);
    const buyRatio = (t.buys24h / Math.max(1, t.buys24h + t.sells24h)) * 100;
    const turnover = (t.volume24hUsd / Math.max(1, t.marketCapUsd)) * 100;
    const momentum = t.score.components.find((c) => c.key === "momentum");
    const severeFlags = risk?.flags.filter((f) => f.severity === "severe") ?? [];

    return {
      tokenId,
      generatedAt: new Date().toISOString(),
      model: "sample-template (Phase 2: claude-sonnet-4-6)",
      executiveSummary:
        `${t.name} ($${t.symbol}) is a ${formatAge(t.createdAt)}-old ${t.narrative} token on ${t.chain} ` +
        `with a ${formatUsdCompact(t.marketCapUsd)} market cap and composite conviction of ${t.score.composite.toFixed(0)}/100. ` +
        `Momentum scores ${momentum?.subScore.toFixed(0)}/100 on ${pct(t.change24h)} 24h price action with ${buyRatio.toFixed(0)}% buy-side flow. ` +
        `Forensic tier is ${t.riskTier}${severeFlags.length > 0 ? `, driven by: ${severeFlags.map((f) => f.title.toLowerCase()).join("; ")}` : ""}. ` +
        `Everything below cites the data provided — no facts are introduced from outside it.`,
      whatTheDataShows: [
        `Price is ${pct(t.change24h)} over 24h (${pct(t.change1h)} 1h, ${pct(t.change6h)} 6h), so the move is ${Math.sign(t.change1h) === Math.sign(t.change24h) ? "directionally consistent across timeframes" : "diverging between short and long timeframes"}.`,
        `24h volume of ${formatUsdCompact(t.volume24hUsd)} equals ${turnover.toFixed(0)}% of market cap and runs ${t.volumeAccel.toFixed(1)}× the 7-day average — ${t.volumeAccel > 1.3 ? "participation is accelerating" : t.volumeAccel < 0.7 ? "participation is fading" : "participation is steady"}.`,
        `Order flow over 24h: ${t.buys24h.toLocaleString("en-US")} buys vs ${t.sells24h.toLocaleString("en-US")} sells (${buyRatio.toFixed(0)}% buys).`,
        `Liquidity of ${formatUsdCompact(t.liquidityUsd)} is ${((t.liquidityUsd / t.marketCapUsd) * 100).toFixed(1)}% of market cap; holder count is ${t.holders.toLocaleString("en-US")} (${pct(t.holderChange24h)} 24h).`,
      ],
      bullCase: [
        t.volumeAccel > 1.2
          ? `Volume acceleration (${t.volumeAccel.toFixed(1)}× weekly base) with ${buyRatio.toFixed(0)}% buy share is the pattern that precedes durable discovery moves — if it sustains.`
          : `A reversal in volume trend (currently ${t.volumeAccel.toFixed(1)}× weekly base) would be the first observable sign of renewed interest.`,
        `${t.narrative} as a category is ${t.change24h >= 0 ? "catching flow" : "out of favor"}; a category-level rotation lifts correlated names regardless of token-specific news.`,
        t.holderChange24h > 0
          ? `Holder base grew ${pct(t.holderChange24h)} in 24h — distribution is widening rather than churning.`
          : `Holder count is flat-to-down; the bull case needs new wallets, not just recycled volume.`,
      ],
      bearCase: [
        severeFlags.length > 0
          ? `Forensics: ${severeFlags[0].title}. ${severeFlags[0].detail}`
          : `No severe forensic flags, but ${t.riskTier === "Low" ? "market risk remains: thin-cap tokens routinely retrace 50%+ on flow reversal" : "the " + t.riskTier + " tier reflects structural concerns listed in the risk panel"}.`,
        `At ${formatUsdCompact(t.liquidityUsd)} pooled, an exit of even ${formatUsdCompact(t.liquidityUsd * 0.05)} moves the price materially — exits get expensive in a downturn.`,
        buyRatio < 50
          ? `Flow is already sell-dominant (${(100 - buyRatio).toFixed(0)}% sells) — momentum readings can decay quickly from here.`
          : `Current buy-side dominance (${buyRatio.toFixed(0)}%) is itself a risk: it tends to mean late entrants are providing exit liquidity if flow flips.`,
      ],
      keyRisks: (risk?.flags ?? []).slice(0, 4).map((f) => `${f.title}: ${f.detail}`),
      whatWouldChangeThePicture: [
        `Volume falling below ${formatUsdCompact(t.volume24hUsd * 0.5)}/24h (half the current run-rate) would invalidate the participation thesis.`,
        `Liquidity dropping more than 30% from ${formatUsdCompact(t.liquidityUsd)} within an hour is the canonical rug early-warning — alert rule available.`,
        `Holder count rolling over while price holds flat would indicate distribution into strength.`,
        t.riskTier !== "Low"
          ? `Resolution of the triggered forensic flags (e.g. authority revocation, LP lock extension) would justify re-scoring the risk component upward.`
          : `Any new forensic flag (authority change, LP unlock) would immediately cap the composite score.`,
      ],
    };
  },

  async getScenarios(tokenId): Promise<ScenarioCase[]> {
    await simulateLatency(200, 500);
    const t = getEngine().getTokenById(tokenId);
    if (!t) throw new Error(`Unknown token: ${tokenId}`);
    const vol = formatUsdCompact(t.volume24hUsd);
    const volUp = formatUsdCompact(t.volume24hUsd * 1.5);
    const volDown = formatUsdCompact(t.volume24hUsd * 0.4);
    const liqFloor = formatUsdCompact(t.liquidityUsd * 0.7);
    return [
      {
        kind: "bull",
        title: "Continuation",
        conditions: [
          `24h volume sustains above ${volUp} (1.5× current ${vol})`,
          `Buy share holds above 55% across rolling 6h windows`,
          `Holder count keeps compounding (currently ${t.holders.toLocaleString("en-US")}, ${t.holderChange24h >= 0 ? "+" : ""}${t.holderChange24h.toFixed(1)}%/24h)`,
        ],
        reading:
          "Under these observable conditions the token would rank in the top decile of its category screen — historically where discovery flows concentrate. This describes conditions, not a prediction.",
      },
      {
        kind: "base",
        title: "Consolidation",
        conditions: [
          `Volume oscillates around the current ${vol}/24h run-rate`,
          `Liquidity stays above ${liqFloor}`,
          `No new forensic flags; risk tier holds at ${t.riskTier}`,
        ],
        reading:
          "Range-bound flow with stable structure. Watch the volume-acceleration component of the conviction score for the first sign this regime is ending.",
      },
      {
        kind: "bear",
        title: "Distribution",
        conditions: [
          `24h volume decays below ${volDown}`,
          `Liquidity drops more than 30% in any 1h window (alert rule available)`,
          `Sell share exceeds 60% while price makes lower highs on the 1h chart`,
        ],
        reading:
          "This combination has preceded the majority of severe drawdowns in thin-cap tokens. Predefine your invalidation — exits get costly once depth thins.",
      },
    ];
  },
};
