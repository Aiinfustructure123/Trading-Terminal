"use client";

import { useQuery } from "@tanstack/react-query";
import { dataSources } from "@/lib/datasources";
import type { ScreenerQuery, Timeframe } from "@/lib/datasources";

/**
 * TanStack Query hooks over the typed data sources. Components only touch these
 * hooks — when a source flips from sample to live, nothing here or downstream
 * changes. `live`-feeling refetch intervals simulate streaming updates.
 */

export function useMarketPulse() {
  return useQuery({
    queryKey: ["market-pulse"],
    queryFn: () => dataSources.market.getMarketPulse(),
    refetchInterval: 8000,
  });
}

export function useNarratives() {
  return useQuery({
    queryKey: ["narratives"],
    queryFn: () => dataSources.market.getNarratives(),
    refetchInterval: 30000,
  });
}

export function useTokens(query?: ScreenerQuery) {
  return useQuery({
    queryKey: ["tokens", query ?? {}],
    queryFn: () => dataSources.market.getTokens(query),
  });
}

export function useToken(id: string) {
  return useQuery({
    queryKey: ["token", id],
    queryFn: () => dataSources.market.getToken(id),
    enabled: Boolean(id),
  });
}

export function useNewLaunches(limit = 18) {
  return useQuery({
    queryKey: ["new-launches", limit],
    queryFn: () => dataSources.market.getNewLaunches(limit),
    refetchInterval: 12000,
  });
}

export function useMovers(limit = 40) {
  return useQuery({
    queryKey: ["movers", limit],
    queryFn: () => dataSources.market.getMovers(limit),
    refetchInterval: 15000,
  });
}

export function useCandles(id: string, timeframe: Timeframe) {
  return useQuery({
    queryKey: ["candles", id, timeframe],
    queryFn: () => dataSources.market.getCandles(id, timeframe),
    enabled: Boolean(id),
  });
}

export function useAlertsTicker() {
  return useQuery({
    queryKey: ["alerts-ticker"],
    queryFn: () => dataSources.market.getAlertsTicker(),
    refetchInterval: 20000,
  });
}

export function useHolders(id: string) {
  return useQuery({
    queryKey: ["holders", id],
    queryFn: () => dataSources.onchain.getHolders(id),
    enabled: Boolean(id),
  });
}

export function useForensics(id: string) {
  return useQuery({
    queryKey: ["forensics", id],
    queryFn: () => dataSources.security.getForensics(id),
    enabled: Boolean(id),
  });
}

export function useResearchBrief(id: string) {
  return useQuery({
    queryKey: ["brief", id],
    queryFn: () => dataSources.ai.getResearchBrief(id),
    enabled: Boolean(id),
    staleTime: 60 * 60 * 1000,
  });
}

export function useScenarios(id: string) {
  return useQuery({
    queryKey: ["scenarios", id],
    queryFn: () => dataSources.ai.getScenarios(id),
    enabled: Boolean(id),
  });
}

export function useSmartWallets() {
  return useQuery({
    queryKey: ["smart-wallets"],
    queryFn: () => dataSources.smartMoney.getWallets(),
  });
}
