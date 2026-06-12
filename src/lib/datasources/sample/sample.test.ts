import { describe, it, expect } from "vitest";
import { getUniverse } from "./rng";
import { sampleMarketSource } from "./market";
import { sampleSecuritySource } from "./security";

describe("sample universe", () => {
  it("generates a large, stable token universe", () => {
    const a = getUniverse();
    const b = getUniverse();
    expect(a.length).toBeGreaterThanOrEqual(1000);
    expect(a).toBe(b); // memoized identity → identity is stable
  });

  it("has unique addresses and symbols", () => {
    const uni = getUniverse();
    expect(new Set(uni.map((u) => u.address)).size).toBe(uni.length);
    expect(new Set(uni.map((u) => u.symbol)).size).toBe(uni.length);
  });
});

describe("market source", () => {
  it("returns a detail whose identity matches the screener row", async () => {
    const rows = await sampleMarketSource.getTokens({ limit: 5 });
    expect(rows.length).toBe(5);
    const target = rows[0];
    const detail = await sampleMarketSource.getToken(target.address);
    expect(detail).not.toBeNull();
    expect(detail!.symbol).toBe(target.symbol);
    expect(detail!.name).toBe(target.name);
    expect(detail!.chain).toBe(target.chain);
    expect(detail!.links.length).toBeGreaterThan(0);
  });

  it("respects the market-cap filter", async () => {
    const rows = await sampleMarketSource.getTokens({ maxMarketCap: 1_000_000, limit: 50 });
    for (const r of rows) expect(r.marketCap).toBeLessThanOrEqual(1_000_000);
  });

  it("produces candles for a token", async () => {
    const uni = getUniverse();
    const candles = await sampleMarketSource.getCandles(uni[0].address, "1h");
    expect(candles.length).toBeGreaterThan(0);
    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(c.low);
    }
  });
});

describe("security source", () => {
  it("returns a tier and a triggered-or-passed flag list", async () => {
    const uni = getUniverse();
    const f = await sampleSecuritySource.getForensics(uni[0].address);
    expect(["Low", "Moderate", "High", "Avoid"]).toContain(f.tier);
    expect(f.flags.length).toBeGreaterThan(0);
  });
});
