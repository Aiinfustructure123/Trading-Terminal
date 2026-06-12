import { describe, expect, it } from "vitest";
import { formatAge, formatCompact, formatPct, shortenAddress } from "./format";
import { SCORE_WEIGHTS } from "@/lib/datasources/sample/generator";

describe("formatCompact", () => {
  it("formats magnitudes with suffixes", () => {
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(2_300_000)).toBe("2.30M");
    expect(formatCompact(4_100_000_000)).toBe("4.10B");
  });
  it("handles negatives", () => {
    expect(formatCompact(-2_300_000)).toBe("-2.30M");
  });
});

describe("formatPct", () => {
  it("adds an explicit + for positive values", () => {
    expect(formatPct(12.3)).toBe("+12.30%");
    expect(formatPct(-4)).toBe("-4.00%");
  });
});

describe("shortenAddress", () => {
  it("truncates the middle", () => {
    expect(shortenAddress("0x1234567890abcdef", 4)).toBe("0x1234…cdef");
  });
});

describe("formatAge", () => {
  it("rolls minutes up to larger units", () => {
    const now = 1_000_000_000_000;
    expect(formatAge(now - 30 * 60_000, now)).toBe("30m");
    expect(formatAge(now - 5 * 3_600_000, now)).toBe("5h");
    expect(formatAge(now - 3 * 86_400_000, now)).toBe("3d");
  });
});

describe("conviction score weights", () => {
  it("sum to exactly 1 so the composite stays on a 0–100 scale", () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 6);
  });
});
