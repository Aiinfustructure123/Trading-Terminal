import { NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { z } from "zod";

const BASE = "https://api.coingecko.com/api/v3";

const GlobalResponseSchema = z.object({
  data: z.object({
    total_market_cap:   z.record(z.string(), z.number()),
    total_volume:       z.record(z.string(), z.number()),
    market_cap_percentage: z.record(z.string(), z.number()),
    market_cap_change_percentage_24h_usd: z.number(),
  }),
});

const FearGreedSchema = z.object({
  data: z.array(z.object({
    value:               z.string(),
    value_classification: z.string(),
  })),
});

export async function GET() {
  try {
    const globalData = await cache.getOrFetch("cg:global", TTL.MARKET, async () => {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.COINGECKO_API_KEY) {
        headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
      }
      const res = await fetch(`${BASE}/global`, { headers, next: { revalidate: 0 } });
      if (!res.ok) throw new Error(`CoinGecko global ${res.status}`);
      const raw = await res.json();
      return GlobalResponseSchema.parse(raw);
    });

    const fearGreed = await cache.getOrFetch("fg:index", TTL.MARKET, async () => {
      const res = await fetch("https://api.alternative.me/fng/?limit=1", {
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`Fear & Greed ${res.status}`);
      const raw = await res.json();
      return FearGreedSchema.parse(raw);
    });

    const mcapUsd    = globalData.data.total_market_cap?.usd ?? 0;
    const volumeUsd  = globalData.data.total_volume?.usd ?? 0;
    const btcDom     = globalData.data.market_cap_percentage?.btc ?? 0;
    const fgValue    = parseInt(fearGreed.data[0]?.value ?? "50");
    const fgLabel    = fearGreed.data[0]?.value_classification ?? "Neutral";

    return NextResponse.json({
      globalMcap:     mcapUsd,
      globalVolume:   volumeUsd,
      btcDominance:   btcDom,
      fearGreedIndex: fgValue,
      fearGreedLabel: fgLabel,
    });
  } catch (err) {
    console.error("[coingecko/global]", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
