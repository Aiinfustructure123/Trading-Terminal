import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { GeckoOHLCVResponseSchema } from "@/lib/datasources/schemas/geckoterminal";

const BASE = "https://api.geckoterminal.com/api/v2";

// Map our CandleInterval to GeckoTerminal timeframe params
const INTERVAL_MAP: Record<string, { timeframe: string; aggregate: string }> = {
  "15m": { timeframe: "minute", aggregate: "15" },
  "1h":  { timeframe: "hour",   aggregate: "1"  },
  "4h":  { timeframe: "hour",   aggregate: "4"  },
  "1d":  { timeframe: "day",    aggregate: "1"  },
};

export async function GET(req: NextRequest) {
  const network  = req.nextUrl.searchParams.get("network")  ?? "solana";
  const pool     = req.nextUrl.searchParams.get("pool")     ?? "";
  const interval = req.nextUrl.searchParams.get("interval") ?? "1h";

  if (!pool) return NextResponse.json({ error: "pool required" }, { status: 400 });

  const mapping = INTERVAL_MAP[interval] ?? INTERVAL_MAP["1h"];
  const cacheKey = `gecko:ohlcv:${network}:${pool}:${interval}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.OHLCV, async () => {
      const url = `${BASE}/networks/${network}/pools/${pool}/ohlcv/${mapping.timeframe}?aggregate=${mapping.aggregate}&limit=200&currency=usd`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`GeckoTerminal OHLCV ${res.status}`);
      const raw = await res.json();
      return GeckoOHLCVResponseSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[geckoterminal/ohlcv]", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
