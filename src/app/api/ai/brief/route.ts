import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { cache, TTL } from "@/lib/cache/memory";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ContextSchema = z.object({
  address:       z.string(),
  symbol:        z.string(),
  name:          z.string(),
  chain:         z.string(),
  price:         z.number(),
  priceChange24h: z.number(),
  priceChange1h:  z.number(),
  volume24h:      z.number(),
  liquidity:      z.number(),
  marketCap:      z.number(),
  age:            z.number(),
  buys24h:        z.number(),
  sells24h:       z.number(),
  holderCount:    z.number().optional(),
  topHolderConcentration: z.number().optional(),
  convictionScore: z.number(),
  riskTier:       z.string(),
  triggeredFlags: z.array(z.object({
    label:       z.string(),
    severity:    z.string(),
    description: z.string(),
  })),
  scoreComponents: z.array(z.object({
    label:    z.string(),
    subScore: z.number(),
    weight:   z.number(),
    description: z.string(),
  })),
});

const SYSTEM_PROMPT = `You are a senior crypto analyst writing structured research briefs for a professional trading terminal.

STRICT RULES — violating any of these invalidates the brief:
1. Cite ONLY data provided in the user message. Never invent metrics, wallet addresses, or external events.
2. NO price predictions, price targets, or probability estimates of future returns. If asked to guess a price, refuse.
3. Label every speculative statement with "Speculation:" prefix.
4. Write in plain, precise English. No hype, no FUD. Terminal users are professional traders.
5. Scenarios describe OBSERVABLE CONDITIONS only (e.g., "if volume sustains above X for 48h") — never probabilities or targets.
6. Keep each section concise: 2-4 sentences maximum unless the data warrants more detail.

OUTPUT FORMAT — respond with valid JSON only, no markdown wrapper:
{
  "executiveSummary": "string",
  "whatDataShows": "string",
  "bullCase": "string",
  "bearCase": "string",
  "keyRisks": ["string", "string", "string"],
  "whatWouldChange": "string"
}`;

function buildUserPrompt(ctx: z.infer<typeof ContextSchema>): string {
  const buyRatio = ctx.buys24h + ctx.sells24h > 0
    ? ((ctx.buys24h / (ctx.buys24h + ctx.sells24h)) * 100).toFixed(1)
    : "unknown";

  const volLiqRatio = ctx.liquidity > 0
    ? (ctx.volume24h / ctx.liquidity).toFixed(2)
    : "N/A";

  const formatUsd = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };

  const flags = ctx.triggeredFlags.length
    ? ctx.triggeredFlags.map(f => `  - [${f.severity.toUpperCase()}] ${f.label}: ${f.description}`).join("\n")
    : "  - None triggered";

  const components = ctx.scoreComponents
    .map(c => `  - ${c.label} (weight ${(c.weight * 100).toFixed(0)}%): ${c.subScore}/100 — ${c.description}`)
    .join("\n");

  return `TOKEN RESEARCH DATA — ${ctx.symbol} (${ctx.name})
Chain: ${ctx.chain} | Address: ${ctx.address}

=== MARKET DATA ===
Price:         $${ctx.price}
24h Change:    ${ctx.priceChange24h >= 0 ? "+" : ""}${ctx.priceChange24h.toFixed(2)}%
1h Change:     ${ctx.priceChange1h >= 0 ? "+" : ""}${ctx.priceChange1h.toFixed(2)}%
24h Volume:    ${formatUsd(ctx.volume24h)}
Liquidity:     ${formatUsd(ctx.liquidity)}
Market Cap:    ${formatUsd(ctx.marketCap)}
Age:           ${ctx.age.toFixed(1)} days
Buys 24h:      ${ctx.buys24h.toLocaleString()}
Sells 24h:     ${ctx.sells24h.toLocaleString()}
Buy ratio:     ${buyRatio}% of txns are buys
Vol/Liq ratio: ${volLiqRatio}×
${ctx.holderCount ? `Holders:       ${ctx.holderCount.toLocaleString()}` : ""}
${ctx.topHolderConcentration ? `Top-10 conc.:  ${ctx.topHolderConcentration.toFixed(1)}% of supply` : ""}

=== CONVICTION SCORE ===
Composite:  ${ctx.convictionScore}/100
Risk Tier:  ${ctx.riskTier}

Score Components:
${components}

=== ACTIVE RISK FLAGS ===
${flags}

Write a structured research brief using ONLY the data above. Follow the JSON format specified in your system prompt exactly.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const ctx  = ContextSchema.parse(body);
    const cacheKey = `ai:brief:${ctx.address}:${Math.floor(Date.now() / 3_600_000)}`; // 1h bucket

    const result = await cache.getOrFetch(cacheKey, TTL.MARKET, async () => {
      const message = await client.messages.create({
        model:      "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [
          { role: "user", content: buildUserPrompt(ctx) },
        ],
        system: SYSTEM_PROMPT,
      });

      const text = message.content[0]?.type === "text" ? message.content[0].text : "";

      // Extract JSON from response (handle markdown code fences if present)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in Claude response");

      return JSON.parse(jsonMatch[0]) as {
        executiveSummary: string;
        whatDataShows:    string;
        bullCase:         string;
        bearCase:         string;
        keyRisks:         string[];
        whatWouldChange:  string;
      };
    });

    return NextResponse.json({
      ...result,
      generatedAt: new Date().toISOString(),
      model: "claude-sonnet-4-5",
    });
  } catch (err) {
    console.error("[ai/brief]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
