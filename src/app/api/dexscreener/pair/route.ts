/**
 * GET /api/dexscreener/pair?chain={chainId}&pairId={pairAddress}
 *
 * Source: GET /latest/dex/pairs/{chainId}/{pairId}
 * Returns full data for a specific liquidity pair by its pool address.
 */

import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexPairResponseSchema } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

export async function GET(req: NextRequest) {
  const chain  = req.nextUrl.searchParams.get("chain")  ?? "solana";
  const pairId = req.nextUrl.searchParams.get("pairId") ?? "";

  if (!pairId) return NextResponse.json({ pair: null }, { status: 400 });

  const cacheKey = `dex:pair:${chain}:${pairId}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKEN_DETAIL, async () => {
      const res = await fetch(`${BASE}/latest/dex/pairs/${chain}/${pairId}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener pair ${res.status}`);
      const raw = await res.json();
      return DexPairResponseSchema.parse(raw);
    });

    // Normalise: some responses use pairs[], some use pair
    const pair = data.pair ?? data.pairs?.[0] ?? null;
    return NextResponse.json({ pair });
  } catch (err) {
    console.error("[dexscreener/pair]", err);
    return NextResponse.json({ pair: null, error: String(err) }, { status: 502 });
  }
}
