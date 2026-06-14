import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { GoPlusResponseSchema } from "@/lib/datasources/schemas/goplus";

const BASE = "https://api.gopluslabs.io";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") ?? "";
  const chain   = req.nextUrl.searchParams.get("chain")   ?? "solana";

  if (!address) return NextResponse.json({ code: 0, message: "address required", result: {} });

  const cacheKey = `goplus:${chain}:${address}`;

  // GoPlus chain IDs
  const chainId: Record<string, string> = {
    solana:   "solana",
    ethereum: "1",
    base:     "8453",
  };

  const id = chainId[chain] ?? "solana";
  const endpoint = chain === "solana"
    ? `${BASE}/api/v1/solana/token_security/${address}`
    : `${BASE}/api/v1/token_security/${id}?contract_addresses=${address}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.SECURITY, async () => {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.GOPLUS_API_KEY) {
        headers["Authorization"] = `Bearer ${process.env.GOPLUS_API_KEY}`;
      }
      const res = await fetch(endpoint, { headers, next: { revalidate: 0 } });
      if (!res.ok) throw new Error(`GoPlus ${res.status}`);
      const raw = await res.json();

      // Normalise Solana vs EVM response shape
      if (chain === "solana" && raw.result && !raw.result[address]) {
        const normalized = { ...raw, result: { [address]: raw.result } };
        return GoPlusResponseSchema.parse(normalized);
      }
      return GoPlusResponseSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[goplus]", err);
    return NextResponse.json({ code: 0, message: String(err), result: {} }, { status: 502 });
  }
}
