import type { AISource, ResearchBrief, Scenario } from "../types";
import { formatCompact } from "@/lib/format";
import { getUniverse, rng, simulateLatency } from "./generator";

export class SampleAISource implements AISource {
  async getResearchBrief(
    tokenId: string,
    opts?: { regenerate?: boolean }
  ): Promise<ResearchBrief> {
    // Regeneration feels like a real model call
    await simulateLatency(opts?.regenerate ? 1400 : 300, opts?.regenerate ? 2600 : 700);
    const token = getUniverse().find((t) => t.id === tokenId);
    const r = rng(`brief-${tokenId}${opts?.regenerate ? `-${Date.now() >> 13}` : ""}`);

    const sym = token?.symbol ?? "TOKEN";
    const mcap = formatCompact(token?.marketCap ?? 1_000_000);
    const vol = formatCompact(token?.volume24h ?? 250_000);
    const liq = formatCompact(token?.liquidityUsd ?? 80_000);
    const holders = (token?.holderCount ?? 1200).toLocaleString();
    const chg = (token?.change24h ?? 0).toFixed(1);
    const conviction = token?.conviction.total.toFixed(0) ?? "50";
    const tier = token?.riskTier ?? "Moderate";
    const up = (token?.change24h ?? 0) > 0;

    return {
      tokenId,
      generatedAt: Date.now(),
      executiveSummary: `${sym} currently scores ${conviction}/100 on the composite conviction model with a ${tier} risk tier. The 24h move of ${chg}% comes on $${vol} of volume against $${liq} of pool liquidity — ${
        up
          ? "participation is broad enough that the move is not obviously a single-wallet artifact"
          : "selling pressure has been orderly rather than cascade-like"
      }. The holder base stands at ${holders}. This brief cites only the data provided to the model; nothing below is a prediction.`,
      whatTheDataShows: [
        `Market cap is $${mcap} with a volume/mcap turnover ratio that ranks ${
          r() > 0.5 ? "above" : "near"
        } the median of its narrative peers.`,
        `Buy/sell transaction split over 24h: ${token?.txns24h.buys.toLocaleString() ?? "—"} buys vs ${token?.txns24h.sells.toLocaleString() ?? "—"} sells.`,
        `Liquidity depth of $${liq} implies a trade of ~$${formatCompact((token?.liquidityUsd ?? 0) * 0.01)} moves price ≈1%.`,
        `Conviction components: ${token?.conviction.components.map((c) => `${c.label} ${c.score.toFixed(0)}`).join(", ") ?? "—"}.`,
      ],
      bullCase: [
        up
          ? `Momentum component (${token?.conviction.components[0].score.toFixed(0)}/100) reflects sustained higher highs on the intraday structure.`
          : `A reclaim of the 24h VWAP region with volume holding above $${vol} would flip the momentum component positive.`,
        `Holder count ${
          r() > 0.4 ? "grew" : "held steady"
        } over the window — distribution is ${tier === "Low" ? "improving" : "not yet deteriorating"}.`,
        `Narrative flows into the ${token?.narrative.toUpperCase() ?? ""} category have been net-positive this week, providing a tailwind independent of token-specific catalysts.`,
      ],
      bearCase: [
        `Liquidity at $${liq} is ${
          (token?.liquidityUsd ?? 0) / Math.max(1, token?.marketCap ?? 1) < 0.05 ? "thin" : "adequate but not deep"
        } relative to market cap — exits at size will slip.`,
        tier === "High" || tier === "Avoid"
          ? `Risk tier ${tier}: the forensics panel lists active flags that cap the composite score regardless of momentum.`
          : `A reversal in the buy/sell ratio below 0.9 sustained for several hours would historically precede drawdowns in this cap tier.`,
        `${sym} remains correlated to its narrative basket; a category-wide outflow would dominate token-specific signals.`,
      ],
      keyRisks: [
        tier !== "Low"
          ? "Security flags present — read the forensics panel before sizing any position."
          : "No critical security flags at last check, but contract state can change; re-verify before acting.",
        "Sample-data brief: this text is generated from the simulated dataset and demonstrates the live format only.",
        "Small-cap tokens can lose most of their liquidity in minutes; size accordingly.",
      ],
      whatWouldChangeThePicture: [
        `Volume sustaining ${up ? "above" : "below"} the 7-day average for 48h would re-rate the volume component.`,
        "A change in mint/freeze authority status or LP lock would immediately re-tier risk.",
        "Top-10 concentration moving more than 5 points in either direction.",
      ],
    };
  }

  async getScenarios(tokenId: string): Promise<Scenario[]> {
    await simulateLatency(250, 600);
    const token = getUniverse().find((t) => t.id === tokenId);
    const vol = formatCompact((token?.volume24h ?? 100_000) * 1.2);
    const liq = formatCompact(token?.liquidityUsd ?? 50_000);
    const holders = formatCompact((token?.holderCount ?? 1000) * 1.15);

    return [
      {
        kind: "bull",
        title: "Bull — participation broadens",
        conditions: [
          `24h volume sustains above $${vol} for 3+ consecutive days`,
          `Holder count grows past ${holders} without top-10 concentration rising`,
          `Buy/sell transaction ratio holds above 1.1`,
          `Liquidity grows alongside price (no divergence)`,
        ],
        summary:
          "Broadening participation with deepening liquidity is the structure that historically supports continuation. Watch for holder growth confirming the price action.",
      },
      {
        kind: "base",
        title: "Base — consolidation",
        conditions: [
          `Volume mean-reverts toward the 7-day average`,
          `Price holds the range established over the last 24–48h`,
          `Buy/sell ratio oscillates between 0.9 and 1.1`,
          `No change to risk flags or authority status`,
        ],
        summary:
          "The most common path: the token digests its recent move. Score components will drift toward neutral; no action is signaled either way.",
      },
      {
        kind: "bear",
        title: "Bear — liquidity-led unwind",
        conditions: [
          `Pool liquidity drops below $${liq} (watch the rug early-warning alert)`,
          `Buy/sell ratio sustained below 0.85`,
          `Top-10 wallets distribute more than 3% of supply`,
          `Holder count flattens or declines over 48h`,
        ],
        summary:
          "Liquidity leaving before price breaks is the classic small-cap failure mode. If these conditions appear together, the risk component will cap the composite score hard.",
      },
    ];
  }
}
