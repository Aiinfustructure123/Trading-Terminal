import type { ScreenerQuery } from "@/lib/datasources";

export interface ScreenerPreset {
  id: string;
  name: string;
  builtIn?: boolean;
  query: ScreenerQuery;
}

export const DEFAULT_QUERY: ScreenerQuery = {
  search: "",
  chain: "all",
  mcapMax: null,
  maxRiskTier: "Avoid",
  sortBy: "conviction",
  sortDir: "desc",
};

export const BUILT_IN_PRESETS: ScreenerPreset[] = [
  {
    id: "early-discovery",
    name: "Early Discovery",
    builtIn: true,
    query: {
      ...DEFAULT_QUERY,
      maxAgeDays: 7,
      mcapMax: 5_000_000,
      maxRiskTier: "Moderate",
      sortBy: "conviction",
      sortDir: "desc",
    },
  },
  {
    id: "momentum-movers",
    name: "Momentum Movers",
    builtIn: true,
    query: { ...DEFAULT_QUERY, minVolume: 250_000, sortBy: "change24h", sortDir: "desc" },
  },
  {
    id: "blue-chips",
    name: "Established",
    builtIn: true,
    query: { ...DEFAULT_QUERY, mcapMax: null, minLiquidity: 250_000, maxRiskTier: "Low" },
  },
];
