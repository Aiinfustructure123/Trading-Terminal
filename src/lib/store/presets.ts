"use client";

import { ScreenerFilter } from "@/lib/datasources/types";
import { createLocalStore } from "./local-store";

export interface FilterPreset {
  id: string;
  name: string;
  builtIn?: boolean;
  filter: ScreenerFilter;
}

export const EARLY_DISCOVERY_PRESET: FilterPreset = {
  id: "early-discovery",
  name: "Early Discovery",
  builtIn: true,
  filter: {
    maxAgeDays: 7,
    maxMarketCapUsd: 5_000_000,
    maxRiskTier: "Moderate",
  },
};

const store = createLocalStore<FilterPreset[]>("screener-presets", []);

export function usePresets(): FilterPreset[] {
  const custom = store.useValue();
  return [EARLY_DISCOVERY_PRESET, ...custom];
}

export function savePreset(name: string, filter: ScreenerFilter): FilterPreset {
  const preset: FilterPreset = {
    id: `preset-${Date.now().toString(36)}`,
    name,
    filter,
  };
  store.set((prev) => [...prev, preset]);
  return preset;
}

export function deletePreset(id: string): void {
  store.set((prev) => prev.filter((p) => p.id !== id));
}
