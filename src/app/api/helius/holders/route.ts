import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
const BASE = "https://mainnet.helius-rpc.com";

export async function GET(req: NextRequest) {
  const mint   = req.nextUrl.searchParams.get("mint") ?? "";
  const apiKey = process.env.HELIUS_API_KEY;

  if (!mint) return NextResponse.json({ error: "mint required" }, { status: 400 });
  if (!apiKey) {
    return NextResponse.json(
      { error: "HELIUS_API_KEY not configured", degraded: true },
      { status: 503 }
    );
  }

  const cacheKey = `helius:holders:${mint}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.TOKEN_DETAIL, async () => {
      // Helius getTokenLargestAccounts via RPC
      const res = await fetch(`${BASE}/?api-key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenLargestAccounts",
          params: [mint, { commitment: "confirmed" }],
        }),
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`Helius RPC ${res.status}`);
      const json = await res.json();

      if (json.error) throw new Error(json.error.message);

      const accounts = (json.result?.value ?? []) as Array<{
        address: string;
        amount: string;
        decimals: number;
      }>;

      return accounts.map(a => ({
        address: a.address,
        amount:  parseFloat(a.amount) / Math.pow(10, a.decimals),
      }));
    });

    return NextResponse.json({ holders: data });
  } catch (err) {
    console.error("[helius/holders]", err);
    return NextResponse.json({ error: String(err), degraded: true }, { status: 502 });
  }
}
