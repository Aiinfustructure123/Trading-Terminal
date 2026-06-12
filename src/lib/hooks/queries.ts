"use client";

import { useQuery } from "@tanstack/react-query";
import {
  aiSource,
  marketSource,
  onChainSource,
  securitySource,
  smartMoneySource,
  trendsSource,
} from "@/lib/datasources";
import {
  CandleInterval,
  ScreenerFilter,
  ScreenerSort,
} from "@/lib/datasources/types";

/** Polling cadences (ms) — same values the live sources will use. */
const FAST = 4_000;
const MEDIUM = 12_000;
const SLOW = 60_000;

export function useGlobalMetrics() {
  return useQuery({
    queryKey: ["global-metrics"],
    queryFn: () => marketSource.getGlobalMetrics(),
    refetchInterval: FAST,
  });
}

export function useScreenerTokens(filter?: ScreenerFilter, sort?: ScreenerSort) {
  return useQuery({
    queryKey: ["screener", filter ?? null, sort ?? null],
    queryFn: () => marketSource.listTokens({ filter, sort }),
    refetchInterval: MEDIUM,
    placeholderData: (prev) => prev,
  });
}

export function useTopOpportunities(limit = 6) {
  return useQuery({
    queryKey: ["opportunities", limit],
    queryFn: () =>
      marketSource.listTokens({
        filter: { maxRiskTier: "Moderate", minLiquidityUsd: 25_000 },
        sort: { key: "composite", dir: "desc" },
        limit,
      }),
    refetchInterval: MEDIUM,
    placeholderData: (prev) => prev,
  });
}

export function useToken(id: string | null) {
  return useQuery({
    queryKey: ["token", id],
    queryFn: () => marketSource.getToken(id as string),
    enabled: id !== null,
    refetchInterval: FAST,
    placeholderData: (prev) => prev,
  });
}

export function useCandles(tokenId: string | null, interval: CandleInterval) {
  return useQuery({
    queryKey: ["candles", tokenId, interval],
    queryFn: () => marketSource.getCandles(tokenId as string, interval),
    enabled: tokenId !== null,
    refetchInterval: MEDIUM,
    placeholderData: (prev) => prev,
  });
}

export function useNewLaunches(limit = 14) {
  return useQuery({
    queryKey: ["launches", limit],
    queryFn: () => marketSource.getNewLaunches(limit),
    refetchInterval: FAST,
    placeholderData: (prev) => prev,
  });
}

export function useTickerAlerts() {
  return useQuery({
    queryKey: ["ticker-alerts"],
    queryFn: () => marketSource.getTickerAlerts(40),
    refetchInterval: MEDIUM,
    placeholderData: (prev) => prev,
  });
}

export function useNarratives() {
  return useQuery({
    queryKey: ["narratives"],
    queryFn: () => trendsSource.listNarratives(),
    refetchInterval: SLOW,
    placeholderData: (prev) => prev,
  });
}

export function useHolderStats(tokenId: string | null) {
  return useQuery({
    queryKey: ["holders", tokenId],
    queryFn: () => onChainSource.getHolderStats(tokenId as string),
    enabled: tokenId !== null,
    refetchInterval: SLOW,
  });
}

export function useRiskReport(tokenId: string | null) {
  return useQuery({
    queryKey: ["risk", tokenId],
    queryFn: () => securitySource.getRiskReport(tokenId as string),
    enabled: tokenId !== null,
    refetchInterval: SLOW,
  });
}

export function useScenarios(tokenId: string | null) {
  return useQuery({
    queryKey: ["scenarios", tokenId],
    queryFn: () => aiSource.getScenarios(tokenId as string),
    enabled: tokenId !== null,
    staleTime: 5 * 60_000,
  });
}

export function useResearchBrief(tokenId: string | null) {
  return useQuery({
    queryKey: ["brief", tokenId],
    queryFn: () => aiSource.getResearchBrief(tokenId as string),
    enabled: tokenId !== null,
    staleTime: 60 * 60_000,
  });
}

export function useSmartMoneyWallets() {
  return useQuery({
    queryKey: ["smart-money", "wallets"],
    queryFn: () => smartMoneySource.listWallets(),
    refetchInterval: SLOW,
  });
}

export function useSmartMoneyActivity() {
  return useQuery({
    queryKey: ["smart-money", "activity"],
    queryFn: () => smartMoneySource.getRecentActivity(40),
    refetchInterval: MEDIUM,
    placeholderData: (prev) => prev,
  });
}
