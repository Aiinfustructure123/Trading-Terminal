"use client";

import { useQuery } from "@tanstack/react-query";
import { dataSources } from "@/lib/datasources";

export const marketKeys = {
  pulse: ["market", "pulse"] as const,
  narratives: ["market", "narratives"] as const,
  opportunities: ["market", "opportunities"] as const,
  launches: ["market", "launches"] as const,
  movers: ["market", "movers"] as const,
  alerts: ["market", "alerts"] as const,
};

export function useMarketPulse() {
  return useQuery({
    queryKey: marketKeys.pulse,
    queryFn: () => dataSources.market.getMarketPulse(),
    refetchInterval: 30_000,
  });
}

export function useTrendingNarratives() {
  return useQuery({
    queryKey: marketKeys.narratives,
    queryFn: () => dataSources.market.getTrendingNarratives(),
    refetchInterval: 45_000,
  });
}

export function useConvictionOpportunities() {
  return useQuery({
    queryKey: marketKeys.opportunities,
    queryFn: () => dataSources.market.getConvictionOpportunities(),
    refetchInterval: 30_000,
  });
}

export function useNewLaunches() {
  return useQuery({
    queryKey: marketKeys.launches,
    queryFn: () => dataSources.market.getNewLaunches(),
    refetchInterval: 12_000,
  });
}

export function useMoversHeatmap() {
  return useQuery({
    queryKey: marketKeys.movers,
    queryFn: () => dataSources.market.getMoversHeatmap(),
    refetchInterval: 35_000,
  });
}

export function useAlertsTicker() {
  return useQuery({
    queryKey: marketKeys.alerts,
    queryFn: () => dataSources.market.getAlertsTicker(),
    refetchInterval: 8_000,
  });
}
