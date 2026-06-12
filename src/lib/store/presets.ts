"use client";

import { useCallback, useEffect, useState } from "react";
import type { Chain, RiskTier } from "@/lib/datasources/types";

export interface FilterState {
  chain: Chain | "all";
  maxMarketCap?: number;
  minLiquidity: number;
  maxAgeHours?: number;
  minVolume24h: number;
  maxRiskTier: RiskTier;
  search: string;
}

export const DEFAULT_FILTERS: FilterState = {
  chain: "all",
  maxMarketCap: undefined,
  minLiquidity: 0,
  maxAgeHours: undefined,
  minVolume24h: 0,
  maxRiskTier: "Avoid",
  search: "",
};

export interface Preset {
  id: string;
  name: string;
  builtIn?: boolean;
  filters: FilterState;
}

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: "early-discovery",
    name: "Early Discovery",
    builtIn: true,
    filters: { ...DEFAULT_FILTERS, maxAgeHours: 24 * 7, maxMarketCap: 5_000_000, maxRiskTier: "Moderate" },
  },
  {
    id: "blue-momentum",
    name: "Liquid Momentum",
    builtIn: true,
    filters: { ...DEFAULT_FILTERS, minLiquidity: 250_000, minVolume24h: 500_000, maxRiskTier: "Moderate" },
  },
  {
    id: "solana-fresh",
    name: "Solana Fresh",
    builtIn: true,
    filters: { ...DEFAULT_FILTERS, chain: "solana", maxAgeHours: 72 },
  },
];

const KEY = "alpha.presets";

export function usePresets() {
  const [custom, setCustom] = useState<Preset[]>([]);

  useEffect(() => {
    try {
      setCustom(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      setCustom([]);
    }
  }, []);

  const save = useCallback((name: string, filters: FilterState) => {
    const preset: Preset = { id: `c-${Date.now()}`, name, filters };
    setCustom((prev) => {
      const next = [...prev, preset];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setCustom((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { presets: [...BUILT_IN_PRESETS, ...custom], save, remove };
}
