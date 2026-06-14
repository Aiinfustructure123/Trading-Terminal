import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexSearchResponseSchema } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ pairs: [] });

  const cacheKey = `dex:search:${q}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKENS_LIST, async () => {
      const res = await fetch(`${BASE}/latest/dex/search?q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener search ${res.status}`);
      const raw = await res.json();
      return DexSearchResponseSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dexscreener/search]", err);
    return NextResponse.json({ pairs: [], error: String(err) }, { status: 502 });
  }
}
