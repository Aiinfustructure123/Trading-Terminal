import { NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { z } from "zod";

const BASE = "https://api.dexscreener.com";

const LatestBoostsSchema = z.array(z.object({
  url:          z.string().optional(),
  chainId:      z.string(),
  tokenAddress: z.string(),
  icon:         z.string().optional(),
  description:  z.string().optional(),
  amount:       z.number().optional(),
  totalAmount:  z.number().optional(),
  links: z.array(z.object({
    label: z.string().optional(),
    type:  z.string().optional(),
    url:   z.string(),
  })).optional(),
}));

export async function GET() {
  const cacheKey = "dex:new-launches";

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.NEW_LAUNCHES, async () => {
      const res = await fetch(`${BASE}/token-boosts/latest/v1`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener boosts ${res.status}`);
      const raw = await res.json();
      return LatestBoostsSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dexscreener/new-launches]", err);
    return NextResponse.json([], { status: 502 });
  }
}
