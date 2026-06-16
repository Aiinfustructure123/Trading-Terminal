/**
 * GET /api/dexscreener/boosts?type=latest|top
 *
 * Sources:
 *   GET /token-boosts/latest/v1  — most recently boosted tokens
 *   GET /token-boosts/top/v1    — all-time top boosted tokens by total amount
 *
 * Both feeds are merged and returned together when type is omitted.
 */

import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { DexBoostsResponseSchema, type DexBoost } from "@/lib/datasources/schemas/dexscreener";

const BASE = "https://api.dexscreener.com";

async function fetchBoosts(endpoint: string): Promise<DexBoost[]> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`DexScreener ${endpoint} ${res.status}`);
  const raw = await res.json();
  return DexBoostsResponseSchema.parse(Array.isArray(raw) ? raw : []);
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type"); // "latest" | "top" | null (both)

  try {
    if (type === "latest") {
      const data = await cache.getOrFetch("dex:boosts:latest", TTL.NEW_LAUNCHES, () =>
        fetchBoosts("token-boosts/latest/v1")
      );
      return NextResponse.json(data);
    }

    if (type === "top") {
      const data = await cache.getOrFetch("dex:boosts:top", TTL.TOKENS_LIST, () =>
        fetchBoosts("token-boosts/top/v1")
      );
      return NextResponse.json(data);
    }

    // Default: fetch both and merge (dedup by tokenAddress, latest first)
    const [latest, top] = await Promise.all([
      cache.getOrFetch("dex:boosts:latest", TTL.NEW_LAUNCHES, () =>
        fetchBoosts("token-boosts/latest/v1")
      ),
      cache.getOrFetch("dex:boosts:top", TTL.TOKENS_LIST, () =>
        fetchBoosts("token-boosts/top/v1")
      ),
    ]);

    const seen = new Set<string>();
    const merged: DexBoost[] = [];
    for (const b of [...latest, ...top]) {
      const key = `${b.chainId}:${b.tokenAddress}`;
      if (!seen.has(key)) { seen.add(key); merged.push(b); }
    }

    return NextResponse.json({ latest, top, merged });
  } catch (err) {
    console.error("[dexscreener/boosts]", err);
    return NextResponse.json({ latest: [], top: [], merged: [], error: String(err) }, { status: 502 });
  }
}
