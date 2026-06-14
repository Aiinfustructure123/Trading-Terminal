import { NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { z } from "zod";

const BASE = "https://api.dexscreener.com";

const TokenProfileSchema = z.object({
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

const TokenBoostSchema = z.object({
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
});

export type TokenProfile = z.infer<typeof TokenProfileSchema>;
export type TokenBoost   = z.infer<typeof TokenBoostSchema>;

export async function GET() {
  const cacheKey = "dex:new-launches-v2";

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.NEW_LAUNCHES, async () => {
      // Fetch both feeds in parallel
      const [profilesRes, boostsRes] = await Promise.allSettled([
        fetch(`${BASE}/token-profiles/latest/v1`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 0 },
        }),
        fetch(`${BASE}/token-boosts/latest/v1`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 0 },
        }),
      ]);

      const profiles: TokenProfile[] = [];
      const boosts: TokenBoost[] = [];

      if (profilesRes.status === "fulfilled" && profilesRes.value.ok) {
        const raw = await profilesRes.value.json();
        const parsed = z.array(TokenProfileSchema).safeParse(raw);
        if (parsed.success) profiles.push(...parsed.data);
      }

      if (boostsRes.status === "fulfilled" && boostsRes.value.ok) {
        const raw = await boostsRes.value.json();
        const parsed = z.array(TokenBoostSchema).safeParse(raw);
        if (parsed.success) boosts.push(...parsed.data);
      }

      // Merge: profiles first (more organic), then boosts
      // Deduplicate by tokenAddress
      const seen = new Set<string>();
      const merged: (TokenProfile | TokenBoost)[] = [];

      for (const item of [...profiles, ...boosts]) {
        const key = `${item.chainId}:${item.tokenAddress}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }

      return merged;
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dexscreener/new-launches]", err);
    return NextResponse.json([], { status: 502 });
  }
}
