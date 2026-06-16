/**
 * GET /api/dexscreener/tokens-v1?chain={chainId}&addresses={comma-separated}
 *
 * Source: GET /tokens/v1/{chainId}/{tokenAddresses}
 * Returns enriched token data including profile info (icon, description, socials)
 * alongside all associated pairs. Superset of the legacy /latest/dex/tokens endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexTokensV1ResponseSchema } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

export async function GET(req: NextRequest) {
  const chain     = req.nextUrl.searchParams.get("chain")     ?? "solana";
  const addresses = req.nextUrl.searchParams.get("addresses") ?? "";

  if (!addresses) return NextResponse.json([]);

  // DexScreener accepts up to 30 addresses comma-separated
  const addrList = addresses.split(",").slice(0, 30).join(",");
  const cacheKey = `dex:tokens-v1:${chain}:${addrList}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKEN_DETAIL, async () => {
      const res = await fetch(`${BASE}/tokens/v1/${chain}/${encodeURIComponent(addrList)}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener tokens-v1 ${res.status}`);
      const raw = await res.json();
      // Handle both array and wrapped response
      return DexTokensV1ResponseSchema.parse(Array.isArray(raw) ? raw : [raw]);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dexscreener/tokens-v1]", err);
    return NextResponse.json([], { status: 502 });
  }
}
