import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/lib/cache/memory";
import { RugCheckReportSchema } from "@/lib/datasources/schemas/rugcheck";

const BASE = "https://api.rugcheck.xyz/v1";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address") ?? "";
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const cacheKey = `rugcheck:${address}`;

  try {
    const data = await cache.getOrFetch(cacheKey, TTL.SECURITY, async () => {
      const res = await fetch(`${BASE}/tokens/${address}/report`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) throw new Error(`RugCheck ${res.status}`);
      const raw = await res.json();
      return RugCheckReportSchema.parse(raw);
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[rugcheck]", err);
    return NextResponse.json({ mint: address, error: String(err) }, { status: 502 });
  }
}
