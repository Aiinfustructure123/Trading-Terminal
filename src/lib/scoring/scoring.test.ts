import { describe, it, expect } from "vitest";
import { computeConviction, WEIGHTS } from "./momentum";
import { computeRisk } from "./risk";

const baseConviction = {
  volumeAccel: 2.1,
  buySellRatio: 1.6,
  priceChange24h: 0.34,
  liquidityUsd: 480_000,
  liqToMcap: 0.12,
  holders: 4200,
  holderGrowth: 0.22,
  volume24h: 1_900_000,
  riskInverse: 72,
  smartMoney: 64,
};

const safeRisk = {
  mintAuthorityActive: false,
  freezeAuthorityActive: false,
  lpLockedPct: 100,
  top10Pct: 18,
  buyTaxPct: 0,
  sellTaxPct: 0,
  isHoneypot: false,
  liquidityUsd: 500_000,
  ageHours: 720,
  creatorHoldingPct: 1,
};

describe("computeConviction", () => {
  it("is deterministic", () => {
    expect(computeConviction(baseConviction)).toEqual(computeConviction(baseConviction));
  });

  it("returns a composite within 0–100", () => {
    const r = computeConviction(baseConviction);
    expect(r.composite).toBeGreaterThanOrEqual(0);
    expect(r.composite).toBeLessThanOrEqual(100);
  });

  it("emits six explainable components with rationales", () => {
    const r = computeConviction(baseConviction);
    expect(r.components).toHaveLength(6);
    for (const c of r.components) {
      expect(c.rationale.length).toBeGreaterThan(0);
      expect(c.subScore).toBeGreaterThanOrEqual(0);
      expect(c.subScore).toBeLessThanOrEqual(100);
    }
  });

  it("weights sum to 1.0", () => {
    const total = Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it("composite equals the weighted average of component sub-scores", () => {
    const r = computeConviction(baseConviction);
    const expected = Math.round(r.components.reduce((s, c) => s + c.subScore * c.weight, 0));
    expect(r.composite).toBe(expected);
  });

  it("rewards stronger momentum", () => {
    const weak = computeConviction({ ...baseConviction, volumeAccel: 0.5, buySellRatio: 0.6, priceChange24h: -0.1 });
    const strong = computeConviction({ ...baseConviction, volumeAccel: 3.0, buySellRatio: 1.9, priceChange24h: 0.5 });
    expect(strong.composite).toBeGreaterThan(weak.composite);
  });
});

describe("computeRisk", () => {
  it("rates a clean token Low", () => {
    expect(computeRisk(safeRisk).tier).toBe("Low");
  });

  it("forces at least High when mint authority is active", () => {
    const r = computeRisk({ ...safeRisk, mintAuthorityActive: true });
    expect(["High", "Avoid"]).toContain(r.tier);
  });

  it("forces Avoid on a honeypot", () => {
    expect(computeRisk({ ...safeRisk, isHoneypot: true }).tier).toBe("Avoid");
  });

  it("surfaces triggered rules with explanations", () => {
    const r = computeRisk({ ...safeRisk, top10Pct: 70 });
    const flag = r.flags.find((f) => f.id === "concentration");
    expect(flag?.triggered).toBe(true);
    expect(flag?.explanation).toContain("70%");
  });

  it("is deterministic", () => {
    expect(computeRisk(safeRisk)).toEqual(computeRisk(safeRisk));
  });
});
