/**
 * GET /api/dexscreener/token-pairs?chain={chainId}&address={tokenAddress}
 *
 * Source: GET /token-pairs/v1/{chainId}/{tokenAddress}
 * Returns ALL liquidity pools for a token across all DEXes on a chain.
 * More comprehensive than /latest/dex/tokens — use this for token detail pages.
 */

import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexTokenPairsV1Schema } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

export async function GET(req: NextRequest) {
  const chain   = req.nextUrl.searchParams.get("chain")   ?? "solana";
  const address = req.nextUrl.searchParams.get("address") ?? "";

  if (!address) return NextResponse.json([], { status: 400 });

  const cacheKey = `dex:token-pairs:${chain}:${address}`;

  try {
    const pairs = await cache.getOrFetch(cacheKey, TTL.TOKEN_DETAIL, async () => {
      const res = await fetch(`${BASE}/token-pairs/v1/${chain}/${address}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener token-pairs ${res.status}`);
      const raw = await res.json();
      return DexTokenPairsV1Schema.parse(Array.isArray(raw) ? raw : raw.pairs ?? []);
    });

    return NextResponse.json(pairs);
  } catch (err) {
    console.error("[dexscreener/token-pairs]", err);
    return NextResponse.json([], { status: 502 });
  }
}
