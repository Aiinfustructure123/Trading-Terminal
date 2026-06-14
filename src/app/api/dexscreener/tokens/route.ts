import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexTokenResponseSchema } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

export async function GET(req: NextRequest) {
  const addresses = req.nextUrl.searchParams.get("addresses") ?? "";
  if (!addresses) return NextResponse.json({ pairs: [] });

  const cacheKey = `dex:tokens:${addresses}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKEN_DETAIL, async () => {
      const res = await fetch(`${BASE}/latest/dex/tokens/${encodeURIComponent(addresses)}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener tokens ${res.status}`);
      const raw = await res.json();
      return DexTokenResponseSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dexscreener/tokens]", err);
    return NextResponse.json({ pairs: [], error: String(err) }, { status: 502 });
  }
}
