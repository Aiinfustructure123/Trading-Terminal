/**
 * GET /api/dexscreener/profiles
 *
 * Returns the latest token profiles from DexScreener.
 * Used to enrich tokens with logos, descriptions, and social links.
 *
 * Source: https://api.dexscreener.com/token-profiles/latest/v1
 */

import { NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { z } from "zod";

const BASE = "https://api.dexscreener.com";

const ProfileSchema = z.object({
  url:          z.string().optional(),
  chainId:      z.string(),
  tokenAddress: z.string(),
  icon:         z.string().optional(),
  header:       z.string().optional(),
  description:  z.string().optional(),
  links: z.array(z.object({
    label: z.string().optional(),
    type:  z.string().optional(),
    url:   z.string(),
  })).optional(),
});

export type TokenProfile = z.infer<typeof ProfileSchema>;

export async function GET() {
  const cacheKey = "dex:profiles:latest";

  try {
    const profiles = await cache.getOrFetch(cacheKey, TTL.TOKENS_LIST, async () => {
      const res = await fetch(`${BASE}/token-profiles/latest/v1`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`DexScreener profiles ${res.status}`);
      const raw = await res.json();
      return z.array(ProfileSchema).parse(raw);
    });

    return NextResponse.json({ profiles, count: profiles.length });
  } catch (err) {
    console.error("[dexscreener/profiles]", err);
    return NextResponse.json({ profiles: [], count: 0, error: String(err) }, { status: 502 });
  }
}

