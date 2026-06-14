import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { GeckoTrendingPoolsResponseSchema } from "@/lib/datasources/schemas/geckoterminal";

const BASE = "https://api.geckoterminal.com/api/v2";

export async function GET(req: NextRequest) {
  const network = req.nextUrl.searchParams.get("network") ?? "solana";
  const cacheKey = `gecko:trending:${network}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKENS_LIST, async () => {
      const res = await fetch(
        `${BASE}/networks/${network}/trending_pools?include=base_token,quote_token,dex&page=1`,
        { headers: { Accept: "application/json" }, next: { revalidate: 0 } }
      );
      if (!res.ok) throw new Error(`GeckoTerminal trending ${res.status}`);
      const raw = await res.json();
      return GeckoTrendingPoolsResponseSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[geckoterminal/trending]", err);
    return NextResponse.json({ data: [], included: [] }, { status: 502 });
  }
}
